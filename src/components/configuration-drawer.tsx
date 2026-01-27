"use client";

import { motion } from "framer-motion";
import { X, Search, ChevronDown, FileIcon, Upload, Share2, Edit3, MessageSquare, Square } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedBackground } from "../../components/motion-primitives/animated-background";
import { TextShimmer } from "../../components/motion-primitives/text-shimmer";

// Agent state type
interface AgentState {
  id: string;
  isRunning: boolean;
  taskName: string;
  currentAction?: string;
  currentFile?: string;
  thinkingSteps?: string[];
  isAwaitingInput?: boolean;
  isActive?: boolean; // Whether this is the currently active chat
}

// Uploaded file type
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  uploadedAt: Date;
}

interface ConfigurationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showOverlay?: boolean;
  variant?: "embedded" | "sheet" | "panel";
  agents?: AgentState[]; // Multiple agents
  onStopAgent?: (agentId: string) => void;
  onReviewAgent?: (agentId: string) => void;
  onSwitchAgent?: (agentId: string) => void;
  // Legacy single agent support
  agentState?: AgentState;
  // Resizable width
  width?: number;
  // Disable animation during resize
  isResizing?: boolean;
  // Uploaded files
  uploadedFiles?: UploadedFile[];
}

// Activity type
interface Activity {
  id: string;
  type: 'create' | 'upload' | 'share' | 'rename' | 'search';
  user: string;
  action: string;
  target?: string;
  time: string;
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Helper to get file icon path
const getFileIconPath = (fileName: string): string => {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.pdf')) return '/pdf-icon.svg';
  if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) return '/docx-icon.svg';
  if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv')) return '/xlsx-icon.svg';
  return '/file.svg';
};

