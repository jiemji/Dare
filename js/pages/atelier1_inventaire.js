import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, tap, withId } from '../utils.js';

/**
 * Crée le DOM pour une carte d'hébergement (Format à rabat 2 colonnes)
 */
function createHbDom(bs, bsList, onRefresh) {
    const typesActifs = Store.data.referentiels?.typesActifs || [];
    const hbTypes = typesActifs.filter(t => t.famille === 'hebergement');
    const typeOpts = hbTypes.map(t => ({ value: t.id, label: t.label }));

    // --- EN-TETE ---
    const headerElements = [
        tap(UI.inputGroup("Nom de l'hébergement", null, null, { bind: { obj: bs, key: 'nom' } }), el => {
            el.style.width = '250px';
            el.style.margin = '0';
            // On rafraîchit la page si le nom change pour mettre à jour les listes déroulantes ailleurs
            const input = el.querySelector('input');
            input.onblur = () => { onRefresh(); };
        }),
        tap(UI.selectGroup("Type", null, [{ value: '', label: '-- Choisir --' }, ...typeOpts], null, { 
            bind: { obj: bs, key: 'typeId' } 
        }), el => {
            el.style.width = '200px';
            el.style.margin = '0';
            const select = el.querySelector('select');
            select.onchange = (e) => {
                const val = e.target.value;
                bs.typeId = val;
                const typeDef = typesActifs.find(t => t.id === val);
                bs.exigences = (typeDef?.exigences || []).map(ex => {
                    const existing = (bs.exigences || []).find(e => e.label === ex);
                    return { label: ex, info: existing?.info || '' };
                });
                Store.save();
                renderExigences();
            };
        })
    ];

    // --- CONTENU (2 Colonnes) ---
    const content = document.createDocumentFragment();

    // Colonne 1 : Exigences
    const col1 = tap(document.createElement('div'), el => el.className = 'column');
    const exWrapper = tap(document.createElement('div'), el => {
        el.innerHTML = '<label>Exigences de sécurité</label>';
        const wrapper = tap(document.createElement('div'), w => w.className = 'inner-table-wrapper');
        el.appendChild(wrapper);
    });
    col1.appendChild(exWrapper);

    function renderExigences() {
        const wrapper = exWrapper.querySelector('.inner-table-wrapper');
        wrapper.innerHTML = '';
        if (!bs.typeId) {
            wrapper.innerHTML = '<p style="padding:10px; font-size:12px; opacity:0.6; text-align:center;">Sélectionnez un type</p>';
            return;
        }
        const table = tap(document.createElement('table'), t => t.className = 'inner-table');
        table.innerHTML = `<thead><tr><th>Exigence</th><th>Information</th></tr></thead>`;
        const tbody = document.createElement('tbody');
        (bs.exigences || []).forEach(ex => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${ex.label}</td>`;
            const tdInfo = tap(document.createElement('td'), td => {
                td.appendChild(tap(document.createElement('input'), i => {
                    i.type = 'text';
                    i.value = ex.info || '';
                    i.style.margin = '0';
                    i.style.padding = '4px';
                    i.style.fontSize = '11px';
                    i.oninput = () => { ex.info = i.value; Store.save(); };
                }));
            });
            tr.appendChild(tdInfo);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrapper.appendChild(table);
    }
    renderExigences();

    // Colonne 2 : Constat
    const col2 = tap(document.createElement('div'), el => el.className = 'column');
    col2.appendChild(UI.inputGroup("Constats / Observations", null, null, { multiline: true, bind: { obj: bs, key: 'constat' } }));

    content.appendChild(col1);
    content.appendChild(col2);

    // --- CARTE A RABAT ---
    const card = UI.foldingCard(null, {
        headerElements: headerElements,
        content: content,
        columns: 2,
        onDelete: () => {
            confirmAction(`Supprimer l'hébergement ${bs.id} ?`, () => {
                const idx = bsList.indexOf(bs);
                if(idx > -1) {
                    bsList.splice(idx, 1);
                    Store.save();
                    onRefresh();
                }
            });
        }
    });

    card.setAttribute('data-id', bs.id);
    return card;
}

