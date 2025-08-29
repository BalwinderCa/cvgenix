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
      number: '01',
      icon: FiSearch,
      title: 'Choose Template',
      description: 'Browse our collection of 50+ professional templates designed for different industries and experience levels.',
      color: 'primary'
    },
    {
      number: '02',
      icon: FiEdit3,
      title: 'Fill Your Details',
      description: 'Enter your personal information, work experience, education, and skills using our intuitive form.',
      color: 'accent'
    },
    {
      number: '03',
      icon: FiDownload,
      title: 'Download & Apply',
      description: 'Download your professional resume in PDF format and start applying to your dream jobs.',
      color: 'success'
    }
  ]

  const colorClasses = {
    primary: 'from-orange-500 to-red-500',
    accent: 'from-blue-500 to-purple-500',
    success: 'from-green-500 to-emerald-500'
  }

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
    <section className="py-20 bg-white">
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
            How It{' '}
            <span className="text-orange-600">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create your professional resume in just 3 simple steps. 
            Our streamlined process makes resume building quick and easy.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connecting Lines */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gray-200 transform -translate-y-1/2 z-0"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative z-10 text-center"
            >
              {/* Step Number */}
              <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[step.color]} rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg`}>
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-gray-100">
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
          className="text-center mt-16"
        >
          <Link
            to="/templates"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Building Now
            <FiArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default StepsSection
