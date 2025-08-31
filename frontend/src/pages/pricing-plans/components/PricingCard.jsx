import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PricingCard = ({ plan, isAnnual, isPopular = false }) => {
  const getPrice = () => {
    if (plan?.price === 0) return 'Free';
    const price = isAnnual ? plan?.price * 0.8 : plan?.price;
    return `$${Math.round(price)}`;
  };

  const getSavings = () => {
    if (plan?.price === 0 || !isAnnual) return null;
    const savings = (plan?.price * 12) - (plan?.price * 0.8 * 12);
    return Math.round(savings);
  };

  return (
    <div className={`relative bg-background rounded-2xl border-2 transition-all duration-300 hover:shadow-brand-lg h-full flex flex-col ${isPopular
        ? 'border-primary shadow-brand-lg scale-105'
        : 'border-border hover:border-primary/30'
      }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
            <Icon name="Star" size={16} />
            <span>Most Popular</span>
          </div>
        </div>
      )}
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-primary to-trust rounded-2xl mx-auto mb-3 md:mb-4">
            <Icon name={plan?.icon} size={20} color="white" className="md:w-6 md:h-6" />
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{plan?.name}</h3>
          <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">{plan?.description}</p>

          <div className="mb-4 md:mb-6">
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-3xl md:text-4xl font-bold text-foreground">{getPrice()}</span>
              {plan?.price > 0 && (
                <span className="text-muted-foreground text-sm md:text-base">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              )}
            </div>
            {getSavings() && (
              <p className="text-accent text-sm font-medium mt-2">
                Save ${getSavings()} annually
              </p>
            )}
          </div>

          {plan?.roi && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <p className="text-accent font-semibold text-xs md:text-sm">{plan?.roi}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
          {plan?.features?.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-4 md:w-5 h-4 md:h-5 bg-accent/20 rounded-full flex items-center justify-center mt-0.5">
                <Icon name="Check" size={10} color="var(--color-accent)" strokeWidth={3} className="md:w-3 md:h-3" />
              </div>
              <div>
                <span className="text-foreground font-medium text-sm md:text-base">{feature?.name}</span>
                {feature?.description && (
                  <p className="text-muted-foreground text-xs md:text-sm mt-1">{feature?.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Button container - always at bottom */}
        <div className="mt-auto">
          <Button
            variant={isPopular ? "default" : "outline"}
            size="lg"
            fullWidth
            className={`${isPopular ? "btn-gradient" : ""} text-sm md:text-base py-3 md:py-4`}
          >
            {plan?.cta}
          </Button>

          {plan?.note && (
            <p className="text-center text-muted-foreground text-xs md:text-sm mt-3 md:mt-4">{plan?.note}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;