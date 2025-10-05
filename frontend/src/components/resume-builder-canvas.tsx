'use client';

import { useEffect, useRef } from 'react';
import { loadFabric } from '@/lib/fabric-loader';

interface ResumeBuilderCanvasProps {
  onCanvasReady: (canvas: any) => void;
  zoomLevel: number;
}

export default function ResumeBuilderCanvas({ onCanvasReady, zoomLevel }: ResumeBuilderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);

  useEffect(() => {
    const initCanvas = async () => {
      if (canvasRef.current && !fabricCanvasRef.current) {
        try {
          const fabric = await loadFabric();
          
          if (!fabric) {
            console.error('Fabric.js not available');
            return;
          }
          
          const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 1000,
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true,
          });

          // Configure canvas controls
          fabric.Object.prototype.set({
            borderColor: '#3b82f6',
            cornerColor: '#ffffff',
            cornerStrokeColor: '#999999',
            cornerStyle: 'circle',
            cornerSize: 12,
            transparentCorners: false,
            borderScaleFactor: 2,
            lockRotation: true, // Disable rotation
            hasRotatingPoint: false, // Remove rotation handle
            originX: 'left', // Keep text anchored to left
            originY: 'top', // Keep text anchored to top
          });

          // Set control visibility for all objects
          fabric.Object.prototype.setControlsVisibility({
            mt: false, mb: false, mtr: false, // Hide rotation handle
            ml: true, mr: true, // Keep middle left and right handles
            tl: true, tr: true, bl: true, br: true
          });

          // Initialize undo/redo system
          canvas.history = [];
          canvas.historyIndex = -1;
          
          const saveState = () => {
            const state = JSON.stringify(canvas.toJSON());
            canvas.history = canvas.history.slice(0, canvas.historyIndex + 1);
            canvas.history.push(state);
            canvas.historyIndex++;
            
            // Limit history to 20 states
            if (canvas.history.length > 20) {
              canvas.history.shift();
              canvas.historyIndex--;
            }
          };

          const undo = () => {
            if (canvas.historyIndex > 0) {
              canvas.historyIndex--;
              const state = canvas.history[canvas.historyIndex];
              canvas.loadFromJSON(state, () => {
                canvas.renderAll();
              });
            }
          };

          const redo = () => {
            if (canvas.historyIndex < canvas.history.length - 1) {
              canvas.historyIndex++;
              const state = canvas.history[canvas.historyIndex];
              canvas.loadFromJSON(state, () => {
                canvas.renderAll();
              });
            }
          };

          // Add methods to canvas
          canvas.saveState = saveState;
          canvas.undo = undo;
          canvas.redo = redo;

          // Enable undo/redo
          canvas.on('object:added', saveState);
          canvas.on('object:removed', saveState);
          canvas.on('object:modified', saveState);

          // Disable scaling for text objects and use custom resize
          canvas.on('object:scaling', (e: any) => {
            const obj = e.target;
            if (!obj || (obj.type !== 'textbox' && obj.type !== 'text')) return;

            // Prevent default scaling behavior
            e.e.preventDefault();
            e.e.stopPropagation();

            // Get the current dimensions
            const currentWidth = obj.width;
            const currentHeight = obj.height;

            // Calculate new dimensions based on scale
            const newWidth = currentWidth * obj.scaleX;
            const newHeight = currentHeight * obj.scaleY;

            // Apply new size without changing position
            obj.set({
              width: newWidth,
              height: newHeight,
              scaleX: 1,
              scaleY: 1
            });

            // Update control coordinates
            obj.setCoords();
            canvas.renderAll();
          });

          fabricCanvasRef.current = canvas;
          onCanvasReady(canvas);
        } catch (error) {
          console.error('Failed to initialize Fabric.js canvas:', error);
        }
      }
    };

    initCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [onCanvasReady]);

  return (
    <div className="w-full h-full bg-gray-50 p-4">
      <div className="flex items-center justify-center min-h-full">
        <div 
          className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-200"
          style={{ 
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center center'
          }}
        >
          <canvas
            ref={canvasRef}
            className="block"
          />
        </div>
      </div>
    </div>
  );
}
