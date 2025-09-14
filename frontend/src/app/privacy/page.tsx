"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import FooterSection from "@/components/footer-section";

export default function PrivacyPage() {
  return (
    <>
      <NavigationHeader />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
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
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Privacy <span className="text-primary">Policy</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: January 15, 2025
              </p>
            </div>

            {/* Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  CVGenix ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our resume building platform and related services.
                </p>
                <p className="text-muted-foreground">
                  By using our services, you agree to the collection and use of information in accordance with this policy. 
                  If you do not agree with our policies and practices, please do not use our services.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-muted-foreground mb-2">
                    We collect information you provide directly to us, such as when you:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Create an account (name, email address, password)</li>
                    <li>Build your resume (work experience, education, skills)</li>
                    <li>Contact us for support</li>
                    <li>Subscribe to our newsletter</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Usage Information</h3>
                  <p className="text-muted-foreground mb-2">
                    We automatically collect certain information about your use of our services:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage patterns (pages visited, time spent, features used)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Personalize your experience</li>
                  <li>Detect, prevent, and address technical issues</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data centers and infrastructure</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. 
                  While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, please contact us at privacy@cvgenix.com.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. 
                  You can control cookie settings through your browser preferences.
                </p>
                <p className="text-muted-foreground">
                  Types of cookies we use:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                  <li><strong>Essential cookies:</strong> Required for basic functionality</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how you use our services</li>
                  <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                </ul>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information 
                  from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact us immediately.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Policy */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                  on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                  If you have any questions about this Privacy Policy, please contact us.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <p>Email: privacy@cvgenix.com</p>
                  <p>Address: 123 Resume Street, San Francisco, CA 94102</p>
                </div>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/contact">Contact Support</Link>
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
