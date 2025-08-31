import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InteractiveDemoWidget = () => {
  const [uploadStep, setUploadStep] = useState('upload'); // upload, analyzing, results
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const mockAnalysisResults = {
    atsScore: 78,
    improvements: [
      { type: 'keywords', count: 12, status: 'missing' },
      { type: 'format', count: 3, status: 'issues' },
      { type: 'skills', count: 8, status: 'optimize' }
    ],
    recommendations: [
      "Add \'Python\' and \'Machine Learning\' keywords",
      "Use bullet points for better ATS parsing",
      "Quantify achievements with specific numbers"
    ]
  };

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);

    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFile(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFile(e?.target?.files?.[0]);
    }
  };

  const handleFile = (file) => {
    setFileName(file?.name);
    setUploadStep('analyzing');

    // Simulate analysis
    setTimeout(() => {
      setUploadStep('results');
    }, 3000);
  };

  const resetDemo = () => {
    setUploadStep('upload');
    setFileName('');
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/50 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Try Our AI Analysis - Free
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Upload your current resume and get instant ATS compatibility insights
          </p>
        </div>

        <div className="bg-background rounded-2xl shadow-brand-lg border border-border/50 overflow-hidden">
          {uploadStep === 'upload' && (
            <div className="p-6 md:p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 ${dragActive
                    ? 'border-primary bg-primary/5 scale-105' : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4 md:space-y-6">
                  <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-primary to-trust rounded-full flex items-center justify-center mx-auto">
                    <Icon name="Upload" size={28} color="white" className="md:w-8 md:h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">
                      Drop your resume here
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      or click to browse files
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      variant="default"
                      size="lg"
                      className="btn-gradient"
                      iconName="FileText"
                      iconPosition="left"
                      onClick={() => document.getElementById('resume-upload')?.click()}
                    >
                      Choose File
                    </Button>

                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Icon name="Shield" size={16} className="text-accent" />
                      <span>100% Secure</span>
                    </div>
                    <div className="w-px h-4 bg-border"></div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Zap" size={16} className="text-accent" />
                      <span>Instant Analysis</span>
                    </div>
                    <div className="w-px h-4 bg-border"></div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Eye" size={16} className="text-accent" />
                      <span>No Registration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadStep === 'analyzing' && (
            <div className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-trust rounded-full flex items-center justify-center mx-auto animate-pulse-subtle">
                  <Icon name="Brain" size={32} color="white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Analyzing Your Resume
                  </h3>
                  <p className="text-muted-foreground">
                    File: {fileName}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-full bg-surface rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-trust h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name="Check" size={16} className="text-accent" />
                      <span>Parsing document structure</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name="Check" size={16} className="text-accent" />
                      <span>Analyzing ATS compatibility</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 animate-pulse">
                      <Icon name="Loader" size={16} className="text-primary animate-spin" />
                      <span>Generating optimization recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadStep === 'results' && (
            <div className="p-8">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Analysis Complete!
                  </h3>
                  <p className="text-muted-foreground">
                    Here's how your resume performs
                  </p>
                </div>

                {/* ATS Score */}
                <div className="bg-gradient-to-r from-primary/10 to-trust/10 rounded-xl p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gradient">
                      {mockAnalysisResults?.atsScore}/100
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      ATS Compatibility Score
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Good foundation with room for improvement
                    </div>
                  </div>
                </div>

                {/* Issues Found */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockAnalysisResults?.improvements?.map((item, index) => (
                    <div key={index} className="bg-surface rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-warning mb-1">
                        {item?.count}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {item?.type} to {item?.status}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">
                    Top Recommendations:
                  </h4>
                  <ul className="space-y-2">
                    {mockAnalysisResults?.recommendations?.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon name="ArrowRight" size={12} className="text-accent" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {rec}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    className="btn-gradient flex-1"
                    iconName="Sparkles"
                    iconPosition="left"
                  >
                    Optimize My Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetDemo}
                    iconName="RotateCcw"
                    iconPosition="left"
                  >
                    Try Another
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Your resume is processed securely and deleted after analysis
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Icon name="Lock" size={14} className="text-accent" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Trash2" size={14} className="text-accent" />
              <span>Auto-Delete</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={14} className="text-accent" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemoWidget;