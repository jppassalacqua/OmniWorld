
export type SupportedLanguage = 'fr' | 'en';

export type LocalizedText = Record<string, string>;

export enum EntityType {
  LOCATION = 'LOCATION',
  NPC = 'NPC',
  ITEM = 'ITEM',
  FACTION = 'FACTION',
  LORE = 'LORE'
}

// --- Configuration & Settings Types ---

export enum AIProvider {
  GEMINI = 'GEMINI',
  OLLAMA = 'OLLAMA'
}

export interface SystemPrompts {
  entityGen: string;
  loreGen: string;
  scenarioGen: string;
  chatGen: string;
}

export interface AppSettings {
  aiProvider: AIProvider;
  geminiApiKey?: string;
  ollamaUrl: string; // e.g., "http://localhost:11434"
  ollamaModel: string; // e.g., "llama3"
  language: SupportedLanguage;
  systemPrompts: SystemPrompts;
}

// --- Domain Models ---

export interface Attribute {
  key: string;
  value: string | number;
}

export interface Relationship {
  targetId: string;
  type: string; 
}

export interface Entity {
  id: string;
  parentId?: string;
  name: LocalizedText;
  type: EntityType;
  subtype?: string;
  group?: string;
  description: LocalizedText;
  tags: string[];
  attributes: Attribute[];
  relationships: Relationship[];
  imageUrl?: string;
}

export interface Scene {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  type: 'exploration' | 'social' | 'combat' | 'puzzle';
  status: 'pending' | 'active' | 'completed';
}

export interface Scenario {
  id: string;
  title: LocalizedText;
  synopsis: LocalizedText;
  scenes: Scene[];
  involvedEntities: string[]; 
}

export interface Attachment {
  type: 'image' | 'map' | 'audio';
  url: string;
  label: string;
  entityId?: string;
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'system' | 'gm';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Session {
  id: string;
  name: string;
  scenarioId?: string;
  activeSceneId?: string;
  date: string;
  activeEntityIds: string[];
  messages: SessionMessage[];
  status: 'active' | 'completed';
}

export interface GameSystem {
  name: string;
  stats: string[]; 
  mechanic: string;
}

export interface MapPin {
  id: string;
  x: number;
  y: number;
  entityId: string;
}

export interface WorldMap {
  id: string;
  parentId?: string;
  parentX?: number; // Position X (%) on parent map
  parentY?: number; // Position Y (%) on parent map
  associatedEntityId?: string;
  name: string;
  description?: string;
  imageUrl: string;
  pins: MapPin[];
  scale?: number; // Total width of map in units
  distanceUnit?: string; // e.g., "km", "miles"
}

export interface LoreSection {
  id: string;
  title: LocalizedText;
  content: LocalizedText;
}

export interface WikiPage {
  id: string;
  parentId?: string;
  title: LocalizedText;
  content: LocalizedText;
  tags: string[];
  imageUrl?: string;
  properties: Attribute[];
  isTemplate?: boolean;
  isFavorite?: boolean;
}

// --- Timeline & Calendar ---

export interface CalendarMonth {
  name: string;
  days: number;
}

export interface CalendarSystem {
  id: string;
  name: string;
  months: CalendarMonth[];
  weekDays: string[];
  currentYear: number;
}

export interface TimelineEvent {
  id: string;
  timelineId: string;
  title: string;
  description: string;
  year: number;
  month: number;
  day: number;
  time?: string;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  involvedEntityIds: string[];
  color?: string;
}

export interface Timeline {
  id: string;
  title: string;
  calendarId: string;
}

export interface WorldState {
  id: string;
  parentId?: string;
  language: SupportedLanguage;
  name: LocalizedText;
  description: LocalizedText;
  loreSections: LoreSection[]; 
  wikiPages: WikiPage[];
  entities: Entity[];
  scenarios: Scenario[];
  sessions: Session[];
  maps: WorldMap[];
  system: GameSystem;
  calendars: CalendarSystem[];
  timelines: Timeline[];
  events: TimelineEvent[];
}

export interface UnityExportData {
  worldName: string;
  assets: {
    guid: string;
    name: string;
    type: string;
    data: string;
  }[];
}

export interface FoundryActor {
  name: string;
  type: string;
  img: string;
  system: {
    description: { value: string };
    attributes: Record<string, any>;
  };
}

export interface TreeNode { 
  id: string; 
  label: string; 
  type: 'folder' | 'item'; 
  data?: any; 
  children?: TreeNode[]; 
  icon?: any; 
}
