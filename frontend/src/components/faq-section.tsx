"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  id?: string;
  title?: string;
  description?: string;
  items?: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  id = "faq",
  title = "Frequently asked questions",
  description = "Everything you need to know about CVGenix—pricing, exports, ATS, and more.",
  items = [
    {
      question: "Is my resume ATS-friendly?",
      answer:
        "Yes. All templates are optimized for Applicant Tracking Systems (ATS). Our analyzer highlights keywords and formatting issues to improve pass rates.",
    },
    {
      question: "Can I export my resume?",
      answer:
        "You can export unlimited times to PDF and DOCX with consistent formatting. One-click export is included in all plans.",
    },
    {
      question: "Do I need a credit card to start?",
      answer:
        "No. You can start building your resume for free—no card required. Upgrade only if you love it.",
    },
    {
      question: "Can I customize templates?",
      answer:
        "Absolutely. You can edit sections, rearrange layout, change styles, and tailor content with smart guidance.",
    },
  ],
}) => {
  return (
    <section id={id} className="bg-background">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">{title}</h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>
        <div className="mx-auto mt-8 max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {items.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="rounded-xl border border-border bg-card px-4">
                <AccordionTrigger className="text-left text-base font-medium">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/80">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};