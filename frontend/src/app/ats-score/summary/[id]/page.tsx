"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  FileText
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
  // Additional data from enhanced analyzer
  overallGrade?: string;
  detailedMetrics?: {
    sectionCompleteness: number;
    keywordDensity: number;
    formatConsistency: number;
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
  detailedInsights?: {
    keywordAnalysis: string;
    formatAnalysis: string;
    contentAnalysis: string;
    industryAlignment: string;
    atsCompatibility: string;
  };
  industryAlignment?: number;
  contentQuality?: number;
  industryBenchmark?: any;
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
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Analysis Complete
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ATS Resume Analysis Results
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Your resume has been analyzed using advanced AI technology
            </p>
            
            {/* File Info and Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{fileName}</span>
                <span className="text-gray-500">({formatFileSize(fileSize)})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Analyzed on {formatDate(analyzedAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
              <Button onClick={handleNewAnalysis}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze Another Resume
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <Card className="border border-gray-200 mb-8">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold mb-4">
                <span className={getScoreColor(atsResult.overallScore)}>
                  {atsResult.overallScore}%
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant={getScoreBadgeVariant(atsResult.overallScore)} className="text-base">
                  {atsResult.overallScore >= 80 ? 'Excellent' : 
                   atsResult.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
                {atsResult.overallGrade && (
                  <Badge variant="outline" className="text-base">
                    Grade: {atsResult.overallGrade}
                  </Badge>
                )}
              </div>
              {atsResult.quickStats && (
                <p className="text-gray-600">
                  {atsResult.quickStats.wordCount} words • {atsResult.quickStats.sectionsFound} sections
                </p>
              )}
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Keywords</span>
                  <span className="text-2xl font-bold text-blue-600">{atsResult.keywordScore}%</span>
                </div>
                <Progress value={atsResult.keywordScore} className="h-2" />
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Format</span>
                  <span className="text-2xl font-bold text-green-600">{atsResult.formatScore}%</span>
                </div>
                <Progress value={atsResult.formatScore} className="h-2" />
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">Structure</span>
                  <span className="text-2xl font-bold text-purple-600">{atsResult.structureScore}%</span>
                </div>
                <Progress value={atsResult.structureScore} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          {atsResult.detailedMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{atsResult.detailedMetrics.actionVerbs}%</div>
                  <div className="text-sm font-medium text-gray-900">Action Verbs</div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-teal-600 mb-1">{atsResult.detailedMetrics.quantifiedAchievements}%</div>
                  <div className="text-sm font-medium text-gray-900">Quantified Results</div>
                </CardContent>
              </Card>
              {atsResult.industryAlignment && (
                <Card className="border border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{atsResult.industryAlignment}%</div>
                    <div className="text-sm font-medium text-gray-900">Industry Alignment</div>
                  </CardContent>
                </Card>
              )}
              {atsResult.contentQuality && (
                <Card className="border border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-pink-600 mb-1">{atsResult.contentQuality}%</div>
                    <div className="text-sm font-medium text-gray-900">Content Quality</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Issues */}
          {atsResult.issues.length > 0 && (
            <Card className="border border-gray-200 mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {atsResult.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-gray-600 mt-1">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          <Card className="border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Keywords Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atsResult.keywords.found.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">Found Keywords</p>
                    <div className="flex flex-wrap gap-2">
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
                    <p className="text-sm font-medium text-red-600 mb-2">Missing Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.keywords.missing.map((keyword, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          {((atsResult.strengths && atsResult.strengths.length > 0) || (atsResult.weaknesses && atsResult.weaknesses.length > 0)) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {atsResult.strengths && atsResult.strengths.length > 0 && (
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {atsResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 font-bold">✓</span>
                          <span className="text-gray-900">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {atsResult.weaknesses && atsResult.weaknesses.length > 0 && (
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {atsResult.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-red-500 font-bold">!</span>
                          <span className="text-gray-900">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Detailed Insights */}
          {atsResult.detailedInsights && (
            <Card className="border border-gray-200 mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Detailed Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {atsResult.detailedInsights.keywordAnalysis && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2">Keyword Analysis</h5>
                      <p className="text-sm text-blue-800">{atsResult.detailedInsights.keywordAnalysis}</p>
                    </div>
                  )}
                  {atsResult.detailedInsights.formatAnalysis && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-medium text-green-900 mb-2">Format Analysis</h5>
                      <p className="text-sm text-green-800">{atsResult.detailedInsights.formatAnalysis}</p>
                    </div>
                  )}
                  {atsResult.detailedInsights.contentAnalysis && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-medium text-purple-900 mb-2">Content Analysis</h5>
                      <p className="text-sm text-purple-800">{atsResult.detailedInsights.contentAnalysis}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {atsResult.recommendations.length > 0 && (
            <Card className="border border-gray-200 mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {atsResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold text-xs">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-900">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Actions */}
          <div className="text-center pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={handleNewAnalysis} size="lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze Another Resume
              </Button>
              <Button onClick={handleShare} variant="outline" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share These Results
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Analysis ID: {analysisId}
            </p>
          </div>
        </div>
      </div>
      
      <FooterSection />
    </div>
  );
}
