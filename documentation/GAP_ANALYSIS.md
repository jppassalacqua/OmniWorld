# Gap Analysis: OmniWorld Architect

**Date:** 2024-05-22
**Version Analyzed:** v0.8 (Current Codebase)
**Target Spec:** PROMPT_v0.1.md

## 1. Executive Summary
The application has successfully implemented the core "skeleton" and major features defined in the initial prompt. The architectural pattern (Controller/Service, Local-First SQL.js) is robust. The UI adheres to the "Deep Space Slate" theme.

However, several "Quality of Life" features and complex interactions requested in the prompt are either missing or in a rudimentary state. The next phase should focus on **User Experience Refinement** and **Deep Feature Completion**.

## 2. Feature-by-Feature Analysis

### 2.1 Entity Manager
*   **Status:** ✅ Mostly Complete
*   **Implemented:** Tree view, Drag&Drop, Details, Relationships, AI Gen.
*   **Gap:**
    *   **Specific Sub-types:** The prompt requested "Person entities can host characteristics, skills, portraits". Currently, `attributes` is a generic Key/Value list. There is no specific UI for "Skills" or separate "Inventory" management beyond generic attributes.
    *   **Graph Filtering:** The Relationship Graph exists but lacks the requested "resizer and filter on any entities dimensions" controls.

### 2.2 Map Manager
*   **Status:** ⚠️ Partially Complete
*   **Implemented:** Multilayer structure, Image Gen, Pins, Basic Distance Measure.
*   **Gap:**
    *   **Pin Selection Tool:** The prompt requested "multiselect pins on additional layer to redirect to a filtered view". Currently, pins are single-click only.
    *   **Sub-region Mapping:** While layers exist, the logic to explicitly define a layer as a "subregion" (geographically bound) is loose. It's just a stack of images.

### 2.3 Wiki & Lore
*   **Status:** ⚠️ Functional but Basic
*   **Implemented:** Markdown editor, Slash commands, Manual `@` mentions.
*   **Gap:**
    *   **Auto-linking:** The prompt requested "Detect entity names in text and automatically create links". This feature is **missing**. The user must manually type `@` or `[` to link.
    *   **"Notion-style":** The current editor is a raw text area with Markdown injection. It is not a true "Block-based" editor (like Notion/Gutenberg). This makes drag-and-drop of images *into* text or rearranging paragraphs impossible.

### 2.4 Narrative Tools
*   **Status:** ✅ Good
*   **Implemented:** Scenarios, Sessions (AI GM), Timelines (Chronicle/Gantt/Calendar).
*   **Gap:**
    *   **Filtering:** The Timeline views are implemented but the advanced filtering/grouping logic (by millennia/centuries) is basic string grouping, lacking deep date logic for fantasy calendars.

### 2.5 Relationships Matrix
*   **Status:** ✅ Functional
*   **Implemented:** List view of edges.
*   **Gap:**
    *   **AI Generation:** "Generate Relationship from description" button is missing in this view.

## 3. Technical Debt & Architecture

### 3.1 Persistence (SQLite/Images)
*   **Current:** Images are converted to Base64 strings and stored directly in the `data` JSON blob inside SQLite.
*   **Risk:** This will bloat the database rapidly, potentially crashing the browser's memory allocation for `sql.js` (which loads the whole DB into RAM).
*   **Remediation:** Needs an abstraction to store Images in `IndexedDB` (Blob Store) separate from the SQLite relational data, storing only references (UUIDs) in SQL.

### 3.2 Type Safety vs 'Any'
*   **Observation:** Several components (EntityDetail, MapManager) use `any` props or state too liberally (`world: any`).
*   **Action:** Strict typing needs enforcement to prevent regression.

## 4. Prioritized Roadmap

1.  **Wiki Auto-Linking:** High value feature for Worldbuilders.
2.  **Image Storage Refactor:** Critical for app stability before users add too many maps.
3.  **Entity Templates:** Custom UI for "Skills" vs "Stats" based on Entity Type.
4.  **Map Multi-Select:** Advanced tooling for cartography.
