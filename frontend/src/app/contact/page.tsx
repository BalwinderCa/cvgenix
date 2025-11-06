"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import NavigationHeader from "@/components/navigation-header";
import FooterSection from "@/components/footer-section";
import { FAQSection } from "@/components/faq-section";

interface CompanySettings {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyCountry?: string;
  companyWebsite?: string;
  companyDescription?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/company-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching company settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

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
      const response = await fetch('http://localhost:3001/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg || err.message).join(', ');
          setError(errorMessages || data.message || 'Failed to send message. Please check your input.');
        } else {
          setError(data.message || 'Failed to send message. Please try again.');
        }
        return;
      }

      toast.success(data.message || 'Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to send message. Please check your connection and try again.');
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
                {settings?.companyDescription || "Have questions about CVGenix? Need help with your resume? We're here to help you succeed in your job search."}
              </p>
            </div>

            {/* FAQ Section */}
            <div className="mb-16">
              <FAQSection />
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
                    {settings?.companyEmail && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Email</div>
                          <a 
                            href={`mailto:${settings.companyEmail}`}
                            className="text-muted-foreground hover:text-primary hover:underline"
                          >
                            {settings.companyEmail}
                          </a>
                          <div className="text-sm text-muted-foreground">We respond within 24 hours</div>
                        </div>
                      </div>
                    )}

                    {settings?.companyPhone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Phone</div>
                          <a 
                            href={`tel:${settings.companyPhone}`}
                            className="text-muted-foreground hover:text-primary hover:underline"
                          >
                            {settings.companyPhone}
                          </a>
                          <div className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM PST</div>
                        </div>
                      </div>
                    )}

                    {(settings?.companyAddress || settings?.companyCity || settings?.companyState || settings?.companyZip) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">Address</div>
                          <div className="text-muted-foreground">
                            {settings.companyAddress && (
                              <>
                                {settings.companyAddress}
                                <br />
                              </>
                            )}
                            {[settings.companyCity, settings.companyState, settings.companyZip]
                              .filter(Boolean)
                              .join(', ')}
                            {settings.companyCountry && (
                              <>
                                <br />
                                {settings.companyCountry}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
