"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  User,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface Resume {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  template: string;
}

interface UserStats {
  totalResumes: number;
  totalDownloads: number;
  atsScore: number;
  lastActivity: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalResumes: 0,
    totalDownloads: 0,
    atsScore: 0,
    lastActivity: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Load user resumes
      const resumesResponse = await fetch('http://localhost:3001/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (resumesResponse.ok) {
        const resumesData = await resumesResponse.json();
        setResumes(resumesData);
      }

      // Load user stats
      const statsResponse = await fetch('http://localhost:3001/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = () => {
    router.push('/resume-builder');
  };

  const editResume = (resumeId: string) => {
    router.push(`/resume-builder?id=${resumeId}`);
  };

  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setResumes(prev => prev.filter(resume => resume._id !== resumeId));
        toast.success('Resume deleted successfully');
      } else {
        toast.error('Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Error deleting resume');
    }
  };

  const downloadResume = async (resumeId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/resumes/${resumeId}/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${resumeId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Resume downloaded successfully');
      } else {
        toast.error('Failed to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Error downloading resume');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your resumes and track your progress</p>
          </div>
          <Button onClick={createNewResume}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Resume
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResumes}</div>
              <p className="text-xs text-muted-foreground">
                {resumes.length} active resumes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
              <p className="text-xs text-muted-foreground">
                Total downloads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.atsScore}%</div>
              <p className="text-xs text-muted-foreground">
                Average ATS score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.lastActivity ? formatDate(stats.lastActivity) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Recent activity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Resumes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Resumes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first professional resume to get started
                </p>
                <Button onClick={createNewResume}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{resume.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created: {formatDate(resume.createdAt)}</span>
                          <span>Updated: {formatDate(resume.updatedAt)}</span>
                          <Badge variant={resume.status === 'published' ? 'default' : 'secondary'}>
                            {resume.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editResume(resume._id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadResume(resume._id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResume(resume._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
