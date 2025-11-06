const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: ['company', 'payment', 'other']
  },
  
  // Company Settings Fields (when type: 'company')
  companyName: {
    type: String,
    default: '',
    trim: true
  },
  companyEmail: {
    type: String,
    default: '',
    trim: true
  },
  companyPhone: {
    type: String,
    default: '',
    trim: true
  },
  companyAddress: {
    type: String,
    default: '',
    trim: true
  },
  companyCity: {
    type: String,
    default: '',
    trim: true
  },
  companyState: {
    type: String,
    default: '',
    trim: true
  },
  companyZip: {
    type: String,
    default: '',
    trim: true
  },
  companyCountry: {
    type: String,
    default: '',
    trim: true
  },
  companyWebsite: {
    type: String,
    default: '',
    trim: true
  },
  companyLogo: {
    type: String,
    default: '',
    trim: true
  },
  companyDescription: {
    type: String,
    default: '',
    trim: true
  },
  taxId: {
    type: String,
    default: '',
    trim: true
  },
  
  // Payment Settings Fields (when type: 'payment')
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  stripePublicKey: {
    type: String,
    default: ''
  },
  stripeSecretKey: {
    type: String,
    default: ''
  },
  stripeWebhookSecret: {
    type: String,
    default: ''
  },
  paypalClientId: {
    type: String,
    default: ''
  },
  paypalSecret: {
    type: String,
    default: ''
  },
  bankAccountName: {
    type: String,
    default: ''
  },
  bankAccountNumber: {
    type: String,
    default: ''
  },
  bankRoutingNumber: {
    type: String,
    default: ''
  },
  bankName: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'USD'
  },
  taxRate: {
    type: Number,
    default: 0
  },
  
  // Other Settings Fields (when type: 'other')
  siteName: {
    type: String,
    default: 'CVGenix Admin'
  },
  siteDescription: {
    type: String,
    default: ''
  },
  adminEmail: {
    type: String,
    default: ''
  },
  supportEmail: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY'
  },
  timeFormat: {
    type: String,
    default: '12h'
  },
  language: {
    type: String,
    default: 'en'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  openaiApiKey: {
    type: String,
    default: ''
  },
  claudeApiKey: {
    type: String,
    default: ''
  },
  otherApiKeys: [{
    type: String
  }]
}, {
  timestamps: true
});

// Static method to get company settings
SettingsSchema.statics.getCompanySettings = async function() {
  let settings = await this.findOne({ type: 'company' });
  if (!settings) {
    settings = await this.create({
      type: 'company',
      companyName: 'CVGenix',
      companyEmail: 'hello@cvgenix.com',
      companyPhone: '+1 (234) 567-890',
      companyAddress: '123 Resume Street',
      companyCity: 'San Francisco',
      companyState: 'CA',
      companyZip: '94102',
      companyCountry: 'United States',
      companyDescription: 'Create professional resumes that stand out from the crowd. Our modern templates and AI-powered suggestions help you land your dream job faster.'
    });
  }
  return settings;
};

module.exports = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

