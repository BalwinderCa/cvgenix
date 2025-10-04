'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { loadFabric } from '@/lib/fabric-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Undo, 
  Redo, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Copy,
  Trash2,
  MoveUp,
  MoveDown,
  RotateCcw,
  Type,
  Square,
  Circle,
  Palette,
  Settings,
  Strikethrough,
  AlignJustify,
  List,
  Minus,
  Plus,
  PanelLeft,
  Save,
  Upload,
  FileText,
  Sparkles,
  Layout,
  Shapes,
  Image,
  Cloud,
  Pencil,
  ChevronRight
} from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';
import TemplateSidebar from '@/components/template-sidebar';
import FooterSection from '@/components/footer-section';

interface ResumeElement {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  draggable?: boolean;
  lineHeight?: number;
  textAlign?: string;
  charSpacing?: number;
}



export default function ResumeBuilderPage() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [elements, setElements] = useState<ResumeElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'rect' | 'circle'>('select');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [history, setHistory] = useState<ResumeElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textDecoration, setTextDecoration] = useState('none');
  const [textAlign, setTextAlign] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState('design');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  
  // Fabric.js refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabric, setFabric] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);

  // Load Fabric.js
  useEffect(() => {
    const initFabric = async () => {
      const fabricInstance = await loadFabric();
      setFabric(fabricInstance);
    };
    initFabric();
  }, []);


  // Initialize Fabric.js canvas - with proper timing
  useEffect(() => {
    console.log('🎨 Canvas initialization useEffect triggered:', {
      canvasRef: !!canvasRef.current,
      fabric: !!fabric,
      fabricCanvas: !!fabricCanvas,
      showCanvas: showCanvas
    });
    
    // Only initialize if we're showing the canvas and have fabric loaded
    if (!showCanvas || !fabric || fabricCanvas) {
      console.log('⏳ Skipping canvas initialization:', { showCanvas, fabric: !!fabric, fabricCanvas: !!fabricCanvas });
      return;
    }
    
    // Wait for canvas element to be ready
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max
    
    const initializeCanvas = () => {
      retryCount++;
      
      if (!canvasRef.current) {
        if (retryCount >= maxRetries) {
          console.error('❌ Canvas ref not ready after maximum retries');
          return;
        }
        console.log(`⏳ Canvas ref not ready yet, retrying in 100ms... (${retryCount}/${maxRetries})`);
        setTimeout(initializeCanvas, 100);
        return;
      }
      
      // Additional check to ensure canvas is properly mounted
      if (!canvasRef.current.getContext) {
        if (retryCount >= maxRetries) {
          console.error('❌ Canvas element not fully ready after maximum retries');
          return;
        }
        console.log(`⏳ Canvas element not fully ready, retrying in 100ms... (${retryCount}/${maxRetries})`);
        setTimeout(initializeCanvas, 100);
        return;
      }
      
      console.log('✅ Canvas ref ready, initializing Fabric.js canvas...');
      try {
        // Simple approach - minimal configuration
        console.log('📱 Device pixel ratio:', window.devicePixelRatio || 1);
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 1000,
          backgroundColor: '#ffffff',
          selection: true,
          interactive: true,
          enableRetinaScaling: true,
          imageSmoothingEnabled: false
        });

        // Enable history tracking
        canvas.history = true;

        console.log('✅ Canvas created:', canvas);

        // Configure global settings to disable rotation and certain resize handles
        fabric.Object.prototype.set({
          lockRotation: true, // Disable rotation for all objects
          lockUniScaling: true, // Prevent uniform scaling
          lockScalingX: false, // Allow horizontal scaling
          lockScalingY: false, // Allow vertical scaling
          lockScalingFlip: true, // Prevent flipping
          borderScaleFactor: 2, // 2px border
          cornerSize: 12, // 12px corner handles
          cornerStyle: 'circle',
          cornerColor: '#ffffff',
          cornerStrokeColor: '#999999',
          transparentCorners: false,
          borderColor: '#3b82f6', // Primary blue color
          borderOpacityWhenMoving: 1,
          hasControls: true,
          hasBorders: true,
          borderDashArray: null
        });

        // Configure selection controls to remove resize handles and rotate handle
        const configureSelectionControls = (activeObject: any) => {
          if (activeObject) {
            // Remove top and bottom resize handles and rotate handle
            activeObject.setControlsVisibility({
              mt: false, // top
              mb: false, // bottom
              mtr: false, // rotate handle
              tl: true,  // top-left
              tr: true,  // top-right
              bl: true,  // bottom-left
              br: true   // bottom-right
            });

            // Apply custom styling to match the image
            activeObject.set({
              borderColor: '#3b82f6', // Primary blue color
              cornerColor: '#ffffff', // White corner handles
              cornerStrokeColor: '#999999', // Gray outline
              cornerStyle: 'circle',
              cornerSize: 12, // 12px corner handles
              transparentCorners: false,
              borderScaleFactor: 2 // 2px border
            });
          }
        };

      // Add event listeners
      canvas.on('selection:created', (e: any) => {
        setSelectedObject(e.selected[0]);
        setSelectedElement(e.selected[0]?.id || null);
        configureSelectionControls(e.selected[0]);
      });

      canvas.on('selection:updated', (e: any) => {
        setSelectedObject(e.selected[0]);
        setSelectedElement(e.selected[0]?.id || null);
        configureSelectionControls(e.selected[0]);
      });

      canvas.on('selection:cleared', () => {
        setSelectedObject(null);
        setSelectedElement(null);
      });

      canvas.on('object:added', () => {
        console.log('📝 Object added to canvas');
        saveCanvasToLocalStorage();
      });

      canvas.on('object:removed', () => {
        console.log('🗑️ Object removed from canvas');
        saveCanvasToLocalStorage();
      });

      canvas.on('object:modified', () => {
        console.log('✏️ Object modified on canvas');
        saveCanvasToLocalStorage();
      });

      // Ensure crisp text rendering and apply control settings for all objects
      canvas.on('object:added', (e: any) => {
        const obj = e.target;
        if (obj) {
          // Apply control visibility settings
          obj.setControlsVisibility({
            mt: false, // top
            mb: false, // bottom
            mtr: false, // rotate handle
            tl: true,  // top-left
            tr: true,  // top-right
            bl: true,  // bottom-left
            br: true   // bottom-right
          });

          // Apply custom styling to match the image
          obj.set({
            borderColor: '#3b82f6', // Primary blue color
            cornerColor: '#ffffff', // White corner handles
            cornerStrokeColor: '#999999', // Gray outline
            cornerStyle: 'circle',
            cornerSize: 12, // 12px corner handles
            transparentCorners: false,
            borderScaleFactor: 2 // 2px border
          });

          if (obj.type === 'text') {
            // Force crisp text rendering
            obj.set({
              fontFamily: obj.fontFamily || 'Arial',
              fontSize: obj.fontSize || 16,
              fontWeight: obj.fontWeight || 'normal'
            });
          }
        }
      });

      console.log('💾 Setting fabric canvas state...');
      setFabricCanvas(canvas);
      console.log('✅ Canvas state set, fabricCanvas should be available now');
      
      // Simple re-render
      setTimeout(() => {
        if (canvas) {
          canvas.renderAll();
          console.log('🔄 Canvas re-rendered');
        }
      }, 100);
      
      // Handle window resize
      const handleResize = () => {
        if (canvas) {
          canvas.setDimensions({
            width: 800,
            height: 1000
          });
          canvas.renderAll();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
      };
      } catch (error) {
        console.error('❌ Error creating Fabric.js canvas:', error);
        // Retry after a short delay
        setTimeout(initializeCanvas, 200);
      }
    };
    
    // Start initialization
    initializeCanvas();
  }, [fabric, showCanvas, fabricCanvas]);


  // Update header toolbar when object is selected
  React.useEffect(() => {
    if (fabricCanvas) {
      const activeObjects = fabricCanvas.getActiveObjects();
      if (activeObjects.length > 0) {
        // For multiple selection, use the first object's properties
        const firstObject = activeObjects[0];
        setFontFamily(firstObject.fontFamily || 'Arial');
        setFontSize(firstObject.fontSize || 16);
        setTextColor(firstObject.fill || '#000000');
        setIsBold(firstObject.fontWeight === 'bold');
        setIsItalic(firstObject.fontStyle === 'italic');
        setIsUnderline(firstObject.underline || false);
        setIsStrikethrough(firstObject.linethrough || false);
        setTextAlign(firstObject.textAlign || 'left');
      } else if (selectedObject) {
        setFontFamily(selectedObject.fontFamily || 'Arial');
        setFontSize(selectedObject.fontSize || 16);
        setTextColor(selectedObject.fill || '#000000');
        setIsBold(selectedObject.fontWeight === 'bold');
        setIsItalic(selectedObject.fontStyle === 'italic');
        setIsUnderline(selectedObject.underline || false);
        setIsStrikethrough(selectedObject.linethrough || false);
        setTextAlign(selectedObject.textAlign || 'left');
      }
    }
  }, [selectedObject, fabricCanvas]);




  const saveToHistory = useCallback((newElements: ResumeElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Save canvas data to localStorage
  const saveCanvasToLocalStorage = useCallback(() => {
    if (fabricCanvas) {
      try {
        const canvasData = fabricCanvas.toJSON();
        localStorage.setItem('resume-canvas-data', JSON.stringify(canvasData));
        console.log('Canvas data saved to localStorage');
      } catch (error) {
        console.error('Error saving canvas data to localStorage:', error);
      }
    }
  }, [fabricCanvas]);

  // Clear saved canvas data
  const clearSavedCanvasData = useCallback(() => {
    localStorage.removeItem('resume-canvas-data');
    console.log('Saved canvas data cleared from localStorage');
  }, []);

  const undo = useCallback(() => {
    if (fabricCanvas) {
      fabricCanvas.undo();
    }
  }, [fabricCanvas]);

  const redo = useCallback(() => {
    if (fabricCanvas) {
      fabricCanvas.redo();
    }
  }, [fabricCanvas]);

  const addElement = useCallback((type: ResumeElement['type']) => {
    const newElement: ResumeElement = {
      id: `${type}_${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 30 : 100,
      text: type === 'text' ? 'Click to edit' : '',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: textColor,
      stroke: strokeColor,
      strokeWidth: 1,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      draggable: true
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    saveToHistory(newElements);
  }, [elements, textColor, strokeColor, saveToHistory]);

  const updateElement = useCallback((id: string, updates: Partial<ResumeElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedElement(null);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);



  const generateSampleResume = useCallback(() => {
    // This function is now empty - content will be loaded from database
    console.log('Sample resume generation disabled - loading from database instead');
  }, []);

  const exportToPDF = useCallback(async () => {
    if (!fabricCanvas) return;
    
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Get A4 dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit page
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (imgWidth * 1000) / 800; // Maintain aspect ratio
      
      // Add image to PDF
      pdf.addImage(dataURL, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save('Resume.pdf');
      
    } catch (error) {
      console.error('Error creating PDF:', error);
      // Fallback to download as PNG
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.download = 'Resume.png';
      link.href = dataURL;
      link.click();
    }
  }, [fabricCanvas]);

  const duplicateElement = useCallback(() => {
    if (!selectedElement) return;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;
    
    const newElement: ResumeElement = {
      ...element,
      id: `${element.type}_${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    saveToHistory(newElements);
  }, [selectedElement, elements, saveToHistory]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    deleteElement(selectedElement);
  }, [selectedElement, deleteElement]);

  const bringToFront = useCallback(() => {
    if (!selectedElement) return;
    
    const newElements = [...elements];
    const elementIndex = newElements.findIndex(el => el.id === selectedElement);
    if (elementIndex !== -1) {
      const element = newElements.splice(elementIndex, 1)[0];
      newElements.push(element);
      setElements(newElements);
      saveToHistory(newElements);
    }
  }, [selectedElement, elements, saveToHistory]);

  const sendToBack = useCallback(() => {
    if (!selectedElement) return;
    
    const newElements = [...elements];
    const elementIndex = newElements.findIndex(el => el.id === selectedElement);
    if (elementIndex !== -1) {
      const element = newElements.splice(elementIndex, 1)[0];
      newElements.unshift(element);
      setElements(newElements);
      saveToHistory(newElements);
    }
  }, [selectedElement, elements, saveToHistory]);

  const resetRotation = useCallback(() => {
    if (!selectedElement) return;
    updateElement(selectedElement, { rotation: 0 });
  }, [selectedElement, updateElement]);


  const applyTextFormatting = useCallback((format: 'bold' | 'italic' | 'underline') => {
    if (!selectedElement) return;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element || element.type !== 'text') return;
    
    let updates: Partial<ResumeElement> = {};
    
    switch (format) {
      case 'bold':
        updates.fontWeight = fontWeight === 'bold' ? 'normal' : 'bold';
        setFontWeight(updates.fontWeight);
        break;
      case 'italic':
        updates.fontStyle = fontStyle === 'italic' ? 'normal' : 'italic';
        setFontStyle(updates.fontStyle);
        break;
      case 'underline':
        updates.textDecoration = textDecoration === 'underline' ? 'none' : 'underline';
        setTextDecoration(updates.textDecoration);
        break;
    }
    
    updateElement(selectedElement, updates);
  }, [selectedElement, elements, fontWeight, fontStyle, textDecoration, updateElement]);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    if (!fabricCanvas) {
      console.log('❌ Canvas not ready, cannot load template');
      return;
    }
    
    console.log('🎯 Loading template from database:', templateId);
    
    try {
      // Clear current canvas first
      fabricCanvas.clear();
      console.log('🧹 Canvas cleared, loading new template...');
      
      const response = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (response.ok) {
        const template = await response.json();
        console.log('✅ Template loaded from database:', {
          id: template._id,
          name: template.name,
          renderEngine: template.renderEngine,
          hasCanvasData: !!template.canvasData,
          objectsCount: template.canvasData?.objects?.length || 0
        });
        
        if (template.renderEngine === 'canvas' && template.canvasData) {
          console.log('📋 Loading canvas template with', template.canvasData.objects.length, 'objects');
          
          // Load template directly with Fabric.js - no conversion needed!
          await new Promise<void>((resolve, reject) => {
            fabricCanvas.loadFromJSON(template.canvasData, () => {
              console.log('✅ Template loaded to canvas, objects count:', fabricCanvas.getObjects().length);
              fabricCanvas.renderAll();
              setCurrentTemplate(templateId);
              resolve();
            });
          });
          
          console.log('🎉 Template successfully loaded from database!');
        } else {
          console.log('⚠️ Template is not a canvas template:', template.renderEngine);
          alert('This template is not compatible with the canvas editor. Please select a canvas template.');
        }
      } else {
        throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error loading template from database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to load template: ${errorMessage}`);
    }
  }, [fabricCanvas]);

  // Load saved canvas data when canvas becomes available
  React.useEffect(() => {
    console.log('🎯 Canvas loading useEffect triggered:', { 
      fabricCanvas: !!fabricCanvas, 
      objectsCount: fabricCanvas?.getObjects().length,
      timestamp: new Date().toISOString()
    });
    
    if (!fabricCanvas) {
      console.log('⏳ Canvas not ready yet');
      return;
    }
    
    // Check if canvas already has content
    if (fabricCanvas.getObjects().length > 0) {
      console.log('✅ Canvas already has content, skipping load');
      return;
    }
    
    // Check if there's saved canvas data in localStorage first
    const savedCanvasData = localStorage.getItem('resume-canvas-data');
    if (savedCanvasData) {
      console.log('💾 Loading saved canvas data from localStorage');
      try {
        const canvasData = JSON.parse(savedCanvasData);
        fabricCanvas.loadFromJSON(canvasData, () => {
          console.log('✅ Canvas data restored from localStorage');
          fabricCanvas.renderAll();
        });
        return; // Exit early if localStorage data is loaded
      } catch (error) {
        console.error('❌ Error loading saved canvas data:', error);
      }
    }
    
    // No auto-loading of demo resume - let user choose template
    console.log('📋 Canvas ready - no auto-loading, user can select template');
  }, [fabricCanvas]);

  const deleteAllTemplatesAndSaveCurrent = useCallback(async () => {
    if (!fabricCanvas) return;
    
    try {
      // First, delete all existing templates
      const deleteResponse = await fetch('http://localhost:3001/api/templates', {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete existing templates');
      }

      const deleteResult = await deleteResponse.json();
      console.log('Deleted templates:', deleteResult);

      // Generate thumbnail from canvas
      const thumbnail = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 1
      });

      // Prepare template data
      const templateData = {
        name: 'Current Canvas Template',
        description: 'Interactive resume template created with Fabric.js editor',
        category: 'Modern',
        thumbnail: thumbnail,
        preview: thumbnail,
        canvasData: fabricCanvas.toJSON(),
        renderEngine: 'canvas',
        isActive: true,
        isPremium: false,
        isPopular: false,
        isNewTemplate: true,
        tags: ['interactive', 'fabric', 'canvas'],
        metadata: {
          colorScheme: 'light',
          layout: 'single-column',
          complexity: 'moderate'
        }
      };

      // Save current canvas to database
      const saveResponse = await fetch('http://localhost:3001/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (saveResponse.ok) {
        const result = await saveResponse.json();
        console.log('Template saved successfully:', result);
        alert(`Deleted ${deleteResult.deletedCount} templates and saved current canvas!`);
        setCurrentTemplate(result.template._id);
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error deleting and saving canvas:', error);
      alert('Failed to delete templates and save canvas');
    }
  }, [fabricCanvas]);

  const saveCanvasToDatabase = useCallback(async () => {
    if (!fabricCanvas) return;
    
    try {
      // Generate thumbnail from canvas
      const thumbnail = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 1
      });

      // Prepare template data
      const templateData = {
        name: `Canvas Template ${new Date().toLocaleDateString()}`,
        description: 'Interactive resume template created with Fabric.js editor',
        category: 'Modern',
        thumbnail: thumbnail,
        preview: thumbnail,
        canvasData: fabricCanvas.toJSON(),
        renderEngine: 'canvas',
        isActive: true,
        isPremium: false,
        isPopular: false,
        isNewTemplate: true,
        tags: ['interactive', 'fabric', 'canvas'],
        metadata: {
          colorScheme: 'light',
          layout: 'single-column',
          complexity: 'moderate'
        }
      };

      // Save to database
      const response = await fetch('http://localhost:3001/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Template saved successfully:', result);
        alert('Canvas saved to database successfully!');
        setCurrentTemplate(result.template._id);
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving canvas:', error);
      alert('Failed to save canvas to database');
    }
  }, [fabricCanvas]);

  // Show choice screen first
  if (!showCanvas) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-16 mt-8 sm:mt-15">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Build Your Resume</h1>
              <p className="text-lg text-gray-600">Choose how you want to get started</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Import Resume Card */}
              <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">Import Resume</h3>
                      <p className="text-gray-600 mb-6">
                        Upload your existing resume and we'll help you improve it
                      </p>
                    </div>
                    <Button size="lg" className="w-full" variant="outline">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Start from Scratch Card */}
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary"
                onClick={() => setShowCanvas(true)}
              >
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">Start from Scratch</h3>
                      <p className="text-gray-600 mb-6">
                        Create a professional resume from scratch with our editor
                      </p>
                    </div>
                    <Button size="lg" className="w-full">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Building
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <FooterSection />
      </div>
    );
  }

  // Show canvas editor
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="pt-16 flex h-screen">
        {/* Right Sidebar with Horizontal Tabs */}
        {showLeftSidebar && (
          <div className="w-96 bg-white border-r border-gray-200 pt-4">
            {/* Sidebar Header with Toggle */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Templates</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                className="h-8 w-8 p-0"
                title="Toggle Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Horizontal Tab Navigation */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSidebarTab('design')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeSidebarTab === 'design' 
                      ? 'bg-teal-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Design</span>
                </button>
                <button
                  onClick={() => setActiveSidebarTab('elements')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeSidebarTab === 'elements' 
                      ? 'bg-teal-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shapes className="w-3.5 h-3.5" />
                  <span>Elements</span>
                </button>
                <button
                  onClick={() => setActiveSidebarTab('text')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeSidebarTab === 'text' 
                      ? 'bg-teal-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => setActiveSidebarTab('uploads')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeSidebarTab === 'uploads' 
                      ? 'bg-teal-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Uploads</span>
                </button>
                <button
                  onClick={() => setActiveSidebarTab('tools')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeSidebarTab === 'tools' 
                      ? 'bg-teal-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Tools</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="h-full">
              {activeSidebarTab === 'design' && (
                <TemplateSidebar
                  currentTemplateId={currentTemplate}
                  onTemplateSelect={handleTemplateSelect}
                  canvasReady={!!fabricCanvas}
                />
              )}

              {activeSidebarTab === 'elements' && (
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Elements</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const rect = new fabric.Rect({
                            left: 100,
                            top: 100,
                            width: 100,
                            height: 100,
                            fill: '#3b82f6',
                            stroke: '#1e40af',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          rect.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          rect.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(rect);
                          fabricCanvas.setActiveObject(rect);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Square className="w-4 h-4" />
                        <span>Rectangle</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const circle = new fabric.Circle({
                            left: 100,
                            top: 100,
                            radius: 50,
                            fill: '#10b981',
                            stroke: '#059669',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          circle.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          circle.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(circle);
                          fabricCanvas.setActiveObject(circle);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Circle className="w-4 h-4" />
                        <span>Circle</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const line = new fabric.Line([50, 50, 150, 50], {
                            stroke: '#ef4444',
                            strokeWidth: 3,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          line.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          line.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(line);
                          fabricCanvas.setActiveObject(line);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Minus className="w-4 h-4" />
                        <span>Line</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const triangle = new fabric.Triangle({
                            left: 100,
                            top: 100,
                            width: 80,
                            height: 80,
                            fill: '#8b5cf6',
                            stroke: '#7c3aed',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          triangle.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          triangle.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(triangle);
                          fabricCanvas.setActiveObject(triangle);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Shapes className="w-4 h-4" />
                        <span>Triangle</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const polygon = new fabric.Polygon([
                            { x: 0, y: -50 },
                            { x: 50, y: 0 },
                            { x: 0, y: 50 },
                            { x: -50, y: 0 }
                          ], {
                            left: 100,
                            top: 100,
                            fill: '#f59e0b',
                            stroke: '#d97706',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          polygon.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          polygon.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(polygon);
                          fabricCanvas.setActiveObject(polygon);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Square className="w-4 h-4" />
                        <span>Diamond</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const star = new fabric.Polygon([
                            { x: 0, y: -40 },
                            { x: 12, y: -12 },
                            { x: 40, y: -12 },
                            { x: 20, y: 8 },
                            { x: 24, y: 40 },
                            { x: 0, y: 24 },
                            { x: -24, y: 40 },
                            { x: -20, y: 8 },
                            { x: -40, y: -12 },
                            { x: -12, y: -12 }
                          ], {
                            left: 100,
                            top: 100,
                            fill: '#eab308',
                            stroke: '#ca8a04',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          star.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          star.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(star);
                          fabricCanvas.setActiveObject(star);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Star</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const hexagon = new fabric.Polygon([
                            { x: -30, y: -25 },
                            { x: 30, y: -25 },
                            { x: 40, y: 0 },
                            { x: 30, y: 25 },
                            { x: -30, y: 25 },
                            { x: -40, y: 0 }
                          ], {
                            left: 100,
                            top: 100,
                            fill: '#06b6d4',
                            stroke: '#0891b2',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          hexagon.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          hexagon.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(hexagon);
                          fabricCanvas.setActiveObject(hexagon);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Shapes className="w-4 h-4" />
                        <span>Hexagon</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const arrow = new fabric.Polygon([
                            { x: -30, y: -10 },
                            { x: 20, y: -10 },
                            { x: 20, y: -20 },
                            { x: 40, y: 0 },
                            { x: 20, y: 20 },
                            { x: 20, y: 10 },
                            { x: -30, y: 10 }
                          ], {
                            left: 100,
                            top: 100,
                            fill: '#dc2626',
                            stroke: '#b91c1c',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          arrow.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          arrow.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(arrow);
                          fabricCanvas.setActiveObject(arrow);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4" />
                        <span>Arrow</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeSidebarTab === 'text' && (
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Text</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const heading = new fabric.Textbox('Your Name', {
                            left: 100,
                            top: 100,
                            fontSize: 24,
                            fontFamily: 'Arial',
                            fontWeight: 'bold',
                            fill: '#1f2937',
                            width: 200,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          heading.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          heading.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(heading);
                          fabricCanvas.setActiveObject(heading);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                        <span>Heading</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const bodyText = new fabric.Textbox('Body text content here...', {
                            left: 100,
                            top: 100,
                            fontSize: 14,
                            fontFamily: 'Arial',
                            fill: '#374151',
                            width: 200,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          bodyText.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          bodyText.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(bodyText);
                          fabricCanvas.setActiveObject(bodyText);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                      <span>Body Text</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const bulletText = new fabric.Textbox('• First item\n• Second item\n• Third item', {
                            left: 100,
                            top: 100,
                            fontSize: 14,
                            fontFamily: 'Arial',
                            fill: '#374151',
                            width: 200,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          bulletText.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          bulletText.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(bulletText);
                          fabricCanvas.setActiveObject(bulletText);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <List className="w-4 h-4" />
                        <span>Bullet List</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const numberedList = new fabric.Textbox('1. First item\n2. Second item\n3. Third item', {
                            left: 100,
                            top: 100,
                            fontSize: 14,
                            fontFamily: 'Arial',
                            fill: '#374151',
                            width: 200,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          numberedList.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          numberedList.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(numberedList);
                          fabricCanvas.setActiveObject(numberedList);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <List className="w-4 h-4" />
                        <span>Numbered List</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const subheading = new fabric.Textbox('Subheading', {
                            left: 100,
                            top: 100,
                            fontSize: 18,
                            fontFamily: 'Arial',
                            fontWeight: 'bold',
                            fill: '#1f2937',
                            width: 200,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          subheading.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          subheading.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(subheading);
                          fabricCanvas.setActiveObject(subheading);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                        <span>Subheading</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const caption = new fabric.Textbox('Caption text', {
                            left: 100,
                            top: 100,
                            fontSize: 12,
                            fontFamily: 'Arial',
                            fontStyle: 'italic',
                            fill: '#6b7280',
                            width: 200,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          caption.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          caption.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(caption);
                          fabricCanvas.setActiveObject(caption);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                        <span>Caption</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const quote = new fabric.Textbox('"This is a quote"', {
                            left: 100,
                            top: 100,
                            fontSize: 16,
                            fontFamily: 'Georgia',
                            fontStyle: 'italic',
                            fill: '#374151',
                            width: 250,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          quote.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          quote.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(quote);
                          fabricCanvas.setActiveObject(quote);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                        <span>Quote</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const code = new fabric.Textbox('code snippet', {
                            left: 100,
                            top: 100,
                            fontSize: 14,
                            fontFamily: 'Courier New',
                            fill: '#1f2937',
                            backgroundColor: '#f3f4f6',
                            width: 200,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          code.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          code.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(code);
                          fabricCanvas.setActiveObject(code);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                        <span>Code</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeSidebarTab === 'uploads' && (
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Uploads</h3>
                  <div className="space-y-2">
                    <label className="w-full cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && fabricCanvas) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const fabricImage = new fabric.Image(img, {
                                  left: 100,
                                  top: 100,
                                  scaleX: 0.5,
                                  scaleY: 0.5,
                                  lockRotation: true,
                                  lockUniScaling: true,
                                  lockScalingFlip: true
                                });
                                fabricImage.setControlsVisibility({
                                  mt: false, mb: false, mtr: false,
                                  tl: true, tr: true, bl: true, br: true
                                });
                                fabricImage.set({
                                  borderColor: '#3b82f6',
                                  cornerColor: '#ffffff',
                                  cornerStrokeColor: '#999999',
                                  cornerStyle: 'circle',
                                  cornerSize: 12,
                                  transparentCorners: false,
                                  borderScaleFactor: 2
                                });
                                fabricCanvas.add(fabricImage);
                                fabricCanvas.setActiveObject(fabricImage);
                                fabricCanvas.renderAll();
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Image className="w-4 h-4" />
                          <span>Upload Image</span>
                        </div>
                        <Upload className="w-4 h-4" />
                      </div>
                    </label>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          // Add a sample profile image placeholder
                          const rect = new fabric.Rect({
                            left: 100,
                            top: 100,
                            width: 80,
                            height: 80,
                            fill: '#e5e7eb',
                            stroke: '#9ca3af',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          const text = new fabric.Text('Photo', {
                            left: 100,
                            top: 140,
                            fontSize: 12,
                            fill: '#6b7280',
                            textAlign: 'center',
                            originX: 'center',
                            originY: 'center'
                          });
                          const group = new fabric.Group([rect, text], {
                            left: 100,
                            top: 100,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          group.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          group.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(group);
                          fabricCanvas.setActiveObject(group);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4" />
                        <span>Profile Placeholder</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          // Add a sample logo placeholder
                          const circle = new fabric.Circle({
                            left: 100,
                            top: 100,
                            radius: 30,
                            fill: '#3b82f6',
                            stroke: '#1e40af',
                            strokeWidth: 2,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          const text = new fabric.Text('LOGO', {
                            left: 100,
                            top: 100,
                            fontSize: 10,
                            fill: '#ffffff',
                            textAlign: 'center',
                            originX: 'center',
                            originY: 'center',
                            fontWeight: 'bold'
                          });
                          const group = new fabric.Group([circle, text], {
                            left: 100,
                            top: 100,
                            lockRotation: true,
                            lockUniScaling: true,
                            lockScalingFlip: true
                          });
                          group.setControlsVisibility({
                            mt: false, mb: false, mtr: false,
                            tl: true, tr: true, bl: true, br: true
                          });
                          group.set({
                            borderColor: '#3b82f6',
                            cornerColor: '#ffffff',
                            cornerStrokeColor: '#999999',
                            cornerStyle: 'circle',
                            cornerSize: 12,
                            transparentCorners: false,
                            borderScaleFactor: 2
                          });
                          fabricCanvas.add(group);
                          fabricCanvas.setActiveObject(group);
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Square className="w-4 h-4" />
                        <span>Logo Placeholder</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeSidebarTab === 'tools' && (
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Tools</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setTool('select')}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between ${
                        tool === 'select' ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Select Tool</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setTool('text')}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between ${
                        tool === 'text' ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4" />
                        <span>Text Tool</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setTool('rect')}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between ${
                        tool === 'rect' ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Square className="w-4 h-4" />
                        <span>Rectangle Tool</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setTool('circle')}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between ${
                        tool === 'circle' ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Circle className="w-4 h-4" />
                        <span>Circle Tool</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const objects = fabricCanvas.getObjects();
                          if (objects.length > 0) {
                            fabricCanvas.remove(...objects);
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between text-red-600 hover:text-red-700"
                    >
                      <div className="flex items-center space-x-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Clear Canvas</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.bringToFront();
                            });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <MoveUp className="w-4 h-4" />
                        <span>Bring to Front</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.sendToBack();
                            });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <MoveDown className="w-4 h-4" />
                        <span>Send to Back</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.set({ angle: 0 });
                            });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset Rotation</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            const firstObj = activeObjects[0];
                            const newObj = firstObj.clone();
                            newObj.set({
                              left: firstObj.left + 20,
                              top: firstObj.top + 20
                            });
                            fabricCanvas.add(newObj);
                            fabricCanvas.setActiveObject(newObj);
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.set({ opacity: obj.opacity === 0.5 ? 1 : 0.5 });
                            });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Toggle Opacity</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.set({ 
                                flipX: !obj.flipX 
                              });
                            });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>Flip Horizontal</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.set({ 
                                flipY: !obj.flipY 
                              });
                            });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>Flip Vertical</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.set({ 
                                scaleX: obj.scaleX * -1,
                                scaleY: obj.scaleY * -1
                              });
                            });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>Flip Both</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                
              </div>

          {/* Header Toolbar */}
          <div className="mb-4">
            <Card className="p-0 w-fit">
              <CardContent className="p-1">
                <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-0">
                  {/* Sidebar Toggle - Always visible */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                    className="h-8 w-8 p-0"
                    title="Toggle Sidebar"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Font Family */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ fontFamily: e.target.value });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ fontFamily: e.target.value });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="px-3 py-1 border rounded-md text-sm bg-white"
                      title="Font Family"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Calibri">Calibri</option>
                      <option value="Cambria">Cambria</option>
                      <option value="Comic Sans MS">Comic Sans MS</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Garamond">Garamond</option>
                      <option value="Impact">Impact</option>
                      <option value="Lucida Console">Lucida Console</option>
                      <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
                      <option value="Palatino">Palatino</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center space-x-1 bg-white rounded-md border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSize = Math.max(8, fontSize - 1);
                        setFontSize(newSize);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ fontSize: newSize });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ fontSize: newSize });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                      title="Decrease Font Size"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => {
                        const newSize = Math.max(8, Math.min(72, Number(e.target.value)));
                        setFontSize(newSize);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ fontSize: newSize });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ fontSize: newSize });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="w-12 text-center text-sm border-0 bg-transparent focus:outline-none"
                      title="Font Size"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSize = Math.min(72, fontSize + 1);
                        setFontSize(newSize);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ fontSize: newSize });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ fontSize: newSize });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                      title="Increase Font Size"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Text Color */}
                  <div className="flex items-center space-x-1">
                    <div className="relative group">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              obj.set({ fill: e.target.value });
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ fill: e.target.value });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                        className="w-8 h-8 rounded-lg cursor-pointer opacity-0 absolute z-10"
                      />
                      <div className="w-8 h-8 rounded-lg shadow-sm border border-gray-200 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300">
                        <div 
                          className="w-5 h-5 rounded-md shadow-inner border border-gray-300"
                          style={{ backgroundColor: textColor }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Formatting */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={isBold ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newBold = !isBold;
                        setIsBold(newBold);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ fontWeight: newBold ? 'bold' : 'normal' });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ fontWeight: newBold ? 'bold' : 'normal' });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isItalic ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newItalic = !isItalic;
                        setIsItalic(newItalic);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ fontStyle: newItalic ? 'italic' : 'normal' });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ fontStyle: newItalic ? 'italic' : 'normal' });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isUnderline ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newUnderline = !isUnderline;
                        setIsUnderline(newUnderline);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ underline: newUnderline });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ underline: newUnderline });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                      title="Underline"
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isStrikethrough ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newStrikethrough = !isStrikethrough;
                        setIsStrikethrough(newStrikethrough);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                obj.set({ linethrough: newStrikethrough });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                            selectedObject.set({ linethrough: newStrikethrough });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Text Alignment */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <select
                        value={textAlign}
                        onChange={(e) => {
                          setTextAlign(e.target.value);
                        if (fabricCanvas) {
                          const activeObjects = fabricCanvas.getActiveObjects();
                          if (activeObjects.length > 0) {
                            activeObjects.forEach((obj: any) => {
                              if (obj.type === 'text' || obj.type === 'textbox') {
                                  obj.set({ textAlign: e.target.value });
                              }
                            });
                            fabricCanvas.renderAll();
                          } else if (selectedObject) {
                              selectedObject.set({ textAlign: e.target.value });
                            fabricCanvas.renderAll();
                          }
                        }
                      }}
                        className="appearance-none px-3 py-1 border rounded-md text-sm bg-white pr-8 cursor-pointer"
                        title="Text Alignment"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {textAlign === 'left' && <AlignLeft className="w-4 h-4" />}
                        {textAlign === 'center' && <AlignCenter className="w-4 h-4" />}
                        {textAlign === 'right' && <AlignRight className="w-4 h-4" />}
                        {textAlign === 'justify' && <AlignJustify className="w-4 h-4" />}
                  </div>
                    </div>
                  </div>




                  {/* History Controls */}
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={undo}
                      className="h-8 w-8 p-0"
                      title="Undo"
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={redo}
                      className="h-8 w-8 p-0"
                      title="Redo"
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                    
                  </div>
                  <Button
                    onClick={exportToPDF}
                    className="px-4 py-2 items-center space-x-2"
                    title="Export to PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                  </Button>
                  
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Canvas - Fixed Size */}
          <div style={{ width: '800px', height: '1000px' }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={1000}
              className="border rounded-lg shadow-lg"
              style={{
                display: 'block',
                imageRendering: 'crisp-edges'
              }}
              onClick={(e) => {
                if (tool !== 'select' && fabricCanvas) {
                  const pointer = fabricCanvas.getPointer(e);
                  switch (tool) {
                    case 'text':
                      const text = new fabric.Textbox('New Text', {
                        left: pointer.x,
                        top: pointer.y,
                        fontSize: fontSize,
                        fontFamily: fontFamily,
                        fill: textColor,
                        fontWeight: fontWeight,
                        fontStyle: fontStyle,
                        textAlign: textAlign,
                        width: 200,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true
                      });
                      text.setControlsVisibility({
                        mt: false, // top
                        mb: false, // bottom
                        mtr: false, // rotate handle
                        tl: true,  // top-left
                        tr: true,  // top-right
                        bl: true,  // bottom-left
                        br: true   // bottom-right
                      });
                      text.set({
                        borderColor: '#3b82f6', // Primary blue color
                        cornerColor: '#ffffff', // White corner handles
                        cornerStrokeColor: '#999999', // Gray outline
                        cornerStyle: 'circle',
                        cornerSize: 12, // 12px corner handles
                        transparentCorners: false,
                        borderScaleFactor: 2 // 2px border
                      });
                      fabricCanvas.add(text);
                      fabricCanvas.setActiveObject(text);
                      break;
                    case 'rect':
                      const rect = new fabric.Rect({
                        left: pointer.x,
                        top: pointer.y,
                        width: 100,
                        height: 100,
                        fill: backgroundColor,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true
                      });
                      rect.setControlsVisibility({
                        mt: false, // top
                        mb: false, // bottom
                        mtr: false, // rotate handle
                        tl: true,  // top-left
                        tr: true,  // top-right
                        bl: true,  // bottom-left
                        br: true   // bottom-right
                      });
                      rect.set({
                        borderColor: '#3b82f6', // Primary blue color
                        cornerColor: '#ffffff', // White corner handles
                        cornerStrokeColor: '#999999', // Gray outline
                        cornerStyle: 'circle',
                        cornerSize: 12, // 12px corner handles
                        transparentCorners: false,
                        borderScaleFactor: 2 // 2px border
                      });
                      fabricCanvas.add(rect);
                      fabricCanvas.setActiveObject(rect);
                      break;
                    case 'circle':
                      const circle = new fabric.Circle({
                        left: pointer.x,
                        top: pointer.y,
                        radius: 50,
                        fill: backgroundColor,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        lockRotation: true,
                        lockUniScaling: true,
                        lockScalingFlip: true
                      });
                      circle.setControlsVisibility({
                        mt: false, // top
                        mb: false, // bottom
                        mtr: false, // rotate handle
                        tl: true,  // top-left
                        tr: true,  // top-right
                        bl: true,  // bottom-left
                        br: true   // bottom-right
                      });
                      circle.set({
                        borderColor: '#3b82f6', // Primary blue color
                        cornerColor: '#ffffff', // White corner handles
                        cornerStrokeColor: '#999999', // Gray outline
                        cornerStyle: 'circle',
                        cornerSize: 12, // 12px corner handles
                        transparentCorners: false,
                        borderScaleFactor: 2 // 2px border
                      });
                      fabricCanvas.add(circle);
                      fabricCanvas.setActiveObject(circle);
                      break;
                  }
                  fabricCanvas.renderAll();
                }
              }}
            />
          </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <FooterSection className="mt-auto" />
    </div>
  );
}
