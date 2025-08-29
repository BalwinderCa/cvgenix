import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiMail, FiArrowRight, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

const NewsletterSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Thank you for subscribing! Check your email for resume tips.')
      setEmail('')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    'Weekly resume writing tips',
    'Industry-specific advice',
    'Job market insights',
    'Template updates',
    'Exclusive discounts'
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-primary-600 to-accent-600">
      <div className="container-max">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Get Resume Tips & Updates
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Stay ahead of the competition with our weekly newsletter featuring 
                expert resume writing tips, industry insights, and exclusive content.
              </p>
            </div>

            {/* Newsletter Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 mb-12">
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-primary-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      'Subscribing...'
                    ) : (
                      <>
                        Subscribe
                        <FiArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-white/70 text-sm mt-4">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-3 text-white"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default NewsletterSection
