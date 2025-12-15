import React from 'react';
import { 
  PlusCircle, Search, Trash2, Edit2, Plus, Calendar, 
  MessageSquare, Send, Sparkles, Network 
} from 'lucide-react';
import { ResizableSplitPane, AutoTextarea } from '../components/Shared';
import { TimelineEvent, Entity } from '../types';
import { RelationshipModal } from '../components/RelationshipModal';
import { useScenarioController, useSessionController, useTimelineController, useRelationshipController } from '../hooks/useNarrativeController';
import { THEME } from '../styles/theme';
import { getLocalized } from '../utils/helpers';

// --- Scenario Manager ---

export const ScenarioManager = ({ world, setWorld }: any) => {
    const ctrl = useScenarioController(world, setWorld);

    return (
        <ResizableSplitPane
            initialLeftWidth={300}
            className={THEME.layout.splitPane}
            left={
                <div className={THEME.layout.sidebar}>
                     <div className={THEME.layout.sidebarHeader} style={{display:'flex', justifyContent:'space-between'}}><span className={THEME.text.header}>Scenarios</span><button onClick={ctrl.handleCreate} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                     <div className={THEME.layout.sidebarContent}>
                        {world.scenarios.map((s: any) => (
                            <button key={s.id} onClick={() => ctrl.setSelectedScenarioId(s.id)} className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${ctrl.selectedScenarioId === s.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                <div className="font-bold truncate">{getLocalized(s.title, world.language)}</div>
                                <div className="text-xs opacity-70 truncate">{s.scenes.length} scenes</div>
                            </button>
                        ))}
                     </div>
                </div>
            }
            right={
                ctrl.selectedScenario ? (
                    <div className="h-full overflow-y-auto p-8">
                        <input className={THEME.input.title} value={getLocalized(ctrl.selectedScenario.title, world.language)} onChange={e => ctrl.updateScenario({...ctrl.selectedScenario, title: {...ctrl.selectedScenario.title, [world.language]: e.target.value}})} />
                        <div className="mb-8">
                            <h3 className={THEME.text.header}>Synopsis</h3>
                            <AutoTextarea className="w-full bg-slate-900 mt-2" value={getLocalized(ctrl.selectedScenario.synopsis, world.language)} onChange={(e: any) => ctrl.updateScenario({...ctrl.selectedScenario, synopsis: {...ctrl.selectedScenario.synopsis, [world.language]: e.target.value}})} />
                        </div>
                    </div>
                ) : <div className={THEME.layout.emptyState}><Sparkles size={64} className="mb-4 opacity-20"/><p>Select a scenario.</p></div>
            }
        />
    );
};

// --- Session Manager ---

export const SessionManager = ({ world, setWorld }: any) => {
    const ctrl = useSessionController(world, setWorld);

    return (
        <ResizableSplitPane
            initialLeftWidth={250}
            className={THEME.layout.splitPane}
            left={
                 <div className={THEME.layout.sidebar}>
                     <div className={THEME.layout.sidebarHeader} style={{display:'flex', justifyContent:'space-between'}}><span className={THEME.text.header}>Sessions</span><button onClick={ctrl.handleCreate} className={THEME.button.icon}><PlusCircle size={16}/></button></div>
                     <div className={THEME.layout.sidebarContent}>
                        {world.sessions.map((s: any) => (
                            <button key={s.id} onClick={() => ctrl.setSelectedSessionId(s.id)} className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${ctrl.selectedSessionId === s.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                <div className="font-bold truncate">{s.name}</div>
                                <div className="text-xs opacity-70 truncate">{new Date(s.date).toLocaleDateString()}</div>
                            </button>
                        ))}
                     </div>
                </div>
            }
            right={
                ctrl.selectedSession ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                             <input className="bg-transparent font-bold text-white text-lg focus:outline-none" value={ctrl.selectedSession.name} onChange={e => ctrl.updateSession({...ctrl.selectedSession, name: e.target.value})} />
                             <span className="text-xs text-slate-500">{new Date(ctrl.selectedSession.date).toLocaleString()}</span>
                        </div>
                        <div ref={ctrl.chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                            {ctrl.selectedSession.messages.map((m: any) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                                        <div className="text-xs opacity-50 mb-1 font-bold uppercase">{m.role}</div>
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                             <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Type a message..." value={ctrl.input} onChange={e => ctrl.setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ctrl.sendMessage()} />
                             <button onClick={ctrl.sendMessage} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"><Send size={20}/></button>
                        </div>
                    </div>
                ) : <div className={THEME.layout.emptyState}><MessageSquare size={64} className="mb-4 opacity-20"/><p>Select a session.</p></div>
            }
        />
    );
};

// --- Timeline Manager ---

export const TimelineManager = ({ world, setWorld }: any) => {
    const ctrl = useTimelineController(world, setWorld);

    return (
        <div className="h-full flex flex-col bg-slate-950 p-6">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">Timeline: {ctrl.timeline?.title}</h2>
                 <button onClick={ctrl.addEvent} className={THEME.button.primary}><Plus size={16}/> Add Event</button>
             </div>
             <div className="flex-1 overflow-y-auto relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8 pb-10">
                 {ctrl.events.map((e: TimelineEvent) => (
                     <div key={e.id} className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500 transition-colors group">
                         <div className="absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 border-slate-950 bg-indigo-500 z-10"/>
                         <div className="flex justify-between items-start mb-2">
                             <input className="font-bold text-white bg-transparent border-none text-lg focus:ring-0 p-0" value={e.title} onChange={ev => ctrl.updateEvent({...e, title: ev.target.value})} />
                             <button onClick={() => ctrl.deleteEvent(e.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                         </div>
                         <div className="flex gap-4 text-xs text-indigo-400 font-mono mb-3 items-center">
                             <div className="flex items-center gap-1"><Calendar size={12}/> Year <input type="number" className="bg-slate-800 w-16 text-center rounded border border-slate-700" value={e.year} onChange={ev => ctrl.updateEvent({...e, year: Number(ev.target.value)})} /></div>
                         </div>
                         <textarea className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 resize-none h-20 focus:border-indigo-500 outline-none" value={e.description} onChange={ev => ctrl.updateEvent({...e, description: ev.target.value})} />
                     </div>
                 ))}
             </div>
        </div>
    );
};

// --- Relationship Manager ---

export const RelationshipManager = ({ world, setWorld }: any) => {
    const ctrl = useRelationshipController(world, setWorld);

    return (
        <div className="flex flex-col h-full bg-slate-900 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Relationship Matrix</h2>
                    <p className="text-slate-400 text-sm">Manage connections between all entities.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
                        <input 
                            className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white w-64 focus:border-indigo-500 outline-none" 
                            placeholder="Search relationships..." 
                            value={ctrl.searchTerm} 
                            onChange={e => ctrl.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => ctrl.setCreateModalOpen(true)} className={THEME.button.primary}>
                        <Plus size={16}/> New Relationship
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-4 bg-slate-800/50 p-4 border-b border-slate-700 font-bold text-slate-400 text-xs uppercase tracking-wider">
                    <div className="col-span-4 truncate">Source Entity</div>
                    <div className="col-span-3 text-center truncate">Relationship Type</div>
                    <div className="col-span-4 text-right truncate">Target Entity</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {ctrl.filteredRels.map((rel: any, idx: number) => (
                        <div key={`${rel.source.id}-${rel.target.id}-${idx}`} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 items-center hover:bg-slate-800/30 transition-colors group">
                            <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                                    {rel.source.imageUrl ? <img src={rel.source.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-600 font-bold">{rel.source.type[0]}</div>}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{getLocalized(rel.source.name, world.language)}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{rel.source.type}</div>
                                </div>
                            </div>
                            <div className="col-span-3 text-center overflow-hidden">
                                <span className="inline-block px-3 py-1 bg-indigo-900/30 text-indigo-300 text-xs rounded-full border border-indigo-500/30 truncate max-w-full">{rel.type}</span>
                            </div>
                            <div className="col-span-4 flex items-center justify-end gap-3 text-right overflow-hidden">
                                <div className="min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{getLocalized(rel.target.name, world.language)}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{rel.target.type}</div>
                                </div>
                                <div className="w-8 h-8 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                                    {rel.target.imageUrl ? <img src={rel.target.imageUrl} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-slate-600 font-bold">{rel.target.type[0]}</div>}
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => ctrl.setEditRel({ sourceId: rel.source.id, targetId: rel.target.id, type: rel.type })} className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"><Edit2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {ctrl.filteredRels.length === 0 && <div className="p-8 text-center text-slate-500">No relationships found.</div>}
                </div>
            </div>

            {/* Edit Modal */}
            {ctrl.editRel && (
                <RelationshipModal 
                    isOpen={true} 
                    onClose={() => ctrl.setEditRel(null)} 
                    sourceName={world.entities.find((e: Entity) => e.id === ctrl.editRel.sourceId)?.name?.[world.language]} 
                    targetName={world.entities.find((e: Entity) => e.id === ctrl.editRel.targetId)?.name?.[world.language]} 
                    initialType={ctrl.editRel.type} 
                    onSave={ctrl.handleSave} 
                    onDelete={ctrl.handleDelete}
                />
            )}

            {/* Create Modal */}
            {ctrl.createModalOpen && (
                <div className={THEME.layout.modalOverlay}>
                    <div className={THEME.layout.modalContent}>
                        <h3 className="text-lg font-bold text-white mb-4">New Relationship</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={THEME.text.label}>Source</label>
                                <select className={THEME.input.select} value={ctrl.newRel.sourceId} onChange={e => ctrl.setNewRel({...ctrl.newRel, sourceId: e.target.value})}>
                                    <option value="">Select Source...</option>
                                    {world.entities.map((e: Entity) => <option key={e.id} value={e.id}>{getLocalized(e.name, world.language)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={THEME.text.label}>Type</label>
                                <input className={THEME.input.base} placeholder="e.g. Friend, Enemy" value={ctrl.newRel.type} onChange={e => ctrl.setNewRel({...ctrl.newRel, type: e.target.value})}/>
                            </div>
                            <div>
                                <label className={THEME.text.label}>Target</label>
                                <select className={THEME.input.select} value={ctrl.newRel.targetId} onChange={e => ctrl.setNewRel({...ctrl.newRel, targetId: e.target.value})}>
                                    <option value="">Select Target...</option>
                                    {world.entities.map((e: Entity) => <option key={e.id} value={e.id}>{getLocalized(e.name, world.language)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={ctrl.handleCreate} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-medium">Create</button>
                            <button onClick={() => ctrl.setCreateModalOpen(false)} className={THEME.button.secondary}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};