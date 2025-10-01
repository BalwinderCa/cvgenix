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
  Sparkles
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
        console.log('✅ Canvas created:', canvas);

      // Add event listeners
      canvas.on('selection:created', (e: any) => {
        setSelectedObject(e.selected[0]);
        setSelectedElement(e.selected[0]?.id || null);
      });

      canvas.on('selection:updated', (e: any) => {
        setSelectedObject(e.selected[0]);
        setSelectedElement(e.selected[0]?.id || null);
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

      // Ensure crisp text rendering for all objects
      canvas.on('object:added', (e: any) => {
        const obj = e.target;
        if (obj && obj.type === 'text') {
          // Force crisp text rendering
          obj.set({
            fontFamily: obj.fontFamily || 'Arial',
            fontSize: obj.fontSize || 16,
            fontWeight: obj.fontWeight || 'normal'
          });
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

  // Legacy Konva logic removed - now using Fabric.js

  // Update header toolbar when element is selected
  React.useEffect(() => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        setFontFamily(element.fontFamily || 'Arial');
        setFontSize(element.fontSize || 16);
        setTextColor(element.fill || '#000000');
        setIsBold(element.fontWeight === 'bold');
        setIsItalic(element.fontStyle === 'italic');
        setIsUnderline(element.textDecoration === 'underline');
        setIsStrikethrough(element.textDecoration === 'line-through');
      }
    }
  }, [selectedElement, elements]);




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
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

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

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if clicking on empty stage area (not on any element)
    if (e.target === e.target.getStage()) {
      setSelectedElement(null);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, []);

  const handleElementClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const elementId = e.target.id();
    
    // If clicking on the same element, deselect it
    if (selectedElement === elementId) {
      setSelectedElement(null);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      // Select the new element
      setSelectedElement(elementId);
      
      // Attach transformer immediately
      if (transformerRef.current && stageRef.current) {
        const stage = stageRef.current;
        const selectedNode = stage.findOne(`#${elementId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    }
  }, [selectedElement]);

  const handleElementMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = 'pointer';
    }
  }, []);

  const handleElementMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const container = e.target.getStage()?.container();
    if (container) {
      container.style.cursor = 'default';
    }
  }, []);

  const handleElementDrag = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    const newElements = elements.map(el => 
      el.id === id ? { ...el, x: e.target.x(), y: e.target.y() } : el
    );
    setElements(newElements);
  }, [elements]);

  const handleElementTransform = useCallback((e: Konva.KonvaEventObject<Event>) => {
    const id = e.target.id();
    const node = e.target;
    
    // Reset scale to prevent accumulation
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    const newElements = elements.map(el => 
      el.id === id ? {
        ...el,
        x: node.x(),
        y: node.y(),
        width: Math.max(10, node.width() * scaleX), // Minimum width of 10
        height: Math.max(10, node.height() * scaleY), // Minimum height of 10
        rotation: node.rotation(),
        scaleX: 1, // Reset scale to prevent accumulation
        scaleY: 1  // Reset scale to prevent accumulation
      } : el
    );
    setElements(newElements);
    
    // Reset the node's scale to prevent accumulation
    node.scaleX(1);
    node.scaleY(1);
  }, [elements]);

  const handleElementTransformEnd = useCallback(() => {
    // Reset scale after transform to prevent accumulation
    if (transformerRef.current && selectedElement) {
      const stage = stageRef.current;
      if (stage) {
        const selectedNode = stage.findOne(`#${selectedElement}`);
        if (selectedNode) {
          selectedNode.scaleX(1);
          selectedNode.scaleY(1);
          transformerRef.current.forceUpdate();
        }
      }
    }
    saveToHistory(elements);
  }, [elements, saveToHistory, selectedElement]);


  const generateSampleResume = useCallback(() => {
    // This function is now empty - content will be loaded from database
    console.log('Sample resume generation disabled - loading from database instead');
  }, []);

  const exportToPDF = useCallback(async () => {
    if (!stageRef.current) return;
    
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
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
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = 'Resume.png';
      link.href = dataURL;
      link.click();
    }
  }, []);

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
      alert(`Failed to load template: ${error.message}`);
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
    if (!stageRef.current) return;
    
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
      const stage = stageRef.current;
      const thumbnail = stage.toDataURL({
        mimeType: 'image/png',
        quality: 0.8,
        pixelRatio: 1
      });

      // Prepare template data
      const templateData = {
        name: 'Current Canvas Template',
        description: 'Interactive resume template created with Konva editor',
        category: 'Modern',
        thumbnail: thumbnail,
        preview: thumbnail,
        canvasData: {
          elements: elements,
          stageConfig: {
            width: 800,
            height: 1000
          }
        },
        renderEngine: 'canvas',
        isActive: true,
        isPremium: false,
        isPopular: false,
        isNewTemplate: true,
        tags: ['interactive', 'konva', 'canvas'],
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
  }, [elements]);

  const saveCanvasToDatabase = useCallback(async () => {
    if (!stageRef.current) return;
    
    try {
      // Generate thumbnail from canvas
      const stage = stageRef.current;
      const thumbnail = stage.toDataURL({
        mimeType: 'image/png',
        quality: 0.8,
        pixelRatio: 1
      });

      // Prepare template data
      const templateData = {
        name: `Canvas Template ${new Date().toLocaleDateString()}`,
        description: 'Interactive resume template created with Konva editor',
        category: 'Modern',
        thumbnail: thumbnail,
        preview: thumbnail,
        canvasData: {
          elements: elements,
          stageConfig: {
            width: 800,
            height: 1000
          }
        },
        renderEngine: 'canvas',
        isActive: true,
        isPremium: false,
        isPopular: false,
        isNewTemplate: true,
        tags: ['interactive', 'konva', 'canvas'],
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
  }, [elements]);

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
        {/* Template Sidebar */}
        {showTemplateSidebar && (
          <TemplateSidebar
            currentTemplateId={currentTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
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
                  {/* Font Family */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        if (selectedElement) {
                          updateElement(selectedElement, { fontFamily: e.target.value });
                        }
                      }}
                      className="px-3 py-1 border rounded-md text-sm bg-white"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Verdana">Verdana</option>
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
                        if (selectedElement) {
                          updateElement(selectedElement, { fontSize: newSize });
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => {
                        const newSize = Math.max(8, Math.min(72, Number(e.target.value)));
                        setFontSize(newSize);
                        if (selectedElement) {
                          updateElement(selectedElement, { fontSize: newSize });
                        }
                      }}
                      className="w-12 text-center text-sm border-0 bg-transparent focus:outline-none"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSize = Math.min(72, fontSize + 1);
                        setFontSize(newSize);
                        if (selectedElement) {
                          updateElement(selectedElement, { fontSize: newSize });
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Text Color */}
                  <div className="flex items-center space-x-1">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        if (selectedElement) {
                          updateElement(selectedElement, { fill: e.target.value });
                        }
                      }}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                  </div>

                  {/* Text Formatting */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={isBold ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newBold = !isBold;
                        setIsBold(newBold);
                        if (selectedElement) {
                          updateElement(selectedElement, { fontWeight: newBold ? 'bold' : 'normal' });
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isItalic ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newItalic = !isItalic;
                        setIsItalic(newItalic);
                        if (selectedElement) {
                          updateElement(selectedElement, { fontStyle: newItalic ? 'italic' : 'normal' });
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isUnderline ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newUnderline = !isUnderline;
                        setIsUnderline(newUnderline);
                        if (selectedElement) {
                          updateElement(selectedElement, { textDecoration: newUnderline ? 'underline' : 'none' });
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={isStrikethrough ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newStrikethrough = !isStrikethrough;
                        setIsStrikethrough(newStrikethrough);
                        if (selectedElement) {
                          updateElement(selectedElement, { textDecoration: newStrikethrough ? 'line-through' : 'none' });
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Text Alignment */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={textAlign === 'left' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setTextAlign('left');
                        if (selectedElement) {
                          const element = elements.find(el => el.id === selectedElement);
                          if (element) {
                            updateElement(selectedElement, { x: 50 });
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={textAlign === 'center' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setTextAlign('center');
                        if (selectedElement) {
                          const element = elements.find(el => el.id === selectedElement);
                          if (element) {
                            updateElement(selectedElement, { x: 400 - (element.width || 0) / 2 });
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={textAlign === 'right' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setTextAlign('right');
                        if (selectedElement) {
                          const element = elements.find(el => el.id === selectedElement);
                          if (element) {
                            updateElement(selectedElement, { x: 750 - (element.width || 0) });
                          }
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={textAlign === 'justify' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTextAlign('justify')}
                      className="h-8 w-8 p-0"
                    >
                      <AlignJustify className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* List/Indent */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>



                  {/* History Controls */}
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="h-8 w-8 p-0"
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHistory([]);
                        setHistoryIndex(-1);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Clear History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    
                  </div>
                  <Button
                    onClick={exportToPDF}
                    className="px-4 py-2 items-center space-x-2"
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
