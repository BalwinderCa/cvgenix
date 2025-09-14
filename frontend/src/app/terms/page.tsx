"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import FooterSection from "@/components/footer-section";

export default function TermsPage() {
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
                  <FileText className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Terms of <span className="text-primary">Service</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Please read these terms carefully before using our services. By using CVGenix, you agree to be bound by these terms.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: January 15, 2025
              </p>
            </div>

            {/* Acceptance of Terms */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  These Terms of Service ("Terms") govern your use of CVGenix's website, services, and applications (collectively, the "Service") 
                  operated by CVGenix ("us," "we," or "our").
                </p>
                <p className="text-muted-foreground">
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, 
                  then you may not access the Service.
                </p>
              </CardContent>
            </Card>

            {/* Use License */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Use License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Permission is granted to temporarily use CVGenix for personal, non-commercial transitory viewing only. This is the grant of a license, 
                  not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
                <p className="text-muted-foreground">
                  This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.
                </p>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                  You are responsible for safeguarding the password and for all activities that occur under your account.
                </p>
                <p className="text-muted-foreground">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Use false, misleading, or inaccurate information</li>
                  <li>Share your account credentials with others</li>
                  <li>Create multiple accounts to circumvent restrictions</li>
                  <li>Use the service for any unlawful purpose</li>
                </ul>
              </CardContent>
            </Card>

            {/* Content and Intellectual Property */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Content and Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You retain ownership of the content you create using our Service (your resume, cover letters, etc.). However, by using our Service, 
                  you grant us a limited license to store, process, and display your content as necessary to provide the Service.
                </p>
                <p className="text-muted-foreground">
                  Our Service, including its original content, features, and functionality, is and will remain the exclusive property of CVGenix 
                  and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
                <p className="text-muted-foreground">
                  You may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Copy, modify, or distribute our templates or designs</li>
                  <li>Use our brand name or logos without permission</li>
                  <li>Reverse engineer our algorithms or systems</li>
                  <li>Create derivative works based on our Service</li>
                </ul>
              </CardContent>
            </Card>

            {/* Prohibited Uses */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Prohibited Uses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You may not use our Service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                  <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                  <li>For any obscene or immoral purpose</li>
                  <li>To interfere with or circumvent the security features of the Service</li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy Policy */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                  to understand our practices. By using our Service, you agree to the collection and use of information in accordance 
                  with our Privacy Policy.
                </p>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <Link href="/privacy">View Privacy Policy</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Service Availability */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Service Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We strive to provide continuous service availability, but we do not guarantee that the Service will be available at all times. 
                  The Service may be temporarily unavailable due to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Scheduled maintenance and updates</li>
                  <li>Technical difficulties or system failures</li>
                  <li>Force majeure events beyond our control</li>
                  <li>Security incidents or threats</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We will make reasonable efforts to notify users of planned maintenance and to restore service as quickly as possible.
                </p>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  In no event shall CVGenix, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                  or other intangible losses, resulting from your use of the Service.
                </p>
                <p className="text-muted-foreground">
                  Our total liability to you for all claims arising out of or relating to these Terms or the Service shall not exceed 
                  the amount you paid us for the Service in the 12 months preceding the claim.
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
                  under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p className="text-muted-foreground">
                  If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion. 
                  Upon termination, your right to use the Service will cease immediately.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
                  we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be 
                  determined at our sole discretion.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  These Terms shall be interpreted and governed by the laws of the State of California, United States, without regard to 
                  its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver 
                  of those rights.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  If you have any questions about these Terms of Service, please contact us.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <p>Email: legal@cvgenix.com</p>
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
