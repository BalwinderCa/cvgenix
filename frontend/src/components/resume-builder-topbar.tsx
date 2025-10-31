'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
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
  Plus,
  Minus,
  Settings,
} from 'lucide-react';

// Types
interface FabricCanvas {
  getActiveObjects(): FabricObject[];
  getActiveObject(): FabricObject | null;
  renderAll(): void;
  undo(): void;
  redo(): void;
  remove(...objects: FabricObject[]): void;
  discardActiveObject(): void;
  clone(object: FabricObject, callback: (cloned: FabricObject) => void): void;
  add(object: FabricObject): void;
  setActiveObject(object: FabricObject): void;
  on(event: string, handler: () => void): void;
  off(event: string, handler: () => void): void;
  highlightAllTextObjects?(): void;
  clearAllHighlights?(): void;
  groupSelectedObjects?(): void;
  ungroupSelectedObjects?(): void;
  canGroup?(): boolean;
  canUngroup?(): boolean;
}

interface FabricObject {
  type: string;
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  underline?: boolean;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;
  strokeWidth?: number;
  left?: number;
  top?: number;
  isEditing?: boolean;
  set(properties: Record<string, any>): void;
  enterEditing?(): void;
  exitEditing?(): void;
  selectAll?(): void;
}

interface TextProperties {
  fontSize: number;
  textColor: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: string;
  lineHeight: number;
  charSpacing: number;
  strokeWidth: number;
}

interface ResumeBuilderTopBarProps {
  fabricCanvas: FabricCanvas | null;
  onSave: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

// Constants
const DEFAULT_TEXT_PROPERTIES: TextProperties = {
  fontSize: 12,
  textColor: '#000000',
  fontFamily: 'Arial',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  textAlign: '',
  lineHeight: 1.2,
  charSpacing: 0,
  strokeWidth: 1
};

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS',
  'Arial Black', 'Impact', 'Comic Sans MS', 'Courier New', 'Lucida Console', 'Palatino',
  'Garamond', 'Bookman', 'Avant Garde', 'Helvetica Neue', 'Calibri', 'Cambria', 'Candara',
  'Century Gothic', 'Consolas', 'Franklin Gothic', 'Futura', 'Gill Sans', 'Optima',
  'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro'
] as const;

const FONT_SIZE_LIMITS = {
  MIN: 8,
  MAX: 72,
  STEP: 2
} as const;

// Utility functions
const isTextObject = (obj: FabricObject): boolean => 
  obj.type === 'textbox' || obj.type === 'text';

const getTextObjects = (objects: FabricObject[]): FabricObject[] =>
  objects.filter(isTextObject);

