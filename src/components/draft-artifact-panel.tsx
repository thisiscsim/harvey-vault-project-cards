"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DraftDocumentToolbar from "@/components/draft-document-toolbar";
import ShareArtifactDialog from "@/components/share-artifact-dialog";
import ExportReviewDialog from "@/components/export-review-dialog";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

interface DraftArtifactPanelProps {
  selectedArtifact: { title: string; subtitle: string } | null;
  isEditingArtifactTitle: boolean;
  editedArtifactTitle: string;
  onEditedArtifactTitleChange: (value: string) => void;
  onStartEditingTitle: () => void;
  onSaveTitle: () => void;
  onClose: () => void;
  chatOpen: boolean;
  onToggleChat: (open: boolean) => void;
  shareArtifactDialogOpen: boolean;
  onShareArtifactDialogOpenChange: (open: boolean) => void;
  exportReviewDialogOpen: boolean;
  onExportReviewDialogOpenChange: (open: boolean) => void;
  artifactTitleInputRef: React.RefObject<HTMLInputElement | null>;
  sourcesDrawerOpen?: boolean;
  onSourcesDrawerOpenChange?: (open: boolean) => void;
}

const PANEL_ANIMATION = {
  duration: 0.3,
  ease: "easeOut" as const
};

export default function DraftArtifactPanel({
  selectedArtifact,
  isEditingArtifactTitle,
  editedArtifactTitle,
  onEditedArtifactTitleChange,
  onStartEditingTitle,
  onSaveTitle,
  onClose,
  chatOpen,
  onToggleChat,
  shareArtifactDialogOpen,
  onShareArtifactDialogOpenChange,
  exportReviewDialogOpen,
  onExportReviewDialogOpenChange,
  artifactTitleInputRef,
  sourcesDrawerOpen,
  onSourcesDrawerOpenChange
}: DraftArtifactPanelProps) {
  // State to force re-renders on selection change
  const [, forceUpdate] = useState({});

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: `
      <h1><strong>DRAFT MEMORANDUM</strong></h1>
      <p><strong>TO:</strong> Board of Directors and Executive Leadership Team<br/>
      <strong>FROM:</strong> Legal & Compliance Department<br/>
      <strong>DATE:</strong> January 26, 2026<br/>
      <strong>RE:</strong> Key Compliance Obligations for Q2 2026 Initial Public Offering</p>
      <hr/>
      <h2><strong>Executive Summary</strong></h2>
      <p>This memorandum outlines the primary compliance obligations and regulatory requirements that our company must satisfy in connection with our planned initial public offering in Q2 2026. As a mid-cap company transitioning to public company status, we will become subject to extensive securities laws, reporting requirements, and corporate governance standards.</p>
      <h2><strong>I. Securities Registration and Disclosure</strong></h2>
      <p><strong>SEC Registration Statement (Form S-1)</strong><br/>
      We must file a comprehensive registration statement with the Securities and Exchange Commission that includes our prospectus. This document requires extensive disclosure regarding our business operations, financial condition, risk factors, management discussion and analysis, and audited financial statements for the past three fiscal years.</p>
      <p><strong>Prospectus Requirements</strong><br/>
      The prospectus must provide full and fair disclosure of all material information that would be important to a reasonable investor. This includes detailed descriptions of our business model, competitive landscape, litigation matters, executive compensation, related party transactions, and use of proceeds.</p>
      <h2><strong>II. Financial Reporting and Auditing</strong></h2>
      <p><strong>Audited Financial Statements</strong><br/>
      We must provide audited financial statements prepared in accordance with Generally Accepted Accounting Principles (GAAP) and audited by a registered public accounting firm under PCAOB standards.</p>
      <p><strong>Internal Controls - Sarbanes-Oxley Act Section 404</strong><br/>
      Management must establish and document effective internal controls over financial reporting. While mid-cap filers may receive some transition relief, we must begin compliance planning immediately. Annual management assessment of internal controls will be required, with eventual auditor attestation.</p>
      <p><strong>Ongoing Periodic Reporting</strong><br/>
      Post-IPO, we will be required to file:</p>
      <ul>
        <li>Quarterly Reports (Form 10-Q) within 40 days of quarter-end</li>
        <li>Annual Reports (Form 10-K) within 60 days of fiscal year-end</li>
        <li>Current Reports (Form 8-K) for material events within 4 business days</li>
      </ul>
      <h2><strong>III. Corporate Governance Requirements</strong></h2>
      <p><strong>Board Composition and Independence</strong><br/>
      We must establish a board of directors with a majority of independent directors as defined under applicable stock exchange listing standards. The audit committee must be composed entirely of independent directors, with at least one financial expert.</p>
    `,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-full text-fg-base',
        'data-placeholder': 'Start writing your document...',
      },
    },
    onUpdate: () => {
      // Force re-render to update toolbar button states
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Force re-render when selection changes to update active states
      forceUpdate({});
    },
  });
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          opacity: { duration: 0.2, ease: "easeOut" }
        }}
        className="h-full flex flex-col bg-bg-subtle"
      >
        {/* Header */}
        <div className="px-3 py-4 border-b border-border-base bg-bg-base flex items-center justify-between" style={{ height: '52px' }}>
          <div className="flex items-center">
            {/* Editable Artifact Title */}
            {isEditingArtifactTitle ? (
              <input
                ref={artifactTitleInputRef}
                type="text"
                value={editedArtifactTitle}
                onChange={(e) => onEditedArtifactTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSaveTitle();
                  }
                }}
                onFocus={(e) => {
                  // Move cursor to start and scroll to beginning
                  setTimeout(() => {
                    e.target.setSelectionRange(0, 0);
                    e.target.scrollLeft = 0;
                  }, 0);
                }}
                className="text-fg-base font-medium bg-bg-subtle border border-border-interactive outline-none px-2 py-1.5 -ml-1 rounded-md text-sm"
                style={{ 
                  width: `${Math.min(Math.max(editedArtifactTitle.length * 8 + 40, 120), 600)}px`,
                  height: '32px'
                }}
                autoFocus
              />
            ) : (
              <button
                onClick={onStartEditingTitle}
                className="text-fg-base font-medium px-2 py-1.5 -ml-1 rounded-md hover:bg-bg-subtle transition-colors cursor-pointer text-sm"
                style={{ height: '32px' }}
              >
                {selectedArtifact?.title || 'Artifact'}
              </button>
            )}
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Export Button - matches Stubhub page header style */}
            <Button 
              variant="outline" 
              size="medium" 
              className="gap-1.5"
              onClick={() => onExportReviewDialogOpenChange(true)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <DraftDocumentToolbar
          chatOpen={chatOpen}
          onToggleChat={() => {
            console.log('Toggle button clicked, current state:', chatOpen);
            onToggleChat(!chatOpen);
          }}
          onCloseArtifact={onClose}
          editor={editor}
        />
        
        {/* Content Area */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-base cursor-text min-h-0"
          onClick={(e) => {
            // Focus the editor when clicking anywhere in the content area
            // Only if the click target is the container itself or its direct children
            const target = e.target as HTMLElement;
            if (editor && !editor.isFocused && !target.closest('.ProseMirror')) {
              editor.chain().focus('end').run();
            }
          }}
        >
          <div className="flex justify-center">
            <div className="w-full max-w-[1000px] px-8 py-10">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dialogs */}
      <ShareArtifactDialog
        isOpen={shareArtifactDialogOpen}
        onClose={() => onShareArtifactDialogOpenChange(false)}
        artifactTitle={selectedArtifact?.title || 'Artifact'}
      />
      <ExportReviewDialog
        isOpen={exportReviewDialogOpen}
        onClose={() => onExportReviewDialogOpenChange(false)}
        artifactTitle={selectedArtifact?.title || 'Artifact'}
      />
    </>
  );
}