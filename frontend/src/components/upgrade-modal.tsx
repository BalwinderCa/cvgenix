"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Sparkles, Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  title?: string;
  price: number;
  credits: number;
  description?: string;
  subtitle?: string;
  features: string[];
  popular?: boolean;
  interval?: string | null;
}

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export default function UpgradeModal({ open, onOpenChange, message }: UpgradeModalProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/payments/plans');
      const data = await response.json();
      
      if (data.success && data.data) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!isAuthenticated) {
      toast.info("Please log in to purchase credits.");
      onOpenChange(false);
      router.push('/profile?redirect=pricing');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Map plan name to credit plan ID
      const planNameToIdMap: Record<string, string> = {
        'Starter Pack': 'starter',
        'Popular Pack': 'popular',
        'Professional Pack': 'professional',
        'starter': 'starter',
        'popular': 'popular',
        'professional': 'professional',
        'starter_credits': 'starter',
        'popular_credits': 'popular',
        'professional_credits': 'professional'
      };

      let creditPlanId = planNameToIdMap[plan.name] || planNameToIdMap[plan.title || ''] || plan.id.toLowerCase();
      
      if (plan.id && !creditPlanId) {
        const idLower = plan.id.toLowerCase();
        if (idLower.includes('starter')) creditPlanId = 'starter';
        else if (idLower.includes('popular')) creditPlanId = 'popular';
        else if (idLower.includes('professional')) creditPlanId = 'professional';
      }

      setLoading(true);
      const response = await fetch('http://localhost:3001/api/payments/create-credit-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: creditPlanId,
          successUrl: `${window.location.origin}/profile?success=true`,
          cancelUrl: `${window.location.origin}/?pricing=true`
        })
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        // Store session ID in localStorage for payment status check after redirect
        if (data.sessionId) {
          localStorage.setItem('pendingPaymentSessionId', data.sessionId);
        }
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  const planList = Object.values(plans);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Upgrade to Continue
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            {message || "You've run out of credits! Purchase a credit pack to continue using our services."}
            <br />
            <span className="text-sm text-gray-500 mt-1 block">
              Each export (PDF/PNG/JPG) costs 1 credit • Each ATS analysis costs 1 credit
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {planList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planList.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                    plan.popular
                      ? 'border-primary bg-primary/5 scale-105'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{plan.name || plan.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.description || plan.subtitle}</p>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-500 ml-1">one-time</span>
                    </div>

                    <ul className="text-left space-y-2 mb-6 min-h-[120px]">
                      {plan.features?.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loading}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      {loading ? 'Processing...' : `Get ${plan.name || plan.title}`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Credits never expire. Use them whenever you need.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

