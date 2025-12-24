"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Shield,
  CreditCard,
  FileText,
  Download,
  Receipt,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';
import UpgradeModal from '@/components/upgrade-modal';

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  credits: number;
  createdAt: string;
  lastLogin?: string;
  preferences?: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    theme: string;
    language: string;
    timezone: string;
  };
}

interface Resume {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  template?: {
    name: string;
    category?: string;
  };
  updatedAt: string;
  createdAt: string;
  exportedPdfPath?: string;
  exportedPngPath?: string;
  exportedJpgPath?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);
  const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    preferences: {
      emailNotifications: true,
      marketingEmails: false,
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  });

  useEffect(() => {
    loadUserData();
    loadResumes();
    
    // Check if returning from successful payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const sessionId = localStorage.getItem('pendingPaymentSessionId');
      
      // Show initial success message
      toast.success('Payment successful! Processing credits...');
      
      // Wait a bit for webhook to process, then check payment status
      const checkPaymentStatus = async (retryCount = 0) => {
        try {
          const token = localStorage.getItem('token');
          
          if (sessionId) {
            const response = await fetch('http://localhost:3001/api/payments/check-payment-status', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sessionId })
            });

            const data = await response.json();
            
            if (data.success && data.creditsAdded) {
              toast.success(`✅ Payment successful! Added ${data.creditsAdded} credits. Total: ${data.totalCredits}`);
              localStorage.removeItem('pendingPaymentSessionId');
              // Refresh user data to show updated credits
              loadUserData();
              // Clean up URL
              window.history.replaceState({}, '', '/profile');
              return;
            }
          }
          
          // If no sessionId or check failed, try refreshing user data anyway
          // The webhook might have already processed it
          await loadUserData();
          
          // If still no credits after refresh and we have retries left, try again
          if (retryCount < 2) {
            setTimeout(() => checkPaymentStatus(retryCount + 1), 2000);
          } else {
            toast.info('Payment successful! If credits don\'t appear, please refresh the page.');
            localStorage.removeItem('pendingPaymentSessionId');
            // Clean up URL
            window.history.replaceState({}, '', '/profile');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          // Refresh user data anyway
          await loadUserData();
          if (retryCount < 2) {
            setTimeout(() => checkPaymentStatus(retryCount + 1), 2000);
          } else {
            toast.info('Payment successful! If credits don\'t appear, please refresh the page.');
            localStorage.removeItem('pendingPaymentSessionId');
            // Clean up URL
            window.history.replaceState({}, '', '/profile');
          }
        }
      };
      
      // Start checking after a short delay to allow webhook to process
      setTimeout(() => checkPaymentStatus(), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['profile', 'credits', 'payments', 'resume', 'preferences'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load payment history when payments section is active
  useEffect(() => {
    if (activeSection === 'payments') {
      loadPaymentHistory();
    }
  }, [activeSection]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/login');
        return;
      }

      // Parse user data from localStorage first
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        preferences: parsedUser.preferences || {
          emailNotifications: true,
          marketingEmails: false,
          theme: 'light',
          language: 'en',
          timezone: 'UTC'
        }
      });

      // Try to load fresh data from API
      try {
        // Load user profile
        const userResponse = await fetch('http://localhost:3001/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok) {
          const freshUserData = await userResponse.json();
          setUser(freshUserData);
          setFormData({
            firstName: freshUserData.firstName || '',
            lastName: freshUserData.lastName || '',
            email: freshUserData.email || '',
            preferences: freshUserData.preferences || {
              emailNotifications: true,
              marketingEmails: false,
              theme: 'light',
              language: 'en',
              timezone: 'UTC'
            }
          });
        } else if (userResponse.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

      } catch (apiError) {
        console.warn('API calls failed, using cached data:', apiError);
        // Continue with cached data if API fails
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        toast.success('Profile updated successfully');
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        router.push('/login');
        return;
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        preferences: user.preferences || {
          emailNotifications: true,
          marketingEmails: false,
          theme: 'light',
          language: 'en',
          timezone: 'UTC'
        }
      });
    }
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Refresh resumes when resume section is clicked
    if (sectionId === 'resume') {
      loadResumes();
    }
  };

  const handlePasswordReset = async () => {
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordResetData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setPasswordResetLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordResetData.currentPassword,
          newPassword: passwordResetData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswordResetData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordReset(false);
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An error occurred while updating password');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account deleted successfully');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        toast.error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('An error occurred while deleting account');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };


  const loadResumes = async () => {
    try {
      setLoadingResumes(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:3001/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      } else if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        console.error('Failed to load resumes');
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoadingResumes(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      setLoadingPayments(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:3001/api/payments/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentHistory(data.payments || []);
        }
      } else if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        console.error('Failed to load payment history');
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleEditResume = (resumeId: string) => {
    router.push(`/resume-builder?resumeId=${resumeId}`);
  };

  const handleDownloadResume = async (resumeId: string) => {
    try {
      setDownloadingResumeId(resumeId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to download resumes');
        router.push('/login');
        return;
      }

      // Find the resume to check which formats are available
      const resume = resumes.find(r => r._id === resumeId);
      
      // Determine which format to try first (priority: PDF -> PNG -> JPG)
      const formatsToTry = [];
      if (resume) {
        if (resume.exportedPdfPath) formatsToTry.push('pdf');
        if (resume.exportedPngPath) formatsToTry.push('png');
        if (resume.exportedJpgPath) formatsToTry.push('jpg');
      }
      
      // If no format info available, try all formats in order
      if (formatsToTry.length === 0) {
        formatsToTry.push('pdf', 'png', 'jpg');
      }

      // Try each format until one works
      let lastError = null;
      for (const format of formatsToTry) {
        try {
          const response = await fetch(`http://localhost:3001/api/resumes/${resumeId}/download?format=${format}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Get filename from response headers or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `resume.${format}`;
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
              if (filenameMatch) {
                filename = filenameMatch[1];
              }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('Resume downloaded successfully');
            return; // Success, exit function
          } else {
            const errorData = await response.json();
            lastError = errorData.message || `Failed to download ${format.toUpperCase()}`;
            // Continue to next format
          }
        } catch (error) {
          lastError = `Error downloading ${format.toUpperCase()}: ${error}`;
          // Continue to next format
        }
      }

      // If we get here, all formats failed
      toast.error(lastError || 'Failed to download resume. Please export the resume first.');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    } finally {
      setDownloadingResumeId(null);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingResumeId(resumeId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete resumes');
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Resume deleted successfully');
        // Reload resumes
        loadResumes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    } finally {
      setDeletingResumeId(null);
    }
  };

  const formatResumeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  const getResumeName = (resume: Resume) => {
    if (resume.personalInfo?.firstName && resume.personalInfo?.lastName) {
      return `${resume.personalInfo.firstName} ${resume.personalInfo.lastName} Resume`;
    }
    if (resume.personalInfo?.firstName) {
      return `${resume.personalInfo.firstName} Resume`;
    }
    if (resume.template?.name) {
      return resume.template.name;
    }
    return 'Untitled Resume';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="pt-16">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3">
                    <Button
                      variant={activeSection === 'profile' ? 'default' : 'ghost'}
                      className="w-full justify-start text-left h-auto py-3 px-3"
                      onClick={() => scrollToSection('profile')}
                    >
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">Profile Info</span>
                    </Button>
                    <Button
                      variant={activeSection === 'credits' ? 'default' : 'ghost'}
                      className="w-full justify-start text-left h-auto py-3 px-3"
                      onClick={() => scrollToSection('credits')}
                    >
                      <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">Credits & Account</span>
                    </Button>
                    <Button
                      variant={activeSection === 'payments' ? 'default' : 'ghost'}
                      className="w-full justify-start text-left h-auto py-3 px-3"
                      onClick={() => scrollToSection('payments')}
                    >
                      <Receipt className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">Payment History</span>
                    </Button>
                    <Button
                      variant={activeSection === 'resume' ? 'default' : 'ghost'}
                      className="w-full justify-start text-left h-auto py-3 px-3"
                      onClick={() => scrollToSection('resume')}
                    >
                      <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">Resume Management</span>
                    </Button>
                    <Button
                      variant={activeSection === 'preferences' ? 'default' : 'ghost'}
                      className="w-full justify-start text-left h-auto py-3 px-3"
                      onClick={() => scrollToSection('preferences')}
                    >
                      <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">Preferences</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  {/* Profile Information Section */}
                  {activeSection === 'profile' && (
                    <>
                      <Card id="profile">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              Profile Information
                            </CardTitle>
                            {!editing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2">
                                <Edit3 className="h-4 w-4" />
                                Edit Profile
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                disabled={!editing}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                disabled={!editing}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              disabled={!editing}
                            />
                          </div>



                          {editing && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="flex items-center gap-2">
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      

                      {/* Password Reset Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {!showPasswordReset ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">Update your account password</p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setShowPasswordReset(true)}
                              >
                                Change Password
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                  id="currentPassword"
                                  type="password"
                                  placeholder="Enter your current password"
                                  value={passwordResetData.currentPassword}
                                  onChange={(e) => setPasswordResetData({
                                    ...passwordResetData,
                                    currentPassword: e.target.value
                                  })}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  placeholder="Enter your new password"
                                  value={passwordResetData.newPassword}
                                  onChange={(e) => setPasswordResetData({
                                    ...passwordResetData,
                                    newPassword: e.target.value
                                  })}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  placeholder="Confirm your new password"
                                  value={passwordResetData.confirmPassword}
                                  onChange={(e) => setPasswordResetData({
                                    ...passwordResetData,
                                    confirmPassword: e.target.value
                                  })}
                                />
                              </div>
                              
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={handlePasswordReset}
                                  disabled={passwordResetLoading}
                                  className="flex items-center gap-2"
                                >
                                  <Save className="h-4 w-4" />
                                  {passwordResetLoading ? 'Updating...' : 'Update Password'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowPasswordReset(false);
                                    setPasswordResetData({
                                      currentPassword: '',
                                      newPassword: '',
                                      confirmPassword: ''
                                    });
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <X className="h-4 w-4" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Account Information Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Account Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Member Since</p>
                                <p className="text-sm text-muted-foreground">
                                  Your account creation date
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-primary text-white">
                                {user?.createdAt ? formatDate(user.createdAt) : (user ? 'Active member' : 'Loading...')}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Danger Zone - Delete Account Section */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                            Danger Zone
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <p className="font-medium">Delete Account</p>
                              <p className="text-sm text-muted-foreground">
                                This action is irreversible. All your data, resumes, and account information will be permanently removed.
                              </p>
                            </div>
                            
                            <div className="pt-4">
                              <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => setShowDeleteModal(true)}
                              >
                                DELETE ACCOUNT
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Credits Section */}
                  {activeSection === 'credits' && (
                    <div className="space-y-8">
                      {/* Credits Overview */}
                      <Card id="credits">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Credits & Account
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Credits Display */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">Total Credits</h3>
                                <span className="text-2xl font-bold text-primary">{user?.credits || 0}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Available credits for exports and analysis</p>
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">Credit Usage</h3>
                                <span className="text-sm text-muted-foreground">1 credit per action</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                • Export (PDF/PNG/JPG): 1 credit<br/>
                                • ATS Analysis: 1 credit
                              </p>
                            </div>
                          </div>
                          
                          {/* Buy More Credits Button */}
                          <div className="pt-4">
                            <Button 
                              className="w-full"
                              onClick={() => setUpgradeModalOpen(true)}
                            >
                              Buy More Credits
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Payment History Section */}
                  {activeSection === 'payments' && (
                    <div className="space-y-8">
                      <Card id="payments">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Payment History
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loadingPayments ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          ) : paymentHistory.length === 0 ? (
                            <div className="text-center py-8">
                              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No payment history found</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Your payment history will appear here after you make a purchase.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {paymentHistory.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium">{payment.description}</h4>
                                        <Badge
                                          variant={
                                            payment.status === 'paid' || payment.status === 'succeeded'
                                              ? 'default'
                                              : 'secondary'
                                          }
                                        >
                                          {payment.status === 'paid' || payment.status === 'succeeded'
                                            ? 'Paid'
                                            : payment.status}
                                        </Badge>
                                      </div>
                                      <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>
                                          <Calendar className="h-3 w-3 inline mr-1" />
                                          {new Date(payment.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                        {payment.credits && (
                                          <p>Credits: {payment.credits}</p>
                                        )}
                                        {payment.invoiceNumber && (
                                          <p>Invoice: {payment.invoiceNumber}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-lg font-semibold">
                                        ${payment.amount.toFixed(2)} {payment.currency}
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                        {payment.invoiceUrl && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                              try {
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                  toast.error('Please log in to view invoice');
                                                  return;
                                                }
                                                
                                                // Use payment _id (MongoDB ID) for invoice access
                                                const paymentId = (payment as any)._id || payment.invoiceUrl?.split('/').pop();
                                                
                                                if (!paymentId) {
                                                  toast.error('Payment ID not found');
                                                  return;
                                                }
                                                
                                                // Fetch invoice with auth token
                                                const response = await fetch(`http://localhost:3001/api/invoices/${paymentId}`, {
                                                  headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                  }
                                                });
                                                
                                                if (response.ok) {
                                                  const html = await response.text();
                                                  // Open in new window with the HTML content
                                                  const newWindow = window.open('', '_blank');
                                                  if (newWindow) {
                                                    newWindow.document.write(html);
                                                    newWindow.document.close();
                                                  }
                                                } else {
                                                  const errorData = await response.json().catch(() => ({ message: 'Failed to load invoice' }));
                                                  toast.error(errorData.message || 'Failed to load invoice');
                                                }
                                              } catch (error) {
                                                console.error('Error loading invoice:', error);
                                                toast.error('Failed to load invoice');
                                              }
                                            }}
                                            className="flex items-center gap-1"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                            Invoice
                                          </Button>
                                        )}
                                        {payment.invoiceUrl && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={downloadingInvoiceId === ((payment as any)._id || payment.invoiceUrl?.split('/').pop())}
                                            onClick={async () => {
                                              // Use payment _id (MongoDB ID) for invoice access
                                              const paymentId = (payment as any)._id || payment.invoiceUrl?.split('/').pop();
                                              
                                              if (!paymentId) {
                                                toast.error('Payment ID not found');
                                                return;
                                              }
                                              
                                              // Prevent multiple clicks
                                              if (downloadingInvoiceId === paymentId) {
                                                return;
                                              }
                                              
                                              setDownloadingInvoiceId(paymentId);
                                              
                                              try {
                                                const token = localStorage.getItem('token');
                                                if (!token) {
                                                  toast.error('Please log in to download invoice');
                                                  setDownloadingInvoiceId(null);
                                                  return;
                                                }
                                                
                                                // Download invoice PDF
                                                const response = await fetch(`http://localhost:3001/api/invoices/${paymentId}/pdf`, {
                                                  headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                  }
                                                });
                                                
                                                if (response.ok) {
                                                  const blob = await response.blob();
                                                  const url = window.URL.createObjectURL(blob);
                                                  const a = document.createElement('a');
                                                  a.href = url;
                                                  
                                                  const contentDisposition = response.headers.get('Content-Disposition');
                                                  let filename = 'invoice.pdf';
                                                  if (contentDisposition) {
                                                    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                                                    if (filenameMatch) {
                                                      filename = filenameMatch[1];
                                                    }
                                                  }
                                                  
                                                  a.download = filename;
                                                  document.body.appendChild(a);
                                                  a.click();
                                                  window.URL.revokeObjectURL(url);
                                                  document.body.removeChild(a);
                                                  
                                                  toast.success('Invoice downloaded successfully');
                                                } else {
                                                  const errorData = await response.json().catch(() => ({ message: 'Failed to download invoice' }));
                                                  toast.error(errorData.message || 'Failed to download invoice');
                                                }
                                              } catch (error) {
                                                console.error('Error downloading invoice:', error);
                                                toast.error('Failed to download invoice');
                                              } finally {
                                                setDownloadingInvoiceId(null);
                                              }
                                            }}
                                            className="flex items-center gap-1"
                                          >
                                            {downloadingInvoiceId === ((payment as any)._id || payment.invoiceUrl?.split('/').pop()) ? (
                                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                            ) : (
                                              <Download className="h-3 w-3" />
                                            )}
                                            PDF
                                          </Button>
                                        )}
                                        {payment.receiptUrl && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(payment.receiptUrl, '_blank')}
                                            className="flex items-center gap-1"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                            Receipt
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Resume Management Section */}
                  {activeSection === 'resume' && (
                    <div className="space-y-6">
                      {/* Merged Resume Management and Activity */}
                      <Card id="resume">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Resume Management
                            </CardTitle>
                            <Button asChild className="flex items-center gap-2">
                              <a href="/resume-builder">
                                <FileText className="h-4 w-4" />
                                Create New Resume
                              </a>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Recent Activity Section */}
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Your Resumes
                            </h4>
                            
                            {/* Resume List */}
                            {loadingResumes ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              </div>
                            ) : resumes.length === 0 ? (
                              <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-4">You haven't created any resumes yet.</p>
                                <Button asChild>
                                  <a href="/resume-builder">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create Your First Resume
                                  </a>
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {resumes.map((resume) => (
                                  <div key={resume._id} className="flex items-center justify-between py-3 px-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{getResumeName(resume)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {resume.updatedAt ? `Updated ${formatResumeDate(resume.updatedAt)}` : resume.createdAt ? `Created ${formatResumeDate(resume.createdAt)}` : 'No date available'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDownloadResume(resume._id)}
                                        disabled={downloadingResumeId === resume._id}
                                        title="Download as PDF"
                                      >
                                        {downloadingResumeId === resume._id ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                        ) : (
                                          <Download className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEditResume(resume._id)}
                                        title="Edit Resume"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDeleteResume(resume._id)}
                                        disabled={deletingResumeId === resume._id}
                                        className="text-destructive hover:text-destructive"
                                        title="Delete Resume"
                                      >
                                        {deletingResumeId === resume._id ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-destructive"></div>
                                        ) : (
                                          <X className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Preferences Section */}
                  {activeSection === 'preferences' && (
                    <>
                      <Card id="preferences">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Preferences
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-muted-foreground">Receive updates about your account</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.preferences.emailNotifications}
                              onChange={(e) => setFormData({
                                ...formData,
                                preferences: {
                                  ...formData.preferences,
                                  emailNotifications: e.target.checked
                                }
                              })}
                              className="h-4 w-4"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Marketing Emails</p>
                              <p className="text-sm text-muted-foreground">Receive promotional content and tips</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.preferences.marketingEmails}
                              onChange={(e) => setFormData({
                                ...formData,
                                preferences: {
                                  ...formData.preferences,
                                  marketingEmails: e.target.checked
                                }
                              })}
                              className="h-4 w-4"
                            />
                          </div>
                        </CardContent>
                      </Card>

                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <h3 className="text-lg font-semibold">Delete Account</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                className="h-8 w-8 p-0"
                disabled={deleteLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data, resumes, and account information.
            </p>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-destructive font-medium">
                Your account will be deleted in 15 days
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You can cancel this deletion anytime before the 15-day period expires.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Plans Modal - Using UpgradeModal component */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        message="You've run out of credits! Purchase a credit pack to download resumes. (Each export costs 1 credit)"
      />
    </div>
  );
}
