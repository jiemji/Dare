export class DataStore {
    constructor() {
        this.data = null;
        this.defaultSocles = [];
        this.defaults = null;
    }

    /**
     * Initialise le Store en chargeant les fichiers de configuration externes
     * et les données du localStorage.
     */
    async init() {
        try {
            // 1. Chargement des paramètres par défaut
            const respDefaults = await fetch('parameters/defaults.json');
            this.defaults = await respDefaults.json();

            // 2. Chargement de la bibliothèque de socles
            const respSocles = await fetch('parameters/socles.json');
            const socleData = await respSocles.json();
            this.defaultSocles = socleData.socles || [];

            // 3. Chargement des données utilisateur (localStorage)
            const loadedData = this.load();
            
            if (loadedData) {
                // Migration / Mise à jour des structures si nécessaire
                if (!loadedData.metadata) loadedData.metadata = { version: "1.0", lastSaved: null };
                if (!loadedData.settings) loadedData.settings = { theme: "light", sidebarPinned: false };
                if (!loadedData.referentiels) loadedData.referentiels = {};
                
                // On s'assure que les catégories de référentiels existent
                const refCats = [
                    'gravite', 'impacts', 'vraisemblance', 'motivation', 
                    'ressources', 'socles', 'killChain', 'typesActifs',
                    'risques', 'grilleImpacts', 'grilleRisques', 'typesDependancePP'
                ];
                refCats.forEach(cat => {
                    if (!loadedData.referentiels[cat]) {
                        loadedData.referentiels[cat] = JSON.parse(JSON.stringify(this.defaults.referentiels[cat] || []));
                    }
                });

                if (!loadedData.atelier1) {
                    loadedData.atelier1 = JSON.parse(JSON.stringify(this.defaults.atelier1));
                } else {
                    if (!loadedData.atelier1.processus) loadedData.atelier1.processus = [];
                    if (!loadedData.atelier1.evenements) loadedData.atelier1.evenements = [];
                    if (!loadedData.atelier1.inventaire) loadedData.atelier1.inventaire = [];
                }

                if (!loadedData.atelier2) {
                    loadedData.atelier2 = JSON.parse(JSON.stringify(this.defaults.atelier2));
                }

                if (!loadedData.atelier3) {
                    loadedData.atelier3 = JSON.parse(JSON.stringify(this.defaults.atelier3));
                } else if (!loadedData.atelier3.scenariosStrategiques) {
                    loadedData.atelier3.scenariosStrategiques = [];
                }

                if (!loadedData.atelier4) {
                    loadedData.atelier4 = JSON.parse(JSON.stringify(this.defaults.atelier4));
                } else if (!loadedData.atelier4.scenariosRisques) {
                    loadedData.atelier4.scenariosRisques = [];
                }

                if (!loadedData.atelier5) {
                    loadedData.atelier5 = JSON.parse(JSON.stringify(this.defaults.atelier5));
                }

                this.data = loadedData;
            } else {
                // Premier lancement : on utilise les defaults
                this.data = JSON.parse(JSON.stringify(this.defaults));
                // On ajoute les métadonnées de base
                this.data.metadata = { version: "1.0", lastSaved: null };
                this.data.settings = { theme: "light", sidebarPinned: false };
            }

            console.log("Store initialisé avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'initialisation du Store :", error);
            // Fallback minimal pour éviter le crash complet
            this.data = { metadata: {}, settings: { theme: "light" }, referentiels: { socles: [] } };
        }
    }

    load() {
        const d = localStorage.getItem('dare_data');
        return d ? JSON.parse(d) : null;
    }

    save() {
        if (!this.data) return;
        this.data.metadata.lastSaved = new Date().toISOString();
        localStorage.setItem('dare_data', JSON.stringify(this.data));
        console.log("Data saved !");
    }

    clear() {
        if (confirm("Êtes-vous sûr de vouloir tout effacer ? Cette action est irréversible.")) {
            localStorage.removeItem('dare_data');
            location.reload(); 
        }
    }

    exportJSON() {
        if (!this.data) return;
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const date = new Date().toISOString().split('T')[0];
        const exportFileDefaultName = `dare_analyse_${date}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importJSON(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            if (!parsed.atelier1 || !parsed.referentiels) {
                throw new Error("Format de fichier DARE invalide.");
            }
            this.data = parsed;
            this.save();
            location.reload(); 
        } catch (e) {
            alert("Erreur lors de l'import : " + e.message);
        }
    }
}

export const Store = new DataStore();
