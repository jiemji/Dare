# Dare - design structure

## Structure

- Un bandeau horizontal avec des boutons  
  Chaque bouton permet d'accéder un ensemble de page ou des fonctions
  
    - Bouton : Burger Menu
      
        - Composants
          
            - Fonction : Nouvelle analyse
              
                - L'application nettoie le localstorage pour démarrer une nouvelle analyse
                  
                - L'application récupère les paramétrages par défaut
                  
            - Fonction : Charger
              
                - L'application charge un fichier json d'analyse dans le localstorage
                  
            - Fonction : Sauvegarder
              
                - L'application sauvegarde le local storage dans un fichier json
                  
    - Paramétrage et Initialisation
      
        - L'application est pilotée par des fichiers de configuration externes (dossier `parameters/`) :
          
            - `defaults.json` : Contient les référentiels par défaut (gravité, impacts, vraisemblance, motivation, ressources) et les structures des ateliers.
              
            - `socles.json` : Contient la bibliothèque des socles de sécurité disponibles.
              
        - L'initialisation est asynchrone : au chargement, l'application récupère ces fichiers avant d'afficher la première page.
          
    - Page : Aide
      
        - Affiche de la page d'aide (aide.html)
          
    - Bouton : Atelier 1
      
        - Page : Contexte de l'analyse
          
            - Composants
              
                - Carte étendue : Information générale
                  
                    - Composants
                      
                        - Champs de saisie : Organisation
                          
                        - Champs de saisie : Site interent
                          
                        - Bouton : Ouverture du site internet
                          
                            - Fonction : ouvre l'url dans une nouvelle fenêtre
                              
                        - Champs de saisie : Secteur d'activité
                          
                        - Champs de saisie : Activité
                          
                        - Champs de saisie : Périmètre de l'analyse
                          
        - Page : Processus métier
          
            - Composants
              
                - Bouton : ajouter une processus métier
                  
                    - Fonction : ajouter une carte Processus
                      
                - Carte étendue : Processus #
                  
                    - Composants
                      
                        - Champs de saisie : Référence
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                            - Incrémentation automatique à la création : VM01, VM02, VM##
                              
                        - Champs de saisie : Nom de processus
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Champs de saisie enrichie : Description de l'activité
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Bouton : Supprimer le processus
                          
                            - Fonction : supprime le processus et ses données
                              
        - Page : Evènements regrettables
          
            - Composants
              
                - Titre : Processus #
                  
                - Carte allongée : Evénement #
                  
                    - Composants
                      
                        - Champs de saisie : Référence
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                            - Incrémentation automatique à la création : ER01, ER02, ER##
                              
                            - La numérotation ne tient pas compte de la séparation à l'écran par procesus. Par exemple, VM01 > ER01, ER02, VM2 > ER03, ER04.
                              
                        - Champs de saisie : Descriptif de l'événement
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Liste déroulante : Typologie
                          
                            - Typologies : Disponibilité, Intégrité, Confidentialité
                              
                        - Liste à cocher : Impacts
                          <!-- ::xmind-pos:{"x":2678,"y":-506} -->
                          
                            - La liste provient du référentiel "Impacts"
                              
                        - Liste déroulante : Gravité
                          
                            - La liste provient du référentiel "Gravité"
                              
                        - Bouton : Supprimer l'événement
                          
                            - Fonction : supprime l'événement et ses données
                              
                - Bouton : Ajouter un événement
                  
                    - Fonction : ajoute une carte événement dans l'espace du processus
                      
            - L'écran est découpé par processus métier
              
        - Page : Inventaire
          
            - à définir. mettre une page filer
              
        - Page : Cartographie
          
            - à définir. mettre une page filer
              
    - Bouton : Atelier 2
      
        - Page : Sources de risque
          
            - Composants
              
                - Bouton : ajouter une source de risques
                  
                    - Fonction : ajoute une carte source de risque
                      
                - Carte carrée : Source de risques #
                  
                    - Composants
                      
                        - Champs de saisie : Référence
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                            - Incrémentation automatique à la création : SR01, SR02, SR##
                              
                        - Champs de saisie : Libellé
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Champs de saisie enrichie : Description de la source de risque
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Liste déroulante : Ressources
                          
                            - La liste provient du référentiel "Ressources"
                              
                        - Bouton : Supprimer la source de risques
                          
                            - Fonction : supprime la source de risques et ses données
                              
        - Page : Objectifs visés
          
            - Composants
              
                - Bouton : ajouter un objectifs visés
                  
                    - Fonction : ajoute une carte objectif visé
                      
                - Carte carrée : Objectif visé #
                  
                    - Composants
                      
                        - Champs de saisie : Référence
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                            - Incrémentation automatique à la création : OV01, OV02, OV##
                              
                        - Champs de saisie : Libellé
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Champs de saisie enrichie : Description de l'objectif visé
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Bouton : Supprimer l'objectif
                          
                            - Fonction : supprime l'objectif et ses données
                              
        - Page : Evaluation de la menace
          
            - Composants
              
                - Bouton : ajouter une menace
                  
                    - Fonction : ajoute une ligne menace dans le tableau
                      
                - Tableau : Menaces
                  
                    - Composants d'une ligne du tableau
                      
                        - Liste déroulante : Source de risques
                          
                            - La liste provient des données "Sources de risques"
                              
                        - Liste déroulante : Objectif visé
                          
                            - La liste provient des données "Objectifs visés"
                              
                        - Liste déroulante : Ressources
                          
                            - La liste provient de la source du risque sélectionnée
                              
                        - Liste déroulante : Motivation
                          
                            - La liste provient du référentiel "Motivation"
                              
                        - Champs de saisie : Commentaires
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Bouton : Supprimer l'objectif
                          
                            - Fonction : supprime la menace et ses données
                              
    - Bouton : Atelier 3
      
        - Page : Partie prenantes
          
            - Composants
              
                - Bouton : ajouter une partie prenante
                  
                    - Fonction : ajoute une ligne "partie prenante" dans le tableau
                      
                - Tableau : Parties prenantes
                  
                    - Composants d'une ligne du tableau
                      
                        - Champs de saisie : Référence
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                            - Incrémentation automatique à la création : PP01, PP02, PP##
                              
                        - Champs de saisie : Nom
                          
                            - La liste provient des données "Sources de risques"
                              
                        - Liste déroulante : Type de dépendance
                          
                            - Type de dépendance : Client, Utilisateur, Fournisseur, Sous-traitant, Partenaire
                              
                        - Liste déroulante : Dépendance
                          
                            - Dépendance : 1,2,3,4
                              
                        - Liste déroulante : Pénétration
                          
                            - Pénétration : 1,2, 3, 4
                              
                        - Champs de saisie : Exposition
                          
                            - Calcul : Dépendance * Pénétration
                              
                        - Liste déroulante : Maturité
                          
                            - Maturité : 1,2,3,4
                              
                        - Liste déroulante : Intentions
                          
                            - Intentions: 1,2, 3, 4
                              
                        - Champs de saisie : Fiabilité
                          
                            - Calcul : Maturité * Intentions
                              
                        - Champs de saisie : Commentaires
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Bouton : Supprimer la partie prenante
                          
                            - Fonction : supprime la menace et ses données
                              
        - Page : Scénarios stratégiques
          
            - Composants
              
                - Titre : Processus #
                  
                - Carte allongée : Scénario stratégique #
                  
                    - Composants
                      
                        - Champs de saisie : Référence
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                            - Incrémentation automatique à la création : SS01, SS02, SS##
                              
                            - La numérotation ne tient pas compte de la séparation à l'écran par procesus. Par exemple, VM01 > SS01, SS02, VM2 > SS03, SS04.
                              
                        - Liste déroulante : Menaces
                          
                            - les données proviennent du tableau "Evaluation des menaces"
                              
                        - Liste déroulante : Parties prenantes
                          <!-- ::xmind-pos:{"x":2678,"y":-506} -->
                          
                            - les données proviennent du tableau "Parties prenantes"
                              
                        - Champs de saisie : Cible
                          
                        - Champs de saisie : Scénario stratégique
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Champs de saisie : Déclenchement
                          
                        - Liste déroulante : Gravité
                          
                            - les données proviennent du référentiel "Gravité"
                              
                        - Bouton : Supprimer le scénario stratégique
                          
                            - Fonction : supprime le scénario et ses données
                              
                - Bouton : Ajouter un scénario stratégique
                  
                    - Fonction : ajoute une carte scénario stratégique dans l'espace du processus
                      
            - L'écran est découpé par processus métier
              
    - Bouton : Atelier 4
      
        - Page : Scénarios de risques
          
            - à définir. mettre une page filer
              
        - Page : Cartographie des risques
          
            - à définir. mettre une page filer
              
    - Bouton : Atelier 5
      
        - Page : Plan de traitement du risque
          
            - Composants
              
                - Titre : Type d'action
                  
                - Carte allongée : Mesures de sécurité #
                  
                    - Composants
                      
                        - Champs de saisie : Référence
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                            - Incrémentation automatique à la création : MES01, MES02, MES##
                              
                            - La numérotation ne tient pas compte de la séparation à l'écran par procesus. Par exemple, Gouvernance > MES01, MES02, PRotection > MES03, MES04.
                              
                        - Champs de saisie : Descriptif de la mesure
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Champs de saisie : Cibles
                          <!-- ::xmind-pos:{"x":559,"y":-1145} -->
                          
                        - Liste déroulante : Priorité
                          
                            - Priorité : P0, P1, P2, P4
                              
                        - Bouton : Supprimer la mesure
                          
                            - Fonction : supprime la mesure et ses données
                              
                - Bouton : Ajouter une mesure de sécurité
                  
                    - Fonction : ajoute une carte mesure de sécurité dans l'espace du type d'action
                      
            - L'écran est découpé en 5 type d'actions : gouvernance, protection, détection, réaction, résilience
              
        - Page : Cartographie des risques résiduels
          
            - à définir. mettre une page filer
              
    - Bouton : Livrables
      
        - Page : Livrable 1
          
            - à définir. mettre une page filer
              
        - Page : Livrable 2
          
            - à définir. mettre une page filer
              
    - Référentiels
      
        - Page : Socle de sécurité
          
            - Tableau : liste des socles
              
                - Les socles de sécurité sont fournis dans le fichier parameters\socles.json
                  
                - Composants d'un ligne du tableau
                  
                    - Case à cocher
                      
                        - si la case est cochée, le socle est chargé dans le localstorage et sauvegardé dans le fichier json de l'analyse
                          
                        - si la case est decochée, le socle est supprimé dans le localstorage et ne sera pas sauvegardé avec le fichier json d'analyse
                          
                        - le case n'est présente que si le socle a une valeur "deletable"=false
                          
                    - Champs : Nom du socle
                      
                    - Champs : description
                      
                    - bouton : supprimer le socle du référentiel
                      
                        - le socle est supprimé dans le localstorage et ne sera pas sauvegardé avec le fichier json d'analyse
                          
                        - le bouton n'est présent que si le socle a une valeur "deletable"=true
                          
            - Bouton : ajouter un socle
              
                - fenêtre modale
                  
                    - champs de saisie : nom du socle
                      
                    - champs de saisie : description
                      
                    - bouton : charger un socle
                      
                        - import d'un fichier csv
                          
                            - Le socle est ajouté dans le local storage et dans le fichier d'analyse dans le fichier de l'analyse
                              <!-- ::xmind-pos:{"x":2250,"y":-601} -->
                              
                                - sa valeur "deletable" est true
                                  
        - Page : Impacts et Gravités
          
            - Echelle des gravités
              
                - Composants
                  
                    - Tableau carré : Echelle des gravités
                      
                        - Composants d'une ligne du tableau
                          
                            - Champs valeur : Valeur
                              
                                - Les valeurs incrémente à chaque ajout d'un ligne dans le tableau
                                  
                                - Les valeurs sont supérieures à 0
                                  
                            - Champs de saisie : Niveau
                              
                            - Bouton : Sélecteur de couleur
                              
                                - Fonction : ouvre un nuancier et permet de choisir la couleur du fond du champs niveau
                                  
                                    - Les références des couleurs sont stockées dans les paramètre pour être réutilisé sur les autres pages quand on fait appel au référentiel
                                      
                            - Bouton : Supprimer un niveau de gravité
                              
                                - Fonction : supprime le niveau de gravité
                                  
                    - Bouton : ajouter un niveau
                      
                        - Fonction : ajoute une ligne à la fin du tableau d'échelle des gravités
                          
            - Evaluation des impacts
              
                - Composants
                  
                    - Tableau : Evaluation des impacts
                      
                        - 1ère ligne : liste des types d'impact
                          
                            - Puis 1 ligne par niveau de gravité en ordre décroissant
                              
                        - 1ère colonne : Liste des niveau de gravité par ordre décroissant
                          
                            - Puis 1 colonne par type d'impact
                              
                                - Les colonnes disposent d'un bouton supprimer le type d'impact
                                  
                                    - Fonction : supprime le type d'impact et les données de la colonne
                                      
                        - Les cellules sont des champs de saisie
                          
                    - Bouton ; rajouter un type d'impact
                      
                        - Fonction : ajoute une colonne type d'impact à la fin du tableau
                          
        - Page : Motivations et Ressources
          
            - Niveau de motivation des menaces
              
                - Composants
                  
                    - Tableau carré : Niveau de motivations des menaces
                      
                        - Composants d'une ligne du tableau
                          
                            - Champs valeur : Valeur
                              
                                - Les valeurs incrémente à chaque ajout d'un ligne dans le tableau
                                  
                                - Les valeurs sont supérieures à 0
                                  
                            - Champs de saisie : Niveau
                              
                            - Bouton : Sélecteur de couleur
                              
                                - Fonction : ouvre un nuancier et permet de choisir la couleur du fond du champs niveau
                                  
                                    - Les références des couleurs sont stockées dans les paramètre pour être réutilisé sur les autres pages quand on fait appel au référentiel
                                      
                            - Champs de saisie : Description
                              
                            - Bouton : Supprimer le niveau de motivation
                              
                                - Fonction : supprime la menace et ses données
                                  
                    - Bouton : ajouter une ligne au tableau des niveaux de motivations
                      
                        - Fonction : ajoute une ligne à la fin du tableau des niveaux de motivation
                          
            - Niveau de ressources des menaces
              
                - Composants
                  
                    - Tableau carré : Niveau de ressources des menaces
                      
                        - Composants d'une ligne du tableau
                          
                            - Champs valeur : Valeur
                              
                                - Les valeurs incrémente à chaque ajout d'un ligne dans le tableau
                                  
                                - Les valeurs sont supérieures à 0
                                  
                            - Champs de saisie : Niveau
                              
                            - Bouton : Sélecteur de couleur
                              
                                - Fonction : ouvre un nuancier et permet de choisir la couleur du fond du champs niveau
                                  
                                    - Les références des couleurs sont stockées dans les paramètre pour être réutilisé sur les autres pages quand on fait appel au référentiel
                                      
                            - Champs de saisie : Description
                              
                            - Bouton : Supprimer le niveau de ressource
                              
                                - Fonction : supprime la menace et ses données
                                  
                    - Bouton : ajouter une ligne au tableau des niveaux de ressource
                      
                        - Fonction : ajoute une ligne à la fin du tableau des niveaux de ressource
                          
        - Page : Partie Prenantes
          
            - à définir. mettre une page filer
              
        - Page : Vraisemblance
          
            - Composants
              
                - Tableau carré : Echelle de vraisemblance
                  
                    - Composants d'un ligne du tableau
                      
                        - Champs valeur : Valeur
                          
                            - Les valeurs incrémente à chaque ajout d'un ligne dans le tableau
                              
                            - Les valeurs sont supérieures à 0
                              
                        - Champs de saisie : Niveau
                          
                        - Bouton : Sélecteur de couleur
                          
                            - Fonction : ouvre un nuancier et permet de choisir la couleur du fond du champs niveau
                              
                                - Les références des couleurs sont stockées dans les paramètre pour être réutilisé sur les autres pages quand on fait appel au référentiel
                                  
                        - Champs de saisie : Description
                          
                        - Bouton : Supprimer le niveau de motivation
                          
                            - Fonction : supprime la ligne de l'échelle de vraisemblance et ses données
                              
                - Bouton : ajouter une ligne à l'échelle de vraisemblance
                  
                    - Fonction : ajoute une ligne à la fin du tableau d'échelle de vraisemblance
                      
        - Page : Matrice des risques
          
            - Echelle des risques
              
                - Composants
                  
                    - Tableau carré : Echelle des risques
                      
                        - Composants d'une ligne du tableau
                          
                            - Champs valeur : Valeur
                              
                                - Les valeurs incrémente à chaque ajout d'un ligne dans le tableau
                                  
                                - Les valeurs sont supérieures à 0
                                  
                            - Champs de saisie : Niveau
                              
                            - Bouton : Sélecteur de couleur
                              
                                - Fonction : ouvre un nuancier et permet de choisir la couleur du fond du champs niveau
                                  
                                    - Les références des couleurs sont stockées dans les paramètre pour être réutilisé sur les autres pages quand on fait appel au référentiel
                                      
                            - Bouton : Supprimer le niveau risque
                              
                                - Fonction : supprime la ligne de l'échelle des risques et ses données
                                  
                    - Bouton : ajouter une ligne à l'échelle de niveau de risque
                      
                        - Fonction : ajoute une ligne à la fin du tableau d'échelle de vraisemblance
                          
            - Matrice des risques
              
                - Composants
                  
                    - Tableau : Matrice des risques
                      
                        - 1ère ligne : liste des niveaux de vraisemblance par ordre croissant
                          
                            - Puis 1 ligne par niveau de gravité en ordre décroissant
                              
                        - 1ère colonne : Liste des niveau de gravité par ordre décroissant
                          
                            - Puis 1 colonne par niveau de vraisemblance en ordre croissant
                              
                        - Les cellules contiennent une liste deroulante qui reprend les échelles de risques et leur couleur après sélection
                          
    - Bouton : disquette
      
        - Fonction : sauvegarde la page en cours dans le localstorage
          
    - Choix du thème
      
        - Fonction : changement du thème / style
          
- Un bande latérale qui s'affiche si on passe la souris sur le bord gauche de la fenêtre.  
  Elle peut être épinglée.  
  Elle affiche la liste des pages liées à un atelier sélectionné (bouton du bandeau horizontal)  
  Le clic sur un item ouvre la page correspondante
  
