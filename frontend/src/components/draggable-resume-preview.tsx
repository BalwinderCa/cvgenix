"use client";

import React, { useState } from 'react';
import { DatabaseResumePreview } from './database-resume-preview';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Move, RotateCcw, Maximize2, Minimize2, Grid3X3, Lock, Unlock } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableResumePreviewProps {
  templateId: string;
  data?: Record<string, any>;
  className?: string;
  editable?: boolean;
}

export function DraggableResumePreview({ 
  templateId, 
  data = {}, 
  className = '', 
  editable = false 
}: DraggableResumePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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
    setActiveId(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const resetPreview = () => {
    // Reset any state if needed
  };

  const containerStyle = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } : {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto'
  };

  return (
    <div className={`draggable-resume-preview ${className}`} style={containerStyle}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLock}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetPreview}
          className="bg-white/90 backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Settings Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="snap-to-grid"
            checked={snapToGrid}
            onCheckedChange={setSnapToGrid}
            disabled={isLocked}
          />
          <Label htmlFor="snap-to-grid" className="text-sm">
            Snap to Grid
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={setShowGrid}
            disabled={isLocked}
          />
          <Label htmlFor="show-grid" className="text-sm">
            Show Grid
          </Label>
        </div>
      </div>

      {/* Grid Overlay */}
      {showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            opacity: 0.5
          }}
        />
      )}

      {/* Resume Preview */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="resume-container"
          style={{
            position: 'relative',
            width: isFullscreen ? '90vw' : '100%',
            height: isFullscreen ? '90vh' : 'auto',
            maxWidth: isFullscreen ? 'none' : '800px',
            maxHeight: isFullscreen ? 'none' : '1000px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            transform: isLocked ? 'none' : undefined,
            cursor: isLocked ? 'default' : 'grab',
            transition: 'all 0.3s ease'
          }}
        >
          <DatabaseResumePreview 
            templateId={templateId}
            data={data}
            editable={editable && !isLocked}
            className="w-full h-full"
          />
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div
              style={{
                opacity: 0.8,
                transform: 'rotate(5deg)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '400px'
              }}
            >
              <div className="text-sm text-gray-600">Resume Preview</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}