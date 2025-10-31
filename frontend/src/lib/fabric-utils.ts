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
  private isRestoring: boolean = false;
  private shouldRecord: boolean = true;
  private isUserAction: boolean = false;
  private saveStateTimeout: NodeJS.Timeout | null = null;
  private cleanupFunctions: (() => void)[] = [];

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

    // Fix blurriness on high-DPI displays
    this.setupHighDPICanvas();

    // Apply modern object controls
    this.setupObjectControls(fabric);
    
    // Setup event handlers
    this.setupEventHandlers();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Setup undo/redo functionality
    this.setupUndoRedo();
    
    // Setup window resize handler for high-DPI
    this.setupResizeHandler();
    
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
   * Setup high-DPI canvas to prevent blurriness
   */
  private setupHighDPICanvas(): void {
    if (!this.canvas || !this.canvasElement) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvas = this.canvasElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set the actual size in memory (scaled to account for extra pixel density)
    canvas.width = this.config.width * devicePixelRatio;
    canvas.height = this.config.height * devicePixelRatio;

    // Scale the drawing context so everything will work at the higher ratio
    context.scale(devicePixelRatio, devicePixelRatio);

    // Set the display size (CSS pixels)
    canvas.style.width = this.config.width + 'px';
    canvas.style.height = this.config.height + 'px';

    // Update Fabric.js canvas dimensions
    this.canvas.setDimensions({
      width: this.config.width,
      height: this.config.height
    });
  }

  /**
   * Setup window resize handler to maintain high-DPI rendering
   */
  private setupResizeHandler(): void {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (this.canvas && this.canvasElement) {
        this.setupHighDPICanvas();
        this.canvas.requestRenderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Store cleanup function
    this.cleanupFunctions.push(() => {
      window.removeEventListener('resize', handleResize);
    });
  }

  /**
   * Setup modern object controls with best practices
   */
  private setupObjectControls(fabric: any): void {
    if (!this.canvas) return;

    // Apply modern control styling with green dotted selection (matching hover effect)
    fabric.Object.prototype.set({
      borderColor: this.objectControls.borderColor,
      borderWidth: this.objectControls.borderWidth,
      borderDashArray: this.objectControls.borderDashArray,
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
          // Force shouldRecord to true for user actions
          if (this.isUserAction) {
            this.shouldRecord = true;
          }
          // Only save state if it's a user action and not during undo/redo operations
          if (!this.isRestoring && this.shouldRecord && this.isUserAction) {
            this.saveState(); // Save immediately for each addition
          }
          this.eventHandlers.onObjectAdded?.(e);
        });

    this.canvas.on('object:removed', (e) => {
      // Force shouldRecord to true for user actions
      if (this.isUserAction) {
        this.shouldRecord = true;
      }
      // Only save state if it's a user action and not during undo/redo operations
      if (!this.isRestoring && this.shouldRecord && this.isUserAction) {
        this.saveState(); // Save immediately for each removal
      }
      this.eventHandlers.onObjectRemoved?.(e);
    });

    this.canvas.on('object:modified', (e) => {
      // Always mark as user action when object is modified
      this.isUserAction = true;
      // Force shouldRecord to true for user actions
      if (this.isUserAction) {
        this.shouldRecord = true;
      }
      // Only save state if it's not during undo/redo operations
      if (!this.isRestoring && this.shouldRecord) {
        this.saveState(); // Save immediately for each modification
      }
      this.eventHandlers.onObjectModified?.(e);
    });

    // Text editing events
    this.canvas.on('text:editing:exited', (e) => {
      // Only save state if it's a user action and not during undo/redo operations
      if (!this.isRestoring && this.shouldRecord && this.isUserAction) {
        this.saveState();
      }
    });

    // Additional events to capture more modifications
    this.canvas.on('object:moving', (e) => {
      this.isUserAction = true;
    });

    this.canvas.on('object:scaling', (e) => {
      this.isUserAction = true;
    });

    this.canvas.on('object:rotating', (e) => {
      this.isUserAction = true;
    });

    this.canvas.on('object:skewing', (e) => {
      this.isUserAction = true;
    });


    // Mouse events to track user actions
    this.canvas.on('mouse:down', (e) => {
      this.isUserAction = true;
      this.eventHandlers.onMouseDown?.(e);
    });

    this.canvas.on('mouse:up', (e) => {
      // Keep user action flag for a short time to capture modifications
      setTimeout(() => {
        this.isUserAction = false;
        // Also ensure shouldRecord is true after user action
        if (!this.shouldRecord) {
          this.shouldRecord = true;
        }
      }, 200); // Reduced to 200ms for more responsive tracking
      this.eventHandlers.onMouseUp?.(e);
    });

    // Track mouse movement as user action for dragging/resizing
    this.canvas.on('mouse:move', (e) => {
      if ((this.canvas as any)?.isDragging || (this.canvas as any)?.isResizing) {
        this.isUserAction = true;
      }
      this.eventHandlers.onMouseMove?.(e);
    });

    // Hover events - explicitly prevent recording
    this.canvas.on('mouse:over', (e) => {
      this.shouldRecord = false;
      this.isUserAction = false;
    });

    this.canvas.on('mouse:out', (e) => {
      this.shouldRecord = true;
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
    this.canvas.on('mouse:move', (e) => {
      this.eventHandlers.onMouseMove?.(e);
    });

    // Keyboard events to track user actions
    this.canvas.on('key:down', (e) => {
      this.isUserAction = true;
      (this.eventHandlers as any).onKeyDown?.(e);
    });

    this.canvas.on('key:up', (e) => {
      // Keep user action flag for a short time to capture object modifications
      setTimeout(() => {
        this.isUserAction = false;
      }, 200); // Increased to match mouse timeout
      (this.eventHandlers as any).onKeyUp?.(e);
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
   * Group selected objects into a single group
   */
  public groupSelectedObjects(): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    const activeObjects = this.canvas.getActiveObjects();
    
    if (activeObjects.length < 2) return;

    try {
      // In Fabric.js 6.x, if we have an ActiveSelection, we can convert it to a Group
      if (activeObject && activeObject.type === 'activeSelection') {
        // Convert ActiveSelection to Group
        const group = (activeObject as any).toGroup();
        this.canvas.setActiveObject(group);
        this.canvas.requestRenderAll();
        
        // Mark as user action and save state
        this.markAsUserAction();
        this.saveState();
      } else {
        // Create a new ActiveSelection first, then convert to Group
        const fabric = (window as any).fabric;
        if (!fabric) return;

        // Get only root-level objects (not already in groups)
        const objectsToGroup = activeObjects.filter((obj: any) => {
          return !obj.group || obj.group === this.canvas;
        });

        if (objectsToGroup.length < 2) return;

        // Create ActiveSelection first
        const selection = new fabric.ActiveSelection(objectsToGroup, {
          canvas: this.canvas,
        });
        
        this.canvas.setActiveObject(selection);
        
        // Convert ActiveSelection to Group
        // toGroup() properly handles coordinate transformation
        const group = selection.toGroup();
        
        // Ensure group has proper origin (top-left by default)
        group.set({
          originX: 'left',
          originY: 'top',
        });
        
        this.canvas.setActiveObject(group);
        this.canvas.requestRenderAll();
        
        // Mark as user action and save state
        this.markAsUserAction();
        this.saveState();
      }
    } catch (error) {
      console.error('Error grouping objects:', error);
    }
  }

  /**
   * Ungroup the selected group or ActiveSelection
   */
  public ungroupSelectedObjects(): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;

    try {
      const group = activeObject as any;
      const fabric = (window as any).fabric;
      if (!fabric) return;
      
      // Get objects from the group BEFORE removing it
      const objects = group.getObjects();
      if (!objects || objects.length === 0) return;

      // Use Fabric.js's built-in method to restore object states
      // This method properly transforms coordinates from group space to canvas space
      if (typeof group._restoreObjectsState === 'function') {
        // Call _restoreObjectsState() which restores objects to canvas coordinates
        group._restoreObjectsState();
      } else {
        // Manual transformation: Use group's transform matrix
        // In Fabric.js, we need to transform each object using the group's transformation
        const groupMatrix = group.calcTransformMatrix();
        
        objects.forEach((obj: fabric.Object) => {
          // Get object's local coordinates
          const objLeft = obj.left || 0;
          const objTop = obj.top || 0;
          
          // Transform point from group space to canvas space using group's transform matrix
          // Matrix format: [scaleX*cos, -scaleX*sin, scaleY*sin, scaleY*cos, left, top]
          const point = new fabric.Point(objLeft, objTop);
          const transformed = fabric.util.transformPoint(point, groupMatrix);
          
          obj.set({
            left: transformed.x,
            top: transformed.y,
            angle: ((obj.angle || 0) + (group.angle || 0)) % 360,
            scaleX: (obj.scaleX || 1) * (group.scaleX || 1),
            scaleY: (obj.scaleY || 1) * (group.scaleY || 1),
          });
          
          // Clear group reference
          (obj as any).group = null;
        });
      }

      // Remove group from canvas first
      this.canvas.remove(group);

      // Add all objects back to canvas with their restored positions
      objects.forEach((obj: fabric.Object) => {
        this.canvas!.add(obj);
      });

      // Force recalculation of object positions
      objects.forEach((obj: fabric.Object) => {
        obj.setCoords();
      });

      // Keep all ungrouped objects selected (like grouping does)
      if (objects.length > 0) {
        const fabric = (window as any).fabric;
        if (fabric && typeof fabric.ActiveSelection !== 'undefined') {
          // Create an ActiveSelection with all ungrouped objects
          const activeSelection = new fabric.ActiveSelection(objects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(activeSelection);
        } else {
          // Fallback: select all objects individually
          this.canvas.setActiveObjects(objects);
        }
      }

      this.canvas.requestRenderAll();
      this.markAsUserAction();
      this.saveState();
    } catch (error) {
      console.error('Error ungrouping objects:', error);
    }
  }

  /**
   * Check if selected objects can be grouped
   */
  public canGroup(): boolean {
    if (!this.canvas) return false;
    const activeObjects = this.canvas.getActiveObjects();
    return activeObjects.length >= 2;
  }

  /**
   * Check if selected object can be ungrouped
   */
  public canUngroup(): boolean {
    if (!this.canvas) return false;
    const activeObject = this.canvas.getActiveObject();
    return activeObject !== null && (activeObject.type === 'group' || activeObject.type === 'activeSelection');
  }

  /**
   * Setup modern undo/redo functionality
   */
  private setupUndoRedo(): void {
    if (!this.canvas) return;

    this.canvas.undo = () => this.undo();
    this.canvas.redo = () => this.redo();
    this.canvas.saveState = () => this.saveState();
    this.canvas.canUndo = () => this.canUndo();
    this.canvas.canRedo = () => this.canRedo();
    this.canvas.markAsUserAction = () => this.markAsUserAction();
    this.canvas.initializeHistory = () => this.initializeHistory();
    this.canvas.groupSelectedObjects = () => this.groupSelectedObjects();
    this.canvas.ungroupSelectedObjects = () => this.ungroupSelectedObjects();
    this.canvas.canGroup = () => this.canGroup();
    this.canvas.canUngroup = () => this.canUngroup();
  }

  /**
   * Debounced save state to avoid too many saves during rapid changes
   */
  private debouncedSaveState(): void {
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
    }
    
    this.saveStateTimeout = setTimeout(() => {
      this.saveState();
    }, 100); // Reduced to 100ms for more granular saves
  }

  /**
   * Save current canvas state for undo/redo
   */
  private saveState(): void {
    if (!this.canvas || this.isRestoring) {
      return;
    }

    const state = JSON.stringify(this.canvas.toJSON());
    const parsedState = JSON.parse(state);

    // Don't save if it's the same as the last state
    if (this.history.length > 0 && this.history[this.historyIndex] === state) {
      return;
    }

    // Don't save empty states unless it's the initial state
    if (parsedState.objects && parsedState.objects.length === 0 && this.history.length > 0) {
      return;
    }

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
    if (!this.canvas || this.historyIndex <= 0 || this.isRestoring) {
      return;
    }

    this.historyIndex--;
    const state = this.history[this.historyIndex];
    this.restoreState(state);
  }

  /**
   * Redo last undone action
   */
  private redo(): void {
    if (!this.canvas || this.historyIndex >= this.history.length - 1 || this.isRestoring) {
      return;
    }

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
      this.isRestoring = true;
      
      this.canvas.loadFromJSON(state, () => {
        this.canvas!.requestRenderAll();
        this.isRestoring = false;
      });
    } catch (error) {
      console.error('Error restoring canvas state:', error);
      this.isRestoring = false;
    }
  }

  /**
   * Check if undo is available
   */
  private canUndo(): boolean {
    return this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   */
  private canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Get the canvas instance
   */
  getCanvas(): FabricCanvas | null {
    return this.canvas;
  }

  /**
   * Mark the next operation as a user action (for programmatic operations that should be recorded)
   */
  markAsUserAction(): void {
    this.isUserAction = true;
    this.shouldRecord = true;
  }

  /**
   * Initialize history with current canvas state (useful after template loading)
   */
  public initializeHistory(): void {
    if (!this.canvas) return;

    this.history = [];
    this.historyIndex = -1;
    this.saveState();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
      this.saveStateTimeout = null;
    }
    
    // Run all cleanup functions
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
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
