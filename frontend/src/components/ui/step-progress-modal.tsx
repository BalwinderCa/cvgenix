"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Upload,
  FileSearch,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName?: string;
  fileSize?: number;
  onCancel?: () => void;
  onRetry?: () => void;
  hasError?: boolean;
  errorMessage?: string;
  onError?: (error: string) => void;
  onComplete?: (result: any) => void;
  currentStep?: number;
  stepMessage?: string;
  sessionId?: string;
}

export function StepProgressModal({ 
  open, 
  onOpenChange, 
  fileName, 
  fileSize, 
  onCancel,
  onRetry,
  hasError: externalError,
  errorMessage: externalErrorMessage,
  onError,
  onComplete,
  currentStep = 0,
  stepMessage = '',
  sessionId
}: StepProgressModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [realCurrentStep, setRealCurrentStep] = useState(0);
  const [realStepMessage, setRealStepMessage] = useState('');

  const steps = [
    {
      id: 'upload',
      name: 'Resume Uploaded',
      icon: <Upload className="w-5 h-5" />,
      description: 'File received and validated'
    },
    {
      id: 'parsing',
      name: 'Parsing Resume',
      icon: <FileSearch className="w-5 h-5" />,
      description: 'Extracting text and structure from PDF'
    },
    {
      id: 'analysis',
      name: 'AI Analysis',
      icon: <Zap className="w-5 h-5" />,
      description: 'Running dual AI analysis with Claude and GPT-4o'
    },
    {
      id: 'complete',
      name: 'Complete',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Analysis finished, redirecting to results'
    }
  ];

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (!open) {
      // Reset state when modal closes
      setElapsedTime(0);
      setHasError(false);
      setErrorMessage('');
      setIsCompleted(false);
      setStartTime(null);
      setRealCurrentStep(0);
      setRealStepMessage('');
      return;
    }

    // Start timing when modal opens
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Connect to real backend progress if we have a session ID
    if (sessionId) {
      cleanup = startRealProgressTracking();
    }

    // Cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [open, startTime, sessionId]);

  const startRealProgressTracking = () => {
    if (!sessionId) return;

    console.log(`🔗 Connecting to progress stream for session: ${sessionId}`);
    const eventSource = new EventSource(`http://localhost:3001/api/ats-progress/stream/${sessionId}`);

    eventSource.onopen = () => {
      console.log('✅ SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 Received progress data:', data);
        
        switch (data.type) {
          case 'connected':
            console.log('✅ Connected to real progress stream');
            setRealStepMessage('Connected to analysis server...');
            break;
            
          case 'progress':
            console.log('📊 Real progress update:', data);
            setRealStepMessage(data.message || '');
            
            // Map backend steps to frontend steps
            const stepMapping: { [key: string]: number } = {
              'UPLOAD': 0,
              'PARSING_AND_REORGANIZE': 1,
              'DUAL_ANALYSIS': 2,
              'RESULT_ANALYSIS': 3
            };
            
            if (stepMapping[data.step] !== undefined) {
              setRealCurrentStep(stepMapping[data.step]);
              console.log(`📈 Progress step updated: ${data.step} -> ${stepMapping[data.step]}`);
            }
            break;
            
          case 'complete':
            console.log('✅ Real analysis complete:', data);
            setRealCurrentStep(3); // Complete step
            setIsCompleted(true);
            setRealStepMessage('Analysis completed successfully! Redirecting to results...');
            
            if (onComplete && data.result) {
              setTimeout(() => {
                onComplete(data.result);
              }, 2000);
            }
            break;
            
          case 'error':
            console.error('❌ Real analysis error:', data);
            setHasError(true);
            setErrorMessage(data.message || 'Analysis failed');
            if (onError) {
              onError(data.message || 'Analysis failed');
            }
            break;
            
          case 'heartbeat':
            // Just keep connection alive, no action needed
            break;
        }
      } catch (error) {
        console.error('Error parsing real progress data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real progress EventSource error:', error);
      // If connection fails, show error after a delay
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          setHasError(true);
          setErrorMessage('Lost connection to analysis server. Please retry.');
          if (onError) {
            onError('Lost connection to analysis server. Please retry.');
          }
        }
      }, 5000);
    };

    // Store eventSource for cleanup
    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
    };
  };

  useEffect(() => {
    if (!open || !startTime || isCompleted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [open, startTime, isCompleted]);

  // Handle external error state
  useEffect(() => {
    if (externalError && externalErrorMessage) {
      setHasError(true);
      setErrorMessage(externalErrorMessage);
    }
  }, [externalError, externalErrorMessage]);

  // Handle completion
  useEffect(() => {
    if (currentStep >= steps.length - 1 && !hasError) {
      setIsCompleted(true);
      if (onComplete) {
        setTimeout(() => {
          onComplete({});
        }, 2000);
      }
    }
  }, [currentStep, hasError, onComplete]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStepStatus = (stepIndex: number) => {
    // Only use real progress if we have a session ID, otherwise show pending
    if (sessionId) {
      if (stepIndex < realCurrentStep) return 'completed';
      if (stepIndex === realCurrentStep) return 'in_progress';
      return 'pending';
    } else {
      // No session ID means no real progress tracking, show all as pending
      return 'pending';
    }
  };

  const getStepIcon = (step: any, stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const activeStep = sessionId ? realCurrentStep : currentStep;
    
    if (hasError && stepIndex === activeStep) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Analyzing Your Resume
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Info */}
          {fileName && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{fileName}</span>
                {fileSize && (
                  <span className="text-gray-500">({formatFileSize(fileSize)})</span>
                )}
              </div>
            </div>
          )}

          {/* Current Step Message */}
          {sessionId && realStepMessage && (
            <div className="text-center">
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {realStepMessage}
              </p>
            </div>
          )}

          {/* Time Information */}
          <div className="flex justify-center text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const activeStep = sessionId ? realCurrentStep : currentStep;
              const isActive = index === activeStep;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all",
                    isActive && "bg-primary/5 border border-primary/20",
                    status === 'completed' && "bg-green-50 border border-green-200",
                    status === 'pending' && "bg-gray-50"
                  )}
                >
                  <div className="flex-shrink-0">
                    {getStepIcon(step, index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "text-sm font-medium",
                        isActive && "text-primary",
                        status === 'completed' && "text-green-700",
                        status === 'pending' && "text-gray-500"
                      )}>
                        {step.name}
                      </h4>
                      {status === 'in_progress' && (
                        <div className="w-4 h-4">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs mt-1",
                      isActive && "text-primary/80",
                      status === 'completed' && "text-green-600",
                      status === 'pending' && "text-gray-400"
                    )}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error State */}
          {hasError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Analysis Failed</span>
              </div>
              <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {hasError ? (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onRetry}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </>
            ) : isCompleted ? (
              <div className="w-full text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Analysis Complete!</span>
                </div>
                <p className="text-sm text-gray-600">Redirecting to results...</p>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
                disabled={isCompleted || (sessionId ? realCurrentStep >= steps.length - 1 : currentStep >= steps.length - 1)}
              >
                Cancel Analysis
              </Button>
            )}
          </div>

          {/* Processing Note */}
          {!isCompleted && !hasError && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                This process typically takes 45-60 seconds. Please don't close this window.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
