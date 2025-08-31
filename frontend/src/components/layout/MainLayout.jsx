import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from '../home/components/Footer'

const MainLayout = ({ children }) => {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  return (
    <>
      {!isDashboard && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  )
}

export default MainLayout
