# OmniWorld Architect - Development Prompt (v1.0)

**Project Phase:** Refinement & Deep Feature Integration.
**Current State:** Solid MVP. Core architecture (React 19, SQLite, Gemini/Ollama) is stable. Main Managers (Entity, Map, Wiki, Narrative) are functional.

**Goal:** Transform the current "Functional MVP" into a "Power Tool". Focus on data inter-connectivity (Auto-linking), specific entity behaviors (Templates), and performance stability (Image handling).

---

## 1. Architectural Improvements

### A. Image Storage Refactor (Critical)
*   **Problem:** Currently, images (Base64) are stored inside the JSON blob in SQLite. This will crash the app with large maps.
*   **Requirement:** 
    *   Create a `ImageStoreService` wrapping IndexedDB directly.
    *   When an image is uploaded/generated, save it to `ImageStoreService` and get a UUID.
    *   Store only the UUID in the `WorldState` / SQLite.
    *   Create a generic `<ImageLoader id={uuid} />` component that asynchronously fetches the Blob URL.

### B. Strict Typing
*   **Problem:** Controllers (`useEntityController`, etc.) often use `any` for the `world` object.
*   **Requirement:** Refactor all Hooks and Components to use the strict `WorldState` interface.

---

## 2. Feature Upgrades

### A. Wiki & Lore: "The Brain"
*   **Auto-Linking:** 
    *   Add a "Scan & Link" button to the Wiki Editor.
    *   Logic: Regex scan the current page text against the `world.entities` names.
    *   Action: Replace occurrences of "Gandalf" with `[Gandalf](entity:uuid)` automatically, unless already linked.
*   **Backlinks:**
    *   In the `WikiManager` and `EntityDetail`, display a "Mentions" or "Backlinks" section showing which other pages/entities link TO the current one.

### B. Entity Manager: "Templates"
*   **Flexible Forms:** 
    *   Instead of a generic "Attributes" list for all types, implement conditional rendering based on `entity.type`.
    *   **NPCs:** Show specific "Skills", "Inventory", and "Personality Traits" sections.
    *   **Locations:** Show "Climate", "Population", "Danger Level".
*   **Template Editor:** (Bonus) Allow user to define keys for these templates in Settings.

### C. Map Manager: "Tactical View"
*   **Multi-Select:**
    *   Allow holding `Shift` + Drag to create a selection box.
    *   Select multiple Pins.
    *   Action: "Open Selected" (opens a side-by-side list) or "Move Selected".
*   **Layer Filtering:**
    *   Add a toggle to "Hide Pins from other layers" vs "Show Ghost Pins".

### D. Narrative Tools
*   **Dice Roller:** 
    *   Add a floating Dice Roller component (3D or 2D physics) usable in the Session Chat.
    *   Support complex formulas (`/roll 2d20 + 1d4 + 5`).

---

## 3. UI/UX Polish

*   **Command Palette (Cmd+K):** 
    *   Ensure it can navigate to *specific* entities, not just views.
    *   Add "Quick Actions" (e.g., "Create New NPC", "Generate Map").
*   **Keyboard Shortcuts:**
    *   `Ctrl+S`: Save World.
    *   `Ctrl+Enter`: Send Chat/Confirm Edit.
    *   `Esc`: Close Modals/Palettes.

---

## 4. Coding Instructions

When asking for code updates, reference this prompt.
**Style:** Maintain the "Deep Space Slate" theme.
**Pattern:** Continue using `hooks/use[Feature]Controller.ts` for logic. Do not put business logic in JSX files.

**Example Request:**
"Implement the **Wiki Auto-Linking** feature defined in PROMPT v1.0. Update `useWikiController.ts` to handle the text scanning logic and `WikiManager.tsx` to add the button."
