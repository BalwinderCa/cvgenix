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
  Brain
} from 'lucide-react';

interface BasicProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName?: string;
  fileSize?: number;
  onCancel?: () => void;
  onRetry?: () => void;
  hasError?: boolean;
  errorMessage?: string;
  onError?: (error: string) => void;
  onComplete?: () => void;
  backendCompleted?: boolean;
}

export function BasicProgressModal({ 
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
  backendCompleted = false
}: BasicProgressModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setElapsedTime(0);
      setHasError(false);
      setErrorMessage('');
      setIsCompleted(false);
      setStartTime(null);
      return;
    }

    // Start timing when modal opens
    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [open, startTime]);

  useEffect(() => {
    if (!open || !startTime || isCompleted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);

      // Complete when backend is done
      if (backendCompleted) {
        setIsCompleted(true);
        clearInterval(interval);
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, startTime, isCompleted, backendCompleted, onComplete]);

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

          {/* Main Content */}
          {isCompleted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Analysis Complete!</h3>
                <p className="text-sm text-gray-600">Redirecting to results...</p>
              </div>
            </div>
          ) : hasError ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Analysis Failed</h3>
                <p className="text-sm text-gray-600">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our AI is analyzing your resume using advanced algorithms...
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Elapsed: {formatTime(elapsedTime)}</span>
                </div>
              </div>
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
                <p className="text-xs text-gray-500">Please wait while we redirect you...</p>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
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
