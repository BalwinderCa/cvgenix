'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit3, 
  Check, 
  X, 
  Trash2,
  Copy,
  Clipboard,
  Files,
  Layers,
  SquareStack
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
  const [copiedObject, setCopiedObject] = useState<any>(null);
  const [canGroup, setCanGroup] = useState(false);
  const [canUngroup, setCanUngroup] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelectionChange = () => {
      const activeObj = fabricCanvas.getActiveObject();
      const activeObjects = fabricCanvas.getActiveObjects();
      setActiveObject(activeObj);
      setIsEditing(activeObj?.isEditing || false);
      
      // Check if group/ungroup is possible
      if (fabricCanvas.canGroup) {
        setCanGroup(fabricCanvas.canGroup());
      } else {
        setCanGroup(activeObjects.length >= 2);
      }
      
      if (fabricCanvas.canUngroup) {
        setCanUngroup(fabricCanvas.canUngroup());
      } else {
        setCanUngroup(activeObj !== null && activeObj.type === 'group');
      }
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
      setCopiedObject(activeObject);
    }
  };

  const handleDuplicate = () => {
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

  const handlePaste = () => {
    if (copiedObject) {
      copiedObject.clone((cloned: any) => {
        cloned.set({
          left: (copiedObject.left || 0) + 10,
          top: (copiedObject.top || 0) + 10
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

  const handleGroup = () => {
    if (fabricCanvas && fabricCanvas.groupSelectedObjects) {
      fabricCanvas.groupSelectedObjects();
      fabricCanvas.renderAll();
    }
  };

  const handleUngroup = () => {
    if (fabricCanvas && fabricCanvas.ungroupSelectedObjects) {
      fabricCanvas.ungroupSelectedObjects();
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
        top: position.y
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

      {/* Object Controls */}
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Copy (Ctrl+C)"
      >
        <Copy className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleDuplicate}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Duplicate (Ctrl+D)"
      >
        <Files className="w-4 h-4" />
      </button>
      
      <button
        onClick={handlePaste}
        className={`p-2 rounded-md transition-colors ${
          copiedObject ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
        }`}
        title="Paste (Ctrl+V)"
        disabled={!copiedObject}
      >
        <Clipboard className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleDelete}
        className="p-2 hover:bg-red-100 text-red-600 rounded-md transition-colors"
        title="Delete (Delete key)"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Group/Ungroup Controls */}
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <button
        onClick={handleGroup}
        className={`p-2 rounded-md transition-colors ${
          canGroup ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
        }`}
        title="Group Objects"
        disabled={!canGroup}
      >
        <Layers className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleUngroup}
        className={`p-2 rounded-md transition-colors ${
          canUngroup ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
        }`}
        title="Ungroup Objects"
        disabled={!canUngroup}
      >
        <SquareStack className="w-4 h-4" />
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
