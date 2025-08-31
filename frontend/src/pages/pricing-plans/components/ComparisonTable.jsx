import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ComparisonTable = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      category: "Resume Building",
      items: [
        {
          name: "Resume Templates",
          free: "1 template",
          professional: "Unlimited templates",
          accelerator: "Unlimited + Premium designs",
          tooltip: "Access to professionally designed resume templates"
        },
        {
          name: "AI Content Optimization",
          free: false,
          professional: true,
          accelerator: true,
          tooltip: "AI-powered suggestions to improve your resume content"
        },
        {
          name: "ATS Scoring",
          free: false,
          professional: true,
          accelerator: true,
          tooltip: "Real-time analysis of how well your resume passes ATS systems"
        },
        {
          name: "LinkedIn Integration",
          free: false,
          professional: true,
          accelerator: true,
          tooltip: "Import and enhance your LinkedIn profile data"
        }
      ]
    },
    {
      category: "Career Intelligence",
      items: [
        {
          name: "Market Insights",
          free: false,
          professional: false,
          accelerator: true,
          tooltip: "Industry trends and job market analysis"
        },
        {
          name: "Salary Data",
          free: false,
          professional: false,
          accelerator: true,
          tooltip: "Comprehensive salary benchmarking for your role and location"
        },
        {
          name: "Skills Gap Analysis",
          free: false,
          professional: false,
          accelerator: true,
          tooltip: "Identify missing skills for your target roles"
        },
        {
          name: "Interview Preparation",
          free: false,
          professional: false,
          accelerator: true,
          tooltip: "AI-powered interview questions and preparation tools"
        }
      ]
    },
    {
      category: "Support & Features",
      items: [
        {
          name: "Export Formats",
          free: "PDF only",
          professional: "PDF, Word, HTML",
          accelerator: "All formats + Custom",
          tooltip: "Different file formats for various application needs"
        },
        {
          name: "Customer Support",
          free: "Community forum",
          professional: "Email support",
          accelerator: "Priority support + Phone",
          tooltip: "Level of customer support provided"
        },
        {
          name: "Resume Versions",
          free: "1 version",
          professional: "Unlimited versions",
          accelerator: "Unlimited + Version history",
          tooltip: "Number of resume versions you can maintain"
        }
      ]
    }
  ];

  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Icon name="Check" size={20} color="var(--color-accent)" strokeWidth={2.5} />
      ) : (
        <Icon name="X" size={20} color="var(--color-error)" strokeWidth={2.5} />
      );
    }
    return <span className="text-sm font-medium text-foreground">{value}</span>;
  };

  return (
    <div className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Compare All Features
          </h2>
          <p className="text-muted-foreground text-lg">
            See exactly what's included in each plan
          </p>
        </div>

        <div className="bg-surface rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary/5">
                  <th className="text-left p-6 font-semibold text-foreground">Features</th>
                  <th className="text-center p-6 font-semibold text-foreground">Free</th>
                  <th className="text-center p-6 font-semibold text-foreground">Professional</th>
                  <th className="text-center p-6 font-semibold text-foreground">Career Accelerator</th>
                </tr>
              </thead>
              <tbody>
                {features?.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="p-4">
                        <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                          {category?.category}
                        </h4>
                      </td>
                    </tr>
                    {category?.items?.map((feature, featureIndex) => (
                      <tr 
                        key={featureIndex}
                        className="border-b border-border hover:bg-muted/20 transition-colors duration-200"
                        onMouseEnter={() => setHoveredFeature(`${categoryIndex}-${featureIndex}`)}
                        onMouseLeave={() => setHoveredFeature(null)}
                      >
                        <td className="p-6">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">{feature?.name}</span>
                            <Icon name="Info" size={16} color="var(--color-muted-foreground)" />
                          </div>
                          {hoveredFeature === `${categoryIndex}-${featureIndex}` && feature?.tooltip && (
                            <div className="mt-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                              <p className="text-sm text-muted-foreground">{feature?.tooltip}</p>
                            </div>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {renderFeatureValue(feature?.free)}
                        </td>
                        <td className="p-6 text-center">
                          {renderFeatureValue(feature?.professional)}
                        </td>
                        <td className="p-6 text-center">
                          {renderFeatureValue(feature?.accelerator)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;