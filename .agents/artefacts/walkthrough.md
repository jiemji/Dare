# Walkthrough - Implementations Récentes

## 1. Ergonomie et Layout
- **Design System** : Implémentation de 5 types de composants (`card-square`, `card-long`, `card-extended`, `table-square`, `table-extended`) avec des règles de placement et de redimensionnement précises.
- **Titres de champs** : Harmonisation globale. Tous les labels sont positionnés au-dessus des champs de saisie.
- **Alignement horizontal** : Les cartes de type `card-long` permettent désormais un alignement horizontal des champs pour une lecture compacte (ex: Événements).
- **CSS Grid & Flexbox** : Refonte du layout. Le bandeau latéral est fixé sous la barre de navigation.
- **Scrolling intelligent** : Les tableaux sont limités en hauteur (70vh) avec défilement vertical et en-têtes fixés (`sticky`).

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
