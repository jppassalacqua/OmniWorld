
import { GoogleGenAI, Type } from "@google/genai";
import { Entity, EntityType, GameSystem, SessionMessage, SupportedLanguage } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ... existing generateEntityDescription ...
export const generateEntityDescription = async (
  name: string,
  type: EntityType,
  worldContext: string,
  system: GameSystem,
  lang: SupportedLanguage,
  promptTemplate?: string
): Promise<{ description: string; attributes: any }> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  const basePrompt = promptTemplate || `
    Context: You are a creative assistant for a Worldbuilder building a generic RPG world.
    World Context: {{worldContext}}
    Game System: {{systemName}} (Stats: {{systemStats}})
    Language: Generate content in {{language}}.
    
    Task: Generate a rich, immersive description and a set of game statistics for a {{type}} named "{{name}}".
  `;

  const finalPrompt = basePrompt
    .replace('{{worldContext}}', worldContext)
    .replace('{{systemName}}', system.name)
    .replace('{{systemStats}}', system.stats.join(', '))
    .replace('{{language}}', lang === 'fr' ? 'FRENCH' : 'ENGLISH')
    .replace('{{type}}', type)
    .replace('{{name}}', name) + "\n Return JSON format only.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A paragraph describing the entity." },
            attributes: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  value: { type: Type.STRING } 
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { description: "Failed to generate", attributes: [] };
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Gen Error:", error);
    throw error;
  }
};

// ... existing generateWorldLore ...
export const generateWorldLore = async (
  worldName: string,
  worldContext: string,
  genre: string,
  sections: string[],
  lang: SupportedLanguage,
  promptTemplate?: string
): Promise<{ sections: { title: string; content: string }[] }> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  const basePrompt = promptTemplate || `
    Task: Create detailed lore for a new RPG world named "{{worldName}}".
    World Context: {{worldContext}}
    Genre/Vibe: {{genre}}.
    Language: Generate content in {{language}}.
    
    Please generate content for the following sections: {{sections}}.
    Write in an evocative, encyclopedic tone.
  `;

  const finalPrompt = basePrompt
    .replace('{{worldName}}', worldName)
    .replace('{{worldContext}}', worldContext)
    .replace('{{genre}}', genre)
    .replace('{{language}}', lang === 'fr' ? 'FRENCH' : 'ENGLISH')
    .replace('{{sections}}', sections.join(', '));

  const response = await ai.models.generateContent({
    model,
    contents: finalPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response");
  return JSON.parse(text);
};

export const generateScenarioHook = async (
  worldContext: string,
  entities: string[],
  lang: SupportedLanguage,
  promptTemplate?: string
): Promise<{ 
  title: string; 
  synopsis: string; 
  scenes: { title: string; description: string; type: string }[];
  newEntities: { name: string; type: EntityType; description: string }[] 
}> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  const basePrompt = promptTemplate || `
    Context: World: {{worldContext}}.
    Available Entities (Names): {{entities}}.
    Language: Generate content in {{language}}.
    
    Task: Create a multi-scene scenario.
    IMPORTANT: If the scenario introduces KEY CHARACTERS, LOCATIONS, or ITEMS that do not exist in the Available Entities list, define them in the 'newEntities' array so I can create them in the database.
  `;

  const finalPrompt = basePrompt
    .replace('{{worldContext}}', worldContext)
    .replace('{{entities}}', entities.join(', '))
    .replace('{{language}}', lang === 'fr' ? 'FRENCH' : 'ENGLISH') + "\n Return JSON.";

  const response = await ai.models.generateContent({
    model,
    contents: finalPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          synopsis: { type: Type.STRING },
          scenes: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                 title: { type: Type.STRING },
                 description: { type: Type.STRING },
                 type: { type: Type.STRING, enum: ['exploration', 'social', 'combat', 'puzzle'] }
              }
            } 
          },
          newEntities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['NPC', 'LOCATION', 'ITEM', 'FACTION', 'LORE'] },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response");
  return JSON.parse(text);
};

