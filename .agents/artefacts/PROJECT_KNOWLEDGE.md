# Project Knowledge: DARE

## Overview
**DARE** (Dispositif d'analyse des risques et d'évaluation) is a client-side web application designed to help users conduct risk analyses following **ISO 27005** and the **ANSSI EBIOS RM** methodology.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Modern features like Grid and Flexbox), ES6+ JavaScript.
- **Data Storage**: `localStorage` (key: `dare_data`).
- **Architecture**: Single Page Application (SPA) behavior with dynamic loading of HTML fragments into a `.main-content` container.

## Project Structure
- `index.html`: Main entry point and layout shell (sidebar, top bar).
- `css/main.css`: Global styles and design system.
- `js/app.js`: Application controller, routing, and theme management.
- `js/data.js`: Data store implementation, persistence logic, and asynchronous initialization from JSON parameters.
- `parameters/`:
  - `defaults.json`: Default configuration for referentials and workshops.
  - `socles.json`: Library of security foundations (GHI, RGPD, ISO 27001, HDS).
- `pages/`: 
  - `atelier1/` to `atelier5/`: Workshop-specific HTML contents.
  - `referentiels/`: Reference data management pages (including the new `socle.html`).
  - `livrables/`: Export and reporting views.
- `js/pages/`: Page-specific JavaScript logic.
- `js/utils.js`: Core utility functions (ID generation, confirmation, chaining).
- `js/components.js`: UI component library with automatic data-binding.
- `mermaid-editor/`: custom graphics engine for kill-chain diagrams.
- `.agents/`: Agent workspaces, including:
  - `artefacts/`: Planning and reference documents.
  - `workflows/`: Automated procedures.

## UI / Design System
- **Style**: Modernized Mac OS 7 inspiration.
- **Themes**: Light (Ivory/Bordeaux) and Dark (Deep Brown/Orange).
- **Core Components**:
  - Cards: `.card-square`, `.card-long`, `.card-extended`.
  - Tables: `.table-square`, `.table-extended`.
- **Layout Rules**: 
  - Labels are always above input fields.
  - Tables use sticky headers and localized scrolling (`70vh`).

## Key Features & Logic
- **Async Initialization**: On startup, `app.js` awaits `Store.init()`, which fetches `defaults.json` and `socles.json`.
- **Socle de Sécurité**: 
    - Managed via `referentiels/socle.html`.
    - Unchecking a socle removes it from `localStorage`.
    - Checking a socle adds it to the active analysis data.
    - Support for CSV import of requirements.
- **Persistence**: Fully functional with JSON export/import via `localStorage` (key: `dare_data`).

## Current State (March 2026)
- **Implemented**: Workshops 1, 2, 3, 4 (Mermaid Editor), 5 (partial) and all Referentials.
- **Simplification (March 2026)**: Codebase refactored to use a declarative component-based approach with data-binding.
- **Recent Fixes**: Resolved major CSS collisions and data migration issues during refactoring.

