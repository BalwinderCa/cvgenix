"use client";

import * as React from "react";
import Link from "next/link";
import { Columns3, LayoutPanelTop, PenLine, GripVertical, Download, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";

export interface HeroSectionProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryHref?: string;
  secondaryHref?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export default function HeroSection({
  className,
  style,
  title = "Create a professional resume in minutes with CVGenix",
  subtitle = "Build ATS-optimized resumes with elegant templates and a guided editor. Save time, stand out to recruiters, and land more interviews.",
  primaryLabel = "Build My Resume",
  secondaryLabel = "Import my existing resume",
  primaryHref = "/resume-builder",
  secondaryHref = "/resume-builder",
  onPrimaryClick,
  onSecondaryClick
}: HeroSectionProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [signupModalOpen, setSignupModalOpen] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);
  return (
    <section
      className={["w-full relative overflow-hidden border-gray-300", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Hero">

      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient - removed */}
        
         {/* Animated gradient orbs */}
         <div className="absolute inset-0">
           <motion.div
             className="absolute w-80 h-80 rounded-full opacity-12 blur-3xl"
             style={{
               background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-primary))',
               right: '15%',
               top: '30%'
             }}
             animate={{
               x: [0, -120, 80, 0],
               y: [0, 100, -60, 0],
               scale: [1, 0.9, 1.3, 1],
             }}
             transition={{
               duration: 25,
               repeat: Infinity,
               ease: "easeInOut",
               delay: 2
             }}
           />
         </div>

         {/* Floating particles - commented out */}

        {/* Additional sparkle particles */}
        <div className="absolute inset-0">
          {[...Array(32)].map((_, i) => {
            const size = Math.random() * 2 + 0.5; // 0.5-2.5px
            const colors = ['#fbbf24', '#f59e0b', '#d97706', 'var(--color-primary)', 'var(--color-secondary)'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.8,
                  borderRadius: '50%',
                  boxShadow: `0 0 ${size * 3}px ${color}`,
                }}
                animate={{
                  y: [0, -120, 0],
                  x: [0, Math.random() * 60 - 30, 0],
                  opacity: [0.8, 0.2, 0.8],
                  scale: [1, 0.3, 1.8, 1],
                }}
                transition={{
                  duration: 6 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 6,
                }}
              />
            );
          })}
        </div>

        {/* Animated mesh gradient */}
        <motion.div
          className="absolute inset-0 opacity-15"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(13, 148, 136, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(15, 118, 110, 0.15) 0%, transparent 50%)
            `
          }}
          animate={{
            background: [
              `radial-gradient(circle at 20% 80%, rgba(13, 148, 136, 0.15) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
               radial-gradient(circle at 40% 40%, rgba(15, 118, 110, 0.15) 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 20%, rgba(13, 148, 136, 0.15) 0%, transparent 50%),
               radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
               radial-gradient(circle at 60% 60%, rgba(15, 118, 110, 0.15) 0%, transparent 50%)`,
              `radial-gradient(circle at 40% 40%, rgba(13, 148, 136, 0.15) 0%, transparent 50%),
               radial-gradient(circle at 60% 60%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
               radial-gradient(circle at 20% 80%, rgba(15, 118, 110, 0.15) 0%, transparent 50%)`
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(rgba(0,0,0,0.05)_1px,_transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="w-full max-w-full relative z-10">
        <div className="relative container mx-auto py-16 md:py-24">
          
          <div className="relative z-10 flex w-full flex-col-reverse items-stretch gap-10 md:flex-row md:items-center md:gap-16 lg:gap-20">
            <div className="min-w-0 md:basis-1/2">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-700 shadow-sm backdrop-blur-sm">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  New: AI-powered suggestions & ATS scoring
                </div>
                <h1 className="font-display text-[30px] leading-tight sm:text-[38px] md:text-[48px] lg:text-[56px] xl:text-[60px] bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                  {subtitle}
                </p>
                <ul className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    20+ elegant, recruiter-approved templates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Instant ATS score checker
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    One-click export: PDF & DOCX
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Smart section guidance and tips
                  </li>
                </ul>
                <div className="flex flex-wrap gap-3 pt-2">
                  {isAuthenticated ? (
                    <Link 
                      href={primaryHref} 
                      className="inline-flex items-center justify-center w-[300px] h-12 px-6 text-base font-semibold text-white rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 bg-primary"
                      aria-label={primaryLabel}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s'
                      }} className="hover:left-full" />
                      <LayoutPanelTop className="mr-2 h-5 w-5 relative z-10" aria-hidden="true" />
                      <span className="relative z-10">{primaryLabel}</span>
                    </Link>
                  ) : (
                    <button
                      className="inline-flex items-center justify-center w-[300px] h-12 px-6 text-base font-semibold text-white rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 bg-primary"
                      onClick={() => setSignupModalOpen(true)}
                      aria-label={primaryLabel}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s'
                      }} className="hover:left-full" />
                      <LayoutPanelTop className="mr-2 h-5 w-5 relative z-10" aria-hidden="true" />
                      <span className="relative z-10">{primaryLabel}</span>
                    </button>
                  )}

                  {secondaryHref ?
                  <Link
                    href={secondaryHref}
                    className="inline-flex items-center justify-center w-[300px] h-12 px-6 text-base font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20"
                    style={{
                      height: '48px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      fontSize: '16px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#1e293b',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      fontWeight: '600',
                      textDecoration: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    aria-label={secondaryLabel}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                        transition: 'left 0.5s'
                      }} className="hover:left-full" />
                      <Columns3 className="mr-2 h-5 w-5 relative z-10" aria-hidden="true" />
                      <span className="relative z-10">{secondaryLabel}</span>
                    </Link> :

                  <button
                    className="inline-flex items-center justify-center w-[300px] h-12 px-6 text-base font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20"
                    style={{
                      height: '48px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      fontSize: '16px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#1e293b',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      fontWeight: '600',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={onSecondaryClick}
                    aria-label={secondaryLabel}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                        transition: 'left 0.5s'
                      }} className="hover:left-full" />
                      <Columns3 className="mr-2 h-5 w-5 relative z-10" aria-hidden="true" />
                      <span className="relative z-10">{secondaryLabel}</span>
                    </button>
                  }
                </div>
                {/* trust badges */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 backdrop-blur-sm">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> ATS‑friendly
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 backdrop-blur-sm">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> 10k+ resumes built
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 backdrop-blur-sm">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> Export PDF & DOCX
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    10k+ resumes built
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    95% ATS pass rate
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    4.8/5 average rating
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-sm text-slate-500">
                    No credit card required. Build and download your resume anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0 md:basis-1/2">
              <div className="relative">
                {/* Hero Mock */}
                <motion.div
                  className="relative mx-auto -mt-6 md:-mt-10 h-[500px] sm:h-[540px] md:h-[600px] w-full max-w-[380px] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[480px]"
                  initial={{ y: 0, rotate: 0 }}
                  animate={{ y: [0, -6, 0], rotate: [0, -1.2, 0.8, 0] }}
                  transition={{ duration: 8, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                  whileHover={{ scale: 1.02, rotate: 0 }}>

                  {/* Soft glow accent (blue) */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-[2rem] blur-2xl opacity-30 !w-5 !h-[644px] !max-w-5" />
                  
                  {/* Resume Builder UI Mock */}
                  <div className="relative h-full w-full overflow-visible rounded-[2rem] border border-slate-200/50 bg-white/95 backdrop-blur-sm shadow-[0_32px_100px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_40px_120px_-12px_rgba(0,0,0,0.3)] transition-all duration-700">
                    {/* Modern header with gradient */}
                     <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/10 px-6 py-4 rounded-t-[2rem]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* <div className="flex gap-2">
                            <span className="h-3 w-3 rounded-full bg-red-400 shadow-sm" />
                            <span className="h-3 w-3 rounded-full bg-yellow-400 shadow-sm" />
                            <span className="h-3 w-3 rounded-full bg-green-400 shadow-sm" />
                          </div> */}
                          <div className="h-6 w-px bg-slate-300" />
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-semibold text-slate-700">Live Editor</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-primary/15 px-4 py-1.5 text-sm text-primary font-semibold border border-primary/20">
                            ✨ AI-Powered
                          </span>
                          <span className="text-sm font-medium text-slate-600">ATS-Optimized</span>
                      </div>
                      </div>
                    </div>

                    {/* Resume Builder Interface */}
                    <div className="relative h-[460px] sm:h-[500px] md:h-[560px] w-full bg-white rounded-b-[2rem]">
                      {/* Simple, clean layout */}
                      <div className="absolute inset-0 flex rounded-b-[2rem] overflow-hidden">
                        {/* Resume Preview - Full Width */}
                        <div className="w-full p-6">
                          {/* Simple Resume Header */}
                          <div className="mb-4">
                            <h1 className="text-lg font-bold text-slate-900 mb-1">Sarah Johnson</h1>
                            <p className="text-sm text-slate-600 mb-2">Senior Product Manager</p>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                              <span>sarah.johnson@email.com</span>
                              <span>+1 (555) 123-4567</span>
                              <span>San Francisco, CA</span>
                            </div>
                          </div>

                          {/* Experience Section */}
                          <div className="mb-4">
                            <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-primary pb-1">Experience</h2>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Senior Product Manager</h3>
                                    <p className="text-xs text-slate-600">TechCorp Inc.</p>
                            </div>
                                  <span className="text-xs text-slate-500">2021 - Present</span>
                          </div>
                                <ul className="text-xs text-slate-600 space-y-0.5">
                                  <li>• Led product strategy for mobile platform, increasing user engagement by 40%</li>
                                  <li>• Managed cross-functional team of 12 engineers and designers</li>
                              </ul>
                              </div>
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Product Manager</h3>
                                    <p className="text-xs text-slate-600">StartupXYZ</p>
                            </div>
                                  <span className="text-xs text-slate-500">2019 - 2021</span>
                          </div>
                                <ul className="text-xs text-slate-600 space-y-0.5">
                                  <li>• Launched MVP from concept to 25K+ users in 8 months</li>
                                  <li>• Increased conversion rate by 30% through data-driven optimization</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Skills Section */}
                          <div className="mb-4">
                            <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-primary pb-1">Skills</h2>
                            <div className="flex flex-wrap gap-1">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">Product Strategy</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">Data Analysis</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">UX Research</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">Agile</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">Scrum</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">A/B Testing</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">User Stories</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">Roadmapping</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">Figma</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">SQL</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">Jira</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">Confluence</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">Slack</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">Notion</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">Tableau</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">Mixpanel</span>
                            </div>
                          </div>

                          {/* Education Section */}
                          {/* <div className="mb-4">
                            <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-primary pb-1">Education</h2>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="text-sm font-semibold text-slate-900">MBA in Technology Management</h3>
                                    <p className="text-xs text-slate-600">Stanford University</p>
                                  </div>
                                  <span className="text-xs text-slate-500">2018</span>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h3 className="text-sm font-semibold text-slate-900">BS Computer Science</h3>
                                    <p className="text-xs text-slate-600">MIT</p>
                                  </div>
                                  <span className="text-xs text-slate-500">2016</span>
                              </div>
                              </div>
                            </div>
                          </div> */}

                          {/* Achievements Section */}
                          <div>
                            <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-primary pb-1">Achievements</h2>
                            <ul className="text-xs text-slate-600 space-y-0.5">
                              <li>• Product Manager of the Year 2023</li>
                              <li>• Featured in TechCrunch for innovative product launch</li>
                              {/* <li>• Speaker at ProductCon 2022</li>
                              <li>• Patent holder (3 patents in mobile technology)</li> */}
                            </ul>
                          </div>
                        </div>

                      </div>

                      {/* Floating badges around the resume */}
                      {/* <div className="pointer-events-none absolute -inset-8 z-50">
                        <motion.div
                          className="absolute bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border border-primary/20"
                          style={{ left: '-60px', top: '20%' }}
                          animate={{
                            y: [0, -15, 0],
                            x: [0, 8, 0],
                            rotate: [0, 3, -3, 0]
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}>
                          🤖 AI-Powered
                        </motion.div>

                        <motion.div
                          className="absolute bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border border-emerald-200"
                          style={{ right: '-70px', top: '25%' }}
                          animate={{
                            y: [0, 12, 0],
                            x: [0, -5, 0],
                            rotate: [0, -2, 2, 0]
                          }}
                          transition={{
                            duration: 4.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.8
                          }}>
                          ✅ ATS Optimized
                        </motion.div>

                        <motion.div
                          className="absolute bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border border-blue-200"
                          style={{ left: '-50px', top: '65%' }}
                          animate={{
                            y: [0, -10, 0],
                            x: [0, 6, 0],
                            rotate: [0, 2, -2, 0]
                          }}
                          transition={{
                            duration: 4.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.2
                          }}>
                          ✏️ Live Edit
                        </motion.div>

                        <motion.div
                          className="absolute bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border border-purple-200"
                          style={{ right: '-60px', top: '70%' }}
                          animate={{
                            y: [0, 14, 0],
                            x: [0, -4, 0],
                            rotate: [0, -3, 3, 0]
                          }}
                          transition={{
                            duration: 4.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.8
                          }}>
                          🎨 Smart Format
                        </motion.div>

                        <motion.div
                          className="absolute bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg border border-orange-200"
                          style={{ left: '-40px', top: '85%' }}
                          animate={{
                            y: [0, -8, 0],
                            x: [0, 5, 0],
                            rotate: [0, 1.5, -1.5, 0]
                          }}
                          transition={{
                            duration: 5.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2.5
                          }}>
                          💾 Auto-Save
                        </motion.div>
                      </div> */}

                      {/* subtle vignette */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/60 to-transparent rounded-b-[2rem]" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSwitchToSignup={() => {
          setLoginModalOpen(false);
          setSignupModalOpen(true);
        }}
      />
      <SignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSwitchToLogin={() => {
          setSignupModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </section>);

}