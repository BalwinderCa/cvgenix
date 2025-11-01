'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Download, Trash2, ZoomIn, ZoomOut, PanelLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';
import ResumeBuilderSidebar from '@/components/resume-builder-sidebar';
import ResumeBuilderTopBar from '@/components/resume-builder-topbar';
import ResumeBuilderCanvas from '@/components/resume-builder-canvas';
import CanvasEditToolbar from '@/components/canvas-edit-toolbar';
import { CanvasEditManager } from '@/components/canvas/CanvasEditManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useCanvasDimensions } from '@/hooks/useCanvasDimensions';
import { TemplateService } from '@/services/templateService';
import { ExportState } from '@/types/canvas';

export default function ResumeBuilderPage() {
  const [activeSidebarTab, setActiveSidebarTab] = useState('design');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [exportState, setExportState] = useState<ExportState>({
    exportFormat: 'PNG'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const isDraggingSlider = useRef(false);
  const zoomUpdateFrame = useRef<number | null>(null);

  // Use the canvas manager hook
  const {
    canvasState,
    editToolbarState,
    getFabricInstance,
    handleCanvasReady,
    handleStateChange,
    handleDeleteSelected,
    handleCloseEditToolbar,
    updateEditToolbarState,
    updateCanvasState,
    registerCleanup,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  } = useCanvasManager();

  // Template service instance
  const templateService = TemplateService.getInstance();
  
  // Canvas dimensions hook
  const { getBaseDimensions, getScaledDimensions } = useCanvasDimensions({
    maxWidth: 750,
    aspectRatio: 0.8,
    minWidth: 300,
    minHeight: 375
  });

  // Handle save
  const handleSave = useCallback(() => {
    if (canvasState.fabricCanvas) {
      const data = canvasState.fabricCanvas.toJSON();
      console.log('Saving canvas data:', data);
      // Implement save logic here
    }
  }, [canvasState.fabricCanvas]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (canvasState.fabricCanvas) {
      const format = exportState.exportFormat.toLowerCase();
      
      if (format === 'pdf') {
        // Handle PDF export differently
        try {
          // Convert canvas to high-quality image first
          const dataURL = canvasState.fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
          });
          
          // Create a new window with the image and print it as PDF
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Resume Export</title>
                  <style>
                    body { 
                      margin: 0; 
                      padding: 0; 
                      background: white;
                    }
                    img { 
                      width: 100%; 
                      height: auto; 
                      display: block; 
                      margin: 0;
                      padding: 0;
                    }
                    @media print {
                      body { 
                        margin: 0; 
                        padding: 0;
                        background: white;
                      }
                      img { 
                        width: 100%; 
                        height: auto; 
                        page-break-inside: avoid;
                        margin: 0;
                        padding: 0;
                      }
                      @page {
                        margin: 0;
                        padding: 0;
                        size: auto;
                      }
                    }
                  </style>
                </head>
                <body>
                  <img src="${dataURL}" alt="Resume" />
                  <script>
                    window.onload = function() {
                      // Remove headers and footers
                      const style = document.createElement('style');
                      style.textContent = \`
                        @page {
                          margin: 0 !important;
                          padding: 0 !important;
                          size: auto !important;
                        }
                        @media print {
                          body { margin: 0 !important; padding: 0 !important; }
                          img { margin: 0 !important; padding: 0 !important; }
                        }
                      \`;
                      document.head.appendChild(style);
                      
                      // Print without headers/footers
                      window.print();
                      window.onafterprint = function() {
                        window.close();
                      };
                    };
                  </script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        } catch (error) {
          console.error('PDF export error:', error);
          alert('PDF export failed. Please try again or use PNG/JPEG export instead.');
        }
      } else {
        // Handle image exports (PNG, JPG)
        const dataURL = canvasState.fabricCanvas.toDataURL({
          format: format,
          quality: format === 'jpg' ? 0.9 : 1,
          multiplier: 2
        });
        
        const link = document.createElement('a');
        link.download = `resume.${format}`;
        link.href = dataURL;
        link.click();
      }
    }
  }, [canvasState.fabricCanvas, exportState.exportFormat]);

  // Handle template selection
  const handleTemplateSelect = useCallback(async (templateId: string) => {
    // Prevent loading the same template if it's already loaded
    if (canvasState.currentTemplateId === templateId && !isLoading) {
      console.log('Template already loaded, skipping...');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      updateCanvasState({ currentTemplateId: templateId });
      const baseDimensions = getBaseDimensions();
      await templateService.loadTemplateIntoCanvas(canvasState.fabricCanvas, templateId, baseDimensions);
      
      // Initialize undo/redo history with the loaded template
      setTimeout(() => {
        if (canvasState.fabricCanvas && canvasState.fabricCanvas.initializeHistory) {
          canvasState.fabricCanvas.initializeHistory();
        }
        const initialState = JSON.stringify(canvasState.fabricCanvas.toJSON());
        updateCanvasState({ canvasState: initialState });
      }, 100);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load template';
      setError(errorMessage);
      console.error('Error loading template:', err);
    } finally {
      setIsLoading(false);
    }
  }, [canvasState.fabricCanvas, canvasState.currentTemplateId, templateService, updateCanvasState, getBaseDimensions, isLoading]);

  // Handle export format change
  const handleExportFormatChange = useCallback((format: 'PNG' | 'PDF' | 'JPG') => {
    setExportState(prev => ({
      ...prev,
      exportFormat: format
    }));
  }, []);

  // Sync zoom level with canvas
  useEffect(() => {
    if (!canvasState.fabricCanvas) return;
    
    try {
      const currentZoom = (canvasState.fabricCanvas as any).getZoom?.() || 1;
      setZoomLevel(Math.round(currentZoom * 100));
    } catch (error) {
      console.error('Error getting zoom level:', error);
    }
  }, [canvasState.fabricCanvas]);

  // Handle zoom change - scales the entire canvas container (keeps content proportional)
  const handleZoomChange = useCallback((zoom: number, immediate = false) => {
    if (!canvasState.fabricCanvas) return;
    
    try {
      const zoomValue = zoom / 100;
      
      // Find the canvas container (white div with shadow) and wrapper using class selectors
      const containerElement = document.querySelector('.canvas-container') as HTMLElement;
      const wrapperElement = document.querySelector('.canvas-zoom-wrapper') as HTMLElement;
      
      if (containerElement && wrapperElement) {
        // Get base dimensions (800x1000) - this is what the canvas is actually sized to
        const baseDimensions = getBaseDimensions();
        const baseWidth = baseDimensions.width;
        const baseHeight = baseDimensions.height;
        
        // Get the current responsive scale from useCanvasDimensions
        const scaledDimensions = getScaledDimensions();
        const responsiveScale = scaledDimensions.scale || 1;
        
        // Calculate combined scale: responsive scale * user zoom
        const combinedScale = responsiveScale * zoomValue;
        
        // Calculate what the scaled size would be after zoom (based on base canvas dimensions)
        const scaledWidth = baseWidth * combinedScale;
        const scaledHeight = baseHeight * combinedScale;
        
        // Use scale3d for better GPU acceleration - use the full combined scale
        // Don't constrain - allow scrolling when zoomed beyond viewport
        const newTransform = `scale3d(${combinedScale}, ${combinedScale}, 1)`;
        
        // Calculate final scaled dimensions (wrapper uses actual scaled size for proper scrolling)
        const finalScaledWidth = baseWidth * combinedScale;
        const finalScaledHeight = baseHeight * combinedScale;
        
        if (immediate) {
          // During drag - direct synchronous updates
          // Wrapper should be exactly the scaled size to allow proper scrolling
          wrapperElement.style.transition = 'none';
          // Set wrapper to EXACT scaled size - no constraints whatsoever
          wrapperElement.style.width = `${finalScaledWidth}px`;
          wrapperElement.style.height = `${finalScaledHeight}px`;
          wrapperElement.style.minWidth = `${finalScaledWidth}px`;
          wrapperElement.style.minHeight = `${finalScaledHeight}px`;
          wrapperElement.style.maxWidth = 'none';
          wrapperElement.style.maxHeight = 'none';
          wrapperElement.style.margin = 'auto';
          wrapperElement.style.flexShrink = '0';
          wrapperElement.style.boxSizing = 'border-box';
          wrapperElement.style.overflow = 'visible';
          wrapperElement.style.display = 'flex';
          wrapperElement.style.alignItems = 'center';
          wrapperElement.style.justifyContent = 'center';
          wrapperElement.style.position = 'relative';
          
          // Container is base size, scaled by transform
          containerElement.style.transition = 'none';
          containerElement.style.willChange = 'transform';
          containerElement.style.backfaceVisibility = 'hidden';
          containerElement.style.webkitBackfaceVisibility = 'hidden';
          containerElement.style.transformOrigin = 'center center';
          containerElement.style.width = `${baseWidth}px`;
          containerElement.style.height = `${baseHeight}px`;
          containerElement.style.overflow = 'visible';
          containerElement.style.boxSizing = 'border-box';
          containerElement.style.transform = newTransform;
        } else {
          // For button clicks - smooth animation
          if (zoomUpdateFrame.current !== null) {
            cancelAnimationFrame(zoomUpdateFrame.current);
          }
          
          zoomUpdateFrame.current = requestAnimationFrame(() => {
            zoomUpdateFrame.current = null;
            
            wrapperElement.style.transition = 'none';
            wrapperElement.style.width = `${finalScaledWidth}px`;
            wrapperElement.style.height = `${finalScaledHeight}px`;
            wrapperElement.style.minWidth = `${finalScaledWidth}px`;
            wrapperElement.style.minHeight = `${finalScaledHeight}px`;
            wrapperElement.style.maxWidth = 'none';
            wrapperElement.style.maxHeight = 'none';
            
            containerElement.style.transition = 'transform 0.2s ease-out';
            containerElement.style.willChange = 'transform';
            containerElement.style.backfaceVisibility = 'hidden';
            containerElement.style.webkitBackfaceVisibility = 'hidden';
            containerElement.style.transformOrigin = 'center center';
            containerElement.style.width = `${baseWidth}px`;
            containerElement.style.height = `${baseHeight}px`;
            containerElement.style.overflow = 'visible';
            containerElement.style.boxSizing = 'border-box';
            containerElement.style.transform = newTransform;
          });
        }
        
        // Find the scrollable parent container and ensure it can scroll properly
        // Only target the canvas scroll container, not any parent flex containers
        const scrollContainer = containerElement.closest('.bg-gray-50.overflow-auto');
        if (scrollContainer) {
          const scrollEl = scrollContainer as HTMLElement;
          // Ensure overflow works
          scrollEl.style.overflow = 'auto';
          scrollEl.style.overflowX = 'auto';
          scrollEl.style.overflowY = 'auto';
        }
      }
      
      // DO NOT call setZoom() - this would affect the canvas viewport independently
      // We want the entire container to scale, keeping all content in proportion
      // The canvas stays at 1:1 internally, only the wrapper scales
      
      setZoomLevel(Math.round(zoom));
    } catch (error) {
      console.error('Error setting zoom:', error);
    }
  }, [canvasState.fabricCanvas, getScaledDimensions]);

  // Error fallback component
  const errorFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Canvas Error
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {error || 'An error occurred while loading the canvas.'}
          </p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // Show error state
  if (error) {
    return errorFallback;
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <div className="h-screen bg-gray-50 flex flex-col">
        <NavigationHeader />
      
        <div className="flex-1 flex overflow-hidden mt-16 relative">
          {/* Sidebar */}
          <div className={`bg-white flex-shrink-0 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-96 border-r border-gray-200'
          }`}>
            {!isSidebarCollapsed && (
              <ResumeBuilderSidebar
                fabricCanvas={canvasState.fabricCanvas}
                activeSidebarTab={activeSidebarTab}
                setActiveSidebarTab={setActiveSidebarTab}
                currentTemplateId={canvasState.currentTemplateId}
                onTemplateSelect={handleTemplateSelect}
              />
            )}
          </div>

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute top-1/2 z-20 transition-all duration-300 ease-in-out"
            style={{
              transform: isSidebarCollapsed 
                ? 'translateY(-50%) scaleX(-1)' 
                : 'translateY(-50%)',
              left: isSidebarCollapsed ? '0' : 'calc(384px - 1px)'
            }}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <div className={`
              bg-white
              ${isSidebarCollapsed 
                ? 'border border-gray-200 rounded-l-lg' 
                : 'border-t border-b border-r border-gray-200 border-l-0 rounded-r-lg'}
              hover:bg-gray-50
              transition-all duration-200 ease-in-out
              flex items-center justify-center
              w-6 h-16
              cursor-pointer
            `}>
              <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
            </div>
          </button>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="flex-shrink-0">
              <ResumeBuilderTopBar
                fabricCanvas={canvasState.fabricCanvas}
                onSave={handleSave}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo()}
                canRedo={canRedo()}
              />
            </div>
            
            {/* Canvas Area with Scroll */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                  <LoadingSpinner text="Loading template..." />
                </div>
              )}
              
              <ResumeBuilderCanvas
                onCanvasReady={handleCanvasReady}
                onStateChange={handleStateChange}
              />
              
              {/* Canvas Edit Manager */}
              {canvasState.fabricCanvas && (
                <CanvasEditManager
                  canvas={canvasState.fabricCanvas}
                  getFabricInstance={getFabricInstance}
                  onEditToolbarUpdate={updateEditToolbarState}
                  registerCleanup={registerCleanup}
                />
              )}
              
              
              {/* Fixed Footer with Controls */}
              <div className="flex-shrink-0 h-12 bg-white border-t border-gray-200 flex items-center justify-between px-4">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newZoom = Math.max(25, zoomLevel - 10);
                      handleZoomChange(newZoom, false); // Smooth animation for button clicks
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Zoom Out"
                    disabled={zoomLevel <= 25}
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="25"
                      max="200"
                      step="1"
                      value={zoomLevel}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setZoomLevel(value);
                        handleZoomChange(value, true); // Smooth update
                      }}
                      onInput={(e) => {
                        const value = parseInt((e.target as HTMLInputElement).value);
                        setZoomLevel(value);
                        handleZoomChange(value, true); // Smooth update while dragging
                      }}
                      className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoomLevel - 25) / 175) * 100}%, #e5e7eb ${((zoomLevel - 25) / 175) * 100}%, #e5e7eb 100%)`
                      }}
                      title={`Zoom: ${zoomLevel}%`}
                    />
                    <style dangerouslySetInnerHTML={{__html: `
                      .zoom-slider {
                        -webkit-appearance: none;
                        appearance: none;
                        height: 6px;
                        border-radius: 3px;
                        outline: none;
                      }
                      .zoom-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: #3b82f6;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                        transition: all 0.2s;
                      }
                      .zoom-slider::-webkit-slider-thumb:hover {
                        transform: scale(1.1);
                        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
                      }
                      .zoom-slider::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: #3b82f6;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                        transition: all 0.2s;
                      }
                      .zoom-slider::-moz-range-thumb:hover {
                        transform: scale(1.1);
                        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
                      }
                    `}} />
                    <span className="text-xs text-gray-600 min-w-[3.5rem] text-center font-medium">
                      {zoomLevel}%
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      const newZoom = Math.min(200, zoomLevel + 10);
                      handleZoomChange(newZoom, false); // Smooth animation for button clicks
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Zoom In"
                    disabled={zoomLevel >= 200}
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Export Controls */}
                <div className="flex items-center space-x-2">
                  {/* Export Format Dropdown */}
                  <select
                    value={exportState.exportFormat}
                    onChange={(e) => handleExportFormatChange(e.target.value as 'PNG' | 'PDF' | 'JPG')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    title="Export Format"
                  >
                    <option value="PNG">PNG</option>
                    <option value="PDF">PDF</option>
                    <option value="JPG">JPG</option>
                  </select>

                  {/* Export Button */}
                  <button 
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 border border-primary rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit Toolbar */}
        <CanvasEditToolbar
          fabricCanvas={canvasState.fabricCanvas}
          isVisible={editToolbarState.showEditToolbar}
          position={editToolbarState.editToolbarPosition}
          onClose={handleCloseEditToolbar}
        />
      </div>
    </ErrorBoundary>
  );
}