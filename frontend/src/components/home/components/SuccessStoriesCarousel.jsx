import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessStoriesCarousel = () => {
  const [currentStory, setCurrentStory] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const successStories = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      salary: "$95K",
      responseRate: "340%",
      timeToHire: "3 weeks",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      quote: "Resume4me transformed my career search completely. The AI optimization helped me land interviews at companies I never thought would notice me.",
      beforeAfter: {
        before: {
          atsScore: 42,
          keywords: 8,
          responses: 5
        },
        after: {
          atsScore: 89,
          keywords: 24,
          responses: 22
        }
      },
      industry: "Technology"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Senior Developer",
      company: "InnovateLabs",
      salary: "$125K",
      responseRate: "280%",
      timeToHire: "2 weeks",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "The ATS optimization was a game-changer. I went from getting zero responses to having multiple offers within a month.",
      beforeAfter: {
        before: {
          atsScore: 38,
          keywords: 6,
          responses: 2
        },
        after: {
          atsScore: 92,
          keywords: 28,
          responses: 18
        }
      },
      industry: "Software Development"
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "Marketing Director",
      company: "BrandForward",
      salary: "$110K",
      responseRate: "420%",
      timeToHire: "4 weeks",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "Transitioning from sales to marketing seemed impossible until Resume4me helped me highlight my transferable skills perfectly.",
      beforeAfter: {
        before: {
          atsScore: 35,
          keywords: 4,
          responses: 3
        },
        after: {
          atsScore: 87,
          keywords: 22,
          responses: 19
        }
      },
      industry: "Marketing"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Financial Analyst",
      company: "WealthManagement Inc",
      salary: "$85K",
      responseRate: "310%",
      timeToHire: "5 weeks",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "The personalized career guidance helped me transition from accounting to financial analysis. The templates were perfectly tailored for finance roles.",
      beforeAfter: {
        before: {
          atsScore: 41,
          keywords: 7,
          responses: 4
        },
        after: {
          atsScore: 91,
          keywords: 26,
          responses: 17
        }
      },
      industry: "Finance"
    },
    {
      id: 5,
      name: "Jennifer Brooks",
      role: "HR Manager",
      company: "PeopleFirst Corp",
      salary: "$95K",
      responseRate: "390%",
      timeToHire: "3 weeks",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      quote: "As an HR professional, I was skeptical about AI-powered resumes. But the results speak for themselves - I landed my dream role in just 3 weeks.",
      beforeAfter: {
        before: {
          atsScore: 44,
          keywords: 9,
          responses: 6
        },
        after: {
          atsScore: 88,
          keywords: 23,
          responses: 21
        }
      },
      industry: "Human Resources"
    },
    {
      id: 6,
      name: "Alex Thompson",
      role: "Data Scientist",
      company: "DataTech Solutions",
      salary: "$135K",
      responseRate: "450%",
      timeToHire: "2 weeks",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      quote: "The AI optimization understood exactly how to present my technical skills. I received offers from three top tech companies within two weeks.",
      beforeAfter: {
        before: {
          atsScore: 39,
          keywords: 5,
          responses: 3
        },
        after: {
          atsScore: 94,
          keywords: 31,
          responses: 20
        }
      },
      industry: "Data Science"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories?.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, successStories?.length]);

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % successStories?.length);
    setIsAutoPlaying(false);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + successStories?.length) % successStories?.length);
    setIsAutoPlaying(false);
  };

  const goToStory = (index) => {
    setCurrentStory(index);
    setIsAutoPlaying(false);
  };

  const story = successStories?.[currentStory];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Real Success Stories
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            See how professionals transformed their careers with AI-powered optimization
          </p>
        </div>

        <div className="relative">
          {/* Main Story Card */}
          <div className="bg-background rounded-2xl shadow-brand-lg border border-border/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Story Content */}
              <div className="p-6 md:p-8 lg:p-12">
                <div className="space-y-4 md:space-y-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <img
                      src={story?.avatar}
                      alt={story?.name}
                      className="w-12 md:w-16 h-12 md:h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-foreground">
                        {story?.name}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {story?.role} at {story?.company}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs md:text-sm bg-accent/20 text-accent px-2 py-1 rounded-full">
                          {story?.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg text-foreground leading-relaxed italic">
                    "{story?.quote}"
                  </blockquote>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {story?.responseRate}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Response Rate Increase
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">
                        {story?.salary}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        New Salary
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {story?.timeToHire}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Time to Hire
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="bg-gradient-to-br from-primary/5 to-trust/5 p-8 lg:p-12">
                <h4 className="text-lg font-bold text-foreground mb-6 text-center">
                  Before vs After Resume4me
                </h4>

                <div className="space-y-6">
                  {/* ATS Score */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">ATS Score</span>
                      <span className="text-sm text-muted-foreground">
                        {story?.beforeAfter?.before?.atsScore} → {story?.beforeAfter?.after?.atsScore}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-surface rounded-full h-2">
                        <div
                          className="bg-error h-2 rounded-full"
                          style={{ width: `${story?.beforeAfter?.before?.atsScore}%` }}
                        ></div>
                      </div>
                      <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                      <div className="flex-1 bg-surface rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${story?.beforeAfter?.after?.atsScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">Relevant Keywords</span>
                      <span className="text-sm text-muted-foreground">
                        {story?.beforeAfter?.before?.keywords} → {story?.beforeAfter?.after?.keywords}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-error">
                          {story?.beforeAfter?.before?.keywords}
                        </div>
                        <div className="text-xs text-muted-foreground">Before</div>
                      </div>
                      <Icon name="TrendingUp" size={20} className="text-accent" />
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-accent">
                          {story?.beforeAfter?.after?.keywords}
                        </div>
                        <div className="text-xs text-muted-foreground">After</div>
                      </div>
                    </div>
                  </div>

                  {/* Responses */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">Weekly Responses</span>
                      <span className="text-sm text-muted-foreground">
                        {story?.beforeAfter?.before?.responses} → {story?.beforeAfter?.after?.responses}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-error">
                          {story?.beforeAfter?.before?.responses}
                        </div>
                        <div className="text-xs text-muted-foreground">Before</div>
                      </div>
                      <Icon name="Zap" size={20} className="text-accent" />
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-accent">
                          {story?.beforeAfter?.after?.responses}
                        </div>
                        <div className="text-xs text-muted-foreground">After</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStory}
              iconName="ChevronLeft"
              iconPosition="left"
            >
              Previous
            </Button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {successStories?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStory(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentStory
                    ? 'bg-primary scale-125' : 'bg-border hover:bg-primary/50'
                    }`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextStory}
              iconName="ChevronRight"
              iconPosition="right"
            >
              Next
            </Button>
          </div>

          {/* Auto-play Toggle */}
          <div className="text-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <Icon name={isAutoPlaying ? "Pause" : "Play"} size={14} />
              <span>{isAutoPlaying ? "Pause" : "Play"} Auto-rotation</span>
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            variant="default"
            size="lg"
            className="btn-gradient"
            iconName="UserPlus"
            iconPosition="left"
          >
            Join Our Success Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesCarousel;