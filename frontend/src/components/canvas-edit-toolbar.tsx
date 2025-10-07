'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit3, 
  Check, 
  X, 
  Copy, 
  Trash2, 
  Undo, 
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react';

interface CanvasEditToolbarProps {
  fabricCanvas: any;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function CanvasEditToolbar({ 
  fabricCanvas, 
  isVisible, 
  position, 
  onClose 
}: CanvasEditToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeObject, setActiveObject] = useState<any>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelectionChange = () => {
      const activeObj = fabricCanvas.getActiveObject();
      setActiveObject(activeObj);
      setIsEditing(activeObj?.isEditing || false);
    };

    const handleEditingEntered = () => {
      setIsEditing(true);
    };

    const handleEditingExited = () => {
      setIsEditing(false);
    };

    fabricCanvas.on('selection:created', handleSelectionChange);
    fabricCanvas.on('selection:updated', handleSelectionChange);
    fabricCanvas.on('selection:cleared', handleSelectionChange);
    fabricCanvas.on('text:editing:entered', handleEditingEntered);
    fabricCanvas.on('text:editing:exited', handleEditingExited);

    return () => {
      fabricCanvas.off('selection:created', handleSelectionChange);
      fabricCanvas.off('selection:updated', handleSelectionChange);
      fabricCanvas.off('selection:cleared', handleSelectionChange);
      fabricCanvas.off('text:editing:entered', handleEditingEntered);
      fabricCanvas.off('text:editing:exited', handleEditingExited);
    };
  }, [fabricCanvas]);

  const handleEditText = async () => {
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      try {
        if (typeof activeObject.enterEditing === 'function') {
          activeObject.enterEditing();
          activeObject.selectAll();
          fabricCanvas.renderAll();
        } else {
          // Get fabric instance
          const { loadFabric } = await import('@/lib/fabric-loader');
          const fabric = await loadFabric();
          
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
            
            fabricCanvas.remove(activeObject);
            fabricCanvas.add(textbox);
            fabricCanvas.setActiveObject(textbox);
            textbox.enterEditing();
            textbox.selectAll();
            fabricCanvas.renderAll();
          }
        }
      } catch (error) {
        console.error('Error entering edit mode from toolbar:', error);
      }
    }
  };

  const handleConfirmEdit = () => {
    if (activeObject && activeObject.isEditing) {
      activeObject.exitEditing();
      fabricCanvas.renderAll();
    }
  };

  const handleCancelEdit = () => {
    if (activeObject && activeObject.isEditing) {
      activeObject.exitEditing();
      fabricCanvas.renderAll();
    }
  };

  const handleCopy = () => {
    if (activeObject) {
      activeObject.clone((cloned: any) => {
        cloned.set({
          left: (activeObject.left || 0) + 10,
          top: (activeObject.top || 0) + 10
        });
        fabricCanvas.add(cloned);
        fabricCanvas.setActiveObject(cloned);
        fabricCanvas.renderAll();
      });
    }
  };

  const handleDelete = () => {
    if (activeObject) {
      fabricCanvas.remove(activeObject);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      onClose();
    }
  };

  const handleUndo = () => {
    fabricCanvas.undo();
  };

  const handleRedo = () => {
    fabricCanvas.redo();
  };

  const handleTextAlign = (align: string) => {
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      activeObject.set({ textAlign: align });
      fabricCanvas.renderAll();
    }
  };

  const handleToggleBold = () => {
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      const currentWeight = activeObject.fontWeight;
      const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
      activeObject.set({ fontWeight: newWeight });
      fabricCanvas.renderAll();
    }
  };

  const handleToggleItalic = () => {
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      const currentStyle = activeObject.fontStyle;
      const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
      activeObject.set({ fontStyle: newStyle });
      fabricCanvas.renderAll();
    }
  };

  const handleToggleUnderline = () => {
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      const currentUnderline = activeObject.underline;
      activeObject.set({ underline: !currentUnderline });
      fabricCanvas.renderAll();
    }
  };

  if (!isVisible || !activeObject) return null;

  const isTextObject = activeObject.type === 'textbox' || activeObject.type === 'text';

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
      style={{
        left: position.x,
        top: position.y - 50,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Edit Controls */}
      {isTextObject && (
        <>
          {!isEditing ? (
            <button
              onClick={handleEditText}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Edit text (F2)"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleConfirmEdit}
                className="p-2 hover:bg-green-100 text-green-600 rounded-md transition-colors"
                title="Confirm edit (Enter)"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                title="Cancel edit (Escape)"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </>
      )}

      {/* Text Formatting Controls */}
      {isTextObject && (
        <>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <button
            onClick={() => handleTextAlign('left')}
            className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
              activeObject.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleTextAlign('center')}
            className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
              activeObject.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleTextAlign('right')}
            className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
              activeObject.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            onClick={handleToggleBold}
            className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
              activeObject.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleToggleItalic}
            className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
              activeObject.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleToggleUnderline}
            className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${
              activeObject.underline ? 'bg-blue-100 text-blue-600' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Object Controls */}
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleDelete}
        className="p-2 hover:bg-red-100 text-red-600 rounded-md transition-colors"
        title="Delete (Delete key)"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* History Controls */}
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={handleUndo}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleRedo}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>

      {/* Close Button */}
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Close toolbar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
