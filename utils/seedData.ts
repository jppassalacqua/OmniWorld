
import { Entity, EntityType, WorldState, WorldMap, Scenario, SupportedLanguage, CalendarSystem, Timeline, TimelineEvent, WikiPage } from "../types";

const generateId = () => crypto.randomUUID();

// --- seed Max generation
const seedMax = 5;

// --- Helpers for Procedural Names ---

const ADJECTIVES = {
  fr: ["Ancien", "Brisé", "Sanglant", "Oublié", "Sombre", "Bronze", "Pierre", "Humide", "Sauvage", "Perdu", "Céleste", "Maudit", "Silencieux", "Venteux", "Brûlant"],
  en: ["Ancient", "Broken", "Bloody", "Forgotten", "Dark", "Bronze", "Stone", "Damp", "Wild", "Lost", "Celestial", "Cursed", "Silent", "Windy", "Burning"]
};

const FACTION_NAMES = {
  fr: ["L'Ordre du Serpent", "Les Fils du Bronze", "Le Cercle Cendré", "La Garde Noire", "Les Marcheurs de Brume"],
  en: ["Order of the Serpent", "Sons of Bronze", "The Ash Circle", "The Black Guard", "Mist Walkers"]
};

const FAMILY_NAMES = {
  fr: ["Maison Kael", "Lignée Dorn", "Famille Vane", "Clan Oakhart", "Dynastie Sol"],
  en: ["House Kael", "Dorn Lineage", "Vane Family", "Oakhart Clan", "Sol Dynasty"]
};

const ITEM_TYPES = {
  fr: ["Arme", "Armure", "Potion", "Relique", "Outil"],
  en: ["Weapon", "Armor", "Potion", "Relic", "Tool"]
};

const LOCATION_TYPES = {
  fr: ["Continent", "Pays", "Région", "Cité", "Lieu"],
  en: ["Continent", "Country", "Region", "City", "Location"]
};

const generateName = (base: string, index: number, lang: 'fr'|'en') => {
  const adj = ADJECTIVES[lang][index % ADJECTIVES[lang].length];
  return lang === 'fr' ? `${base} ${adj}` : `${adj} ${base}`;
};

export const getEmptyWorldState = (parentId?: string): WorldState => {
  const defaultCalendarId = generateId();
  return {
    id: generateId(),
    parentId,
    language: 'en',
    name: { en: "New World", fr: "Nouveau Monde" },
    description: { en: "A blank canvas for your imagination.", fr: "Une toile vierge pour votre imagination." },
    loreSections: [],
    wikiPages: [],
    entities: [],
    scenarios: [],
    sessions: [],
    maps: [],
    system: { name: "Generic System", stats: ["Strength", "Agility", "Intelligence"], mechanic: "d20" },
    calendars: [{
      id: defaultCalendarId,
      name: "Standard Calendar",
      currentYear: 1000,
      months: [
        { name: "Month 1", days: 30 }, { name: "Month 2", days: 30 }, { name: "Month 3", days: 30 },
        { name: "Month 4", days: 30 }, { name: "Month 5", days: 30 }, { name: "Month 6", days: 30 },
        { name: "Month 7", days: 30 }, { name: "Month 8", days: 30 }, { name: "Month 9", days: 30 },
        { name: "Month 10", days: 30 }, { name: "Month 11", days: 30 }, { name: "Month 12", days: 30 }
      ],
      weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }],
    timelines: [{ id: generateId(), title: "Main History", calendarId: defaultCalendarId }],
    events: []
  };
};

