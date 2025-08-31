import React from 'react';
import Icon from '../../../components/AppIcon';

const TimelineSection = () => {
  const milestones = [
    {
      year: "2021",
      quarter: "Q3",
      title: "Company Founded",
      description: "Sarah and Marcus identified the gap between traditional resume tools and modern hiring practices while recruiting at Google and LinkedIn.",
      icon: "Lightbulb",
      metrics: "Initial concept validation with 50 beta users"
    },
    {
      year: "2022",
      quarter: "Q1",
      title: "MVP Launch",
      description: "First version of AI-powered resume optimization launched with basic ATS scoring and template recommendations.",
      icon: "Rocket",
      metrics: "1,000 users in first month"
    },
    {
      year: "2022",
      quarter: "Q3",
      title: "Series A Funding",
      description: "Raised $12M Series A led by Andreessen Horowitz to accelerate AI development and expand team.",
      icon: "TrendingUp",
      metrics: "$12M raised • 50,000 active users"
    },
    {
      year: "2023",
      quarter: "Q1",
      title: "AI Engine 2.0",
      description: "Launched advanced machine learning models trained on 500K+ successful resume-to-hire outcomes.",
      icon: "Brain",
      metrics: "87% accuracy in predicting interview callbacks"
    },
    {
      year: "2023",
      quarter: "Q4",
      title: "1 Million Users",
      description: "Reached 1 million registered users with 340% average increase in interview response rates.",
      icon: "Users",
      metrics: "1M+ users • $500M+ in salary increases generated"
    },
    {
      year: "2024",
      quarter: "Q2",
      title: "Enterprise Launch",
      description: "Launched ResumeAI Pro for Teams, helping companies optimize internal mobility and talent development.",
      icon: "Building",
      metrics: "200+ enterprise clients including Fortune 500"
    },
    {
      year: "2024",
      quarter: "Q4",
      title: "Global Expansion",
      description: "Expanded to 15 countries with localized AI models for different job markets and hiring practices.",
      icon: "Globe",
      metrics: "2.1M+ users • 50+ languages supported"
    },
    {
      year: "2025",
      quarter: "Q1",
      title: "AI Career Coach",
      description: "Currently developing next-generation AI career coaching with personalized career path recommendations.",
      icon: "Sparkles",
      metrics: "Beta testing with 10,000 users",
      upcoming: true
    }
  ];

  const awards = [
    {
      year: "2023",
      award: "Best AI Innovation",
      organization: "HR Tech Awards",
      description: "Recognized for breakthrough AI technology in talent acquisition"
    },
    {
      year: "2023",
      award: "Top 50 Startups",
      organization: "Forbes",
      description: "Featured in Forbes\' list of most promising career tech startups"
    },
    {
      year: "2024",
      award: "Product of the Year",
      organization: "Career Development Association",
      description: "Awarded for significant impact on career advancement accessibility"
    },
    {
      year: "2024",
      award: "Fast Company Most Innovative",
      organization: "Fast Company",
      description: "Listed among most innovative companies in AI and future of work"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Clock" size={20} color="var(--color-primary)" />
            <span className="text-sm font-medium text-primary">Our Journey</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Building the Future of
            <span className="text-gradient block">Career Advancement</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From a simple idea to helping millions of professionals worldwide, here's how we've grown and evolved to meet the changing needs of the modern job market.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-trust to-accent hidden md:block"></div>

          <div className="space-y-12">
            {milestones?.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-8">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone?.upcoming 
                      ? 'bg-gradient-to-br from-accent/20 to-trust/20 border-2 border-accent/30' :'bg-gradient-to-br from-primary to-trust shadow-brand'
                  }`}>
                    <Icon 
                      name={milestone?.icon} 
                      size={24} 
                      color={milestone?.upcoming ? "var(--color-accent)" : "white"} 
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-12">
                    <div className={`bg-white rounded-xl p-8 shadow-brand border ${
                      milestone?.upcoming ? 'border-accent/20 bg-accent/5' : 'border-border/50'
                    }`}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          milestone?.upcoming 
                            ? 'bg-accent/10 text-accent' :'bg-primary/10 text-primary'
                        }`}>
                          {milestone?.year} {milestone?.quarter}
                        </div>
                        {milestone?.upcoming && (
                          <div className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-medium">
                            Coming Soon
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {milestone?.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {milestone?.description}
                      </p>
                      
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        milestone?.upcoming 
                          ? 'bg-accent/10 text-accent' :'bg-trust/10 text-trust'
                      }`}>
                        <Icon name="BarChart3" size={16} />
                        <span>{milestone?.metrics}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-r from-primary/5 to-trust/5 rounded-2xl p-8 lg:p-12 border border-primary/10">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Recognition & Awards
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to innovation and user success has been recognized by leading industry organizations and publications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {awards?.map((award, index) => (
              <div key={index} className="bg-white/50 rounded-xl p-6 border border-white/20 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Award" size={20} color="var(--color-primary)" />
                </div>
                <div className="text-sm font-medium text-primary mb-1">
                  {award?.year}
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {award?.award}
                </h4>
                <p className="text-sm font-medium text-trust mb-3">
                  {award?.organization}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {award?.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-brand border border-border/50 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              What's Next?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We're just getting started. Our roadmap includes AI-powered interview preparation, salary negotiation coaching, and personalized career path recommendations. The future of career advancement is intelligent, accessible, and designed around your success.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon name="MessageSquare" size={20} color="var(--color-accent)" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">AI Interview Coach</h4>
                <p className="text-sm text-muted-foreground">Personalized interview preparation with real-time feedback</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-trust/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon name="DollarSign" size={20} color="var(--color-trust)" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Salary Intelligence</h4>
                <p className="text-sm text-muted-foreground">AI-powered salary benchmarking and negotiation strategies</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon name="Map" size={20} color="var(--color-primary)" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Career Pathfinder</h4>
                <p className="text-sm text-muted-foreground">Personalized career progression recommendations and skill gap analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;