'use client';

import { useCallback, useEffect } from 'react';
import { CanvasEventHandlers } from '@/types/canvas';

interface CanvasEditManagerProps {
  canvas: any;
  getFabricInstance: () => Promise<any>;
  onEditToolbarUpdate: (updates: any) => void;
  registerCleanup: (cleanup: () => void) => void;
}

/**
 * Attach only hover handlers when they're missing but other handlers exist
 */
const attachHoverHandlersOnly = async (
  canvas: any,
  existingHandlers: CanvasEventHandlers,
  getFabricInstance: () => Promise<any>
) => {
  const objects = canvas.getObjects();
  const textObjects = objects.filter((obj: any) => 
    (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text')
  );
  
  if (textObjects.length === 0) {
    setTimeout(() => attachHoverHandlersOnly(canvas, existingHandlers, getFabricInstance), 100);
    return;
  }
  
  // Ensure all objects have coordinates set
  objects.forEach((obj: any) => {
    if (obj.setCoords) {
      obj.setCoords();
    }
  });
  canvas.calcOffset();
  
  // Check if objects are interactive
  const interactiveObjects = textObjects.filter((obj: any) => obj.selectable && obj.evented);
  if (interactiveObjects.length < textObjects.length) {
    setTimeout(() => attachHoverHandlersOnly(canvas, existingHandlers, getFabricInstance), 50);
    return;
  }
  
  try {
    const fabric = await getFabricInstance();
    if (!fabric) return;
    
    canvas.calcOffset();
    canvas.renderAll();
    
    const createOrUpdateOverlay = (obj: any) => {
      const bounds = obj.getBoundingRect();
      const padding = 5;
      
      if (canvas.hoverOverlay) {
        canvas.hoverOverlay.set({
          left: bounds.left - padding,
          top: bounds.top - padding,
          width: bounds.width + (padding * 2),
          height: bounds.height + (padding * 2),
        });
        canvas.bringToFront(canvas.hoverOverlay);
      } else {
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
        canvas.bringToFront(canvas.hoverOverlay);
      }
      canvas.renderAll();
    };
    
    const removeOverlay = () => {
      if (canvas.hoverOverlay) {
        canvas.remove(canvas.hoverOverlay);
        canvas.hoverOverlay = null;
        canvas.renderAll();
      }
    };
    
    const handleMouseOver = (e: any) => {
      const obj = e.target;
      const activeObject = canvas.getActiveObject();
      const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text');
      
      if (activeObject || !obj || !isTextObject || obj.isEditing) {
        return;
      }
      
      if (!obj.selectable || !obj.evented) {
        return;
      }
      
      canvas.hoveredObject = obj;
      createOrUpdateOverlay(obj);
    };
    
    const handleMouseOut = (e: any) => {
      const obj = e.target;
      const activeObject = canvas.getActiveObject();
      const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text');
      
      if (activeObject || !obj || !isTextObject) {
        return;
      }
      
      canvas.hoveredObject = null;
      if (!obj.isEditing) {
        removeOverlay();
      }
    };
    
    let mouseMoveTimeout: NodeJS.Timeout | undefined;
    const handleMouseMove = (e: any) => {
      if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
      }
      mouseMoveTimeout = setTimeout(() => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
            removeOverlay();
            canvas.hoveredObject = null;
          }
          return;
        }
        
        const obj = canvas.findTarget(e.e, false);
        const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') && obj.selectable && obj.evented;
        
        if (isTextObject) {
          if (canvas.hoveredObject !== obj) {
            if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
              removeOverlay();
            }
            canvas.hoveredObject = obj;
            if (!obj.isEditing) {
              createOrUpdateOverlay(obj);
            }
          }
        } else if (canvas.hoveredObject) {
          if (!canvas.hoveredObject.isEditing) {
            removeOverlay();
          }
          canvas.hoveredObject = null;
        }
      }, 30);
    };
    
    // Attach hover handlers
    canvas.on('mouse:over', handleMouseOver);
    canvas.on('mouse:out', handleMouseOut);
    canvas.on('mouse:move', handleMouseMove);
    
    // Update existing handlers object with hover handlers
    existingHandlers.mouseOver = handleMouseOver;
    existingHandlers.mouseOut = handleMouseOut;
    existingHandlers.mouseMove = handleMouseMove;
    existingHandlers.getMouseMoveTimeout = () => mouseMoveTimeout;
    
    // Also attach to canvas element
    const canvasElement = canvas.getElement();
    if (canvasElement) {
      canvasElement.style.pointerEvents = 'auto';
      canvasElement.style.cursor = 'default';
      
      let elementMouseMoveTimeout: NodeJS.Timeout | undefined;
      const elementMouseMove = (e: MouseEvent) => {
        if (elementMouseMoveTimeout) {
          clearTimeout(elementMouseMoveTimeout);
        }
        elementMouseMoveTimeout = setTimeout(() => {
          try {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
                removeOverlay();
                canvas.hoveredObject = null;
              }
              return;
            }
            
            const obj = canvas.findTarget(e, false);
            const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') && obj.selectable && obj.evented;
            
            if (isTextObject) {
              if (canvas.hoveredObject !== obj) {
                if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
                  removeOverlay();
                }
                canvas.hoveredObject = obj;
                if (!obj.isEditing) {
                  createOrUpdateOverlay(obj);
                }
              }
            } else if (canvas.hoveredObject) {
              if (!canvas.hoveredObject.isEditing) {
                removeOverlay();
              }
              canvas.hoveredObject = null;
            }
          } catch (err) {
            // Silently handle errors
          }
        }, 30);
      };
      
      canvasElement.addEventListener('mousemove', elementMouseMove, { passive: true });
      (existingHandlers as any).elementMouseMove = elementMouseMove;
      (existingHandlers as any).elementMouseMoveTimeout = () => elementMouseMoveTimeout;
    }
    
    // CRITICAL: Mark that edit listeners are attached
    canvas.hasEditListeners = true;
    canvas.eventHandlers = existingHandlers;
    
    // CRITICAL: Recalculate offset after attaching handlers
    // This ensures hit detection works correctly after navigation
    canvas.calcOffset();
    canvas.renderAll();
    
    // Recalculate offset again after layout settles
    setTimeout(() => {
      if (canvas && canvas.calcOffset) {
        canvas.calcOffset();
        canvas.renderAll();
      }
    }, 200);
    
  } catch (err) {
    console.error('Error attaching hover handlers only:', err);
    setTimeout(() => attachHoverHandlersOnly(canvas, existingHandlers, getFabricInstance), 200);
  }
};

