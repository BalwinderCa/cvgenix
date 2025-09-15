"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleProgressModal } from '@/components/ui/simple-progress-modal';
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

export default function ATSScorePage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepMessage, setStepMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Generate a unique analysis ID
  const generateAnalysisId = () => {
    return 'ats-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

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
    setProgressError('');
    setShowProgressModal(true);
    setCurrentStep(0);
    setStepMessage('Starting analysis...');

    // Generate session ID for real progress tracking
    const newSessionId = generateAnalysisId();
    setSessionId(newSessionId);

    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      formData.append('sessionId', newSessionId);

      console.log(`🚀 Starting analysis with session ID: ${newSessionId}`);

      // Get API base URL dynamically
      const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
        ? `${window.location.protocol}//${window.location.host}/api`
        : 'http://localhost:3001/api';
      
      // Start the request - this will trigger the SSE progress updates
      const response = await fetch(`${apiBaseUrl}/ats/analyze`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const analysisId = generateAnalysisId();
        setCurrentAnalysisId(analysisId);
        
        console.log('✅ Backend analysis completed successfully');
        
        // Store the analysis data with the unique ID
        const analysisData = {
          result: result.data,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          analyzedAt: new Date().toISOString(),
          analysisId: analysisId
        };
        
        // Store in localStorage for immediate access
        localStorage.setItem(`ats-analysis-${analysisId}`, JSON.stringify(analysisData));
        
        console.log('✅ Analysis data stored with ID:', analysisId);
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.message || 'Failed to analyze resume';
        setError(errorMsg);
        setProgressError(errorMsg);
        toast.error('Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      const errorMsg = 'An error occurred while analyzing your resume';
      setError(errorMsg);
      setProgressError(errorMsg);
      toast.error('An error occurred while analyzing your resume');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAnalysis = () => {
    setShowProgressModal(false);
    setLoading(false);
    setProgressError('');
    setCurrentStep(0);
    setStepMessage('');
    setSessionId(null);
    // Note: In a real implementation, you might want to cancel the actual request
    toast.info('Analysis cancelled');
  };

  const handleRetryAnalysis = () => {
    setShowProgressModal(false);
    setError('');
    setProgressError('');
    setCurrentStep(0);
    setStepMessage('');
    setSessionId(null);
    analyzeResume();
  };

  const handleProgressError = (errorMsg: string) => {
    setProgressError(errorMsg);
    setError(errorMsg);
  };

  const handleAnalysisComplete = (result: any) => {
    if (currentAnalysisId) {
      setShowProgressModal(false);
      router.push(`/ats-score/summary/${currentAnalysisId}`);
      toast.success('Resume analyzed successfully!');
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16 mt-15">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
              AI-Powered Analysis
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ATS Resume Analyzer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get instant AI-powered analysis of your resume's ATS compatibility with detailed insights and actionable recommendations
            </p>
          </div>

          {/* Main Content - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-8">
            
            {/* Left Side - How It Works */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
                <div className="relative">
                  {/* Timeline line with gradient */}
                 
                  
                  <div className="space-y-4">
                    <div className="relative flex items-center gap-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      {/* Content */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Upload Your Resume</h3>
                        <p className="text-gray-600 text-sm">Simply drag and drop your PDF resume</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                        <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                    
                    <div className="relative flex items-center gap-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      {/* Content */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">AI Analysis</h3>
                        <p className="text-gray-600 text-sm">Our AI analyzes your resume across multiple dimensions</p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                        <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                
                    <div className="relative flex items-center gap-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      {/* Content */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Get Results</h3>
                        <p className="text-gray-600 text-sm">Receive detailed scores and recommendations</p>
                      </div>
                    </div>
                    
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Upload */}
            <div>
              <Card className="border border-gray-200 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Upload Your Resume</CardTitle>
                  <p className="text-gray-600 text-sm">Get instant AI-powered analysis</p>
                </CardHeader>
                <CardContent className="p-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <FileText className="w-10 h-10 mx-auto text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-10 h-10 mx-auto text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {isDragActive ? 'Drop your resume here' : 'Upload Resume'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Drag & drop or click to browse • PDF files only
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={analyzeResume}
                    disabled={!uploadedFile || loading}
                    className="w-full mt-4"
                    size="default"
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
            </div>
          </div>


          {/* Why ATS Optimization Matters Section */}
          {/* <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Why ATS Optimization Matters</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Understanding the importance of ATS compatibility for your career success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-600 font-bold text-xl">75%</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">High Rejection Rate</h3>
                <p className="text-sm text-gray-600">of resumes are rejected by ATS systems before a human ever sees them</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-Dimensional Analysis</h3>
                <p className="text-sm text-gray-600">We analyze your resume across keyword optimization, formatting, and structure</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Maximize Opportunities</h3>
                <p className="text-sm text-gray-600">Get detailed feedback and recommendations to land more interviews</p>
              </div>
            </div>
          </div> */}

          {/* Privacy & Security Section */}
          <div className="mb-8 mt-22">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacy & Security</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your data privacy and security are our top priorities
              </p>
            </div>
            
            <Card className="border border-gray-200 shadow-lg">
              <CardContent className="px-8 py-8">
                <div className="max-w-4xl mx-auto">
                  {/* Security Badges */}
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>No Data Storage</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Secure Processing</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>No Third-Party Sharing</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Anonymity</span>
                    </div>
                  </div>
                  
                  {/* Main Description */}
                  <div className="text-center mb-8">
                    <p className="text-gray-600 text-base max-w-3xl mx-auto leading-relaxed">
                      Your resume is processed temporarily and immediately deleted from our servers. 
                      All analysis is done securely with industry-standard encryption. We never share 
                      your data with third parties or use it for marketing. Your personal information 
                      remains completely anonymous during analysis.
                    </p>
                  </div>

                  {/* Trust Indicators */}
                 
                </div>
              </CardContent>
            </Card>
          </div>

        

          

        </div>
      </div>
      
      <FooterSection />

      {/* Progress Modal */}
      {showProgressModal && (
        <SimpleProgressModal
          key={`progress-${currentAnalysisId || 'new'}`}
          open={showProgressModal}
          onOpenChange={setShowProgressModal}
          fileName={uploadedFile?.name}
          fileSize={uploadedFile?.size}
          onCancel={handleCancelAnalysis}
          onRetry={handleRetryAnalysis}
          hasError={!!progressError}
          errorMessage={progressError}
          onError={handleProgressError}
          onComplete={handleAnalysisComplete}
          sessionId={sessionId || undefined}
        />
      )}
    </div>
  );
}