/**
 * Crée le DOM pour une carte de bien support (Format à rabat 3 colonnes)
 */
function createBsDom(bs, bsList, onRefresh) {
    const typesActifs = Store.data.referentiels?.typesActifs || [];
    const activeTypes = typesActifs.filter(t => t.famille !== 'hebergement');
    const typeOpts = activeTypes.map(t => ({ value: t.id, label: t.label }));
    
    // Liste des hébergements dispos
    const hbs = bsList.filter(item => {
        const t = typesActifs.find(x => x.id === item.typeId);
        return t && t.famille === 'hebergement';
    });
    const hbOpts = hbs.map(h => ({ value: h.id, label: h.nom || h.id }));

    const processes = Store.data.atelier1?.processus || [];
    const protocoles = Store.data.referentiels?.protocoles || [];
    const authentifications = Store.data.referentiels?.authentifications || [];

    // --- EN-TETE (Bandeau du haut) ---
    const headerElements = [
        tap(UI.inputGroup("Nom", null, null, { bind: { obj: bs, key: 'nom' } }), el => {
            el.style.width = '200px';
            el.style.margin = '0';
        }),
        tap(UI.selectGroup("Type", null, [{ value: '', label: '-- Type --' }, ...typeOpts], null, { 
            bind: { obj: bs, key: 'typeId' } 
        }), el => {
            el.style.width = '160px';
            el.style.margin = '0';
            const select = el.querySelector('select');
            const oldChange = select.onchange;
            select.onchange = (e) => {
                const val = e.target.value;
                if (oldChange) oldChange(e);

                const typeDef = typesActifs.find(t => t.id === val);
                if (typeDef && typeDef.famille === 'hebergement') {
                    onRefresh();
                    return;
                }

                bs.exigences = (typeDef?.exigences || []).map(ex => {
                    const existing = (bs.exigences || []).find(e => e.label === ex);
                    return { label: ex, info: existing?.info || '' };
                });
                Store.save();
                renderExigences();
            };
        }),
        tap(UI.selectGroup("Hébergement", null, [{ value: '', label: '-- Hébergement --' }, ...hbOpts], null, { 
            bind: { obj: bs, key: 'hebergementId' } 
        }), el => {
            el.style.width = '180px';
            el.style.margin = '0';
        }),
        tap(UI.inputGroup("Description", null, null, { multiline: true, bind: { obj: bs, key: 'description' } }), el => {
            el.style.flex = '1';
            el.style.margin = '0';
            const textarea = el.querySelector('textarea');
            textarea.style.minHeight = '36px'; 
            textarea.style.marginBottom = '0';
        })
    ];

    // --- CONTENU (3 Colonnes) ---
    const content = document.createDocumentFragment();
    
    // Colonne 1 : Dépendances & Relations
    const col1 = tap(document.createElement('div'), el => el.className = 'column');
    
    const procGroup = tap(document.createElement('div'), el => {
        el.innerHTML = '<label>Valeurs métiers supportées</label>';
        const list = tap(document.createElement('div'), l => {
            l.style.display = 'flex';
            l.style.gap = '10px';
            l.style.flexWrap = 'wrap';
        });
        processes.forEach(proc => {
            const wrap = tap(document.createElement('label'), w => {
                w.style.cssText = 'display:flex; align-items:center; gap:5px; font-weight:normal; font-size:12px; cursor:pointer;';
                const cb = tap(document.createElement('input'), c => {
                    c.type = 'checkbox';
                    c.style.width = 'auto';
                    c.style.margin = '0';
                    c.checked = (bs.processusIds || []).includes(proc.id);
                    c.onchange = () => {
                        if (!bs.processusIds) bs.processusIds = [];
                        if (c.checked) bs.processusIds.push(proc.id);
                        else bs.processusIds = bs.processusIds.filter(id => id !== proc.id);
                        Store.save();
                    };
                });
                w.appendChild(cb);
                w.appendChild(document.createTextNode(proc.nom));
            });
            list.appendChild(wrap);
        });
        if (processes.length === 0) list.innerHTML = '<span style="font-size:11px; opacity:0.5;">Aucune valeur métier définie</span>';
        el.appendChild(list);
    });
    col1.appendChild(procGroup);

    const relGroup = tap(document.createElement('div'), el => {
        el.innerHTML = '<label>Relations avec les autres actifs</label>';
        const wrapper = tap(document.createElement('div'), w => w.className = 'inner-table-wrapper');
        const table = tap(document.createElement('table'), t => t.className = 'inner-table');
        table.innerHTML = `<thead><tr><th>Actif</th><th>Protocole</th><th>Auth.</th><th></th></tr></thead>`;
        const tbody = document.createElement('tbody');
        
        function renderRelRows() {
            tbody.innerHTML = '';
            (bs.relations || []).forEach((rel, idx) => {
                const tr = document.createElement('tr');
                const tdActif = document.createElement('td');
                const otherAssets = bsList.filter(x => x.id !== bs.id);
                const sActif = tap(document.createElement('select'), s => {
                    s.style.margin = '0';
                    s.style.fontSize = '11px';
                    s.innerHTML = '<option value="">-- Sélect. --</option>';
                    otherAssets.forEach(a => s.innerHTML += `<option value="${a.id}" ${rel.actifId === a.id ? 'selected' : ''}>${a.nom || a.id}</option>`);
                    s.onchange = () => { rel.actifId = s.value; Store.save(); };
                });
                tdActif.appendChild(sActif);
                tr.appendChild(tdActif);

                const tdProt = document.createElement('td');
                const sProt = tap(document.createElement('select'), s => {
                    s.style.margin = '0';
                    s.style.fontSize = '11px';
                    s.innerHTML = '<option value="">-- Prot. --</option>';
                    protocoles.forEach(p => s.innerHTML += `<option value="${p}" ${rel.protocole === p ? 'selected' : ''}>${p}</option>`);
                    s.onchange = () => { rel.protocole = s.value; Store.save(); };
                });
                tdProt.appendChild(sProt);
                tr.appendChild(tdProt);

                const tdAuth = document.createElement('td');
                const sAuth = tap(document.createElement('select'), s => {
                    s.style.margin = '0';
                    s.style.fontSize = '11px';
                    s.innerHTML = '<option value="">-- Auth. --</option>';
                    authentifications.forEach(a => s.innerHTML += `<option value="${a}" ${rel.auth === a ? 'selected' : ''}>${a}</option>`);
                    s.onchange = () => { rel.auth = s.value; Store.save(); };
                });
                tdAuth.appendChild(sAuth);
                tr.appendChild(tdAuth);

                const tdDel = document.createElement('td');
                tdDel.appendChild(tap(UI.button('×', () => {
                    bs.relations.splice(idx, 1);
                    Store.save();
                    renderRelRows();
                }, 'secondary'), b => {
                    b.style.padding = '2px 6px';
                    b.style.fontSize = '10px';
                }));
                tr.appendChild(tdDel);
                tbody.appendChild(tr);
            });
        }
        
        const btnAddRel = tap(UI.button('+ Ajouter une relation', () => {
            if (!bs.relations) bs.relations = [];
            bs.relations.push({ actifId: '', protocole: '', auth: '' });
            Store.save();
            renderRelRows();
        }, 'secondary'), b => {
            b.style.width = '100%';
            b.style.borderTop = 'none';
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        wrapper.appendChild(btnAddRel);
        el.appendChild(wrapper);
        renderRelRows();
    });
    col1.appendChild(relGroup);

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
        if (!bs.typeId) {
            wrapper.innerHTML = '<p style="padding:10px; font-size:12px; opacity:0.6; text-align:center;">Sélectionnez un type d\'actif</p>';
            return;
        }
        const table = tap(document.createElement('table'), t => t.className = 'inner-table');
        table.innerHTML = `<thead><tr><th>Exigence</th><th>Information</th></tr></thead>`;
        const tbody = document.createElement('tbody');
        (bs.exigences || []).forEach(ex => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${ex.label}</td>`;
            const tdInfo = tap(document.createElement('td'), td => {
                td.appendChild(tap(document.createElement('input'), i => {
                    i.type = 'text';
                    i.value = ex.info || '';
                    i.style.margin = '0';
                    i.style.padding = '4px';
                    i.style.fontSize = '11px';
                    i.oninput = () => { ex.info = i.value; Store.save(); };
                }));
            });
            tr.appendChild(tdInfo);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrapper.appendChild(table);
    }
    renderExigences();

    // Colonne 3 : Constat
    const col3 = tap(document.createElement('div'), el => el.className = 'column');
    col3.appendChild(UI.inputGroup("Constat / Observation", null, null, { multiline: true, bind: { obj: bs, key: 'constat' } }));

    content.appendChild(col1);
    content.appendChild(col2);
    content.appendChild(col3);

    // --- CARTE A RABAT ---
    const card = UI.foldingCard(null, {
        headerElements: headerElements,
        content: content,
        columns: 3,
        onDelete: () => {
            confirmAction(`Supprimer le bien support ${bs.id} ?`, () => {
                const idx = bsList.indexOf(bs);
                if(idx > -1) {
                    bsList.splice(idx, 1);
                    Store.save();
                    card.remove();
                }
            });
        }
    });
    card.setAttribute('data-id', bs.id);
    card.querySelector('h3')?.remove();

    return card;
}

export function init() {
    const hbContainer = document.getElementById('hb-container');
    const bsContainer = document.getElementById('bs-container');
    const btnAddHb = document.getElementById('btn-add-hb');
    const btnAddBs = document.getElementById('btn-add-bs');
    
    if(!hbContainer || !bsContainer || !btnAddHb || !btnAddBs) return;

    if (!Store.data.atelier1.inventaire) Store.data.atelier1.inventaire = [];
    const list = Store.data.atelier1.inventaire;
    const typesActifs = Store.data.referentiels?.typesActifs || [];

    function renderAll() {
        hbContainer.innerHTML = '';
        bsContainer.innerHTML = '';
        
        list.forEach(item => {
            const typeDef = typesActifs.find(t => t.id === item.typeId);
            if (typeDef && typeDef.famille === 'hebergement') {
                hbContainer.appendChild(createHbDom(item, list, renderAll));
            } else {
                bsContainer.appendChild(createBsDom(item, list, renderAll));
            }
        });
    }

    renderAll();

    btnAddHb.onclick = () => {
        const hbTypes = typesActifs.filter(t => t.famille === 'hebergement');
        const defaultType = hbTypes[0] || { id: '', exigences: [] };
        
        const newHB = { 
            id: generateNextId(list, 'BS'), 
            nom: '', 
            typeId: defaultType.id, 
            description: '',
            processusIds: [],
            relations: [],
            exigences: (defaultType.exigences || []).map(ex => ({ label: ex, info: '' })),
            constat: ''
        };
        list.push(newHB);
        Store.save();
        renderAll();
    };

    btnAddBs.onclick = () => {
        const newBS = { 
            id: generateNextId(list, 'BS'), 
            nom: '', 
            typeId: '', 
            description: '',
            processusIds: [],
            relations: [],
            exigences: [],
            constat: '',
            hebergementId: ''
        };
        list.push(newBS);
        Store.save();
        renderAll();
    };
}
