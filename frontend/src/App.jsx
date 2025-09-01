import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './contexts/AuthContext'
import { ResumeProvider } from './contexts/ResumeContext'

// Layout Components
import MainLayout from './components/layout/MainLayout'
import ScrollToTop from './components/common/ScrollToTop'
import LoadingSpinner from './components/common/LoadingSpinner'

// Page Components
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import TemplatesPage from './pages/TemplatesPage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'
import ATSScorePage from './pages/ATSScorePage'
import AdminDashboard from './pages/AdminDashboard'
import AdminLoginPage from './pages/AdminLoginPage'
import UserDashboard from './pages/UserDashboard'

import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

// Auth Components
import LoginModal from './components/auth/LoginModal'
import SignupModal from './components/auth/SignupModal'

function AppContent() {
  const { 
    isAuthenticated, 
    user, 
    loading,
    showLoginModal, 
    showSignupModal, 
    openLoginModal, 
    openSignupModal, 
    closeLoginModal, 
    closeSignupModal,
    switchToSignup,
    switchToLogin
  } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Helmet>
        <title>Resume4Me - Professional Resume Builder</title>
        <meta name="description" content="Create professional resumes with our modern resume builder. Free templates, AI-powered suggestions, and instant PDF downloads." />
        <meta name="keywords" content="resume builder, CV maker, professional resume, free resume templates, PDF resume" />
        <meta name="author" content="Resume4Me" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://resume4me.com/" />
        <meta property="og:title" content="Resume4Me - Professional Resume Builder" />
        <meta property="og:description" content="Create professional resumes with our modern resume builder. Free templates, AI-powered suggestions, and instant PDF downloads." />
        <meta property="og:image" content="https://resume4me.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://resume4me.com/" />
        <meta property="twitter:title" content="Resume4Me - Professional Resume Builder" />
        <meta property="twitter:description" content="Create professional resumes with our modern resume builder. Free templates, AI-powered suggestions, and instant PDF downloads." />
        <meta property="twitter:image" content="https://resume4me.com/og-image.jpg" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Admin routes - no header/footer */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Regular routes - with header/footer */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/about-us" element={<MainLayout><AboutPage /></MainLayout>} />
          <Route path="/templates" element={<MainLayout><TemplatesPage /></MainLayout>} />
          <Route path="/template-edit/:id" element={<MainLayout><ResumeBuilderPage /></MainLayout>} />
          <Route path="/ats-score" element={<MainLayout><ATSScorePage /></MainLayout>} />
          <Route path="/dashboard" element={<MainLayout><UserDashboard /></MainLayout>} />
          <Route path="/contact-us" element={<MainLayout><ContactPage /></MainLayout>} />
          <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
        </Routes>
        
        <ScrollToTop />

        {/* Auth Modals */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={closeLoginModal} 
          onSwitchToSignup={switchToSignup} 
        />
        <SignupModal 
          isOpen={showSignupModal} 
          onClose={closeSignupModal} 
          onSwitchToLogin={switchToLogin} 
        />
      </div>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <AppContent />
      </ResumeProvider>
    </AuthProvider>
  )
}

export default App
