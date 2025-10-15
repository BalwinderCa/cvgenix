"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Removed ReactMarkdown import - using plain text rendering for ATS analysis
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  TrendingUp,
  Target,
  Award,
  ArrowLeft,
  Share2,
  Copy,
  FileText,
  FileDown,
  Clock,
  Star,
  Percent,
  CheckCircle2,
  CircleX
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';
import FooterSection from '@/components/footer-section';
import { PDFThumbnailPreview } from '@/components/pdf-thumbnail-preview';

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
  // Additional data from enhanced analyzer
  overallGrade?: string;
  parsingMethod?: string;
  processingMode?: string;
  confidence?: number;
  detailedMetrics?: {
    sectionCompleteness: number;
    keywordDensity: number;
    structureConsistency: number; // Fixed: GPT provides structureConsistency, not formatConsistency
    actionVerbs: number;
    quantifiedAchievements: number;
  };
  quickStats?: {
    wordCount: number;
    sectionsFound: number;
    keywordsMatched: number;
    improvementAreas: number;
  };
  strengths?: string[];
  weaknesses?: string[];
  sectionAnalysis?: {
    contactInfo: string;
    professionalSummary: string;
    experience: string;
    education: string;
    skills: string;
    certifications: string;
    achievements: string;
  };
  industryAlignment?: number;
  contentQuality?: number;
  industryBenchmark?: any;
  // PDF content for preview
  pdfContent?: string;
  // PDF URL for thumbnail
  pdfUrl?: string;
  // Years of experience
  yearsOfExperience?: {
    years: number;
    source: string;
    confidence: number;
  };
  // Analysis context
  targetIndustry?: string;
  targetRole?: string;
  // Action plan from GPT-OSS
  actionPlan?: {
    highPriority: Array<{
      title: string;
      description: string;
      estimatedImpact: string;
      reason: string;
    }>;
    mediumPriority: Array<{
      title: string;
      description: string;
      estimatedImpact: string;
      reason: string;
    }>;
    lowPriority: Array<{
      title: string;
      description: string;
      estimatedImpact: string;
      reason: string;
    }>;
  };
  // Section completeness scores from GPT-OSS
  sectionCompleteness?: {
    contactInfo: number;
    professionalSummary: number;
    experience: number;
    education: number;
    skills: number;
    certifications: number;
    achievements: number;
  };
}

interface AnalysisData {
  result: ATSResult;
  fileName: string;
  fileSize: number;
  analyzedAt: string;
  analysisId: string;
}

