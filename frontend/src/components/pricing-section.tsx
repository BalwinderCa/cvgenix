"use client";

import React from "react";
import { DiamondPercent, TicketPercent, CreditCard } from "lucide-react";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number; // in USD
  yearlyPrice: number; // in USD (billed yearly total)
  features: string[];
  ctaLabel?: string;
  popular?: boolean;
};

export type PricingSectionProps = {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: string;
  defaultBilling?: BillingCycle;
  plans?: Plan[];
  onSelectPlan?: (plan: Plan, billing: BillingCycle) => void;
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const defaultPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with core features.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Basic resume templates",
      "Unlimited edits",
      "Export to PDF",
      "ATS-friendly structure",
    ],
    ctaLabel: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Everything you need to stand out.",
    monthlyPrice: 12,
    yearlyPrice: 96, // $8/mo billed yearly
    features: [
      "All Free features",
      "Premium templates",
      "Advanced sections & layouts",
      "Smart keyword suggestions",
      "Version history",
    ],
    ctaLabel: "Upgrade to Pro",
    popular: true,
  },
];

export default function PricingSection({
  className,
  style,
  title = "Simple, transparent pricing",
  subtitle = "Choose a plan that grows with your career.",
  defaultBilling = "monthly",
  plans = defaultPlans,
  onSelectPlan,
}: PricingSectionProps) {
  const [billing, setBilling] = React.useState<BillingCycle>(defaultBilling);
  const liveRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Announce billing change to screen readers
    if (liveRef.current) {
      liveRef.current.textContent =
        billing === "monthly" ? "Billing set to monthly" : "Billing set to yearly";
    }
  }, [billing]);

  const yearlySavingsPercent = (p: Plan) => {
    if (p.monthlyPrice === 0 || p.yearlyPrice === 0) return 0;
    const monthlyTotal = p.monthlyPrice * 12;
    const saved = monthlyTotal - p.yearlyPrice;
    return Math.max(0, Math.round((saved / monthlyTotal) * 100));
  };

  return (
    <section
      className={[
        "w-full bg-background text-foreground",
        "rounded-none",
        className ?? "",
      ].join(" ")}
      style={style}
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2
            id="pricing-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display tracking-tight"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            {subtitle}
          </p>

          <div
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-1 border border-primary/20"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              aria-pressed={billing === "monthly"}
              className={[
                "relative z-10 rounded-full px-4 sm:px-5 py-2 text-sm font-medium transition-colors",
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary",
              ].join(" ")}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              aria-pressed={billing === "yearly"}
              className={[
                "relative z-10 rounded-full px-4 sm:px-5 py-2 text-sm font-medium transition-colors",
                billing === "yearly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary",
              ].join(" ")}
            >
              Yearly
            </button>
          </div>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            ref={liveRef}
          />
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {plans.map((plan) => {
            const isPopular = Boolean(plan.popular);
            const savings = yearlySavingsPercent(plan);
            const isFree = plan.monthlyPrice === 0 && plan.yearlyPrice === 0;

            const priceLabel =
              billing === "monthly"
                ? isFree
                  ? "$0"
                  : `${formatPrice(plan.monthlyPrice)}`
                : isFree
                ? "$0"
                : `${formatPrice(plan.yearlyPrice)}`;

            const subLabel =
              billing === "monthly"
                ? "/month"
                : isFree
                ? ""
                : "/year";

            return (
              <div
                key={plan.id}
                className={[
                  "relative h-full bg-white rounded-3xl border border-gray-100",
                  "shadow-sm hover:shadow-md transition-all duration-300",
                  isPopular ? "border-[#0d9488] shadow-md" : "",
                ].join(" ")}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gray-900 text-white px-4 py-2 text-xs font-semibold shadow-sm">
                    <DiamondPercent className="h-3.5 w-3.5" aria-hidden="true" />
                    Most popular
                  </div>
                )}

                <div className="p-8">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold break-words">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
                      {priceLabel}
                    </span>
                    <span className="text-sm text-muted-foreground">{subLabel}</span>
                  </div>

                  {billing === "yearly" && savings > 0 && !isFree && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium">
                      <TicketPercent className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                      <span className="text-foreground">Save {savings}% annually</span>
                    </div>
                  )}

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          className={[
                            "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                            isPopular ? "bg-foreground" : "bg-muted-foreground",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <span className="text-sm text-foreground break-words">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7">
                    <button
                      type="button"
                      onClick={() => onSelectPlan?.(plan, billing)}
                      className={[
                        "w-full inline-flex items-center justify-center gap-2 rounded-full",
                        "px-6 py-3 text-sm font-semibold",
                        "transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isPopular
                          ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200",
                      ].join(" ")}
                      aria-label={`${plan.ctaLabel ?? "Select plan"}: ${plan.name} (${billing})`}
                    >
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      {plan.ctaLabel ?? "Select plan"}
                    </button>
                    {!isFree && billing === "yearly" && (
                      <p className="mt-2 text-xs text-muted-foreground text-center">
                        Billed as one payment of {formatPrice(plan.yearlyPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prices in USD. Cancel anytime.
        </p>
      </div>
    </section>
  );
}