// Logique spécifique à l'atelier 3 : Parties prenantes

function initPartiesPrenantesPage() {
    const tbody = document.getElementById('pp-tbody');
    const btnAdd = document.getElementById('btn-add-pp');
    const template = document.getElementById('tpl-pp-row');

    if (!tbody || !btnAdd || !template) return;

    const ppList = Store.data.atelier3.partiesPrenantes;
    tbody.innerHTML = '';
    
    ppList.forEach(pp => {
        tbody.appendChild(createPPDom(pp, template));
    });

    btnAdd.addEventListener('click', () => {
        let maxRef = 0;
        ppList.forEach(p => {
            const num = parseInt(p.id.replace('PP', ''), 10);
            if (!isNaN(num) && num > maxRef) maxRef = num;
        });
        
        const newRef = `PP${(maxRef + 1).toString().padStart(2, '0')}`;
        const newPP = { 
            id: newRef, 
            nom: "", 
            type: "Fournisseur", 
            dependance: "1", 
            penetration: "1",
            maturite: "1",
            intentions: "1",
            commentaires: ""
        };
        
        ppList.push(newPP);
        Store.save();
        tbody.appendChild(createPPDom(newPP, template));
    });
}

function createPPDom(pp, template) {
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.pp-row');
    row.setAttribute('data-pp-id', pp.id);
    
    clone.querySelector('.pp-ref').textContent = pp.id;
    
    const inpNom = clone.querySelector('.pp-nom');
    const selType = clone.querySelector('.pp-type');
    const selDep = clone.querySelector('.pp-dep');
    const selPen = clone.querySelector('.pp-pen');
    const dispExp = clone.querySelector('.pp-exposition');
    const selMat = clone.querySelector('.pp-mat');
    const selInt = clone.querySelector('.pp-int');
    const dispFia = clone.querySelector('.pp-fiabilite');
    const inpComm = clone.querySelector('.pp-comm');
    const btnDel = clone.querySelector('.btn-del-pp');
    
    // Set initial values
    inpNom.value = pp.nom || "";
    selType.value = pp.type || "Fournisseur";
    selDep.value = pp.dependance || "1";
    selPen.value = pp.penetration || "1";
    selMat.value = pp.maturite || "1";
    selInt.value = pp.intentions || "1";
    inpComm.value = pp.commentaires || "";
    
    // Calculations
    const updateCalculations = () => {
        const dep = parseInt(selDep.value, 10) || 1;
        const pen = parseInt(selPen.value, 10) || 1;
        const mat = parseInt(selMat.value, 10) || 1;
        const intt = parseInt(selInt.value, 10) || 1; // 'int' is a reserved keyword in some contexts
        
        const exposition = dep * pen;
        const fiabilite = mat * intt;
        
        dispExp.textContent = exposition.toString();
        dispFia.textContent = fiabilite.toString();
        
        // Optional coloring based on score (1 to 16)
        dispExp.style.color = exposition > 8 ? "var(--c-accent)" : "inherit";
        dispFia.style.color = fiabilite > 8 ? "var(--c-accent)" : "inherit";
    };
    updateCalculations();
    
    // Save function
    const saveChanges = () => {
        pp.nom = inpNom.value;
        pp.type = selType.value;
        pp.dependance = selDep.value;
        pp.penetration = selPen.value;
        pp.maturite = selMat.value;
        pp.intentions = selInt.value;
        pp.commentaires = inpComm.value;
        
        updateCalculations();
    };
    
    // Event listeners
    inpNom.addEventListener('input', saveChanges);
    selType.addEventListener('change', saveChanges);
    selDep.addEventListener('change', saveChanges);
    selPen.addEventListener('change', saveChanges);
    selMat.addEventListener('change', saveChanges);
    selInt.addEventListener('change', saveChanges);
    inpComm.addEventListener('input', saveChanges);
    
    btnDel.addEventListener('click', () => {
        if(confirm(`Supprimer la partie prenante ${pp.id} ?`)) {
            row.remove();
            Store.data.atelier3.partiesPrenantes = Store.data.atelier3.partiesPrenantes.filter(p => p.id !== pp.id);
            Store.save();
        }
    });
    
    return clone;
}

// Global hook
document.addEventListener('pageLoaded:parties_prenantes', initPartiesPrenantesPage);

// Initial execution
if(document.getElementById('pp-tbody')) initPartiesPrenantesPage();
