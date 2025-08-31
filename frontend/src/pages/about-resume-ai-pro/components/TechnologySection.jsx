import React from 'react';
import Icon from '../../../components/AppIcon';

const TechnologySection = () => {
  const techFeatures = [
    {
      icon: "Brain",
      title: "Machine Learning Analysis",
      description: "Our AI analyzes millions of successful resumes and hiring patterns to identify what actually works in your industry.",
      details: "Advanced NLP models trained on anonymized data from 50,000+ successful job placements"
    },
    {
      icon: "Target",
      title: "ATS Optimization Engine",
      description: "Real-time analysis ensures your resume passes through Applicant Tracking Systems used by 95% of Fortune 500 companies.",
      details: "Compatible with 200+ ATS platforms including Workday, Greenhouse, and Lever"
    },
    {
      icon: "TrendingUp",
      title: "Predictive Scoring",
      description: "Get instant feedback on how likely your resume is to generate interviews based on historical data.",
      details: "Proprietary algorithm with 87% accuracy in predicting interview callback rates"
    },
    {
      icon: "Zap",
      title: "Dynamic Personalization",
      description: "Content suggestions adapt in real-time based on your industry, role level, and career goals.",
      details: "Contextual recommendations powered by transformer-based language models"
    }
  ];

  const securityFeatures = [
    {
      icon: "Shield",
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption protects your personal and career data"
    },
    {
      icon: "Lock",
      title: "Privacy by Design",
      description: "You control your data - delete anytime, no hidden retention"
    },
    {
      icon: "Eye",
      title: "Transparent AI",
      description: "Clear explanations for every AI recommendation and score"
    },
    {
      icon: "UserCheck",
      title: "GDPR Compliant",
      description: "Full compliance with global privacy regulations"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Cpu" size={20} color="var(--color-trust)" />
            <span className="text-sm font-medium text-trust">Our Technology</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            AI That Actually
            <span className="text-gradient block">Understands Hiring</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We don't just use AI as a buzzword. Our technology is built by former data scientists from LinkedIn and Google, trained on real hiring outcomes, not just keyword matching.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {techFeatures?.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-xl p-8 shadow-brand border border-border/50 h-full hover:shadow-brand-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-trust/10 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon name={feature?.icon} size={24} color="var(--color-trust)" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {feature?.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature?.description}
                    </p>
                    <div className="bg-trust/5 rounded-lg p-4 border border-trust/10">
                      <p className="text-sm text-trust font-medium">
                        Technical Detail:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature?.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-trust/5 rounded-2xl p-8 lg:p-12 border border-primary/10 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              How Our AI Works
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A transparent look at the technology that powers your career advancement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand">
                <Icon name="Database" size={24} color="var(--color-primary)" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Data Collection
              </h4>
              <p className="text-sm text-muted-foreground">
                Anonymized analysis of successful resumes, job postings, and hiring outcomes across industries
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand">
                <Icon name="Settings" size={24} color="var(--color-trust)" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Pattern Recognition
              </h4>
              <p className="text-sm text-muted-foreground">
                Machine learning identifies what content, structure, and keywords lead to interview callbacks
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-brand">
                <Icon name="Sparkles" size={24} color="var(--color-accent)" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Personalized Optimization
              </h4>
              <p className="text-sm text-muted-foreground">
                Real-time recommendations tailored to your specific role, industry, and career level
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-brand border border-border/50">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Security & Privacy
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your career data deserves the highest level of protection. Here's how we keep it safe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures?.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon name={feature?.icon} size={20} color="var(--color-primary)" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {feature?.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature?.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-accent/5 rounded-lg p-6 border border-accent/10">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} color="var(--color-accent)" className="flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Data Usage Transparency
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use aggregated, anonymized data to improve our AI models. Your personal information is never shared with employers or third parties without your explicit consent. You can export or delete your data at any time through your account settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;