export const CanvasEditManager: React.FC<CanvasEditManagerProps> = ({
  canvas,
  getFabricInstance,
  onEditToolbarUpdate,
  registerCleanup,
}) => {
  
  const addEditFunctionality = useCallback(() => {
    if (!canvas) {
      return;
    }
    
    const objects = canvas.getObjects();
    const hasObjects = objects.length > 0;
    
    // If no objects, don't initialize - wait for objects to be added
    if (!hasObjects) {
      return;
    }
    
    // ALWAYS clear previous handlers when we have objects and need to initialize
    // This ensures fresh handlers are attached that work with the current objects
    const previousHandlers = canvas.eventHandlers;
    canvas.hasEditListeners = false;
    canvas.eventHandlers = null;
    
    // Remove only OUR specific event listeners to prevent duplicates
    // Don't use canvas.off('eventName') without handler - it removes ALL handlers including topbar's
    try {
      if (previousHandlers) {
        if (previousHandlers.mouseOver) canvas.off('mouse:over', previousHandlers.mouseOver);
        if (previousHandlers.mouseOut) canvas.off('mouse:out', previousHandlers.mouseOut);
        if (previousHandlers.mouseMove) canvas.off('mouse:move', previousHandlers.mouseMove);
        if (previousHandlers.dblclick) canvas.off('mouse:dblclick', previousHandlers.dblclick);
        if (previousHandlers.selectionCreated) canvas.off('selection:created', previousHandlers.selectionCreated);
        if (previousHandlers.selectionUpdated) canvas.off('selection:updated', previousHandlers.selectionUpdated);
        if (previousHandlers.selectionCleared) canvas.off('selection:cleared', previousHandlers.selectionCleared);
      }
    } catch (e) {
      // Ignore if events don't exist
    }
    
    // Initializing edit functionality
    
    // Ensure canvas is interactive
    (canvas as any).selection = true;
    if ((canvas as any).interactive !== undefined) {
      (canvas as any).interactive = true;
    }
    
    // Ensure canvas element can receive mouse events
    const canvasElement = canvas.getElement();
    if (canvasElement) {
      canvasElement.style.pointerEvents = 'auto';
      canvasElement.style.cursor = 'default';
    }
    
    const eventHandlers: CanvasEventHandlers = {};

    // Double-click to edit text functionality
    const handleDblClick = async (e: any) => {
      const obj = e.target;
      
      // Check for text, textbox, or i-text objects
      const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text');
      
      if (!isTextObject) {
        return;
      }

      e.e.preventDefault();
      e.e.stopPropagation();

      try {
        if (typeof obj.enterEditing === 'function') {
          obj.enterEditing();
          obj.selectAll();
          canvas.renderAll();
        } else {
          const fabric = await getFabricInstance();
          
          if (!fabric) return;
          
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
    };
    
    canvas.on('mouse:dblclick', handleDblClick);
    eventHandlers.dblclick = handleDblClick;

    // Text editing events
    const handleEditingEntered = (e: any) => {
      const obj = e.target;
      if (obj) {
        obj.set({
          borderColor: '#10b981',
          borderScaleFactor: 3,
          cornerColor: '#10b981',
          cornerStrokeColor: '#10b981'
        });
        canvas.renderAll();
      }
    };

    const handleEditingExited = (e: any) => {
      const obj = e.target;
      if (obj) {
        obj.set({
          borderColor: '#3b82f6',
          borderScaleFactor: 2,
          cornerColor: '#ffffff',
          cornerStrokeColor: '#999999'
        });
        canvas.renderAll();
      }
    };
    
    canvas.on('text:editing:entered', handleEditingEntered);
    canvas.on('text:editing:exited', handleEditingExited);
    
    eventHandlers.editingEntered = handleEditingEntered;
    eventHandlers.editingExited = handleEditingExited;

    // Hover effects
    canvas.hoveredObject = null;
    canvas.hoverOverlay = null;
    
    // Attach hover handlers asynchronously after ensuring objects are ready
    // Wait for objects to be fully loaded and interactive
    const attachHoverHandlers = () => {
      // Check if objects are ready
      const objects = canvas.getObjects();
      const textObjects = objects.filter((obj: any) => 
        (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text')
      );
      
      if (textObjects.length === 0) {
        // No objects yet, wait a bit and try again
        setTimeout(attachHoverHandlers, 100);
        return;
      }
      
      // CRITICAL: Ensure all objects have their coordinates set before attaching handlers
      // This is essential for hit detection to work
      objects.forEach((obj: any) => {
        if (obj.setCoords) {
          obj.setCoords();
        }
      });
      canvas.calcOffset();
      
      // Check if objects are interactive
      const interactiveObjects = textObjects.filter((obj: any) => obj.selectable && obj.evented);
      if (interactiveObjects.length < textObjects.length) {
        // Some objects not ready yet, wait a bit more
        setTimeout(attachHoverHandlers, 50);
        return;
      }
      
      // Objects are ready, attach handlers
      getFabricInstance().then(fabric => {
        if (!fabric) return;
      
      // CRITICAL FIX: Find the ACTUAL upper canvas element in the DOM
      // Both canvas.wrapperEl and canvas.upperCanvasEl might be stale due to React re-mounting
      // DON'T modify Fabric.js internal references - it breaks dispose()
      // Instead, just attach event listeners to the correct element
      const allUpperCanvases = document.querySelectorAll('.upper-canvas');
      
      if (allUpperCanvases.length > 0) {
        // Find the visible upper-canvas
        for (let i = allUpperCanvases.length - 1; i >= 0; i--) {
          const upperEl = allUpperCanvases[i] as HTMLCanvasElement;
          const rect = upperEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (upperEl !== canvas.upperCanvasEl) {
              // Don't modify canvas.upperCanvasEl - just attach handlers to the correct element
              // This preserves Fabric.js's internal state for proper cleanup
              if (canvas._onMouseDown) {
                upperEl.addEventListener('mousedown', canvas._onMouseDown);
                if (canvas._onMouseUp) upperEl.addEventListener('mouseup', canvas._onMouseUp);
                if (canvas._onMouseMove) upperEl.addEventListener('mousemove', canvas._onMouseMove);
                if (canvas._onMouseEnter) upperEl.addEventListener('mouseenter', canvas._onMouseEnter);
                if (canvas._onMouseOut) upperEl.addEventListener('mouseleave', canvas._onMouseOut);
                if (canvas._onMouseWheel) upperEl.addEventListener('wheel', canvas._onMouseWheel);
                if (canvas._onContextMenu) upperEl.addEventListener('contextmenu', canvas._onContextMenu);
                if (canvas._onDoubleClick) upperEl.addEventListener('dblclick', canvas._onDoubleClick);
              }
            }
            break;
          }
        }
      }
      
      // Ensure canvas is interactive
      if (!canvas.interactive || canvas.skipTargetFind) {
        canvas.interactive = true;
        canvas.skipTargetFind = false;
      }
        
      // Refresh canvas state for hit detection
      canvas.calcOffset();
      canvas.renderAll();
      
      const createOrUpdateOverlay = (obj: any) => {
        const bounds = obj.getBoundingRect();
        const padding = 5;
        
        if (canvas.hoverOverlay) {
          canvas.hoverOverlay.set({
            left: bounds.left - padding,
            top: bounds.top - padding,
            width: bounds.width + (padding * 2),
            height: bounds.height + (padding * 2),
          });
          // Bring overlay to front so it's visible
          canvas.bringToFront(canvas.hoverOverlay);
        } else {
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
          // Bring overlay to front so it's visible above all other objects
          canvas.bringToFront(canvas.hoverOverlay);
        }
        canvas.renderAll();
      };
      
      const removeOverlay = () => {
        if (canvas.hoverOverlay) {
          canvas.remove(canvas.hoverOverlay);
          canvas.hoverOverlay = null;
          canvas.renderAll();
        }
      };
      
      const handleMouseOver = (e: any) => {
        const obj = e.target;
        const activeObject = canvas.getActiveObject();
        
        // Check for text, textbox, or i-text objects
        const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text');
        
        if (activeObject || !obj || !isTextObject || obj.isEditing) {
          return;
        }
        
        // Ensure object is interactive
        if (!obj.selectable || !obj.evented) {
          return;
        }
        
        canvas.hoveredObject = obj;
        createOrUpdateOverlay(obj);
      };
      
      const handleMouseOut = (e: any) => {
        const obj = e.target;
        const activeObject = canvas.getActiveObject();
        
        // Check for text, textbox, or i-text objects
        const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text');
        
        if (activeObject || !obj || !isTextObject) {
          return;
        }
        
        canvas.hoveredObject = null;
        if (!obj.isEditing) {
          removeOverlay();
        }
      };
      
      // Debounced mouse move
      let mouseMoveTimeout: NodeJS.Timeout | undefined;
      const handleMouseMove = (e: any) => {
        if (mouseMoveTimeout) {
          clearTimeout(mouseMoveTimeout);
        }
        mouseMoveTimeout = setTimeout(() => {
          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            // If there's an active object, remove hover overlay
            if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
              removeOverlay();
              canvas.hoveredObject = null;
            }
            return;
          }
          
          // Use findTarget with skipGroup = false to find objects even if they're in groups
          // The second parameter (false) means we want to include non-selectable objects too
          // But we'll filter them ourselves
          const obj = canvas.findTarget(e.e, false);
          
          // Check for text, textbox, or i-text objects
          const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') && obj.selectable && obj.evented;
          
          if (isTextObject) {
            if (canvas.hoveredObject !== obj) {
              // Remove previous overlay if switching to a different object
              if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
                removeOverlay();
              }
              canvas.hoveredObject = obj;
              if (!obj.isEditing) {
                createOrUpdateOverlay(obj);
              }
            }
          } else if (canvas.hoveredObject) {
            // No text object under cursor, remove overlay
            if (!canvas.hoveredObject.isEditing) {
              removeOverlay();
            }
            canvas.hoveredObject = null;
          }
        }, 30); // Reduced debounce time for more responsive hover
      };
      
      // Attach Fabric.js mouse event handlers
      canvas.on('mouse:over', handleMouseOver);
      canvas.on('mouse:out', handleMouseOut);
      canvas.on('mouse:move', handleMouseMove);
      
      eventHandlers.mouseOver = handleMouseOver;
      eventHandlers.mouseOut = handleMouseOut;
      eventHandlers.mouseMove = handleMouseMove;
      eventHandlers.getMouseMoveTimeout = () => mouseMoveTimeout;
      
      // Also attach directly to canvas element as fallback for newly added objects
      const canvasElement = canvas.getElement();
      if (canvasElement) {
        canvasElement.style.pointerEvents = 'auto';
        canvasElement.style.cursor = 'default';
        
        let elementMouseMoveTimeout: NodeJS.Timeout | undefined;
        const elementMouseMove = (e: MouseEvent) => {
          if (elementMouseMoveTimeout) {
            clearTimeout(elementMouseMoveTimeout);
          }
          elementMouseMoveTimeout = setTimeout(() => {
            try {
              const activeObject = canvas.getActiveObject();
              if (activeObject) {
                if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
                  removeOverlay();
                  canvas.hoveredObject = null;
                }
                return;
              }
              
              const obj = canvas.findTarget(e, false);
              const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') && obj.selectable && obj.evented;
              
              if (isTextObject) {
                if (canvas.hoveredObject !== obj) {
                  if (canvas.hoveredObject && !canvas.hoveredObject.isEditing) {
                    removeOverlay();
                  }
                  canvas.hoveredObject = obj;
                  if (!obj.isEditing) {
                    createOrUpdateOverlay(obj);
                  }
                }
              } else if (canvas.hoveredObject) {
                if (!canvas.hoveredObject.isEditing) {
                  removeOverlay();
                }
                canvas.hoveredObject = null;
              }
            } catch (err) {
              // Silently handle errors
            }
          }, 30);
        };
        
        canvasElement.addEventListener('mousemove', elementMouseMove, { passive: true });
        (eventHandlers as any).elementMouseMove = elementMouseMove;
        (eventHandlers as any).elementMouseMoveTimeout = () => elementMouseMoveTimeout;
      }
      
      canvas.renderAll();
      
      // Mark handlers as attached
      canvas.hasEditListeners = true;
      canvas.eventHandlers = eventHandlers;
      }).catch(err => {
        // Ignore extension context errors (browser extension issues, not app errors)
        if (err && err.message && err.message.includes('Extension context')) {
          return;
        }
        // Retry after error
        setTimeout(attachHoverHandlers, 200);
      });
    };
    
    // Start attaching handlers after a short delay
    setTimeout(attachHoverHandlers, 100);

    // Keyboard shortcuts
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      if (e.key === 'F2' && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
        try {
          if (typeof activeObject.enterEditing === 'function') {
            activeObject.enterEditing();
            activeObject.selectAll();
            canvas.renderAll();
            e.preventDefault();
          } else {
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

    document.addEventListener('keydown', handleKeyDown);
    eventHandlers.keyboard = handleKeyDown;
    
    // Selection event listeners
    const handleSelectionCreated = (e: any) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        onEditToolbarUpdate({
          selectedObject: activeObject,
          showDeleteButton: true,
        });
        
        // Clear any hover effects when object is selected
        if (canvas.hoverOverlay) {
          canvas.remove(canvas.hoverOverlay);
          canvas.hoverOverlay = null;
        }
        
        // Calculate position to avoid overlapping with selected element
        const objBounds = activeObject.getBoundingRect();
        const canvasElement = canvas.getElement();
        const canvasOffset = canvasElement.getBoundingClientRect();
        
        // Position toolbar to the right of the element with some margin
        const toolbarMargin = 20;
        const x = canvasOffset.left + objBounds.left + objBounds.width + toolbarMargin;
        
        // Position toolbar above the element, or below if not enough space above
        const viewportHeight = window.innerHeight;
        const spaceAbove = objBounds.top;
        const spaceBelow = viewportHeight - (objBounds.top + objBounds.height);
        const toolbarHeight = 50; // Approximate toolbar height
        
        let y;
        if (spaceAbove > toolbarHeight + 20) {
          // Position above the element
          y = canvasOffset.top + objBounds.top - toolbarHeight - 10;
        } else if (spaceBelow > toolbarHeight + 20) {
          // Position below the element
          y = canvasOffset.top + objBounds.top + objBounds.height + 10;
        } else {
          // Position to the side if not enough vertical space
          y = canvasOffset.top + objBounds.top;
        }
        
        onEditToolbarUpdate({
          editToolbarPosition: { x, y },
          showEditToolbar: true,
        });
      } else {
        onEditToolbarUpdate({
          selectedObject: null,
          showDeleteButton: false,
          showEditToolbar: false,
        });
      }
    };

    const handleSelectionUpdated = (e: any) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        onEditToolbarUpdate({
          selectedObject: activeObject,
          showDeleteButton: true,
        });
        
        const objBounds = activeObject.getBoundingRect();
        const canvasElement = canvas.getElement();
        const canvasOffset = canvasElement.getBoundingClientRect();
        
        const x = canvasOffset.left + (objBounds.left + objBounds.width * 0.95);
        const y = canvasOffset.top + (objBounds.top - 5);
        
        onEditToolbarUpdate({
          editToolbarPosition: { x, y },
        });
      } else {
        onEditToolbarUpdate({
          selectedObject: null,
          showDeleteButton: false,
        });
      }
    };

    const handleSelectionCleared = () => {
      onEditToolbarUpdate({
        selectedObject: null,
        showDeleteButton: false,
        showEditToolbar: false,
      });
    };
    
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);
    
    eventHandlers.selectionCreated = handleSelectionCreated;
    eventHandlers.selectionUpdated = handleSelectionUpdated;
    eventHandlers.selectionCleared = handleSelectionCleared;
    
    // Mark that edit listeners have been added
    canvas.hasEditListeners = true;
    canvas.eventHandlers = eventHandlers;
    
    // Ensure all text objects are properly configured for interaction
    canvas.getObjects().forEach((obj: any) => {
      if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
        if (!obj.selectable || !obj.evented) {
          obj.set({ selectable: true, evented: true });
        }
      }
    });
    
    // Force a render to ensure everything is applied
    canvas.renderAll();
    
    // Register cleanup function
    registerCleanup(() => {
      // Remove all event listeners
      document.removeEventListener('keydown', eventHandlers.keyboard!);
      canvas.off('mouse:dblclick', eventHandlers.dblclick!);
      canvas.off('text:editing:entered', eventHandlers.editingEntered!);
      canvas.off('text:editing:exited', eventHandlers.editingExited!);
      if (eventHandlers.mouseOver) canvas.off('mouse:over', eventHandlers.mouseOver);
      if (eventHandlers.mouseOut) canvas.off('mouse:out', eventHandlers.mouseOut);
      if (eventHandlers.mouseMove) canvas.off('mouse:move', eventHandlers.mouseMove);
      if (eventHandlers.getMouseMoveTimeout) {
        const timeout = eventHandlers.getMouseMoveTimeout();
        if (timeout) clearTimeout(timeout);
      }
      canvas.off('selection:created', eventHandlers.selectionCreated!);
      canvas.off('selection:updated', eventHandlers.selectionUpdated!);
      canvas.off('selection:cleared', eventHandlers.selectionCleared!);
      
      // Remove direct element event listeners
      const canvasElement = canvas.getElement();
      if (canvasElement) {
        const handlers = eventHandlers as any;
        if (handlers.elementMouseMove) {
          canvasElement.removeEventListener('mousemove', handlers.elementMouseMove);
        }
        if (handlers.elementMouseMoveTimeout) {
          const timeout = handlers.elementMouseMoveTimeout();
          if (timeout) clearTimeout(timeout);
        }
      }
      
      // Clean up hover overlay
      if (canvas.hoverOverlay) {
        try {
          canvas.remove(canvas.hoverOverlay);
          canvas.hoverOverlay = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    });
  }, [canvas, getFabricInstance, onEditToolbarUpdate, registerCleanup]);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    
    // Ensure canvas element exists
    if (!canvas.getElement || !canvas.getElement()) {
      return;
    }
    
    // ALWAYS clean up existing listeners first, regardless of flag state
    // This ensures a clean slate for re-initialization
    if (canvas.hasEditListeners && canvas.eventHandlers) {
      const handlers = canvas.eventHandlers;
      try {
        document.removeEventListener('keydown', handlers.keyboard!);
        canvas.off('mouse:dblclick', handlers.dblclick!);
        canvas.off('text:editing:entered', handlers.editingEntered!);
        canvas.off('text:editing:exited', handlers.editingExited!);
        if (handlers.mouseOver) canvas.off('mouse:over', handlers.mouseOver);
        if (handlers.mouseOut) canvas.off('mouse:out', handlers.mouseOut);
        if (handlers.mouseMove) canvas.off('mouse:move', handlers.mouseMove);
        if (handlers.getMouseMoveTimeout) {
          const timeout = handlers.getMouseMoveTimeout();
          if (timeout) clearTimeout(timeout);
        }
        canvas.off('selection:created', handlers.selectionCreated!);
        canvas.off('selection:updated', handlers.selectionUpdated!);
        canvas.off('selection:cleared', handlers.selectionCleared!);
        
        // Remove direct element listeners
        const canvasElement = canvas.getElement();
        if (canvasElement) {
          const elementHandlers = handlers as any;
          if (elementHandlers.elementMouseMove) {
            canvasElement.removeEventListener('mousemove', elementHandlers.elementMouseMove);
          }
          if (elementHandlers.elementMouseMoveTimeout) {
            const timeout = elementHandlers.elementMouseMoveTimeout();
            if (timeout) clearTimeout(timeout);
          }
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      
      // Clean up hover overlay
      if (canvas.hoverOverlay) {
        try {
          canvas.remove(canvas.hoverOverlay);
          canvas.hoverOverlay = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      // Clear flags
      canvas.hasEditListeners = false;
      canvas.hoveredObject = null;
      canvas.eventHandlers = null;
    }
    
    // Function to initialize handlers when objects are ready
    let initAttempts = 0;
    const maxInitAttempts = 50; // Prevent infinite loops
    
    const initializeWhenReady = () => {
      if (!canvas || !canvas.getElement) return;
      
      initAttempts++;
      if (initAttempts > maxInitAttempts) {
        console.error('⚠️ CanvasEditManager: Max initialization attempts reached, stopping');
        return;
      }
      
      const objects = canvas.getObjects();
      const textObjects = objects.filter((obj: any) => 
        (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text')
      );
      
      // If no objects yet, wait a bit and try again
      if (objects.length === 0) {
        if (initAttempts < maxInitAttempts) {
          setTimeout(initializeWhenReady, 100);
        }
        return;
      }
      
      // CRITICAL: Force Fabric.js to refresh object coordinates and canvas state
      // This is essential for hit detection to work after objects are added
      objects.forEach((obj: any) => {
        // Recalculate object coordinates - critical for hit detection
        if (obj.setCoords) {
          obj.setCoords();
        }
        // Ensure object is registered with canvas
        if (obj.canvas !== canvas) {
          obj.canvas = canvas;
        }
        // Ensure text objects are interactive
        if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
          obj.set({ 
            selectable: true, 
            evented: true,
            hoverCursor: 'move',
            moveCursor: 'move'
          });
        }
      });
      
      // CRITICAL: Recalculate canvas offset - required for hit detection
      canvas.calcOffset();
      
      // Ensure canvas is properly configured
      (canvas as any).selection = true;
      if ((canvas as any).interactive !== undefined) {
        (canvas as any).interactive = true;
      }
      
      const canvasElement = canvas.getElement();
      if (canvasElement) {
        canvasElement.style.pointerEvents = 'auto';
        canvasElement.style.cursor = 'default';
      }
      
      // Render after all updates
      canvas.renderAll();
      
      // Add edit functionality - this will attach hover handlers
      addEditFunctionality();
      
      // CRITICAL: Ensure canvas offset is recalculated after handlers are attached
      // This is essential for hit detection to work, especially after navigation
      const ensureOffset = () => {
        if (canvas && canvas.calcOffset) {
          canvas.calcOffset();
          canvas.renderAll();
        }
      };
      
      // Recalculate offset multiple times to ensure layout is complete
      requestAnimationFrame(ensureOffset);
      setTimeout(ensureOffset, 100);
      setTimeout(ensureOffset, 300);
      
      // Additional render after handlers are attached to ensure everything is ready
      setTimeout(() => {
        if (canvas) {
          canvas.calcOffset();
          canvas.renderAll();
        }
      }, 500);
    };
    
    // Start initialization - check immediately if objects exist, otherwise wait
    const objects = canvas.getObjects();
    
    if (objects.length > 0) {
      // Objects already exist (e.g., after template load), initialize immediately
      const initTimeout = setTimeout(() => {
        initializeWhenReady();
      }, 50);
      return () => clearTimeout(initTimeout);
    } else {
      // No objects yet, wait a bit for them to be added
      const initTimeout = setTimeout(initializeWhenReady, 150);
      return () => clearTimeout(initTimeout);
    }
  }, [canvas, addEditFunctionality]);

  return null; // This component doesn't render anything
};
