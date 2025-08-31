import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/ui/Header';
import HeroSection from '../components/home/components/HeroSection';
import MetricsSection from '../components/home/components/MetricsSection';
import ValuePropositionSection from '../components/home/components/ValuePropositionSection';
import InteractiveDemoWidget from '../components/home/components/InteractiveDemoWidget';
import SuccessStoriesCarousel from '../components/home/components/SuccessStoriesCarousel';
import TemplatePreviewSection from '../components/home/components/TemplatePreviewSection';

// Import About Components
import MissionSection from '../pages/about-resume-ai-pro/components/MissionSection';
import TeamSection from '../pages/about-resume-ai-pro/components/TeamSection';
import TechnologySection from '../pages/about-resume-ai-pro/components/TechnologySection';
import CVTemplatesSection from '../components/home/components/CVTemplatesSection';

const Homepage = () => {
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