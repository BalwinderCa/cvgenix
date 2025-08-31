import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  FiSearch, 
  FiEdit3, 
  FiDownload,
  FiArrowRight
} from 'react-icons/fi'

const StepsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const steps = [
    {
      id: 0,
      icon: FiSearch,
      title: 'Choose Your Template',
      description: 'Browse our collection of 50+ professional templates designed for different industries and experience levels.'
    },
    {
      id: 1,
      icon: FiEdit3,
      title: 'Fill in Your Details',
      description: 'Enter your personal information, work experience, education, and skills using our intuitive form.'
    },
    {
      id: 2,
      icon: FiDownload,
      title: 'Download & Apply',
      description: 'Download your professional resume in PDF format and start applying to your dream jobs.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      },
    },
  }

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Create a Standout Resume in Minutes –{' '}
            <span className="gradient-text">3 Easy Steps</span>
          </h2>
        </motion.div>

        {/* Simple Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className="text-center"
            >
              {/* Step Number */}
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg">
                {step.id + 1}
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-10 h-10 text-gray-700" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Create Your Resume?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who&apos;ve landed their dream jobs with our resumes.
            </p>
            <Link
              to="/templates"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Building Now
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default StepsSection
