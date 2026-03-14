Voici la liste des **composants d'interface** implémentés dans le système de design de Dare :

Le choix des composants est imposé dans sa description par l'utilisateur. tu ne dois pas choisir un type de composant toi-même.

### 1. La Carte Carrée (`card-square`)
*   **Taille :** Largeur maximale de **400px**. largeur minimale de 300px
*   **Comportement :** Plusieurs cartes peuvent s'aligner horizontalement (côte à côte) sur la même ligne tant qu'il y a de la place.
*   **alignement des objets** : les objets sont alignés verticalement à gauche.

### 2. La Carte Allongée (`card-long`)
*   **Taille :** **100%** de la largeur disponible mais **minimum 400px**.
*   **Comportement :** Elle occupe toute sa ligne et force systématiquement l'élément suivant à passer à la ligne.
*   **alignement des objets** : les objets sont aligné horizontalement. Si le carte est plus grande que l'écran un slider horizontal apparaît.

### 3. La Carte Étendue (`card-extended`)
*   **Taille :** **100%** de la largeur disponible mais **minimum 400px**.
Plusieurs cartes peuvent s'aligner horizontalement (côte à côte) sur la même ligne tant qu'il y a de la place.
*   **alignement des objets** : les objets sont alignés verticalement à gauche.

### 4. Le Tableau (`table-extended`)
*   **Taille :** Prend **toute la place disponible** sur sa ligne.
*   **Comportement :** 
    *   Il ne peut pas se coller derrière une carte carrée (il saute à la ligne).
    *   Il peut se placer horizontalement à côté d'un **Tableau Carré**.
    *   Limité verticalement (70% de la fenêtre) avec un **slider** (scroll) et une en-tête fixe.

### 5. Le Tableau Carré (`table-square`)
*   **Taille :** Largeur maximale de **400px**.
*   **Comportement :** 
    *   Il peut se coller horizontalement après un tableau standard.
    *   Un tableau standard peut se coller horizontalement après lui.
*   **Usage :** Utilisé pour les échelles de référence (Gravité, Vraisemblance, Risques) à côté des matrices.

---

### Résumé des règles de "collage" horizontal :
- **Autorisé :** `[Carrée] + [Carrée]`, `[Etendue] + [Etendue]`, `[Carrée] + [Etendue]`, `[Tableau Carré] + [Tableau Standard]`, `[Tableau Standard] + [Tableau Carré]`.
- **Interdit (Saut de ligne forcé) :** Tout ce qui suit une `Carte Allongée`, une `Carte Étendue` ou un `Tableau Standard` (sauf si c'est un tableau carré). Tout tableau ou carte étendue/allongée qui tenterait de se mettre après une `Carte Carrée`.

### 6. La Carte à Rabat (`folding-card`)
*   **Structure** : Une en-tête cliquable (header) et un contenu repliable (content).
*   **Comportement** :
    *   L'en-tête peut contenir des titres, des boutons d'action ou des sélecteurs.
    *   Le contenu s'affiche uniquement lorsque la carte est "étendue" (`is-expanded`).
    *   Supporte des mises en page internes complexes : 3 colonnes égales (`three-columns`) ou format Scénario de Risque (30% gauche, 70% droite).
    *   Prend **100% de la largeur** disponible.
*   **Usage** : Inventaire des biens supports (Atelier 1) et Scénarios de risques (Atelier 4).

---

### 7. Barre de Navigation (Sidebar Tree)
- **Structure** : Liste hiérarchique regroupée par Ateliers/Domaines.
- **Style** : En-têtes d'ateliers en majuscules (muted), pages en retrait.
- **Comportement** : L'item actif est mis en avant avec une bordure gauche bordeaux (`--c-accent`).

### 8. Bouton Menu Fichier (`btn-file`)
- **Emplacement** : Fixe en bas de la barre latérale (Sidebar Footer).
- **Style** : Bouton large avec icône dossier, apparence "heavy" (bordure 2px, ombre marquée).
- **Fonction** : Déclenche l'ouverture de la modale de gestion globale (Nouvelle analyse, Import, Export).