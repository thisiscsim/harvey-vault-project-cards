"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
// import { AnimatedBackground } from "../../components/motion-primitives/animated-background";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Default grayscale color (not selectable, used as initial state)
const defaultGrayColor = '#CCCAC6';

// Color palettes for project cards
const colorPalettes = {
  'dusty': {
    id: 'dusty',
    label: 'Dusty',
    colors: [
      { id: 'ochre', color: '#C9A05C', label: 'Muted Ochre' },
      { id: 'maroon', color: '#C17C76', label: 'Dusty Maroon' },
      { id: 'sea', color: '#6B8CA6', label: 'Muted Sea' },
      { id: 'teal', color: '#569197', label: 'Muted Teal' },
      { id: 'lavender', color: '#8A7A9E', label: 'Dusty Lavender' },
    ],
  },
  'tailwind': {
    id: 'tailwind',
    label: 'Tailwind',
    colors: [
      { id: 'amber', color: '#F59E0B', label: 'Amber 500' },
      { id: 'red', color: '#EF4444', label: 'Red 500' },
      { id: 'blue', color: '#3B82F6', label: 'Blue 500' },
      { id: 'teal', color: '#14B8A6', label: 'Teal 500' },
      { id: 'violet', color: '#8B5CF6', label: 'Violet 500' },
    ],
  },
  'brooding': {
    id: 'brooding',
    label: 'Brooding',
    colors: [
      { id: 'khaki', color: '#9E9B82', label: 'Muted Khaki' },
      { id: 'mauve', color: '#A8898A', label: 'Dusty Mauve' },
      { id: 'slate', color: '#7A8B96', label: 'Storm Slate' },
      { id: 'forest', color: '#6B7F73', label: 'Deep Forest' },
      { id: 'plum', color: '#7D6B7D', label: 'Moody Plum' },
    ],
  },
  'vibrance': {
    id: 'vibrance',
    label: 'Vibrance',
    colors: [
      { id: 'gold', color: '#C9922B', label: 'Accent Gold' },
      { id: 'olive', color: '#6B8E4E', label: 'Accent Olive' },
      { id: 'blue', color: '#4A90A4', label: 'Accent Blue' },
      { id: 'violet', color: '#5B5FC7', label: 'Brand Violet' },
      { id: 'coral', color: '#D4735E', label: 'Warm Coral' },
    ],
  },
  'skittles': {
    id: 'skittles',
    label: 'Skittles',
    editable: true,
    colors: [
      { id: 'color1', color: '#F59E0B', label: 'Color 1' },
      { id: 'color2', color: '#EF4444', label: 'Color 2' },
      { id: 'color3', color: '#3B82F6', label: 'Color 3' },
      { id: 'color4', color: '#14B8A6', label: 'Color 4' },
      { id: 'color5', color: '#8B5CF6', label: 'Color 5' },
    ],
  },
} as const;

// Default color options (for backward compatibility)
const colorOptions = colorPalettes['dusty'].colors;

// Pattern options for project card backgrounds
const patternOptions = [
  { id: 'grid', src: '/accent_filters/Grid.svg', label: 'Grid' },
  { id: 'circle', src: '/accent_filters/Circle.svg', label: 'Circle' },
  { id: 'slice', src: '/accent_filters/Slice.svg', label: 'Slice' },
] as const;

