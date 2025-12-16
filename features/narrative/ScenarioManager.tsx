
import React from 'react';
import { Sparkles, PlusCircle, Trash2, Plus, Loader2 } from 'lucide-react';
import { ResizableSplitPane, AutoTextarea } from '../../components/Shared';
import { Scene } from '../../types';
import { useScenarioController } from '../../hooks/useNarrativeController';
import { THEME } from '../../styles/theme';
import { getLocalized } from '../../utils/helpers';

export const ScenarioManager = ({ world, setWorld, aiService, initialSelectedId }: any) => {
    const ctrl = useScenarioController(world, setWorld, aiService, initialSelectedId);

    return (
        <ResizableSplitPane
            initialLeftWidth={300}
            className={THEME.layout.splitPane}
            left={
                <div className={THEME.layout.sidebar}>
                     <div className={THEME.layout.sidebarHeader} style={{display:'flex', justifyContent:'space-between'}}>
                        <span className={THEME.text.header}>Scenarios</span>
                        <div className="flex gap-1">
                            <button onClick={ctrl.handleGenerate} disabled={ctrl.isGenerating} className={THEME.button.icon} title="Generate with AI">
                                {ctrl.isGenerating ? <Loader2 size={16} className="animate-spin text-indigo-400"/> : <Sparkles size={16}/>}
                            </button>
                            <button onClick={ctrl.handleCreate} className={THEME.button.icon} title="Create Empty"><PlusCircle size={16}/></button>
                        </div>
                     </div>
                     <div className={THEME.layout.sidebarContent}>
                        {world.scenarios.map((s: any) => (
                            <div key={s.id} onClick={() => ctrl.setSelectedScenarioId(s.id)} className={`group w-full text-left px-3 py-2 rounded text-sm mb-1 cursor-pointer flex justify-between items-center ${ctrl.selectedScenarioId === s.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                                <div className="truncate flex-1">
                                    <div className="font-bold truncate">{getLocalized(s.title, world.language)}</div>
                                    <div className="text-xs opacity-70 truncate">{s.scenes.length} scenes</div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); ctrl.deleteScenario(s.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-300 p-1"><Trash2 size={14}/></button>
                            </div>
                        ))}
                     </div>
                </div>
            }
            right={
                ctrl.selectedScenario ? (
                    <div className="h-full flex flex-col overflow-hidden">
                        <div className="p-8 pb-4 flex-shrink-0">
                            <input className={THEME.input.title} value={getLocalized(ctrl.selectedScenario.title, world.language)} onChange={e => ctrl.updateScenario({...ctrl.selectedScenario, title: {...ctrl.selectedScenario.title, [world.language]: e.target.value}})} />
                            <div className="mt-4">
                                <h3 className={THEME.text.header}>Synopsis</h3>
                                <AutoTextarea className="w-full bg-slate-900 mt-2 min-h-[80px]" value={getLocalized(ctrl.selectedScenario.synopsis, world.language)} onChange={(e: any) => ctrl.updateScenario({...ctrl.selectedScenario, synopsis: {...ctrl.selectedScenario.synopsis, [world.language]: e.target.value}})} />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 pt-0">
                             <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                <h3 className={THEME.text.header}>Scenes</h3>
                                <button onClick={ctrl.addScene} className="text-xs flex items-center gap-1 text-indigo-400 font-bold hover:text-white"><Plus size={14}/> Add Scene</button>
                             </div>
                             
                             <div className="space-y-4">
                                {ctrl.selectedScenario.scenes.map((scene: Scene, idx: number) => (
                                    <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 transition-all hover:border-slate-700 group">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="bg-slate-800 text-slate-500 font-mono text-xs w-6 h-6 flex items-center justify-center rounded">{idx+1}</div>
                                                <input className="font-bold text-white bg-transparent outline-none flex-1 border-b border-transparent focus:border-indigo-500" value={getLocalized(scene.title, world.language)} onChange={e => ctrl.updateScene(scene.id, {title: {[world.language]: e.target.value}})}/>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 text-slate-400 outline-none" value={scene.status} onChange={e => ctrl.updateScene(scene.id, {status: e.target.value as any})}>
                                                    <option value="pending">Pending</option>
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <select className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 text-slate-400 outline-none" value={scene.type} onChange={e => ctrl.updateScene(scene.id, {type: e.target.value as any})}>
                                                    <option value="exploration">Exploration</option>
                                                    <option value="social">Social</option>
                                                    <option value="combat">Combat</option>
                                                    <option value="puzzle">Puzzle</option>
                                                </select>
                                                <button onClick={() => ctrl.deleteScene(scene.id)} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                        <AutoTextarea 
                                            className="w-full bg-slate-950/50 border-none text-sm text-slate-400 min-h-[60px]" 
                                            placeholder="Scene description..." 
                                            value={getLocalized(scene.description, world.language)} 
                                            onChange={(e: any) => ctrl.updateScene(scene.id, {description: {[world.language]: e.target.value}})}
                                        />
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                ) : <div className={THEME.layout.emptyState}><Sparkles size={64} className="mb-4 opacity-20"/><p>Select a scenario.</p></div>
            }
        />
    );
};
