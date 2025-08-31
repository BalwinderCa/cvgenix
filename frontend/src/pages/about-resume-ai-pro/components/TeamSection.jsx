import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      credentials: "Former Google Recruiter, 12 years",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: "Led technical recruiting at Google, hired 500+ engineers. Recognized the gap between what recruiters actually look for and what traditional resume tools provide.",
      linkedin: true
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      credentials: "Ex-LinkedIn Data Scientist, PhD AI",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Built recommendation systems at LinkedIn. Developed the core AI algorithms that power our resume optimization and job matching technology.",
      linkedin: true
    },
    {
      name: "Dr. Amanda Foster",
      role: "Head of Career Intelligence",
      credentials: "Certified Career Coach, 15 years HR",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Former VP of Talent at Fortune 500 companies. Brings deep understanding of hiring processes across industries and company sizes.",
      linkedin: true
    },
    {
      name: "James Park",
      role: "Head of Product",
      credentials: "Ex-Microsoft PM, UX Design Expert",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Led product teams at Microsoft Office. Focuses on making complex AI insights accessible through intuitive user experiences.",
      linkedin: true
    }
  ];

  const advisors = [
    {
      name: "Jennifer Walsh",
      role: "Strategic Advisor",
      company: "Former CHRO at Salesforce",
      expertise: "Enterprise Talent Strategy"
    },
    {
      name: "David Kim",
      role: "Technical Advisor",
      company: "AI Research Director at Stanford",
      expertise: "Machine Learning & NLP"
    },
    {
      name: "Lisa Thompson",
      role: "Industry Advisor",
      company: "Founder, Career Coaching Institute",
      expertise: "Career Development & Training"
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Users" size={20} color="var(--color-trust)" />
            <span className="text-sm font-medium text-trust">Our Team</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Built by Career Experts &
            <span className="text-gradient block">AI Pioneers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our founding team combines decades of recruiting experience from top tech companies with cutting-edge AI expertise to create tools that actually work in today's job market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {teamMembers?.map((member, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-xl p-6 shadow-brand border border-border/50 text-center hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative mb-6">
                  <Image 
                    src={member?.image} 
                    alt={member?.name} 
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary/10"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-white">
                    <Icon name="Award" size={14} color="white" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {member?.name}
                </h3>
                <p className="text-sm font-medium text-primary mb-2">
                  {member?.role}
                </p>
                <p className="text-xs text-accent mb-4 font-medium">
                  {member?.credentials}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {member?.bio}
                </p>
                
                {member?.linkedin && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-trust/10 rounded-full flex items-center justify-center hover:bg-trust/20 transition-colors cursor-pointer">
                      <Icon name="Linkedin" size={16} color="var(--color-trust)" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-brand border border-border/50">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Strategic Advisors
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're guided by industry leaders who bring deep expertise in talent acquisition, AI research, and career development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {advisors?.map((advisor, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Star" size={24} color="var(--color-primary)" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  {advisor?.name}
                </h4>
                <p className="text-sm text-primary mb-2">
                  {advisor?.role}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {advisor?.company}
                </p>
                <div className="inline-flex items-center space-x-1 text-xs text-accent bg-accent/10 px-3 py-1 rounded-full">
                  <Icon name="Briefcase" size={12} />
                  <span>{advisor?.expertise}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/5 to-trust/5 px-6 py-3 rounded-full border border-primary/10">
            <Icon name="MapPin" size={16} color="var(--color-primary)" />
            <span className="text-sm text-foreground">
              <strong>Headquartered in San Francisco</strong> • Remote-first team across 12 countries
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;