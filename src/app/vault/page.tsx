"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatedBackground } from "../../../components/motion-primitives/animated-background";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Default grayscale color (not selectable, used as initial state)
const defaultGrayColor = '#CCCAC6';

// Color options for project cards (user can optionally select one)
const colorOptions = [
  { id: 'yellow', color: '#F59E0B', label: 'Yellow' },
  { id: 'red', color: '#C17C76', label: 'Red' },
  { id: 'blue', color: '#3B82F6', label: 'Blue' },
  { id: 'teal', color: '#569197', label: 'Teal' },
  { id: 'brown', color: '#92400E', label: 'Brown' },
] as const;

// Pattern options for project card backgrounds
const patternOptions = [
  { id: 'grid', src: '/accent_filters/Grid.svg', label: 'Grid' },
  { id: 'circle', src: '/accent_filters/Circle.svg', label: 'Circle' },
  { id: 'slice', src: '/accent_filters/Slice.svg', label: 'Slice' },
] as const;

export default function VaultPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  
  // Random colors state for project cards (toggled with 'C' key)
  const [projectColors, setProjectColors] = useState<Record<number, string>>({});
  const [colorsEnabled, setColorsEnabled] = useState(false);

  // Keyboard shortcut 'C' to toggle random colors on project cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'c' || e.key === 'C') {
        setColorsEnabled(prev => {
          const newEnabled = !prev;
          if (newEnabled) {
            // Generate random colors for all projects
            const newColors: Record<number, string> = {};
            for (let i = 1; i <= 10; i++) {
              const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
              newColors[i] = randomColor.color;
            }
            setProjectColors(newColors);
          }
          return newEnabled;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus the project name input when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && projectNameInputRef.current) {
      projectNameInputRef.current.focus();
    }
  }, [isCreateDialogOpen]);

  const handleCreateProject = () => {
    // Navigate to the staging example page with the project name
    router.push(`/staging-example?name=${encodeURIComponent(newProjectName || 'Untitled')}`);
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

  // Count vaults and knowledge bases
  const vaultCount = projects.filter(p => p.type === "project" || p.type === "shared").length;
  const knowledgeBaseCount = projects.filter(p => p.type === "knowledge").length;

  // Filter projects based on active tab and search query
  const filteredProjects = projects.filter(project => {
    // First filter by tab
    let tabMatch = true;
    if (activeTab === "shared") {
      tabMatch = project.type === "shared";
    } else if (activeTab === "your") {
      tabMatch = project.type !== "shared"; // Show project and knowledge types
    }
    // "all" tab shows everything, so tabMatch stays true
    
    // Then filter by search query
    let searchMatch = true;
    if (searchQuery.trim()) {
      try {
        const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
        searchMatch = regex.test(project.name);
      } catch {
        // If regex is invalid, fall back to simple string matching
        searchMatch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
    }
    
    return tabMatch && searchMatch;
  });

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
              <SidebarInset>
          <div className="h-screen flex flex-col bg-bg-base">
            {/* Page Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-border-base">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 p-0"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 text-fg-muted" />
                </Button>
                <div className="flex items-center gap-0.5 text-sm">
                  <span 
                    className="font-medium text-fg-base rounded-md"
                    style={{ padding: '4px 6px' }}
                  >
                    Vault
                  </span>
                  <span className="text-fg-muted">{vaultCount} vaults・{knowledgeBaseCount} knowledge bases</span>
                </div>
              </div>
              <div className="relative w-[250px] min-w-[128px] h-7">
                <div className="flex items-center justify-between w-full h-full px-2 py-1.5 bg-white border border-border-base rounded-md">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-fg-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-fg-base placeholder:text-fg-muted"
                    />
                  </div>
                  <div className="flex items-center justify-center w-5 px-1 py-0.5 bg-[#f9f9f9] border border-[#e3e3e3] rounded">
                    <span className="text-sm font-semibold text-[#858585] leading-4 tracking-tight">/</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full xl:max-w-[1500px] xl:mx-auto flex flex-col h-full px-10">
              {/* Action Cards Section */}
            <div className="pb-0" style={{ paddingTop: '40px' }}>
              
              {/* Action Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Create Project Card */}
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
                  
                  {/* Create Knowledge Base Card */}
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
            
            {/* Tabs and Search */}
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
            
            {/* Projects Grid */}
            <div className="flex-1 pt-4 pb-6 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                {filteredProjects.map((project) => {
                  const isStubhubProject = project.name === "Stubhub IPO Filing";
                  const isReevoProject = project.name === "Reevo AI - Series B Financing";
                  const isRegulatoryProject = project.name === "Regulatory Compliance Audit";
                  const projectLink = isStubhubProject 
                    ? "/stubhub-ipo-filing" 
                    : isReevoProject 
                      ? "/reevo-ai-series-b" 
                      : isRegulatoryProject 
                        ? "/regulatory-compliance-audit" 
                        : null;
                  
                  const projectColor = colorsEnabled ? projectColors[project.id] : null;
                  
                  // Determine icon src
                  const iconSrc = project.name === "Stubhub IPO Filing" ? "/privateFolderIcon.svg" :
                    project.type === "shared" ? "/sharedFolderIcon.svg" :
                    project.type === "knowledge" ? "/knowledgeBaseIcon.svg" :
                    "/folderIcon.svg";
                  
                  const content = (
                    <div
                      className="cursor-pointer group"
                    >
                  {/* Icon container */}
                  <div 
                    className="w-full rounded-lg flex items-center justify-center mb-2.5 transition-colors relative overflow-hidden" 
                    style={{ 
                      height: '162px',
                      backgroundColor: projectColor ? `${projectColor}1F` : undefined,
                    }}
                  >
                    {!projectColor && (
                      <div className="absolute inset-0 bg-bg-subtle group-hover:bg-bg-subtle-hover transition-colors" />
                    )}
                    {projectColor ? (
                      <div 
                        className="w-[72px] h-[72px] relative z-10"
                        style={{
                          backgroundColor: projectColor,
                          WebkitMaskImage: `url(${iconSrc})`,
                          WebkitMaskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskImage: `url(${iconSrc})`,
                          maskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center',
                        }}
                      />
                    ) : (
                      <img 
                        src={iconSrc}
                        alt={`${project.name} icon`}
                        className="w-[72px] h-[72px] relative z-10"
                      />
                    )}
                  </div>
                  
                  {/* Title and menu */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-fg-base leading-tight m-0">{project.name}</p>
                      <div className="flex items-center gap-1 leading-tight">
                        <p className="text-xs text-fg-muted m-0">{project.fileCount}</p>
                        {project.status && (
                          <>
                            <span className="text-fg-disabled">•</span>
                            <p className="text-xs text-fg-muted m-0">{project.status}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                    </div>
                  );
                  
                  return projectLink ? (
                    <Link href={projectLink} key={project.id} className="block no-underline">
                      {content}
                    </Link>
                  ) : (
                    <div key={project.id}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

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