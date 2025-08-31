import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const roleHeadlines = [
    "Advance your professional career",
    "Secure executive opportunities",
    "Build lasting career success"
  ];

  // Resume template images for 3D scene
  const resumeTemplates = [
    {
      id: 1,
      title: "Executive Professional",
      category: "Executive",
      image: "https://www.myperfectresume.com/wp-content/uploads/2025/06/dishwasher-resume-template-modern-blue.svg",
      rotation: 0,
      zIndex: 30
    },
    {
      id: 2,
      title: "Healthcare Professional",
      category: "Healthcare",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/medical-assistant-resume-template.svg",
      rotation: -5,
      zIndex: 25
    },
    {
      id: 3,
      title: "Tech Developer",
      category: "Technology",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/java-developer-resume-template.svg",
      rotation: 8,
      zIndex: 20
    },
    {
      id: 4,
      title: "Administrative Pro",
      category: "Administrative",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/administrative-assistant-resume-template.svg",
      rotation: -3,
      zIndex: 15
    },
    {
      id: 5,
      title: "Brand Manager",
      category: "Marketing",
      image: "https://www.myperfectresume.com/wp-content/uploads/2024/02/brand-manager-resume-template.svg",
      rotation: 12,
      zIndex: 10
    },
  ];

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setMousePosition({
        x: (clientX - centerX) / 50,
        y: (clientY - centerY) / 50
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const currentRole = roleHeadlines?.[currentRoleIndex];
    let timeoutId;

    if (isTyping) {
      if (displayText?.length < currentRole?.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentRole?.slice(0, displayText?.length + 1));
        }, 120); // Slower, more dignified typing
      } else {
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 3000); // Longer pause for readability
      }
    } else {
      if (displayText?.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText?.slice(0, -1));
        }, 80);
      } else {
        setCurrentRoleIndex((prev) => (prev + 1) % roleHeadlines?.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isTyping, currentRoleIndex, roleHeadlines]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Traditional Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-none"></div>
        <div className="absolute top-60 right-40 w-24 h-24 bg-trust rounded-none"></div>
        <div className="absolute bottom-40 left-1/2 w-28 h-28 bg-accent rounded-none"></div>
      </div>

      <div className="relative z-10  w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-screen py-12 lg:py-0">

          {/* Left side - Content */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12 text-center lg:text-left">
            {/* Classic Professional Headline */}
            <div className="space-y-6 md:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                <span className="text-gradient block mb-3 md:mb-4">Professional Resume Excellence</span>
                <span className="relative inline-block min-h-[1.2em] text-trust text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                  {displayText}
                  <span className="opacity-70">|</span>
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Establish your professional credentials with expertly crafted resumes that demonstrate competence,
                reliability, and career progression to discerning hiring managers and executive search firms.
              </p>
            </div>

            {/* Traditional CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4 md:pt-8">
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto text-base md:text-lg px-6 md:px-10 py-3 md:py-4 font-semibold font-poppins bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                iconName="FileText"
                iconPosition="left"
              >
                Start Building Resume Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base md:text-lg px-6 md:px-10 py-3 md:py-4 font-semibold font-dm-sans border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                iconName="Upload"
                iconPosition="left"
              >
                Import Existing Resume
              </Button>
            </div>

            {/* Professional Statistics */}
            <div className="pt-8 md:pt-12 border-t-2 border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center lg:text-left space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary font-space-grotesk">94%</div>
                  <div className="text-sm text-muted-foreground font-medium font-work-sans">Professional Success Rate</div>
                </div>
                <div className="text-center lg:text-left space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary font-space-grotesk">2.1M+</div>
                  <div className="text-sm text-muted-foreground font-medium font-work-sans">Executives Served</div>
                </div>
                <div className="text-center lg:text-left space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary font-space-grotesk">15+</div>
                  <div className="text-sm text-muted-foreground font-medium font-work-sans">Years Experience</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - CSS 3D Resume Scene */}
          <div className="lg:col-span-5 hidden lg:block">
            <div
              className="relative perspective-1000"
              style={{
                transform: `translateY(${mousePosition.y * 0.3}px) rotateX(${mousePosition.y * 0.1}deg)`,
              }}
            >

              <div className="relative w-full h-[500px] xl:h-[600px] preserve-3d">

                {/* Multiple 3D Resume Templates */}
                {resumeTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className="absolute preserve-3d cursor-pointer group"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `translate(${mousePosition.x * (index + 1) * 0.5}px, ${mousePosition.y * (index + 1) * 0.5}px) rotate(${template.rotation}deg) translateZ(${index * 20}px)`,
                      zIndex: template.zIndex,
                      left: `${index * 12}px`,
                      top: `${index * 15}px`,
                    }}
                  >
                    {/* Resume Template Card */}
                    <div className="bg-background rounded-2xl shadow-brand hover:shadow-brand-lg border border-border/50 hover:border-primary/20 p-3 md:p-4 transform-gpu max-w-[280px] xl:max-w-xs transition-all duration-500 group-hover:scale-105">
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={template.image}
                          alt={template.title}
                          className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2">
                          <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
                            {template.category}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <h3 className="font-semibold text-foreground text-sm font-nunito">{template.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Floating Stats Cards */}
                <div
                  className="floating-card absolute -top-4 -right-4 bg-primary text-primary-foreground p-3 md:p-4 rounded-xl shadow-brand z-50"
                  style={{ transform: 'translateZ(100px)' }}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="Star" size={14} className="text-accent" />
                    <span className="font-semibold text-xs md:text-sm">4.9 Rating</span>
                  </div>
                </div>

                <div
                  className="floating-card floating-delay-1 absolute -bottom-4 -left-4 bg-surface border border-border p-3 md:p-4 rounded-xl shadow-brand z-50"
                  style={{ transform: 'translateZ(80px)' }}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="Download" size={14} className="text-success" />
                    <span className="font-semibold text-xs md:text-sm text-foreground">2.5k Downloads</span>
                  </div>
                </div>

                <div
                  className="floating-card floating-delay-2 absolute top-1/2 right-0 bg-accent text-accent-foreground p-2 md:p-3 rounded-xl shadow-brand z-40"
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="Eye" size={14} />
                    <span className="font-semibold text-xs">Live Preview</span>
                  </div>
                </div>

                {/* Background Elements */}
                <div
                  className="floating-bg absolute top-20 -right-20 w-24 md:w-32 h-24 md:h-32 bg-primary/20 rounded-full opacity-40 blur-xl"
                  style={{ transform: 'translateZ(-100px)' }}
                />

                <div
                  className="floating-bg floating-delay-1 absolute bottom-20 -left-20 w-32 md:w-40 h-32 md:h-40 bg-accent/20 rounded-full opacity-30 blur-xl"
                  style={{ transform: 'translateZ(-150px)' }}
                />
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Traditional Scroll Indicator */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2">
        <Icon name="ChevronDown" size={24} className="md:w-7 md:h-7 text-muted-foreground opacity-60" />
      </div>

      {/* Custom CSS for 3D effects */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }
        .floating-card {
          animation: float 4s ease-in-out infinite;
        }
        .floating-delay-1 {
          animation-delay: 1s;
        }
        .floating-delay-2 {
          animation-delay: 2s;
        }
        .floating-bg {
          animation: floatBg 8s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateZ(var(--z-index, 0)) rotate(0deg); }
          50% { transform: translateY(-10px) translateZ(var(--z-index, 0)) rotate(5deg); }
        }
        @keyframes floatBg {
          0% { transform: translateZ(var(--z-index, 0)) rotate(0deg) scale(1); }
          50% { transform: translateZ(var(--z-index, 0)) rotate(180deg) scale(1.2); }
          100% { transform: translateZ(var(--z-index, 0)) rotate(360deg) scale(1); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;