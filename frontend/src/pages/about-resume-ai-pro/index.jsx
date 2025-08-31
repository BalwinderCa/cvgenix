import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import MissionSection from './components/MissionSection';
import TeamSection from './components/TeamSection';
import TechnologySection from './components/TechnologySection';
import ImpactSection from './components/ImpactSection';
import TimelineSection from './components/TimelineSection';
import PartnershipsSection from './components/PartnershipsSection';
import Icon from '../../components/AppIcon';

const AboutResumeAIPro = () => {
  const currentYear = new Date()?.getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About ResumeAI Pro - Democratizing Career Advancement Through AI</title>
        <meta name="description" content="Learn about ResumeAI Pro's mission to democratize career advancement through intelligent AI technology. Meet our team of former recruiters and AI experts building the future of professional development." />
        <meta name="keywords" content="about resumeai pro, career advancement, ai resume optimization, team, mission, technology, impact" />
        <meta property="og:title" content="About ResumeAI Pro - Democratizing Career Advancement" />
        <meta property="og:description" content="Founded by career experts from Google and LinkedIn, ResumeAI Pro combines recruiting expertise with cutting-edge AI to help millions advance their careers." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/about-resume-ai-pro" />
      </Helmet>

      <Header />
      
      <main className="relative">
        <HeroSection />
        <MissionSection />
        <TeamSection />
        <TechnologySection />
        <ImpactSection />
        <TimelineSection />
        <PartnershipsSection />
        
        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-trust">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="text-white space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Join over 2 million professionals who've transformed their careers with ResumeAI Pro. 
                Your success story starts with a single click.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/95 transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2">
                  <Icon name="Sparkles" size={20} />
                  <span>Start Building Your Resume</span>
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                  <Icon name="Play" size={20} />
                  <span>Watch Demo</span>
                </button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-white/80">
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={16} />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} />
                  <span>15-minute setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Award" size={16} />
                  <span>340% more responses</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-trust rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={18} color="white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold">ResumeAI Pro</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                Democratizing career advancement through intelligent AI technology. 
                Your career deserves intelligent optimization.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Icon name="Twitter" size={16} />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Icon name="Linkedin" size={16} />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Icon name="Facebook" size={16} />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="/homepage" className="hover:text-white transition-colors">Resume Builder</a></li>
                <li><a href="/templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="/about-resume-ai-pro" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © {currentYear} ResumeAI Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <Icon name="Shield" size={14} />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <Icon name="Lock" size={14} />
                <span>GDPR Ready</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutResumeAIPro;