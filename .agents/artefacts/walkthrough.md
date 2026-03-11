# Walkthrough - Implementations Récentes

## 1. Ergonomie et Layout
- **CSS Grid & Flexbox** : Refonte totale du layout. Le bandeau latéral est désormais fixé sous la barre de navigation.
- **Scrolling intelligent** : Les tableaux sont limités en hauteur (70vh) avec défilement vertical et en-têtes fixés (`sticky`).
- **Composants Dynamiques** :
    - `card-square` : Alignement horizontal (max 400px).
    - `card-long` : Occupation totale de la ligne (100%).
    - `card-extended` : Occupation totale mais extensible (min 400px).
    - `table-square` & `table-extended` : Placement flexible pour les référentiels.

## 2. Menu Burger & Gestion des Données
- **Nouvelle Analyse** : Réinitialise tout le `localStorage` après confirmation.
- **Sauvegarder** : Exporte l'intégralité de l'analyse dans un fichier `.json` téléchargeable.
- **Charger** : Permet d'importer un fichier `.json` pour restaurer une session.
- **Aide** : Nouvelle page "Aide & Méthodologie" accessible via le menu.

## 3. CoHérence des Ateliers
- Correction du bouton "Ajouter" dans tous les ateliers (désormais situé sous les cartes/tableaux).
- Harmonisation visuelle des pages "filer" (Ateliers 4, 5 et Livrables).
- Correction du bug de création de processus.

## Comment tester :
1. Ouvrez `index.html`.
2. Allez dans le **Menu Burger** (☰).
3. Entrez des données bidon, faites **Sauvegarder** -> un fichier JSON est généré.
4. Faites **Nouvelle Analyse** -> tout est vidé.
5. Faites **Charger** et sélectionnez le fichier JSON -> tout revient !
6. Vérifiez la page **Aide** dans le menu.
