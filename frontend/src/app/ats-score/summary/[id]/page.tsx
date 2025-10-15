"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download, 
  Sparkles, 
  ArrowLeft,
  TrendingUp,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationHeader from '@/components/navigation-header';
import FooterSection from '@/components/footer-section';

interface ATSResult {
  overallScore: number;
  keywordScore: number;
  formatScore: number;
  structureScore: number;
  keywords: {
    found: string[];
    missing: string[];
    suggested: string[];
  };
  overallGrade?: string;
  detailedMetrics?: {
    sectionCompleteness: number;
    keywordDensity: number;
    structureConsistency: number;
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
  pdfUrl?: string;
  yearsOfExperience?: {
    years: number;
    source: string;
    confidence: number;
  };
  targetIndustry?: string;
  targetRole?: string;
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
  sectionCompleteness?: {
    contactInfo: number;
    professionalSummary: number;
    experience: number;
    education: number;
    skills: number;
    certifications: number;
    achievements: number;
  };
  sectionSuggestions?: {
    contactInfo: string;
    professionalSummary: string;
    experience: string;
    education: string;
    skills: string;
    certifications: string;
    achievements: string;
  };
  detectedJobTitle?: string;
  aiSummary?: string;
  matchScoreDescription?: string;
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
    const loadAnalysisData = async () => {
      try {
        const storedData = localStorage.getItem(`ats-analysis-${analysisId}`);
        if (storedData) {
          const data = JSON.parse(storedData);
          setAnalysisData(data);
        } else {
          setError('Analysis data not found. Please run a new analysis.');
        }
      } catch (err) {
        console.error('Error loading analysis:', err);
        setError('Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      loadAnalysisData();
    }
  }, [analysisId]);

  const handleDownloadReport = async () => {
    if (!analysisData) return;

    toast.info('Generating PDF report...');
    
    try {
      const response = await fetch('/api/ats/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportData: {
            analysisId,
            fileName: analysisData.fileName,
            analyzedAt: analysisData.analyzedAt,
            targetIndustry: analysisData.result.targetIndustry,
            targetRole: analysisData.result.targetRole,
            scores: {
              overall: analysisData.result.overallScore,
              keyword: analysisData.result.keywordScore,
              format: analysisData.result.formatScore,
              structure: analysisData.result.structureScore
            },
            detailedMetrics: analysisData.result.detailedMetrics,
            detectedJobTitle: analysisData.result.detectedJobTitle,
            aiSummary: analysisData.result.aiSummary,
            yearsOfExperience: analysisData.result.yearsOfExperience,
            keywords: analysisData.result.keywords,
            strengths: analysisData.result.strengths,
            weaknesses: analysisData.result.weaknesses,
            sectionCompleteness: analysisData.result.sectionCompleteness,
            sectionSuggestions: analysisData.result.sectionSuggestions,
            actionPlan: analysisData.result.actionPlan
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATS-Report-${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    }
  };


  const getStatusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "partial") return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "complete") return "Complete";
    if (status === "partial") return "Partial";
    return "Optional";
  };

  const getSectionStatus = (completeness: number): string => {
    if (completeness >= 80) return "complete";
    if (completeness > 0) return "partial";
    return "optional";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Analysis not found'}</p>
          <Button onClick={() => router.push('/ats-score')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ATS Analyzer
          </Button>
        </div>
      </div>
    );
  }

  const atsResult = analysisData.result;
  const matchScore = atsResult.overallScore;
  const jobTitle = atsResult.detectedJobTitle || "Not Detected";
  const aiSummary = atsResult.aiSummary || "Analysis summary not available";
  const matchScoreDescription = atsResult.matchScoreDescription || "Match score analysis not available";

  // Map section completeness to table format using dynamic GPT-OSS suggestions
  const sectionChecks = [
    { 
      section: "Contact Information", 
      completeness: atsResult.sectionCompleteness?.contactInfo || 0,
      suggestion: atsResult.sectionSuggestions?.contactInfo || "-"
    },
    { 
      section: "Summary/Profile", 
      completeness: atsResult.sectionCompleteness?.professionalSummary || 0,
      suggestion: atsResult.sectionSuggestions?.professionalSummary || "-"
    },
    { 
      section: "Work Experience", 
      completeness: atsResult.sectionCompleteness?.experience || 0,
      suggestion: atsResult.sectionSuggestions?.experience || "-"
    },
    { 
      section: "Skills", 
      completeness: atsResult.sectionCompleteness?.skills || 0,
      suggestion: atsResult.sectionSuggestions?.skills || "-"
    },
    { 
      section: "Education", 
      completeness: atsResult.sectionCompleteness?.education || 0,
      suggestion: atsResult.sectionSuggestions?.education || "-"
    },
    { 
      section: "Certifications", 
      completeness: atsResult.sectionCompleteness?.certifications || 0,
      suggestion: atsResult.sectionSuggestions?.certifications || "-"
    }
  ];

