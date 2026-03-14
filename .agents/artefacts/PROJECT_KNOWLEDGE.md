# Project Knowledge: DARE

## Overview
**DARE** (Dispositif d'analyse des risques et d'évaluation) is a client-side web application designed to help users conduct risk analyses following **ISO 27005** and the **ANSSI EBIOS RM** methodology.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Modern features like Grid and Flexbox), ES6+ JavaScript.
- **Data Storage**: `localStorage` (key: `dare_data`).
- **Architecture**: Single Page Application (SPA) behavior with dynamic loading of HTML fragments into a `.main-content` container.

## Project Structure
- `index.html`: Main entry point and layout shell (fixed sidebar, simplified navbar).
- `css/main.css`: Global styles and design system.
- `js/app.js`: Application controller, routing, and theme management.
- `js/data.js`: Data store implementation, persistence logic, and asynchronous initialization from JSON parameters.
- `parameters/`:
  - `defaults.json`: Default configuration for referentials (including stakeholder requirements).
  - `socles.json`: Library of security foundations.
- `pages/`: 
  - `atelier1/` to `atelier5/`: Workshop-specific HTML contents.
- `js/pages/`: Page-specific JavaScript logic.
- `js/components.js`: UI component library with automatic data-binding.
- `mermaid-editor/`: custom graphics engine for kill-chain diagrams.

## UI / Design System
- **Style**: Modernized Mac OS 7 inspiration.
- **Themes**: Light (Ivory/Bordeaux) and Dark (Deep Brown/Orange).
- **Core Components**:
  - Cards: `.card-square`, `.card-long`, `.card-extended`, `.folding-card` (3-cols / Scenarios).
  - Navigation: **Permanently fixed** tree-view sidebar with `.sidebar-footer` for global actions.
  - No overlap: Main content is strictly confined to its grid column to prevent sidebar masking.

## Key Features & Logic
- **Async Initialization**: `app.js` awaits `Store.init()`, which fetches `defaults.json` and `socles.json`.
- **Data Migration**: Automatically injects new referential categories (like `typesDependancePP`) into existing analysis data.
- **Dynamic Requirements**: Asset and Stakeholder cards update their requirement tables based on the selected type/dependency.

## Current State (March 2026)
- **Implemented**: Workshops 1 to 5 (partial) and all Referentials.
- **Navigation Refactor**: Transitioned to a fixed unified sidebar.
- **Stakeholder Refactor**: Converted to 3-column folding cards for consistency with Assets.
- **Global Action Fix**: Replaced burger menu with "[ Fichier ]" button.
- **Lessons Learned**:
  - **CSS Scoping**: Editor-specific styles (like Mermaid's) can leak and override global UI classes (e.g., `.modal`). Always use dual classes for visibility (e.g., `.hidden` + `.active`) if multiple style systems overlap.
  - **DOM Lifecycle**: Ensure all critical DOM elements are declared at the very start of `app.js` to avoid "missing element" errors during event listener attachment.
