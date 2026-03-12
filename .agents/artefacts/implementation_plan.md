# Implementation Plan: Externalize Config & Socles

Refactor the application to load its default configuration and security foundations from external JSON files instead of hardcoded constants in `js/data.js`.

## Proposed Changes

### Configuration Files

#### [NEW] [defaults.json](file:///g:/devapps/Dare/parameters/defaults.json)
- Store `gravite`, `impacts`, `vraisemblance`, `motivation`, and `ressources` defaults.

### Refactoring

#### [MODIFY] [data.js](file:///g:/devapps/Dare/js/data.js)
- Remove `defaultSocles` constant.
- Move `defaultData` content (except metadata/settings) to `defaults.json`.
- Add an `init()` method to `DataStore` that:
    - Fetches `parameters/defaults.json`.
    - Fetches `parameters/socles.json`.
    - Merges them into `this.data` if first run.
    - Stores the library of socles for runtime use.
- Export/Globalize `Store.init()` and ensure it can be awaited.

#### [MODIFY] [app.js](file:///g:/devapps/Dare/js/app.js)
- Update the initialization sequence to await `Store.init()` before loading the first page.

#### [MODIFY] [referentiels.js](file:///g:/devapps/Dare/js/pages/referentiels.js)
- Update `initSoclePage` to use `Store.defaultSocles` (populated during `init()`) instead of the previous global constant.

## User Review Required

> [!IMPORTANT]
> This change will make the application initialization asynchronous. This is necessary to fetch external files. I will add a simple loading state or ensuring the first page load waits for the configuration.