export default function VaultPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const colorPopoverRef = useRef<HTMLDivElement>(null);
  const paletteDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Card style states
  const [titleFont, setTitleFont] = useState<'sans' | 'serif'>('sans');
  const [containedCards, setContainedCards] = useState(false);
  const [condensedCards, setCondensedCards] = useState(false);
  const [reportCards, setReportCards] = useState(false);
  const [gradientsEnabled, setGradientsEnabled] = useState(false);
  const [projectGradients, setProjectGradients] = useState<Record<number, string>>({});
  const [aiImagesEnabled, setAiImagesEnabled] = useState(false);
  const [projectAiImages, setProjectAiImages] = useState<Record<number, string>>({});
  
  // AI-generated branded images (stored in /public/stock/)
  const aiBackgroundImages = [
    '/stock/Frame.png',
    '/stock/haplocanthosauridic__7ca69be5-4fc8-470a-8af8-ba4f3f3541bd_1.png',
    '/stock/haplocanthosauridic__ac382051-cdaf-48b2-8b93-0df4504e2e1d_1.png',
    '/stock/haplocanthosauridic_building_corridor_with_arches_and_shadows_5165f2fc-b1ed-497e-aacd-9f398ce426d0_1.png',
    '/stock/haplocanthosauridic_roman_sculpture_man_moody_lighting_bc0fce74-0693-4fe5-8c50-fb300317b9f3_1.png',
    '/stock/haplocanthosauridic_roman_sculpture_man_moody_lighting_d05fca3e-e40e-4b5d-a5e5-202493d11582_1.png',
    '/stock/iStock-2157307277_1.png',
    '/stock/iStock-532875194_1.png',
    '/stock/iStock-627225530_1.png',
  ];
  
  // Random colors state for project cards
  const [projectColors, setProjectColors] = useState<Record<number, string>>({});
  const [colorsEnabled, setColorsEnabled] = useState(false);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof colorPalettes>('dusty');
  const [paletteDropdownOpen, setPaletteDropdownOpen] = useState(false);
  
  // Bottom bar state
  const [bottomBarOpen, setBottomBarOpen] = useState(true);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [shapeDropdownOpen, setShapeDropdownOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [skittlesColors, setSkittlesColors] = useState<Record<string, string>>({
    color1: '#F59E0B',
    color2: '#EF4444',
    color3: '#3B82F6',
    color4: '#14B8A6',
    color5: '#8B5CF6',
  });

  // Get colors for the current palette (handles editable Skittles palette)
  const getCurrentPaletteColors = () => {
    if (selectedPalette === 'skittles') {
      return Object.entries(skittlesColors).map(([id, color]) => ({
        id,
        color,
        label: `Color ${id.replace('color', '')}`,
      }));
    }
    return [...colorPalettes[selectedPalette].colors];
  };

  // Generate random colors for projects based on selected palette
  const generateRandomColors = () => {
    const colors = getCurrentPaletteColors();
    const newColors: Record<number, string> = {};
    for (let i = 1; i <= 10; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      newColors[i] = randomColor.color;
    }
    setProjectColors(newColors);
  };

  // Toggle colors on/off
  const handleToggleColors = (enabled: boolean) => {
    setColorsEnabled(enabled);
    if (enabled) {
      generateRandomColors();
      // Disable other background options
      setGradientsEnabled(false);
      setAiImagesEnabled(false);
    }
  };

  // Gradient color palettes for fluid gradients (softer, more muted tones)
  const gradientColorSets = [
    // Warm sunset - like image 1 (orange, red, green tones)
    ['#E07B54', '#D4A574', '#8FB572', '#C9856B', '#A3C4A0'],
    // Cool blue-pink - like image 2
    ['#6B9ECF', '#E8A4B8', '#B8D4E8', '#D4B8D4', '#7EB8CF'],
    // Soft lavender sky - like image 3
    ['#B8C8E8', '#E8D4E8', '#8BA4CF', '#D4E0F0', '#C4B8D8'],
    // Warm amber rust - like image 4
    ['#D4856B', '#2C2420', '#E8C4A8', '#8B5A4A', '#C49880'],
    // Ocean mist
    ['#7EC8CF', '#B8E0E8', '#5BA8B8', '#D4F0F0', '#4A98A8'],
    // Peach cream
    ['#F0C4B8', '#E8D8D0', '#D4A090', '#F8E8E0', '#C08878'],
    // Forest sage
    ['#8FB88F', '#C4D4B8', '#6A9870', '#D8E8D0', '#7AAC7A'],
    // Dusk purple
    ['#9080A8', '#C4B8D4', '#7868A0', '#E0D8E8', '#A898C0'],
  ];

  // Generate a fluid mesh gradient CSS string (more organic, WebGL-like)
  const generateFluidGradient = () => {
    const colorSet = gradientColorSets[Math.floor(Math.random() * gradientColorSets.length)];
    
    const gradients: string[] = [];
    
    // Create 4-6 large, soft, overlapping elliptical gradients
    const numBlobs = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numBlobs; i++) {
      const color = colorSet[Math.floor(Math.random() * colorSet.length)];
      // Position blobs across the area, allowing overflow
      const x = -20 + Math.floor(Math.random() * 140);
      const y = -20 + Math.floor(Math.random() * 140);
      // Large elliptical shapes for organic look
      const sizeX = 60 + Math.floor(Math.random() * 80);
      const sizeY = 60 + Math.floor(Math.random() * 80);
      
      // Very soft gradient with extended fade
      gradients.push(
        `radial-gradient(ellipse ${sizeX}% ${sizeY}% at ${x}% ${y}%, ${color} 0%, ${color}B3 20%, ${color}4D 50%, transparent 70%)`
      );
    }
    
    // Add a soft base layer
    const baseColor1 = colorSet[0];
    const baseColor2 = colorSet[Math.floor(colorSet.length / 2)];
    const baseColor3 = colorSet[colorSet.length - 1];
    const angle = Math.floor(Math.random() * 360);
    gradients.push(
      `linear-gradient(${angle}deg, ${baseColor1}66 0%, ${baseColor2}4D 50%, ${baseColor3}66 100%)`
    );
    
    return gradients.join(', ');
  };

  // Generate random gradients for all projects
  const generateRandomGradients = () => {
    const newGradients: Record<number, string> = {};
    for (let i = 1; i <= 10; i++) {
      newGradients[i] = generateFluidGradient();
    }
    setProjectGradients(newGradients);
  };

  // Toggle gradients on/off
  const handleToggleGradients = (enabled: boolean) => {
    setGradientsEnabled(enabled);
    if (enabled) {
      generateRandomGradients();
      // Disable other background options
      setColorsEnabled(false);
      setAiImagesEnabled(false);
    }
  };

  // Assign AI images to projects sequentially (no duplicates)
  const assignAiImages = () => {
    const newImages: Record<number, string> = {};
    for (let i = 1; i <= Math.min(10, aiBackgroundImages.length); i++) {
      // Assign images in order, one per project
      newImages[i] = aiBackgroundImages[i - 1];
    }
    setProjectAiImages(newImages);
  };

  // Toggle AI images on/off
  const handleToggleAiImages = (enabled: boolean) => {
    setAiImagesEnabled(enabled);
    if (enabled) {
      assignAiImages();
      // Disable other background options
      setColorsEnabled(false);
      setGradientsEnabled(false);
    }
  };

  // Handle palette selection
  const handlePaletteSelect = (paletteId: keyof typeof colorPalettes) => {
    setSelectedPalette(paletteId);
    setPaletteDropdownOpen(false);
    // If colors are enabled, regenerate with new palette
    if (colorsEnabled) {
      let colors;
      if (paletteId === 'skittles') {
        colors = Object.values(skittlesColors);
      } else {
        colors = colorPalettes[paletteId].colors.map(c => c.color);
      }
      const newColors: Record<number, string> = {};
      for (let i = 1; i <= 10; i++) {
        newColors[i] = colors[Math.floor(Math.random() * colors.length)];
      }
      setProjectColors(newColors);
    }
  };

  // Handle color change for Skittles palette
  const handleSkittlesColorChange = (colorId: string, newColor: string) => {
    const oldColor = skittlesColors[colorId];
    setSkittlesColors(prev => ({ ...prev, [colorId]: newColor }));
    
    // Update any project cards that were using the old color
    if (colorsEnabled && selectedPalette === 'skittles') {
      setProjectColors(prev => {
        const updated = { ...prev };
        for (const key in updated) {
          if (updated[key].toUpperCase() === oldColor.toUpperCase()) {
            updated[key] = newColor;
          }
        }
        return updated;
      });
    }
  };

  // Keyboard shortcut 'C' to toggle bottom bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'c' || e.key === 'C') {
        setBottomBarOpen(prev => {
          if (prev) {
            // Close all dropdowns when closing bar
            setFontDropdownOpen(false);
            setShapeDropdownOpen(false);
            setStyleDropdownOpen(false);
            setColorDropdownOpen(false);
          }
          return !prev;
        });
      }
      
      // 'F' key cycles through fonts: Sans → Serif → Sans...
      if (e.key === 'f' || e.key === 'F') {
        setTitleFont(prev => prev === 'sans' ? 'serif' : 'sans');
      }
      
      // 'S' key cycles through shapes: Default → Contained → Condensed → Report → Default...
      if (e.key === 's' || e.key === 'S') {
        if (!containedCards && !condensedCards && !reportCards) {
          // Default → Contained
          setContainedCards(true);
        } else if (containedCards) {
          // Contained → Condensed
          setContainedCards(false);
          setCondensedCards(true);
        } else if (condensedCards) {
          // Condensed → Report
          setCondensedCards(false);
          setReportCards(true);
        } else if (reportCards) {
          // Report → Default
          setReportCards(false);
        }
      }
      
      // 'D' key cycles through styles: Mono → Colors → Gradients → Generative → Mono...
      if (e.key === 'd' || e.key === 'D') {
        if (!colorsEnabled && !gradientsEnabled && !aiImagesEnabled) {
          // Mono → Colors
          handleToggleColors(true);
        } else if (colorsEnabled) {
          // Colors → Gradients
          handleToggleGradients(true);
        } else if (gradientsEnabled) {
          // Gradients → Generative
          handleToggleAiImages(true);
        } else if (aiImagesEnabled) {
          // Generative → Mono
          setAiImagesEnabled(false);
        }
      }
      
      // Escape to close bottom bar
      if (e.key === 'Escape' && bottomBarOpen) {
        setBottomBarOpen(false);
        setFontDropdownOpen(false);
        setShapeDropdownOpen(false);
        setStyleDropdownOpen(false);
        setColorDropdownOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bottomBarOpen, containedCards, condensedCards, reportCards, colorsEnabled, gradientsEnabled, aiImagesEnabled]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bottomBarRef.current && !bottomBarRef.current.contains(e.target as Node)) {
        setFontDropdownOpen(false);
        setShapeDropdownOpen(false);
        setStyleDropdownOpen(false);
        setColorDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus the project name input when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && projectNameInputRef.current) {
      projectNameInputRef.current.focus();
    }
  }, [isCreateDialogOpen]);

  const handleCreateProject = () => {
    // For now, just close the dialog (no navigation since we removed other pages)
    console.log('Creating project:', newProjectName || 'Untitled');
    setIsCreateDialogOpen(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedColor(null);
    setSelectedPattern(null);
  };

  // Get the selected color value (defaults to gray when no selection)
  const getSelectedColorValue = () => {
    if (!selectedColor) return defaultGrayColor;
    return colorOptions.find(c => c.id === selectedColor)?.color || defaultGrayColor;
  };

  // Get the selected pattern source
  const getSelectedPatternSrc = () => {
    if (!selectedPattern) return null;
    return patternOptions.find(p => p.id === selectedPattern)?.src || null;
  };

  const projects = [
    {
      id: 1,
      name: "Stubhub IPO Filing",
      fileCount: "2,593 files",
      type: "project",
      status: ""
    },
    {
      id: 2,
      name: "M&A (US)",
      fileCount: "2,593 files",
      type: "knowledge",
      status: "Knowledge base"
    },
    {
      id: 3,
      name: "Cross-Border Tax Strategies",
      fileCount: "2,593 files",
      type: "knowledge",
      status: "Knowledge base"
    },
    {
      id: 4,
      name: "Reevo AI - Series B Financing",
      fileCount: "2,593 files",
      type: "shared",
      status: "Shared"
    },
    {
      id: 5,
      name: "Regulatory Compliance Audit",
      fileCount: "2,593 files",
      type: "project",
      status: ""
    },
    {
      id: 6,
      name: "Amend v Delta IP Litigation",
      fileCount: "2,593 files",
      type: "shared",
      status: "Shared"
    },
    {
      id: 7,
      name: "Open Ledger Merger Integration (2024)",
      fileCount: "2,593 files",
      type: "project",
      status: ""
    },
  ];

  // Show all projects (tabs are commented out)
  const filteredProjects = projects;

  return (
    <div className="h-screen flex items-center justify-center bg-bg-base">
      <div className="w-full xl:max-w-[1500px] px-10">
            {/* Action Cards Section - Commented out
            <div className="pb-0">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div 
                  className="border border-border-base rounded-lg p-1 hover:border-border-strong transition-colors cursor-pointer" 
                  style={{ height: '100px' }}
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <div className="flex items-center justify-center gap-4 h-full">
                    <div className="p-3 bg-bg-subtle rounded-lg w-[120px] h-full flex items-center justify-center">
                      <img 
                        src="/vault_project_illustration.svg" 
                        alt="Create project" 
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-fg-base">Create project</p>
                      <p className="text-sm text-fg-muted">Upload a new collection of files or folders.</p>
                    </div>
                  </div>
                </div>
                  
                <div className="border border-border-base rounded-lg p-1 hover:border-border-strong transition-colors cursor-pointer" style={{ height: '100px' }}>
                  <div className="flex items-center justify-center gap-4 h-full">
                    <div className="p-3 bg-bg-subtle rounded-lg w-[120px] h-full flex items-center justify-center">
                      <img 
                        src="/knowledge_base_illustration.svg" 
                        alt="Create knowledge base" 
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-fg-base">Create knowledge base</p>
                      <p className="text-sm text-fg-muted">Distribute a repository of files to your organization.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            */}
            
            {/* Tabs - Commented out
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <AnimatedBackground 
                    defaultValue={activeTab}
                    onValueChange={(value) => value && setActiveTab(value)}
                    className="bg-bg-subtle rounded-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <button
                      data-id="all"
                      className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      All projects
                    </button>
                    <button
                      data-id="your"
                      className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Your projects
                    </button>
                    <button
                      data-id="shared"
                      className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Shared with you
                    </button>
                  </AnimatedBackground>
                </div>
              </div>
            </div>
            */}
            
            {/* Projects Grid */}
            <div>
              <div 
                className="grid gap-4 transition-all duration-300"
                style={{
                  gridTemplateColumns: condensedCards ? 'repeat(3, 1fr)' : (reportCards ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)'),
                }}
              >
                {filteredProjects.map((project) => {
                  const projectColor = colorsEnabled ? projectColors[project.id] : null;
                  const projectGradient = gradientsEnabled ? projectGradients[project.id] : null;
                  const projectAiImage = aiImagesEnabled ? projectAiImages[project.id] : null;
                  
                  // Check if any background effect is active
                  const hasBackgroundEffect = projectGradient || projectAiImage;
                  
                  // Determine icon src
                  const iconSrc = project.type === "shared" ? "/sharedFolderIcon.svg" :
                    project.type === "knowledge" ? "/knowledgeBaseIcon.svg" :
                    "/folderIcon.svg";
                  
                  // Unified card structure with conditional styles
                  // Determine if card has a special style (bordered)
                  const hasBorderedStyle = condensedCards || containedCards || reportCards;
                  
                  return (
                    <div 
                      key={project.id} 
                      className="cursor-pointer group overflow-hidden"
                      style={{ 
                        display: 'flex',
                        flexDirection: condensedCards ? 'row' : 'column',
                        border: hasBorderedStyle ? '1px solid var(--border-base)' : '1px solid transparent',
                        borderRadius: (condensedCards || reportCards) ? '6px' : '12px',
                        height: condensedCards ? '90px' : (reportCards ? '300px' : 'auto'),
                        padding: reportCards ? '12px' : '0',
                        transition: 'border-color 0.3s ease, border-radius 0.3s ease, height 0.3s ease, padding 0.3s ease',
                      }}
                    >
                      {/* Text area - shows first in condensed (row), second in vertical layouts */}
                      <div 
                        className="flex items-start justify-between"
                        style={{
                          order: condensedCards ? 0 : 1,
                          flex: condensedCards ? '1' : 'none',
                          minWidth: condensedCards ? 0 : 'auto',
                          padding: reportCards ? '12px 0 0 0' : ((condensedCards || containedCards) ? '12px' : '0'),
                          marginTop: reportCards ? 'auto' : '0',
                          transition: 'padding 0.3s ease, flex 0.3s ease, margin-top 0.3s ease',
                        }}
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <p 
                            className="text-fg-base leading-tight m-0"
                            style={{ 
                              fontSize: '14px',
                              fontWeight: 500,
                              fontFamily: titleFont === 'serif' ? '"Harvey Serif", Georgia, serif' : 'inherit',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: condensedCards ? 'nowrap' : 'normal',
                            }}
                          >
                            {project.name}
                          </p>
                          <div className="flex items-center gap-1 leading-tight">
                            <p className="text-xs text-fg-muted m-0">{project.fileCount}</p>
                            {project.status && (
                              <>
                                <span className="text-fg-muted">{condensedCards ? ' ⋅ ' : ' • '}</span>
                                <p className="text-xs text-fg-muted m-0">{project.status}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="shrink-0 self-start"
                          style={{
                            width: condensedCards ? '20px' : '32px',
                            height: condensedCards ? '20px' : '32px',
                            padding: condensedCards ? '4px' : '0',
                            transition: 'width 0.3s ease, height 0.3s ease, padding 0.3s ease',
                          }}
                        >
                          <MoreHorizontal 
                            style={{
                              width: condensedCards ? '12px' : '16px',
                              height: condensedCards ? '12px' : '16px',
                              transition: 'width 0.3s ease, height 0.3s ease',
                            }}
                          />
                        </Button>
                      </div>
                      
                      {/* Icon/Thumbnail area - shows second in condensed (row), first in vertical layouts */}
                      <div 
                        className="flex items-center justify-center relative overflow-hidden"
                        style={{ 
                          order: condensedCards ? 1 : 0,
                          width: condensedCards ? '148px' : '100%',
                          height: condensedCards ? '90px' : (reportCards ? '120px' : (containedCards ? '128px' : '162px')),
                          flexShrink: 0,
                          backgroundColor: hasBackgroundEffect ? 'transparent' : (projectColor ? `${projectColor}1F` : 'var(--bg-subtle)'),
                          borderRadius: condensedCards ? '0' : (reportCards ? '4px' : (containedCards ? '8px 8px 0 0' : '8px')),
                          marginBottom: hasBorderedStyle ? '0' : '10px',
                          transition: 'width 0.3s ease, height 0.3s ease, border-radius 0.3s ease, margin-bottom 0.3s ease, background-color 0.3s ease',
                        }}
                      >
                        {/* AI Image background */}
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage: projectAiImage ? `url(${projectAiImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: projectAiImage ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                          }}
                        />
                        {/* Gradient layer with blur for soft mesh effect */}
                        <div 
                          className="absolute pointer-events-none"
                          style={{
                            inset: condensedCards ? '-10px' : '-20px',
                            background: projectGradient || 'transparent',
                            filter: condensedCards ? 'blur(10px)' : 'blur(20px)',
                            transform: condensedCards ? 'none' : 'scale(1.1)',
                            opacity: projectGradient ? 1 : 0,
                            transition: 'opacity 0.3s ease, inset 0.3s ease, filter 0.3s ease, transform 0.3s ease',
                          }}
                        />
                        {/* Hover overlay for non-colored/non-gradient state */}
                        <div 
                          className="absolute inset-0 bg-transparent group-hover:bg-bg-subtle-hover transition-colors pointer-events-none"
                          style={{ opacity: (projectColor || hasBackgroundEffect) ? 0 : 1 }}
                        />
                        {/* Icon with mask for color - hidden when gradient/AI image is enabled */}
                        <div 
                          className="relative z-10"
                          style={{
                            width: condensedCards ? '40px' : '72px',
                            height: condensedCards ? '40px' : '72px',
                            backgroundColor: projectColor || '#CCCAC6',
                            WebkitMaskImage: `url(${iconSrc})`,
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskImage: `url(${iconSrc})`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            transition: 'width 0.3s ease, height 0.3s ease, background-color 0.3s ease, opacity 0.3s ease',
                            opacity: hasBackgroundEffect ? 0 : 1,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Color Palette Popover - Hidden, kept for reference */}
        {colorPopoverOpen && false && (
          <div 
            ref={colorPopoverRef}
            className="fixed bg-bg-base border border-border-base overflow-hidden"
            style={{ 
              right: '24px', 
              bottom: '24px',
              width: '260px',
              borderRadius: '8px',
              boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.1)',
            }}
          >
            {/* Toggle Section */}
            <div className="border-b border-border-base" style={{ padding: '4px 0' }}>
              <div style={{ padding: '0 8px' }}>
                {/* Contained Cards Switch */}
                <div className="flex items-center justify-between" style={{ padding: '8px', borderRadius: '6px' }}>
                  <button
                    onClick={() => {
                      setContainedCards(!containedCards);
                      // Card styles are mutually exclusive
                      if (!containedCards) {
                        setCondensedCards(false);
                        setReportCards(false);
                      }
                    }}
                    className="flex items-center cursor-pointer"
                    style={{ gap: '8px' }}
                  >
                    <div className="relative" style={{ width: '26px', height: '16px' }}>
                      <div 
                        className={`absolute inset-0 rounded-full transition-colors ${
                          containedCards ? 'bg-fg-base' : 'bg-border-strong'
                        }`}
                      />
                      <div 
                        className="absolute bg-bg-base rounded-full transition-all"
                        style={{ 
                          top: '2px', 
                          left: containedCards ? '12px' : '2px',
                          width: '12px', 
                          height: '12px',
                          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.15)',
                        }}
                      />
                    </div>
                    <span className="text-fg-base" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      Contained cards
                    </span>
                  </button>
                </div>
                
                {/* Condensed Cards Switch */}
                <div className="flex items-center justify-between" style={{ padding: '8px', borderRadius: '6px' }}>
                  <button
                    onClick={() => {
                      setCondensedCards(!condensedCards);
                      // Card styles are mutually exclusive
                      if (!condensedCards) {
                        setContainedCards(false);
                        setReportCards(false);
                      }
                    }}
                    className="flex items-center cursor-pointer"
                    style={{ gap: '8px' }}
                  >
                    <div className="relative" style={{ width: '26px', height: '16px' }}>
                      <div 
                        className={`absolute inset-0 rounded-full transition-colors ${
                          condensedCards ? 'bg-fg-base' : 'bg-border-strong'
                        }`}
                      />
                      <div 
                        className="absolute bg-bg-base rounded-full transition-all"
                        style={{ 
                          top: '2px', 
                          left: condensedCards ? '12px' : '2px',
                          width: '12px', 
                          height: '12px',
                          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.15)',
                        }}
                      />
                    </div>
                    <span className="text-fg-base" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      Condensed cards
                    </span>
                  </button>
                </div>
                
                {/* Report Cards Switch */}
                <div className="flex items-center justify-between" style={{ padding: '8px', borderRadius: '6px' }}>
                  <button
                    onClick={() => {
                      setReportCards(!reportCards);
                      // Card styles are mutually exclusive
                      if (!reportCards) {
                        setContainedCards(false);
                        setCondensedCards(false);
                      }
                    }}
                    className="flex items-center cursor-pointer"
                    style={{ gap: '8px' }}
                  >
                    <div className="relative" style={{ width: '26px', height: '16px' }}>
                      <div 
                        className={`absolute inset-0 rounded-full transition-colors ${
                          reportCards ? 'bg-fg-base' : 'bg-border-strong'
                        }`}
                      />
                      <div 
                        className="absolute bg-bg-base rounded-full transition-all"
                        style={{ 
                          top: '2px', 
                          left: reportCards ? '12px' : '2px',
                          width: '12px', 
                          height: '12px',
                          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.15)',
                        }}
                      />
                    </div>
                    <span className="text-fg-base" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      Report cards
                    </span>
                  </button>
                </div>
                
                {/* Gradients Switch */}
                <div className="flex items-center justify-between" style={{ padding: '8px', borderRadius: '6px' }}>
                  <button
                    onClick={() => handleToggleGradients(!gradientsEnabled)}
                    className="flex items-center cursor-pointer"
                    style={{ gap: '8px' }}
                  >
                    <div className="relative" style={{ width: '26px', height: '16px' }}>
                      <div 
                        className={`absolute inset-0 rounded-full transition-colors ${
                          gradientsEnabled ? 'bg-fg-base' : 'bg-border-strong'
                        }`}
                      />
                      <div 
                        className="absolute bg-bg-base rounded-full transition-all"
                        style={{ 
                          top: '2px', 
                          left: gradientsEnabled ? '12px' : '2px',
                          width: '12px', 
                          height: '12px',
                          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.15)',
                        }}
                      />
                    </div>
                    <span className="text-fg-base" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      Fluid gradients
                    </span>
                  </button>
                  
                  {/* Refresh Gradients Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={generateRandomGradients}
                    disabled={!gradientsEnabled}
                    className="h-7 w-7 p-0 text-fg-muted hover:text-fg-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* AI Images Switch */}
                <div className="flex items-center justify-between" style={{ padding: '8px', borderRadius: '6px' }}>
                  <button
                    onClick={() => handleToggleAiImages(!aiImagesEnabled)}
                    className="flex items-center cursor-pointer"
                    style={{ gap: '8px' }}
                  >
                    <div className="relative" style={{ width: '26px', height: '16px' }}>
                      <div 
                        className={`absolute inset-0 rounded-full transition-colors ${
                          aiImagesEnabled ? 'bg-fg-base' : 'bg-border-strong'
                        }`}
                      />
                      <div 
                        className="absolute bg-bg-base rounded-full transition-all"
                        style={{ 
                          top: '2px', 
                          left: aiImagesEnabled ? '12px' : '2px',
                          width: '12px', 
                          height: '12px',
                          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.15)',
                        }}
                      />
                    </div>
                    <span className="text-fg-base" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      Generative imagery
                    </span>
                  </button>
                </div>
                
                {/* Colors Switch */}
                <div className="flex items-center justify-between" style={{ padding: '8px', borderRadius: '6px' }}>
                  <button
                    onClick={() => handleToggleColors(!colorsEnabled)}
                    className="flex items-center cursor-pointer"
                    style={{ gap: '8px' }}
                  >
                    <div className="relative" style={{ width: '26px', height: '16px' }}>
                      <div 
                        className={`absolute inset-0 rounded-full transition-colors ${
                          colorsEnabled ? 'bg-fg-base' : 'bg-border-strong'
                        }`}
                      />
                      <div 
                        className="absolute bg-bg-base rounded-full transition-all"
                        style={{ 
                          top: '2px', 
                          left: colorsEnabled ? '12px' : '2px',
                          width: '12px', 
                          height: '12px',
                          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.15)',
                        }}
                      />
                    </div>
                    <span className="text-fg-base" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      Let there be colors
                    </span>
                  </button>
                  
                  {/* Refresh Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={generateRandomColors}
                    disabled={!colorsEnabled}
                    className="h-7 w-7 p-0 text-fg-muted hover:text-fg-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Palette Selector & Colors Section */}
            <div style={{ padding: '4px 0' }}>
              {/* Palette Dropdown */}
              <div style={{ padding: '8px' }}>
                <div className="relative">
                  <button 
                    ref={paletteDropdownButtonRef}
                    onClick={() => {
                      if (!paletteDropdownOpen && paletteDropdownButtonRef.current) {
                        const rect = paletteDropdownButtonRef.current.getBoundingClientRect();
                        setDropdownPosition({
                          top: rect.bottom + 6,
                          left: rect.left,
                          width: rect.width,
                        });
                      }
                      setPaletteDropdownOpen(!paletteDropdownOpen);
                    }}
                    className="flex items-center justify-between bg-bg-base border border-border-base w-full cursor-pointer hover:border-border-strong transition-colors"
                    style={{ padding: '6px 10px', borderRadius: '6px' }}
                  >
                    <span className="text-fg-base" style={{ fontSize: '14px', lineHeight: '20px' }}>
                      {colorPalettes[selectedPalette].label}
                    </span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-transform text-fg-muted"
                      style={{ transform: paletteDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu - Using Portal */}
                  {paletteDropdownOpen && typeof document !== 'undefined' && createPortal(
                    <div 
                      className="fixed bg-bg-base border border-border-base z-[9999]"
                      style={{ 
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        borderRadius: '6px',
                        boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.12)',
                        padding: '4px',
                      }}
                    >
                      {Object.values(colorPalettes).map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => handlePaletteSelect(palette.id as keyof typeof colorPalettes)}
                          className={`w-full text-left transition-colors ${
                            selectedPalette === palette.id ? 'bg-bg-subtle' : 'hover:bg-bg-subtle'
                          }`}
                          style={{ 
                            padding: '6px 8px', 
                            fontSize: '14px', 
                            lineHeight: '20px',
                            borderRadius: '4px',
                          }}
                        >
                          <span className="text-fg-base">{palette.label}</span>
                        </button>
                      ))}
                    </div>,
                    document.body
                  )}
                </div>
              </div>

              {/* Color List */}
              {getCurrentPaletteColors().map((colorItem) => (
                <div key={colorItem.id} style={{ padding: '0 8px' }}>
                  <div 
                    className="flex items-center"
                    style={{ padding: '8px', borderRadius: '6px', gap: '6px' }}
                  >
                    {/* Color Swatch - clickable for Skittles */}
                    {selectedPalette === 'skittles' ? (
                      <div 
                        className="relative shrink-0 cursor-pointer hover:ring-2 hover:ring-border-strong hover:ring-offset-1 transition-all"
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '6px',
                          backgroundColor: colorItem.color,
                        }}
                      >
                        <input
                          type="color"
                          value={colorItem.color}
                          onChange={(e) => handleSkittlesColorChange(colorItem.id, e.target.value.toUpperCase())}
                          className="absolute inset-0 w-full h-full cursor-pointer"
                          style={{ 
                            opacity: 0,
                          }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="shrink-0"
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '6px',
                          backgroundColor: colorItem.color,
                        }}
                      />
                    )}
                    <div 
                      className="flex items-center justify-between flex-1"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      <span className="text-fg-base">{colorItem.label}</span>
                      <span className="text-fg-subtle">{colorItem.color}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Bottom Bar Controls */}
      <div 
        ref={bottomBarRef}
        className="fixed left-1/2 -translate-x-1/2 bg-bg-base border border-border-base flex items-center"
        style={{
          bottom: bottomBarOpen ? '24px' : '-80px',
          borderRadius: '12px',
          padding: '4px',
          gap: '4px',
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 100,
        }}
      >
        {/* Font Section */}
        <div className="flex items-center" style={{ gap: '4px' }}>
          <span className="text-fg-muted px-3" style={{ fontSize: '13px', fontWeight: 500 }}>Font</span>
          <div className="relative">
            <button
              onClick={() => {
                setFontDropdownOpen(!fontDropdownOpen);
                setShapeDropdownOpen(false);
                setStyleDropdownOpen(false);
                setColorDropdownOpen(false);
              }}
              className={`flex items-center gap-2 rounded-md transition-colors ${
                fontDropdownOpen ? 'bg-bg-subtle' : 'hover:bg-bg-subtle'
              }`}
              style={{ fontSize: '13px', fontWeight: 500, padding: '4px 8px' }}
            >
              <span className="text-fg-base">
                {titleFont === 'serif' ? 'Serif' : 'Sans'}
              </span>
              <svg 
                width="10" 
                height="6" 
                viewBox="0 0 10 6" 
                fill="none" 
                className="text-fg-muted transition-transform"
                style={{ transform: fontDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Font Dropdown - expands upward */}
            {fontDropdownOpen && (
              <div 
                className="absolute left-0 bg-bg-base border border-border-base"
                style={{
                  bottom: '100%',
                  marginBottom: '6px',
                  minWidth: '120px',
                  borderRadius: '6px',
                  boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.12)',
                  padding: '4px',
                }}
              >
                {[
                  { id: 'sans', label: 'Sans' },
                  { id: 'serif', label: 'Serif' },
                ].map((font) => (
                  <button
                    key={font.id}
                    onClick={() => {
                      setTitleFont(font.id as 'sans' | 'serif');
                      setFontDropdownOpen(false);
                    }}
                    className={`w-full text-left transition-colors ${
                      titleFont === font.id
                        ? 'bg-bg-subtle text-fg-base'
                        : 'hover:bg-bg-subtle text-fg-base'
                    }`}
                    style={{ 
                      padding: '6px 8px', 
                      fontSize: '14px', 
                      lineHeight: '20px',
                      borderRadius: '4px',
                    }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-border-base mx-1" />
        
        {/* Shape Section */}
        <div className="flex items-center" style={{ gap: '4px' }}>
          <span className="text-fg-muted px-3" style={{ fontSize: '13px', fontWeight: 500 }}>Shape</span>
          <div className="relative">
            <button
              onClick={() => {
                setShapeDropdownOpen(!shapeDropdownOpen);
                setFontDropdownOpen(false);
                setStyleDropdownOpen(false);
                setColorDropdownOpen(false);
              }}
              className={`flex items-center gap-2 rounded-md transition-colors ${
                shapeDropdownOpen ? 'bg-bg-subtle' : 'hover:bg-bg-subtle'
              }`}
              style={{ fontSize: '13px', fontWeight: 500, padding: '4px 8px' }}
            >
              <span className="text-fg-base">
                {reportCards ? 'Report' : condensedCards ? 'Condensed' : containedCards ? 'Contained' : 'Default'}
              </span>
              <svg 
                width="10" 
                height="6" 
                viewBox="0 0 10 6" 
                fill="none" 
                className="text-fg-muted transition-transform"
                style={{ transform: shapeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Shape Dropdown - expands upward */}
            {shapeDropdownOpen && (
              <div 
                className="absolute left-0 bg-bg-base border border-border-base"
                style={{
                  bottom: '100%',
                  marginBottom: '6px',
                  minWidth: '120px',
                  borderRadius: '6px',
                  boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.12)',
                  padding: '4px',
                }}
              >
                {[
                  { id: 'default', label: 'Default' },
                  { id: 'contained', label: 'Contained' },
                  { id: 'condensed', label: 'Condensed' },
                  { id: 'report', label: 'Report' },
                ].map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => {
                      setContainedCards(shape.id === 'contained');
                      setCondensedCards(shape.id === 'condensed');
                      setReportCards(shape.id === 'report');
                      setShapeDropdownOpen(false);
                    }}
                    className={`w-full text-left transition-colors ${
                      (shape.id === 'default' && !containedCards && !condensedCards && !reportCards) ||
                      (shape.id === 'contained' && containedCards) ||
                      (shape.id === 'condensed' && condensedCards) ||
                      (shape.id === 'report' && reportCards)
                        ? 'bg-bg-subtle text-fg-base'
                        : 'hover:bg-bg-subtle text-fg-base'
                    }`}
                    style={{ 
                      padding: '6px 8px', 
                      fontSize: '14px', 
                      lineHeight: '20px',
                      borderRadius: '4px',
                    }}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-border-base mx-1" />
        
        {/* Style Section */}
        <div className="flex items-center" style={{ gap: '4px' }}>
          <span className="text-fg-muted px-3" style={{ fontSize: '13px', fontWeight: 500 }}>Style</span>
          <div className="relative">
            <button
              onClick={() => {
                setStyleDropdownOpen(!styleDropdownOpen);
                setFontDropdownOpen(false);
                setShapeDropdownOpen(false);
                setColorDropdownOpen(false);
              }}
              className={`flex items-center gap-2 rounded-md transition-colors ${
                styleDropdownOpen ? 'bg-bg-subtle' : 'hover:bg-bg-subtle'
              }`}
              style={{ fontSize: '13px', fontWeight: 500, padding: '4px 8px' }}
            >
              <span className="text-fg-base">
                {aiImagesEnabled ? 'Generative Imagery' : gradientsEnabled ? 'Gradients' : colorsEnabled ? 'Colors' : 'Mono'}
              </span>
              <svg 
                width="10" 
                height="6" 
                viewBox="0 0 10 6" 
                fill="none" 
                className="text-fg-muted transition-transform"
                style={{ transform: styleDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Style Dropdown - expands upward */}
            {styleDropdownOpen && (
              <div 
                className="absolute left-0 bg-bg-base border border-border-base"
                style={{
                  bottom: '100%',
                  marginBottom: '6px',
                  minWidth: '160px',
                  borderRadius: '6px',
                  boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.12)',
                  padding: '4px',
                }}
              >
                {[
                  { id: 'none', label: 'Mono' },
                  { id: 'colors', label: 'Colors' },
                  { id: 'gradients', label: 'Gradients' },
                  { id: 'generative', label: 'Generative Imagery' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      if (style.id === 'none') {
                        setColorsEnabled(false);
                        setGradientsEnabled(false);
                        setAiImagesEnabled(false);
                      } else if (style.id === 'colors') {
                        handleToggleColors(true);
                      } else if (style.id === 'gradients') {
                        handleToggleGradients(true);
                      } else if (style.id === 'generative') {
                        handleToggleAiImages(true);
                      }
                      setStyleDropdownOpen(false);
                    }}
                    className={`w-full text-left transition-colors ${
                      (style.id === 'none' && !colorsEnabled && !gradientsEnabled && !aiImagesEnabled) ||
                      (style.id === 'colors' && colorsEnabled) ||
                      (style.id === 'gradients' && gradientsEnabled) ||
                      (style.id === 'generative' && aiImagesEnabled)
                        ? 'bg-bg-subtle text-fg-base'
                        : 'hover:bg-bg-subtle text-fg-base'
                    }`}
                    style={{ 
                      padding: '6px 8px', 
                      fontSize: '14px', 
                      lineHeight: '20px',
                      borderRadius: '4px',
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Divider - only show if colors is enabled (not gradients or generative imagery) */}
        {colorsEnabled && !gradientsEnabled && !aiImagesEnabled && (
          <>
            <div className="w-px h-6 bg-border-base mx-1" />
            
            {/* Color Palette Section */}
            <div className="flex items-center" style={{ gap: '4px' }}>
              <span className="text-fg-muted px-3" style={{ fontSize: '13px', fontWeight: 500 }}>Color</span>
              <div className="relative">
                <button
                  onClick={() => {
                    setColorDropdownOpen(!colorDropdownOpen);
                    setFontDropdownOpen(false);
                    setShapeDropdownOpen(false);
                    setStyleDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-md transition-colors ${
                    colorDropdownOpen ? 'bg-bg-subtle' : 'hover:bg-bg-subtle'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 500, padding: '4px 8px' }}
                >
                  <span className="text-fg-base">{colorPalettes[selectedPalette].label}</span>
                  <svg 
                    width="10" 
                    height="6" 
                    viewBox="0 0 10 6" 
                    fill="none" 
                    className="text-fg-muted transition-transform"
                    style={{ transform: colorDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {/* Color Palette Dropdown - expands upward */}
                {colorDropdownOpen && (
                  <div 
                    className="absolute left-0 bg-bg-base border border-border-base"
                    style={{
                      bottom: '100%',
                      marginBottom: '6px',
                      minWidth: '120px',
                      borderRadius: '6px',
                      boxShadow: '0px 4px 12px 0px rgba(0,0,0,0.12)',
                      padding: '4px',
                    }}
                  >
                    {Object.values(colorPalettes).map((palette) => (
                      <button
                        key={palette.id}
                        onClick={() => {
                          handlePaletteSelect(palette.id as keyof typeof colorPalettes);
                          setColorDropdownOpen(false);
                        }}
                        className={`w-full text-left transition-colors ${
                          selectedPalette === palette.id
                            ? 'bg-bg-subtle text-fg-base'
                            : 'hover:bg-bg-subtle text-fg-base'
                        }`}
                        style={{ 
                          padding: '6px 8px', 
                          fontSize: '14px', 
                          lineHeight: '20px',
                          borderRadius: '4px',
                        }}
                      >
                        {palette.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Refresh button */}
              <button
                onClick={generateRandomColors}
                className="p-1.5 rounded-lg hover:bg-bg-subtle transition-colors text-fg-muted hover:text-fg-base"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
        
        {/* Gradients refresh button */}
        {gradientsEnabled && !colorsEnabled && !aiImagesEnabled && (
          <>
            <div className="w-px h-6 bg-border-base mx-1" />
            <button
              onClick={generateRandomGradients}
              className="p-1.5 rounded-lg hover:bg-bg-subtle transition-colors text-fg-muted hover:text-fg-base"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent 
          className="p-0 gap-0 overflow-hidden"
          style={{ width: '940px', height: '550px', maxWidth: '940px' }}
        >
          <div className="flex h-full">
            {/* Left Side - Form */}
            <div className="w-1/2 flex flex-col" style={{ padding: '32px 32px 24px 32px' }}>
              <DialogTitle className="font-medium text-fg-base mb-1" style={{ fontSize: '16px' }}>
                Create vault
              </DialogTitle>
              <DialogDescription className="text-fg-muted mb-6" style={{ fontSize: '14px' }}>
                Build a central repository of case-specific sources tailored to your team&apos;s needs.
              </DialogDescription>

              <div className="flex flex-col gap-4 flex-1">
                <Input
                  ref={projectNameInputRef}
                  type="text"
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateProject();
                    }
                  }}
                  className="border-border-base focus:ring-1 focus:ring-border-strong font-normal text-fg-base placeholder:text-fg-muted"
                  style={{ height: '40px', fontSize: '14px' }}
                />
                <textarea
                  placeholder="Set description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full rounded-md border border-border-base bg-transparent px-3 py-2 text-sm text-fg-base placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-border-strong resize-y"
                  style={{ height: '100px' }}
                />
                <p className="text-sm text-fg-muted">
                  Describe what this vault should be used for
                </p>

                {/* Color Selector */}
                <div className="flex items-center gap-2 mt-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedColor(option.id)}
                      className="w-4 h-4 rounded-full transition-all flex items-center justify-center hover:scale-110"
                      style={{ 
                        backgroundColor: option.color,
                        boxShadow: selectedColor === option.id 
                          ? `0 0 0 2px var(--bg-base), 0 0 0 4px ${option.color}` 
                          : 'none'
                      }}
                      aria-label={option.label}
                    />
                  ))}
                </div>
                
                {/* Pattern Selector - Hidden for now
                <div className="flex items-center gap-1">
                  {patternOptions.map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
                      className={`w-7 h-7 rounded-md border transition-all flex items-center justify-center ${
                        selectedPattern === pattern.id 
                          ? 'border-border-strong bg-bg-subtle' 
                          : 'border-border-base hover:border-border-strong hover:bg-bg-subtle'
                      }`}
                      aria-label={pattern.label}
                    >
                      <img 
                        src={pattern.src} 
                        alt={pattern.label}
                        className="w-4 h-4 opacity-60"
                        style={{ 
                          filter: 'invert(1) brightness(0.4)'
                        }}
                      />
                    </button>
                  ))}
                </div>
                */}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewProjectName("");
                    setNewProjectDescription("");
                    setSelectedColor(null);
                    setSelectedPattern(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProject}
                  className="bg-fg-base text-bg-base hover:bg-fg-base/90"
                >
                  Create project
                </Button>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="w-1/2 bg-bg-subtle p-8 flex flex-col items-center justify-center border-l border-border-base">
              {/* Preview Card */}
              <div className="w-full max-w-[280px]">
                {/* Icon container */}
                <div 
                  className="w-full rounded-lg flex items-center justify-center mb-2.5 border border-border-base transition-colors relative overflow-hidden" 
                  style={{ 
                    height: '164px',
                    backgroundColor: `${getSelectedColorValue()}1F`,
                  }}
                >
                  {/* Pattern overlay - Hidden for now
                  {getSelectedPatternSrc() && (
                    <img 
                      src={getSelectedPatternSrc()!}
                      alt=""
                      className="absolute pointer-events-none opacity-50"
                      style={{
                        width: '150%',
                        height: '150%',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  */}
                  {/* Private Folder Icon with dynamic color */}
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                    <path d="M27.6104 9C29.7253 9 31.7009 10.0575 32.874 11.8174L37.3223 18.4893H60.9326C64.4263 18.4893 67.2587 21.3209 67.2588 24.8145V56.4443C67.2587 59.938 64.4263 62.7695 60.9326 62.7695H10.3262C6.83255 62.7695 4.00012 59.938 4 56.4443V15.3262C4 11.8325 6.83248 9 10.3262 9H27.6104ZM36 31C33.2386 31 31 33.2386 31 36V38H30C28.8954 38 28 38.8954 28 40V49C28 50.1046 28.8954 51 30 51H42C43.1046 51 44 50.1046 44 49V40C44 38.8954 43.1046 38 42 38H41V36C41 33.2386 38.7614 31 36 31ZM36 42C36.5523 42 37 42.4477 37 43V46C37 46.5523 36.5523 47 36 47C35.4477 47 35 46.5523 35 46V43C35 42.4477 35.4477 42 36 42ZM36 33C37.6569 33 39 34.3432 39 36V38H33V36C33 34.3432 34.3431 33 36 33Z" fill={getSelectedColorValue()}/>
                  </svg>
                </div>
                
                {/* Title and menu */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-fg-base leading-tight m-0">
                      {newProjectName.trim() || "Untitled"}
                    </p>
                    <p className="text-xs text-fg-muted m-0">0 files</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 