"use client";

import { 
  ChevronsLeft, 
  ChevronsRight, 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline as UnderlineIcon,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Clipboard,
  Scissors,
  List,
  ListOrdered,
  Undo,
  Redo,
  Code
} from "lucide-react";
import { Editor } from '@tiptap/react';

interface DraftDocumentToolbarProps {
  chatOpen: boolean;
  onToggleChat: () => void;
  onCloseArtifact?: () => void;
  editor: Editor | null;
}

export default function DraftDocumentToolbar({ chatOpen, onToggleChat, onCloseArtifact, editor }: DraftDocumentToolbarProps) {
  if (!editor) {
    return null;
  }

  // Helper function to set link
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Helper functions for clipboard operations
  const handleCopy = () => {
    document.execCommand('copy');
  };

  const handleCut = () => {
    document.execCommand('cut');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch {
      // Fallback for browsers that don't support clipboard API
      document.execCommand('paste');
    }
  };

  return (
    <div className="px-3 py-2 border-b border-border-base bg-bg-base flex items-center justify-between overflow-x-auto" style={{ minHeight: '52px' }}>
      <div className="flex items-center gap-1">
        {/* Toggle Chat Button */}
        <button 
          onClick={onToggleChat}
          className="p-2 rounded-md transition-colors hover:bg-bg-subtle text-fg-subtle"
          title={chatOpen ? "Hide assistant" : "Show assistant"}
        >
          {chatOpen ? (
            <ChevronsLeft size={16} />
          ) : (
            <ChevronsRight size={16} />
          )}
        </button>
        
        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>
        
        {/* Text Formatting Options */}
        <div className="flex items-center gap-1">
          {/* Bold */}
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('bold') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Bold (Cmd+B)"
          >
            <Bold size={16} />
          </button>

          {/* Italic */}
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('italic') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Italic (Cmd+I)"
          >
            <Italic size={16} />
          </button>

          {/* Underline */}
          <button 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('underline') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Underline (Cmd+U)"
          >
            <UnderlineIcon size={16} />
          </button>

          {/* Strikethrough */}
          <button 
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('strike') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>

          {/* Code */}
          <button 
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('code') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Code"
          >
            <Code size={16} />
          </button>

          {/* Link */}
          <button 
            onClick={setLink}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('link') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Add Link"
          >
            <Link size={16} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive({ textAlign: 'left' }) || (!editor.isActive({ textAlign: 'center' }) && !editor.isActive({ textAlign: 'right' })) ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>

          <button 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>

          <button 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('bulletList') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Bullet List"
          >
            <List size={16} />
          </button>

          <button 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('orderedList') ? 'bg-bg-subtle-pressed text-fg-base hover:bg-bg-component' : 'text-fg-subtle hover:bg-bg-subtle'
            }`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>

        {/* Clipboard Operations */}
        <div className="flex items-center gap-1">
          <button 
            onClick={handleCopy}
            className="p-2 rounded-md transition-colors hover:bg-bg-subtle text-fg-subtle"
            title="Copy (Cmd+C)"
          >
            <Copy size={16} />
          </button>

          <button 
            onClick={handleCut}
            className="p-2 rounded-md transition-colors hover:bg-bg-subtle text-fg-subtle"
            title="Cut (Cmd+X)"
          >
            <Scissors size={16} />
          </button>

          <button 
            onClick={handlePaste}
            className="p-2 rounded-md transition-colors hover:bg-bg-subtle text-fg-subtle"
            title="Paste (Cmd+V)"
          >
            <Clipboard size={16} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px bg-bg-subtle-pressed" style={{ height: '20px' }}></div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`p-2 rounded-md transition-colors ${
              editor.can().undo() 
                ? 'hover:bg-bg-subtle text-fg-subtle' 
                : 'text-fg-disabled cursor-not-allowed'
            }`}
            title="Undo (Cmd+Z)"
          >
            <Undo size={16} />
          </button>

          <button 
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`p-2 rounded-md transition-colors ${
              editor.can().redo() 
                ? 'hover:bg-bg-subtle text-fg-subtle' 
                : 'text-fg-disabled cursor-not-allowed'
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo size={16} />
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
