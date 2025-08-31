import React from 'react';


const PricingToggle = ({ isAnnual, setIsAnnual }) => {
  return (
    <div className="flex items-center justify-center mb-8 md:mb-12">
      <div className="bg-surface rounded-full p-1 flex items-center space-x-1">
        <button
          onClick={() => setIsAnnual(false)}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm font-medium transition-all duration-300 ${!isAnnual
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setIsAnnual(true)}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${isAnnual
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <span>Annual</span>
          <div className="bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
            Save 20%
          </div>
        </button>
      </div>
    </div>
  );
};

export default PricingToggle;