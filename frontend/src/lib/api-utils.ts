// API utility functions for dynamic URL handling

export const getApiBaseUrl = (): string => {
  // In production, use the same domain as the frontend
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost';
    if (isProduction) {
      return `${window.location.protocol}//${window.location.host}/api`;
    }
  }
  // Development fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
