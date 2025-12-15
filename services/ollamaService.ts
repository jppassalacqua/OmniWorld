
import { AppSettings, EntityType, GameSystem, SessionMessage, SupportedLanguage } from "../types";

const cleanJson = (text: string): string => {
  const match = text.match(/```json([\s\S]*?)```/);
  if (match) return match[1];
  const match2 = text.match(/```([\s\S]*?)```/);
  if (match2) return match2[1];
  return text;
};

const fetchOllama = async (settings: AppSettings, prompt: string, formatJson: boolean = true) => {
  try {
    const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.ollamaModel,
        prompt: prompt,
        stream: false,
        format: formatJson ? "json" : undefined
      })
    });

    if (!response.ok) throw new Error("Ollama Connection Failed");
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Ollama Error:", error);
    throw error;
  }
};

export const generateEntityDescription = async (
  settings: AppSettings,
  name: string,
  type: EntityType,
  worldContext: string,
  system: GameSystem,
  lang: SupportedLanguage
) => {
  const prompt = `
    Context: RPG Worldbuilding.
    World: ${worldContext}
    System: ${system.name}.
    Language: ${lang === 'fr' ? 'French' : 'English'}.
    
    Task: Generate a description and attributes for a ${type} named "${name}".
    
    Format JSON:
    {
      "description": "string",
      "attributes": [{ "key": "string", "value": "string" }]
    }
  `;
  const res = await fetchOllama(settings, prompt);
  return JSON.parse(res);
};

export const generateWorldLore = async (
  settings: AppSettings,
  worldName: string,
  worldContext: string,
  genre: string,
  sections: string[],
  lang: SupportedLanguage
) => {
  const prompt = `
    Task: Write lore for RPG world "${worldName}".
    Context: ${worldContext}. Genre: ${genre}.
    Sections to write: ${sections.join(', ')}.
    Language: ${lang === 'fr' ? 'French' : 'English'}.
    
    Format JSON:
    {
      "sections": [{ "title": "string", "content": "string" }]
    }
  `;
  const res = await fetchOllama(settings, prompt);
  return JSON.parse(res);
};

export const generateScenarioHook = async (
  settings: AppSettings,
  worldContext: string,
  entities: string[],
  lang: SupportedLanguage
) => {
  const prompt = `
    Context: World: ${worldContext}. Entities: ${entities.join(', ')}.
    Language: ${lang === 'fr' ? 'French' : 'English'}.
    
    Task: Create a scenario hook.
    
    Format JSON:
    {
      "title": "string",
      "synopsis": "string",
      "scenes": [{ "title": "string", "description": "string", "type": "exploration" }],
      "newEntities": []
    }
  `;
  const res = await fetchOllama(settings, prompt);
  return JSON.parse(res);
};

export const continueSessionChat = async (
  settings: AppSettings,
  worldContext: string,
  scenarioContext: string,
  history: SessionMessage[],
  lang: SupportedLanguage
) => {
  const recent = history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
  const prompt = `
    Role: RPG Game Master.
    World: ${worldContext}. Scenario: ${scenarioContext}.
    History: ${recent}.
    Language: ${lang === 'fr' ? 'French' : 'English'}.
    
    Response format JSON:
    {
      "response": "string (GM narration)",
      "newEntities": []
    }
  `;
  const res = await fetchOllama(settings, prompt);
  return JSON.parse(res);
};

export const translateText = async (
  settings: AppSettings,
  text: string,
  targetLang: SupportedLanguage
) => {
  const prompt = `
    Task: Translate the following text to ${targetLang === 'fr' ? 'French' : 'English'}.
    Text: "${text}"
    
    Response format JSON:
    {
      "translation": "translated text string"
    }
  `;
  const res = await fetchOllama(settings, prompt);
  return JSON.parse(res).translation;
};
