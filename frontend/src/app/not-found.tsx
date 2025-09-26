"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-6xl font-bold text-primary/20">404</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex-1">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/resume-builder" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Build Resume
              </Link>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/templates" 
              className="text-sm text-primary hover:underline"
            >
              Templates
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/ats-score" 
              className="text-sm text-primary hover:underline"
            >
              ATS Score
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/help" 
              className="text-sm text-primary hover:underline"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
