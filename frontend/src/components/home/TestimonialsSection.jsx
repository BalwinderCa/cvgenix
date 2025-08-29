import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiStar, FiMessageSquare } from 'react-icons/fi'

const TestimonialsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Google',
      rating: 5,
      quote: 'Resume4Me helped me create a professional resume that landed me my dream job at Google. The templates are amazing and the builder is so easy to use!',
      avatar: '/avatars/sarah.jpg'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'Microsoft',
      rating: 5,
      quote: 'I was struggling with my resume format. Resume4Me made it simple and professional. Got multiple interviews within weeks!',
      avatar: '/avatars/michael.jpg'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      company: 'Netflix',
      rating: 5,
      quote: 'The ATS optimization feature is a game-changer. My resume now gets through every screening system. Highly recommended!',
      avatar: '/avatars/emily.jpg'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Data Scientist',
      company: 'Amazon',
      rating: 5,
      quote: 'Clean, modern templates that stand out. The PDF export quality is excellent. Best resume builder I\'ve used.',
      avatar: '/avatars/david.jpg'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'UX Designer',
      company: 'Apple',
      rating: 5,
      quote: 'Perfect for creative professionals. The design templates are beautiful and the customization options are endless.',
      avatar: '/avatars/lisa.jpg'
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'Sales Manager',
      company: 'Salesforce',
      rating: 5,
      quote: 'From basic to professional in minutes. The step-by-step guidance made the process so smooth. Great results!',
      avatar: '/avatars/james.jpg'
    }
  ]

  const stats = [
    { number: '50,000+', label: 'Resumes Created' },
    { number: '95%', label: 'Success Rate' },
    { number: '4.9/5', label: 'User Rating' },
    { number: '24/7', label: 'Support' }
  ]

  return (
    <section className="section-padding bg-gradient-bg">
      <div className="container-max">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our Users{' '}
            <span className="gradient-text">Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who have successfully landed their dream jobs 
            with our resume builder.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary-200">
                <FiMessageSquare className="w-8 h-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to create your professional resume?
          </p>
          <a
            href="/templates"
            className="btn-primary inline-flex items-center"
          >
            Get Started Now
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsSection
