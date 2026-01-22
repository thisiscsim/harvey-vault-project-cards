"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, Users, Briefcase, ChevronRight,
  Calendar, Tag, User, Clock, FileIcon, 
  MessageSquare, Upload, Share2, Edit3,
  Scale, Paperclip, Mic, CornerDownLeft, CloudUpload, FolderPlus, SlidersHorizontal
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { SvgIcon } from "@/components/svg-icon";
import { AnimatedBackground } from "../../../components/motion-primitives/animated-background";
import { TextLoop } from "../../../components/motion-primitives/text-loop";
import { motion } from "motion/react";

// Sample people with access
const peopleWithAccess = [
  { id: '1', email: 'sarah.chen@reevo.ai', access: 'Edit access', initial: 'S' },
  { id: '2', email: 'david.kim@sequoia.com', access: 'View access', initial: 'D' },
  { id: '3', email: 'lisa.wong@reevo.ai', access: 'Edit access', initial: 'L' },
  { id: '4', email: 'partner@a16z.com', access: 'View access', initial: 'P' },
];

// Sample activity
const activities = [
  { id: '1', type: 'share', user: 'sarah.chen@reevo.ai', action: 'shared this vault with', target: 'partner@a16z.com', time: '2d ago' },
  { id: '2', type: 'upload', user: 'lisa.wong@reevo.ai', action: 'uploaded', target: '847 files', time: '1w ago' },
  { id: '3', type: 'rename', user: 'sarah.chen@reevo.ai', action: 'renamed the vault from', target: 'Series B to Reevo AI - Series B Financing', time: '2w ago' },
  { id: '4', type: 'create', user: 'sarah.chen@reevo.ai', action: 'created the vault', time: '2w ago' },
];

