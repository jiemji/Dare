import { Store } from '../data.js';
import { UI } from '../components.js';
import { withId, tap } from '../utils.js';

function createPPEvalDom(pp) {
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
    addCell(pp.nom || "(Sans nom)");
    
    const scoreOpts = [1, 2, 3, 4].map(v => ({ value: v, label: v }));
    
    addCell(UI.selectGroup('', pp.dependance || 1, scoreOpts, (val) => { 
        pp.dependance = parseInt(val); updateCalculations(); Store.save(); 
    }, { hideLabel: true }));
    
    addCell(UI.selectGroup('', pp.penetration || 1, scoreOpts, (val) => { 
        pp.penetration = parseInt(val); updateCalculations(); Store.save(); 
    }, { hideLabel: true }));
    
    addCell(tap(document.createElement('span'), s => {
        s.className = 'td-exp';
        s.style.fontWeight = 'bold';
    }));
    
    addCell(UI.selectGroup('', pp.maturite || 1, scoreOpts, (val) => { 
        pp.maturite = parseInt(val); updateCalculations(); Store.save(); 
    }, { hideLabel: true }));
    
    addCell(UI.selectGroup('', pp.intentions || 1, scoreOpts, (val) => { 
        pp.intentions = parseInt(val); updateCalculations(); Store.save(); 
    }, { hideLabel: true }));
    
    addCell(tap(document.createElement('span'), s => {
        s.className = 'td-fia';
        s.style.fontWeight = 'bold';
    }));

    updateCalculations();
    return row;
}

export function init() {
    const tbody = document.getElementById('pp-eval-tbody');
    if (!tbody) return;

    const ppList = Store.data.atelier3.partiesPrenantes;
    tbody.innerHTML = '';
    
    if (ppList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Aucune partie prenante définie. Rendez-vous sur la page "Parties prenantes" pour en ajouter.</td></tr>';
        return;
    }

    ppList.forEach(pp => tbody.appendChild(createPPEvalDom(pp)));
}
