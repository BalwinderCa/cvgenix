"use client";

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  interval?: number; // in milliseconds
  enabled?: boolean;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export function useAutoSave({
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
  onSaveStart,
  onSaveSuccess,
  onSaveError
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedDataRef = useRef<string | undefined>(undefined);
  const isSavingRef = useRef<boolean>(false);
  const saveAttemptsRef = useRef<number>(0);
  const maxRetries = 3;

  // Serialize data for comparison
  const serializeData = useCallback((data: any) => {
    return JSON.stringify(data);
  }, []);

  // Save function with retry logic
  const saveData = useCallback(async () => {
    if (isSavingRef.current) return;
    
    const currentDataString = serializeData(data);
    
    // Don't save if data hasn't changed
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    isSavingRef.current = true;
    saveAttemptsRef.current = 0;

    const attemptSave = async (attempt: number = 1): Promise<void> => {
      try {
        onSaveStart?.();
        await onSave(data);
        
        lastSavedDataRef.current = currentDataString;
        saveAttemptsRef.current = 0;
        onSaveSuccess?.();
        
        // Show subtle success indicator (not too intrusive)
        if (attempt > 1) {
          toast.success('Resume saved successfully!', { duration: 2000 });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        
        if (attempt < maxRetries) {
          // Check if it's a rate limiting error
          const isRateLimited = error instanceof Error && error.message && error.message.includes('Rate limited');
          
          // Retry with exponential backoff, longer delay for rate limiting
          const baseDelay = isRateLimited ? 30000 : 1000; // 30s for rate limit, 1s for other errors
          const delay = baseDelay * Math.pow(2, attempt - 1);
          
          setTimeout(() => {
            attemptSave(attempt + 1);
          }, delay);
        } else {
          // Max retries reached
          saveAttemptsRef.current = attempt;
          onSaveError?.(error);
          
          // Show appropriate error message
          const errorMessage = error instanceof Error && error.message && error.message.includes('Rate limited') 
            ? error.message 
            : 'Failed to save resume. Please try again.';
          toast.error(errorMessage, { duration: 6000 });
        }
      } finally {
        if (attempt >= maxRetries) {
          isSavingRef.current = false;
        }
      }
    };

    await attemptSave();
  }, [data, onSave, serializeData, onSaveStart, onSaveSuccess, onSaveError]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) return;

    const scheduleSave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        saveData();
      }, interval);
    };

    scheduleSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, interval, saveData]);

  // Save on data change (debounced)
  useEffect(() => {
    if (!enabled) return;

    const currentDataString = serializeData(data);
    
    // Don't save if data hasn't changed or if we're already saving
    if (currentDataString === lastSavedDataRef.current || isSavingRef.current) {
      return;
    }

    // Debounce saves to avoid too frequent API calls
    const debounceTimeout = setTimeout(() => {
      saveData();
    }, 5000); // 5 second debounce (increased to reduce API calls)

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [data, enabled, saveData, serializeData]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isSavingRef.current) {
        // If we're currently saving, wait a bit
        return;
      }
      
      const currentDataString = serializeData(data);
      if (currentDataString !== lastSavedDataRef.current) {
        // Use synchronous save for page unload
        navigator.sendBeacon('/api/resumes/autosave', JSON.stringify(data));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, serializeData]);

  // Manual save function
  const manualSave = useCallback(async () => {
    await saveData();
  }, [saveData]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const currentDataString = serializeData(data);
    return currentDataString !== lastSavedDataRef.current;
  }, [data, serializeData]);

  return {
    manualSave,
    hasUnsavedChanges,
    isSaving: isSavingRef.current,
    saveAttempts: saveAttemptsRef.current
  };
}
