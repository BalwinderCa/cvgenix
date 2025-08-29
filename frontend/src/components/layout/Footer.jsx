import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiLinkedin,
  FiGithub,
  FiHeart
} from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Templates', path: '/templates' },
      { name: 'Resume Builder', path: '/template-edit/new' },
      { name: 'Features', path: '/#features' },
    ],
    company: [
      { name: 'About Us', path: '/about-us' },
      { name: 'Contact', path: '/contact-us' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'GDPR', path: '/gdpr' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', icon: FiFacebook, url: 'https://facebook.com' },
    { name: 'Twitter', icon: FiTwitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: FiInstagram, url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: FiLinkedin, url: 'https://linkedin.com' },
    { name: 'GitHub', icon: FiGithub, url: 'https://github.com' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-max">
        {/* Main Footer Content */}
        <div className="section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="text-2xl font-bold">Resume4Me</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Create professional resumes that stand out from the crowd. 
                Our modern templates and AI-powered suggestions help you 
                land your dream job faster.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <FiMail className="w-5 h-5 text-primary-400" />
                  <a 
                    href="mailto:hello@resume4me.com" 
                    className="hover:text-white transition-colors"
                  >
                    hello@resume4me.com
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <FiPhone className="w-5 h-5 text-primary-400" />
                  <a 
                    href="tel:+1234567890" 
                    className="hover:text-white transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="flex items-start space-x-3 text-gray-300">
                  <FiMapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                  <span>
                    123 Resume Street<br />
                    San Francisco, CA 94102
                  </span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="section-padding py-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-gray-400">
                <span>&copy; {currentYear} Resume4Me. All rights reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Made with</span>
                <FiHeart className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">for job seekers</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-all duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Legal Links */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex flex-wrap items-center justify-center space-x-6 text-sm text-gray-400">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
