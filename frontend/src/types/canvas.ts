export interface CanvasState {
  fabricCanvas: any;
  canvasState: string | null;
  currentTemplateId: string;
  isRestoring: boolean;
  lastRestoreAttempt: number;
}

export interface EditToolbarState {
  showEditToolbar: boolean;
  editToolbarPosition: { x: number; y: number };
  selectedObject: any;
  showDeleteButton: boolean;
}

export interface ExportState {
  exportFormat: 'PNG' | 'PDF' | 'JPG';
}

export interface CanvasEventHandlers {
  dblclick?: (e: any) => void;
  editingEntered?: (e: any) => void;
  editingExited?: (e: any) => void;
  mouseOver?: (e: any) => void;
  mouseOut?: (e: any) => void;
  mouseMove?: (e: any) => void;
  getMouseMoveTimeout?: () => NodeJS.Timeout | undefined;
  keyboard?: (e: KeyboardEvent) => void;
  selectionCreated?: (e: any) => void;
  selectionUpdated?: (e: any) => void;
  selectionCleared?: () => void;
}

export interface TemplateData {
  canvasData?: {
    objects?: any[];
    elements?: any[];
  };
  builderData?: {
    elements?: any[];
    objects?: any[];
    canvas?: { objects?: any[] };
    stage?: { objects?: any[] };
  };
  elements?: any[];
}

export interface CleanupFunction {
  (): void;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  selection: boolean;
  preserveObjectStacking: boolean;
  allowTouchScrolling: boolean;
  fireRightClick: boolean;
  stopContextMenu: boolean;
}
