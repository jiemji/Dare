import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, tap, withId } from '../utils.js';

function createProcessusDom(proc) {
    const fields = [
        { label: 'Nom du processus', bind: { obj: proc, key: 'nom' } },
        { label: 'Description', multiline: true, bind: { obj: proc, key: 'description' } }
    ];

    return withId(UI.dataCard('square', `Processus ${proc.id}`, fields, () => {
        confirmAction(`Supprimer le processus ${proc.id} et ses événements liés ?`, () => {
            Store.data.atelier1.processus = Store.data.atelier1.processus.filter(p => p.id !== proc.id);
            Store.data.atelier1.evenements = Store.data.atelier1.evenements.filter(e => e.processusId !== proc.id);
            Store.save();
            document.querySelector(`[data-id="${proc.id}"]`).remove();
        });
    }), proc.id);
}

function createERDom(er) {
    const typologies = (Store.data.atelier1.typsEvenements || []).map(t => ({ value: t, label: t }));
    const gravites = Store.data.referentiels.gravite.map(g => ({
        value: g.valeur,
        label: `${g.valeur} - ${g.niveau}`
    }));

    const card = UI.card('long', `ER ${er.id}`);
    card.setAttribute('data-er-id', er.id);

    card.appendChild(UI.inputGroup('Description de l\'événement', null, null, { multiline: true, bind: { obj: er, key: 'description' } }));
    card.appendChild(UI.selectGroup('Typologie', null, typologies, null, { bind: { obj: er, key: 'typo' } }));
    card.appendChild(UI.selectGroup('Gravité', null, gravites, null, { bind: { obj: er, key: 'gravite' } }));

    // Impacts (keeping custom logic for checkbox list for now as it's specific)
    const iLab = document.createElement('label');
    iLab.textContent = 'Impacts métiers';
    card.appendChild(iLab);

    const iCont = document.createElement('div');
    iCont.className = 'impacts-list';
    iCont.style.cssText = 'max-height:100px; overflow-y:auto; padding:5px; border:1px solid var(--c-border); border-radius:var(--border-radius); margin-bottom:12px;';

    Store.data.referentiels.impacts.forEach(imp => {
        const lbl = document.createElement('label');
        lbl.style.cssText = 'display:block; font-size:12px; font-weight:normal;';
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.style.cssText = 'width:auto; margin-right:8px;';
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
        iCont.appendChild(lbl);
    });
    card.appendChild(iCont);

    card.appendChild(UI.button('Supprimer ER', () => {
        confirmAction(`Supprimer l'événement ${er.id} ?`, () => {
            Store.data.atelier1.evenements = Store.data.atelier1.evenements.filter(e => e.id !== er.id);
            Store.save();
            document.querySelector(`[data-er-id="${er.id}"]`).remove();
        });
    }));
    
    return card;
}

function initProcessusPage() {
    const container = document.getElementById('processus-container');
    const btnAdd = document.getElementById('btn-add-processus');
    if (!container || !btnAdd) return;

    const list = Store.data.atelier1.processus;
    container.innerHTML = '';
    list.forEach(proc => container.appendChild(createProcessusDom(proc)));

    btnAdd.onclick = () => {
        const newProc = { id: generateNextId(list, 'VM'), nom: "", description: "" };
        list.push(newProc);
        Store.save();
        container.appendChild(createProcessusDom(newProc));
    };
}

function initEvenementsPage() {
    const container = document.getElementById('er-container');
    if(!container) return;
    
    container.innerHTML = '';
    const procList = Store.data.atelier1.processus;
    const erList = Store.data.atelier1.evenements;
    
    if(procList.length === 0) {
        container.innerHTML = "<p class='full-width'><em>Veuillez d'abord créer des processus métier.</em></p>";
        return;
    }
    
    procList.forEach(proc => {
        const section = document.createElement('div');
        section.className = 'processus-section';
        section.style.cssText = 'width:100%; margin-bottom:30px;';
        
        const header = document.createElement('div');
        header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--c-bg-panel); padding:10px 15px; border-radius:var(--border-radius); border-left:4px solid var(--c-accent); margin-bottom:15px;';

        const title = document.createElement('h3');
        title.textContent = `Processus ${proc.id} : ${proc.nom || '(Non nommé)'}`;
        header.appendChild(title);

        header.appendChild(UI.button('Ajouter ER', () => {
            const newER = {
                id: generateNextId(erList, 'ER'),
                processusId: proc.id,
                description: "",
                typo: (Store.data.atelier1.typsEvenements || [])[0] || "Disponibilité",
                impacts: [],
                gravite: "1"
            };
            erList.push(newER);
            Store.save();
            erCardsContainer.appendChild(createERDom(newER));
        }, 'primary'));
        
        section.appendChild(header);

        const erCardsContainer = document.createElement('div');
        erCardsContainer.className = 'cards-container';
        
        erList.filter(e => e.processusId === proc.id).forEach(er => {
            erCardsContainer.appendChild(createERDom(er));
        });
        
        section.appendChild(erCardsContainer);
        container.appendChild(section);
    });
}

export function init() {
    if(document.getElementById('processus-container')) initProcessusPage();
    if(document.getElementById('er-container')) initEvenementsPage();
}
