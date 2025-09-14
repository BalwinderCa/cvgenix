"use client";

import { useState, useCallback, DragEvent, ChangeEvent, useMemo } from "react";
import { UploadCloud, FileText, X, CheckCircle, TrendingUp, Target, Zap, Shield, AlertCircle, Sparkles, BarChart3, Eye, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

export const ATSAnalyzerSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDesc, setJobDesc] = useState<string>("");
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are allowed");
      return false;
    }

    if (file.size > maxSize) {
      setError("File size must not exceed 5 MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!validateFile(selectedFile)) return;
    
    setError(null);
    setFile(selectedFile);
  }, []);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleKeyboardDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.getElementById("file-input")?.click();
    }
  };

  // --- Simple client-side analysis ---
  const keywords = useMemo(
    () => keywordInput.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean),
    [keywordInput]
  );

  const resumeLower = useMemo(() => resumeText.toLowerCase(), [resumeText]);
  const keywordMatches = useMemo(
    () => keywords.map((k) => ({ keyword: k, present: resumeLower.includes(k) })),
    [keywords, resumeLower]
  );

  const matchCount = keywordMatches.filter((m) => m.present).length;
  const coverage = keywords.length ? Math.round((matchCount / keywords.length) * 100) : 0;
  const wordCount = useMemo(() => (resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0), [resumeText]);
  const lengthGood = wordCount >= 200 && wordCount <= 1000;
  const formatBonus = file ? 10 : 0; // uploaded file passes basic format check
  const lengthBonus = lengthGood ? 20 : 0;
  const score = Math.max(0, Math.min(100, Math.round(0.7 * coverage + formatBonus + lengthBonus)));

  const missingKeywords = keywordMatches.filter((m) => !m.present).map((m) => m.keyword).slice(0, 8);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
        {/* Left: Enhanced Upload & Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Analysis
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">ATS Resume Analyzer</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Get instant feedback on your resume's ATS compatibility. Upload your file or paste text to analyze keyword coverage, formatting, and optimization opportunities.
            </p>
          </div>

          {/* Enhanced Upload Area */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300 bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-6">
              <div
                className={`relative rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                  isDragging 
                    ? "bg-primary/10 scale-[1.02]" 
                    : "bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 hover:to-primary/5"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyboardDown}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <UploadCloud className="h-8 w-8 text-primary" />
                    </div>
                    {isDragging && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Zap className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Drop your resume here</h3>
                    <p className="text-muted-foreground">or click to browse files</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        PDF, DOC, DOCX
                      </span>
                      <span>•</span>
                      <span>Max 5MB</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); document.getElementById("file-input")?.click(); }}
                    className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </motion.div>

                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-emerald-900 truncate">{file.name}</p>
                        <p className="text-sm text-emerald-700">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Resume Content</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={6}
                placeholder="Paste your resume content here for comprehensive analysis..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Job Description (Optional)</label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={4}
                placeholder="Paste the target job description to get tailored keyword suggestions..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Target Keywords</label>
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="e.g., product strategy, user research, Figma, accessibility, agile"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
              <p className="text-xs text-muted-foreground mt-2">💡 Tip: Add core skills and role-specific terms from the job description</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Enhanced Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Score Display */}
          <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
                  <BarChart3 className="h-4 w-4" />
                  ATS Compatibility Score
                </div>
                
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative w-32 h-32 mx-auto mb-4"
                  >
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/20"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                        className={getScoreColor(score)}
                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - score / 100) }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 1 }}
                          className={`text-3xl font-bold ${getScoreColor(score)}`}
                        >
                          {score}
                        </motion.span>
                        <div className="text-sm text-muted-foreground">/ 100</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {score >= 80 ? "Excellent!" : score >= 60 ? "Good" : "Needs Improvement"}
                    </h3>
                    <p className="text-muted-foreground">
                      {score >= 80 
                        ? "Your resume is well-optimized for ATS systems" 
                        : score >= 60 
                        ? "Your resume has good ATS compatibility with room for improvement"
                        : "Your resume needs significant optimization for ATS systems"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Keyword Coverage */}
              <div className="bg-background/50 rounded-xl p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Keyword Coverage</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{coverage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <motion.div
                    className={`h-3 rounded-full ${getScoreBgColor(coverage)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${coverage}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {matchCount} of {keywords.length} keywords found
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <div className="grid gap-4">
            {/* Format & Length Check */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Format & Structure</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">File Format</span>
                    <div className="flex items-center gap-2">
                      {file ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`text-sm ${file ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {file ? "Compatible" : "Upload file"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Length</span>
                    <div className="flex items-center gap-2">
                      {lengthGood ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`text-sm ${lengthGood ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {lengthGood ? "Optimal" : `${wordCount} words`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Matches */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Keyword Analysis</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywordMatches.length === 0 ? (
                    <div className="text-center w-full py-4">
                      <p className="text-muted-foreground text-sm">Add keywords to see analysis</p>
                    </div>
                  ) : (
                    keywordMatches.map(({ keyword, present }, index) => (
                      <motion.span
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${
                          present 
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {present ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {keyword}
                      </motion.span>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Optimization Tips</h3>
                </div>
                <div className="space-y-3">
                  {missingKeywords.length > 0 && (
                    <div className="p-3 rounded-lg bg-white/60 border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">Missing Keywords</p>
                      <p className="text-sm text-blue-700">
                        Consider adding: <span className="font-medium">{missingKeywords.slice(0, 5).join(", ")}</span>
                        {missingKeywords.length > 5 && ` and ${missingKeywords.length - 5} more`}
                      </p>
                    </div>
                  )}
                  
                  {!lengthGood && (
                    <div className="p-3 rounded-lg bg-white/60 border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">Content Length</p>
                      <p className="text-sm text-blue-700">
                        Aim for 200-1000 words for optimal ATS parsing. Current: {wordCount} words
                      </p>
                    </div>
                  )}
                  
                  {!file && (
                    <div className="p-3 rounded-lg bg-white/60 border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">File Upload</p>
                      <p className="text-sm text-blue-700">
                        Upload your resume file to ensure proper formatting and get additional points
                      </p>
                    </div>
                  )}
                  
                  {jobDesc.trim() && (
                    <div className="p-3 rounded-lg bg-white/60 border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">Job Description Match</p>
                      <p className="text-sm text-blue-700">
                        Mirror key phrases from the job description to improve relevance
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};