import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustBadges = [
    {
      icon: "Shield",
      title: "30-Day Money-Back Guarantee",
      description: "Not satisfied? Get a full refund, no questions asked"
    },
    {
      icon: "CreditCard",
      title: "Secure Payments",
      description: "256-bit SSL encryption and PCI DSS compliance"
    },
    {
      icon: "Users",
      title: "50,000+ Professionals",
      description: "Trusted by professionals at Fortune 500 companies"
    },
    {
      icon: "Award",
      title: "Industry Recognition",
      description: "Featured in TechCrunch, Forbes, and HR Today"
    }
  ];

  const testimonials = [
    {
      text: "The ROI was immediate. My first interview came within 48 hours of updating my resume.",
      author: "David Kim",
      role: "Software Engineer",
      rating: 5
    },
    {
      text: "Worth every penny. The salary negotiation insights alone paid for the entire year.",
      author: "Maria Santos",
      role: "Product Manager",
      rating: 5
    },
    {
      text: "Finally, a resume tool that understands modern hiring. The ATS scoring is game-changing.",
      author: "James Wilson",
      role: "Marketing Director",
      rating: 5
    }
  ];

  const companyLogos = [
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Spotify", "Uber"
  ];

  return (
    <div className="bg-gradient-to-br from-surface/30 to-background py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16">
          {trustBadges?.map((badge, index) => (
            <div key={index} className="text-center">
              <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-primary to-trust rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Icon name={badge?.icon} size={20} color="white" className="md:w-6 md:h-6" />
              </div>
              <h4 className="font-semibold text-foreground mb-2 text-sm md:text-base">{badge?.title}</h4>
              <p className="text-muted-foreground text-xs md:text-sm">{badge?.description}</p>
            </div>
          ))}
        </div>

        {/* Value Testimonials */}
        <div className="mb-12 md:mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6 md:mb-8">
            What Our Users Say About Value
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials?.map((testimonial, index) => (
              <div key={index} className="bg-background rounded-xl p-4 md:p-6 border border-border">
                <div className="flex items-center space-x-1 mb-3 md:mb-4">
                  {[...Array(testimonial?.rating)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={14} color="var(--color-warning)" />
                  ))}
                </div>
                <blockquote className="text-muted-foreground italic mb-3 md:mb-4 text-sm md:text-base">
                  "{testimonial?.text}"
                </blockquote>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">{testimonial?.author}</div>
                  <div className="text-muted-foreground text-xs md:text-sm">{testimonial?.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <h3 className="text-base md:text-lg font-semibold text-muted-foreground mb-6 md:mb-8">
            Professionals from these companies trust Resume4me
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 opacity-60">
            {companyLogos?.map((company, index) => (
              <div key={index} className="text-2xl font-bold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="mt-16 bg-background rounded-2xl border border-border p-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Lock" size={24} color="var(--color-primary)" />
              <h3 className="text-xl font-bold text-foreground">Your Privacy & Security</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              We take your privacy seriously. Your resume data is encrypted, never shared with third parties,
              and you maintain full ownership of your content. GDPR compliant with enterprise-grade security.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} color="var(--color-accent)" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Lock" size={16} color="var(--color-accent)" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Eye" size={16} color="var(--color-accent)" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Trash2" size={16} color="var(--color-accent)" />
                <span>Data Deletion Rights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;