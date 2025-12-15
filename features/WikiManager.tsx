
import React from 'react';
import { BookOpen, PlusCircle, Search, Trash2 } from 'lucide-react';
import { ResizableSplitPane, TreeItem, TreeNode, RichTextEditor, TagInput } from '../components/Shared';
import { useWikiController } from '../hooks/useWikiController';
import { THEME } from '../styles/theme';
import { getLocalized } from '../utils/helpers';

export const WikiManager = ({ world, setWorld, aiService }: any) => {
    const ctrl = useWikiController(world, setWorld);

    return (
        <ResizableSplitPane
            initialLeftWidth={300}
            className={THEME.layout.splitPane}
            left={
                <div className={THEME.layout.sidebar}>
                    <div className={THEME.layout.sidebarHeader}>
                        <div className="flex justify-between items-center"><span className={THEME.text.header}>Wiki</span><button onClick={ctrl.handleCreate} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                        <div className="relative"><Search size={14} className="absolute left-2.5 top-2 text-slate-500" /><input value={ctrl.search} onChange={e=>ctrl.setSearch(e.target.value)} placeholder="Search..." className={THEME.input.search} /></div>
                    </div>
                    <div className={THEME.layout.sidebarContent}>
                         {ctrl.wikiTree.map((node: any) => (<TreeItem key={node.id} node={node} level={0} selectedId={ctrl.selectedPageId} onSelect={(n: TreeNode) => ctrl.setSelectedPageId(n.id)} expandedIds={ctrl.expandedIds} toggleExpand={ctrl.toggleExpand} />))}
                    </div>
                </div>
            }
            right={
                ctrl.selectedPage ? (
                    <div className="h-full flex flex-col p-6 overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <input className={THEME.input.title} value={getLocalized(ctrl.selectedPage.title, world.language)} onChange={e => ctrl.updatePage({...ctrl.selectedPage, title: {...ctrl.selectedPage.title, [world.language]: e.target.value}})} />
                            <button onClick={() => ctrl.handleDelete(ctrl.selectedPage.id)} className={THEME.button.danger}><Trash2 size={20}/></button>
                        </div>
                        <div className="flex-1 min-h-0 relative border border-slate-800 rounded-lg bg-slate-900/50 p-4">
                             <RichTextEditor 
                                value={getLocalized(ctrl.selectedPage.content, world.language)} 
                                onChange={val => ctrl.updatePage({...ctrl.selectedPage, content: {...ctrl.selectedPage.content, [world.language]: val}})}
                                entities={world.entities}
                                pages={world.wikiPages}
                                lang={world.language}
                                className="h-full"
                             />
                        </div>
                        <div className="mt-4">
                            <label className={THEME.text.label}>Tags</label>
                            <TagInput tags={ctrl.selectedPage.tags} onChange={tags => ctrl.updatePage({...ctrl.selectedPage, tags})} />
                        </div>
                    </div>
                ) : <div className={THEME.layout.emptyState}><BookOpen size={64} className="mb-4 opacity-20"/><p>Select a page.</p></div>
            }
        />
    );
};
