import React from 'react';
import Icon from '../../../components/AppIcon';

const PricingHero = () => {
  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-trust/5 pt-24 md:pt-32 pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-4 md:mb-6">
            <Icon name="TrendingUp" size={20} color="var(--color-accent)" />
            <span className="text-accent font-semibold text-sm uppercase tracking-wide">
              Career Investment
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6">
            Invest in your career's{' '}
            <span className="text-gradient">most important document</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
            Choose the plan that matches your career ambitions. From basic resume building
            to comprehensive career acceleration with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={14} color="var(--color-accent)" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CreditCard" size={14} color="var(--color-accent)" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={14} color="var(--color-accent)" />
              <span>50,000+ professionals trust us</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingHero;