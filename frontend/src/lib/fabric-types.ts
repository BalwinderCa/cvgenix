// Modern Fabric.js TypeScript interfaces and utilities
// This file provides type safety for Fabric.js 6.7.1

export interface FabricCanvas extends fabric.Canvas {
  // Custom methods we add to the canvas
  undo?: () => void;
  redo?: () => void;
  saveState?: () => void;
  restoreFromState?: (state: string) => void;
  markAsUserAction?: () => void;
  canUndo?: () => boolean;
  canRedo?: () => boolean;
  initializeHistory?: () => void;
  keyboardHandler?: (e: KeyboardEvent) => void;
  canvasKeyHandler?: (e: KeyboardEvent) => void;
  selectionHandlers?: {
    created: (e: fabric.IEvent) => void;
    updated: (e: fabric.IEvent) => void;
    cleared: (e: fabric.IEvent) => void;
  };
  activeControl?: string | null;
}

export interface CanvasState {
  objects: fabric.Object[];
  backgroundImage?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
  scale: number;
}

// Modern Fabric.js object types
export type FabricObject = fabric.Object;
export type FabricTextbox = fabric.Textbox;
export type FabricRect = fabric.Rect;
export type FabricCircle = fabric.Circle;
export type FabricImage = fabric.Image;
export type FabricActiveSelection = fabric.ActiveSelection;

// Canvas configuration interface
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  selection?: boolean;
  preserveObjectStacking?: boolean;
  allowTouchScrolling?: boolean;
  fireRightClick?: boolean;
  stopContextMenu?: boolean;
}

// Object control configuration
export interface ObjectControls {
  borderColor: string;
  borderWidth?: number;
  borderDashArray?: number[];
  cornerColor: string;
  cornerStrokeColor: string;
  cornerStyle: 'circle' | 'rect';
  cornerSize: number;
  transparentCorners: boolean;
  borderScaleFactor: number;
  lockRotation: boolean;
  hasRotatingPoint: boolean;
  originX: 'left' | 'center' | 'right';
  originY: 'top' | 'center' | 'bottom';
  padding: number;
  centeredScaling: boolean;
  centeredRotation: boolean;
}

// Modern event types
export interface CanvasEventHandlers {
  onObjectAdded?: (e: fabric.IEvent) => void;
  onObjectRemoved?: (e: fabric.IEvent) => void;
  onObjectModified?: (e: fabric.IEvent) => void;
  onSelectionCreated?: (e: fabric.IEvent) => void;
  onSelectionUpdated?: (e: fabric.IEvent) => void;
  onSelectionCleared?: (e: fabric.IEvent) => void;
  onMouseDown?: (e: fabric.IEvent) => void;
  onMouseUp?: (e: fabric.IEvent) => void;
  onMouseMove?: (e: fabric.IEvent) => void;
  onTextEditingEntered?: (e: fabric.IEvent) => void;
  onTextEditingExited?: (e: fabric.IEvent) => void;
}

// Keyboard shortcuts configuration
export interface KeyboardShortcuts {
  selectAll: string; // 'ctrl+a'
  duplicate: string; // 'ctrl+d'
  undo: string; // 'ctrl+z'
  redo: string; // 'ctrl+y' or 'ctrl+shift+z'
  delete: string; // 'delete' or 'backspace'
  editText: string; // 'f2'
  escape: string; // 'escape'
  enter: string; // 'enter'
}

// Default configurations
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 750,
  height: 1000,
  backgroundColor: '#ffffff',
  selection: true,
  preserveObjectStacking: true,
  allowTouchScrolling: true,
  fireRightClick: true,
  stopContextMenu: false,
};

export const DEFAULT_OBJECT_CONTROLS: ObjectControls = {
  borderColor: '#10b981', // Green color to match hover effect
  borderWidth: 3, // Thick border like hover effect
  borderDashArray: [5, 5], // Dotted pattern like hover effect
  cornerColor: '#10b981', // Green corners to match hover effect
  cornerStrokeColor: '#10b981',
  cornerStyle: 'circle',
  cornerSize: 12, // Slightly smaller corners
  transparentCorners: false,
  borderScaleFactor: 2, // Thinner border scale
  lockRotation: true,
  hasRotatingPoint: false,
  originX: 'left',
  originY: 'top',
  padding: 2,
  centeredScaling: false,
  centeredRotation: false,
};

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcuts = {
  selectAll: 'ctrl+a',
  duplicate: 'ctrl+d',
  undo: 'ctrl+z',
  redo: 'ctrl+y',
  delete: 'delete',
  editText: 'f2',
  escape: 'escape',
  enter: 'enter',
};
