const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const emailService = require('./emailService');

class PaymentService {
  constructor() {
    this.stripe = stripe;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.initializePlans();
  }

  initializePlans() {
    this.plans = {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: null,
        features: [
          'Basic Templates',
          'PDF Export',
          'Email Support',
          '3 Resume Credits'
        ],
        limits: {
          resumes: 3,
          exports: 10,
          atsAnalysis: 1
        }
      },
      standard: {
        id: 'standard',
        name: 'Standard',
        price: 9.99,
        interval: 'month',
        stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID,
        features: [
          'All Templates',
          'Unlimited Resumes',
          'Priority Support',
          'Custom Branding',
          'Advanced Analytics'
        ],
        limits: {
          resumes: -1, // unlimited
          exports: -1,
          atsAnalysis: 10
        }
      },
      pro: {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        interval: 'month',
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
          'Everything in Standard',
          'AI Writing Assistant',
          'Unlimited ATS Analysis',
          'White-label Options',
          'API Access'
        ],
        limits: {
          resumes: -1,
          exports: -1,
          atsAnalysis: -1
        }
      }
    };
  }

  // Create Stripe customer
  async createCustomer(user) {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      });

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customer.id
      });

      return {
        success: true,
        customerId: customer.id
      };
    } catch (error) {
      console.error('Create customer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create payment intent for one-time payments
  async createPaymentIntent(amount, currency = 'usd', customerId = null) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Create payment intent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create subscription
  async createSubscription(userId, priceId, customerId = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get or create Stripe customer
      let stripeCustomerId = customerId || user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customerResult = await this.createCustomer(user);
        if (!customerResult.success) {
          return customerResult;
        }
        stripeCustomerId = customerResult.customerId;
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('Create subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, immediately = false) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      if (immediately) {
        await this.stripe.subscriptions.del(subscriptionId);
      }

      return {
        success: true,
        subscription
      };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer']
      });

      return {
        success: true,
        subscription
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get customer's subscriptions
  async getCustomerSubscriptions(customerId) {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.default_payment_method']
      });

      return {
        success: true,
        subscriptions: subscriptions.data
      };
    } catch (error) {
      console.error('Get customer subscriptions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create billing portal session
  async createBillingPortalSession(customerId, returnUrl) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return {
        success: true,
        url: session.url
      };
    } catch (error) {
      console.error('Create billing portal error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create checkout session
  async createCheckoutSession(userId, priceId, successUrl, cancelUrl) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get or create Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customerResult = await this.createCustomer(user);
        if (!customerResult.success) {
          return customerResult;
        }
        stripeCustomerId = customerResult.customerId;
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId
        }
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Create checkout session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle webhook events
  async handleWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle subscription created
  async handleSubscriptionCreated(subscription) {
    try {
      const customerId = subscription.customer;
      const user = await User.findOne({ stripeCustomerId: customerId });
      
      if (user) {
        const planId = this.getPlanIdFromPriceId(subscription.items.data[0].price.id);
        const plan = this.plans[planId];
        
        await User.findByIdAndUpdate(user._id, {
          subscription: {
            plan: planId,
            status: subscription.status,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });

        // Send welcome email for new subscription
        if (planId !== 'free') {
          emailService.sendSubscriptionWelcomeEmail(user, plan).catch(err => {
            console.error('Subscription welcome email failed:', err);
          });
        }

        console.log(`✅ User ${user.email} subscribed to ${plan.name} plan`);
      }
    } catch (error) {
      console.error('Handle subscription created error:', error);
    }
  }

  // Handle subscription updated
  async handleSubscriptionUpdated(subscription) {
    try {
      const customerId = subscription.customer;
      const user = await User.findOne({ stripeCustomerId: customerId });
      
      if (user) {
        const planId = this.getPlanIdFromPriceId(subscription.items.data[0].price.id);
        await User.findByIdAndUpdate(user._id, {
          subscription: {
            plan: planId,
            status: subscription.status,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });
      }
    } catch (error) {
      console.error('Handle subscription updated error:', error);
    }
  }

  // Handle subscription deleted
  async handleSubscriptionDeleted(subscription) {
    try {
      const customerId = subscription.customer;
      const user = await User.findOne({ stripeCustomerId: customerId });
      
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          subscription: {
            plan: 'free',
            status: 'canceled',
            stripeSubscriptionId: null,
            currentPeriodStart: null,
            currentPeriodEnd: null
          }
        });

        // Send cancellation email
        emailService.sendSubscriptionCancellationEmail(user).catch(err => {
          console.error('Subscription cancellation email failed:', err);
        });

        console.log(`❌ User ${user.email} subscription canceled`);
      }
    } catch (error) {
      console.error('Handle subscription deleted error:', error);
    }
  }

  // Handle payment succeeded
  async handlePaymentSucceeded(invoice) {
    try {
      const customerId = invoice.customer;
      const user = await User.findOne({ stripeCustomerId: customerId });
      
      if (user) {
        // Send payment confirmation email
        emailService.sendPaymentConfirmationEmail(user, invoice).catch(err => {
          console.error('Payment confirmation email failed:', err);
        });

        console.log(`✅ Payment succeeded for user ${user.email}: ${invoice.id}`);
      }
    } catch (error) {
      console.error('Handle payment succeeded error:', error);
    }
  }

  // Handle payment failed
  async handlePaymentFailed(invoice) {
    try {
      const customerId = invoice.customer;
      const user = await User.findOne({ stripeCustomerId: customerId });
      
      if (user) {
        // Send payment failed email
        emailService.sendPaymentFailedEmail(user, invoice).catch(err => {
          console.error('Payment failed email failed:', err);
        });

        console.log(`❌ Payment failed for user ${user.email}: ${invoice.id}`);
      }
    } catch (error) {
      console.error('Handle payment failed error:', error);
    }
  }

  // Get plan ID from Stripe price ID
  getPlanIdFromPriceId(priceId) {
    for (const [planId, plan] of Object.entries(this.plans)) {
      if (plan.stripePriceId === priceId) {
        return planId;
      }
    }
    return 'free';
  }

  // Check if user has access to feature
  async checkFeatureAccess(userId, feature) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { hasAccess: false, reason: 'User not found' };
      }

      const plan = this.plans[user.subscription?.plan || 'free'];
      const limits = plan.limits;

      switch (feature) {
        case 'resumes':
          if (limits.resumes === -1) return { hasAccess: true };
          const resumeCount = await require('../models/Resume').countDocuments({ user: userId });
          return { hasAccess: resumeCount < limits.resumes, current: resumeCount, limit: limits.resumes };
        
        case 'atsAnalysis':
          if (limits.atsAnalysis === -1) return { hasAccess: true };
          // Check user's ATS analysis count (you'd need to track this)
          return { hasAccess: true, current: 0, limit: limits.atsAnalysis };
        
        case 'exports':
          if (limits.exports === -1) return { hasAccess: true };
          // Check user's export count (you'd need to track this)
          return { hasAccess: true, current: 0, limit: limits.exports };
        
        default:
          return { hasAccess: false, reason: 'Unknown feature' };
      }
    } catch (error) {
      console.error('Check feature access error:', error);
      return { hasAccess: false, reason: 'Error checking access' };
    }
  }

  // Get available plans
  getPlans() {
    return this.plans;
  }

  // Get user's current plan
  async getUserPlan(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const planId = user.subscription?.plan || 'free';
      const plan = this.plans[planId];

      return {
        success: true,
        plan: {
          ...plan,
          subscription: user.subscription
        }
      };
    } catch (error) {
      console.error('Get user plan error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PaymentService();
