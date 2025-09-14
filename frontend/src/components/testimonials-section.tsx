"use client";

import * as React from "react";
import { TextQuote } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  quote: string;
  rating: number; // 1-5
  achievement?: string;
};

export interface TestimonialsSectionProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  layout?: "compact" | "full";
}

function StarRating({
  rating,
  label,
}: {
  rating: number;
  label?: string;
}) {
  const fullStars = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1" aria-label={label ?? `Rating: ${fullStars} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < fullStars;
        return (
          <span
            key={i}
            className={
              "text-[13px] leading-none select-none " +
              (filled ? "text-foreground" : "text-muted-foreground/40")
            }
            aria-hidden="true"
          >
            {filled ? "★" : "☆"}
          </span>
        );
      })}
      <span className="sr-only">{fullStars} out of 5 stars</span>
    </div>
  );
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Sophia Patel",
    role: "Product Manager · Landed at Atlassian",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=facearea&facepad=3&h=256",
    quote:
      "CVGenix helped me translate impact into concise bullets. I went from no callbacks to three offers in two weeks.",
    rating: 5,
    achievement: "3 offers in 14 days",
  },
  {
    id: "t2",
    name: "Marcus Chen",
    role: "Software Engineer · Offer from Stripe",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=facearea&facepad=3&h=256",
    quote:
      "The ATS-friendly templates and guidance were spot on. Recruiters started reaching out within days.",
    rating: 5,
    achievement: "Reached top of ATS",
  },
  {
    id: "t3",
    name: "Ava Johnson",
    role: "Data Analyst · Hired by HubSpot",
    avatarUrl:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=facearea&facepad=3&h=256",
    quote:
      "Clean design, clear structure, and measurable achievements. My resume finally tells my story.",
    rating: 4,
    achievement: "Hired in 3 weeks",
  },
  {
    id: "t4",
    name: "Diego Ramirez",
    role: "UX Designer · Joined Coinbase",
    avatarUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=256&auto=format&fit=facearea&facepad=3&h=256",
    quote:
      "The builder made it simple to tailor my resume per role. Portfolio links and case studies shined.",
    rating: 5,
    achievement: "Portfolio views +120%",
  },
  {
    id: "t5",
    name: "Emily Carter",
    role: "Marketing Lead · Offer from Notion",
    avatarUrl:
      "https://images.unsplash.com/photo-1547936782-6d725f7e3c7e?q=80&w=256&auto=format&fit=facearea&facepad=3&h=256",
    quote:
      "I loved the suggestions for action verbs and metrics. It leveled up my resume instantly.",
    rating: 5,
    achievement: "Interviewed at 5 firms",
  },
  {
    id: "t6",
    name: "Liam O’Connor",
    role: "DevOps Engineer · Hired by Shopify",
    avatarUrl:
      "https://images.unsplash.com/photo-1547423510-e720f0c47631?q=80&w=256&auto=format&fit=facearea&facepad=3&h=256",
    quote:
      "Exported a polished resume in minutes. The structure made my impact crystal clear to hiring managers.",
    rating: 4,
    achievement: "Time-to-offer down 50%",
  },
];

export default function TestimonialsSection({
  className,
  style,
  title = "Trusted by professionals. Proven results.",
  subtitle = "Real stories from users who landed interviews and offers using CVGenix.",
  testimonials = DEFAULT_TESTIMONIALS,
  layout = "full",
}: TestimonialsSectionProps) {
  return (
    <section
      className={`w-full ${className ?? ""}`}
      style={style}
      aria-labelledby="testimonials-heading"
    >
      <div className="w-full max-w-full">
        <header className="w-full max-w-full mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent text-foreground px-3 py-1 text-xs font-medium">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/80" aria-hidden="true" />
            High satisfaction · Real outcomes
          </div>
          <h2
            id="testimonials-heading"
            className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-prose">
            {subtitle}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <StarRating rating={5} label="Average rating 4.8 out of 5" />
              <span className="text-muted-foreground">4.8/5 average</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <div className="text-muted-foreground">1,200+ happy users</div>
          </div>
        </header>

        <div
          className={
            "grid gap-4 sm:gap-6 " +
            (layout === "compact"
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")
          }
        >
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="min-w-0 rounded-[var(--radius)] bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-ring/20"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    <img
                      src={t.avatarUrl}
                      alt={`${t.name} headshot`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{t.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t.role}</p>
                      </div>
                      {t.achievement ? (
                        <span
                          className="inline-flex items-center whitespace-nowrap rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[11px] font-medium border border-primary/20"
                          aria-label={`Achievement: ${t.achievement}`}
                          title={t.achievement}
                        >
                          {t.achievement}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2">
                      <StarRating rating={t.rating} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 relative">
                  <TextQuote
                    aria-hidden="true"
                    className="absolute -top-2 -left-1 h-5 w-5 text-muted-foreground/40"
                  />
                  <blockquote className="pl-6 text-[15px] leading-relaxed text-foreground break-words">
                    “{t.quote}”
                  </blockquote>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}