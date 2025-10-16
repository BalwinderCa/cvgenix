import { TemplateData } from '@/types/canvas';

export class TemplateService {
  private static instance: TemplateService;
  private fabricInstance: any = null;
  private loadingTemplates: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  private async getFabricInstance() {
    if (!this.fabricInstance) {
      const { loadFabric } = await import('@/lib/fabric-loader');
      this.fabricInstance = await loadFabric();
    }
    return this.fabricInstance;
  }

  public async loadTemplate(templateId: string): Promise<TemplateData | null> {
    try {
      const response = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }

  public cleanTemplateForFabric(templateData: TemplateData): TemplateData {
    if (!templateData) {
      return templateData;
    }

    // Helper function to clean objects array
    const cleanObjectsArray = (objects: any[]) => {
      if (!Array.isArray(objects)) return objects;
      
      return objects.map((obj: any) => {
        const cleanObj = { ...obj };
        
        // Fix invalid textBaseline values
        if (cleanObj.textBaseline && cleanObj.textBaseline === 'alphabetical') {
          cleanObj.textBaseline = 'alphabetic';
        }
        
        // Fix other common issues
        if (cleanObj.textAlign && typeof cleanObj.textAlign === 'string') {
          const validAligns = ['left', 'center', 'right', 'justify', 'justify-left', 'justify-center', 'justify-right'];
          if (!validAligns.includes(cleanObj.textAlign)) {
            cleanObj.textAlign = 'left';
          }
        }
        
        return cleanObj;
      });
    };

    const cleanedData = { ...templateData };

    // Clean objects in various possible locations
    if (cleanedData.canvasData) {
      if (cleanedData.canvasData.objects) {
        cleanedData.canvasData.objects = cleanObjectsArray(cleanedData.canvasData.objects);
      }
      if (cleanedData.canvasData.elements) {
        cleanedData.canvasData.elements = cleanObjectsArray(cleanedData.canvasData.elements);
      }
    }
    
    if (cleanedData.builderData) {
      if (cleanedData.builderData.elements) {
        cleanedData.builderData.elements = cleanObjectsArray(cleanedData.builderData.elements);
      }
      if (cleanedData.builderData.objects) {
        cleanedData.builderData.objects = cleanObjectsArray(cleanedData.builderData.objects);
      }
      if (cleanedData.builderData.canvas && cleanedData.builderData.canvas.objects) {
        cleanedData.builderData.canvas.objects = cleanObjectsArray(cleanedData.builderData.canvas.objects);
      }
      if (cleanedData.builderData.stage && cleanedData.builderData.stage.objects) {
        cleanedData.builderData.stage.objects = cleanObjectsArray(cleanedData.builderData.stage.objects);
      }
    }
    
    if (cleanedData.elements) {
      cleanedData.elements = cleanObjectsArray(cleanedData.elements);
    }

    return cleanedData;
  }

  public extractElementsFromTemplate(templateData: TemplateData): any[] | null {
    let elementsToLoad = null;
    
    if (templateData.canvasData && templateData.canvasData.objects) {
      elementsToLoad = templateData.canvasData.objects;
    } else if (templateData.canvasData && templateData.canvasData.elements) {
      elementsToLoad = templateData.canvasData.elements;
    } else if (templateData.builderData) {
      // Check various possible locations in builderData
      if (templateData.builderData.elements) {
        elementsToLoad = templateData.builderData.elements;
      } else if (templateData.builderData.objects) {
        elementsToLoad = templateData.builderData.objects;
      } else if (templateData.builderData.canvas && templateData.builderData.canvas.objects) {
        elementsToLoad = templateData.builderData.canvas.objects;
      } else if (templateData.builderData.stage && templateData.builderData.stage.objects) {
        elementsToLoad = templateData.builderData.stage.objects;
      } else {
        // Try to find any array that might contain objects
        for (const key in templateData.builderData) {
          const value = (templateData.builderData as any)[key];
          if (Array.isArray(value) && value.length > 0 && value[0].type) {
            elementsToLoad = value;
            break;
          }
        }
      }
    } else if (templateData.elements) {
      elementsToLoad = templateData.elements;
    }
    
    // Clean the elementsToLoad array to fix any textBaseline issues
    if (elementsToLoad && Array.isArray(elementsToLoad)) {
      elementsToLoad = elementsToLoad.map((obj: any) => {
        const cleanObj = { ...obj };
        if (cleanObj.textBaseline && cleanObj.textBaseline === 'alphabetical') {
          cleanObj.textBaseline = 'alphabetic';
        }
        return cleanObj;
      });
    }
    
    return elementsToLoad;
  }

  public async loadTemplateIntoCanvas(canvas: any, templateId: string, baseDimensions?: { width: number; height: number }): Promise<void> {
    // Prevent concurrent loading of the same template
    if (this.loadingTemplates.has(templateId)) {
      console.log('Template already loading, skipping...');
      return;
    }
    
    this.loadingTemplates.add(templateId);
    
    try {
      console.log('📄 Loading template:', templateId);
      
      // Load template data
      const templateData = await this.loadTemplate(templateId);
      console.log('📄 Template data loaded:', templateData);
      
      if (!templateData) {
        throw new Error('Template data is null or undefined');
      }
      
      // Extract elements to load
      const elementsToLoad = this.extractElementsFromTemplate(templateData);
      
      if (!elementsToLoad || elementsToLoad.length === 0) {
        console.warn('No elements found in template');
        return;
      }

      // Validate canvas is ready
      this.validateCanvas(canvas);
      
      // Clear canvas
      this.clearCanvas(canvas, baseDimensions);
      
      // Get fabric instance
      const fabric = await this.getFabricInstance();
      if (!fabric) {
        throw new Error('Fabric.js not available');
      }
      
      // Create and add objects
      await this.createAndAddObjects(canvas, fabric, elementsToLoad);
      
      // Final render and state save
      canvas.renderAll();
      if (canvas.saveState) {
        canvas.saveState();
      }
      
      console.log('✅ Template loaded successfully - Objects count:', canvas.getObjects().length);
      
    } catch (error) {
      console.error('Error loading template into canvas:', error);
      throw error;
    } finally {
      // Remove template from loading set
      this.loadingTemplates.delete(templateId);
    }
  }

  private validateCanvas(canvas: any): void {
    if (!canvas) {
      throw new Error('Canvas is null or undefined');
    }
    
    const element = canvas.getElement();
    if (!element) {
      throw new Error('Canvas element is null');
    }
    
    const ctx = canvas.getContext();
    if (!ctx) {
      throw new Error('Canvas context is null - canvas may have been disposed');
    }
    
    if (ctx.isContextLost && ctx.isContextLost()) {
      throw new Error('Canvas context is lost');
    }
  }

  private clearCanvas(canvas: any, baseDimensions?: { width: number; height: number }): void {
    // Remove all objects manually instead of using clear()
    const objects = canvas.getObjects();
    while (objects.length > 0) {
      canvas.remove(objects[0]);
    }
    
    canvas.backgroundColor = '#ffffff';
    
    // Reset canvas to base dimensions (use provided or default)
    const baseWidth = baseDimensions?.width || 800;
    const baseHeight = baseDimensions?.height || 1000;
    
    canvas.setWidth(baseWidth);
    canvas.setHeight(baseHeight);
    canvas.setZoom(1);
    
    console.log('🎨 Canvas cleared and ready - Objects count:', canvas.getObjects().length);
    
    // Ensure render
    canvas.renderAll();
  }

  private async createAndAddObjects(canvas: any, fabric: any, elementsToLoad: any[]): Promise<void> {
    const objectsToAdd: any[] = [];
    
    for (const elementData of elementsToLoad) {
      try {
        let obj = null;
        
        // Clean the element data
        const cleanData = {
          left: elementData.left || 0,
          top: elementData.top || 0,
          fontSize: elementData.fontSize || 12,
          fontFamily: elementData.fontFamily || 'Arial',
          fill: elementData.fill || '#000000',
          fontWeight: elementData.fontWeight || 'normal',
          textBaseline: elementData.textBaseline === 'alphabetical' ? 'alphabetic' : 
                       (elementData.textBaseline === 'alphabetic' ? 'alphabetic' : 'alphabetic'),
          fontStyle: elementData.fontStyle || 'normal',
          textAlign: elementData.textAlign || 'left',
          width: elementData.width || 200,
          height: elementData.height || 50,
          originX: 'left',
          originY: 'top'
        };
        
        if (elementData.type === 'textbox' && elementData.text) {
          obj = new fabric.Textbox(elementData.text, cleanData);
        } else if (elementData.type === 'text' && elementData.text) {
          obj = new fabric.Text(elementData.text, cleanData);
        }
        
        // Ensure textBaseline is set correctly for all text objects
        if (obj && (obj.type === 'text' || obj.type === 'textbox')) {
          obj.set({ textBaseline: 'alphabetic' });
          
          // Apply control visibility settings to template objects
          obj.setControlsVisibility({
            mt: false, mb: false, mtr: false,
            ml: true, mr: true,
            tl: true, tr: true, bl: true, br: true
          });
          
          objectsToAdd.push(obj);
        }
      } catch (elementError) {
        console.error('Error creating element:', elementError);
      }
    }
    
    // Add all objects at once for better performance
    if (objectsToAdd.length > 0) {
      canvas.add(...objectsToAdd);
    }
  }
}
