"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ChevronRight, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose } from
"@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";

type NavItem = {
  label: string;
  href: string;
};

export interface NavigationHeaderProps {
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
{ label: "Homepage", href: "/" },
{ label: "Resume Builder", href: "/resume-builder" },
{ label: "Cover Letter", href: "/cover-letter" },
{ label: "ATS Score", href: "/ats-score" }];


export default function NavigationHeader({ className }: NavigationHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [signupModalOpen, setSignupModalOpen] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    window.location.reload();
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full bg-card/100 backdrop-blur supports-[backdrop-filter]:bg-card/100 border-b border-border",
        className
      )}
      role="banner">

      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="CVGenix Home"
              className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-md">

              <span className="font-display text-lg font-extrabold tracking-tight">
                CVGenix
              </span>
            </Link>
          </div>

          {/* Center: Main Nav */}
          <nav
            className="hidden sm:flex items-center"
            aria-label="Primary">

            <ul className="flex items-center gap-4">
              {NAV_ITEMS.map((item) =>
              <li key={item.href}>
                  <Link
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-1 py-1 whitespace-nowrap">

                    {item.label}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Authentication Buttons */}
            {!isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setLoginModalOpen(true)}
                  className="text-sm font-medium">
                  Sign In
                </Button>
                <Button
                  onClick={() => setSignupModalOpen(true)}
                  className="text-sm font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow-sm">
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {user?.firstName || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  asChild
                  className="text-sm font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow-sm">
                  <Link href="/resume-builder" aria-label="Build My Resume">
                    Build My Resume
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="sm:hidden">

                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[88vw] max-w-sm bg-card p-0"
                aria-label="Mobile navigation">

                <SheetHeader className="border-b border-border px-4 py-3">
                  <SheetTitle>
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-2">

                      <span className="font-display text-lg font-extrabold tracking-tight">
                        CVGenix
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="px-2 py-2">
                  <nav aria-label="Mobile Primary">
                    <ul className="flex flex-col">
                      {NAV_ITEMS.map((item) =>
                      <li key={item.href}>
                          <SheetClose asChild>
                            <Link
                            href={item.href}
                            className="flex items-center justify-between px-2 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted/70 text-foreground/90"
                            onClick={() => setOpen(false)}>

                              <span className="text-base font-medium">
                                {item.label}
                              </span>
                              <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />
                            </Link>
                          </SheetClose>
                        </li>
                      )}
                    </ul>
                  </nav>

                  <div className="mt-2 border-t border-border" />

                  <div className="p-2 flex flex-col gap-2">
                    {/* Authentication (Mobile) */}
                    {!isAuthenticated ? (
                      <>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setOpen(false);
                              setLoginModalOpen(true);
                            }}
                            className="justify-center">
                            Sign In
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            onClick={() => {
                              setOpen(false);
                              setSignupModalOpen(true);
                            }}
                            className="justify-center bg-primary text-primary-foreground hover:opacity-95">
                            Sign Up
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-2 py-3 rounded-md hover:bg-muted/70 text-foreground/90">
                            <User className="h-4 w-4" />
                            <span className="text-base font-medium">Dashboard</span>
                          </Link>
                        </SheetClose>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setOpen(false);
                            handleLogout();
                          }}
                          className="justify-center">
                          Sign Out
                        </Button>
                      </>
                    )}
                    
                    {/* Build My Resume (Mobile) */}
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="justify-center bg-primary text-primary-foreground hover:opacity-95">
                        <Link href="/resume-builder" onClick={() => setOpen(false)}>
                          Build My Resume
                        </Link>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSwitchToSignup={() => {
          setLoginModalOpen(false);
          setSignupModalOpen(true);
        }}
      />
      <SignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSwitchToLogin={() => {
          setSignupModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </header>);

}