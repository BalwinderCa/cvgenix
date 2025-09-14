import { Wrench, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Maintenance Illustration */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Wrench className="w-20 h-20 text-primary/60" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Under Maintenance
            </h1>
            <p className="text-muted-foreground text-lg">
              We're currently performing scheduled maintenance to improve your experience.
            </p>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Expected completion: 2-4 hours</span>
          </div>
          <p className="text-sm text-muted-foreground">
            During this time, some features may be temporarily unavailable. 
            We apologize for any inconvenience and appreciate your patience.
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Need immediate assistance?
          </p>
          <Button variant="outline" asChild>
            <Link href="mailto:support@cvgenix.com" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Support
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Thank you for using CVGenix
          </p>
        </div>
      </div>
    </div>
  );
}
