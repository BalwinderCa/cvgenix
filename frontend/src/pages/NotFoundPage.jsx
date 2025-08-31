import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi'

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Resume4Me</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Resume4Me homepage." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-bg pt-16">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* 404 Illustration */}
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiSearch className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-8xl md:text-9xl font-bold text-gray-900 mb-4">
                  404
                </h1>
              </div>

              {/* Error Message */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Oops! The page you're looking for doesn't exist. 
                It might have been moved, deleted, or you entered the wrong URL.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/"
                  className="btn-primary flex items-center justify-center w-full sm:w-auto"
                >
                  <FiHome className="w-5 h-5 mr-2" />
                  Go to Homepage
                </Link>
                
                <button
                  onClick={() => window.history.back()}
                  className="btn-secondary flex items-center justify-center w-full sm:w-auto"
                >
                  <FiArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </button>
              </div>

              {/* Quick Links */}
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Popular Pages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Templates', path: '/templates', description: 'Browse our templates' },
                    { name: 'About', path: '/about-us', description: 'Learn about us' },
                    { name: 'Contact', path: '/contact-us', description: 'Get in touch' }
                  ].map((page, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Link
                        to={page.path}
                        className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                      >
                        <h4 className="font-semibold text-gray-900 mb-1">{page.name}</h4>
                        <p className="text-sm text-gray-600">{page.description}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Help Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <a
                    href="/contact-us"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    Contact Support
                  </a>
                  <span className="text-gray-400">•</span>
                  <a
                    href="/faq"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    View FAQ
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFoundPage
