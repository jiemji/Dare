# Documentation Technique - Mermaid Editor Intégré

Ce document détaille le fonctionnement interne et la configuration de l'éditeur Mermaid tel qu'intégré dans l'application Dare.

## Architecture

L'éditeur est une classe JavaScript modulaire (`MermaidEditor`) qui pilote un canevas SVG. Il est conçu pour être instancié plusieurs fois sur une même page sans collision.

### Fichiers Clés
- `editor.js` : Cœur de la logique SVG, gestion des nœuds, des liens et du calcul de score.
- `styles.css` : Définition visuelle du canevas, des nœuds et du layout intégré.
- `mermaid-logic.js` : Traducteur de l'état interne de l'éditeur vers le format texte Mermaid.

## Configuration (editor.js)

Les dimensions et comportements de base sont régis par des constantes en début de fichier `editor.js` :

- `LANE_WIDTH` (default: 245) : Largeur de chaque phase de la Kill-Chain.
- `NODE_WIDTH` (120) / `NODE_HEIGHT` (60) : Dimensions des blocs d'action.
- `GRID_SIZE` (20) : Pas de l'alignement magnétique (Snap to grid).
- `NODE_SPACING_V` (40) : Espacement vertical synchronisé avec `GRID_SIZE` pour éviter les décalages lors des suppressions.
- `HEADER_HEIGHT` (40) : Hauteur de l'en-tête de colonne (titres de phases).

## Intégration (Atelier 4)

L'éditeur est instancié dans `createRiskScenarioDom` via le composant `UI.foldingCard`.

### Options d'Initialisation
```javascript
new MermaidEditor(container, {
    phases: [...], // Référentiel Kill-Chain
    initialData: {...}, // État sauvegardé (nœuds/liens)
    onScoreChange: (score) => { ... }, // Callback vers le sélecteur Vraisemblance
    onDataChange: (data) => { ... } // Callback pour la persistance dans le Store
});
```

## Personnalisation Visuelle (styles.css)

L'éditeur utilise les variables CSS globales de l'application (`main.css`) pour s'adapter automatiquement au thème (Clair / Sombre) :
- `--c-accent` : Couleur des liens et des titres de colonnes.
- `--c-bg-input` : Fond du canevas.
- `--c-border` : Couleur des séparateurs et des scrollbars.

### Layout 50/50
Le partage de l'espace dans la carte à rabat est équilibré :
- `.content-left` (flex: 1, min-width: 400px) : Formulaires de mesures de sécurité.
- `.content-right` (flex: 1, min-width: 1005px) : Zone de dessin Mermaid (Largeur fixe pour 4 colonnes).

## Nouvelles Fonctionnalités

### Suppression et Alignement
L'alignement vertical est maintenu lors de la suppression d'une forme grâce à la synchronisation du `shiftAmount` (`NODE_HEIGHT + NODE_SPACING_V` = 100px) avec la `GRID_SIZE` (multiple de 20).

### Outils de Canvas
- **Bouton Effacer (🗑️)** : Réinitialisation complète des nœuds et liens de l'instance.
- **Bouton Capture (📸)** : Export JPEG haute qualité simplifiant le rendu (cache les ports/boutons) et forçant le thème "Clair" pour une meilleure lisibilité documentaire.

## Gestion Multi-Instance
Pour éviter les conflits entre plusieurs éditeurs ouverts simultanément :
1. **IDs SVG** : Chaque instance génère un `instanceId` unique utilisé pour les marqueurs de flèches (`arrowhead-${instanceId}`).
2. **Événements Modale** : Les écouteurs sont attachés aux boutons globaux mais ne s'exécutent que pour l'instance possédant un `editingNode` actif.

## Gestion du Score
L'éditeur n'affiche plus de score visuel sur le canevas. Le score "Vraisemblance" est calculé en parcourant les chemins à l'envers depuis la dernière colonne (Exploiter). Le résultat est ensuite remonté à l'application mère qui l'affiche dans son en-tête.
