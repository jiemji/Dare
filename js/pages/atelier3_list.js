import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, tap, withId } from '../utils.js';

function createPPListDom(pp, ppList) {
    const row = withId(document.createElement('tr'), pp.id);
    row.className = 'pp-row';
    
    const addCell = (content) => tap(document.createElement('td'), td => {
        if (content instanceof HTMLElement) td.appendChild(content);
        else td.textContent = content;
        row.appendChild(td);
    });

    addCell(pp.id);
    addCell(tap(document.createElement('input'), i => {
        i.type = 'text'; i.value = pp.nom || "";
        i.placeholder = "Ex: Hébergeur X";
        i.oninput = () => { pp.nom = i.value; Store.save(); };
    }));
    
    const types = ["Fournisseur", "Partenaire", "Client", "Sous-traitant", "Utilisateur", "Interne"].map(t => ({ value: t, label: t }));
    addCell(UI.selectGroup('', pp.type || "Fournisseur", types, (val) => { pp.type = val; Store.save(); }, { hideLabel: true }));

    addCell(tap(document.createElement('input'), i => {
        i.type = 'text'; i.value = pp.commentaires || "";
        i.placeholder = "Commentaires...";
        i.oninput = () => { pp.commentaires = i.value; Store.save(); };
    }));

    addCell(UI.button('✕', () => {
        confirmAction(`Supprimer la partie prenante ${pp.id} ?`, () => {
            const idx = ppList.indexOf(pp);
            if(idx > -1) { ppList.splice(idx, 1); Store.save(); row.remove(); }
        });
    }, 'secondary'));

    return row;
}

export function init() {
    const tbody = document.getElementById('pp-list-tbody');
    const btnAdd = document.getElementById('btn-add-pp-list');
    if (!tbody || !btnAdd) return;

    const ppList = Store.data.atelier3.partiesPrenantes;
    tbody.innerHTML = '';
    ppList.forEach(pp => tbody.appendChild(createPPListDom(pp, ppList)));

    btnAdd.onclick = () => {
        const newPP = { 
            id: generateNextId(ppList, 'PP'), 
            nom: "", 
            type: "Fournisseur", 
            dependance: 1, 
            penetration: 1, 
            maturite: 1, 
            intentions: 1, 
            commentaires: "" 
        };
        ppList.push(newPP);
        Store.save();
        tbody.appendChild(createPPListDom(newPP, ppList));
    };
}
