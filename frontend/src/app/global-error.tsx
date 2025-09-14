"use client";

import ErrorReporter from "@/components/ErrorReporter";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Error Illustration */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-destructive/60" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Application Error
              </h1>
              <p className="text-muted-foreground">
                A critical error occurred. Please refresh the page or contact support if the problem persists.
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

          {/* Error Reporter Component */}
          <ErrorReporter error={error} reset={reset} />
        </div>
      </body>
    </html>
  );
}
