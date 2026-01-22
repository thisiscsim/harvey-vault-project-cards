"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectArtifactType } from "@/lib/artifact-detection";
import { 
  ArrowLeft, Users, Briefcase, ChevronRight, 
  SlidersHorizontal, Paperclip, CornerDownLeft,
  Copy, Download, RotateCcw, ThumbsUp, ThumbsDown, 
  Scale, Mic, ListPlus, CloudUpload, FileSearch, 
  LoaderCircle, SquarePen
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { workflows as allWorkflows, type Workflow, type WorkflowType } from "@/lib/workflows";
import Image from "next/image";
import ThinkingState from "@/components/thinking-state";
import { TextLoop } from "../../../components/motion-primitives/text-loop";
import FileManagementDialog from "@/components/file-management-dialog";
import IManageFilePickerDialog from "@/components/imanage-file-picker-dialog";
import ReviewTableArtifactCard from "@/components/review-table-artifact-card";
import DraftArtifactPanel from "@/components/draft-artifact-panel";
import ReviewArtifactPanel from "@/components/review-artifact-panel";
import { toast } from "sonner";

// Message type - same as assistant page
type Message = {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'artifact' | 'files';
  artifactData?: {
    title: string;
    subtitle: string;
    variant?: 'review' | 'draft';
  };
  filesData?: Array<{
    id: string;
    name: string;
    type: 'folder' | 'file';
    modifiedDate: string;
    size?: string;
    path: string;
  }>;
  isLoading?: boolean;
  thinkingContent?: ReturnType<typeof getThinkingContent>;
  loadingState?: {
    showSummary: boolean;
    visibleBullets: number;
    showAdditionalText: boolean;
    visibleChildStates: number;
  };
  isWorkflowResponse?: boolean;
  workflowTitle?: string;
  isFirstWorkflowMessage?: boolean;
  showThinking?: boolean;
  showFileReview?: boolean;
  fileReviewContent?: {
    summary: string;
    files: Array<{
      name: string;
      type: 'pdf' | 'docx' | 'spreadsheet' | 'folder' | 'text';
    }>;
    totalFiles: number;
  };
  fileReviewLoadingState?: {
    isLoading: boolean;
    loadedFiles: number;
  };
  // Research flow - multi-step inline thinking states
  researchFlowContent?: {
    steps: Array<{
      thinkingTitle: string;
      thinkingContent: string;
      response: string;
      durationSeconds?: number;
      buttons?: Array<{
        label: string;
        onClick?: () => void;
      }>;
    }>;
  };
  researchFlowLoadingState?: {
    currentStep: number;
    isThinking: boolean;
    showResponse: boolean;
  };
};

// Thinking content generator - same as assistant page
function getThinkingContent(variant: 'analysis' | 'draft' | 'review'): {
  summary: string;
  bullets: string[];
  additionalText?: string;
  childStates?: Array<{
    variant: 'analysis' | 'draft' | 'review';
    title: string;
    summary?: string;
    bullets?: string[];
  }>;
} {
  switch (variant) {
    case 'draft':
      return {
        summary: 'Planning structure and content before drafting the document.',
        bullets: [
          'Identify audience and objective',
          'Assemble relevant facts and authorities',
          'Outline sections and key arguments'
        ]
      };
    case 'review':
      return {
        summary: 'Parsing materials and selecting fields for a concise comparison.',
        bullets: [
          'Locate documents and parse key terms',
          'Normalize entities and dates',
          'Populate rows and verify data consistency'
        ]
      };
    default:
      return {
        summary: 'Analyzing the request and gathering relevant information.',
        bullets: [
          'Understanding the context and requirements',
          'Searching through available documents',
          'Preparing comprehensive response'
        ]
      };
  }
}

// Research flow steps - sequential thinking states and responses
const researchFlowSteps = [
  {
    thinkingTitle: 'Thinking...',
    thinkingContent: 'The user is asking to compile authoritative, up-to-date analysis of SEC climate disclosure rules. Scope spans regulatory text, interpretive guidance, enforcement posture, and secondary commentary. Output must be client-ready and structured for executive consumption.',
    response: "I'm going to research the SEC's climate disclosure framework end-to-end and synthesize it into a structured legal memo."
  },
  {
    thinkingTitle: 'Thinking...',
    thinkingContent: 'Begin with authoritative source of truth. Prioritize final rules over proposals. Identify release numbers, effective dates, compliance phase-ins, and scope limitations. Watch for litigation stays or amendments.',
    response: 'Now let me pull and analyze relevant SEC documents for final and proposed climate disclosure rules, including adopting releases and fact sheets.'
  },
  {
    thinkingTitle: 'Reviewing...',
    thinkingContent: 'I will analyze recent SEC documents from technology companies to identify common risk factors and industry-specific disclosures.',
    response: '' // To be filled in later
  }
];

// Get the first 4 workflows as recommended for this project context
const recommendedWorkflows = allWorkflows.slice(0, 4);

export default function StubhubIPOFilingPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("Stubhub IPO Filing");
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Chat state - same as assistant page
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [chatTitle, setChatTitle] = useState('New chat');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  
  // Artifact panel state
  const [unifiedArtifactPanelOpen, setUnifiedArtifactPanelOpen] = useState(false);
  const [currentArtifactType, setCurrentArtifactType] = useState<'draft' | 'review' | null>(null);
  const [selectedDraftArtifact, setSelectedDraftArtifact] = useState<{ title: string; subtitle: string } | null>(null);
  const [selectedReviewArtifact, setSelectedReviewArtifact] = useState<{ title: string; subtitle: string } | null>(null);
  const [draftArtifactPanelOpen, setDraftArtifactPanelOpen] = useState(false);
  const [reviewArtifactPanelOpen, setReviewArtifactPanelOpen] = useState(false);
  
  // Artifact title editing
  const [isEditingDraftArtifactTitle, setIsEditingDraftArtifactTitle] = useState(false);
  const [editedDraftArtifactTitle, setEditedDraftArtifactTitle] = useState('');
  const [isEditingReviewArtifactTitle, setIsEditingReviewArtifactTitle] = useState(false);
  const [editedReviewArtifactTitle, setEditedReviewArtifactTitle] = useState('');
  const draftArtifactTitleInputRef = useRef<HTMLInputElement>(null);
  const reviewArtifactTitleInputRef = useRef<HTMLInputElement>(null);
  
  // Dialog state
  const [isFileManagementOpen, setIsFileManagementOpen] = useState(false);
  const [isIManagePickerOpen, setIsIManagePickerOpen] = useState(false);
  const [shareArtifactDialogOpen, setShareArtifactDialogOpen] = useState(false);
  const [exportReviewDialogOpen, setExportReviewDialogOpen] = useState(false);
  
  // Check if any artifact panel is open
  const anyArtifactPanelOpen = draftArtifactPanelOpen || reviewArtifactPanelOpen || unifiedArtifactPanelOpen;

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        setIsScrolled(scrollTop > 0);
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setIsNearBottom(distanceFromBottom < 100);
        setShowBottomGradient(distanceFromBottom > 1);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isArtifact = lastMessage.type === 'artifact';
      const delay = isArtifact ? 500 : 100;
      
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isNearBottom, scrollToBottom]);

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

  // Handle saving draft artifact title
  const handleSaveDraftArtifactTitle = useCallback(() => {
    if (editedDraftArtifactTitle.trim() && selectedDraftArtifact) {
      if (editedDraftArtifactTitle !== selectedDraftArtifact.title) {
        setSelectedDraftArtifact({
          ...selectedDraftArtifact,
          title: editedDraftArtifactTitle
        });
        toast.success("Draft artifact title updated");
      }
    } else if (selectedDraftArtifact) {
      setEditedDraftArtifactTitle(selectedDraftArtifact.title);
    }
    setIsEditingDraftArtifactTitle(false);
  }, [editedDraftArtifactTitle, selectedDraftArtifact]);

  // Handle saving review artifact title
  const handleSaveReviewArtifactTitle = useCallback(() => {
    if (editedReviewArtifactTitle.trim() && selectedReviewArtifact) {
      if (editedReviewArtifactTitle !== selectedReviewArtifact.title) {
        setSelectedReviewArtifact({
          ...selectedReviewArtifact,
          title: editedReviewArtifactTitle
        });
        toast.success("Review artifact title updated");
      }
    } else if (selectedReviewArtifact) {
      setEditedReviewArtifactTitle(selectedReviewArtifact.title);
    }
    setIsEditingReviewArtifactTitle(false);
  }, [editedReviewArtifactTitle, selectedReviewArtifact]);
  
  // Send workflow message - same as assistant page
  const sendWorkflowMessage = useCallback((workflowTitle: string) => {
    setIsLoading(true);
    setChatTitle(workflowTitle);
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      type: 'text',
      isLoading: true,
      isWorkflowResponse: true,
      workflowTitle: workflowTitle,
      isFirstWorkflowMessage: true,
      showThinking: false
    };
    
    setMessages([assistantMessage]);
    setTimeout(() => scrollToBottom(), 50);
    
    setTimeout(() => {
      setMessages(prev => prev.map((msg, idx) => {
        if (idx === 0 && msg.role === 'assistant' && msg.isLoading) {
          let content = '';
          
          if (workflowTitle.toLowerCase().includes('s-1') && workflowTitle.toLowerCase().includes('risk factors')) {
            content = "Let's draft comprehensive risk factors for your S-1 filing. To create accurate and company-specific risk factors, I'll need supporting materials that highlight your business operations, financial position, industry challenges, and regulatory environment. This includes financials, business plans, competitor analyses, and any existing risk assessments. How would you like to upload your supporting documents?";
          } else if (workflowTitle.toLowerCase().includes('s-1')) {
            content = "Let's get going on drafting your S-1. Before we get started, I'll need some supporting materials (charters, financials, press releases, prior filings). I'll also need key deal details like offering type, structure, and use of proceeds. After I have all the information, I can generate a draft S-1 shell that you can edit in draft mode. First things first, how would you like to upload your supporting documents?";
          } else if (workflowTitle.toLowerCase().includes('employment')) {
            content = "I'll help you draft employment agreements. To create comprehensive and legally sound employment contracts, I'll need information about the role, compensation structure, benefits, and any specific terms you want to include. Do you have any existing templates or specific requirements to share?";
          } else if (workflowTitle.toLowerCase().includes('client alert')) {
            content = "I'll help you draft a client alert. To create an effective and professional communication, I'll need to understand the topic, key points you want to convey, and your target audience. What subject would you like the client alert to cover?";
          } else {
            content = `I'll help you with "${workflowTitle}". What specific information or documents would you like me to work with?`;
          }
          
          return {
            ...msg,
            content,
            isLoading: false
          };
        }
        return msg;
      }));
      
      setIsLoading(false);
    }, 800);
  }, [scrollToBottom]);

  // Send research message - multi-step thinking flow (bundled in single message)
  const sendResearchMessage = useCallback((userMessage: string) => {
    setIsLoading(true);
    setChatTitle(userMessage.length > 40 ? userMessage.substring(0, 40) + '...' : userMessage);
    
    // Add user message and assistant message with research flow content
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      type: 'text'
    };
    
    const assistantMsg: Message = {
      role: 'assistant',
      content: '',
      type: 'text',
      isLoading: true,
      showThinking: false, // We use researchFlowContent instead
      researchFlowContent: {
        steps: researchFlowSteps.map(step => ({
          thinkingTitle: step.thinkingTitle,
          thinkingContent: step.thinkingContent,
          response: step.response,
          durationSeconds: 6
        }))
      },
      researchFlowLoadingState: {
        currentStep: 0,
        isThinking: true,
        showResponse: false
      }
    };
    
    setMessages([userMsg, assistantMsg]);
    setTimeout(() => scrollToBottom(), 50);
    
    // Process steps sequentially
    let currentStep = 0;
    
    const processStep = () => {
      if (currentStep >= researchFlowSteps.length) {
        // All steps complete
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 && msg.role === 'assistant'
            ? { ...msg, isLoading: false }
            : msg
        ));
        setIsLoading(false);
        return;
      }
      
      // Show thinking for current step
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.role === 'assistant'
          ? { 
              ...msg, 
              researchFlowLoadingState: { 
                currentStep, 
                isThinking: true, 
                showResponse: false 
              } 
            }
          : msg
      ));
      
      // After thinking delay, show response
      setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 && msg.role === 'assistant'
            ? { 
                ...msg, 
                researchFlowLoadingState: { 
                  currentStep, 
                  isThinking: false, 
                  showResponse: true 
                } 
              }
            : msg
        ));
        scrollToBottom();
        
        // Move to next step after a brief pause
        currentStep++;
        setTimeout(() => {
          processStep();
        }, 800);
      }, 2500);
    };
    
    // Start processing after initial delay
    setTimeout(() => {
      processStep();
    }, 300);
  }, [scrollToBottom]);

  // Send message - same as assistant page
  const sendMessage = useCallback((messageOverride?: string) => {
    const messageToSend = messageOverride || inputValue;
    if (messageToSend.trim() && !isLoading) {
      const userMessage = messageToSend;
      setInputValue('');
      
      // Check if message contains "Research" - trigger research flow
      if (userMessage.toLowerCase().includes('research')) {
        sendResearchMessage(userMessage);
        return;
      }
      
      setIsLoading(true);
      
      if (messages.length === 0) {
        setChatTitle(userMessage.length > 40 ? userMessage.substring(0, 40) + '...' : userMessage);
      }
      
      const artifactType = detectArtifactType(userMessage);
      const isDraftArtifact = artifactType === 'draft';
      const isReviewArtifact = artifactType === 'review';
      
      const variant = isDraftArtifact ? 'draft' : isReviewArtifact ? 'review' : 'analysis';
      const thinkingContent = getThinkingContent(variant);
      
      const loadingState = {
        showSummary: false,
        visibleBullets: 0,
        showAdditionalText: false,
        visibleChildStates: 0
      };
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        type: isDraftArtifact || isReviewArtifact ? 'artifact' : 'text',
        thinkingContent,
        loadingState,
        isLoading: true,
        ...(isDraftArtifact || isReviewArtifact ? {
          artifactData: {
            title: isDraftArtifact ? 'Record of Deliberation' : 'Extraction of Agreements and Provisions',
            subtitle: isDraftArtifact ? 'Version 1' : '24 columns · 104 rows',
            variant: isDraftArtifact ? 'draft' as const : 'review' as const
          }
        } : {})
      };
      
      setMessages(prev => [
        ...prev, 
        { role: 'user' as const, content: userMessage, type: 'text' as const },
        assistantMessage
      ]);
      
      setTimeout(() => scrollToBottom(), 50);
      
      // Progressive reveal of thinking content
      setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 && msg.role === 'assistant' && msg.isLoading && msg.loadingState
            ? { ...msg, loadingState: { ...msg.loadingState, showSummary: true } }
            : msg
        ));
      }, 600);
      
      const bullets = thinkingContent.bullets || [];
      bullets.forEach((_, bulletIdx) => {
        setTimeout(() => {
          setMessages(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 && msg.role === 'assistant' && msg.isLoading && msg.loadingState
              ? { ...msg, loadingState: { ...msg.loadingState, visibleBullets: bulletIdx + 1 } }
              : msg
          ));
          scrollToBottom();
        }, 1200 + (bulletIdx * 400));
      });
      
      // Complete the response
      setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) => {
          if (idx === prev.length - 1 && msg.role === 'assistant' && msg.isLoading) {
            return {
              ...msg,
              content: isDraftArtifact 
                ? 'I have drafted a memo for you. Please let me know if you would like to continue editing the draft or if you need any specific changes or additional information included.'
                : isReviewArtifact
                  ? 'I have generated a review table extracting terms from the industrial merger agreements as requested. Please let me know if you would like to continue editing the table or if you need any specific changes.'
                  : 'Based on the documents in this vault, I can help you with that. Let me analyze the relevant materials and provide you with a comprehensive response.',
              isLoading: false,
              loadingStates: undefined
            };
          }
          return msg;
        }));
        
        setIsLoading(false);
        scrollToBottom();
      }, 4000);
    }
  }, [inputValue, isLoading, messages.length, scrollToBottom, sendResearchMessage]);

  // Handle workflow click
  const handleWorkflowClick = useCallback((workflow: Workflow) => {
    sendWorkflowMessage(workflow.title);
  }, [sendWorkflowMessage]);
  
  // Check if we're in chat mode
  const isInChatMode = messages.length > 0;
  
  // Toggle chat for artifact panels
  const toggleChat = useCallback(() => {
    // For now, just a placeholder - can implement chat collapse/expand later
  }, []);
  
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      
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
            </div>
          </div>
          
          {/* Main Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Panel */}
            <div className="flex-1 flex flex-col bg-bg-base min-w-0">
              {/* Chat Header - only show when in chat mode */}
              {isInChatMode && (
                <div className="px-4 py-3 border-b border-border-base flex items-center justify-between" style={{ height: '52px' }}>
                  <span className="text-sm font-medium text-fg-base truncate">{chatTitle}</span>
                  <button className="p-1 hover:bg-bg-subtle rounded transition-colors">
                    <SlidersHorizontal className="w-4 h-4 text-fg-muted" />
                  </button>
                </div>
              )}
              
              {/* Chat Content */}
              <div className="flex-1 relative flex flex-col overflow-hidden">
                {/* Top Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-bg-base to-transparent pointer-events-none z-10 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
                
                {/* Bottom Gradient */}
                <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-bg-base to-transparent pointer-events-none z-10 transition-opacity duration-300 ${showBottomGradient ? 'opacity-100' : 'opacity-0'}`} />
                
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-8 pb-4"
                >
                  <div className="mx-auto" style={{ maxWidth: '740px' }}>
                    {!isInChatMode ? (
                      /* Zero State - Welcome Experience */
                      <div className="flex flex-col items-center justify-center flex-1 gap-6 py-3">
                        {/* Welcome Header */}
                        <div className="w-[624px] px-3 flex flex-col gap-0.5">
                          <h1 className="text-[20px] font-medium leading-[26px] tracking-[-0.4px] text-fg-base">
                            Welcome to {projectName}
                          </h1>
                          <p className="text-sm leading-5 text-fg-subtle">
                            This is your vault workspace. What would you like to work on?
                          </p>
                        </div>

                        {/* Get Started Actions */}
                        <div className="w-[624px] flex flex-col">
                          <div className="px-3 pb-3">
                            <p className="text-xs leading-4 text-fg-muted">Get started…</p>
                          </div>
                          
                          {/* Action Items */}
                          <div className="flex flex-col">
                            {/* Draft S-1 shell */}
                            <button
                              onClick={() => sendWorkflowMessage("Draft me an S-1 shell")}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <SquarePen size={16} className="text-fg-subtle" />
                              <span className="text-sm leading-5 text-fg-subtle">Draft me an S-1 shell</span>
                            </button>
                            
                            <div className="h-px bg-border-base" />
                            
                            {/* Generate risk factors */}
                            <button
                              onClick={() => sendWorkflowMessage("Generate risk factors for S-1 filing")}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5M5 4.5V11.5M10 4.5V11.5" stroke="#848079" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-sm leading-5 text-fg-subtle">Generate risk factors for S-1 filing</span>
                            </button>
                            
                            <div className="h-px bg-border-base" />
                            
                            {/* Draft employment agreements */}
                            <button
                              onClick={() => sendWorkflowMessage("Draft employment agreements")}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <SquarePen size={16} className="text-fg-subtle" />
                              <span className="text-sm leading-5 text-fg-subtle">Draft employment agreements</span>
                            </button>
                            
                            <div className="h-px bg-border-base" />
                            
                            {/* Generate post-closing timelines */}
                            <button
                              onClick={() => sendWorkflowMessage("Generate post-closing timelines")}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-bg-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5M5 4.5V11.5M10 4.5V11.5" stroke="#848079" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-sm leading-5 text-fg-subtle">Generate post-closing timelines</span>
                            </button>
                          </div>
                        </div>

                        {/* Or Divider */}
                        <div className="w-[600px] flex items-center gap-2">
                          <div className="flex-1 h-px bg-border-base" />
                          <span className="text-[10px] leading-[14px] text-fg-muted">Or</span>
                          <div className="flex-1 h-px bg-border-base" />
                        </div>

                        {/* Setup Cards */}
                        <div className="w-[600px] flex flex-col gap-3">
                          {/* Upload Files Card */}
                          <div className="bg-bg-subtle p-4 rounded-[10px] flex flex-col gap-3">
                            <div className="flex flex-col gap-0.5">
                              <h3 className="text-sm font-medium leading-5 text-fg-base">
                                Upload your files or connect data sources
                              </h3>
                              <p className="text-xs leading-4 text-fg-subtle">
                                Add documents and files so Harvey can help you analyze and draft.
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button 
                                size="small"
                                onClick={() => setIsFileManagementOpen(true)}
                                className="gap-1.5"
                              >
                                <CloudUpload size={16} />
                                Upload files
                              </Button>
                              <Button 
                                variant="outline" 
                                size="small"
                                onClick={() => setIsIManagePickerOpen(true)}
                                className="gap-1.5"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8 5.5V10.5M10.5 8H5.5M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Connect integrations
                              </Button>
                            </div>
                          </div>

                          {/* Add Team Members Card */}
                          <div className="border border-border-base p-4 rounded-[10px] flex flex-col gap-3">
                            <div className="flex flex-col gap-0.5">
                              <h3 className="text-sm font-medium leading-5 text-fg-base">
                                Add team members who&apos;ll work on this deal
                              </h3>
                              <p className="text-xs leading-4 text-fg-subtle">
                                Invite colleagues to collaborate on this project.
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-7 min-w-[128px]">
                                <input
                                  type="email"
                                  placeholder="Enter email address"
                                  className="w-full h-full bg-bg-subtle px-2.5 py-1.5 rounded-md text-sm placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-border-strong"
                                />
                              </div>
                              <Button 
                                variant="outline" 
                                size="small"
                                className="gap-1.5"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2L7.5 8.5M14 2L9.5 14L7.5 8.5M14 2L2 6.5L7.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Send invite
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Messages */
                      messages.map((message, index) => (
                        <div key={index} className={`${index !== messages.length - 1 ? 'mb-6' : ''}`}>
                          {/* User Message - Right aligned */}
                          {message.role === 'user' && (
                            <div className="flex flex-col gap-1 items-end pl-[68px]">
                              <div className="bg-bg-subtle px-4 py-3 rounded-[12px]">
                                {/* Files container for file messages */}
                                {message.type === 'files' && message.filesData ? (
                                  <div>
                                    <div className="text-sm text-fg-base leading-5 mb-3">
                                      I&apos;ve uploaded some files from iManage
                                    </div>
                                    <div className="border border-border-base rounded-lg px-3 py-1 bg-bg-base">
                                      <div className="space-y-0.5">
                                        {message.filesData.slice(0, 4).map((file) => (
                                          <div 
                                            key={file.id} 
                                            className="flex items-center gap-2 h-8 px-2 -mx-2 rounded-md hover:bg-bg-subtle transition-colors cursor-pointer min-w-0"
                                          >
                                            <div className="flex-shrink-0">
                                              {file.name.toLowerCase().endsWith('.pdf') ? (
                                                <Image src="/pdf-icon.svg" alt="PDF" width={16} height={16} />
                                              ) : file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc') ? (
                                                <Image src="/docx-icon.svg" alt="DOCX" width={16} height={16} />
                                              ) : file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') ? (
                                                <Image src="/xlsx-icon.svg" alt="Spreadsheet" width={16} height={16} />
                                              ) : file.type === 'folder' ? (
                                                <Image src="/folderIcon.svg" alt="Folder" width={16} height={16} />
                                              ) : (
                                                <Image src="/file.svg" alt="File" width={16} height={16} />
                                              )}
                                            </div>
                                            <span className="text-sm text-fg-base truncate flex-1">{file.name}</span>
                                          </div>
                                        ))}
                                        {message.filesData.length > 4 && (
                                          <div className="flex items-center gap-2 h-8 px-2 -mx-2 rounded-md hover:bg-bg-subtle transition-colors cursor-pointer">
                                            <div className="text-sm text-fg-muted">
                                              View {message.filesData.length - 4} more...
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-fg-base leading-5">
                                    {message.content}
                                  </div>
                                )}
                              </div>
                              {/* Action buttons - right aligned */}
                              <div className="flex items-center justify-end">
                                <button className="text-xs font-medium text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded px-2 py-1 flex items-center gap-1.5">
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </button>
                                <button className="text-xs font-medium text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded px-2 py-1 flex items-center gap-1.5">
                                  <ListPlus className="w-3 h-3" />
                                  Save prompt
                                </button>
                                <button className="text-xs font-medium text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded px-2 py-1 flex items-center gap-1.5">
                                  <SquarePen className="w-3 h-3" />
                                  Edit query
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Assistant Message - Left aligned, no avatar */}
                          {message.role === 'assistant' && (
                            <div className="flex-1 min-w-0">
                            {message.role === 'assistant' && (
                              <>
                                {/* Research Flow - Multi-step inline thinking states */}
                                {message.researchFlowContent && message.researchFlowLoadingState && (
                                  <div className="space-y-3">
                                    {message.researchFlowContent.steps.map((step, stepIdx) => {
                                      const loadingState = message.researchFlowLoadingState!;
                                      const isCurrentStep = stepIdx === loadingState.currentStep;
                                      const isPastStep = stepIdx < loadingState.currentStep;
                                      const isFutureStep = stepIdx > loadingState.currentStep;
                                      
                                      // Don't render future steps
                                      if (isFutureStep) return null;
                                      
                                      const showThinking = isPastStep || isCurrentStep;
                                      const showResponse = isPastStep || (isCurrentStep && loadingState.showResponse);
                                      const isThinkingLoading = isCurrentStep && loadingState.isThinking;
                                      
                                      return (
                                        <div key={stepIdx} className="space-y-3">
                                          {/* Thinking State */}
                                          {showThinking && (
                                            <motion.div
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ duration: 0.3, ease: "easeOut" }}
                                            >
                                              <ThinkingState
                                                variant="analysis"
                                                title={isThinkingLoading ? step.thinkingTitle : `Thought for ${step.durationSeconds || 6}s`}
                                                durationSeconds={isPastStep ? step.durationSeconds : undefined}
                                                summary={step.thinkingContent}
                                                isLoading={isThinkingLoading}
                                                defaultOpen={false}
                                              />
                                            </motion.div>
                                          )}
                                          
                                          {/* Response */}
                                          {showResponse && step.response && (
                                            <motion.div
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ duration: 0.4, ease: "easeOut" }}
                                              className="text-sm text-fg-base leading-relaxed pl-2"
                                            >
                                              {step.response}
                                            </motion.div>
                                          )}
                                          
                                          {/* Optional Buttons */}
                                          {showResponse && step.buttons && step.buttons.length > 0 && (
                                            <motion.div
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
                                              className="flex flex-wrap gap-2 pl-2"
                                            >
                                              {step.buttons.map((btn, btnIdx) => (
                                                <Button
                                                  key={btnIdx}
                                                  variant="outline"
                                                  size="small"
                                                  onClick={btn.onClick}
                                                >
                                                  {btn.label}
                                                </Button>
                                              ))}
                                            </motion.div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    
                                    {/* Action buttons after all steps complete */}
                                    {!message.isLoading && (
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className="flex items-center justify-between mt-3"
                                      >
                                        <div className="flex items-center">
                                          <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                            <Copy className="w-3 h-3" />Copy
                                          </button>
                                          <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                            <Download className="w-3 h-3" />Export
                                          </button>
                                          <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                            <RotateCcw className="w-3 h-3" />Rewrite
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button className="text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm p-1.5">
                                            <ThumbsUp className="w-3 h-3" />
                                          </button>
                                          <button className="text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm p-1.5">
                                            <ThumbsDown className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Regular Thinking States (non-research flow) */}
                                {!message.researchFlowContent && message.showThinking !== false && (
                                  <>
                                    {message.isLoading && message.thinkingContent && message.loadingState ? (
                                      <ThinkingState
                                        variant={message.type === 'artifact' ? (message.artifactData?.variant === 'draft' ? 'draft' : 'review') : 'analysis'}
                                        title="Thinking..."
                                        durationSeconds={undefined}
                                        summary={message.loadingState.showSummary ? message.thinkingContent.summary : undefined}
                                        bullets={message.thinkingContent.bullets?.slice(0, message.loadingState.visibleBullets)}
                                        isLoading={true}
                                      />
                                    ) : message.thinkingContent ? (
                                      <ThinkingState
                                        variant={message.type === 'artifact' ? (message.artifactData?.variant === 'draft' ? 'draft' : 'review') : 'analysis'}
                                        title="Thought"
                                        durationSeconds={6}
                                        summary={message.thinkingContent.summary}
                                        bullets={message.thinkingContent.bullets}
                                        defaultOpen={false}
                                      />
                                    ) : null}
                                  </>
                                )}
                                
                                {/* Content (skip for research flow - it handles its own rendering) */}
                                {!message.researchFlowContent && !message.isLoading && message.content && (
                                  <AnimatePresence>
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                      {message.type === 'artifact' ? (
                                        <div className="space-y-3">
                                          <div className="text-sm text-fg-base leading-relaxed pl-2">
                                            {message.content}
                                          </div>
                                          <div className="pl-2">
                                            <ReviewTableArtifactCard
                                              title={message.artifactData?.title || 'Artifact'}
                                              subtitle={message.artifactData?.subtitle || ''}
                                              variant={anyArtifactPanelOpen ? 'small' : 'large'}
                                              isSelected={unifiedArtifactPanelOpen && (
                                                (currentArtifactType === 'draft' && message.artifactData?.variant === 'draft') ||
                                                (currentArtifactType === 'review' && message.artifactData?.variant !== 'draft')
                                              )}
                                              iconType={message.artifactData?.variant === 'draft' ? 'file' : 'table'}
                                              showSources={message.artifactData?.variant === 'draft'}
                                              onClick={() => {
                                                const artifactType = message.artifactData?.variant === 'draft' ? 'draft' : 'review';
                                                const artifactData = {
                                                  title: message.artifactData?.title || 'Artifact',
                                                  subtitle: message.artifactData?.subtitle || ''
                                                };
                                                
                                                setCurrentArtifactType(artifactType);
                                                setUnifiedArtifactPanelOpen(true);
                                                
                                                if (artifactType === 'draft') {
                                                  setSelectedDraftArtifact(artifactData);
                                                  setDraftArtifactPanelOpen(true);
                                                  setReviewArtifactPanelOpen(false);
                                                } else {
                                                  setSelectedReviewArtifact(artifactData);
                                                  setReviewArtifactPanelOpen(true);
                                                  setDraftArtifactPanelOpen(false);
                                                }
                                              }}
                                            />
                                          </div>
                                          {/* Action buttons for artifacts */}
                                          <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center">
                                              <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                                <Copy className="w-3 h-3" />Copy
                                              </button>
                                              <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                                <Download className="w-3 h-3" />Export
                                              </button>
                                              <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                                <RotateCcw className="w-3 h-3" />Rewrite
                                              </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <button className="text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm p-1.5">
                                                <ThumbsUp className="w-3 h-3" />
                                              </button>
                                              <button className="text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm p-1.5">
                                                <ThumbsDown className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div className="text-sm text-fg-base leading-relaxed pl-2">
                                            {message.content}
                                          </div>
                                          
                                          {/* File Review Thinking State */}
                                          {message.showFileReview && message.fileReviewContent && (
                                            <AnimatePresence>
                                              <motion.div 
                                                key="file-review-content"
                                                className="mt-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                              >
                                                <ThinkingState
                                                  variant="analysis"
                                                  title={message.fileReviewLoadingState?.isLoading ? "Reviewing files..." : "Reviewed all files"}
                                                  durationSeconds={undefined}
                                                  icon={FileSearch}
                                                  summary={message.fileReviewContent.summary}
                                                  customContent={
                                                    <motion.div 
                                                      className="mt-3"
                                                      initial={{ opacity: 0 }}
                                                      animate={{ opacity: 1 }}
                                                      transition={{ duration: 0.3, ease: "easeOut" }}
                                                    >
                                                      <div className="flex flex-wrap gap-2">
                                                        {message.fileReviewContent.files.map((file, idx) => (
                                                          <motion.div
                                                            key={`file-chip-${idx}`}
                                                            initial={{ opacity: 0, y: 4 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ 
                                                              duration: 0.2, 
                                                              ease: "easeOut",
                                                              delay: Math.floor(idx / 3) * 0.1
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-2 py-1.5 border border-border-base rounded-md text-xs"
                                                          >
                                                            <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                                                              {message.fileReviewLoadingState?.isLoading && idx >= (message.fileReviewLoadingState?.loadedFiles || 0) ? (
                                                                <LoaderCircle className="w-4 h-4 animate-spin text-fg-subtle" />
                                                              ) : file.type === 'pdf' ? (
                                                                <Image src="/pdf-icon.svg" alt="PDF" width={16} height={16} />
                                                              ) : file.type === 'docx' ? (
                                                                <Image src="/docx-icon.svg" alt="DOCX" width={16} height={16} />
                                                              ) : (
                                                                <Image src="/file.svg" alt="File" width={16} height={16} />
                                                              )}
                                                            </div>
                                                            <span className="text-fg-subtle truncate max-w-[200px]">{file.name}</span>
                                                          </motion.div>
                                                        ))}
                                                      </div>
                                                    </motion.div>
                                                  }
                                                  defaultOpen={false}
                                                  isLoading={message.fileReviewLoadingState?.isLoading}
                                                />
                                              </motion.div>
                                            </AnimatePresence>
                                          )}
                                          
                                          {/* Workflow buttons - only show if no files have been uploaded yet */}
                                          {message.isWorkflowResponse && message.workflowTitle?.toLowerCase().includes('s-1') && !messages.some(msg => msg.type === 'files') && (
                                            <div className="pl-2 mt-4">
                                              <div className="flex flex-wrap gap-2">
                                                <button 
                                                  className="py-1.5 px-3 bg-bg-base border border-border-base rounded-md hover:bg-bg-subtle hover:border-border-strong transition-all flex items-center gap-1.5"
                                                  onClick={() => setIsFileManagementOpen(true)}
                                                >
                                                  <CloudUpload size={16} className="text-fg-subtle" />
                                                  <span className="text-fg-base text-sm font-normal">Upload files</span>
                                                </button>
                                                <button 
                                                  className="py-1.5 px-3 bg-bg-base border border-border-base rounded-md hover:bg-bg-subtle hover:border-border-strong transition-all flex items-center gap-1.5"
                                                  onClick={() => setIsIManagePickerOpen(true)}
                                                >
                                                  <Image src="/imanage.svg" alt="" width={16} height={16} />
                                                  <span className="text-fg-base text-sm font-normal">Add from iManage</span>
                                                </button>
                                                <button className="py-1.5 px-3 bg-bg-base border border-border-base rounded-md hover:bg-bg-subtle hover:border-border-strong transition-all flex items-center gap-1.5">
                                                  <Image src="/sharepoint.svg" alt="" width={16} height={16} />
                                                  <span className="text-fg-base text-sm font-normal">Add from SharePoint</span>
                                                </button>
                                                <button className="py-1.5 px-3 bg-bg-base border border-border-base rounded-md hover:bg-bg-subtle hover:border-border-strong transition-all flex items-center gap-1.5">
                                                  <Image src="/google-drive.svg" alt="" width={16} height={16} />
                                                  <span className="text-fg-base text-sm font-normal">Add from Google Drive</span>
                                                </button>
                                                <button className="py-1.5 px-3 bg-bg-base border border-border-base rounded-md hover:bg-bg-subtle hover:border-border-strong transition-all flex items-center gap-1.5">
                                                  <Image src="/folderIcon.svg" alt="" width={16} height={16} />
                                                  <span className="text-fg-base text-sm font-normal">Add from Vault project</span>
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Action buttons for non-workflow responses */}
                                          {!message.isWorkflowResponse && (
                                            <div className="flex items-center justify-between mt-3">
                                              <div className="flex items-center">
                                                <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                                  <Copy className="w-3 h-3" />Copy
                                                </button>
                                                <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                                  <Download className="w-3 h-3" />Export
                                                </button>
                                                <button className="text-xs text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                                  <RotateCcw className="w-3 h-3" />Rewrite
                                                </button>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <button className="text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm p-1.5">
                                                  <ThumbsUp className="w-3 h-3" />
                                                </button>
                                                <button className="text-fg-subtle hover:text-fg-base hover:bg-bg-subtle transition-colors rounded-sm p-1.5">
                                                  <ThumbsDown className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </motion.div>
                                  </AnimatePresence>
                                )}
                              </>
                            )}
                          </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="px-6 pb-6 relative z-20 bg-bg-base">
                <div className="mx-auto" style={{ maxWidth: '732px' }}>
                  <div 
                    className="bg-[#f6f5f4] border border-[#f1efec] rounded-[12px] flex flex-col transition-all duration-200 focus-within:border-border-strong"
                    style={{ 
                      boxShadow: '0px 18px 47px 0px rgba(0,0,0,0.03), 0px 7.5px 19px 0px rgba(0,0,0,0.02), 0px 4px 10.5px 0px rgba(0,0,0,0.02), 0px 2.3px 5.8px 0px rgba(0,0,0,0.01), 0px 1.2px 3.1px 0px rgba(0,0,0,0.01), 0px 0.5px 1.3px 0px rgba(0,0,0,0.01)'
                    }}
                  >
                    {/* Composer Text Field */}
                    <div className="p-[10px] flex flex-col gap-[10px]">
                      {/* Vault Badge */}
                      <div className="inline-flex items-center gap-[4px] px-[4px] py-[2px] bg-white border border-[#f1efec] rounded-[4px] w-fit">
                        <img src="/folderIcon.svg" alt="Vault" className="w-3 h-3" />
                        <span className="text-[12px] font-medium text-[#848079] leading-[16px]">Statements (A&W)</span>
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
                                sendMessage();
                              }
                            }}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            disabled={isLoading}
                            className="w-full bg-transparent focus:outline-none text-fg-base placeholder-[#9e9b95] resize-none overflow-hidden disabled:opacity-50"
                            style={{ 
                              fontSize: '14px', 
                              lineHeight: '20px',
                              height: '20px',
                              minHeight: '20px',
                              maxHeight: '300px'
                            }}
                          />
                          {!inputValue && !isInputFocused && (
                            <div className="absolute inset-0 pointer-events-none text-[#9e9b95] flex items-start" style={{ fontSize: '14px', lineHeight: '20px' }}>
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
                        <button 
                          onClick={() => setIsFileManagementOpen(true)}
                          className="h-[28px] px-[6px] flex items-center justify-center rounded-[6px] hover:bg-[#e4e1dd] transition-colors"
                        >
                          <Paperclip size={16} className="text-fg-base" />
                        </button>
                        <button className="h-[28px] px-[6px] flex items-center justify-center rounded-[6px] hover:bg-[#e4e1dd] transition-colors">
                          <Scale size={16} className="text-fg-base" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        
                        {isLoading ? (
                          <button
                            disabled
                            className="h-[28px] px-[8px] flex items-center justify-center bg-bg-interactive text-white rounded-[6px] cursor-not-allowed"
                          >
                            <Spinner size="sm" />
                          </button>
                        ) : inputValue.trim() ? (
                          <button
                            onClick={() => sendMessage()}
                            className="h-[28px] px-[8px] flex items-center justify-center bg-bg-interactive text-white rounded-[6px] hover:opacity-90 transition-all"
                          >
                            <CornerDownLeft size={16} />
                          </button>
                        ) : (
                          <button className="h-[28px] px-[8px] flex items-center justify-center bg-[#e4e1dd] rounded-[6px] hover:bg-[#d9d6d1] transition-all">
                            <Mic className="w-4 h-4 text-fg-base" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Artifact Panels */}
            <AnimatePresence>
              {unifiedArtifactPanelOpen && currentArtifactType && (
                <>
                  {currentArtifactType === 'draft' ? (
                    <DraftArtifactPanel
                      selectedArtifact={selectedDraftArtifact}
                      isEditingArtifactTitle={isEditingDraftArtifactTitle}
                      editedArtifactTitle={editedDraftArtifactTitle}
                      onEditedArtifactTitleChange={setEditedDraftArtifactTitle}
                      onStartEditingTitle={() => {
                        setIsEditingDraftArtifactTitle(true);
                        setEditedDraftArtifactTitle(selectedDraftArtifact?.title || 'Artifact');
                      }}
                      onSaveTitle={handleSaveDraftArtifactTitle}
                      onClose={() => {
                        setUnifiedArtifactPanelOpen(false);
                        setDraftArtifactPanelOpen(false);
                        setSelectedDraftArtifact(null);
                        setCurrentArtifactType(null);
                      }}
                      chatOpen={true}
                      onToggleChat={toggleChat}
                      shareArtifactDialogOpen={shareArtifactDialogOpen}
                      onShareArtifactDialogOpenChange={setShareArtifactDialogOpen}
                      exportReviewDialogOpen={exportReviewDialogOpen}
                      onExportReviewDialogOpenChange={setExportReviewDialogOpen}
                      artifactTitleInputRef={draftArtifactTitleInputRef}
                      sourcesDrawerOpen={false}
                      onSourcesDrawerOpenChange={() => {}}
                    />
                  ) : (
                    <ReviewArtifactPanel
                      selectedArtifact={selectedReviewArtifact}
                      isEditingArtifactTitle={isEditingReviewArtifactTitle}
                      editedArtifactTitle={editedReviewArtifactTitle}
                      onEditedArtifactTitleChange={setEditedReviewArtifactTitle}
                      onStartEditingTitle={() => {
                        setIsEditingReviewArtifactTitle(true);
                        setEditedReviewArtifactTitle(selectedReviewArtifact?.title || 'Artifact');
                      }}
                      onSaveTitle={handleSaveReviewArtifactTitle}
                      onClose={() => {
                        setUnifiedArtifactPanelOpen(false);
                        setReviewArtifactPanelOpen(false);
                        setSelectedReviewArtifact(null);
                        setCurrentArtifactType(null);
                      }}
                      chatOpen={true}
                      onToggleChat={toggleChat}
                      shareArtifactDialogOpen={shareArtifactDialogOpen}
                      onShareArtifactDialogOpenChange={setShareArtifactDialogOpen}
                      exportReviewDialogOpen={exportReviewDialogOpen}
                      onExportReviewDialogOpenChange={setExportReviewDialogOpen}
                      artifactTitleInputRef={reviewArtifactTitleInputRef}
                    />
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SidebarInset>
      
      {/* Dialogs */}
      <FileManagementDialog 
        isOpen={isFileManagementOpen} 
        onClose={() => setIsFileManagementOpen(false)} 
      />
      <IManageFilePickerDialog
        isOpen={isIManagePickerOpen}
        onClose={() => setIsIManagePickerOpen(false)}
        onFilesSelected={(files) => {
          console.log('Selected files from iManage:', files);
          setIsIManagePickerOpen(false);
          
          // Check if this is a Risk Factors workflow
          const workflowMsg = messages.find(m => m.isWorkflowResponse && m.workflowTitle);
          const isRiskFactorsWorkflow = workflowMsg?.workflowTitle?.toLowerCase().includes('risk factors');
          
          if (files.length > 0) {
            // Create a files message
            const filesMessage: Message = {
              role: 'user',
              content: `Added ${files.length} files from iManage`,
              type: 'files',
              filesData: files.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                modifiedDate: f.modifiedDate,
                size: f.size,
                path: f.path
              }))
            };
            
            // Create AI response with file review
            const aiResponse: Message = {
              role: 'assistant',
              content: '',
              type: 'text',
              isLoading: true,
              showThinking: false,
              isWorkflowResponse: true,
              workflowTitle: workflowMsg?.workflowTitle,
              showFileReview: true,
              fileReviewContent: {
                summary: "I'll review the files you've provided to extract key information about your company.",
                files: files.slice(0, 6).map(f => ({
                  name: f.name,
                  type: f.name.endsWith('.pdf') ? 'pdf' as const : f.name.endsWith('.docx') ? 'docx' as const : 'text' as const
                })),
                totalFiles: files.length
              },
              fileReviewLoadingState: {
                isLoading: true,
                loadedFiles: 0
              }
            };
            
            setMessages(prev => [...prev, filesMessage, aiResponse]);
            
            // Simulate file review progress
            let loadedCount = 0;
            const progressInterval = setInterval(() => {
              loadedCount++;
              setMessages(prev => prev.map((msg, idx) => {
                if (idx === prev.length - 1 && msg.role === 'assistant' && msg.fileReviewLoadingState) {
                  return {
                    ...msg,
                    fileReviewLoadingState: {
                      ...msg.fileReviewLoadingState,
                      loadedFiles: loadedCount
                    }
                  };
                }
                return msg;
              }));
              
              if (loadedCount >= Math.min(6, files.length)) {
                clearInterval(progressInterval);
                
                // Complete file review
                setTimeout(() => {
                  setMessages(prev => prev.map((msg, idx) => {
                    if (idx === prev.length - 1 && msg.role === 'assistant') {
                      return {
                        ...msg,
                        content: isRiskFactorsWorkflow 
                          ? "I've reviewed all the files. Before I pull the proposed precedent set, I need a couple of preferences. Should I limit the search to precedents where Latham & Watkins served as issuer's counsel, or not filter by law firm at all?"
                          : "I've reviewed all the files you've uploaded. I can now use this information to help draft your document. What specific aspects would you like me to focus on first?",
                        isLoading: false,
                        fileReviewLoadingState: {
                          isLoading: false,
                          loadedFiles: Math.min(6, files.length)
                        }
                      };
                    }
                    return msg;
                  }));
                  setIsLoading(false);
                }, 500);
              }
            }, 400);
          }
        }}
      />
    </div>
  );
}
