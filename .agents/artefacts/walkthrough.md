# Première version de l'application Dare

L'application a été initialisée en respectant les principes d'architecture et de design suivants :
- **Client-Side Only** : L'app fonctionne entièrement dans le navigateur sans backend, stockant son état dans le `localStorage` en format JSON (défini dans `js/data.js`).
- **Composant/Pages** : Le code HTML a été découpé. `index.html` sert de coquille globale (Navbar et Sidebar), et les pages sont injectées dans la zone `main-content` via fetch (voir `js/app.js`).
- **Thèmes (Mac OS 7 inspiré)** : Implémentés dans `css/main.css` avec utilisation de variables CSS pour gérer dynamiquement le basculement Clair/Sombre via le bouton 🌓.
- **Ateliers implémentés** : 
  - **Atelier 1** : "Contexte de l'analyse", "Processus métier" et "Évènements regrettables". Les données sont gérées de façon relationnelle (ex: les événements sont rattachés aux processus créés).
  - **Atelier 2** : "Sources de risque", "Objectifs visés" et "Évaluation de la menace". Les tableaux dynamiques lient les sources aux objectifs, et gèrent les échelles automatiquement selon les données définies dans les référentiels.
  - **Atelier 3** : "Parties prenantes". Permet l'évaluation des parties prenantes avec des listes déroulantes pour la Dépendance, Pénétration, Maturité et Intentions, calculant automatiquement les scores d'Exposition et de Fiabilité de la méthode EBIOS RM.
  - **Atelier 4 & 5 & Livrables** : Mise en place des écrans d'attente ("filers") conformément à la conception initiale.
  - **Référentiels** : Création du module de gestion des données de base de l'application.
    - **Impacts et Gravités** : Tableau d'échelle des gravités avec couleur personnalisable, et matrice croisée Gravité × Type d'impact éditable.
    - **Motivations et Ressources** : Listes dynamiques pour définir les niveaux (valeur, nom, couleur, description).
    - **Vraisemblance** : Liste dynamique pour les niveaux de vraisemblance.
    - **Matrice des risques** : Conformément à la conception (design), l'écran propose d'abord de définir librement l' **Échelle des risques** (Niveau, Valeur, Couleur). Ensuite, la Matrice des risques s'affiche sous forme de grille (Gravité × Vraisemblance) où chaque intersection contient une **liste déroulante** permettant d'assigner manuellement le niveau de risque souhaité. La couleur de la cellule s'adapte automatiquement au choix.

### Comment tester :
1. Ouvrez le fichier `index.html` dans un navigateur web.
2. Naviguez dans les **Atelier 1** et **Atelier 2** pour découvrir les nouveaux écrans et la logique d'ajout/suppression dynamique.
3. Créez des processus, puis ajoutez-y des événements regrettables.
4. Créez des sources de risques, des objectifs visés, puis testez le tableau croisé dans l'Évaluation de la menace.
5. Sauvegardez tout dans le navigateur avec le bouton 💾.
