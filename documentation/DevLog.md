
# Developer Log

## [Init] Project Bootstrap
- Initialized React 19 + TypeScript + Tailwind CSS structure.
- Integrated `sql.js` for local-first SQLite persistence.
- Set up `geminiService.ts` and `ollamaService.ts` for AI operations.

## [Feature] Narrative Tools Implementation
- **Session Manager**: Added AI Game Master chat interface. Supports context-aware responses (World + Scenario context).
- **Scenario Manager**: Implemented Scenario and Scene management. Added AI Scenario Generation using `generateScenarioHook`.
- **Timeline Manager**: Created multi-view timeline (Chronicle, Gantt, Calendar) supporting custom calendar systems.
- **Relationship Matrix**: Added a dedicated view to manage and visualize relationships between all entities in a table format.

## [Update] Entity Management
- Added "Export to Foundry VTT" button in `EntityDetail`.
- Integrated `ImageManager` for entity visuals (Upload/Download/Generate).

## [Architecture] Refactoring
- Factored out logic into `useNarrativeController` hook.
- Centralized `NarrativeManagers.tsx` to group narrative-related views.
- Updated `App.tsx` routing to include new managers and pass `aiService` correctly.
