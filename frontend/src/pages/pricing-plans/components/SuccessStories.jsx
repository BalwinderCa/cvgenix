import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const SuccessStories = () => {
  const stories = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Recent Graduate → Software Engineer",
      company: "Google",
      plan: "Professional",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      story: `As a recent CS graduate, I was struggling to get interviews. The Professional plan's AI optimization helped me highlight my projects effectively. Within 2 weeks, I had 5 interviews and landed my dream job at Google.`,
      metrics: {
        responseRate: "340%",
        timeToHire: "2 weeks",
        salaryIncrease: "$95,000"
      },
      beforeAfter: {
        before: "2 responses from 50 applications",
        after: "15 responses from 25 applications"
      }
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Marketing Manager → VP Marketing",
      company: "TechCorp",
      plan: "Career Accelerator",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      story: `The Career Accelerator's market insights showed me exactly what skills VPs needed. The salary data helped me negotiate 23% above their initial offer. The interview prep was invaluable for executive-level questions.`,
      metrics: {
        responseRate: "280%",
        timeToHire: "3 weeks",
        salaryIncrease: "$45,000"
      },
      beforeAfter: {
        before: "Stuck at manager level for 3 years",
        after: "Promoted to VP with 23% salary increase"
      }
    },
    {
      id: 3,
      name: "Jennifer Park",
      role: "Career Changer → UX Designer",
      company: "Spotify",
      plan: "Professional",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      story: `Transitioning from finance to UX seemed impossible. The Professional plan helped me reframe my analytical skills for design roles. The ATS scoring ensured my resume got past the initial filters.`,
      metrics: {
        responseRate: "420%",
        timeToHire: "6 weeks",
        salaryIncrease: "$25,000"
      },
      beforeAfter: {
        before: "0 UX interviews in 4 months",
        after: "8 UX interviews, 3 offers"
      }
    }
  ];

  return (
    <div className="bg-gradient-to-br from-surface/50 to-background py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Real Success Stories by Plan
          </h2>
          <p className="text-muted-foreground text-lg">
            See how different professionals achieved their career goals
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {stories?.map((story) => (
            <div key={story?.id} className="bg-background rounded-2xl border border-border hover:shadow-brand-lg transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <Image 
                      src={story?.avatar} 
                      alt={story?.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {story?.plan}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{story?.name}</h4>
                    <p className="text-muted-foreground text-sm">{story?.role}</p>
                    <p className="text-primary text-sm font-medium">{story?.company}</p>
                  </div>
                </div>

                <blockquote className="text-muted-foreground italic mb-6 leading-relaxed">
                  "{story?.story}"
                </blockquote>

                <div className="space-y-4 mb-6">
                  <div className="bg-surface rounded-lg p-4">
                    <h5 className="font-semibold text-foreground mb-3 text-sm">Key Results:</h5>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          +{story?.metrics?.responseRate}
                        </div>
                        <div className="text-xs text-muted-foreground">Response Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          {story?.metrics?.timeToHire}
                        </div>
                        <div className="text-xs text-muted-foreground">Time to Hire</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          +{story?.metrics?.salaryIncrease}
                        </div>
                        <div className="text-xs text-muted-foreground">Salary Boost</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-error/10 to-accent/10 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Icon name="TrendingDown" size={16} color="var(--color-error)" />
                        <span className="text-error font-medium">Before:</span>
                      </div>
                      <span className="text-muted-foreground">{story?.beforeAfter?.before}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="TrendingUp" size={16} color="var(--color-accent)" />
                        <span className="text-accent font-medium">After:</span>
                      </div>
                      <span className="text-foreground font-medium">{story?.beforeAfter?.after}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-1 text-warning">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={16} color="var(--color-warning)" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;