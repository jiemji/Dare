// Logique spécifique à l'atelier 2

// --- SOURCES DE RISQUE --- //
function initSourcesRisquePage() {
    const container = document.getElementById('sr-container');
    const btnAdd = document.getElementById('btn-add-sr');
    const template = document.getElementById('tpl-sr-card');

    if (!container || !btnAdd || !template) return;

    const sourcesList = Store.data.atelier2.sourcesRisque;
    container.innerHTML = '';
    
    sourcesList.forEach(sr => {
        container.appendChild(createSRDom(sr, template));
    });

    btnAdd.addEventListener('click', () => {
        let maxRef = 0;
        sourcesList.forEach(s => {
            const num = parseInt(s.id.replace('SR', ''), 10);
            if (!isNaN(num) && num > maxRef) maxRef = num;
        });
        
        const newRef = `SR${(maxRef + 1).toString().padStart(2, '0')}`;
        const newSR = { id: newRef, libelle: "", description: "", ressources: "1" };
        
        sourcesList.push(newSR);
        Store.save();
        container.appendChild(createSRDom(newSR, template));
    });
}

function createSRDom(sr, template) {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.sr-card');
    
    card.setAttribute('data-sr-id', sr.id);
    clone.querySelector('.sr-ref-display').textContent = sr.id;
    
    const inpLibelle = clone.querySelector('.sr-libelle');
    const inpDesc = clone.querySelector('.sr-desc');
    const selRessources = clone.querySelector('.sr-ressources');
    const btnDel = clone.querySelector('.btn-del-sr');
    
    // Populate Ressources
    selRessources.innerHTML = '';
    Store.data.referentiels.ressources.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.valeur;
        opt.textContent = `${r.valeur} - ${r.niveau}`;
        selRessources.appendChild(opt);
    });
    
    inpLibelle.value = sr.libelle;
    inpDesc.value = sr.description;
    selRessources.value = sr.ressources;
    
    const saveChanges = () => {
        sr.libelle = inpLibelle.value;
        sr.description = inpDesc.value;
        sr.ressources = selRessources.value;
    };
    
    inpLibelle.addEventListener('input', saveChanges);
    inpDesc.addEventListener('input', saveChanges);
    selRessources.addEventListener('change', saveChanges);
    
    btnDel.addEventListener('click', () => {
        if(confirm(`Supprimer la source de risque ${sr.id} ?`)){
            card.remove();
            Store.data.atelier2.sourcesRisque = Store.data.atelier2.sourcesRisque.filter(s => s.id !== sr.id);
            // Cascade delete on menaces
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.srId !== sr.id);
            Store.save();
        }
    });
    
    return clone;
}

// --- OBJECTIFS VISES --- //
function initObjectifsVisesPage() {
    const container = document.getElementById('ov-container');
    const btnAdd = document.getElementById('btn-add-ov');
    const template = document.getElementById('tpl-ov-card');

    if (!container || !btnAdd || !template) return;

    const ovList = Store.data.atelier2.objectifsVises;
    container.innerHTML = '';
    
    ovList.forEach(ov => {
        container.appendChild(createOVDom(ov, template));
    });

    btnAdd.addEventListener('click', () => {
        let maxRef = 0;
        ovList.forEach(o => {
            const num = parseInt(o.id.replace('OV', ''), 10);
            if (!isNaN(num) && num > maxRef) maxRef = num;
        });
        
        const newRef = `OV${(maxRef + 1).toString().padStart(2, '0')}`;
        const newOV = { id: newRef, libelle: "", description: "" };
        
        ovList.push(newOV);
        Store.save();
        container.appendChild(createOVDom(newOV, template));
    });
}

function createOVDom(ov, template) {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.ov-card');
    
    card.setAttribute('data-ov-id', ov.id);
    clone.querySelector('.ov-ref-display').textContent = ov.id;
    
    const inpLibelle = clone.querySelector('.ov-libelle');
    const inpDesc = clone.querySelector('.ov-desc');
    const btnDel = clone.querySelector('.btn-del-ov');
    
    inpLibelle.value = ov.libelle;
    inpDesc.value = ov.description;
    
    const saveChanges = () => {
        ov.libelle = inpLibelle.value;
        ov.description = inpDesc.value;
    };
    
    inpLibelle.addEventListener('input', saveChanges);
    inpDesc.addEventListener('input', saveChanges);
    
    btnDel.addEventListener('click', () => {
        if(confirm(`Supprimer l'objectif visé ${ov.id} ?`)){
            card.remove();
            Store.data.atelier2.objectifsVises = Store.data.atelier2.objectifsVises.filter(o => o.id !== ov.id);
            // Cascade delete on menaces
            Store.data.atelier2.menaces = Store.data.atelier2.menaces.filter(m => m.ovId !== ov.id);
            Store.save();
        }
    });
    
    return clone;
}

// --- EVALUATION DE LA MENACE --- //
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

    btnAdd.addEventListener('click', () => {
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
    });
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
    
    // Populate SR
    selSr.innerHTML = '<option value="">-- Choisir SR --</option>';
    Store.data.atelier2.sourcesRisque.forEach(sr => {
        const opt = document.createElement('option');
        opt.value = sr.id;
        opt.textContent = `${sr.id} - ${sr.libelle || 'N/A'}`;
        selSr.appendChild(opt);
    });
    
    // Populate OV
    selOv.innerHTML = '<option value="">-- Choisir OV --</option>';
    Store.data.atelier2.objectifsVises.forEach(ov => {
        const opt = document.createElement('option');
        opt.value = ov.id;
        opt.textContent = `${ov.id} - ${ov.libelle || 'N/A'}`;
        selOv.appendChild(opt);
    });
    
    // Populate Ressources (Display only)
    selRessources.innerHTML = '<option value="">--</option>';
    Store.data.referentiels.ressources.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.valeur;
        opt.textContent = `${r.valeur} - ${r.niveau}`;
        selRessources.appendChild(opt);
    });
    
    // Populate Motivation
    selMotivation.innerHTML = '';
    Store.data.referentiels.motivation.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.valeur;
        opt.textContent = `${m.valeur} - ${m.niveau}`;
        selMotivation.appendChild(opt);
    });
    
    // Set values
    selSr.value = menace.srId;
    selOv.value = menace.ovId;
    selMotivation.value = menace.motivation;
    inpComm.value = menace.commentaires;
    
    // Update linked ressources when SR changes
    const updateRessourcesDisplay = () => {
        const sr = Store.data.atelier2.sourcesRisque.find(s => s.id === selSr.value);
        if (sr && sr.ressources) {
            selRessources.value = sr.ressources;
        } else {
            selRessources.value = "";
        }
    };
    updateRessourcesDisplay();
    
    // Events
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

// Attach to events
document.addEventListener('pageLoaded:sources', initSourcesRisquePage);
document.addEventListener('pageLoaded:objectifs', initObjectifsVisesPage);
document.addEventListener('pageLoaded:evaluation', initEvaluationMenacePage);

// Note: since app.js executes script tags once, we can init immediately if the elements are already in the DOM
if(document.getElementById('sr-container')) initSourcesRisquePage();
if(document.getElementById('ov-container')) initObjectifsVisesPage();
if(document.getElementById('menaces-tbody')) initEvaluationMenacePage();
