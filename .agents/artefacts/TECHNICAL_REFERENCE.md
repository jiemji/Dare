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

## 2. Utils & Helper Layer (`js/utils.js`)
Centralized logic for common tasks:
- `generateNextId(list, prefix)`: Consistent sequential IDs (e.g., 'VM01').
- `confirmAction(message, onConfirm)`: Standardized confirm modal wrapper.
- `tap(val, fn)`: Chaining tool for DOM/Object manipulation.
- `withId(el, id)`: Shortcut to set `data-id`.

## 3. Data Management & Binding (`js/data.js`, `js/components.js`)
- **Self-Binding UI**: Components (`inputGroup`, `selectGroup`) accept a `bind` object.
  - Pattern: `UI.inputGroup('Label', null, null, { bind: { obj: myData, key: 'name' } })`.
  - Effect: No manual listeners required for simple field updates.
- **Persistence**: Data is saved to `localStorage` under the key `dare_data`.
- **Async Initialization**: The `Store` is initialized asynchronously via `Store.init()`, which now handles data migrations for new referential keys.
- **External Parameters**: Default referentials (Gravité, Impacts, etc.) are stored in `parameters/defaults.json`.

## 4. Mermaid Editor Integration
A custom `MermaidEditor` class (in `mermaid-editor/editor.js`) provides:
- **Phase-based Swimlanes**: Maps Kill-chain phases to vertical columns.
- **Node Constraints**: Max 4 nodes per phase/swimlane.
- **Unique Identification**: Scoped styles (`.editor-modal`) and marker IDs to avoid global collisions.
- **Exports**: Snapshot logic to generate JPEG images from SVG state.
- **Orthogonal Links**: Smart link routing between connection ports.

## 5. Page Structure (`js/app.js`)
... (rest of previous technical ref)
