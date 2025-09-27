import NavigationHeader from "@/components/navigation-header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import TemplatesShowcase from "@/components/templates-showcase";
import TestimonialsSection from "@/components/testimonials-section";
import PricingSection from "@/components/pricing-section";
import FooterSection from "@/components/footer-section";
import { FAQSection } from "@/components/faq-section";
import StickyCTA from "@/components/sticky-cta";
import ScrollToTopButton from "@/components/scroll-to-top-button";
import Script from "next/script";
import { ATSUploadBox } from "@/components/ats-upload-box";

export default function Page() {
  return (
    <>
      <NavigationHeader />
      <main className="pt-16 min-h-screen bg-background">
        {/* Hero */}
        <div id="top" className="bg-transparent">
          <HeroSection primaryHref="#get-started" secondaryHref="#templates" />
        </div>

        {/* Templates Showcase */}
        <section id="templates" className="bg-transparent">
          <div className="container py-16 md:py-20">
            <TemplatesShowcase />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-transparent">
          <div className="container py-16 md:py-20">
            <FeaturesSection
              title="Why choose CVGenix"
              description="Everything you need to craft a standout, professional resume—fast. ATS-ready, recruiter-approved, and effortless to use."
            />
          </div>
        </section>

        {/* ATS Analyzer */}
        <section id="ats" className="bg-transparent">
          <div className="container py-20 md:py-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI-Powered Analysis
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                ATS Resume Analyzer
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Get instant feedback on your resume's ATS compatibility. Upload your file or paste text to analyze keyword coverage, formatting, and optimization opportunities.
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
              {/* Left: Features */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Why Use Our ATS Analyzer?</h3>
                  
                  <div className="grid gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-900">Keyword Coverage Analysis</h4>
                          <p className="text-sm text-gray-600">Identify missing keywords and get suggestions to improve your resume's relevance to specific job postings.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-900">Format Compatibility Check</h4>
                          <p className="text-sm text-gray-600">Ensure your resume format is ATS-friendly with proper structure and formatting recommendations.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-900">Real-time Optimization</h4>
                          <p className="text-sm text-gray-600">Get instant feedback and actionable recommendations to improve your resume's ATS compatibility score.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-900">Instant Results</h4>
                          <p className="text-sm text-gray-600">No waiting required - analyze your resume in seconds and get immediate insights to optimize your job applications.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right: Upload Box */}
              <div className="flex justify-center lg:justify-end">
                <ATSUploadBox />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="examples" className="bg-background">
          <div className="container py-16 md:py-20">
            <TestimonialsSection />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-background">
          <div className="container py-16 md:py-20">
            <PricingSection />
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-background">
          <div className="container py-16 md:py-20">
            <FAQSection />
          </div>
        </section>

        {/* Get Started Anchor Target */}
        <div id="get-started" className="sr-only" aria-hidden="true" />

      </main>
      <FooterSection />

      <StickyCTA />
      <ScrollToTopButton />

      {/* JSON-LD Structured Data */}
      <Script id="ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "name": "CVGenix",
              "url": "https://cvgenix.com",
              "logo": "https://cvgenix.com/icon.png"
            },
            {
              "@type": "Product",
              "name": "CVGenix Resume Builder",
              "brand": { "@type": "Brand", "name": "CVGenix" },
              "description": "ATS-optimized resume builder with elegant templates and one-click export.",
              "offers": { "@type": "Offer", "url": "https://cvgenix.com/#pricing", "priceCurrency": "USD" }
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is my resume ATS-friendly?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. All templates are optimized for Applicant Tracking Systems (ATS). Our analyzer highlights keywords and formatting issues to improve pass rates."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I export my resume?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can export unlimited times to PDF and DOCX with consistent formatting. One-click export is included in all plans."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do I need a credit card to start?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. You can start building your resume for free—no card required. Upgrade only if you love it."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I customize templates?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. You can edit sections, rearrange layout, change styles, and tailor content with smart guidance."
                  }
                }
              ]
            }
          ]
        })}
      </Script>
    </>
  );
}