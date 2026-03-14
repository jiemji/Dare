# Walkthrough - Refonte Sémantique et Cartes à Rabat

Cette mise à jour finalise le renommage sémantique global et la mise en place du nouveau composant "Carte à Rabat" (Folding Card).

## Changements Majeurs

### 1. Refonte Sémantique
- **Processus métier** -> **Valeurs métiers** (dans les pages et cartes).
- **Chaines de valeurs** : Refonte sémantique des processus métiers.
- **Parties prenantes** : Séparation en deux pages distinctes (Gestion et Évaluation).
- **Navigation Unifiée** : 
    - Barre latérale affichant l'arborescence complète (Ateliers > Pages).
    - Nouveau bouton permanent **[ Fichier ]** en bas à gauche pour les opérations globales (Nouvelle analyse, Import/Export).
    - Barre supérieure épurée affichant uniquement le titre de l'application et les réglages.

### 2. Nouveau Composant : Carte à Rabat (`folding-card`)
- **Structure** : En-tête interactive avec contrôles (inputs/boutons) et corps repliable.
- **Mises en page** :
    - **Atelier 1 (Inventaire)** : Layout en 3 colonnes égales (1/3 chacune) avec support complet du pliage/dépliage.
    - **Atelier 4 (Scénarios)** : Layout mixte (30% gauche / 70% droite).
- **Optimisation** : Correction des conflits CSS (`!important`) empêchant le repliage des cartes d'actifs.

## Vérification Visuelle

### Atelier 1 : Inventaire des Biens Supports
Les actifs s'affichent désormais sous forme de cartes repliables. L'en-tête permet de modifier le nom, le type et la description sans avoir à déplier la carte. Une fois dépliée, la carte révèle les 3 colonnes de détails.

### Atelier 4 : Scénarios de Risques
Les scénarios utilisent le même composant mais avec une disposition optimisée pour l'édition graphique, permettant d'avoir le contexte du scénario à gauche et le schéma Kill-Chain à droite.

## Documentation
- [design.md](file:///g:/devapps/Dare/docs/design.md) mis à jour avec la nouvelle sémantique.
- [composants.md](file:///g:/devapps/Dare/docs/composants.md) complété avec la description technique de la `folding-card`.
