import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiUser, FiLogOut, FiHeart } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import LoginModal from '../auth/LoginModal'
import SignupModal from '../auth/SignupModal'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { 
    user, 
    isAuthenticated, 
    logout, 
    openLoginModal, 
    openSignupModal,
    showLoginModal,
    showSignupModal,
    closeLoginModal,
    closeSignupModal
  } = useAuth()
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const navItems = [
    { name: 'Homepage', path: '/' },
    { name: 'Resume Templates', path: '/templates' },
    { name: 'Cover Letter', path: '/cover-letter' },
    { name: 'ATS Score', path: '/ats-score' },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-medium border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="container-max">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg lg:text-xl">R</span>
              </div>
              <span className="text-xl lg:text-2xl font-bold gradient-text">
                Resume4Me
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-orange-600'
                      : isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-900 hover:text-orange-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Buy Me a Coffee Link */}
              <a
                href="https://www.buymeacoffee.com/resume4me"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-200 hover:scale-105 ${
                  isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-900 hover:text-orange-600'
                }`}
              >
                <FiHeart className="w-4 h-4 text-red-500" />
                <span>Buy Me a Coffee</span>
              </a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Admin Login Link - Always visible */}
              <Link
                to="/admin/login"
                className={`text-xs text-gray-500 hover:text-gray-700 transition-colors ${
                  isScrolled ? 'text-gray-400' : 'text-gray-500'
                }`}
                title="Admin Login"
              >
                Admin
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Credits Display */}
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    isScrolled 
                      ? 'bg-gray-100 text-gray-700' 
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200'
                  }`}>
                    <span>Credits:</span>
                    <span className="text-orange-600 font-bold">{user?.credits || 3}</span>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium transition-colors duration-200 hover:text-orange-600"
                  >
                    My Account
                  </Link>
                  
                  <Link
                    to="/template-edit/new"
                    className="btn-primary text-sm"
                  >
                    Build My Resume
                  </Link>
                  <div className="relative group">
                    <button className={`flex items-center space-x-2 transition-colors ${
                      isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-900 hover:text-orange-600'
                    }`}>
                      <FiUser className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {user?.firstName || 'User'}
                      </span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-large border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        {['admin', 'super_admin'].includes(user?.role) && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={openLoginModal}
                    className={`text-sm font-medium transition-colors ${
                      isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-900 hover:text-orange-600'
                    }`}
                  >
                    Sign/Login
                  </button>
                  <Link
                    to="/template-edit/new"
                    className="btn-primary text-sm"
                  >
                    Build My Resume
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-900 hover:text-orange-600'
              }`}
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100"
            >
              <div className="container-max py-4">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`text-base font-medium transition-colors duration-200 ${
                        location.pathname === item.path
                          ? 'text-orange-600'
                          : 'text-gray-700 hover:text-orange-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Buy Me a Coffee Link - Mobile */}
                  <a
                    href="https://www.buymeacoffee.com/resume4me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    <FiHeart className="w-4 h-4 text-red-500" />
                    <span>Buy Me a Coffee</span>
                  </a>
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {/* Admin Login Link - Mobile */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <Link
                      to="/admin/login"
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Admin Login
                    </Link>
                  </div>
                  
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-4">
                      {/* Credits Display - Mobile */}
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Credits:</span>
                        <span className="text-orange-600 font-bold">{user?.credits || 3}</span>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        className="text-base font-medium text-gray-700 hover:text-orange-600 transition-colors text-center"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/template-edit/new"
                        className="btn-primary text-center"
                      >
                        Build My Resume
                      </Link>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Welcome, {user?.firstName || 'User'}
                        </span>
                        <button
                          onClick={handleLogout}
                          className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={openLoginModal}
                        className="text-base font-medium text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        Sign/Login
                      </button>
                      <Link
                        to="/template-edit/new"
                        className="btn-primary text-center"
                      >
                        Build My Resume
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        onSwitchToSignup={openSignupModal}
      />
      
      <SignupModal
        isOpen={showSignupModal}
        onClose={closeSignupModal}
        onSwitchToLogin={openLoginModal}
      />
    </>
  )
}

export default Header
