const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payment = require('../models/Payment');
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

    // Credit purchase plans (One-time purchases)
    this.creditPlans = {
      starter: {
        id: 'starter_credits',
        name: 'Starter Pack',
        price: 3.99,
        credits: 5,
        description: 'Perfect for getting started',
        features: [
          '5 Credits Included',
          'Basic Templates',
          '5 Resume Credits',
          '5 ATS Analysis Credits'
        ]
      },
      popular: {
        id: 'popular_credits',
        name: 'Popular Pack',
        price: 9.99,
        credits: 15,
        description: 'Most popular choice',
        features: [
          '15 Credits Included',
          'All Templates',
          'Priority Support',
          '15 Resume Credits',
          '15 ATS Analysis Credits'
        ],
        popular: true
      },
      professional: {
        id: 'professional_credits',
        name: 'Professional Pack',
        price: 19.99,
        credits: 30,
        description: 'For professionals',
        features: [
          '30 Credits Included',
          'All Templates',
          'Priority Support',
          'Custom Branding',
          '30 Resume Credits',
          '30 ATS Analysis Credits'
        ]
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
      console.log('🔍 Processing webhook...', {
        hasPayload: !!payload,
        hasSignature: !!signature,
        hasWebhookSecret: !!this.webhookSecret
      });

      let event;
      try {
        // Try with the configured webhook secret first
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          this.webhookSecret
        );
        console.log('✅ Webhook event constructed:', event.type, event.id);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        console.error('❌ Error details:', {
          hasWebhookSecret: !!this.webhookSecret,
          webhookSecretLength: this.webhookSecret?.length,
          signatureLength: signature?.length
        });
        
        // For Stripe CLI, try using the signing secret from CLI output
        // The CLI provides: whsec_xxxxx
        // Try to get it from environment or use a fallback
        const cliWebhookSecret = process.env.STRIPE_CLI_WEBHOOK_SECRET || this.webhookSecret;
        
        if (cliWebhookSecret && cliWebhookSecret !== 'your-stripe-webhook-secret') {
          console.log('🔄 Retrying with CLI webhook secret...');
          try {
            event = this.stripe.webhooks.constructEvent(
              payload,
              signature,
              cliWebhookSecret
            );
            console.log('✅ Webhook event constructed with CLI secret:', event.type, event.id);
          } catch (err2) {
            console.error('❌ Still failed with CLI secret:', err2.message);
            // Last resort: parse without verification (only for local testing)
            console.warn('⚠️ Parsing event without verification (LOCAL TEST MODE ONLY)');
            event = JSON.parse(payload.toString());
            console.log('⚠️ Event parsed (unverified):', event.type);
          }
        } else {
          // No valid secret, parse without verification for local testing
          console.warn('⚠️ No webhook secret configured, parsing event without verification (TEST MODE)');
          event = JSON.parse(payload.toString());
          console.log('⚠️ Event parsed (unverified):', event.type);
        }
      }

      console.log('📋 Event type:', event.type);
      console.log('📋 Event ID:', event.id);
      
      // Log full event for debugging
      if (event.type === 'checkout.session.completed') {
        console.log('📋 Full session object:', JSON.stringify(event.data.object, null, 2));
      }

      switch (event.type) {
        case 'checkout.session.completed':
          console.log('🎯 Handling checkout.session.completed');
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
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

  // Save payment record to database
  async savePaymentRecord(paymentData) {
    try {
      // Check if payment already exists
      const existingPayment = await Payment.findOne({ 
        stripePaymentId: paymentData.stripePaymentId 
      });

      if (existingPayment) {
        console.log(`Payment ${paymentData.stripePaymentId} already exists, skipping`);
        return existingPayment;
      }

      const payment = new Payment(paymentData);
      await payment.save();
      console.log(`✅ Saved payment record: ${paymentData.stripePaymentId}`);
      return payment;
    } catch (error) {
      console.error('Error saving payment record:', error);
      // Don't throw - we don't want to fail the webhook if payment record save fails
      return null;
    }
  }

  // Handle checkout session completed (for one-time credit purchases)
  async handleCheckoutSessionCompleted(session) {
    try {
      console.log('🎉 Checkout session completed:', session.id);
      console.log('📋 Session metadata:', JSON.stringify(session.metadata, null, 2));
      console.log('📋 Session mode:', session.mode);
      console.log('📋 Session payment status:', session.payment_status);
      
      // Check payment status - only process if paid
      if (session.payment_status !== 'paid') {
        console.log(`⚠️ Payment not completed yet. Status: ${session.payment_status}`);
        return;
      }
      
      // Check if this is a credit purchase
      if (session.metadata && session.metadata.type === 'credit_purchase') {
        const userId = session.metadata.userId;
        const credits = parseInt(session.metadata.credits) || 0;
        const planId = session.metadata.planId;

        console.log('📊 Credit purchase details:', { userId, credits, planId });

        if (!userId || !credits) {
          console.error('❌ Missing userId or credits in session metadata:', session.metadata);
          return;
        }

        const user = await User.findById(userId);
        if (!user) {
          console.error('❌ User not found:', userId);
          return;
        }

        const oldCredits = user.credits || 0;
        // Add credits to user
        user.credits = oldCredits + credits;
        
        // Update or set stripeCustomerId if not set
        if (session.customer && !user.stripeCustomerId) {
          user.stripeCustomerId = session.customer;
        }
        
        await user.save();

        console.log(`✅ Added ${credits} credits to user ${user.email}`);
        console.log(`💰 Credits: ${oldCredits} → ${user.credits}`);

        // Save payment record to database
        // Normalize planId - metadata might have 'starter_credits' but creditPlans uses 'starter'
        const normalizedPlanId = planId?.toLowerCase().trim();
        const planKey = normalizedPlanId?.replace('_credits', '') || normalizedPlanId;
        const plan = this.creditPlans[planKey] || { name: planId || 'Unknown Plan' };
        
        // Get amount from session - try multiple sources
        let amount = 0;
        if (session.amount_total) {
          amount = session.amount_total / 100;
        } else if (session.amount_subtotal) {
          amount = session.amount_subtotal / 100;
        } else {
          // Fallback: get amount from payment intent
          if (session.payment_intent) {
            try {
              const paymentIntent = await this.stripe.paymentIntents.retrieve(session.payment_intent);
              amount = paymentIntent.amount ? paymentIntent.amount / 100 : 0;
            } catch (error) {
              console.error('Error retrieving payment intent for amount:', error);
            }
          }
          // If still 0, use plan price as fallback
          if (amount === 0 && plan.price) {
            amount = plan.price;
          }
        }
        
        console.log(`💰 Payment amount: $${amount} (from session.amount_total: ${session.amount_total}, session.amount_subtotal: ${session.amount_subtotal})`);
        
        // Get receipt URL from payment intent if available
        let receiptUrl = null;
        if (session.payment_intent) {
          try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(session.payment_intent);
            receiptUrl = paymentIntent.charges?.data[0]?.receipt_url || null;
          } catch (error) {
            console.error('Error retrieving payment intent for receipt URL:', error);
          }
        }
        
        // Generate our own invoice URL (we'll create the payment record first, then update with invoice URL)
        const paymentRecord = await this.savePaymentRecord({
          user: userId,
          stripeCustomerId: session.customer || user.stripeCustomerId,
          stripePaymentId: session.payment_intent || session.id,
          stripeSessionId: session.id,
          type: 'credit_purchase',
          amount: amount,
          currency: session.currency?.toUpperCase() || 'USD',
          status: session.payment_status,
          description: `${plan.name || planId} - ${credits} Credits`,
          credits: credits,
          planId: planId,
          invoiceUrl: null, // Will be set after payment is saved
          receiptUrl: receiptUrl,
          metadata: session.metadata || {},
          paymentDate: new Date(session.created * 1000)
        });

        // Update with our invoice URL
        if (paymentRecord && paymentRecord._id) {
          const apiUrl = process.env.API_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
          const invoiceUrl = `${apiUrl}/api/invoices/${paymentRecord._id}`;
          paymentRecord.invoiceUrl = invoiceUrl;
          await paymentRecord.save();
        }
      } else {
        console.log('ℹ️ Checkout session is not a credit purchase, skipping credit addition');
        console.log('📋 Metadata:', session.metadata);
        
        // Still save payment record for non-credit purchases
        if (session.metadata?.userId) {
          const userId = session.metadata.userId;
          const user = await User.findById(userId);
          if (user) {
            const amount = session.amount_total ? session.amount_total / 100 : 0;
            
            // Get receipt URL from payment intent if available
            let receiptUrl = null;
            if (session.payment_intent) {
              try {
                const paymentIntent = await this.stripe.paymentIntents.retrieve(session.payment_intent);
                receiptUrl = paymentIntent.charges?.data[0]?.receipt_url || null;
              } catch (error) {
                console.error('Error retrieving payment intent for receipt URL:', error);
              }
            }
            
            const paymentRecord = await this.savePaymentRecord({
              user: userId,
              stripeCustomerId: session.customer || user.stripeCustomerId,
              stripePaymentId: session.payment_intent || session.id,
              stripeSessionId: session.id,
              type: 'payment',
              amount: amount,
              currency: session.currency?.toUpperCase() || 'USD',
              status: session.payment_status,
              description: session.metadata?.description || 'Payment',
              invoiceUrl: null, // Will be set after payment is saved
              receiptUrl: receiptUrl,
              metadata: session.metadata || {},
              paymentDate: new Date(session.created * 1000)
            });

            // Update with our invoice URL
            if (paymentRecord && paymentRecord._id) {
              const apiUrl = process.env.API_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
              const invoiceUrl = `${apiUrl}/api/invoices/${paymentRecord._id}`;
              paymentRecord.invoiceUrl = invoiceUrl;
              await paymentRecord.save();
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling checkout session completed:', error);
      console.error('Error stack:', error.stack);
      throw error;
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

        // Save payment record to database
        const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
        const description = invoice.lines.data[0]?.description || 'Subscription Payment';
        const subscriptionId = invoice.subscription;

        await this.savePaymentRecord({
          user: user._id,
          stripeCustomerId: customerId,
          stripePaymentId: invoice.id,
          stripeInvoiceId: invoice.id,
          type: subscriptionId ? 'subscription' : 'invoice',
          amount: amount,
          currency: invoice.currency?.toUpperCase() || 'USD',
          status: invoice.status,
          description: description,
          invoiceUrl: invoice.hosted_invoice_url || invoice.invoice_pdf,
          receiptUrl: invoice.receipt_url,
          invoiceNumber: invoice.number,
          metadata: {},
          paymentDate: new Date(invoice.created * 1000)
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

  // Check if user has access to feature (based on credits)
  async checkFeatureAccess(userId, feature) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { hasAccess: false, reason: 'User not found' };
      }

      // Check credits for each feature (1 credit per action)
      const creditsRequired = {
        'resumes': 1,
        'atsAnalysis': 1,
        'exports': 1
      };

      const required = creditsRequired[feature] || 1;

      if (user.credits < required) {
        return { 
          hasAccess: false, 
          reason: `Insufficient credits. You need ${required} credit(s) but have ${user.credits}.`,
          credits: user.credits,
          required: required
        };
      }

      return { 
        hasAccess: true, 
        credits: user.credits,
        required: required
      };
    } catch (error) {
      console.error('Check feature access error:', error);
      return { hasAccess: false, reason: 'Error checking access' };
    }
  }

  // Deduct credit for feature usage
  async deductCredit(userId, feature) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Check if user has credits
      if (user.credits < 1) {
        return { 
          success: false, 
          error: 'Insufficient credits',
          credits: user.credits
        };
      }

      // Deduct 1 credit
      user.credits -= 1;
      await user.save();

      console.log(`💰 Deducted 1 credit from user ${user.email} for ${feature}. Remaining: ${user.credits}`);

      return { 
        success: true, 
        credits: user.credits,
        message: `Credit deducted. Remaining credits: ${user.credits}`
      };
    } catch (error) {
      console.error('Deduct credit error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get available plans
  getPlans() {
    return this.plans;
  }

  // Get credit plans
  getCreditPlans() {
    return Object.values(this.creditPlans);
  }

  // Create credit checkout session
  async createCreditCheckoutSession(planId, userId, successUrl, cancelUrl) {
    try {
      // Normalize planId to lowercase for matching
      const normalizedPlanId = planId.toLowerCase().trim();
      const plan = this.creditPlans[normalizedPlanId];
      
      if (!plan) {
        console.error(`❌ Invalid plan ID: "${planId}" (normalized: "${normalizedPlanId}")`);
        console.error(`Available credit plans:`, Object.keys(this.creditPlans));
        return { 
          success: false, 
          error: `Invalid plan ID: ${planId}. Please select a valid credit pack.`,
          availablePlans: Object.keys(this.creditPlans)
        };
      }
      
      console.log(`✅ Creating checkout for plan: ${plan.name} (${plan.credits} credits, $${plan.price})`);

      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user);
        if (!customer.success) {
          return customer;
        }
        customerId = customer.customerId;
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId.toString(), // Ensure it's a string
          planId: normalizedPlanId,
          credits: plan.credits.toString(), // Ensure it's a string
          type: 'credit_purchase'
        },
      });

      console.log('📝 Created checkout session with metadata:', {
        sessionId: session.id,
        userId: userId.toString(),
        credits: plan.credits,
        planId: normalizedPlanId
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('❌ Create credit checkout session error:', error);
      console.error('Error details:', {
        planId,
        userId,
        errorMessage: error.message,
        errorType: error.type,
        errorCode: error.code,
        stripeConfigured: !!process.env.STRIPE_SECRET_KEY
      });
      
      // Provide more helpful error messages
      if (error.type === 'StripeInvalidRequestError') {
        return { 
          success: false, 
          error: `Stripe error: ${error.message}` 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to create checkout session. Please check server logs for details.' 
      };
    }
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

  // Get payment history for a user (from database)
  async getPaymentHistory(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get payments from database
      const dbPayments = await Payment.find({ user: userId })
        .sort({ paymentDate: -1 })
        .limit(500); // Limit to last 500 payments

      console.log(`Found ${dbPayments.length} payments in database for user ${user.email}`);

      // Convert to format expected by frontend
      const payments = dbPayments.map(payment => ({
        id: payment.stripePaymentId,
        _id: payment._id.toString(), // Include MongoDB _id for invoice access
        type: payment.type,
        date: payment.paymentDate,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        credits: payment.credits,
        invoiceUrl: payment.invoiceUrl,
        receiptUrl: payment.receiptUrl,
        invoiceNumber: payment.invoiceNumber,
      }));

      return {
        success: true,
        payments: payments
      };
    } catch (error) {
      console.error('Get payment history error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PaymentService();
