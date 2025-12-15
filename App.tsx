
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Map as MapIcon, Users, BookOpen, Settings, Sparkles, 
  MessageSquare, Calendar, LogOut, Globe2, Network, X, Cpu, FileText, Globe
} from 'lucide-react';
import { AIProvider } from './types';
import * as ExportBridge from './utils/exportBridge';

// Import Controller Hook
import { useWorldController } from './hooks/useWorldController';

// Import View Components
import { NavItem, AutoTextarea } from './components/Shared';
import { Dashboard } from './features/Dashboard';
import { SettingsManager } from './features/SettingsManager';
import { EntityManager } from './features/EntityManager';
import { MapManager } from './features/MapManager';
import { WikiManager } from './features/WikiManager';
import { 
    ScenarioManager, 
    SessionManager, 
    TimelineManager, 
    RelationshipManager 
} from './features/NarrativeManagers';

const App = () => {
  const {
      world, setWorld, worlds,
      view, setView,
      loading,
      settings, setSettings,
      selectedDashboardWorldId, setSelectedDashboardWorldId,
      expandedWorldIds, setExpandedWorldIds,
      aiService,
      handleCreate, handleLoad, handleSave, handleDelete, closeWorld,
      t, worldTree
  } = useWorldController();
  
  const [targetEntityId, setTargetEntityId] = useState<string | null>(null);

  // --- Auto-Save Logic ---
  const saveRef = useRef(handleSave);

  // Keep ref updated with latest handleSave closure
  useEffect(() => {
      saveRef.current = handleSave;
  }, [handleSave]);

  // 1. Interval Save (Every 2 minutes)
  useEffect(() => {
      if (!world) return;
      const interval = setInterval(() => {
          console.log("Auto-saving (Interval)...");
          saveRef.current();
      }, 2 * 60 * 1000); // 2 minutes
      return () => clearInterval(interval);
  }, [!!world]); // Only restart if world loaded/unloaded

  // 2. Debounced Save (On significant changes)
  useEffect(() => {
      if (!world) return;
      // Wait for user to stop typing/editing for 2 seconds before saving
      const timeout = setTimeout(() => {
          handleSave();
      }, 2000); 
      return () => clearTimeout(timeout);
  }, [world, handleSave]); 
  // -----------------------

  const handleNavigateToEntity = (id: string) => {
      setTargetEntityId(id);
      setView('entities');
  };
  
  const handleNavClick = (viewName: string) => {
      setTargetEntityId(null); // Clear specific selection when using main nav
      setView(viewName);
  };

  if (loading) return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;

  const renderContent = () => {
      // Global Settings View (Available even without loaded world)
      if (view === 'settings') {
          return (
              <SettingsManager 
                  settings={settings} 
                  setSettings={setSettings} 
                  world={world} 
                  setWorld={setWorld} 
                  worlds={worlds}
                  onBack={() => setView('dashboard')} 
              />
          );
      }

      // No World Loaded -> Show Dashboard
      if (!world) {
          return (
             <div className="relative h-full">
                 <button onClick={() => setView('settings')} className="absolute top-4 right-4 z-50 p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg shadow-xl flex items-center gap-2">
                     <Settings size={18}/>
                     <span className="text-sm font-bold">Configuration</span>
                 </button>
                 <Dashboard 
                    worlds={worlds}
                    selectedDashboardWorldId={selectedDashboardWorldId}
                    setSelectedDashboardWorldId={setSelectedDashboardWorldId}
                    worldTree={worldTree}
                    expandedWorldIds={expandedWorldIds}
                    setExpandedWorldIds={setExpandedWorldIds}
                    handleCreate={handleCreate}
                    handleLoad={handleLoad}
                    handleDelete={handleDelete}
                    onOpenSettings={() => setView('settings')}
                    t={t}
                />
             </div>
          );
      }

      switch(view) {
          case 'entities': return <EntityManager world={world} setWorld={setWorld} onExport={() => ExportBridge.downloadUnityPackage(world)} setView={setView} aiService={aiService} initialSelectedId={targetEntityId} />;
          case 'wiki': return <WikiManager world={world} setWorld={setWorld} aiService={aiService} />;
          case 'maps': return <MapManager world={world} setWorld={setWorld} aiService={aiService} onNavigateToEntity={handleNavigateToEntity} />;
          case 'relationships': return <RelationshipManager world={world} setWorld={setWorld} />;
          case 'scenarios': return <ScenarioManager world={world} setWorld={setWorld} />;
          case 'sessions': return <SessionManager world={world} setWorld={setWorld} />;
          case 'timelines': return <TimelineManager world={world} setWorld={setWorld} />;
          case 'dashboard': default:
              return (
                  <div className="p-8 overflow-y-auto h-full">
                      <div className="max-w-4xl mx-auto">
                           <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-slate-700 rounded-2xl p-8 mb-8 relative overflow-hidden">
                               <div className="relative z-10"><h2 className="text-3xl font-bold text-white mb-2">{world.name[settings.language] || world.name.en}</h2><p className="text-indigo-200/80 max-w-xl text-lg">{world.description[settings.language] || world.description.en}</p><div className="mt-6 flex gap-4 text-sm text-indigo-300"><span className="flex items-center gap-1 bg-indigo-950/50 px-3 py-1 rounded-full"><Users size={14}/> {world.entities.length} {t('world.entities_count')}</span><span className="flex items-center gap-1 bg-indigo-950/50 px-3 py-1 rounded-full"><Sparkles size={14}/> {world.scenarios.length} {t('world.scenarios_count')}</span></div></div><Globe2 className="absolute -bottom-8 -right-8 text-indigo-900/20" size={200} />
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                               <button onClick={() => handleNavClick('entities')} className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-all group"><Users className="text-indigo-500 mb-2 group-hover:scale-110 transition-transform"/><div className="font-bold text-white">{t('nav.entities')}</div><div className="text-xs text-slate-500">Manage NPCs & Locations</div></button>
                               <button onClick={() => handleNavClick('wiki')} className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-all group"><BookOpen className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform"/><div className="font-bold text-white">{t('nav.wiki')}</div><div className="text-xs text-slate-500">World Lore & Notes</div></button>
                               <button onClick={() => handleNavClick('maps')} className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-all group"><MapIcon className="text-amber-500 mb-2 group-hover:scale-110 transition-transform"/><div className="font-bold text-white">{t('nav.maps')}</div><div className="text-xs text-slate-500">Cartography</div></button>
                               <button onClick={() => handleNavClick('scenarios')} className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-all group"><Sparkles className="text-purple-500 mb-2 group-hover:scale-110 transition-transform"/><div className="font-bold text-white">{t('nav.scenarios')}</div><div className="text-xs text-slate-500">Plots & Scenes</div></button>
                           </div>
                      </div>
                  </div>
              );
      }
  };

  return (
      <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
          {world && (
              <div className="w-20 lg:w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all">
                 <div className="p-4 lg:p-6 border-b border-slate-800 flex items-center justify-center lg:justify-start gap-3"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30 flex-shrink-0"><Globe2 size={20}/></div><span className="font-bold text-white truncate hidden lg:block text-lg">OmniWorld</span></div>
                 <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                     <NavItem icon={Layout} label={t('nav.dashboard')} active={view === 'dashboard'} onClick={() => handleNavClick('dashboard')} />
                     <NavItem icon={Users} label={t('nav.entities')} active={view === 'entities'} onClick={() => handleNavClick('entities')} />
                     <NavItem icon={Network} label={t('nav.relationships')} active={view === 'relationships'} onClick={() => handleNavClick('relationships')} />
                     <NavItem icon={BookOpen} label={t('nav.wiki')} active={view === 'wiki'} onClick={() => handleNavClick('wiki')} />
                     <NavItem icon={MapIcon} label={t('nav.maps')} active={view === 'maps'} onClick={() => handleNavClick('maps')} />
                     <NavItem icon={Sparkles} label={t('nav.scenarios')} active={view === 'scenarios'} onClick={() => handleNavClick('scenarios')} />
                     <NavItem icon={MessageSquare} label={t('nav.sessions')} active={view === 'sessions'} onClick={() => handleNavClick('sessions')} />
                     <NavItem icon={Calendar} label="Timelines" active={view === 'timelines'} onClick={() => handleNavClick('timelines')} />
                 </nav>
                 <div className="p-2 border-t border-slate-800 space-y-1">
                     <NavItem icon={Settings} label={t('nav.settings')} active={view === 'settings'} onClick={() => handleNavClick('settings')} />
                     <NavItem icon={LogOut} label="Close World" onClick={closeWorld} danger />
                 </div>
              </div>
          )}
          
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">{renderContent()}</div>
      </div>
  );
};

export default App;
