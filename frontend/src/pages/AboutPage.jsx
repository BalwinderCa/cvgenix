import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useInView } from 'react-intersection-observer'
import { 
  FiUsers, 
  FiAward, 
  FiTrendingUp, 
  FiHeart,
  FiTarget,
  FiEye,
  FiZap
} from 'react-icons/fi'

const AboutPage = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      bio: 'Former HR Director with 10+ years experience in talent acquisition and resume optimization.',
      avatar: '/team/alex.jpg'
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Design',
      bio: 'Award-winning designer specializing in user experience and visual design for career platforms.',
      avatar: '/team/sarah.jpg'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Lead Developer',
      bio: 'Full-stack developer passionate about creating intuitive and powerful resume building tools.',
      avatar: '/team/michael.jpg'
    },
    {
      name: 'Emily Wang',
      role: 'Content Strategist',
      bio: 'Career coach and resume expert with deep knowledge of industry best practices.',
      avatar: '/team/emily.jpg'
    }
  ]

  const achievements = [
    {
      year: '2023',
      title: 'Company Founded',
      description: 'Resume4Me was launched with a mission to help job seekers create standout resumes.'
    },
    {
      year: '2023',
      title: '10,000+ Resumes Created',
      description: 'Reached our first major milestone of helping 10,000 professionals build their careers.'
    },
    {
      year: '2024',
      title: '50+ Templates',
      description: 'Expanded our template library to over 50 professionally designed options.'
    },
    {
      year: '2024',
      title: '50,000+ Users',
      description: 'Grew our user base to over 50,000 satisfied customers worldwide.'
    }
  ]

  const values = [
    {
      icon: FiTarget,
      title: 'User-First Approach',
      description: 'Everything we do is designed to help our users succeed in their career goals.'
    },
    {
      icon: FiEye,
      title: 'Transparency',
      description: 'We believe in being open and honest about our processes and services.'
    },
    {
      icon: FiZap,
      title: 'Innovation',
      description: 'We continuously improve our platform with the latest technology and best practices.'
    },
    {
      icon: FiHeart,
      title: 'Empathy',
      description: 'We understand the challenges of job hunting and design our tools accordingly.'
    }
  ]

  return (
    <>
      <Helmet>
        <title>About Us - Resume4Me | Our Mission & Team</title>
        <meta name="description" content="Learn about Resume4Me's mission to help job seekers create professional resumes. Meet our team of experts dedicated to your career success." />
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
                About{' '}
                <span className="gradient-text">Resume4Me</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                We're on a mission to democratize professional resume creation and help 
                job seekers worldwide land their dream jobs through innovative technology 
                and proven strategies.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">50K+</div>
                  <div className="text-gray-600">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                  <div className="text-gray-600">Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
                  <div className="text-gray-600">Support</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  At Resume4Me, we believe that everyone deserves access to professional 
                  resume building tools that can help them advance their careers. Our 
                  mission is to empower job seekers with the tools, knowledge, and 
                  confidence they need to stand out in today's competitive job market.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We combine cutting-edge technology with proven resume writing strategies 
                  to create a platform that's both powerful and easy to use. Whether 
                  you're a recent graduate or an experienced professional, our tools 
                  are designed to help you showcase your skills and experience in the 
                  best possible light.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-8 lg:p-12"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiTarget className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Empowering Careers
                  </h3>
                  <p className="text-gray-600">
                    We're committed to helping job seekers create resumes that not only 
                    look professional but also effectively communicate their value to 
                    potential employers.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These core values guide everything we do and shape how we serve our users.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our team of experts is passionate about helping you succeed in your career journey.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white font-bold text-2xl">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="section-padding bg-gradient-bg">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Key milestones in our mission to help job seekers succeed.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="flex-1 text-center">
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                      <div className="text-2xl font-bold text-primary-600 mb-2">
                        {achievement.year}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-primary-500 rounded-full mx-8"></div>
                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AboutPage
