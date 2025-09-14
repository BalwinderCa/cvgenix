"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose } from
"@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

export interface NavigationHeaderProps {
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
{ label: "Homepage", href: "/" },
{ label: "Resume Templates", href: "/templates" },
{ label: "Resume Builder", href: "/resume-builder" },
{ label: "Cover Letter", href: "/cover-letter" },
{ label: "ATS Score", href: "/ats-score" }];


export default function NavigationHeader({ className }: NavigationHeaderProps) {
  const [open, setOpen] = React.useState(false);

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
            className="flex items-center"
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
            {/* Build My Resume Button */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                asChild
                className="text-sm font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow-sm">
                <Link href="/resume-builder" aria-label="Build My Resume">
                  Build My Resume
                </Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="hidden">

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
                    {/* Buy Me a Coffee (Mobile) */}
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

    </header>);

}