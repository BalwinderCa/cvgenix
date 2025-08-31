import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TemplatePreviewSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const templates = [
    {
      id: 1,
      name: "Modern Tech",
      atsScore: 95,
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop",
      description: "Clean, ATS-friendly design perfect for software engineers and developers",
      features: ["ATS Optimized", "Clean Layout", "Skills Section"],
      gradient: "from-blue-500 via-cyan-400 to-blue-600"
    },
    {
      id: 2,
      name: "Executive Pro",
      atsScore: 92,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=500&fit=crop",
      description: "Sophisticated template for C-level executives and senior management",
      features: ["Leadership Focus", "Achievement Highlights", "Professional"],
      gradient: "from-purple-500 via-violet-400 to-purple-600"
    },
    {
      id: 3,
      name: "Creative Edge",
      atsScore: 88,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=500&fit=crop",
      description: "Stand out template for designers, marketers, and creative professionals",
      features: ["Visual Appeal", "Portfolio Section", "Brand Colors"],
      gradient: "from-pink-500 via-rose-400 to-pink-600"
    },
    {
      id: 4,
      name: "Business Classic",
      atsScore: 94,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      description: "Traditional yet modern design for business professionals",
      features: ["Conservative Style", "Results Focused", "Industry Standard"],
      gradient: "from-emerald-500 via-green-400 to-emerald-600"
    },
    {
      id: 5,
      name: "Startup Innovator",
      atsScore: 91,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop",
      description: "Dynamic template for startup employees and entrepreneurs",
      features: ["Innovation Focus", "Growth Metrics", "Adaptable"],
      gradient: "from-orange-500 via-amber-400 to-orange-600"
    },
    {
      id: 6,
      name: "Minimalist Pro",
      atsScore: 96,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=500&fit=crop",
      description: "Ultra-clean design that works across all industries",
      features: ["Maximum ATS Score", "Universal Design", "Easy Customization"],
      gradient: "from-slate-500 via-gray-400 to-slate-600"
    }
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % templates?.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + templates?.length) % templates?.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-accent';
    if (score >= 90) return 'text-success';
    if (score >= 85) return 'text-warning';
    return 'text-error';
  };

  const getScoreBg = (score) => {
    if (score >= 95) return 'bg-accent/20';
    if (score >= 90) return 'bg-success/20';
    if (score >= 85) return 'bg-warning/20';
    return 'bg-error/20';
  };

  const slideVariants = {
    hiddenRight: {
      x: '100%',
      opacity: 0,
    },
    hiddenLeft: {
      x: '-100%',
      opacity: 0,
    },
    visible: {
      x: '0',
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exitRight: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exitLeft: {
      x: '-100%',
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
  };

  const currentTemplate = templates?.[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-trust/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Professional Templates That Get Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our collection of ATS-optimized templates designed by career experts and tested with real hiring managers.
          </p>
        </div>

        {/* Single Template Slider */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white/100 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 group"
          >
            <Icon name="ChevronLeft" size={24} className="text-primary group-hover:text-accent transition-colors duration-300" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white/100 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 group"
          >
            <Icon name="ChevronRight" size={24} className="text-primary group-hover:text-accent transition-colors duration-300" />
          </button>

          {/* Template Display */}
          <div className="relative h-96 md:h-[500px] mx-16">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
                animate="visible"
                exit={direction > 0 ? "exitLeft" : "exitRight"}
                className="absolute inset-0 w-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                  {/* Template Image */}
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src={currentTemplate?.image}
                      alt={currentTemplate?.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentTemplate?.gradient} opacity-20`}></div>
                    
                    {/* ATS Score Badge */}
                    <div className={`absolute top-6 right-6 ${getScoreBg(currentTemplate?.atsScore)} backdrop-blur-sm rounded-full px-4 py-2`}>
                      <div className="flex items-center space-x-2">
                        <Icon name="Shield" size={18} className={getScoreColor(currentTemplate?.atsScore)} />
                        <span className={`text-sm font-bold ${getScoreColor(currentTemplate?.atsScore)}`}>
                          {currentTemplate?.atsScore}%
                        </span>
                      </div>
                    </div>

                    {/* Preview Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        variant="default" 
                        size="lg" 
                        className="btn-gradient transform hover:scale-105"
                        iconName="Eye"
                        iconPosition="left"
                      >
                        Preview Template
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="flex flex-col justify-center space-y-6 p-8">
                    <div>
                      <h3 className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r ${currentTemplate?.gradient} bg-clip-text text-transparent`}>
                        {currentTemplate?.name}
                      </h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {currentTemplate?.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-lg">Key Features:</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {currentTemplate?.features?.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 bg-surface/50 rounded-lg p-3 hover:bg-surface/80 transition-colors duration-300"
                          >
                            <Icon name="Check" size={18} className="text-success flex-shrink-0" />
                            <span className="text-foreground font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ATS Score Details */}
                    <div className="bg-gradient-to-r from-surface/50 to-surface/30 rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon name="Target" size={20} className="text-muted-foreground" />
                          <span className="text-foreground font-semibold">ATS Compatibility</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-surface rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full bg-gradient-to-r ${
                                currentTemplate?.atsScore >= 95 ? 'from-accent to-success' :
                                currentTemplate?.atsScore >= 90 ? 'from-success to-warning': 'from-warning to-error'
                              }`}
                              style={{width: `${currentTemplate?.atsScore}%`}}
                            ></div>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(currentTemplate?.atsScore)}`}>
                            {currentTemplate?.atsScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {templates?.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? `bg-gradient-to-r ${currentTemplate?.gradient} scale-125` 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-trust/10 rounded-2xl p-8 border border-primary/20 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-gradient mb-4">
              Ready to Choose Your Perfect Template?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-lg">
              All templates are fully customizable and optimized for ATS systems. Start building your professional resume in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="btn-gradient transform hover:scale-105"
                iconName="FileText"
                iconPosition="left"
              >
                Browse All Templates
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-accent text-accent hover:bg-accent hover:text-white transform hover:scale-105"
                iconName="Sparkles"
                iconPosition="left"
              >
                Get AI Recommendations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplatePreviewSection;