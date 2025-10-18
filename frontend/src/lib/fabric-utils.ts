// Modern Fabric.js utilities and best practices
// This file contains utility functions for working with Fabric.js 6.7.1

import { 
  FabricCanvas, 
  CanvasConfig, 
  ObjectControls, 
  CanvasEventHandlers,
  KeyboardShortcuts,
  DEFAULT_CANVAS_CONFIG,
  DEFAULT_OBJECT_CONTROLS,
  DEFAULT_KEYBOARD_SHORTCUTS
} from './fabric-types';

export class FabricCanvasManager {
  private canvas: FabricCanvas | null = null;
  private history: string[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;

  constructor(
    private canvasElement: HTMLCanvasElement,
    private config: CanvasConfig = DEFAULT_CANVAS_CONFIG,
    private objectControls: ObjectControls = DEFAULT_OBJECT_CONTROLS,
    private eventHandlers: CanvasEventHandlers = {},
    private keyboardShortcuts: KeyboardShortcuts = DEFAULT_KEYBOARD_SHORTCUTS
  ) {}

  /**
   * Initialize the Fabric.js canvas with modern best practices
   */
  async initialize(): Promise<FabricCanvas> {
    if (this.canvas) {
      return this.canvas;
    }

    // Load Fabric.js dynamically
    const fabric = await this.loadFabric();
    
    // Create canvas with modern configuration
    this.canvas = new fabric.Canvas(this.canvasElement, {
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.config.backgroundColor,
      selection: this.config.selection,
      preserveObjectStacking: this.config.preserveObjectStacking,
      allowTouchScrolling: this.config.allowTouchScrolling,
      fireRightClick: this.config.fireRightClick,
      stopContextMenu: this.config.stopContextMenu,
    }) as FabricCanvas;

    // Apply modern object controls
    this.setupObjectControls(fabric);
    
    // Setup event handlers
    this.setupEventHandlers();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Setup undo/redo functionality
    this.setupUndoRedo();
    
    // Initial state save
    this.saveState();

    return this.canvas;
  }

  /**
   * Load Fabric.js dynamically with fallback
   */
  private async loadFabric(): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error('Fabric.js can only be loaded in browser environment');
    }

    if ((window as any).fabric) {
      return (window as any).fabric;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/fabric@latest/dist/fabric.min.js';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        setTimeout(() => {
          if ((window as any).fabric) {
            resolve((window as any).fabric);
          } else {
            reject(new Error('Fabric.js loaded but not available'));
          }
        }, 100);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Fabric.js'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Setup modern object controls with best practices
   */
  private setupObjectControls(fabric: any): void {
    if (!this.canvas) return;

    // Apply modern control styling
    fabric.Object.prototype.set({
      borderColor: this.objectControls.borderColor,
      cornerColor: this.objectControls.cornerColor,
      cornerStrokeColor: this.objectControls.cornerStrokeColor,
      cornerStyle: this.objectControls.cornerStyle,
      cornerSize: this.objectControls.cornerSize,
      transparentCorners: this.objectControls.transparentCorners,
      borderScaleFactor: this.objectControls.borderScaleFactor,
      lockRotation: this.objectControls.lockRotation,
      hasRotatingPoint: this.objectControls.hasRotatingPoint,
      originX: this.objectControls.originX,
      originY: this.objectControls.originY,
      padding: this.objectControls.padding,
      centeredScaling: this.objectControls.centeredScaling,
      centeredRotation: this.objectControls.centeredRotation,
    });

    // Set control visibility for better UX
    fabric.Object.prototype.setControlsVisibility({
      mt: false, mb: false, mtr: false, // Hide rotation handle
      ml: true, mr: true, // Keep middle left and right handles
      tl: true, tr: true, bl: true, br: true
    });
  }

  /**
   * Setup modern event handlers
   */
  private setupEventHandlers(): void {
    if (!this.canvas) return;

    // Object lifecycle events
    this.canvas.on('object:added', (e) => {
      this.saveState();
      this.eventHandlers.onObjectAdded?.(e);
    });

    this.canvas.on('object:removed', (e) => {
      this.saveState();
      this.eventHandlers.onObjectRemoved?.(e);
    });

    this.canvas.on('object:modified', (e) => {
      this.saveState();
      this.eventHandlers.onObjectModified?.(e);
    });

    // Selection events
    this.canvas.on('selection:created', (e) => {
      this.eventHandlers.onSelectionCreated?.(e);
    });

    this.canvas.on('selection:updated', (e) => {
      this.eventHandlers.onSelectionUpdated?.(e);
    });

    this.canvas.on('selection:cleared', (e) => {
      this.eventHandlers.onSelectionCleared?.(e);
    });

    // Mouse events
    this.canvas.on('mouse:down', (e) => {
      this.eventHandlers.onMouseDown?.(e);
    });

    this.canvas.on('mouse:up', (e) => {
      this.eventHandlers.onMouseUp?.(e);
    });

    this.canvas.on('mouse:move', (e) => {
      this.eventHandlers.onMouseMove?.(e);
    });

    // Text editing events
    this.canvas.on('text:editing:entered', (e) => {
      this.eventHandlers.onTextEditingEntered?.(e);
    });

    this.canvas.on('text:editing:exited', (e) => {
      this.eventHandlers.onTextEditingExited?.(e);
    });
  }

  /**
   * Setup modern keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    if (!this.canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.canvas) return;

      // Skip Ctrl+A handling here - it's handled at the container level
      if (e.ctrlKey && e.key === 'a') {
        return;
      }

      const activeObject = this.canvas.getActiveObject();
      if (!activeObject) return;

      // Handle other shortcuts based on active object
      this.handleObjectShortcuts(e, activeObject);
    };

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Store handler for cleanup
    this.canvas.keyboardHandler = handleKeyDown;
  }

  /**
   * Handle keyboard shortcuts for active objects
   */
  private handleObjectShortcuts(e: KeyboardEvent, activeObject: fabric.Object): void {
    if (!this.canvas) return;

    // Enter key to exit editing mode
    if (e.key === 'Enter' && (activeObject as any).isEditing) {
      (activeObject as any).exitEditing();
      this.canvas.requestRenderAll();
      e.preventDefault();
    }

    // Escape key to cancel editing
    if (e.key === 'Escape' && (activeObject as any).isEditing) {
      (activeObject as any).exitEditing();
      this.canvas.requestRenderAll();
      e.preventDefault();
    }

    // F2 key to enter editing mode for text objects
    if (e.key === 'F2' && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      try {
        (activeObject as any).enterEditing();
        (activeObject as any).selectAll();
        this.canvas.requestRenderAll();
        e.preventDefault();
      } catch (error) {
        console.error('Error entering edit mode with F2:', error);
      }
    }

    // Ctrl+D to duplicate selected objects
    if (e.ctrlKey && e.key === 'd') {
      this.duplicateSelectedObjects();
      e.preventDefault();
    }

    // Ctrl+Z for undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      this.undo();
      e.preventDefault();
    }

    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
      this.redo();
      e.preventDefault();
    }

    // Delete key to remove selected objects
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.deleteSelectedObjects();
      e.preventDefault();
    }
  }

  /**
   * Select all objects using modern Fabric.js 6.x API
   */
  public selectAllObjects(): void {
    if (!this.canvas) return;

    this.canvas.discardActiveObject();
    const allObjects = this.canvas.getObjects();
    
    if (allObjects.length > 0) {
      const selection = new (window as any).fabric.ActiveSelection(allObjects, {
        canvas: this.canvas,
      });
      this.canvas.setActiveObject(selection);
      this.canvas.requestRenderAll();
    }
  }

  /**
   * Duplicate selected objects
   */
  private duplicateSelectedObjects(): void {
    if (!this.canvas) return;

    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      obj.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (obj.left || 0) + 10,
          top: (obj.top || 0) + 10
        });
        this.canvas!.add(cloned);
      });
    });
    
    this.canvas.requestRenderAll();
    this.saveState();
  }

  /**
   * Delete selected objects
   */
  private deleteSelectedObjects(): void {
    if (!this.canvas) return;

    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      this.canvas!.remove(obj);
    });
    
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.saveState();
  }

  /**
   * Setup modern undo/redo functionality
   */
  private setupUndoRedo(): void {
    if (!this.canvas) return;

    this.canvas.undo = () => this.undo();
    this.canvas.redo = () => this.redo();
    this.canvas.saveState = () => this.saveState();
  }

  /**
   * Save current canvas state for undo/redo
   */
  private saveState(): void {
    if (!this.canvas) return;

    const state = JSON.stringify(this.canvas.toJSON());
    
    // Remove states after current index
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new state
    this.history.push(state);
    this.historyIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Undo last action
   */
  private undo(): void {
    if (!this.canvas || this.historyIndex <= 0) return;

    this.historyIndex--;
    const state = this.history[this.historyIndex];
    this.restoreState(state);
  }

  /**
   * Redo last undone action
   */
  private redo(): void {
    if (!this.canvas || this.historyIndex >= this.history.length - 1) return;

    this.historyIndex++;
    const state = this.history[this.historyIndex];
    this.restoreState(state);
  }

  /**
   * Restore canvas state from JSON
   */
  private restoreState(state: string): void {
    if (!this.canvas) return;

    try {
      this.canvas.loadFromJSON(state, () => {
        this.canvas!.requestRenderAll();
      });
    } catch (error) {
      console.error('Error restoring canvas state:', error);
    }
  }

  /**
   * Get the canvas instance
   */
  getCanvas(): FabricCanvas | null {
    return this.canvas;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.canvas) {
      // Remove keyboard event listener
      if (this.canvas.keyboardHandler) {
        document.removeEventListener('keydown', this.canvas.keyboardHandler);
      }
      
      // Dispose canvas
      this.canvas.dispose();
      this.canvas = null;
    }
    
    // Clear history
    this.history = [];
    this.historyIndex = -1;
  }
}
