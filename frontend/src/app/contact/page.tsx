"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import NavigationHeader from "@/components/navigation-header";
import FooterSection from "@/components/footer-section";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Have questions about CVGenix? Need help with your resume? We're here to help you succeed in your job search.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Reach out to us through any of these channels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-muted-foreground">hello@cvgenix.com</div>
                        <div className="text-sm text-muted-foreground">We respond within 24 hours</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-muted-foreground">+1 (234) 567-890</div>
                        <div className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM PST</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Address</div>
                        <div className="text-muted-foreground">
                          123 Resume Street<br />
                          San Francisco, CA 94102
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">Business Hours</div>
                        <div className="text-muted-foreground">
                          Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                          Saturday: 10:00 AM - 4:00 PM PST<br />
                          Sunday: Closed
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      Quick answers to common questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-medium mb-1">How do I get started?</div>
                      <div className="text-sm text-muted-foreground">
                        Simply sign up for a free account and start building your resume with our easy-to-use builder.
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Is my data secure?</div>
                      <div className="text-sm text-muted-foreground">
                        Yes, we use industry-standard encryption and never share your personal information.
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Can I download my resume?</div>
                      <div className="text-sm text-muted-foreground">
                        Absolutely! You can download your resume in PDF format anytime.
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Do you offer support?</div>
                      <div className="text-sm text-muted-foreground">
                        Yes, we provide 24/7 email support and have a comprehensive help center.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
