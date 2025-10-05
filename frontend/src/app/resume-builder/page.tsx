'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, ZoomIn, ZoomOut, Save, Maximize2, Ruler } from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';
import ResumeBuilderSidebar from '@/components/resume-builder-sidebar';
import ResumeBuilderTopBar from '@/components/resume-builder-topbar';
import ResumeBuilderCanvas from '@/components/resume-builder-canvas';

export default function ResumeBuilderPage() {
  const [activeSidebarTab, setActiveSidebarTab] = useState('design');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('');
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 1000 });
  const [exportFormat, setExportFormat] = useState('PNG');

  const handleCanvasReady = useCallback((canvas: any) => {
      setFabricCanvas(canvas);
      // Update canvas dimensions when canvas is ready
      const width = canvas.getWidth();
      const height = canvas.getHeight();
      setCanvasDimensions({ width, height });
  }, []);

  const handleSave = () => {
    if (fabricCanvas) {
      const data = fabricCanvas.toJSON();
      console.log('Saving canvas data:', data);
      // Implement save logic here
    }
  };

  const handleDownload = () => {
    if (fabricCanvas) {
      const format = exportFormat.toLowerCase();
      const dataURL = fabricCanvas.toDataURL({
        format: format,
        quality: format === 'jpg' ? 0.9 : 1,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.download = `resume.${format}`;
      link.href = dataURL;
      link.click();
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 200);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 25);
    setZoomLevel(newZoom);
  };

  const handleFitToScreen = () => {
    setZoomLevel(100);
  };


  const handleTemplateSelect = async (templateId: string) => {
    setCurrentTemplateId(templateId);
    
    if (fabricCanvas) {
      try {
        // Load template data from API
      const response = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (response.ok) {
          const templateData = await response.json();
          
          // Check for different possible data structures
          let elementsToLoad = null;
          
          if (templateData.canvasData && templateData.canvasData.objects) {
            elementsToLoad = templateData.canvasData.objects;
          } else if (templateData.canvasData && templateData.canvasData.elements) {
            elementsToLoad = templateData.canvasData.elements;
          } else if (templateData.builderData) {
            // Check various possible locations in builderData
            if (templateData.builderData.elements) {
              elementsToLoad = templateData.builderData.elements;
            } else if (templateData.builderData.objects) {
              elementsToLoad = templateData.builderData.objects;
            } else if (templateData.builderData.canvas && templateData.builderData.canvas.objects) {
              elementsToLoad = templateData.builderData.canvas.objects;
            } else if (templateData.builderData.stage && templateData.builderData.stage.objects) {
              elementsToLoad = templateData.builderData.stage.objects;
        } else {
              // Try to find any array that might contain objects
              for (const key in templateData.builderData) {
                const value = templateData.builderData[key];
                if (Array.isArray(value) && value.length > 0 && value[0].type) {
                  elementsToLoad = value;
                  break;
                }
              }
            }
          } else if (templateData.elements) {
            elementsToLoad = templateData.elements;
          }
          
          if (elementsToLoad && elementsToLoad.length > 0) {
            // Create a completely new canvas instance to avoid context corruption
            const { loadFabric } = await import('@/lib/fabric-loader');
            const fabric = await loadFabric();
            
            if (fabric) {
              try {
                // Get the current canvas element
                const canvasElement = fabricCanvas.getElement();
                
                // Dispose of the old canvas to clean up
                fabricCanvas.dispose();
                
                // Create a new canvas instance
                const newCanvas = new fabric.Canvas(canvasElement, {
          width: 800,
          height: 1000,
          backgroundColor: '#ffffff',
          selection: true,
                  preserveObjectStacking: true,
                });
                
                // Configure canvas controls
        fabric.Object.prototype.set({
                  borderColor: '#3b82f6',
          cornerColor: '#ffffff',
          cornerStrokeColor: '#999999',
              cornerStyle: 'circle',
                  cornerSize: 12,
              transparentCorners: false,
                  borderScaleFactor: 2,
                  lockRotation: true, // Disable rotation
                  hasRotatingPoint: false, // Remove rotation handle
                  originX: 'left', // Keep text anchored to left
                  originY: 'top', // Keep text anchored to top
                });

                // Set control visibility for all objects
                fabric.Object.prototype.setControlsVisibility({
                  mt: false, mb: false, mtr: false, // Hide rotation handle
                  ml: true, mr: true, // Keep middle left and right handles
                  tl: true, tr: true, bl: true, br: true
                });
                
                // Initialize undo/redo system for new canvas
                newCanvas.history = [];
                newCanvas.historyIndex = -1;
                
                const saveState = () => {
                  const state = JSON.stringify(newCanvas.toJSON());
                  newCanvas.history = newCanvas.history.slice(0, newCanvas.historyIndex + 1);
                  newCanvas.history.push(state);
                  newCanvas.historyIndex++;
                  
                  if (newCanvas.history.length > 20) {
                    newCanvas.history.shift();
                    newCanvas.historyIndex--;
                  }
                };

                const undo = () => {
                  if (newCanvas.historyIndex > 0) {
                    newCanvas.historyIndex--;
                    const state = newCanvas.history[newCanvas.historyIndex];
                    newCanvas.loadFromJSON(state, () => {
                      newCanvas.renderAll();
                    });
                  }
                };

                const redo = () => {
                  if (newCanvas.historyIndex < newCanvas.history.length - 1) {
                    newCanvas.historyIndex++;
                    const state = newCanvas.history[newCanvas.historyIndex];
                    newCanvas.loadFromJSON(state, () => {
                      newCanvas.renderAll();
                    });
                  }
                };

                newCanvas.saveState = saveState;
                newCanvas.undo = undo;
                newCanvas.redo = redo;

                // Enable undo/redo
                newCanvas.on('object:added', saveState);
                newCanvas.on('object:removed', saveState);
                newCanvas.on('object:modified', saveState);

                // Disable scaling for text objects and use custom resize
                newCanvas.on('object:scaling', (e: any) => {
                  const obj = e.target;
                  if (!obj || (obj.type !== 'textbox' && obj.type !== 'text')) return;

                  // Prevent default scaling behavior
                  e.e.preventDefault();
                  e.e.stopPropagation();

                  // Get the current dimensions
                  const currentWidth = obj.width;
                  const currentHeight = obj.height;

                  // Calculate new dimensions based on scale
                  const newWidth = currentWidth * obj.scaleX;
                  const newHeight = currentHeight * obj.scaleY;

                  // Apply new size without changing position
                  obj.set({
                    width: newWidth,
                    height: newHeight,
      scaleX: 1,
                    scaleY: 1
                  });

                  // Update control coordinates
                  obj.setCoords();
                  newCanvas.renderAll();
                });
                
                // Create elements manually from template data
                for (const elementData of elementsToLoad) {
                  try {
                    let obj = null;
                    
                    // Clean the element data - remove unsupported properties
                    const cleanData = {
                      left: elementData.left || 0,
                      top: elementData.top || 0,
                      fontSize: elementData.fontSize || 12,
                      fontFamily: elementData.fontFamily || 'Arial',
                      fill: elementData.fill || '#000000',
                      fontWeight: elementData.fontWeight || 'normal',
                      fontStyle: elementData.fontStyle || 'normal',
                      textAlign: elementData.textAlign || 'left',
                      width: elementData.width || 200,
                      height: elementData.height || 50,
                      originX: 'left', // Keep text anchored to left
                      originY: 'top' // Keep text anchored to top
                    };
                    
                    if (elementData.type === 'textbox' && elementData.text) {
                      obj = new fabric.Textbox(elementData.text, cleanData);
                    } else if (elementData.type === 'text' && elementData.text) {
                      obj = new fabric.Text(elementData.text, cleanData);
                    }
                    
                    if (obj) {
                      // Apply control visibility settings to template objects
                      obj.setControlsVisibility({
                        mt: false, mb: false, mtr: false, // Hide rotation handle
                        ml: true, mr: true, // Keep middle left and right handles
                        tl: true, tr: true, bl: true, br: true
                      });
                      newCanvas.add(obj);
                    }
                  } catch (elementError) {
                    console.error('Error creating element:', elementError);
                  }
                }
                
                // Render and save state
                newCanvas.renderAll();
                if (newCanvas.saveState) {
                  newCanvas.saveState();
                }
                
                // Update the fabricCanvas reference
                setFabricCanvas(newCanvas);
                
      } catch (error) {
                console.error('Error loading template:', error);
              }
            }
            }
      }
    } catch (error) {
        console.error('Error loading template:', error);
      }
    }
  };


    return (
    <div className="h-screen bg-gray-50 flex flex-col">
        <NavigationHeader />
      
      <div className="flex-1 flex overflow-hidden mt-16">
        {/* Sidebar */}
        {showLeftSidebar && (
          <div className="w-96 bg-white border-r border-gray-200 flex-shrink-0">
            <ResumeBuilderSidebar
              fabricCanvas={fabricCanvas}
              activeSidebarTab={activeSidebarTab}
              setActiveSidebarTab={setActiveSidebarTab}
              currentTemplateId={currentTemplateId}
                  onTemplateSelect={handleTemplateSelect}
            />
                </div>
              )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex-shrink-0">
            <ResumeBuilderTopBar
              fabricCanvas={fabricCanvas}
              onSave={handleSave}
            />
                      </div>
          
          {/* Canvas Area with Scroll */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Canvas Content */}
            <div className="flex-1 overflow-auto">
              <div className="pb-4">
                <ResumeBuilderCanvas onCanvasReady={handleCanvasReady} zoomLevel={zoomLevel} />
                      </div>
                      </div>
            
            {/* Fixed Footer with Controls */}
            <div className="flex-shrink-0 h-12 bg-white border-t border-gray-200 flex items-center justify-between px-4">
              {/* Left Side - Canvas Info */}
              <div className="flex items-center space-x-4">
                {/* Canvas Size Indicator */}
                <div className="flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {canvasDimensions.width} × {canvasDimensions.height}px
                  </span>
                </div>
                
                {/* Save Button */}
                <button 
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                  title="Save Resume"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>

              {/* Right Side - Canvas Controls */}
              <div className="flex items-center space-x-2">
                {/* Fit to Screen */}
                    <button 
                  onClick={handleFitToScreen}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Fit to Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                    </button>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-1 bg-gray-50 border border-gray-200 rounded-md">
                    <button 
                    onClick={handleZoomOut}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-md transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                    </button>
                  <div className="px-3 py-2 text-sm font-medium text-gray-700 border-x border-gray-200">
                    {zoomLevel}%
                      </div>
                    <button 
                    onClick={handleZoomIn}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-md transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                    </button>
                      </div>

                {/* Export Format Dropdown */}
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  title="Export Format"
                >
                  <option value="PNG">PNG</option>
                  <option value="PDF">PDF</option>
                  <option value="JPG">JPG</option>
                </select>

                {/* Export Button */}
                <button 
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 border border-primary rounded-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                      </div>
                      </div>
                      </div>
                      </div>
                      </div>
    </div>
  );
}