export default function ReevoAISeriesBPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("Reevo AI - Series B Financing");
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Chat state
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Configuration panel state - load from localStorage
  const [isConfigPanelCollapsed, setIsConfigPanelCollapsed] = useState<boolean | null>(null);

  // Load drawer state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reevo-drawer-collapsed');
    setIsConfigPanelCollapsed(saved === 'true');
  }, []);

  // Persist drawer state to localStorage (only after initial load)
  useEffect(() => {
    if (isConfigPanelCollapsed !== null) {
      localStorage.setItem('reevo-drawer-collapsed', String(isConfigPanelCollapsed));
    }
  }, [isConfigPanelCollapsed]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (!projectName.trim()) {
      setProjectName("Untitled");
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingName(false);
      if (!projectName.trim()) {
        setProjectName("Untitled");
      }
    }
    if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      
      // Generate a URL-friendly ID from the message
      const chatId = inputValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      // Navigate to the assistant chat page with the message
      sessionStorage.setItem('fromVaultProject', 'true');
      sessionStorage.setItem('vaultProjectName', projectName);
      router.push(`/assistant/${chatId}?initialMessage=${encodeURIComponent(inputValue)}`);
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'share': return Share2;
      case 'upload': return Upload;
      case 'rename': return Edit3;
      case 'create': return FileIcon;
      default: return MessageSquare;
    }
  };
  
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      
      <SidebarInset>
        <div className="h-screen flex bg-bg-base">
          {/* Left side - Header + Content together */}
          <div className="flex-1 flex flex-col overflow-hidden">
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
                    className="text-fg-muted hover:text-fg-base hover:bg-bg-subtle cursor-pointer rounded-md transition-colors"
                    style={{ padding: '4px 6px' }}
                    onClick={() => router.push('/vault')}
                  >
                    Vault
                  </span>
                  <ChevronRight className="h-3 w-3 text-fg-muted" />
                  {isEditingName ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onBlur={handleNameBlur}
                      onKeyDown={handleNameKeyDown}
                      onFocus={(e) => {
                        setTimeout(() => {
                          e.target.setSelectionRange(0, 0);
                          e.target.scrollLeft = 0;
                        }, 0);
                      }}
                      className="text-fg-base font-medium bg-bg-subtle border border-border-interactive outline-none px-2 py-1.5 rounded-md text-sm"
                      style={{ 
                        width: `${Math.min(Math.max(projectName.length * 8 + 40, 120), 600)}px`,
                        height: '28px'
                      }}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="font-medium text-fg-base hover:bg-bg-subtle cursor-pointer rounded-md transition-colors"
                      style={{ padding: '4px 6px' }}
                      onClick={handleNameClick}
                    >
                      {projectName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="medium" className="gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  Matter
                </Button>
                <Button variant="outline" size="medium" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  Share
                </Button>
                {isConfigPanelCollapsed && (
                  <button 
                    onClick={() => setIsConfigPanelCollapsed(false)}
                    className="h-7 w-7 flex items-center justify-center border border-border-base rounded-[6px] hover:bg-bg-subtle transition-colors"
                  >
                    <SvgIcon 
                      src="/central_icons/RightSidebar.svg" 
                      alt="Expand drawer"
                      width={16} 
                      height={16} 
                      className="text-fg-base"
                    />
                  </button>
                )}
              </div>
            </div>
            
            {/* Main Content Panel */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Tabs */}
              <div className="px-6 pt-4">
                <div className="flex items-center gap-1">
                  <AnimatedBackground 
                    defaultValue={activeTab}
                    onValueChange={(value) => value && setActiveTab(value)}
                    className="bg-bg-subtle rounded-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <button
                      data-id="overview"
                      className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Overview
                    </button>
                    <button
                      data-id="queries"
                      className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Recent queries
                    </button>
                    <button
                      data-id="activity"
                      className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Activity
                    </button>
                    <button
                      data-id="settings"
                      className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Settings
                    </button>
                  </AnimatedBackground>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 px-6 py-6">
                <div>
                  {/* Chat and Action Buttons - Centered */}
                  <div className="flex flex-col items-center">
                    {/* Chat Composer */}
                    <div 
                      className="w-full bg-bg-subtle border border-border-base rounded-[12px] flex flex-col transition-all duration-200 focus-within:border-border-strong shadow-sm"
                      style={{ maxWidth: '600px' }}
                    >
                    {/* Composer Text Field */}
                    <div className="p-[10px] flex flex-col gap-[10px]">
                      {/* Vault Badge */}
                      <div className="inline-flex items-center gap-[4px] px-[4px] py-[2px] bg-bg-base border border-border-base rounded-[4px] w-fit">
                        <img src="/sharedFolderIcon.svg" alt="Vault" className="w-3 h-3" />
                        <span className="text-[12px] font-medium text-fg-muted leading-[16px]">Reevo AI - Series B</span>
                      </div>
                      
                      {/* Textarea */}
                      <div className="px-[4px]">
                        <div className="relative">
                          <textarea
                            value={inputValue}
                            onChange={(e) => {
                              setInputValue(e.target.value);
                              e.target.style.height = '20px';
                              e.target.style.height = Math.max(20, e.target.scrollHeight) + 'px';
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            disabled={isLoading}
                            className="w-full bg-transparent focus:outline-none text-fg-base placeholder-fg-muted resize-none overflow-hidden disabled:opacity-50"
                            style={{ 
                              fontSize: '14px', 
                              lineHeight: '20px',
                              height: '20px',
                              minHeight: '20px',
                              maxHeight: '300px'
                            }}
                          />
                          {!inputValue && !isInputFocused && (
                            <div className="absolute inset-0 pointer-events-none text-fg-muted flex items-start" style={{ fontSize: '14px', lineHeight: '20px' }}>
                            <TextLoop interval={3000}>
                              <span>Research IP infringement cases…</span>
                              <span>Draft deposition questions for fraud case…</span>
                              <span>Draft an S-1 shell…</span>
                              <span>Extract key clauses from contract…</span>
                              <span>Draft a memo on new SEC rules…</span>
                            </TextLoop>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Controls */}
                    <div className="flex items-end justify-between pl-[10px] pr-[10px] pb-[10px]">
                      <div className="flex items-center">
                        <button className="h-[28px] px-[6px] flex items-center justify-center rounded-[6px] hover:bg-bg-subtle-hover transition-colors">
                          <Paperclip size={16} className="text-fg-base" />
                        </button>
                        <button className="h-[28px] px-[6px] flex items-center justify-center rounded-[6px] hover:bg-bg-subtle-hover transition-colors">
                          <Scale size={16} className="text-fg-base" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isLoading ? (
                          <button
                            disabled
                            className="h-[28px] px-[8px] flex items-center justify-center bg-bg-interactive text-fg-on-color rounded-[6px] cursor-not-allowed"
                          >
                            <Spinner size="sm" />
                          </button>
                        ) : inputValue.trim() ? (
                          <button
                            onClick={handleSendMessage}
                            className="h-[28px] px-[8px] flex items-center justify-center bg-bg-interactive text-fg-on-color rounded-[6px] hover:opacity-90 transition-all"
                          >
                            <CornerDownLeft size={16} />
                          </button>
                        ) : (
                          <button className="h-[28px] px-[8px] flex items-center justify-center bg-bg-subtle-hover rounded-[6px] hover:bg-bg-subtle-pressed transition-all">
                            <Mic className="w-4 h-4 text-fg-base" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      {[
                        { icon: "/central_icons/Review.svg", label: "Generate a review" },
                        { icon: "/central_icons/Draft.svg", label: "Draft a document" },
                        { icon: "/central_icons/Workflows.svg", label: "Use a workflow" },
                      ].map((action, index) => (
                        <motion.button
                          key={action.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.3 + index * 0.08,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                          className="px-[10px] py-[6px] border border-border-base rounded-full hover:border-border-strong hover:bg-bg-subtle transition-colors flex items-center gap-1"
                        >
                          <SvgIcon 
                            src={action.icon} 
                            alt={action.label}
                            width={14} 
                            height={14} 
                            className="text-fg-muted"
                          />
                          <span className="text-fg-base text-xs font-medium leading-4">{action.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Files Section Header */}
                  <div className="flex items-center justify-between mt-8 mb-4">
                    <span className="text-sm font-medium text-fg-base">Files</span>
                    <div className="flex items-center gap-[6px]">
                      <button className="h-[24px] px-[7px] py-[3px] text-xs font-medium text-fg-base border border-border-base rounded-[6px] hover:bg-bg-subtle transition-colors flex items-center gap-[6px]">
                        <FolderPlus className="w-3 h-3" />
                        Create folder
                      </button>
                      <button className="h-[24px] px-[7px] py-[3px] text-xs font-medium text-fg-base border border-border-base rounded-[6px] hover:bg-bg-subtle transition-colors flex items-center gap-[6px]">
                        <SlidersHorizontal className="w-3 h-3" />
                        Filters
                      </button>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div 
                    className="bg-bg-base border border-dashed border-border-strong rounded-lg flex flex-col items-center justify-center p-8 hover:border-fg-muted transition-colors cursor-pointer"
                    style={{ minHeight: '400px' }}
                  >
                    <div className="flex flex-col items-center gap-3 w-[411px]">
                      <CloudUpload className="w-6 h-6 text-fg-muted" />
                      <div className="text-center flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-fg-base leading-5">Drag and drop your files</p>
                        <p className="text-xs text-fg-subtle leading-4">Supported file types: CSV, Email, Excel, PDF, PowerPoint, RTF, Text, Word, Zip</p>
                      </div>
                      <button className="h-7 px-2 bg-bg-interactive text-fg-on-color rounded-[6px] hover:opacity-90 transition-all flex items-center gap-1.5 text-sm font-medium leading-5">
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      <p className="text-[10px] text-fg-muted leading-[14px]">Or choose from</p>
                      <div className="flex gap-1">
                        <button className="h-7 px-[9px] border border-border-base rounded-[6px] hover:border-border-strong hover:bg-bg-subtle transition-colors flex items-center gap-1.5">
                          <Image src="/sharepoint.svg" alt="SharePoint" width={16} height={16} />
                          <span className="text-sm font-medium text-fg-base leading-5">SharePoint (OneDrive)</span>
                        </button>
                        <button className="h-7 px-[9px] border border-border-base rounded-[6px] hover:border-border-strong hover:bg-bg-subtle transition-colors flex items-center gap-1.5">
                          <Image src="/google-drive.svg" alt="Google Drive" width={16} height={16} />
                          <span className="text-sm font-medium text-fg-base leading-5">Google Drive</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Vault Details */}
          <div className={`${isConfigPanelCollapsed === null ? 'w-[400px] border-l opacity-0' : isConfigPanelCollapsed ? 'w-0 border-l-0 opacity-100' : 'w-[400px] border-l opacity-100'} border-border-base flex flex-col bg-bg-base ${isConfigPanelCollapsed !== null ? 'transition-all duration-200 ease-linear' : ''} flex-shrink-0 overflow-hidden`}>
            <div className="w-[400px] flex flex-col h-full">
              <div className="pl-[20px] pr-[14px] pt-[12px] pb-[8px] flex items-center justify-between">
                <span className="text-sm font-medium text-fg-base leading-[20px]">Vault details</span>
                <button 
                  onClick={() => setIsConfigPanelCollapsed(true)}
                  className="h-[28px] px-[6px] flex items-center justify-center border border-border-base rounded-[6px] hover:bg-bg-subtle transition-colors"
                >
                  <SvgIcon 
                    src="/central_icons/RightSidebar - Filled.svg" 
                    alt="Collapse drawer"
                    width={16} 
                    height={16} 
                    className="text-fg-base"
                  />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                  {/* Details Section */}
                  <div className="pl-[20px] pr-[14px] pt-[4px] pb-[20px]">
                    <div className="flex flex-col gap-[8px]">
                      <div className="flex items-center h-[28px]">
                        <div className="flex items-center gap-[4px] w-[128px] shrink-0 text-fg-subtle">
                          <FileIcon className="w-4 h-4" />
                          <span className="text-xs leading-[16px]">Files</span>
                        </div>
                        <span className="text-xs text-fg-base leading-[16px] flex-1">847 files (2.3mb)</span>
                      </div>
                      <div className="flex items-center h-[28px]">
                        <div className="flex items-center gap-[4px] w-[128px] shrink-0 text-fg-subtle">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs leading-[16px]">Queries</span>
                        </div>
                        <span className="text-xs text-fg-base leading-[16px] flex-1">12 queries</span>
                      </div>
                      <div className="flex items-center h-[28px]">
                        <div className="flex items-center gap-[4px] w-[128px] shrink-0 text-fg-subtle">
                          <Tag className="w-4 h-4" />
                          <span className="text-xs leading-[16px]">Tags</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-[4px] flex-1">
                          {['Series B', 'Venture', 'AI/ML'].map((label, i) => (
                            <span key={i} className="px-[4px] h-[16px] flex items-center bg-bg-subtle rounded-[4px] text-[10px] font-medium text-fg-muted leading-[14px]">{label}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center h-[28px]">
                        <div className="flex items-center gap-[4px] w-[128px] shrink-0 text-fg-subtle">
                          <User className="w-4 h-4" />
                          <span className="text-xs leading-[16px]">Owner</span>
                        </div>
                        <div className="flex items-center gap-[4px] flex-1">
                          <div className="w-4 h-4 rounded-full bg-bg-subtle flex items-center justify-center text-[9px] font-medium text-fg-base opacity-90">S</div>
                          <span className="text-xs text-fg-base leading-[16px]">sarah.chen@reevo.ai</span>
                        </div>
                      </div>
                      <div className="flex items-center h-[28px]">
                        <div className="flex items-center gap-[4px] w-[128px] shrink-0 text-fg-subtle">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs leading-[16px]">Created on</span>
                        </div>
                        <span className="text-xs text-fg-base leading-[16px] flex-1">January 5, 2026</span>
                      </div>
                      <div className="flex items-center h-[28px]">
                        <div className="flex items-center gap-[4px] w-[128px] shrink-0 text-fg-subtle">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs leading-[16px]">Last edited</span>
                        </div>
                        <span className="text-xs text-fg-base leading-[16px] flex-1">2d ago</span>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center gap-[4px] w-[122px] shrink-0 h-[28px] text-fg-subtle">
                          <Edit3 className="w-4 h-4" />
                          <span className="text-xs leading-[16px]">Description</span>
                        </div>
                        <div className="flex-1 p-[6px] rounded-[6px]">
                          <button className="text-xs text-fg-muted hover:text-fg-base transition-colors leading-[16px]">Set description</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity */}
                  <div className="border-t border-border-base px-[14px] pt-[8px] pb-[20px]">
                    <div className="flex items-center justify-between h-[44px] pl-[6px]">
                      <span className="text-sm font-medium text-fg-muted leading-[20px]">Activity</span>
                      <button className="h-[24px] px-[6px] py-[2px] text-xs font-medium text-fg-subtle hover:text-fg-base transition-colors leading-[16px]">See all</button>
                    </div>
                    <div className="pl-[6px]">
                      {activities.map((activity, index) => {
                        const IconComponent = getActivityIcon(activity.type);
                        const isLast = index === activities.length - 1;
                        return (
                          <div key={activity.id} className="flex gap-[6px] items-start">
                            <div className="flex flex-col items-center gap-[4px] py-[2px] self-stretch shrink-0">
                              <IconComponent className="w-4 h-4 text-fg-subtle shrink-0" />
                              {!isLast && <div className="w-px flex-1 bg-border-base" />}
                            </div>
                            <div className={`flex-1 flex flex-col gap-[4px] ${!isLast ? 'pb-[16px]' : ''}`}>
                              <p className="text-sm text-fg-subtle leading-[20px]">
                                <span>{activity.user}</span>
                                {' '}{activity.action}{' '}
                                {activity.target && <span className="font-medium">{activity.target}</span>}
                                {' '}<span className="text-fg-muted">· {activity.time}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
