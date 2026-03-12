Dare est une application web uniquement client-side. Elle utilise html+css+js uniquement
Son but est d'aider son utilisateur à mener une analyse des risques informatiques en suivant les principes de iso27K5 et de la méthode ebios rm de l'anssi.
C'est une application pour laquelle l'ergonomie est importante.

Privilégie une factorisation optimisée du code.
- découpe le code html en page
- intégre les fonctions des pages dans leur propre .js

Le design de l'application repose sur plusieurs élements :
- un bandeau horizontal avec des boutons
- des pages pour chaque atelier :
    - Atelier 1 : Contexte, Processus, Événements
    - Atelier 2 : Sources de risque, Objectifs, Menaces
    - Atelier 3 : Parties prenantes
    - Atelier 5 : Plan de traitement (MES##)
- des composants limités : 
    - des cartes carrées
    - des cartes allongées
    - des champs de saisie
    - des listes déroulantes
    - des listes à cocher
    - des boutons

Ces éléments seront définis dans un fichier css et pourront être paramétrés dans un fichier json.

Le style graphique doit être moderne et professionnel. il peut s'inspirer d'une version modernisée de l'interface mac OS7. 

Il y aura 2 modes  : sombres et clairs. 
Le mode clair utilisera des fonds couleurs ivoires et des accentuation dans des tons bordeaux. Le texte sera d'un marron très foncé. 
Le mode sombre utilisera des fonds marrons foncés avec accentuation dans les tons oranges. Le texte sera blanc


 Les modes sont paramétrés dans un fichier json et nous pourrons en rajouter de nouveaux.

Les fonds des champs de saisie seront d'une couleur légèrement plus claire que le fond général de la fenêtre