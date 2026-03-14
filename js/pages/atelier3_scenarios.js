import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

/**
 * Crée le DOM pour une carte de scénario stratégique
 */
function createScenarioDom(ss, procId) {
    const card = UI.card('long', `Scénario ${ss.id}`);
    card.setAttribute('data-ss-id', ss.id);

    // -- Menaces (Provenance: Atelier 2) --
    const threats = Store.data.atelier2.menaces.map(m => {
        // Essayer de retrouver le libellé de la source et de l'objectif
        const source = Store.data.atelier2.sourcesRisque.find(s => s.id === m.sourceId);
        const obj = Store.data.atelier2.objectifsVises.find(o => o.id === m.objectifId);
        const label = `${source ? source.libelle : 'Source ?'} -> ${obj ? obj.libelle : 'Objectif ?'}`;
        return { value: m.id, label: label };
    });
    
    card.appendChild(UI.selectGroup('Menace liée', ss.menaceId, threats, (val) => {
        ss.menaceId = val;
        Store.save();
    }));

    // -- Parties Prenantes (Provenance: Atelier 3) --
    const pps = Store.data.atelier3.partiesPrenantes.map(p => ({
        value: p.id,
        label: p.nom || p.id
    }));
    
    card.appendChild(UI.selectGroup('Partie prenante', ss.ppId, pps, (val) => {
        ss.ppId = val;
        Store.save();
    }));

    // -- Cible --
    card.appendChild(UI.inputGroup('Cible', ss.cible, (val) => {
        ss.cible = val;
        Store.save();
    }));

    // -- Scénario stratégique (Description) --
    card.appendChild(UI.inputGroup('Scénario stratégique', ss.scenario, (val) => {
        ss.scenario = val;
        Store.save();
    }, { multiline: true }));

    // -- Déclenchement --
    card.appendChild(UI.inputGroup('Déclenchement / Mode opératoire', ss.declenchement, (val) => {
        ss.declenchement = val;
        Store.save();
    }));

    // -- Gravité (Référentiel) --
    const gravites = Store.data.referentiels.gravite.map(g => ({
        value: g.valeur,
        label: `${g.valeur} - ${g.niveau}`
    }));
    
    card.appendChild(UI.selectGroup('Gravité', ss.gravite, gravites, (val) => {
        ss.gravite = val;
        Store.save();
    }));

    // -- Bouton de suppression --
    card.appendChild(UI.button('Supprimer le scénario', () => {
        if(confirm(`Supprimer le scénario stratégique ${ss.id} ?`)) {
            card.remove();
            Store.data.atelier3.scenariosStrategiques = Store.data.atelier3.scenariosStrategiques.filter(s => s.id !== ss.id);
            Store.save();
        }
    }));

    return card;
}

/**
 * Initialisation de la page des scénarios stratégiques
 */
export function init() {
    const container = document.getElementById('ss-container');
    if(!container) return;
    
    container.innerHTML = '';
    const processusList = Store.data.atelier1.processus;
    const ssList = Store.data.atelier3.scenariosStrategiques;
    
    if(processusList.length === 0) {
        container.innerHTML = "<p class='full-width'><em>Veuillez d'abord créer des processus métier dans l'Atelier 1.</em></p>";
        return;
    }
    
    processusList.forEach(proc => {
        const section = document.createElement('div');
        section.className = 'processus-section';
        section.style.width = '100%';
        section.style.marginBottom = '30px';
        
        // Header de section pour chaque processus
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.backgroundColor = 'var(--c-bg-panel)';
        header.style.padding = '10px 15px';
        header.style.borderRadius = 'var(--border-radius)';
        header.style.borderLeft = '4px solid var(--c-accent)';
        header.style.marginBottom = '15px';

        const title = document.createElement('h3');
        title.textContent = `Processus ${proc.id} : ${proc.nom || '(Non nommé)'}`;
        header.appendChild(title);

        // Bouton d'ajout pour CE processus
        const btnAdd = UI.button('Ajouter un scénario', () => {
            let maxRef = 0;
            ssList.forEach(s => {
                const num = parseInt(s.id.replace('SS', ''), 10);
                if (!isNaN(num) && num > maxRef) maxRef = num;
            });
            const newRef = `SS${(maxRef + 1).toString().padStart(2, '0')}`;
            
            const newSS = {
                id: newRef,
                processusId: proc.id,
                menaceId: "",
                ppId: "",
                cible: "",
                scenario: "",
                declenchement: "",
                gravite: "1"
            };
            ssList.push(newSS);
            Store.save();
            ssCardsContainer.appendChild(createScenarioDom(newSS, proc.id));
        }, 'primary');
        header.appendChild(btnAdd);
        
        section.appendChild(header);

        // Conteneur des cartes de ce processus
        const ssCardsContainer = document.createElement('div');
        ssCardsContainer.className = 'cards-container';
        
        const procSss = ssList.filter(s => s.processusId === proc.id);
        procSss.forEach(ss => {
            ssCardsContainer.appendChild(createScenarioDom(ss, proc.id));
        });
        
        section.appendChild(ssCardsContainer);
        container.appendChild(section);
    });
}
