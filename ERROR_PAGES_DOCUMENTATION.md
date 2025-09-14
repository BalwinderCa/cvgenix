# Error Pages Documentation

This document outlines the comprehensive error handling system implemented for the CVGenix application.

## Error Pages Created

### 1. 404 Not Found (`/not-found`)
- **File**: `frontend/src/app/not-found.tsx`
- **Purpose**: Handles pages that don't exist
- **Features**:
  - User-friendly 404 message
  - Navigation buttons (Go Home, Build Resume, Go Back)
  - Helpful links to main sections
  - Responsive design

### 2. Application Error (`/error`)
- **File**: `frontend/src/app/error.tsx`
- **Purpose**: Handles runtime errors within the application
- **Features**:
  - Try Again functionality
  - Development error details
  - Support contact information
  - Error logging integration

### 3. Global Error (`/global-error`)
- **File**: `frontend/src/app/global-error.tsx`
- **Purpose**: Handles critical application errors that crash the entire app
- **Features**:
  - Complete HTML structure (since layout may be broken)
  - Error reporting integration
  - Development error details
  - Recovery options

### 4. Loading Page (`/loading`)
- **File**: `frontend/src/app/loading.tsx`
- **Purpose**: Shows loading state for pages
- **Features**:
  - Animated loading spinner
  - Clean, minimal design

### 5. Maintenance Page (`/maintenance`)
- **File**: `frontend/src/app/maintenance/page.tsx`
- **Purpose**: Shows when the application is under maintenance
- **Features**:
  - Maintenance status information
  - Expected completion time
  - Contact support option
  - Professional messaging

### 6. Unauthorized Page (`/unauthorized`)
- **File**: `frontend/src/app/unauthorized/page.tsx`
- **Purpose**: Handles access denied scenarios
- **Features**:
  - Clear access denied message
  - Login redirect option
  - Help and support links

### 7. Dynamic Error Page (`/error/page.tsx`)
- **File**: `frontend/src/app/error/page.tsx`
- **Purpose**: Handles specific error types with custom messaging
- **Features**:
  - Network error handling
  - Server error handling
  - Chunk loading error handling
  - Error type-specific icons and messages

## Supporting Files

### Error Utilities (`/lib/error-utils.ts`)
- **Purpose**: Centralized error handling utilities
- **Features**:
  - Error logging function
  - Error redirect path determination
  - User-friendly error message generation
  - Maintenance mode checking

### Error Boundary Component (`/components/ErrorBoundary.tsx`)
- **Purpose**: React error boundary for catching component errors
- **Features**:
  - Catches JavaScript errors in component tree
  - Custom fallback UI
  - Error logging integration
  - Development error details

### Middleware (`/middleware.ts`)
- **Purpose**: Handles redirects and maintenance mode
- **Features**:
  - Maintenance mode redirect
  - Common error page redirects
  - URL path matching

## Navigation Integration

### Footer Updates
- Added "System Status" link to maintenance page
- Integrated error page links in support section

### Error Page Navigation
- All error pages include navigation back to main sections
- Consistent button styling and behavior
- Help and support links on all error pages

## Error Handling Flow

1. **Runtime Errors**: Caught by `error.tsx` or `ErrorBoundary`
2. **404 Errors**: Handled by `not-found.tsx`
3. **Critical Errors**: Handled by `global-error.tsx`
4. **Maintenance**: Redirected to `maintenance/page.tsx`
5. **Unauthorized Access**: Redirected to `unauthorized/page.tsx`
6. **Specific Error Types**: Handled by `/error/page.tsx` with query parameters

## Development vs Production

- **Development**: Shows detailed error information, stack traces
- **Production**: Shows user-friendly messages, hides technical details
- **Error Logging**: Integrated in both environments with different outputs

## Usage Examples

### Triggering 404
```typescript
// Navigate to non-existent page
window.location.href = '/non-existent-page';
```

### Triggering Error
```typescript
// Throw an error in a component
throw new Error('Something went wrong');
```

### Maintenance Mode
```bash
# Set environment variable
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

### Specific Error Types
```typescript
// Network error
window.location.href = '/error?type=network';

// Server error
window.location.href = '/error?type=server';

// Chunk load error
window.location.href = '/error?type=chunk-load';
```

## Styling

All error pages use:
- Consistent design system with Tailwind CSS
- Responsive layout for mobile and desktop
- Accessible color contrast and typography
- Loading states and animations
- Professional, user-friendly messaging

## Testing

To test error pages:
1. Navigate to `/non-existent-page` for 404
2. Set `NEXT_PUBLIC_MAINTENANCE_MODE=true` for maintenance
3. Throw errors in components to test error boundaries
4. Use browser dev tools to simulate network errors
