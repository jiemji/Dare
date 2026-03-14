import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

/**
 * Crée le DOM pour une carte de bien support
 */
function createBsDom(bs, bsList) {
    const card = document.createElement('div');
    card.className = 'card-square';
    card.style.position = 'relative';

    // Header de la carte
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '10px';
    
    const title = document.createElement('h4');
    title.textContent = bs.id || 'BS##';
    header.appendChild(title);

    const btnDel = UI.button('✕', () => {
        if(confirm(`Supprimer le bien support ${bs.id} ?`)) {
            const idx = bsList.indexOf(bs);
            if(idx > -1) {
                bsList.splice(idx, 1);
                Store.save();
                card.remove();
            }
        }
    }, 'secondary');
    btnDel.style.padding = '2px 6px';
    header.appendChild(btnDel);
    card.appendChild(header);

    // Nom de l'actif
    card.appendChild(UI.inputGroup('Nom de l\'actif', bs.nom || '', (val) => {
        bs.nom = val;
        Store.save();
    }));

    // Processus rattaché
    const processusList = (Store.data.atelier1 && Store.data.atelier1.processus) || [];
    const procOptions = processusList.map(p => ({ value: p.id, label: `${p.ref} - ${p.nom}` }));
    card.appendChild(UI.inputGroup('Processus métier rattaché', bs.processusId || '', (val) => {
        bs.processusId = val;
        Store.save();
    }, { type: 'select', options: [{ value: '', label: '-- Sélectionner --' }, ...procOptions] }));

    // Type d'actif
    const typesActifs = (Store.data.referentiels && Store.data.referentiels.typesActifs) || [];
    const typeOpts = typesActifs.map(t => ({ value: t.id, label: t.label }));
    const typeSelectGroup = UI.inputGroup('Type d\'actif', bs.typeId || '', (val) => {
        bs.typeId = val;
        // Reset exigences if type changed
        const typeDef = Store.data.referentiels.typesActifs.find(t => t.id === val);
        bs.exigences = (typeDef ? typeDef.exigences : []).map(ex => {
            const existing = (bs.exigences || []).find(e => e.label === ex);
            return { label: ex, info: existing ? existing.info : '' };
        });
        Store.save();
        renderExigences();
    }, { type: 'select', options: [{ value: '', label: '-- Sélectionner --' }, ...typeOpts] });
    card.appendChild(typeSelectGroup);

    // Tableau des exigences
    const tableContainer = document.createElement('div');
    tableContainer.style.marginTop = '10px';
    tableContainer.style.border = '1px solid var(--c-border)';
    tableContainer.style.borderRadius = 'var(--border-radius)';
    tableContainer.style.overflow = 'hidden';
    card.appendChild(tableContainer);

    function renderExigences() {
        tableContainer.innerHTML = '';
        if (!bs.typeId) {
            tableContainer.innerHTML = '<p style="padding:10px; font-size:12px; opacity:0.6; text-align:center;">Sélectionnez un type d\'actif</p>';
            return;
        }

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';

        const thead = document.createElement('thead');
        thead.innerHTML = `<tr style="background:var(--c-bg-app); border-bottom:1px solid var(--c-border);">
            <th style="padding:5px; text-align:left; width:60%;">Exigence</th>
            <th style="padding:5px; text-align:left;">Information</th>
        </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        (bs.exigences || []).forEach(ex => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--c-border)';
            
            const tdLabel = document.createElement('td');
            tdLabel.style.padding = '5px';
            tdLabel.textContent = ex.label;
            tr.appendChild(tdLabel);

            const tdInfo = document.createElement('td');
            tdInfo.style.padding = '2px';
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.value = ex.info || '';
            inp.style.margin = '0';
            inp.style.padding = '4px';
            inp.style.fontSize = '11px';
            inp.oninput = () => {
                ex.info = inp.value;
                Store.save();
            };
            tdInfo.appendChild(inp);
            tr.appendChild(tdInfo);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

    renderExigences();
    return card;
}

export function init() {
    const container = document.getElementById('bs-container');
    const btnAdd = document.getElementById('btn-add-bs');
    if(!container || !btnAdd) return;

    if (!Store.data.atelier1.inventaire) {
        Store.data.atelier1.inventaire = [];
    }

    const render = () => {
        container.innerHTML = '';
        Store.data.atelier1.inventaire.forEach(bs => {
            container.appendChild(createBsDom(bs, Store.data.atelier1.inventaire));
        });
    };

    btnAdd.onclick = () => {
        let max = 0;
        Store.data.atelier1.inventaire.forEach(b => {
            const num = parseInt((b.id || '0').replace('BS', ''), 10);
            if(num > max) max = num;
        });
        const newId = `BS${(max + 1).toString().padStart(2, '0')}`;
        const newBS = {
            id: newId,
            nom: '',
            processusId: '',
            typeId: '',
            exigences: []
        };
        Store.data.atelier1.inventaire.push(newBS);
        Store.save();
        container.appendChild(createBsDom(newBS, Store.data.atelier1.inventaire));
    };

    render();
}
