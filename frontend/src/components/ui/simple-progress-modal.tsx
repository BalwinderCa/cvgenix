"use client";

import React, { useState, useEffect, useRef } from 'react';
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

interface SimpleProgressModalProps {
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
  sessionId?: string;
}

export function SimpleProgressModal({ 
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
  sessionId
}: SimpleProgressModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('started');
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    {
      id: 0,
      name: 'Resume Uploaded',
      icon: <Upload className="w-5 h-5" />,
      description: 'File received and validated'
    },
    {
      id: 1,
      name: 'Parsing Resume',
      icon: <FileSearch className="w-5 h-5" />,
      description: 'Extracting text and structure from PDF'
    },
    {
      id: 2,
      name: 'AI Analysis',
      icon: <Zap className="w-5 h-5" />,
      description: 'Running dual AI analysis with Claude and GPT-4o'
    },
    {
      id: 3,
      name: 'Complete',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Analysis finished, redirecting to results'
    }
  ];

  // Poll for progress updates
  const pollProgress = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/progress/${sessionId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const progressData = data.data;
        
        setCurrentStep(progressData.currentStep || 0);
        setCurrentMessage(progressData.message || '');
        setProgress(progressData.progress || 0);
        setStatus(progressData.status || 'started');

        if (progressData.status === 'completed' && progressData.result) {
          setIsCompleted(true);
          setCurrentMessage('Analysis completed successfully! Redirecting to results...');
          
          if (onComplete) {
            setTimeout(() => {
              onComplete(progressData.result);
            }, 2000);
          }
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (progressData.status === 'error') {
          setHasError(true);
          setErrorMessage(progressData.message || 'Analysis failed');
          if (onError) {
            onError(progressData.message || 'Analysis failed');
          }
          
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error polling progress:', error);
    }
  };

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setElapsedTime(0);
      setHasError(false);
      setErrorMessage('');
      setIsCompleted(false);
      setStartTime(null);
      setCurrentStep(0);
      setCurrentMessage('');
      setProgress(0);
      setStatus('started');
      
      // Stop polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Start timing when modal opens
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Start polling if we have a session ID
    if (sessionId) {
      // Poll immediately
      pollProgress();
      
      // Then poll every 2 seconds
      pollingIntervalRef.current = setInterval(pollProgress, 2000);
    }

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [open, startTime, sessionId]);

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
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'in_progress';
    return 'pending';
  };

  const getStepIcon = (step: any, stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    if (hasError && stepIndex === currentStep) {
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
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md md:max-w-lg" showCloseButton={false}>
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

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Message */}
          {currentMessage && (
            <div className="text-center">
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {currentMessage}
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
              const isActive = index === currentStep;
              
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
                disabled={isCompleted}
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