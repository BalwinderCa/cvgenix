const mongoose = require('mongoose');
const Template = require('../models/Template');

// Complete Executive Resume
const executiveResume = {
  version: "5.3.0",
  objects: [
    // Header Section
    { type: "rect", left: 0, top: 0, width: 800, height: 120, fill: "#1a1a1a", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 30, width: 300, height: 40, fill: "#ffffff", text: "MICHAEL CHEN", fontSize: 32, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 300, height: 30, fill: "#cccccc", text: "Chief Technology Officer", fontSize: 18, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 100, width: 300, height: 20, fill: "#cccccc", text: "Technology Leadership & Digital Transformation", fontSize: 12, fontFamily: "Arial", id: "tagline" },
    
    // Contact Information
    { type: "text", left: 400, top: 30, width: 350, height: 20, fill: "#ffffff", text: "michael.chen@techcorp.com", fontSize: 12, fontFamily: "Arial", id: "email" },
    { type: "text", left: 400, top: 50, width: 350, height: 20, fill: "#ffffff", text: "(555) 123-4567", fontSize: 12, fontFamily: "Arial", id: "phone" },
    { type: "text", left: 400, top: 70, width: 350, height: 20, fill: "#ffffff", text: "San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "location" },
    { type: "text", left: 400, top: 90, width: 350, height: 20, fill: "#ffffff", text: "linkedin.com/in/michaelchen", fontSize: 12, fontFamily: "Arial", id: "linkedin" },
    
    // Executive Summary
    { type: "text", left: 50, top: 150, width: 700, height: 30, fill: "#ffffff", text: "EXECUTIVE SUMMARY", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "summary_header" },
    { type: "text", left: 50, top: 180, width: 700, height: 60, fill: "#cccccc", text: "Seasoned technology executive with 15+ years of experience leading engineering teams and driving digital transformation initiatives. Proven track record of scaling technology organizations and delivering innovative solutions.", fontSize: 12, fontFamily: "Arial", id: "summary_text" },
    
    // Core Competencies
    { type: "text", left: 50, top: 260, width: 700, height: 30, fill: "#ffffff", text: "CORE COMPETENCIES", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "competencies_header" },
    { type: "text", left: 50, top: 290, width: 700, height: 40, fill: "#cccccc", text: "Strategic Planning • Technology Architecture • Team Leadership • Digital Transformation • Cloud Computing", fontSize: 12, fontFamily: "Arial", id: "competencies_text" },
    
    // Professional Experience
    { type: "text", left: 50, top: 350, width: 700, height: 30, fill: "#ffffff", text: "PROFESSIONAL EXPERIENCE", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "experience_header" },
    
    // Job 1
    { type: "text", left: 50, top: 390, width: 500, height: 20, fill: "#ffffff", text: "Chief Technology Officer", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job1_title" },
    { type: "text", left: 560, top: 390, width: 150, height: 20, fill: "#cccccc", text: "2019 - Present", fontSize: 12, fontFamily: "Arial", id: "job1_dates" },
    { type: "text", left: 50, top: 410, width: 700, height: 20, fill: "#cccccc", text: "TechCorp Inc. | San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "job1_company" },
    { type: "text", left: 50, top: 430, width: 700, height: 40, fill: "#cccccc", text: "• Led digital transformation initiatives resulting in 40% operational efficiency improvement", fontSize: 11, fontFamily: "Arial", id: "job1_bullet1" },
    { type: "text", left: 50, top: 450, width: 700, height: 40, fill: "#cccccc", text: "• Managed engineering team of 50+ developers across multiple product lines", fontSize: 11, fontFamily: "Arial", id: "job1_bullet2" },
    { type: "text", left: 50, top: 470, width: 700, height: 40, fill: "#cccccc", text: "• Implemented cloud-first architecture reducing infrastructure costs by 60%", fontSize: 11, fontFamily: "Arial", id: "job1_bullet3" },
    
    // Job 2
    { type: "text", left: 50, top: 530, width: 500, height: 20, fill: "#ffffff", text: "VP of Engineering", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job2_title" },
    { type: "text", left: 560, top: 530, width: 150, height: 20, fill: "#cccccc", text: "2016 - 2019", fontSize: 12, fontFamily: "Arial", id: "job2_dates" },
    { type: "text", left: 50, top: 550, width: 700, height: 20, fill: "#cccccc", text: "StartupXYZ | San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "job2_company" },
    { type: "text", left: 50, top: 570, width: 700, height: 40, fill: "#cccccc", text: "• Built engineering team from 5 to 30 developers", fontSize: 11, fontFamily: "Arial", id: "job2_bullet1" },
    { type: "text", left: 50, top: 590, width: 700, height: 40, fill: "#cccccc", text: "• Architected scalable microservices platform serving 1M+ users", fontSize: 11, fontFamily: "Arial", id: "job2_bullet2" },
    { type: "text", left: 50, top: 610, width: 700, height: 40, fill: "#cccccc", text: "• Led product development resulting in $50M revenue growth", fontSize: 11, fontFamily: "Arial", id: "job2_bullet3" },
    
    // Education
    { type: "text", left: 50, top: 670, width: 700, height: 30, fill: "#ffffff", text: "EDUCATION", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "education_header" },
    { type: "text", left: 50, top: 700, width: 500, height: 20, fill: "#ffffff", text: "Master of Science in Computer Science", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "degree" },
    { type: "text", left: 560, top: 700, width: 150, height: 20, fill: "#cccccc", text: "2010 - 2012", fontSize: 12, fontFamily: "Arial", id: "education_dates" },
    { type: "text", left: 50, top: 720, width: 700, height: 20, fill: "#cccccc", text: "Stanford University | Stanford, CA", fontSize: 12, fontFamily: "Arial", id: "university" },
    { type: "text", left: 50, top: 740, width: 700, height: 20, fill: "#cccccc", text: "GPA: 3.8/4.0 | Magna Cum Laude", fontSize: 12, fontFamily: "Arial", id: "gpa" },
    
    // Certifications
    { type: "text", left: 50, top: 780, width: 700, height: 30, fill: "#ffffff", text: "CERTIFICATIONS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "certifications_header" },
    { type: "text", left: 50, top: 810, width: 700, height: 20, fill: "#cccccc", text: "AWS Certified Solutions Architect - Professional (2023)", fontSize: 12, fontFamily: "Arial", id: "cert1" },
    { type: "text", left: 50, top: 830, width: 700, height: 20, fill: "#cccccc", text: "Google Cloud Professional Cloud Architect (2022)", fontSize: 12, fontFamily: "Arial", id: "cert2" },
    { type: "text", left: 50, top: 850, width: 700, height: 20, fill: "#cccccc", text: "Certified Kubernetes Administrator (CKA) (2021)", fontSize: 12, fontFamily: "Arial", id: "cert3" }
  ]
};

// Complete Creative Designer Resume
const creativeResume = {
  version: "5.3.0",
  objects: [
    // Header with colorful design
    { type: "rect", left: 0, top: 0, width: 800, height: 100, fill: "#ff6b6b", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "rect", left: 0, top: 100, width: 200, height: 900, fill: "#4ecdc4", stroke: "", strokeWidth: 0, id: "sidebar_bg" },
    { type: "text", left: 50, top: 20, width: 300, height: 40, fill: "#ffffff", text: "ALEX RIVERA", fontSize: 28, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 60, width: 300, height: 30, fill: "#ffffff", text: "Creative Director & UX Designer", fontSize: 16, fontFamily: "Arial", id: "title" },
    
    // Contact in header
    { type: "text", left: 450, top: 20, width: 300, height: 20, fill: "#ffffff", text: "alex.rivera@creative.com", fontSize: 12, fontFamily: "Arial", id: "email" },
    { type: "text", left: 450, top: 40, width: 300, height: 20, fill: "#ffffff", text: "(555) 987-6543", fontSize: 12, fontFamily: "Arial", id: "phone" },
    { type: "text", left: 450, top: 60, width: 300, height: 20, fill: "#ffffff", text: "Los Angeles, CA", fontSize: 12, fontFamily: "Arial", id: "location" },
    { type: "text", left: 450, top: 80, width: 300, height: 20, fill: "#ffffff", text: "behance.net/alexrivera", fontSize: 12, fontFamily: "Arial", id: "portfolio" },
    
    // Skills in sidebar
    { type: "text", left: 20, top: 130, width: 160, height: 30, fill: "#2c3e50", text: "DESIGN SKILLS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "skills_header" },
    { type: "text", left: 20, top: 170, width: 160, height: 20, fill: "#2c3e50", text: "UI/UX Design", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skill1_header" },
    { type: "text", left: 20, top: 190, width: 160, height: 40, fill: "#34495e", text: "Figma, Sketch, Adobe XD, Principle", fontSize: 11, fontFamily: "Arial", id: "skill1_text" },
    { type: "text", left: 20, top: 240, width: 160, height: 20, fill: "#2c3e50", text: "Prototyping", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skill2_header" },
    { type: "text", left: 20, top: 260, width: 160, height: 40, fill: "#34495e", text: "Framer, ProtoPie, Marvel", fontSize: 11, fontFamily: "Arial", id: "skill2_text" },
    { type: "text", left: 20, top: 310, width: 160, height: 20, fill: "#2c3e50", text: "Frontend Dev", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skill3_header" },
    { type: "text", left: 20, top: 330, width: 160, height: 40, fill: "#34495e", text: "React, Vue.js, CSS3, HTML5", fontSize: 11, fontFamily: "Arial", id: "skill3_text" },
    { type: "text", left: 20, top: 380, width: 160, height: 20, fill: "#2c3e50", text: "Research", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "skill4_header" },
    { type: "text", left: 20, top: 400, width: 160, height: 40, fill: "#34495e", text: "User Testing, A/B Testing", fontSize: 11, fontFamily: "Arial", id: "skill4_text" },
    
    // Main content area
    { type: "text", left: 220, top: 130, width: 500, height: 30, fill: "#2c3e50", text: "PROFESSIONAL EXPERIENCE", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "experience_header" },
    
    // Job 1
    { type: "text", left: 220, top: 170, width: 400, height: 20, fill: "#2c3e50", text: "Creative Director", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "job1_title" },
    { type: "text", left: 620, top: 170, width: 100, height: 20, fill: "#7f8c8d", text: "2021 - Present", fontSize: 12, fontFamily: "Arial", id: "job1_dates" },
    { type: "text", left: 220, top: 190, width: 500, height: 20, fill: "#e74c3c", text: "DesignStudio Inc. | Los Angeles, CA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "job1_company" },
    { type: "text", left: 220, top: 210, width: 500, height: 40, fill: "#34495e", text: "• Led design team of 12 creatives across multiple client projects", fontSize: 11, fontFamily: "Arial", id: "job1_bullet1" },
    { type: "text", left: 220, top: 230, width: 500, height: 40, fill: "#34495e", text: "• Increased client satisfaction by 45% through improved design processes", fontSize: 11, fontFamily: "Arial", id: "job1_bullet2" },
    { type: "text", left: 220, top: 250, width: 500, height: 40, fill: "#34495e", text: "• Designed award-winning mobile app with 100K+ downloads", fontSize: 11, fontFamily: "Arial", id: "job1_bullet3" },
    
    // Job 2
    { type: "text", left: 220, top: 310, width: 400, height: 20, fill: "#2c3e50", text: "Senior UX Designer", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "job2_title" },
    { type: "text", left: 620, top: 310, width: 100, height: 20, fill: "#7f8c8d", text: "2019 - 2021", fontSize: 12, fontFamily: "Arial", id: "job2_dates" },
    { type: "text", left: 220, top: 330, width: 500, height: 20, fill: "#e74c3c", text: "TechStart Inc. | San Francisco, CA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "job2_company" },
    { type: "text", left: 220, top: 350, width: 500, height: 40, fill: "#34495e", text: "• Designed user-centered interfaces for SaaS platform", fontSize: 11, fontFamily: "Arial", id: "job2_bullet1" },
    { type: "text", left: 220, top: 370, width: 500, height: 40, fill: "#34495e", text: "• Conducted user research with 200+ participants", fontSize: 11, fontFamily: "Arial", id: "job2_bullet2" },
    { type: "text", left: 220, top: 390, width: 500, height: 40, fill: "#34495e", text: "• Improved user engagement by 60% through UX optimization", fontSize: 11, fontFamily: "Arial", id: "job2_bullet3" },
    
    // Education
    { type: "text", left: 220, top: 450, width: 500, height: 30, fill: "#2c3e50", text: "EDUCATION", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "education_header" },
    { type: "text", left: 220, top: 480, width: 400, height: 20, fill: "#2c3e50", text: "Bachelor of Fine Arts in Graphic Design", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "degree" },
    { type: "text", left: 620, top: 480, width: 100, height: 20, fill: "#7f8c8d", text: "2015 - 2019", fontSize: 12, fontFamily: "Arial", id: "education_dates" },
    { type: "text", left: 220, top: 500, width: 500, height: 20, fill: "#e74c3c", text: "Art Center College of Design | Pasadena, CA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "university" },
    { type: "text", left: 220, top: 520, width: 500, height: 20, fill: "#34495e", text: "GPA: 3.9/4.0 | Summa Cum Laude", fontSize: 12, fontFamily: "Arial", id: "gpa" },
    
    // Awards
    { type: "text", left: 220, top: 560, width: 500, height: 30, fill: "#2c3e50", text: "AWARDS & RECOGNITION", fontSize: 18, fontWeight: "bold", fontFamily: "Arial", id: "awards_header" },
    { type: "text", left: 220, top: 590, width: 500, height: 20, fill: "#34495e", text: "• Awwwards Site of the Day (2023)", fontSize: 12, fontFamily: "Arial", id: "award1" },
    { type: "text", left: 220, top: 610, width: 500, height: 20, fill: "#34495e", text: "• Adobe Design Achievement Award (2022)", fontSize: 12, fontFamily: "Arial", id: "award2" },
    { type: "text", left: 220, top: 630, width: 500, height: 20, fill: "#34495e", text: "• Dribbble Designer of the Year (2021)", fontSize: 12, fontFamily: "Arial", id: "award3" }
  ]
};

// Complete Medical Professional Resume
const medicalResume = {
  version: "5.3.0",
  objects: [
    // Header
    { type: "rect", left: 0, top: 0, width: 800, height: 120, fill: "#2c5aa0", stroke: "", strokeWidth: 0, id: "header_bg" },
    { type: "text", left: 50, top: 30, width: 300, height: 40, fill: "#ffffff", text: "DR. JESSICA MARTINEZ", fontSize: 28, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 70, width: 300, height: 30, fill: "#ffffff", text: "Cardiologist", fontSize: 18, fontFamily: "Arial", id: "title" },
    { type: "text", left: 50, top: 100, width: 300, height: 20, fill: "#ffffff", text: "MD, FACC, Board Certified", fontSize: 12, fontFamily: "Arial", id: "credentials" },
    
    // Contact
    { type: "text", left: 400, top: 30, width: 350, height: 20, fill: "#ffffff", text: "j.martinez@medicalcenter.com", fontSize: 12, fontFamily: "Arial", id: "email" },
    { type: "text", left: 400, top: 50, width: 350, height: 20, fill: "#ffffff", text: "(555) 234-5678", fontSize: 12, fontFamily: "Arial", id: "phone" },
    { type: "text", left: 400, top: 70, width: 350, height: 20, fill: "#ffffff", text: "Boston, MA", fontSize: 12, fontFamily: "Arial", id: "location" },
    { type: "text", left: 400, top: 90, width: 350, height: 20, fill: "#ffffff", text: "linkedin.com/in/drjessicamartinez", fontSize: 12, fontFamily: "Arial", id: "linkedin" },
    
    // Professional Summary
    { type: "text", left: 50, top: 150, width: 700, height: 30, fill: "#2c5aa0", text: "PROFESSIONAL SUMMARY", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "summary_header" },
    { type: "text", left: 50, top: 180, width: 700, height: 60, fill: "#2c3e50", text: "Board-certified cardiologist with 12+ years of experience in interventional cardiology and heart failure management. Dedicated to providing exceptional patient care and advancing cardiovascular medicine through research and innovation.", fontSize: 12, fontFamily: "Arial", id: "summary_text" },
    
    // Medical Experience
    { type: "text", left: 50, top: 260, width: 700, height: 30, fill: "#2c5aa0", text: "MEDICAL EXPERIENCE", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "experience_header" },
    
    // Job 1
    { type: "text", left: 50, top: 300, width: 500, height: 20, fill: "#2c3e50", text: "Senior Cardiologist", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job1_title" },
    { type: "text", left: 560, top: 300, width: 150, height: 20, fill: "#7f8c8d", text: "2018 - Present", fontSize: 12, fontFamily: "Arial", id: "job1_dates" },
    { type: "text", left: 50, top: 320, width: 700, height: 20, fill: "#2c5aa0", text: "Massachusetts General Hospital | Boston, MA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "job1_company" },
    { type: "text", left: 50, top: 340, width: 700, height: 40, fill: "#2c3e50", text: "• Performed 500+ cardiac catheterizations and angioplasty procedures", fontSize: 11, fontFamily: "Arial", id: "job1_bullet1" },
    { type: "text", left: 50, top: 360, width: 700, height: 40, fill: "#2c3e50", text: "• Led multidisciplinary team in complex heart failure cases", fontSize: 11, fontFamily: "Arial", id: "job1_bullet2" },
    { type: "text", left: 50, top: 380, width: 700, height: 40, fill: "#2c3e50", text: "• Mentored 8 cardiology fellows and residents", fontSize: 11, fontFamily: "Arial", id: "job1_bullet3" },
    
    // Job 2
    { type: "text", left: 50, top: 440, width: 500, height: 20, fill: "#2c3e50", text: "Interventional Cardiologist", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job2_title" },
    { type: "text", left: 560, top: 440, width: 150, height: 20, fill: "#7f8c8d", text: "2012 - 2018", fontSize: 12, fontFamily: "Arial", id: "job2_dates" },
    { type: "text", left: 50, top: 460, width: 700, height: 20, fill: "#2c5aa0", text: "Brigham and Women's Hospital | Boston, MA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "job2_company" },
    { type: "text", left: 50, top: 480, width: 700, height: 40, fill: "#2c3e50", text: "• Specialized in complex coronary interventions", fontSize: 11, fontFamily: "Arial", id: "job2_bullet1" },
    { type: "text", left: 50, top: 500, width: 700, height: 40, fill: "#2c3e50", text: "• Published 25+ peer-reviewed research papers", fontSize: 11, fontFamily: "Arial", id: "job2_bullet2" },
    { type: "text", left: 50, top: 520, width: 700, height: 40, fill: "#2c3e50", text: "• Achieved 98% procedural success rate", fontSize: 11, fontFamily: "Arial", id: "job2_bullet3" },
    
    // Education
    { type: "text", left: 50, top: 580, width: 700, height: 30, fill: "#2c5aa0", text: "EDUCATION", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "education_header" },
    { type: "text", left: 50, top: 610, width: 500, height: 20, fill: "#2c3e50", text: "Doctor of Medicine (MD)", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "degree" },
    { type: "text", left: 560, top: 610, width: 150, height: 20, fill: "#7f8c8d", text: "2004 - 2008", fontSize: 12, fontFamily: "Arial", id: "education_dates" },
    { type: "text", left: 50, top: 630, width: 700, height: 20, fill: "#2c5aa0", text: "Harvard Medical School | Boston, MA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "university" },
    { type: "text", left: 50, top: 650, width: 700, height: 20, fill: "#2c3e50", text: "GPA: 3.9/4.0 | Magna Cum Laude", fontSize: 12, fontFamily: "Arial", id: "gpa" },
    
    // Residency
    { type: "text", left: 50, top: 680, width: 500, height: 20, fill: "#2c3e50", text: "Internal Medicine Residency", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "residency" },
    { type: "text", left: 560, top: 680, width: 150, height: 20, fill: "#7f8c8d", text: "2008 - 2011", fontSize: 12, fontFamily: "Arial", id: "residency_dates" },
    { type: "text", left: 50, top: 700, width: 700, height: 20, fill: "#2c5aa0", text: "Massachusetts General Hospital | Boston, MA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "residency_hospital" },
    
    // Fellowship
    { type: "text", left: 50, top: 730, width: 500, height: 20, fill: "#2c3e50", text: "Cardiology Fellowship", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "fellowship" },
    { type: "text", left: 560, top: 730, width: 150, height: 20, fill: "#7f8c8d", text: "2011 - 2014", fontSize: 12, fontFamily: "Arial", id: "fellowship_dates" },
    { type: "text", left: 50, top: 750, width: 700, height: 20, fill: "#2c5aa0", text: "Brigham and Women's Hospital | Boston, MA", fontSize: 12, fontWeight: "bold", fontFamily: "Arial", id: "fellowship_hospital" },
    
    // Certifications
    { type: "text", left: 50, top: 790, width: 700, height: 30, fill: "#2c5aa0", text: "BOARD CERTIFICATIONS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "certifications_header" },
    { type: "text", left: 50, top: 820, width: 700, height: 20, fill: "#2c3e50", text: "American Board of Internal Medicine - Internal Medicine (2011)", fontSize: 12, fontFamily: "Arial", id: "cert1" },
    { type: "text", left: 50, top: 840, width: 700, height: 20, fill: "#2c3e50", text: "American Board of Internal Medicine - Cardiovascular Disease (2014)", fontSize: 12, fontFamily: "Arial", id: "cert2" },
    { type: "text", left: 50, top: 860, width: 700, height: 20, fill: "#2c3e50", text: "Fellow of the American College of Cardiology (FACC) (2015)", fontSize: 12, fontFamily: "Arial", id: "cert3" }
  ]
};

const templates = [
  {
    name: "Executive Leadership Resume",
    description: "Complete professional resume for C-level executives with comprehensive experience, education, and achievements",
    category: "Executive",
    colorScheme: "dark",
    layout: "single-column",
    complexity: "complex",
    data: executiveResume
  },
  {
    name: "Creative Designer Portfolio",
    description: "Complete colorful resume template for creative professionals with skills sidebar and portfolio focus",
    category: "Creative",
    colorScheme: "colorful",
    layout: "two-column",
    complexity: "moderate",
    data: creativeResume
  },
  {
    name: "Medical Professional Resume",
    description: "Complete formal resume template for healthcare professionals with medical credentials and experience",
    category: "Professional",
    colorScheme: "light",
    layout: "single-column",
    complexity: "complex",
    data: medicalResume
  }
];

async function createCompleteTemplates() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://balwinder_cvgenix_1998:mAxGheQuqWAyvmzc@cvgenixdb.vrkl6u1.mongodb.net/?retryWrites=true&w=majority&appName=cvgenixdb');
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing templates first
    await Template.deleteMany({});
    console.log('🗑️ Cleared existing templates');

    // Create complete templates
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const newTemplate = new Template({
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        preview: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        renderEngine: "canvas",
        isActive: true,
        isPremium: true,
        isPopular: true,
        isNewTemplate: true,
        tags: [template.category.toLowerCase(), template.colorScheme, template.layout, "complete"],
        metadata: {
          colorScheme: template.colorScheme,
          layout: template.layout,
          complexity: template.complexity
        },
        canvasData: template.data
      });

      await newTemplate.save();
      console.log(`✅ Complete template ${i + 1}/3 created: ${template.name} (${template.data.objects.length} objects)`);
    }

    console.log('🎉 All complete templates created successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating complete templates:', error);
    process.exit(1);
  }
}

// Run the script
createCompleteTemplates();
