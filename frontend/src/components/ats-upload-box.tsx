"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, X, ShieldCheck, Zap, Eye, Lock, Trash2, CheckCircle, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const ATSUploadBox = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are supported");
      return false;
    }

    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return false;
    }

    setError(null);
    return true;
  }, []);

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  }, [validateFile]);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
    e.target.value = "";
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const handleAnalyzeResume = useCallback(async () => {
    if (!file) return;

    try {
      // Convert file to base64 and store in sessionStorage
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64String,
          timestamp: Date.now()
        };
        
        sessionStorage.setItem('pendingResumeFile', JSON.stringify(fileData));
        
        // Redirect to ATS score page
        router.push('/ats-score');
      };
      reader.onerror = () => {
        setError('Failed to process file. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process file. Please try again.');
      console.error('Error processing file:', err);
    }
  }, [file, router]);

  const handleKeyboardDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.getElementById("ats-upload-input")?.click();
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    document.getElementById("ats-upload-input")?.click();
  }, []);

  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white p-8 rounded-3xl overflow-hidden shadow-sm border border-gray-100">

        <input
          id="ats-upload-input"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Enhanced Upload Area */}
        <motion.div
          role="button"
          tabIndex={0}
          className={`relative rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer border-2 border-dashed group ${
            isDragging 
              ? "border-primary bg-primary/10 scale-[1.02] shadow-lg" 
              : "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 hover:from-primary/10 hover:to-primary/5"
          }`}
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={handleKeyboardDown}
          aria-label="Upload resume file"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.div
            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div 
                className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <UploadCloud className="h-10 w-10 text-primary" />
              </motion.div>
              
              {isDragging && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
                >
                  <Zap className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </div>
            
            <div className="space-y-3">
              <h4 className="text-2xl font-semibold">Drop your resume here</h4>
              <p className="text-muted-foreground text-lg">or click to browse files</p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF, DOC, DOCX
                </span>
                <span>•</span>
                <span>Max 5MB</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-base font-semibold rounded-xl"
            >
              <UploadCloud className="mr-2 h-5 w-5" />
              Choose File
            </Button>
          </motion.div>

          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Preview */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mt-6 space-y-4"
            >
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-emerald-900 truncate">{file.name}</p>
                    <p className="text-sm text-emerald-700">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Ready</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Analyze Button */}
              <Button
                onClick={handleAnalyzeResume}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base font-semibold rounded-xl"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Your resume is processed securely and deleted after analysis</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <motion.span 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10"
              whileHover={{ scale: 1.05 }}
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              SSL Encrypted
            </motion.span>
            <motion.span 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10"
              whileHover={{ scale: 1.05 }}
            >
              <Trash2 className="h-3.5 w-3.5 text-primary" />
              Auto-Delete
            </motion.span>
            <motion.span 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10"
              whileHover={{ scale: 1.05 }}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              GDPR Compliant
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
};