const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/payments/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  try {
    const plans = paymentService.getPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plans'
    });
  }
});

// @route   GET /api/payments/user-plan
// @desc    Get user's current plan
// @access  Private
router.get('/user-plan', auth, async (req, res) => {
  try {
    const result = await paymentService.getUserPlan(req.user.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get user plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user plan'
    });
  }
});

// @route   POST /api/payments/create-checkout-session
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout-session', [
  auth,
  body('priceId', 'Price ID is required').notEmpty(),
  body('successUrl', 'Success URL is required').isURL(),
  body('cancelUrl', 'Cancel URL is required').isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { priceId, successUrl, cancelUrl } = req.body;

    const result = await paymentService.createCheckoutSession(
      req.user.id,
      priceId,
      successUrl,
      cancelUrl
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// @route   POST /api/payments/create-subscription
// @desc    Create subscription
// @access  Private
router.post('/create-subscription', [
  auth,
  body('priceId', 'Price ID is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { priceId } = req.body;

    const result = await paymentService.createSubscription(req.user.id, priceId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

// @route   POST /api/payments/cancel-subscription
// @desc    Cancel subscription
// @access  Private
router.post('/cancel-subscription', [
  auth,
  body('subscriptionId', 'Subscription ID is required').notEmpty(),
  body('immediately').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { subscriptionId, immediately = false } = req.body;

    // Verify user owns this subscription
    const user = await User.findById(req.user.id);
    if (!user || user.subscription?.stripeSubscriptionId !== subscriptionId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const result = await paymentService.cancelSubscription(subscriptionId, immediately);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// @route   GET /api/payments/subscription/:id
// @desc    Get subscription details
// @access  Private
router.get('/subscription/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user owns this subscription
    const user = await User.findById(req.user.id);
    if (!user || user.subscription?.stripeSubscriptionId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const result = await paymentService.getSubscription(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription'
    });
  }
});

// @route   POST /api/payments/billing-portal
// @desc    Create billing portal session
// @access  Private
router.post('/billing-portal', [
  auth,
  body('returnUrl', 'Return URL is required').isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { returnUrl } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No Stripe customer found'
      });
    }

    const result = await paymentService.createBillingPortalSession(
      user.stripeCustomerId,
      returnUrl
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Create billing portal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create billing portal session'
    });
  }
});

// @route   POST /api/payments/check-feature-access
// @desc    Check if user has access to a feature
// @access  Private
router.post('/check-feature-access', [
  auth,
  body('feature', 'Feature is required').isIn(['resumes', 'atsAnalysis', 'exports'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { feature } = req.body;

    const result = await paymentService.checkFeatureAccess(req.user.id, feature);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check feature access'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified with signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);

    if (result.success) {
      res.json({ received: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for one-time payments
// @access  Private
router.post('/create-payment-intent', [
  auth,
  body('amount', 'Amount is required').isFloat({ min: 0.01 }),
  body('currency').optional().isLength({ min: 3, max: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { amount, currency = 'usd' } = req.body;

    const user = await User.findById(req.user.id);
    const result = await paymentService.createPaymentIntent(
      amount,
      currency,
      user.stripeCustomerId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

module.exports = router;
