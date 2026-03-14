import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, tap, withId } from '../utils.js';

function createPPDom(pp, ppList) {
    const typesPP = Store.data.referentiels?.typesDependancePP || [];
    const typeOpts = typesPP.map(t => ({ value: t.id, label: t.label }));

    // --- EN-TETE (Bandeau du haut) ---
    const headerElements = [
        tap(UI.inputGroup("Nom", null, null, { bind: { obj: pp, key: 'nom' } }), el => {
            el.style.width = '300px';
            el.style.margin = '0';
        }),
        tap(UI.selectGroup("Type de dépendance", null, [{ value: '', label: '-- Type --' }, ...typeOpts], null, { 
            bind: { obj: pp, key: 'typePPId' } 
        }), el => {
            el.style.width = '250px';
            el.style.margin = '0';
            const select = el.querySelector('select');
            select.onchange = (e) => {
                const typeDef = typesPP.find(t => t.id === pp.typePPId);
                pp.exigencesList = (typeDef?.exigences || []).map(ex => {
                    const existing = (pp.exigencesList || []).find(e => e.label === ex);
                    return { label: ex, val: existing?.val || '' };
                });
                Store.save();
                renderExigences();
            };
        })
    ];

    // --- CONTENU (3 Colonnes) ---
    const content = document.createDocumentFragment();
    
    // Colonne 1 : Constats
    const col1 = tap(document.createElement('div'), el => el.className = 'column');
    col1.appendChild(UI.inputGroup("Constats / Observations", null, null, { multiline: true, bind: { obj: pp, key: 'constats' } }));

    // Colonne 2 : Exigences
    const col2 = tap(document.createElement('div'), el => el.className = 'column');
    const exWrapper = tap(document.createElement('div'), el => {
        el.innerHTML = '<label>Exigences de sécurité</label>';
        const wrapper = tap(document.createElement('div'), w => w.className = 'inner-table-wrapper');
        el.appendChild(wrapper);
    });
    col2.appendChild(exWrapper);

    function renderExigences() {
        const wrapper = exWrapper.querySelector('.inner-table-wrapper');
        wrapper.innerHTML = '';
        if (!pp.typePPId) {
            wrapper.innerHTML = '<p style="padding:10px; font-size:12px; opacity:0.6; text-align:center;">Sélectionnez un type de dépendance</p>';
            return;
        }
        const table = tap(document.createElement('table'), t => t.className = 'inner-table');
        table.innerHTML = `<thead><tr><th>Exigence</th><th>Évaluation / Preuve</th></tr></thead>`;
        const tbody = document.createElement('tbody');
        (pp.exigencesList || []).forEach(ex => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${ex.label}</td>`;
            const tdVal = tap(document.createElement('td'), td => {
                td.appendChild(tap(document.createElement('input'), i => {
                    i.type = 'text';
                    i.value = ex.val || '';
                    i.style.margin = '0';
                    i.style.padding = '4px';
                    i.style.fontSize = '11px';
                    i.oninput = () => { ex.val = i.value; Store.save(); };
                }));
            });
            tr.appendChild(tdVal);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrapper.appendChild(table);
    }
    renderExigences();

    // Colonne 3 : Mesures proposées
    const col3 = tap(document.createElement('div'), el => el.className = 'column');
    col3.appendChild(UI.inputGroup("Mesures de sécurité proposées", null, null, { multiline: true, bind: { obj: pp, key: 'mesuresProposees' } }));

    content.appendChild(col1);
    content.appendChild(col2);
    content.appendChild(col3);

    // --- CARTE A RABAT ---
    const card = UI.foldingCard(null, {
        headerElements: headerElements,
        content: content,
        columns: true,
        onDelete: () => {
            confirmAction(`Supprimer la partie prenante ${pp.id} ?`, () => {
                const idx = ppList.indexOf(pp);
                if(idx > -1) {
                    ppList.splice(idx, 1);
                    Store.save();
                    card.remove();
                }
            });
        }
    });
    card.setAttribute('data-id', pp.id);
    return card;
}

export function init() {
    const container = document.getElementById('pp-container');
    const btnAdd = document.getElementById('btn-add-pp-list');
    if (!container || !btnAdd) return;

    const ppList = Store.data.atelier3.partiesPrenantes;
    container.innerHTML = '';
    ppList.forEach(pp => container.appendChild(createPPDom(pp, ppList)));

    btnAdd.onclick = () => {
        const newPP = { 
            id: generateNextId(ppList, 'PP'), 
            nom: "", 
            typePPId: "", 
            constats: "",
            exigencesList: [],
            mesuresProposees: "",
            // legacy props maintained for compatibility with scoring if needed
            dependance: 1, 
            penetration: 1, 
            maturite: 1, 
            intentions: 1, 
            commentaires: "" 
        };
        ppList.push(newPP);
        Store.save();
        container.appendChild(createPPDom(newPP, ppList));
    };
}
