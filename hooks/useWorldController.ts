
import { useState, useEffect, useMemo } from 'react';
import { WorldState, AppSettings, AIProvider, TreeNode, SystemPrompts } from '../types';
import { dbService } from '../services/databaseService';
import { AIServiceFactory } from '../services/aiService';
import { getInitialWorldState } from '../utils/seedData';
import { translations } from '../utils/translations';
import { Globe2 } from 'lucide-react';

const DEFAULT_PROMPTS: SystemPrompts = {
    entityGen: `Context: RPG Worldbuilding.
World Context: {{worldContext}}
Game System: {{systemName}} (Stats: {{systemStats}})
Language: Generate content in {{language}}.
Task: Generate a rich, immersive description and a set of game statistics for a {{type}} named "{{name}}".`,
    loreGen: `Task: Create detailed lore for a new RPG world named "{{worldName}}".
World Context: {{worldContext}}
Genre/Vibe: {{genre}}.
Language: Generate content in {{language}}.
Please generate content for the following sections: {{sections}}.
Write in an evocative, encyclopedic tone.`,
    scenarioGen: `Context: World: {{worldContext}}.
Available Entities (Names): {{entities}}.
Language: Generate content in {{language}}.
Task: Create a multi-scene scenario.
IMPORTANT: If the scenario introduces KEY CHARACTERS, LOCATIONS, or ITEMS that do not exist in the Available Entities list, define them in the 'newEntities' array so I can create them in the database.`,
    chatGen: `You are an AI Game Master running a Tabletop RPG session.
Language: Respond in {{language}}.
World: {{worldContext}}
Current Scenario: {{scenarioContext}}
Chat History:
{{history}}
Task: Respond as the Game Master (SYSTEM). Describe the outcome of the user's action.
If you invent a NEW significant NPC, Location, or Item that was not previously mentioned, please extract it into the 'newEntities' field.
Keep response under 150 words.`
};

export const useWorldController = () => {
  const [world, setWorld] = useState<WorldState | null>(null);
  const [worlds, setWorlds] = useState<{id: string, name: string, lastPlayed: number, description: string, parentId?: string}[]>([]);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({ 
      aiProvider: AIProvider.GEMINI, 
      ollamaUrl: 'http://localhost:11434', 
      ollamaModel: 'llama3', 
      language: 'fr', 
      systemPrompts: DEFAULT_PROMPTS 
  });
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

  const handleImportWorld = async (jsonString: string) => {
      try {
          const importedWorld = JSON.parse(jsonString) as WorldState;
          if (!importedWorld.id || !importedWorld.entities) throw new Error("Invalid World Data");
          
          // Ensure ID uniqueness if importing duplicate
          // For now, we overwrite if same ID, or user manually handles it. 
          // Ideally we might regenerate ID but that breaks internal links. 
          // We assume import is either backup restore or new world.
          
          await dbService.saveWorld(importedWorld);
          const all = await dbService.loadAllWorlds();
          setWorlds(all);
          alert("Import successful!");
      } catch (e) {
          console.error(e);
          alert("Failed to import world. Check file format.");
      }
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
      setView('dashboard');
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
      settings,
      setSettings,
      selectedDashboardWorldId,
      setSelectedDashboardWorldId,
      expandedWorldIds,
      setExpandedWorldIds,
      aiService,
      handleCreate,
      handleImportWorld,
      handleLoad,
      handleSave,
      handleDelete,
      closeWorld,
      t,
      worldTree
  };
};
