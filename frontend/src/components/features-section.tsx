"use client";

import * as React from "react";
import {
  LayoutGrid,
  Columns3Cog,
  RectangleVertical,
  MonitorSmartphone,
  Proportions,
} from "lucide-react";

type FeatureIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export type FeatureItem = {
  title: string;
  description: string;
  icon: FeatureIcon;
};

export interface FeaturesSectionProps {
  title?: string;
  description?: string;
  items?: FeatureItem[];
  className?: string;
  style?: React.CSSProperties;
}

const defaultItems: FeatureItem[] = [
  {
    title: "ATS-Optimized",
    description:
      "Structured content and clean formatting help your resume pass Applicant Tracking Systems with ease.",
    icon: Proportions,
  },
  {
    title: "Professional Templates",
    description:
      "Choose from modern, recruiter-approved templates designed to highlight your strengths.",
    icon: LayoutGrid,
  },
  {
    title: "Easy Editing",
    description:
      "Intuitive editor with smart sections, inline tips, and effortless reordering—no design skills needed.",
    icon: Columns3Cog,
  },
  {
    title: "One-Click PDF Export",
    description:
      "Export crisp, print-ready PDFs that preserve layout consistency everywhere.",
    icon: RectangleVertical,
  },
  {
    title: "Real-Time Preview",
    description:
      "See changes instantly as you type so you can fine-tune details without guesswork.",
    icon: MonitorSmartphone,
  },
];

export default function FeaturesSection({
  title = "Features that help you get hired",
  description = "Everything you need to craft a standout, professional resume—fast.",
  items = defaultItems,
  className,
  style,
}: FeaturesSectionProps) {
  return (
    <section
      aria-labelledby="features-heading"
      className={["w-full bg-background", className].filter(Boolean).join(" ")}
      style={style}
    >
      <div className="w-full max-w-full">
        <header className="mb-8 sm:mb-10">
          <h2
            id="features-heading"
            className="font-display text-2xl sm:text-3xl md:text-4xl tracking-tight"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-prose">
              {description}
            </p>
          ) : null}
        </header>

        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li key={idx} className="min-w-0">
                <div
                  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                  aria-label={item.title}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
                      aria-hidden="true"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}