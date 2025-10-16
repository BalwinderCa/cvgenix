"use client";

import React, { useEffect, useRef, useState } from 'react';
import { loadFabric } from '@/lib/fabric-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, FileText, Loader2, Lock, Unlock, Move, RotateCcw } from 'lucide-react';
import { useCanvasDimensions } from '@/hooks/useCanvasDimensions';

interface CanvasTemplate {
  _id: string;
  name: string;
  renderEngine: string;
  canvasData: any;
}

interface CanvasTemplateRendererProps {
  templateId: string;
  data?: Record<string, any>;
  className?: string;
  editable?: boolean;
  onContentChange?: (objectId: string, newData: any) => void;
}

export function CanvasTemplateRenderer({ templateId, data, className = '', editable = false, onContentChange }: CanvasTemplateRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [template, setTemplate] = useState<CanvasTemplate | null>(null);
  const [fabric, setFabric] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(editable);
  
  // Use dynamic canvas dimensions
  const { dimensions } = useCanvasDimensions({
    maxWidth: 750,
    aspectRatio: 0.8, // 4:5 ratio
    padding: 32,
    minHeight: 400
  });

  // Load template
  const loadTemplate = async () => {
    if (!templateId) return;
    
    setLoading(true);
    setError('');

    try {
      const templateResponse = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (!templateResponse.ok) {
        throw new Error('Template not found');
      }
      
      const templateData = await templateResponse.json();
      
      // Check if this is a canvas template
      if (templateData.renderEngine !== 'canvas') {
        throw new Error('This template is not a canvas template');
      }
      
      setTemplate(templateData);
      setHasLoaded(true);
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  // Load Fabric.js
  useEffect(() => {
    const initFabric = async () => {
      const fabricInstance = await loadFabric();
      setFabric(fabricInstance);
    };
    initFabric();
  }, []);

  // Initialize canvas when template is loaded
  useEffect(() => {
    if (canvasRef.current && template && template.canvasData && !canvas && fabric) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: '#ffffff',
        selection: editable, // Enable selection for editing
        interactive: editable, // Make it interactive for editing
      });

      // Load canvas data
      fabricCanvas.loadFromJSON(template.canvasData, () => {
        // If data is provided, replace template variables
        if (data) {
          replaceTemplateVariables(fabricCanvas, data);
        }
        
        // Enable interactions for all objects if editable
        if (editable) {
          fabricCanvas.forEachObject((obj: any) => {
            obj.set({
              selectable: !isLocked,
              evented: !isLocked,
              lockMovementX: isLocked,
              lockMovementY: isLocked,
              lockRotation: isLocked,
              lockScalingX: isLocked,
              lockScalingY: isLocked,
              // Add hover effects
              hoverCursor: isLocked ? 'not-allowed' : 'move',
              moveCursor: isLocked ? 'not-allowed' : 'move',
            });
          });

          // Add hover effects
          fabricCanvas.on('mouse:over', (e: any) => {
            if (!isLocked && editable) {
              const obj = e.target;
              obj.set({
                borderColor: '#3b82f6',
                borderWidth: 1,
                borderDashArray: [3, 3],
              });
              fabricCanvas.renderAll();
            }
          });

          fabricCanvas.on('mouse:out', (e: any) => {
            if (!isLocked && editable) {
              const obj = e.target;
              // Only remove border if not selected
              if (!obj.selected) {
                obj.set({
                  borderColor: 'transparent',
                  borderWidth: 0,
                  borderDashArray: null,
                });
                fabricCanvas.renderAll();
              }
            }
          });
        }
        
        fabricCanvas.renderAll();
      });

      // Add event listeners for object modifications
      if (editable) {
        fabricCanvas.on('object:modified', (e: any) => {
          const obj = e.target;
          if (onContentChange) {
            onContentChange(obj.id || obj.type, {
              left: obj.left,
              top: obj.top,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              angle: obj.angle,
              width: obj.width,
              height: obj.height
            });
          }
        });

        fabricCanvas.on('object:moving', (e: any) => {
          // Add visual feedback during movement
          const obj = e.target;
          obj.set('shadow', {
            color: 'rgba(59, 130, 246, 0.5)',
            blur: 10,
            offsetX: 0,
            offsetY: 4
          });
          fabricCanvas.renderAll();
        });

        fabricCanvas.on('object:scaling', (e: any) => {
          // Add visual feedback during scaling
          const obj = e.target;
          obj.set('shadow', {
            color: 'rgba(16, 185, 129, 0.5)',
            blur: 10,
            offsetX: 0,
            offsetY: 4
          });
          fabricCanvas.renderAll();
        });

        fabricCanvas.on('object:moved', (e: any) => {
          // Remove shadow after movement
          const obj = e.target;
          obj.set('shadow', null);
          fabricCanvas.renderAll();
        });

        fabricCanvas.on('object:scaled', (e: any) => {
          // Remove shadow after scaling
          const obj = e.target;
          obj.set('shadow', null);
          fabricCanvas.renderAll();
        });

        // Enhanced selection feedback
        fabricCanvas.on('selection:created', (e: any) => {
          const obj = e.selected[0];
          obj.set({
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderDashArray: [5, 5],
            cornerColor: '#3b82f6',
            cornerSize: 12,
            cornerStyle: 'circle',
            transparentCorners: false
          });
          fabricCanvas.renderAll();
        });

        fabricCanvas.on('selection:updated', (e: any) => {
          const obj = e.selected[0];
          obj.set({
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderDashArray: [5, 5],
            cornerColor: '#3b82f6',
            cornerSize: 12,
            cornerStyle: 'circle',
            transparentCorners: false
          });
          fabricCanvas.renderAll();
        });

        fabricCanvas.on('selection:cleared', (e: any) => {
          // Reset all objects to default appearance
          fabricCanvas.forEachObject((obj: any) => {
            obj.set({
              borderColor: 'transparent',
              borderWidth: 0,
              borderDashArray: null,
              cornerColor: 'transparent',
              cornerSize: 0,
              cornerStyle: 'rect',
              transparentCorners: true
            });
          });
          fabricCanvas.renderAll();
        });
      }

      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [template, canvasRef.current, fabric, editable, isLocked]);

  // Update object interactions when lock state changes
  useEffect(() => {
    if (canvas && editable) {
      canvas.forEachObject((obj: any) => {
        obj.set({
          selectable: !isLocked,
          evented: !isLocked,
          lockMovementX: isLocked,
          lockMovementY: isLocked,
          lockRotation: isLocked,
          lockScalingX: isLocked,
          lockScalingY: isLocked,
        });
      });
      canvas.renderAll();
    }
  }, [canvas, isLocked, editable]);

  // Load template when component mounts
  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  // Replace template variables in canvas objects
  const replaceTemplateVariables = (fabricCanvas: any, data: Record<string, any>) => {
    fabricCanvas.forEachObject((obj: any) => {
      if (obj.type === 'textbox' || obj.type === 'text') {
        const textObj = obj;
        let text = textObj.text || '';
        
        // Replace simple variables like {{firstName}}
        text = text.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
          return data[key] || match;
        });
        
        // Replace nested variables like {{personalInfo.firstName}}
        text = text.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match: string, obj: string, key: string) => {
          return data[obj]?.[key] || match;
        });
        
        textObj.set('text', text);
      }
    });
  };

  // Loading state
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Canvas Template</h3>
      <p className="text-gray-600 text-sm">Rendering visual template...</p>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Render Error</h3>
      <p className="text-gray-600 mb-4 text-sm">{error}</p>
      <Button 
        onClick={loadTemplate}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );

  // If loading, show loading state
  if (loading) {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
          <ErrorState />
        </CardContent>
      </Card>
    );
  }

  // If we have template data, render it using canvas
  if (hasLoaded && template && template.canvasData) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        {/* Control Panel */}
        {showControls && (
          <div className="mb-4 space-y-4">
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id="lock-canvas"
                  checked={isLocked}
                  onCheckedChange={setIsLocked}
                />
                <Label htmlFor="lock-canvas" className="flex items-center gap-1">
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {isLocked ? 'Unlock' : 'Lock'} Elements
                </Label>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                isLocked 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                <Move className="w-4 h-4" />
                {isLocked ? 'Elements are locked - cannot be moved' : 'Click on text blocks to select • Drag to move • Use corner handles to resize'}
              </div>
            </div>

          </div>
        )}

        <div style={{
          width: '100%',
          maxWidth: `${dimensions.width}px`,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          minHeight: `${dimensions.height}px`,
          position: 'relative',
          transform: dimensions.scale < 1 ? `scale(${dimensions.scale})` : 'none',
          transformOrigin: 'top center'
        }}>
          <canvas
            ref={canvasRef}
            className={`border border-gray-300 rounded shadow-lg ${editable ? 'cursor-crosshair' : ''}`}
            style={{
              cursor: editable ? (isLocked ? 'not-allowed' : 'crosshair') : 'default',
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`
            }}
          />
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
      <CardContent className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Canvas Data</h3>
          <p className="text-sm text-gray-600 mb-4">Canvas template data not available.</p>
          <Button
            onClick={loadTemplate}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
