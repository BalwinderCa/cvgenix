'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, Trash2, ZoomIn, ZoomOut, PanelLeft, ChevronLeft, ChevronRight, FilePlus2, FileMinus2 } from 'lucide-react';
import NavigationHeader from '@/components/navigation-header';
import ResumeBuilderSidebar from '@/components/resume-builder-sidebar';
import ResumeBuilderTopBar from '@/components/resume-builder-topbar';
import ResumeBuilderCanvas from '@/components/resume-builder-canvas';
import CanvasEditToolbar from '@/components/canvas-edit-toolbar';
import ResumeUploadModal from '@/components/resume-upload-modal';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';
import UpgradeModal from '@/components/upgrade-modal';
import { CanvasEditManager } from '@/components/canvas/CanvasEditManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useCanvasManager } from '@/hooks/useCanvasManager';
import { useCanvasDimensions } from '@/hooks/useCanvasDimensions';
import { TemplateService } from '@/services/templateService';
import { ExportState } from '@/types/canvas';
import { toast } from 'sonner';

export default function ResumeBuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSidebarTab, setActiveSidebarTab] = useState('design');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [exportState, setExportState] = useState<ExportState>({
    exportFormat: 'PNG'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hasLoadedImportedResume, setHasLoadedImportedResume] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [canvasEditKey, setCanvasEditKey] = useState(0); // Force CanvasEditManager remount
  const [canvasPageCount, setCanvasPageCount] = useState<1 | 2>(1); // Max 2 canvases
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0); // 0 = page 1, 1 = page 2 (for undo/redo and toolbar)
  const isLoadingImportedResumeRef = useRef(false); // Prevent multiple simultaneous loads
  const isDraggingSlider = useRef(false);
  const zoomUpdateFrame = useRef<number | null>(null);
  const isManualSelection = useRef(false);
  const loadingTemplateIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const crossCanvasDragRef = useRef<{
    lastPointer: { clientX: number; clientY: number } | null;
    sourceCanvas: any | null;
    previewEl: HTMLElement | null;
    grabOffset: { x: number; y: number } | null;
    draggedObject: any | null;
  }>({ lastPointer: null, sourceCanvas: null, previewEl: null, grabOffset: null, draggedObject: null });

  // Use the canvas manager hook for page 1
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

  // Second canvas (page 2) - only used when canvasPageCount === 2
  const {
    canvasState: canvas2State,
    editToolbarState: editToolbar2State,
    getFabricInstance: getFabricInstance2,
    handleCanvasReady: handleCanvas2Ready,
    handleStateChange: handleStateChange2,
    handleDeleteSelected: handleDeleteSelected2,
    handleCloseEditToolbar: handleCloseEditToolbar2,
    updateEditToolbarState: updateEditToolbarState2,
    updateCanvasState: updateCanvasState2,
    registerCleanup: registerCleanup2,
    handleUndo: handleUndo2,
    handleRedo: handleRedo2,
    canUndo: canUndo2,
    canRedo: canRedo2,
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

  // Save resume to database (called before export)
  const saveResumeToDatabase = useCallback(async (): Promise<string | null> => {
    if (!canvasState.fabricCanvas) {
      toast.error('Canvas not ready. Please wait...');
      return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to save your resume');
      setLoginModalOpen(true);
      return null;
    }

    try {
      // Get canvas data (single page or array for 2 pages)
      const page1Data = canvasState.fabricCanvas.toJSON();
      const fullPage1 = {
        ...page1Data,
        width: canvasState.fabricCanvas.getWidth(),
        height: canvasState.fabricCanvas.getHeight(),
        version: page1Data.version || '5.3.0',
      };
      let canvasData: unknown = fullPage1;
      if (canvasPageCount === 2 && canvas2State.fabricCanvas) {
        const page2Data = canvas2State.fabricCanvas.toJSON();
        const fullPage2 = {
          ...page2Data,
          width: canvas2State.fabricCanvas.getWidth(),
          height: canvas2State.fabricCanvas.getHeight(),
          version: page2Data.version || '5.3.0',
        };
        canvasData = [fullPage1, fullPage2];
      }

      // Extract basic info from canvas if available (for display purposes)
      // Try to find name, email, etc. from text objects on canvas (use first page)
      let personalInfo: any = {
        firstName: '',
        lastName: '',
        email: '',
      };
      const firstPageData = Array.isArray(canvasData) ? canvasData[0] : canvasData;

      // Try to extract personal info from canvas text objects
      if (firstPageData?.objects) {
        const textObjects = firstPageData.objects.filter((obj: any) => obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox');
        // Look for common patterns (this is a basic extraction)
        textObjects.forEach((obj: any) => {
          const text = (obj.text || '').toLowerCase();
          if (text.includes('@') && !personalInfo.email) {
            // Try to extract email
            const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
            if (emailMatch) personalInfo.email = emailMatch[0];
          }
        });
      }

      // Prepare resume data
      const resumeData: any = {
        templateId: canvasState.currentTemplateId || 'professional-classic',
        canvasData: fullCanvasData,
        personalInfo: personalInfo,
      };

      let response;
      if (currentResumeId) {
        // Update existing resume
        response = await fetch(`http://localhost:3001/api/resumes/${currentResumeId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resumeData)
        });
      } else {
        // Create new resume
        response = await fetch('http://localhost:3001/api/resumes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resumeData)
        });
      }

      if (response.ok) {
        const savedResume = await response.json();
        if (!currentResumeId) {
          setCurrentResumeId(savedResume._id);
          // Update URL with resume ID
          router.replace(`/resume-builder?resumeId=${savedResume._id}`);
        }
        return savedResume._id;
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoginModalOpen(true);
        } else {
          toast.error(errorData.message || 'Failed to save resume');
        }
        return null;
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume. Please try again.');
      return null;
    }
  }, [canvasState.fabricCanvas, canvasState.currentTemplateId, currentResumeId, router, canvasPageCount, canvas2State.fabricCanvas]);

  // Keep handleSave for backward compatibility (though it's not used in UI anymore)
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await saveResumeToDatabase();
    setIsSaving(false);
  }, [saveResumeToDatabase]);

  // Handle download - all formats (PDF/PNG/JPG) cost 1 credit each
  // This also saves the resume automatically before exporting
  const handleDownload = useCallback(async () => {
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginModalOpen(true);
      return;
    }

    // Save resume first before exporting (required for server-side export)
    setIsSaving(true);
    const savedResumeId = await saveResumeToDatabase();
    setIsSaving(false);
    
    if (!savedResumeId && !currentResumeId) {
      // If save failed and we don't have a resume ID, don't proceed with export
      toast.error('Please save your resume before exporting');
      return;
    }
    
    // Show save confirmation
    const resumeIdToExport = savedResumeId || currentResumeId;
    if (resumeIdToExport) {
      toast.success('Resume saved! Exporting now...');
    }

    // Check if user has credits (1 credit per export - all formats)
    try {
      const response = await fetch('http://localhost:3001/api/payments/check-feature-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feature: 'exports' })
      });

      const data = await response.json();
      
      if (!data.hasAccess) {
        setUpgradeModalOpen(true);
        return;
      }
    } catch (error) {
      console.error('Error checking credits:', error);
      // Continue with export if check fails (graceful degradation)
    }

    if (canvasState.fabricCanvas) {
      const format = exportState.exportFormat.toLowerCase();
      
      // If we have a resume ID, use the server export endpoint for all formats (saves to server)
      if (resumeIdToExport && (format === 'pdf' || format === 'png' || format === 'jpg' || format === 'jpeg')) {
        try {
          const exportResponse = await fetch(`http://localhost:3001/api/resumes/${resumeIdToExport}/export`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ format: format })
          });

          if (exportResponse.ok) {
            const blob = await exportResponse.blob();
            
            // Verify blob is not empty
            if (blob.size === 0) {
              toast.error('Downloaded file is empty. Please try again.');
              return;
            }
            
            // Verify PDF format if downloading PDF
            if (format === 'pdf') {
              // Check if blob starts with PDF magic bytes
              const firstBytes = await blob.slice(0, 4).arrayBuffer();
              const decoder = new TextDecoder();
              const header = decoder.decode(firstBytes);
              if (header !== '%PDF') {
                toast.error('Downloaded file is not a valid PDF. Please try again.');
                console.error('Invalid PDF header:', header);
                return;
              }
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const contentDisposition = exportResponse.headers.get('Content-Disposition');
            let filename = `resume.${format}`;
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
              if (filenameMatch) {
                filename = filenameMatch[1];
              }
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up after a short delay to ensure download starts
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, 100);
            
            toast.success('Resume exported and saved successfully!');
            // Refresh user data to show updated credits
            return;
          } else {
            const errorData = await exportResponse.json();
            if (exportResponse.status === 403) {
              toast.error(errorData.message || 'Insufficient credits. Please purchase a credit pack.');
              setUpgradeModalOpen(true);
              return;
            } else {
              // Fall through to client-side export
              console.warn('Server export failed, using client-side export:', errorData);
            }
          }
        } catch (error) {
          console.error('Error with server export, using client-side export:', error);
          // Fall through to client-side export
        }
      }
      
      // Fallback to client-side export if server export failed or no resume ID
      const canvases = [canvasState.fabricCanvas].concat(canvasPageCount === 2 && canvas2State.fabricCanvas ? [canvas2State.fabricCanvas] : []);
      if (format === 'pdf') {
        try {
          const dataURLs = canvases.map((c) =>
            c.toDataURL({ format: 'png', quality: 1, multiplier: 2 })
          );
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            const imgTags = dataURLs.map((url, i) =>
              `<img src="${url}" alt="Page ${i + 1}" style="width:100%;height:auto;display:block;margin:0;padding:0;${i < dataURLs.length - 1 ? 'page-break-after:always;' : ''}" />`
            ).join('');
            printWindow.document.write(`
              <html>
                <head>
                  <title>Resume Export</title>
                  <style>
                    body { margin: 0; padding: 0; background: white; }
                    img { width: 100%; height: auto; display: block; margin: 0; padding: 0; }
                    @media print {
                      body { margin: 0; padding: 0; background: white; }
                      img { page-break-inside: avoid; }
                      @page { margin: 0; padding: 0; size: auto; }
                    }
                  </style>
                </head>
                <body>${imgTags}
                  <script>
                    window.onload = function() {
                      var s = document.createElement('style');
                      s.textContent = '@page { margin: 0 !important; } @media print { body { margin: 0 !important; } }';
                      document.head.appendChild(s);
                      window.print();
                      window.onafterprint = function() { window.close(); };
                    };
                  <\/script>
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
        // Handle image exports (PNG, JPG) - single or stacked when 2 pages
        if (canvases.length === 2) {
          const c1 = canvases[0];
          const c2 = canvases[1];
          const w = Math.max(c1.getWidth(), c2.getWidth());
          const h = (c1.getHeight() || 0) + (c2.getHeight() || 0);
          const off = document.createElement('canvas');
          off.width = w * 2;
          off.height = h * 2;
          const ctx = off.getContext('2d');
          if (ctx) {
            ctx.scale(2, 2);
            ctx.drawImage(c1.getElement(), 0, 0);
            ctx.drawImage(c2.getElement(), 0, c1.getHeight());
            const dataURL = off.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', format === 'jpg' ? 0.9 : 1);
            const link = document.createElement('a');
            link.download = `resume.${format}`;
            link.href = dataURL;
            link.click();
          } else {
            const dataURL = c1.toDataURL({ format: format, quality: format === 'jpg' ? 0.9 : 1, multiplier: 2 });
            const link = document.createElement('a');
            link.download = `resume.${format}`;
            link.href = dataURL;
            link.click();
          }
        } else {
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
      
      // Note: Credit deduction is handled by the server export endpoint
      // No need to deduct credits here for client-side fallback
    }
  }, [canvasState.fabricCanvas, canvas2State.fabricCanvas, canvasPageCount, exportState.exportFormat, router]);

  // Handle template selection
  const handleTemplateSelect = useCallback(async (templateId: string, isManual = false) => {
    // Validate canvas is ready - wait for it if needed
    if (!canvasState.fabricCanvas) {
      console.log('⏳ Canvas not ready yet, waiting...');
      // Wait for canvas to be ready (max 3 seconds)
      let attempts = 0;
      const maxAttempts = 30;
      while (!canvasState.fabricCanvas && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (!canvasState.fabricCanvas) {
        console.error('Canvas is not ready after waiting');
        toast.error('Canvas is not ready. Please wait a moment and try again.');
        return;
      }
    }
    
    // Validate canvas context hasn't been lost
    try {
      const ctx = canvasState.fabricCanvas.getContext();
      if (!ctx || (ctx.isContextLost && ctx.isContextLost())) {
        console.error('Canvas context is lost');
        setError('Canvas context lost. Please refresh the page.');
        return;
      }
    } catch (err) {
      console.error('Error validating canvas:', err);
      setError('Canvas error. Please refresh the page.');
      return;
    }
    
    // Prevent loading the same template if it's already loaded
    if (canvasState.currentTemplateId === templateId && !isLoading) {
      console.log('Template already loaded, skipping...');
      return;
    }
    
    // Cancel any in-progress template load
    if (abortControllerRef.current) {
      console.log('Cancelling previous template load');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Prevent concurrent loading
    if (loadingTemplateIdRef.current && loadingTemplateIdRef.current !== templateId) {
      console.log('Another template is already loading, waiting...');
      return;
    }
    
    // Mark as manual selection to prevent URL parameter from interfering
    if (isManual) {
      isManualSelection.current = true;
      // Update URL to reflect the new template selection
      const newUrl = `/resume-builder?template=${templateId}`;
      router.replace(newUrl);
    }
    
    // Create new abort controller for this load
    abortControllerRef.current = new AbortController();
    loadingTemplateIdRef.current = templateId;
    setIsLoading(true);
    setError(null);
    
    try {
      updateCanvasState({ currentTemplateId: templateId });
      const baseDimensions = getBaseDimensions();
      
      // Check if operation was aborted before loading
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      await templateService.loadTemplateIntoCanvas(canvasState.fabricCanvas, templateId, baseDimensions);
      
      // Check if operation was aborted after loading
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      // Validate canvas is still valid before finalizing
      if (!canvasState.fabricCanvas) {
        throw new Error('Canvas was disposed during template load');
      }
      
      const ctx = canvasState.fabricCanvas.getContext();
      if (!ctx || (ctx.isContextLost && ctx.isContextLost())) {
        throw new Error('Canvas context lost during template load');
      }
      
      // CRITICAL FIX: Force Fabric.js to refresh its internal state IMMEDIATELY
      // This must happen synchronously to prevent state restoration from interfering
      const refreshCanvasState = () => {
        const objects = canvasState.fabricCanvas.getObjects();
        
        objects.forEach((obj: any) => {
          // Force object coordinates - CRITICAL for hit detection
          if (obj.setCoords) {
            obj.setCoords();
          }
          // Ensure object is registered with canvas
          if (obj.canvas !== canvasState.fabricCanvas) {
            obj.canvas = canvasState.fabricCanvas;
          }
          // Ensure text objects are interactive
          if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
            obj.set({ 
              selectable: true, 
              evented: true,
              hoverCursor: 'move',
              moveCursor: 'move'
            });
          }
          // Consistent selection: green dotted border + custom handles (no rotation)
          if (obj.selectable !== false && obj.setControlsVisibility) {
            obj.setControlsVisibility({
              mt: false, mb: false, mtr: false,
              ml: true, mr: true,
              tl: true, tr: true, bl: true, br: true
            });
          }
        });
        
        // Recalculate canvas offset - CRITICAL for hit detection
        canvasState.fabricCanvas.calcOffset();
        
        // Ensure canvas is in selection mode
        (canvasState.fabricCanvas as any).selection = true;
        if ((canvasState.fabricCanvas as any).interactive !== undefined) {
          (canvasState.fabricCanvas as any).interactive = true;
        }
        
        const canvasEl = canvasState.fabricCanvas.getElement();
        if (canvasEl) {
          canvasEl.style.pointerEvents = 'auto';
          canvasEl.style.cursor = 'default';
        }
        
        canvasState.fabricCanvas.renderAll();
      };
      
      // Refresh immediately
      refreshCanvasState();
      
      // Save state immediately to prevent restoration from clearing objects
      const initialState = JSON.stringify(canvasState.fabricCanvas.toJSON());
      updateCanvasState({ canvasState: initialState });
      
      // Initialize undo/redo history with the loaded template
      setTimeout(() => {
        if (canvasState.fabricCanvas && !abortControllerRef.current?.signal.aborted) {
          try {
            if (canvasState.fabricCanvas.initializeHistory) {
              canvasState.fabricCanvas.initializeHistory();
            }
            // Final refresh and ensure handlers are attached
            setTimeout(() => {
              if (canvasState.fabricCanvas) {
                const currentObjects = canvasState.fabricCanvas.getObjects();
                if (currentObjects.length > 0) {
                  // Final refresh - ensure all objects are ready
                  refreshCanvasState();
                  
                  // Force a render to ensure everything is updated
                  canvasState.fabricCanvas.renderAll();
                  
                  // CRITICAL: Ensure all objects have their coordinates set
                  const allObjects = canvasState.fabricCanvas.getObjects();
                  allObjects.forEach((obj: any) => {
                    if (obj.setCoords) {
                      obj.setCoords();
                    }
                  });
                  canvasState.fabricCanvas.calcOffset();
                  canvasState.fabricCanvas.renderAll();
                  
                  // Force remount CanvasEditManager after template loads
                  // Store previous handlers before clearing
                  const previousHandlers = canvasState.fabricCanvas.eventHandlers;
                  canvasState.fabricCanvas.hasEditListeners = false;
                  canvasState.fabricCanvas.eventHandlers = null;
                  canvasState.fabricCanvas.hoveredObject = null;
                  
                  // Remove only OUR specific event listeners to prevent duplicates
                  // Don't remove ALL handlers - topbar also listens for selection events
                  try {
                    if (previousHandlers) {
                      if (previousHandlers.mouseOver) canvasState.fabricCanvas.off('mouse:over', previousHandlers.mouseOver);
                      if (previousHandlers.mouseOut) canvasState.fabricCanvas.off('mouse:out', previousHandlers.mouseOut);
                      if (previousHandlers.mouseMove) canvasState.fabricCanvas.off('mouse:move', previousHandlers.mouseMove);
                      if (previousHandlers.dblclick) canvasState.fabricCanvas.off('mouse:dblclick', previousHandlers.dblclick);
                      if (previousHandlers.selectionCreated) canvasState.fabricCanvas.off('selection:created', previousHandlers.selectionCreated);
                      if (previousHandlers.selectionUpdated) canvasState.fabricCanvas.off('selection:updated', previousHandlers.selectionUpdated);
                      if (previousHandlers.selectionCleared) canvasState.fabricCanvas.off('selection:cleared', previousHandlers.selectionCleared);
                    }
                  } catch (e) {
                    // Ignore if events don't exist
                  }
                  
                  // Clean up any existing hover overlay
                  if (canvasState.fabricCanvas.hoverOverlay) {
                    try {
                      canvasState.fabricCanvas.remove(canvasState.fabricCanvas.hoverOverlay);
                      canvasState.fabricCanvas.hoverOverlay = null;
                    } catch (e) {
                      // Ignore cleanup errors
                    }
                  }
                  
                  // Force CanvasEditManager remount to re-initialize ALL handlers with new objects
                  setCanvasEditKey(prev => prev + 1);
                }
              }
            }, 100); // Reduced delay since handlers should already be attached
          } catch (err) {
            console.error('Error initializing history:', err);
          }
        }
      }, 100);
      
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Template load cancelled');
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load template';
      setError(errorMessage);
      console.error('Error loading template:', err);
    } finally {
      setIsLoading(false);
      loadingTemplateIdRef.current = null;
      abortControllerRef.current = null;
      
      // Reset manual selection flag after a short delay
      if (isManual) {
        setTimeout(() => {
          isManualSelection.current = false;
        }, 500);
      }
    }
  }, [canvasState.fabricCanvas, canvasState.currentTemplateId, templateService, updateCanvasState, getBaseDimensions, isLoading, router]);

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

  // Load template from URL parameter when canvas is ready
  useEffect(() => {
    const templateId = searchParams.get('template');
    
    // Don't load from URL if:
    // 1. Manual selection is in progress
    // 2. Canvas is not ready
    // 3. Template ID doesn't exist in URL
    if (!templateId || !canvasState.fabricCanvas || isManualSelection.current) {
      return;
    }
    
    // Only load template if it's different from currently loaded one
    const shouldLoad = canvasState.currentTemplateId !== templateId;
    
    if (shouldLoad && !isLoading) {
      console.log('Loading template from URL:', templateId);
      handleTemplateSelect(templateId, false);
    }
  }, [canvasState.fabricCanvas, searchParams, handleTemplateSelect, canvasState.currentTemplateId, isLoading]);

  // Handle zoom change - scales all canvas containers (both pages) proportionally
  const handleZoomChange = useCallback((zoom: number, immediate = false) => {
    const activeCanvas = activeCanvasIndex === 0 ? canvasState.fabricCanvas : canvas2State.fabricCanvas;
    if (!activeCanvas) return;
    
    try {
      const zoomValue = zoom / 100;
      const baseDimensions = getBaseDimensions();
      const baseWidth = activeCanvas?.getWidth?.() ?? baseDimensions.width;
      const baseHeight = activeCanvas?.getHeight?.() ?? baseDimensions.height;
      const scaledDimensions = getScaledDimensions();
      const responsiveScale = scaledDimensions.scale || 1;
      const combinedScale = responsiveScale * zoomValue;
      const newTransform = `scale3d(${combinedScale}, ${combinedScale}, 1)`;
      const finalScaledWidth = baseWidth * combinedScale;
      const finalScaledHeight = baseHeight * combinedScale;
      
      const wrapperElements = document.querySelectorAll('.canvas-zoom-wrapper');
      const containerElements = document.querySelectorAll('.canvas-container');
      
      const applyStyles = (wrapperEl: Element, containerEl: Element) => {
        const w = wrapperEl as HTMLElement;
        const c = containerEl as HTMLElement;
        w.style.transition = 'none';
        w.style.width = `${finalScaledWidth}px`;
        w.style.height = `${finalScaledHeight}px`;
        w.style.minWidth = `${finalScaledWidth}px`;
        w.style.minHeight = `${finalScaledHeight}px`;
        w.style.maxWidth = 'none';
        w.style.maxHeight = 'none';
        w.style.margin = 'auto';
        w.style.flexShrink = '0';
        w.style.boxSizing = 'border-box';
        w.style.overflow = 'visible';
        w.style.display = 'flex';
        w.style.alignItems = 'center';
        w.style.justifyContent = 'center';
        w.style.position = 'relative';
        c.style.transition = immediate ? 'none' : 'transform 0.2s ease-out';
        c.style.willChange = 'transform';
        c.style.backfaceVisibility = 'hidden';
        c.style.webkitBackfaceVisibility = 'hidden';
        c.style.transformOrigin = 'center center';
        c.style.width = `${baseWidth}px`;
        c.style.height = `${baseHeight}px`;
        c.style.overflow = 'visible';
        c.style.boxSizing = 'border-box';
        c.style.transform = newTransform;
      };
      
      if (immediate) {
        wrapperElements.forEach((w, i) => {
          const c = containerElements[i];
          if (c) applyStyles(w, c);
        });
      } else {
        if (zoomUpdateFrame.current !== null) {
          cancelAnimationFrame(zoomUpdateFrame.current);
        }
        zoomUpdateFrame.current = requestAnimationFrame(() => {
          zoomUpdateFrame.current = null;
          wrapperElements.forEach((w, i) => {
            const c = containerElements[i];
            if (c) applyStyles(w, c);
          });
        });
      }
      
      const firstContainer = containerElements[0];
      if (firstContainer) {
        const scrollContainer = firstContainer.closest('.bg-gray-50.overflow-auto');
        if (scrollContainer) {
          const scrollEl = scrollContainer as HTMLElement;
          scrollEl.style.overflow = 'auto';
          scrollEl.style.overflowX = 'auto';
          scrollEl.style.overflowY = 'auto';
        }
      }
      
      setZoomLevel(Math.round(zoom));
    } catch (error) {
      console.error('Error setting zoom:', error);
    }
  }, [canvasState.fabricCanvas, canvas2State.fabricCanvas, activeCanvasIndex, getBaseDimensions, getScaledDimensions]);

  // Helper function to clean up canvas edit listeners
  const cleanupCanvasListeners = useCallback((canvas: any) => {
    if (!canvas) return;
    
    if (canvas.eventHandlers) {
      const handlers = canvas.eventHandlers;
      document.removeEventListener('keydown', handlers.keyboard!);
      canvas.off('mouse:dblclick', handlers.dblclick!);
      canvas.off('text:editing:entered', handlers.editingEntered!);
      canvas.off('text:editing:exited', handlers.editingExited!);
      if (handlers.mouseOver) canvas.off('mouse:over', handlers.mouseOver);
      if (handlers.mouseOut) canvas.off('mouse:out', handlers.mouseOut);
      if (handlers.mouseMove) canvas.off('mouse:move', handlers.mouseMove);
      if (handlers.getMouseMoveTimeout) {
        const timeout = handlers.getMouseMoveTimeout();
        if (timeout) clearTimeout(timeout);
      }
      canvas.off('selection:created', handlers.selectionCreated!);
      canvas.off('selection:updated', handlers.selectionUpdated!);
      canvas.off('selection:cleared', handlers.selectionCleared!);
    }
    
    if (canvas.hoverOverlay) {
      try {
        canvas.remove(canvas.hoverOverlay);
        canvas.hoverOverlay = null;
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    canvas.hasEditListeners = false;
    canvas.hoveredObject = null;
    canvas.eventHandlers = null;
  }, []);

  // Helper function to check if object is a page border
  const isPageBorder = useCallback((obj: any, targetWidth: number, targetHeight: number): boolean => {
    const PAGE_HEIGHT = 1100;
    const CANVAS_WIDTH = 800;
    
    return obj.type === 'rect' && 
      (obj.fill === '#ffffff' || obj.fill === 'white' || obj.fill === 'rgb(255, 255, 255)') &&
      (obj.stroke === '#cccccc' || obj.stroke === '#ccc' || obj.stroke === 'rgb(204, 204, 204)' || obj.strokeWidth === 2) &&
      (obj.width === targetWidth || obj.width === CANVAS_WIDTH || Math.abs(obj.width - targetWidth) < 10) &&
      (obj.height === PAGE_HEIGHT || obj.height === targetHeight || Math.abs(obj.height - PAGE_HEIGHT) < 10 || Math.abs(obj.height - targetHeight) < 10) &&
      (obj.left === 0 || Math.abs(obj.left) < 5);
  }, []);

  // Helper function to configure imported objects
  const configureImportedObjects = useCallback((canvas: any, targetWidth: number, targetHeight: number) => {
    canvas.forEachObject((obj: any) => {
      // Handle page borders - keep them non-selectable
      if (isPageBorder(obj, targetWidth, targetHeight)) {
        obj.set({
          selectable: false,
          evented: false,
          excludeFromExport: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
        });
        canvas.sendToBack(obj);
        return;
      }
      
      // Configure text objects
      if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
        obj.set({ 
          textBaseline: 'alphabetic',
          originX: obj.originX || 'left',
          originY: obj.originY || 'top',
          textAlign: obj.textAlign || 'left',
          selectable: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          padding: 0,
          hoverCursor: 'move',
          moveCursor: 'move',
        });
        
        obj.setControlsVisibility({
          mt: false, mb: false, mtr: false,
          ml: true, mr: true,
          tl: true, tr: true, bl: true, br: true
        });
        obj.set({
          borderColor: '#10b981',
          borderWidth: 3,
          borderDashArray: [5, 5],
          cornerColor: '#10b981',
          cornerStrokeColor: '#10b981',
          cornerStyle: 'circle',
          cornerSize: 12,
          hasRotatingPoint: false,
        });
      } else {
        // Configure other objects: same selection style (green dotted + custom handles)
        obj.set({
          selectable: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          padding: 0,
          hoverCursor: 'move',
          moveCursor: 'move',
          borderColor: '#10b981',
          borderWidth: 3,
          borderDashArray: [5, 5],
          cornerColor: '#10b981',
          cornerStrokeColor: '#10b981',
          cornerStyle: 'circle',
          cornerSize: 12,
          hasRotatingPoint: false,
        });
        if (obj.setControlsVisibility) {
          obj.setControlsVisibility({
            mt: false, mb: false, mtr: false,
            ml: true, mr: true,
            tl: true, tr: true, bl: true, br: true
          });
        }
      }
    });
  }, [isPageBorder]);

  // Simplified imported resume loading
  const loadImportedResume = useCallback(async (providedCanvas?: any) => {
    // Early return checks
    if (isLoadingImportedResumeRef.current || hasLoadedImportedResume) {
      return false;
    }

    const fabricCanvas = providedCanvas || canvasState.fabricCanvas;
    if (!fabricCanvas || typeof window === 'undefined') {
      return false;
    }

    const shouldImport = searchParams.get('imported') === 'true';
    const storedData = window.localStorage.getItem('importedResumeCanvas');
    if (!shouldImport || !storedData) {
      return false;
    }
    
    // Mark as loading
    isLoadingImportedResumeRef.current = true;
    setIsLoading(true);

    try {
      // Parse and validate data
      const parsedData = JSON.parse(storedData);
      if (!parsedData?.objects || !Array.isArray(parsedData.objects)) {
        throw new Error('Imported resume data is invalid.');
      }

      // Fix textBaseline issues
      parsedData.objects = parsedData.objects.map((obj: any) => {
        if (obj?.textBaseline === 'alphabetical') {
          return { ...obj, textBaseline: 'alphabetic' };
        }
        return obj;
      });

      // Get dimensions
      const baseDimensions = getBaseDimensions();
      const targetWidth = parsedData.width > 0 ? parsedData.width : baseDimensions.width;
      const targetHeight = parsedData.height > 0 ? parsedData.height : baseDimensions.height;

      // Clean up existing listeners and objects
      cleanupCanvasListeners(fabricCanvas);
      const existingObjects = [...fabricCanvas.getObjects()];
      existingObjects.forEach((obj) => {
        try {
          fabricCanvas.remove(obj);
        } catch (e) {
          // Ignore removal errors
        }
      });

      // Reset canvas - ensure canvas is ready before setting dimensions
      fabricCanvas.discardActiveObject?.();
      fabricCanvas.backgroundColor = '#ffffff';
      
      // Clear any hover overlays or other temporary objects
      if ((fabricCanvas as any).hoverOverlay) {
        try {
          fabricCanvas.remove((fabricCanvas as any).hoverOverlay);
          (fabricCanvas as any).hoverOverlay = null;
        } catch (e) {
          // Ignore removal errors
        }
      }
      
      // Only set dimensions if canvas is fully initialized
      if (fabricCanvas.getElement && fabricCanvas.getElement()) {
        fabricCanvas.setWidth(targetWidth);
        fabricCanvas.setHeight(targetHeight);
      }
      fabricCanvas.setZoom(1);

      // Load data into canvas
      await new Promise<void>((resolve, reject) => {
        fabricCanvas.loadFromJSON(
          parsedData,
          () => {
            try {
              // Configure all objects
              configureImportedObjects(fabricCanvas, targetWidth, targetHeight);
              
              // Ensure proper object ordering: page borders and backgrounds at back, text on top
              const allObjects = fabricCanvas.getObjects();
              console.log(`📋 Loaded ${allObjects.length} objects from imported resume`);
              
              // First, send all page borders and backgrounds to back
              allObjects.forEach((obj: any) => {
                if (isPageBorder(obj, targetWidth, targetHeight)) {
                  // Page borders should be at the very back
                  fabricCanvas.sendToBack(obj);
                } else if (obj.type === 'rect' && obj !== fabricCanvas.hoverOverlay) {
                  // Background rectangles (except hover overlay) should be behind text
                  // Check if it's a page border by dimensions
                  const isPageBorderRect = obj.width === targetWidth && 
                                          (obj.height === targetHeight || Math.abs(obj.height - targetHeight) < 10);
                  if (isPageBorderRect || (obj.fill === '#ffffff' && obj.stroke !== 'transparent')) {
                    fabricCanvas.sendToBack(obj);
                  } else if (obj.fill !== '#ffffff' && obj.stroke === 'transparent') {
                    // Colored background shapes should be behind text
                    fabricCanvas.sendToBack(obj);
                  }
                } else if (obj.type === 'polygon' && obj.fill !== '#ffffff' && obj.stroke === 'transparent') {
                  // Background polygons should be behind text
                  fabricCanvas.sendToBack(obj);
                }
              });
              
              // Then, bring all text objects to front and ensure they're individually selectable
              const textObjects = allObjects.filter((obj: any) => 
                obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text'
              );
              const imageObjects = allObjects.filter((obj: any) => obj.type === 'image');
              
              console.log(`📝 Found ${textObjects.length} text objects and ${imageObjects.length} image objects`);
              
              // Ensure all objects (text and images) are individually selectable
              [...textObjects, ...imageObjects].forEach((obj: any) => {
                // Ensure each object is individually selectable and not grouped
                obj.set({
                  selectable: true,
                  evented: true,
                  group: null, // Ensure not part of a group
                  lockMovementX: false,
                  lockMovementY: false,
                });
              });
              
              // Bring text to front, images stay in middle
              textObjects.forEach((obj: any) => {
                fabricCanvas.bringToFront(obj);
              });
              
              // CRITICAL: Recalculate canvas offset for proper hit detection
              // This must be done after objects are loaded and positioned
              if (fabricCanvas.calcOffset) {
                fabricCanvas.calcOffset();
              }
              
              // Discard any active selection to ensure objects are individually selectable
              fabricCanvas.discardActiveObject();
              
              // Enable canvas interactivity
              (fabricCanvas as any).selection = true;
              if ((fabricCanvas as any).interactive !== undefined) {
                (fabricCanvas as any).interactive = true;
              }
              
              // Ensure canvas is configured for individual object selection
              if (fabricCanvas.skipTargetFind !== undefined) {
                fabricCanvas.skipTargetFind = false;
              }
              
              // Log object positions for debugging
              if (textObjects.length > 0) {
                console.log(`📍 Text object positions (first 3):`, textObjects.slice(0, 3).map((obj: any) => ({
                  type: obj.type,
                  left: obj.left,
                  top: obj.top,
                  width: obj.width,
                  height: obj.height,
                  selectable: obj.selectable,
                  evented: obj.evented,
                  boundingRect: obj.getBoundingRect ? obj.getBoundingRect() : null
                })));
              }
              
              // Recalculate offset again after a short delay to ensure layout is complete
              setTimeout(() => {
                if (fabricCanvas.calcOffset) {
                  fabricCanvas.calcOffset();
                  fabricCanvas.renderAll();
                }
                
                // Add click handler to debug selection
                const clickHandler = (e: any) => {
                  const pointer = fabricCanvas.getPointer(e.e);
                  const target = fabricCanvas.findTarget(e.e, false);
                  
                  if (target) {
                    console.log('🖱️ Clicked on object:', {
                      type: target.type,
                      text: target.text?.substring(0, 50) || '',
                      left: Math.round(target.left),
                      top: Math.round(target.top),
                      width: Math.round(target.width || 0),
                      height: Math.round(target.height || 0),
                      fontSize: target.fontSize || 0,
                      fontFamily: target.fontFamily || '',
                      fill: target.fill || '',
                      selectable: target.selectable,
                      evented: target.evented,
                      pointer: pointer
                    });
                  } else {
                    console.log('🖱️ Clicked on canvas (no object)', {
                      pointer: pointer,
                      canvasWidth: fabricCanvas.getWidth(),
                      canvasHeight: fabricCanvas.getHeight(),
                      objectsCount: fabricCanvas.getObjects().length
                    });
                  }
                };
                
                fabricCanvas.on('mouse:down', clickHandler);
              }, 100);
              
              // Initialize history and save state
              if (fabricCanvas.initializeHistory) {
                fabricCanvas.initializeHistory();
              }
              if (fabricCanvas.saveState) {
                fabricCanvas.saveState();
              }
              
              fabricCanvas.renderAll();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          // Reviver function for textBaseline fix
          (_objectData: any, object: any) => {
            if (object && (object.type === 'text' || object.type === 'textbox' || object.type === 'i-text')) {
              object.set({ textBaseline: 'alphabetic' });
            }
          }
        );
      });

      // Update state
      const serializedState = JSON.stringify(fabricCanvas.toJSON());
      updateCanvasState({
        currentTemplateId: 'imported-resume',
        canvasState: serializedState,
      });

      setHasLoadedImportedResume(true);
      handleZoomChange(100, false);

      // Clean up URL params
      const params = new URLSearchParams(searchParams.toString());
      params.delete('imported');
      params.delete('source');
      router.replace(params.toString() ? `/resume-builder?${params.toString()}` : '/resume-builder');

      // Remount CanvasEditManager after a short delay
      setTimeout(() => {
        cleanupCanvasListeners(fabricCanvas);
        
        if (fabricCanvas.getObjects().length > 0) {
          fabricCanvas.renderAll();
          setCanvasEditKey(prev => prev + 1);
          
          // Clean up localStorage after remount
          setTimeout(() => {
            window.localStorage.removeItem('importedResumeCanvas');
          }, 100);
        }
        
        isLoadingImportedResumeRef.current = false;
      }, 200);

      return true;
    } catch (err) {
      console.error('Error loading imported resume:', err);
      setError(err instanceof Error ? err.message : 'Failed to load uploaded resume.');
      isLoadingImportedResumeRef.current = false;
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    canvasState.fabricCanvas,
    getBaseDimensions,
    handleZoomChange,
    hasLoadedImportedResume,
    router,
    searchParams,
    updateCanvasState,
    cleanupCanvasListeners,
    configureImportedObjects,
  ]);

  // Custom canvas ready handler that also checks for imported resume and upload modal
  const handleCanvasReadyWithImport = useCallback((canvas: any) => {
    // Call the original handler to set canvas in state
    handleCanvasReady(canvas);
    
    // Immediately check and load imported resume if needed
    // This ensures it loads as soon as canvas is ready, not waiting for useEffect
    const shouldImport = searchParams.get('imported') === 'true';
    const storedData = typeof window !== 'undefined' ? window.localStorage.getItem('importedResumeCanvas') : null;
    
    if (shouldImport && storedData && !hasLoadedImportedResume) {
      console.log('📥 Starting immediate import with provided canvas');
      // Load immediately with the canvas that was just passed in
      // This avoids waiting for state updates
      // Use a small delay to ensure canvas is fully initialized
      setTimeout(() => {
        loadImportedResume(canvas);
      }, 100);
    }

    // Check if we should open upload modal after canvas is ready
    const shouldOpenUpload = searchParams.get('openUpload') === 'true';
    if (shouldOpenUpload && !isUploadModalOpen) {
      console.log('📤 Opening upload modal after canvas ready');
      // Small delay to ensure canvas is fully rendered
      setTimeout(() => {
        setIsUploadModalOpen(true);
        // Clean up the query parameter
        const params = new URLSearchParams(searchParams.toString());
        params.delete('openUpload');
        const newQuery = params.toString();
        router.replace(newQuery ? `/resume-builder?${newQuery}` : '/resume-builder');
      }, 200);
    }
  }, [handleCanvasReady, searchParams, hasLoadedImportedResume, isUploadModalOpen, router]);

  useEffect(() => {
    // Also keep the useEffect as a fallback for when canvas is set in state
    // But only if we haven't already loaded via the direct canvas ready handler
    // And only if we're not currently loading
    if (canvasState.fabricCanvas && !hasLoadedImportedResume && !isLoadingImportedResumeRef.current) {
      const shouldImport = searchParams.get('imported') === 'true';
      const storedData = typeof window !== 'undefined' ? window.localStorage.getItem('importedResumeCanvas') : null;
      
      if (shouldImport && storedData) {
        console.log('📥 Fallback: Loading imported resume from useEffect');
        loadImportedResume();
      }
    }
  }, [canvasState.fabricCanvas, hasLoadedImportedResume, searchParams, loadImportedResume]);

  // Check for openUpload query parameter - fallback if canvas is already ready
  // Function to load resume by ID (supports single page or array of pages)
  const loadResumeById = useCallback(async (resumeId: string) => {
    const canvas = canvasState.fabricCanvas;
    if (!canvas) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to load your resume');
      setLoginModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/resumes/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const resume = await response.json();
        setCurrentResumeId(resume._id);

        const data = resume.canvasData;
        if (!data) {
          toast.info('Resume loaded, but no canvas data found. Starting fresh.');
          setCanvasPageCount(1);
          return;
        }

        const isMultiPage = Array.isArray(data);
        const page1Data = isMultiPage ? data[0] : data;
        const page2Data = isMultiPage ? data[1] : null;

        // Load page 1
        canvas.loadFromJSON(page1Data, () => {
          canvas.renderAll();
        });

        if (isMultiPage && page2Data && canvas2State.fabricCanvas) {
          setCanvasPageCount(2);
          canvas2State.fabricCanvas.loadFromJSON(page2Data, () => {
            canvas2State.fabricCanvas?.renderAll();
          });
          updateCanvasState2({ canvasState: JSON.stringify(page2Data) });
        } else if (isMultiPage && page2Data) {
          // Second canvas not mounted yet; add page and load when ready
          setCanvasPageCount(2);
          // Store page2 data to load when canvas 2 is ready
          (window as any).__pendingPage2Data = page2Data;
        } else {
          setCanvasPageCount(1);
        }
        toast.success('Resume loaded successfully!');
      } else if (response.status === 401) {
        toast.error('Not authorized to view this resume');
        router.push('/profile');
      } else {
        toast.error('Failed to load resume');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  }, [canvasState.fabricCanvas, canvas2State.fabricCanvas, router, updateCanvasState2]);

  // Load existing resume if resumeId is in URL
  useEffect(() => {
    const resumeId = searchParams.get('resumeId');
    if (resumeId && resumeId !== currentResumeId && canvasState.fabricCanvas) {
      loadResumeById(resumeId);
    }
  }, [searchParams, canvasState.fabricCanvas, currentResumeId, loadResumeById]);

  // Cross-canvas drag and drop: show preview under cursor, on drop move object to other canvas
  useEffect(() => {
    if (canvasPageCount !== 2 || !canvasState.fabricCanvas || !canvas2State.fabricCanvas) {
      return;
    }
    const c1 = canvasState.fabricCanvas;
    const c2 = canvas2State.fabricCanvas;

    const getOtherCanvas = (source: any) => (source === c1 ? c2 : c1);
    const getOtherPage = (source: any) => (source === c1 ? '2' : '1');

    const isPointerOverOtherCanvas = (sourceCanvas: any, clientX: number, clientY: number) => {
      const otherPage = getOtherPage(sourceCanvas);
      const el = document.querySelector(`.canvas-container[data-page="${otherPage}"]`) as HTMLElement;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    };

    const createPreviewEl = (obj: any) => {
      const rect = obj.getBoundingRect();
      const getNum = (o: any, key: string, fallback: number) => {
        const v = o.get ? o.get(key) : o[key];
        return typeof v === 'number' && !Number.isNaN(v) ? v : fallback;
      };
      const scaleX = getNum(obj, 'scaleX', 1);
      const scaleY = getNum(obj, 'scaleY', 1);
      const objW = getNum(obj, 'width', rect.width);
      const objH = getNum(obj, 'height', rect.height);
      const contentW = Math.max(1, Math.ceil(objW * scaleX));
      const contentH = Math.max(1, Math.ceil(objH * scaleY));
      const borderW = 2;
      const wrapperW = contentW + borderW * 2;
      const wrapperH = contentH + borderW * 2;

      const wrapper = document.createElement('div');
      wrapper.className = 'cross-canvas-drag-preview';
      wrapper.style.cssText = [
        'position:fixed',
        'z-index:9999',
        'pointer-events:none',
        'border:2px dashed #10b981',
        'border-radius:2px',
        'background:white',
        'box-sizing:border-box',
        'overflow:hidden',
      ].join(';');
      wrapper.style.width = `${wrapperW}px`;
      wrapper.style.height = `${wrapperH}px`;
      wrapper.setAttribute('data-content-w', String(contentW));
      wrapper.setAttribute('data-content-h', String(contentH));

      const img = document.createElement('img');
      img.style.display = 'block';
      img.style.width = '100%';
      img.style.height = '100%';
      img.alt = '';
      wrapper.appendChild(img);
      document.body.appendChild(wrapper);

      const fabric = (window as any).fabric;
      if (fabric) {
        const StaticCanvasClass = fabric.StaticCanvas ?? fabric.Canvas;
        obj.clone((cloned: any) => {
          if (!cloned || !img.parentNode) return;
          try {
            const tempEl = document.createElement('canvas');
            tempEl.width = contentW;
            tempEl.height = contentH;
            const tempCanvas = new StaticCanvasClass(tempEl, {
              width: contentW,
              height: contentH,
              backgroundColor: 'white',
              renderOnAddRemove: false,
            });
            cloned.set({
              left: 0,
              top: 0,
            });
            if (cloned.setCoords) cloned.setCoords();
            tempCanvas.add(cloned);
            tempCanvas.renderAll();
            const dataURL = tempEl.toDataURL('image/png');
            img.src = dataURL;
            if (tempCanvas.dispose) tempCanvas.dispose();
          } catch (_) {
            img.style.background = '#f3f4f6';
            img.style.minWidth = '40px';
            img.style.minHeight = '24px';
          }
        });
      } else {
        img.style.background = '#f3f4f6';
        img.style.minWidth = '40px';
        img.style.minHeight = '24px';
      }

      return wrapper;
    };

    const removePreview = () => {
      const prev = crossCanvasDragRef.current.previewEl;
      if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
      crossCanvasDragRef.current.previewEl = null;
      crossCanvasDragRef.current.grabOffset = null;
    };

    const onMoving = (e: any) => {
      const ev = e.e;
      if (!ev || typeof ev.clientX !== 'number' || typeof ev.clientY !== 'number') return;
      const sourceCanvas = e.target?.canvas ?? null;
      crossCanvasDragRef.current.lastPointer = { clientX: ev.clientX, clientY: ev.clientY };
      crossCanvasDragRef.current.sourceCanvas = sourceCanvas;

      if (!sourceCanvas) return;
      const active = sourceCanvas.getActiveObject();
      if (!active) return;

      const overOther = isPointerOverOtherCanvas(sourceCanvas, ev.clientX, ev.clientY);
      let preview = crossCanvasDragRef.current.previewEl;

      if (overOther) {
        // Pointer reached the other canvas: show preview, hide actual object, clear selection so no ghost outline
        if (!preview) {
          crossCanvasDragRef.current.draggedObject = active;
          active.set('visible', false);
          sourceCanvas.discardActiveObject();
          sourceCanvas.requestRenderAll();
          preview = createPreviewEl(active);
          crossCanvasDragRef.current.previewEl = preview;
          const ptr = sourceCanvas.getPointer(ev);
          const objLeft = active.get?.('left') ?? active.left ?? 0;
          const objTop = active.get?.('top') ?? active.top ?? 0;
          crossCanvasDragRef.current.grabOffset = {
            x: ptr.x - objLeft,
            y: ptr.y - objTop,
          };
        }
        const otherCanvas = getOtherCanvas(sourceCanvas);
        const otherPage = getOtherPage(sourceCanvas);
        const otherContainer = document.querySelector(`.canvas-container[data-page="${otherPage}"]`) as HTMLElement;
        const contentW = Number(preview.getAttribute('data-content-w')) || 1;
        const contentH = Number(preview.getAttribute('data-content-h')) || 1;
        const borderW = 2;
        let scale = 1;
        if (otherContainer && otherCanvas?.getWidth) {
          const rect = otherContainer.getBoundingClientRect();
          const fabricW = otherCanvas.getWidth();
          const fabricH = otherCanvas.getHeight?.() ?? fabricW;
          scale = Math.min(rect.width / fabricW, rect.height / fabricH) || 1;
        }
        preview.style.width = `${(contentW + borderW * 2) * scale}px`;
        preview.style.height = `${(contentH + borderW * 2) * scale}px`;
        const go = crossCanvasDragRef.current.grabOffset ?? { x: 0, y: 0 };
        preview.style.left = `${ev.clientX - (borderW + go.x) * scale}px`;
        preview.style.top = `${ev.clientY - (borderW + go.y) * scale}px`;
      } else {
        // Still on first canvas: show actual object (no preview), restore if we had preview
        if (preview) {
          const dragged = crossCanvasDragRef.current.draggedObject;
          removePreview();
          crossCanvasDragRef.current.grabOffset = null;
          crossCanvasDragRef.current.draggedObject = null;
          if (dragged) {
            dragged.set('visible', true);
            sourceCanvas.requestRenderAll();
          }
        }
      }
    };

    const onModified = (e: any) => {
      const { lastPointer, sourceCanvas, previewEl, grabOffset, draggedObject } = crossCanvasDragRef.current;
      crossCanvasDragRef.current = { lastPointer: null, sourceCanvas: null, previewEl: null, grabOffset: null, draggedObject: null };
      if (previewEl && previewEl.parentNode) previewEl.parentNode.removeChild(previewEl);

      if (!sourceCanvas) return;
      const active = sourceCanvas.getActiveObject() ?? draggedObject;
      const restoreVisible = () => {
        if (active) {
          active.set('visible', true);
          sourceCanvas.requestRenderAll();
        }
      };

      if (!lastPointer) {
        restoreVisible();
        return;
      }
      if (!active) return;

      const otherPage = getOtherPage(sourceCanvas);
      const otherContainer = document.querySelector(`.canvas-container[data-page="${otherPage}"]`) as HTMLElement;
      if (!otherContainer) {
        restoreVisible();
        return;
      }
      const rect = otherContainer.getBoundingClientRect();
      const isInside =
        lastPointer.clientX >= rect.left &&
        lastPointer.clientX <= rect.right &&
        lastPointer.clientY >= rect.top &&
        lastPointer.clientY <= rect.bottom;
      if (!isInside) {
        restoreVisible();
        return;
      }

      const targetCanvas = getOtherCanvas(sourceCanvas);
      const fakeEv = { clientX: lastPointer.clientX, clientY: lastPointer.clientY };
      let pointer: { x: number; y: number };
      try {
        pointer = targetCanvas.getPointer(fakeEv);
      } catch {
        pointer = { x: 100, y: 100 };
      }

      sourceCanvas.discardActiveObject();
      const go = grabOffset ?? { x: 0, y: 0 };
      const objectToDrop = active;
      objectToDrop.clone((cloned: any) => {
        if (!cloned) return;
        cloned.set({ left: pointer.x - go.x, top: pointer.y - go.y, visible: true });
        if (cloned.setCoords) cloned.setCoords();
        targetCanvas.add(cloned);
        targetCanvas.discardActiveObject();
        targetCanvas.requestRenderAll();
        sourceCanvas.remove(objectToDrop);
        sourceCanvas.requestRenderAll();
        toast.success('Moved to page ' + otherPage);
      });
    };

    c1.on('object:moving', onMoving);
    c1.on('object:modified', onModified);
    c2.on('object:moving', onMoving);
    c2.on('object:modified', onModified);

    return () => {
      removePreview();
      c1.off('object:moving', onMoving);
      c1.off('object:modified', onModified);
      c2.off('object:moving', onMoving);
      c2.off('object:modified', onModified);
    };
  }, [canvasPageCount, canvasState.fabricCanvas, canvas2State.fabricCanvas]);

  useEffect(() => {
    const shouldOpenUpload = searchParams.get('openUpload') === 'true';
    // Only open if canvas is already ready (in case canvas was ready before the handler ran)
    if (shouldOpenUpload && !isUploadModalOpen && canvasState.fabricCanvas) {
      console.log('📤 Opening upload modal (canvas already ready)');
      setTimeout(() => {
        setIsUploadModalOpen(true);
        // Clean up the query parameter
        const params = new URLSearchParams(searchParams.toString());
        params.delete('openUpload');
        const newQuery = params.toString();
        router.replace(newQuery ? `/resume-builder?${newQuery}` : '/resume-builder');
      }, 200);
    }
  }, [searchParams, isUploadModalOpen, router, canvasState.fabricCanvas]);

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
                onTemplateSelect={(templateId) => handleTemplateSelect(templateId, true)}
                onUploadResume={() => setIsUploadModalOpen(true)}
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
            {/* Top Bar (undo/redo on active canvas) */}
            <div className="flex-shrink-0">
              <ResumeBuilderTopBar
                fabricCanvas={activeCanvasIndex === 0 ? canvasState.fabricCanvas : canvas2State.fabricCanvas}
                onUndo={activeCanvasIndex === 0 ? handleUndo : handleUndo2}
                onRedo={activeCanvasIndex === 0 ? handleRedo : handleRedo2}
                canUndo={activeCanvasIndex === 0 ? canUndo() : canUndo2()}
                canRedo={activeCanvasIndex === 0 ? canRedo() : canRedo2()}
              />
            </div>
            
            {/* Canvas Area – single scroll for both canvases */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                  <LoadingSpinner text="Loading template..." />
                </div>
              )}
              
              <div className="flex-1 overflow-auto bg-gray-50" style={{ padding: '2rem' }}>
                {/* Page 1 canvas */}
                <ResumeBuilderCanvas
                  key="canvas-page-1"
                  pageIndex={1}
                  noScrollWrapper
                  onCanvasReady={handleCanvasReadyWithImport}
                  onStateChange={handleStateChange}
                />
                
                {/* Canvas Edit Manager for page 1 */}
                {canvasState.fabricCanvas && canvasState.fabricCanvas.getElement && canvasState.fabricCanvas.getElement() && (
                  <CanvasEditManager
                    key={`canvas-edit-1-${canvasEditKey}-${hasLoadedImportedResume ? 'imported' : 'default'}-${canvasState.currentTemplateId}`}
                    canvas={canvasState.fabricCanvas}
                    getFabricInstance={getFabricInstance}
                    onEditToolbarUpdate={(updates) => {
                      updateEditToolbarState(updates);
                      setActiveCanvasIndex(0);
                    }}
                    registerCleanup={registerCleanup}
                  />
                )}

                {/* Add/Remove page button – just below canvas, aligned to canvas right edge (not extreme right) */}
                <div
                  className="flex justify-end py-2"
                  style={{
                    width: `${getBaseDimensions().width * getScaledDimensions().scale}px`,
                    margin: '0 auto',
                    minHeight: '2.5rem'
                  }}
                >
                  {canvasPageCount === 1 ? (
                    <button
                      type="button"
                      onClick={() => setCanvasPageCount(2)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md transition-colors"
                    >
                      <FilePlus2 className="w-4 h-4" />
                      Add page
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCanvasPageCount(1)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                    >
                      <FileMinus2 className="w-4 h-4" />
                      Remove second page
                    </button>
                  )}
                </div>

                {/* Page 2 canvas (only when 2 pages) */}
                {canvasPageCount === 2 && (
                  <>
                    <ResumeBuilderCanvas
                      key="canvas-page-2"
                      pageIndex={2}
                      noScrollWrapper
                      onCanvasReady={(canvas) => {
                        handleCanvas2Ready(canvas);
                        const pending = (window as any).__pendingPage2Data;
                        if (pending) {
                          canvas.loadFromJSON(pending, () => {
                            canvas.renderAll();
                            updateCanvasState2({ canvasState: JSON.stringify(pending) });
                          });
                          delete (window as any).__pendingPage2Data;
                        }
                      }}
                      onStateChange={handleStateChange2}
                    />
                    {canvas2State.fabricCanvas && canvas2State.fabricCanvas.getElement && canvas2State.fabricCanvas.getElement() && (
                      <CanvasEditManager
                        key={`canvas-edit-2-${canvasEditKey}`}
                        canvas={canvas2State.fabricCanvas}
                        getFabricInstance={getFabricInstance2}
                        onEditToolbarUpdate={(updates) => {
                          updateEditToolbarState2(updates);
                          setActiveCanvasIndex(1);
                        }}
                        registerCleanup={registerCleanup2}
                      />
                    )}
                  </>
                )}
              </div>
              
              
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
        
        {/* Edit Toolbar (for active canvas) */}
        <CanvasEditToolbar
          fabricCanvas={activeCanvasIndex === 0 ? canvasState.fabricCanvas : canvas2State.fabricCanvas}
          isVisible={activeCanvasIndex === 0 ? editToolbarState.showEditToolbar : editToolbar2State.showEditToolbar}
          position={activeCanvasIndex === 0 ? editToolbarState.editToolbarPosition : editToolbar2State.editToolbarPosition}
          onClose={activeCanvasIndex === 0 ? handleCloseEditToolbar : handleCloseEditToolbar2}
        />
      </div>

      <ResumeUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />
      
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        message="You've run out of credits! Purchase a credit pack to export your resume. (Each export costs 1 credit)"
      />
      
      {/* Auth Modals */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSwitchToSignup={() => {
          setLoginModalOpen(false);
          setSignupModalOpen(true);
        }}
      />
      <SignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSwitchToLogin={() => {
          setSignupModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </ErrorBoundary>
  );
}