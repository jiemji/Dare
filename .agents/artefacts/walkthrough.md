# Walkthrough - Navigation Fixe et Refonte des Parties Prenantes

Cette mise à jour apporte des améliorations majeures à l'ergonomie et à la cohérence visuelle de l'application.

## Changements Majeurs

### 1. Navigation Fixe & Stable
- **Barre Latérale Permanente** : La barre latérale est désormais fixe et ne masque plus le contenu. Elle ne dispose plus de bouton "épingler" car elle fait partie intégrante du layout global.
- **Correction du Grid** : Le contenu principal est strictement limité à sa colonne, évitant tout chevauchement avec la navigation.
- **Menu [ Fichier ]** : Toujours disponible en bas de la barre latérale pour les actions globales.

### 2. Refonte des Parties Prenantes
- **Migration vers les Cartes à Rabat** : La gestion des parties prenantes utilise désormais le composant `folding-card` en 3 colonnes, identique à l'inventaire des actifs.
- **Exigences Dynamiques** : En choisissant un type de dépendance (Fournisseur, Client, Prestataire IT, etc.), une liste d'exigences spécifiques est générée en colonne 2.
- **Structure des colonnes** :
    - **C1** : Constats et observations.
    - **C2** : Tableau d'évaluation des exigences de sécurité.
    - **C3** : Mesures de sécurité proposées.

### 3. Fiabilité des Données
- **Migration Automatique** : Les nouveaux référentiels (types de dépendances) sont automatiquement injectés dans les analyses existantes lors du chargement.

## Vérification Visuelle

### Atelier 3 : Gestion des Parties Prenantes
Vérifiez que l'ajout d'une partie prenante crée une carte repliable. Modifiez le type de dépendance et observez la mise à jour instantanée du tableau d'exigences en colonne centrale.

### Layout Global
La barre latérale doit rester visible en permanence sans superposition sur le contenu de la page.

## Documentation
- [design.md](file:///g:/devapps/Dare/docs/design.md) et [composants.md](file:///g:/devapps/Dare/docs/composants.md) ont été mis à jour pour refléter ces changements.
