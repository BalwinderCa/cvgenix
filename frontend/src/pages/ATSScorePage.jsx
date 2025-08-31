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
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
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
    
    try {
      const response = await atsService.analyzeResume(selectedFile, jobTitle, industry);
      
      if (response.success) {
        const { score, analysis } = response.data;
        setAtsScore(score);
        setAnalysisResults(analysis);
        
        // Save analysis if user is authenticated
        if (isAuthenticated) {
          try {
            await atsService.saveAnalysis({
              score,
              analysis,
              jobTitle,
              industry
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
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-warning';
    if (score >= 70) return 'text-orange-500';
    return 'text-error';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
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
      
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20 md:pt-24">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16 md:py-24">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Icon name="Target" size={48} className="text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  ATS Score Checker
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Optimize your resume for Applicant Tracking Systems. Get instant feedback on your resume's ATS compatibility and professional improvement suggestions.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>PDF & DOC Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Instant Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Professional Tips</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Upload Section */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                                 {/* File Upload Area */}
                 <div className="bg-surface border-2 border-border rounded-xl p-8 md:p-12 mb-8">
                   <div className="text-center">
                     <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                       Upload Your Resume
                     </h2>
                     <p className="text-muted-foreground mb-8">
                       Upload your resume in PDF or DOC/DOCX format to get your ATS compatibility score
                     </p>

                     {/* Job Details Form */}
                     <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                       <div className="text-left">
                         <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-2">
                           Target Job Title (Optional)
                         </label>
                         <input
                           type="text"
                           id="jobTitle"
                           value={jobTitle}
                           onChange={(e) => setJobTitle(e.target.value)}
                           placeholder="e.g., Software Engineer"
                           className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                         />
                       </div>
                       <div className="text-left">
                         <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-2">
                           Industry (Optional)
                         </label>
                         <input
                           type="text"
                           id="industry"
                           value={industry}
                           onChange={(e) => setIndustry(e.target.value)}
                           placeholder="e.g., Technology"
                           className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                         />
                       </div>
                     </div>

                    {/* Drag & Drop Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 md:p-12 transition-all duration-300 ${
                        isDragOver 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Icon name="Upload" size={32} className="text-primary" />
                        </div>
                        
                        {selectedFile ? (
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                              <Icon name="FileText" size={24} className="text-success" />
                              <span className="font-semibold text-foreground">{selectedFile.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                              <Button
                                onClick={() => {
                                  setSelectedFile(null);
                                  setAtsScore(null);
                                  setAnalysisResults(null);
                                }}
                                variant="outline"
                                size="sm"
                                iconName="X"
                              >
                                Remove File
                              </Button>
                              <Button
                                onClick={handleAnalyze}
                                loading={isAnalyzing}
                                disabled={!selectedFile}
                                iconName="Play"
                                size="sm"
                              >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-foreground mb-2">
                                Drag & drop your resume here
                              </p>
                              <p className="text-muted-foreground mb-4">
                                or click to browse files
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Supports PDF, DOC, DOCX (Max 10MB)
                              </p>
                            </div>
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                              iconName="Upload"
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

                {/* Error Display */}
                {error && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-8">
                    <div className="flex items-center space-x-2">
                      <Icon name="AlertCircle" size={20} className="text-error" />
                      <span className="text-error font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {atsScore !== null && analysisResults && (
                  <div className="bg-surface border-2 border-border rounded-xl p-8 md:p-12">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                        Your ATS Score
                      </h2>
                      
                      {/* Score Display */}
                      <div className="flex justify-center mb-8">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-8 border-border flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                            <div className="text-center">
                              <div className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
                                {atsScore}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {getScoreLabel(atsScore)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Score Description */}
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        {atsScore >= 90 
                          ? "Excellent! Your resume is well-optimized for ATS systems and should perform very well in automated screenings."
                          : atsScore >= 80
                          ? "Good score! Your resume has solid ATS compatibility with room for improvement."
                          : atsScore >= 70
                          ? "Fair score. Your resume needs some optimization to improve ATS compatibility."
                          : "Your resume needs significant optimization to improve ATS compatibility and pass automated screenings."
                        }
                      </p>
                    </div>

                    {/* Detailed Score Breakdown */}
                    {analysisResults.detailedScores && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Score Breakdown</h3>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-primary mb-1">
                              {analysisResults.detailedScores.keywordScore}
                            </div>
                            <div className="text-sm text-muted-foreground">Keyword Score</div>
                          </div>
                          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-accent mb-1">
                              {analysisResults.detailedScores.formattingScore}
                            </div>
                            <div className="text-sm text-muted-foreground">Formatting</div>
                          </div>
                          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-warning mb-1">
                              {analysisResults.detailedScores.structureScore}
                            </div>
                            <div className="text-sm text-muted-foreground">Structure</div>
                          </div>
                          <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-success mb-1">
                              {analysisResults.detailedScores.contentScore}
                            </div>
                            <div className="text-sm text-muted-foreground">Content</div>
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

                                         {/* Keyword Analysis */}
                     {analysisResults.keywordMatches && Object.keys(analysisResults.keywordMatches).length > 0 && (
                       <div className="mt-8 bg-accent/5 border border-accent/20 rounded-lg p-6">
                         <div className="flex items-center space-x-2 mb-4">
                           <Icon name="Search" size={20} className="text-accent" />
                           <h3 className="text-lg font-semibold text-foreground">Keyword Analysis</h3>
                         </div>
                         <div className="grid md:grid-cols-3 gap-4">
                           {Object.entries(analysisResults.keywordMatches).map(([category, keywords]) => (
                             <div key={category} className="bg-background/50 rounded-lg p-4">
                               <h4 className="font-semibold text-foreground mb-2 capitalize">
                                 {category} Keywords ({keywords.length})
                               </h4>
                               <div className="flex flex-wrap gap-1">
                                 {keywords.slice(0, 5).map((keyword, index) => (
                                   <span key={index} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                                     {keyword}
                                   </span>
                                 ))}
                                 {keywords.length > 5 && (
                                   <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                                     +{keywords.length - 5} more
                                   </span>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Suggestions */}
                     <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
                       <div className="flex items-center space-x-2 mb-4">
                         <Icon name="Lightbulb" size={20} className="text-primary" />
                         <h3 className="text-lg font-semibold text-foreground">Key Suggestions</h3>
                       </div>
                       <ul className="space-y-2">
                         {analysisResults.suggestions && analysisResults.suggestions.length > 0 ? (
                           analysisResults.suggestions.map((suggestion, index) => (
                             <li key={index} className="flex items-start space-x-2">
                               <Icon name="Star" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                               <span className="text-sm text-muted-foreground">{suggestion}</span>
                             </li>
                           ))
                         ) : (
                           <li className="text-sm text-muted-foreground">No specific suggestions available</li>
                         )}
                       </ul>
                     </div>

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
                           // Create a downloadable report
                           const report = {
                             score: atsScore,
                             analysis: analysisResults,
                             jobTitle,
                             industry,
                             analyzedAt: new Date().toISOString()
                           };
                           
                           const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.href = url;
                           a.download = `ats-analysis-${Date.now()}.json`;
                           document.body.appendChild(a);
                           a.click();
                           document.body.removeChild(a);
                           URL.revokeObjectURL(url);
                         }}
                       >
                         Download Report
                       </Button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-surface border-t-2 border-border py-16 md:py-24">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Why Use Our ATS Score Checker?
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Get professional insights to optimize your resume for Applicant Tracking Systems and increase your chances of landing interviews.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="text-center p-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Icon name="Zap" size={32} className="text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Instant Analysis
                    </h3>
                    <p className="text-muted-foreground">
                      Get your ATS compatibility score and detailed feedback within seconds of uploading your resume.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="text-center p-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-accent/10 rounded-full">
                        <Icon name="Target" size={32} className="text-accent" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Professional Insights
                    </h3>
                    <p className="text-muted-foreground">
                      Receive actionable suggestions to improve your resume's ATS compatibility and overall effectiveness.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="text-center p-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-success/10 rounded-full">
                        <Icon name="Shield" size={32} className="text-success" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Secure & Private
                    </h3>
                    <p className="text-muted-foreground">
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

