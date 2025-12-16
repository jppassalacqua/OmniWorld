
import React from 'react';
import { Search, Plus, Edit2 } from 'lucide-react';
import { Entity } from '../../types';
import { useRelationshipController } from '../../hooks/useNarrativeController';
import { THEME } from '../../styles/theme';
import { getLocalized } from '../../utils/helpers';
import { RelationshipModal } from '../../components/RelationshipModal';

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
