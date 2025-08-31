import React from 'react';
import Icon from '../../../components/AppIcon';

const MissionSection = () => {
  const values = [
    {
      icon: "Target",
      title: "Authenticity Over Gaming",
      description: "We help you present your genuine value proposition, not just keyword-stuffed content that tricks ATS systems."
    },
    {
      icon: "Users",
      title: "Democratized Access",
      description: "Advanced career tools shouldn\'t be exclusive to executives. Everyone deserves professional-grade optimization."
    },
    {
      icon: "TrendingUp",
      title: "Continuous Innovation",
      description: "We constantly evolve our AI models based on real hiring patterns and user success data."
    },
    {
      icon: "Shield",
      title: "Privacy First",
      description: "Your career data is yours. We provide transparency and control over how your information is used."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Heart" size={20} color="var(--color-accent)" />
            <span className="text-sm font-medium text-accent">Our Mission</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Empowering Every Professional's
            <span className="text-gradient block">Career Journey</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We believe that career advancement shouldn't depend on knowing the right people or having access to expensive career coaches. Our mission is to level the playing field by making intelligent career tools accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values?.map((value, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-xl p-6 shadow-brand border border-border/50 h-full hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-trust/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name={value?.icon} size={24} color="var(--color-primary)" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {value?.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value?.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-trust/5 rounded-2xl p-8 lg:p-12 border border-primary/10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                The Problem We Solve
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="X" size={14} color="var(--color-error)" />
                  </div>
                  <p className="text-muted-foreground">
                    Traditional resume builders create generic templates that don't adapt to modern hiring practices
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="X" size={14} color="var(--color-error)" />
                  </div>
                  <p className="text-muted-foreground">
                    Job seekers lack insights into what actually works in their specific industry and role
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="X" size={14} color="var(--color-error)" />
                  </div>
                  <p className="text-muted-foreground">
                    Career advancement tools are expensive and inaccessible to most professionals
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                Our Solution
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" size={14} color="var(--color-accent)" />
                  </div>
                  <p className="text-muted-foreground">
                    AI-powered optimization that learns from successful resumes in your field
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" size={14} color="var(--color-accent)" />
                  </div>
                  <p className="text-muted-foreground">
                    Real-time ATS analysis and industry-specific recommendations
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="Check" size={14} color="var(--color-accent)" />
                  </div>
                  <p className="text-muted-foreground">
                    Affordable pricing with free tier access to core optimization features
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;