"use client";

export interface FooterSectionProps {
  className?: string;
  logoHref?: string;
}

export default function FooterSection({ className, logoHref = "#top" }: FooterSectionProps) {
  return (
    <footer
      className={[
        "w-full bg-white text-foreground border-t border-border",
        "transition-colors",
        className ?? "",
      ].join(" ")}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:gap-10 md:grid-cols-12">
          {/* Brand + About */}
          <div className="md:col-span-4 space-y-6 min-w-0">
            <a
              href={logoHref}
              className="inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary rounded-md"
              aria-label="CVGenix home"
            >
              <div className="h-9 w-9 rounded-lg bg-foreground text-primary-foreground flex items-center justify-center shadow-sm ring-1 ring-border transition-transform group-hover:-translate-y-0.5">
                <span className="text-sm font-bold leading-none">R</span>
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">
                CVGenix
              </span>
            </a>

            <p className="text-sm text-muted-foreground max-w-prose">
              Create professional resumes that stand out from the crowd. Our modern templates and AI-powered suggestions help you land your dream job faster.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm">
              <div className="text-foreground font-medium">hello@cvgenix.com</div>
              <div className="text-muted-foreground">+1 (234) 567-890</div>
              <div className="text-muted-foreground">123 Resume Street</div>
              <div className="text-muted-foreground">San Francisco, CA 94102</div>
            </div>
          </div>

          {/* Link columns */}
          <nav
            className="md:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10"
            aria-label="Footer navigation"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Templates</a>
                </li>
                <li>
                  <a href="#get-started" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Resume Builder</a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Features</a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">About Us</a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Contact</a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Help Center</a>
                </li>
                <li>
                  <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Terms of Service</a>
                </li>
                <li>
                  <a href="/maintenance" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">System Status</a>
                </li>
              </ul>
            </div>
          </nav>

        </div>

        {/* Divider */}
        <div className="mt-8 h-px w-full bg-border" role="separator" aria-hidden="true" />

        {/* Bottom bar */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            <span>© 2025 CVGenix. All rights reserved.</span>
            <span className="mx-2" aria-hidden>
              •
            </span>
            <span>
              Made with <span aria-hidden>♥</span> for job seekers
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="/resume-builder" className="hover:text-foreground underline-offset-4 hover:underline">Privacy Policy</a>
            <a href="/resume-builder" className="hover:text-foreground underline-offset-4 hover:underline">Terms of Service</a>
            <a href="/resume-builder" className="hover:text-foreground underline-offset-4 hover:underline">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}