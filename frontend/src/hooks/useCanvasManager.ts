import { useState, useRef, useCallback, useEffect } from 'react';
import { CanvasState, EditToolbarState, CanvasEventHandlers, CleanupFunction } from '@/types/canvas';

export const useCanvasManager = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    fabricCanvas: null,
    canvasState: null,
    currentTemplateId: '',
    isRestoring: false,
    lastRestoreAttempt: 0,
  });

  const [editToolbarState, setEditToolbarState] = useState<EditToolbarState>({
    showEditToolbar: false,
    editToolbarPosition: { x: 0, y: 0 },
    selectedObject: null,
    showDeleteButton: false,
  });

  const isRestoringRef = useRef<boolean>(false);
  const lastRestoreAttemptRef = useRef<number>(0);
  const cleanupFunctionsRef = useRef<CleanupFunction[]>([]);
  const fabricInstanceRef = useRef<any>(null);

  // Helper function to get cached fabric instance
  const getFabricInstance = useCallback(async () => {
    if (!fabricInstanceRef.current) {
      const { loadFabric } = await import('@/lib/fabric-loader');
      fabricInstanceRef.current = await loadFabric();
    }
    return fabricInstanceRef.current;
  }, []);

  // Canvas ready handler
  const handleCanvasReady = useCallback((canvas: any) => {
    console.log('🎨 Canvas ready callback triggered - Objects count:', canvas.getObjects().length);
    
    setCanvasState(prev => ({
      ...prev,
      fabricCanvas: canvas,
    }));
      
    // Save initial empty canvas state
    const stateTimeout = setTimeout(() => {
      const initialState = JSON.stringify(canvas.toJSON());
      setCanvasState(prev => ({
        ...prev,
        canvasState: initialState,
      }));
    }, 100);
    
    // Store timeout for cleanup
    cleanupFunctionsRef.current.push(() => clearTimeout(stateTimeout));
  }, []);

  // State change handler
  const handleStateChange = useCallback((state: string) => {
    setCanvasState(prev => ({
      ...prev,
      canvasState: state,
    }));
  }, []);

  // Restore canvas state
  const restoreCanvasState = useCallback(() => {
    const { fabricCanvas, canvasState: state } = canvasState;
    
    if (fabricCanvas && state && !isRestoringRef.current) {
      // Add cooldown to prevent excessive restoration attempts
      const now = Date.now();
      if (now - lastRestoreAttemptRef.current < 1000) {
        return;
      }
      lastRestoreAttemptRef.current = now;
      
      // Additional validation to ensure canvas is ready
      try {
        const canvasElement = fabricCanvas.getElement();
        if (!canvasElement || !canvasElement.getContext) {
          return;
        }
        
        const context = fabricCanvas.getContext();
        if (!context || context.isContextLost()) {
          return;
        }
      } catch (validationError) {
        return;
      }
      
      isRestoringRef.current = true;
      try {
        // Clean the state data before loading
        const cleanState = (jsonString: string) => {
          try {
            const data = JSON.parse(jsonString);
            if (data.objects && Array.isArray(data.objects)) {
              data.objects = data.objects.map((obj: any) => {
                if (obj.textBaseline === 'alphabetical') {
                  obj.textBaseline = 'alphabetic';
                }
                return obj;
              });
            }
            return JSON.stringify(data);
          } catch (e) {
            return jsonString;
          }
        };
        
        const cleanedState = cleanState(state);
        
        // Use the canvas's restore method if available
        if (fabricCanvas.restoreFromState) {
          fabricCanvas.restoreFromState(cleanedState);
          isRestoringRef.current = false;
        } else {
          fabricCanvas.loadFromJSON(cleanedState, () => {
            fabricCanvas.renderAll();
            isRestoringRef.current = false;
          });
        }
      } catch (error) {
        console.error('Error restoring canvas state:', error);
        isRestoringRef.current = false;
      }
    }
  }, [canvasState]);

  // Delete selected object
  const handleDeleteSelected = useCallback(() => {
    const { fabricCanvas } = canvasState;
    const { selectedObject } = editToolbarState;
    
    if (fabricCanvas && selectedObject) {
      fabricCanvas.remove(selectedObject);
      fabricCanvas.renderAll();
      setEditToolbarState(prev => ({
        ...prev,
        selectedObject: null,
        showDeleteButton: false,
        showEditToolbar: false,
      }));
    }
  }, [canvasState, editToolbarState]);

  // Close edit toolbar
  const handleCloseEditToolbar = useCallback(() => {
    setEditToolbarState(prev => ({
      ...prev,
      showEditToolbar: false,
    }));
  }, []);

  // Update edit toolbar state
  const updateEditToolbarState = useCallback((updates: Partial<EditToolbarState>) => {
    setEditToolbarState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Update canvas state
  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Register cleanup function
  const registerCleanup = useCallback((cleanup: CleanupFunction) => {
    cleanupFunctionsRef.current.push(cleanup);
  }, []);

  // Effect to restore canvas state when canvas is empty
  useEffect(() => {
    const { fabricCanvas, canvasState: state } = canvasState;
    
    if (!fabricCanvas || !state) return;
    
    // Only restore if canvas is truly empty
    const hasObjects = fabricCanvas.getObjects().length > 0;
    
    // Check if it's an empty state
    const emptyStatePatterns = [
      '{"version":"5.3.0","objects":[],"background":"#ffffff"}',
      '{"version":"5.1.0","objects":[],"background":"#ffffff"}'
    ];
    const isEmptyState = emptyStatePatterns.includes(state);
    
    if (!hasObjects && !isEmptyState) {
      const restoreTimeout = setTimeout(() => {
        if (fabricCanvas && fabricCanvas.getElement && fabricCanvas.getElement()) {
          console.log('Parent: Canvas empty, restoring state');
          restoreCanvasState();
        }
      }, 300);
      
      return () => clearTimeout(restoreTimeout);
    }
  }, [canvasState, restoreCanvasState]);
  
  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Run all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      });
      cleanupFunctionsRef.current = [];
      
      // Clear fabric instance cache
      fabricInstanceRef.current = null;
    };
  }, []);

  return {
    canvasState,
    editToolbarState,
    getFabricInstance,
    handleCanvasReady,
    handleStateChange,
    restoreCanvasState,
    handleDeleteSelected,
    handleCloseEditToolbar,
    updateEditToolbarState,
    updateCanvasState,
    registerCleanup,
  };
};
