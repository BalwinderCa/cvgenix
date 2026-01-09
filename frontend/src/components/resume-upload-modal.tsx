"use client";

import * as React from "react";
import { X, Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { loadFabric } from '@/lib/fabric-loader';

// Load PDF.js from CDN to avoid Node.js canvas dependency
// PDF.js from CDN exposes itself as pdfjsLib on window
declare global {
  interface Window {
    pdfjsLib?: any;
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

    txtContent.items.forEach((item: any) => {
      if (!item.str || !item.str.trim()) {
        itemIndex++;
        return;
      }

      const transform = item.transform;
      let fontSize = Math.abs(transform[3]) * viewport.scale;
      if (!isFinite(fontSize) || fontSize < 6) fontSize = 12;

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

    return textBlocks;
  };

  const createFabricText = (textBlocks: TextBlock[], canvas: any) => {
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
        const canvasY = block.y - block.fontSize * 0.8;

        // Match exact configuration used in templateService.createAndAddObjects
        // This ensures 100% consistency with database templates
        const cleanData = {
          left: Math.round(block.x),
          top: Math.round(canvasY),
          fontSize: Math.round(block.fontSize),
          fontFamily: block.fontFamily || 'Arial',
          fill: block.fill || '#000000', // Use extracted color
          fontWeight: block.fontWeight || 'normal',
          textBaseline: 'alphabetic', // Same as templates
          fontStyle: block.fontStyle || 'normal',
          textAlign: 'left', // Same as templates
          width: block.width || 200,
          height: block.height || block.fontSize || 50,
          originX: 'left', // Same as templates
          originY: 'top', // Same as templates
          charSpacing: block.charSpacing || 0,
        };

        // Use Textbox to match template objects (templates use Textbox for type 'textbox')
        const textBox = new Fabric.Textbox(block.text.trim(), cleanData);

        // Set textBaseline after creation (same as templates)
        textBox.set({ textBaseline: 'alphabetic' });

        // Apply control visibility settings (same as templates)
        textBox.setControlsVisibility({
          mt: false, mb: false, mtr: false,
          ml: true, mr: true,
          tl: true, tr: true, bl: true, br: true
        });

        canvas.add(textBox);
      });
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
    pdfjs: any
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
    });
    canvas.add(pageBorder);
    canvas.sendToBack(pageBorder);

    // Scale PDF to canvas width
    const viewport = page.getViewport({ scale: 1 });
    const scale = CANVAS_WIDTH / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    // Extract background shapes/colors first (so they're behind text)
    await extractBackgroundShapes(page, scaledViewport, yOffset, canvas);

    // Extract text colors from operator list
    const colorMap = await extractColorsFromPage(page);

    // Extract text content
    const txtContent = await page.getTextContent();

    // Build text blocks with colors
    const textBlocks = await extractTextBlocks(txtContent, scaledViewport, yOffset, pdfjs, colorMap);

    // Sort by Y position, then X position
    textBlocks.sort((a, b) => {
      const yDiff = Math.abs(a.y - b.y);
      if (yDiff < 3) return a.x - b.x;
      return a.y - b.y;
    });

    // Group into lines and create Fabric objects
    createFabricText(textBlocks, canvas);
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
        await loadAndExtractPage(pageNum, loadedPdf, fabricCanvasRef.current, pdfjs);
      }

      setStatus("Processing complete!");

      // Get canvas JSON (full structure with version and all metadata)
      const canvasJson = fabricCanvasRef.current.toJSON();
      
      // Ensure width, height, and version are included
      const canvasData = {
        ...canvasJson,
        width: fabricCanvasRef.current.getWidth(),
        height: fabricCanvasRef.current.getHeight(),
        // Ensure version is set (Fabric.js requires this for proper deserialization)
        version: canvasJson.version || '5.3.0',
      };
      
      console.log('💾 Saving canvas to localStorage:', {
        objectsCount: canvasData.objects?.length || 0,
        width: canvasData.width,
        height: canvasData.height,
        version: canvasData.version
      });
      
      localStorage.setItem('importedResumeCanvas', JSON.stringify(canvasData));
      
      setSuccess(true);
      setStatus("");
      
      // Redirect to resume builder
      setTimeout(() => {
        onOpenChange(false);
        router.push('/resume-builder?imported=true&source=local');
      }, 1500);
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
