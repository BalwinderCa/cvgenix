"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, X } from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';

export default function StripeDemoPage() {
  const [selectedPlan, setSelectedPlan] = useState('popular');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: 4.99,
      credits: 10,
      description: 'Perfect for getting started',
      features: [
        '10 Resume Credits',
        '10 ATS Analysis Credits',
        'Basic Templates'
      ]
    },
    {
      id: 'popular',
      name: 'Popular Pack',
      price: 9.99,
      credits: 25,
      description: 'Most popular choice',
      features: [
        '25 Resume Credits',
        '25 ATS Analysis Credits',
        'All Templates',
        'Priority Support'
      ],
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional Pack',
      price: 19.99,
      credits: 60,
      description: 'For professionals',
      features: [
        '60 Resume Credits',
        '60 ATS Analysis Credits',
        'All Templates',
        'Priority Support',
        'Custom Branding'
      ]
    }
  ];

  const handlePurchase = () => {
    setIsProcessing(true);
    
    // Simulate Stripe checkout process
    setTimeout(() => {
      alert('This is a demo! In a real implementation, this would redirect to Stripe Checkout.');
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="pt-16">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Demo Stripe Checkout</h1>
              <p className="text-muted-foreground">This is a demo of how the Stripe checkout would look</p>
            </div>

            {/* Demo Notice */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Demo Mode</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  This is a demonstration of the Stripe checkout flow. In production, this would redirect to the actual Stripe checkout page.
                </p>
              </CardContent>
            </Card>

            {/* Plan Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Select Your Credit Pack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {plans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPlan === plan.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      } ${plan.popular ? 'relative' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-white">Most Popular</Badge>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                        
                        <div className="mb-4">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground"> / one-time</span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-primary">{plan.credits} Credits</div>
                          <p className="text-xs text-muted-foreground">Resume + ATS Analysis</p>
                        </div>
                        
                        <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        {selectedPlan === plan.id && (
                          <div className="w-full h-8 bg-primary/10 rounded flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Summary */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{plans.find(p => p.id === selectedPlan)?.name}</span>
                      <span>${plans.find(p => p.id === selectedPlan)?.price}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${plans.find(p => p.id === selectedPlan)?.price}</span>
                    </div>
                  </div>
                </div>

                {/* Demo Checkout Button */}
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePurchase}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      'Proceed to Stripe Checkout'
                    )}
                  </Button>
                </div>

                {/* Demo Features */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Demo Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Secure payment processing with Stripe</li>
                    <li>• Support for all major credit cards</li>
                    <li>• Apple Pay and Google Pay support</li>
                    <li>• Instant credit delivery after payment</li>
                    <li>• 30-day money-back guarantee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
