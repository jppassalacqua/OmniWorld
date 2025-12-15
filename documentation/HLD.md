
# High-Level Design (HLD) - OmniWorld Architect

## 1. Project Overview
**OmniWorld Architect** is a client-side, local-first Single Page Application (SPA) designed for RPG worldbuilding. It allows users to create, structure, and visualize complex narrative worlds using AI assistance.

### Key Characteristics
- **Tech Stack**: React 19, TypeScript, Tailwind CSS, Vite.
- **Persistence**: Local-first using `sql.js` (SQLite WASM) backed by `IndexedDB`.
- **AI Integration**: Google Gemini (Primary) and Ollama (Local/Fallback).
- **Architecture**: Monolithic State with Service-Oriented Logic hooks.

---

## 2. Architecture & Directory Structure

The project follows a strict separation between **Business Logic** (Hooks) and **Presentation** (Components).

### 2.1 Directory Layout
```
/
├── components/         # Reusable UI Components (Presentational)
│   ├── Shared.tsx      # Barrel file for common UI atoms
│   ├── TreeItem.tsx    # Recursive tree rendering
│   ├── Inputs.tsx      # Specialized inputs (TagInput, AutoTextarea)
│   └── ...
├── features/           # Feature-Specific Views (Page Logic)
│   ├── Dashboard.tsx   # World selector
│   ├── EntityManager.tsx
│   ├── MapManager.tsx
│   └── ...
├── hooks/              # Business Logic & State Controllers
│   ├── useWorldController.ts  # Global app state
│   ├── useEntityController.ts # Entity specific logic
│   └── ...
├── services/           # Singleton Infrastructure Services
│   ├── databaseService.ts # SQLite/IndexedDB wrapper
│   ├── aiService.ts       # AI Provider Factory (Gemini/Ollama)
│   └── geminiService.ts   # Google SDK implementation
├── styles/
│   └── theme.ts        # Centralized Tailwind CSS Token definitions
├── types.ts            # Global TypeScript Interfaces
└── utils/              # Pure Functions & Helpers
```

### 2.2 Data Flow
1.  **Initialization**: `App.tsx` calls `useWorldController`.
2.  **Data Loading**: `databaseService` loads the active `WorldState` JSON blob from SQLite (IndexedDB).
3.  **State Management**: The global `world` object is passed down to Feature Components (e.g., `EntityManager`).
4.  **Local Logic**: Feature components initialize specific hooks (e.g., `useEntityController`) which accept `world` and `setWorld`.
5.  **Updates**: Controllers modify the local state copy and trigger `setWorld`.
6.  **Persistence**: `useWorldController` triggers `databaseService.saveWorld()` on changes.

---

## 3. Data Model

The data model is a hierarchical, relational document structure stored as a JSON blob within the `worlds` table of the SQLite database.

### 3.1 Core Entity (`Entity`)
The fundamental building block.
- **Hierarchy**: Uses `parentId` to create infinite nesting (Folder/File structure).
- **Polymorphism**: `type` enum defines behavior (LOCATION, NPC, ITEM, etc.).
- **Localization**: `name` and `description` are `LocalizedText` objects (keys: 'en', 'fr').

```typescript
interface Entity {
  id: string;
  parentId?: string; // Recursive link
  type: 'LOCATION' | 'NPC' | 'ITEM' | 'FACTION' | 'LORE';
  name: { [lang: string]: string };
  description: { [lang: string]: string };
  attributes: { key: string; value: string }[]; // Flexible stats
  relationships: { targetId: string; type: string }[]; // Graph edges
  tags: string[];
  imageUrl?: string;
}
```

### 3.2 World State (`WorldState`)
The Root Aggregate.
```typescript
interface WorldState {
  id: string;
  parentId?: string; // For Sub-worlds
  language: 'en' | 'fr';
  entities: Entity[];
  wikiPages: WikiPage[];
  maps: WorldMap[]; // Visual maps with pins
  scenarios: Scenario[];
  sessions: Session[]; // Chat history with AI GM
  timelines: Timeline[];
  system: GameSystem; // RPG Ruleset metadata
}
```

---

## 4. Coding Strategy & Guidelines

### 4.1 UI/UX Strategy
- **Theme First**: Do not hardcode colors. Use `styles/theme.ts` (e.g., `THEME.colors.primary`).
- **Layout**: Use `ResizableSplitPane` for all Manager views (Sidebar + Content).
- **Interactivity**:
    - Use `TreeItem` for hierarchical navigation.
    - Enable **Drag & Drop** for ordering and hierarchy management.
    - Hover effects indicate interactivity.
- **Responsiveness**: All containers must be `flex` and `h-full` to fit the viewport.

### 4.2 Logic Abstraction
- **No Logic in Views**: Components in `features/` should mostly contain JSX. Logic must be extracted to `hooks/useXController.ts`.
- **Controller Pattern**:
    - Input: `(world, setWorld)`
    - Output: `{ stateVariables, handlers, computedValues }`
    - Example: `handleMoveEntity`, `filteredEntities`.

### 4.3 AI Integration
- **Service Factory**: Use `AIServiceFactory` to abstract the provider.
- **Prompt Engineering**: Prompts are defined in `services/geminiService.ts`. They must output strictly formatted JSON using `responseSchema` (Gemini) or instruction tuning (Ollama).
- **Key Injection**: `process.env.API_KEY` is injected at build/runtime. Never request it in UI.

### 4.4 Refactoring Rules
1.  **Factorize**: If a UI pattern appears twice (e.g., a list item), make it a component.
2.  **Centralize**: If a logic pattern appears twice (e.g., ID generation), move to `utils/`.
3.  **Type Safety**: No `any`. Use defined interfaces in `types.ts`.

---

## 5. Feature Specifications

### 5.1 Dashboard
- **Goal**: Manage multiple worlds.
- **UI**: Grid of Cards + Sidebar Tree.
- **Logic**: Load/Save/Delete from `databaseService`. Supports Sub-worlds (worlds inside worlds).

### 5.2 Entity Manager
- **Goal**: Manage NPCs, Locations, Items.
- **Views**: List (Tree) and Graph (Node-Link).
- **Features**:
    - Recursive Drag & Drop for hierarchy.
    - AI Image Generation (Gemini Imagen).
    - AI Text Generation (Description/Stats).
    - Relationship mapping.

### 5.3 Map Manager
- **Goal**: visual world navigation.
- **Features**:
    - Image upload or AI Generation.
    - Interactive Pins (linked to Entities).
    - Sub-maps (drill-down navigation).
    - Distance measurement tool.

### 5.4 Wiki Manager
- **Goal**: Text-heavy lore documentation.
- **Features**:
    - Markdown editor (`RichTextEditor`).
    - `@` mentions to link Entities/Pages.
    - Auto-linking.

### 5.5 Narrative Tools
- **Scenario**: Linear plot hooks (Scenes).
- **Session**: Chat interface with AI Game Master (System Prompt + Context Injection).
- **Timeline**: Chronological event tracking.

---

## 6. Deployment Strategy

### 6.1 Build
- **Tool**: Vite.
- **Output**: Static HTML/JS/CSS bundle (`dist/`).

### 6.2 Environments
- **Local**: `npm start` (Hot Reload).
- **Production**: Static hosting (Vercel, Netlify, Docker/Nginx).
- **Config**: Requires `API_KEY` environment variable for Gemini features.

### 6.3 Dockerfile Reference
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN npm install && npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```