export default function ConfigurationDrawer({ 
  isOpen, 
  onClose, 
  showOverlay = false,
  variant = "embedded",
  agents = [],
  onStopAgent,
  onReviewAgent,
  onSwitchAgent,
  agentState, // Legacy support
  width = 400, // Default width
  isResizing = false, // Disable animation during resize
  uploadedFiles = []
}: ConfigurationDrawerProps) {
  // Combine legacy agentState with agents array
  const allAgents = agentState?.isRunning 
    ? [{ ...agentState, id: agentState.id || 'default' }]
    : agents.filter(a => a.isRunning);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Sample activities
  const activities: Activity[] = [
    { id: '1', type: 'search', user: 'Assistant', action: 'searched SEC.gov for', target: 'climate disclosure rules', time: 'Just now' },
    { id: '2', type: 'search', user: 'Assistant', action: 'searched', target: 'enforcement actions', time: '2m ago' },
    { id: '3', type: 'search', user: 'Assistant', action: 'analyzed', target: 'law firm analyses', time: '5m ago' },
  ];

  const categorizedSources = {
    "SEC.gov": [
      {
        title: "Release No. 33-11275 - Climate Disclosure Final Rule",
        url: "",
        icon: "sec",
        description: "The final rule requiring registrants to provide certain climate-related information in registration statements...",
        references: [1, 2]
      },
      {
        title: "Release No. 33-11042 - Proposed Climate Disclosure",
        url: "",
        icon: "sec",
        description: "The proposed rule on climate-related disclosures, including greenhouse gas emissions and climate risk...",
        references: [3, 4, 5]
      },
      {
        title: "Staff Bulletin No. 14L - Shareholder Proposals",
        url: "",
        icon: "sec",
        description: "SEC staff guidance on climate-related shareholder proposals and disclosure obligations...",
        references: [6]
      }
    ],
    "Web Sources": [
      {
        title: "Thomson Reuters",
        url: "thomsonreuters.com",
        icon: "reuters",
        description: "Analysis of SEC climate disclosure rules and implementation guidance for public companies...",
        references: [7, 8]
      },
      {
        title: "Bloomberg Law",
        url: "bloomberg.com",
        icon: "bloomberg",
        description: "Coverage of climate disclosure requirements and enforcement trends...",
        references: [9, 10]
      },
      {
        title: "Financial Times",
        url: "ft.com",
        icon: "ft",
        description: "Reporting on SEC climate rules and corporate compliance challenges...",
        references: [11]
      }
    ],
    "Law Firm Analyses": [
      {
        title: "Latham & Watkins Climate Alert",
        url: "",
        icon: "pdf",
        description: "Comprehensive analysis of final SEC climate disclosure requirements and compliance timeline...",
        references: [12, 13]
      },
      {
        title: "Sullivan & Cromwell Memo",
        url: "",
        icon: "pdf",
        description: "Key takeaways and practical guidance for implementing climate disclosures...",
        references: [14, 15]
      },
      {
        title: "Skadden Climate Disclosure Guide",
        url: "",
        icon: "pdf",
        description: "Step-by-step implementation guide for SEC climate disclosure compliance...",
        references: [16]
      }
    ]
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'share': return Share2;
      case 'upload': return Upload;
      case 'rename': return Edit3;
      case 'create': return FileIcon;
      case 'search': return Search;
      default: return MessageSquare;
    }
  };

  // Helper function to render source icons
  const renderSourceIcon = (iconType: string) => {
    switch (iconType) {
      case "sec":
        return (
          <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[7px] font-bold">SEC</span>
          </div>
        );
      case "reuters":
        return (
          <img src="/reuters-logo.jpg" alt="Thomson Reuters" className="w-4 h-4 rounded object-cover flex-shrink-0" />
        );
      case "bloomberg":
        return (
          <img src="/bloomberg.jpg" alt="Bloomberg" className="w-4 h-4 rounded object-cover flex-shrink-0" />
        );
      case "ft":
        return (
          <img src="/fin-time-logo.png" alt="Financial Times" className="w-4 h-4 rounded object-cover flex-shrink-0" />
        );
      case "pdf":
        return (
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <img src="/pdf-icon.svg" alt="PDF" className="w-5 h-5" />
          </div>
        );
      default:
        return null;
    }
  };

  // Overview Tab Content
  const overviewContent = (
    <div className="space-y-0">
      {/* Sources Shelf - includes uploaded files at the top */}
      <div className="-mx-4 px-4 relative">
        <div className="flex items-center justify-between h-[36px]">
          <span className="text-xs font-medium text-fg-base leading-[20px]">Sources</span>
          <button className="h-[24px] px-[6px] py-[2px] text-xs font-medium text-fg-subtle hover:text-fg-base transition-colors leading-[16px]">
            See all
          </button>
        </div>
        <div className="space-y-0.5 max-h-[400px] overflow-hidden -mx-2 px-2 pb-8">
          {/* Uploaded files shown first */}
          {uploadedFiles.map((file) => (
            <div key={file.id} className="-mx-2 px-2 py-2.5 hover:bg-bg-subtle rounded-md transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <img src={getFileIconPath(file.name)} alt="" className="w-5 h-5 flex-shrink-0" />
                <h4 className="font-medium text-fg-base text-xs truncate flex-1">{file.name}</h4>
                {file.status === 'uploading' && (
                  <div className="w-16 h-1 bg-bg-subtle rounded-full overflow-hidden flex-shrink-0">
                    <div 
                      className="h-full bg-fg-subtle rounded-full transition-all duration-300"
                      style={{ width: `${file.uploadProgress}%` }}
                    />
                  </div>
                )}
                {file.status === 'processing' && (
                  <span className="text-[10px] text-fg-muted flex-shrink-0">Processing...</span>
                )}
                {file.status === 'completed' && (
                  <span className="text-[10px] text-fg-muted flex-shrink-0">{formatFileSize(file.size)}</span>
                )}
              </div>
            </div>
          ))}
          {/* Show a mix of sources from different categories */}
          {[
            categorizedSources["SEC.gov"][0],
            categorizedSources["Web Sources"][0],
            categorizedSources["Law Firm Analyses"][0],
            categorizedSources["SEC.gov"][1],
            categorizedSources["Web Sources"][1],
            categorizedSources["Law Firm Analyses"][1],
            categorizedSources["SEC.gov"][2],
            categorizedSources["Web Sources"][2],
            categorizedSources["Law Firm Analyses"][2],
            categorizedSources["Law Firm Analyses"][3],
          ].filter(Boolean).map((source, index) => (
            <div key={index} className="-mx-2 px-2 py-2.5 hover:bg-bg-subtle rounded-md transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                {renderSourceIcon(source.icon)}
                <h4 className="font-medium text-fg-base text-xs truncate flex-1">
                  {source.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-bg-base to-transparent pointer-events-none z-10" />
      </div>
      
      {/* Agents Shelf */}
      <div className="border-t border-border-base -mx-4 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between h-[44px]">
          <span className="text-xs font-medium text-fg-base leading-[20px]">Agents</span>
        </div>
        
        {allAgents.length > 0 ? (
          /* Agent Cards */
          <div className="flex flex-col gap-2">
            {allAgents.map((agent) => (
              <div 
                key={agent.id}
                onClick={() => !agent.isActive && onSwitchAgent?.(agent.id)}
                className={`border rounded-lg bg-bg-base overflow-hidden transition-all ${
                  agent.isActive 
                    ? 'border-border-strong ring-1 ring-border-strong' 
                    : 'border-border-base cursor-pointer hover:border-border-strong'
                }`}
              >
                {/* Agent Header - Shows task name as title with shimmer */}
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="flex-shrink-0 w-4 h-4 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-fg-disabled/30" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-fg-subtle animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {agent.isAwaitingInput ? (
                      <span className="text-sm text-fg-base truncate block whitespace-nowrap overflow-hidden text-ellipsis">
                        {agent.taskName}
                      </span>
                    ) : (
                      <TextShimmer 
                        as="span"
                        className="text-sm !block truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-full [--base-color:#71717a] [--base-gradient-color:#18181b] dark:[--base-color:#a1a1aa] dark:[--base-gradient-color:#fafafa]" 
                        duration={1.5}
                        spread={2}
                      >
                        {agent.taskName}
                      </TextShimmer>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onStopAgent?.(agent.id); }}
                      className="p-1.5 hover:bg-bg-subtle rounded transition-colors"
                      title="Stop agent"
                    >
                      <Square size={14} className="text-fg-subtle" fill="currentColor" />
                    </button>
                    {agent.isAwaitingInput && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onReviewAgent?.(agent.id); }}
                        className="px-2 py-1 text-xs font-medium text-fg-base border border-border-base hover:bg-bg-subtle rounded transition-colors"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Current thinking state */}
                {agent.currentAction && (
                  <div className="px-3 py-2 border-t border-border-base bg-bg-subtle">
                    <div className="flex items-center gap-2 text-xs text-fg-subtle">
                      <Search size={12} className="flex-shrink-0" />
                      <span className="truncate">{agent.currentAction}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col gap-[12px] items-center justify-center py-2">
            <div className="h-[80px] w-[80px] flex items-center justify-center">
              <img src="/agents.svg" alt="Agents" className="w-full h-full object-contain opacity-50" />
            </div>
            <p className="text-xs text-fg-muted leading-[16px] text-center px-4">
              Agents will appear here when they are actively working on tasks
            </p>
          </div>
        )}
      </div>
      
      {/* Activity Shelf */}
      <div className="border-t border-border-base -mx-4 px-4 pt-4">
        <div className="flex items-center justify-between h-[44px]">
          <span className="text-xs font-medium text-fg-base leading-[20px]">Activity</span>
          <button className="h-[24px] px-[6px] py-[2px] text-xs font-medium text-fg-subtle hover:text-fg-base transition-colors leading-[16px]">
            See all
          </button>
        </div>
        <div className="relative">
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type);
            const isLast = index === activities.length - 1;
            return (
              <div key={activity.id} className="flex gap-2 relative">
                {/* Icon and line container */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-4 h-4 flex items-center justify-center bg-bg-base z-10">
                    <IconComponent className="w-4 h-4 text-fg-subtle" />
                  </div>
                  {!isLast && (
                    <div className="w-px bg-border-base flex-1 min-h-[20px]" />
                  )}
                </div>
                {/* Content */}
                <div className={`flex-1 ${!isLast ? 'pb-3' : ''}`}>
                  <p className="text-xs text-fg-subtle leading-4">
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
  );

  // Sources Tab Content (full sources view)
  const sourcesContent = (
    <>
      {/* Search and Filter Section */}
      <div className="px-0.5 pb-4">
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted" />
            <Input
              type="text"
              placeholder="Search sources"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm text-fg-base h-8 shadow-none"
            />
          </div>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 h-8 bg-bg-base border border-border-base rounded-md hover:bg-bg-subtle transition-colors">
                <span className="text-sm text-fg-base">{filterType}</span>
                <ChevronDown className="h-4 w-4 text-fg-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setFilterType("All")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("SEC")}>
                SEC
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("Web")}>
                Web
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("Documents")}>
                Documents
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Separator after search section */}
      <div className="border-t border-border-base -mx-4 mb-4" />
      
      {/* Categorized Sources List */}
      <div className="mt-2">
        {Object.entries(categorizedSources).map(([category, sources], categoryIndex) => (
          <div key={category}>
            {categoryIndex > 0 && (
              <div className="border-t border-border-base my-4 -mx-4" />
            )}
            <div className="px-0.5">
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xs font-medium text-fg-muted">{category}</h3>
              </div>
              
              {/* Sources in Category */}
              <div className="space-y-0.5">
                {sources.map((source, index) => {
                  const isWebSource = category === "Web Sources" && source.url;
                  const content = (
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {renderSourceIcon(source.icon)}
                          <h4 className="font-medium text-fg-base" style={{ fontSize: '12px' }}>
                            {source.title}
                          </h4>
                          {source.url && (
                            <>
                              <span className="text-fg-muted" style={{ fontSize: '12px' }}>•</span>
                              <span className="text-fg-subtle" style={{ fontSize: '12px' }}>
                                {source.url}
                              </span>
                            </>
                          )}
                        </div>
                        {source.description && (
                          <p className="text-fg-subtle leading-relaxed mb-2" style={{ fontSize: '12px' }}>
                            {source.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1">
                          {source.references.map((ref, refIndex) => (
                            <button
                              key={refIndex}
                              className="inline-flex items-center justify-center border border-border-base bg-bg-subtle hover:bg-bg-subtle-pressed text-fg-subtle font-medium transition-colors"
                              style={{ 
                                width: '14px', 
                                height: '14px',
                                fontSize: '10px',
                                lineHeight: '1',
                                borderRadius: '4px'
                              }}
                            >
                              {ref}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );

                  if (isWebSource) {
                    return (
                      <a
                        key={index}
                        href={`https://${source.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="-mx-2 px-2 py-2.5 hover:bg-bg-subtle rounded-md transition-colors cursor-pointer block"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div key={index} className="-mx-2 px-2 py-2.5 hover:bg-bg-subtle rounded-md transition-colors cursor-pointer">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See all link */}
      <div className="mt-6 pt-4 border-t border-border-base -mx-4 px-4">
        <div className="px-0.5">
          <button className="text-sm text-fg-subtle hover:text-fg-base transition-colors flex items-center gap-1">
            See all
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  // Configurations Tab Content
  const configurationsContent = (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="h-[80px] w-[80px] flex items-center justify-center mb-4">
        <img src="/instruction_lines.svg" alt="Configurations" className="w-full h-full object-contain opacity-50" />
      </div>
      <p className="text-xs text-fg-muted leading-[16px] text-center px-4">
        Configuration options will appear here
      </p>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return overviewContent;
      case "sources":
        return sourcesContent;
      case "configurations":
        return configurationsContent;
      default:
        return overviewContent;
    }
  };

  // Panel variant - just returns the content without wrapper
  if (variant === "panel") {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-fg-disabled scrollbar-track-transparent" style={{ width: '400px' }}>
          {renderTabContent()}
        </div>
      </div>
    );
  }

  // Embedded variant - inline in flex layout (no transitions to avoid conflicts with other panel animations)
  if (!isOpen) return null;
  
  return (
    <div
      className="h-full bg-bg-base flex flex-col flex-shrink-0 overflow-hidden"
      style={{ width }}
    >
      {/* Header with segmented controls and close button */}
      <div className="px-3 py-3 border-b border-border-base flex items-center flex-shrink-0" style={{ height: '52px' }}>
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
            data-id="sources"
            className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
            style={{ fontSize: '14px', lineHeight: '20px' }}
          >
            Sources
          </button>
          <button
            data-id="configurations"
            className="relative px-2 py-1.5 font-medium transition-colors text-fg-subtle hover:text-fg-base data-[checked=true]:text-fg-base"
            style={{ fontSize: '14px', lineHeight: '20px' }}
          >
            Configurations
          </button>
        </AnimatedBackground>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="p-2 hover:bg-bg-subtle rounded-md transition-colors flex-shrink-0"
        >
          <X size={16} className="text-fg-subtle" />
        </button>
      </div>
      
      {/* Content with custom scrollbar */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {renderTabContent()}
      </div>
    </div>
  );
}
