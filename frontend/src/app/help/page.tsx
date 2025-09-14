"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, BookOpen, MessageCircle, Video, FileText, Download, Settings, User, Shield } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import FooterSection from "@/components/footer-section";

export default function HelpPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="w-5 h-5" />,
      questions: [
        {
          question: "How do I create my first resume?",
          answer: "Click on 'Resume Builder' in the navigation, sign up for a free account, and follow our step-by-step guide to create your professional resume."
        },
        {
          question: "What information do I need to include?",
          answer: "Include your contact information, professional summary, work experience, education, and relevant skills. Our templates will guide you through each section."
        },
        {
          question: "Can I import my existing resume?",
          answer: "Yes! You can upload your existing resume and our AI will help extract and organize the information into our format."
        }
      ]
    },
    {
      title: "Resume Builder",
      icon: <FileText className="w-5 h-5" />,
      questions: [
        {
          question: "How do I choose the right template?",
          answer: "Browse our template gallery and select one that matches your industry and personal style. All templates are ATS-optimized."
        },
        {
          question: "Can I customize the design?",
          answer: "Yes! You can change colors, fonts, spacing, and layout to match your preferences while maintaining ATS compatibility."
        },
        {
          question: "How do I add sections to my resume?",
          answer: "Use the 'Add Section' button to include additional sections like certifications, projects, or volunteer experience."
        }
      ]
    },
    {
      title: "ATS Optimization",
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          question: "What is ATS and why is it important?",
          answer: "ATS (Applicant Tracking System) is software used by employers to screen resumes. Our templates are designed to pass these systems."
        },
        {
          question: "How do I check my ATS score?",
          answer: "Use our ATS Score Analyzer to upload your resume and get instant feedback on how well it will perform in ATS systems."
        },
        {
          question: "What makes a resume ATS-friendly?",
          answer: "ATS-friendly resumes use standard fonts, clear formatting, relevant keywords, and proper section headers."
        }
      ]
    },
    {
      title: "Account & Billing",
      icon: <User className="w-5 h-5" />,
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' in the top navigation and provide your email and password. You can start building immediately."
        },
        {
          question: "Is there a free version?",
          answer: "Yes! Our free plan includes basic templates and resume building. Premium features include advanced templates and unlimited downloads."
        },
        {
          question: "How do I cancel my subscription?",
          answer: "Go to your account settings and click 'Cancel Subscription'. You'll retain access until the end of your billing period."
        }
      ]
    }
  ];

  const quickLinks = [
    { title: "Resume Templates", description: "Browse our collection of professional templates", href: "/", icon: <FileText className="w-4 h-4" /> },
    { title: "ATS Score Checker", description: "Analyze your resume's ATS compatibility", href: "/ats-score", icon: <Shield className="w-4 h-4" /> },
    { title: "Cover Letter Builder", description: "Create professional cover letters", href: "/cover-letter", icon: <MessageCircle className="w-4 h-4" /> },
    { title: "Contact Support", description: "Get help from our support team", href: "/contact", icon: <MessageCircle className="w-4 h-4" /> }
  ];

  return (
    <>
      <NavigationHeader />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Help <span className="text-primary">Center</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Find answers to common questions and learn how to make the most of CVGenix.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for help..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {link.icon}
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">{link.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={link.href}>Learn More</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    {category.icon}
                    {category.title}
                  </h2>
                  <div className="grid gap-4">
                    {category.questions.map((faq, faqIndex) => (
                      <Card key={faqIndex}>
                        <CardHeader>
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Video Tutorials */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Video className="w-6 h-6 text-primary" />
                Video Tutorials
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Getting Started</CardTitle>
                    <CardDescription>
                      Learn the basics of creating your first resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" className="w-full">
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ATS Optimization</CardTitle>
                    <CardDescription>
                      Make your resume ATS-friendly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" className="w-full">
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced Features</CardTitle>
                    <CardDescription>
                      Explore premium features and customization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" className="w-full">
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Support */}
            <Card className="mt-16 text-center">
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Our support team is here to help.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="mailto:hello@cvgenix.com">Email Us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
