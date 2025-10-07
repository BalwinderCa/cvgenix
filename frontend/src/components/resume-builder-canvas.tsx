'use client';

import { useEffect, useRef } from 'react';
import { loadFabric } from '@/lib/fabric-loader';

interface ResumeBuilderCanvasProps {
  onCanvasReady: (canvas: any) => void;
  zoomLevel: number;
}

export default function ResumeBuilderCanvas({ onCanvasReady, zoomLevel }: ResumeBuilderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);

  // Apply zoom to existing canvas when zoomLevel changes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      try {
        const canvas = fabricCanvasRef.current;
        
        // Canvas always renders at 100% internally, CSS transform handles visual scaling
        canvas.setZoom(1);
        
        // Force a complete re-render to ensure content is visible
        canvas.renderAll();
        
        // Additional render after a small delay to ensure content appears
        setTimeout(() => {
          canvas.renderAll();
        }, 10);
      } catch (error) {
        console.error('Error applying zoom:', error);
      }
    }
  }, [zoomLevel]);

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current && !fabricCanvasRef.current) {
        try {
          const fabric = await loadFabric();
          
          if (!fabric) {
            console.error('Fabric.js not available');
            return;
          }
          
          const baseWidth = 800;
          const baseHeight = 1000;
          
          const canvas = new fabric.Canvas(canvasRef.current, {
            width: baseWidth,
            height: baseHeight,
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true,
            allowTouchScrolling: true,
            fireRightClick: true,
            stopContextMenu: false,
          });

          // Apply initial zoom (canvas always renders at 100% internally)
          canvas.setZoom(1);
          
          // Ensure initial render
          canvas.renderAll();

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

          // Initialize undo/redo system
          canvas.history = [];
          canvas.historyIndex = -1;
          
          const saveState = () => {
            const state = JSON.stringify(canvas.toJSON());
            canvas.history = canvas.history.slice(0, canvas.historyIndex + 1);
            canvas.history.push(state);
            canvas.historyIndex++;
            
            // Limit history to 20 states
            if (canvas.history.length > 20) {
              canvas.history.shift();
              canvas.historyIndex--;
            }
          };

          const undo = () => {
            if (canvas.historyIndex > 0) {
              canvas.historyIndex--;
              const state = canvas.history[canvas.historyIndex];
              canvas.loadFromJSON(state, () => {
                canvas.renderAll();
              });
            }
          };

          const redo = () => {
            if (canvas.historyIndex < canvas.history.length - 1) {
              canvas.historyIndex++;
              const state = canvas.history[canvas.historyIndex];
              canvas.loadFromJSON(state, () => {
                canvas.renderAll();
              });
            }
          };

          // Add methods to canvas
          canvas.saveState = saveState;
          canvas.undo = undo;
          canvas.redo = redo;

          // Enable undo/redo
          canvas.on('object:added', saveState);
          canvas.on('object:removed', saveState);
          canvas.on('object:modified', saveState);

          // Disable scaling for text objects and use custom resize
          canvas.on('object:scaling', (e: any) => {
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
            canvas.renderAll();
          });

          // Add double-click to edit text functionality
          canvas.on('mouse:dblclick', (e: any) => {
            const obj = e.target;
            console.log('Double-click detected on object:', obj?.type, obj);
            
            if (!obj || (obj.type !== 'textbox' && obj.type !== 'text')) {
              console.log('Object is not a text object, skipping edit');
              return;
            }

            // Prevent default behavior
            e.e.preventDefault();
            e.e.stopPropagation();

            // Enter text editing mode
            try {
              console.log('Attempting to enter editing mode for:', obj);
              obj.enterEditing();
              obj.selectAll();
              canvas.renderAll();
              console.log('Successfully entered editing mode');
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

          // Handle keyboard shortcuts for text editing
          canvas.on('text:changed', (e: any) => {
            // Auto-save state when text changes
            saveState();
          });

          // Add keyboard shortcuts for edit operations
          const handleKeyDown = (e: KeyboardEvent) => {
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
                activeObject.enterEditing();
                activeObject.selectAll();
                canvas.renderAll();
                e.preventDefault();
              } catch (error) {
                console.error('Error entering edit mode with F2:', error);
              }
            }

            // Handle Delete key to delete selected objects
            if (e.key === 'Delete' && !activeObject.isEditing) {
              const activeObjects = canvas.getActiveObjects();
              if (activeObjects.length > 0) {
                canvas.remove(...activeObjects);
                canvas.discardActiveObject();
                canvas.renderAll();
                saveState();
              }
              e.preventDefault();
            }

            // Handle Ctrl+A to select all objects
            if (e.ctrlKey && e.key === 'a') {
              canvas.discardActiveObject();
              const allObjects = canvas.getObjects();
              if (allObjects.length > 0) {
                canvas.setActiveObjects(allObjects);
                canvas.renderAll();
              }
              e.preventDefault();
            }

            // Handle Ctrl+D to duplicate selected objects
            if (e.ctrlKey && e.key === 'd') {
              const activeObjects = canvas.getActiveObjects();
              if (activeObjects.length > 0) {
                activeObjects.forEach((obj: any) => {
                  obj.clone((cloned: any) => {
                    cloned.set({
                      left: (obj.left || 0) + 10,
                      top: (obj.top || 0) + 10
                    });
                    canvas.add(cloned);
                  });
                });
                canvas.renderAll();
                saveState();
              }
              e.preventDefault();
            }

            // Handle Ctrl+Z for undo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
              canvas.undo();
              e.preventDefault();
            }

            // Handle Ctrl+Y or Ctrl+Shift+Z for redo
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
              canvas.redo();
              e.preventDefault();
            }
          };

          // Add keyboard event listener
          document.addEventListener('keydown', handleKeyDown);

          // Store the handler for cleanup
          canvas.keyboardHandler = handleKeyDown;

          fabricCanvasRef.current = canvas;
          onCanvasReady(canvas);
        } catch (error) {
          console.error('Failed to initialize Fabric.js canvas:', error);
        }
      }
    };

    initCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        try {
          // Remove keyboard event listener
          if (fabricCanvasRef.current.keyboardHandler) {
            document.removeEventListener('keydown', fabricCanvasRef.current.keyboardHandler);
          }
          
          // Remove selection handlers if they exist
          if (fabricCanvasRef.current.selectionHandlers) {
            fabricCanvasRef.current.off('selection:created', fabricCanvasRef.current.selectionHandlers.created);
            fabricCanvasRef.current.off('selection:updated', fabricCanvasRef.current.selectionHandlers.updated);
            fabricCanvasRef.current.off('selection:cleared', fabricCanvasRef.current.selectionHandlers.cleared);
          }
          
          // Safely dispose the canvas
          try {
            const element = fabricCanvasRef.current.getElement();
            if (element && element.parentNode) {
              fabricCanvasRef.current.dispose();
            } else {
              // If element doesn't exist, just clear the canvas
              fabricCanvasRef.current.clear();
            }
          } catch (disposeError) {
            // If dispose fails, try to clear the canvas
            try {
              fabricCanvasRef.current.clear();
            } catch (clearError) {
              // If even clear fails, just log and continue
              console.warn('Could not clear canvas during cleanup');
            }
          }
        } catch (error) {
          console.error('Error during canvas cleanup:', error);
        } finally {
          fabricCanvasRef.current = null;
        }
      }
    };
  }, [onCanvasReady]);

  return (
    <div className="w-full h-full bg-gray-50 flex items-start justify-center overflow-auto">
      <div 
        className="my-8 bg-white shadow-lg"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          width: '800px',
          height: '1000px'
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
        />
      </div>
    </div>
  );
}
