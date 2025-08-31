import React from 'react';
import Icon from '../../../components/AppIcon';

const ImpactSection = () => {
  const impactMetrics = [
    {
      icon: "TrendingUp",
      value: "$2.4B+",
      label: "Total Salary Increases",
      description: "Generated for our users across all industries",
      color: "accent"
    },
    {
      icon: "Users",
      value: "2.1M+",
      label: "Professionals Helped",
      description: "From entry-level to C-suite executives",
      color: "primary"
    },
    {
      icon: "Calendar",
      value: "847K+",
      label: "Interviews Secured",
      description: "Average 340% increase in callback rates",
      color: "trust"
    },
    {
      icon: "Award",
      value: "156K+",
      label: "Career Transitions",
      description: "Successful role changes and promotions",
      color: "accent"
    }
  ];

  const successStories = [
    {
      name: "Maria Santos",
      role: "Software Engineer → Senior Product Manager",
      company: "Google",
      increase: "+$45K salary",
      story: "ResumeAI Pro helped me transition from engineering to product management by highlighting my technical leadership experience in a way that resonated with PM hiring managers.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "David Chen",
      role: "Marketing Coordinator → Director of Growth",
      company: "Stripe",
      increase: "+$65K salary",
      story: "The AI identified gaps in how I was presenting my growth metrics. After optimization, I went from 2% response rate to 28% and landed my dream role.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Jennifer Park",
      role: "Recent Graduate → Data Scientist",
      company: "Netflix",
      increase: "+$38K vs peers",
      story: "As a new grad, I was struggling to stand out. The platform helped me showcase my projects and internship impact in ways that caught recruiters' attention immediately.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const industryBreakdown = [
    { industry: "Technology", percentage: 34, users: "714K" },
    { industry: "Finance", percentage: 18, users: "378K" },
    { industry: "Healthcare", percentage: 15, users: "315K" },
    { industry: "Consulting", percentage: 12, users: "252K" },
    { industry: "Marketing", percentage: 11, users: "231K" },
    { industry: "Other", percentage: 10, users: "210K" }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="BarChart3" size={20} color="var(--color-accent)" />
            <span className="text-sm font-medium text-accent">Our Impact</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Real Results for
            <span className="text-gradient block">Real Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            These aren't vanity metrics. Every number represents a professional who advanced their career, secured better opportunities, and achieved their goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {impactMetrics?.map((metric, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-xl p-8 shadow-brand border border-border/50 text-center hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 bg-gradient-to-br from-${metric?.color}/10 to-${metric?.color}/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon name={metric?.icon} size={28} color={`var(--color-${metric?.color})`} />
                </div>
                <div className={`text-3xl font-bold text-${metric?.color} mb-2`}>
                  {metric?.value}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {metric?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {metric?.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-brand border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Success Stories
            </h3>
            <div className="space-y-6">
              {successStories?.map((story, index) => (
                <div key={index} className="border-b border-border/30 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={story?.image} 
                      alt={story?.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {story?.name}
                        </h4>
                        <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded-full">
                          {story?.increase}
                        </span>
                      </div>
                      <p className="text-sm text-primary font-medium mb-2">
                        {story?.role} at {story?.company}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        "{story?.story}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-brand border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Industry Breakdown
            </h3>
            <div className="space-y-4">
              {industryBreakdown?.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                      {item?.industry}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {item?.users} users
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {item?.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-trust h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${item?.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-accent/5 rounded-lg p-4 border border-accent/10">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} color="var(--color-accent)" />
                <span className="text-sm font-semibold text-accent">
                  Growth Trend
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                45% month-over-month growth in new user registrations across all industries, with highest growth in healthcare and consulting sectors.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-trust/5 rounded-2xl p-8 lg:p-12 border border-primary/10 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
              Join the Success Stories
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Every day, professionals like you are using ResumeAI Pro to unlock better opportunities, negotiate higher salaries, and accelerate their careers. Your success story could be next.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/50 rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-primary mb-1">15 min</div>
                <div className="text-sm text-muted-foreground">Average time to optimize</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-accent mb-1">340%</div>
                <div className="text-sm text-muted-foreground">Increase in responses</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-trust mb-1">7 days</div>
                <div className="text-sm text-muted-foreground">Average to first interview</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Shield" size={16} />
              <span>Free to start • No credit card required • Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;