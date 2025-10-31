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
  const isInitializingRef = useRef<boolean>(false);
  
  // Use dynamic canvas dimensions
  const { dimensions, getBaseDimensions, getScaledDimensions } = useCanvasDimensions({
    maxWidth: 750,
    aspectRatio: 0.8, // 800/1000
    minWidth: 300,
    minHeight: 375
  });

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current && !fabricCanvasRef.current && !isInitializingRef.current) {
        isInitializingRef.current = true;
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

          console.log('🎨 Canvas initialized successfully - Objects count:', canvas.getObjects().length);
          onCanvasReady(canvas);
        } catch (error) {
          console.error('Failed to initialize Fabric.js canvas:', error);
          isInitializingRef.current = false;
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
      isInitializingRef.current = false;
    };
  }, [getBaseDimensions]);

  const scaledDimensions = getScaledDimensions();

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto flex items-center justify-center">
      {/* Wrapper div with actual scaled dimensions to ensure proper scrolling */}
      <div 
        style={{
          width: `${scaledDimensions.width * scaledDimensions.scale}px`,
          height: `${scaledDimensions.height * scaledDimensions.scale}px`,
          minWidth: `${scaledDimensions.width * scaledDimensions.scale}px`,
          minHeight: `${scaledDimensions.height * scaledDimensions.scale}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <div 
          className="bg-white shadow-lg focus:outline-none"
          style={{
            width: `${scaledDimensions.width}px`,
            height: `${scaledDimensions.height}px`,
            transform: `scale3d(${scaledDimensions.scale}, ${scaledDimensions.scale}, 1)`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        tabIndex={0}
        onFocus={() => {
          // Ensure canvas gets focus when container is focused
          if (fabricCanvasRef.current) {
            // Fabric.js doesn't have setActive method, just ensure canvas is ready
            fabricCanvasRef.current.requestRenderAll();
          }
        }}
        onClick={(e) => {
          // Ensure container gets focus when clicked
          const container = e.currentTarget;
          if (container && typeof container.focus === 'function') {
            container.focus();
          }
        }}
        onKeyDown={(e) => {
          // Handle Ctrl+A at the container level - this should take precedence
          if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            e.stopPropagation();
            
            if (canvasManagerRef.current) {
              canvasManagerRef.current.selectAllObjects();
            }
            return false;
          }
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          tabIndex={-1}
          style={{
            imageRendering: '-webkit-optimize-contrast',
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        />
        </div>
      </div>
    </div>
  );
}
