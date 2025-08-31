import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const EnterpriseSection = () => {
  const enterpriseFeatures = [
    {
      icon: "Users",
      title: "Bulk Licensing",
      description: "Volume discounts for teams of 10+ users with centralized billing and management"
    },
    {
      icon: "Palette",
      title: "White-Label Solutions",
      description: "Customize the platform with your branding for career coaching businesses"
    },
    {
      icon: "BarChart3",
      title: "Analytics Dashboard",
      description: "Track team performance, usage metrics, and success rates across your organization"
    },
    {
      icon: "Shield",
      title: "Enterprise Security",
      description: "SSO integration, advanced permissions, and compliance with enterprise standards"
    },
    {
      icon: "Headphones",
      title: "Dedicated Support",
      description: "Dedicated account manager and priority technical support for your team"
    },
    {
      icon: "Zap",
      title: "API Access",
      description: "Integrate Resume4me capabilities into your existing HR or career platforms"
    }
  ];

  const useCases = [
    {
      type: "Career Coaches",
      description: "Enhance your coaching practice with AI-powered resume optimization tools",
      users: "500+ coaches",
      benefit: "3x client satisfaction"
    },
    {
      type: "HR Departments",
      description: "Help employees advance their careers with professional development tools",
      users: "200+ companies",
      benefit: "40% better retention"
    },
    {
      type: "Universities",
      description: "Prepare students for the job market with modern resume building tools",
      users: "150+ institutions",
      benefit: "85% job placement rate"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 to-trust/5 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Building2" size={24} color="var(--color-primary)" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">
              Enterprise Solutions
            </span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Scale Career Success Across Your Organization
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Empower your team, clients, or students with enterprise-grade resume building
            and career development tools designed for organizations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">Enterprise Features</h3>
            <div className="space-y-6">
              {enterpriseFeatures?.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon name={feature?.icon} size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{feature?.title}</h4>
                    <p className="text-muted-foreground">{feature?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">Who We Serve</h3>
            <div className="space-y-6">
              {useCases?.map((useCase, index) => (
                <div key={index} className="bg-background rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-foreground text-lg">{useCase?.type}</h4>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">{useCase?.users}</div>
                      <div className="text-xs text-accent">{useCase?.benefit}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{useCase?.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Organization's Career Success?
            </h3>
            <p className="text-muted-foreground mb-8">
              Get custom pricing, implementation support, and dedicated account management
              tailored to your organization's needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" className="btn-gradient">
                <Icon name="Calendar" size={18} className="mr-2" />
                Schedule Demo
              </Button>
              <Button variant="outline" size="lg">
                <Icon name="Download" size={18} className="mr-2" />
                Download Enterprise Guide
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} color="var(--color-accent)" />
                <span>30-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} color="var(--color-accent)" />
                <span>Unlimited users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Headphones" size={16} color="var(--color-accent)" />
                <span>Dedicated support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSection;