'use client';

import { useEffect, useRef } from 'react';
import { useCanvasDimensions } from '@/hooks/useCanvasDimensions';
import { FabricCanvasManager } from '@/lib/fabric-utils';
import { FabricCanvas, CanvasConfig } from '@/lib/fabric-types';

interface ResumeBuilderCanvasProps {
  onCanvasReady: (canvas: any) => void;
  onStateChange?: (state: string) => void;
}

export default function ResumeBuilderCanvas({ onCanvasReady, onStateChange }: ResumeBuilderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const canvasManagerRef = useRef<FabricCanvasManager | null>(null);
  
  // Use dynamic canvas dimensions
  const { dimensions, getBaseDimensions, getScaledDimensions } = useCanvasDimensions({
    maxWidth: 750,
    aspectRatio: 0.8, // 800/1000
    minWidth: 300,
    minHeight: 375
  });

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current && !fabricCanvasRef.current) {
        try {
          const baseDimensions = getBaseDimensions();
          
          // Modern canvas configuration
          const canvasConfig: CanvasConfig = {
            width: baseDimensions.width,
            height: baseDimensions.height,
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true,
            allowTouchScrolling: true,
            fireRightClick: true,
            stopContextMenu: false,
          };

          // Create modern canvas manager
          const canvasManager = new FabricCanvasManager(
            canvasRef.current,
            canvasConfig,
            undefined, // Use default object controls
            {
              onObjectAdded: () => {
                if (onStateChange && canvasManager.getCanvas()) {
                  const state = JSON.stringify(canvasManager.getCanvas()?.toJSON());
                  onStateChange(state);
                }
              },
              onObjectRemoved: () => {
                if (onStateChange && canvasManager.getCanvas()) {
                  const state = JSON.stringify(canvasManager.getCanvas()?.toJSON());
                  onStateChange(state);
                }
              },
              onObjectModified: () => {
                if (onStateChange && canvasManager.getCanvas()) {
                  const state = JSON.stringify(canvasManager.getCanvas()?.toJSON());
                  onStateChange(state);
                }
              },
            }
          );

          // Initialize the canvas
          const canvas = await canvasManager.initialize();

          // Apply initial zoom (canvas always renders at 100% internally)
          canvas.setZoom(1);
          
          // Ensure initial render
          canvas.requestRenderAll();

          // Store references for cleanup
          canvasManagerRef.current = canvasManager;
          fabricCanvasRef.current = canvas;
          
          // Add method to restore state from parent (for template loading)
          canvas.restoreFromState = (state: string) => {
            try {
              canvas.loadFromJSON(state, () => {
                canvas.requestRenderAll();
              });
            } catch (error) {
              console.error('Error restoring canvas state from parent:', error);
            }
          };

          //console.log('🎨 Canvas initialized successfully - Objects count:', canvas.getObjects().length);
          onCanvasReady(canvas);
        } catch (error) {
          console.error('Failed to initialize Fabric.js canvas:', error);
        }
      }
    };

    initCanvas();

    return () => {
      if (canvasManagerRef.current) {
        canvasManagerRef.current.dispose();
        canvasManagerRef.current = null;
      }
      fabricCanvasRef.current = null;
    };
  }, [onCanvasReady, getBaseDimensions, onStateChange]);

  const scaledDimensions = getScaledDimensions();

  return (
    <div className="w-full h-full bg-gray-50 flex items-start justify-center overflow-auto">
      <div 
        className="my-8 bg-white shadow-lg transition-all duration-300 ease-in-out focus:outline-none"
        style={{
          width: `${scaledDimensions.width}px`,
          height: `${scaledDimensions.height}px`,
          transform: `scale(${scaledDimensions.scale})`,
          transformOrigin: 'top center'
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          // Handle Ctrl+A at the container level
          if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            e.stopPropagation();
            
            if (fabricCanvasRef.current) {
              const canvas = fabricCanvasRef.current;
              canvas.discardActiveObject();
              const allObjects = canvas.getObjects();
              if (allObjects.length > 0) {
                const selection = new (window as any).fabric.ActiveSelection(allObjects, {
                  canvas: canvas,
                });
                canvas.setActiveObject(selection);
                canvas.requestRenderAll();
              }
            }
          }
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
        />
      </div>
    </div>
  );
}
