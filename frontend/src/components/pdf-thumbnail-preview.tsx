import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface PDFThumbnailPreviewProps {
  fileName: string;
  fileSize?: number;
  pdfUrl?: string;
  className?: string;
}

export function PDFThumbnailPreview({
  fileName,
  fileSize,
  pdfUrl,
  className = ''
}: PDFThumbnailPreviewProps) {
  console.log('PDFThumbnailPreview - pdfUrl:', pdfUrl);
  console.log('PDFThumbnailPreview - fileName:', fileName);
  
  return (
    <div className={`w-full bg-white shadow-lg  ${className}`}>
      <div className="p-0 pb-2">
        <div className="h-[520px] flex items-center justify-center bg-gray-100 overflow-hidden">
          {pdfUrl ? (
            <div className="w-full h-full overflow-hidden" style={{ border: 'none', outline: 'none' }}>
              <iframe
                src={`${pdfUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&pagemode=none&zoom=page-width&disable-scroll=1`}
                className="w-full h-full"
                style={{
                  display: 'block',
                  transform: 'scale(1.10)',
                  transformOrigin: 'center',
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}
                title="PDF Preview"
                allowTransparency={true}
              />
            </div>
          ) : (
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-2">PDF Preview</p>
              <p className="text-xs text-gray-400">{fileName}</p>
              <p className="text-xs text-gray-400 mt-2">Thumbnail not available</p>
              <p className="text-xs text-red-500 mt-2">Debug: pdfUrl is {pdfUrl || 'undefined'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
