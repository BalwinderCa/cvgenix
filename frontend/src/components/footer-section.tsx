"use client";

import { useState, useEffect } from "react";

export interface FooterSectionProps {
  className?: string;
  logoHref?: string;
}

interface CompanySettings {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyCountry?: string;
  companyWebsite?: string;
  companyLogo?: string;
  companyDescription?: string;
  taxId?: string;
}

export default function FooterSection({ className, logoHref = "#top" }: FooterSectionProps) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/company-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching company settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Default values
  const companyName = settings?.companyName || 'CVGenix';
  const email = settings?.companyEmail || 'hello@cvgenix.com';
  const phone = settings?.companyPhone || '+1 (234) 567-890';
  const street = settings?.companyAddress || '123 Resume Street';
  const city = settings?.companyCity || 'San Francisco';
  const state = settings?.companyState || 'CA';
  const zipCode = settings?.companyZip || '94102';
  const country = settings?.companyCountry || 'United States';
  const description = settings?.companyDescription || 'Create professional resumes that stand out from the crowd. Our modern templates and AI-powered suggestions help you land your dream job faster.';
  const website = settings?.companyWebsite;
  const logo = settings?.companyLogo;
  const copyright = `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

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
              aria-label={`${companyName} home`}
            >
              {logo ? (
                <img 
                  src={logo} 
                  alt={`${companyName} logo`}
                  className="h-9 w-auto max-w-[200px] object-contain"
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-foreground text-primary-foreground flex items-center justify-center shadow-sm ring-1 ring-border transition-transform group-hover:-translate-y-0.5">
                  <span className="text-sm font-bold leading-none">{companyName.charAt(0)}</span>
                </div>
              )}
              <span className="font-display text-xl font-extrabold tracking-tight">
                {companyName}
              </span>
            </a>

            <p className="text-sm text-muted-foreground max-w-prose">
              {description}
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm">
              {email && (
                <div className="text-foreground font-medium">
                  <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                </div>
              )}
              {phone && (
                <div className="text-muted-foreground">
                  <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                </div>
              )}
              {(street || city || state || zipCode || country) && (
                <>
                  {street && <div className="text-muted-foreground">{street}</div>}
                  {(city || state || zipCode || country) && (
                    <div className="text-muted-foreground">
                      {[city, state, zipCode, country].filter(Boolean).join(', ')}
                    </div>
                  )}
                </>
              )}
              {website && (
                <div className="text-muted-foreground">
                  <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
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
                  <a href="/templates" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Templates</a>
                </li>
                <li>
                  <a href="/resume-builder" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">Resume Builder</a>
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
            <span>{copyright}</span>
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