export default function ATSSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const analysisId = params.id as string;

  // Utility function to clean and format text content
  const formatTextContent = (text: string): string => {
    if (!text) return '';
    
    return text
      // Remove any remaining markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Convert markdown lists to simple bullet points
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove markdown links but keep the text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove code blocks and inline code
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Clean up HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

  useEffect(() => {
    if (analysisId) {
      loadAnalysisData();
    }
  }, [analysisId]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      
      // Try to get from localStorage first (for immediate access)
      const cachedData = localStorage.getItem(`ats-analysis-${analysisId}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setAnalysisData(parsed);
        setLoading(false);
        return;
      }

      // If not in cache, try to fetch from server
      const response = await fetch(`/api/ats/results/${analysisId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
        // Cache the result
        localStorage.setItem(`ats-analysis-${analysisId}`, JSON.stringify(data));
      } else {
        setError('Analysis results not found or expired');
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
      setError('Failed to load analysis results');
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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleNewAnalysis = () => {
    router.push('/ats-score');
  };

  const handleDownloadReport = async () => {
    try {
      // Create a comprehensive report data
      const reportData = {
        fileName,
        fileSize,
        analyzedAt,
        analysisId,
        overallScore: atsResult.overallScore,
        overallGrade: atsResult.overallGrade,
        scores: {
          keyword: atsResult.keywordScore,
          format: atsResult.formatScore,
          structure: atsResult.structureScore
        },
        detailedMetrics: atsResult.detailedMetrics,
        strengths: atsResult.strengths,
        weaknesses: atsResult.weaknesses,
        sectionAnalysis: atsResult.sectionAnalysis,
        keywords: atsResult.keywords,
        yearsOfExperience: atsResult.yearsOfExperience,
        targetIndustry: atsResult.targetIndustry,
        targetRole: atsResult.targetRole
      };

      // Send to backend to generate PDF
      const response = await fetch('/api/ats/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ATS-Analysis-Report-${fileName.replace('.pdf', '')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report downloaded successfully!');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-gray-600">Loading analysis results...</p>
              </div>
            </div>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The analysis results could not be found.'}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/ats-score')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Analyzer
                </Button>
                <Button onClick={handleNewAnalysis}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  const { result: atsResult, fileName, fileSize, analyzedAt } = analysisData;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">ATS Analysis Results</h1>
                <p className="text-sm text-gray-500">Resume optimization insights and recommendations</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" size="sm" onClick={handleNewAnalysis}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            {/* File Info */}
            <div className="flex items-center gap-6 text-xs text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{fileName}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{formatFileSize(fileSize)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Analyzed {formatDate(analyzedAt)}</span>
              </div>
            </div>
          </div>


          {/* Main Layout - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - PDF Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
          {/* PDF Thumbnail Preview */}
          <PDFThumbnailPreview
            fileName={fileName}
            fileSize={fileSize}
            pdfUrl={atsResult.pdfUrl}
            className="mb-6"
          />

                {/* Analysis Context */}
                {(atsResult.targetIndustry || atsResult.targetRole) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Analysis Context</h3>
                    <div className="space-y-2">
                      {atsResult.targetIndustry && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Industry</span>
                          <Badge variant="outline" className="text-xs">
                            {atsResult.targetIndustry}
                          </Badge>
                        </div>
                      )}
                      {atsResult.targetRole && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Position</span>
                          <Badge variant="outline" className="text-xs">
                            {atsResult.targetRole}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Analysis Results */}
            <div className="lg:col-span-2 space-y-6">

              {/* Overall Score */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">
                    <span className={getScoreColor(atsResult.overallScore)}>
                      {atsResult.overallScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="outline" className="text-sm">
                      {atsResult.overallGrade}
                    </Badge>
                  </div>
                  {atsResult.quickStats && (
                    <p className="text-sm text-gray-500">
                      {atsResult.quickStats.wordCount} words • {atsResult.quickStats.sectionsFound} sections
                      {atsResult.yearsOfExperience && atsResult.yearsOfExperience.years > 0 && (
                        <span> • {atsResult.yearsOfExperience.years} years experience</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Score Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{atsResult.keywordScore}%</div>
                    <div className="text-xs text-gray-500">Keywords</div>
                    <Progress value={atsResult.keywordScore} className="h-1 mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{atsResult.formatScore}%</div>
                    <div className="text-xs text-gray-500">Format</div>
                    <Progress value={atsResult.formatScore} className="h-1 mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{atsResult.structureScore}%</div>
                    <div className="text-xs text-gray-500">Structure</div>
                    <Progress value={atsResult.structureScore} className="h-1 mt-2" />
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              {atsResult.detailedMetrics && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Detailed Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600 mb-1">{atsResult.detailedMetrics.actionVerbs}%</div>
                      <div className="text-xs text-gray-500">Action Verbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-teal-600 mb-1">{atsResult.detailedMetrics.quantifiedAchievements}%</div>
                      <div className="text-xs text-gray-500">Quantified Results</div>
                    </div>
                    {atsResult.industryAlignment && (
                      <div className="text-center">
                        <div className="text-xl font-bold text-indigo-600 mb-1">{atsResult.industryAlignment}%</div>
                        <div className="text-xs text-gray-500">Industry Alignment</div>
                      </div>
                    )}
                    {atsResult.contentQuality && (
                      <div className="text-center">
                        <div className="text-xl font-bold text-pink-600 mb-1">{atsResult.contentQuality}%</div>
                        <div className="text-xs text-gray-500">Content Quality</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section Completeness */}
              {atsResult.sectionCompleteness && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Section Completeness
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(atsResult.sectionCompleteness).map(([section, completeness]) => {
                      const sectionName = section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      const hasSection = completeness > 0;
                      
                      return (
                        <div key={section} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{sectionName}</span>
                          <div className="flex items-center">
                            {hasSection ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <CircleX className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strengths and Weaknesses */}
              {((atsResult.strengths && atsResult.strengths.length > 0) || (atsResult.weaknesses && atsResult.weaknesses.length > 0)) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Strengths & Areas for Improvement</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    {atsResult.strengths && atsResult.strengths.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide">Strengths</h4>
                        <div className="space-y-2">
                          {atsResult.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded border border-green-200">
                              <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-green-800">{formatTextContent(strength)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {atsResult.weaknesses && atsResult.weaknesses.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-red-700 uppercase tracking-wide">Areas for Improvement</h4>
                        <div className="space-y-2">
                          {atsResult.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded border border-red-200">
                              <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-red-800">{formatTextContent(weakness)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}





          {/* Section-by-Section Analysis */}
          {atsResult.sectionAnalysis && (
            <Card className="border border-gray-200 mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Section-by-Section Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {atsResult.sectionAnalysis.contactInfo && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Contact Information
                      </h5>
                      <p className="text-sm text-blue-800 whitespace-pre-line">{formatTextContent(atsResult.sectionAnalysis.contactInfo)}</p>
                    </div>
                  )}
                  
                  {atsResult.sectionAnalysis.professionalSummary && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Professional Summary
                      </h5>
                      <p className="text-sm text-green-800 whitespace-pre-line">{formatTextContent(atsResult.sectionAnalysis.professionalSummary)}</p>
                    </div>
                  )}
                  
                  {atsResult.sectionAnalysis.experience && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Work Experience
                      </h5>
                      <p className="text-sm text-purple-800 whitespace-pre-line">{formatTextContent(atsResult.sectionAnalysis.experience)}</p>
                    </div>
                  )}
                  
                  {atsResult.sectionAnalysis.education && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h5 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Education
                      </h5>
                      <p className="text-sm text-orange-800 whitespace-pre-line">{formatTextContent(atsResult.sectionAnalysis.education)}</p>
                    </div>
                  )}
                  
                  {atsResult.sectionAnalysis.skills && (
                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <h5 className="font-medium text-teal-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        Skills
                      </h5>
                      <p className="text-sm text-teal-800 whitespace-pre-line">{formatTextContent(atsResult.sectionAnalysis.skills)}</p>
                    </div>
                  )}
                  
                  {atsResult.sectionAnalysis.certifications && (
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h5 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        Certifications
                      </h5>
                      <p className="text-sm text-indigo-800 whitespace-pre-line">{formatTextContent(atsResult.sectionAnalysis.certifications)}</p>
                    </div>
                  )}
                  
                  {atsResult.sectionAnalysis.achievements && (
                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <h5 className="font-medium text-pink-900 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        Achievements
                      </h5>
                      <p className="text-sm text-pink-800 whitespace-pre-line">{formatTextContent(atsResult.sectionAnalysis.achievements)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

              {/* Keywords Analysis */}
              {atsResult.keywords && (atsResult.keywords.found.length > 0 || atsResult.keywords.missing.length > 0 || atsResult.keywords.suggested.length > 0) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Keywords Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Found Keywords */}
                    {atsResult.keywords.found.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide">Found Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.keywords.found.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Keywords */}
                    {atsResult.keywords.missing.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-red-700 uppercase tracking-wide">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.keywords.missing.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Keywords */}
                    {atsResult.keywords.suggested.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wide">Suggested Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.keywords.suggested.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prioritized Action Plan */}
              {atsResult.actionPlan && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Prioritized Action Plan
                  </h3>
                  <div className="space-y-4">
                    {/* High Priority Actions */}
                    {atsResult.actionPlan?.highPriority && atsResult.actionPlan.highPriority.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-red-700 uppercase tracking-wide flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          High Priority (Immediate Impact)
                        </h4>
                        <div className="space-y-2">
                          {atsResult.actionPlan?.highPriority?.map((action, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-200">
                              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</div>
                              <div>
                                <p className="text-sm font-medium text-red-900">{action.title}</p>
                                <p className="text-xs text-red-700 mt-1">{action.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-red-600" />
                                  <span className="text-xs text-red-600">Estimated impact: +{action.estimatedImpact} points</span>
                                </div>
                                <p className="text-xs text-red-600 mt-1 italic">Why: {action.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medium Priority Actions */}
                    {atsResult.actionPlan?.mediumPriority && atsResult.actionPlan.mediumPriority.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-yellow-700 uppercase tracking-wide flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Medium Priority (Short-term Impact)
                        </h4>
                        <div className="space-y-2">
                          {atsResult.actionPlan?.mediumPriority?.map((action, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                              <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{(atsResult.actionPlan?.highPriority?.length || 0) + index + 1}</div>
                              <div>
                                <p className="text-sm font-medium text-yellow-900">{action.title}</p>
                                <p className="text-xs text-yellow-700 mt-1">{action.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-yellow-600" />
                                  <span className="text-xs text-yellow-600">Estimated impact: +{action.estimatedImpact} points</span>
                                </div>
                                <p className="text-xs text-yellow-600 mt-1 italic">Why: {action.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Low Priority Actions */}
                    {atsResult.actionPlan?.lowPriority && atsResult.actionPlan.lowPriority.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-green-700 uppercase tracking-wide flex items-center gap-2">
                          <Star className="w-3 h-3" />
                          Low Priority (Long-term Enhancement)
                        </h4>
                        <div className="space-y-2">
                          {atsResult.actionPlan?.lowPriority?.map((action, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {(atsResult.actionPlan?.highPriority?.length || 0) + (atsResult.actionPlan?.mediumPriority?.length || 0) + index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-900">{action.title}</p>
                                <p className="text-xs text-green-700 mt-1">{action.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-green-600" />
                                  <span className="text-xs text-green-600">Estimated impact: +{action.estimatedImpact} points</span>
                                </div>
                                <p className="text-xs text-green-600 mt-1 italic">Why: {action.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      <FooterSection />
    </div>
  );
}
