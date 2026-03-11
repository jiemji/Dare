// Logique spécifique à l'atelier 1 : Processus métier & Evénements regrettables

// --- PROCESSUS --- //
function initProcessusPage() {
    const container = document.getElementById('processus-container');
    const btnAdd = document.getElementById('btn-add-processus');
    const template = document.getElementById('tpl-processus-card');

    if (!container || !btnAdd || !template) return;

    // Load existing data
    const processusList = Store.data.atelier1.processus;
    container.innerHTML = '';
    
    processusList.forEach(proc => {
        container.appendChild(createProcessusDom(proc, template));
    });

    // Add button
    btnAdd.addEventListener('click', () => {
        // Find next Ref VM##
        let maxRef = 0;
        processusList.forEach(p => {
            const num = parseInt(p.id.replace('VM', ''), 10);
            if (!isNaN(num) && num > maxRef) maxRef = num;
        });
        
        const newRef = `VM${(maxRef + 1).toString().padStart(2, '0')}`;
        const newProc = { id: newRef, nom: "", description: "" };
        
        processusList.push(newProc);
        Store.save();
        container.appendChild(createProcessusDom(newProc, template));
    });
}

function createProcessusDom(proc, template) {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.processus-card');
    
    card.setAttribute('data-id', proc.id);
    clone.querySelector('.ref-display').textContent = proc.id;
    
    const inpRef = clone.querySelector('.proc-ref');
    const inpNom = clone.querySelector('.proc-nom');
    const inpDesc = clone.querySelector('.proc-desc');
    const btnDel = clone.querySelector('.btn-del-processus');
    
    inpRef.value = proc.id;
    inpNom.value = proc.nom;
    inpDesc.value = proc.description;
    
    // Save on edits
    const saveChanges = () => {
        proc.nom = inpNom.value;
        proc.description = inpDesc.value;
        // Optionnel : Store.save() ici, ou laisser le bouton principal faire la sauvegarde
    };
    inpNom.addEventListener('input', saveChanges);
    inpDesc.addEventListener('input', saveChanges);
    
    // Delete
    btnDel.addEventListener('click', () => {
        if(confirm(`Supprimer le processus ${proc.id} et ses événements liés ?`)){
            card.remove();
            
            // Retirer du Store
            Store.data.atelier1.processus = Store.data.atelier1.processus.filter(p => p.id !== proc.id);
            // Retirer les évènements liés
            Store.data.atelier1.evenements = Store.data.atelier1.evenements.filter(e => e.processusId !== proc.id);
            Store.save();
        }
    });
    
    return clone;
}

// --- EVENEMENTS REGRETTABLES --- //
function initEvenementsPage() {
    const container = document.getElementById('er-container');
    const tplSection = document.getElementById('tpl-er-section');
    const tplCard = document.getElementById('tpl-er-card');
    
    if(!container || !tplSection || !tplCard) return;
    
    container.innerHTML = '';
    const processusList = Store.data.atelier1.processus;
    const erList = Store.data.atelier1.evenements;
    
    if(processusList.length === 0) {
        container.innerHTML = "<p><em>Veuillez d'abord créer des processus métier.</em></p>";
        return;
    }
    
    // Pour chaque processus, on crée une section
    processusList.forEach(proc => {
        const secClone = tplSection.content.cloneNode(true);
        const section = secClone.querySelector('.processus-section');
        section.setAttribute('data-proc-id', proc.id);
        
        const procTitre = proc.nom ? `${proc.id} - ${proc.nom}` : proc.id;
        secClone.querySelector('.proc-title').textContent = "Processus " + procTitre;
        
        const erListContainer = secClone.querySelector('.er-list');
        const btnAddER = secClone.querySelector('.btn-add-er');
        
        // Afficher les ER de ce processus
        const procErs = erList.filter(e => e.processusId === proc.id);
        procErs.forEach(er => {
            erListContainer.appendChild(createERDom(er, proc.id, tplCard));
        });
        
        // Bouton ajouter
        btnAddER.addEventListener('click', () => {
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
            erListContainer.appendChild(createERDom(newER, proc.id, tplCard));
        });
        
        container.appendChild(secClone);
    });
}

function createERDom(er, procId, template) {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.er-card');
    card.setAttribute('data-er-id', er.id);
    
    clone.querySelector('.er-ref-display').textContent = er.id;
    
    const inpDesc = clone.querySelector('.er-desc');
    const selTypo = clone.querySelector('.er-typo');
    const selGravite = clone.querySelector('.er-gravite');
    const impactsList = clone.querySelector('.er-impacts-list');
    const btnDel = clone.querySelector('.btn-del-er');
    
    // Populate Gravités
    selGravite.innerHTML = '';
    Store.data.referentiels.gravite.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.valeur;
        opt.textContent = `${g.valeur} - ${g.niveau}`;
        selGravite.appendChild(opt);
    });
    
    // Populate Impacts (Checkboxes)
    impactsList.innerHTML = '';
    Store.data.referentiels.impacts.forEach(imp => {
        const lbl = document.createElement('label');
        lbl.style.display = 'block';
        lbl.style.fontSize = '12px';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = imp;
        cb.checked = (er.impacts || []).includes(imp);
        
        cb.addEventListener('change', () => {
            if(cb.checked) {
                if(!er.impacts.includes(imp)) er.impacts.push(imp);
            } else {
                er.impacts = er.impacts.filter(i => i !== imp);
            }
        });
        
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' ' + imp));
        impactsList.appendChild(lbl);
    });
    
    // Load values
    inpDesc.value = er.description;
    selTypo.value = er.typo;
    selGravite.value = er.gravite;
    
    // Events
    const saveChanges = () => {
        er.description = inpDesc.value;
        er.typo = selTypo.value;
        er.gravite = selGravite.value;
    };
    
    inpDesc.addEventListener('input', saveChanges);
    selTypo.addEventListener('change', saveChanges);
    selGravite.addEventListener('change', saveChanges);
    
    btnDel.addEventListener('click', () => {
        if(confirm(`Supprimer l'événement ${er.id} ?`)) {
            card.remove();
            Store.data.atelier1.evenements = Store.data.atelier1.evenements.filter(e => e.id !== er.id);
            Store.save();
        }
    });
    
    return clone;
}

// Attach to events
document.addEventListener('pageLoaded:processus', initProcessusPage);
document.addEventListener('pageLoaded:evenements', initEvenementsPage);

// Note: since app.js executes script tags once, we can init immediately if the elements are already in the DOM
if(document.getElementById('processus-container')) initProcessusPage();
if(document.getElementById('er-container')) initEvenementsPage();