// Custom hook for text operations with better error handling
const useTextOperations = (fabricCanvas: FabricCanvas | null) => {
  const [textProperties, setTextProperties] = useState<TextProperties>(DEFAULT_TEXT_PROPERTIES);
  const [isLoading, setIsLoading] = useState(false);

  // Get active text objects with error handling
  const getActiveTextObjects = useCallback((): FabricObject[] => {
    if (!fabricCanvas) return [];
    
    try {
      const activeObjects = fabricCanvas.getActiveObjects();
      return getTextObjects(activeObjects);
    } catch (error) {
      console.error('Error getting active text objects:', error);
      return [];
    }
  }, [fabricCanvas]);

  // Apply changes to all text objects with error handling
  const applyToTextObjects = useCallback((updater: (obj: FabricObject) => void): boolean => {
    if (!fabricCanvas) return false;
    
    try {
      const textObjects = getActiveTextObjects();
      if (textObjects.length === 0) return false;
      
      textObjects.forEach(updater);
      fabricCanvas.renderAll();
      return true;
    } catch (error) {
      console.error('Error applying changes to text objects:', error);
      return false;
    }
  }, [fabricCanvas, getActiveTextObjects]);

  // Apply changes to all active objects (text and lines) with error handling
  const applyToActiveObjects = useCallback((updater: (obj: FabricObject) => void): boolean => {
    if (!fabricCanvas) return false;
    
    try {
      const activeObjects = fabricCanvas.getActiveObjects();
      if (activeObjects.length === 0) return false;
      
      activeObjects.forEach(updater);
      fabricCanvas.renderAll();
      return true;
    } catch (error) {
      console.error('Error applying changes to active objects:', error);
      return false;
    }
  }, [fabricCanvas]);

  // Update text properties from canvas with error handling
  const updateTextProperties = useCallback(() => {
    if (!fabricCanvas) {
      setTextProperties(DEFAULT_TEXT_PROPERTIES);
      return;
    }

    try {
      const textObjects = getActiveTextObjects();
      
      if (textObjects.length > 0) {
        const firstTextObject = textObjects[0];
        setTextProperties({
          fontSize: firstTextObject.fontSize || DEFAULT_TEXT_PROPERTIES.fontSize,
          textColor: firstTextObject.fill || DEFAULT_TEXT_PROPERTIES.textColor,
          fontFamily: firstTextObject.fontFamily || DEFAULT_TEXT_PROPERTIES.fontFamily,
          isBold: firstTextObject.fontWeight === 'bold',
          isItalic: firstTextObject.fontStyle === 'italic',
          isUnderline: firstTextObject.underline || false,
          textAlign: firstTextObject.textAlign || 'left',
          lineHeight: firstTextObject.lineHeight || DEFAULT_TEXT_PROPERTIES.lineHeight,
          charSpacing: firstTextObject.charSpacing || DEFAULT_TEXT_PROPERTIES.charSpacing,
          strokeWidth: firstTextObject.strokeWidth || DEFAULT_TEXT_PROPERTIES.strokeWidth
        });
      } else {
        setTextProperties(DEFAULT_TEXT_PROPERTIES);
      }
    } catch (error) {
      console.error('Error updating text properties:', error);
      setTextProperties(DEFAULT_TEXT_PROPERTIES);
    }
  }, [fabricCanvas, getActiveTextObjects]);

  // Text operations with better error handling and loading states
  const textOperations = useMemo(() => ({
    // Font size operations
    increaseFontSize: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          const currentSize = obj.fontSize || DEFAULT_TEXT_PROPERTIES.fontSize;
          const newSize = Math.min(currentSize + FONT_SIZE_LIMITS.STEP, FONT_SIZE_LIMITS.MAX);
          obj.set({ fontSize: newSize });
        });
        
        if (success) {
          const textObjects = getActiveTextObjects();
          if (textObjects.length > 0) {
            setTextProperties(prev => ({ 
              ...prev, 
              fontSize: textObjects[0].fontSize || DEFAULT_TEXT_PROPERTIES.fontSize 
            }));
          }
        }
      } catch (error) {
        console.error('Error increasing font size:', error);
      } finally {
        setIsLoading(false);
      }
    },

    decreaseFontSize: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          const currentSize = obj.fontSize || DEFAULT_TEXT_PROPERTIES.fontSize;
          const newSize = Math.max(currentSize - FONT_SIZE_LIMITS.STEP, FONT_SIZE_LIMITS.MIN);
          obj.set({ fontSize: newSize });
        });
        
        if (success) {
          const textObjects = getActiveTextObjects();
          if (textObjects.length > 0) {
            setTextProperties(prev => ({ 
              ...prev, 
              fontSize: textObjects[0].fontSize || DEFAULT_TEXT_PROPERTIES.fontSize 
            }));
          }
        }
      } catch (error) {
        console.error('Error decreasing font size:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Font family
    changeFontFamily: async (fontFamily: string) => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          obj.set({ fontFamily });
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, fontFamily }));
        }
      } catch (error) {
        console.error('Error changing font family:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Text color
    changeTextColor: async (color: string) => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToActiveObjects((obj: FabricObject) => {
          // For text objects, use 'fill', for line objects, use 'stroke'
          if (obj.type === 'line') {
            obj.set({ stroke: color });
          } else {
            obj.set({ fill: color });
          }
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, textColor: color }));
        }
      } catch (error) {
        console.error('Error changing text color:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Text alignment
    alignLeft: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          obj.set({ textAlign: 'left' });
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, textAlign: 'left' }));
        }
      } catch (error) {
        console.error('Error aligning left:', error);
      } finally {
        setIsLoading(false);
      }
    },

    alignCenter: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          obj.set({ textAlign: 'center' });
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, textAlign: 'center' }));
        }
      } catch (error) {
        console.error('Error aligning center:', error);
      } finally {
        setIsLoading(false);
      }
    },

    alignRight: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          obj.set({ textAlign: 'right' });
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, textAlign: 'right' }));
        }
      } catch (error) {
        console.error('Error aligning right:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Text formatting
    toggleBold: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const textObjects = getActiveTextObjects();
        if (textObjects.length > 0) {
          const firstObject = textObjects[0];
          const currentWeight = firstObject.fontWeight;
          const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
          
          const success = await applyToTextObjects((obj: FabricObject) => {
            obj.set({ fontWeight: newWeight });
          });
          
          if (success) {
            setTextProperties(prev => ({ ...prev, isBold: newWeight === 'bold' }));
          }
        }
      } catch (error) {
        console.error('Error toggling bold:', error);
      } finally {
        setIsLoading(false);
      }
    },

    toggleItalic: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const textObjects = getActiveTextObjects();
        if (textObjects.length > 0) {
          const firstObject = textObjects[0];
          const currentStyle = firstObject.fontStyle;
          const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
          
          const success = await applyToTextObjects((obj: FabricObject) => {
            obj.set({ fontStyle: newStyle });
          });
          
          if (success) {
            setTextProperties(prev => ({ ...prev, isItalic: newStyle === 'italic' }));
          }
        }
      } catch (error) {
        console.error('Error toggling italic:', error);
      } finally {
        setIsLoading(false);
      }
    },

    toggleUnderline: async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const textObjects = getActiveTextObjects();
        if (textObjects.length > 0) {
          const firstObject = textObjects[0];
          const currentDecoration = firstObject.underline;
          const newDecoration = !currentDecoration;
          
          const success = await applyToTextObjects((obj: FabricObject) => {
            obj.set({ underline: newDecoration });
          });
          
          if (success) {
            setTextProperties(prev => ({ ...prev, isUnderline: newDecoration }));
          }
        }
      } catch (error) {
        console.error('Error toggling underline:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Line height operations
    changeLineHeight: async (lineHeight: number) => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          obj.set({ lineHeight });
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, lineHeight }));
        }
      } catch (error) {
        console.error('Error changing line height:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Character spacing operations
    changeCharSpacing: async (charSpacing: number) => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToTextObjects((obj: FabricObject) => {
          obj.set({ charSpacing });
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, charSpacing }));
        }
      } catch (error) {
        console.error('Error changing character spacing:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Stroke width operations
    changeStrokeWidth: async (strokeWidth: number) => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        const success = await applyToActiveObjects((obj: FabricObject) => {
          // For line objects, use 'strokeWidth', for text objects, use 'strokeWidth' as well
          obj.set({ strokeWidth });
        });
        
        if (success) {
          setTextProperties(prev => ({ ...prev, strokeWidth }));
        }
      } catch (error) {
        console.error('Error changing stroke width:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Real-time stroke width updates (for slider dragging)
    updateStrokeWidthRealtime: (strokeWidth: number) => {
      if (!fabricCanvas) return;
      
      try {
        // Direct synchronous update without async operations
        const activeObjects = fabricCanvas.getActiveObjects();
        activeObjects.forEach((obj: FabricObject) => {
          obj.set({ strokeWidth });
        });
        fabricCanvas.renderAll();
        setTextProperties(prev => ({ ...prev, strokeWidth }));
      } catch (error) {
        console.error('Error updating stroke width in real-time:', error);
      }
    },

    // Enter text editing mode
    enterTextEditing: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
          activeObject.enterEditing?.();
          activeObject.selectAll?.();
          fabricCanvas.renderAll();
        }
      } catch (error) {
        console.error('Error entering text editing mode:', error);
      } finally {
        setIsLoading(false);
      }
    },

    // Exit text editing mode
    exitTextEditing: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.isEditing) {
          activeObject.exitEditing?.();
          fabricCanvas.renderAll();
        }
      } catch (error) {
        console.error('Error exiting text editing mode:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }), [applyToTextObjects, applyToActiveObjects, getActiveTextObjects, fabricCanvas, isLoading]);

  return { textProperties, textOperations, updateTextProperties, isLoading };
};

// Custom hook for canvas operations with better error handling
const useCanvasOperations = (fabricCanvas: FabricCanvas | null) => {
  const [isLoading, setIsLoading] = useState(false);

  const canvasOperations = useMemo(() => ({
    undo: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        fabricCanvas.undo();
      } catch (error) {
        console.error('Error undoing:', error);
      } finally {
        setIsLoading(false);
      }
    },

    redo: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        fabricCanvas.redo();
      } catch (error) {
        console.error('Error redoing:', error);
      } finally {
        setIsLoading(false);
      }
    },
    
    delete: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        const activeObjects = fabricCanvas.getActiveObjects();
        if (activeObjects.length > 0) {
          fabricCanvas.remove(...activeObjects);
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
        }
      } catch (error) {
        console.error('Error deleting objects:', error);
      } finally {
        setIsLoading(false);
      }
    },

    copy: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
          fabricCanvas.clone(activeObject, (cloned: FabricObject) => {
            cloned.set({
              left: (activeObject.left || 0) + 10,
              top: (activeObject.top || 0) + 10
            });
            fabricCanvas.add(cloned);
            fabricCanvas.setActiveObject(cloned);
            fabricCanvas.renderAll();
          });
        }
      } catch (error) {
        console.error('Error copying object:', error);
      } finally {
        setIsLoading(false);
      }
    },

    highlightTextObjects: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        if (fabricCanvas.highlightAllTextObjects) {
          fabricCanvas.highlightAllTextObjects();
        }
      } catch (error) {
        console.error('Error highlighting text objects:', error);
      } finally {
        setIsLoading(false);
      }
    },

    clearHighlights: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        if (fabricCanvas.clearAllHighlights) {
          fabricCanvas.clearAllHighlights();
        }
      } catch (error) {
        console.error('Error clearing highlights:', error);
      } finally {
        setIsLoading(false);
      }
    },

    group: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        if (fabricCanvas.groupSelectedObjects) {
          fabricCanvas.groupSelectedObjects();
        }
      } catch (error) {
        console.error('Error grouping objects:', error);
      } finally {
        setIsLoading(false);
      }
    },

    ungroup: async () => {
      if (!fabricCanvas || isLoading) return;
      setIsLoading(true);
      
      try {
        if (fabricCanvas.ungroupSelectedObjects) {
          fabricCanvas.ungroupSelectedObjects();
        }
      } catch (error) {
        console.error('Error ungrouping objects:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }), [fabricCanvas, isLoading]);

  return { canvasOperations, isLoading };
};

// Memoized toolbar button component with accessibility
const ToolbarButton = ({ 
  onClick, 
  icon: Icon, 
  title, 
  isActive = false, 
  isLoading = false,
  disabled = false,
  className = "" 
}: {
  onClick: () => void;
  icon: any;
  title: string;
  isActive?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      isActive 
        ? 'text-white bg-primary hover:bg-primary/90' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    } ${className}`}
    title={title}
    aria-label={title}
    aria-pressed={isActive}
  >
    <Icon className="w-4 h-4" />
  </button>
);

// Memoized separator component
const ToolbarSeparator = () => (
  <div className="w-px h-6 bg-gray-300 mx-2" aria-hidden="true" />
);

// Memoized font size display component
const FontSizeDisplay = ({ fontSize, isLoading }: { fontSize: number; isLoading: boolean }) => (
  <div 
    className={`px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md min-w-[3rem] text-center ${
      isLoading ? 'opacity-50' : ''
    }`}
    aria-label={`Current font size: ${fontSize}`}
  >
    {fontSize}
  </div>
);

// Memoized color picker component with accessibility
const ColorPicker = ({ 
  color, 
  onChange,
  isLoading = false
}: { 
  color: string; 
  onChange: (color: string) => void;
  isLoading?: boolean;
}) => (
  <div className="relative">
    <button
      onClick={() => document.getElementById('hidden-color-picker')?.click()}
      disabled={isLoading}
      className={`w-6 h-6 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md p-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
        isLoading ? 'opacity-50' : ''
      }`}
      style={{ 
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
        backgroundSize: '200% 200%',
        animation: isLoading ? 'none' : 'gradientShift 3s ease infinite'
      }}
      title="Text Color"
      aria-label="Change text color"
    >
      <div
        className="w-full h-full rounded-md"
        style={{ backgroundColor: color }}
      />
    </button>
    <input
      id="hidden-color-picker"
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="absolute opacity-0 pointer-events-none"
      aria-label="Color picker"
    />
    <style jsx>{`
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  </div>
);

// Memoized font family dropdown component
const FontFamilyDropdown = ({ 
  fontFamily, 
  onChange, 
  fontFamilies,
  isLoading = false
}: { 
  fontFamily: string; 
  onChange: (fontFamily: string) => void; 
  fontFamilies: readonly string[];
  isLoading?: boolean;
}) => (
  <select
    value={fontFamily}
    onChange={(e) => onChange(e.target.value)}
    disabled={isLoading}
    className={`px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      isLoading ? 'opacity-50' : ''
    }`}
    title="Font Family"
    aria-label="Select font family"
  >
    {fontFamilies.map((font) => (
      <option key={font} value={font} style={{ fontFamily: font }}>
        {font}
      </option>
    ))}
  </select>
);

// Line thickness slider component with local state for smooth sliding
const LineThicknessSlider = ({ 
  value, 
  onChange, 
  onInput, 
  disabled = false 
}: { 
  value: number; 
  onChange: (value: number) => void; 
  onInput: (value: number) => void; 
  disabled?: boolean; 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Update local value when prop value changes (but not while dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    // Direct update without throttling for smooth slider movement
    onInput(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
    setIsDragging(false);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">
        Line Thickness
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={localValue}
          onChange={handleChange}
          onInput={handleInput}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          disabled={disabled}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          title={`Line Thickness: ${localValue}px`}
        />
        <input
          type="number"
          min="1"
          max="50"
          step="1"
          value={localValue}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value >= 1 && value <= 50) {
              setLocalValue(value);
              onChange(value);
            }
          }}
          disabled={disabled}
          className="w-16 text-xs text-center text-gray-700 bg-white border border-gray-300 px-2 py-1 rounded focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="1"
        />
      </div>
    </div>
  );
};

