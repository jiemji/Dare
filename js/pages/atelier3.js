import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

function createPPDom(pp) {
    const row = document.createElement('tr');
    row.className = 'pp-row';
    row.setAttribute('data-pp-id', pp.id);
    
    // ID cell
    const tdId = document.createElement('td');
    tdId.textContent = pp.id;
    row.appendChild(tdId);
    
    // Nom cell
    const tdNom = document.createElement('td');
    const inpNom = document.createElement('input');
    inpNom.type = 'text';
    inpNom.value = pp.nom || "";
    inpNom.oninput = () => { pp.nom = inpNom.value; Store.save(); };
    tdNom.appendChild(inpNom);
    row.appendChild(tdNom);
    
    // Type cell
    const tdType = document.createElement('td');
    const types = ["Fournisseur", "Partenaire", "Client", "Interne"];
    const selType = document.createElement('select');
    types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        selType.appendChild(opt);
    });
    selType.value = pp.type || "Fournisseur";
    selType.onchange = () => { pp.type = selType.value; Store.save(); };
    tdType.appendChild(selType);
    row.appendChild(tdType);
    
    // Dependance cell
    const tdDep = document.createElement('td');
    const selDep = document.createElement('select');
    [1, 2, 3, 4].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        selDep.appendChild(opt);
    });
    selDep.value = pp.dependance || "1";
    tdDep.appendChild(selDep);
    row.appendChild(tdDep);
    
    // Penetration cell
    const tdPen = document.createElement('td');
    const selPen = document.createElement('select');
    [1, 2, 3, 4].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        selPen.appendChild(opt);
    });
    selPen.value = pp.penetration || "1";
    tdPen.appendChild(selPen);
    row.appendChild(tdPen);
    
    // Exposition cell (Calculation)
    const tdExp = document.createElement('td');
    tdExp.className = 'score-cell';
    row.appendChild(tdExp);
    
    // Maturite cell
    const tdMat = document.createElement('td');
    const selMat = document.createElement('select');
    [1, 2, 3, 4].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        selMat.appendChild(opt);
    });
    selMat.value = pp.maturite || "1";
    tdMat.appendChild(selMat);
    row.appendChild(tdMat);
    
    // Intentions cell
    const tdInt = document.createElement('td');
    const selInt = document.createElement('select');
    [1, 2, 3, 4].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        selInt.appendChild(opt);
    });
    selInt.value = pp.intentions || "1";
    tdInt.appendChild(selInt);
    row.appendChild(tdInt);
    
    // Fiabilité cell (Calculation)
    const tdFia = document.createElement('td');
    tdFia.className = 'score-cell';
    row.appendChild(tdFia);
    
    // Commentaires cell
    const tdComm = document.createElement('td');
    const inpComm = document.createElement('input');
    inpComm.type = 'text';
    inpComm.value = pp.commentaires || "";
    inpComm.oninput = () => { pp.commentaires = inpComm.value; Store.save(); };
    tdComm.appendChild(inpComm);
    row.appendChild(tdComm);
    
    // Actions cell
    const tdActions = document.createElement('td');
    const btnDel = UI.button('X', () => {
        if(confirm(`Supprimer la partie prenante ${pp.id} ?`)) {
            row.remove();
            Store.data.atelier3.partiesPrenantes = Store.data.atelier3.partiesPrenantes.filter(p => p.id !== pp.id);
            Store.save();
        }
    });
    tdActions.appendChild(btnDel);
    row.appendChild(tdActions);

    const updateCalculations = () => {
        const dep = parseInt(selDep.value, 10);
        const pen = parseInt(selPen.value, 10);
        const mat = parseInt(selMat.value, 10);
        const intt = parseInt(selInt.value, 10);
        
        const exposition = dep * pen;
        const fiabilite = mat * intt;
        
        tdExp.textContent = exposition;
        tdFia.textContent = fiabilite;
        
        tdExp.style.color = exposition > 8 ? "var(--c-accent)" : "inherit";
        tdFia.style.color = fiabilite > 8 ? "var(--c-accent)" : "inherit";
        
        pp.dependance = selDep.value;
        pp.penetration = selPen.value;
        pp.maturite = selMat.value;
        pp.intentions = selInt.value;
    };
    
    [selDep, selPen, selMat, selInt].forEach(s => {
        s.onchange = () => { updateCalculations(); Store.save(); };
    });
    
    updateCalculations();
    
    return row;
}

export function init() {
    const tbody = document.getElementById('pp-tbody');
    const btnAdd = document.getElementById('btn-add-pp');

    if (!tbody || !btnAdd) return;

    const ppList = Store.data.atelier3.partiesPrenantes;
    tbody.innerHTML = '';
    
    ppList.forEach(pp => {
        tbody.appendChild(createPPDom(pp));
    });

    btnAdd.onclick = () => {
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
        tbody.appendChild(createPPDom(newPP));
    };
}
