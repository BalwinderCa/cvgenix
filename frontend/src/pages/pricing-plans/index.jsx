import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import PricingHero from './components/PricingHero';
import PricingToggle from './components/PricingToggle';
import PricingCard from './components/PricingCard';
import ComparisonTable from './components/ComparisonTable';
import SuccessStories from './components/SuccessStories';
import EnterpriseSection from './components/EnterpriseSection';
import FAQSection from './components/FAQSection';
import TrustSignals from './components/TrustSignals';

const PricingPlans = () => {
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
          name: "Unlimited Templates",
          description: "Access to 50+ professionally designed templates"
        },
        {
          name: "AI Content Optimization",
          description: "Smart suggestions to improve your resume content"
        },
        {
          name: "Real-time ATS Scoring",
          description: "See how well your resume passes applicant tracking systems"
        },
        {
          name: "LinkedIn Integration",
          description: "Import and enhance your LinkedIn profile data"
        },
        {
          name: "Multiple Export Formats",
          description: "PDF, Word, and HTML formats for different needs"
        },
        {
          name: "Unlimited Resume Versions",
          description: "Create targeted resumes for different roles"
        },
        {
          name: "Email Support",
          description: "Get help from our support team within 24 hours"
        }
      ]
    },
    {
      name: "Career Accelerator",
      description: "For serious career advancement",
      price: 49,
      icon: "Rocket",
      cta: "Accelerate Career",
      roi: "Career Accelerator users negotiate 23% higher salaries",
      features: [
        {
          name: "Everything in Professional",
          description: "All Professional features included"
        },
        {
          name: "Market Insights & Trends",
          description: "Industry analysis and job market intelligence"
        },
        {
          name: "Salary Benchmarking",
          description: "Comprehensive salary data for your role and location"
        },
        {
          name: "Skills Gap Analysis",
          description: "Identify missing skills for your target roles"
        },
        {
          name: "Interview Preparation Tools",
          description: "AI-powered interview questions and practice sessions"
        },
        {
          name: "Career Path Planning",
          description: "Strategic guidance for long-term career growth"
        },
        {
          name: "Priority Support + Phone",
          description: "Priority email and phone support during business hours"
        },
        {
          name: "Resume Version History",
          description: "Track changes and revert to previous versions"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PricingHero />
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {plans?.map((plan, index) => (
              <PricingCard 
                key={plan?.name}
                plan={plan}
                isAnnual={isAnnual}
                isPopular={index === 1}
              />
            ))}
          </div>
        </div>
      </div>
      {/* <ComparisonTable /> */}
      <SuccessStories />
      <EnterpriseSection />
      <TrustSignals />
      <FAQSection />
    </div>
  );
};

export default PricingPlans;