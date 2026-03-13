import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

function createSRDom(sr) {
    const card = UI.card('square', `Source : ${sr.id}`);
    card.setAttribute('data-sr-id', sr.id);
    
    card.appendChild(UI.inputGroup('Libellé de la source', sr.libelle, (val) => {
        sr.libelle = val;
        Store.save();
    }));

    card.appendChild(UI.inputGroup('Description / Commentaires', sr.description, (val) => {
        sr.description = val;
        Store.save();
    }, { multiline: true }));

    const ressourcesOpts = Store.data.referentiels.ressources.map(r => ({
        value: r.valeur,
        label: `${r.valeur} - ${r.niveau}`
    }));
    card.appendChild(UI.selectGroup('Ressources', sr.ressources, ressourcesOpts, (val) => {
        sr.ressources = val;
        Store.save();
    }));

    card.appendChild(UI.button('Supprimer Source', () => {
        if(confirm(`Supprimer la source de risque ${sr.id} ?`)){
            card.remove();
            Store.data.atelier2.sourcesRisque = Store.data.atelier2.sourcesRisque.filter(s => s.id !== sr.id);
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.srId !== sr.id);
            Store.save();
        }
    }));
    
    return card;
}

function createOVDom(ov) {
    const card = UI.card('square', `Objectif : ${ov.id}`);
    card.setAttribute('data-ov-id', ov.id);
    
    card.appendChild(UI.inputGroup('Libellé', ov.libelle, (val) => {
        ov.libelle = val;
        Store.save();
    }));

    card.appendChild(UI.inputGroup('Description', ov.description, (val) => {
        ov.description = val;
        Store.save();
    }, { multiline: true }));
    
    card.appendChild(UI.button('Supprimer Objectif', () => {
        if(confirm(`Supprimer l'objectif visé ${ov.id} ?`)){
            card.remove();
            Store.data.atelier2.objectifsVises = Store.data.atelier2.objectifsVises.filter(o => o.id !== ov.id);
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.ovId !== ov.id);
            Store.save();
        }
    }));
    
    return card;
}

function createMenaceDom(menace, template) {
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.menace-row');
    row.setAttribute('data-men-id', menace.id);
    
    const selSr = clone.querySelector('.men-sr');
    const selOv = clone.querySelector('.men-ov');
    const selRessources = clone.querySelector('.men-ressources');
    const selMotivation = clone.querySelector('.men-motivation');
    const inpComm = clone.querySelector('.men-commentaires');
    const btnDel = clone.querySelector('.btn-del-men');
    
    selSr.innerHTML = '<option value="">-- Choisir SR --</option>';
    Store.data.atelier2.sourcesRisque.forEach(sr => {
        const opt = document.createElement('option');
        opt.value = sr.id;
        opt.textContent = `${sr.id} - ${sr.libelle || 'N/A'}`;
        selSr.appendChild(opt);
    });
    
    selOv.innerHTML = '<option value="">-- Choisir OV --</option>';
    Store.data.atelier2.objectifsVises.forEach(ov => {
        const opt = document.createElement('option');
        opt.value = ov.id;
        opt.textContent = `${ov.id} - ${ov.libelle || 'N/A'}`;
        selOv.appendChild(opt);
    });
    
    selRessources.innerHTML = '<option value="">--</option>';
    Store.data.referentiels.ressources.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.valeur;
        opt.textContent = `${r.valeur} - ${r.niveau}`;
        selRessources.appendChild(opt);
    });
    
    selMotivation.innerHTML = '';
    Store.data.referentiels.motivation.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.valeur;
        opt.textContent = `${m.valeur} - ${m.niveau}`;
        selMotivation.appendChild(opt);
    });
    
    selSr.value = menace.srId;
    selOv.value = menace.ovId;
    selMotivation.value = menace.motivation;
    inpComm.value = menace.commentaires;
    
    const updateRessourcesDisplay = () => {
        const sr = Store.data.atelier2.sourcesRisque.find(s => s.id === selSr.value);
        if (sr && sr.ressources) {
            selRessources.value = sr.ressources;
        } else {
            selRessources.value = "";
        }
    };
    updateRessourcesDisplay();
    
    const saveChanges = () => {
        menace.srId = selSr.value;
        menace.ovId = selOv.value;
        menace.motivation = selMotivation.value;
        menace.commentaires = inpComm.value;
    };
    
    selSr.addEventListener('change', () => {
        updateRessourcesDisplay();
        saveChanges();
    });
    selOv.addEventListener('change', saveChanges);
    selMotivation.addEventListener('change', saveChanges);
    inpComm.addEventListener('input', saveChanges);
    
    btnDel.addEventListener('click', () => {
        if(confirm(`Supprimer cette ligne d'évaluation ?`)){
            row.remove();
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.id !== menace.id);
            Store.save();
        }
    });
    
    return clone;
}

function initSourcesRisquePage() {
    const container = document.getElementById('sr-container');
    const btnAdd = document.getElementById('btn-add-sr');

    if (!container || !btnAdd) return;

    const sourcesList = Store.data.atelier2.sourcesRisque;
    container.innerHTML = '';
    
    sourcesList.forEach(sr => {
        container.appendChild(createSRDom(sr));
    });

    btnAdd.onclick = () => {
        let maxRef = 0;
        sourcesList.forEach(s => {
            const num = parseInt(s.id.replace('SR', ''), 10);
            if (!isNaN(num) && num > maxRef) maxRef = num;
        });
        
        const newRef = `SR${(maxRef + 1).toString().padStart(2, '0')}`;
        const newSR = { id: newRef, libelle: "", description: "", ressources: "1" };
        
        sourcesList.push(newSR);
        Store.save();
        container.appendChild(createSRDom(newSR));
    };
}

function initObjectifsVisesPage() {
    const container = document.getElementById('ov-container');
    const btnAdd = document.getElementById('btn-add-ov');

    if (!container || !btnAdd) return;

    const ovList = Store.data.atelier2.objectifsVises;
    container.innerHTML = '';
    
    ovList.forEach(ov => {
        container.appendChild(createOVDom(ov));
    });

    btnAdd.onclick = () => {
        let maxRef = 0;
        ovList.forEach(o => {
            const num = parseInt(o.id.replace('OV', ''), 10);
            if (!isNaN(num) && num > maxRef) maxRef = num;
        });
        
        const newRef = `OV${(maxRef + 1).toString().padStart(2, '0')}`;
        const newOV = { id: newRef, libelle: "", description: "" };
        
        ovList.push(newOV);
        Store.save();
        container.appendChild(createOVDom(newOV));
    };
}

function initEvaluationMenacePage() {
    const tbody = document.getElementById('menaces-tbody');
    const btnAdd = document.getElementById('btn-add-menace');
    const template = document.getElementById('tpl-menace-row');

    if (!tbody || !btnAdd || !template) return;

    const menacesList = Store.data.atelier2.menaces;
    tbody.innerHTML = '';
    
    menacesList.forEach(menace => {
        tbody.appendChild(createMenaceDom(menace, template));
    });

    btnAdd.onclick = () => {
        const newMenace = { 
            id: Date.now().toString(), 
            srId: "", 
            ovId: "", 
            motivation: "1", 
            commentaires: "" 
        };
        
        menacesList.push(newMenace);
        Store.save();
        tbody.appendChild(createMenaceDom(newMenace, template));
    };
}

export function init() {
    if(document.getElementById('sr-container')) initSourcesRisquePage();
    if(document.getElementById('ov-container')) initObjectifsVisesPage();
    if(document.getElementById('menaces-tbody')) initEvaluationMenacePage();
}
