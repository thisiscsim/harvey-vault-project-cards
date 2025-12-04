"use client";

import { ListFilter, Cog } from "lucide-react";
import { SmallButton } from "@/components/ui/button";
import { useState } from "react";

interface ReviewTableToolbarProps {
  chatOpen: boolean;
  onToggleChat: () => void;
  onCloseArtifact?: () => void;
  alignment?: 'top' | 'center' | 'bottom';
  onAlignmentChange?: (alignment: 'top' | 'center' | 'bottom') => void;
  textWrap?: boolean;
  onTextWrapChange?: (wrap: boolean) => void;
}

export default function ReviewTableToolbar({ 
  chatOpen, 
  onToggleChat, 
  onCloseArtifact,
  alignment = 'center',
  onAlignmentChange,
  textWrap = false,
  onTextWrapChange 
}: ReviewTableToolbarProps) {
  // Use props for alignment instead of local state
  const handleAlignmentChange = (newAlignment: 'top' | 'center' | 'bottom') => {
    onAlignmentChange?.(newAlignment);
  };
  
  // Use props for text wrap instead of local state
  const handleTextWrapChange = (wrap: boolean) => {
    onTextWrapChange?.(wrap);
  };
  
  // State for concise/extend (keep local for now)
  const [textLength, setTextLength] = useState<'concise' | 'extend'>('concise');

  return (
    <div className="px-3 py-3 border-b border-border-base bg-bg-base flex items-center justify-between" style={{ height: '52px' }}>
      <div className="flex items-center gap-2">
        {/* Toggle Chat Button */}
        <SmallButton
          onClick={onToggleChat}
          variant="secondary"
          className={chatOpen ? "bg-bg-subtle" : ""}
          icon={
            <img 
              src={chatOpen ? "/square-asterisk-filled.svg" : "/square-asterisk-outline.svg"}
              alt="Harvey" 
              width={14} 
              height={14} 
              className="text-fg-subtle"
              style={{ filter: chatOpen ? 'none' : 'brightness(0) saturate(100%) invert(38%) sepia(8%) saturate(664%) hue-rotate(314deg) brightness(96%) contrast(92%)' }}
            />
          }
        >
          Ask Harvey
        </SmallButton>
        
        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>
        
        {/* Filter Button */}
        <SmallButton icon={<ListFilter size={14} />}>
          Filter
        </SmallButton>
        
        {/* Manage Columns Button */}
        <SmallButton icon={<Cog size={14} />}>
          Manage columns
        </SmallButton>
        
        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>
        
        {/* Alignment Options */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleAlignmentChange('top')}
            className={`p-2 rounded-md transition-colors ${
              alignment === 'top' ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Top align"
          >
            <img 
              src={alignment === 'top' ? '/top-align-filled.svg' : '/top-align-outline.svg'} 
              alt="Top align" 
              width={16} 
              height={16} 
            />
          </button>
          
          <button 
            onClick={() => handleAlignmentChange('center')}
            className={`p-2 rounded-md transition-colors ${
              alignment === 'center' ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Center align"
          >
            <img 
              src={alignment === 'center' ? '/center-align-filled.svg' : '/center-align-outline.svg'} 
              alt="Center align" 
              width={16} 
              height={16} 
            />
          </button>
          
          <button 
            onClick={() => handleAlignmentChange('bottom')}
            className={`p-2 rounded-md transition-colors ${
              alignment === 'bottom' ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Bottom align"
          >
            <img 
              src={alignment === 'bottom' ? '/bottom-align-filled.svg' : '/bottom-align-outline.svg'} 
              alt="Bottom align" 
              width={16} 
              height={16} 
            />
          </button>
        </div>
        
        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>
        
        {/* Text Display Options */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleTextWrapChange(false)}
            className={`p-2 rounded-md transition-colors ${
              !textWrap ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Text overflow"
          >
            <img 
              src="/overflow.svg" 
              alt="Text overflow" 
              width={16} 
              height={16} 
            />
          </button>
          
          <button 
            onClick={() => handleTextWrapChange(true)}
            className={`p-2 rounded-md transition-colors ${
              textWrap ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Text wrapping"
          >
            <img 
              src="/wrapping.svg" 
              alt="Text wrapping" 
              width={16} 
              height={16} 
            />
          </button>
        </div>
        
        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>
        
        {/* Text Length Options */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setTextLength('concise')}
            className={`p-2 rounded-md transition-colors ${
              textLength === 'concise' ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Concise"
          >
            <img 
              src="/concise.svg" 
              alt="Concise" 
              width={16} 
              height={16} 
            />
          </button>
          
          <button 
            onClick={() => setTextLength('extend')}
            className={`p-2 rounded-md transition-colors ${
              textLength === 'extend' ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Extend"
          >
            <img 
              src="/extend.svg" 
              alt="Extend" 
              width={16} 
              height={16} 
            />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Close button */}
        <button 
          onClick={chatOpen ? onCloseArtifact : undefined}
          disabled={!chatOpen}
          className={`p-2 rounded-md transition-colors ${
            chatOpen 
              ? 'hover:bg-bg-subtle text-fg-subtle' 
              : 'text-fg-disabled cursor-not-allowed'
          }`}
          title={chatOpen ? "Close" : "Open assistant to close artifact"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18"/>
            <path d="M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
