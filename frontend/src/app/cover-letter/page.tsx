"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Save, 
  Download, 
  Plus,
  Trash2,
  Edit,
  Eye,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface CoverLetter {
  _id: string;
  title: string;
  company: string;
  position: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CoverLetterForm {
  title: string;
  company: string;
  position: string;
  content: string;
}

export default function CoverLetterPage() {
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [formData, setFormData] = useState<CoverLetterForm>({
    title: '',
    company: '',
    position: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCoverLetters();
  }, []);

  const loadCoverLetters = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/cover-letters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCoverLetters(data);
      }
    } catch (error) {
      console.error('Error loading cover letters:', error);
      toast.error('Failed to load cover letters');
    }
  };

  const createNewLetter = () => {
    setSelectedLetter(null);
    setFormData({
      title: '',
      company: '',
      position: '',
      content: ''
    });
    setIsEditing(true);
  };

  const editLetter = (letter: CoverLetter) => {
    setSelectedLetter(letter);
    setFormData({
      title: letter.title,
      company: letter.company,
      position: letter.position,
      content: letter.content
    });
    setIsEditing(true);
  };

  const saveCoverLetter = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedLetter 
        ? `http://localhost:3001/api/cover-letters/${selectedLetter._id}`
        : 'http://localhost:3001/api/cover-letters';
      
      const method = selectedLetter ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(selectedLetter ? 'Cover letter updated!' : 'Cover letter created!');
        setIsEditing(false);
        loadCoverLetters();
        setSelectedLetter(null);
      } else {
        toast.error('Failed to save cover letter');
      }
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast.error('Error saving cover letter');
    } finally {
      setLoading(false);
    }
  };

  const deleteCoverLetter = async (letterId: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/cover-letters/${letterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCoverLetters(prev => prev.filter(letter => letter._id !== letterId));
        toast.success('Cover letter deleted successfully');
        if (selectedLetter?._id === letterId) {
          setSelectedLetter(null);
          setIsEditing(false);
        }
      } else {
        toast.error('Failed to delete cover letter');
      }
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      toast.error('Error deleting cover letter');
    }
  };

  const downloadCoverLetter = async (letter: CoverLetter) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/cover-letters/${letter._id}/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${letter.title}_Cover_Letter.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Cover letter downloaded successfully');
      } else {
        toast.error('Failed to download cover letter');
      }
    } catch (error) {
      console.error('Error downloading cover letter:', error);
      toast.error('Error downloading cover letter');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cover Letters</h1>
            <p className="text-muted-foreground">Create and manage your professional cover letters</p>
          </div>
          <Button onClick={createNewLetter}>
            <Plus className="w-4 h-4 mr-2" />
            New Cover Letter
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cover Letters List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Cover Letters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coverLetters.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No cover letters yet</p>
                    <Button onClick={createNewLetter} size="sm">
                      Create Your First Cover Letter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {coverLetters.map((letter) => (
                      <div
                        key={letter._id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedLetter?._id === letter._id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          setSelectedLetter(letter);
                          setIsEditing(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{letter.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {letter.position} at {letter.company}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Updated: {formatDate(letter.updatedAt)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                editLetter(letter);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCoverLetter(letter._id);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cover Letter Editor/Viewer */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {selectedLetter ? 'Edit Cover Letter' : 'Create New Cover Letter'}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedLetter(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={saveCoverLetter} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Software Engineer Application"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Job title"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Cover Letter Content</Label>
                    <Textarea
                      id="content"
                      rows={15}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your cover letter here..."
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : selectedLetter ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedLetter.title}</CardTitle>
                      <p className="text-muted-foreground">
                        {selectedLetter.position} at {selectedLetter.company}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => editLetter(selectedLetter)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button onClick={() => downloadCoverLetter(selectedLetter)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedLetter.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No cover letter selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a cover letter from the list or create a new one
                  </p>
                  <Button onClick={createNewLetter}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Cover Letter
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}