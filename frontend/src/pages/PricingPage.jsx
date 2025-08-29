import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useInView } from 'react-intersection-observer'
import { FiCheck, FiStar, FiArrowRight } from 'react-icons/fi'

const PricingPage = () => {
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
        'Mobile responsive',
        'Basic analytics'
      ],
      popular: false,
      cta: 'Get Started Free',
      link: '/template-edit/new',
      color: 'primary'
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
        '7-day free trial',
        'Unlimited resumes'
      ],
      popular: true,
      cta: 'Start Free Trial',
      link: '/signup',
      color: 'warning'
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For professionals and career coaches',
      features: [
        'Everything in Standard',
        'AI writing assistant',
        'Custom branding',
        'Team collaboration',
        'Priority support',
        'Advanced analytics',
        '7-day free trial',
        'White-label options'
      ],
      popular: false,
      cta: 'Start Free Trial',
      link: '/signup',
      color: 'accent'
    }
  ]

  const faqs = [
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your plan features until the end of your current billing period.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with our service, contact us within 30 days for a full refund.'
    },
    {
      question: 'Can I switch between plans?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, all paid plans come with a 7-day free trial. No credit card required to start your trial.'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Pricing - Resume4Me | Choose Your Plan</title>
        <meta name="description" content="Choose the perfect plan for your resume building needs. Free plan available, with premium features starting at $19/month." />
      </Helmet>

      <div className="pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Simple{' '}
                <span className="gradient-text">Pricing</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Choose the perfect plan for your career goals. 
                All plans include a 7-day free trial with no commitment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
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
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 max-w-2xl mx-auto">
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

        {/* FAQ Section */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get answers to common questions about our pricing and plans.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8 lg:p-12 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Create Your Professional Resume?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of job seekers who have already created professional resumes 
                  and landed their dream jobs with Resume4Me.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/template-edit/new"
                    className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center"
                  >
                    Start Building Now
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/templates"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    View Templates
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export default PricingPage
