
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, CornerDownRight } from 'lucide-react';
import { TreeNode } from '../types';

interface TreeItemProps {
    node: TreeNode;
    level: number;
    selectedId: string | null;
    onSelect: (node: TreeNode) => void;
    expandedIds: string[];
    toggleExpand: (id: string) => void;
    // Drag & Drop props
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent, node: TreeNode) => void;
    onDrop?: (e: React.DragEvent, targetNode: TreeNode) => void;
}

export const TreeItem = ({ 
    node, 
    level, 
    selectedId, 
    onSelect, 
    expandedIds, 
    toggleExpand,
    draggable,
    onDragStart,
    onDrop
}: TreeItemProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedId === node.id;
  // Increase indentation for better visual hierarchy space
  const INDENT = 20; 
  
  const handleClick = (e: React.MouseEvent) => { 
      e.stopPropagation(); 
      if (node.type === 'folder' || (node.children && node.children.length > 0)) {
          toggleExpand(node.id); 
      }
      onSelect(node); 
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent) => {
      e.stopPropagation();
      if (draggable && onDragStart) {
          e.dataTransfer.setData('text/plain', node.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(e, node);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
      e.stopPropagation();
      if (draggable && onDrop) {
          setIsDragOver(true);
      }
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (draggable && onDrop) {
          onDrop(e, node);
      }
  };

  return (
    <div className="relative select-none">
      <div 
        onClick={handleClick} 
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
            flex items-center py-2 pr-3 cursor-pointer transition-all text-sm relative border-l-2
            ${isSelected 
                ? 'bg-indigo-900/40 text-white border-indigo-500' 
                : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }
            ${isDragOver ? 'bg-indigo-600/30 ring-1 ring-inset ring-indigo-400 z-20' : ''}
        `}
        style={{ paddingLeft: `${level * INDENT + 12}px` }}
      >
        {/* Visual Connector: Horizontal line pointing to item */}
        {level > 0 && (
            <div 
                className="absolute border-b border-l border-slate-700 rounded-bl-lg w-3 h-5 pointer-events-none opacity-50"
                style={{ 
                    left: `${(level - 1) * INDENT + 20}px`, // Align with parent's vertical line
                    top: '-10px' // Start from above to connect to previous sibling or parent
                }}
            />
        )}

        {/* Drag Feedback Indicator */}
        {isDragOver && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold text-indigo-200 bg-indigo-900/90 px-2 py-1 rounded-full border border-indigo-500/50 shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <CornerDownRight size={12} className="text-indigo-400"/> 
                <span>Move Inside</span>
            </div>
        )}

        {/* Expand/Collapse Icon */}
        <span className="mr-1.5 opacity-70 flex items-center justify-center w-5 h-5 rounded hover:bg-slate-700/50 transition-colors z-10">
            {(node.children && node.children.length > 0) 
                ? (isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>) 
                : <div className="w-4"/> // Spacer
            }
        </span>

        {/* Type Icon */}
        <span className={`mr-2.5 z-10 ${isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'}`}>
            {node.icon 
                ? <node.icon size={16} /> 
                : (node.type === 'folder' 
                    ? (isExpanded ? <FolderOpen size={16}/> : <Folder size={16}/>) 
                    : <FileText size={16}/>
                  )
            }
        </span>

        {/* Label */}
        <span className="truncate flex-1 font-medium z-10">{node.label}</span>
      </div>
      
      {/* Recursive Children */}
      {isExpanded && node.children && (
          <div className="relative">
              {/* Vertical Guide Line for Children Group */}
              <div 
                className="absolute w-px bg-slate-800" 
                style={{ 
                    left: `${(level * INDENT) + 20}px`, // Matches the indent calculation
                    top: '0',
                    bottom: '10px' // Stop short of the very bottom
                }} 
              />
              {node.children.map((child: TreeNode) => (
                <TreeItem 
                    key={child.id} 
                    node={child} 
                    level={level + 1} 
                    selectedId={selectedId} 
                    onSelect={onSelect} 
                    expandedIds={expandedIds} 
                    toggleExpand={toggleExpand}
                    draggable={draggable}
                    onDragStart={onDragStart}
                    onDrop={onDrop}
                />
              ))}
          </div>
      )}
    </div>
  );
};
