
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';
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
  const paddingLeft = `${level * 12 + 12}px`;
  
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
    <div>
      <div 
        onClick={handleClick} 
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
            flex items-center py-1.5 pr-2 cursor-pointer transition-colors text-sm select-none border-l-2
            ${isSelected 
                ? 'bg-indigo-900/30 text-white border-indigo-500' 
                : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }
            ${isDragOver ? 'bg-indigo-600/20 ring-1 ring-inset ring-indigo-500' : ''}
        `}
        style={{ paddingLeft }}
      >
        <span className="mr-1 opacity-70 flex items-center justify-center w-4">
            {(node.children && node.children.length > 0) 
                ? (isExpanded ? <ChevronDown size={12}/> : <ChevronRight size={12}/>) 
                : null
            }
        </span>
        <span className={`mr-2 ${isSelected ? 'text-indigo-400' : 'opacity-80'}`}>
            {node.icon 
                ? <node.icon size={14} /> 
                : (node.type === 'folder' 
                    ? (isExpanded ? <FolderOpen size={14}/> : <Folder size={14}/>) 
                    : <FileText size={14}/>
                  )
            }
        </span>
        <span className="truncate flex-1 font-medium">{node.label}</span>
      </div>
      
      {isExpanded && node.children && (
          <div className="relative">
              {level > 0 && <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800" style={{ left: `${(level * 12) + 18}px` }} />}
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
