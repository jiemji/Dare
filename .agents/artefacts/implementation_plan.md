# Implementation Plan - Burger Menu & Data Management

Implement the core data management functions (Import, Export, Reset) and the Help page as specified in `design.md`.

## Proposed Changes

### [Component] Data Management (`js/data.js`)
- Add `exportJSON()` method to `DataStore` to trigger a browser download of the analysis data.
- Add `importJSON(data)` method to `DataStore` to validate and load external analysis data.
- Refine `clear()` method to ensure a fresh start.

### [Component] Application Controller (`js/app.js`)
- Hook up Burger Menu buttons:
    - `menu-new`: Confirmation dialog then `Store.clear()`.
    - `menu-save`: Triggers `Store.exportJSON()`.
    - `menu-load`: Triggers a file picker to import JSON via `Store.importJSON()`.
- Add `aide` to `pageStructure` and implement routing for `pages/aide.html`.

### [Component] Pages
- [NEW] `pages/aide.html`: Methodology guide and user manual for DARE.

### [Component] Layout Placeholders
- [MODIFY] Update placeholders for Atelier 4, Atelier 5, and Livrables to use the new `page-header` and `card-extended` classes for visual consistency.

## Verification Plan

### Automated Tests
- None (Client-side logic testing via browser).

### Manual Verification
1. **New Analysis**: Click "Nouvelle analyse", confirm, verify all data is reset (check referentials or Atelier 1).
2. **Export**: Enter some data, click "Sauvegarder", verify a `.json` file is downloaded.
3. **Import**: Refresh page (or start new), click "Charger", select the exported `.json`, verify data is restored.
4. **Help Page**: Click "Aide" in Burger Menu, verify the help page displays.
5. **UI Consistency**: Navigate to Atelier 4/5 placeholders, verify they align with the new design (Grid/Flex).
