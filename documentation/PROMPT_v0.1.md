# OmniWorld Architect - Vibe Coding Prompt

Use the following prompt to bootstrap or iterate upon the OmniWorld Architect application. It captures the functional requirements, architectural style, and aesthetic "vibe" of the project.

---

**Role:** World-Class Senior Frontend Engineer & UI/UX Designer.

**Project Name:** OmniWorld Architect

**Goal:** Build a comprehensive, local-first worldbuilding suite for RPG Game Masters and Game Developers using React 19.

**Aesthetics (The Vibe):**
- **Theme:** "Deep Space Slate". Dark mode only. Backgrounds are `slate-950`, surfaces `slate-900`. Borders are subtle `slate-800`.
- **Accents:** Indigo (`indigo-500`) for primary actions, Emerald for success/lore, Amber for maps.
- **Feel:** Professional, dense, high-performance. Think "Notion meets Unity Editor meets FoundryVTT".
- **Interaction:** Heavy use of **Resizable Split Panes**. Everything should feel like a desktop IDE inside the browser. Animations should be micro-interactions (`animate-in`, `zoom-in`).
- **Typography:** Inter font. Clean, legible, high contrast text (`slate-200`) on dark backgrounds.

**Technical Stack Constraints:**
- **Framework:** React 19 (Hooks, Functional Components).
- **Language:** TypeScript (Strict typing, no `any` unless absolutely necessary).
- **Styling:** Tailwind CSS (Utility-first).
- **Icons:** Lucide React.
- **Persistence:** Local-first architecture using `sql.js` (SQLite WASM) saved into IndexedDB. No backend server required.
- **AI Integration:** Google Gemini API (via `@google/genai`) for text and image generation, with a fallback architecture for Ollama (local LLM).

**Core Data Architecture:**
- The application manages a `WorldState` object containing all data.
- **Entities**: Polymorphic objects (Person, Location, Item, Faction, Lore) structured in a recursive tree (`parentId`).
- **Wiki**: Markdown-rich pages with `@` mention capabilities.
- **Maps**: Images with interactive pins linking to entities, supporting sub-maps (drill-down).
- **Timelines**: Custom calendar systems (fantasy months/days) with Chronicle, Gantt, and Calendar visualizations.
- Person entities can host characteristics, skills, portraits

**Feature Specifications (The Requirements):**

1.  **Dashboard & Navigation**:
    - A sidebar tree view for managing multiple worlds and sub-worlds.
    - Ability to Create, Load, and Delete worlds.
    - Stats overview (map counts, wiki & lore counts, entity counts, last played).

2.  **Entity Manager**:
    - **Left Pane**: Recursive Tree view of entities (Folders & Items). Drag & Drop support for hierarchy organization. Filter by type, parent, tags or part of description.
    - **Right Pane**:
        - **Detail View**: Form to edit Name, Type, Parent, Tags, Attributes (Key/Value pairs), Rich Text Description and attachments.
        - **Relationship Graph**: Force-directed graph visualization of connections between entities. Relationship graph can be resizer and filter on any entities dimensions.
        - **AI Actions**: "Generate Description", "Generate Portrait" buttons.

3.  **Map Manager**:
    - **Left Pane**: List/Tree of multilayered maps.
    - **Right Pane**: Canvas to view multilayered map images.
    - **Interactions**: Click to add Pins. Drag pins. Clicking a pin opens a mini-card for the linked Entity.
    - **Tools**: 
      Distance measurement tool (click point A, click point B, calculate based on scale).
      Pins selections tool (multiselect pins on additional layer to redirect to a filtered view of them )
    - ** Multilayered map **: 
      Possibility to select a specific layer to represent a subregion, geographic or historic map
    - **AI Actions**: "Generate Image from description" buttons.

4.  **Wiki & Lore**:
    - Notion-style Rich Text Editor.
    - Support for `# Headers`, `**Bold**`, `> Quotes`, and `![Images]`.
    - **Smart Mentions**: Typing `@` triggers a dropdown to link to other Maps, Entities or Wiki Pages.
    - **Auto-linking**: Detect entity names in text and automatically create links.
    - **AI Actions**: "interactive description", "summarize doc" buttons
    - **Export/import wiki**

5.  **Narrative Tools**:
    - **Scenarios**: Define linear plots with Scenes (Title, Description, Status).
    - **Sessions**: Chat interface where the AI acts as the Game Master. It must have context of the current World and Scenario.
    - **Timelines**:
        - Allow defining custom Calendar Systems (e.g., "Year of the Kraken", 13 months, 40 days per month).
        - **Chronicle View**: Linear list of events with filtering and groupment by millenia, centuries, years, months
        - **Calendar View**: Grid view respecting the custom calendar logic with filtering and groupment by millenia, centuries, years, months
        - **Gantt View**: Visualization of event durations and interlap with filtering and groupment by millenia, centuries, years, months

6.  **Relationships Matrix**:
    - A dedicated view to manage edges between nodes (Entities).
    - Table/List view of "Source -> Type -> Target".
    - **AI Actions**: "Generate Relationship from description" buttons.

7.  **Settings & Config**:
    - Toggle between AI Providers for text-to-text (Gemini Cloud vs Ollama Local), text-to-image.
    - Edit System Prompts (Entity Gen, Lore Gen, GM Chat).
    - Switch App Language (English/French).

8.  **Export/Import Bridges**:
    - **JSON**: Export/Import full world as JSON Actors.
    - **YAML**: Export/Import full world as YAML.

**Implementation Strategy:**
- Use a **Controller/Service pattern**. UI components (`features/`) should be dumb and rely on custom hooks (`hooks/`) for logic.
- **DatabaseService**: Encapsulate all SQL.js logic here.
- **AIService**: Use a Factory pattern to switch between Gemini and Ollama implementations transparently.
- **Components**: Create a shared `ResizableSplitPane`, `TreeItem`, and `RichTextEditor` to maintain consistency.

**Prompt for the AI**:
"Generate the code for [Specific Feature] following the architecture defined above. Ensure the UI is responsive, uses the dark 'Deep Space' theme, and implements the controller logic separately from the view."