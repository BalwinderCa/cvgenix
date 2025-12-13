'use client';

import { useCallback, useEffect } from 'react';
import { CanvasEventHandlers } from '@/types/canvas';

interface CanvasEditManagerProps {
  canvas: any;
  getFabricInstance: () => Promise<any>;
  onEditToolbarUpdate: (updates: any) => void;
  registerCleanup: (cleanup: () => void) => void;
}

export const CanvasEditManager: React.FC<CanvasEditManagerProps> = ({
  canvas,
  getFabricInstance,
  onEditToolbarUpdate,
  registerCleanup,
}) => {
  
  const addEditFunctionality = useCallback(() => {
    if (!canvas) {
      console.log('⚠️ CanvasEditManager: No canvas available');
      return;
    }
    
    // Check flag, but also verify if listeners are actually attached
    // Sometimes the flag is set but listeners were cleaned up
    if (canvas.hasEditListeners) {
      // Double-check if listeners are actually still there
      if (canvas.eventHandlers) {
        console.log('⚠️ CanvasEditManager: Listeners already exist, skipping initialization');
        return;
      } else {
        // Flag is set but handlers are gone - clear the flag and continue
        console.log('⚠️ CanvasEditManager: Flag set but no handlers, clearing flag and re-initializing');
        canvas.hasEditListeners = false;
      }
    }
    
    console.log('✅ CanvasEditManager: Initializing edit functionality');
    
    // Ensure canvas is interactive
    (canvas as any).selection = true;
    if ((canvas as any).interactive !== undefined) {
      (canvas as any).interactive = true;
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
    
    getFabricInstance().then(fabric => {
      if (!fabric) return;
      
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
            return;
          }
          
          const obj = canvas.findTarget(e.e, false);
          
          // Check for text, textbox, or i-text objects
          const isTextObject = obj && (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text');
          
          if (isTextObject) {
            if (canvas.hoveredObject !== obj) {
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
        }, 50);
      };
      
      canvas.on('mouse:over', handleMouseOver);
      canvas.on('mouse:out', handleMouseOut);
      canvas.on('mouse:move', handleMouseMove);
      
      eventHandlers.mouseOver = handleMouseOver;
      eventHandlers.mouseOut = handleMouseOut;
      eventHandlers.mouseMove = handleMouseMove;
      
      console.log('✅ CanvasEditManager: Hover event handlers attached');
      eventHandlers.getMouseMoveTimeout = () => mouseMoveTimeout;
    });

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
    
    // Note: Hover handlers are attached asynchronously in getFabricInstance().then()
    // So they might not be in eventHandlers yet when this log runs
    console.log('✅ CanvasEditManager: Edit functionality initialized successfully');
    console.log('✅ CanvasEditManager: Event handlers attached (sync):', Object.keys(eventHandlers).filter(k => k !== 'mouseOver' && k !== 'mouseOut' && k !== 'mouseMove'));
    console.log('✅ CanvasEditManager: Canvas objects count:', canvas.getObjects().length);
    
    // Verify objects are selectable and interactive
    const selectableObjects = canvas.getObjects().filter((obj: any) => obj.selectable && obj.evented);
    console.log('✅ CanvasEditManager: Selectable objects count:', selectableObjects.length);
    
    // Verify canvas is interactive
    console.log('✅ CanvasEditManager: Canvas selection:', (canvas as any).selection);
    console.log('✅ CanvasEditManager: Canvas interactive:', (canvas as any).interactive);
    
    // Test if objects can receive events - log any non-interactive objects
    const nonInteractiveObjects: any[] = [];
    canvas.getObjects().forEach((obj: any, index: number) => {
      if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
        if (!obj.selectable || !obj.evented) {
          nonInteractiveObjects.push({
            index,
            type: obj.type,
            selectable: obj.selectable,
            evented: obj.evented,
            text: obj.text?.substring(0, 30)
          });
        }
      }
    });
    
    if (nonInteractiveObjects.length > 0) {
      console.warn('⚠️ CanvasEditManager: Non-interactive objects found:', nonInteractiveObjects);
    } else {
      console.log('✅ CanvasEditManager: All text objects are interactive');
    }
    
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
    if (canvas) {
      const objectCount = canvas.getObjects().length;
      console.log('🎯 CanvasEditManager initializing - Canvas objects:', objectCount, 'hasEditListeners:', canvas.hasEditListeners);
      
      // If listeners are already set, clean them up first to allow re-initialization
      // This is important when remounting after loading imported resume
      if (canvas.hasEditListeners && canvas.eventHandlers) {
        console.log('🧹 Cleaning up existing listeners before re-initializing');
        const handlers = canvas.eventHandlers;
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
        
        // Clean up hover overlay
        if (canvas.hoverOverlay) {
          try {
            canvas.remove(canvas.hoverOverlay);
            canvas.hoverOverlay = null;
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        // Clear flags - must be done synchronously
        canvas.hasEditListeners = false;
        canvas.hoveredObject = null;
        canvas.eventHandlers = null;
        
        console.log('✅ Flags cleared, hasEditListeners is now:', canvas.hasEditListeners);
      }
      
      // Use a small timeout to ensure flag is cleared and any pending operations complete
      // Then call addEditFunctionality
      const initTimeout = setTimeout(() => {
        console.log('🚀 Calling addEditFunctionality, hasEditListeners:', canvas.hasEditListeners);
        addEditFunctionality();
      }, 0);
      
      return () => clearTimeout(initTimeout);
      
      // Log after initialization
      setTimeout(() => {
        const finalCount = canvas.getObjects().length;
        console.log('🎯 CanvasEditManager initialized - Final objects:', finalCount, 'hasEditListeners:', canvas.hasEditListeners);
      }, 100);
    }
  }, [canvas, addEditFunctionality]);

  return null; // This component doesn't render anything
};
