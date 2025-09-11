import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import Image from '../components/AppImage';
import { useAuth } from '../hooks/useAuth';
import atsService from '../services/atsService';

const ATSScorePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [showPremiumInsights, setShowPremiumInsights] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTip, setLoadingTip] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [modelProgress, setModelProgress] = useState({ claude: 0, gpt4o: 0 });
  const [isResumePreviewExpanded, setIsResumePreviewExpanded] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef(null);

  const loadingTips = [
    "💡 ATS systems scan for specific keywords - we're checking yours!",
    "🎯 Formatting matters! We're analyzing your resume structure.",
    "📊 Quantified achievements stand out - we're finding yours!",
    "🔍 Industry-specific terms boost your score significantly.",
    "✨ Action verbs make your resume more compelling.",
    "📈 We're comparing your resume against top performers.",
    "🎨 Clean formatting helps ATS systems read your resume better.",
    "🚀 Your resume is being optimized for maximum impact!",
    "🤖 Advanced AI algorithms are analyzing your resume for comprehensive insights!",
    "⚡ Multiple analysis engines are processing your content in parallel!",
    "🎯 We're ensuring maximum accuracy with advanced technology!",
    "📊 Combining multiple analysis perspectives for the best results!"
  ];

  const analysisSteps = [
    { name: "Uploading Resume", duration: 2, progress: 5 },
    { name: "Extracting Text", duration: 3, progress: 15 },
    { name: "ATS Compatibility Check", duration: 10, progress: 50 },
    { name: "AI Analysis", duration: 10, progress: 85 },
    { name: "Finalizing Report", duration: 1, progress: 100 }
  ];
  const { isAuthenticated } = useAuth();

  // Rotate loading tips during analysis
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingTip(prev => (prev + 1) % loadingTips.length);
      }, 3000); // Change tip every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, loadingTips.length]);

  // Timer for elapsed time
  useEffect(() => {
    let timer;
    if (isAnalyzing) {
      const startTime = Date.now();
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnalyzing]);

  // Progress simulation for dual-model analysis
  useEffect(() => {
    let progressTimer;
    if (isAnalyzing && currentStep < analysisSteps.length) {
      const step = analysisSteps[currentStep];
      setLoadingStage(step.name);
      setEstimatedTime(step.duration);
      
      // Calculate previous step's progress
      const previousProgress = currentStep > 0 ? analysisSteps[currentStep - 1].progress : 0;
      const stepProgressRange = step.progress - previousProgress;
      
      // Simulate progress for this step
      let stepProgress = 0;
      progressTimer = setInterval(() => {
        stepProgress += 100 / (step.duration * 10); // 10 updates per second
        if (stepProgress >= 100) {
          setCurrentStep(prev => prev + 1);
          clearInterval(progressTimer);
        } else {
          // Accumulate progress instead of resetting
          const currentProgress = previousProgress + (stepProgressRange * (stepProgress / 100));
          setLoadingProgress(Math.min(currentProgress, step.progress));
        }
      }, 100);
    }
    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isAnalyzing, currentStep]);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 15MB.');
      return;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/html'
    ];

    if (allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setAtsScore(null);
      setAnalysisResults(null);
      setError(null);
    } else {
      alert('Please select a valid PDF, DOCX, TXT, or HTML file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const analyzeWithBackend = async (file) => {
    const atsService = (await import('../services/atsService')).default;
    
    try {
      // Simulate progress during upload
      setLoadingProgress(50);
      setLoadingStage('Processing your resume with advanced AI...');

      const options = {};
      if (selectedIndustry) options.industry = selectedIndustry;
      if (selectedRole) options.role = selectedRole;

      const result = await atsService.analyzeResume(file, options);
      
      // Simulate progress during response processing
      setLoadingProgress(80);
      setLoadingStage('Generating detailed insights...');

      console.log('Advanced analysis successful:', result);
      return result;
    } catch (error) {
      console.error('Advanced analysis error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to backend server. Please ensure the server is running.');
      }
      throw new Error(`Analysis failed: ${error.message}`);
    }
  };

  const handleExportPDF = async () => {
    if (!analysisResults || !analysisResults.analysis) {
      setError('No analysis results to export');
      return;
    }

    setIsExporting(true);
    try {
      const atsService = (await import('../services/atsService')).default;
      const fileName = selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'resume-analysis';
      await atsService.exportToPDF(
        {
          analysis: analysisResults.analysis,
          extractedText: analysisResults.extractedText,
          fileName: fileName,
          analyzedAt: analysisResults.analyzedAt
        },
        analysisResults.analysis.industryBenchmark,
        fileName
      );
    } catch (error) {
      console.error('PDF export failed:', error);
      setError('Failed to export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setLoadingProgress(0);
    setCurrentStep(0);
    setElapsedTime(0);
    setModelProgress({ claude: 0, gpt4o: 0 });
    setShowAnalysisModal(true);
    
    try {
      // Start the progress simulation
      setLoadingStage('Preparing your resume for analysis...');
      
      // Start backend analysis immediately (it handles its own timing)
      const backendResult = await analyzeWithBackend(selectedFile);
      
      if (backendResult.success && backendResult.data) {
        const analysis = backendResult.data.analysis || {};
        console.log('🎯 Frontend received analysis data:', {
          atsScore: analysis.atsScore,
          overallGrade: analysis.overallGrade,
          modelsUsed: analysis.modelsUsed,
          strengths: analysis.strengths?.length || 0,
          weaknesses: analysis.weaknesses?.length || 0,
          recommendations: analysis.recommendations?.length || 0
        });
        setAtsScore(analysis.atsScore || 0);
        setAnalysisResults({
          atsScore: analysis.atsScore || 0,
          overallGrade: analysis.overallGrade || 'F',
          industry: selectedIndustry || 'General',
          targetRole: selectedRole || 'Entry',
          extractedText: backendResult.data.extractedText || '',
          analysis: analysis,
          analyzedAt: backendResult.data.analyzedAt || new Date().toISOString()
        });
        
        // Complete the analysis
        setLoadingProgress(100);
        setLoadingStage('Analysis complete!');
        
        // Small delay to show completion, then close modal and show results
        setTimeout(() => {
          setShowAnalysisModal(false);
          setActiveTab('results');
        }, 1500);
      } else {
        throw new Error('Backend analysis returned invalid results');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Something went wrong during analysis. Please try again or contact support if the issue persists.');
      setShowAnalysisModal(false);
    } finally {
      setIsAnalyzing(false);
      setLoadingStage('');
      setLoadingProgress(0);
      setCurrentStep(0);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-primary';
    if (score >= 70) return 'text-accent';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-success/10 border-success/20';
    if (score >= 80) return 'bg-primary/10 border-primary/20';
    if (score >= 70) return 'bg-accent/10 border-accent/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreDescription = (score) => {
    if (score >= 90) return 'Your resume is highly optimized for ATS systems and should pass through most screening processes.';
    if (score >= 80) return 'Your resume is well-optimized with minor areas for improvement to maximize ATS compatibility.';
    if (score >= 70) return 'Your resume has good ATS compatibility but could benefit from several key improvements.';
    if (score >= 60) return 'Your resume needs significant improvements to pass ATS screening effectively.';
    return 'Your resume requires substantial optimization to meet ATS requirements.';
  };

  const generateInsights = (analysis) => {
    const insights = [];
    
    // Safety check
    if (!analysis) {
      console.log('⚠️ No analysis data provided to generateInsights');
      return insights;
    }
    
    console.log('🔍 Generating insights from analysis:', {
      hasStrengths: !!analysis.strengths?.length,
      hasWeaknesses: !!analysis.weaknesses?.length,
      hasRecommendations: !!analysis.recommendations?.length,
      strengthsCount: analysis.strengths?.length || 0,
      weaknessesCount: analysis.weaknesses?.length || 0,
      recommendationsCount: analysis.recommendations?.length || 0
    });
    
    // Strengths (from simple analyzer)
    if (analysis?.strengths?.length > 0) {
      insights.push({
        type: 'strengths',
        title: 'Resume Strengths',
        items: analysis.strengths,
        icon: 'CheckCircle',
        color: 'text-success'
      });
    }

    // Weaknesses (from simple analyzer)
    if (analysis?.weaknesses?.length > 0) {
      insights.push({
        type: 'weaknesses',
        title: 'Areas for Improvement',
        items: analysis.weaknesses,
        icon: 'AlertTriangle',
        color: 'text-warning'
      });
    }

    // Recommendations (from simple analyzer)
    if (analysis?.recommendations?.length > 0) {
      insights.push({
        type: 'recommendations',
        title: 'AI Recommendations',
        items: analysis.recommendations,
        icon: 'Lightbulb',
        color: 'text-primary'
      });
    }

    // Legacy support for complex analyzer
    if (analysis?.improvements?.length > 0) {
      insights.push({
        type: 'improvement',
        title: 'Key Areas for Improvement',
        items: analysis.improvements,
        icon: 'TrendingUp',
        color: 'text-warning'
      });
    }

    // Missing sections
    if (analysis?.sections?.missing?.length > 0) {
      insights.push({
        type: 'missing',
        title: 'Missing Critical Sections',
        items: analysis.sections.missing,
        icon: 'AlertTriangle',
        color: 'text-destructive'
      });
    }

    // ATS Optimization
    if (analysis?.atsOptimization?.length > 0) {
      insights.push({
        type: 'optimization',
        title: 'ATS Optimization Tips',
        items: analysis.atsOptimization,
        icon: 'Settings',
        color: 'text-primary'
      });
    }

    // Achievements analysis
    if (analysis?.achievements?.suggestions?.length > 0) {
      insights.push({
        type: 'achievements',
        title: 'Achievement Enhancement',
        items: analysis.achievements.suggestions,
        icon: 'Target',
        color: 'text-accent'
      });
    }

    // Keywords analysis
    if (analysis?.keywords?.suggestions?.length > 0) {
      insights.push({
        type: 'keywords',
        title: 'Keyword Optimization',
        items: analysis.keywords.suggestions,
        icon: 'Hash',
        color: 'text-success'
      });
    }

    console.log('✅ Generated insights:', insights.length, 'insights created');
    insights.forEach((insight, index) => {
      console.log(`  ${index + 1}. ${insight.title}: ${insight.items.length} items`);
    });
    return insights;
  };


  return (
    <>
      <Helmet>
        <title>ATS Score Checker - Professional Resume Analysis | Resume4me</title>
        <meta name="description" content="Get comprehensive ATS analysis of your resume with AI-powered insights and professional recommendations for career advancement." />
        <meta name="keywords" content="ATS score, resume analysis, ATS optimization, resume checker, professional resume" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20 md:pt-24">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center bg-gradient-to-br from-background via-primary/5 to-trust/5">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-trust/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute top-40 left-40 w-80 h-80 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Content - Hero Section */}
                <div className="lg:col-span-6 space-y-8">
                  <div className="space-y-6">
                    <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      <Icon name="Zap" className="w-4 h-4 mr-2" />
                      AI-Powered Analysis
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                      Get Your Resume
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        ATS-Ready
                      </span>
                    </h1>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Our advanced AI analyzes your resume against ATS systems used by top companies. 
                      Get instant feedback and actionable recommendations to land more interviews.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">95%</div>
                      <div className="text-sm text-muted-foreground">ATS Pass Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">2.5x</div>
                      <div className="text-sm text-muted-foreground">More Interviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-trust">50k+</div>
                      <div className="text-sm text-muted-foreground">Resumes Analyzed</div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Upload Section */}
                <div className="lg:col-span-6">
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                        isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                          <Icon name="Upload" className="w-8 h-8 text-primary" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-2">
                            Drop your resume here
                          </h3>
                          <p className="text-muted-foreground mb-4">or click to browse files</p>
                          <div className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                            <Icon name="FolderOpen" className="w-5 h-5 mr-2" />
                            Browse Files
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                          <span>PDF</span>
                          <span>DOCX</span>
                          <span>TXT</span>
                          <span>HTML</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">Maximum file size: 15MB</p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileInputChange}
                        accept=".pdf,.docx,.txt,.html"
                        className="hidden"
                      />
                    </div>

                    {/* Selected File */}
                    {selectedFile && (
                      <div className="flex items-center justify-between p-4 bg-accent/5 border-l-4 border-accent">
                        <div className="flex items-center">
                          <Icon name="CheckCircle" className="w-6 h-6 text-accent mr-3" />
                          <div>
                            <div className="font-bold text-foreground">{selectedFile.name}</div>
                            <div className="text-sm text-accent">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Icon name="X" className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Advanced Options */}
                    <div>
                      <button
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center text-primary hover:text-primary/80 font-semibold mb-4"
                      >
                        <Icon name="Settings" className="w-5 h-5 mr-2" />
                        Advanced Options
                        <Icon 
                          name="ChevronDown" 
                          className={`w-4 h-4 ml-2 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      {showAdvancedOptions && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Target Industry
                            </label>
                            <select
                              value={selectedIndustry}
                              onChange={(e) => setSelectedIndustry(e.target.value)}
                              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Select Industry</option>
                              <option value="technology">Technology</option>
                              <option value="finance">Finance</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="education">Education</option>
                              <option value="marketing">Marketing</option>
                              <option value="sales">Sales</option>
                              <option value="engineering">Engineering</option>
                              <option value="consulting">Consulting</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Experience Level
                            </label>
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Select Level</option>
                              <option value="entry">Entry Level</option>
                              <option value="mid">Mid Level</option>
                              <option value="senior">Senior Level</option>
                              <option value="executive">Executive</option>
                            </select>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Analyze Button */}
                    <button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || isAnalyzing}
                      className={`w-full py-4 px-6 font-bold text-lg rounded-xl transition-all duration-300 ${
                        !selectedFile || isAnalyzing
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Analyzing Your Resume...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Icon name="Search" className="w-5 h-5 mr-2" />
                          Analyze Resume
                        </div>
                      )}
                    </button>

                    {/* Error Display */}
                    {error && (
                      <div className="flex items-center p-4 bg-error/5 border-l-4 border-error">
                        <Icon name="AlertTriangle" className="w-5 h-5 text-error mr-2" />
                        <span className="text-error font-semibold">{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Enhanced Analysis Modal */}
          {showAnalysisModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-2xl shadow-brand-lg p-8 max-w-3xl w-full border border-border/50">
                <div className="text-center">
                  {/* Header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      🤖 Dual-Model ATS Analysis
                    </h2>
                    <p className="text-muted-foreground">
                      Claude Sonnet 4 + GPT-4o working together for comprehensive insights
                    </p>
                  </div>

                  {/* Progress Circle */}
                  <div className="w-24 h-24 mx-auto mb-6">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary transition-all duration-500"
                        style={{
                          transform: `rotate(${loadingProgress * 3.6}deg)`,
                        }}
                      ></div>
                      <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="text-xl font-bold text-primary">
                          {Math.round(loadingProgress)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Stage */}
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {loadingStage}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-3 mb-6">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>


                  {/* Time Information */}
                  <div className="flex justify-center items-center gap-6 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="clock" className="w-4 h-4" />
                      <span>Elapsed: {elapsedTime}s</span>
                    </div>
                    {estimatedTime > 0 && (
                      <div className="flex items-center gap-2">
                        <Icon name="timer" className="w-4 h-4" />
                        <span>Est. {estimatedTime}s</span>
                      </div>
                    )}
                  </div>

                  {/* Loading Tip */}
                  <div className="bg-muted/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {loadingTips[loadingTip]}
                    </p>
                  </div>

                  {/* Step Indicators */}
                  <div className="flex justify-center gap-2 mb-4">
                    {analysisSteps.map((step, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index < currentStep 
                            ? 'bg-primary' 
                            : index === currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Step Labels */}
                  <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                    <span className={currentStep >= 0 ? 'text-primary' : ''}>Upload</span>
                    <span className={currentStep >= 1 ? 'text-primary' : ''}>Extract</span>
                    <span className={currentStep >= 2 ? 'text-primary' : ''}>ATS Check</span>
                    <span className={currentStep >= 3 ? 'text-primary' : ''}>AI Analysis</span>
                    <span className={currentStep >= 4 ? 'text-primary' : ''}>Finalize</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {activeTab === 'results' && atsScore !== null && atsScore !== undefined && (
            <section className="py-12 md:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Score Overview */}
                <div className="bg-background rounded-2xl shadow-brand-lg border border-border/50 p-6 md:p-8 mb-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-montserrat">
                      ATS Analysis Results
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-lato">
                      Comprehensive analysis of your resume's ATS compatibility and optimization opportunities
                    </p>
                  </div>
                  
                  {/* Score Display */}
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-8">
                    <div className={`w-40 h-40 rounded-full border-8 ${getScoreBgColor(atsScore)} flex items-center justify-center shadow-lg`}>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
                          {atsScore}
                        </div>
                        <div className="text-muted-foreground text-lg">/100</div>
                      </div>
                    </div>
                    
                    <div className="text-center lg:text-left max-w-md">
                      <h3 className={`text-3xl font-bold ${getScoreColor(atsScore)} mb-3 font-space-grotesk`}>
                        {getScoreLabel(atsScore)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-inter">
                        {getScoreDescription(atsScore)}
                      </p>
                    </div>
                  </div>


                  {/* Industry Benchmarking */}
                  {analysisResults?.analysis?.industryBenchmark && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 text-lg">📊</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Industry Benchmarking</h3>
                          <p className="text-sm text-muted-foreground">
                            {analysisResults.analysis.industryBenchmark.benchmark.industry} • {analysisResults.analysis.industryBenchmark.benchmark.role} Level
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{analysisResults.analysis.industryBenchmark.comparison.percentile}th</div>
                          <div className="text-sm text-muted-foreground">Percentile</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{analysisResults.analysis.industryBenchmark.comparison.industryAverage}</div>
                          <div className="text-sm text-muted-foreground">Industry Average</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${analysisResults.analysis.industryBenchmark.comparison.scoreDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysisResults.analysis.industryBenchmark.comparison.scoreDifference >= 0 ? '+' : ''}{analysisResults.analysis.industryBenchmark.comparison.scoreDifference}
                          </div>
                          <div className="text-sm text-muted-foreground">vs Average</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Performance Level</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            analysisResults.analysis.industryBenchmark.comparison.performance === 'Exceptional' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            analysisResults.analysis.industryBenchmark.comparison.performance === 'Above Average' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            analysisResults.analysis.industryBenchmark.comparison.performance === 'Average' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {analysisResults.analysis.industryBenchmark.comparison.performance}
                          </span>
                        </div>
                      </div>

                      {analysisResults.analysis.industryBenchmark.performanceInsights && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Key Insights:</h4>
                          {analysisResults.analysis.industryBenchmark.performanceInsights.map((insight, index) => (
                            <p key={index} className="text-sm text-muted-foreground">• {insight}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Analysis Info */}
                  {(analysisResults?.overallGrade || analysisResults?.industry || analysisResults?.targetRole) && (
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      {analysisResults?.overallGrade && (
                        <div className="bg-muted/10 rounded-xl p-4 text-center border border-border/30">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {analysisResults.overallGrade}
                          </div>
                          <div className="text-sm text-muted-foreground">Overall Grade</div>
                        </div>
                      )}
                      {analysisResults?.industry && (
                        <div className="bg-muted/10 rounded-xl p-4 text-center border border-border/30">
                          <div className="text-lg font-semibold text-foreground mb-1">
                            {analysisResults.industry}
                          </div>
                          <div className="text-sm text-muted-foreground">Detected Industry</div>
                        </div>
                      )}
                      {analysisResults?.targetRole && (
                        <div className="bg-muted/10 rounded-xl p-4 text-center border border-border/30">
                          <div className="text-lg font-semibold text-foreground mb-1">
                            {analysisResults.targetRole}
                          </div>
                          <div className="text-sm text-muted-foreground">Target Role Level</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Score Breakdown */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-muted/20 rounded-xl p-6 border border-border/30">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                          <Icon name="Target" className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground">ATS Compatibility</h4>
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">{atsScore}%</div>
                      <p className="text-muted-foreground text-sm">Optimized for applicant tracking systems</p>
                    </div>
                    
                    <div className="bg-muted/20 rounded-xl p-6 border border-border/30">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mr-3">
                          <Icon name="FileCheck" className="w-5 h-5 text-success" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground">Content Quality</h4>
                      </div>
                      <div className="text-3xl font-bold text-success mb-2">
                        {analysisResults?.analysis?.contentQuality || 
                         analysisResults?.analysis?.detailedMetrics?.formatConsistency || 
                         (analysisResults?.atsScore > 80 ? 90 : analysisResults?.atsScore > 60 ? 70 : 40)}%
                      </div>
                      <p className="text-muted-foreground text-sm">Professional content and structure</p>
                    </div>
                    
                    <div className="bg-muted/20 rounded-xl p-6 border border-border/30">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                          <Icon name="Search" className="w-5 h-5 text-accent" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground">Keyword Optimization</h4>
                      </div>
                      <div className="text-3xl font-bold text-accent mb-2">
                        {analysisResults?.analysis?.detailedMetrics?.keywordDensity || 
                         (analysisResults?.analysis?.keywords?.density === 'high' ? 85 : 
                          analysisResults?.analysis?.keywords?.density === 'medium' ? 65 : 
                          analysisResults?.analysis?.keywords?.density === 'low' ? 35 : 0)}%
                      </div>
                      <p className="text-muted-foreground text-sm">Industry-relevant keywords present</p>
                    </div>
                  </div>
                </div>

                {/* Comprehensive Analysis Grid */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  {/* AI Insights */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                          <Icon name="Brain" className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground font-space-grotesk">AI-Powered Analysis</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {generateInsights(analysisResults?.analysis || {}).map((insight, index) => (
                          <div key={index} className="border-l-4 border-primary/20 pl-4">
                            <div className="flex items-center mb-2">
                              <Icon name={insight.icon} className={`w-4 h-4 ${insight.color} mr-2`} />
                              <h4 className="font-semibold text-foreground">{insight.title}</h4>
                            </div>
                            <div className="space-y-2">
                              {insight.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Analysis Breakdown */}
                    {analysisResults?.analysis && (
                      <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6">
                        <div className="flex items-center mb-6">
                          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mr-3">
                            <Icon name="FileText" className="w-5 h-5 text-success" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground font-space-grotesk">Detailed Analysis</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Analysis Summary */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center">
                              <Icon name="BarChart" className="w-4 h-4 mr-2 text-primary" />
                              Analysis Summary
                            </h4>
                            <div className="space-y-3">
                              <div className="bg-muted/10 rounded-lg p-3">
                                <div className="text-sm font-medium text-foreground mb-1">
                                  Industry Alignment: {analysisResults.analysis.industryAlignment || 0}%
                                </div>
                                <div className="w-full bg-muted/20 rounded-full h-2">
                                  <div className="bg-primary h-2 rounded-full" style={{
                                    width: `${analysisResults.analysis.industryAlignment || 0}%`
                                  }}></div>
                                </div>
                              </div>
                              <div className="bg-muted/10 rounded-lg p-3">
                                <div className="text-sm font-medium text-foreground mb-1">
                                  Content Quality: {analysisResults.analysis.contentQuality || 0}%
                                </div>
                                <div className="w-full bg-muted/20 rounded-full h-2">
                                  <div className="bg-success h-2 rounded-full" style={{
                                    width: `${analysisResults.analysis.contentQuality || 0}%`
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Legacy Sections Analysis */}
                          {analysisResults.analysis.sections && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-foreground flex items-center">
                                <Icon name="Layout" className="w-4 h-4 mr-2 text-primary" />
                                Resume Sections
                              </h4>
                              <div className="space-y-3">
                                {analysisResults.analysis.sections.present?.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium text-success mb-1">✓ Present Sections</div>
                                    <div className="flex flex-wrap gap-1">
                                      {analysisResults.analysis.sections.present.map((section, index) => (
                                        <span key={index} className="px-2 py-1 bg-success/10 text-success text-xs rounded-md">
                                          {section}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {analysisResults.analysis.sections.missing?.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium text-destructive mb-1">✗ Missing Sections</div>
                                    <div className="flex flex-wrap gap-1">
                                      {analysisResults.analysis.sections.missing.map((section, index) => (
                                        <span key={index} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-md">
                                          {section}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Achievements Analysis */}
                          {analysisResults.analysis.achievements && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-foreground flex items-center">
                                <Icon name="Target" className="w-4 h-4 mr-2 text-accent" />
                                Achievements Analysis
                              </h4>
                              <div className="space-y-3">
                                <div className="bg-muted/10 rounded-lg p-3">
                                  <div className="text-sm font-medium text-foreground mb-1">
                                    Quantified Achievements Found: {analysisResults.analysis.achievements.count || 0}
                                  </div>
                                  {analysisResults.analysis.achievements.examples?.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      Examples: {analysisResults.analysis.achievements.examples.slice(0, 2).join(', ')}
                                      {analysisResults.analysis.achievements.examples.length > 2 && '...'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Keywords Analysis */}
                          {analysisResults.analysis.keywords && (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-foreground flex items-center">
                                <Icon name="Hash" className="w-4 h-4 mr-2 text-success" />
                                Keywords Analysis
                              </h4>
                              <div className="space-y-3">
                                <div className="bg-muted/10 rounded-lg p-3">
                                  <div className="text-sm font-medium text-foreground mb-2">
                                    Keyword Density: <span className="capitalize">{analysisResults.analysis.keywords.density || 'medium'}</span>
                                  </div>
                                  {analysisResults.analysis.keywords.technical?.length > 0 && (
                                    <div className="mb-2">
                                      <div className="text-xs font-medium text-primary mb-1">Technical Skills:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {analysisResults.analysis.keywords.technical.slice(0, 5).map((skill, index) => (
                                          <span key={index} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                            {skill}
                                          </span>
                                        ))}
                                        {analysisResults.analysis.keywords.technical.length > 5 && (
                                          <span className="text-xs text-muted-foreground">+{analysisResults.analysis.keywords.technical.length - 5} more</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Detailed Metrics */}
                    <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                          <Icon name="BarChart" className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground font-space-grotesk">Detailed Metrics</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-muted/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Section Completeness</span>
                            <span className="text-sm font-bold text-success">
                              {analysisResults?.analysis?.detailedMetrics?.sectionCompleteness || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div className="bg-success h-2 rounded-full" style={{
                              width: `${analysisResults?.analysis?.detailedMetrics?.sectionCompleteness || 0}%`
                            }}></div>
                          </div>
                        </div>
                        
                        <div className="bg-muted/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Keyword Density</span>
                            <span className="text-sm font-bold text-warning">
                              {analysisResults?.analysis?.detailedMetrics?.keywordDensity || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div className="bg-warning h-2 rounded-full" style={{
                              width: `${analysisResults?.analysis?.detailedMetrics?.keywordDensity || 0}%`
                            }}></div>
                          </div>
                        </div>
                        
                        <div className="bg-muted/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Format Consistency</span>
                            <span className="text-sm font-bold text-primary">
                              {analysisResults?.analysis?.detailedMetrics?.formatConsistency || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{
                              width: `${analysisResults?.analysis?.detailedMetrics?.formatConsistency || 0}%`
                            }}></div>
                          </div>
                        </div>
                        
                        <div className="bg-muted/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Action Verbs</span>
                            <span className="text-sm font-bold text-accent">
                              {analysisResults?.analysis?.detailedMetrics?.actionVerbs || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div className="bg-accent h-2 rounded-full" style={{
                              width: `${analysisResults?.analysis?.detailedMetrics?.actionVerbs || 0}%`
                            }}></div>
                          </div>
                        </div>
                        
                        <div className="bg-muted/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Quantified Achievements</span>
                            <span className="text-sm font-bold text-success">
                              {analysisResults?.analysis?.detailedMetrics?.quantifiedAchievements || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div className="bg-success h-2 rounded-full" style={{
                              width: `${analysisResults?.analysis?.detailedMetrics?.quantifiedAchievements || 0}%`
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resume Preview & Quick Stats */}
                  <div className="space-y-6">
                    {/* Resume Preview */}
                    <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-2">
                            <Icon name="FileText" className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">Resume Preview</h3>
                        </div>
                        <button
                          onClick={() => setIsResumePreviewExpanded(!isResumePreviewExpanded)}
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {isResumePreviewExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                      <div className={`bg-muted/10 rounded-xl p-4 overflow-y-auto transition-all duration-300 ${
                        isResumePreviewExpanded ? 'max-h-none' : 'max-h-[500px]'
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-foreground leading-relaxed text-sm font-sans">
                            {analysisResults?.extractedText || 'No resume text available'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mr-2">
                          <Icon name="TrendingUp" className="w-4 h-4 text-success" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Word Count</span>
                          <span className="text-sm font-semibold text-foreground">
                            {analysisResults?.analysis?.quickStats?.wordCount || 
                             (analysisResults?.extractedText ? analysisResults.extractedText.split(' ').length : 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Sections Found</span>
                          <span className="text-sm font-semibold text-foreground">
                            {analysisResults?.analysis?.quickStats?.sectionsFound || 
                             (analysisResults?.analysis?.sections?.present?.length || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Keywords Matched</span>
                          <span className="text-sm font-semibold text-foreground">
                            {analysisResults?.analysis?.quickStats?.keywordsMatched || 
                             ((analysisResults?.analysis?.keywords?.technical?.length || 0) + 
                              (analysisResults?.analysis?.keywords?.industry?.length || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Improvement Areas</span>
                          <span className="text-sm font-semibold text-warning">
                            {analysisResults?.analysis?.quickStats?.improvementAreas || 
                             (analysisResults?.analysis?.improvements?.length || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Recommendations */}
                <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl shadow-brand-lg border border-border/50 p-6 md:p-8 mb-8">
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="Lightbulb" className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-montserrat">
                      Professional Recommendations
                    </h3>
                    <p className="text-muted-foreground max-w-3xl mx-auto font-lato">
                      Based on our comprehensive analysis, here are the key areas to focus on for maximum career impact
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-background rounded-2xl p-6 shadow-brand border border-border/30 hover:border-primary/20 transition-all duration-300">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon name="Target" className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-3 font-space-grotesk">Optimize Keywords</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-inter">
                        Include industry-specific keywords and technical terms relevant to your target roles.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Add technical skills from job descriptions
                        </li>
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Include industry-specific terminology
                        </li>
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Use action verbs consistently
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-background rounded-2xl p-6 shadow-brand border border-border/30 hover:border-success/20 transition-all duration-300">
                      <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon name="BarChart" className="w-5 h-5 text-success" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-3 font-space-grotesk">Add Quantifiable Results</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-inter">
                        Include specific metrics, percentages, and achievements to demonstrate your impact.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Use numbers and percentages
                        </li>
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Show before/after improvements
                        </li>
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Include timeframes and scope
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-background rounded-2xl p-6 shadow-brand border border-border/30 hover:border-accent/20 transition-all duration-300">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon name="Layout" className="w-5 h-5 text-accent" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-3 font-space-grotesk">Improve Structure</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-inter">
                        Ensure clear section headers and consistent formatting for better ATS parsing.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Use standard section headers
                        </li>
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Maintain consistent formatting
                        </li>
                        <li className="flex items-center text-xs text-muted-foreground">
                          <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                          Avoid complex layouts
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Competitive Analysis */}
                {analysisResults?.analysis?.competitiveAnalysis && (
                  <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6 md:p-8 mb-8">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                        <Icon name="TrendingUp" className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-space-grotesk">Competitive Analysis</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {analysisResults.analysis.competitiveAnalysis.marketPosition || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Market Position</div>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-success mb-1">
                          {analysisResults.analysis.competitiveAnalysis.strengths?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Key Strengths</div>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-warning mb-1">
                          {analysisResults.analysis.competitiveAnalysis.weaknesses?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Improvement Areas</div>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent mb-1">
                          {analysisResults.analysis.competitiveAnalysis.differentiators?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Unique Differentiators</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Competitive Strengths</h4>
                        <ul className="space-y-2">
                          {analysisResults.analysis.competitiveAnalysis.strengths?.slice(0, 5).map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <Icon name="Check" className="w-4 h-4 text-success mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Areas for Improvement</h4>
                        <ul className="space-y-2">
                          {analysisResults.analysis.competitiveAnalysis.weaknesses?.slice(0, 5).map((weakness, index) => (
                            <li key={index} className="flex items-start">
                              <Icon name="AlertTriangle" className="w-4 h-4 text-warning mr-2 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Market Intelligence */}
                {analysisResults?.analysis?.marketIntelligence && (
                  <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6 md:p-8 mb-8">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                        <Icon name="BarChart" className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-space-grotesk">Market Intelligence</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-success mb-1">
                          {analysisResults.analysis.marketIntelligence.demandLevel || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Market Demand</div>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-warning mb-1">
                          {analysisResults.analysis.marketIntelligence.competitionLevel || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Competition Level</div>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {analysisResults.analysis.marketIntelligence.growthPotential || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Growth Potential</div>
                      </div>
                      <div className="bg-muted/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent mb-1">
                          {analysisResults.analysis.marketIntelligence.salaryRange || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Salary Range</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Career Recommendations */}
                {analysisResults?.analysis?.careerRecommendations && (
                  <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6 md:p-8 mb-8">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mr-3">
                        <Icon name="Target" className="w-5 h-5 text-success" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-space-grotesk">Career Recommendations</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-muted/10 rounded-xl p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Icon name="Zap" className="w-4 h-4 text-warning mr-2" />
                          Immediate Actions
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.analysis.careerRecommendations.immediateActions?.slice(0, 4).map((action, index) => (
                            <li key={index} className="flex items-start">
                              <Icon name="Check" className="w-3 h-3 text-success mr-2 mt-1" />
                              <span className="text-sm text-muted-foreground">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-muted/10 rounded-xl p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Icon name="TrendingUp" className="w-4 h-4 text-primary mr-2" />
                          Long-term Strategy
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.analysis.careerRecommendations.longTermStrategy?.slice(0, 4).map((strategy, index) => (
                            <li key={index} className="flex items-start">
                              <Icon name="ArrowRight" className="w-3 h-3 text-primary mr-2 mt-1" />
                              <span className="text-sm text-muted-foreground">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-muted/10 rounded-xl p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Icon name="Award" className="w-4 h-4 text-accent mr-2" />
                          Skill Development
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.analysis.careerRecommendations.skillGaps?.slice(0, 4).map((skill, index) => (
                            <li key={index} className="flex items-start">
                              <Icon name="Star" className="w-3 h-3 text-accent mr-2 mt-1" />
                              <span className="text-sm text-muted-foreground">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Industry Insights */}
                <div className="bg-background rounded-2xl shadow-brand border border-border/50 p-6 md:p-8 mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-trust/10 rounded-xl flex items-center justify-center mr-3">
                      <Icon name="TrendingUp" className="w-5 h-5 text-trust" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-space-grotesk">Industry Insights & Trends</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-muted/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {analysisResults?.analysis?.achievements?.count > 0 ? '94%' : '67%'}
                      </div>
                      <div className="text-xs text-muted-foreground">Resumes with quantifiable achievements get more interviews</div>
                    </div>
                    <div className="bg-muted/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-success mb-1">
                        {analysisResults?.atsScore > 80 ? '87%' : analysisResults?.atsScore > 60 ? '72%' : '58%'}
                      </div>
                      <div className="text-xs text-muted-foreground">ATS systems prefer simple, clean formatting</div>
                    </div>
                    <div className="bg-muted/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-accent mb-1">
                        {analysisResults?.analysis?.keywords?.density === 'high' ? '76%' : 
                         analysisResults?.analysis?.keywords?.density === 'medium' ? '64%' : '52%'}
                      </div>
                      <div className="text-xs text-muted-foreground">Recruiters spend 6 seconds on initial resume review</div>
                    </div>
                    <div className="bg-muted/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-warning mb-1">
                        {(analysisResults?.analysis?.keywords?.technical?.length || 0) + (analysisResults?.analysis?.keywords?.industry?.length || 0) > 5 ? '82%' : '68%'}
                      </div>
                      <div className="text-xs text-muted-foreground">Keywords matching job description increase callbacks</div>
                    </div>
                  </div>
                </div>

                {/* Premium Insights Section */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl shadow-brand-lg border border-primary/20 p-6 md:p-8 mb-8">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="Crown" className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-montserrat">
                      Premium Insights
                    </h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-lato">
                      Unlock advanced analytics, competitive analysis, and personalized career recommendations
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-background/80 rounded-xl p-5 border border-border/30">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                        <Icon name="TrendingUp" className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Competitive Analysis</h4>
                      <p className="text-xs text-muted-foreground">Compare your resume against industry standards and top performers</p>
                    </div>
                    
                    <div className="bg-background/80 rounded-xl p-5 border border-border/30">
                      <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mb-3">
                        <Icon name="Target" className="w-4 h-4 text-success" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Job-Specific Optimization</h4>
                      <p className="text-xs text-muted-foreground">Tailor your resume for specific job postings and companies</p>
                    </div>
                    
                    <div className="bg-background/80 rounded-xl p-5 border border-border/30">
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                        <Icon name="BarChart" className="w-4 h-4 text-accent" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Salary Optimization</h4>
                      <p className="text-xs text-muted-foreground">Optimize for higher salary negotiations and market positioning</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={() => setShowPremiumInsights(!showPremiumInsights)}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <Icon name="Crown" className="w-4 h-4 mr-2" />
                      {showPremiumInsights ? 'Hide Premium Insights' : 'Unlock Premium Insights'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      * Premium features will require credits for logged-in users
                    </p>
                  </div>

                  {/* Expanded Premium Insights */}
                  {showPremiumInsights && (
                    <div className="mt-8 space-y-6">
                      {/* Competitive Analysis */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="TrendingUp" className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Competitive Analysis</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">vs. Industry Average</span>
                              <span className="text-sm font-semibold text-success">
                                {analysisResults?.analysis?.competitiveAnalysis?.industryAverage ? 
                                  `+${analysisResults.analysis.competitiveAnalysis.industryAverage}%` : 
                                  analysisResults?.atsScore > 80 ? '+15%' : analysisResults?.atsScore > 60 ? '+5%' : '-10%'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">vs. Top 10%</span>
                              <span className="text-sm font-semibold text-warning">
                                {analysisResults?.analysis?.competitiveAnalysis?.topPerformers ? 
                                  `${analysisResults.analysis.competitiveAnalysis.topPerformers}%` : 
                                  analysisResults?.atsScore > 85 ? '-5%' : analysisResults?.atsScore > 70 ? '-15%' : '-25%'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Market Position</span>
                              <span className="text-sm font-semibold text-primary">
                                {analysisResults?.analysis?.competitiveAnalysis?.marketPosition || 
                                 (analysisResults?.atsScore > 85 ? 'Top 10%' : 
                                  analysisResults?.atsScore > 70 ? 'Top 25%' : 
                                  analysisResults?.atsScore > 50 ? 'Average' : 'Below Average')}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h5 className="font-medium text-foreground mb-2">Key Differentiators</h5>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {(analysisResults?.analysis?.competitiveAnalysis?.differentiators || [
                                'Basic technical skills',
                                'Some relevant experience',
                                'Professional formatting',
                                'Standard industry keywords'
                              ]).map((item, index) => (
                                <li key={index}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Job-Specific Optimization */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="Target" className="w-4 h-4 text-success" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Job-Specific Optimization</h4>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          {(analysisResults?.analysis?.jobSpecificOptimization || [
                            {
                              role: analysisResults?.targetRole ? `${analysisResults.targetRole} ${analysisResults.industry || 'Professional'}` : 'General Professional',
                              matchScore: analysisResults?.atsScore || 0,
                              missing: analysisResults?.analysis?.sections?.missing || ["Specific skills", "Industry keywords"],
                              strengths: analysisResults?.analysis?.sections?.strengths || ["Basic experience", "Professional format"]
                            }
                          ]).map((job, index) => (
                            <div key={index} className="bg-muted/20 rounded-xl p-4">
                              <h5 className="font-medium text-foreground mb-2">{job.role}</h5>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>Match Score: <span className={`font-semibold ${
                                  job.matchScore >= 85 ? 'text-success' : 
                                  job.matchScore >= 75 ? 'text-primary' : 'text-warning'
                                }`}>{job.matchScore}%</span></div>
                                <div>Missing: {job.missing.join(', ')}</div>
                                <div>Strength: {job.strengths.join(', ')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Salary Optimization */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="BarChart" className="w-4 h-4 text-accent" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Salary Optimization</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-muted/20 rounded-xl p-4">
                              <h5 className="font-medium text-foreground mb-2">Current Market Value</h5>
                              <div className="text-2xl font-bold text-primary mb-1">
                                {analysisResults?.analysis?.salaryOptimization?.currentMarketValue || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">Based on experience and skills</div>
                            </div>
                            <div className="bg-muted/20 rounded-xl p-4">
                              <h5 className="font-medium text-foreground mb-2">Optimization Potential</h5>
                              <div className="text-2xl font-bold text-success mb-1">
                                {analysisResults?.analysis?.salaryOptimization?.optimizationPotential || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">With strategic improvements</div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h5 className="font-medium text-foreground">Salary Boosters</h5>
                            <div className="space-y-2">
                              {(analysisResults?.analysis?.salaryOptimization?.salaryBoosters || [
                                'Add specific achievements',
                                'Include relevant skills',
                                'Quantify results',
                                'Add certifications'
                              ]).map((booster, index) => (
                                <div key={index} className="flex items-center text-xs">
                                  <Icon name="Check" className="w-3 h-3 text-success mr-2" />
                                  <span className="text-muted-foreground">{booster}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Analytics */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-trust/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="Brain" className="w-4 h-4 text-trust" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Advanced Analytics</h4>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-muted/20 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-primary mb-1">
                              {analysisResults?.analysis?.advancedAnalytics?.atsCompatibility || analysisResults?.atsScore || 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">ATS Compatibility</div>
                          </div>
                          <div className="bg-muted/20 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-success mb-1">
                              {analysisResults?.analysis?.advancedAnalytics?.recruiterAppeal || Math.round((analysisResults?.atsScore || 0) * 0.9)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Recruiter Appeal</div>
                          </div>
                          <div className="bg-muted/20 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-accent mb-1">
                              {analysisResults?.analysis?.advancedAnalytics?.keywordDensity || 
                               (analysisResults?.analysis?.keywords?.density === 'high' ? 85 : 
                                analysisResults?.analysis?.keywords?.density === 'medium' ? 65 : 
                                analysisResults?.analysis?.keywords?.density === 'low' ? 35 : 0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Keyword Density</div>
                          </div>
                          <div className="bg-muted/20 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-warning mb-1">
                              {analysisResults?.analysis?.advancedAnalytics?.impactScore || Math.round((analysisResults?.atsScore || 0) * 0.85)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Impact Score</div>
                          </div>
                        </div>
                      </div>

                      {/* Career Growth Insights */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="TrendingUp" className="w-4 h-4 text-success" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Career Growth Insights</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="font-medium text-foreground">Next Level Roles</h5>
                            {(analysisResults?.analysis?.careerGrowthInsights?.nextLevelRoles || [
                              {
                                title: analysisResults?.targetRole === 'Entry' ? 'Mid-Level Professional' : 
                                       analysisResults?.targetRole === 'Mid' ? 'Senior Professional' : 'Executive Role',
                                timeframe: analysisResults?.targetRole === 'Entry' ? '12-18 months' : 
                                          analysisResults?.targetRole === 'Mid' ? '18-24 months' : '24-36 months',
                                requirements: analysisResults?.analysis?.improvements?.slice(0, 3) || ["Advanced skills", "Leadership experience", "Industry certifications"],
                                salaryIncrease: analysisResults?.atsScore > 80 ? '+$15,000' : 
                                              analysisResults?.atsScore > 60 ? '+$10,000' : '+$5,000'
                              }
                            ]).map((role, index) => (
                              <div key={index} className="bg-muted/20 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h6 className="font-semibold text-foreground">{role.title}</h6>
                                  <span className="text-sm font-bold text-success">{role.salaryIncrease}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">Timeline: {role.timeframe}</p>
                                <div className="space-y-1">
                                  {role.requirements.slice(0, 2).map((req, reqIndex) => (
                                    <div key={reqIndex} className="text-xs text-muted-foreground">• {req}</div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-4">
                            <h5 className="font-medium text-foreground">Skill Gaps & Learning Paths</h5>
                            {(analysisResults?.analysis?.careerGrowthInsights?.skillGaps || [
                              {
                                skill: analysisResults?.industry === 'Technology' ? "Cloud Architecture" : 
                                       analysisResults?.industry === 'Finance' ? "Financial Analysis" : "Industry Expertise",
                                importance: analysisResults?.atsScore > 80 ? "High" : 
                                           analysisResults?.atsScore > 60 ? "Medium" : "Critical",
                                learningPath: analysisResults?.analysis?.improvements?.slice(0, 2).join(', ') || "Industry-specific certifications, hands-on projects",
                                marketDemand: analysisResults?.atsScore > 80 ? "85% of senior roles require this" : 
                                             analysisResults?.atsScore > 60 ? "70% of roles require this" : "90% of roles require this"
                              }
                            ]).map((gap, index) => (
                              <div key={index} className="bg-muted/20 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h6 className="font-semibold text-foreground">{gap.skill}</h6>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    gap.importance === 'Critical' ? 'bg-red-100 text-red-800' :
                                    gap.importance === 'High' ? 'bg-orange-100 text-orange-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {gap.importance}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{gap.learningPath}</p>
                                <p className="text-xs text-primary font-medium">{gap.marketDemand}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recruiter Insights */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="Users" className="w-4 h-4 text-accent" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Recruiter Insights</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="bg-muted/20 rounded-xl p-4">
                              <h5 className="font-medium text-foreground mb-2">First Impression</h5>
                              <p className="text-sm text-muted-foreground">
                                {analysisResults?.analysis?.recruiterInsights?.firstImpression || "N/A"}
                              </p>
                            </div>
                            <div className="bg-muted/20 rounded-xl p-4">
                              <h5 className="font-medium text-foreground mb-2">Interview Likelihood</h5>
                              <div className="flex items-center">
                                <span className={`text-lg font-bold ${
                                  (analysisResults?.analysis?.recruiterInsights?.interviewLikelihood || 
                                   (analysisResults?.atsScore > 80 ? "High" : analysisResults?.atsScore > 60 ? "Medium" : "Low")) === "High" ? "text-success" :
                                  (analysisResults?.analysis?.recruiterInsights?.interviewLikelihood || 
                                   (analysisResults?.atsScore > 80 ? "High" : analysisResults?.atsScore > 60 ? "Medium" : "Low")) === "Medium-High" ? "text-primary" :
                                  "text-warning"
                                }`}>
                                  {analysisResults?.analysis?.recruiterInsights?.interviewLikelihood || 
                                   (analysisResults?.atsScore > 80 ? "High" : analysisResults?.atsScore > 60 ? "Medium" : "Low")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-muted/20 rounded-xl p-4">
                              <h5 className="font-medium text-foreground mb-2">Standout Factors</h5>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {(analysisResults?.analysis?.recruiterInsights?.standoutFactors || [
                                  "Clean formatting", "Relevant technical skills"
                                ]).map((factor, index) => (
                                  <li key={index}>• {factor}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-muted/20 rounded-xl p-4">
                              <h5 className="font-medium text-foreground mb-2">Red Flags</h5>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {(analysisResults?.analysis?.recruiterInsights?.redFlags || [
                                  "No quantifiable achievements", "Generic job descriptions"
                                ]).map((flag, index) => (
                                  <li key={index}>• {flag}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Market Intelligence */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="BarChart" className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Market Intelligence</h4>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-muted/20 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-success mb-1">
                              {analysisResults?.analysis?.marketIntelligence?.demandLevel || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">Demand Level</div>
                          </div>
                          <div className="bg-muted/20 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-warning mb-1">
                              {analysisResults?.analysis?.marketIntelligence?.competitionLevel || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">Competition</div>
                          </div>
                          <div className="bg-muted/20 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-primary mb-1">
                              {analysisResults?.analysis?.successMetrics?.interviewConversionRate || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">Interview Rate</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h5 className="font-medium text-foreground mb-2">Salary Benchmarks</h5>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-muted/20 rounded-xl p-3">
                              <div className="text-sm font-semibold text-foreground">Entry Level</div>
                              <div className="text-xs text-muted-foreground">
                                {analysisResults?.analysis?.marketIntelligence?.salaryBenchmarks?.entryLevel || "N/A"}
                              </div>
                            </div>
                            <div className="bg-muted/20 rounded-xl p-3">
                              <div className="text-sm font-semibold text-foreground">Mid Level</div>
                              <div className="text-xs text-muted-foreground">
                                {analysisResults?.analysis?.marketIntelligence?.salaryBenchmarks?.midLevel || "N/A"}
                              </div>
                            </div>
                            <div className="bg-muted/20 rounded-xl p-3">
                              <div className="text-sm font-semibold text-foreground">Senior Level</div>
                              <div className="text-xs text-muted-foreground">
                                {analysisResults?.analysis?.marketIntelligence?.salaryBenchmarks?.seniorLevel || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Personalized Recommendations */}
                      <div className="bg-background/60 rounded-2xl p-6 border border-border/30">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mr-3">
                            <Icon name="Target" className="w-4 h-4 text-success" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground">Personalized Recommendations</h4>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-muted/20 rounded-xl p-4">
                            <h5 className="font-medium text-foreground mb-3">Immediate Actions</h5>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {(analysisResults?.analysis?.personalizedRecommendations?.immediateActions || [
                                "Add 3-5 quantifiable achievements with specific metrics",
                                "Include a professional summary highlighting unique value proposition",
                                "Optimize for ATS with industry-specific keywords"
                              ]).map((action, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-success mr-2">✓</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-muted/20 rounded-xl p-4">
                            <h5 className="font-medium text-foreground mb-3">Long-term Strategy</h5>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {(analysisResults?.analysis?.personalizedRecommendations?.longTermStrategy || [
                                "Pursue relevant certifications to fill skill gaps",
                                "Build portfolio projects demonstrating advanced skills",
                                "Network with industry professionals for mentorship opportunities"
                              ]).map((strategy, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-primary mr-2">→</span>
                                  {strategy}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-muted/20 rounded-xl p-4">
                            <h5 className="font-medium text-foreground mb-3">Template Tips</h5>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {(analysisResults?.analysis?.personalizedRecommendations?.customizedTemplates || [
                                "Use action-oriented bullet points starting with strong verbs",
                                "Include a skills section with proficiency levels",
                                "Add a projects section showcasing technical capabilities"
                              ]).map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-accent mr-2">★</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="text-center space-x-3">
                  <Button
                    onClick={() => setActiveTab('upload')}
                    className="bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Analyze Another Resume
                  </Button>

                  <Button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isExporting ? 'Exporting...' : '📄 Export PDF'}
                  </Button>

                  <Button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Print Report
                  </Button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default ATSScorePage;