"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Illustration */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="w-16 h-16 text-destructive/60" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong!
            </h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Don't worry, our team has been notified and we're working to fix it.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="pt-6 border-t border-border">
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                Error Details (Development)
              </summary>
              <div className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                <div className="font-mono">
                  <div className="text-destructive font-semibold">
                    {error.name}: {error.message}
                  </div>
                  {error.stack && (
                    <pre className="mt-2 text-muted-foreground whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                  {error.digest && (
                    <div className="mt-2 text-muted-foreground">
                      Error ID: {error.digest}
                    </div>
                  )}
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Help Section */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Need help? Contact our support team
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/help" 
              className="text-sm text-primary hover:underline"
            >
              Help Center
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/contact" 
              className="text-sm text-primary hover:underline"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
