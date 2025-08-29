import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiArrowRight, FiCheck } from 'react-icons/fi'

const AboutSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const sellingPoints = [
    'Easy to use - No design skills required',
    'Modern templates - Professional and contemporary',
    'Free to start - Create your first resume for free',
    'Fast creation - Build resumes in under 5 minutes',
    'ATS optimized - Pass through applicant tracking systems',
    'Mobile friendly - Edit on any device'
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About{' '}
              <span className="gradient-text">Resume4Me</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're on a mission to help job seekers create resumes that get them hired. 
              Our platform combines cutting-edge technology with proven resume strategies 
              to give you the best chance of landing your dream job.
            </p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Founded in 2023, we've already helped over 50,000 professionals create 
              standout resumes and advance their careers. Our team of resume experts 
              and designers work tirelessly to ensure every template meets the highest standards.
            </p>

            {/* Selling Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {sellingPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4 text-success-600" />
                  </div>
                  <span className="text-gray-700">{point}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              to="/about-us"
              className="inline-flex items-center btn-primary group"
            >
              Learn More About Us
              <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main Image/Illustration */}
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-8 lg:p-12">
                <div className="aspect-square bg-white rounded-2xl shadow-large flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-white text-3xl font-bold">R</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Professional Resume Builder
                    </h3>
                    <p className="text-gray-600 max-w-sm">
                      Create stunning resumes that showcase your skills and experience 
                      in the best possible light.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center"
              >
                <span className="text-accent-600 font-bold text-lg">50+</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center"
              >
                <span className="text-primary-600 font-bold text-lg">95%</span>
              </motion.div>

              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/2 -right-8 w-12 h-12 bg-success-100 rounded-full flex items-center justify-center"
              >
                <span className="text-success-600 font-bold">✓</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