// Advanced tools overlay component
const AdvancedToolsOverlay = ({ 
  isOpen, 
  onClose, 
  textProperties, 
  textOperations, 
  isLoading = false,
  hasLineSelected = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  textProperties: TextProperties; 
  textOperations: any;
  isLoading?: boolean;
  hasLineSelected?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Overlay */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px]">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Advanced Tools</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close advanced tools"
            >
              ×
            </button>
          </div>
          
          {/* Line Height Control */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Line Height
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.8"
                max="3.0"
                step="0.1"
                value={textProperties.lineHeight}
                onChange={(e) => textOperations.changeLineHeight(parseFloat(e.target.value))}
                onInput={(e) => textOperations.changeLineHeight(parseFloat((e.target as HTMLInputElement).value))}
                disabled={isLoading}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                title={`Line Height: ${textProperties.lineHeight}`}
              />
              <input
                type="number"
                min="0.8"
                max="3.0"
                step="0.1"
                value={textProperties.lineHeight}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value >= 0.8 && value <= 3.0) {
                    textOperations.changeLineHeight(value);
                  }
                }}
                disabled={isLoading}
                className="w-16 text-xs text-center text-gray-700 bg-white border border-gray-300 px-2 py-1 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="1.2"
              />
            </div>
          </div>
          
          {/* Character Spacing Control */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Letter Spacing
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="-5"
                max="20"
                step="0.5"
                value={textProperties.charSpacing}
                onChange={(e) => textOperations.changeCharSpacing(parseFloat(e.target.value))}
                onInput={(e) => textOperations.changeCharSpacing(parseFloat((e.target as HTMLInputElement).value))}
                disabled={isLoading}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                title={`Letter Spacing: ${textProperties.charSpacing}px`}
              />
              <input
                type="number"
                min="-5"
                max="20"
                step="0.5"
                value={textProperties.charSpacing}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value >= -5 && value <= 20) {
                    textOperations.changeCharSpacing(value);
                  }
                }}
                disabled={isLoading}
                className="w-16 text-xs text-center text-gray-700 bg-white border border-gray-300 px-2 py-1 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="0"
              />
            </div>
          </div>
          
          {/* Line Thickness Control - Only show when line is selected */}
          {hasLineSelected && (
            <LineThicknessSlider 
              value={textProperties.strokeWidth}
              onChange={textOperations.changeStrokeWidth}
              onInput={textOperations.updateStrokeWidthRealtime}
              disabled={isLoading}
            />
          )}
          
        </div>
        
        <style jsx>{`
          .slider {
            background: linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%);
            background-size: 100% 100%;
            background-repeat: no-repeat;
            transition: background 0.2s ease;
          }
          
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: grab;
            box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
            border: 2px solid white;
          }
          
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
          }
          
          .slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.05);
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.5);
          }
          
          .slider::-webkit-slider-track {
            height: 8px;
            border-radius: 4px;
            background: #e5e7eb;
          }
          
          .slider::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: grab;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
          }
          
          .slider::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
          }
          
          .slider::-moz-range-thumb:active {
            cursor: grabbing;
            transform: scale(1.05);
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.5);
          }
          
          .slider::-moz-range-track {
            height: 8px;
            border-radius: 4px;
            background: #e5e7eb;
            border: none;
          }
        `}</style>
      </div>
    </>
  );
};

