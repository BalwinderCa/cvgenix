'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer } from 'react-konva';
import Konva from 'konva';
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
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer to selected element
  React.useEffect(() => {
    if (selectedElement && transformerRef.current && stageRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedElement}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (!selectedElement && transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElement]);

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


  // Load templates from database on component mount
  React.useEffect(() => {
    loadTemplatesFromDatabase();
  }, []);

  const saveToHistory = useCallback((newElements: ResumeElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

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
    try {
      const response = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (response.ok) {
        const template = await response.json();
        
        if (template.renderEngine === 'canvas' && template.canvasData) {
          // Check if it's Fabric.js format (objects) or Konva.js format (elements)
          if (template.canvasData.objects) {
            // Fabric.js format - convert to Konva format for the resume builder
            const konvaElements = template.canvasData.objects.map((obj: any) => ({
              id: obj.id,
              type: obj.type === 'textbox' ? 'text' : obj.type,
              x: obj.left,
              y: obj.top,
              width: obj.width,
              height: obj.height,
              text: obj.text,
              fontSize: obj.fontSize,
              fontFamily: obj.fontFamily,
              fontWeight: obj.fontWeight,
              fontStyle: obj.fontStyle,
              fill: obj.fill,
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth,
              rotation: obj.angle,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              draggable: true,
              lineHeight: obj.lineHeight,
              textAlign: obj.textAlign,
              charSpacing: obj.charSpacing
            }));
            setElements(konvaElements);
            setCurrentTemplate(templateId);
            saveToHistory(konvaElements);
          } else if (template.canvasData.elements) {
            // Konva.js format - use directly
            setElements(template.canvasData.elements);
            setCurrentTemplate(templateId);
            saveToHistory(template.canvasData.elements);
          } else {
            alert('This template is not compatible with the canvas editor. Please select a canvas template.');
          }
        } else {
          // For non-canvas templates, show a message
          alert('This template is not compatible with the canvas editor. Please select a canvas template.');
        }
      } else {
        throw new Error('Failed to load template');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template');
    }
  }, [saveToHistory]);

  const loadTemplatesFromDatabase = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/templates');
      if (response.ok) {
        const data = await response.json();
        const templates = data.templates || [];
        
        // Find a canvas template or create a default one
        const canvasTemplate = templates.find((t: any) => t.renderEngine === 'canvas' && t.canvasData);
        
        if (canvasTemplate && canvasTemplate.canvasData && canvasTemplate.canvasData.elements) {
          // Load template from database
          setElements(canvasTemplate.canvasData.elements);
          setCurrentTemplate(canvasTemplate._id);
          saveToHistory(canvasTemplate.canvasData.elements);
        } else {
          // Show empty canvas when no template is selected
          setElements([]);
          setCurrentTemplate('');
          saveToHistory([]);
        }
      } else {
        // Show empty canvas if API fails
        setElements([]);
        setCurrentTemplate('');
        saveToHistory([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Show empty canvas on error
      setElements([]);
      setCurrentTemplate('');
      saveToHistory([]);
    }
  }, [saveToHistory]);

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

          {/* Canvas - Fit Content */}
          <div className="w-fit">
            <Stage
              ref={stageRef}
              width={800}
              height={1000}
              className="border rounded-lg shadow-lg"
              onClick={(e) => {
                // Only deselect if clicking on the stage background, not on elements
                if (e.target === e.target.getStage()) {
                  setSelectedElement(null);
                  if (transformerRef.current) {
                    transformerRef.current.nodes([]);
                    transformerRef.current.getLayer()?.batchDraw();
                  }
                }
              }}
              onMouseDown={(e) => {
                if (tool !== 'select') {
                  const pos = e.target.getStage()?.getPointerPosition();
                  if (pos) {
                    addElement(tool);
                  }
                }
              }}
            >
                    <Layer>
                      {/* Background */}
                      <Rect
                        x={0}
                        y={0}
                        width={800}
                        height={1000}
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth={1}
                      />
                      
                      {/* Elements */}
                      {elements.map((element) => {
                        const isSelected = selectedElement === element.id;
                        
                        if (element.type === 'text') {
                          return (
                            <Group key={element.id}>
                              <Text
                                id={element.id}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                text={element.text || ''}
                                fontSize={element.fontSize}
                                fontFamily={element.fontFamily}
                                fontStyle={element.fontStyle}
                                fontWeight={element.fontWeight}
                                textDecoration={element.textDecoration}
                                fill={element.fill}
                                draggable={element.draggable}
                                lineHeight={element.lineHeight}
                                align={element.textAlign}
                                letterSpacing={element.charSpacing}
                                onClick={handleElementClick}
                                onMouseEnter={handleElementMouseEnter}
                                onMouseLeave={handleElementMouseLeave}
                                onDragMove={handleElementDrag}
                                onTransform={handleElementTransform}
                                onTransformEnd={handleElementTransformEnd}
                              />
                              {isSelected && (
                                <Transformer
                                  ref={transformerRef}
                                  boundBoxFunc={(oldBox, newBox) => {
                                    // Prevent elements from becoming too small
                                    if (newBox.width < 20 || newBox.height < 10) {
                                      return oldBox;
                                    }
                                    // Prevent elements from becoming too large
                                    if (newBox.width > 800 || newBox.height > 200) {
                                      return oldBox;
                                    }
                                    return newBox;
                                  }}
                                  enabledAnchors={[ 'top-center', 'middle-right', 'bottom-center', 'middle-left']}
                                  borderStroke="rgb(14, 181, 129)"
                                  borderStrokeWidth={2}
                                  anchorStroke="#ffffff"
                                  anchorFill="rgb(14, 181, 129)"
                                  anchorStrokeWidth={5}
                                  anchorSize={11}
                                  anchorCornerRadius={2}
                                  keepRatio={false}
                                  rotateEnabled={false}
                                  flipEnabled={false}
                                  centeredScaling={false}
                                  ignoreStroke={true}
                                  useSingleNodeRotation={true}
                                  shouldOverdrawWholeArea={false}
                                />
                              )}
                            </Group>
                          );
                        }
                        
                        if (element.type === 'rect') {
                          return (
                            <Group key={element.id}>
                              <Rect
                                id={element.id}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                fill={element.fill}
                                stroke={element.stroke}
                                strokeWidth={element.strokeWidth}
                                draggable={element.draggable}
                                onClick={handleElementClick}
                                onMouseEnter={handleElementMouseEnter}
                                onMouseLeave={handleElementMouseLeave}
                                onDragMove={handleElementDrag}
                                onTransform={handleElementTransform}
                                onTransformEnd={handleElementTransformEnd}
                              />
                              {isSelected && (
                                <Transformer
                                  ref={transformerRef}
                                  boundBoxFunc={(oldBox, newBox) => {
                                    // Prevent elements from becoming too small
                                    if (newBox.width < 20 || newBox.height < 10) {
                                      return oldBox;
                                    }
                                    // Prevent elements from becoming too large
                                    if (newBox.width > 800 || newBox.height > 200) {
                                      return oldBox;
                                    }
                                    return newBox;
                                  }}
                                  enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']}
                                  borderStroke="#3b82f6"
                                  borderStrokeWidth={2}
                                  anchorStroke="#ffffff"
                                  anchorFill="#3b82f6"
                                  anchorStrokeWidth={1}
                                  anchorSize={24}
                                  anchorCornerRadius={1}
                                  keepRatio={false}
                                  rotateEnabled={false}
                                  flipEnabled={false}
                                  centeredScaling={false}
                                  ignoreStroke={true}
                                  useSingleNodeRotation={true}
                                  shouldOverdrawWholeArea={false}
                                />
                              )}
                            </Group>
                          );
                        }
                        
                        if (element.type === 'circle') {
                          return (
                            <Group key={element.id}>
                              <Rect
                                id={element.id}
                                x={element.x}
                                y={element.y}
                                width={element.width}
                                height={element.height}
                                cornerRadius={Math.min(element.width || 0, element.height || 0) / 2}
                                fill={element.fill}
                                stroke={element.stroke}
                                strokeWidth={element.strokeWidth}
                                draggable={element.draggable}
                                onClick={handleElementClick}
                                onMouseEnter={handleElementMouseEnter}
                                onMouseLeave={handleElementMouseLeave}
                                onDragMove={handleElementDrag}
                                onTransform={handleElementTransform}
                                onTransformEnd={handleElementTransformEnd}
                              />
                              {isSelected && (
                                <Transformer
                                  ref={transformerRef}
                                  boundBoxFunc={(oldBox, newBox) => {
                                    // Prevent elements from becoming too small
                                    if (newBox.width < 20 || newBox.height < 10) {
                                      return oldBox;
                                    }
                                    // Prevent elements from becoming too large
                                    if (newBox.width > 800 || newBox.height > 200) {
                                      return oldBox;
                                    }
                                    return newBox;
                                  }}
                                  enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']}
                                  borderStroke="#3b82f6"
                                  borderStrokeWidth={2}
                                  anchorStroke="#ffffff"
                                  anchorFill="#3b82f6"
                                  anchorStrokeWidth={1}
                                  anchorSize={24}
                                  anchorCornerRadius={1}
                                  keepRatio={false}
                                  rotateEnabled={false}
                                  flipEnabled={false}
                                  centeredScaling={false}
                                  ignoreStroke={true}
                                  useSingleNodeRotation={true}
                                  shouldOverdrawWholeArea={false}
                                />
                              )}
                            </Group>
                          );
                        }
                        
                        return null;
                      })}
                    </Layer>
            </Stage>
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