export const getInitialWorldState = (parentId?: string): WorldState => {
  const entities: Entity[] = [];
  const maps: WorldMap[] = [];

  // 1. Create Main World Map
  const mainMapId = generateId();
  const mainMap: WorldMap = {
    id: mainMapId,
    name: "Oera (World Map)",
    imageUrl: "https://picsum.photos/seed/oera_world_map/1920/1080?grayscale&blur=2",
    pins: []
  };

  // --- LOCATIONS (25 Total) ---
  const createLoc = (subtypeIndex: number, nameBaseFr: string, nameBaseEn: string, i: number) => {
    const id = generateId();
    const typeFr = LOCATION_TYPES.fr[subtypeIndex];
    const typeEn = LOCATION_TYPES.en[subtypeIndex];
    
    // Sub-map for location
    maps.push({
      id: generateId(),
      parentId: mainMapId, // Link to World Map
      associatedEntityId: id, // Link map to the location
      name: `${generateName(nameBaseEn, i, 'en')} Map`,
      imageUrl: `https://picsum.photos/seed/${id}_map/1024/768?grayscale`,
      pins: []
    });

    // Pin on main map (random distribution)
    mainMap.pins.push({
      id: generateId(),
      x: Math.floor(Math.random() * 90) + 5,
      y: Math.floor(Math.random() * 90) + 5,
      entityId: id
    });

    entities.push({
      id,
      name: { fr: generateName(nameBaseFr, i, 'fr'), en: generateName(nameBaseEn, i, 'en') },
      type: EntityType.LOCATION,
      subtype: typeEn, // Using EN as key for grouping, or could use localized key
      description: { 
        fr: `Un(e) ${typeFr} vaste et mystérieux(se).`,
        en: `A vast and mysterious ${typeEn}.`
      },
      tags: ["Bronze Age", typeEn],
      attributes: [{ key: "Type", value: typeEn }],
      relationships: [],
      imageUrl: `https://picsum.photos/seed/${id}/800/600`
    });
  };

  let idx = 0;
  // 1 Continent
  createLoc(0, "Terres", "Lands", idx++);
  
  // 2 Countries
  for(let c=0; c<2; c++) {
    createLoc(1, "Royaume", "Kingdom", idx++);
    // 2 Regions per Country
    for(let r=0; r<2; r++) {
      createLoc(2, "Province", "Province", idx++);
      // 2 Cities per Region
      for(let ci=0; ci<2; ci++) {
         createLoc(3, "Cité", "City", idx++);
         // 1 Specific Place per City
         createLoc(4, "Ruines", "Ruins", idx++);
      }
    }
  }
  // Remaining places to reach 25 (Current: 1 + 2 + 4 + 8 + 8 = 23. Need 2 more)
  createLoc(4, "Grotte", "Cave", idx++);
  createLoc(4, "Autel", "Altar", idx++);


  // --- NPCs (seedMax Total) - Grouped by Faction and Family ---
  for (let i = 0; i < seedMax; i++) {
    const isNoble = i % 5 === 0; // 20% nobles
    const factionIndex = i % 5;
    const familyIndex = i % 5;
    
    const groupName = isNoble ? FAMILY_NAMES.en[familyIndex] : FACTION_NAMES.en[factionIndex];
    const groupNameFr = isNoble ? FAMILY_NAMES.fr[familyIndex] : FACTION_NAMES.fr[factionIndex];

    const id = generateId();
    entities.push({
      id,
      name: { fr: `Personnage ${i}`, en: `Character ${i}` },
      type: EntityType.NPC,
      group: groupName, // Grouping Key
      description: { 
        fr: `Membre de ${groupNameFr}.`, 
        en: `Member of ${groupName}.` 
      },
      tags: ["NPC", groupName],
      attributes: [{ key: "Role", value: isNoble ? "Noble" : "Warrior" }],
      relationships: [],
      imageUrl: `https://picsum.photos/seed/${id}/400/400`
    });
  }

  // --- ITEMS (seedMax Total) - Grouped by Type ---
  for (let i = 0; i < seedMax; i++) {
    const typeIndex = i % 5;
    const typeEn = ITEM_TYPES.en[typeIndex];
    const typeFr = ITEM_TYPES.fr[typeIndex];
    
    const id = generateId();
    entities.push({
      id,
      name: { fr: `${typeFr} ${ADJECTIVES.fr[i%10]}`, en: `${ADJECTIVES.en[i%10]} ${typeEn}` },
      type: EntityType.ITEM,
      subtype: typeEn, // Grouping Key
      description: { fr: `Un objet rare.`, en: `A rare item.` },
      tags: ["Item", typeEn],
      attributes: [{ key: "Value", value: Math.floor(Math.random() * 100) }],
      relationships: [],
      imageUrl: `https://picsum.photos/seed/${id}/400/400?grayscale`
    });
  }

  maps.push(mainMap);

  // Scenario
  const scenarioId = generateId();
  const initiationScenario: Scenario = {
    id: scenarioId,
    title: { fr: "Le Grand Tour", en: "The Grand Tour" },
    synopsis: { 
      fr: "Un voyage épique traversant les 25 lieux connus.",
      en: "An epic journey traversing all 25 known locations."
    },
    involvedEntities: entities.slice(0, 5).map(e => e.id),
    scenes: [
      {
        id: generateId(),
        title: { fr: "Le Départ", en: "The Departure" },
        description: { fr: "L'aventure commence.", en: "The adventure begins." },
        type: 'exploration',
        status: 'active'
      }
    ]
  };

  // --- Calendar & Timeline Seed ---
  const calendarId = generateId();
  const calendar: CalendarSystem = {
    id: calendarId,
    name: "Imperial Calendar",
    currentYear: 1245,
    months: [
      { name: "Frostfall", days: 30 }, { name: "Sun's Wake", days: 30 }, { name: "Bloom", days: 31 },
      { name: "Goldheight", days: 31 }, { name: "Harvest", days: 30 }, { name: "Deadmoon", days: 30 }
    ],
    weekDays: ["Starday", "Moonday", "Truday", "Wardsday", "Freeday"]
  };

  const timelineId = generateId();
  const timeline: Timeline = {
    id: timelineId,
    title: "History of Oera",
    calendarId
  };

  const events: TimelineEvent[] = [
    {
      id: generateId(), timelineId, title: "The Bronze Collapse", description: "The old empires fell due to mysterious sea raiders.",
      year: 800, month: 0, day: 1, involvedEntityIds: [entities[0].id], color: "#ef4444"
    },
    {
      id: generateId(), timelineId, title: "Foundation of the Kingdom", description: "The first stones of the capital were laid.",
      year: 950, month: 2, day: 15, involvedEntityIds: [entities[2].id], color: "#3b82f6"
    },
    {
      id: generateId(), timelineId, title: "The Long War", description: "A decade of strife between the nobles.",
      year: 1000, month: 0, day: 1, endYear: 1010, endMonth: 0, endDay: 1, involvedEntityIds: [entities[25].id], color: "#eab308"
    }
  ];

  // --- Wiki Pages Seed ---
  const rootPageId = generateId();
  const wikiPages: WikiPage[] = [
    {
      id: rootPageId,
      title: { en: "Introduction", fr: "Introduction" },
      content: { en: "Welcome to the world of Oera. This wiki contains all the lore.", fr: "Bienvenue sur Oera." },
      tags: ["meta"],
      properties: [],
      isFavorite: true
    },
    {
      id: generateId(),
      parentId: rootPageId,
      title: { en: "Cosmology", fr: "Cosmologie" },
      content: { en: "The world is flat and carried by four elephants.", fr: "Le monde est plat." },
      tags: ["lore", "magic"],
      properties: []
    }
  ];


  return {
    id: generateId(),
    parentId,
    language: 'fr',
    name: { fr: "Oera (Âge du Bronze)", en: "Oera (Bronze Age)" },
    description: {
      fr: "Un monde de Low Fantasy brutal.",
      en: "A brutal Low Fantasy world."
    },
    loreSections: [],
    wikiPages,
    system: { name: "Bronze & Bone", stats: ["MIGHT", "WITS"], mechanic: "d6 Pool" },
    entities,
    scenarios: [initiationScenario],
    sessions: [],
    maps,
    calendars: [calendar],
    timelines: [timeline],
    events
  };
};
