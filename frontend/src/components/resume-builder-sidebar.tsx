'use client';

import { useState } from 'react';
import { loadFabric } from '@/lib/fabric-loader';
import { 
  Download, 
  Undo, 
  Redo, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Copy,
  Trash2,
  MoveUp,
  MoveDown,
  RotateCcw,
  Type,
  Square,
  Circle,
  Palette,
  Settings,
  Strikethrough,
  AlignJustify,
  List,
  Minus,
  Plus,
  PanelLeft,
  Save,
  Upload,
  FileText,
  Sparkles,
  Layout,
  Shapes,
  Image,
  Cloud,
  Pencil,
  ChevronRight,
  Triangle,
  Star,
  Hexagon,
  ArrowRight,
  Heart,
  Quote,
  Code,
  Hash,
  Award,
  Tag,
  Highlighter,
  Link,
  Heading1,
  Heading2
} from 'lucide-react';
import TemplateSidebar from './template-sidebar';

interface ResumeBuilderSidebarProps {
  fabricCanvas: any;
  activeSidebarTab: string;
  setActiveSidebarTab: (tab: string) => void;
  currentTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export default function ResumeBuilderSidebar({ 
  fabricCanvas, 
  activeSidebarTab, 
  setActiveSidebarTab,
  currentTemplateId,
  onTemplateSelect
}: ResumeBuilderSidebarProps) {
  const createFabricObject = async (objectType: string, options: any) => {
    if (!fabricCanvas) return;
    
    try {
      const fabric = await loadFabric();
      if (!fabric) return;

      let obj;
      switch (objectType) {
        case 'Line':
          obj = new fabric.Line(options.points, options);
          break;
        case 'Rect':
          obj = new fabric.Rect(options);
          break;
        case 'Circle':
          obj = new fabric.Circle(options);
          break;
        case 'Triangle':
          obj = new fabric.Triangle(options);
          break;
        case 'Polygon':
          obj = new fabric.Polygon(options.points, options);
          break;
        case 'Textbox':
          obj = new fabric.Textbox(options.text, options);
          break;
        case 'Ellipse':
          obj = new fabric.Ellipse(options);
          break;
        default:
          return;
      }

      // Set common properties
      obj.setControlsVisibility({
        mt: false, mb: false, mtr: false, // Hide rotation handle
        ml: true, mr: true, // Keep middle left and right handles
        tl: true, tr: true, bl: true, br: true
      });
      obj.set({
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
        originY: 'top' // Keep text anchored to top
      });

      // Ensure text objects have proper anchoring
      if (obj.type === 'textbox' || obj.type === 'text') {
        obj.set({
          originX: 'left',
          originY: 'top'
        });
      }

      fabricCanvas.add(obj);
      fabricCanvas.setActiveObject(obj);
      fabricCanvas.renderAll();
    } catch (error) {
      console.error('Error creating fabric object:', error);
    }
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 text-sm">Design Tools</h3>
        <p className="text-xs text-gray-500">Build your resume</p>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-4 border-b border-gray-200">
        <button
          onClick={() => setActiveSidebarTab('design')}
          className={`p-3 text-xs font-medium transition-colors ${
            activeSidebarTab === 'design'
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Design
        </button>
        <button
          onClick={() => setActiveSidebarTab('elements')}
          className={`p-3 text-xs font-medium transition-colors ${
            activeSidebarTab === 'elements'
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Elements
        </button>
        <button
          onClick={() => setActiveSidebarTab('text')}
          className={`p-3 text-xs font-medium transition-colors ${
            activeSidebarTab === 'text'
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Text
        </button>
        <button
          onClick={() => setActiveSidebarTab('uploads')}
          className={`p-3 text-xs font-medium transition-colors ${
            activeSidebarTab === 'uploads'
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Uploads
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSidebarTab === 'design' && (
          <TemplateSidebar 
            currentTemplateId={currentTemplateId}
            onTemplateSelect={onTemplateSelect}
            canvasReady={!!fabricCanvas}
          />
        )}
        
        {activeSidebarTab === 'elements' && (
          <div className="p-4 space-y-4">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 text-sm">Elements</h3>
              <p className="text-xs text-gray-500">Add shapes and graphics</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Lines</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => createFabricObject('Line', {
                    points: [50, 50, 200, 50],
                    left: 100,
                    top: 100,
                    stroke: '#6366f1',
                    strokeWidth: 6,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Double Line</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Line', {
                    points: [50, 50, 200, 50],
                    left: 100,
                    top: 100,
                    stroke: '#f97316',
                    strokeWidth: 4,
                    strokeDashArray: [10, 5],
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Zigzag Line</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Line', {
                    points: [50, 50, 150, 50],
                    stroke: '#ef4444',
                    strokeWidth: 3,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Line</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Line', {
                    points: [50, 50, 200, 50],
                    left: 100,
                    top: 100,
                    stroke: '#dc2626',
                    strokeWidth: 4,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Arrow Line</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Line', {
                    points: [50, 50, 200, 50],
                    left: 100,
                    top: 100,
                    stroke: '#8b5cf6',
                    strokeWidth: 5,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Gradient Line</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Shapes</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => createFabricObject('Rect', {
                    left: 100,
                    top: 100,
                    width: 100,
                    height: 100,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Square className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Rectangle</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Circle', {
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: '#10b981',
                    stroke: '#059669',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Circle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Circle</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Triangle', {
                    left: 100,
                    top: 100,
                    width: 60,
                    height: 60,
                    fill: '#f59e0b',
                    stroke: '#d97706',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Triangle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Triangle</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Polygon', {
                    points: [
                      { x: 0, y: -40 },
                      { x: 12, y: -12 },
                      { x: 40, y: -12 },
                      { x: 20, y: 8 },
                      { x: 24, y: 40 },
                      { x: 0, y: 24 },
                      { x: -24, y: 40 },
                      { x: -20, y: 8 },
                      { x: -40, y: -12 },
                      { x: -12, y: -12 }
                    ],
                    left: 100,
                    top: 100,
                    fill: '#eab308',
                    stroke: '#ca8a04',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Star className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Star</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Icons</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => createFabricObject('Polygon', {
                    points: [
                      { x: 0, y: -15 },
                      { x: 15, y: -15 },
                      { x: 20, y: 0 },
                      { x: 0, y: 20 },
                      { x: -20, y: 0 },
                      { x: -15, y: -15 },
                      { x: 0, y: -15 }
                    ],
                    left: 100,
                    top: 100,
                    fill: '#ef4444',
                    stroke: '#dc2626',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Heart</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Ellipse', {
                    left: 100,
                    top: 100,
                    rx: 40,
                    ry: 25,
                    fill: '#94a3b8',
                    stroke: '#64748b',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Cloud className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Cloud</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Polygon', {
                    points: [
                      { x: -30, y: -10 },
                      { x: 20, y: -10 },
                      { x: 20, y: -20 },
                      { x: 40, y: 0 },
                      { x: 20, y: 20 },
                      { x: 20, y: 10 },
                      { x: -30, y: 10 }
                    ],
                    left: 100,
                    top: 100,
                    fill: '#dc2626',
                    stroke: '#b91c1c',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Arrow</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Polygon', {
                    points: [
                      { x: 0, y: -20 },
                      { x: 20, y: 0 },
                      { x: 0, y: 20 },
                      { x: -20, y: 0 }
                    ],
                    left: 100,
                    top: 100,
                    fill: '#8b5cf6',
                    stroke: '#7c3aed',
                    strokeWidth: 2,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Square className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Diamond</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSidebarTab === 'text' && (
          <div className="p-4 space-y-4">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 text-sm">Text Tools</h3>
              <p className="text-xs text-gray-500">Add and format text elements</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Headings & Titles</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'Heading',
                    left: 100,
                    top: 100,
                    fontSize: 24,
                    fontFamily: 'Arial',
                    fill: '#1f2937',
                    fontWeight: 'bold',
                    width: 200,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Heading1 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Heading</span>
                  </div>
                  <span className="text-xs text-gray-400">24px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'Body text content',
                    left: 100,
                    top: 100,
                    fontSize: 14,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    width: 200,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Body Text</span>
                  </div>
                  <span className="text-xs text-gray-400">14px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'Subheading',
                    left: 100,
                    top: 100,
                    fontSize: 18,
                    fontFamily: 'Arial',
                    fill: '#1f2937',
                    fontWeight: '600',
                    width: 200,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Heading2 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Subheading</span>
                  </div>
                  <span className="text-xs text-gray-400">18px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'Caption text',
                    left: 100,
                    top: 100,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#6b7280',
                    fontStyle: 'italic',
                    width: 200,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Image className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Caption</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSidebarTab === 'uploads' && (
          <div className="p-4 space-y-4">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 text-sm">Uploads</h3>
              <p className="text-xs text-gray-500">Add images and files</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drag & drop files here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}