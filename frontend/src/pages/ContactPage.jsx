import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useInView } from 'react-intersection-observer'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock,
  FiSend,
  FiCheck
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  subject: yup.string().required('Subject is required'),
  message: yup.string().min(10, 'Message must be at least 10 characters').required('Message is required'),
}).required()

const ContactPage = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      value: 'hello@resume4me.com',
      link: 'mailto:hello@resume4me.com'
    },
    {
      icon: FiPhone,
      title: 'Phone',
      value: '+1 (234) 567-890',
      link: 'tel:+1234567890'
    },
    {
      icon: FiMapPin,
      title: 'Address',
      value: '123 Resume Street, San Francisco, CA 94102',
      link: null
    },
    {
      icon: FiClock,
      title: 'Working Hours',
      value: 'Monday - Friday: 9:00 AM - 6:00 PM PST',
      link: null
    }
  ]

  return (
    <>
      <Helmet>
        <title>Contact Us - Resume4Me | Get in Touch</title>
        <meta name="description" content="Get in touch with the Resume4Me team. We're here to help you create the perfect resume." />
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
                Get in{' '}
                <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Have questions about our resume builder? Need help with your resume? 
                We're here to help you succeed in your career journey.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <div className="card">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          id="name"
                          className="input-field"
                          placeholder="John Doe"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          id="email"
                          className="input-field"
                          placeholder="john@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        {...register('subject')}
                        type="text"
                        id="subject"
                        className="input-field"
                        placeholder="How can we help you?"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        {...register('message')}
                        id="message"
                        rows={6}
                        className="input-field resize-none"
                        placeholder="Tell us more about your question or request..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                    <p className="text-lg text-gray-600 mb-8">
                      We're here to help you create the perfect resume. 
                      Reach out to us through any of the following channels.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                          {info.link ? (
                            <a
                              href={info.link}
                              className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-gray-600">{info.value}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* FAQ Link */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Need Quick Help?</h3>
                    <p className="text-gray-600 mb-4">
                      Check out our frequently asked questions for quick answers to common questions.
                    </p>
                    <a
                      href="/faq"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                    >
                      View FAQ
                      <FiCheck className="w-4 h-4 ml-2" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section (Optional) */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Our Office</h2>
              <p className="text-lg text-gray-600 mb-8">
                Located in the heart of San Francisco, our office is open for meetings and consultations.
              </p>
              
              {/* Placeholder for map */}
              <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMapPin className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600">Interactive Map Coming Soon</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export default ContactPage
