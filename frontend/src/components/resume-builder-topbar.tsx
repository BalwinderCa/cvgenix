'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Minus
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
  left?: number;
  top?: number;
  set(properties: Record<string, any>): void;
}

interface TextProperties {
  fontSize: number;
  textColor: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: string;
}

interface ResumeBuilderTopBarProps {
  fabricCanvas: FabricCanvas | null;
  onSave: () => void;
}

// Constants
const DEFAULT_TEXT_PROPERTIES: TextProperties = {
  fontSize: 12,
  textColor: '#000000',
  fontFamily: 'Arial',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  textAlign: ''
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
          textAlign: firstTextObject.textAlign || 'left'
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
        const success = await applyToTextObjects((obj: FabricObject) => {
          obj.set({ fill: color });
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
    }
  }), [applyToTextObjects, getActiveTextObjects, isLoading]);

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

// Main component with better error boundaries
export default function ResumeBuilderTopBar({ 
  fabricCanvas, 
  onSave
}: ResumeBuilderTopBarProps) {
  const { textProperties, textOperations, updateTextProperties, isLoading: textLoading } = useTextOperations(fabricCanvas);
  const { canvasOperations, isLoading: canvasLoading } = useCanvasOperations(fabricCanvas);
  
  const isLoading = textLoading || canvasLoading;

  // Update text properties when selection changes with error handling
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelectionChange = () => {
      try {
        updateTextProperties();
      } catch (error) {
        console.error('Error handling selection change:', error);
      }
    };

    try {
      fabricCanvas.on('selection:created', handleSelectionChange);
      fabricCanvas.on('selection:updated', handleSelectionChange);
      fabricCanvas.on('selection:cleared', handleSelectionChange);

      return () => {
        try {
          fabricCanvas.off('selection:created', handleSelectionChange);
          fabricCanvas.off('selection:updated', handleSelectionChange);
          fabricCanvas.off('selection:cleared', handleSelectionChange);
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
              onClick={canvasOperations.undo} 
              icon={Undo} 
              title="Undo" 
              isLoading={isLoading}
            />
            <ToolbarButton 
              onClick={canvasOperations.redo} 
              icon={Redo} 
              title="Redo" 
              isLoading={isLoading}
            />
            
            <ToolbarSeparator />
            
            {/* Copy/Delete */}
            <ToolbarButton 
              onClick={canvasOperations.copy} 
              icon={Copy} 
              title="Copy" 
              isLoading={isLoading}
            />
            <ToolbarButton 
              onClick={canvasOperations.delete} 
              icon={Trash2} 
              title="Delete" 
              isLoading={isLoading}
            />
            
            <ToolbarSeparator />
            
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
