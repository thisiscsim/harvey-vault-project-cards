"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Download, GripVertical, ArrowLeft, Layers, UserPlus as UserPlusIcon, Check } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode,
  RowData,
} from '@tanstack/react-table';
// Removed unused imports
import ReviewTableToolbar from "@/components/review-table-toolbar";
import { Button } from "@/components/ui/button";
import ReviewFilterBar from "@/components/review-filter-bar";
import ShareArtifactDialog from "@/components/share-artifact-dialog";
import ExportReviewDialog from "@/components/export-review-dialog";
import IManageFilePickerDialog from "@/components/imanage-file-picker-dialog";
import ReviewTableActionBar from "@/components/review-table-action-bar";
import ManageGroupedFilesPopover from "@/components/manage-grouped-files-popover";
import Image from "next/image";
import { SvgIcon } from "@/components/svg-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Extend column meta type for draggable property
declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    draggable?: boolean;
  }
}

// SVG Icon Components
const PdfHarveyIcon = ({ className }: { className?: string }) => (
  <svg
    width='12'
    height='12'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      d='M6 1.25H13.7578C14.487 1.25012 15.1865 1.54005 15.7021 2.05566L19.9443 6.29785C20.46 6.81347 20.7499 7.51301 20.75 8.24219V20C20.75 21.5188 19.5188 22.75 18 22.75H6C4.48122 22.75 3.25 21.5188 3.25 20V4C3.25 2.48122 4.48122 1.25 6 1.25Z'
      fill='#FAFAF9'
      stroke='#CCCAC6'
      strokeWidth='0.5'
    />
    <path
      d='M7.77703 17C9.56757 17 12.4054 9.90541 12.4054 7.81081C12.4054 7.37162 12.0338 7 11.6284 7C11.223 7 10.9527 7.50676 10.9527 8.08108C10.9527 11.6622 14.7365 14.5 16.1892 14.5C16.5781 14.5 17 14.3649 17 13.8243C17 13.2838 16.4595 12.9797 15.8176 12.9797C12.4054 12.9797 7 15.1081 7 16.3243C7 16.7635 7.30405 17 7.77703 17Z'
      stroke='#E7000B'
      strokeWidth='1.25'
    />
  </svg>
);

