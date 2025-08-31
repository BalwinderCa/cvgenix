import React from 'react';
import Icon from '../../../components/AppIcon';

const PartnershipsSection = () => {
  const partners = [
    {
      category: "ATS Integration Partners",
      description: "Seamless compatibility with leading Applicant Tracking Systems",
      logos: [
        { name: "Workday", logo: "Building2" },
        { name: "Greenhouse", logo: "Leaf" },
        { name: "Lever", logo: "Settings" },
        { name: "BambooHR", logo: "TreePine" },
        { name: "iCIMS", logo: "Monitor" },
        { name: "SmartRecruiters", logo: "Zap" }
      ]
    },
    {
      category: "Job Board Partners",
      description: "Direct integration with major job platforms for seamless applications",
      logos: [
        { name: "LinkedIn", logo: "Linkedin" },
        { name: "Indeed", logo: "Search" },
        { name: "Glassdoor", logo: "Eye" },
        { name: "AngelList", logo: "Rocket" },
        { name: "ZipRecruiter", logo: "Mail" },
        { name: "Monster", logo: "Globe" }
      ]
    },
    {
      category: "Educational Partners",
      description: "Collaborating with leading institutions to support student career success",
      logos: [
        { name: "Stanford Career Center", logo: "GraduationCap" },
        { name: "MIT Career Services", logo: "BookOpen" },
        { name: "Harvard Business School", logo: "Building" },
        { name: "UC Berkeley", logo: "School" },
        { name: "Carnegie Mellon", logo: "Cpu" },
        { name: "Georgia Tech", logo: "Code" }
      ]
    },
    {
      category: "Career Service Partners",
      description: "Working with professional organizations to expand career development access",
      logos: [
        { name: "National Career Development Association", logo: "Users" },
        { name: "Society for Human Resource Management", logo: "UserCheck" },
        { name: "Career Thought Leaders", logo: "Lightbulb" },
        { name: "International Coach Federation", logo: "Award" },
        { name: "National Association of Colleges", logo: "School2" },
        { name: "Career Services Network", logo: "Network" }
      ]
    }
  ];

  const mediaLogos = [
    { name: "TechCrunch", icon: "Newspaper" },
    { name: "Forbes", icon: "DollarSign" },
    { name: "Harvard Business Review", icon: "BookOpen" },
    { name: "Fast Company", icon: "Zap" },
    { name: "The Wall Street Journal", icon: "TrendingUp" },
    { name: "Wired", icon: "Wifi" },
    { name: "VentureBeat", icon: "Rocket" },
    { name: "HR Executive", icon: "Users" }
  ];

  const testimonials = [
    {
      quote: "ResumeAI Pro has become an essential tool in our career services toolkit. The AI insights help our students present their experiences more effectively to employers.",
      author: "Dr. Sarah Mitchell",
      role: "Director of Career Services",
      organization: "Stanford University",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      quote: "The integration with our ATS has streamlined our hiring process while helping candidates better showcase their qualifications. It's a win-win for everyone.",
      author: "Michael Torres",
      role: "VP of Talent Acquisition",
      organization: "Salesforce",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    },
    {
      quote: "As a career coach, I've seen firsthand how ResumeAI Pro transforms how professionals present themselves. The results speak for themselves.",
      author: "Jennifer Walsh",
      role: "Executive Career Coach",
      organization: "Career Strategy Institute",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Handshake" size={20} color="var(--color-trust)" />
            <span className="text-sm font-medium text-trust">Partnerships</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Trusted by Industry
            <span className="text-gradient block">Leaders Worldwide</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We collaborate with leading organizations, educational institutions, and technology partners to create a comprehensive career advancement ecosystem.
          </p>
        </div>

        <div className="space-y-16">
          {partners?.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl p-8 lg:p-12 shadow-brand border border-border/50">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {category?.category}
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {category?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {category?.logos?.map((partner, index) => (
                  <div key={index} className="group text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/5 to-trust/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-brand transition-all duration-300 group-hover:scale-105 border border-border/30">
                      <Icon name={partner?.logo} size={24} color="var(--color-primary)" />
                    </div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {partner?.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-primary/5 to-trust/5 rounded-2xl p-8 lg:p-12 border border-primary/10">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Featured In Leading Publications
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our innovation and impact have been recognized by top business and technology publications worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-12">
            {mediaLogos?.map((media, index) => (
              <div key={index} className="group text-center">
                <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-white transition-all duration-300 border border-white/20">
                  <Icon name={media?.icon} size={20} color="var(--color-primary)" />
                </div>
                <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {media?.name}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white/30 rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Quote" size={20} color="var(--color-primary)" />
              <span className="text-sm font-medium text-primary">Recent Coverage</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  "Revolutionary AI technology that's changing how professionals approach career advancement"
                </p>
                <p className="text-xs font-medium text-primary">- TechCrunch</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  "The future of resume optimization is here, and it's more intelligent than ever"
                </p>
                <p className="text-xs font-medium text-primary">- Forbes</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  "A game-changer for job seekers in an increasingly competitive market"
                </p>
                <p className="text-xs font-medium text-primary">- Harvard Business Review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 lg:p-12 shadow-brand border border-border/50">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              What Our Partners Say
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from the organizations and professionals who work with us to advance careers worldwide.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => (
              <div key={index} className="bg-secondary/30 rounded-xl p-6 border border-border/30">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={16} color="var(--color-warning)" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial?.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial?.image} 
                    alt={testimonial?.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial?.author}
                    </h4>
                    <p className="text-sm text-primary">
                      {testimonial?.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial?.organization}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-2xl p-8 border border-accent/10 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Interested in Partnership?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We're always looking for innovative partners who share our mission of democratizing career advancement. Whether you're an educational institution, technology company, or career services organization, let's explore how we can work together.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon name="School" size={20} color="var(--color-accent)" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Educational Institutions</h4>
                <p className="text-sm text-muted-foreground">Career services partnerships and student success programs</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon name="Code" size={20} color="var(--color-trust)" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Technology Partners</h4>
                <p className="text-sm text-muted-foreground">API integrations and platform collaborations</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon name="Users" size={20} color="var(--color-primary)" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Enterprise Clients</h4>
                <p className="text-sm text-muted-foreground">Internal mobility and talent development solutions</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Mail" size={16} />
              <span>partnerships@resumeaipro.com • Response within 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipsSection;