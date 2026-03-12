# Technical Reference: UI & Data Management

This document serves as a persistent memory for the DARE application architecture and design choices implemented during the March 2026 sprint.

## 1. UI Architecture
The application uses a custom Design System built with Vanilla CSS, Grid, and Flexbox.

### Component Specifications
| Component | Class | Width | Alignment | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Card Square** | `.card-square` | 300-400px | Vertical | Stakeholders, Risks |
| **Card Long** | `.card-long` | 100% | Horizontal | Threats, Security Measures |
| **Card Extended**| `.card-extended` | 400px+ (Flex) | Vertical | Business Processes, Forms |
| **Table Square** | `.table-square` | Max 400px | N/A | Scales, Small Matrices |
| **Table Extended**| `.table-extended`| Flexible | N/A | Main data tables |

### Key Layout Rules
- **Form Labels**: Always `display: block` and positioned above the input field.
- **Containers**: All card containers (`#processus-container`, etc.) must be `display: flex` with `flex-wrap: wrap` to allow cards to align/stretch.
- **Scrolling**: Tables are limited to `70vh` height with `sticky` headers and internal `overflow-y: auto`.

## 2. Data Management (`js/data.js`)
- **Persistence**: Data is saved to `localStorage` under the key `dare_data`.
- **Atelier 5 Expansion**: The `Store` handles security measures grouped by type (Gouvernance, Protection, Détection, Réaction, Résilience).
- **Export/Import**: JSON-based. The `DataStore` class handles `exportJSON()` (download) and `importJSON(file)` (upload + validation).
- **Reset**: "New Analysis" clears the `localStorage`.

## 3. Page Structure (`js/app.js`)
- Pages are loaded dynamically into `.main-content`.
- The `pageStructure` object in `app.js` defines the mapping between IDs, HTML file paths, and scripts.
- **Custom Events**: When a page with a script is re-navigated to, a `pageLoaded:<pageId>` event is dispatched to allow re-initialization (used in `atelier5.js`).
