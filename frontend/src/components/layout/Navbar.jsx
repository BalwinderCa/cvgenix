import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  FileText,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent tracking-tight">
              Resume4Me
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="relative px-3 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 group"
              >
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
              <Link 
                to="/templates" 
                className="relative px-3 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 group"
              >
                <span className="relative z-10">Templates</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            </div>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="relative px-3 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 group"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <div className="relative">
                  <Link 
                    to="/builder" 
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Resume
                  </Link>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full blur opacity-30"></div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                                  <Link 
                    to="/login" 
                    className="relative px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 group"
                  >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <div className="relative">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full blur opacity-30"></div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 rounded-lg transition-all duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-6 space-y-3 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-md border-t border-indigo-100/50 rounded-b-2xl shadow-xl">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Link 
                  to="/" 
                  className="block px-4 py-3 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 rounded-xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/templates" 
                  className="block px-4 py-3 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 rounded-xl hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Templates
                </Link>
              </div>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-3 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 rounded-xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="relative">
                    <Link 
                      to="/builder" 
                      className="block px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Create Resume
                    </Link>
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-xl blur opacity-30"></div>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-4 py-3 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-200 rounded-xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <div className="relative">
                    <Link 
                      to="/register" 
                      className="block px-4 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-xl blur opacity-30"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
