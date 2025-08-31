import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStatusBanner, setShowStatusBanner] = useState(true);
  const { isAuthenticated, user, openLoginModal } = useAuth();

  useEffect(() => {
    const bannerDismissed = sessionStorage.getItem('statusBannerDismissed');
    if (bannerDismissed === 'true') {
      setShowStatusBanner(false);
    }
  }, []);

  const dismissBanner = () => {
    setShowStatusBanner(false);
    sessionStorage.setItem('statusBannerDismissed', 'true');
  };

  const navigationItems = [
    { name: 'Homepage', sectionId: 'home', icon: 'Home' },
    { name: 'Resume Templates', sectionId: 'templates', icon: 'FileText' },
    { name: 'Cover Letter', sectionId: 'cover-letter', icon: 'FileText' },
    { name: 'ATS Score', sectionId: 'ats-score', icon: 'Target' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-border shadow-brand">
      <div className="w-full">
        <div className="flex items-center justify-between h-20 px-8 lg:px-12">
          {/* Classic Professional Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-4 group cursor-pointer"
          >
            <img src="/logo.png" className="h-16 w-auto" alt="Resume4me" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gradient">Resume4me</span>
              <span className="text-sm text-muted-foreground">Executive Career Services</span>
            </div>
          </button>

          {/* Traditional Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <button
                key={item?.sectionId}
                onClick={() => scrollToSection(item?.sectionId)}
                className="flex items-center space-x-2 px-4 py-2 classic-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-surface border-transparent transition-colors"
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.name}</span>
              </button>
            ))}
          </nav>

          {/* Traditional Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Buy Me a Coffee Link */}
            <a
              href="https://www.buymeacoffee.com/resume4me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Icon name="Heart" size={16} />
              <span>Buy Me a Coffee</span>
            </a>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="font-semibold">
                  <Icon name="User" size={16} className="mr-2" />
                  My Account
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-semibold"
                onClick={openLoginModal}
              >
                <Icon name="LogIn" size={16} className="mr-2" />
                Sign/Login
              </Button>
            )}
            <Button variant="default" size="sm" className="font-semibold classic-border">
              <Icon name="FileText" size={16} className="mr-2" />
              Build My Resume
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 classic-border hover:bg-surface"
            aria-label="Toggle mobile menu"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* Traditional Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-border bg-background">
            <div className="px-6 py-4 space-y-3">
              {navigationItems?.map((item) => (
                <button
                  key={item?.sectionId}
                  onClick={() => scrollToSection(item?.sectionId)}
                  className="flex items-center space-x-3 px-4 py-3 classic-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-surface border-transparent transition-colors w-full text-left"
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.name}</span>
                </button>
              ))}

              <div className="pt-4 border-t-2 border-border space-y-3">
                {/* Buy Me a Coffee Link - Mobile */}
                <a
                  href="https://www.buymeacoffee.com/resume4me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full"
                >
                  <Icon name="Heart" size={16} />
                  <span>Buy Me a Coffee</span>
                </a>
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" fullWidth className="font-semibold">
                      <Icon name="User" size={16} className="mr-2" />
                      My Account
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    fullWidth 
                    className="font-semibold"
                    onClick={openLoginModal}
                  >
                    <Icon name="LogIn" size={16} className="mr-2" />
                    Sign/Login
                  </Button>
                )}
                <Button variant="default" size="sm" fullWidth className="font-semibold classic-border">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Build My Resume
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Professional Status Banner */}
      {showStatusBanner && (
        <div className="bg-surface border-b border-border">
          <div className="px-8 lg:px-12 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center space-x-4 text-sm flex-1">
                <Icon name="Award" size={16} color="var(--color-primary)" />
                <span className="text-primary font-semibold">Professional Notice:</span>
                <span className="text-muted-foreground font-medium">
                  1,847 executive resumes completed this quarter • Average 280% increase in interview requests
                </span>
                <div className="hidden sm:flex items-center space-x-2 ml-6">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-xs text-success font-semibold">Service Available</span>
                </div>
              </div>
              <button
                onClick={dismissBanner}
                className="ml-4 p-1 hover:bg-muted rounded-full transition-colors duration-200 bg-primary"
                aria-label="Dismiss banner"
              >
                <Icon name="X" size={16} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;