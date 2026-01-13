"use client";

import * as React from "react";
import { X, Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { loadFabric } from '@/lib/fabric-loader';
import { getApiUrl } from '@/lib/api-utils';

// Load PDF.js from CDN to avoid Node.js canvas dependency
// PDF.js from CDN exposes itself as pdfjsLib on window
declare global {
  interface Window {
    pdfjsLib?: any;
    Tesseract?: any;
  }
}

let pdfjsLib: any = null;
const loadPdfJs = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;
  if (pdfjsLib) return pdfjsLib;
  
  // Check if PDF.js is already loaded from CDN
  if (window.pdfjsLib) {
    pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    return pdfjsLib;
  }
  
  // Load PDF.js from CDN
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.getElementById('pdfjs-script');
    if (existingScript) {
      let attempts = 0;
      const maxAttempts = 50;
      const checkPdfJs = () => {
        if (window.pdfjsLib) {
          pdfjsLib = window.pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          resolve(pdfjsLib);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkPdfJs, 100);
        } else {
          reject(new Error('PDF.js failed to load from CDN'));
        }
      };
      checkPdfJs();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'pdfjs-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      setTimeout(() => {
        // PDF.js from CDN exposes itself as pdfjsLib on window
        if (window.pdfjsLib) {
          pdfjsLib = window.pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          resolve(pdfjsLib);
        } else {
          reject(new Error('PDF.js loaded but pdfjsLib not available on window'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load PDF.js from CDN'));
    };
    
    document.head.appendChild(script);
  });
};

