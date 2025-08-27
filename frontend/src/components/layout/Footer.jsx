import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Heart, 
  Mail, 
  Phone, 
  MapPin,
  Twitter,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <defs>
                    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#A855F7', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#6366F1', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <rect x="5" y="4" width="14" height="16" rx="1.5" fill="white" opacity="0.95"/>
                  <rect x="7" y="6" width="10" height="1.5" fill="url(#textGradient)" rx="0.75"/>
                  <rect x="7" y="9" width="8" height="0.75" fill="#64748B" rx="0.375"/>
                  <rect x="7" y="10.5" width="7" height="0.75" fill="#94A3B8" rx="0.375"/>
                  <rect x="7" y="12" width="8" height="0.75" fill="#94A3B8" rx="0.375"/>
                  <rect x="7" y="13.5" width="6" height="0.75" fill="#94A3B8" rx="0.375"/>
                  <rect x="7" y="15" width="7" height="0.75" fill="#94A3B8" rx="0.375"/>
                  <path d="M 17 4 L 19 6 L 17 6 Z" fill="#F1F5F9"/>
                  <text x="12" y="19" fontFamily="Arial, sans-serif" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="url(#textGradient)">R4M</text>
                </svg>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                Resume4Me
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Transform your career with Resume4Me's AI-powered resume builder. Create stunning, 
              ATS-optimized resumes that get you noticed by top employers worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-tight">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/templates" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-tight">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">hello@resume4me.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Resume4Me. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
              Made with <Heart className="w-4 h-4 mx-1 text-pink-500" /> for professionals
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
