import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MetricsSection = () => {
  const metrics = [
    {
      value: "2.1M+",
      label: "Distinguished Professionals Served",
      description: "Executive-level career advancement across Fortune 500 companies",
      icon: "Users",
      color: "text-primary",
      image: "/assets/images/metrics/1.jpg"
    },
    {
      value: "94%",
      label: "Professional Success Rate",
      description: "Clients securing interviews within 60 days of service completion",
      icon: "TrendingUp",
      color: "text-success",
      image: "/assets/images/metrics/2.jpg"
    },
    {
      value: "280%",
      label: "Average Interview Increase",
      description: "Documented improvement in professional response rates",
      icon: "Award",
      color: "text-trust",
      image: "/assets/images/metrics/3.jpg"
    },
    {
      value: "15+",
      label: "Years of Professional Excellence",
      description: "Established expertise in executive resume development",
      icon: "Star",
      color: "text-accent",
      image: "/assets/images/metrics/4.jpg"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-surface border-t-2 border-b-2 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Professional Achievement Record
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            Established performance metrics demonstrating consistent professional excellence
            in executive career advancement and resume development services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {metrics?.map((metric, index) => (
            <div key={index} className="group">
              <div className="bg-card rounded-2xl min-h-[350px] md:min-h-[380px] overflow-hidden classic-border hover:shadow-brand-lg transition-all duration-300 transform group-hover:scale-105">
                {/* Metric Image */}
                <div className="relative h-[180px] md:h-[200px] overflow-hidden">
                  <Image
                    src={metric?.image}
                    alt={metric?.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  {/* Icon Overlay */}
                  <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 w-10 md:w-12 h-10 md:h-12 bg-background/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <Icon name={metric?.icon} size={20} className={metric?.color} />
                  </div>
                  {/* Value Overlay on Image */}
                  <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-background/95 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1">
                    <div className="text-base md:text-lg font-bold text-primary">
                      {metric?.value}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 text-center space-y-2 md:space-y-3">
                  <h3 className="text-base md:text-lg font-semibold text-foreground leading-tight">
                    {metric?.label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {metric?.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Certifications */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t-2 border-border text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-6 md:mb-8">
            Professional Certifications & Memberships
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-80">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Icon name="Award" size={18} className="text-primary" />
              <span className="font-semibold text-foreground text-sm md:text-base">CPRW Certified</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <Icon name="Shield" size={18} className="text-primary" />
              <span className="font-semibold text-foreground text-sm md:text-base">PARW/CC Member</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <Icon name="Star" size={18} className="text-primary" />
              <span className="font-semibold text-foreground text-sm md:text-base">NRWA Professional</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;