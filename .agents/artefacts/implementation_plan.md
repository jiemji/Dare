# Refonte de la Navigation Globale

Ce plan vise à unifier la navigation dans une barre latérale complète et à simplifier le bandeau supérieur.

## User Review Required

> [!IMPORTANT]
> - Le menu horizontal disparait au profit d'une arborescence complète dans la barre latérale.
> - Le menu "Burger" est remplacé par un bouton "[Fichier]" fixe en bas de la barre latérale.

## Proposed Changes

### [HTML] Structure de Base
---
#### [MODIFY] [index.html](file:///g:/devapps/Dare/index.html)
- Nettoyage de `<header class="navbar">` : suppression des boutons d'ateliers, ajout du titre "DARE".
- Mise à jour de `<aside class="sidebar">` :
    - Ajout d'une section `.sidebar-content` pour l'arborescence.
    - Ajout d'une section `.sidebar-footer` avec le bouton "Fichier".
- Masquage/Suppression du bouton `#btn-burger` original.

### [CSS] Mise en Page & Styles
---
#### [MODIFY] [main.css](file:///g:/devapps/Dare/css/main.css)
- Styles pour la navigation hiérarchique dans la barre latérale (Titres d'ateliers, items de pages).
- Positionnement fixe du `.sidebar-footer` en bas de la sidebar.
- Ajustement du bandeau supérieur (titre à gauche, icônes à droite).

### [JS] Logique de Navigation
---
#### [MODIFY] [app.js](file:///g:/devapps/Dare/js/app.js)
- Refonte de `generateSidebar()` pour générer toute l'arborescence dès le chargement.
- Suppression de la logique de filtrage par "Atelier" sur clic du bandeau supérieur.
- Branchement du bouton "Fichier" sur la modale `#burger-menu` existante.

## Verification Plan

### Manual Verification
1.  **Sidebar** : Vérifier que tous les ateliers (1 à 5 + Référentiels) sont visibles simultanément.
2.  **Navigation** : Cliquer sur une page au hasard et vérifier qu'elle se charge correctement.
3.  **Bouton Fichier** : Cliquer sur "[Fichier]" en bas à gauche et vérifier l'ouverture de la modale de gestion.
4.  **Responsive** : Vérifier que la barre latérale (épinglée ou non) s'affiche toujours correctement.
