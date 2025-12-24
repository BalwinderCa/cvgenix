'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, Trash2, ZoomIn, ZoomOut, PanelLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const isLoadingImportedResumeRef = useRef(false); // Prevent multiple simultaneous loads
  const isDraggingSlider = useRef(false);
  const zoomUpdateFrame = useRef<number | null>(null);
  const isManualSelection = useRef(false);
  const loadingTemplateIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      // Get canvas data
      const canvasData = canvasState.fabricCanvas.toJSON();
      
      // Ensure width, height, and version are included
      const fullCanvasData = {
        ...canvasData,
        width: canvasState.fabricCanvas.getWidth(),
        height: canvasState.fabricCanvas.getHeight(),
        version: canvasData.version || '5.3.0',
      };

      // Extract basic info from canvas if available (for display purposes)
      // Try to find name, email, etc. from text objects on canvas
      let personalInfo: any = {
        firstName: '',
        lastName: '',
        email: '',
      };

      // Try to extract personal info from canvas text objects
      if (canvasData.objects) {
        const textObjects = canvasData.objects.filter((obj: any) => obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox');
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
  }, [canvasState.fabricCanvas, canvasState.currentTemplateId, currentResumeId, router]);

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
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
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
      // Note: This won't save to server, but allows export to work
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
        // Handle image exports (PNG, JPG) - client-side fallback
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
      
      // Note: Credit deduction is handled by the server export endpoint
      // No need to deduct credits here for client-side fallback
    }
  }, [canvasState.fabricCanvas, exportState.exportFormat, router]);

  // Handle template selection
  const handleTemplateSelect = useCallback(async (templateId: string, isManual = false) => {
    // Validate canvas is ready
    if (!canvasState.fabricCanvas) {
      console.error('Canvas is not ready yet');
      return;
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
      
      // Initialize undo/redo history with the loaded template
      setTimeout(() => {
        if (canvasState.fabricCanvas && !abortControllerRef.current?.signal.aborted) {
          try {
            if (canvasState.fabricCanvas.initializeHistory) {
          canvasState.fabricCanvas.initializeHistory();
        }
        const initialState = JSON.stringify(canvasState.fabricCanvas.toJSON());
        updateCanvasState({ canvasState: initialState });
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

  // Handle zoom change - scales the entire canvas container (keeps content proportional)
  const handleZoomChange = useCallback((zoom: number, immediate = false) => {
    if (!canvasState.fabricCanvas) return;
    
    try {
      const zoomValue = zoom / 100;
      
      // Find the canvas container (white div with shadow) and wrapper using class selectors
      const containerElement = document.querySelector('.canvas-container') as HTMLElement;
      const wrapperElement = document.querySelector('.canvas-zoom-wrapper') as HTMLElement;
      
      if (containerElement && wrapperElement) {
        const baseDimensions = getBaseDimensions();
        const baseWidth = canvasState.fabricCanvas?.getWidth?.() ?? baseDimensions.width;
        const baseHeight = canvasState.fabricCanvas?.getHeight?.() ?? baseDimensions.height;
        
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

  const loadImportedResume = useCallback(async (providedCanvas?: any) => {
    // Prevent multiple simultaneous loads
    if (isLoadingImportedResumeRef.current) {
      console.log('⏭️ Skipping import - already loading');
      return false;
    }
    
    if (hasLoadedImportedResume) {
      console.log('⏭️ Skipping import - already loaded');
      return false;
    }

    // Use provided canvas or fall back to state canvas
    const fabricCanvas = providedCanvas || canvasState.fabricCanvas;
    
    if (!fabricCanvas) {
      console.log('⏭️ Skipping import - no canvas available');
      return false;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    const shouldImport = searchParams.get('imported') === 'true';
    const storedData = window.localStorage.getItem('importedResumeCanvas');

    if (!shouldImport || !storedData) {
      console.log('⏭️ Skipping import - no import flag or data', { shouldImport, hasData: !!storedData });
      return false;
    }
    
    // Mark as loading to prevent concurrent loads
    isLoadingImportedResumeRef.current = true;
    console.log('🚀 Starting loadImportedResume with canvas:', !!providedCanvas ? 'provided' : 'from state');

    // Clean up any existing edit listeners before loading
    // This ensures a clean state when coming from redirect
    if (fabricCanvas.hasEditListeners && fabricCanvas.eventHandlers) {
      const handlers = fabricCanvas.eventHandlers;
      document.removeEventListener('keydown', handlers.keyboard!);
      fabricCanvas.off('mouse:dblclick', handlers.dblclick!);
      fabricCanvas.off('text:editing:entered', handlers.editingEntered!);
      fabricCanvas.off('text:editing:exited', handlers.editingExited!);
      if (handlers.mouseOver) fabricCanvas.off('mouse:over', handlers.mouseOver);
      if (handlers.mouseOut) fabricCanvas.off('mouse:out', handlers.mouseOut);
      if (handlers.mouseMove) fabricCanvas.off('mouse:move', handlers.mouseMove);
      if (handlers.getMouseMoveTimeout) {
        const timeout = handlers.getMouseMoveTimeout();
        if (timeout) clearTimeout(timeout);
      }
      fabricCanvas.off('selection:created', handlers.selectionCreated!);
      fabricCanvas.off('selection:updated', handlers.selectionUpdated!);
      fabricCanvas.off('selection:cleared', handlers.selectionCleared!);
      fabricCanvas.hasEditListeners = false;
      fabricCanvas.eventHandlers = null;
    }
    
    if (fabricCanvas.hoverOverlay) {
      try {
        fabricCanvas.remove(fabricCanvas.hoverOverlay);
        fabricCanvas.hoverOverlay = null;
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    setIsLoading(true);

    try {
      const parsedData = JSON.parse(storedData);

      if (!parsedData || !parsedData.objects) {
        throw new Error('Imported resume data is invalid.');
      }

      if (Array.isArray(parsedData.objects)) {
        parsedData.objects = parsedData.objects.map((obj: any) => {
          if (obj?.textBaseline === 'alphabetical') {
            return { ...obj, textBaseline: 'alphabetic' };
          }
          return obj;
        });
      }

      const baseDimensions = getBaseDimensions();
      const targetWidth =
        typeof parsedData.width === 'number' && parsedData.width > 0
          ? parsedData.width
          : baseDimensions.width;
      const targetHeight =
        typeof parsedData.height === 'number' && parsedData.height > 0
          ? parsedData.height
          : baseDimensions.height;

      // Use the fabricCanvas we already have (either provided or from state)
      // Don't reassign from canvasState as it might not be updated yet
      const existingObjects = [...fabricCanvas.getObjects()];

      existingObjects.forEach((obj) => {
        try {
          fabricCanvas.remove(obj);
        } catch (removeError) {
          console.warn('Error removing object during import:', removeError);
        }
      });

      fabricCanvas.discardActiveObject?.();
      fabricCanvas.backgroundColor = '#ffffff';
      fabricCanvas.setWidth(targetWidth);
      fabricCanvas.setHeight(targetHeight);
      fabricCanvas.setZoom(1);

      await new Promise<void>((resolve, reject) => {
        fabricCanvas.loadFromJSON(
          parsedData,
          () => {
            // Configure all objects to match template configuration exactly
            fabricCanvas.forEachObject((obj: any) => {
              // Skip page border/background rectangles - keep them non-selectable
              // Page borders are identified by: rect type, white fill, gray stroke, full page dimensions, and left: 0
              const PAGE_HEIGHT = 1100; // Match the constant from upload modal
              const CANVAS_WIDTH = 800; // Match the constant from upload modal
              
              // Check if this is a page border rectangle
              const isPageBorder = obj.type === 'rect' && 
                (obj.fill === '#ffffff' || obj.fill === 'white' || obj.fill === 'rgb(255, 255, 255)') &&
                (obj.stroke === '#cccccc' || obj.stroke === '#ccc' || obj.stroke === 'rgb(204, 204, 204)' || obj.strokeWidth === 2) &&
                (obj.width === targetWidth || obj.width === CANVAS_WIDTH || Math.abs(obj.width - targetWidth) < 10) &&
                (obj.height === PAGE_HEIGHT || obj.height === targetHeight || Math.abs(obj.height - PAGE_HEIGHT) < 10 || Math.abs(obj.height - targetHeight) < 10) &&
                (obj.left === 0 || Math.abs(obj.left) < 5); // Page borders start at left: 0
              
              if (isPageBorder) {
                // This is a page border, ensure it stays non-selectable and non-evented
                obj.set({
                  selectable: false,
                  evented: false,
                  excludeFromExport: false, // Keep it for export
                  lockMovementX: true,
                  lockMovementY: true,
                  lockRotation: true,
                  lockScalingX: true,
                  lockScalingY: true,
                });
                // Ensure page border is always at the back so it doesn't block hover events
                fabricCanvas.sendToBack(obj);
                return; // Skip further configuration for page borders
              }
              
              // For text objects, apply same configuration as templates
              if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
                // Set textBaseline (same as templates)
                obj.set({ 
                  textBaseline: 'alphabetic',
                  // Ensure originX and originY match templates
                  originX: obj.originX || 'left',
                  originY: obj.originY || 'top',
                  // Ensure textAlign matches templates
                  textAlign: obj.textAlign || 'left',
                });
                
                // Apply control visibility settings (same as templates)
                obj.setControlsVisibility({
                  mt: false, mb: false, mtr: false,
                  ml: true, mr: true,
                  tl: true, tr: true, bl: true, br: true
                });
                
                // Make text objects editable and selectable (same as templates)
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
                });
                
                // Force object to be interactive
                obj.selectable = true;
                obj.evented = true;
              } else {
                // For other objects (like rects that aren't page borders), make them editable
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
                });
              }
            });
            
            // Log object configuration
            const textObjects = fabricCanvas.getObjects().filter((obj: any) => 
              obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text'
            );
            const selectableObjects = fabricCanvas.getObjects().filter((obj: any) => 
              obj.selectable && obj.evented
            );
            console.log('📊 Imported resume objects:', {
              total: fabricCanvas.getObjects().length,
              textObjects: textObjects.length,
              selectableObjects: selectableObjects.length,
            });
            
            // Ensure canvas selection and interactivity are enabled for editing
            (fabricCanvas as any).selection = true;
            if ((fabricCanvas as any).interactive !== undefined) {
              (fabricCanvas as any).interactive = true;
            }
            
            // Force re-render to ensure object properties are applied
            fabricCanvas.renderAll();
            
            // Double-check that objects are selectable after render
            fabricCanvas.forEachObject((obj: any) => {
              if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
                if (!obj.selectable || !obj.evented) {
                  console.warn('⚠️ Object not selectable after configuration:', {
                    type: obj.type,
                    selectable: obj.selectable,
                    evented: obj.evented,
                    text: obj.text?.substring(0, 20)
                  });
                  // Force it to be selectable and interactive
                  obj.set({ 
                    selectable: true, 
                    evented: true,
                    hoverCursor: 'move',
                    moveCursor: 'move'
                  });
                }
                // Ensure object can receive mouse events
                obj.selectable = true;
                obj.evented = true;
                // Make sure object is not excluded from export (which might affect interactivity)
                if (obj.excludeFromExport === true) {
                  obj.excludeFromExport = false;
                }
              }
            });
            
            // Ensure canvas can receive events
            (fabricCanvas as any).selection = true;
            fabricCanvas.renderAll();
            
            // Final verification and force interactivity
            const finalSelectable = fabricCanvas.getObjects().filter((obj: any) => {
              if (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text') {
                // Force interactivity one more time
                if (!obj.selectable || !obj.evented) {
                  obj.selectable = true;
                  obj.evented = true;
                }
                return obj.selectable && obj.evented;
              }
              return false;
            });
            console.log('✅ Final verification - Interactive text objects:', finalSelectable.length, 'out of', textObjects.length);
            
            // Force canvas to recognize object changes
            fabricCanvas.renderAll();
            
            // Add a test event listener to verify objects can receive events
            const testClick = (e: any) => {
              if (e.target) {
                console.log('🖱️ Test click received on object:', {
                  type: e.target.type,
                  selectable: e.target.selectable,
                  evented: e.target.evented,
                  text: e.target.text?.substring(0, 20)
                });
              }
            };
            fabricCanvas.once('mouse:down', testClick);
            console.log('🧪 Test click listener attached - try clicking on a text object');
            
            const objectsAfterLoad = fabricCanvas.getObjects();
            console.log('✅ Imported resume loaded - Objects count:', objectsAfterLoad.length);
            
            if (fabricCanvas.initializeHistory) {
              fabricCanvas.initializeHistory();
            }
            if (fabricCanvas.saveState) {
              fabricCanvas.saveState();
            }
            
            // Reset edit listeners flag so CanvasEditManager can re-initialize with new objects
            // This ensures hover effects work properly after loading imported resume
            if (fabricCanvas.hasEditListeners) {
              fabricCanvas.hasEditListeners = false;
            }
            
            resolve();
          },
          (_objectData: any, object: any) => {
            if (
              object &&
              (object.type === 'text' ||
                object.type === 'textbox' ||
                object.type === 'i-text')
            ) {
              object.set({ textBaseline: 'alphabetic' });
            }
          }
        );
      });

      const serializedState = JSON.stringify(fabricCanvas.toJSON());
      updateCanvasState({
        currentTemplateId: 'imported-resume',
        canvasState: serializedState,
      });

      setHasLoadedImportedResume(true);
      // Don't remove from localStorage yet - wait until after CanvasEditManager is remounted
      // window.localStorage.removeItem('importedResumeCanvas');
      handleZoomChange(100, false);

      // Force CanvasEditManager to re-initialize by clearing listeners and triggering re-mount
      // Use a longer timeout to ensure canvas is fully rendered and objects are ready
      // This is especially important when coming from a page redirect (homepage upload)
      setTimeout(() => {
        // Always clean up existing listeners, regardless of hasEditListeners flag
        // This ensures a clean state when coming from redirect
        if (fabricCanvas.eventHandlers) {
          const handlers = fabricCanvas.eventHandlers;
          document.removeEventListener('keydown', handlers.keyboard!);
          fabricCanvas.off('mouse:dblclick', handlers.dblclick!);
          fabricCanvas.off('text:editing:entered', handlers.editingEntered!);
          fabricCanvas.off('text:editing:exited', handlers.editingExited!);
          if (handlers.mouseOver) fabricCanvas.off('mouse:over', handlers.mouseOver);
          if (handlers.mouseOut) fabricCanvas.off('mouse:out', handlers.mouseOut);
          if (handlers.mouseMove) fabricCanvas.off('mouse:move', handlers.mouseMove);
          if (handlers.getMouseMoveTimeout) {
            const timeout = handlers.getMouseMoveTimeout();
            if (timeout) clearTimeout(timeout);
          }
          fabricCanvas.off('selection:created', handlers.selectionCreated!);
          fabricCanvas.off('selection:updated', handlers.selectionUpdated!);
          fabricCanvas.off('selection:cleared', handlers.selectionCleared!);
        }
        
        // Clean up hover overlay
        if (fabricCanvas.hoverOverlay) {
          try {
            fabricCanvas.remove(fabricCanvas.hoverOverlay);
            fabricCanvas.hoverOverlay = null;
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        // Reset flags to ensure clean state BEFORE remounting
        // This must happen synchronously so CanvasEditManager can re-initialize
        fabricCanvas.hasEditListeners = false;
        fabricCanvas.hoveredObject = null;
        fabricCanvas.eventHandlers = null;
        
        // Verify objects are loaded before remounting CanvasEditManager
        const objects = fabricCanvas.getObjects();
        console.log('🔄 Checking objects before remounting CanvasEditManager - Count:', objects.length);
        console.log('🔄 Canvas hasEditListeners flag:', fabricCanvas.hasEditListeners);
        
        if (objects && objects.length > 0) {
          // Ensure canvas is rendered before remounting CanvasEditManager
          fabricCanvas.renderAll();
          
          console.log('✅ Remounting CanvasEditManager with', objects.length, 'objects');
          console.log('✅ Canvas flags cleared - hasEditListeners:', fabricCanvas.hasEditListeners);
          
          // Clear the loading flag
          isLoadingImportedResumeRef.current = false;
          
          // Force CanvasEditManager to remount by updating key
          // This will cause it to re-initialize with the newly loaded objects
          // The hasEditListeners flag is already false, so it will initialize
          setCanvasEditKey(prev => {
            const newKey = prev + 1;
            console.log('🔑 CanvasEditManager key updated to:', newKey);
            return newKey;
          });
          
          // Now safe to remove from localStorage after remount
          setTimeout(() => {
            window.localStorage.removeItem('importedResumeCanvas');
            console.log('🗑️ Cleared importedResumeCanvas from localStorage');
          }, 100);
        } else {
          console.warn('⚠️ No objects found, retrying...');
          // If no objects yet, wait a bit more and try again
          setTimeout(() => {
            const retryObjects = fabricCanvas.getObjects();
            console.log('🔄 Retry check - Objects count:', retryObjects.length);
            if (retryObjects && retryObjects.length > 0) {
              fabricCanvas.renderAll();
              console.log('✅ Remounting CanvasEditManager on retry with', retryObjects.length, 'objects');
              
              // Ensure flags are cleared before remount
              fabricCanvas.hasEditListeners = false;
              fabricCanvas.hoveredObject = null;
              fabricCanvas.eventHandlers = null;
              
              // Clear the loading flag
              isLoadingImportedResumeRef.current = false;
              
              setCanvasEditKey(prev => {
                const newKey = prev + 1;
                console.log('🔑 CanvasEditManager key updated to (retry):', newKey);
                return newKey;
              });
              
              // Now safe to remove from localStorage after remount
              setTimeout(() => {
                window.localStorage.removeItem('importedResumeCanvas');
                console.log('🗑️ Cleared importedResumeCanvas from localStorage (retry)');
              }, 100);
            } else {
              console.error('❌ Still no objects after retry!');
              isLoadingImportedResumeRef.current = false;
            }
          }, 200);
        }
      }, 300); // Increased timeout to ensure objects are fully loaded and configured

      const params = new URLSearchParams(searchParams.toString());
      params.delete('imported');
      params.delete('source');
      const newQuery = params.toString();
      router.replace(newQuery ? `/resume-builder?${newQuery}` : '/resume-builder');

      return true;
    } catch (err) {
      console.error('Error loading imported resume:', err);
      setError(err instanceof Error ? err.message : 'Failed to load uploaded resume.');
      isLoadingImportedResumeRef.current = false; // Clear flag on error
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
  ]);

  // Custom canvas ready handler that also checks for imported resume and upload modal
  const handleCanvasReadyWithImport = useCallback((canvas: any) => {
    console.log('🎯 Canvas ready with import check - Objects:', canvas.getObjects().length);
    
    // Call the original handler to set canvas in state
    handleCanvasReady(canvas);
    
    // Immediately check and load imported resume if needed
    // This ensures it loads as soon as canvas is ready, not waiting for useEffect
    const shouldImport = searchParams.get('imported') === 'true';
    const storedData = typeof window !== 'undefined' ? window.localStorage.getItem('importedResumeCanvas') : null;
    
    console.log('🔍 Import check - shouldImport:', shouldImport, 'hasData:', !!storedData, 'hasLoaded:', hasLoadedImportedResume);
    
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
  // Function to load resume by ID
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

        // Load canvas data if available
        if (resume.canvasData) {
          const fabric = await import('fabric').then(m => m.fabric);
          canvas.loadFromJSON(resume.canvasData, () => {
            canvas.renderAll();
            toast.success('Resume loaded successfully!');
          });
        } else {
          toast.info('Resume loaded, but no canvas data found. Starting fresh.');
        }
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
  }, [canvasState.fabricCanvas, router]);

  // Load existing resume if resumeId is in URL
  useEffect(() => {
    const resumeId = searchParams.get('resumeId');
    if (resumeId && resumeId !== currentResumeId && canvasState.fabricCanvas) {
      loadResumeById(resumeId);
    }
  }, [searchParams, canvasState.fabricCanvas, currentResumeId, loadResumeById]);

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
            {/* Top Bar */}
            <div className="flex-shrink-0">
              <ResumeBuilderTopBar
                fabricCanvas={canvasState.fabricCanvas}
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
                onCanvasReady={handleCanvasReadyWithImport}
                onStateChange={handleStateChange}
              />
              
              {/* Canvas Edit Manager */}
              {canvasState.fabricCanvas && (
                <CanvasEditManager
                  key={`canvas-edit-${canvasEditKey}-${hasLoadedImportedResume ? 'imported' : 'default'}-${canvasState.currentTemplateId}`}
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