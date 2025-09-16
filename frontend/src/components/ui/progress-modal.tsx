"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedDuration: number; // in seconds
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface ProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName?: string;
  fileSize?: number;
  onCancel?: () => void;
  onRetry?: () => void;
  hasError?: boolean;
  errorMessage?: string;
  onError?: (error: string) => void;
  isCompleted?: boolean;
  onComplete?: () => void;
  backendCompleted?: boolean;
}

export function ProgressModal({ 
  open, 
  onOpenChange, 
  fileName, 
  fileSize, 
  onCancel,
  onRetry,
  hasError: externalError,
  errorMessage: externalErrorMessage,
  onError,
  isCompleted = false,
  onComplete,
  backendCompleted = false
}: ProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTimeout, setIsTimeout] = useState(false);
  const [isAnalysisCompleted, setIsAnalysisCompleted] = useState(false);
  const [progressStartTime, setProgressStartTime] = useState<number | null>(null);

  const steps: ProgressStep[] = [
    {
      id: 'upload',
      title: 'Uploading Resume',
      description: 'Processing your PDF file...',
      icon: <Upload className="w-5 h-5" />,
      estimatedDuration: 3,
      status: 'completed'
    },
    {
      id: 'parsing',
      title: 'Extracting Text',
      description: 'Using AI to extract and structure content...',
      icon: <FileText className="w-5 h-5" />,
      estimatedDuration: 12,
      status: 'in_progress'
    },
    {
      id: 'analysis',
      title: 'AI Analysis',
      description: 'Running comprehensive ATS analysis with dual AI models...',
      icon: <Brain className="w-5 h-5" />,
      estimatedDuration: 40,
      status: 'pending'
    },
    {
      id: 'scoring',
      title: 'Generating Scores',
      description: 'Calculating detailed metrics and recommendations...',
      icon: <CheckCircle className="w-5 h-5" />,
      estimatedDuration: 8,
      status: 'pending'
    }
  ];

  const totalEstimatedDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setCurrentStep(0);
      setOverallProgress(0);
      setElapsedTime(0);
      setEstimatedTimeRemaining(totalEstimatedDuration);
      setHasError(false);
      setErrorMessage('');
      setIsTimeout(false);
      setIsAnalysisCompleted(false);
      setProgressStartTime(null);
      return;
    }

    // Only start progress if not already started
    if (progressStartTime) {
      return;
    }

    // Start the progress simulation
    const startTime = Date.now();
    setProgressStartTime(startTime);

    const progressInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);

      // Check for timeout (2 minutes)
      if (elapsed > 120) {
        setIsTimeout(true);
        setHasError(true);
        setErrorMessage('Analysis is taking longer than expected. This might be due to a large file or server load.');
        if (onError) {
          onError('Analysis timeout - please try again');
        }
        clearInterval(progressInterval);
        return;
      }

      // Simple linear progress calculation
      const progressPercent = Math.min((elapsed / totalEstimatedDuration) * 100, 95);
      setOverallProgress(progressPercent);
      
      // Calculate remaining time
      const remainingTime = Math.max(totalEstimatedDuration - elapsed, 0);
      setEstimatedTimeRemaining(remainingTime);

      // Determine current step based on elapsed time
      let currentStepIndex = 0;
      let accumulatedTime = 0;
      
      for (let i = 0; i < steps.length; i++) {
        accumulatedTime += steps[i].estimatedDuration;
        if (elapsed <= accumulatedTime) {
          currentStepIndex = i;
          break;
        }
        currentStepIndex = i + 1;
      }
      
      setCurrentStep(Math.min(currentStepIndex, steps.length - 1));

      // Debug logging
      console.log(`Progress: ${elapsed}s elapsed, Step ${currentStepIndex + 1}/${steps.length}, ${progressPercent.toFixed(1)}% complete`);

      // Simulate completion at 95% to allow for final processing
      if (progressPercent >= 95) {
        clearInterval(progressInterval);
        setOverallProgress(100);
        setEstimatedTimeRemaining(0);
        setCurrentStep(steps.length - 1); // Set to last step
        setIsAnalysisCompleted(true);
        // Call onComplete after a short delay
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [open, totalEstimatedDuration, onError, onComplete, progressStartTime]);

  // Handle external error state
  useEffect(() => {
    if (externalError && externalErrorMessage) {
      setHasError(true);
      setErrorMessage(externalErrorMessage);
    }
  }, [externalError, externalErrorMessage]);

  // Handle external completion state
  useEffect(() => {
    if (isCompleted) {
      setIsAnalysisCompleted(true);
      setOverallProgress(100);
      setEstimatedTimeRemaining(0);
      setCurrentStep(steps.length - 1);
      // Call onComplete after a short delay
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    }
  }, [isCompleted, onComplete]);

  // Handle backend completion - speed up progress if backend is done
  useEffect(() => {
    if (backendCompleted && !isAnalysisCompleted && progressStartTime) {
      console.log('🚀 Backend completed, speeding up progress...');
      // Speed up the remaining progress
      setOverallProgress(90); // Jump to 90% if backend is done
      setCurrentStep(steps.length - 2); // Move to second to last step
    }
  }, [backendCompleted, isAnalysisCompleted, progressStartTime]);

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

  const getStepIcon = (step: ProgressStep, stepIndex: number) => {
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

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Time Information */}
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Remaining: {formatTime(estimatedTimeRemaining)}</span>
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
                        {step.title}
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
            ) : isAnalysisCompleted ? (
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
                disabled={overallProgress >= 95}
              >
                Cancel Analysis
              </Button>
            )}
          </div>

          {/* Processing Note */}
          {!isAnalysisCompleted && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                This process typically takes 60-70 seconds. Please don't close this window.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
