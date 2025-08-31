import React, { useRef, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CSS3DSection = () => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Resume template images
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

  const features = [
    {
      icon: "Sparkles",
      title: "AI-Powered",
      description: "Smart suggestions",
      color: "text-primary"
    },
    {
      icon: "Zap",
      title: "Lightning Fast",
      description: "Build in minutes",
      color: "text-accent"
    },
    {
      icon: "Target",
      title: "ATS Ready",
      description: "Pass all systems",
      color: "text-success"
    },
    {
      icon: "TrendingUp",
      title: "Career Growth",
      description: "Land dream jobs",
      color: "text-trust"
    }
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-background via-surface to-muted/20 overflow-hidden py-20"
    >
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">

          {/* Left side - Content */}
          <div
            className="space-y-8 z-10"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            }}
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Icon name="Sparkles" size={24} color="var(--color-accent)" />
                <span className="text-accent font-semibold text-sm uppercase tracking-wide">
                  Interactive Experience
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Experience the{' '}
                <span className="text-gradient">Future</span> of
                <br />
                Resume Building
              </h2>
            </div>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Create stunning, interactive resumes with our advanced 3D preview system.
              Watch your career come to life with real-time visualizations and professional templates.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-surface border border-border/50 rounded-xl p-4 hover:shadow-brand-lg transition-all duration-300 hover:scale-105 hover:border-primary/20 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon name={feature.icon} size={18} className={feature.color} />
                  </div>
                  <h3 className="text-foreground font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div>
              <Button
                variant="default"
                size="lg"
                className="font-semibold classic-border group"
              >
                <Icon name="FileText" size={18} className="mr-2" />
                Try Resume Builder
                <Icon name="ChevronRight" size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>

          {/* Right side - CSS 3D Resume Scene */}
          <div
            className="relative perspective-1000"
            style={{
              transform: `translateY(${mousePosition.y * 0.3}px) rotateX(${mousePosition.y * 0.1}deg)`,
            }}
          >
            <div className="relative w-full h-[600px] preserve-3d">

              {/* Multiple 3D Resume Templates */}
              {resumeTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="absolute preserve-3d cursor-pointer group"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translate(${mousePosition.x * (index + 1) * 0.5}px, ${mousePosition.y * (index + 1) * 0.5}px) rotate(${template.rotation}deg) translateZ(${index * 20}px)`,
                    zIndex: template.zIndex,
                    left: `${index * 15}px`,
                    top: `${index * 20}px`,
                  }}
                >
                  {/* Resume Template Card */}
                  <div className="bg-background rounded-2xl shadow-brand hover:shadow-brand-lg border border-border/50 hover:border-primary/20 p-4 transform-gpu max-w-xs transition-all duration-500 group-hover:scale-105">
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
                      <h3 className="font-semibold text-foreground text-sm">{template.title}</h3>
                    </div>
                  </div>
                </div>
              ))}

              {/* Floating Stats Cards */}
              <div
                className="floating-card absolute -top-4 -right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-brand z-50"
                style={{ transform: 'translateZ(100px)' }}
              >
                <div className="flex items-center space-x-2">
                  <Icon name="Star" size={16} className="text-accent" />
                  <span className="font-semibold text-sm">4.9 Rating</span>
                </div>
              </div>

              <div
                className="floating-card floating-delay-1 absolute -bottom-4 -left-4 bg-surface border border-border p-4 rounded-xl shadow-brand z-50"
                style={{ transform: 'translateZ(80px)' }}
              >
                <div className="flex items-center space-x-2">
                  <Icon name="Download" size={16} className="text-success" />
                  <span className="font-semibold text-sm text-foreground">2.5k Downloads</span>
                </div>
              </div>

              <div
                className="floating-card floating-delay-2 absolute top-1/2 right-0 bg-accent text-accent-foreground p-3 rounded-xl shadow-brand z-40"
                style={{ transform: 'translateZ(60px)' }}
              >
                <div className="flex items-center space-x-2">
                  <Icon name="Eye" size={16} />
                  <span className="font-semibold text-xs">Live Preview</span>
                </div>
              </div>

              {/* Background Elements */}
              <div
                className="floating-bg absolute top-20 -right-20 w-32 h-32 bg-primary/20 rounded-full opacity-40 blur-xl"
                style={{ transform: 'translateZ(-100px)' }}
              />

              <div
                className="floating-bg floating-delay-1 absolute bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full opacity-30 blur-xl"
                style={{ transform: 'translateZ(-150px)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for 3D effects */}
      <style>{`
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

export default CSS3DSection;
