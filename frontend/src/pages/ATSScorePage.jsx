import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import atsService from '../services/atsService';
import { useAuth } from '../hooks/useAuth';

const ATSScorePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 10MB.');
      return;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setAtsScore(null);
      setAnalysisResults(null);
      setError(null); // Clear any previous errors
    } else {
      alert('Please select a valid PDF or DOC/DOCX file.');
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

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setActiveTab('results');
    
    try {
      const response = await atsService.analyzeResume(selectedFile);
      
      if (response.success) {
        const { score, analysis } = response.data;
        setAtsScore(score);
        setAnalysisResults(analysis);
        
        // Save analysis if user is authenticated
        if (isAuthenticated) {
          try {
            await atsService.saveAnalysis({
              score,
              analysis
            });
          } catch (saveError) {
            console.error('Failed to save analysis:', saveError);
            // Don't show error to user for save failure
          }
        }
      } else {
        setError(response.message || 'Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to analyze resume. Please try again.';
      
      if (error.message.includes('File size too large')) {
        errorMessage = 'File size too large. Please upload a file smaller than 10MB.';
      } else if (error.message.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Please upload a PDF, DOC, or DOCX file.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Needs Improvement';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-green-400 to-green-600';
    if (score >= 80) return 'from-blue-400 to-blue-600';
    if (score >= 70) return 'from-yellow-400 to-yellow-600';
    if (score >= 60) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-500';
  };

  const generatePDFReport = () => {
    // Create a professional HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ATS Score Analysis Report</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #e54616; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #e54616; margin-bottom: 10px; }
          .subtitle { color: #666; font-size: 16px; }
          .score-section { text-align: center; margin: 30px 0; }
          .score-circle { 
            display: inline-block; 
            width: 120px; 
            height: 120px; 
            border-radius: 50%; 
            border: 8px solid #e54616; 
            background: linear-gradient(135deg, #fff2ed, #fde3d5);
            text-align: center;
            line-height: 120px;
            font-size: 36px;
            font-weight: bold;
            color: #e54616;
            margin: 20px;
          }
          .score-label { font-size: 18px; color: #666; margin-top: 10px; }
          .section { margin: 30px 0; }
          .section-title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #e54616; 
            border-left: 4px solid #e54616; 
            padding-left: 15px; 
            margin-bottom: 15px; 
          }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .metric-card { 
            background: #fff2ed; 
            border: 1px solid #f8a27a; 
            border-radius: 10px; 
            padding: 20px; 
            text-align: center; 
          }
          .metric-score { font-size: 24px; font-weight: bold; color: #e54616; margin-bottom: 5px; }
          .metric-label { color: #666; font-size: 14px; }
          .list { list-style: none; padding: 0; }
          .list li { 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
            position: relative; 
            padding-left: 25px; 
          }
          .list li:before { 
            content: "✓"; 
            position: absolute; 
            left: 0; 
            color: #10b981; 
            font-weight: bold; 
          }
          .improvement-list li:before { content: "→"; color: #f59e0b; }
          .suggestion-list li:before { content: "💡"; }
          .keyword-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
          .keyword-tag { 
            background: #e54616; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
          }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #666; 
            font-size: 14px; 
            border-top: 1px solid #eee; 
            padding-top: 20px; 
          }
          .date { color: #999; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Resume4me</div>
          <div class="subtitle">Professional ATS Score Analysis Report</div>
        </div>

        <div class="score-section">
          <h1>Your ATS Compatibility Score</h1>
          <div class="score-circle">${atsScore}</div>
          <div class="score-label">${getScoreLabel(atsScore)}</div>
          <p style="color: #666; max-width: 600px; margin: 20px auto;">
            ${atsScore >= 90 
              ? "Outstanding! Your resume is perfectly optimized for ATS systems and should easily pass automated screenings."
              : atsScore >= 80
              ? "Great job! Your resume has strong ATS compatibility with minor areas for enhancement."
              : atsScore >= 70
              ? "Good foundation! Your resume needs some optimization to improve ATS compatibility."
              : "Your resume requires significant optimization to improve ATS compatibility and pass automated screenings."
            }
          </p>
        </div>

        ${analysisResults.detailedScores ? `
        <div class="section">
          <div class="section-title">Enhanced Score Breakdown</div>
          <div class="grid">
            <div class="metric-card">
              <div class="metric-score">${analysisResults.detailedScores.keywordScore}</div>
              <div class="metric-label">Keywords (25%)</div>
            </div>
            <div class="metric-card">
              <div class="metric-score">${analysisResults.detailedScores.formattingScore}</div>
              <div class="metric-label">Formatting (20%)</div>
            </div>
            <div class="metric-card">
              <div class="metric-score">${analysisResults.detailedScores.structureScore}</div>
              <div class="metric-label">Structure (20%)</div>
            </div>
            <div class="metric-card">
              <div class="metric-score">${analysisResults.detailedScores.contentScore}</div>
              <div class="metric-label">Content (20%)</div>
            </div>
            <div class="metric-card">
              <div class="metric-score">${analysisResults.detailedScores.readabilityScore || 'N/A'}</div>
              <div class="metric-label">Readability (15%)</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${analysisResults.analytics ? `
        <div class="section">
          <div class="section-title">Advanced Analytics</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div class="metric-card">
              <div class="metric-score">${analysisResults.analytics.successPrediction || 0}%</div>
              <div class="metric-label">Success Prediction</div>
            </div>
            <div class="metric-card">
              <div class="metric-score" style="text-transform: capitalize;">${analysisResults.analytics.industryBenchmark?.industry || 'General'}</div>
              <div class="metric-label">Detected Industry</div>
            </div>
            <div class="metric-card">
              <div class="metric-score">${analysisResults.analytics.keywordTrends?.trending?.length || 0}</div>
              <div class="metric-label">Trending Keywords</div>
            </div>
            <div class="metric-card">
              <div class="metric-score">${analysisResults.analytics.wordCount || 0}</div>
              <div class="metric-label">Word Count</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${analysisResults.analytics?.keywordTrends?.trending?.length > 0 ? `
        <div class="section">
          <div class="section-title">Trending Keywords Found</div>
          <div class="keyword-tags">
            ${analysisResults.analytics.keywordTrends.trending.map(keyword => `<span class="keyword-tag">🔥 ${keyword}</span>`).join('')}
          </div>
          <p style="margin-top: 10px; color: #666; font-size: 14px;">These keywords are trending in 2024 and boost your ATS compatibility!</p>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Strengths</div>
          <ul class="list">
            ${analysisResults.strengths && analysisResults.strengths.length > 0 
              ? analysisResults.strengths.map(strength => `<li>${strength}</li>`).join('')
              : '<li>No specific strengths identified</li>'
            }
          </ul>
        </div>

        <div class="section">
          <div class="section-title">Areas for Improvement</div>
          <ul class="list improvement-list">
            ${analysisResults.improvements && analysisResults.improvements.length > 0 
              ? analysisResults.improvements.map(improvement => `<li>${improvement}</li>`).join('')
              : '<li>No specific improvements needed</li>'
            }
          </ul>
        </div>

        ${analysisResults.keywordMatches && Object.keys(analysisResults.keywordMatches).length > 0 ? `
        <div class="section">
          <div class="section-title">Keyword Analysis</div>
          ${Object.entries(analysisResults.keywordMatches).map(([category, keywords]) => `
            <div style="margin: 20px 0;">
              <h3 style="color: #e54616; margin-bottom: 10px;">${category.charAt(0).toUpperCase() + category.slice(1)} Keywords (${keywords.length})</h3>
              <div class="keyword-tags">
                ${keywords.slice(0, 8).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                ${keywords.length > 8 ? `<span class="keyword-tag">+${keywords.length - 8} more</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${analysisResults.suggestions && analysisResults.suggestions.length > 0 ? `
        <div class="section">
          <div class="section-title">Key Suggestions</div>
          <ul class="list suggestion-list">
            ${analysisResults.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
        ` : ''}



        <div class="footer">
          <p>Generated by Resume4me - Professional Resume Services</p>
          <p>For more information, visit: <a href="https://resume4me.com" style="color: #e54616;">resume4me.com</a></p>
          <div class="date">Report generated on: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
      </body>
      </html>
    `;

    // Create a blob with the HTML content
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open(url, '_blank');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    
    // Auto-trigger print dialog (user can save as PDF)
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>ATS Score Checker - Resume4me | Professional Resume Analysis</title>
        <meta name="description" content="Check your resume's ATS compatibility score. Upload your PDF or DOC resume and get instant analysis with improvement suggestions." />
        <meta name="keywords" content="ATS score checker, resume analysis, ATS compatibility, resume optimization, professional resume" />
        <meta property="og:title" content="ATS Score Checker - Resume4me" />
        <meta property="og:description" content="Check your resume's ATS compatibility score with our professional analysis tool." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/ats-score" />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-20 md:pt-24">
          {/* Clean Hero Section */}
          <section className="bg-white py-16 md:py-20">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="Target" size={32} className="text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  ATS Score Checker
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Optimize your resume for Applicant Tracking Systems. Get instant feedback on your resume's ATS compatibility and professional improvement suggestions.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                    <Icon name="CheckCircle" size={16} className="text-green-600" />
                    <span className="text-green-700 font-medium">PDF & DOC Support</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                    <Icon name="CheckCircle" size={16} className="text-blue-600" />
                    <span className="text-blue-700 font-medium">Instant Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
                    <Icon name="CheckCircle" size={16} className="text-purple-600" />
                    <span className="text-purple-700 font-medium">Professional Tips</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Upload Section */}
          <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                {/* File Upload Area */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 mb-8 shadow-sm">
                  <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Upload Your Resume
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      Upload your resume in PDF or DOC/DOCX format to get your ATS compatibility score
                    </p>

                     

                    {/* Drag & Drop Area */}
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 ${
                        isDragOver 
                          ? 'border-primary bg-orange-50 scale-105' 
                          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                          <Icon name="Upload" size={28} className="text-white" />
                        </div>
                        
                        {selectedFile ? (
                          <div className="text-center">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                              <div className="flex items-center justify-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Icon name="FileText" size={20} className="text-green-600" />
                                </div>
                                <span className="font-semibold text-gray-900 text-lg">{selectedFile.name}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                              <Button
                                onClick={() => {
                                  setSelectedFile(null);
                                  setAtsScore(null);
                                  setAnalysisResults(null);
                                }}
                                variant="outline"
                                size="lg"
                                iconName="X"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                Remove File
                              </Button>
                              <Button
                                onClick={handleAnalyze}
                                loading={isAnalyzing}
                                disabled={!selectedFile}
                                iconName="Play"
                                size="lg"
                                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
                              >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-center">
                              <p className="text-xl font-semibold text-gray-900 mb-3">
                                Drag & drop your resume here
                              </p>
                              <p className="text-gray-600 mb-6 text-lg">
                                or click to browse files
                              </p>
                              <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block">
                                Supports PDF, DOC, DOCX (Max 10MB)
                              </p>
                            </div>
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                              iconName="Upload"
                              size="lg"
                              className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-md"
                            >
                              Choose File
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Clean Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 animate-fadeIn shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Icon name="AlertCircle" size={24} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-1 text-lg">Analysis Error</h3>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clean Loading State */}
                {isAnalyzing && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-10 mb-8 animate-fadeIn shadow-sm">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Analyzing Your Resume</h3>
                      <p className="text-gray-600 mb-6 text-lg">Performing comprehensive ATS compatibility analysis...</p>
                      <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {atsScore !== null && analysisResults && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Your ATS Score
                      </h2>
                      
                      {/* Enhanced Score Display with Better Colors */}
                      <div className="flex flex-col items-center mb-10">
                        <div className="relative group mb-6">
                          {/* Soft Background Glow */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${getScoreGradient(atsScore)} opacity-20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                          
                          {/* Main Score Circle */}
                          <div className={`relative w-48 h-48 rounded-full border-8 bg-gradient-to-br ${getScoreGradient(atsScore)} flex items-center justify-center hover:scale-105 transition-all duration-500 shadow-2xl`}>
                            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-inner">
                              <div className="text-center">
                                <div className={`text-5xl font-bold mb-2 ${getScoreColor(atsScore)}`}>
                                  {atsScore}
                                </div>
                                <div className="text-sm text-gray-600 font-semibold">
                                  {getScoreLabel(atsScore)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Subtle Animated Ring */}
                          <div className={`absolute inset-2 rounded-full border-2 border-gradient-to-r ${getScoreGradient(atsScore)} opacity-30 animate-pulse`}></div>
                        </div>
                        
                        {/* Success Prediction Badge - Moved Outside */}
                        {analysisResults.analytics?.successPrediction && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-6 py-3 rounded-2xl shadow-sm">
                            <div className="flex items-center space-x-2">
                              <Icon name="TrendingUp" size={16} className="text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">
                                {analysisResults.analytics.successPrediction}% Interview Success Rate
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Score Description */}
                      <div className={`max-w-3xl mx-auto p-6 rounded-2xl border ${getScoreBgColor(atsScore)} mb-6`}>
                        <p className="text-gray-700 text-lg leading-relaxed text-center">
                          {atsScore >= 90 
                            ? "🎉 Excellent! Your resume is well-optimized for ATS systems and should perform very well in automated screenings."
                            : atsScore >= 80
                            ? "👍 Good score! Your resume has solid ATS compatibility with room for improvement."
                            : atsScore >= 70
                            ? "⚡ Fair score. Your resume needs some optimization to improve ATS compatibility."
                            : atsScore >= 60
                            ? "🔧 Your resume needs work but has potential. Follow our suggestions to improve ATS compatibility."
                            : "🚀 Don't worry! Every great resume starts somewhere. Our detailed analysis will help you optimize for ATS systems and significantly improve your chances."
                          }
                        </p>
                        {atsScore < 70 && (
                          <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                              💡 <strong>Good news:</strong> Most issues are easy to fix with our step-by-step guidance below.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Score Breakdown with Analytics */}
                    {analysisResults.detailedScores && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Advanced Score Breakdown</h3>
                        <div className="grid md:grid-cols-5 gap-4">
                          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Icon name="Search" size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              {analysisResults.detailedScores.keywordScore}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Keywords (30%)</div>
                            {analysisResults.analytics?.keywordDensity && (
                              <div className="text-xs text-purple-500 mt-2 bg-purple-50 px-2 py-1 rounded-full">
                                Density: {analysisResults.analytics.keywordDensity.technical}%
                              </div>
                            )}
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Icon name="Layout" size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {analysisResults.detailedScores.formattingScore}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Formatting (15%)</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Icon name="FileText" size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {analysisResults.detailedScores.structureScore}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Structure (20%)</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Icon name="Star" size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                              {analysisResults.detailedScores.contentScore}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Content (25%)</div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Icon name="BookOpen" size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-teal-600 mb-1">
                              {analysisResults.detailedScores.readabilityScore || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Readability (10%)</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Advanced Analytics Dashboard */}
                    {analysisResults.analytics && (
                      <div className="mb-10 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                          <Icon name="BarChart3" size={24} className="text-blue-600 mr-3" />
                          Advanced Analytics
                        </h3>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Industry Benchmark */}
                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-900">Industry Benchmark</h4>
                              <Icon name="Target" size={20} className="text-blue-600" />
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              Industry: <span className="font-semibold capitalize text-gray-900">
                                {analysisResults.analytics.industryBenchmark?.industry || 'General'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Your Score:</span>
                              <span className="font-bold text-primary text-lg">{atsScore}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Industry Avg:</span>
                              <span className="font-bold text-gray-700">
                                {analysisResults.analytics.industryBenchmark?.benchmark?.avgScore || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Success Prediction */}
                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-900">Success Prediction</h4>
                              <Icon name="TrendingUp" size={20} className="text-green-600" />
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600 mb-2">
                                {analysisResults.analytics.successPrediction || 0}%
                              </div>
                              <div className="text-sm text-gray-600">
                                Interview Callback Rate
                              </div>
                            </div>
                          </div>

                          {/* Keyword Trends */}
                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-900">Keyword Trends</h4>
                              <Icon name="Zap" size={20} className="text-yellow-600" />
                            </div>
                            {analysisResults.analytics.keywordTrends && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Trending:</span>
                                  <span className="font-bold text-yellow-600 text-lg">
                                    {analysisResults.analytics.keywordTrends.trending?.length || 0}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Emerging:</span>
                                  <span className="font-bold text-blue-600 text-lg">
                                    {analysisResults.analytics.keywordTrends.emerging?.length || 0}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                                  Trend Score: +{analysisResults.analytics.keywordTrends.trendScore || 0}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Details */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Strengths */}
                      <div className="bg-success/5 border border-success/20 rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Icon name="CheckCircle" size={20} className="text-success" />
                          <h3 className="text-lg font-semibold text-foreground">Strengths</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysisResults.strengths && analysisResults.strengths.length > 0 ? (
                            analysisResults.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{strength}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">No specific strengths identified</li>
                          )}
                        </ul>
                      </div>

                      {/* Areas for Improvement */}
                      <div className="bg-warning/5 border border-warning/20 rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Icon name="AlertTriangle" size={20} className="text-warning" />
                          <h3 className="text-lg font-semibold text-foreground">Areas for Improvement</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysisResults.improvements && analysisResults.improvements.length > 0 ? (
                            analysisResults.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Icon name="ChevronRight" size={16} className="text-warning mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{improvement}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">No specific improvements needed</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Interactive Keyword Analysis */}
                    {analysisResults.keywordMatches && Object.keys(analysisResults.keywordMatches).length > 0 && (
                      <div className="mt-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-2">
                            <Icon name="Search" size={20} className="text-accent" />
                            <h3 className="text-lg font-semibold text-foreground">Interactive Keyword Analysis</h3>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total: {Object.values(analysisResults.keywordMatches).flat().length} keywords
                          </div>
                        </div>
                        
                        {/* Keyword Heatmap */}
                        {analysisResults.interactiveData?.keywordHeatmap && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center">
                              <Icon name="Map" size={16} className="text-accent mr-2" />
                              Keyword Density Heatmap
                            </h4>
                            <div className="bg-background/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                              {Object.entries(analysisResults.interactiveData.keywordHeatmap).map(([index, data]) => (
                                <div 
                                  key={index} 
                                  className={`p-2 mb-2 rounded text-sm transition-all hover:scale-105 cursor-pointer ${
                                    data.intensity > 0.7 ? 'bg-red-100 border-l-4 border-red-500' :
                                    data.intensity > 0.4 ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                                    'bg-green-100 border-l-4 border-green-500'
                                  }`}
                                  title={`Keyword density: ${data.score} keywords found`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-foreground">{data.sentence.substring(0, 100)}...</span>
                                    <span className="text-xs bg-accent/20 px-2 py-1 rounded">
                                      {data.score} keywords
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Enhanced Keyword Categories */}
                        <div className="grid md:grid-cols-3 gap-4">
                          {Object.entries(analysisResults.keywordMatches).map(([category, keywords]) => (
                            <div key={category} className="bg-background/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground capitalize flex items-center">
                                  <Icon 
                                    name={category === 'technical' ? 'Code' : category === 'softSkills' ? 'Users' : 'Zap'} 
                                    size={16} 
                                    className="mr-2 text-accent" 
                                  />
                                  {category.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-full">
                                  {keywords.length}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mb-3">
                                {keywords.slice(0, 6).map((keyword, index) => (
                                  <span 
                                    key={index} 
                                    className="px-2 py-1 bg-accent/20 text-accent text-xs rounded hover:bg-accent/30 transition-colors cursor-pointer"
                                    title={`Click to see context for "${keyword}"`}
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {keywords.length > 6 && (
                                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                                    +{keywords.length - 6} more
                                  </span>
                                )}
                              </div>

                              {/* Keyword Density Bar */}
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-muted-foreground">Density</span>
                                  <span className="text-xs font-semibold">
                                    {analysisResults.analytics?.keywordDensity?.[category] || '0'}%
                                  </span>
                                </div>
                                <div className="w-full bg-border rounded-full h-2">
                                  <div 
                                    className="bg-accent h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${Math.min(100, (analysisResults.analytics?.keywordDensity?.[category] || 0) * 20)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Industry-Specific Trending Keywords */}
                        {analysisResults.analytics?.keywordTrends?.trending?.length > 0 && (
                          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <Icon name="TrendingUp" size={20} className="text-green-600 mr-2" />
                                <h4 className="font-semibold text-green-800">Trending Keywords Found!</h4>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                {analysisResults.analytics.keywordTrends.industry || 'General'} Industry
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {analysisResults.analytics.keywordTrends.trending.map((keyword, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 bg-green-200 text-green-800 text-sm rounded-full font-medium hover:bg-green-300 transition-colors"
                                >
                                  🔥 {keyword}
                                </span>
                              ))}
                            </div>
                            
                            {/* Emerging Keywords */}
                            {analysisResults.analytics.keywordTrends.emerging?.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-green-200">
                                <h5 className="text-sm font-semibold text-green-800 mb-2">
                                  🚀 Emerging Skills (+{analysisResults.analytics.keywordTrends.emerging.length} bonus):
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {analysisResults.analytics.keywordTrends.emerging.map((keyword, index) => (
                                    <span 
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                    >
                                      ⭐ {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-sm text-green-700 mt-4 bg-green-100 p-3 rounded-lg">
                              💡 <strong>Industry Insight:</strong> These {analysisResults.analytics.keywordTrends.industry || 'general'} keywords are currently in high demand and boost your ATS compatibility!
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section-by-Section Analysis */}
                    {analysisResults.interactiveData?.sectionBreakdown && (
                      <div className="mt-8 bg-gradient-to-br from-info/5 to-primary/5 border border-info/20 rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-6">
                          <Icon name="Layout" size={20} className="text-info" />
                          <h3 className="text-lg font-semibold text-foreground">Section-by-Section Analysis</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(analysisResults.interactiveData.sectionBreakdown).map(([section, data]) => (
                            <div key={section} className="bg-background/60 border border-border/50 rounded-lg p-4 hover:shadow-md transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground capitalize flex items-center">
                                  <Icon 
                                    name={
                                      section === 'contact' ? 'Mail' :
                                      section === 'summary' ? 'FileText' :
                                      section === 'experience' ? 'Briefcase' :
                                      section === 'education' ? 'GraduationCap' :
                                      section === 'skills' ? 'Code' :
                                      'Folder'
                                    } 
                                    size={16} 
                                    className="mr-2 text-info" 
                                  />
                                  {section}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    data.score >= 80 ? 'bg-success/20 text-success' :
                                    data.score >= 60 ? 'bg-warning/20 text-warning' :
                                    'bg-error/20 text-error'
                                  }`}>
                                    {data.score}%
                                  </span>
                                  <span className={`w-2 h-2 rounded-full ${
                                    data.confidence >= 0.8 ? 'bg-success' :
                                    data.confidence >= 0.6 ? 'bg-warning' :
                                    'bg-error'
                                  }`}></span>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="w-full bg-border rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-700 ${
                                      data.score >= 80 ? 'bg-success' :
                                      data.score >= 60 ? 'bg-warning' :
                                      'bg-error'
                                    }`}
                                    style={{ width: `${data.score}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                {data.suggestions?.slice(0, 2).map((suggestion, index) => (
                                  <div key={index} className="text-xs text-muted-foreground flex items-start">
                                    <Icon name="ArrowRight" size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Priority Improvements */}
                    {analysisResults.interactiveData?.improvementPriority && (
                      <div className="mt-8 bg-warning/5 border border-warning/20 rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-6">
                          <Icon name="AlertTriangle" size={20} className="text-warning" />
                          <h3 className="text-lg font-semibold text-foreground">Priority Improvements</h3>
                        </div>
                        
                        <div className="space-y-4">
                          {analysisResults.interactiveData.improvementPriority.map((improvement, index) => (
                            <div 
                              key={index} 
                              className={`p-4 rounded-lg border-l-4 ${
                                improvement.priority === 'high' ? 'bg-red-50 border-red-500' :
                                improvement.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                                'bg-blue-50 border-blue-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${
                                  improvement.priority === 'high' ? 'bg-red-200 text-red-800' :
                                  improvement.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-blue-200 text-blue-800'
                                }`}>
                                  {improvement.priority} Priority
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {improvement.category}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">{improvement.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Insights */}
                    {analysisResults.interactiveData?.clickableInsights && (
                      <div className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-6">
                          <Icon name="Zap" size={20} className="text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Interactive Insights</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          {analysisResults.interactiveData.clickableInsights.map((insight, index) => (
                            <div 
                              key={index}
                              className="bg-background/80 border border-border/50 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
                              onClick={() => {
                                // Handle click action based on insight.action
                                console.log(`Clicked insight: ${insight.action}`);
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Icon 
                                  name={
                                    insight.type === 'benchmark' ? 'Target' :
                                    insight.type === 'prediction' ? 'TrendingUp' :
                                    'Zap'
                                  } 
                                  size={16} 
                                  className="text-primary group-hover:scale-110 transition-transform" 
                                />
                                <Icon name="ExternalLink" size={12} className="text-muted-foreground" />
                              </div>
                              <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {insight.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {insight.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}



                                         {/* Action Buttons */}
                     <div className="flex flex-wrap justify-center gap-4 mt-8">
                       <Button
                         variant="default"
                         iconName="FileText"
                         size="lg"
                         onClick={() => window.location.href = '/templates'}
                       >
                         Build New Resume
                       </Button>
                                               <Button
                          variant="outline"
                          iconName="Download"
                          size="lg"
                          onClick={() => {
                            // Generate a professional PDF report
                            generatePDFReport();
                          }}
                        >
                          Download PDF Report
                        </Button>

                     </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-gray-50 border-t border-gray-200 py-16 md:py-20">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Why Use Our ATS Score Checker?
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Get professional insights to optimize your resume for Applicant Tracking Systems and increase your chances of landing interviews.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <Icon name="Zap" size={28} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Instant Analysis
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Get your ATS compatibility score and detailed feedback within seconds of uploading your resume.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                        <Icon name="Target" size={28} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Professional Insights
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Receive actionable suggestions to improve your resume's ATS compatibility and overall effectiveness.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Icon name="Shield" size={28} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Secure & Private
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your resume is processed securely and never stored permanently. Your privacy is our priority.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default ATSScorePage;

