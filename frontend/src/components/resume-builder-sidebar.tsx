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
  Heading2,
  Phone,
  Briefcase,
  GraduationCap,
  Zap,
  Search
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
  const [showAllShapes, setShowAllShapes] = useState(false);
  const [showAllResumeElements, setShowAllResumeElements] = useState(false);
  const [showAllContentBlocks, setShowAllContentBlocks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to check if an element matches the search query
  const matchesSearch = (elementName: string, elementType?: string) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return elementName.toLowerCase().includes(query) || 
           (elementType && elementType.toLowerCase().includes(query));
  };

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
      if (objectType === 'Line') {
        // For lines, only show left and right middle handles
        obj.setControlsVisibility({
          mt: false, mb: false, mtr: false, // Hide rotation and top/bottom handles
          ml: true, mr: true, // Keep middle left and right handles
          tl: false, tr: false, bl: false, br: false // Hide corner handles
        });
      } else {
        // For other objects, use default control visibility
        obj.setControlsVisibility({
          mt: false, mb: false, mtr: false, // Hide rotation handle
          ml: true, mr: true, // Keep middle left and right handles
          tl: true, tr: true, bl: true, br: true
        });
      }
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

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Lines</h4>
              <div className="grid grid-cols-1 gap-2">
                {matchesSearch('Line', 'line') && (
                  <button 
                    onClick={() => createFabricObject('Line', {
                      points: [50, 50, 200, 50],
                      left: 100,
                      top: 100,
                      stroke: '#1f2937',
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
                )}
                {matchesSearch('Dashed Line', 'line') && (
                  <button 
                    onClick={() => createFabricObject('Line', {
                      points: [50, 50, 200, 50],
                      left: 100,
                      top: 100,
                      stroke: '#1f2937',
                      strokeWidth: 3,
                      strokeDashArray: [10, 5],
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true
                    })}
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Dashed Line</span>
                  </button>
                )}
                {matchesSearch('Dotted Line', 'line') && (
                  <button 
                    onClick={() => createFabricObject('Line', {
                      points: [50, 50, 200, 50],
                      left: 100,
                      top: 100,
                      stroke: '#1f2937',
                      strokeWidth: 3,
                      strokeDashArray: [5, 5],
                      lockRotation: true,
                      lockUniScaling: true,
                      lockScalingFlip: true
                    })}
                    className="flex items-center space-x-2 p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Dotted Line</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Shapes</h4>
              <div className="grid grid-cols-2 gap-2">
                {matchesSearch('Rectangle', 'shape') && (
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
                )}
                {matchesSearch('Circle', 'shape') && (
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
                )}
                {matchesSearch('Triangle', 'shape') && (
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
                )}
                {matchesSearch('Star', 'shape') && (
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
                )}
              </div>
              
              {/* Show More/Less Button for Shapes - no additional elements, so hide button */}
            </div>
            
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Resume Elements</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'John Doe',
                    left: 100,
                    top: 100,
                    fontSize: 20,
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
                    <Type className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Name</span>
                  </div>
                  <span className="text-xs text-gray-400">20px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'Software Engineer',
                    left: 100,
                    top: 100,
                    fontSize: 16,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    fontWeight: '600',
                    width: 200,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Job Title</span>
                  </div>
                  <span className="text-xs text-gray-400">16px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'john@email.com',
                    left: 100,
                    top: 100,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#6b7280',
                    width: 200,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: '(555) 123-4567',
                    left: 100,
                    top: 100,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#6b7280',
                    width: 200,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Phone</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                
                {/* Additional elements - shown only when showAllResumeElements is true */}
                {showAllResumeElements && (
                  <>
                    <button 
                      onClick={() => createFabricObject('Textbox', {
                        text: 'EXPERIENCE',
                        left: 100,
                        top: 100,
                        fontSize: 14,
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
                        <Briefcase className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Experience</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                    <button 
                      onClick={() => createFabricObject('Textbox', {
                        text: 'EDUCATION',
                        left: 100,
                        top: 100,
                        fontSize: 14,
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
                        <GraduationCap className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Education</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                    <button 
                      onClick={() => createFabricObject('Textbox', {
                        text: 'SKILLS',
                        left: 100,
                        top: 100,
                        fontSize: 14,
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
                        <Zap className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Skills</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                    <button 
                      onClick={() => createFabricObject('Textbox', {
                        text: 'PROJECTS',
                        left: 100,
                        top: 100,
                        fontSize: 14,
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
                        <Code className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Projects</span>
                      </div>
                      <span className="text-xs text-gray-400">14px</span>
                    </button>
                  </>
                )}
              </div>
              
              {/* Show More/Less Button */}
              <button
                onClick={() => setShowAllResumeElements(!showAllResumeElements)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
              >
                {showAllResumeElements ? 'Show Less' : 'Show More'} ({showAllResumeElements ? '4' : '4'} more)
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Content Blocks</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'Company Name - Job Title\n2020 - Present\n• Led development of key features\n• Managed team of 5 developers',
                    left: 100,
                    top: 100,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    width: 300,
                    height: 80,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Job Entry</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'University Name\nBachelor of Science in Computer Science\n2016 - 2020',
                    left: 100,
                    top: 100,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    width: 300,
                    height: 60,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Education Entry</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: '• JavaScript, React, Node.js\n• Python, Django, Flask\n• SQL, MongoDB, PostgreSQL\n• AWS, Docker, Kubernetes',
                    left: 100,
                    top: 100,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    width: 300,
                    height: 80,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <List className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Skills List</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
                <button 
                  onClick={() => createFabricObject('Textbox', {
                    text: 'Project Name\nA brief description of the project and its impact.\nTechnologies: React, Node.js, MongoDB',
                    left: 100,
                    top: 100,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    width: 300,
                    height: 80,
                    lockRotation: true,
                    lockUniScaling: true,
                    lockScalingFlip: true
                  })}
                  className="flex items-center justify-between p-3 text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Project Entry</span>
                  </div>
                  <span className="text-xs text-gray-400">12px</span>
                </button>
              </div>
              
              {/* Show More/Less Button for Content Blocks - no additional elements, so hide button */}
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