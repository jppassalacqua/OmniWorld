
import React, { useState, useRef, useEffect } from 'react';

interface ResizableSplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
    initialLeftWidth?: number;
    minLeftWidth?: number;
    maxLeftWidth?: number;
    className?: string;
}

export const ResizableSplitPane = ({ 
    left, 
    right, 
    initialLeftWidth = 300, 
    minLeftWidth = 200, 
    maxLeftWidth = 800,
    className = ""
}: ResizableSplitPaneProps) => {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = e.clientX - containerRect.left;
            setLeftWidth(Math.max(minLeftWidth, Math.min(newWidth, maxLeftWidth)));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minLeftWidth, maxLeftWidth]);

    return (
        <div ref={containerRef} className={`flex h-full w-full overflow-hidden ${className}`}>
            <div style={{ width: leftWidth }} className="flex-shrink-0 h-full overflow-hidden flex flex-col relative border-r border-slate-800 transition-[width] duration-0 will-change-[width]">
                {left}
            </div>
            <div 
                className={`w-1 hover:w-1.5 bg-slate-900 hover:bg-indigo-500 cursor-col-resize transition-all z-20 flex items-center justify-center flex-shrink-0 relative group ${isDragging ? 'bg-indigo-500 w-1.5 delay-0 duration-0' : 'delay-100 duration-300'}`}
                onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
            >
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-0.5 h-4 bg-white/50 rounded-full"/>
               </div>
            </div>
            <div className="flex-1 h-full overflow-hidden min-w-0 flex flex-col relative">
                {right}
            </div>
        </div>
    );
};