// Load Tesseract.js for OCR
const loadTesseract = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;
  
  // Check if Tesseract is already loaded
  if (window.Tesseract) {
    return window.Tesseract;
  }
  
  // Load Tesseract.js from CDN
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.getElementById('tesseract-script');
    if (existingScript) {
      let attempts = 0;
      const maxAttempts = 50;
      const checkTesseract = () => {
        if (window.Tesseract) {
          resolve(window.Tesseract);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkTesseract, 100);
        } else {
          reject(new Error('Tesseract.js failed to load from CDN'));
        }
      };
      checkTesseract();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'tesseract-script';
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      setTimeout(() => {
        if (window.Tesseract) {
          resolve(window.Tesseract);
        } else {
          reject(new Error('Tesseract.js loaded but not available on window'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Tesseract.js from CDN'));
    };
    
    document.head.appendChild(script);
  });
};

interface ResumeUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAGE_HEIGHT = 1000; // Match resume builder canvas height
const PAGE_GAP = 20;
const CANVAS_WIDTH = 800;

interface TextBlock {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  fontName: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  charSpacing: number;
  height: number;
  fill: string; // Text color
}

export default function ResumeUploadModal({ open, onOpenChange }: ResumeUploadModalProps) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = React.useRef<any>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024 // 15MB
  });

  // Cleanup canvas on unmount
  React.useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Extract colors from PDF operator list
  const extractColorsFromPage = async (page: any): Promise<Map<number, string>> => {
    const colorMap = new Map<number, string>();
    
    try {
      const operatorList = await page.getOperatorList();
      const OPS = (window as any).pdfjsLib?.OPS || {};
      
      let currentFillColor = '#000000';
      let textItemIndex = 0;
      
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const op = operatorList.fnArray[i];
        const args = operatorList.argsArray[i];
        
        // Handle different color operators
        switch (op) {
          case OPS.setFillRGBColor:
            if (args && args.length >= 3) {
              const r = Math.round(args[0] * 255);
              const g = Math.round(args[1] * 255);
              const b = Math.round(args[2] * 255);
              currentFillColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
            break;
          case OPS.setFillGray:
            if (args && args.length >= 1) {
              const gray = Math.round(args[0] * 255);
              currentFillColor = `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;
            }
            break;
          case OPS.setFillCMYKColor:
            if (args && args.length >= 4) {
              // Convert CMYK to RGB
              const c = args[0], m = args[1], y = args[2], k = args[3];
              const r = Math.round(255 * (1 - c) * (1 - k));
              const g = Math.round(255 * (1 - m) * (1 - k));
              const b = Math.round(255 * (1 - y) * (1 - k));
              currentFillColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
            break;
          case OPS.setFillColorN:
            // Complex color space - try to extract if possible
            if (args && args.length >= 3 && typeof args[0] === 'number') {
              const r = Math.round(args[0] * 255);
              const g = Math.round(args[1] * 255);
              const b = Math.round(args[2] * 255);
              currentFillColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
            break;
          case OPS.showText:
          case OPS.showSpacedText:
            // Text is being shown - associate current color with this text item
            colorMap.set(textItemIndex, currentFillColor);
            textItemIndex++;
            break;
        }
      }
    } catch (error) {
      console.warn('Could not extract colors from PDF operator list:', error);
    }
    
    return colorMap;
  };

  const extractTextBlocks = async (
    txtContent: any,
    viewport: any,
    yOffset: number,
    pdfjs: any,
    colorMap: Map<number, string>
  ): Promise<TextBlock[]> => {
    const textBlocks: TextBlock[] = [];
    let itemIndex = 0;
    let skippedCount = 0;

    if (!txtContent || !txtContent.items || txtContent.items.length === 0) {
      console.warn('⚠️ No text items found in PDF content');
      return textBlocks;
    }

    txtContent.items.forEach((item: any) => {
      if (!item.str || !item.str.trim()) {
        skippedCount++;
        itemIndex++;
        return;
      }

      const transform = item.transform;
      let fontSize = Math.abs(transform[3]) * viewport.scale;
      if (!isFinite(fontSize) || fontSize < 6) fontSize = 12;
      
      // Add 3-4 pixels to compensate for rendering differences between PDF.js and Fabric.js
      // This helps prevent text from appearing smaller than expected
      fontSize = fontSize + 3;

      // Apply PDF transform using PDF.js utility
      // PDF.js CDN version has Util.applyTransform
      let x: number, y: number;
      if (pdfjs.Util && pdfjs.Util.applyTransform) {
        [x, y] = pdfjs.Util.applyTransform([transform[4], transform[5]], viewport.transform);
      } else {
        // Fallback: manual matrix multiplication
        // viewport.transform is [a, b, c, d, e, f]
        // For point [x, y], transformed point is:
        // x' = a*x + c*y + e
        // y' = b*x + d*y + f
        const tx = transform[4];
        const ty = transform[5];
        const vp = viewport.transform;
        x = vp[0] * tx + vp[2] * ty + vp[4];
        y = vp[1] * tx + vp[3] * ty + vp[5];
      }

      const width = item.width * viewport.scale;

      // Enhanced font detection
      const fontName = (item.fontName || '').toLowerCase();
      let fontFamily = 'Arial, sans-serif';
      let fontWeight = 'normal';
      let fontStyle = 'normal';

      // Detect font family
      if (fontName.includes('times') || fontName.includes('georgia') || fontName.includes('garamond')) {
        fontFamily = 'Times New Roman, Georgia, serif';
      } else if (fontName.includes('courier') || fontName.includes('consolas') || fontName.includes('mono')) {
        fontFamily = 'Courier New, Consolas, monospace';
      } else if (fontName.includes('calibri')) {
        fontFamily = 'Calibri, Arial, sans-serif';
      } else if (fontName.includes('verdana')) {
        fontFamily = 'Verdana, Geneva, sans-serif';
      }

      // Enhanced weight detection
      const horizontalScale = Math.abs(transform[0]);
      const verticalScale = Math.abs(transform[3]);
      const scaleRatio = horizontalScale / verticalScale;

      if (
        fontName.includes('bold') ||
        fontName.includes('heavy') ||
        fontName.includes('black') ||
        fontName.match(/[\-_]b($|[\-_])/) ||
        scaleRatio > 1.1
      ) {
        fontWeight = 'bold';
      } else if (fontName.includes('medium')) {
        fontWeight = '500';
      } else if (fontName.includes('light') || fontName.includes('thin')) {
        fontWeight = '300';
      }

      // Enhanced italic detection
      if (
        fontName.includes('italic') ||
        fontName.includes('oblique') ||
        fontName.match(/[\-_]i($|[\-_])/) ||
        transform[2] !== 0
      ) {
        fontStyle = 'italic';
      }

      // Detect condensed/expanded fonts
      let charSpacing = 0;
      if (fontName.includes('condensed') || fontName.includes('narrow')) {
        charSpacing = -20;
      } else if (fontName.includes('extended') || fontName.includes('expanded')) {
        charSpacing = 20;
      }

      // Get text color from color map or default to black
      const fill = colorMap.get(itemIndex) || '#000000';

      textBlocks.push({
        text: item.str,
        x: x,
        y: y + yOffset,
        fontSize: fontSize,
        width: width,
        fontName: fontName,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        charSpacing: charSpacing,
        height: item.height || fontSize,
        fill: fill,
      });
      
      itemIndex++;
    });

    console.log(`📊 Extracted ${textBlocks.length} text blocks (skipped ${skippedCount} empty items)`);
    return textBlocks;
  };

  // Helper function to add PDF page as image (fallback)
  const addPdfAsImage = async (imageDataUrl: string, canvas: any, yOffset: number, canvasWidth: number) => {
    const Fabric = (window as any).fabric;
    if (!Fabric) return;
    
    const fabricImage = await new Promise<any>((resolve, reject) => {
      Fabric.Image.fromURL(imageDataUrl, (fabricImg: any) => {
        if (!fabricImg) {
          reject(new Error('Failed to create Fabric image'));
          return;
        }
        
        const scale = canvasWidth / fabricImg.width;
        
        fabricImg.set({
          left: 0,
          top: yOffset,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          originX: 'left',
          originY: 'top',
          group: null,
        });
        
        resolve(fabricImg);
      }, { crossOrigin: 'anonymous' });
    });
    
    canvas.add(fabricImage);
    if (canvas.calcOffset) {
      canvas.calcOffset();
    }
  };

  const createFabricText = (textBlocks: TextBlock[], canvas: any) => {
    if (!textBlocks || textBlocks.length === 0) {
      console.warn('⚠️ No text blocks to create Fabric objects from');
      return;
    }
    
    console.log(`📝 Creating Fabric text from ${textBlocks.length} text blocks`);
    
    // Group into lines
    const lines: Array<{
      y: number;
      fontSize: number;
      fontName: string;
      fontFamily: string;
      fontWeight: string;
      fontStyle: string;
      charSpacing: number;
      fill: string;
      blocks: TextBlock[];
    }> = [];
    let currentLine: typeof lines[0] | null = null;

    textBlocks.forEach((block) => {
      if (!currentLine || Math.abs(block.y - currentLine.y) > 3) {
        if (currentLine) lines.push(currentLine);
        currentLine = {
          y: block.y,
          fontSize: block.fontSize,
          fontName: block.fontName,
          fontFamily: block.fontFamily,
          fontWeight: block.fontWeight,
          fontStyle: block.fontStyle,
          charSpacing: block.charSpacing,
          fill: block.fill,
          blocks: [block],
        };
      } else {
        currentLine.blocks.push(block);
      }
    });
    if (currentLine) lines.push(currentLine);

    // Merge blocks within each line
    lines.forEach((line) => {
      let mergedBlocks: TextBlock[] = [];
      let current: TextBlock | null = null;

      line.blocks.forEach((block, idx) => {
        if (!current) {
          current = { ...block };
        } else {
          const gap = block.x - (current.x + current.width);
          const spaceWidth = current.fontSize * 0.25;

          // When merging, keep the most prominent color (non-black if possible)
          const mergeColor = (existingColor: string, newColor: string): string => {
            if (existingColor === '#000000' && newColor !== '#000000') return newColor;
            return existingColor;
          };

          if (gap < spaceWidth * 0.5) {
            current.text += block.text;
            current.width = block.x + block.width - current.x;
            current.fill = mergeColor(current.fill, block.fill);
          } else if (gap < spaceWidth * 3) {
            current.text += ' ' + block.text;
            current.width = block.x + block.width - current.x;
            current.fill = mergeColor(current.fill, block.fill);
          } else {
            mergedBlocks.push(current);
            current = { ...block };
          }
        }

        const nextBlock = line.blocks[idx + 1];
        if (!nextBlock || nextBlock.x - (current.x + current.width) > current.fontSize) {
          mergedBlocks.push(current);
          current = null;
        }
      });

      // Create Fabric.js text objects
      // Note: Fabric should be available via window.fabric at this point
      const Fabric = (window as any).fabric;
      if (!Fabric) {
        console.error('Fabric.js not available when creating text objects');
        return;
      }

      mergedBlocks.forEach((block) => {
        if (!block.text || !block.text.trim()) {
          console.warn('⚠️ Skipping empty text block');
          return;
        }
        
        // For OCR text, Y position is already correct (from bbox) and scaled properly
        // For regular PDF text, we need to adjust Y position to align with Fabric.js rendering
        const isOcrText = (block as any)._ocrExtracted !== undefined || (block as any)._scale !== undefined;
        
        // OCR text Y position is the top of the text box, which matches Fabric.js originY: 'top'
        // No adjustment needed for OCR text since coordinates are already correct
        // Regular PDF text needs adjustment for baseline difference
        const canvasY = isOcrText 
          ? block.y  // OCR text: Y is already top-aligned, no adjustment needed
          : block.y - block.fontSize * 0.8; // Regular PDF text: adjust for baseline

        // Clamp coordinates to ensure text stays within canvas bounds
        const canvasWidth = canvas.getWidth() || CANVAS_WIDTH;
        const canvasHeight = canvas.getHeight() || PAGE_HEIGHT;
        
        // Calculate proper width for text - different approach for OCR vs PDF text
        const textHeight = block.height || block.fontSize || 50;

        // Clamp X position to ensure text doesn't go outside canvas width (with margins)
        const leftMargin = 5;
        const rightMargin = 10;
        const clampedX = Math.max(leftMargin, Math.min(block.x, canvasWidth - rightMargin));

        // Use the width that was already calculated in the textBlocks mapping
        // This ensures consistency and proper wrapping logic
        let finalWidth = block.width || 200; // Use width from block (already calculated correctly)
        
        // Ensure width doesn't exceed canvas boundaries
        const maxAllowedWidth = canvasWidth - clampedX - rightMargin;
        if (finalWidth > maxAllowedWidth) {
          finalWidth = maxAllowedWidth;
        }
        
        // Determine if wrapping should be enabled based on text length
        // Long text (>50 chars) or paragraphs should always wrap
        const textLength = block.text.trim().length;
        const isLongText = textLength > 50;
        const isParagraph = textLength > 100 || (textLength > 30 && block.text.includes(',') && block.text.includes(' '));
        const enableWrapping = isLongText || isParagraph || !isOcrText; // Enable wrapping for long text, paragraphs, or regular PDF text
        
        // For Y position: OCR text is already positioned correctly relative to its page
        // Only clamp if it's way outside reasonable bounds
        let clampedY = canvasY;
        
        if (isOcrText) {
          // OCR text: Y is already correct, just ensure it's not negative or way too large
          // Allow some flexibility - don't clamp too aggressively
          const minY = 0; // Allow text at very top if that's where it should be
          const maxY = canvasHeight - textHeight; // But ensure it fits
          clampedY = Math.max(minY, Math.min(maxY, canvasY));
        } else {
          // Regular PDF text: apply padding
          const topPadding = 10;
          const bottomMargin = 5;
          const maxY = Math.max(topPadding, canvasHeight - textHeight - bottomMargin);
          clampedY = Math.max(topPadding, Math.min(maxY, canvasY));
        }
        
        // Match exact configuration used in templateService.createAndAddObjects
        // This ensures 100% consistency with database templates
        const cleanData = {
          left: Math.round(clampedX),
          top: Math.round(clampedY),
          fontSize: Math.round(block.fontSize),
          fontFamily: block.fontFamily || 'Arial',
          fill: block.fill || '#000000', // Use extracted color
          fontWeight: block.fontWeight || 'normal',
          textBaseline: 'alphabetic', // Same as templates
          fontStyle: block.fontStyle || 'normal',
          textAlign: 'left', // Same as templates
          width: finalWidth, // Use calculated width
          height: textHeight,
          originX: 'left', // Same as templates
          originY: 'top', // Same as templates
          charSpacing: block.charSpacing || 0,
          splitByGrapheme: enableWrapping, // Enable wrapping only when needed
        };

        try {
          // Use Textbox to match template objects (templates use Textbox for type 'textbox')
          const textBox = new Fabric.Textbox(block.text.trim(), cleanData);

          // Set textBaseline and ensure object is individually selectable
          textBox.set({
            textBaseline: 'alphabetic',
            selectable: true,
            evented: true,
            lockMovementX: false,
            lockMovementY: false,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
            excludeFromExport: false,
            // Ensure object is not part of a group
            group: null,
            splitByGrapheme: enableWrapping, // Enable wrapping only when needed
            textAlign: 'left', // Left align text
          });

          // Apply control visibility settings (same as templates)
          textBox.setControlsVisibility({
            mt: false, mb: false, mtr: false,
            ml: true, mr: true,
            tl: true, tr: true, bl: true, br: true
          });

          // CRITICAL: Ensure width is set and enforced
          // Sometimes Fabric.js doesn't respect width if text is too long
          textBox.set({
            width: finalWidth, // Explicitly set width again to ensure it's enforced
            splitByGrapheme: enableWrapping, // Use calculated wrapping setting
          });
          
          // Force text to recalculate its dimensions based on the width
          textBox.initDimensions();
          
          // Ensure the text box is added and positioned correctly
          canvas.add(textBox);
          
          // Verify object is properly added and has correct width
          const addedObj = canvas.getObjects().find((o: any) => o === textBox);
          if (!addedObj) {
            console.warn('⚠️ Text object was not properly added to canvas');
          } else {
            // Debug: Log actual width vs expected width for first few objects
            const objIndex = canvas.getObjects().indexOf(textBox);
            if (objIndex < 3) {
              const actualWidth = textBox.width || 0;
              const actualHeight = textBox.height || 0;
              const actualText = textBox.text?.substring(0, 30) || '';
              const wrappingStatus = enableWrapping ? 'wrapping ON' : 'wrapping OFF';
              if (Math.abs(actualWidth - finalWidth) > 5) {
                console.warn(`⚠️ TextBox width mismatch: expected=${finalWidth.toFixed(0)}px, actual=${actualWidth.toFixed(0)}px, text="${actualText}"`);
              } else {
                console.log(`✅ TextBox ${objIndex}: width=${actualWidth.toFixed(0)}px, height=${actualHeight.toFixed(0)}px, ${wrappingStatus}, isOCR=${isOcrText}, text="${actualText}"`);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error creating text object:', error, block);
        }
      });
      
      console.log(`✅ Created ${mergedBlocks.length} text objects from line`);
    });
  };

  // Extract background shapes/colors from PDF operator list
  const extractBackgroundShapes = async (
    page: any,
    viewport: any,
    yOffset: number,
    canvas: any
  ): Promise<void> => {
    const Fabric = (window as any).fabric;
    if (!Fabric) return;

    try {
      const operatorList = await page.getOperatorList();
      const OPS = (window as any).pdfjsLib?.OPS || {};
      
      let currentFillColor = '#ffffff';
      let currentPath: { x: number; y: number }[] = [];
      let currentX = 0;
      let currentY = 0;
      
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const op = operatorList.fnArray[i];
        const args = operatorList.argsArray[i];
        
        switch (op) {
          case OPS.setFillRGBColor:
            if (args && args.length >= 3) {
              const r = Math.round(args[0] * 255);
              const g = Math.round(args[1] * 255);
              const b = Math.round(args[2] * 255);
              currentFillColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
            break;
          case OPS.setFillGray:
            if (args && args.length >= 1) {
              const gray = Math.round(args[0] * 255);
              currentFillColor = `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;
            }
            break;
          case OPS.setFillCMYKColor:
            if (args && args.length >= 4) {
              const c = args[0], m = args[1], y = args[2], k = args[3];
              const r = Math.round(255 * (1 - c) * (1 - k));
              const g = Math.round(255 * (1 - m) * (1 - k));
              const b = Math.round(255 * (1 - y) * (1 - k));
              currentFillColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
            break;
          case OPS.moveTo:
            if (args && args.length >= 2) {
              currentPath = [];
              currentX = args[0];
              currentY = args[1];
              currentPath.push({ x: currentX, y: currentY });
            }
            break;
          case OPS.lineTo:
            if (args && args.length >= 2) {
              currentX = args[0];
              currentY = args[1];
              currentPath.push({ x: currentX, y: currentY });
            }
            break;
          case OPS.rectangle:
            // Rectangle: x, y, width, height
            if (args && args.length >= 4 && currentFillColor !== '#ffffff' && currentFillColor !== '#000000') {
              const pdfjs = (window as any).pdfjsLib;
              let x1: number, y1: number, x2: number, y2: number;
              
              // Transform coordinates
              if (pdfjs?.Util?.applyTransform) {
                [x1, y1] = pdfjs.Util.applyTransform([args[0], args[1]], viewport.transform);
                [x2, y2] = pdfjs.Util.applyTransform([args[0] + args[2], args[1] + args[3]], viewport.transform);
              } else {
                const vp = viewport.transform;
                x1 = vp[0] * args[0] + vp[2] * args[1] + vp[4];
                y1 = vp[1] * args[0] + vp[3] * args[1] + vp[5];
                x2 = vp[0] * (args[0] + args[2]) + vp[2] * (args[1] + args[3]) + vp[4];
                y2 = vp[1] * (args[0] + args[2]) + vp[3] * (args[1] + args[3]) + vp[5];
              }
              
              const rectWidth = Math.abs(x2 - x1);
              const rectHeight = Math.abs(y2 - y1);
              const rectLeft = Math.min(x1, x2);
              const rectTop = Math.min(y1, y2) + yOffset;
              
              // Only add significant rectangles (not tiny ones)
              if (rectWidth > 5 && rectHeight > 5) {
                const rect = new Fabric.Rect({
                  left: rectLeft,
                  top: rectTop,
                  width: rectWidth,
                  height: rectHeight,
                  fill: currentFillColor,
                  stroke: 'transparent',
                  strokeWidth: 0,
                  selectable: true,
                  evented: true,
                });
                canvas.add(rect);
                canvas.sendToBack(rect);
              }
            }
            break;
          case OPS.fill:
          case OPS.eoFill:
          case OPS.fillStroke:
          case OPS.eoFillStroke:
            // If we have a path, create a polygon
            if (currentPath.length >= 3 && currentFillColor !== '#ffffff' && currentFillColor !== '#000000') {
              const pdfjs = (window as any).pdfjsLib;
              const transformedPoints = currentPath.map(pt => {
                let x: number, y: number;
                if (pdfjs?.Util?.applyTransform) {
                  [x, y] = pdfjs.Util.applyTransform([pt.x, pt.y], viewport.transform);
                } else {
                  const vp = viewport.transform;
                  x = vp[0] * pt.x + vp[2] * pt.y + vp[4];
                  y = vp[1] * pt.x + vp[3] * pt.y + vp[5];
                }
                return { x, y: y + yOffset };
              });
              
              // Calculate bounding box
              const minX = Math.min(...transformedPoints.map(p => p.x));
              const minY = Math.min(...transformedPoints.map(p => p.y));
              const maxX = Math.max(...transformedPoints.map(p => p.x));
              const maxY = Math.max(...transformedPoints.map(p => p.y));
              
              // Only add significant shapes
              if (maxX - minX > 5 && maxY - minY > 5) {
                try {
                  const polygon = new Fabric.Polygon(transformedPoints, {
                    fill: currentFillColor,
                    stroke: 'transparent',
                    strokeWidth: 0,
                    selectable: true,
                    evented: true,
                  });
                  canvas.add(polygon);
                  canvas.sendToBack(polygon);
                } catch (e) {
                  // Ignore invalid polygons
                }
              }
            }
            currentPath = [];
            break;
          case OPS.closePath:
            // Close the path
            if (currentPath.length > 0) {
              currentPath.push({ ...currentPath[0] });
            }
            break;
          case OPS.endPath:
            currentPath = [];
            break;
        }
      }
    } catch (error) {
      console.warn('Could not extract background shapes from PDF:', error);
    }
  };

  const loadAndExtractPage = async (
    pageNum: number,
    loadedPdf: any,
    canvas: any,
    pdfjs: any,
    pdfFile?: File
  ) => {
    const page = await loadedPdf.getPage(pageNum);

    // Calculate Y offset for this page
    const yOffset = (pageNum - 1) * (PAGE_HEIGHT + PAGE_GAP);

    // Add page border/background
    // Note: Fabric should be available via window.fabric at this point
    const Fabric = (window as any).fabric;
    if (!Fabric) {
      console.error('Fabric.js not available when creating page border');
      return;
    }

    // Create page border first and send to back immediately
    const pageBorder = new Fabric.Rect({
      left: 0,
      top: yOffset,
      width: CANVAS_WIDTH,
      height: PAGE_HEIGHT,
      fill: '#ffffff',
      stroke: '#cccccc',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      excludeFromExport: false,
    });
    canvas.add(pageBorder);
    canvas.sendToBack(pageBorder);
    
    // Ensure it stays at the back
    setTimeout(() => {
      canvas.sendToBack(pageBorder);
    }, 0);

    // Scale PDF to canvas width
    const viewport = page.getViewport({ scale: 1 });
    const scale = CANVAS_WIDTH / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    // Extract background shapes/colors first (so they're behind text)
    await extractBackgroundShapes(page, scaledViewport, yOffset, canvas);

    // Extract text colors from operator list
    const colorMap = await extractColorsFromPage(page);

    // ✅ STEP 1: Check if PDF already has text (CORRECT PROCESS)
    // Rule #1: If PDF has text → do NOT use OCR (OCR is for images/scanned PDFs only)
    const txtContent = await page.getTextContent();
    const textItemCount = txtContent.items?.length || 0;
    console.log(`📄 Page ${pageNum}: Extracted ${textItemCount} text items`);

    // ✅ STEP 2: If PDF HAS text → use pdf.js (NO OCR) - Best accuracy, lowest cost
    if (textItemCount > 0) {
      // PDF already has selectable text - extract directly using pdf.js
      // This gives us: text, coordinates, font sizes - perfect for Fabric.js
      console.log(`✅ Page ${pageNum}: PDF has text - using pdf.js extraction (no OCR needed)`);
      
      // Build text blocks with colors using pdf.js
      const textBlocks = await extractTextBlocks(txtContent, scaledViewport, yOffset, pdfjs, colorMap);
      console.log(`📝 Page ${pageNum}: Created ${textBlocks.length} text blocks`);

      // Sort by Y position, then X position
      textBlocks.sort((a, b) => {
        const yDiff = Math.abs(a.y - b.y);
        if (yDiff < 5) return a.x - b.x; // Same line, sort by X
        return a.y - b.y; // Sort by Y
      });

      // Create Fabric text objects
      const objectsBefore = canvas.getObjects().length;
      createFabricText(textBlocks, canvas);
      const objectsAfter = canvas.getObjects().length;
      console.log(`✅ Page ${pageNum}: Added ${objectsAfter - objectsBefore} text objects to canvas`);
    } else {
      // ✅ STEP 3: If PDF has NO text → use Google Vision OCR
      // Now OCR makes sense - this is a scanned PDF or image
      console.warn(`⚠️ Page ${pageNum}: No text content found. Using Google Vision OCR for scanned PDF...`);
      
      // Note: We send the original PDF file directly to Google Vision OCR
      // Google Vision accepts PDF, TIFF, and images (PNG/JPG)
      // DOCUMENT_TEXT_DETECTION returns: full text, blocks, paragraphs, words with bounding boxes
      
      // Render PDF page to canvas for fallback image rendering (if OCR fails)
      const renderContext = {
        canvasContext: null as any,
        viewport: scaledViewport,
      };
      
      // Create a temporary canvas to render the PDF page
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledViewport.width;
      tempCanvas.height = scaledViewport.height;
      renderContext.canvasContext = tempCanvas.getContext('2d');
      
      // Render the page
      await page.render(renderContext).promise;
      
      // Convert canvas to image for fallback (if OCR fails)
      const imageDataUrl = tempCanvas.toDataURL('image/png');
      
      try {
        setStatus(`🔍 Page ${pageNum}: Running Google Vision OCR to extract text... (This may take a minute)`);
        console.log(`🔍 Page ${pageNum}: Sending PDF to Google Vision OCR...`);
        
        // Create FormData with PDF file
        const formData = new FormData();
        
        // We need the original PDF file
        if (!pdfFile) {
          throw new Error('PDF file not available for Google Vision OCR');
        }
        
        formData.append('image', pdfFile, pdfFile.name);
        
        // Get auth token
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Call server OCR endpoint
        const ocrResponse = await fetch(getApiUrl('/ocr/extract-text'), {
          method: 'POST',
          headers: headers,
          body: formData
        });
        
        if (!ocrResponse.ok) {
          const errorData = await ocrResponse.json().catch(() => ({ error: 'OCR request failed' }));
          console.error(`❌ OCR request failed: ${errorData.error || `Status ${ocrResponse.status}`}`);
          throw new Error(errorData.error || `OCR failed with status ${ocrResponse.status}`);
        }
        
        const ocrResult = await ocrResponse.json();
        
        if (!ocrResult.success) {
          console.error(`❌ OCR returned unsuccessful: ${ocrResult.error || 'Unknown error'}`);
          throw new Error(ocrResult.error || 'OCR request failed');
        }
        
        // If no text blocks found, we'll fall back to showing the image
        if (!ocrResult.textBlocks || ocrResult.textBlocks.length === 0) {
          console.warn(`⚠️ Page ${pageNum}: OCR found no text (${ocrResult.warning || 'no text detected'}). Will render as image.`);
          // Don't throw error - let it fall through to image rendering
          throw new Error('No text found in OCR result - will render as image');
        }
        
        console.log(`✅ Page ${pageNum}: OCR found ${ocrResult.textBlocks.length} text blocks`);
        
        console.log(`✅ Page ${pageNum}: Server OCR completed. Found ${ocrResult.wordCount || 0} words, ${ocrResult.lineCount || 0} lines (method: ${ocrResult.method || 'unknown'})`);
        
        // Convert server OCR result to Tesseract-like format for compatibility
        const data = {
          words: ocrResult.textBlocks.map((block: any) => ({
            text: block.text,
            bbox: {
              x0: block.x,
              y0: block.y,
              x1: block.x + block.width,
              y1: block.y + block.height,
            },
            confidence: block.confidence || 90
          })),
          lines: ocrResult.textBlocks.map((block: any) => ({
            text: block.text,
            bbox: {
              x0: block.x,
              y0: block.y,
              x1: block.x + block.width,
              y1: block.y + block.height,
            }
          }))
        };
        
        console.log(`✅ Page ${pageNum}: OCR completed. Found ${data.words?.length || 0} words, ${data.lines?.length || 0} lines`);
        
        // Create text objects from OCR results - use lines instead of words for better structure
        if (data.lines && data.lines.length > 0) {
          // Use line-level OCR results (better structure)
          // Get PDF dimensions from OCR result for proper scaling
          const pdfWidth = ocrResult.pdfWidth || scaledViewport.width;
          const pdfHeight = ocrResult.pdfHeight || scaledViewport.height;
          
          // Define consistent margins for the canvas (50px on each side for comfortable spacing)
          const CANVAS_MARGIN_LEFT = 50;
          const CANVAS_MARGIN_RIGHT = 50;
          const CANVAS_MARGIN_TOP = 30;
          const CANVAS_MARGIN_BOTTOM = 30;
          const USABLE_WIDTH = CANVAS_WIDTH - CANVAS_MARGIN_LEFT - CANVAS_MARGIN_RIGHT; // 800 - 100 = 700px
          const USABLE_HEIGHT = PAGE_HEIGHT - CANVAS_MARGIN_TOP - CANVAS_MARGIN_BOTTOM; // 1000 - 60 = 940px
          
          // Find the actual content bounds in OCR space (not the full image dimensions)
          const allX0 = data.lines.map((l: any) => l.bbox?.x0 || 0);
          const allX1 = data.lines.map((l: any) => l.bbox?.x1 || 0);
          const allY0 = data.lines.map((l: any) => l.bbox?.y0 || 0);
          const allY1 = data.lines.map((l: any) => l.bbox?.y1 || 0);
          
          const contentMinX = Math.min(...allX0);
          const contentMaxX = Math.max(...allX1);
          const contentMinY = Math.min(...allY0);
          const contentMaxY = Math.max(...allY1);
          const contentWidth = contentMaxX - contentMinX;
          const contentHeight = contentMaxY - contentMinY;
          
          // Calculate scale to fit content within usable canvas area
          // Scale based on actual content bounds, not full image dimensions
          const scaleX = USABLE_WIDTH / contentWidth;
          const scaleY = USABLE_HEIGHT / contentHeight;
          // Use the smaller scale to ensure everything fits without cropping
          const baseScale = Math.min(scaleX, scaleY);
          const scale = baseScale * 0.98; // Slight reduction to ensure no cropping at bottom
          
          // Calculate offsets to position content with proper margins
          const horizontalOffset = CANVAS_MARGIN_LEFT - (contentMinX * scale);
          const verticalOffset = CANVAS_MARGIN_TOP - (contentMinY * scale);
          
          console.log(`📐 Scaling: Content=[${contentMinX.toFixed(0)},${contentMinY.toFixed(0)}] to [${contentMaxX.toFixed(0)},${contentMaxY.toFixed(0)}] (${contentWidth.toFixed(0)}x${contentHeight.toFixed(0)}), Usable=${USABLE_WIDTH}x${USABLE_HEIGHT}, scale=${scale.toFixed(3)}`);
          console.log(`📝 Page ${pageNum}: Using ${data.lines.length} lines from OCR`);
          
          // Log first few lines to debug coordinates
          if (data.lines.length > 0) {
            const firstLines = data.lines.slice(0, 3);
            console.log(`📍 First 3 lines (before scaling):`, firstLines.map((l: any) => ({
              text: l.text?.substring(0, 30) || '',
              y0: l.bbox?.y0?.toFixed(2),
              y1: l.bbox?.y1?.toFixed(2),
              x0: l.bbox?.x0?.toFixed(2),
              x1: l.bbox?.x1?.toFixed(2)
            })));
          }
          
          // Log first few lines to see their positions BEFORE processing
          const firstLines = data.lines.slice(0, 5);
          console.log(`📍 First ${firstLines.length} OCR lines (raw):`, firstLines.map((l: any) => ({
            text: l.text?.substring(0, 30) || 'NO TEXT',
            y0: l.bbox?.y0 || 0,
            y1: l.bbox?.y1 || 0,
            x0: l.bbox?.x0 || 0,
            x1: l.bbox?.x1 || 0
          })));
          
          // Find the minimum Y position to detect if there's an offset
          const minY = Math.min(...data.lines.map((l: any) => l.bbox?.y0 || Infinity));
          const maxY = Math.max(...data.lines.map((l: any) => l.bbox?.y1 || 0));
          console.log(`📍 OCR Y range: min=${minY}, max=${maxY}, image height=${scaledViewport.height}`);
          
          // Note: Removed redundant top-region OCR call since Google Vision should handle full-page extraction accurately
          // Google Vision OCR is more accurate and should extract all text in one pass
          // If text is still being missed, it's likely a coordinate/positioning issue, not an OCR accuracy issue
          
          // Disabled: Top region fallback OCR (was causing duplicate API calls)
          /*
          if (minY > 50) {
            console.log(`⚠️ First text detected at Y=${minY}px - checking top region for missed text...`);
            
            // Crop top region and run OCR again
            try {
              const topRegionHeight = Math.min(minY + 100, scaledViewport.height * 0.3); // Check top 30% or up to first text
              const topCanvas = document.createElement('canvas');
              topCanvas.width = scaledViewport.width;
              topCanvas.height = topRegionHeight;
              const topCtx = topCanvas.getContext('2d');
              
              if (!topCtx) {
                throw new Error('Failed to get canvas context for top region');
              }
              
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  topCtx!.drawImage(img, 0, 0, scaledViewport.width, topRegionHeight, 0, 0, scaledViewport.width, topRegionHeight);
                  resolve(null);
                };
                img.onerror = reject;
                img.src = imageDataUrl;
              });
              
              const topImageDataUrl = topCanvas.toDataURL('image/png');
              
              // Use server-side OCR for top region
              const topResponse = await fetch(topImageDataUrl);
              const topBlob = await topResponse.blob();
              const topFormData = new FormData();
              topFormData.append('image', topBlob, `page-${pageNum}-top.png`);
              
              // Get auth token
              const topToken = localStorage.getItem('token');
              const topHeaders: HeadersInit = {};
              if (topToken) {
                topHeaders['Authorization'] = `Bearer ${topToken}`;
              }
              
              const topOcrResponse = await fetch(getApiUrl('/ocr/extract-text'), {
                method: 'POST',
                headers: topHeaders,
                body: topFormData
              });
              
              if (!topOcrResponse.ok) {
                throw new Error('Top region OCR failed');
              }
              
              const topOcrResultData = await topOcrResponse.json();
              
              // Convert to Tesseract-like format
              const topOcrResult = {
                data: {
                  lines: topOcrResultData.textBlocks?.map((block: any) => ({
                    text: block.text,
                    bbox: {
                      x0: block.x,
                      y0: block.y,
                      x1: block.x + block.width,
                      y1: block.y + block.height,
                    }
                  })) || []
                }
              };
              
              if (topOcrResult.data.lines && topOcrResult.data.lines.length > 0) {
                console.log(`✅ Found ${topOcrResult.data.lines.length} additional lines in top region!`);
                
                // Filter out duplicates - check if line already exists in main data
                const existingYPositions = new Set<number>(data.lines.map((l: any) => Math.round(l.bbox.y0)));
                const newTopLines = topOcrResult.data.lines.filter((line: any) => {
                  const lineY = Math.round(line.bbox.y0);
                  // Only add if this Y position doesn't exist in main data (within 5px tolerance)
                  const isDuplicate = Array.from(existingYPositions).some((existingY: number) => Math.abs(existingY - lineY) < 5);
                  if (isDuplicate) {
                    console.log(`⚠️ Skipping duplicate line at Y=${lineY}`);
                  }
                  return !isDuplicate;
                });
                
                if (newTopLines.length > 0) {
                  // Add new top lines to the main data
                  newTopLines.forEach((line: any) => {
                    data.lines.unshift(line); // Add to beginning
                  });
                  console.log(`📝 Added ${newTopLines.length} new lines from top region (${topOcrResult.data.lines.length - newTopLines.length} duplicates skipped)`);
                } else {
                  console.log(`⚠️ All top region lines were duplicates`);
                }
                console.log(`📝 Total lines after top region scan: ${data.lines.length}`);
              }
            } catch (topOcrError) {
              console.warn('⚠️ Top region OCR failed:', topOcrError);
            }
          }
          */
          
          // Convert OCR lines directly to text blocks (much cleaner!)
          // First, sort lines by Y position to ensure proper ordering
          const sortedLines = [...data.lines].sort((a, b) => {
            const yDiff = Math.abs(a.bbox.y0 - b.bbox.y0);
            if (yDiff < 5) return a.bbox.x0 - b.bbox.x0; // Same line, sort by X
            return a.bbox.y0 - b.bbox.y0; // Sort by Y
          });
          
          // Deduplicate lines that are at the same position (within tolerance)
          const uniqueLines: any[] = [];
          const seenPositions = new Set<string>();
          const positionTolerance = 5; // pixels
          
          sortedLines.forEach((line: any) => {
            const yPos = Math.round(line.bbox.y0 / positionTolerance) * positionTolerance;
            const xPos = Math.round(line.bbox.x0 / positionTolerance) * positionTolerance;
            const positionKey = `${xPos},${yPos}`;
            
            if (!seenPositions.has(positionKey)) {
              seenPositions.add(positionKey);
              uniqueLines.push(line);
            } else {
              console.log(`⚠️ Skipping duplicate line at position (${xPos}, ${yPos}): "${line.text?.substring(0, 30)}"`);
            }
          });
          
          console.log(`📝 Deduplicated: ${data.lines.length} → ${uniqueLines.length} unique lines`);
          
          // Find the minimum Y value to detect if we need to adjust coordinates
          const ocrMinY = Math.min(...uniqueLines.map((l: any) => l.bbox?.y0 || Infinity));
          const ocrMaxY = Math.max(...uniqueLines.map((l: any) => l.bbox?.y1 || 0));
          console.log(`📍 OCR Y range: min=${ocrMinY.toFixed(2)}, max=${ocrMaxY.toFixed(2)}, range=${(ocrMaxY - ocrMinY).toFixed(2)}`);
          
          // If minY is negative or very small, we need to adjust all Y coordinates
          const yAdjustment = ocrMinY < 0 ? Math.abs(ocrMinY) : 0;
          if (yAdjustment > 0) {
            console.log(`🔧 Adjusting Y coordinates by ${yAdjustment} to fix negative values`);
          }
          
          const textBlocks: TextBlock[] = uniqueLines
            .filter((line: any) => {
              const hasText = line.text && line.text.trim().length > 0;
              if (!hasText) {
                console.warn('⚠️ Filtered out empty line:', line);
              }
              return hasText;
            })
            .map((line: any, index: number) => {
              // Scale coordinates properly
              const lineHeight = Math.abs(line.bbox.y1 - line.bbox.y0) * scale;
              // IMPORTANT: Scale width with font boost to match fontSize scaling
              // fontSize uses fontScale = scale * 1.25, so width needs same boost
              const fontBoost = 1.25;
              let lineWidth = Math.abs(line.bbox.x1 - line.bbox.x0) * scale * fontBoost;
              
              // Scale X coordinate (PDF coordinates are already in correct orientation)
              // Scale X coordinate and add horizontal offset to center content
              const scaledX = (line.bbox.x0 * scale) + horizontalOffset;
              
              // Constrain lineWidth to fit within canvas margins (will be further constrained in finalX section)
              const maxLineWidth = CANVAS_WIDTH - CANVAS_MARGIN_LEFT - CANVAS_MARGIN_RIGHT;
              if (lineWidth > maxLineWidth) {
                lineWidth = maxLineWidth;
              }
              
              // Scale Y coordinate and apply vertical offset to position content within margins
              // verticalOffset accounts for contentMinY so content starts at CANVAS_MARGIN_TOP
              const scaledY = (line.bbox.y0 * scale) + verticalOffset;
              
              // Add page offset - yOffset is 0 for first page, PAGE_HEIGHT + PAGE_GAP for second, etc.
              const isFirstBlock = index === 0;
              const pageTop = yOffset + CANVAS_MARGIN_TOP;
              const pageBottom = yOffset + PAGE_HEIGHT - CANVAS_MARGIN_BOTTOM;
              
              // Calculate final Y position
              let finalY = scaledY + yOffset;
              
              // Ensure Y stays within page bounds with margins
              if (finalY < pageTop) {
                finalY = pageTop;
              } else if (finalY + lineHeight > pageBottom) {
                finalY = Math.max(pageTop, pageBottom - lineHeight);
              }
              
              // Clamp Y position to stay within page bounds
              // For first block, allow it to be at Y=0 to prevent cropping
              // For other blocks, ensure they stay within bounds
              const minY = isFirstBlock ? 0 : pageTop;
              const maxY = Math.max(minY, pageBottom - lineHeight);
              
              // Only clamp if significantly outside bounds (allow some flexibility)
              if (finalY < minY - 2) {
                finalY = minY;
              } else if (finalY + lineHeight > pageBottom + 2) {
                finalY = Math.max(minY, pageBottom - lineHeight);
              }
              // Otherwise keep the calculated position to maintain accuracy
              
              // Clamp X position to stay within canvas margins
              // Use consistent margins defined at the top (CANVAS_MARGIN_LEFT = 20, CANVAS_MARGIN_RIGHT = 20)
              const leftMargin = CANVAS_MARGIN_LEFT;
              const rightMargin = CANVAS_MARGIN_RIGHT;
              const maxX = Math.max(leftMargin, CANVAS_WIDTH - lineWidth - rightMargin);
              let finalX = Math.max(leftMargin, Math.min(maxX, scaledX));
              
              // If text is too wide, constrain width instead of just position
              const maxAllowedTextWidth = CANVAS_WIDTH - leftMargin - rightMargin;
              if (lineWidth > maxAllowedTextWidth) {
                lineWidth = maxAllowedTextWidth; // Constrain width to fit within margins
                finalX = leftMargin; // Position at left margin
                console.warn(`⚠️ Text "${line.text.substring(0, 30)}" too wide, constrained to ${lineWidth.toFixed(0)}px`);
              }
              
              // Ensure text doesn't go outside canvas on the right
              if (finalX + lineWidth > CANVAS_WIDTH - rightMargin) {
                // Either shift left or constrain width
                const newX = CANVAS_WIDTH - lineWidth - rightMargin;
                if (newX >= leftMargin) {
                  finalX = newX;
                } else {
                  finalX = leftMargin;
                  lineWidth = CANVAS_WIDTH - leftMargin - rightMargin;
                }
              }
              
              // CRITICAL: Scale fontSize from OCR image coordinates to canvas coordinates
              // Google Vision returns fontSize in image space (e.g., 1191 x 1683 pixels)
              // Use a FONT-SPECIFIC scale that's less aggressive than coordinate scale
              // This keeps text readable while fitting within canvas
              const fontScale = scale * 1.25; // Boost fonts by 25% for better readability
              
              let fontSize;
              let isMultiLine = false;
              
              if (line.fontSize && line.fontSize > 0) {
                // Scale Google Vision's fontSize with font-specific boost
                const scaledFontSize = line.fontSize * fontScale;
                fontSize = Math.max(11, Math.min(26, scaledFontSize)); // Higher min (11) and max (26)
                
                if (index < 3) {
                  console.log(`📝 Block ${index}: OCR fontSize=${line.fontSize.toFixed(1)}px → scaled=${scaledFontSize.toFixed(1)}px → final=${fontSize.toFixed(1)}px (fontScale=${fontScale.toFixed(3)})`);
                }
                
                // Check if it's multi-line based on lineHeight vs fontSize
                if (lineHeight > fontSize * 1.5) {
                  isMultiLine = true;
                }
              } else {
                // Fallback: calculate from lineHeight if fontSize not provided
                fontSize = Math.max(11, Math.min(26, lineHeight * 0.9));
                
                // For multi-line text blocks, fontSize should be smaller
                if (lineHeight > fontSize * 1.5) {
                  isMultiLine = true;
                  const estimatedLines = Math.ceil(lineHeight / (fontSize * 1.2));
                  fontSize = lineHeight / estimatedLines * 0.9;
                  fontSize = Math.max(12, Math.min(26, fontSize)); // Minimum 12px for multi-line text
                }
              }
              
              // Use higher minimum (12px) for multi-line text, 11px for single-line
              const minFontSize = isMultiLine ? 12 : 11;
              fontSize = Math.max(minFontSize, fontSize);
              
              // If text is bold/large (like headings), ensure it fits within canvas
              const isBoldOrLarge = fontSize > 18 || (line.text.toUpperCase() === line.text && line.text.length < 50);
              if (isBoldOrLarge && lineWidth > CANVAS_WIDTH - 30) {
                // Reduce font size slightly for very wide text, but not too much
                // Respect the minimum font size (12px for multi-line, 10px for single-line)
                fontSize = Math.max(minFontSize, fontSize * 0.95);
                console.log(`🔧 Reduced font size for wide text "${line.text.substring(0, 30)}": ${fontSize.toFixed(1)}px`);
              }
              
              // Debug first few blocks
              if (index < 3) {
                console.log(`📍 Block ${index}: "${line.text.substring(0, 20)}" - Y: ${line.bbox.y0.toFixed(2)} → ${scaledY.toFixed(2)} → ${finalY.toFixed(2)} (pageTop: ${pageTop}, pageBottom: ${pageBottom})`);
              }
              
              return {
                text: line.text.trim(),
                x: finalX,
                y: finalY,
                fontSize: fontSize,
                // Calculate proper width for text wrapping
                // CRITICAL: Trust OCR bounding box width - it represents where the text actually appears
                // Only use full width if OCR width is clearly too narrow (indicating text was cut off)
                width: (() => {
                  // Use consistent right margin (defined at top: CANVAS_MARGIN_RIGHT = 20)
                  const maxAllowedWidth = CANVAS_WIDTH - finalX - CANVAS_MARGIN_RIGHT; // Max width: canvas - x - margin
                  
                  // Estimate natural text width based on character count and font size
                  // Average character width is approximately 0.55-0.6 of fontSize
                  const avgCharWidth = fontSize * 0.55;
                  const estimatedNaturalWidth = line.text.trim().length * avgCharWidth;
                  
                  // Determine if OCR width is reasonable
                  // OCR width should be close to natural width (within 20% tolerance)
                  const widthRatio = lineWidth / estimatedNaturalWidth;
                  const isOcrWidthReasonable = widthRatio >= 0.8 && widthRatio <= 1.2;
                  
                  // Determine if text should wrap based on length
                  const textLength = line.text.trim().length;
                  const isLongText = textLength > 50;
                  const isParagraph = textLength > 100 || (textLength > 30 && line.text.includes(',') && line.text.includes(' '));
                  
                  let finalWidth;
                  
                  if (isOcrWidthReasonable && lineWidth <= maxAllowedWidth) {
                    // OCR width is reasonable and fits - use it (text fits on one line as detected)
                    finalWidth = Math.max(lineWidth, 150); // Use OCR width, minimum 150px
                    if (index < 3) {
                      console.log(`📏 Block ${index}: Using OCR width ${finalWidth.toFixed(0)}px (natural=${estimatedNaturalWidth.toFixed(0)}px, ratio=${widthRatio.toFixed(2)})`);
                    }
                  } else if (isLongText || isParagraph) {
                    // Long text or paragraph, and OCR width is not reasonable or too wide
                    // Use full available width for proper wrapping
                    finalWidth = Math.max(200, maxAllowedWidth);
                    if (index < 3) {
                      console.log(`📏 Block ${index} (long/paragraph): Using full width ${finalWidth.toFixed(0)}px for wrapping (OCR=${lineWidth.toFixed(0)}px, natural=${estimatedNaturalWidth.toFixed(0)}px, maxAllowed=${maxAllowedWidth.toFixed(0)}px)`);
                    }
                  } else {
                    // Short text (headings, labels): use OCR width but ensure it fits
                    finalWidth = Math.min(Math.max(lineWidth, 150), maxAllowedWidth);
                    if (index < 3) {
                      console.log(`📏 Block ${index} (short): Using OCR width ${finalWidth.toFixed(0)}px (lineWidth=${lineWidth.toFixed(0)}px, maxAllowed=${maxAllowedWidth.toFixed(0)}px)`);
                    }
                  }
                  
                  // Final safety check: ensure width never exceeds canvas
                  if (finalWidth > maxAllowedWidth) {
                    console.warn(`⚠️ Block ${index}: Final width ${finalWidth.toFixed(0)}px exceeds maxAllowed ${maxAllowedWidth.toFixed(0)}px, clamping`);
                    finalWidth = maxAllowedWidth;
                  }
                  
                  return finalWidth;
                })(),
                fontName: '',
                fontFamily: line.fontFamily || 'Arial, sans-serif',
                fontWeight: 'normal',
                fontStyle: 'normal',
                charSpacing: 0,
                height: lineHeight,
                fill: '#000000',
                _ocrExtracted: true, // Mark as OCR text
              };
            });
          
          // Final deduplication of text blocks (in case same text appears at same position)
          const finalTextBlocks: TextBlock[] = [];
          const seenTextPositions = new Set<string>();
          
          textBlocks.forEach((block) => {
            const posKey = `${Math.round(block.x / 5) * 5},${Math.round(block.y / 5) * 5}`;
            if (!seenTextPositions.has(posKey)) {
              seenTextPositions.add(posKey);
              finalTextBlocks.push(block);
            } else {
              console.log(`⚠️ Skipping duplicate text block at (${block.x}, ${block.y}): "${block.text.substring(0, 30)}"`);
            }
          });
          
          console.log(`📝 Final deduplication: ${textBlocks.length} → ${finalTextBlocks.length} unique text blocks`);
          
          // Log first few text blocks to debug top positioning
          if (finalTextBlocks.length > 0) {
            console.log(`📍 First 3 text blocks Y positions (after processing):`, finalTextBlocks.slice(0, 3).map(b => ({
              text: b.text.substring(0, 30),
              y: b.y,
              yOffset: yOffset,
              scaledY: b.y - yOffset,
              x: b.x,
              fontSize: b.fontSize
            })));
            
            // Check if any text is positioned at the very top (might be cut off)
            const topText = finalTextBlocks.filter(b => b.y < yOffset + 50);
            if (topText.length > 0) {
              console.log(`📍 Found ${topText.length} text blocks near top (Y < ${yOffset + 50}):`, topText.slice(0, 3).map(b => ({
                text: b.text.substring(0, 30),
                y: b.y
              })));
            }
          } else {
            console.warn(`⚠️ No text blocks created from ${uniqueLines.length} unique OCR lines!`);
          }
          
          console.log(`📝 Page ${pageNum}: Created ${finalTextBlocks.length} text blocks from OCR lines`);
          
          // Create Fabric text objects directly from lines (no merging needed!)
          const objectsBefore = canvas.getObjects().length;
          createFabricText(finalTextBlocks, canvas);
          const objectsAfter = canvas.getObjects().length;
          
          // Mark OCR-extracted objects
          const newObjects = canvas.getObjects().slice(objectsBefore);
          newObjects.forEach((obj: any) => {
            obj._ocrExtracted = true;
          });
          
          console.log(`✅ Page ${pageNum}: Created ${objectsAfter - objectsBefore} text objects from OCR`);
        } else if (data.words && data.words.length > 0) {
          // Fallback to word-level if lines not available
          console.log(`⚠️ Page ${pageNum}: Lines not available, using words (${data.words.length} words)`);
          
          // OCR coordinates are in image space, need to scale to canvas space
          const scale = CANVAS_WIDTH / scaledViewport.width;
          
          // First, convert OCR words to text blocks with proper coordinates
          const rawBlocks: TextBlock[] = data.words
            .filter((word: any) => word.text && word.text.trim().length > 0)
            .map((word: any) => {
              const wordHeight = (word.bbox.y1 - word.bbox.y0) * scale;
              const wordWidth = (word.bbox.x1 - word.bbox.x0) * scale;
              
              // Calculate font size with the same compensation as regular PDF text
              // Increased multiplier from 0.85 to 1.0 to make fonts larger
              let fontSize = Math.max(12, Math.min(26, wordHeight * 1.0)); // Increased multiplier and min/max
              // Add 2px compensation for rendering differences (same as regular PDF text)
              fontSize = fontSize + 2;
              
              return {
                text: word.text.trim(),
                x: word.bbox.x0 * scale,
                y: (word.bbox.y0 * scale) + yOffset,
                fontSize: fontSize,
                width: wordWidth,
                fontName: '',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'normal',
                fontStyle: 'normal',
                charSpacing: 0,
                height: wordHeight,
                fill: '#000000',
                // Store original bbox for line detection
                _bbox: word.bbox,
                _scale: scale,
                _ocrExtracted: true, // Mark as OCR text
              };
            });
          
          // Group words into lines based on Y position
          const lines: TextBlock[][] = [];
          // Use average font size to determine line tolerance (more accurate)
          const avgFontSize = rawBlocks.reduce((sum, b) => sum + b.fontSize, 0) / rawBlocks.length;
          const lineTolerance = Math.max(5, avgFontSize * 0.4); // Adaptive tolerance based on font size
          
          rawBlocks.sort((a, b) => {
            const yDiff = Math.abs(a.y - b.y);
            if (yDiff < lineTolerance) return a.x - b.x; // Same line, sort by X
            return a.y - b.y; // Different lines, sort by Y
          });
          
          let currentLine: TextBlock[] = [];
          let currentLineY = -1;
          
          rawBlocks.forEach((block) => {
            if (currentLineY === -1 || Math.abs(block.y - currentLineY) < lineTolerance) {
              // Same line
              currentLine.push(block);
              if (currentLineY === -1) currentLineY = block.y;
              // Update line Y to average (handles slight variations)
              currentLineY = (currentLineY + block.y) / 2;
            } else {
              // New line
              if (currentLine.length > 0) {
                lines.push(currentLine);
              }
              currentLine = [block];
              currentLineY = block.y;
            }
          });
          
          if (currentLine.length > 0) {
            lines.push(currentLine);
          }
          
          // Merge words within each line into text blocks
          const mergedBlocks: TextBlock[] = [];
          
          lines.forEach((line) => {
            if (line.length === 0) return;
            
            // Sort line by X position
            line.sort((a, b) => a.x - b.x);
            
            // Get average font size for the line
            const avgFontSize = line.reduce((sum, b) => sum + b.fontSize, 0) / line.length;
            
            let currentBlock: TextBlock | null = null;
            
            line.forEach((word, index) => {
              if (!currentBlock) {
                // Start new block
                currentBlock = {
                  text: word.text,
                  x: word.x,
                  y: word.y,
                  fontSize: avgFontSize,
                  width: word.width,
                  fontName: '',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  charSpacing: 0,
                  height: word.height,
                  fill: '#000000',
                };
              } else {
                // Check if we should merge with current block or start new one
                const gap = word.x - (currentBlock.x + currentBlock.width);
                const spaceWidth = avgFontSize * 0.4; // Approximate space width
                
                if (gap < spaceWidth * 1.5) {
                  // Merge: add space and word (small gap - same word/phrase)
                  const spaceToAdd = gap > avgFontSize * 0.1 ? ' ' : '';
                  currentBlock.text += spaceToAdd + word.text;
                  currentBlock.width = (word.x + word.width) - currentBlock.x;
                } else if (gap < spaceWidth * 4) {
                  // Merge with space (medium gap - same sentence)
                  currentBlock.text += ' ' + word.text;
                  currentBlock.width = (word.x + word.width) - currentBlock.x;
                } else {
                  // Start new block (large gap - different phrase/section)
                  mergedBlocks.push(currentBlock);
                  currentBlock = {
                    text: word.text,
                    x: word.x,
                    y: word.y,
                    fontSize: avgFontSize,
                    width: word.width,
                    fontName: '',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    charSpacing: 0,
                    height: word.height,
                    fill: '#000000',
                    _ocrExtracted: true, // Preserve OCR marker
                  } as any; // Type assertion for _ocrExtracted property
                }
              }
              
              // Push last block in line
              if (index === line.length - 1 && currentBlock) {
                mergedBlocks.push(currentBlock);
              }
            });
          });
          
          console.log(`📝 Page ${pageNum}: Grouped ${rawBlocks.length} words into ${mergedBlocks.length} text blocks`);
          
          // Create Fabric text objects from merged blocks
          const objectsBefore = canvas.getObjects().length;
          createFabricText(mergedBlocks, canvas);
          const objectsAfter = canvas.getObjects().length;
          
          // Mark OCR-extracted objects
          const newObjects = canvas.getObjects().slice(objectsBefore);
          newObjects.forEach((obj: any) => {
            obj._ocrExtracted = true;
          });
          
          console.log(`✅ Page ${pageNum}: Created ${objectsAfter - objectsBefore} text objects from OCR`);
        } else {
          console.warn(`⚠️ Page ${pageNum}: OCR found no text. Adding as image instead.`);
          // Fallback to image if OCR finds nothing
          await addPdfAsImage(imageDataUrl, canvas, yOffset, CANVAS_WIDTH);
        }
      } catch (ocrError) {
        console.error(`❌ Page ${pageNum}: OCR failed:`, ocrError);
        console.log(`⚠️ Page ${pageNum}: Falling back to image mode`);
        // Fallback to image if OCR fails
        await addPdfAsImage(imageDataUrl, canvas, yOffset, CANVAS_WIDTH);
      }
    }
    
    // Ensure proper layering: page border at back, then backgrounds/images, then text on top
    const allObjects = canvas.getObjects();
    
    // First, send page border and backgrounds to back
    allObjects.forEach((obj: any) => {
      if (obj === pageBorder) {
        canvas.sendToBack(obj);
        // Page border should not be selectable or block clicks
        obj.set({
          selectable: false,
          evented: false,
        });
      } else if ((obj.type === 'rect' || obj.type === 'polygon') && obj !== pageBorder) {
        canvas.sendToBack(obj);
      }
    });
    
    // Then, configure and position text and images
    allObjects.forEach((obj: any) => {
      // Ensure all text objects are individually selectable and not grouped
      if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
        obj.set({
          selectable: true,
          evented: true,
          group: null, // Ensure not part of a group
          lockMovementX: false,
          lockMovementY: false,
        });
        canvas.bringToFront(obj);
      }
      // Images should be above backgrounds but below text (if text exists)
      else if (obj.type === 'image') {
        // Ensure image is selectable and clickable
        obj.set({
          selectable: true,
          evented: true,
          group: null, // Ensure not part of a group
          lockMovementX: false,
          lockMovementY: false,
        });
        
        // If there are text objects, keep images below them
        const hasText = allObjects.some((o: any) => 
          (o.type === 'text' || o.type === 'textbox' || o.type === 'i-text') && o !== obj
        );
        if (hasText) {
          // Images stay in middle layer (above backgrounds, below text)
        } else {
          // If no text, images should be on top (above page border)
          canvas.bringToFront(obj);
        }
      }
    });
    
    // Ensure canvas selection is configured for individual object selection
    canvas.selection = true;
    canvas.skipTargetFind = false;
    
    // CRITICAL: Recalculate canvas offset for proper hit detection
    if (canvas.calcOffset) {
      canvas.calcOffset();
    }
    
    // Discard any active selection to ensure objects are individually selectable
    canvas.discardActiveObject();
    
    // Log object positions for debugging
    const textObjs = allObjects.filter((obj: any) => 
      obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text'
    );
    if (textObjs.length > 0) {
      console.log(`📍 Text object positions (first 3):`, textObjs.slice(0, 3).map((obj: any) => ({
        type: obj.type,
        left: obj.left,
        top: obj.top,
        width: obj.width,
        height: obj.height,
        selectable: obj.selectable,
        evented: obj.evented
      })));
    }
    
    // Final render to ensure everything is visible
    canvas.renderAll();
    
    // Add click handler to debug selection
    const clickHandler = (e: any) => {
      const pointer = canvas.getPointer(e.e);
      const target = canvas.findTarget(e.e, false);
      
      if (target) {
        console.log('🖱️ Clicked on object:', {
          type: target.type,
          text: target.text?.substring(0, 50) || '',
          left: Math.round(target.left),
          top: Math.round(target.top),
          width: Math.round(target.width || 0),
          height: Math.round(target.height || 0),
          fontSize: target.fontSize || 0,
          fontFamily: target.fontFamily || '',
          fill: target.fill || '',
          selectable: target.selectable,
          evented: target.evented,
          pointer: pointer
        });
      } else {
        console.log('🖱️ Clicked on canvas (no object)', {
          pointer: pointer,
          canvasWidth: canvas.getWidth(),
          canvasHeight: canvas.getHeight()
        });
      }
    };
    
    canvas.on('mouse:down', clickHandler);
    
    // Store handler for cleanup if needed
    (canvas as any)._uploadModalClickHandler = clickHandler;
  };

  const handleProcess = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setStatus("Loading PDF...");

    try {
      // Load PDF.js first
      const pdfjs = await loadPdfJs();
      if (!pdfjs) {
        throw new Error('Failed to load PDF.js');
      }

      // Ensure Fabric.js is loaded
      const Fabric = await loadFabric();
      if (!Fabric) {
        throw new Error('Failed to load Fabric.js');
      }

      // Create a temporary canvas element if needed
      if (!canvasRef.current) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = CANVAS_WIDTH;
        tempCanvas.height = PAGE_HEIGHT;
        canvasRef.current = tempCanvas;
      }

      // Initialize canvas if not already done
      if (!fabricCanvasRef.current) {
        fabricCanvasRef.current = new Fabric.Canvas(canvasRef.current, {
          width: CANVAS_WIDTH,
          height: PAGE_HEIGHT,
          selection: false,
        });
      }

      const buffer = await file.arrayBuffer();
      const loadedPdf = await pdfjs.getDocument({ data: buffer }).promise;
      const totalPages = Math.min(loadedPdf.numPages, 2); // Max 2 pages

      // Resize canvas for all pages
      const totalHeight = PAGE_HEIGHT * totalPages + PAGE_GAP * (totalPages - 1);
      if (canvasRef.current) {
        canvasRef.current.height = totalHeight;
      }
      fabricCanvasRef.current.setHeight(totalHeight);

      setStatus(`Loading ${totalPages} page${totalPages > 1 ? 's' : ''}...`);

      // Load all pages
      fabricCanvasRef.current.clear();

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        await loadAndExtractPage(pageNum, loadedPdf, fabricCanvasRef.current, pdfjs, file);
      }

      setStatus("Processing complete!");

      // Get canvas JSON (full structure with version and all metadata)
      const canvasJson = fabricCanvasRef.current.toJSON();
      
      // Check if we have any text objects or just images
      const objectCount = canvasJson.objects?.length || 0;
      const textObjects = canvasJson.objects?.filter((obj: any) => 
        obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text'
      ) || [];
      const imageObjects = canvasJson.objects?.filter((obj: any) => obj.type === 'image') || [];
      
      // Ensure width, height, and version are included
      const canvasData = {
        ...canvasJson,
        width: fabricCanvasRef.current.getWidth(),
        height: fabricCanvasRef.current.getHeight(),
        // Ensure version is set (Fabric.js requires this for proper deserialization)
        version: canvasJson.version || '5.3.0',
      };
      
      console.log('💾 Saving canvas to localStorage:', {
        objectsCount: objectCount,
        textObjects: textObjects.length,
        imageObjects: imageObjects.length,
        width: canvasData.width,
        height: canvasData.height,
        version: canvasData.version
      });
      
      // Show appropriate message based on content type
      if (textObjects.length === 0 && imageObjects.length > 0) {
        setStatus("⚠️ Scanned PDF: OCR extraction was attempted but no text was found. The page has been added as an image. For better results, try a PDF with selectable text.");
      } else if (textObjects.length > 0) {
        const isOcrText = textObjects.some((obj: any) => obj._ocrExtracted);
        if (isOcrText) {
          setStatus(`✅ OCR completed! Extracted ${textObjects.length} text elements from scanned PDF. Click on individual text elements to select, move, and edit them.`);
        } else {
          setStatus("✅ Resume processed successfully! Text has been extracted and is ready to edit. Click on individual text elements to select and edit them.");
        }
      }
      
      // CRITICAL: Recalculate canvas offset after all objects are added
      if (fabricCanvasRef.current && fabricCanvasRef.current.calcOffset) {
        fabricCanvasRef.current.calcOffset();
        fabricCanvasRef.current.renderAll();
      }
      
      localStorage.setItem('importedResumeCanvas', JSON.stringify(canvasData));
      
      setSuccess(true);
      
      // Redirect to resume builder
      setTimeout(() => {
        onOpenChange(false);
        router.push('/resume-builder?imported=true&source=local');
      }, 2000);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF. Please try again.');
      setIsProcessing(false);
      setStatus("");
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFile(null);
      setError(null);
      setSuccess(false);
      setStatus("");
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Import Your Resume</h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resume Imported Successfully!
              </h3>
              <p className="text-sm text-gray-600">Redirecting to resume builder...</p>
            </div>
          ) : (
            <>
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : file
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fabricCanvasRef.current) {
                          fabricCanvasRef.current.clear();
                        }
                      }}
                      className="text-sm text-primary hover:text-primary/80"
                      disabled={isProcessing}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        {isDragActive ? 'Drop your resume here' : 'Upload Resume'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Drag & drop or click to browse
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports PDF files only (max 15MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>


              {/* Status Message */}
              {status && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <p className="text-sm text-blue-800">{status}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={!file || isProcessing}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Import Resume'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
