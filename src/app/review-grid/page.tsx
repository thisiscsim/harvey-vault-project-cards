"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import ReviewArtifactPanel from "@/components/review-artifact-panel";
import ShareArtifactDialog from "@/components/share-artifact-dialog";
import ExportReviewDialog from "@/components/export-review-dialog";
import { toast } from "sonner";

export default function ReviewGridPage() {
  const [selectedArtifact, setSelectedArtifact] = useState<{ title: string; subtitle: string }>({
    title: 'New review table',
    subtitle: ''
  });
  const [isEditingArtifactTitle, setIsEditingArtifactTitle] = useState(false);
  const [editedArtifactTitle, setEditedArtifactTitle] = useState(selectedArtifact.title);
  const [shareArtifactDialogOpen, setShareArtifactDialogOpen] = useState(false);
  const [exportReviewDialogOpen, setExportReviewDialogOpen] = useState(false);
  const [isEmpty] = useState(true); // Start with empty state - setIsEmpty would be used when documents are uploaded
  
  const artifactTitleInputRef = useRef<HTMLInputElement | null>(null);

  // Handle saving artifact title
  const handleSaveArtifactTitle = useCallback(() => {
    if (editedArtifactTitle.trim()) {
      if (editedArtifactTitle !== selectedArtifact.title) {
        setSelectedArtifact({
          ...selectedArtifact,
          title: editedArtifactTitle
        });
        toast.success("Review grid title updated");
      }
    } else {
      setEditedArtifactTitle(selectedArtifact.title);
    }
    setIsEditingArtifactTitle(false);
  }, [editedArtifactTitle, selectedArtifact]);

  // Update edited artifact title when selected artifact changes
  const handleStartEditingTitle = useCallback(() => {
    setIsEditingArtifactTitle(true);
    setEditedArtifactTitle(selectedArtifact.title);
  }, [selectedArtifact.title]);

  // Handle clicking outside of input field
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (artifactTitleInputRef.current && !artifactTitleInputRef.current.contains(event.target as Node)) {
      handleSaveArtifactTitle();
    }
  }, [handleSaveArtifactTitle]);

  // Setup click outside listener
  useEffect(() => {
    if (isEditingArtifactTitle) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditingArtifactTitle, handleClickOutside]);

  // Dummy handlers for chat open/toggle since we don't have chat in standalone mode
  const chatOpen = false;
  const handleToggleChat = () => {
    // No-op in standalone mode
  };

  const handleClose = () => {
    // Navigate back to assistant page or show a message
    window.history.back();
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content - Full width review grid */}
      <SidebarInset className="flex-1">
        <div className="h-screen flex">
          <ReviewArtifactPanel
            selectedArtifact={selectedArtifact}
            isEditingArtifactTitle={isEditingArtifactTitle}
            editedArtifactTitle={editedArtifactTitle}
            onEditedArtifactTitleChange={setEditedArtifactTitle}
            onStartEditingTitle={handleStartEditingTitle}
            onSaveTitle={handleSaveArtifactTitle}
            onClose={handleClose}
            chatOpen={chatOpen}
            onToggleChat={handleToggleChat}
            shareArtifactDialogOpen={shareArtifactDialogOpen}
            onShareArtifactDialogOpenChange={setShareArtifactDialogOpen}
            exportReviewDialogOpen={exportReviewDialogOpen}
            onExportReviewDialogOpenChange={setExportReviewDialogOpen}
            artifactTitleInputRef={artifactTitleInputRef}
            isEmpty={isEmpty}
            showBackButton={true}
          />
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <ShareArtifactDialog 
        isOpen={shareArtifactDialogOpen} 
        onClose={() => setShareArtifactDialogOpen(false)} 
        artifactTitle={selectedArtifact.title}
      />
      <ExportReviewDialog 
        isOpen={exportReviewDialogOpen} 
        onClose={() => setExportReviewDialogOpen(false)} 
        artifactTitle={selectedArtifact.title}
      />
    </div>
  );
}

