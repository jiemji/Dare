# Refonte de la Navigation & Parties Prenantes

Ce plan a permis d'unifier la navigation et de moderniser la gestion des acteurs de l'écosystème.

## Changements Réalisés

### Navigation
- Sidebar unifiée et **fixe** (Layout Grid 250px / 1fr).
- Suppression du mode "hover/pin" pour une meilleure stabilité.
- Bouton [Fichier] en footer de sidebar.

### Parties Prenantes
- Passage du format tableau au format **Folding Card**.
- Layout 3 colonnes.
- Tableaux d'exigences basés sur les types définis dans `defaults.json`.

### Core Logic
- Mise à jour de `DataStore.init()` pour supporter la migration des nouveaux référentiels.
