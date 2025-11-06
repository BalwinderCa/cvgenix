"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface FAQItem {
  question: string;
  answer: string;
  _id?: string;
}

export interface FAQSectionProps {
  id?: string;
  title?: string;
  description?: string;
  items?: FAQItem[];
  useFeatured?: boolean; // If true, fetch featured FAQs from API
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  id = "faq",
  title = "Frequently asked questions",
  description = "Everything you need to know about CVGenix—pricing, exports, ATS, and more.",
  items: propItems,
  useFeatured = true, // Default to fetching featured FAQs
}) => {
  const [items, setItems] = React.useState<FAQItem[]>(propItems || []);
  const [loading, setLoading] = React.useState(useFeatured && !propItems);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch FAQs from API if useFeatured is true and no items provided
  React.useEffect(() => {
    if (useFeatured && !propItems) {
      const fetchFAQs = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch('http://localhost:3001/api/faqs/featured');
          
          if (!response.ok) {
            throw new Error('Failed to fetch FAQs');
          }
          
          const data = await response.json();
          
          if (data.success && data.data) {
            // Transform API data to FAQItem format
            const faqItems: FAQItem[] = data.data.map((faq: any) => ({
              _id: faq._id,
              question: faq.question,
              answer: faq.answer,
            }));
            
            setItems(faqItems.length > 0 ? faqItems : getDefaultFAQs());
          } else {
            setItems(getDefaultFAQs());
          }
        } catch (err) {
          console.error('Error fetching FAQs:', err);
          setError('Failed to load FAQs');
          // Fallback to default FAQs on error
          setItems(getDefaultFAQs());
        } finally {
          setLoading(false);
        }
      };
      
      fetchFAQs();
    } else if (propItems) {
      // Use provided items
      setItems(propItems);
      setLoading(false);
    }
  }, [useFeatured, propItems]);

  // Default FAQs fallback
  const getDefaultFAQs = (): FAQItem[] => [
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
  ];

  return (
    <section id={id} className="bg-background">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">{title}</h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>
        <div className="mx-auto mt-8 max-w-3xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading FAQs...</p>
              </div>
            </div>
          ) : error && items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : items.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {items.map((item, idx) => (
                <AccordionItem 
                  key={item._id || idx} 
                  value={`item-${item._id || idx}`} 
                  className="rounded-xl border border-border bg-card px-4"
                >
                  <AccordionTrigger className="text-left text-base font-medium">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground/80">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No FAQs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};