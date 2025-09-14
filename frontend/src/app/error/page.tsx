"use client";

import { useSearchParams } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle, Wifi, Server, FileX } from "lucide-react";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('type');

  const getErrorContent = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <Wifi className="w-16 h-16 text-destructive/60" />,
          title: "Connection Error",
          description: "Unable to connect to our servers. Please check your internet connection and try again.",
          action: "Check Connection"
        };
      case 'server':
        return {
          icon: <Server className="w-16 h-16 text-destructive/60" />,
          title: "Server Error",
          description: "Our servers are experiencing issues. Please try again in a few moments.",
          action: "Try Again"
        };
      case 'chunk-load':
        return {
          icon: <FileX className="w-16 h-16 text-destructive/60" />,
          title: "Loading Error",
          description: "Failed to load application resources. Please refresh the page to try again.",
          action: "Refresh Page"
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-destructive/60" />,
          title: "Something went wrong",
          description: "An unexpected error occurred. Please try again or contact support if the problem persists.",
          action: "Try Again"
        };
    }
  };

  const errorContent = getErrorContent();

  const handleAction = () => {
    if (errorType === 'chunk-load') {
      window.location.reload();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Illustration */}
        <div className="space-y-4">
          <div className="flex justify-center">
            {errorContent.icon}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {errorContent.title}
            </h1>
            <p className="text-muted-foreground">
              {errorContent.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleAction} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              {errorContent.action}
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Type Information */}
        {errorType && (
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Error Type: <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{errorType}</span>
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Still having trouble?
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
              Contact Support
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/maintenance" 
              className="text-sm text-primary hover:underline"
            >
              System Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