// Main component with better error boundaries
export default function ResumeBuilderTopBar({ 
  fabricCanvas, 
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: ResumeBuilderTopBarProps) {
  const { textProperties, textOperations, updateTextProperties, isLoading: textLoading } = useTextOperations(fabricCanvas);
  const { canvasOperations, isLoading: canvasLoading } = useCanvasOperations(fabricCanvas);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [hasLineSelected, setHasLineSelected] = useState(false);
  
  const isLoading = textLoading || canvasLoading;

  // Update text properties when selection changes with error handling
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelectionChange = () => {
      try {
        updateTextProperties();
        
        // Check if a line is selected
        const activeObject = fabricCanvas.getActiveObject();
        const activeObjects = fabricCanvas.getActiveObjects();
        const hasLine = activeObject && activeObject.type === 'line';
        setHasLineSelected(!!hasLine);
        
      } catch (error) {
        console.error('Error handling selection change:', error);
      }
    };

    const handleSelectionCleared = () => {
      try {
        updateTextProperties();
        setHasLineSelected(false);
      } catch (error) {
        console.error('Error handling selection cleared:', error);
      }
    };

    try {
      fabricCanvas.on('selection:created', handleSelectionChange);
      fabricCanvas.on('selection:updated', handleSelectionChange);
      fabricCanvas.on('selection:cleared', handleSelectionCleared);

      return () => {
        try {
          fabricCanvas.off('selection:created', handleSelectionChange);
          fabricCanvas.off('selection:updated', handleSelectionChange);
          fabricCanvas.off('selection:cleared', handleSelectionCleared);
        } catch (error) {
          console.error('Error removing event listeners:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }, [fabricCanvas, updateTextProperties]);

  return (
    <div className="px-1 py-6">
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-1 w-fit mx-auto">
        <div className="flex items-center justify-center relative">
          <div className="flex items-center space-x-1" role="toolbar" aria-label="Text formatting toolbar">
            {/* Undo/Redo */}
            <ToolbarButton 
              onClick={onUndo || canvasOperations.undo} 
              icon={Undo} 
              title="Undo" 
              isLoading={isLoading}
              disabled={!canUndo}
            />
            <ToolbarButton 
              onClick={onRedo || canvasOperations.redo} 
              icon={Redo} 
              title="Redo" 
              isLoading={isLoading}
              disabled={!canRedo}
            />
            
            <ToolbarSeparator />
            
            {/* Highlight Text Objects Button */}
            
            {/* Text Alignment */}
            <ToolbarButton 
              onClick={textOperations.alignLeft} 
              icon={AlignLeft} 
              title="Align Left"
              isActive={textProperties.textAlign === 'left'}
              isLoading={isLoading}
            />
            <ToolbarButton 
              onClick={textOperations.alignCenter} 
              icon={AlignCenter} 
              title="Align Center"
              isActive={textProperties.textAlign === 'center'}
              isLoading={isLoading}
            />
            <ToolbarButton 
              onClick={textOperations.alignRight} 
              icon={AlignRight} 
              title="Align Right"
              isActive={textProperties.textAlign === 'right'}
              isLoading={isLoading}
            />
            
            <ToolbarSeparator />
            
            {/* Text Formatting */}
            <ToolbarButton 
              onClick={textOperations.toggleBold} 
              icon={Bold} 
              title="Bold"
              isActive={textProperties.isBold}
              isLoading={isLoading}
            />
            <ToolbarButton 
              onClick={textOperations.toggleItalic} 
              icon={Italic} 
              title="Italic"
              isActive={textProperties.isItalic}
              isLoading={isLoading}
            />
            <ToolbarButton 
              onClick={textOperations.toggleUnderline} 
              icon={Underline} 
              title="Underline"
              isActive={textProperties.isUnderline}
              isLoading={isLoading}
            />
            
            {/* Color Picker */}
            <ColorPicker 
              color={textProperties.textColor} 
              onChange={textOperations.changeTextColor}
              isLoading={isLoading}
            />
            
            
            {/* Advanced Tools */}
            <div className="relative">
              <ToolbarButton 
                onClick={() => setShowAdvancedTools(!showAdvancedTools)} 
                icon={Settings} 
                title="Advanced Tools" 
                isActive={showAdvancedTools}
                isLoading={isLoading}
              />
              
              <AdvancedToolsOverlay
                isOpen={showAdvancedTools}
                onClose={() => setShowAdvancedTools(false)}
                textProperties={textProperties}
                textOperations={textOperations}
                isLoading={isLoading}
                hasLineSelected={hasLineSelected}
              />
            </div>
            
            <ToolbarSeparator />
            
            {/* Font Size Controls */}
            <ToolbarButton 
              onClick={textOperations.decreaseFontSize} 
              icon={Minus} 
              title="Decrease Font Size" 
              isLoading={isLoading}
            />
            <FontSizeDisplay 
              fontSize={textProperties.fontSize} 
              isLoading={isLoading}
            />
            <ToolbarButton 
              onClick={textOperations.increaseFontSize} 
              icon={Plus} 
              title="Increase Font Size" 
              isLoading={isLoading}
            />
            
            <ToolbarSeparator />
            
            {/* Font Family */}
            <FontFamilyDropdown 
              fontFamily={textProperties.fontFamily}
              onChange={textOperations.changeFontFamily}
              fontFamilies={FONT_FAMILIES}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
