/**
 * Structure de données principale de l'application Dare.
 */

 const defaultData = {
    metadata: {
        version: "1.0",
        lastSaved: null
    },
    settings: {
        theme: "light",
        sidebarPinned: false
    },
    atelier1: {
        contexte: {
            organisation: "",
            siteInternet: "",
            secteurActivite: "",
            activite: "",
            perimetre: ""
        },
        processus: [
            // Example structure:
            // { id: "VM01", nom: "Gestion RH", description: "..." }
        ],
        evenements: [
            // Example structure:
            // { id: "ER01", processusId: "VM01", description: "...", typo: "Disponibilité", impacts: [], gravite: "3" }
        ]
    },
    atelier2: {
        sourcesRisque: [],
        objectifsVises: [],
        menaces: []
    },
    atelier3: {
        partiesPrenantes: []
    },
    referentiels: {
        gravite: [
            { valeur: 4, niveau: "Critique", color: "#ff0000" },
            { valeur: 3, niveau: "Grave", color: "#ff6600" },
            { valeur: 2, niveau: "Significatif", color: "#ffcc00" },
            { valeur: 1, niveau: "Mineur", color: "#ffff00" }
        ],
        impacts: ["Financier", "Image", "Juridique", "Opérationnel"],
        vraisemblance: [
            { valeur: 4, niveau: "Très probable", color: "#ff0000", description: "" },
            { valeur: 3, niveau: "Probable", color: "#ff6600", description: "" },
            { valeur: 2, niveau: "Peu probable", color: "#ffcc00", description: "" },
            { valeur: 1, niveau: "Très peu probable", color: "#ffff00", description: "" }
        ],
        motivation: [
            { valeur: 4, niveau: "Déterminée", color: "#ff0000", description: "" },
            { valeur: 3, niveau: "Forte", color: "#ff6600", description: "" },
            { valeur: 2, niveau: "Moyenne", color: "#ffcc00", description: "" },
            { valeur: 1, niveau: "Faible", color: "#ffff00", description: "" }
        ],
        ressources: [
            { valeur: 4, niveau: "Illimitées", color: "#ff0000", description: "" },
            { valeur: 3, niveau: "Importantes", color: "#ff6600", description: "" },
            { valeur: 2, niveau: "Limitées", color: "#ffcc00", description: "" },
            { valeur: 1, niveau: "Très limitées", color: "#ffff00", description: "" }
        ]
    }
};

class DataStore {
    constructor() {
        const loadedData = this.load();
        if (loadedData) {
            // Ensure newly added referentiels exist in older data
            if (!loadedData.referentiels) loadedData.referentiels = {};
            if (!loadedData.referentiels.ressources) {
                loadedData.referentiels.ressources = JSON.parse(JSON.stringify(defaultData.referentiels.ressources));
            }
            if (!loadedData.referentiels.motivation) {
                loadedData.referentiels.motivation = JSON.parse(JSON.stringify(defaultData.referentiels.motivation));
            }
            this.data = loadedData;
        } else {
            this.data = JSON.parse(JSON.stringify(defaultData));
        }
    }

    load() {
        const d = localStorage.getItem('dare_data');
        return d ? JSON.parse(d) : null;
    }

    save() {
        this.data.metadata.lastSaved = new Date().toISOString();
        localStorage.setItem('dare_data', JSON.stringify(this.data));
        console.log("Data saved !");
    }

    clear() {
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.save();
    }
}

const Store = new DataStore();
