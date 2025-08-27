import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Shield,
  Users
} from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = 'August 27, 2024';

  const sections = [
    {
      id: 'acceptance-of-terms',
      title: 'Acceptance of Terms',
      icon: <CheckCircle className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Agreement to Terms',
          text: 'By accessing and using Resume4Me, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        {
          subtitle: 'Modifications',
          text: 'We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last Updated" date.'
        }
      ]
    },
    {
      id: 'use-of-service',
      title: 'Use of Service',
      icon: <FileText className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Eligibility',
          text: 'You must be at least 18 years old to use our service. By using Resume4Me, you represent and warrant that you meet this age requirement.'
        },
        {
          subtitle: 'Account Registration',
          text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.'
        },
        {
          subtitle: 'Acceptable Use',
          text: 'You agree to use our service only for lawful purposes and in accordance with these Terms. You may not use the service to create resumes that contain false, misleading, or fraudulent information.'
        }
      ]
    },
    {
      id: 'user-content',
      title: 'User Content and Intellectual Property',
      icon: <Shield className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Your Content',
          text: 'You retain ownership of the content you create using our service. You grant us a limited license to store and process your content solely for the purpose of providing our services.'
        },
        {
          subtitle: 'Resume Templates',
          text: 'Our resume templates are protected by copyright and other intellectual property laws. You may use them to create your resumes, but you may not copy, modify, or distribute them for commercial purposes.'
        },
        {
          subtitle: 'Prohibited Content',
          text: 'You may not upload, create, or share content that is illegal, harmful, threatening, abusive, defamatory, or violates the rights of others.'
        }
      ]
    },
    {
      id: 'privacy-and-data',
      title: 'Privacy and Data Protection',
      icon: <Users className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Data Collection',
          text: 'We collect and process your personal data in accordance with our Privacy Policy. By using our service, you consent to such processing and warrant that all data provided is accurate.'
        },
        {
          subtitle: 'Data Security',
          text: 'We implement appropriate security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.'
        },
        {
          subtitle: 'Data Retention',
          text: 'We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.'
        }
      ]
    },
    {
      id: 'subscription-and-payment',
      title: 'Subscription and Payment Terms',
      icon: <Scale className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Free and Premium Services',
          text: 'We offer both free and premium subscription plans. Premium features require a paid subscription. All fees are non-refundable except as required by law.'
        },
        {
          subtitle: 'Billing and Renewal',
          text: 'Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings.'
        },
        {
          subtitle: 'Price Changes',
          text: 'We may change our pricing at any time. Price changes will be communicated in advance and will apply to the next billing cycle.'
        }
      ]
    },
    {
      id: 'limitations-and-disclaimers',
      title: 'Limitations and Disclaimers',
      icon: <AlertTriangle className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Service Availability',
          text: 'We strive to maintain high service availability but cannot guarantee uninterrupted access. We may temporarily suspend service for maintenance or updates.'
        },
        {
          subtitle: 'No Warranty',
          text: 'Our service is provided "as is" without warranties of any kind. We do not guarantee that your resume will result in employment or interviews.'
        },
        {
          subtitle: 'Limitation of Liability',
          text: 'In no event shall Resume4Me be liable for any indirect, incidental, special, or consequential damages arising from your use of our service.'
        }
      ]
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: <XCircle className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Your Right to Terminate',
          text: 'You may terminate your account at any time by deleting your account through the account settings or contacting our support team.'
        },
        {
          subtitle: 'Our Right to Terminate',
          text: 'We may terminate or suspend your account immediately if you violate these Terms or engage in fraudulent or illegal activities.'
        },
        {
          subtitle: 'Effect of Termination',
          text: 'Upon termination, your right to use the service ceases immediately. We may delete your account and data, though some information may be retained as required by law.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Please read these terms carefully before using Resume4Me
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    {section.icon}
                  </div>
                  <span className="font-medium text-gray-900">{section.title}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    {section.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
                </div>
                
                <div className="space-y-8">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-4 border-primary-200 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions About These Terms?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Contact Us</span>
              </a>
              <a 
                href="mailto:legal@resume4me.com"
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <span>Email Legal Team</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
