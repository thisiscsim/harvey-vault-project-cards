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

export default function VaultPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const projectNameInputRef = useRef<HTMLInputElement>(null);

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
                  const projectLink = isStubhubProject ? "/stubhub-ipo-filing" : isReevoProject ? "/reevo-ai-series-b" : null;
                  
                  const content = (
                    <div
                      className="cursor-pointer group"
                    >
                  {/* Icon container */}
                  <div className="w-full bg-bg-subtle rounded-lg flex items-center justify-center mb-2.5 transition-colors group-hover:bg-bg-subtle-hover" style={{ height: '162px' }}>
                    <img 
                      src={
                        project.name === "Stubhub IPO Filing" ? "/privateFolderIcon.svg" :
                        project.type === "shared" ? "/sharedFolderIcon.svg" :
                        project.type === "knowledge" ? "/knowledgeBaseIcon.svg" :
                        "/folderIcon.svg"
                      }
                      alt={`${project.name} icon`}
                      className="w-[72px] h-[72px]"
                    />
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
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewProjectName("");
                    setNewProjectDescription("");
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
                <div className="w-full bg-bg-base rounded-lg flex items-center justify-center mb-2.5 border border-border-base" style={{ height: '164px' }}>
                  <img 
                    src="/privateFolderIcon.svg"
                    alt="Project icon"
                    className="w-[72px] h-[72px]"
                  />
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