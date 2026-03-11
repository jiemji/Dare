# Component Refinement Plan

Based on the new definitions in [composants.md](file:///g:/devapps/Dare/docs/composants.md), we will update the following:

## Proposed Changes

### CSS Layout (`css/main.css`)

#### [MODIFY] [main.css](file:///g:/devapps/Dare/css/main.css)
- **`.card-square`**: Add `min-width: 300px`. Ensure `flex-direction: column` for vertical alignment.
- **`.card-long`**: Ensure `width: 100%` and `min-width: 400px`. Change `flex-direction: row` for horizontal alignment of items. Add `overflow-x: auto`.
- **`.card-extended`**: Keep `min-width: 400px`. Allow multiple to align horizontally (using `flex: 1 1 400px`). Ensure `flex-direction: column`.

### Page Components

#### [MODIFY] [sources.html](file:///g:/devapps/Dare/pages/atelier2/sources.html)
- Change `card-long` to `card-square`.

#### [MODIFY] [objectifs.html](file:///g:/devapps/Dare/pages/atelier2/objectifs.html)
- Change `card-long` to `card-square`.

#### [MODIFY] [processus.html](file:///g:/devapps/Dare/pages/atelier1/processus.html)
- Ensure it uses `card-long`. (User request: "carte allongée > processus")

#### [MODIFY] [evenements.html](file:///g:/devapps/Dare/pages/atelier1/evenements.html)
- Ensure it uses `card-long`. (User request: "carte allongée > ... évenements")

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
- Visual inspection of each modified page to ensure cards and tables behave as expected (alignment, resizing, scrolling).
- Test horizontal scrolling on `card-long` components.
