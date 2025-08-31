import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(0);

  const faqs = [
    {
      question: "Why subscription pricing instead of one-time payment?",
      answer: `Our subscription model ensures you always have access to the latest AI improvements, new templates, and updated market insights. The job market evolves rapidly, and our AI models are continuously trained on current hiring trends. A one-time payment would mean outdated tools within months. Plus, most users land their dream job within 2-3 months, making the investment minimal compared to salary increases.`,
      icon: "CreditCard"
    },
    {
      question: "Can I cancel anytime? What about refunds?",
      answer: `Yes, you can cancel your subscription at any time with no cancellation fees. We offer a 30-day money-back guarantee if you're not satisfied with the results. After cancellation, you'll retain access to your account until the end of your billing period, and you can always export your resumes.`,
      icon: "RefreshCw"
    },
    {
      question: "How does the AI optimization actually work?",
      answer: `Our AI analyzes millions of successful resumes and job postings to understand what gets results. It evaluates your content for keyword optimization, ATS compatibility, impact statement strength, and industry-specific requirements. The system provides specific suggestions for improvements and can rewrite sections to be more compelling while maintaining your authentic voice.`,
      icon: "Brain"
    },
    {
      question: "What's the difference between Professional and Executive?",
      answer: `Professional focuses on resume optimization and job application success - perfect for active job seekers. Executive adds strategic career planning tools like market insights, salary benchmarking, skills gap analysis, and interview preparation. It's designed for professionals planning long-term career advancement, not just immediate job changes.`,
      icon: "TrendingUp"
    },
    {
      question: "Do you offer student or military discounts?",
      answer: `Yes! We offer 50% off for students with valid .edu email addresses and 40% off for active military and veterans. We also have special pricing for career transition programs and unemployment support organizations. Contact our support team with verification for discount codes.`,
      icon: "GraduationCap"
    },
    {
      question: "How secure is my personal information?",
      answer: `We use enterprise-grade security with 256-bit SSL encryption, SOC 2 compliance, and GDPR adherence. Your resume data is encrypted at rest and in transit. We never sell your information to third parties, and you maintain full ownership of your content. You can delete your account and all data at any time.`,
      icon: "Shield"
    },
    {
      question: "Can I use this for multiple career fields?",
      answer: `Absolutely! Our AI understands different industries and can optimize your resume for various fields. You can create unlimited resume versions targeting different roles, industries, or career levels. The Executive plan includes industry-specific insights and templates for even better targeting.`,
      icon: "Target"
    },
    {
      question: "What if I need help or have technical issues?",
      answer: `Free users have access to our community forum and knowledge base. Professional users get email support with 24-hour response times. Executive users receive priority support including phone support during business hours. Enterprise customers get dedicated account management.`,
      icon: "HelpCircle"
    }
  ];

  return (
    <div className="bg-background py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="MessageCircle" size={24} color="var(--color-primary)" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">Support</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about our pricing and plans. Can't find what you're looking for?
            <span className="text-primary font-medium"> Contact our support team.</span>
          </p>
        </div>

        <div className="space-y-4">
          {faqs?.map((faq, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon
                      name={faq?.icon}
                      size={25}
                      color="var(--color-primary)"
                    />
                  </div>
                  <h3 className="font-semibold text-xl text-center text-foreground pr-4">{faq?.question}</h3>
                </div>
                <div className="flex-shrink-0 w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
                  <Icon
                    name={openFAQ === index ? "ChevronUp" : "ChevronDown"}
                    size={16}
                    color="black"
                    className="transition-transform duration-200"
                  />
                </div>
              </button>

              {openFAQ === index && (
                <div className="px-6 pb-5">
                  <div className="border-t border-border pt-5 ml-14">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq?.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-trust/10 rounded-2xl p-8 border border-primary/20">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Headphones" size={24} color="var(--color-primary)" />
              <h3 className="text-xl font-bold text-foreground">
                Still have questions?
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you choose the right plan for your career goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex items-center space-x-3 text-muted-foreground bg-background/50 rounded-lg px-4 py-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Mail" size={16} color="var(--color-primary)" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Email Support</div>
                  <span className="text-sm">support@resume4me.com</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground bg-background/50 rounded-lg px-4 py-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Icon name="MessageCircle" size={16} color="var(--color-success)" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground">Live Chat</div>
                  <span className="text-sm">Available 9AM-6PM EST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;