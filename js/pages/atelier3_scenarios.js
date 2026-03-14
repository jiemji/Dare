import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, withId } from '../utils.js';

function createScenarioDom(ss, ssList) {
    const threats = Store.data.atelier2.menaces.map(m => {
        const source = Store.data.atelier2.sourcesRisque.find(s => s.id === m.srId);
        const obj = Store.data.atelier2.objectifsVises.find(o => o.id === m.ovId);
        return { value: m.id, label: `${source?.libelle || 'Source?'} -> ${obj?.libelle || 'Objectif?'}` };
    });
    
    const pps = Store.data.atelier3.partiesPrenantes.map(p => ({ value: p.id, label: p.nom || p.id }));
    const gravites = Store.data.referentiels.gravite.map(g => ({ value: g.valeur, label: `${g.valeur} - ${g.niveau}` }));
    
    const fields = [
        { label: 'Menace liée', type: 'select', options: threats, bind: { obj: ss, key: 'menaceId' } },
        { label: 'Partie prenante', type: 'select', options: pps, bind: { obj: ss, key: 'ppId' } },
        { label: 'Cible', bind: { obj: ss, key: 'cible' } },
        { label: 'Scénario stratégique', multiline: true, bind: { obj: ss, key: 'scenario' } },
        { label: 'Déclenchement', bind: { obj: ss, key: 'declenchement' } },
        { label: 'Gravité', type: 'select', options: gravites, bind: { obj: ss, key: 'gravite' } }
    ];

    return withId(UI.dataCard('long', `Scénario ${ss.id}`, fields, () => {
        confirmAction(`Supprimer le scénario stratégique ${ss.id} ?`, () => {
            const idx = ssList.indexOf(ss);
            if(idx > -1) { ssList.splice(idx, 1); Store.save(); document.querySelector(`[data-id="${ss.id}"]`).remove(); }
        });
    }), ss.id);
}

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
        section.style.cssText = 'width:100%; margin-bottom:30px;';
        
        const header = document.createElement('div');
        header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--c-bg-panel); padding:10px 15px; border-radius:var(--border-radius); border-left:4px solid var(--c-accent); margin-bottom:15px;';

        const title = document.createElement('h3');
        title.textContent = `Processus ${proc.id} : ${proc.nom || '(Non nommé)'}`;
        header.appendChild(title);

        const ssCardsContainer = document.createElement('div');
        ssCardsContainer.className = 'cards-container';
        
        header.appendChild(UI.button('Ajouter un scénario', () => {
            const newSS = { id: generateNextId(ssList, 'SS'), processusId: proc.id, menaceId: "", ppId: "", cible: "", scenario: "", declenchement: "", gravite: "1" };
            ssList.push(newSS);
            Store.save();
            ssCardsContainer.appendChild(createScenarioDom(newSS, ssList));
        }, 'primary'));
        
        section.appendChild(header);
        ssList.filter(s => s.processusId === proc.id).forEach(ss => ssCardsContainer.appendChild(createScenarioDom(ss, ssList)));
        section.appendChild(ssCardsContainer);
        container.appendChild(section);
    });
}
