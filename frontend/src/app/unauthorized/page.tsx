import { Shield, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Unauthorized Illustration */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Shield className="w-16 h-16 text-destructive/60" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Please log in with the correct account or contact an administrator.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex-1">
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Having trouble accessing your account?
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
          </div>
        </div>
      </div>
    </div>
  );
}
