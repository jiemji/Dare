import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, tap, withId } from '../utils.js';

/**
 * Crée le DOM pour une carte de bien support
 */
function createBsDom(bs, bsList) {
    const processusList = Store.data.atelier1?.processus || [];
    const procOptions = processusList.map(p => ({ value: p.id, label: `${p.id} - ${p.nom}` }));
    const typesActifs = Store.data.referentiels?.typesActifs || [];
    const typeOpts = typesActifs.map(t => ({ value: t.id, label: t.label }));

    const fields = [
        { label: "Nom de l'actif", bind: { obj: bs, key: 'nom' } },
        { label: "Processus métier rattaché", type: 'select', options: [{ value: '', label: '-- Sélectionner --' }, ...procOptions], bind: { obj: bs, key: 'processusId' } },
        { 
            label: "Type d'actif", 
            type: 'select', 
            options: [{ value: '', label: '-- Sélectionner --' }, ...typeOpts], 
            bind: { obj: bs, key: 'typeId' },
            onchange: (val) => {
                const typeDef = typesActifs.find(t => t.id === val);
                bs.exigences = (typeDef?.exigences || []).map(ex => {
                    const existing = (bs.exigences || []).find(e => e.label === ex);
                    return { label: ex, info: existing?.info || '' };
                });
                Store.save();
                renderExigences();
            }
        }
    ];

    const card = withId(UI.dataCard('square', bs.id || 'BS##', fields, () => {
        confirmAction(`Supprimer le bien support ${bs.id} ?`, () => {
            const idx = bsList.indexOf(bs);
            if(idx > -1) {
                bsList.splice(idx, 1);
                Store.save();
                card.remove();
            }
        });
    }), bs.id);

    const tableContainer = tap(document.createElement('div'), el => {
        el.style.cssText = 'margin-top:10px; border:1px solid var(--c-border); border-radius:var(--border-radius); overflow:hidden;';
        card.appendChild(el);
    });

    function renderExigences() {
        tableContainer.innerHTML = '';
        if (!bs.typeId) {
            tableContainer.innerHTML = '<p style="padding:10px; font-size:12px; opacity:0.6; text-align:center;">Sélectionnez un type d\'actif</p>';
            return;
        }

        const table = tap(document.createElement('table'), t => {
            t.style.cssText = 'width:100%; border-collapse:collapse; font-size:12px;';
            t.innerHTML = `<thead><tr style="background:var(--c-bg-app); border-bottom:1px solid var(--c-border);">
                <th style="padding:5px; text-align:left; width:60%;">Exigence</th>
                <th style="padding:5px; text-align:left;">Information</th>
            </tr></thead>`;
        });

        const tbody = document.createElement('tbody');
        (bs.exigences || []).forEach(ex => {
            const tr = tap(document.createElement('tr'), r => r.style.borderBottom = '1px solid var(--c-border)');
            tr.innerHTML = `<td style="padding:5px;">${ex.label}</td>`;
            const tdInfo = tap(document.createElement('td'), d => d.style.padding = '2px');
            tdInfo.appendChild(tap(document.createElement('input'), i => {
                i.type = 'text';
                i.value = ex.info || '';
                i.style.cssText = 'margin:0; padding:4px; font-size:11px;';
                i.oninput = () => { ex.info = i.value; Store.save(); };
            }));
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

    if (!Store.data.atelier1.inventaire) Store.data.atelier1.inventaire = [];
    const list = Store.data.atelier1.inventaire;

    container.innerHTML = '';
    list.forEach(bs => container.appendChild(createBsDom(bs, list)));

    btnAdd.onclick = () => {
        const newBS = { id: generateNextId(list, 'BS'), nom: '', processusId: '', typeId: '', exigences: [] };
        list.push(newBS);
        Store.save();
        container.appendChild(createBsDom(newBS, list));
    };
}
