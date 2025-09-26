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
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';

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
  const [creditPlans, setCreditPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
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
    loadCreditPlans();
  }, []);

  // Track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['profile', 'credits', 'resume', 'preferences'];
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

  const loadCreditPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await fetch('http://localhost:3001/api/payments/credit-plans');
      const data = await response.json();
      
      if (data.success) {
        setCreditPlans(data.data);
      } else {
        toast.error('Failed to load credit plans');
      }
    } catch (error) {
      console.error('Error loading credit plans:', error);
      toast.error('Failed to load credit plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleCreditPurchase = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payments/create-credit-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: planId,
          successUrl: `${window.location.origin}/profile?success=true`,
          cancelUrl: `${window.location.origin}/profile?canceled=true`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    }
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
                                <h3 className="font-medium">Resume Credits</h3>
                                <span className="text-2xl font-bold">2</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Create and download resumes</p>
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">ATS Credits</h3>
                                <span className="text-2xl font-bold">1</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Analyze resume with ATS</p>
                            </div>
                          </div>
                          
                          {/* Buy More Credits Button */}
                          <div className="pt-4">
                            <Button 
                              className="w-full"
                              onClick={() => setShowCreditModal(true)}
                            >
                              Buy More Credits
                            </Button>
                          </div>
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
                            <div className="space-y-2">
                              <div className="flex items-center justify-between py-3 px-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="font-medium text-sm">Software Engineer Resume</p>
                                    <p className="text-xs text-muted-foreground">Created 2 days ago</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
                                        toast.success('Resume deleted successfully');
                                      }
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between py-3 px-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="font-medium text-sm">Marketing Manager Resume</p>
                                    <p className="text-xs text-muted-foreground">Created 1 week ago</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
                                        toast.success('Resume deleted successfully');
                                      }
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between py-3 px-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="font-medium text-sm">Data Analyst Resume</p>
                                    <p className="text-xs text-muted-foreground">Created 2 weeks ago</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
                                        toast.success('Resume deleted successfully');
                                      }
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-2">
                              <Button variant="ghost" size="sm" className="w-full">
                                View All Resumes
                              </Button>
                            </div>
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

      {/* Credit Plans Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Buy More Credits</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreditModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {loadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creditPlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`p-6 border rounded-lg relative ${
                      plan.popular ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-white">Most Popular</Badge>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      
                      <div className="mb-6">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground"> / one-time</span>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-3xl font-bold text-primary">{plan.credits} Credits</div>
                        <p className="text-sm text-muted-foreground">Resume + ATS Analysis</p>
                      </div>
                      
                      <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full"
                        onClick={() => handleCreditPurchase(plan.id)}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