  // Combine all recommendations from action plan
  const recommendations: string[] = [];
  if (atsResult.actionPlan?.highPriority) {
    atsResult.actionPlan.highPriority.forEach(item => {
      recommendations.push(item.description);
    });
  }
  if (atsResult.actionPlan?.mediumPriority) {
    atsResult.actionPlan.mediumPriority.slice(0, 2).forEach(item => {
      recommendations.push(item.description);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/ats-score')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">ATS Resume Analysis Summary</h1>
          <p className="text-gray-600">Here's what our AI found in your resume</p>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Side - PDF Preview */}
          <div className="w-2/5 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Preview
                </h2>
              </div>
              
              {/* PDF Preview Area */}
              <div className="bg-gray-100 rounded border-2 border-gray-300 overflow-hidden">
                <div className="aspect-[8.5/11] bg-white overflow-hidden flex items-start justify-center">
                  {atsResult.pdfUrl ? (
                    <iframe
                      src={`${atsResult.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&page=1`}
                      className="w-full h-full border-0"
                      style={{
                        transform: 'scale(1.12)',
                        transformOrigin: 'center top',
                        overflow: 'hidden',
                        pointerEvents: 'none'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>PDF preview not available</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                This is a preview of your uploaded resume
              </p>
            </div>
          </div>

          {/* Right Side - Analysis Content */}
          <div className="w-3/5 flex-1 space-y-6">
            {/* 1. Resume Match Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-6">
                {/* Circular Progress */}
                <div className="relative flex-shrink-0">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke={matchScore >= 80 ? "#10b981" : matchScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      strokeDashoffset={`${2 * Math.PI * 48 * (1 - matchScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{matchScore}%</span>
                  </div>
                </div>

                {/* Match Info */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Match Score</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {matchScoreDescription}
                  </p>
                  {jobTitle !== "Not Detected" && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Job Title Detected:</p>
                      <p className="text-lg font-bold text-blue-700">{jobTitle}</p>
                    </div>
                  )}
                </div>
              </div>

              {aiSummary !== "Analysis summary not available" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1 text-sm">AI Summary:</p>
                      <p className="text-gray-700 text-sm">{aiSummary}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Key Resume Insights */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">✅</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {(atsResult.strengths || []).slice(0, 5).map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{strength}</span>
                    </li>
                  ))}
                  {(!atsResult.strengths || atsResult.strengths.length === 0) && (
                    <li className="text-gray-500 text-sm">No strengths identified</li>
                  )}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🛠️</span> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {(atsResult.weaknesses || []).slice(0, 5).map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{weakness}</span>
                    </li>
                  ))}
                  {(!atsResult.weaknesses || atsResult.weaknesses.length === 0) && (
                    <li className="text-gray-500 text-sm">No weaknesses identified</li>
                  )}
                </ul>
              </div>
            </div>

            {/* 3. Keyword & Skills Analysis */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🧠</span> Keyword & Skills Analysis
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700 mb-2 text-sm">Detected Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {(atsResult.keywords?.found || []).slice(0, 10).map((keyword, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {keyword}
                      </span>
                    ))}
                    {(!atsResult.keywords?.found || atsResult.keywords.found.length === 0) && (
                      <span className="text-gray-500 text-sm">No keywords detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-700 mb-2 text-sm">Suggested Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {(atsResult.keywords?.suggested && atsResult.keywords.suggested.length > 0) ? (
                      atsResult.keywords.suggested.slice(0, 10).map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No suggestions available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Section Completeness Check */}
            {atsResult.sectionCompleteness && (
              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span> Section Completeness Check
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-900 text-sm">Section</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900 text-sm">Status</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900 text-sm">Suggestion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionChecks.map((item, idx) => {
                        const status = getSectionStatus(item.completeness);
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-700 text-sm">{item.section}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(status)}
                                <span className="text-xs">{getStatusBadge(status)}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-gray-600 text-xs">{item.suggestion}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. AI Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-5 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">📈</span> AI Recommendations
                </h3>
                
                <ul className="space-y-3">
                  {recommendations.slice(0, 5).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => router.push('/resume-builder')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Optimize My Resume
              </Button>
              <Button 
                onClick={handleDownloadReport}
                variant="outline"
                className="flex items-center justify-center gap-2 px-6 py-3 shadow-md"
              >
                <Download className="w-5 h-5" />
                Download ATS Report (PDF)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
