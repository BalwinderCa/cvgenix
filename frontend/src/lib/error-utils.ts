/**
 * Error handling utilities for the application
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

/**
 * Logs error information to console and optionally to external service
 */
export function logError(error: Error, errorInfo?: Partial<ErrorInfo>) {
  const errorData: ErrorInfo = {
    message: error.message,
    code: error.name,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ...errorInfo,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorData);
  }

  // In production, you might want to send this to an error reporting service
  // like Sentry, LogRocket, or your own error tracking API
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorService(errorData);
  }
}

/**
 * Determines the appropriate error page to redirect to based on error type
 */
export function getErrorRedirectPath(error: Error, statusCode?: number): string {
  // Handle specific error types
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    return '/error?type=chunk-load';
  }

  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return '/error?type=network';
  }

  // Handle HTTP status codes
  switch (statusCode) {
    case 401:
      return '/unauthorized';
    case 403:
      return '/unauthorized';
    case 404:
      return '/not-found';
    case 500:
    case 502:
    case 503:
    case 504:
      return '/error?type=server';
    default:
      return '/error';
  }
}

/**
 * Creates a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error, statusCode?: number): string {
  // Handle specific error types
  if (error.name === 'ChunkLoadError') {
    return 'The application failed to load properly. Please refresh the page.';
  }

  if (error.name === 'NetworkError') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Handle HTTP status codes
  switch (statusCode) {
    case 401:
      return 'You need to log in to access this page.';
    case 403:
      return 'You don\'t have permission to access this page.';
    case 404:
      return 'The page you\'re looking for doesn\'t exist.';
    case 500:
      return 'Something went wrong on our end. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Checks if the current environment is in maintenance mode
 */
export function isMaintenanceMode(): boolean {
  // This could be determined by an environment variable or API call
  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
}

/**
 * Redirects to maintenance page if in maintenance mode
 */
export function checkMaintenanceMode(): void {
  if (typeof window !== 'undefined' && isMaintenanceMode()) {
    window.location.href = '/maintenance';
  }
}
