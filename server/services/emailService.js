const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.initializeTransporter();
    this.loadTemplates();
  }

  initializeTransporter() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email configuration (using SendGrid, Mailgun, etc.)
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        // Development configuration (using Ethereal for testing)
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
          }
        });
      }

      // Email service initialized
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      
      if (fs.existsSync(templatesDir)) {
        const templateFiles = fs.readdirSync(templatesDir);
        
        templateFiles.forEach(file => {
          if (file.endsWith('.html')) {
            const templateName = file.replace('.html', '');
            const templatePath = path.join(templatesDir, file);
            this.templates[templateName] = fs.readFileSync(templatePath, 'utf8');
          }
        });
        
        // Email templates loaded
      }
    } catch (error) {
      console.error('❌ Template loading failed:', error);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@cvgenix.com',
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent (development mode):', result.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
      }

      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : null
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const template = this.templates['welcome'] || this.getDefaultWelcomeTemplate();
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        siteName: process.env.SITE_NAME || 'CVGenix',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        `Welcome to ${process.env.SITE_NAME || 'CVGenix'}!`,
        html
      );
    } catch (error) {
      console.error('❌ Welcome email failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const template = this.templates['password-reset'] || this.getDefaultPasswordResetTemplate();
      const resetUrl = `${process.env.SITE_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        resetUrl,
        siteName: process.env.SITE_NAME || 'CVGenix',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        'Password Reset Request',
        html
      );
    } catch (error) {
      console.error('❌ Password reset email failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetConfirmationEmail(user) {
    try {
      const template = this.templates['password-reset-confirmation'] || this.getDefaultPasswordResetConfirmationTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        siteName: process.env.SITE_NAME || 'CVGenix',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        'Password Reset Successful',
        html
      );
    } catch (error) {
      console.error('❌ Password reset confirmation email failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendNotificationEmail(user, subject, message, type = 'info') {
    try {
      const template = this.templates['notification'] || this.getDefaultNotificationTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        message,
        type,
        siteName: process.env.SITE_NAME || 'CVGenix',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        subject,
        html
      );
    } catch (error) {
      console.error('❌ Notification email failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendResumeAnalysisEmail(user, analysisData) {
    try {
      const template = this.templates['resume-analysis'] || this.getDefaultResumeAnalysisTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        score: analysisData.score || 0,
        recommendations: analysisData.recommendations || [],
        siteName: process.env.SITE_NAME || 'CVGenix',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        'Your Resume Analysis is Ready!',
        html
      );
    } catch (error) {
      console.error('❌ Resume analysis email failed:', error);
      return { success: false, error: error.message };
    }
  }

  replaceTemplateVariables(template, variables) {
    let html = template;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, variables[key] || '');
    });
    
    return html;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Default templates
  getDefaultWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to {{siteName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to {{siteName}}!</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>Thank you for joining {{siteName}}. We're excited to help you create professional resumes that stand out.</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>Browse our professional resume templates</li>
              <li>Create your first resume with our AI-powered builder</li>
              <li>Get your resume analyzed for ATS compatibility</li>
            </ul>
            <p style="text-align: center;">
              <a href="{{siteUrl}}" class="button">Get Started</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
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
        <title>Password Reset - {{siteName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .warning { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>We received a request to reset your password for your {{siteName}} account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="{{resetUrl}}" class="button">Reset Password</a>
            </p>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDefaultPasswordResetConfirmationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Successful - {{siteName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Successful</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <div class="success">
              <strong>Success!</strong> Your password has been successfully reset.
            </div>
            <p>You can now log in to your {{siteName}} account with your new password.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDefaultNotificationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notification - {{siteName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6B7280; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{siteName}} Notification</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>{{message}}</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDefaultResumeAnalysisTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resume Analysis Complete - {{siteName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .score { font-size: 2em; font-weight: bold; color: #3B82F6; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Resume Analysis is Ready!</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>Your resume analysis has been completed. Here's your ATS score:</p>
            <div class="score">{{score}}/100</div>
            <p>Log in to your account to view detailed recommendations and improve your resume.</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send subscription welcome email
  async sendSubscriptionWelcomeEmail(user, plan) {
    try {
      const template = this.templates['subscription-welcome'] || this.getDefaultSubscriptionWelcomeTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: plan,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
        supportUrl: `${process.env.FRONTEND_URL}/contact`,
        siteName: process.env.SITE_NAME || 'ResumeAI Pro',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        `Welcome to ${plan.name} Plan! 🎉`,
        html
      );
    } catch (error) {
      console.error('❌ Subscription welcome email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send payment confirmation email
  async sendPaymentConfirmationEmail(user, invoice) {
    try {
      const template = this.templates['payment-confirmation'] || this.getDefaultPaymentConfirmationTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        amount: (invoice.amount_paid / 100).toFixed(2),
        date: new Date(invoice.created * 1000).toLocaleDateString(),
        invoiceId: invoice.id,
        paymentMethod: invoice.payment_intent?.payment_method?.type || 'Card',
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        supportUrl: `${process.env.FRONTEND_URL}/contact`,
        siteName: process.env.SITE_NAME || 'ResumeAI Pro',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        'Payment Confirmation - ResumeAI Pro',
        html
      );
    } catch (error) {
      console.error('❌ Payment confirmation email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send payment failed email
  async sendPaymentFailedEmail(user, invoice) {
    try {
      const template = this.templates['payment-failed'] || this.getDefaultPaymentFailedTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        amount: (invoice.amount_due / 100).toFixed(2),
        date: new Date(invoice.created * 1000).toLocaleDateString(),
        invoiceId: invoice.id,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        billingUrl: `${process.env.FRONTEND_URL}/billing`,
        supportUrl: `${process.env.FRONTEND_URL}/contact`,
        siteName: process.env.SITE_NAME || 'ResumeAI Pro',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        'Payment Failed - Action Required',
        html
      );
    } catch (error) {
      console.error('❌ Payment failed email failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send subscription cancellation email
  async sendSubscriptionCancellationEmail(user) {
    try {
      const template = this.templates['subscription-cancellation'] || this.getDefaultSubscriptionCancellationTemplate();
      
      const html = this.replaceTemplateVariables(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        supportUrl: `${process.env.FRONTEND_URL}/contact`,
        resubscribeUrl: `${process.env.FRONTEND_URL}/pricing`,
        siteName: process.env.SITE_NAME || 'ResumeAI Pro',
        siteUrl: process.env.SITE_URL || 'http://localhost:3001'
      });

      return await this.sendEmail(
        user.email,
        'Subscription Cancelled - We\'ll Miss You!',
        html
      );
    } catch (error) {
      console.error('❌ Subscription cancellation email failed:', error);
      return { success: false, error: error.message };
    }
  }

  getDefaultSubscriptionWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .cta-button { background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to {{plan.name}}!</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>🎉 Congratulations! You've successfully upgraded to our <strong>{{plan.name}} plan</strong>.</p>
            <p>Your subscription is now active and you have access to all premium features.</p>
            <a href="{{dashboardUrl}}" class="cta-button">Access Your Dashboard</a>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDefaultPaymentConfirmationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .amount { font-size: 1.5em; font-weight: bold; color: #10B981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed! ✅</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>Your payment of <span class="amount">${{amount}}</span> has been successfully processed.</p>
            <p>Invoice ID: {{invoiceId}}</p>
            <p>Date: {{date}}</p>
            <p>Thank you for your subscription!</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDefaultPaymentFailedTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .cta-button { background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed ❌</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>We were unable to process your payment of ${{amount}}.</p>
            <p>Please update your payment method to continue your subscription.</p>
            <a href="{{billingUrl}}" class="cta-button">Update Payment Method</a>
            <p>If you need assistance, please contact our support team.</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDefaultSubscriptionCancellationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6B7280; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .cta-button { background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancelled</h1>
          </div>
          <div class="content">
            <h2>Hello {{firstName}} {{lastName}}!</h2>
            <p>We're sorry to see you go! Your subscription has been cancelled.</p>
            <p>You can still access your account and data. If you change your mind, you can resubscribe anytime.</p>
            <a href="{{resubscribeUrl}}" class="cta-button">Resubscribe</a>
            <p>Thank you for being a valued customer!</p>
            <p>Best regards,<br>The {{siteName}} Team</p>
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
      provider: process.env.NODE_ENV === 'production' ? (process.env.EMAIL_SERVICE || 'gmail') : 'ethereal',
      templatesLoaded: Object.keys(this.templates).length,
      templates: Object.keys(this.templates)
    };
  }

  /**
   * Test email service
   */
  async testService() {
    try {
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
}

module.exports = new EmailService();
