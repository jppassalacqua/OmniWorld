
import { Entity, EntityType, FoundryActor, UnityExportData, WorldState, WikiPage } from "../types";
import * as yaml from 'js-yaml';

// Helper to get text based on current world language
const getText = (localized: any, lang: string): string => {
  if (typeof localized === 'string') return localized;
  return localized[lang] || localized['fr'] || localized['en'] || "";
};

// --- Foundry VTT Exporter ---

export const convertToFoundryActor = (entity: Entity, lang: string): FoundryActor => {
  return {
    name: getText(entity.name, lang),
    type: entity.type === EntityType.NPC ? 'npc' : 'character',
    img: entity.imageUrl || 'icons/svg/mystery-man.svg',
    system: {
      description: { value: `<p>${getText(entity.description, lang)}</p>` },
      attributes: entity.attributes.reduce((acc, attr) => {
        acc[attr.key] = { value: attr.value };
        return acc;
      }, {} as Record<string, any>)
    }
  };
};

export const downloadFoundryJSON = (entity: Entity, lang: string) => {
  const data = convertToFoundryActor(entity, lang);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `foundry_${getText(entity.name, lang).replace(/\s+/g, '_').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// --- Unity Exporter ---

export const convertToUnityJSON = (world: WorldState): UnityExportData => {
  const lang = world.language;
  return {
    worldName: getText(world.name, lang),
    assets: world.entities.map(e => ({
      guid: e.id,
      name: getText(e.name, lang),
      type: e.type,
      data: JSON.stringify({
        description: getText(e.description, lang),
        stats: e.attributes,
        tags: e.tags
      })
    }))
  };
};

export const downloadUnityPackage = (world: WorldState) => {
  const data = convertToUnityJSON(world);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unity_world_${getText(world.name, world.language).replace(/\s+/g, '_').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// --- Full World Backup (JSON) ---

export const downloadWorldJSON = (world: WorldState) => {
    const data = JSON.stringify(world, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omniworld_${getText(world.name, world.language).replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

// --- Full World Backup (YAML) ---

export const downloadWorldYAML = (world: WorldState) => {
    try {
        const data = yaml.dump(world);
        const blob = new Blob([data], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omniworld_${getText(world.name, world.language).replace(/\s+/g, '_').toLowerCase()}.yaml`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("YAML Export failed", e);
        alert("Failed to export to YAML.");
    }
};

// --- Wiki Export (Markdown) ---

export const downloadWikiMarkdown = (page: WikiPage, lang: string) => {
    const title = getText(page.title, lang);
    const content = getText(page.content, lang);
    const tags = page.tags.map(t => `#${t}`).join(' ');
    
    const md = `# ${title}\n\n${tags}\n\n---\n\n${content}`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
};
