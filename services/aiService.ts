
import { AppSettings, EntityType, GameSystem, SessionMessage, SupportedLanguage } from "../types";
import { generateEntityDescription as geminiEntity, generateWorldLore as geminiLore, generateScenarioHook as geminiScenario, continueSessionChat as geminiChat, generateEntityImage as geminiImage, generateMapImage as geminiMap, translateText as geminiTranslate, summarizeText as geminiSummarize } from "./geminiService";
import { generateEntityDescription as ollamaEntity, generateWorldLore as ollamaLore, generateScenarioHook as ollamaScenario, continueSessionChat as ollamaChat, translateText as ollamaTranslate } from "./ollamaService";

// --- Interfaces ---

export interface IAIService {
  generateEntityDescription(name: string, type: EntityType, worldContext: string, system: GameSystem, lang: SupportedLanguage): Promise<{ description: string; attributes: any }>;
  generateWorldLore(worldName: string, worldContext: string, genre: string, sections: string[], lang: SupportedLanguage): Promise<{ sections: { title: string; content: string }[] }>;
  generateScenarioHook(worldContext: string, entities: string[], lang: SupportedLanguage): Promise<{ title: string; synopsis: string; scenes: any[]; newEntities: any[] }>;
  continueSessionChat(worldContext: string, scenarioContext: string, history: SessionMessage[], lang: SupportedLanguage): Promise<{ response: string; newEntities: any[] }>;
  generateImage(prompt: string, type: 'entity' | 'map', entityType?: EntityType): Promise<string | null>;
  translateText(text: string, targetLang: SupportedLanguage): Promise<string>;
  summarizeText(text: string, lang: SupportedLanguage): Promise<string>;
}

// --- Factory ---

export class AIServiceFactory {
  static getService(settings: AppSettings): IAIService {
    if (settings.aiProvider === 'OLLAMA') {
      return new OllamaServiceImpl(settings);
    }
    return new GeminiServiceImpl(settings);
  }
}

// --- Implementations ---

class GeminiServiceImpl implements IAIService {
  private settings: AppSettings;
  
  constructor(settings: AppSettings) {
      this.settings = settings;
  }

  async generateEntityDescription(name: string, type: EntityType, worldContext: string, system: GameSystem, lang: SupportedLanguage) {
    return geminiEntity(name, type, worldContext, system, lang, this.settings.systemPrompts.entityGen);
  }
  async generateWorldLore(worldName: string, worldContext: string, genre: string, sections: string[], lang: SupportedLanguage) {
    return geminiLore(worldName, worldContext, genre, sections, lang, this.settings.systemPrompts.loreGen);
  }
  async generateScenarioHook(worldContext: string, entities: string[], lang: SupportedLanguage) {
    return geminiScenario(worldContext, entities, lang, this.settings.systemPrompts.scenarioGen);
  }
  async continueSessionChat(worldContext: string, scenarioContext: string, history: SessionMessage[], lang: SupportedLanguage) {
    return geminiChat(worldContext, scenarioContext, history, lang, this.settings.systemPrompts.chatGen);
  }
  async generateImage(prompt: string, type: 'entity' | 'map', entityType?: EntityType) {
    if (type === 'map') return geminiMap(prompt);
    return geminiImage(prompt, entityType);
  }
  async translateText(text: string, targetLang: SupportedLanguage) {
    return geminiTranslate(text, targetLang);
  }
  async summarizeText(text: string, lang: SupportedLanguage) {
    return geminiSummarize(text, lang);
  }
}

class OllamaServiceImpl implements IAIService {
  private settings: AppSettings;

  constructor(settings: AppSettings) {
    this.settings = settings;
  }

  async generateEntityDescription(name: string, type: EntityType, worldContext: string, system: GameSystem, lang: SupportedLanguage) {
    return ollamaEntity(this.settings, name, type, worldContext, system, lang, this.settings.systemPrompts.entityGen);
  }
  async generateWorldLore(worldName: string, worldContext: string, genre: string, sections: string[], lang: SupportedLanguage) {
    return ollamaLore(this.settings, worldName, worldContext, genre, sections, lang, this.settings.systemPrompts.loreGen);
  }
  async generateScenarioHook(worldContext: string, entities: string[], lang: SupportedLanguage) {
    return ollamaScenario(this.settings, worldContext, entities, lang, this.settings.systemPrompts.scenarioGen);
  }
  async continueSessionChat(worldContext: string, scenarioContext: string, history: SessionMessage[], lang: SupportedLanguage) {
    return ollamaChat(this.settings, worldContext, scenarioContext, history, lang, this.settings.systemPrompts.chatGen);
  }
  async generateImage(prompt: string, type: 'entity' | 'map', entityType?: EntityType) {
    console.warn("Ollama does not support image generation natively yet.");
    return null; 
  }
  async translateText(text: string, targetLang: SupportedLanguage) {
    return ollamaTranslate(this.settings, text, targetLang);
  }
  async summarizeText(text: string, lang: SupportedLanguage) {
     return "Summarization not implemented for Ollama yet.";
  }
}
