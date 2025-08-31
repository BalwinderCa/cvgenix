import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignalsSection = () => {
  const companyLogos = [
    { name: "Google", icon: "Search", employees: "2,847" },
    { name: "Microsoft", icon: "Monitor", employees: "1,923" },
    { name: "Apple", icon: "Smartphone", employees: "1,456" },
    { name: "Amazon", icon: "Package", employees: "3,201" },
    { name: "Tesla", icon: "Zap", employees: "892" },
    { name: "Meta", icon: "Users", employees: "1,234" },
    { name: "Netflix", icon: "Play", employees: "567" },
    { name: "Spotify", icon: "Music", employees: "423" }
  ];

  const securityBadges = [
    {
      icon: "Shield",
      title: "SOC 2 Compliant",
      description: "Enterprise-grade security standards"
    },
    {
      icon: "Lock",
      title: "256-bit SSL Encryption",
      description: "Your data is always protected"
    },
    {
      icon: "Eye",
      title: "GDPR Compliant",
      description: "Full privacy protection guaranteed"
    },
    {
      icon: "Server",
      title: "99.9% Uptime",
      description: "Reliable service you can count on"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Jennifer Martinez",
      role: "Senior Career Coach",
      company: "CareerSuccess Institute",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      quote: "Resume4me is the most sophisticated resume optimization tool I've encountered. The AI recommendations are spot-on and help my clients achieve remarkable results.",
      rating: 5
    },
    {
      name: "Robert Chen",
      role: "HR Director",
      company: "TechVentures Inc",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      quote: "As someone who reviews hundreds of resumes monthly, I can confidently say that Resume4me creates resumes that immediately stand out in our ATS system.",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "Recruitment Manager",
      company: "GlobalTalent Solutions",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      quote: "The quality difference is remarkable. Candidates using Resume4me consistently make it through our initial screening process at much higher rates.",
      rating: 5
    }
  ];

  const mediaLogos = [
    { name: "TechCrunch", width: "120" },
    { name: "Forbes", width: "100" },
    { name: "Harvard Business Review", width: "140" },
    { name: "Fast Company", width: "110" },
    { name: "Inc. Magazine", width: "80" },
    { name: "Entrepreneur", width: "130" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-secondary/30 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Companies Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Professionals at Leading Companies
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Over 12,000+ professionals have been hired at Fortune 500 companies using Resume4me
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {companyLogos?.map((company, index) => (
              <div key={index} className="group text-center">
                <div className="bg-background rounded-xl p-4 shadow-brand hover:shadow-brand-lg transition-all duration-300 transform group-hover:scale-105 border border-border/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-trust/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon name={company?.icon} size={24} className="text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {company?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {company?.employees} hired
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Badges */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Enterprise-Grade Security & Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityBadges?.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="bg-background rounded-xl p-6 shadow-brand border border-border/50 hover:border-accent/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name={badge?.icon} size={24} className="text-accent" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {badge?.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {badge?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expert Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Endorsed by Career Experts & HR Professionals
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => (
              <div key={index} className="bg-background rounded-xl p-6 shadow-brand border border-border/50">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial?.avatar}
                    alt={testimonial?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial?.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial?.company}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial?.rating)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={16} className="text-warning fill-current" />
                  ))}
                </div>

                <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
                  "{testimonial?.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* Media Mentions */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Featured In Leading Publications
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {mediaLogos?.map((media, index) => (
              <div key={index} className="flex items-center space-x-2 hover:opacity-100 transition-opacity duration-300">
                <Icon name="Newspaper" size={20} />
                <span className="font-semibold text-muted-foreground" style={{ width: media?.width }}>
                  {media?.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-accent/10 to-success/10 rounded-xl p-6 border border-accent/20">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Award" size={16} className="text-accent" />
                <span className="text-accent font-medium">"Best AI Resume Tool 2024"</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center space-x-2">
                <Icon name="TrendingUp" size={16} className="text-success" />
                <span className="text-success font-medium">"Top Career Technology"</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-primary" />
                <span className="text-primary font-medium">"Editor's Choice"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;