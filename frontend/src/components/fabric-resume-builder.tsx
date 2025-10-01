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

interface FabricResumeBuilderProps {
  templateId?: string;
  className?: string;
}

export default function FabricResumeBuilder({ templateId, className = '' }: FabricResumeBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [fabric, setFabric] = useState<any>(null);
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
  const [loading, setLoading] = useState(false);

  // Load Fabric.js
  useEffect(() => {
    const initFabric = async () => {
      const fabricInstance = await loadFabric();
      setFabric(fabricInstance);
    };
    initFabric();
  }, []);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && fabric && !fabricCanvas) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 1000,
        backgroundColor: '#ffffff',
        selection: true,
        interactive: true,
      });

      // Add event listeners
      canvas.on('selection:created', (e: any) => {
        setSelectedElement(e.selected[0]?.id || null);
      });

      canvas.on('selection:updated', (e: any) => {
        setSelectedElement(e.selected[0]?.id || null);
      });

      canvas.on('selection:cleared', () => {
        setSelectedElement(null);
      });

      canvas.on('object:added', () => {
        saveToHistory();
      });

      canvas.on('object:removed', () => {
        saveToHistory();
      });

      canvas.on('object:modified', () => {
        saveToHistory();
      });

      setFabricCanvas(canvas);
    }
  }, [fabric]);

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

  const saveToHistory = useCallback((newElements?: ResumeElement[]) => {
    if (fabricCanvas) {
      const canvasData = fabricCanvas.toJSON();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements || elements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [fabricCanvas, history, historyIndex, elements]);

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
    if (!fabricCanvas) return;

    let fabricObject: any;
    const id = `${type}_${Date.now()}`;

    switch (type) {
      case 'text':
        fabricObject = new fabric.Textbox('Click to edit', {
          id: id,
          left: 50,
          top: 50,
          width: 200,
          height: 30,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fill: textColor,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          textAlign: textAlign,
        });
        break;
      case 'rect':
        fabricObject = new fabric.Rect({
          id: id,
          left: 50,
          top: 50,
          width: 100,
          height: 100,
          fill: backgroundColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        break;
      case 'circle':
        fabricObject = new fabric.Circle({
          id: id,
          left: 50,
          top: 50,
          radius: 50,
          fill: backgroundColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        break;
    }

    if (fabricObject) {
      fabricCanvas.add(fabricObject);
      fabricCanvas.setActiveObject(fabricObject);
      fabricCanvas.renderAll();
      saveToHistory();
    }
  }, [fabricCanvas, fontSize, fontFamily, textColor, fontWeight, fontStyle, textAlign, backgroundColor, strokeColor, strokeWidth, saveToHistory]);

  const updateElement = useCallback((id: string, updates: Partial<ResumeElement>) => {
    if (!fabricCanvas) return;
    
    const object = fabricCanvas.getObjects().find((obj: any) => obj.id === id);
    if (object) {
      object.set(updates);
      fabricCanvas.renderAll();
      saveToHistory();
    }
  }, [fabricCanvas, saveToHistory]);

  const deleteElement = useCallback((id: string) => {
    if (!fabricCanvas) return;
    
    const object = fabricCanvas.getObjects().find((obj: any) => obj.id === id);
    if (object) {
      fabricCanvas.remove(object);
      fabricCanvas.renderAll();
      setSelectedElement(null);
      saveToHistory();
    }
  }, [fabricCanvas, saveToHistory]);

  const exportToPDF = useCallback(async () => {
    if (!fabricCanvas) return;
    
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
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
      });
      
      const link = document.createElement('a');
      link.download = 'Resume.png';
      link.href = dataURL;
      link.click();
    }
  }, [fabricCanvas]);

  const duplicateElement = useCallback(() => {
    if (!selectedElement || !fabricCanvas) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) return;
    
    // Clone the object
    activeObject.clone((cloned: any) => {
      // Offset the cloned object
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        id: `${cloned.type}_${Date.now()}`,
      });
      
      // Add to canvas and select it
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
      saveToHistory();
    });
  }, [fabricCanvas, selectedElement, saveToHistory]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    deleteElement(selectedElement);
  }, [selectedElement, deleteElement]);

  const bringToFront = useCallback(() => {
    if (!fabricCanvas || !selectedElement) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.bringToFront(activeObject);
      fabricCanvas.renderAll();
      saveToHistory();
    }
  }, [fabricCanvas, selectedElement, saveToHistory]);

  const sendToBack = useCallback(() => {
    if (!fabricCanvas || !selectedElement) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.sendToBack(activeObject);
      fabricCanvas.renderAll();
      saveToHistory();
    }
  }, [fabricCanvas, selectedElement, saveToHistory]);

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
    if (!fabricCanvas) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (response.ok) {
        const template = await response.json();
        
        if (template.renderEngine === 'canvas' && template.canvasData) {
          // Check if it's Fabric.js format (objects) or Konva.js format (elements)
          if (template.canvasData.objects) {
            // Fabric.js format - load directly
            fabricCanvas.loadFromJSON(template.canvasData, () => {
              fabricCanvas.renderAll();
              setCurrentTemplate(templateId);
              saveToHistory();
            });
          } else if (template.canvasData.elements) {
            // Konva.js format - convert to Fabric objects
            const fabricObjects = convertKonvaToFabric(template.canvasData.elements);
            fabricCanvas.clear();
            fabricObjects.forEach(obj => fabricCanvas.add(obj));
            fabricCanvas.renderAll();
            setCurrentTemplate(templateId);
            saveToHistory();
          } else {
            alert('This template is not compatible with the canvas editor. Please select a canvas template.');
          }
        } else {
          alert('This template is not compatible with the canvas editor. Please select a canvas template.');
        }
      } else {
        throw new Error('Failed to load template');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [fabricCanvas, saveToHistory]);

  // Convert Konva elements to Fabric objects
  const convertKonvaToFabric = useCallback((konvaElements: any[]) => {
    const fabricObjects: any[] = [];
    
    konvaElements.forEach((element: any) => {
      let fabricObject: any;
      
      switch (element.type) {
        case 'text':
          fabricObject = new fabric.Textbox(element.text || 'Text', {
            id: element.id,
            left: element.x,
            top: element.y,
            width: element.width || 200,
            fontSize: element.fontSize || 16,
            fontFamily: element.fontFamily || 'Arial',
            fontWeight: element.fontWeight || 'normal',
            fontStyle: element.fontStyle || 'normal',
            fill: element.fill || '#000000',
            textAlign: element.textAlign || 'left',
            lineHeight: element.lineHeight || 1,
            charSpacing: element.charSpacing || 0,
            textDecoration: element.textDecoration || 'none',
          });
          break;
          
        case 'rect':
          fabricObject = new fabric.Rect({
            id: element.id,
            left: element.x,
            top: element.y,
            width: element.width || 100,
            height: element.height || 100,
            fill: element.fill || '#ffffff',
            stroke: element.stroke || '#000000',
            strokeWidth: element.strokeWidth || 1,
          });
          break;
          
        case 'circle':
          fabricObject = new fabric.Circle({
            id: element.id,
            left: element.x,
            top: element.y,
            radius: (element.width || 50) / 2,
            fill: element.fill || '#ffffff',
            stroke: element.stroke || '#000000',
            strokeWidth: element.strokeWidth || 1,
          });
          break;
          
        default:
          console.warn('Unsupported element type:', element.type);
          return;
      }
      
      // Apply transformations
      if (element.rotation) {
        fabricObject.set('angle', element.rotation);
      }
      if (element.scaleX !== undefined) {
        fabricObject.set('scaleX', element.scaleX);
      }
      if (element.scaleY !== undefined) {
        fabricObject.set('scaleY', element.scaleY);
      }
      
      fabricObjects.push(fabricObject);
    });
    
    return fabricObjects;
  }, []);

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

  // Show initial selection screen
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
                              updateElement(selectedElement, { textAlign: 'left' });
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
                              updateElement(selectedElement, { textAlign: 'center' });
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
                              updateElement(selectedElement, { textAlign: 'right' });
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <AlignRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={textAlign === 'justify' ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            setTextAlign('justify');
                            if (selectedElement) {
                              updateElement(selectedElement, { textAlign: 'justify' });
                            }
                          }}
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
                          onClick={deleteSelectedElement}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete Selected"
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
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg shadow-lg"
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