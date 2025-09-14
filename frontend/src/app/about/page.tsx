"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Target, Award, Heart } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import FooterSection from "@/components/footer-section";

export default function AboutPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About <span className="text-primary">CVGenix</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We're on a mission to help job seekers create professional resumes that stand out from the crowd and land their dream jobs.
              </p>
            </div>

            {/* Mission Section */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-4">
                  At CVGenix, we believe that everyone deserves a chance to showcase their skills and experience in the best possible way. 
                  We're committed to democratizing professional resume creation by providing accessible, powerful tools that help job seekers 
                  create resumes that pass ATS systems and impress hiring managers.
                </p>
                <p className="text-muted-foreground">
                  Our platform combines modern design principles with AI-powered insights to ensure your resume not only looks great 
                  but also performs well in today's competitive job market.
                </p>
              </CardContent>
            </Card>

            {/* Values Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      User-First
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Every feature we build is designed with our users' success in mind. We listen to feedback and continuously improve our platform.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      We maintain the highest standards in design, functionality, and user experience to ensure your resume represents you perfectly.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Accessibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Professional resume creation should be accessible to everyone, regardless of their background or technical expertise.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Story Section */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Our Story</CardTitle>
                <CardDescription>
                  How CVGenix came to be
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  CVGenix was born out of a simple observation: too many talented professionals were struggling to get noticed because 
                  their resumes weren't optimized for modern hiring processes. We saw the gap between traditional resume formats and 
                  what today's ATS systems and hiring managers actually look for.
                </p>
                <p className="text-muted-foreground">
                  Our team of designers, developers, and career experts came together to create a solution that combines beautiful, 
                  modern templates with intelligent optimization features. The result is a platform that helps job seekers create 
                  resumes that not only look professional but also perform well in the digital hiring landscape.
                </p>
                <p className="text-muted-foreground">
                  Today, we're proud to help thousands of job seekers create resumes that get them noticed and hired. 
                  Every success story is a reminder of why we do what we do.
                </p>
              </CardContent>
            </Card>

            {/* Stats Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Resumes Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">ATS Pass Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Templates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Ready to Create Your Professional Resume?</CardTitle>
                <CardDescription>
                  Join thousands of job seekers who have successfully landed their dream jobs with CVGenix
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/resume-builder">Start Building</Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link href="/contact">Contact Us</Link>
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
