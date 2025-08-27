import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Download, 
  Palette, 
  User, 
  Shield, 
  Mail, 
  MessageCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Video,
  HelpCircle
} from 'lucide-react';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategory, setOpenCategory] = useState('getting-started');

  const faqData = {
    'getting-started': [
      {
        question: "How do I create my first resume?",
        answer: "Creating your first resume is easy! Simply sign up for a free account, choose a template that matches your style, and start filling in your information. Our step-by-step builder will guide you through the process."
      },
      {
        question: "What information should I include in my resume?",
        answer: "Your resume should include your contact information, professional summary, work experience, education, skills, and any relevant certifications or achievements. Our templates are designed to help you organize this information effectively."
      },
      {
        question: "How long should my resume be?",
        answer: "For most professionals, a one-page resume is ideal. However, if you have extensive experience (10+ years), a two-page resume may be appropriate. Our templates automatically adjust to your content."
      }
    ],
    'templates': [
      {
        question: "How many templates are available?",
        answer: "We offer 50+ professionally designed templates across various categories including Modern, Classic, Creative, Minimal, Executive, and Tech-focused designs. New templates are added regularly."
      },
      {
        question: "Can I customize the colors and fonts?",
        answer: "Yes! All templates are fully customizable. You can change colors, fonts, spacing, and layout to match your personal brand and industry requirements."
      },
      {
        question: "Are the templates ATS-friendly?",
        answer: "Absolutely! All our templates are designed to pass through Applicant Tracking Systems (ATS). They use clean formatting, standard fonts, and proper structure to ensure maximum compatibility."
      }
    ],
    'export': [
      {
        question: "What file formats can I export my resume in?",
        answer: "You can export your resume as a PDF, which is the most widely accepted format for job applications. PDFs maintain formatting across all devices and platforms."
      },
      {
        question: "How do I download my resume?",
        answer: "Once you've finished editing your resume, simply click the 'Download' button in the builder. Your resume will be automatically generated and downloaded as a high-quality PDF file."
      },
      {
        question: "Can I share my resume online?",
        answer: "Yes! You can generate a shareable link for your resume that you can send to employers or include in your job applications. The link will display your resume in a professional format."
      }
    ],
    'account': [
      {
        question: "How do I reset my password?",
        answer: "If you've forgotten your password, click the 'Forgot Password' link on the login page. Enter your email address and we'll send you a secure link to reset your password."
      },
      {
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account at any time from your profile settings. Please note that this action is permanent and will delete all your resumes and data."
      },
      {
        question: "Is my data secure?",
        answer: "We take data security seriously. All your information is encrypted and stored securely. We never share your personal data with third parties without your explicit consent."
      }
    ]
  };

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Learn the basics of creating your first resume'
    },
    {
      id: 'templates',
      title: 'Templates & Design',
      icon: <Palette className="w-5 h-5" />,
      description: 'Everything about our templates and customization'
    },
    {
      id: 'export',
      title: 'Export & Download',
      icon: <Download className="w-5 h-5" />,
      description: 'How to save and share your resumes'
    },
    {
      id: 'account',
      title: 'Account & Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Managing your account and data security'
    }
  ];

  const filteredFAQs = Object.entries(faqData).reduce((acc, [category, faqs]) => {
    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How can we help you?
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find answers to common questions and learn how to make the most of Resume4Me
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => setOpenCategory(category.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {Object.entries(filteredFAQs).map(([categoryId, faqs]) => {
            const category = categories.find(c => c.id === categoryId);
            return (
              <motion.div
                key={categoryId}
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HelpCircle className="w-16 h-16 text-primary-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@resume4me.com"
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Mail className="w-5 h-5" />
                <span>Email Support</span>
              </a>
              <a 
                href="/contact"
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Us</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
