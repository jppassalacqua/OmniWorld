
import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, FileText, Map as MapIcon, Users, Sparkles, MessageSquare, Calendar, Hash } from 'lucide-react';
import { WorldState, Entity, WikiPage, WorldMap, Scenario, Session, Timeline } from '../types';
import { getLocalized } from '../utils/helpers';
import { THEME } from '../styles/theme';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    world: WorldState;
    onNavigate: (view: string, id: string) => void;
}

export const CommandPalette = ({ isOpen, onClose, world, onNavigate }: CommandPaletteProps) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Filter and flat list of all navigable items
    const items = React.useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        const lang = world.language;

        const results: { id: string, label: string, type: string, view: string, icon: any }[] = [];

        // Entities
        world.entities.forEach(e => {
            const name = getLocalized(e.name, lang);
            if (name.toLowerCase().includes(q)) {
                results.push({ id: e.id, label: name, type: e.type, view: 'entities', icon: Users });
            }
        });

        // Wiki
        world.wikiPages.forEach(p => {
            const title = getLocalized(p.title, lang);
            if (title.toLowerCase().includes(q)) {
                results.push({ id: p.id, label: title, type: 'Wiki', view: 'wiki', icon: FileText });
            }
        });

        // Maps
        world.maps.forEach(m => {
            if (m.name.toLowerCase().includes(q)) {
                results.push({ id: m.id, label: m.name, type: 'Map', view: 'maps', icon: MapIcon });
            }
        });

        // Scenarios
        world.scenarios.forEach(s => {
            const title = getLocalized(s.title, lang);
            if (title.toLowerCase().includes(q)) {
                results.push({ id: s.id, label: title, type: 'Scenario', view: 'scenarios', icon: Sparkles });
            }
        });

        return results.slice(0, 50); // Limit results
    }, [query, world]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        // Scroll selected item into view
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % items.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + items.length) % items.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (items[selectedIndex]) {
                handleSelect(items[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (item: typeof items[0]) => {
        onNavigate(item.view, item.id);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-100" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <Search className="text-slate-500" size={20}/>
                    <input 
                        ref={inputRef}
                        className="bg-transparent text-xl text-white placeholder:text-slate-600 outline-none flex-1 font-medium"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex gap-2">
                        <kbd className="hidden sm:inline-block px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 font-mono border border-slate-700">ESC</kbd>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2" ref={listRef}>
                    {items.length === 0 && query && (
                        <div className="p-8 text-center text-slate-500">No results found for "{query}"</div>
                    )}
                    {items.length === 0 && !query && (
                        <div className="p-8 text-center text-slate-600">
                             <div className="flex justify-center gap-4 mb-2">
                                 <span className="flex items-center gap-1"><Users size={12}/> Entities</span>
                                 <span className="flex items-center gap-1"><MapIcon size={12}/> Maps</span>
                                 <span className="flex items-center gap-1"><FileText size={12}/> Wiki</span>
                             </div>
                             <p className="text-sm">Start typing to jump to any content.</p>
                        </div>
                    )}
                    {items.map((item, idx) => (
                        <button
                            key={`${item.view}-${item.id}`}
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${idx === selectedIndex ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${idx === selectedIndex ? 'bg-white/20' : 'bg-slate-800 text-slate-500'}`}>
                                <item.icon size={16}/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate">{item.label}</div>
                                <div className={`text-xs truncate ${idx === selectedIndex ? 'text-indigo-200' : 'text-slate-500'}`}>{item.type} • {item.view}</div>
                            </div>
                            {idx === selectedIndex && <CornerDownLeft size={16} className="text-white/50"/>}
                        </button>
                    ))}
                </div>
                
                <div className="p-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between px-4">
                    <span><strong>↑↓</strong> to navigate</span>
                    <span><strong>Enter</strong> to select</span>
                </div>
            </div>
        </div>
    );
};

// Simple icon for selection visual
const CornerDownLeft = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="9 10 4 15 9 20" />
        <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
);
