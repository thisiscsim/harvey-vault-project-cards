"use client";

import { X, UserPlus, Layers, Sparkles, Trash2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewTableActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAssignTo?: () => void;
  onGroupFiles?: () => void;
  onOpenInAssistant?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export default function ReviewTableActionBar({
  selectedCount,
  onClearSelection,
  onAssignTo,
  onGroupFiles,
  onOpenInAssistant,
  onDelete,
  onExport,
}: ReviewTableActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-1/2 -translate-x-1/2 z-50 px-6"
          style={{ bottom: '24px', maxWidth: 'calc(100vw - 48px)' }}
        >
          <div className="bg-bg-interactive text-white rounded-lg shadow-2xl flex items-center gap-1 w-max" style={{ padding: '4px' }}>
            {/* Selection count and clear button */}
            <button
              onClick={onClearSelection}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-interactive rounded-md transition-colors"
            >
              <span className="text-sm font-medium whitespace-nowrap">
                {selectedCount} {selectedCount === 1 ? 'document' : 'documents'} selected
              </span>
              <X size={16} />
            </button>

            {/* Vertical divider */}
            <div className="w-px bg-bg-interactive" style={{ height: '16px' }} />

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Assign to */}
              <button
                onClick={onAssignTo}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-interactive rounded-md transition-colors"
              >
                <UserPlus size={16} />
                <span className="text-sm font-medium">Assign to</span>
              </button>

              {/* Group files */}
              <button
                onClick={onGroupFiles}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-interactive rounded-md transition-colors"
              >
                <Layers size={16} />
                <span className="text-sm font-medium">Group files</span>
              </button>

              {/* Open in Assistant */}
              <button
                onClick={onOpenInAssistant}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-interactive rounded-md transition-colors"
              >
                <Sparkles size={16} />
                <span className="text-sm font-medium">Open in Assistant</span>
              </button>

              {/* Delete */}
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-interactive rounded-md transition-colors"
              >
                <Trash2 size={16} />
                <span className="text-sm font-medium">Delete</span>
              </button>

              {/* Export */}
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-interactive rounded-md transition-colors"
              >
                <Download size={16} />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