export const continueSessionChat = async (
  worldContext: string,
  scenarioContext: string,
  history: SessionMessage[],
  lang: SupportedLanguage,
  promptTemplate?: string
): Promise<{ response: string; newEntities: { name: string; type: EntityType; description: string }[] }> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  // Filter history for context to save tokens, keep last 10
  const recentHistory = history.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  const model = "gemini-2.5-flash";
  const basePrompt = promptTemplate || `
    You are an AI Game Master running a Tabletop RPG session.
    Language: Respond in {{language}}.
    
    World: {{worldContext}}
    Current Scenario: {{scenarioContext}}
    
    Chat History:
    {{history}}
    
    Task: Respond as the Game Master (SYSTEM). Describe the outcome of the user's action.
    If you invent a NEW significant NPC, Location, or Item that was not previously mentioned, please extract it into the 'newEntities' field.
    
    Keep response under 150 words.
  `;

  const finalPrompt = basePrompt
    .replace('{{language}}', lang === 'fr' ? 'FRENCH' : 'ENGLISH')
    .replace('{{worldContext}}', worldContext)
    .replace('{{scenarioContext}}', scenarioContext)
    .replace('{{history}}', recentHistory);

  const response = await ai.models.generateContent({
    model,
    contents: finalPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          response: { type: Type.STRING },
          newEntities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['NPC', 'LOCATION', 'ITEM', 'FACTION', 'LORE'] },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return { response: "...", newEntities: [] };
  return JSON.parse(text);
};

export const translateText = async (text: string, targetLang: SupportedLanguage): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const model = "gemini-2.5-flash";
  const prompt = `Translate the following text to ${targetLang === 'fr' ? 'French' : 'English'}. maintain tone and style.\n\nText: "${text}"`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING }
        }
      }
    }
  });
  const res = response.text ? JSON.parse(response.text) : { translation: text };
  return res.translation;
};

export const summarizeText = async (text: string, lang: SupportedLanguage): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const model = "gemini-2.5-flash";
    const prompt = `Summarize the following text in 3 sentences max. Language: ${lang === 'fr' ? 'French' : 'English'}.\n\nText: "${text}"`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING }
                }
            }
        }
    });
    const res = response.text ? JSON.parse(response.text) : { summary: "..." };
    return res.summary;
};

// ... existing image gens ...
export const generateEntityImage = async (description: string, entityType?: EntityType): Promise<string | null> => {
  if (!process.env.API_KEY) return null;
  
  let stylePrompt = "Digital art concept for an RPG game. Style: Semi-realistic, detailed, high quality.";
  let aspectRatio = "1:1";
  
  // Robust negative prompt to reduce artifacts
  const negativePrompt = "text, watermark, UI elements, low quality, blurry, distorted, deformed, ugly, bad anatomy, extra limbs, cropped, lowres, pixelated, cartoony, out of frame.";

  if (entityType) {
    switch (entityType) {
      case EntityType.NPC:
        stylePrompt = "Fantasy character portrait, oil painting style, highly detailed facial features, dramatic lighting, heroic pose, centered composition, rim light.";
        aspectRatio = "3:4";
        break;
      case EntityType.ITEM:
        stylePrompt = "Technical blueprint or detailed prop render, isolated object on dark background, intricate details, game asset style, macro photography, sharp focus.";
        aspectRatio = "1:1";
        break;
      case EntityType.LOCATION:
        stylePrompt = "Environmental concept art, architectural sketch, atmospheric landscape, wide angle shot, cinematic lighting, epic scale, 8k resolution.";
        aspectRatio = "16:9";
        break;
      case EntityType.FACTION:
        stylePrompt = "Heraldic emblem, banner design, stylized vector graphic, symbolic, coat of arms, flat design, white background.";
        aspectRatio = "1:1";
        break;
      case EntityType.LORE:
        stylePrompt = "Ancient manuscript illustration, tapestry art, abstract mythic concept, faded parchment texture, ink drawing.";
        aspectRatio = "3:4";
        break;
    }
  }

  const finalPrompt = `${stylePrompt} Subject: ${description}. \n\nNegative Prompt: ${negativePrompt}`;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
            parts: [{ text: finalPrompt }]
        },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio
            }
        }
      });
      
      if (response.candidates && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                  return `data:image/png;base64,${part.inlineData.data}`;
              }
          }
      }
      return null;
  } catch (e) {
      console.error("Image gen failed", e);
      return null;
  }
};

export const generateMapImage = async (description: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;

  const negativePrompt = "text, grid lines, UI, blurry, distorted, low resolution, modern map symbols.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high quality, top-down fantasy world map. Style: Ancient cartography, parchment texture, ink drawings, highly detailed. Subject: ${description}. Negative Prompt: ${negativePrompt}` }]
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (e) {
    console.error("Map gen failed", e);
    return null;
  }
};
