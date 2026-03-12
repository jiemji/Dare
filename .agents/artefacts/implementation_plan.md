# Implementation Plan - Atelier 5 / Plan de traitement

This plan covers the creation of the "Plan de traitement du risque" page for Atelier 5.

## Proposed Changes

### Data Model
#### [MODIFY] [data.js](file:///g:/devapps/Dare/js/data.js)
- Add `atelier5` object to `defaultData` and `DataStore` to store treatment plans.
- Structure for security measures grouped by action type (gouvernance, protection, détection, réaction, résilience).

### UI / Routing
#### [MODIFY] [app.js](file:///g:/devapps/Dare/js/app.js)
- Update `pageStructure.atelier5` to include the script `js/pages/atelier5.js`.

### New Files
#### [NEW] [plan.html](file:///g:/devapps/Dare/pages/atelier5/plan.html)
- Create the HTML structure with containers for the 5 action types.
- Add a template for the security measure cards (long cards).

#### [NEW] [atelier5.js](file:///g:/devapps/Dare/js/pages/atelier5.js)
- Implement logic to load/save security measures.
- Implement auto-increment logic for MES## references.
- Implement add/delete functions.

## Verification Plan

### Manual Verification
1. Navigate to "Atelier 5" using the top navbar.
2. Select "Plan de traitement" in the sidebar.
3. Verify that the 5 sections (Gouvernance, Protection, Détection, Réaction, Résilience) are visible.
4. Click "+ Ajouter une mesure" in each section and verify a card is added.
5. Verify the reference auto-increments (MES01, MES02, etc.).
6. Fill in some data, change the priority, and save (using the disk icon in navbar or switching pages).
7. Reload the page and verify the data persists.
8. Delete a measure and verify it's removed.
