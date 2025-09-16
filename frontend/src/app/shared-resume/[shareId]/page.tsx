"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  Lock, 
  ExternalLink,
  ArrowLeft,
  Share2,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { ResumePreview } from '@/components/resume-preview';
import NavigationHeader from '@/components/navigation-header';
import FooterSection from '@/components/footer-section';

interface SharedResumeData {
  id: string;
  title: string;
  personalInfo: any;
  experience: any[];
  education: any[];
  skills: any[];
  projects: any[];
  certifications: any[];
  languages: any[];
  achievements: any[];
  socialLinks: any[];
  customSections: any[];
  template: string;
  createdAt: string;
  updatedAt: string;
  sharing: {
    allowDownload: boolean;
    allowComments: boolean;
    viewCount: number;
  };
}

export default function SharedResumePage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;
  
  const [resumeData, setResumeData] = useState<SharedResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedResume();
  }, [shareId]);

  const loadSharedResume = async (providedPassword?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(`http://localhost:3001/api/resumes/sharing/${shareId}`);
      if (providedPassword) {
        url.searchParams.set('password', providedPassword);
      }

      const response = await fetch(url.toString());

      if (response.status === 401) {
        setPasswordRequired(true);
        return;
      }

      if (response.status === 404) {
        setError('Shared resume not found');
        return;
      }

      if (response.status === 410) {
        setError('This share link has expired');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load shared resume');
      }

      const data = await response.json();
      setResumeData(data.data);
      setPasswordRequired(false);

    } catch (error) {
      console.error('Error loading shared resume:', error);
      setError('Failed to load shared resume');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSharedResume(password);
  };

  const handleDownload = async () => {
    if (!resumeData) return;

    try {
      const response = await fetch(`http://localhost:3001/api/resumes/${resumeData.id}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'shared'}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resumeData.title || 'resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Resume downloaded successfully!');
      } else {
        toast.error('Failed to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Error downloading resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading shared resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto py-8 pt-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="text-6xl">😞</div>
            <h1 className="text-3xl font-bold">Oops! Something went wrong</h1>
            <p className="text-muted-foreground text-lg">{error}</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto py-8 pt-24">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Password Required</CardTitle>
                <p className="text-muted-foreground">
                  This resume is password protected. Please enter the password to view it.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Resume
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (!resumeData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              <Badge variant="outline">Shared Resume</Badge>
            </div>
            <h1 className="text-3xl font-bold">{resumeData.title || 'Resume'}</h1>
            <p className="text-muted-foreground">
              Shared by {resumeData.personalInfo?.firstName} {resumeData.personalInfo?.lastName}
            </p>
          </div>
          
          <div className="flex gap-2">
            {resumeData.sharing.allowDownload && (
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Resume Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="text-2xl font-bold">{resumeData.sharing.viewCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(resumeData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Template</p>
                  <p className="text-sm font-medium capitalize">{resumeData.template}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resume Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <ResumePreview 
              data={resumeData}
              template={resumeData.template as 'modern' | 'classic' | 'minimal'}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            This resume was shared using CVGenix - Create your own professional resume at{' '}
            <Link href="/" className="text-primary hover:underline">cvgenix.com</Link>
          </p>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
