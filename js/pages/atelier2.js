import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, tap, withId } from '../utils.js';

function createSRDom(sr) {
    const resOpts = Store.data.referentiels.ressources.map(r => ({ value: r.valeur, label: `${r.valeur} - ${r.niveau}` }));
    
    const fields = [
        { label: 'Libellé de la source', bind: { obj: sr, key: 'libelle' } },
        { label: 'Description / Commentaires', multiline: true, bind: { obj: sr, key: 'description' } },
        { label: 'Ressources', type: 'select', options: resOpts, bind: { obj: sr, key: 'ressources' } }
    ];

    return tap(withId(UI.dataCard('square', `Source : ${sr.id}`, fields, () => {
        confirmAction(`Supprimer la source de risque ${sr.id} ?`, () => {
            Store.data.atelier2.sourcesRisque = Store.data.atelier2.sourcesRisque.filter(s => s.id !== sr.id);
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.srId !== sr.id);
            Store.save();
            document.querySelector(`[data-sr-id="${sr.id}"]`).remove();
        });
    }), sr.id), el => el.setAttribute('data-sr-id', sr.id));
}

function createOVDom(ov) {
    const fields = [
        { label: 'Libellé', bind: { obj: ov, key: 'libelle' } },
        { label: 'Description', multiline: true, bind: { obj: ov, key: 'description' } }
    ];

    return tap(withId(UI.dataCard('square', `Objectif : ${ov.id}`, fields, () => {
        confirmAction(`Supprimer l'objectif visé ${ov.id} ?`, () => {
            Store.data.atelier2.objectifsVises = Store.data.atelier2.objectifsVises.filter(o => o.id !== ov.id);
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.ovId !== ov.id);
            Store.save();
            document.querySelector(`[data-ov-id="${ov.id}"]`).remove();
        });
    }), ov.id), el => el.setAttribute('data-ov-id', ov.id));
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
        selRessources.value = sr?.ressources || "";
    };
    updateRessourcesDisplay();
    
    const saveChanges = () => {
        menace.srId = selSr.value;
        menace.ovId = selOv.value;
        menace.motivation = selMotivation.value;
        menace.commentaires = inpComm.value;
        Store.save();
    };
    
    selSr.addEventListener('change', () => { updateRessourcesDisplay(); saveChanges(); });
    selOv.addEventListener('change', saveChanges);
    selMotivation.addEventListener('change', saveChanges);
    inpComm.addEventListener('input', saveChanges);
    
    btnDel.addEventListener('click', () => {
        confirmAction(`Supprimer cette ligne d'évaluation ?`, () => {
            row.remove();
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.id !== menace.id);
            Store.save();
        });
    });
    
    return clone;
}

function initSourcesRisquePage() {
    const container = document.getElementById('sr-container');
    const btnAdd = document.getElementById('btn-add-sr');
    if (!container || !btnAdd) return;

    const list = Store.data.atelier2.sourcesRisque;
    container.innerHTML = '';
    list.forEach(sr => container.appendChild(createSRDom(sr)));

    btnAdd.onclick = () => {
        const newSR = { id: generateNextId(list, 'SR'), libelle: "", description: "", ressources: "1" };
        list.push(newSR);
        Store.save();
        container.appendChild(createSRDom(newSR));
    };
}

function initObjectifsVisesPage() {
    const container = document.getElementById('ov-container');
    const btnAdd = document.getElementById('btn-add-ov');
    if (!container || !btnAdd) return;

    const list = Store.data.atelier2.objectifsVises;
    container.innerHTML = '';
    list.forEach(ov => container.appendChild(createOVDom(ov)));

    btnAdd.onclick = () => {
        const newOV = { id: generateNextId(list, 'OV'), libelle: "", description: "" };
        list.push(newOV);
        Store.save();
        container.appendChild(createOVDom(newOV));
    };
}

function initEvaluationMenacePage() {
    const tbody = document.getElementById('menaces-tbody');
    const btnAdd = document.getElementById('btn-add-menace');
    const template = document.getElementById('tpl-menace-row');
    if (!tbody || !btnAdd || !template) return;

    const list = Store.data.atelier2.menaces;
    tbody.innerHTML = '';
    list.forEach(menace => tbody.appendChild(createMenaceDom(menace, template)));

    btnAdd.onclick = () => {
        const newMenace = { id: Date.now().toString(), srId: "", ovId: "", motivation: "1", commentaires: "" };
        list.push(newMenace);
        Store.save();
        tbody.appendChild(createMenaceDom(newMenace, template));
    };
}

export function init() {
    if(document.getElementById('sr-container')) initSourcesRisquePage();
    if(document.getElementById('ov-container')) initObjectifsVisesPage();
    if(document.getElementById('menaces-tbody')) initEvaluationMenacePage();
}
