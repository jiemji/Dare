import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, tap, withId } from '../utils.js';

function createPPDom(pp, ppList) {
    const row = withId(document.createElement('tr'), pp.id);
    row.className = 'pp-row';
    
    const updateCalculations = () => {
        const exposition = (pp.dependance || 1) * (pp.penetration || 1);
        const fiabilite = (pp.maturite || 1) * (pp.intentions || 1);
        row.querySelector('.td-exp').textContent = exposition;
        row.querySelector('.td-fia').textContent = fiabilite;
        row.querySelector('.td-exp').style.color = exposition > 8 ? "var(--c-accent)" : "inherit";
        row.querySelector('.td-fia').style.color = fiabilite > 8 ? "var(--c-accent)" : "inherit";
    };

    const addCell = (content) => tap(document.createElement('td'), td => {
        if (content instanceof HTMLElement) td.appendChild(content);
        else td.textContent = content;
        row.appendChild(td);
    });

    addCell(pp.id);
    addCell(tap(document.createElement('input'), i => {
        i.type = 'text'; i.value = pp.nom || "";
        i.oninput = () => { pp.nom = i.value; Store.save(); };
    }));
    
    const types = ["Fournisseur", "Partenaire", "Client", "Interne"].map(t => ({ value: t, label: t }));
    addCell(UI.selectGroup('', pp.type || "Fournisseur", types, (val) => { pp.type = val; Store.save(); }, { hideLabel: true }));

    const scoreOpts = [1, 2, 3, 4].map(v => ({ value: v, label: v }));
    addCell(UI.selectGroup('', pp.dependance || 1, scoreOpts, (val) => { pp.dependance = parseInt(val); updateCalculations(); Store.save(); }, { hideLabel: true }));
    addCell(UI.selectGroup('', pp.penetration || 1, scoreOpts, (val) => { pp.penetration = parseInt(val); updateCalculations(); Store.save(); }, { hideLabel: true }));
    
    addCell(tap(document.createElement('span'), s => s.className = 'td-exp'));
    
    addCell(UI.selectGroup('', pp.maturite || 1, scoreOpts, (val) => { pp.maturite = parseInt(val); updateCalculations(); Store.save(); }, { hideLabel: true }));
    addCell(UI.selectGroup('', pp.intentions || 1, scoreOpts, (val) => { pp.intentions = parseInt(val); updateCalculations(); Store.save(); }, { hideLabel: true }));
    
    addCell(tap(document.createElement('span'), s => s.className = 'td-fia'));
    
    addCell(tap(document.createElement('input'), i => {
        i.type = 'text'; i.value = pp.commentaires || "";
        i.oninput = () => { pp.commentaires = i.value; Store.save(); };
    }));

    addCell(UI.button('X', () => {
        confirmAction(`Supprimer la partie prenante ${pp.id} ?`, () => {
            const idx = ppList.indexOf(pp);
            if(idx > -1) { ppList.splice(idx, 1); Store.save(); row.remove(); }
        });
    }, 'secondary'));

    updateCalculations();
    return row;
}

export function init() {
    const tbody = document.getElementById('pp-tbody');
    const btnAdd = document.getElementById('btn-add-pp');
    if (!tbody || !btnAdd) return;

    const ppList = Store.data.atelier3.partiesPrenantes;
    tbody.innerHTML = '';
    ppList.forEach(pp => tbody.appendChild(createPPDom(pp, ppList)));

    btnAdd.onclick = () => {
        const newPP = { id: generateNextId(ppList, 'PP'), nom: "", type: "Fournisseur", dependance: 1, penetration: 1, maturite: 1, intentions: 1, commentaires: "" };
        ppList.push(newPP);
        Store.save();
        tbody.appendChild(createPPDom(newPP, ppList));
    };
}
