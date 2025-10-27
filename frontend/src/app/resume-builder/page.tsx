'use client';

import { useState, useCallback } from 'react';
import { Download, Trash2 } from 'lucide-react';
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
  const [exportState, setExportState] = useState<ExportState>({
    exportFormat: 'PNG'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const { getBaseDimensions } = useCanvasDimensions({
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
      
        <div className="flex-1 flex overflow-hidden mt-16">
          {/* Sidebar */}
          <div className="w-96 bg-white border-r border-gray-200 flex-shrink-0">
            <ResumeBuilderSidebar
              fabricCanvas={canvasState.fabricCanvas}
              activeSidebarTab={activeSidebarTab}
              setActiveSidebarTab={setActiveSidebarTab}
              currentTemplateId={canvasState.currentTemplateId}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>

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
              <div className="flex-shrink-0 h-12 bg-white border-t border-gray-200 flex items-center justify-end px-4">
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