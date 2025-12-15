
import { useState, useEffect, useMemo } from 'react';
import { WorldState, AppSettings, AIProvider, TreeNode } from '../types';
import { dbService } from '../services/databaseService';
import { AIServiceFactory } from '../services/aiService';
import { getInitialWorldState } from '../utils/seedData';
import { translations } from '../utils/translations';
import { Globe2 } from 'lucide-react';

export const useWorldController = () => {
  const [world, setWorld] = useState<WorldState | null>(null);
  const [worlds, setWorlds] = useState<{id: string, name: string, lastPlayed: number, description: string, parentId?: string}[]>([]);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({ aiProvider: AIProvider.GEMINI, ollamaUrl: 'http://localhost:11434', ollamaModel: 'llama3', language: 'en' });
  const [selectedDashboardWorldId, setSelectedDashboardWorldId] = useState<string | null>(null);
  const [expandedWorldIds, setExpandedWorldIds] = useState<string[]>([]);

  // Derived state
  const aiService = useMemo(() => AIServiceFactory.getService(settings), [settings]);
  
  // Initialize
  useEffect(() => { 
      const init = async () => { 
          await dbService.init(); 
          const all = await dbService.loadAllWorlds(); 
          setWorlds(all); 
          setLoading(false); 
      }; 
      init(); 
  }, []);

  // Actions
  const handleCreate = async (parentId?: string) => { 
      const newWorld = getInitialWorldState(parentId); 
      newWorld.language = settings.language; 
      await dbService.saveWorld(newWorld); 
      const all = await dbService.loadAllWorlds();
      setWorlds(all);
  };

  const handleLoad = async (id: string) => { 
      const w = await dbService.loadWorld(id); 
      if (w) { 
          setWorld(w); 
          setSettings(prev => ({ ...prev, language: w.language })); 
          setView('dashboard'); 
      } 
  };

  const handleSave = async () => { 
      if (world) { 
          await dbService.saveWorld(world); 
          setWorlds(await dbService.loadAllWorlds()); 
      } 
  };

  const handleDelete = async (id: string) => {
      await dbService.deleteWorld(id);
      const all = await dbService.loadAllWorlds();
      setWorlds(all);
  };

  const closeWorld = () => {
      handleSave();
      setWorld(null);
  };

  // Helper for translations
  const t = (key: string) => translations[settings.language][key] || key;

  // Build World Tree for Dashboard
  const worldTree = useMemo(() => {
      const buildTree = (parentId?: string): TreeNode[] => {
          return worlds
              .filter(w => w.parentId === parentId || (!parentId && !worlds.find(p => p.id === w.parentId && p.id !== w.id)))
              .map(w => ({
                  id: w.id,
                  label: w.name,
                  type: 'folder',
                  icon: Globe2,
                  children: worlds.some(c => c.parentId === w.id) ? buildTree(w.id) : undefined,
                  data: w
              }));
      };
      return buildTree(undefined);
  }, [worlds]);

  return {
      world,
      setWorld,
      worlds,
      view,
      setView,
      loading,
      isSettingsOpen,
      setIsSettingsOpen,
      settings,
      setSettings,
      selectedDashboardWorldId,
      setSelectedDashboardWorldId,
      expandedWorldIds,
      setExpandedWorldIds,
      aiService,
      handleCreate,
      handleLoad,
      handleSave,
      handleDelete,
      closeWorld,
      t,
      worldTree
  };
};
