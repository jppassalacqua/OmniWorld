
import React from 'react';
import { Globe2, Play, Plus, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import { ResizableSplitPane, TreeItem, TreeNode } from '../components/Shared';
import { THEME } from '../styles/theme';

interface DashboardProps {
    worlds: any[];
    selectedDashboardWorldId: string | null;
    setSelectedDashboardWorldId: (id: string | null) => void;
    worldTree: TreeNode[];
    expandedWorldIds: string[];
    setExpandedWorldIds: (ids: string[]) => void;
    handleCreate: (parentId?: string) => void;
    handleLoad: (id: string) => void;
    handleDelete: (id: string) => void;
    onOpenSettings?: () => void;
    t: (key: string) => string;
}

export const Dashboard = ({
    worlds,
    selectedDashboardWorldId,
    setSelectedDashboardWorldId,
    worldTree,
    expandedWorldIds,
    setExpandedWorldIds,
    handleCreate,
    handleLoad,
    handleDelete,
    onOpenSettings,
    t
}: DashboardProps) => {
    
    const displayedWorlds = worlds.filter(w => w.parentId === (selectedDashboardWorldId || undefined));
    const selectedDashboardWorld = worlds.find(w => w.id === selectedDashboardWorldId);

    const toggleExpand = (id: string) => {
        setExpandedWorldIds(expandedWorldIds.includes(id) 
            ? expandedWorldIds.filter(x => x !== id) 
            : [...expandedWorldIds, id]
        );
    };

    return (
        <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
            <div className="flex-1 overflow-hidden">
                <ResizableSplitPane
                    initialLeftWidth={300}
                    className="h-full"
                    left={
                        <div className={THEME.layout.sidebar}>
                            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30"><Globe2 size={20} className="text-white"/></div>
                                <span className="font-bold text-white text-lg">OmniWorld</span>
                            </div>
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                <h3 className={THEME.text.header + " mb-2"}>My Worlds</h3>
                                <button onClick={() => setSelectedDashboardWorldId(null)} className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${selectedDashboardWorldId === null ? 'bg-indigo-900/30 text-indigo-200 border border-indigo-500/30' : 'text-slate-400 hover:text-white border border-transparent'}`}>
                                    <Globe2 size={16}/> Root (All Worlds)
                                </button>
                            </div>
                            <div className={THEME.layout.sidebarContent}>
                                {worldTree.map(node => (
                                    <TreeItem 
                                        key={node.id} 
                                        node={node} 
                                        level={0} 
                                        selectedId={selectedDashboardWorldId} 
                                        onSelect={(n) => setSelectedDashboardWorldId(n.id)} 
                                        expandedIds={expandedWorldIds} 
                                        toggleExpand={toggleExpand} 
                                    />
                                ))}
                            </div>
                            <div className="p-4 border-t border-slate-800 bg-slate-900">
                                <button onClick={() => handleCreate(selectedDashboardWorldId || undefined)} className={THEME.button.primary + " w-full justify-center"}>
                                    <PlusCircle size={18}/> {selectedDashboardWorldId ? "Create Sub-World" : "Create New World"}
                                </button>
                            </div>
                        </div>
                    }
                    right={
                        <div className="h-full bg-slate-950 flex flex-col overflow-y-auto">
                            <div className={THEME.layout.container}>
                                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-8">
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                            <button onClick={() => setSelectedDashboardWorldId(null)} className="hover:text-white transition-colors">Root</button>
                                            {selectedDashboardWorld && (
                                                <>
                                                    <ChevronRight size={14}/>
                                                    <span className="text-indigo-400 font-bold">{selectedDashboardWorld.name}</span>
                                                </>
                                            )}
                                        </div>
                                        <h1 className={THEME.text.h1}>{selectedDashboardWorld ? selectedDashboardWorld.name : "All Worlds"}</h1>
                                        {selectedDashboardWorld && <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed">{selectedDashboardWorld.description}</p>}
                                    </div>
                                    {selectedDashboardWorld && (
                                        <button onClick={() => handleLoad(selectedDashboardWorld.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:-translate-y-0.5">
                                            <Play size={20}/> Load World
                                        </button>
                                    )}
                                </div>

                                <div className={THEME.layout.grid}>
                                    {displayedWorlds.map(w => (
                                        <div key={w.id} 
                                             onClick={() => setSelectedDashboardWorldId(w.id)} 
                                             className={THEME.card.base}
                                        >
                                            <div className={THEME.card.header}>
                                                <div className={THEME.card.icon}>
                                                    <Globe2 size={20}/>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                    <button onClick={(e) => { e.stopPropagation(); handleLoad(w.id); }} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-lg shadow-emerald-500/20" title="Load"><Play size={14}/></button>
                                                </div>
                                            </div>
                                            <h3 className={THEME.card.title}>{w.name}</h3>
                                            <p className={THEME.card.body}>{w.description}</p>
                                            <div className={THEME.card.footer}>
                                                <span>{new Date(w.lastPlayed).toLocaleDateString()}</span>
                                                <button onClick={(e) => { e.stopPropagation(); if(confirm(t('world.delete_confirm'))) { handleDelete(w.id); }}} className="p-2 hover:bg-red-900/20 hover:text-red-400 rounded transition-colors"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {displayedWorlds.length === 0 && (
                                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                                            <Globe2 size={64} className="mb-6 opacity-20"/>
                                            <p className="text-lg font-medium mb-2">No sub-worlds found in this location.</p>
                                            <p className="text-sm opacity-60">Start by creating a new world or selecting another folder.</p>
                                            <button onClick={() => handleCreate(selectedDashboardWorldId || undefined)} className="mt-6 text-indigo-400 hover:text-white font-bold flex items-center gap-2 px-6 py-3 rounded-xl border border-indigo-500/30 hover:bg-indigo-500/10 transition-all">
                                                <Plus size={18}/> Create New World
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
};
