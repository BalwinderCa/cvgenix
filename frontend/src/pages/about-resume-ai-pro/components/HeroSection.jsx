import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-trust/5 pt-32 pb-16">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2e8f0%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-accent">Our Story</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Democratizing Career
                <span className="text-gradient block">Advancement</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Born from the frustration of watching talented professionals struggle with outdated resume tools, ResumeAI Pro bridges the gap between traditional builders and modern hiring realities.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2M+</div>
                <div className="text-sm text-muted-foreground">Resumes Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">340%</div>
                <div className="text-sm text-muted-foreground">Avg Response Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-trust">$2.4B</div>
                <div className="text-sm text-muted-foreground">Salary Increases</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <Image 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" 
                  alt="Team member" 
                  className="w-10 h-10 rounded-full border-2 border-background"
                />
                <Image 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                  alt="Team member" 
                  className="w-10 h-10 rounded-full border-2 border-background"
                />
                <Image 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" 
                  alt="Team member" 
                  className="w-10 h-10 rounded-full border-2 border-background"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Trusted by professionals at 500+ companies
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-brand-lg p-8 border border-border/50">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Icon name="Sparkles" size={16} color="white" />
              </div>
              
              <Image 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                alt="Team collaboration at ResumeAI Pro" 
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Founded by Career Experts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our team combines decades of recruiting experience with cutting-edge AI technology to create tools that actually work in today's job market.
                </p>
                <div className="flex items-center space-x-2 text-sm text-accent">
                  <Icon name="Award" size={16} />
                  <span>Featured in 50+ career publications</span>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-trust/20 to-accent/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;