export const demoResumeData = {
  version: "5.3.0",
  objects: [
    // Header Section
    { type: "text", left: 50, top: 30, width: 700, height: 50, fill: "#1a1a1a", text: "JOHN SMITH", fontSize: 36, fontWeight: "bold", fontFamily: "Arial", id: "name" },
    { type: "text", left: 50, top: 80, width: 700, height: 30, fill: "#333333", text: "Senior Software Engineer", fontSize: 20, fontFamily: "Arial", id: "title" },
    
    // Contact Information
    { type: "text", left: 50, top: 120, width: 200, height: 20, fill: "#555555", text: "john.smith@email.com", fontSize: 12, fontFamily: "Arial", id: "email" },
    { type: "text", left: 270, top: 120, width: 200, height: 20, fill: "#555555", text: "(555) 123-4567", fontSize: 12, fontFamily: "Arial", id: "phone" },
    { type: "text", left: 490, top: 120, width: 200, height: 20, fill: "#555555", text: "San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "location" },
    { type: "text", left: 50, top: 140, width: 200, height: 20, fill: "#555555", text: "linkedin.com/in/johnsmith", fontSize: 12, fontFamily: "Arial", id: "linkedin" },
    { type: "text", left: 270, top: 140, width: 200, height: 20, fill: "#555555", text: "github.com/johnsmith", fontSize: 12, fontFamily: "Arial", id: "github" },
    
    // Professional Summary
    { type: "text", left: 50, top: 180, width: 700, height: 30, fill: "#1a1a1a", text: "PROFESSIONAL SUMMARY", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "summary_header" },
    { type: "text", left: 50, top: 210, width: 700, height: 60, fill: "#333333", text: "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.", fontSize: 12, fontFamily: "Arial", id: "summary_text" },
    
    // Technical Skills
    { type: "text", left: 50, top: 290, width: 700, height: 30, fill: "#1a1a1a", text: "TECHNICAL SKILLS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "skills_header" },
    { type: "text", left: 50, top: 320, width: 700, height: 40, fill: "#333333", text: "Languages: JavaScript, TypeScript, Python, Java, Go, SQL", fontSize: 12, fontFamily: "Arial", id: "skills_languages" },
    { type: "text", left: 50, top: 340, width: 700, height: 40, fill: "#333333", text: "Frameworks: React, Node.js, Express, Django, Spring Boot, Next.js", fontSize: 12, fontFamily: "Arial", id: "skills_frameworks" },
    { type: "text", left: 50, top: 360, width: 700, height: 40, fill: "#333333", text: "Cloud & Tools: AWS, Docker, Kubernetes, Git, Jenkins, MongoDB, PostgreSQL", fontSize: 12, fontFamily: "Arial", id: "skills_tools" },
    
    // Professional Experience
    { type: "text", left: 50, top: 420, width: 700, height: 30, fill: "#1a1a1a", text: "PROFESSIONAL EXPERIENCE", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "experience_header" },
    
    // Job 1
    { type: "text", left: 50, top: 450, width: 500, height: 20, fill: "#1a1a1a", text: "Senior Software Engineer", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job1_title" },
    { type: "text", left: 560, top: 450, width: 150, height: 20, fill: "#555555", text: "2021 - Present", fontSize: 12, fontFamily: "Arial", id: "job1_dates" },
    { type: "text", left: 50, top: 470, width: 700, height: 20, fill: "#333333", text: "TechCorp Inc. | San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "job1_company" },
    { type: "text", left: 50, top: 490, width: 700, height: 40, fill: "#333333", text: "• Led development of microservices architecture serving 1M+ users", fontSize: 11, fontFamily: "Arial", id: "job1_bullet1" },
    { type: "text", left: 50, top: 510, width: 700, height: 40, fill: "#333333", text: "• Mentored 5 junior developers and improved team productivity by 40%", fontSize: 11, fontFamily: "Arial", id: "job1_bullet2" },
    { type: "text", left: 50, top: 530, width: 700, height: 40, fill: "#333333", text: "• Implemented CI/CD pipelines reducing deployment time by 60%", fontSize: 11, fontFamily: "Arial", id: "job1_bullet3" },
    
    // Job 2
    { type: "text", left: 50, top: 580, width: 500, height: 20, fill: "#1a1a1a", text: "Software Engineer", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "job2_title" },
    { type: "text", left: 560, top: 580, width: 150, height: 20, fill: "#555555", text: "2019 - 2021", fontSize: 12, fontFamily: "Arial", id: "job2_dates" },
    { type: "text", left: 50, top: 600, width: 700, height: 20, fill: "#333333", text: "StartupXYZ | San Francisco, CA", fontSize: 12, fontFamily: "Arial", id: "job2_company" },
    { type: "text", left: 50, top: 620, width: 700, height: 40, fill: "#333333", text: "• Built scalable web applications using React and Node.js", fontSize: 11, fontFamily: "Arial", id: "job2_bullet1" },
    { type: "text", left: 50, top: 640, width: 700, height: 40, fill: "#333333", text: "• Designed and implemented RESTful APIs handling 100K+ requests/day", fontSize: 11, fontFamily: "Arial", id: "job2_bullet2" },
    { type: "text", left: 50, top: 660, width: 700, height: 40, fill: "#333333", text: "• Collaborated with cross-functional teams to deliver features on time", fontSize: 11, fontFamily: "Arial", id: "job2_bullet3" },
    
    // Education
    { type: "text", left: 50, top: 720, width: 700, height: 30, fill: "#1a1a1a", text: "EDUCATION", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "education_header" },
    { type: "text", left: 50, top: 750, width: 500, height: 20, fill: "#1a1a1a", text: "Bachelor of Science in Computer Science", fontSize: 14, fontWeight: "bold", fontFamily: "Arial", id: "degree" },
    { type: "text", left: 560, top: 750, width: 150, height: 20, fill: "#555555", text: "2015 - 2019", fontSize: 12, fontFamily: "Arial", id: "education_dates" },
    { type: "text", left: 50, top: 770, width: 700, height: 20, fill: "#333333", text: "University of California, Berkeley | Berkeley, CA", fontSize: 12, fontFamily: "Arial", id: "university" },
    { type: "text", left: 50, top: 790, width: 700, height: 20, fill: "#333333", text: "GPA: 3.8/4.0 | Magna Cum Laude", fontSize: 12, fontFamily: "Arial", id: "gpa" },
    
    // Certifications
    { type: "text", left: 50, top: 830, width: 700, height: 30, fill: "#1a1a1a", text: "CERTIFICATIONS", fontSize: 16, fontWeight: "bold", fontFamily: "Arial", id: "certifications_header" },
    { type: "text", left: 50, top: 860, width: 700, height: 20, fill: "#333333", text: "AWS Certified Solutions Architect - Professional (2023)", fontSize: 12, fontFamily: "Arial", id: "cert1" },
    { type: "text", left: 50, top: 880, width: 700, height: 20, fill: "#333333", text: "Google Cloud Professional Cloud Architect (2022)", fontSize: 12, fontFamily: "Arial", id: "cert2" },
    { type: "text", left: 50, top: 900, width: 700, height: 20, fill: "#333333", text: "Certified Kubernetes Administrator (CKA) (2021)", fontSize: 12, fontFamily: "Arial", id: "cert3" }
  ]
};