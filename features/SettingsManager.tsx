
import React, { useState } from 'react';
import { Globe, Cpu, FileText, ChevronLeft } from 'lucide-react';
import { AppSettings, WorldState, AIProvider } from '../types';
import { ResizableSplitPane, AutoTextarea } from '../components/Shared';
import { THEME } from '../styles/theme';

interface SettingsManagerProps {
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    world: WorldState | null;
    setWorld: (w: WorldState) => void;
    worlds: any[];
    onBack: () => void;
}

export const SettingsManager = ({ settings, setSettings, world, setWorld, worlds, onBack }: SettingsManagerProps) => {
    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'prompts'>('general');

    return (
        <ResizableSplitPane
            initialLeftWidth={250}
            className={THEME.layout.splitPane}
            left={
                <div className={THEME.layout.sidebar}>
                    <div className={THEME.layout.sidebarHeader}>
                        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <span className={THEME.text.header}>Configuration</span>
                    </div>
                    <div className={THEME.layout.sidebarContent}>
                         <button onClick={() => setActiveTab('general')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${activeTab === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                              <div className="flex items-center gap-2"><Globe size={16}/> General</div>
                          </button>
                          <button onClick={() => setActiveTab('ai')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                              <div className="flex items-center gap-2"><Cpu size={16}/> AI Provider</div>
                          </button>
                          <button onClick={() => setActiveTab('prompts')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${activeTab === 'prompts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                              <div className="flex items-center gap-2"><FileText size={16}/> Prompts</div>
                          </button>
                    </div>
                </div>
            }
            right={
                <div className="h-full overflow-y-auto bg-slate-950 p-8 max-w-4xl mx-auto w-full">
                    <h1 className="text-3xl font-bold text-white mb-8 capitalize">{activeTab} Settings</h1>
                    
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Application Preferences</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Interface Language</label>
                                        <select className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" value={settings.language} onChange={e => { setSettings(s=>({...s, language: e.target.value as any})); if(world) setWorld({...world, language: e.target.value as any}); }}>
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1">Changes UI text and default generation language.</p>
                                    </div>
                                </div>
                            </div>
                            {world && (
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4">Current World: {world.name[settings.language] || world.name['en']}</h3>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Move World Location (Parent)</label>
                                        <select className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" value={world.parentId || ""} onChange={e => setWorld({ ...world, parentId: e.target.value || undefined })}>
                                            <option value="">(Root Directory)</option>
                                            {worlds.filter(w => w.id !== world.id).map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Artificial Intelligence Backend</h3>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Provider</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500" value={settings.aiProvider} onChange={e => setSettings(s=>({...s, aiProvider: e.target.value as any}))}>
                                        <option value={AIProvider.GEMINI}>Google Gemini (Cloud)</option>
                                        <option value={AIProvider.OLLAMA}>Ollama (Local)</option>
                                    </select>
                                </div>
                            </div>
                            
                            {settings.aiProvider === AIProvider.OLLAMA && (
                                <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl space-y-4">
                                     <h3 className="text-lg font-bold text-indigo-300">Ollama Configuration</h3>
                                     <div>
                                         <label className="text-xs text-indigo-300 uppercase font-bold">API URL</label>
                                         <input className="w-full bg-slate-900 border border-indigo-500/30 rounded p-2 text-white mt-1 font-mono text-sm" value={settings.ollamaUrl} onChange={e => setSettings(s => ({...s, ollamaUrl: e.target.value}))} placeholder="http://localhost:11434"/>
                                     </div>
                                     <div>
                                         <label className="text-xs text-indigo-300 uppercase font-bold">Model Name</label>
                                         <input className="w-full bg-slate-900 border border-indigo-500/30 rounded p-2 text-white mt-1 font-mono text-sm" value={settings.ollamaModel} onChange={e => setSettings(s => ({...s, ollamaModel: e.target.value}))} placeholder="llama3"/>
                                         <p className="text-xs text-slate-500 mt-1">Make sure you have pulled this model: <code>ollama pull llama3</code></p>
                                     </div>
                                </div>
                            )}
                            
                            {settings.aiProvider === AIProvider.GEMINI && (
                                <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <h3 className="text-lg font-bold text-white mb-2">Gemini Configuration</h3>
                                    <p className="text-sm text-slate-400">Gemini is configured via environment variables. Ensure <code>API_KEY</code> is set in your <code>.env</code> file or deployment configuration.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'prompts' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white">System Prompts</h3>
                                <p className="text-sm text-slate-400">Customize the instructions sent to the AI. Use variables like <code>{'{{name}}'}</code> or <code>{'{{language}}'}</code> to inject context dynamically.</p>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-indigo-300 font-bold mb-2">Entity Generation</label>
                                    <AutoTextarea className="min-h-[150px] font-mono text-xs bg-slate-900 border-slate-800 focus:border-indigo-500" value={settings.systemPrompts.entityGen} onChange={(e:any) => setSettings(s => ({...s, systemPrompts: {...s.systemPrompts, entityGen: e.target.value}}))} />
                                </div>
                                <div>
                                    <label className="block text-sm text-indigo-300 font-bold mb-2">Lore Generation</label>
                                    <AutoTextarea className="min-h-[150px] font-mono text-xs bg-slate-900 border-slate-800 focus:border-indigo-500" value={settings.systemPrompts.loreGen} onChange={(e:any) => setSettings(s => ({...s, systemPrompts: {...s.systemPrompts, loreGen: e.target.value}}))} />
                                </div>
                                <div>
                                    <label className="block text-sm text-indigo-300 font-bold mb-2">Scenario Hooks</label>
                                    <AutoTextarea className="min-h-[150px] font-mono text-xs bg-slate-900 border-slate-800 focus:border-indigo-500" value={settings.systemPrompts.scenarioGen} onChange={(e:any) => setSettings(s => ({...s, systemPrompts: {...s.systemPrompts, scenarioGen: e.target.value}}))} />
                                </div>
                                <div>
                                    <label className="block text-sm text-indigo-300 font-bold mb-2">Game Master Chat</label>
                                    <AutoTextarea className="min-h-[150px] font-mono text-xs bg-slate-900 border-slate-800 focus:border-indigo-500" value={settings.systemPrompts.chatGen} onChange={(e:any) => setSettings(s => ({...s, systemPrompts: {...s.systemPrompts, chatGen: e.target.value}}))} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
};
