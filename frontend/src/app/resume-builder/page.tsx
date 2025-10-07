'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, Save, Maximize2, Ruler, Trash2 } from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';
import ResumeBuilderSidebar from '@/components/resume-builder-sidebar';
import ResumeBuilderTopBar from '@/components/resume-builder-topbar';
import ResumeBuilderCanvas from '@/components/resume-builder-canvas';
import CanvasEditToolbar from '@/components/canvas-edit-toolbar';

export default function ResumeBuilderPage() {
  const [activeSidebarTab, setActiveSidebarTab] = useState('design');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(65);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('');
  const [canvasState, setCanvasState] = useState<string | null>(null);
  const isRestoringRef = useRef<boolean>(false);
  const lastRestoreAttemptRef = useRef<number>(0);
  
  // Calculate display dimensions based on zoom
  const canvasDimensions = {
    width: Math.round(800 * (zoomLevel / 100)),
    height: Math.round(1000 * (zoomLevel / 100))
  };
  const [exportFormat, setExportFormat] = useState('PNG');
  const [showEditToolbar, setShowEditToolbar] = useState(false);
  const [editToolbarPosition, setEditToolbarPosition] = useState({ x: 0, y: 0 });
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleCanvasReady = useCallback((canvas: any) => {
      setFabricCanvas(canvas);
      
      // Save initial empty canvas state
      setTimeout(() => {
        const initialState = JSON.stringify(canvas.toJSON());
        setCanvasState(initialState);
      }, 100);

      // Add event listeners for edit toolbar
      const handleSelectionChange = (e: any) => {
        const activeObject = canvas.getActiveObject();
        
        if (activeObject) {
          setSelectedObject(activeObject);
          setShowDeleteButton(true);
          
          // Calculate position for toolbar
          const canvasElement = canvas.getElement();
          const canvasOffset = canvasElement.getBoundingClientRect();
          const zoom = zoomLevel / 100;
          
          // Get object bounds
          const objBounds = activeObject.getBoundingRect();
          const x = canvasOffset.left + (objBounds.left + objBounds.width / 2) * zoom;
          const y = canvasOffset.top + objBounds.top * zoom;
          
          setEditToolbarPosition({ x, y });
          setShowEditToolbar(true);
        } else {
          setSelectedObject(null);
          setShowDeleteButton(false);
          setShowEditToolbar(false);
        }
      };

      const handleSelectionCleared = () => {
        setSelectedObject(null);
        setShowDeleteButton(false);
        setShowEditToolbar(false);
      };

      // Store handlers for cleanup
      canvas.selectionHandlers = {
        created: handleSelectionChange,
        updated: handleSelectionChange,
        cleared: handleSelectionCleared
      };

      // Add edit functionality to the initial canvas
      if (!canvas.hasEditFunctionality) {
        addEditFunctionality(canvas);
        canvas.hasEditFunctionality = true;
      }
  }, [zoomLevel]);

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

  // Function to save current canvas state
  const saveCanvasState = () => {
    if (fabricCanvas) {
      try {
        const state = JSON.stringify(fabricCanvas.toJSON());
        setCanvasState(state);
      } catch (error) {
        console.error('Error saving canvas state:', error);
      }
    }
  };

  // Function to restore canvas state
  const restoreCanvasState = () => {
    if (fabricCanvas && canvasState && !isRestoringRef.current) {
      // Add cooldown to prevent excessive restoration attempts
      const now = Date.now();
      if (now - lastRestoreAttemptRef.current < 1000) { // 1 second cooldown
        return;
      }
      lastRestoreAttemptRef.current = now;
      
      // Additional validation to ensure canvas is ready
      try {
        const canvasElement = fabricCanvas.getElement();
        if (!canvasElement || !canvasElement.getContext) {
          return;
        }
        
        const context = fabricCanvas.getContext();
        if (!context || context.isContextLost()) {
          return;
        }
      } catch (validationError) {
        return;
      }
      
      isRestoringRef.current = true;
      try {
        // Clean the state data before loading
        const cleanState = (jsonString: string) => {
          try {
            const data = JSON.parse(jsonString);
            if (data.objects && Array.isArray(data.objects)) {
              data.objects = data.objects.map((obj: any) => {
                if (obj.textBaseline === 'alphabetical') {
                  obj.textBaseline = 'alphabetic';
                }
                return obj;
              });
            }
            return JSON.stringify(data);
          } catch (e) {
            return jsonString; // Return original if parsing fails
          }
        };
        
        const cleanedState = cleanState(canvasState);
        
        // Use the canvas's restore method if available
        if (fabricCanvas.restoreFromState) {
          fabricCanvas.restoreFromState(cleanedState);
          isRestoringRef.current = false;
        } else {
          // Fallback to direct loadFromJSON
          fabricCanvas.loadFromJSON(cleanedState, () => {
            fabricCanvas.renderAll();
            isRestoringRef.current = false;
          });
        }
      } catch (error) {
        console.error('Error restoring canvas state:', error);
        isRestoringRef.current = false;
      }
    }
  };

  const handleZoomIn = () => {
    // Save state before zoom change
    saveCanvasState();
    const newZoom = Math.min(zoomLevel + 10, 200);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    // Save state before zoom change
    saveCanvasState();
    const newZoom = Math.max(zoomLevel - 10, 25);
    setZoomLevel(newZoom);
  };

  const handleFitToScreen = () => {
    // Save state before zoom change
    saveCanvasState();
    setZoomLevel(100);
  };

  const handleCloseEditToolbar = () => {
    setShowEditToolbar(false);
  };

  // Effect to restore canvas state when zoom changes and canvas is empty
  useEffect(() => {
    if (fabricCanvas && canvasState) {
      // Only restore if canvas is truly empty (not just the default empty state)
      const hasObjects = fabricCanvas.getObjects().length > 0;
      const isEmptyState = canvasState === '{"version":"5.3.0","objects":[],"background":"#ffffff"}' || 
                          canvasState === '{"version":"5.1.0","objects":[],"background":"#ffffff"}';
      
      if (!hasObjects && !isEmptyState) {
        // Restore state after a longer delay to ensure canvas is fully ready
        setTimeout(() => {
          // Double-check canvas is still available and ready
          if (fabricCanvas && fabricCanvas.getElement && fabricCanvas.getElement()) {
            restoreCanvasState();
          }
        }, 200);
      }
    }
  }, [zoomLevel, fabricCanvas, canvasState]);


  const handleDeleteSelected = () => {
    if (fabricCanvas && selectedObject) {
      fabricCanvas.remove(selectedObject);
      fabricCanvas.renderAll();
      setSelectedObject(null);
      setShowDeleteButton(false);
      setShowEditToolbar(false);
    }
  };

  // Function to clean template data for Fabric.js compatibility
  const cleanTemplateForFabric = (templateData: any) => {
    if (!templateData) {
      return templateData;
    }

    // Helper function to clean objects array
    const cleanObjectsArray = (objects: any[]) => {
      if (!Array.isArray(objects)) return objects;
      
      return objects.map((obj: any) => {
        const cleanObj = { ...obj };
        
        // Fix invalid textBaseline values
        if (cleanObj.textBaseline && cleanObj.textBaseline === 'alphabetical') {
          cleanObj.textBaseline = 'alphabetic';
        }
        
        // Fix other common issues
        if (cleanObj.textAlign && typeof cleanObj.textAlign === 'string') {
          const validAligns = ['left', 'center', 'right', 'justify', 'justify-left', 'justify-center', 'justify-right'];
          if (!validAligns.includes(cleanObj.textAlign)) {
            cleanObj.textAlign = 'left';
          }
        }
        
        return cleanObj;
      });
    };

    const cleanedData = { ...templateData };

    // Clean objects in various possible locations
    if (cleanedData.objects) {
      cleanedData.objects = cleanObjectsArray(cleanedData.objects);
    }
    
    if (cleanedData.canvasData) {
      if (cleanedData.canvasData.objects) {
        cleanedData.canvasData.objects = cleanObjectsArray(cleanedData.canvasData.objects);
      }
      if (cleanedData.canvasData.elements) {
        cleanedData.canvasData.elements = cleanObjectsArray(cleanedData.canvasData.elements);
      }
    }
    
    if (cleanedData.builderData) {
      if (cleanedData.builderData.elements) {
        cleanedData.builderData.elements = cleanObjectsArray(cleanedData.builderData.elements);
      }
      if (cleanedData.builderData.objects) {
        cleanedData.builderData.objects = cleanObjectsArray(cleanedData.builderData.objects);
      }
      if (cleanedData.builderData.canvas && cleanedData.builderData.canvas.objects) {
        cleanedData.builderData.canvas.objects = cleanObjectsArray(cleanedData.builderData.canvas.objects);
      }
      if (cleanedData.builderData.stage && cleanedData.builderData.stage.objects) {
        cleanedData.builderData.stage.objects = cleanObjectsArray(cleanedData.builderData.stage.objects);
      }
    }
    
    if (cleanedData.elements) {
      cleanedData.elements = cleanObjectsArray(cleanedData.elements);
    }

    return cleanedData;
  };

  // Function to add edit functionality to canvas
  const addEditFunctionality = (canvas: any) => {
    // Prevent duplicate event listeners
    if (canvas.hasEditListeners) {
      return;
    }
    
    // Cache fabric instance to avoid repeated loadFabric calls
    let fabricInstance: any = null;
    
    // Helper function to get fabric instance
    const getFabricInstance = async () => {
      if (!fabricInstance) {
        const { loadFabric } = await import('@/lib/fabric-loader');
        fabricInstance = await loadFabric();
      }
      return fabricInstance;
    };
    
    // Add double-click to edit text functionality
    canvas.on('mouse:dblclick', async (e: any) => {
      const obj = e.target;
      
      if (!obj || (obj.type !== 'textbox' && obj.type !== 'text')) {
        return;
      }

      // Prevent default behavior
      e.e.preventDefault();
      e.e.stopPropagation();

      // Enter text editing mode
      try {
        // Check if the object has enterEditing method
        if (typeof obj.enterEditing === 'function') {
          obj.enterEditing();
          obj.selectAll();
          canvas.renderAll();
        } else {
          // Get cached fabric instance
          const fabric = await getFabricInstance();
          
          if (!fabric) {
            return;
          }
          
          // Convert Text to Textbox for editing
          const textbox = new fabric.Textbox(obj.text, {
            left: obj.left,
            top: obj.top,
            width: obj.width || 200,
            fontSize: obj.fontSize || 16,
            fontFamily: obj.fontFamily || 'Arial',
            fill: obj.fill || '#000000',
            fontWeight: obj.fontWeight || 'normal',
            fontStyle: obj.fontStyle || 'normal',
            textAlign: obj.textAlign || 'left',
            lineHeight: obj.lineHeight || 1.2,
            charSpacing: obj.charSpacing || 0,
            underline: obj.underline || false,
            textBaseline: 'alphabetic',
            originX: obj.originX || 'left',
            originY: obj.originY || 'top'
          });
          
          // Remove the old object and add the new textbox
          canvas.remove(obj);
          canvas.add(textbox);
          canvas.setActiveObject(textbox);
          textbox.enterEditing();
          textbox.selectAll();
          canvas.renderAll();
        }
      } catch (error) {
        console.error('Error entering edit mode:', error);
      }
    });

    // Handle text editing events
    canvas.on('text:editing:entered', (e: any) => {
      const obj = e.target;
      if (obj) {
        // Add visual indicator for edit mode
        obj.set({
          borderColor: '#10b981',
          borderScaleFactor: 3,
          cornerColor: '#10b981',
          cornerStrokeColor: '#10b981'
        });
        canvas.renderAll();
      }
    });

    canvas.on('text:editing:exited', (e: any) => {
      const obj = e.target;
      if (obj) {
        // Restore normal border styling
        obj.set({
          borderColor: '#3b82f6',
          borderScaleFactor: 2,
          cornerColor: '#ffffff',
          cornerStrokeColor: '#999999'
        });
        canvas.renderAll();
      }
    });

    // Add hover effects for textbox objects
    let hoveredObject = null;
    let hoverOverlay = null;
    
    // Store hover variables on canvas for access in selection handlers
    canvas.hoveredObject = hoveredObject;
    canvas.hoverOverlay = hoverOverlay;
    
    canvas.on('mouse:over', async (e: any) => {
      const obj = e.target;
      
      // Don't show hover effects if any object is currently selected
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        return; // Exit early if any object is selected
      }
      
      if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
        // Only show hover effect if not in edit mode
        if (!obj.isEditing) {
          canvas.hoveredObject = obj;
          
          // Create a visual overlay rectangle
          const bounds = obj.getBoundingRect();
          const padding = 5;
          
          // Remove existing overlay
          if (canvas.hoverOverlay) {
            canvas.remove(canvas.hoverOverlay);
          }
          
          // Get cached fabric instance
          const fabric = await getFabricInstance();
          if (!fabric) return;
          
          canvas.hoverOverlay = new fabric.Rect({
            left: bounds.left - padding,
            top: bounds.top - padding,
            width: bounds.width + (padding * 2),
            height: bounds.height + (padding * 2),
            fill: 'transparent',
            stroke: '#10b981',
            strokeWidth: 3,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            absolutePositioned: true
          });
          
          canvas.add(canvas.hoverOverlay);
          canvas.sendToBack(canvas.hoverOverlay);
          canvas.renderAll();
        }
      }
    });

    canvas.on('mouse:out', (e: any) => {
      const obj = e.target;
      
      // Don't process hover effects if any object is currently selected
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        return; // Exit early if any object is selected
      }
      
      if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
        canvas.hoveredObject = null;
        
        // Hide overlay on mouse out
        if (!obj.isEditing) {
          
          // Remove overlay
          if (canvas.hoverOverlay) {
            canvas.remove(canvas.hoverOverlay);
            canvas.hoverOverlay = null;
            canvas.renderAll();
          }
        }
      }
    });

    // Also add mouse move event for better hover detection
    canvas.on('mouse:move', async (e: any) => {
      // Don't process hover effects if any object is currently selected
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        return; // Exit early if any object is selected
      }
      
      const pointer = canvas.getPointer(e.e);
      const obj = canvas.findTarget(e.e, false);
      
      if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
        if (canvas.hoveredObject !== obj) {
          // Mouse moved to a different object
          // Remove existing overlay
          if (canvas.hoverOverlay) {
            canvas.remove(canvas.hoverOverlay);
            canvas.hoverOverlay = null;
          }
          
          canvas.hoveredObject = obj;
          
          if (!obj.isEditing) {
            // Create new overlay for the new object
            const bounds = obj.getBoundingRect();
            const padding = 5;
            
            // Get cached fabric instance
            const fabric = await getFabricInstance();
            if (!fabric) return;
            
            canvas.hoverOverlay = new fabric.Rect({
              left: bounds.left - padding,
              top: bounds.top - padding,
              width: bounds.width + (padding * 2),
              height: bounds.height + (padding * 2),
              fill: 'transparent',
              stroke: '#10b981',
              strokeWidth: 3,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              absolutePositioned: true
            });
            
            canvas.add(canvas.hoverOverlay);
            canvas.sendToBack(canvas.hoverOverlay);
            canvas.renderAll();
          }
        }
      } else if (canvas.hoveredObject) {
        // Mouse moved away from text object
        if (!canvas.hoveredObject.isEditing) {
          // Remove overlay
          if (canvas.hoverOverlay) {
            canvas.remove(canvas.hoverOverlay);
            canvas.hoverOverlay = null;
            canvas.renderAll();
          }
        }
        canvas.hoveredObject = null;
      }
    });

    // Handle keyboard shortcuts for edit operations
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      // Handle Enter key to exit editing mode
      if (e.key === 'Enter' && activeObject.isEditing) {
        activeObject.exitEditing();
        canvas.renderAll();
        e.preventDefault();
      }

      // Handle Escape key to cancel editing
      if (e.key === 'Escape' && activeObject.isEditing) {
        activeObject.exitEditing();
        canvas.renderAll();
        e.preventDefault();
      }

      // Handle F2 key to enter editing mode
      if (e.key === 'F2' && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
        try {
          if (typeof activeObject.enterEditing === 'function') {
            activeObject.enterEditing();
            activeObject.selectAll();
            canvas.renderAll();
            e.preventDefault();
            } else {
              // Convert Text to Textbox for editing
              const fabric = await getFabricInstance();
              
              if (fabric) {
                const textbox = new fabric.Textbox(activeObject.text, {
                  left: activeObject.left,
                  top: activeObject.top,
                  width: activeObject.width || 200,
                  fontSize: activeObject.fontSize || 16,
                  fontFamily: activeObject.fontFamily || 'Arial',
                  fill: activeObject.fill || '#000000',
                  fontWeight: activeObject.fontWeight || 'normal',
                  fontStyle: activeObject.fontStyle || 'normal',
                  textAlign: activeObject.textAlign || 'left',
                  lineHeight: activeObject.lineHeight || 1.2,
                  charSpacing: activeObject.charSpacing || 0,
                  underline: activeObject.underline || false,
                  textBaseline: 'alphabetic',
                  originX: activeObject.originX || 'left',
                  originY: activeObject.originY || 'top'
                });
                
                canvas.remove(activeObject);
                canvas.add(textbox);
                canvas.setActiveObject(textbox);
                textbox.enterEditing();
                textbox.selectAll();
                canvas.renderAll();
              }
              e.preventDefault();
            }
        } catch (error) {
          console.error('Error entering edit mode with F2:', error);
        }
      }
    };

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    // Store the handler for cleanup
    canvas.keyboardHandler = handleKeyDown;
    
    // Add selection event listeners for delete button
    canvas.on('selection:created', (e: any) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setSelectedObject(activeObject);
        setShowDeleteButton(true);
        
        // Clear any hover effects when object is selected
        if (canvas.hoverOverlay) {
          canvas.remove(canvas.hoverOverlay);
          canvas.hoverOverlay = null;
        }
        
        // Calculate position relative to selected object - top right corner at 95% width
        const objBounds = activeObject.getBoundingRect();
        const canvasElement = canvas.getElement();
        const canvasOffset = canvasElement.getBoundingClientRect();
        const zoom = zoomLevel / 100;
        
        const x = canvasOffset.left + (objBounds.left + objBounds.width * 0.95) * zoom;
        const y = canvasOffset.top + (objBounds.top - 40) * zoom;
        
        setEditToolbarPosition({ x, y });
      } else {
        setSelectedObject(null);
        setShowDeleteButton(false);
      }
    });

    canvas.on('selection:updated', (e: any) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setSelectedObject(activeObject);
        setShowDeleteButton(true);
        
        // Calculate position relative to selected object - top right corner at 95% width
        const objBounds = activeObject.getBoundingRect();
        const canvasElement = canvas.getElement();
        const canvasOffset = canvasElement.getBoundingClientRect();
        const zoom = zoomLevel / 100;
        
        const x = canvasOffset.left + (objBounds.left + objBounds.width * 0.95) * zoom;
        const y = canvasOffset.top + (objBounds.top - 5) * zoom;
        
        setEditToolbarPosition({ x, y });
      } else {
        setSelectedObject(null);
        setShowDeleteButton(false);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setShowDeleteButton(false);
    });
    
    // Mark that edit listeners have been added
    canvas.hasEditListeners = true;

    // Add function to highlight all text objects
    canvas.highlightAllTextObjects = () => {
      canvas.forEachObject((obj: any) => {
        if (obj.type === 'textbox' || obj.type === 'text') {
          obj.set({
            borderColor: '#10b981',
            borderScaleFactor: 1.5,
            borderDashArray: [3, 3],
            cornerColor: '#10b981',
            cornerStrokeColor: '#10b981'
          });
        }
      });
      canvas.renderAll();
    };

    // Add function to clear all highlights
    canvas.clearAllHighlights = () => {
      canvas.forEachObject((obj: any) => {
        if (obj.type === 'textbox' || obj.type === 'text' && !obj.isEditing) {
          obj.set({
            borderColor: '#3b82f6',
            borderScaleFactor: 2,
            borderDashArray: null,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#999999'
          });
        }
      });
      canvas.renderAll();
    };
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
          
          // Clean the elementsToLoad array to fix any textBaseline issues
          if (elementsToLoad && Array.isArray(elementsToLoad)) {
            elementsToLoad = elementsToLoad.map((obj: any) => {
              const cleanObj = { ...obj };
              if (cleanObj.textBaseline && cleanObj.textBaseline === 'alphabetical') {
                cleanObj.textBaseline = 'alphabetic';
              }
              return cleanObj;
            });
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
                
                // Clean the template data before loading
                const cleanedTemplateData = cleanTemplateForFabric(templateData);
                
                // Create a new canvas instance at base dimensions
                const baseWidth = 800;
                const baseHeight = 1000;
                const currentZoom = zoomLevel / 100;
                
                const newCanvas = new fabric.Canvas(canvasElement, {
          width: baseWidth,
          height: baseHeight,
          backgroundColor: '#ffffff',
          selection: true,
                  preserveObjectStacking: true,
                });
                
                // Apply zoom (canvas always renders at 100% internally)
                newCanvas.setZoom(1);
                
                // Ensure initial render
                newCanvas.renderAll();
                
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
                
                // Re-add edit functionality to the new canvas
                if (!newCanvas.hasEditFunctionality) {
                  addEditFunctionality(newCanvas);
                  newCanvas.hasEditFunctionality = true;
                }
                
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
                      textBaseline: elementData.textBaseline === 'alphabetical' ? 'alphabetic' : 
                                   (elementData.textBaseline === 'alphabetic' ? 'alphabetic' : 'alphabetic'),
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
                    
                    // Ensure textBaseline is set correctly for all text objects
                    if (obj && (obj.type === 'text' || obj.type === 'textbox')) {
                      obj.set({ textBaseline: 'alphabetic' });
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
                
                // Save the initial canvas state after template is loaded
                setTimeout(() => {
                  const initialState = JSON.stringify(newCanvas.toJSON());
                  setCanvasState(initialState);
                }, 100);
                
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
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <ResumeBuilderCanvas 
              onCanvasReady={handleCanvasReady} 
              zoomLevel={zoomLevel} 
              onStateChange={setCanvasState}
            />
            
            {/* Delete Button - appears when object is selected */}
            {showDeleteButton && selectedObject && (
              <div 
                className="fixed z-50 cursor-pointer transition-colors"
                style={{
                  left: `${editToolbarPosition.x}px`,
                  top: `${editToolbarPosition.y}px`
                }}
                onClick={handleDeleteSelected}
                title="Delete Selected Element"
              >
                <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
              </div>
            )}
            
            
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
      
      {/* Edit Toolbar */}
      <CanvasEditToolbar
        fabricCanvas={fabricCanvas}
        isVisible={showEditToolbar}
        position={editToolbarPosition}
        onClose={handleCloseEditToolbar}
      />
    </div>
  );
}