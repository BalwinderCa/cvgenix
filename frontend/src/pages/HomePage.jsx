import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/ui/Header';
import HeroSection from '../components/home/components/HeroSection';
import MetricsSection from '../components/home/components/MetricsSection';
import ValuePropositionSection from '../components/home/components/ValuePropositionSection';
import InteractiveDemoWidget from '../components/home/components/InteractiveDemoWidget';
import SuccessStoriesCarousel from '../components/home/components/SuccessStoriesCarousel';
import TemplatePreviewSection from '../components/home/components/TemplatePreviewSection';

// Import Pricing Components
import PricingHero from '../pages/pricing-plans/components/PricingHero';
import PricingToggle from '../pages/pricing-plans/components/PricingToggle';
import PricingCard from '../pages/pricing-plans/components/PricingCard';
import ComparisonTable from '../pages/pricing-plans/components/ComparisonTable';
import EnterpriseSection from '../pages/pricing-plans/components/EnterpriseSection';
import FAQSection from '../pages/pricing-plans/components/FAQSection';
import TrustSignals from '../pages/pricing-plans/components/TrustSignals';

// Import About Components
import MissionSection from '../pages/about-resume-ai-pro/components/MissionSection';
import TeamSection from '../pages/about-resume-ai-pro/components/TeamSection';
import TechnologySection from '../pages/about-resume-ai-pro/components/TechnologySection';
import CVTemplatesSection from '../components/home/components/CVTemplatesSection';

const Homepage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out our platform",
      price: 0,
      icon: "Zap",
      cta: "Get Started Free",
      note: "No credit card required",
      features: [
        {
          name: "1 Resume Template",
          description: "Access to our most popular professional template"
        },
        {
          name: "Basic Resume Builder",
          description: "Drag-and-drop interface with essential sections"
        },
        {
          name: "PDF Export",
          description: "Download your resume as a high-quality PDF"
        },
        {
          name: "Community Support",
          description: "Access to our user community and knowledge base"
        }
      ]
    },
    {
      name: "Professional",
      description: "For active job seekers who want results",
      price: 29,
      icon: "Target",
      cta: "Start Professional",
      roi: "Professional users see 340% more responses",
      features: [
        {
          name: "20+ Premium Templates",
          description: "Industry-specific templates designed by recruiters"
        },
        {
          name: "AI-Powered Optimization",
          description: "Smart suggestions for improving your resume content"
        },
        {
          name: "ATS Compatibility Check",
          description: "Ensure your resume passes applicant tracking systems"
        },
        {
          name: "Custom Branding",
          description: "Add your personal colors and styling touches"
        },
        {
          name: "Priority Support",
          description: "Get help within 2 hours during business days"
        }
      ]
    },
    {
      name: "Executive",
      description: "For senior professionals and executives",
      price: 79,
      icon: "Crown",
      cta: "Go Executive",
      roi: "Executive users land interviews 450% faster",
      features: [
        {
          name: "Executive Templates",
          description: "C-suite and senior management focused designs"
        },
        {
          name: "Personal Career Consultant",
          description: "1-on-1 sessions with certified career advisors"
        },
        {
          name: "LinkedIn Optimization",
          description: "Complete LinkedIn profile makeover included"
        },
        {
          name: "Cover Letter Generator",
          description: "AI-powered cover letters for each application"
        },
        {
          name: "Unlimited Revisions",
          description: "Perfect your resume with unlimited edits"
        },
        {
          name: "White-Glove Service",
          description: "Dedicated account manager and priority support"
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Resume4me - Executive Resume Services | Distinguished Career Advancement</title>
        <meta name="description" content="Establish professional excellence with Resume4me's executive resume services. Join 2.1M+ distinguished professionals who have advanced their careers through our proven methodology." />
        <meta name="keywords" content="executive resume services, professional resume writing, career advancement, executive search, professional development, corporate resume" />
        <meta property="og:title" content="Resume4me - Executive Resume Services" />
        <meta property="og:description" content="Professional resume excellence for distinguished careers. Join 2.1M+ executives who have advanced through our proven services." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="/" />
        <meta name="description" content="Resume4me - Professional Resume Builder for Executives and Career Growth" />
        <meta name="keywords" content="resume, cv, executive, professional, builder, ATS, AI, templates, career" />
        <meta name="author" content="Resume4me" />
        <meta property="og:title" content="Resume4me - Professional Resume Builder" />
        <meta property="og:description" content="Build your professional resume with AI-powered templates and career tools." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:site_name" content="Resume4me" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20 md:pt-24">
          {/* Hero Section */}
          <section id="hero">
            <HeroSection />
          </section>

          {/* Features Section */}
          <section id="features">
            <MetricsSection />
            <ValuePropositionSection />
            <InteractiveDemoWidget />
            <SuccessStoriesCarousel />
            <CVTemplatesSection />
          </section>

          {/* Pricing Section */}
          <section id="pricing">
            <PricingHero />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
              <div className="text-center mb-8 md:mb-12">
                <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 items-stretch">
                {plans.map((plan, index) => (
                  <PricingCard
                    key={plan.name}
                    plan={plan}
                    isAnnual={isAnnual}
                    isPopular={index === 1} // Make the Professional plan (index 1) popular
                  />
                ))}
              </div>

              <TrustSignals />
              <FAQSection />
            </div>
          </section>

          {/* About Section */}
          <section id="about">
            <MissionSection />
            {/* <TeamSection /> */}
            <TechnologySection />
          </section>
        </main>

      </div>
    </>
  );
};

export default Homepage;