const TypeIcon = ({ className }: { className?: string }) => (
  <svg
    width='12'
    height='12'
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      d='M3 4.5V3H9M9 3H15V4.5M9 3V15M9 15H7.5M9 15H10.5'
      stroke='black'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const SelectionIcon = ({ className }: { className?: string }) => (
  <svg
    width='12'
    height='12'
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      d='M5.65721 7.12331L6.50096 7.68585L7.9047 5.81418M10.5434 6.75H12.0434M10.5 11.25H12M5.65721 11.6242L6.50096 12.1867L7.9047 10.315M3.75 15H14.25C14.6642 15 15 14.6642 15 14.25V3.75C15 3.33579 14.6642 3 14.25 3H3.75C3.33579 3 3 3.33579 3 3.75V14.25C3 14.6642 3.33579 15 3.75 15Z'
      stroke='black'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const FileIcon = ({ className }: { className?: string }) => (
  <SvgIcon 
    src="/central_icons/File.svg" 
    alt="File" 
    width={14} 
    height={14} 
    className={className || "text-fg-subtle"} 
  />
);

type Document = {
  id: number;
  selected: boolean;
  fileName: string;
  agreementParties: string;
  forceMajeureClause: 'Disputed' | 'Not Disputed' | 'Somewhat Disputed';
  assignmentProvisionSummary: string;
  groupedCount?: number;
};

interface SelectedFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  modifiedDate: string;
  size?: string;
  path: string;
}

const columnHelper = createColumnHelper<Document>();

// We'll define columns inside the component to access textWrap state

// Cell wrapper component with animation
const AnimatedCell = ({
  children,
  rowIndex,
  columnIndex,
  shouldAnimate,
  cellPadding,
}: {
  children: React.ReactNode;
  rowIndex: number;
  columnIndex: number;
  shouldAnimate: boolean;
  cellPadding: string;
}) => {
  if (!shouldAnimate) {
    return <>{children}</>;
  }

  // Calculate negative margins based on padding
  const negativeMargin = cellPadding === 'px-1' ? '-0.25rem' : '-0.75rem';
  // Create a more organic diagonal wave pattern
  const normalizedRow = rowIndex / 12; // Normalize to 0-1 based on ~12 rows
  const normalizedCol = (columnIndex - 2) / 3; // Normalize to 0-1 for columns 2-4
  const delay = (normalizedRow + normalizedCol) * 0.45;

  // Animation timing: 2 preview waves + 1 reveal wave
  const singleWaveDuration = 0.6;
  const thirdWaveStartTime = delay + singleWaveDuration * 2; // When this cell's 3rd wave starts

  return (
    <div className='relative'>
      {/* Content - initially invisible, reveals during 3rd wave */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.01,
          delay: thirdWaveStartTime + 0.24, // Reveal content when gradient is in the middle of 3rd wave
        }}
      >
        {children}
      </motion.div>

      {/* White overlay that covers the cell initially, disappears at start of 3rd wave */}
      <motion.div
        className='absolute bg-bg-base'
        style={{
          top: negativeMargin,
          left: negativeMargin,
          right: negativeMargin,
          bottom: negativeMargin,
          height: `calc(100% + ${cellPadding === 'px-1' ? '0.5rem' : '1.5rem'})`,
          width: `calc(100% + ${cellPadding === 'px-1' ? '0.5rem' : '1.5rem'})`,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{
          duration: 0.01,
          delay: thirdWaveStartTime, // Disappear at start of 3rd wave
        }}
      />

      {/* Animated gradient overlay - repeats 2 times, then final reveal wave */}
      <motion.div
        className='absolute'
        style={{
          top: negativeMargin,
          left: negativeMargin,
          right: negativeMargin,
          bottom: negativeMargin,
          height: `calc(200% + ${cellPadding === 'px-1' ? '1rem' : '3rem'})`, // Double height for gradient
          width: `calc(100% + ${cellPadding === 'px-1' ? '0.5rem' : '1.5rem'})`,
          background: `linear-gradient(to bottom, 
            transparent 0%, 
            rgba(246, 245, 244, 0.3) 20%,
            rgba(226, 225, 224, 0.6) 35%,
            rgba(206, 205, 204, 0.8) 50%,
            rgba(186, 185, 184, 0.6) 65%,
            rgba(166, 165, 164, 0.3) 80%,
            transparent 100%)`,
        }}
        initial={{ y: '-100%' }}
        animate={{ y: '50%' }}
        transition={{
          duration: singleWaveDuration,
          ease: 'easeInOut' as const,
          delay: delay,
          repeat: 2, // Repeat 2 times (3 total waves)
          repeatType: 'loop' as const,
          repeatDelay: 0, // No delay between repeats
        }}
      />
    </div>
  );
};

interface ReviewArtifactPanelProps {
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
  isEmpty?: boolean;
  showBackButton?: boolean;
  selectedFiles?: SelectedFile[];
  onFilesSelected?: (files: SelectedFile[]) => void;
}

const PANEL_ANIMATION = {
  duration: 0.3,
  ease: "easeOut" as const
};

export default function ReviewArtifactPanel({
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
  isEmpty = false,
  showBackButton = false,
  selectedFiles = [],
  onFilesSelected
}: ReviewArtifactPanelProps) {
  const [alignment, setAlignment] = React.useState<'top' | 'center' | 'bottom'>('center');
  const [textWrap, setTextWrap] = React.useState<boolean>(false);
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [draggedColumn, setDraggedColumn] = React.useState<string | null>(null);
  const [hoveredHeader, setHoveredHeader] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const [iManageDialogOpen, setIManageDialogOpen] = React.useState(false);
  const [tableData, setTableData] = React.useState<Document[]>([]);
  const [manageGroupedFilesRowId, setManageGroupedFilesRowId] = React.useState<number | null>(null);
  const [manageGroupedFilesAnchor, setManageGroupedFilesAnchor] = React.useState<HTMLElement | null>(null);
  const [addColumnPopoverOpen, setAddColumnPopoverOpen] = React.useState(false);
  const fileColumnRef = React.useRef<HTMLTableCellElement>(null);
  const [addColumnPopoverPosition, setAddColumnPopoverPosition] = React.useState({ top: 0, left: 0 });
  
  // Add column popover state
  const [columnQuestion, setColumnQuestion] = React.useState('');
  const [columnHeader, setColumnHeader] = React.useState('');
  const [isGeneratingHeader, setIsGeneratingHeader] = React.useState(false);
  const [hasStartedTyping, setHasStartedTyping] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [selectedModel, setSelectedModel] = React.useState('auto');
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);
  
  // Update popover position when it opens
  React.useEffect(() => {
    if (addColumnPopoverOpen && fileColumnRef.current) {
      const rect = fileColumnRef.current.getBoundingClientRect();
      setAddColumnPopoverPosition({
        top: rect.top + 4, // 4px from the top border of the table
        left: rect.right + 4, // 4px gap to the right of the file column
      });
    }
  }, [addColumnPopoverOpen]);
  
  // Reset popover state when closed
  React.useEffect(() => {
    if (!addColumnPopoverOpen) {
      setColumnQuestion('');
      setColumnHeader('');
      setIsGeneratingHeader(false);
      setHasStartedTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [addColumnPopoverOpen]);
  
  // Handle question input change with debounced header generation
  const handleQuestionChange = (value: string) => {
    setColumnQuestion(value);
    
    if (value.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true);
    }
    
    if (value.length === 0) {
      setHasStartedTyping(false);
      setColumnHeader('');
      setIsGeneratingHeader(false);
      return;
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Start skeleton loading
    setIsGeneratingHeader(true);
    setColumnHeader('');
    
    // Simulate header generation after user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      // Generate a header based on the question (simplified simulation)
      const generatedHeader = generateHeaderFromQuestion(value);
      setColumnHeader(generatedHeader);
      setIsGeneratingHeader(false);
    }, 1000);
  };
  
  // Simple function to generate a header from a question
  const generateHeaderFromQuestion = (question: string): string => {
    // Remove common question words and create a title
    const cleanedQuestion = question
      .replace(/^(what|who|when|where|why|how|is|are|does|do|can|will|should)\s+/i, '')
      .replace(/\?$/, '')
      .trim();
    
    // Capitalize first letter of each word and truncate
    const words = cleanedQuestion.split(' ').slice(0, 4);
    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Transform selected files into table data format - only for initialization
  const initialData: Document[] = React.useMemo(() => {
    if (selectedFiles.length === 0) {
      // Return original mock data when no files selected
      return [
        {
          id: 1,
          selected: false,
          fileName: 'SEC_Filing_10-K_2023.pdf',
          agreementParties: 'TerreStar 1.4 Holdings LLC (Lessor), TerreStar...',
          forceMajeureClause: 'Disputed',
          assignmentProvisionSummary: 'No assignment without consent, except to wh...',
        },
        {
          id: 2,
          selected: false,
          fileName: 'C05763098.pdf',
          agreementParties: 'T-Mobile USA, Inc., DISH Purchasing Corporat...',
          forceMajeureClause: 'Somewhat Disputed',
          assignmentProvisionSummary: 'No assignment without prior written consent.',
        },
        {
          id: 3,
          selected: false,
          fileName: 'Probable Cause Hearing Transcripts...',
          agreementParties: 'SunSpark Technology Inc. (California corporati...',
          forceMajeureClause: 'Not Disputed',
          assignmentProvisionSummary: 'No assignment without consent, null if viola...',
        },
        {
          id: 4,
          selected: false,
          fileName: 'Delta Inventory Supply Agreement.pdf',
          agreementParties: 'Delta Airlines LLC (Georgia corporation)',
          forceMajeureClause: 'Not Disputed',
          assignmentProvisionSummary: 'No assignment without prior written consent.',
        },
        {
          id: 5,
          selected: false,
          fileName: 'menlo-shankar-PEO.pdf',
          agreementParties: 'Smith & Wesson Inc., Crimson Trace Corporati...',
          forceMajeureClause: 'Not Disputed',
          assignmentProvisionSummary: 'WKKC cannot assign the contract without Kel...',
        },
        {
          id: 6,
          selected: false,
          fileName: 'Deposition_Transcript_Jones.pdf',
          agreementParties: 'No information',
          forceMajeureClause: 'Disputed',
          assignmentProvisionSummary: 'No assignment without consent, except to wh...',
        },
        {
          id: 7,
          selected: false,
          fileName: 'Discovery_Request_21083.pdf',
          agreementParties: 'Ultragenyx Pharmaceutical Inc. (UGX), IOI Oleo...',
          forceMajeureClause: 'Disputed',
          assignmentProvisionSummary: 'Assignment allowed with conditions.',
        },
        {
          id: 8,
          selected: false,
          fileName: 'AD08912631234.pdf',
          agreementParties: 'No information',
          forceMajeureClause: 'Disputed',
          assignmentProvisionSummary: 'Assignment requires prior written consent.',
        },
        {
          id: 9,
          selected: false,
          fileName: 'tmp_lease_document2023621.pdf',
          agreementParties: "Pilgrim's Pride Corporation (Shipper), Pat Pilgri...",
          forceMajeureClause: 'Somewhat Disputed',
          assignmentProvisionSummary: 'No assignment without prior written consent.',
        },
        {
          id: 10,
          selected: false,
          fileName: 'policy_document_12_24_08.pdf',
          agreementParties: 'No information',
          forceMajeureClause: 'Somewhat Disputed',
          assignmentProvisionSummary: 'Assignment requires consent, with exception...',
        },
        {
          id: 11,
          selected: false,
          fileName: '2-23-20250207T001925Z-001.pdf',
          agreementParties: 'Seattle Genetics, Inc. and SAFC, an operating...',
          forceMajeureClause: 'Disputed',
          assignmentProvisionSummary: 'Assignment requires consent, with exception...',
        },
        {
          id: 12,
          selected: false,
          fileName: 'Plaintiff_Exhibit_List.pdf',
          agreementParties: 'Crown Electrokinetics Corp., Brandywine O...',
          forceMajeureClause: 'Not Disputed',
          assignmentProvisionSummary: "Company needs Aron's consent to assign; Aro...",
        },
      ];
    }
    
    // Map selected files to Document format
    return selectedFiles
      .filter(file => file.type === 'file') // Only include actual files, not folders
      .map((file, index) => ({
        id: index + 1,
        selected: false,
        fileName: file.name,
        agreementParties: 'Processing...',
        forceMajeureClause: 'Not Disputed' as const,
        assignmentProvisionSummary: 'Analyzing document...',
      }));
  }, [selectedFiles]);

  // Update tableData when initialData changes
  React.useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  const data = tableData;
  
  // Handle group files
  const handleGroupFiles = React.useCallback(() => {
    if (selectedRows.size === 0) return;
    
    // Get all selected row IDs
    const selectedIds = Array.from(selectedRows);
    
    // Find the first selected row
    const firstSelectedId = Math.min(...selectedIds);
    
    // Count how many rows to group (excluding the first one)
    const groupCount = selectedIds.length - 1;
    
    if (groupCount === 0) return; // Nothing to group if only one row selected
    
    // Update the data: keep only the first selected row, remove others, and add grouped count
    setTableData(prevData => 
      prevData
        .map(row => {
          if (row.id === firstSelectedId) {
            // Add the grouped count to the first selected row
            return { 
              ...row, 
              groupedCount: (row.groupedCount || 0) + groupCount 
            };
          }
          return row;
        })
        .filter(row => !selectedIds.includes(row.id) || row.id === firstSelectedId)
    );
    
    // Clear selection
    setSelectedRows(new Set());
  }, [selectedRows]);
  
  // Get vertical alignment style based on alignment prop
  const getVerticalAlign = () => {
    switch (alignment) {
      case 'center':
        return 'middle';
      case 'bottom':
        return 'bottom';
      default:
        return 'top';
    }
  };
  
  // Handle row selection
  const toggleRowSelection = React.useCallback((rowId: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);
  
  // Handle select all
  const toggleSelectAll = React.useCallback(() => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(row => row.id)));
    }
  }, [selectedRows.size, data]);
  
  // Handle clear selection
  const clearSelection = React.useCallback(() => {
    setSelectedRows(new Set());
  }, []);
  
  // Check if all rows are selected
  const isAllSelected = selectedRows.size === data.length && selectedRows.size > 0;
  
  // Check if we're in "files only" mode (files added from iManage but no query run yet)
  const isFilesOnlyMode = selectedFiles.length > 0;
  
  // Define base columns (select and fileName)
  const baseColumns = React.useMemo(() => [
    columnHelper.display({
      id: 'select',
      size: 48,
      minSize: 48,
      maxSize: 48,
      enableResizing: false,
      header: () => (
        <div className='flex justify-center'>
          <input 
            type='checkbox' 
            className='custom-checkbox' 
            checked={isAllSelected}
            onChange={toggleSelectAll}
          />
        </div>
      ),
      cell: ({ row }) => {
        const isSelected = selectedRows.has(row.original.id);
        const isHovered = hoveredRow === row.original.id;
        const showCheckbox = isSelected || isHovered;
        
        return (
          <div className='flex justify-center h-full items-center'>
            {showCheckbox ? (
              <input
                type='checkbox'
                className='custom-checkbox'
                checked={isSelected}
                onChange={() => toggleRowSelection(row.original.id)}
              />
            ) : (
              <span className="text-fg-muted">{row.index + 1}</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('fileName', {
      header: () => (
        <div className='flex items-center gap-1 h-4'>
          <FileIcon />
          <span>File</span>
        </div>
      ),
      size: 220,
      minSize: 100,
      maxSize: 280,
      cell: ({ row }) => {
        const isHovered = hoveredRow === row.original.id;
        const hasGroupedFiles = row.original.groupedCount && row.original.groupedCount > 0;
        
        return (
          <div className='flex items-center gap-1.5 relative'>
            <div className='flex items-center gap-1.5 flex-1 min-w-0'>
              <PdfHarveyIcon className='h-[14px] w-[14px] flex-shrink-0' />
              <span className='truncate border-b border-border-base text-fg-base'>{row.original.fileName}</span>
            </div>
            {hasGroupedFiles && (
              <span className='px-1.5 py-0.5 bg-bg-subtle-pressed text-fg-subtle rounded text-xs font-medium flex-shrink-0'>
                +{row.original.groupedCount}
              </span>
            )}
            
            {/* Hover Control Bar */}
            {isHovered && (
              <div 
                className='absolute right-0 flex items-center gap-0.5 bg-bg-base rounded-md p-0.5 shadow-md border border-border-base'
              >
                  {/* Create group or Manage grouped files button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasGroupedFiles) {
                        // Open manage grouped files popover
                        setManageGroupedFilesRowId(row.original.id);
                        setManageGroupedFilesAnchor(e.currentTarget.closest('td'));
                      } else {
                        // Select the row checkbox
                        toggleRowSelection(row.original.id);
                      }
                    }}
                    className='p-1.5 hover:bg-bg-subtle rounded transition-colors text-fg-subtle'
                    title={hasGroupedFiles ? 'Manage grouped files' : 'Create group'}
                  >
                    <Layers size={14} />
                  </button>
                  
                  {/* Assign button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Assign');
                    }}
                    className='p-1.5 hover:bg-bg-subtle rounded transition-colors text-fg-subtle'
                    title="Assign"
                  >
                    <UserPlusIcon size={14} />
                  </button>
                </div>
            )}
          </div>
        );
      },
    }),
  ], [isAllSelected, toggleSelectAll, selectedRows, hoveredRow, toggleRowSelection]);
  
  // Define query columns (only shown when query has been run)
  const queryColumns = React.useMemo(() => [
    columnHelper.accessor('agreementParties', {
      header: ({ column }) => {
        const isHovered = hoveredHeader === column.id;
        const isDragging = draggedColumn === column.id;
        
        return (
                        <div className='flex items-center gap-1 h-4'>
            {(isHovered || isDragging) ? (
              <GripVertical 
                size={12} 
                className="cursor-grab active:cursor-grabbing text-fg-muted hover:text-fg-subtle flex-shrink-0" 
              />
            ) : (
              <TypeIcon className="flex-shrink-0" />
            )}
            <span>Agreement Parties</span>
          </div>
        );
      },
      size: 325,
      minSize: 150,
      maxSize: 500,
      enableSorting: false,
      meta: {
        draggable: true
      },
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span
            className={`block ${textWrap ? '' : 'truncate'} ${value === 'No information' ? 'text-fg-muted' : 'text-fg-base'}`}
            style={{ 
              whiteSpace: textWrap ? 'normal' : 'nowrap',
              wordBreak: textWrap ? 'break-word' : 'normal'
            }}
          >
            {value}
          </span>
        );
      },
    }),
    columnHelper.accessor('forceMajeureClause', {
      header: ({ column }) => {
        const isHovered = hoveredHeader === column.id;
        const isDragging = draggedColumn === column.id;
        
        return (
          <div className='flex items-center gap-1 h-4 overflow-hidden'>
            {(isHovered || isDragging) ? (
              <GripVertical 
                size={12} 
                className="cursor-grab active:cursor-grabbing text-fg-muted hover:text-fg-subtle flex-shrink-0" 
              />
            ) : (
              <SelectionIcon className="flex-shrink-0" />
            )}
            <span className='truncate min-w-0'>Force Majeure Clause Reference</span>
          </div>
        );
      },
      size: 325,
      minSize: 150,
      maxSize: 400,
      enableSorting: false,
      meta: {
        draggable: true
      },
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className='inline-block px-2 py-1 rounded-[6px] bg-bg-subtle border border-border-base text-fg-base'>
            {value}
          </span>
        );
      },
    }),
    columnHelper.accessor('assignmentProvisionSummary', {
      header: ({ column }) => {
        const isHovered = hoveredHeader === column.id;
        const isDragging = draggedColumn === column.id;
        
        return (
                        <div className='flex items-center gap-1 h-4'>
            {(isHovered || isDragging) ? (
              <GripVertical 
                size={12} 
                className="cursor-grab active:cursor-grabbing text-fg-muted hover:text-fg-subtle flex-shrink-0" 
              />
            ) : (
              <TypeIcon className="flex-shrink-0" />
            )}
            <span>Assignment Provision Summary</span>
          </div>
        );
      },
      size: 325,
      minSize: 150,
      maxSize: 500,
      enableSorting: false,
      meta: {
        draggable: true
      },
      cell: ({ getValue }) => (
        <span className={`block ${textWrap ? '' : 'truncate'}`} style={{
          whiteSpace: textWrap ? 'normal' : 'nowrap',
          wordBreak: textWrap ? 'break-word' : 'normal'
        }}>{getValue()}</span>
      ),
    }),
  ], [textWrap, hoveredHeader, draggedColumn]);
  
  // Combine columns based on mode - only show query columns when NOT in files-only mode
  const columns = React.useMemo(() => {
    if (isFilesOnlyMode) {
      return baseColumns;
    }
    return [...baseColumns, ...queryColumns];
  }, [isFilesOnlyMode, baseColumns, queryColumns]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange' as ColumnResizeMode,
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
    },
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
  });

  return (
    <>
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '100%', opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{
          width: PANEL_ANIMATION,
          opacity: { duration: 0.15, ease: "easeOut" }
        }}
        className="flex-1 min-w-0 flex flex-col bg-bg-base overflow-x-hidden"
      >
        {/* Header */}
        <div className="px-3 py-4 border-b border-border-base bg-bg-base flex items-center justify-between" style={{ height: '52px' }}>
          <div className="flex items-center flex-1 min-w-0">
            {/* Back Button */}
            {showBackButton && (
              <>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-bg-subtle rounded-md transition-colors mr-1"
                >
                  <ArrowLeft size={16} className="text-fg-subtle" />
                </button>
                
                {/* Vertical Separator */}
                <div className="w-px bg-bg-subtle-pressed mr-3" style={{ height: '20px' }}></div>
              </>
            )}
            
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
            {/* Share Button */}
            <button 
              onClick={() => onShareArtifactDialogOpenChange(true)}
              className="h-8 flex items-center gap-2 px-3 border border-border-base rounded-[8px] bg-button-neutral hover:bg-button-neutral-hover active:bg-button-neutral-pressed transition-colors text-fg-base text-sm font-normal"
            >
              <UserPlus size={16} className="text-fg-base" />
              <span className="text-sm font-normal">Share</span>
            </button>
            {/* Export Button */}
            <button 
              className="h-8 flex items-center gap-2 px-3 border border-border-base rounded-[8px] bg-button-neutral hover:bg-button-neutral-hover active:bg-button-neutral-pressed transition-colors text-fg-base text-sm font-normal"
              onClick={() => onExportReviewDialogOpenChange(true)}
            >
              <Download size={16} className="text-fg-base" />
              <span className="text-sm font-normal">Export</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <ReviewTableToolbar
          chatOpen={chatOpen}
          onToggleChat={() => {
            console.log('Toggle button clicked, current state:', chatOpen);
            onToggleChat(!chatOpen);
          }}
          onCloseArtifact={onClose}
          alignment={alignment}
          onAlignmentChange={setAlignment}
          textWrap={textWrap}
          onTextWrapChange={setTextWrap}
          hasFiles={isFilesOnlyMode}
          onAddColumn={() => setAddColumnPopoverOpen(true)}
        />
        
        {/* Filter Bar */}
        <ReviewFilterBar />
        
        {/* Content Area */}
        <div className="flex-1 min-w-0 bg-bg-base" style={{ minHeight: 0 }}>
          {isEmpty ? (
            /* Empty State */
            <div className="h-full relative bg-bg-base overflow-auto">
              {/* Table Header with File column */}
              <div className="border-b border-border-base">
                <div className="flex items-center">
                  {/* Checkbox column */}
                  <div className="w-[48px] h-8 flex items-center justify-center border-r border-border-base flex-shrink-0">
                    <input type="checkbox" className="custom-checkbox" disabled />
                  </div>
                  
                  {/* File column header */}
                  <div className="px-3 h-8 flex items-center border-r border-border-base flex-1" style={{ minWidth: '220px' }}>
                    <div className="flex items-center gap-1">
                      <FileIcon />
                      <span className="text-xs font-medium text-fg-subtle">File</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add file row */}
              <div className="border-b border-border-base bg-bg-base hover:bg-bg-base-hover transition-colors cursor-pointer">
                <div className="flex items-center" style={{ height: '32px' }}>
                  {/* Plus icon in checkbox column */}
                  <div className="w-[48px] h-full flex items-center justify-center border-r border-border-base flex-shrink-0 text-fg-subtle">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  {/* Add file text */}
                  <div className="px-3 h-full flex items-center" style={{ width: '220px' }}>
                    <div className="flex items-center gap-1.5 text-fg-subtle">
                      <SvgIcon 
                        src="/central_icons/Add File.svg" 
                        alt="Add file" 
                        width={14} 
                        height={14}
                        className="text-fg-subtle"
                      />
                      <span className="font-medium" style={{ fontSize: '12px' }}>Add file</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Centered empty state content */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ top: '88px' }}>
                <div className="flex flex-col items-center" style={{ maxWidth: '420px' }}>
                  {/* Review Icon */}
                  <div>
                    <SvgIcon 
                      src="/central_icons/Review.svg" 
                      alt="Review" 
                      width={24} 
                      height={24} 
                      className="text-fg-muted" 
                    />
                  </div>
                  
                  {/* Heading */}
                  <h3 className="text-base font-medium text-fg-base mb-0.5">
                    Add documents to get started
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-fg-muted text-center mb-6" style={{ lineHeight: '20px' }}>
                    Upload files to run multiple queries at once — analyze, compare, and extract insights with Harvey’s purpose-built platform.
                  </p>
                  
                  {/* Upload Button */}
                  <button 
                    className="h-8 flex items-center justify-center gap-2 px-3 bg-button-inverted text-fg-on-color rounded-[8px] hover:bg-button-inverted-hover active:bg-button-inverted-pressed transition-colors mb-4 text-sm font-normal"
                  >
                    Upload files
                  </button>
                  
                  {/* Divider Text */}
                  <p className="text-xs text-fg-muted mb-4">Or choose from</p>
                  
                  {/* Integration Options */}
                  <div className="flex items-center gap-2">
                    <button 
                      className="h-8 flex items-center gap-2 px-3 border border-border-base rounded-[8px] bg-button-neutral hover:bg-button-neutral-hover active:bg-button-neutral-pressed transition-colors text-fg-base text-sm font-normal"
                    >
                      <SvgIcon 
                        src="/central_icons/Vault.svg" 
                        alt="Vault" 
                        width={16} 
                        height={16}
                        className="text-fg-base"
                      />
                      <span>Add from Vault</span>
                    </button>
                    
                    <button 
                      onClick={() => setIManageDialogOpen(true)}
                      className="h-8 flex items-center gap-2 px-3 border border-border-base rounded-[8px] bg-button-neutral hover:bg-button-neutral-hover active:bg-button-neutral-pressed transition-colors text-fg-base text-sm font-normal"
                    >
                      <Image 
                        src="/imanage.svg" 
                        alt="iManage" 
                        width={16} 
                        height={16}
                      />
                      <span>Add from iManage</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Table container */
            <div className="h-full relative">
              <div className={`absolute inset-0 ${isFilesOnlyMode ? 'overflow-x-hidden' : 'overflow-x-auto'} overflow-y-auto`}>
              <table 
              className={`border-separate border-spacing-0 ${
                table.getState().columnSizingInfo.isResizingColumn ? 'select-none' : ''
              }`} 
              style={{ width: table.getCenterTotalSize() }}
            >
              <colgroup>
                {table.getAllColumns().map((column) => (
                  <col 
                    key={column.id} 
                    style={{ 
                      width: column.getSize()
                    }} 
                  />
                ))}
              </colgroup>
              <thead className="sticky top-0 z-20 bg-bg-base">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        ref={header.id === 'fileName' ? fileColumnRef : undefined}
                        className={`px-3 h-8 text-left font-medium relative transition-colors text-fg-subtle ${
                          header.id === 'select' ? 'w-[48px]' : ''
                        } ${header.id === 'forceMajeureClause' ? 'w-[325px]' : ''} ${header.id === 'agreementParties' ? 'w-[325px]' : ''} ${header.id === 'assignmentProvisionSummary' ? 'w-[325px]' : ''} ${header.index !== 0 ? 'border-l border-border-base' : ''} ${header.index === headerGroup.headers.length - 1 ? 'border-r border-border-base' : ''} border-b border-border-base ${
                          header.column.columnDef.meta?.draggable && draggedColumn === header.id ? 'bg-bg-subtle' : 
                          header.column.columnDef.meta?.draggable && hoveredHeader === header.id ? 'bg-bg-subtle' : 'bg-bg-base'
                        } ${
                          header.column.columnDef.meta?.draggable ? 'cursor-grab active:cursor-grabbing' : ''
                        } ${
                          dropTarget === header.id && draggedColumn !== header.id ? 'border-l-2 border-l-border-interactive' : ''
                        } ${
                          header.index === headerGroup.headers.length - 1 && isFilesOnlyMode ? 'extend-border-line' : ''
                        }`}
                        style={{
                          fontSize: '12px',
                          lineHeight: '16px',
                          width: header.column.getSize(),
                          position: 'relative'
                        }}
                        draggable={header.column.columnDef.meta?.draggable}
                        onMouseEnter={() => {
                          if (header.column.columnDef.meta?.draggable) {
                            setHoveredHeader(header.id);
                          }
                        }}
                        onMouseLeave={() => setHoveredHeader(null)}
                        onDragStart={(e) => {
                          if (header.column.columnDef.meta?.draggable) {
                            setDraggedColumn(header.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }
                        }}
                        onDragEnd={() => {
                          setDraggedColumn(null);
                          setDropTarget(null);
                        }}
                        onDragOver={(e) => {
                          if (header.column.columnDef.meta?.draggable && draggedColumn && draggedColumn !== header.id) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setDropTarget(header.id);
                          }
                        }}
                        onDragLeave={() => {
                          if (dropTarget === header.id) {
                            setDropTarget(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDropTarget(null);
                          if (!draggedColumn || draggedColumn === header.id || !header.column.columnDef.meta?.draggable) return;
                          
                          const draggedColumnIndex = table.getAllColumns().findIndex(col => col.id === draggedColumn);
                          const targetColumnIndex = table.getAllColumns().findIndex(col => col.id === header.id);
                          
                          if (draggedColumnIndex !== -1 && targetColumnIndex !== -1) {
                            const newColumnOrder = [...table.getAllColumns().map(col => col.id)];
                            const [removed] = newColumnOrder.splice(draggedColumnIndex, 1);
                            newColumnOrder.splice(targetColumnIndex, 0, removed);
                            setColumnOrder(newColumnOrder);
                          }
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 cursor-col-resize select-none touch-none group`}
                            style={{
                              width: '4px',
                              height: '100%',
                              transform: 'translateX(50%)',
                              zIndex: 10,
                            }}
                          >
                            {/* Visual line that appears on hover or when resizing */}
                            <div
                              className={`absolute left-1/2 top-0 h-full transition-opacity ${
                                header.column.getIsResizing() 
                                  ? 'bg-bg-interactive opacity-100' 
                                  : 'bg-fg-disabled opacity-0 group-hover:opacity-100'
                              }`}
                              style={{
                                width: '1.5px',
                                transform: 'translateX(-50%)',
                              }}
                            />
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, rowIndex) => {
                  const isRowSelected = selectedRows.has(row.original.id);
                  const isRowHovered = hoveredRow === row.original.id;
                  return (
                    <tr 
                      key={row.id}
                      onMouseEnter={() => setHoveredRow(row.original.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className="transition-colors"
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => {
                        const shouldAnimate =
                          cell.column.id !== 'select' &&
                          cell.column.id !== 'fileName';
                        const cellPadding =
                          cell.column.id === 'fileName' ? 'px-3' : 'px-3';
                        const isSelectColumn = cell.column.id === 'select';
                        return (
                        <td
                          key={cell.id}
                          className={`${cellPadding} h-8 ${isRowSelected ? 'bg-bg-base-hover' : isRowHovered ? 'bg-bg-base-hover' : 'bg-bg-base'} ${cell.column.id === 'forceMajeureClause' ? 'w-[325px]' : ''} ${cell.column.id === 'agreementParties' ? 'w-[325px]' : ''} ${cell.column.id === 'assignmentProvisionSummary' ? 'w-[325px]' : ''} ${cell.column.id !== table.getAllColumns()[0].id ? 'border-l border-border-base' : ''} ${cellIndex === row.getVisibleCells().length - 1 ? 'border-r border-border-base' : ''} border-b border-border-base relative ${cellIndex === row.getVisibleCells().length - 1 && isFilesOnlyMode ? 'extend-border-line' : 'overflow-hidden'} ${isSelectColumn ? 'cursor-pointer' : ''}`}
                          style={{ 
                            fontSize: '12px', 
                            lineHeight: '16px',
                            verticalAlign: getVerticalAlign(),
                            width: cell.column.getSize()
                          }}
                        >
                          {/* Active border overlay for fileName cell */}
                          {cell.column.id === 'fileName' && manageGroupedFilesRowId === row.original.id && (
                            <div 
                              className="absolute inset-0 pointer-events-none border-border-interactive rounded-md"
                              style={{ 
                                border: '1.5px solid',
                                borderRadius: '6px'
                              }}
                            />
                          )}
                          <AnimatedCell
                            rowIndex={rowIndex}
                            columnIndex={cellIndex}
                            shouldAnimate={shouldAnimate}
                            cellPadding={cellPadding}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </AnimatedCell>
                          {/* Hover detection area extending to the right for files-only mode */}
                          {cellIndex === row.getVisibleCells().length - 1 && isFilesOnlyMode && (
                            <div 
                              className="absolute top-0 bottom-0 cursor-default"
                              style={{ 
                                left: '100%',
                                width: '100vw',
                              }}
                              onMouseEnter={() => setHoveredRow(row.original.id)}
                              onMouseLeave={() => setHoveredRow(null)}
                            />
                          )}
                        </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
              </div>
            </div>
          )}
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
      <IManageFilePickerDialog
        isOpen={iManageDialogOpen}
        onClose={() => setIManageDialogOpen(false)}
        onFilesSelected={(files) => {
          onFilesSelected?.(files);
        }}
      />
      
      {/* Action Bar */}
      <ReviewTableActionBar
        selectedCount={selectedRows.size}
        onClearSelection={clearSelection}
        onAssignTo={() => console.log('Assign to')}
        onGroupFiles={handleGroupFiles}
        onOpenInAssistant={() => console.log('Open in Assistant')}
        onDelete={() => console.log('Delete')}
        onExport={() => console.log('Export')}
      />
      
      {/* Manage Grouped Files Popover */}
      {manageGroupedFilesRowId !== null && (
        <ManageGroupedFilesPopover
          isOpen={true}
          onClose={() => {
            setManageGroupedFilesRowId(null);
            setManageGroupedFilesAnchor(null);
          }}
          anchorElement={manageGroupedFilesAnchor}
          parentFileName={
            data.find(row => row.id === manageGroupedFilesRowId)?.fileName || ''
          }
          groupedCount={
            data.find(row => row.id === manageGroupedFilesRowId)?.groupedCount || 0
          }
          onRemoveFile={(index) => {
            console.log('Remove file at index:', index);
            // TODO: Implement remove file from group
          }}
        />
      )}
      
      {/* Add Column Popover */}
      {addColumnPopoverOpen && (
        <div 
          className="fixed inset-0 z-50"
          onClick={() => setAddColumnPopoverOpen(false)}
        >
          <div 
            className="fixed bg-bg-base border border-border-base"
            style={{ 
              width: '400px',
              top: addColumnPopoverPosition.top,
              left: addColumnPopoverPosition.left,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
              borderRadius: '10px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header label */}
            <div style={{ padding: '8px 12px', paddingTop: '10px' }}>
              <p className="text-fg-muted" style={{ fontSize: '12px' }}>
                Get started by asking Harvey a question.
              </p>
            </div>
            
            {/* Question textarea container */}
            <div style={{ padding: '0 4px' }}>
              <div className="relative">
                <textarea
                  value={columnQuestion}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  placeholder="What is the signing date of this agreement?"
                  className="w-full bg-bg-subtle rounded-[8px] p-3 text-fg-base placeholder:text-fg-muted resize-none outline-none focus:ring-1 focus:ring-border-interactive text-sm"
                  style={{ 
                    minHeight: '120px',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            </div>
            
            {/* Expanded section - shows when user has started typing */}
            {hasStartedTyping && (
              <>
                <div className="border-t border-border-base" />
                {/* Helper text */}
                <div style={{ padding: '8px 12px' }}>
                  <p className="text-fg-muted" style={{ fontSize: '12px' }}>
                    Header and type are generated based on your question.
                  </p>
                </div>
                  
                {/* Bottom section with header input, type and model selectors */}
                <div className="flex flex-col" style={{ padding: '2px 0', gap: '2px' }}>
                  {/* Header input */}
                  <div style={{ padding: '0 4px' }}>
                    <div>
                      {isGeneratingHeader ? (
                        <div className="bg-bg-subtle rounded-[8px] animate-pulse" style={{ height: '32px' }} />
                      ) : (
                        <input
                          type="text"
                          value={columnHeader}
                          onChange={(e) => setColumnHeader(e.target.value)}
                          placeholder="Column header"
                          className="w-full px-3 bg-bg-subtle rounded-[8px] text-fg-base placeholder:text-fg-muted outline-none focus:ring-1 focus:ring-border-interactive text-sm"
                          style={{ height: '32px', fontSize: '14px' }}
                        />
                      )}
                    </div>
                  </div>
                    
                  {/* Type selector */}
                  <div style={{ padding: '0 4px' }}>
                    <button className="w-full flex items-center justify-between px-2 py-2 rounded-[8px] hover:bg-bg-subtle-hover transition-colors">
                      <span className="text-fg-subtle font-medium" style={{ fontSize: '12px' }}>Type</span>
                      {isGeneratingHeader ? (
                        <div className="h-5 w-28 bg-bg-subtle rounded animate-pulse" />
                      ) : (
                        <div className="flex items-center gap-2 text-fg-base">
                          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-fg-subtle">
                            <path d="M3 4.5H15M3 9H15M3 13.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-sm">Free response</span>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-fg-muted">
                            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                    
                  {/* Model selector */}
                  <div style={{ padding: '0 4px' }}>
                    <DropdownMenu open={modelDropdownOpen} onOpenChange={setModelDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <button className={`w-full flex items-center justify-between px-2 py-2 rounded-[8px] hover:bg-bg-subtle-hover transition-colors ${modelDropdownOpen ? 'bg-bg-subtle-hover' : ''}`}>
                          <span className="text-fg-subtle font-medium" style={{ fontSize: '12px' }}>Model</span>
                          <div className="flex items-center gap-2 text-fg-base">
                            <Image 
                              src="/central_icons/Harvey Auto.svg" 
                              alt="Harvey Auto" 
                              width={24} 
                              height={24}
                            />
                            <span className="text-sm">
                              {selectedModel === 'auto' && 'Auto'}
                              {selectedModel === 'gpt4' && 'GPT-5.1 with Harvey'}
                              {selectedModel === 'claude' && 'Claude 4.5 Sonnet with Harvey'}
                              {selectedModel === 'gemini' && 'Gemini 3 with Harvey'}
                            </span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-fg-muted">
                              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-[320px] p-1">
                        {/* Auto option */}
                        <button
                          className={`w-full flex items-center gap-3 px-2 py-3 rounded-md hover:bg-bg-subtle-hover transition-colors ${selectedModel === 'auto' ? 'bg-bg-subtle' : ''}`}
                          onClick={() => { setSelectedModel('auto'); setModelDropdownOpen(false); }}
                        >
                          <div className="w-5 flex items-center justify-center">
                            {selectedModel === 'auto' && <Check className="w-4 h-4 text-fg-base" />}
                          </div>
                          <Image 
                            src="/central_icons/Harvey Auto.svg" 
                            alt="Harvey Auto" 
                            width={32} 
                            height={32}
                          />
                          <div className="flex flex-col items-start text-left">
                            <span className="text-fg-base font-medium text-sm">Auto</span>
                            <span className="text-fg-muted" style={{ fontSize: '12px' }}>Use the best model available</span>
                          </div>
                        </button>
                        
                        <DropdownMenuSeparator />
                        
                        {/* GPT-5.1 with Harvey */}
                        <button
                          className={`w-full flex items-center gap-3 px-2 py-3 rounded-md hover:bg-bg-subtle-hover transition-colors ${selectedModel === 'gpt4' ? 'bg-bg-subtle' : ''}`}
                          onClick={() => { setSelectedModel('gpt4'); setModelDropdownOpen(false); }}
                        >
                          <div className="w-5 flex items-center justify-center">
                            {selectedModel === 'gpt4' && <Check className="w-4 h-4 text-fg-base" />}
                          </div>
                          <Image 
                            src="/central_icons/Harvey ChatGPT.svg" 
                            alt="GPT-5.1" 
                            width={32} 
                            height={32}
                          />
                          <div className="flex flex-col items-start text-left">
                            <span className="text-fg-base font-medium text-sm">GPT-5.1 with Harvey</span>
                            <span className="text-fg-muted" style={{ fontSize: '12px' }}>OpenAI&apos;s latest model</span>
                          </div>
                        </button>
                        
                        {/* Claude 4.5 Sonnet with Harvey */}
                        <button
                          className={`w-full flex items-center gap-3 px-2 py-3 rounded-md hover:bg-bg-subtle-hover transition-colors ${selectedModel === 'claude' ? 'bg-bg-subtle' : ''}`}
                          onClick={() => { setSelectedModel('claude'); setModelDropdownOpen(false); }}
                        >
                          <div className="w-5 flex items-center justify-center">
                            {selectedModel === 'claude' && <Check className="w-4 h-4 text-fg-base" />}
                          </div>
                          <Image 
                            src="/central_icons/Harvey Anthropic.svg" 
                            alt="Claude" 
                            width={32} 
                            height={32}
                          />
                          <div className="flex flex-col items-start text-left">
                            <span className="text-fg-base font-medium text-sm">Claude 4.5 Sonnet with Harvey</span>
                            <span className="text-fg-muted" style={{ fontSize: '12px' }}>Anthropic&apos;s advanced reasoning model</span>
                          </div>
                        </button>
                        
                        {/* Gemini 3 with Harvey */}
                        <button
                          className={`w-full flex items-center gap-3 px-2 py-3 rounded-md hover:bg-bg-subtle-hover transition-colors ${selectedModel === 'gemini' ? 'bg-bg-subtle' : ''}`}
                          onClick={() => { setSelectedModel('gemini'); setModelDropdownOpen(false); }}
                        >
                          <div className="w-5 flex items-center justify-center">
                            {selectedModel === 'gemini' && <Check className="w-4 h-4 text-fg-base" />}
                          </div>
                          <Image 
                            src="/central_icons/Harvey Google.svg" 
                            alt="Gemini" 
                            width={32} 
                            height={32}
                          />
                          <div className="flex flex-col items-start text-left">
                            <span className="text-fg-base font-medium text-sm">Gemini 3 with Harvey</span>
                            <span className="text-fg-muted" style={{ fontSize: '12px' }}>Google&apos;s advanced reasoning model</span>
                          </div>
                        </button>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Footer text */}
                        <div className="px-2 py-3">
                          <p className="text-fg-muted" style={{ fontSize: '12px' }}>
                            Generates a response using the selected model augmented with Harvey&apos;s proprietary enhancements.
                          </p>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </>
            )}
            
            {/* Footer */}
            <div className="border-t border-border-base flex items-center justify-between" style={{ padding: '8px 12px' }}>
              <Button 
                variant="secondary"
                size="small"
                onClick={() => setAddColumnPopoverOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                size="small"
                disabled={columnQuestion.length === 0 || columnHeader.length === 0 || isGeneratingHeader}
              >
                Run column
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}