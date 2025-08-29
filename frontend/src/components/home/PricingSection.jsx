import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiCheck, FiStar } from 'react-icons/fi'

const PricingSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const plans = [
    {
      name: 'Beginner',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for getting started with resume building',
      features: [
        '1 resume template',
        'Basic editing tools',
        'PDF download',
        'Email support',
        'Mobile responsive'
      ],
      popular: false,
      cta: 'Get Started Free',
      link: '/template-edit/new'
    },
    {
      name: 'Standard',
      price: '$19',
      period: 'per month',
      description: 'Great for active job seekers',
      features: [
        'All 50+ templates',
        'Advanced editing tools',
        'Multiple formats (PDF, Word, TXT)',
        'Priority support',
        'Resume analytics',
        'Cover letter builder',
        '7-day free trial'
      ],
      popular: true,
      cta: 'Start Free Trial',
      link: '/pricing'
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For professionals and career coaches',
      features: [
        'Everything in Standard',
        'Unlimited resumes',
        'AI writing assistant',
        'Custom branding',
        'Team collaboration',
        'Priority support',
        '7-day free trial'
      ],
      popular: false,
      cta: 'Start Free Trial',
      link: '/pricing'
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
    <section className="section-padding bg-gradient-bg">
      <div className="container-max">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple{' '}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your career goals. 
            All plans include a 7-day free trial with no commitment.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-warning-500 to-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center">
                    <FiStar className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`card h-full ${plan.popular ? 'ring-2 ring-warning-500 shadow-large' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period !== 'forever' && (
                        <span className="text-gray-500 ml-1">/{plan.period}</span>
                      )}
                    </div>
                    {plan.period === 'forever' && (
                      <span className="text-gray-500 text-sm">forever</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <FiCheck className="w-3 h-3 text-success-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <Link
                    to={plan.link}
                    className={`w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-warning-500 to-orange-500 text-white hover:from-warning-600 hover:to-orange-600 transform hover:scale-105'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-soft p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Questions about pricing?
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help you choose the right plan for your needs. 
              Contact us for personalized recommendations.
            </p>
            <Link
              to="/contact-us"
              className="btn-outline"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection
