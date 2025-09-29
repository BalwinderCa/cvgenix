"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, FileText, Loader2, Lock, Unlock, Move } from 'lucide-react';
import interact from 'interactjs';

interface BuilderComponent {
  type: string;
  tagName?: string;
  content?: string;
  style?: Record<string, any>;
  attributes?: Record<string, any>;
  classes?: string[];
  components?: BuilderComponent[];
}

interface BuilderTemplate {
  _id: string;
  name: string;
  renderEngine: string;
  builderData: {
    components: BuilderComponent[];
    style: string;
  };
}

interface BuilderTemplateRendererProps {
  templateId: string;
  data?: Record<string, any>;
  className?: string;
  editable?: boolean;
  onContentChange?: (componentIndex: number, newData: any) => void;
}

export function BuilderTemplateRenderer({ 
  templateId, 
  data = {}, 
  className = '', 
  editable = false,
  onContentChange
}: BuilderTemplateRendererProps) {
  const [template, setTemplate] = useState<BuilderTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(editable);
  const containerRef = useRef<HTMLDivElement>(null);

  // Template variable replacement
  const replaceTemplateVars = (content: string, data: Record<string, any>): string => {
    if (!content) return '';
    
    let result = content;
    
    // Flatten data for easier replacement
    const flattenedData = {
      ...data,
      ...(data.personalInfo || {}),
      firstName: data.personalInfo?.firstName || data.firstName || 'John',
      lastName: data.personalInfo?.lastName || data.lastName || 'Doe',
      email: data.personalInfo?.email || data.email || 'john.doe@email.com',
      phone: data.personalInfo?.phone || data.phone || '+1 (555) 123-4567',
      summary: data.personalInfo?.summary || data.summary || 'Experienced professional.',
    };
    
    // Replace simple variables
    result = result.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
      return flattenedData[key] || match;
    });
    
    // Replace nested variables
    result = result.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match: string, obj: string, key: string) => {
      return data[obj]?.[key] || match;
    });
    
    // Handle array data
    if (data.experience && Array.isArray(data.experience)) {
      result = result.replace(/\{\{#each experience\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, content) => {
        return data.experience.map((exp: any) => {
          let itemContent = content;
          itemContent = itemContent.replace(/\{\{position\}\}/g, exp.position || '');
          itemContent = itemContent.replace(/\{\{company\}\}/g, exp.company || '');
          itemContent = itemContent.replace(/\{\{startDate\}\}/g, exp.startDate || '');
          itemContent = itemContent.replace(/\{\{endDate\}\}/g, exp.endDate || '');
          itemContent = itemContent.replace(/\{\{description\}\}/g, exp.description || '');
          return itemContent;
        }).join('');
      });
    }
    
    return result;
  };

  // Setup interact.js for draggable elements
  const setupInteractions = (element: HTMLElement, componentIndex: number) => {
    if (!editable || isLocked) return;

    // Add drag handles
    const addDragHandles = (el: HTMLElement) => {
      const handles = document.createElement('div');
      handles.className = 'drag-handles';
      handles.innerHTML = `
        <div class="drag-handle top-left"></div>
        <div class="drag-handle top-right"></div>
        <div class="drag-handle bottom-left"></div>
        <div class="drag-handle bottom-right"></div>
        <div class="drag-handle center"></div>
      `;
      el.appendChild(handles);
    };

    addDragHandles(element);

    // Draggable functionality
    interact(element)
      .draggable({
        listeners: {
          start(event) {
            element.classList.add('dragging');
            element.style.zIndex = '1000';
            element.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
            element.style.border = '2px solid #3b82f6';
          },
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x.toString());
            target.setAttribute('data-y', y.toString());
          },
          end(event) {
            element.classList.remove('dragging');
            element.style.zIndex = '1';
            element.style.boxShadow = '';
            element.style.border = '2px solid transparent';
            
            if (onContentChange) {
              const x = parseFloat(element.getAttribute('data-x') || '0');
              const y = parseFloat(element.getAttribute('data-y') || '0');
              onContentChange(componentIndex, { x, y });
            }
          }
        },
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ],
        inertia: true
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          start(event) {
            element.classList.add('resizing');
            element.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
            element.style.border = '2px solid #10b981';
            
            // Store initial position for proper delta calculation
            const rect = element.getBoundingClientRect();
            const parentRect = element.parentElement?.getBoundingClientRect();
            if (parentRect) {
              element.dataset.initialLeft = (rect.left - parentRect.left).toString();
              element.dataset.initialTop = (rect.top - parentRect.top).toString();
            }
          },
          move(event) {
            const target = event.target;
            const width = Math.max(100, event.rect.width);
            const height = Math.max(50, event.rect.height);

            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            
            // Only update position if we have initial position stored
            const initialLeft = parseFloat(target.dataset.initialLeft || '0');
            const initialTop = parseFloat(target.dataset.initialTop || '0');
            
            // Calculate new position based on delta
            const newLeft = initialLeft + event.deltaRect.left;
            const newTop = initialTop + event.deltaRect.top;
            
            target.style.left = `${newLeft}px`;
            target.style.top = `${newTop}px`;
          },
          end(event) {
            element.classList.remove('resizing');
            element.style.boxShadow = '';
            element.style.border = '2px solid transparent';
            
            // Clean up stored data
            delete element.dataset.initialLeft;
            delete element.dataset.initialTop;
            
            if (onContentChange) {
              const width = event.rect.width;
              const height = event.rect.height;
              onContentChange(componentIndex, { width, height });
            }
          }
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 100, height: 50 }
          })
        ]
      });

    // Hover effects
    element.addEventListener('mouseenter', () => {
      if (!isLocked && editable) {
        element.style.border = '2px solid #3b82f6';
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (!isLocked && editable) {
        element.style.border = '2px solid transparent';
        element.style.backgroundColor = 'transparent';
      }
    });
  };

  // Render component with interactions
  const renderComponent = (component: BuilderComponent, index: number): React.ReactElement => {
    const { type, tagName = 'div', content = '', style = {}, attributes = {}, components = [] } = component;
    
    const processedContent = replaceTemplateVars(content, data);
    
    // Handle array data for lists
    if (content.includes('{{#each')) {
      const listMatch = content.match(/\{\{#each (\w+)\}\}/);
      if (listMatch) {
        const arrayKey = listMatch[1];
        const arrayData = data[arrayKey] || [];
        
        return (
          <div key={index} style={style} {...attributes}>
            {arrayData.map((item: any, itemIndex: number) => (
              <div key={itemIndex}>
                {components.map((childComponent, childIndex) => 
                  renderComponent({
                    ...childComponent,
                    content: replaceTemplateVars(childComponent.content || '', item)
                  }, childIndex)
                )}
              </div>
            ))}
          </div>
        );
      }
    }
    
    // Check if draggable
    const isMainContainer = type === 'container' || tagName === 'main' || (tagName === 'div' && content.includes('resume'));
    const isDraggable = editable && !isLocked && !isMainContainer;

    const Element = tagName as keyof React.JSX.IntrinsicElements;
    
    const elementProps = { 
      key: index, 
      style: {
        ...style,
        position: editable ? 'relative' : 'static',
        cursor: isDraggable ? 'move' : 'default',
        border: isDraggable ? '2px solid transparent' : 'none',
        borderRadius: isDraggable ? '4px' : '0',
        transition: 'all 0.2s ease',
      },
      ...attributes,
      ...(isDraggable && {
        'data-component-index': index,
        'data-x': '0',
        'data-y': '0',
        ref: (el: HTMLElement) => {
          if (el) {
            setupInteractions(el, index);
          }
        }
      })
    };
    
    return React.createElement(
      Element,
      elementProps,
      processedContent,
      ...components.map((childComponent, childIndex) => 
        renderComponent(childComponent, childIndex)
      )
    );
  };

  // Load template
  const loadTemplate = useCallback(async () => {
    if (!templateId) return;
    
    setLoading(true);
    setError('');

    try {
      const templateResponse = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      if (!templateResponse.ok) {
        throw new Error('Template not found');
      }
      
      const templateData = await templateResponse.json();
      
      if (templateData.renderEngine !== 'builder') {
        throw new Error('This template is not a builder framework template');
      }
      
      setTemplate(templateData);
      setHasLoaded(true);
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  // Loading state
  if (loading) {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Builder Template</h3>
            <p className="text-gray-600 text-sm">Rendering component structure...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
        <CardContent className="p-8">
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
        </CardContent>
      </Card>
    );
  }

  // Render template
  if (hasLoaded && template && template.builderData) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        {/* Control Panel */}
        {showControls && (
          <div className="mb-4 space-y-4">
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id="lock-builder"
                  checked={isLocked}
                  onCheckedChange={setIsLocked}
                />
                <Label htmlFor="lock-builder" className="flex items-center gap-1">
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {isLocked ? 'Unlock' : 'Lock'} Components
                </Label>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                isLocked 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                <Move className="w-4 h-4" />
                {isLocked ? 'Components are locked - cannot be moved' : 'Hover over elements to see drag handles • Click and drag to move • Use corners to resize'}
              </div>
            </div>
          </div>
        )}

        <div 
          ref={containerRef}
          style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            minHeight: '1000px',
            position: 'relative'
          }}
        >
          {/* Inject global styles */}
          {template.builderData.style && (
            <style dangerouslySetInnerHTML={{ __html: template.builderData.style }} />
          )}
          
          {/* Interactive styles */}
          {editable && (
            <style jsx>{`
              .dragging {
                border: 2px solid #3b82f6 !important;
                box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3) !important;
                z-index: 1000 !important;
                transform: scale(1.02) !important;
              }
              
              .resizing {
                border: 2px solid #10b981 !important;
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3) !important;
              }
              
              [data-component-index]:hover {
                border: 2px solid #3b82f6 !important;
                background-color: rgba(59, 130, 246, 0.05) !important;
                cursor: move !important;
              }
              
              .drag-handles {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 10;
              }
              
              .drag-handle {
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: #3b82f6;
                border: 2px solid white;
                border-radius: 50%;
                pointer-events: auto;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s ease;
              }
              
              .drag-handle.top-left { top: -4px; left: -4px; cursor: nw-resize; }
              .drag-handle.top-right { top: -4px; right: -4px; cursor: ne-resize; }
              .drag-handle.bottom-left { bottom: -4px; left: -4px; cursor: sw-resize; }
              .drag-handle.bottom-right { bottom: -4px; right: -4px; cursor: se-resize; }
              .drag-handle.center { 
                top: 50%; left: 50%; transform: translate(-50%, -50%); 
                cursor: move; width: 12px; height: 12px; 
              }
              
              [data-component-index]:hover .drag-handle { opacity: 1; }
              .locked [data-component-index] { cursor: not-allowed !important; opacity: 0.7 !important; }
              .locked [data-component-index]:hover { 
                border-color: #ef4444 !important; 
                background-color: rgba(239, 68, 68, 0.05) !important; 
              }
            `}</style>
          )}
          
          {/* Render components */}
          {template.builderData.components.map((component, index) => 
            renderComponent(component, index)
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <Card className={`w-full max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
      <CardContent className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Template Data</h3>
          <p className="text-sm text-gray-600 mb-4">Builder template data not available.</p>
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
