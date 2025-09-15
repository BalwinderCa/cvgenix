"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';
import FooterSection from '@/components/footer-section';

interface ATSResult {
  overallScore: number;
  keywordScore: number;
  formatScore: number;
  structureScore: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  keywords: {
    found: string[];
    missing: string[];
    suggested: string[];
  };
  recommendations: string[];
}

export default function ATSScorePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError('');
      setAtsResult(null);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const analyzeResume = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a resume first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);

      const response = await fetch('http://localhost:3001/api/ats/analyze', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setAtsResult(result.data);
        toast.success('Resume analyzed successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to analyze resume');
        toast.error('Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError('An error occurred while analyzing your resume');
      toast.error('An error occurred while analyzing your resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <div className="container mx-auto py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ATS Score Analyzer</h1>
          <p className="text-muted-foreground">
            Upload your resume to get an instant ATS compatibility score and optimization suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {uploadedFile ? (
                  <div>
                    <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF files up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={analyzeResume}
                disabled={!uploadedFile || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {atsResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  ATS Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    <span className={getScoreColor(atsResult.overallScore)}>
                      {atsResult.overallScore}%
                    </span>
                  </div>
                  <Badge variant={getScoreBadgeVariant(atsResult.overallScore)}>
                    {atsResult.overallScore >= 80 ? 'Excellent' : 
                     atsResult.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Keywords</span>
                      <span className="text-sm">{atsResult.keywordScore}%</span>
                    </div>
                    <Progress value={atsResult.keywordScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Format</span>
                      <span className="text-sm">{atsResult.formatScore}%</span>
                    </div>
                    <Progress value={atsResult.formatScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Structure</span>
                      <span className="text-sm">{atsResult.structureScore}%</span>
                    </div>
                    <Progress value={atsResult.structureScore} className="h-2" />
                  </div>
                </div>

                {/* Issues */}
                {atsResult.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Issues Found</h4>
                    <div className="space-y-2">
                      {atsResult.issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded border">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <p className="text-sm">{issue.message}</p>
                            {issue.suggestion && (
                              <p className="text-xs text-muted-foreground mt-1">
                                💡 {issue.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                <div>
                  <h4 className="font-medium mb-3">Keywords Analysis</h4>
                  <div className="space-y-3">
                    {atsResult.keywords.found.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Found Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.keywords.found.map((keyword, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {atsResult.keywords.missing.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-1">Missing Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.keywords.missing.map((keyword, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {atsResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {atsResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>ATS Optimization Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Keywords</h4>
                <p className="text-sm text-muted-foreground">
                  Include relevant keywords from the job description throughout your resume
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Format</h4>
                <p className="text-sm text-muted-foreground">
                  Use standard fonts, avoid graphics, and maintain consistent formatting
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Structure</h4>
                <p className="text-sm text-muted-foreground">
                  Use clear section headers and bullet points for easy parsing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <FooterSection />
    </div>
  );
}