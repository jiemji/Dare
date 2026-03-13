import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

function createProcessusDom(proc) {
    const card = UI.card('square', `Processus ${proc.id}`);
    card.setAttribute('data-id', proc.id);
    
    card.appendChild(UI.inputGroup('Nom du processus', proc.nom, (val) => {
        proc.nom = val;
        Store.save();
    }));

    card.appendChild(UI.inputGroup('Description', proc.description, (val) => {
        proc.description = val;
        Store.save();
    }, { multiline: true }));

    card.appendChild(UI.button('Supprimer', () => {
        if(confirm(`Supprimer le processus ${proc.id} et ses événements liés ?`)){
            card.remove();
            Store.data.atelier1.processus = Store.data.atelier1.processus.filter(p => p.id !== proc.id);
            Store.data.atelier1.evenements = Store.data.atelier1.evenements.filter(e => e.processusId !== proc.id);
            Store.save();
        }
    }));
    
    return card;
}

function createERDom(er, procId) {
    const card = UI.card('long', `ER ${er.id}`);
    card.setAttribute('data-er-id', er.id);

    card.appendChild(UI.inputGroup('Description de l\'événement', er.description, (val) => {
        er.description = val;
        Store.save();
    }, { multiline: true }));

    const typologies = [
        { value: 'Disponibilité', label: 'Disponibilité' },
        { value: 'Intégrité', label: 'Intégrité' },
        { value: 'Confidentialité', label: 'Confidentialité' },
        { value: 'Traçabilité', label: 'Traçabilité' }
    ];
    card.appendChild(UI.selectGroup('Typologie', er.typo, typologies, (val) => {
        er.typo = val;
        Store.save();
    }));

    const gravites = Store.data.referentiels.gravite.map(g => ({
        value: g.valeur,
        label: `${g.valeur} - ${g.niveau}`
    }));
    card.appendChild(UI.selectGroup('Gravité', er.gravite, gravites, (val) => {
        er.gravite = val;
        Store.save();
    }));

    const impactsLabel = document.createElement('label');
    impactsLabel.textContent = 'Impacts métiers';
    card.appendChild(impactsLabel);

    const impactsContainer = document.createElement('div');
    impactsContainer.className = 'impacts-list';
    impactsContainer.style.maxHeight = '100px';
    impactsContainer.style.overflowY = 'auto';
    impactsContainer.style.padding = '5px';
    impactsContainer.style.border = '1px solid var(--c-border)';
    impactsContainer.style.borderRadius = 'var(--border-radius)';
    impactsContainer.style.marginBottom = '12px';

    Store.data.referentiels.impacts.forEach(imp => {
        const lbl = document.createElement('label');
        lbl.style.display = 'block';
        lbl.style.fontSize = '12px';
        lbl.style.fontWeight = 'normal';
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.style.width = 'auto';
        cb.style.marginRight = '8px';
        cb.value = imp;
        cb.checked = (er.impacts || []).includes(imp);
        
        cb.onchange = () => {
            if(cb.checked) {
                if(!er.impacts.includes(imp)) er.impacts.push(imp);
            } else {
                er.impacts = er.impacts.filter(i => i !== imp);
            }
            Store.save();
        };
        
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(imp));
        impactsContainer.appendChild(lbl);
    });
    card.appendChild(impactsContainer);

    card.appendChild(UI.button('Supprimer ER', () => {
        if(confirm(`Supprimer l'événement ${er.id} ?`)) {
            card.remove();
            Store.data.atelier1.evenements = Store.data.atelier1.evenements.filter(e => e.id !== er.id);
            Store.save();
        }
    }));
    
    return card;
}

function initProcessusPage() {
    const container = document.getElementById('processus-container');
    const btnAdd = document.getElementById('btn-add-processus');

    if (!container || !btnAdd) return;

    const processusList = Store.data.atelier1.processus;
    container.innerHTML = '';
    
    processusList.forEach(proc => {
        container.appendChild(createProcessusDom(proc));
    });

    btnAdd.onclick = () => {
        let maxRef = 0;
        processusList.forEach(p => {
            const num = parseInt(p.id.replace('VM', ''), 10);
            if (!isNaN(num) && num > maxRef) maxRef = num;
        });
        
        const newRef = `VM${(maxRef + 1).toString().padStart(2, '0')}`;
        const newProc = { id: newRef, nom: "", description: "" };
        
        processusList.push(newProc);
        Store.save();
        container.appendChild(createProcessusDom(newProc));
    };
}

function initEvenementsPage() {
    const container = document.getElementById('er-container');
    if(!container) return;
    
    container.innerHTML = '';
    const processusList = Store.data.atelier1.processus;
    const erList = Store.data.atelier1.evenements;
    
    if(processusList.length === 0) {
        container.innerHTML = "<p class='full-width'><em>Veuillez d'abord créer des processus métier.</em></p>";
        return;
    }
    
    processusList.forEach(proc => {
        const section = document.createElement('div');
        section.className = 'processus-section';
        section.style.width = '100%';
        section.style.marginBottom = '30px';
        
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

        const btnAdd = UI.button('Ajouter ER', () => {
            let maxRef = 0;
            erList.forEach(e => {
                const num = parseInt(e.id.replace('ER', ''), 10);
                if (!isNaN(num) && num > maxRef) maxRef = num;
            });
            const newRef = `ER${(maxRef + 1).toString().padStart(2, '0')}`;
            
            const newER = {
                id: newRef,
                processusId: proc.id,
                description: "",
                typo: "Disponibilité",
                impacts: [],
                gravite: "1"
            };
            erList.push(newER);
            Store.save();
            erCardsContainer.appendChild(createERDom(newER, proc.id));
        }, 'primary');
        header.appendChild(btnAdd);
        
        section.appendChild(header);

        const erCardsContainer = document.createElement('div');
        erCardsContainer.className = 'cards-container';
        
        const procErs = erList.filter(e => e.processusId === proc.id);
        procErs.forEach(er => {
            erCardsContainer.appendChild(createERDom(er, proc.id));
        });
        
        section.appendChild(erCardsContainer);
        container.appendChild(section);
    });
}

export function init() {
    if(document.getElementById('processus-container')) initProcessusPage();
    if(document.getElementById('er-container')) initEvenementsPage();
}
