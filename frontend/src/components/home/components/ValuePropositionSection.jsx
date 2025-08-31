import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ValuePropositionSection = () => {
  const features = [
    {
      icon: "Brain",
      title: "AI-Powered Optimization",
      description: "Our advanced AI analyzes job descriptions and optimizes your resume content to match exactly what employers are looking for.",
      benefits: [
        "Smart keyword integration",
        "Industry-specific language",
        "Achievement quantification",
        "Skills gap identification"
      ],
      gradient: "from-primary to-trust",
      image: "/assets/images/why-choose-us/1.jpg"
    },
    {
      icon: "Shield",
      title: "ATS Compatibility Scoring",
      description: "Get real-time ATS scores and detailed feedback to ensure your resume passes through applicant tracking systems.",
      benefits: [
        "Real-time ATS analysis",
        "Format optimization",
        "Parsing compatibility",
        "Score improvement tips"
      ],
      gradient: "from-accent to-success",
      image: "/assets/images/why-choose-us/2.jpg"
    },
    {
      icon: "Target",
      title: "Personalized Career Guidance",
      description: "Receive tailored career advice and strategic recommendations based on your experience level and target roles.",
      benefits: [
        "Role-specific templates",
        "Career transition support",
        "Interview preparation",
        "Salary negotiation tips"
      ],
      gradient: "from-warning to-accent",
      image: "/assets/images/why-choose-us/3.jpg"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 font-montserrat">
            Why Choose Resume4me?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-lato">
            Go beyond traditional resume builders with intelligent features that understand modern hiring practices and give you a competitive edge.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {features?.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-background rounded-2xl min-h-[550px] md:min-h-[600px] overflow-hidden shadow-brand hover:shadow-brand-lg transition-all duration-300 transform group-hover:scale-105 border border-border/50 hover:border-primary/20">
                {/* Feature Image */}
                <div className="relative h-40 md:h-48 overflow-hidden">
                  <Image
                    src={feature?.image}
                    alt={feature?.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  {/* Icon Overlay */}
                  <div className={`absolute top-3 md:top-4 left-3 md:left-4 w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br ${feature?.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon name={feature?.icon} size={20} color="white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-4 flex flex-col justify-between h-[calc(100%-10rem)] md:h-[calc(100%-12rem)]">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 font-space-grotesk">
                    {feature?.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-inter">
                    {feature?.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-2">
                    {feature?.benefits?.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="Check" size={12} className="text-accent" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-6 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300"
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-trust/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Career?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join over 2.3 million professionals who've accelerated their careers with AI-powered resume optimization.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="default"
                size="lg"
                className="btn-gradient"
                iconName="Rocket"
                iconPosition="left"
              >
                Start Building Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                iconName="Play"
                iconPosition="left"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;