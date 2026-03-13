# Documentation Technique - Éditeur de Cyber Kill-Chain

Ce document résume l'architecture et les fonctionnalités de l'éditeur de schéma Mermaid spécialisé pour les scénarios d'attaque.

## 1. Architecture Générale
L'éditeur repose sur un canvas **SVG** unique géré par la classe `MermaidEditor`. L'utilisation du SVG permet une synchronisation parfaite entre l'interface (swimlanes) et les éléments de dessin (nœuds et liens).

### Couches SVG (Layers)
- **swimlanes-layer** : Contient les fonds d'en-tête, les titres, les séparateurs verticaux et les boutons d'ajout `(+)`.
- **links-layer** : Calque dédié au tracé des flèches orthogonales.
- **nodes-layer** : Calque contenant les groupes `<g>` des formes (rectangles, textes, ports de connexion).
- **temp-layer** : Utilisé pour l'affichage temporaire du lien en cours de création.

## 2. Logique des Swimlanes (LTR)
Le layout est organisé de gauche à droite sur l'axe X :
- **Index 0** : Reconnaitre ($X = 0$)
- **Index 1** : Rentrer ($X = 250px$)
- **Index 2** : Trouver ($X = 500px$)
- **Index 3** : Exploiter ($X = 750px$)

Chaque colonne a une largeur fixe de **250px** (`LANE_WIDTH`). Les nœuds sont centrés horizontalement dans leur colonne respective.

## 3. Gestion Verticale et Réorganisation
- **Empilage** : Lors de l'ajout, le `Y` est calculé en trouvant le nœud le plus bas dans la colonne et en ajoutant un espacement (`NODE_SPACING_V = 30px`).
- **Remontée Automatique (Shift Up)** : La méthode `reorganizeLane(laneId, deletedY)` est appelée lors d'une suppression. Elle identifie tous les nœuds de la même colonne situés sous le point de suppression et réduit leur `Y` de la hauteur d'un bloc (`NODE_HEIGHT + spacing`), assurant ainsi qu'aucun vide ne subsiste.

## 4. Algorithme de Calcul du Score (Backtracking)
Implémenté dans `getNodeScore(node)` et `explorePathsBackwards` :
1. **Source** : Chaque nœud de la swimlane `exploit`.
2. **Exploration** : Parcours récursif de tous les chemins entrants (`links.toId`).
3. **Logique de Chemin** : `currentMin = Math.min(pathNodes.values)`.
4. **Résultat Final** : `Max(allPathMins)`.
5. **Rendu** : Cercles SVG dans `scores-layer`, rafraîchis à chaque modification de l'état.

## 5. Interactivité
- **Drag & Drop** : Désactivé pour garantir la structure stricte des colonnes.
- **Édition** : Gérée via une modal HTML (`#node-modal`). Les changements (texte, valeur) sont répercutés dans l'état et le DOM.
- **Liens** : Tracés orthogonaux calculés en fonction de la position relative des ports de départ et d'arrivée.
- **Permutation Manuelle** : La méthode `moveNode(nodeId, direction)` permet d'échanger la position `Y` d'un nœud avec son voisin direct (Haut/Bas). Ce mécanisme préserve l'alignement strict tout en offrant une flexibilité d'ordonnancement.
- **Mermaid** : La fonction `stateToMermaid` convertit l'état interne en syntaxe Mermaid via des `subgraph` basés sur les `laneId`.

## 5. Raccourcis Clavier
- `Suppr` / `Backspace` : Supprime le nœud sélectionné et déclenche la réorganisation.
- `Echap` : Annule l'action en cours ou désélectionne.
- `Double-clic` (Lien) : Supprime la flèche sélectionnée.

---
*Note : Cette documentation est destinée à faciliter l'intégration de cette page dans l'application principale une fois finalisée.*
