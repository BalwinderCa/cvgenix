const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const loggerService = require('./loggerService');

/**
 * Enhanced Email Service
 * Provides comprehensive email functionality with multiple providers, templates, and logging
 */
class EnhancedEmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.initialized = false;
    this.providers = {
      gmail: this.createGmailTransporter,
      sendgrid: this.createSendGridTransporter,
      mailgun: this.createMailgunTransporter,
      ethereal: this.createEtherealTransporter
    };
    
    // Don't initialize during construction - wait for explicit initialization
  }

  /**
   * Initialize the email service
   */
  async initializeService() {
    try {
      await this.loadTemplates();
      await this.initializeTransporter();
      this.initialized = true;
      if (loggerService && loggerService.info) {
        loggerService.info('Enhanced email service initialized successfully');
      } else {
        console.log('📧 Enhanced email service initialized successfully');
      }
    } catch (error) {
      if (loggerService && loggerService.error) {
        loggerService.error('Failed to initialize enhanced email service', { error: error.message });
      } else {
        console.error('❌ Failed to initialize enhanced email service:', error.message);
      }
      throw error;
    }
  }

  /**
   * Ensure service is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeService();
    }
  }

  /**
   * Initialize email transporter based on configuration
   */
  async initializeTransporter() {
    try {
      const provider = process.env.EMAIL_PROVIDER || 'ethereal';
      
      if (this.providers[provider]) {
        this.transporter = await this.providers[provider]();
        loggerService.info('Email transporter initialized', { provider });
      } else {
        throw new Error(`Unsupported email provider: ${provider}`);
      }
    } catch (error) {
      loggerService.error('Failed to initialize email transporter', { error: error.message });
      throw error;
    }
  }

  /**
   * Create Gmail transporter
   */
  createGmailTransporter() {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5
    });
  }

  /**
   * Create SendGrid transporter
   */
  createSendGridTransporter() {
    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });
  }

  /**
   * Create Mailgun transporter
   */
  createMailgunTransporter() {
    return nodemailer.createTransporter({
      host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASSWORD
      }
    });
  }

  /**
   * Create Ethereal transporter for development/testing
   */
  async createEtherealTransporter() {
    try {
      // Create test account if not provided
      if (!process.env.ETHEREAL_USER || !process.env.ETHEREAL_PASS) {
        const testAccount = await nodemailer.createTestAccount();
        loggerService.info('Created Ethereal test account', { 
          user: testAccount.user,
          pass: testAccount.pass 
        });
        
        return nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      } else {
        return nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASS
          }
        });
      }
    } catch (error) {
      loggerService.error('Failed to create Ethereal transporter', { error: error.message });
      throw error;
    }
  }

  /**
   * Load email templates
   */
  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      
      if (!fs.existsSync(templatesDir)) {
        loggerService.warn('Email templates directory not found', { path: templatesDir });
        return;
      }

      const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.html'));
      
      for (const file of templateFiles) {
        const templateName = path.basename(file, '.html');
        const templatePath = path.join(templatesDir, file);
        
        try {
          this.templates[templateName] = fs.readFileSync(templatePath, 'utf8');
          loggerService.info('Email template loaded', { template: templateName });
        } catch (error) {
          loggerService.error('Failed to load email template', { 
            template: templateName, 
            error: error.message 
          });
        }
      }
      
      loggerService.info('Email templates loaded', { count: Object.keys(this.templates).length });
    } catch (error) {
      loggerService.error('Failed to load email templates', { error: error.message });
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user, options = {}) {
    try {
      const template = this.templates.welcome || this.getDefaultWelcomeTemplate();
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@resumebuilder.com',
        ...options
      });

      const result = await this.sendEmail({
        to: user.email,
        subject: 'Welcome to Resume Builder! 🎉',
        html,
        template: 'welcome'
      });

      loggerService.userAction('Welcome email sent', {
        userId: user._id,
        email: user.email,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to send welcome email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken, options = {}) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const template = this.templates['password-reset'] || this.getDefaultPasswordResetTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        resetUrl,
        expiryHours: options.expiryHours || 24,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@resumebuilder.com',
        ...options
      });

      const result = await this.sendEmail({
        to: user.email,
        subject: 'Reset Your Password - Resume Builder',
        html,
        template: 'password-reset'
      });

      loggerService.userAction('Password reset email sent', {
        userId: user._id,
        email: user.email,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to send password reset email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(user, paymentData, options = {}) {
    try {
      const template = this.templates['payment-confirmation'] || this.getDefaultPaymentConfirmationTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        plan: paymentData.plan,
        transactionId: paymentData.transactionId,
        date: new Date().toLocaleDateString(),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@resumebuilder.com',
        ...options
      });

      const result = await this.sendEmail({
        to: user.email,
        subject: 'Payment Confirmation - Resume Builder',
        html,
        template: 'payment-confirmation'
      });

      loggerService.userAction('Payment confirmation email sent', {
        userId: user._id,
        email: user.email,
        amount: paymentData.amount,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to send payment confirmation email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send subscription welcome email
   */
  async sendSubscriptionWelcomeEmail(user, subscriptionData, options = {}) {
    try {
      const template = this.templates['subscription-welcome'] || this.getDefaultSubscriptionWelcomeTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: subscriptionData.plan,
        features: subscriptionData.features || [],
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@resumebuilder.com',
        ...options
      });

      const result = await this.sendEmail({
        to: user.email,
        subject: 'Welcome to Premium! 🚀',
        html,
        template: 'subscription-welcome'
      });

      loggerService.userAction('Subscription welcome email sent', {
        userId: user._id,
        email: user.email,
        plan: subscriptionData.plan,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to send subscription welcome email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(user, subject, message, type = 'info', options = {}) {
    try {
      const html = this.createNotificationTemplate({
        firstName: user.firstName,
        lastName: user.lastName,
        message,
        type,
        ...options
      });

      const result = await this.sendEmail({
        to: user.email,
        subject: `Resume Builder - ${subject}`,
        html,
        template: 'notification'
      });

      loggerService.userAction('Notification email sent', {
        userId: user._id,
        email: user.email,
        type,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to send notification email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send AI-generated content email
   */
  async sendAIContentEmail(user, contentData, options = {}) {
    try {
      const html = this.createAIContentTemplate({
        firstName: user.firstName,
        lastName: user.lastName,
        contentType: contentData.type,
        content: contentData.content,
        provider: contentData.provider,
        ...options
      });

      const result = await this.sendEmail({
        to: user.email,
        subject: `Your AI-Generated ${contentData.type} is Ready! ✨`,
        html,
        template: 'ai-content'
      });

      loggerService.userAction('AI content email sent', {
        userId: user._id,
        email: user.email,
        contentType: contentData.type,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to send AI content email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Core email sending method
   */
  async sendEmail(emailOptions) {
    await this.ensureInitialized();
    
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Resume Builder',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@resumebuilder.com'
        },
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: this.htmlToText(emailOptions.html),
        headers: {
          'X-Mailer': 'Resume Builder',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      const result = {
        success: true,
        messageId: info.messageId,
        response: info.response
      };

      // Add preview URL for Ethereal emails
      if (process.env.EMAIL_PROVIDER === 'ethereal' && info.preview) {
        result.previewUrl = info.preview;
      }

      loggerService.info('Email sent successfully', {
        to: emailOptions.to,
        subject: emailOptions.subject,
        template: emailOptions.template,
        messageId: info.messageId
      });

      return result;
    } catch (error) {
      loggerService.error('Failed to send email', {
        to: emailOptions.to,
        subject: emailOptions.subject,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Replace template variables
   */
  replaceTemplateVariables(template, variables) {
    let html = template;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, variables[key] || '');
    });
    
    return html;
  }

  /**
   * Convert HTML to plain text
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Create notification email template
   */
  createNotificationTemplate(data) {
    const typeColors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    const typeIcons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume Builder Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Resume Builder</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">${typeIcons[data.type] || 'ℹ️'}</div>
              <h2 style="color: ${typeColors[data.type] || '#3b82f6'}; margin: 0;">Notification</h2>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.firstName} ${data.lastName},</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${typeColors[data.type] || '#3b82f6'}; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">${data.message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>If you have any questions, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@resumebuilder.com'}" style="color: #667eea;">${process.env.SUPPORT_EMAIL || 'support@resumebuilder.com'}</a></p>
            <p>&copy; 2025 Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Create AI content email template
   */
  createAIContentTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your AI-Generated Content</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Resume Builder</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">✨</div>
              <h2 style="color: #667eea; margin: 0;">Your AI-Generated ${data.contentType} is Ready!</h2>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${data.firstName} ${data.lastName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Your AI-generated ${data.contentType} has been created successfully using ${data.provider} technology.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">Generated Content:</h3>
              <div style="white-space: pre-wrap; font-family: 'Courier New', monospace; background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">${data.content}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View in Dashboard</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Generated with AI technology • ${data.provider}</p>
            <p>If you have any questions, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@resumebuilder.com'}" style="color: #667eea;">${process.env.SUPPORT_EMAIL || 'support@resumebuilder.com'}</a></p>
            <p>&copy; 2025 Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: !!this.transporter,
      provider: process.env.EMAIL_PROVIDER || 'ethereal',
      templatesLoaded: Object.keys(this.templates).length,
      templates: Object.keys(this.templates)
    };
  }

  /**
   * Test email service
   */
  async testService() {
    try {
      await this.ensureInitialized();
      
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const testResult = await this.transporter.verify();
      return {
        success: testResult,
        message: testResult ? 'Email service is working' : 'Email service verification failed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Default templates (fallbacks)
  getDefaultWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Resume Builder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Welcome to Resume Builder, {{firstName}}!</h1>
        <p>Thank you for joining us. We're excited to help you create amazing resumes.</p>
        <p><a href="{{loginUrl}}">Get Started</a></p>
      </body>
      </html>
    `;
  }

  getDefaultPasswordResetTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Reset Your Password</h1>
        <p>Hello {{firstName}},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{{resetUrl}}">Reset Password</a></p>
        <p>This link will expire in {{expiryHours}} hours.</p>
      </body>
      </html>
    `;
  }

  getDefaultPaymentConfirmationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Payment Confirmed</h1>
        <p>Hello {{firstName}},</p>
        <p>Your payment of {{amount}} {{currency}} has been processed successfully.</p>
        <p>Transaction ID: {{transactionId}}</p>
        <p>Plan: {{plan}}</p>
      </body>
      </html>
    `;
  }

  getDefaultSubscriptionWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Premium</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Welcome to Premium, {{firstName}}!</h1>
        <p>You now have access to our {{plan}} plan with the following features:</p>
        <ul>
          {{#each features}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
        <p><a href="{{dashboardUrl}}">Access Your Dashboard</a></p>
      </body>
      </html>
    `;
  }
}

module.exports = new EnhancedEmailService();
