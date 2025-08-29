import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  FiZap, 
  FiTrendingUp, 
  FiAward, 
  FiSmartphone,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiShield
} from 'react-icons/fi'

const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const features = [
    {
      icon: FiZap,
      title: 'AI-Powered Writing',
      description: 'Get intelligent suggestions for your resume content with our advanced AI that understands industry standards.',
      benefits: ['Smart content suggestions', 'Industry-specific keywords', 'Grammar and style improvements']
    },
    {
      icon: FiTrendingUp,
      title: 'Productivity Boost',
      description: 'Create professional resumes in minutes, not hours. Our streamlined process saves you time and effort.',
      benefits: ['5-minute resume creation', 'Auto-save functionality', 'Quick template switching']
    },
    {
      icon: FiAward,
      title: 'Recruiter-Approved',
      description: 'All our templates are designed and tested by HR professionals to ensure they pass ATS systems.',
      benefits: ['ATS-optimized layouts', 'Industry best practices', 'Professional formatting']
    },
    {
      icon: FiSmartphone,
      title: 'Modern Templates',
      description: 'Choose from 50+ beautiful, modern templates that stand out and make a lasting impression.',
      benefits: ['Contemporary designs', 'Mobile-responsive', 'Customizable colors']
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose{' '}
            <span className="text-orange-600">Resume4Me?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with proven resume strategies 
            to help you create resumes that get noticed by recruiters and hiring managers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-orange-600" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>

              {/* Benefits */}
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                    <FiCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiDownload className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Instant Download</h4>
            <p className="text-gray-600">Get your resume in PDF format instantly, ready to send to employers.</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h4>
            <p className="text-gray-600">Your data is encrypted and secure. We never share your personal information.</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h4>
            <p className="text-gray-600">Get help whenever you need it with our round-the-clock customer support.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection
