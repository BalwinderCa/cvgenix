import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiUpload, FiCheck, FiStar, FiDownload, FiZap } from 'react-icons/fi'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
            >
              <FiStar className="w-4 h-4 mr-2" />
              Trusted by 50,000+ professionals
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight"
            >
              Create Resumes That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Get You Hired
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-600 leading-relaxed max-w-2xl"
            >
              Build professional resumes in minutes with our AI-powered builder. 
              Choose from 50+ recruiter-approved templates and get hired faster.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-3">
                                 <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                   <FiZap className="w-4 h-4 text-green-600" />
                 </div>
                <div>
                  <p className="font-medium text-gray-900">AI Powered</p>
                  <p className="text-sm text-gray-500">Smart suggestions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                                 <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                   <FiDownload className="w-4 h-4 text-blue-600" />
                 </div>
                <div>
                  <p className="font-medium text-gray-900">Instant PDF</p>
                  <p className="text-sm text-gray-500">Ready to download</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                                 <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                   <FiCheck className="w-4 h-4 text-purple-600" />
                 </div>
                <div>
                  <p className="font-medium text-gray-900">50+ Templates</p>
                  <p className="text-sm text-gray-500">Professional designs</p>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/templates"
                className="inline-flex items-center justify-center px-8 py-4 btn-gradient"
              >
                Start Building Resume Now
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                to="/templates"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <FiUpload className="mr-2 w-5 h-5" />
                Import Existing Resume
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center space-x-8 pt-6 border-t border-gray-200"
            >
                             <div className="flex items-center space-x-2">
                 <div className="flex -space-x-1">
                   <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                   <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                   <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                 </div>
                 <span className="text-sm text-gray-600">Join 50K+ users</span>
               </div>
              
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">4.9/5 rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Resume Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
                         {/* Main Resume Card */}
             <div className="relative bg-white rounded-2xl shadow-2xl p-6 pb-8 transform rotate-2 hover:rotate-0 transition-transform duration-300 w-[90%] mx-auto">
               {/* Resume Header */}
                                <div className="border-b-2 border-gray-200 pb-4 mb-4">
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
                                           <h2 className="text-3xl font-bold text-gray-900 mb-2">Alex Rodriguez</h2>
                      <p className="text-xl text-orange-600 font-semibold mb-3">Full Stack Software Engineer</p>
                     <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                       <span className="flex items-center">
                         <span className="w-4 h-4 mr-2">📧</span>
                         alex.rodriguez@tech.com
                       </span>
                       <span className="flex items-center">
                         <span className="w-4 h-4 mr-2">📱</span>
                         (555) 987-6543
                       </span>
                       <span className="flex items-center">
                         <span className="w-4 h-4 mr-2">🌐</span>
                         linkedin.com/in/alexrodriguez
                       </span>
                     </div>
                   </div>
                                       <div className="ml-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        AR
                      </div>
                    </div>
                 </div>
               </div>
               
               {/* Resume Content */}
               <div className="space-y-4">
                                    <div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                       <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                       Professional Experience
                     </h3>
                                        <div className="space-y-4">
                       <div className="border-l-4 border-orange-500 pl-4">
                         <p className="font-semibold text-gray-800 text-lg">Senior Software Engineer - Google</p>
                         <p className="text-gray-600 mb-1">2021 - Present</p>
                         <p className="text-gray-700 text-sm">Developed scalable microservices architecture serving 10M+ users daily</p>
                       </div>
                       <div className="border-l-4 border-gray-300 pl-4">
                         <p className="font-semibold text-gray-800 text-lg">Software Engineer - Microsoft</p>
                         <p className="text-gray-600 mb-1">2019 - 2021</p>
                         <p className="text-gray-700 text-sm">Built cloud infrastructure solutions reducing deployment time by 60%</p>
                       </div>
                     </div>
                 </div>
                 
                                    <div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                       <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                       Skills
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">JavaScript</span>
                       <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">Python</span>
                       <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">React</span>
                       <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">Node.js</span>
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">AWS</span>
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">Docker</span>
                     </div>
                   </div>
                 
                                    <div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                       <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                       Education
                     </h3>
                     <div className="border-l-4 border-orange-500 pl-4">
                       <p className="font-semibold text-gray-800">BS Computer Science - Stanford University</p>
                       <p className="text-gray-600">2019</p>
                     </div>
                   </div>
               </div>
             </div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -top-4 -right-4 bg-green-500 text-white p-4 rounded-full shadow-lg"
            >
              <FiCheck className="w-6 h-6" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-4 rounded-full shadow-lg"
            >
              <FiDownload className="w-6 h-6" />
            </motion.div>

            {/* Success Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -bottom-8 right-8 bg-white rounded-xl p-4 shadow-lg border border-gray-200"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
