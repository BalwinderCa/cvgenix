"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  EyeOff, 
  Maximize2,
  Minimize2,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface PDFContentPreviewProps {
  content: string;
  fileName: string;
  fileSize?: number;
  className?: string;
}

export function PDFContentPreview({ 
  content, 
  fileName, 
  fileSize, 
  className = '' 
}: PDFContentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatContent = (text: string) => {
    if (!text) return '';
    
    return text
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .trim();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded as text file!');
  };

  const displayContent = isExpanded ? content : content.substring(0, 500) + (content.length > 500 ? '...' : '');
  const formattedContent = formatContent(displayContent);

  return (
    <Card className={`bg-white border border-gray-200 ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <CardTitle className="text-sm font-medium text-gray-900">
              PDF Content Preview
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-6 w-6 p-0"
            >
              {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="truncate max-w-48">{fileName}</span>
          {fileSize && <span>{formatFileSize(fileSize)}</span>}
          <Badge variant="outline" className="text-xs">
            {content.length} characters
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Content Display */}
          <div className={`bg-gray-50 rounded-lg border border-gray-200 overflow-hidden ${
            isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
          }`}>
            <div className="h-full overflow-y-auto p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {formattedContent}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 text-xs"
              >
                {isExpanded ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Show More
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="h-7 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadAsText}
              className="h-7 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}