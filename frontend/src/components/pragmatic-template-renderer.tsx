"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BuilderComponent {
  id: string;
  type: string;
  content: string;
  style?: React.CSSProperties;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

interface PragmaticTemplateRendererProps {
  templateId: string;
  data?: Record<string, any>;
  className?: string;
  editable?: boolean;
  onContentChange?: (componentIndex: number, changes: any) => void;
}

interface DraggableComponentProps {
  component: BuilderComponent;
  index: number;
  isDragging?: boolean;
  onContentChange?: (componentIndex: number, changes: any) => void;
}

function DraggableComponent({ 
  component, 
  index, 
  isDragging = false, 
  onContentChange 
}: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...component.style,
    position: 'relative' as const,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isSortableDragging ? 0.5 : 1,
    border: isDragging ? '2px solid #10b981' : '2px solid transparent',
    boxShadow: isDragging ? '0 10px 25px rgba(16, 185, 129, 0.3)' : 'none',
  };

  const handleResize = useCallback((direction: string, deltaX: number, deltaY: number) => {
    if (!onContentChange) return;

    const currentWidth = component.size?.width || 200;
    const currentHeight = component.size?.height || 100;
    const currentX = component.position?.x || 0;
    const currentY = component.position?.y || 0;

    let newWidth = currentWidth;
    let newHeight = currentHeight;
    let newX = currentX;
    let newY = currentY;

    switch (direction) {
      case 'right':
        newWidth = Math.max(100, currentWidth + deltaX);
        break;
      case 'left':
        newWidth = Math.max(100, currentWidth - deltaX);
        newX = currentX + deltaX;
        break;
      case 'bottom':
        newHeight = Math.max(50, currentHeight + deltaY);
        break;
      case 'top':
        newHeight = Math.max(50, currentHeight - deltaY);
        newY = currentY + deltaY;
        break;
      case 'bottom-right':
        newWidth = Math.max(100, currentWidth + deltaX);
        newHeight = Math.max(50, currentHeight + deltaY);
        break;
      case 'bottom-left':
        newWidth = Math.max(100, currentWidth - deltaX);
        newHeight = Math.max(50, currentHeight + deltaY);
        newX = currentX + deltaX;
        break;
      case 'top-right':
        newWidth = Math.max(100, currentWidth + deltaX);
        newHeight = Math.max(50, currentHeight - deltaY);
        newY = currentY + deltaY;
        break;
      case 'top-left':
        newWidth = Math.max(100, currentWidth - deltaX);
        newHeight = Math.max(50, currentHeight - deltaY);
        newX = currentX + deltaX;
        newY = currentY + deltaY;
        break;
    }

    onContentChange(index, {
      size: { width: newWidth, height: newHeight },
      position: { x: newX, y: newY }
    });
  }, [component, index, onContentChange]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="resizable-component"
    >
      {/* Resize handles */}
      <div
        className="resize-handle resize-handle-right"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startWidth = component.size?.width || 200;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            handleResize('right', deltaX, 0);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
      <div
        className="resize-handle resize-handle-left"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startWidth = component.size?.width || 200;
          const startXPos = component.position?.x || 0;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            handleResize('left', deltaX, 0);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
      <div
        className="resize-handle resize-handle-bottom"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startY = e.clientY;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            handleResize('bottom', 0, deltaY);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
      <div
        className="resize-handle resize-handle-top"
        onMouseDown={(e) => {
          e.stopPropagation();
          const startY = e.clientY;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            handleResize('top', 0, deltaY);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
      
      {/* Component content */}
      <div 
        style={{ 
          width: component.size?.width || 200, 
          height: component.size?.height || 100,
          padding: '8px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}
      >
        {component.content}
      </div>
    </div>
  );
}

export function PragmaticTemplateRenderer({ 
  templateId, 
  data = {}, 
  className = '', 
  editable = false,
  onContentChange
}: PragmaticTemplateRendererProps) {
  const [components, setComponents] = useState<BuilderComponent[]>([
    {
      id: '1',
      type: 'text',
      content: 'Sample Text Component',
      style: { position: 'absolute', left: '50px', top: '50px' },
      size: { width: 200, height: 100 }
    },
    {
      id: '2',
      type: 'text',
      content: 'Another Component',
      style: { position: 'absolute', left: '300px', top: '100px' },
      size: { width: 150, height: 80 }
    }
  ]);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };

  const handleContentChange = useCallback((componentIndex: number, changes: any) => {
    if (!onContentChange) return;
    
    setComponents(prev => {
      const newComponents = [...prev];
      newComponents[componentIndex] = {
        ...newComponents[componentIndex],
        ...changes
      };
      return newComponents;
    });
    
    onContentChange(componentIndex, changes);
  }, [onContentChange]);

  const activeComponent = components.find(component => component.id === activeId);

  return (
    <div className={`pragmatic-template-renderer ${className}`}>
      <style jsx>{`
        .pragmatic-template-renderer {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 600px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .resizable-component {
          position: absolute;
          z-index: 1;
        }
        
        .resize-handle {
          position: absolute;
          background: #10b981;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .resizable-component:hover .resize-handle {
          opacity: 1;
        }
        
        .resize-handle-right {
          top: 50%;
          right: -4px;
          width: 8px;
          height: 20px;
          transform: translateY(-50%);
          cursor: ew-resize;
        }
        
        .resize-handle-left {
          top: 50%;
          left: -4px;
          width: 8px;
          height: 20px;
          transform: translateY(-50%);
          cursor: ew-resize;
        }
        
        .resize-handle-bottom {
          bottom: -4px;
          left: 50%;
          width: 20px;
          height: 8px;
          transform: translateX(-50%);
          cursor: ns-resize;
        }
        
        .resize-handle-top {
          top: -4px;
          left: 50%;
          width: 20px;
          height: 8px;
          transform: translateX(-50%);
          cursor: ns-resize;
        }
      `}</style>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {components.map((component, index) => (
            <DraggableComponent
              key={component.id}
              component={component}
              index={index}
              isDragging={activeId === component.id}
              onContentChange={handleContentChange}
            />
          ))}
        </SortableContext>
        
        <DragOverlay>
          {activeComponent ? (
            <div
              style={{
                ...activeComponent.style,
                opacity: 0.8,
                transform: 'rotate(5deg)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              }}
            >
              {activeComponent.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
