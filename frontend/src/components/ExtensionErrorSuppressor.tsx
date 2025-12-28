'use client';

import { useEffect } from 'react';

/**
 * Suppresses harmless browser extension errors from cluttering the console.
 * These errors occur when extensions reload or update and don't affect the application.
 * 
 * This component filters errors at the window event level, which is safer than
 * overriding console methods and won't interfere with debugging.
 */
export default function ExtensionErrorSuppressor() {
  useEffect(() => {
    // Handle unhandled errors at the window level
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      const filename = event.filename || '';
      
      // Filter out extension context errors
      if (
        errorMessage.includes('Extension context invalidated') ||
        filename.includes('content.js') ||
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://') ||
        errorMessage.includes('extension context')
      ) {
        // Prevent error from showing in console
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || '');
      
      // Filter out extension context errors
      if (
        reason.includes('Extension context invalidated') ||
        reason.includes('content.js') ||
        reason.includes('extension context')
      ) {
        // Prevent error from showing in console
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Add event listeners with capture phase to catch errors early
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection, true);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
    };
  }, []);

  return null; // This component doesn't render anything
}

