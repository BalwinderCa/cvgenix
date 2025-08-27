import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Users, 
  Globe,
  Calendar,
  CheckCircle
} from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = 'August 27, 2024';

  const sections = [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      icon: <Database className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect information you provide directly to us, such as when you create an account, build a resume, or contact us for support. This may include your name, email address, phone number, and resume content.'
        },
        {
          subtitle: 'Usage Information',
          text: 'We automatically collect certain information about your use of our services, including your IP address, browser type, operating system, pages visited, and time spent on our website.'
        },
        {
          subtitle: 'Device Information',
          text: 'We may collect information about the device you use to access our services, including device type, operating system, and browser settings.'
        }
      ]
    },
    {
      id: 'how-we-use-information',
      title: 'How We Use Your Information',
      icon: <Eye className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Provide Our Services',
          text: 'We use your information to provide, maintain, and improve our resume builder services, including processing your resume creation and downloads.'
        },
        {
          subtitle: 'Communication',
          text: 'We may use your contact information to send you important updates about our services, respond to your inquiries, and provide customer support.'
        },
        {
          subtitle: 'Analytics and Improvement',
          text: 'We analyze usage patterns to improve our website functionality, develop new features, and enhance user experience.'
        }
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing and Disclosure',
      icon: <Users className="w-6 h-6" />,
      content: [
        {
          subtitle: 'We Do Not Sell Your Data',
          text: 'Resume4Me does not sell, trade, or rent your personal information to third parties for marketing purposes.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We may share your information with trusted third-party service providers who assist us in operating our website, conducting business, or servicing you.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information if required by law or in response to valid legal requests, such as subpoenas or court orders.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Security Measures',
          text: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
        },
        {
          subtitle: 'Data Encryption',
          text: 'All data transmitted between your browser and our servers is encrypted using industry-standard SSL/TLS protocols.'
        },
        {
          subtitle: 'Access Controls',
          text: 'We limit access to your personal information to employees and contractors who need to know that information to provide our services.'
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Rights and Choices',
      icon: <CheckCircle className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Access and Update',
          text: 'You can access and update your personal information at any time through your account settings or by contacting us directly.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You can download your resume data and request a copy of your personal information in a portable format.'
        },
        {
          subtitle: 'Account Deletion',
          text: 'You can delete your account and all associated data at any time. Please note that this action is permanent and cannot be undone.'
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: <Globe className="w-6 h-6" />,
      content: [
        {
          subtitle: 'What Are Cookies',
          text: 'Cookies are small text files stored on your device that help us provide and improve our services. They enable certain features and remember your preferences.'
        },
        {
          subtitle: 'How We Use Cookies',
          text: 'We use cookies to authenticate users, remember your preferences, analyze site traffic, and provide personalized content and advertisements.'
        },
        {
          subtitle: 'Managing Cookies',
          text: 'You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.'
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
              <Shield className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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

      {/* Policy Content */}
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
              Questions About This Policy?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              If you have any questions about this Privacy Policy or our data practices, please contact us.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Contact Us</span>
              </a>
              <a 
                href="mailto:privacy@resume4me.com"
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <span>Email Privacy Team</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
