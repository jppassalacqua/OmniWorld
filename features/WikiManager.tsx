
import React, { useState, useMemo } from 'react';
import { BookOpen, PlusCircle, Search, Trash2, Link as LinkIcon, Wand2, Download, Sparkles, X, ArrowLeftCircle, FileText, Eye, Edit3 } from 'lucide-react';
import { ResizableSplitPane, TreeItem, TreeNode, RichTextEditor, TagInput } from '../components/Shared';
import { useWikiController } from '../hooks/useWikiController';
import { THEME } from '../styles/theme';
import { getLocalized } from '../utils/helpers';
import { downloadWikiMarkdown } from '../utils/exportBridge';

export const WikiManager = ({ world, setWorld, aiService, initialSelectedId }: any) => {
    const ctrl = useWikiController(world, setWorld, initialSelectedId);
    const [showGenModal, setShowGenModal] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

    // Collect all existing tags for suggestions
    const allTags = useMemo(() => Array.from(new Set(world.wikiPages.flatMap((p: any) => p.tags))) as string[], [world.wikiPages]);

    // Simple markdown renderer for preview
    const renderMarkdown = (text: string) => {
        if (!text) return <p className="text-slate-600 italic">Empty page.</p>;
        
        return text.split('\n').map((line, idx) => {
            if (line.startsWith('# ')) return <h1 key={idx} className="text-3xl font-bold text-white mb-4 mt-6">{line.substring(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-white mb-3 mt-5">{line.substring(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-indigo-300 mb-2 mt-4">{line.substring(4)}</h3>;
            if (line.startsWith('> ')) return <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-1 my-4 text-slate-400 italic bg-slate-800/50 rounded-r">{line.substring(2)}</blockquote>;
            if (line.startsWith('- ')) return <li key={idx} className="ml-4 list-disc text-slate-300 my-1">{line.substring(2)}</li>;
            if (line.startsWith('---')) return <hr key={idx} className="border-slate-800 my-6"/>;
            if (line.trim() === '') return <div key={idx} className="h-4"/>;
            
            const parts = line.split(/(\[.*?\]\(.*?\))/g);
            return (
                <p key={idx} className="text-slate-300 leading-relaxed mb-2">
                    {parts.map((part, i) => {
                        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                        if (linkMatch) {
                            const [_, label, url] = linkMatch;
                            const isInternal = url.startsWith('entity:') || url.startsWith('wiki:');
                            return (
                                <span 
                                    key={i} 
                                    className={`cursor-pointer underline decoration-indigo-500/50 hover:decoration-indigo-500 ${isInternal ? 'text-indigo-300' : 'text-blue-400'}`}
                                    onClick={() => {
                                        if (url.startsWith('entity:')) {
                                            console.log("Nav to entity", url.split(':')[1]);
                                        } else if (url.startsWith('wiki:')) {
                                            ctrl.setSelectedPageId(url.split(':')[1]);
                                        } else {
                                            window.open(url, '_blank');
                                        }
                                    }}
                                >
                                    {label}
                                </span>
                            );
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <>
            <ResizableSplitPane
                initialLeftWidth={300}
                className={THEME.layout.splitPane}
                left={
                    <div className={THEME.layout.sidebar}>
                        <div className={THEME.layout.sidebarHeader}>
                            <div className="flex justify-between items-center">
                                <span className={THEME.text.header}>Wiki</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setShowGenModal(true)} className={THEME.button.icon} title="Generate Lore Bible"><Sparkles size={16}/></button>
                                    <button onClick={ctrl.handleCreate} className={THEME.button.icon} title="New Page"><PlusCircle size={16}/></button>
                                </div>
                            </div>
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-2 text-slate-500" />
                                <input value={ctrl.search} onChange={e=>ctrl.setSearch(e.target.value)} placeholder="Search..." className={THEME.input.search} />
                            </div>
                        </div>
                        <div className={THEME.layout.sidebarContent}>
                             {ctrl.wikiTree.map((node: any) => (
                                <TreeItem 
                                    key={node.id} 
                                    node={node} 
                                    level={0} 
                                    selectedId={ctrl.selectedPageId} 
                                    onSelect={(n: TreeNode) => ctrl.setSelectedPageId(n.id)} 
                                    expandedIds={ctrl.expandedIds} 
                                    toggleExpand={ctrl.toggleExpand} 
                                />
                             ))}
                        </div>
                    </div>
                }
                right={
                    ctrl.selectedPage ? (
                        <div className="h-full flex flex-col p-6 overflow-hidden">
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <input className={THEME.input.title} value={getLocalized(ctrl.selectedPage.title, world.language)} onChange={e => ctrl.updatePage({...ctrl.selectedPage, title: {...ctrl.selectedPage.title, [world.language]: e.target.value}})} />
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')} className={THEME.button.secondary} title={viewMode === 'edit' ? "Preview" : "Edit"}>
                                        {viewMode === 'edit' ? <Eye size={18}/> : <Edit3 size={18}/>}
                                    </button>
                                    <button onClick={() => downloadWikiMarkdown(ctrl.selectedPage, world.language)} className={THEME.button.secondary} title="Export Markdown"><Download size={18}/></button>
                                    {viewMode === 'edit' && (
                                        <>
                                            <button onClick={() => ctrl.handleSummarize(aiService)} disabled={ctrl.isSummarizing} className={THEME.button.secondary} title="AI Summary">
                                                {ctrl.isSummarizing ? <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"/> : <Wand2 size={18}/>}
                                            </button>
                                            <button onClick={ctrl.autoLinkPage} className={THEME.button.secondary} title="Auto-Link Entities"><LinkIcon size={18}/></button>
                                        </>
                                    )}
                                    <button onClick={() => ctrl.handleDelete(ctrl.selectedPage.id)} className={THEME.button.danger}><Trash2 size={20}/></button>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-h-0 relative border border-slate-800 rounded-lg bg-slate-900/50 p-4 flex flex-col overflow-hidden">
                                 {viewMode === 'edit' ? (
                                     <RichTextEditor 
                                        value={getLocalized(ctrl.selectedPage.content, world.language)} 
                                        onChange={val => ctrl.updatePage({...ctrl.selectedPage, content: {...ctrl.selectedPage.content, [world.language]: val}})}
                                        entities={world.entities}
                                        pages={world.wikiPages}
                                        lang={world.language}
                                        className="flex-1"
                                     />
                                 ) : (
                                     <div className="flex-1 overflow-y-auto pr-2">
                                         <div className="prose prose-invert max-w-none">
                                            {renderMarkdown(getLocalized(ctrl.selectedPage.content, world.language))}
                                         </div>
                                     </div>
                                 )}
                                 
                                 {ctrl.backlinks && ctrl.backlinks.length > 0 && (
                                     <div className="mt-4 pt-4 border-t border-slate-800 flex-shrink-0">
                                         <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><LinkIcon size={12}/> Linked Mentions</h4>
                                         <div className="flex flex-wrap gap-2">
                                             {ctrl.backlinks.map((link: any) => (
                                                 <button 
                                                    key={link.id}
                                                    onClick={() => link.type === 'page' && ctrl.setSelectedPageId(link.id)}
                                                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 border transition-colors ${link.type === 'page' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500' : 'bg-slate-900 border-transparent text-slate-500 cursor-default'}`}
                                                 >
                                                     {link.type === 'page' ? <FileText size={10}/> : <ArrowLeftCircle size={10}/>}
                                                     {link.name}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                            </div>
                            <div className="mt-4 shrink-0">
                                <label className={THEME.text.label}>Tags</label>
                                <TagInput tags={ctrl.selectedPage.tags} onChange={tags => ctrl.updatePage({...ctrl.selectedPage, tags})} suggestions={allTags} />
                            </div>
                        </div>
                    ) : <div className={THEME.layout.emptyState}><BookOpen size={64} className="mb-4 opacity-20"/><p>Select a page.</p></div>
                }
            />
            
            {showGenModal && (
                <LoreGenerationModal 
                    onClose={() => setShowGenModal(false)} 
                    onGenerate={(genre: string, topics: string[]) => {
                        ctrl.handleGenerateLore(aiService, genre, topics);
                        setShowGenModal(false);
                    }}
                    isGenerating={ctrl.isGeneratingLore}
                />
            )}
        </>
    );
};

const LoreGenerationModal = ({ onClose, onGenerate, isGenerating }: any) => {
    const [genre, setGenre] = useState('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>(['History', 'Geography']);
    
    const TOPICS = ['History', 'Geography', 'Magic/Technology', 'Factions', 'Religion', 'Economy', 'Culture'];

    const toggleTopic = (t: string) => {
        setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    };

    return (
        <div className={THEME.layout.modalOverlay} onClick={onClose}>
            <div className={THEME.layout.modalContent} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="text-indigo-500"/> Generate World Bible</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white"/></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className={THEME.text.label}>Genre / Vibe</label>
                        <input 
                            className={THEME.input.base} 
                            placeholder="e.g. Grimdark Fantasy, Cyberpunk Noir, Solar Punk..." 
                            value={genre}
                            onChange={e => setGenre(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className={THEME.text.label}>Sections to Generate</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {TOPICS.map(topic => (
                                <button 
                                    key={topic}
                                    onClick={() => toggleTopic(topic)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedTopics.includes(topic) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className={THEME.button.secondary}>Cancel</button>
                    <button 
                        onClick={() => onGenerate(genre, selectedTopics)} 
                        disabled={!genre || selectedTopics.length === 0 || isGenerating}
                        className={THEME.button.primary}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Content'}
                    </button>
                </div>
            </div>
        </div>
    );
};
