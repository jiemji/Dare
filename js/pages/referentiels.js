import { Store } from '../data.js';
import { UI } from '../components.js';
import { confirmAction, tap } from '../utils.js';

// --- REFERENTIEL : IMPACTS ET GRAVITES ---
function initImpactsGravitesPage() {
    const tbodyG = document.getElementById('ref-gravite-tbody');
    const btnAddG = document.getElementById('btn-add-gravite');
    const tableI = document.getElementById('table-impacts');
    const btnAddI = document.getElementById('btn-add-impact');
    if(!tbodyG || !tableI) return;

    const renderGravites = () => {
        tbodyG.innerHTML = '';
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        
        gravites.forEach(g => {
            const tr = document.createElement('tr');
            tr.className = 'gravite-row';
            tr.setAttribute('data-val', g.valeur);
            
            tr.innerHTML = `<td class="g-valeur">${g.valeur}</td>`;
            
            const tdNiv = document.createElement('td');
            tdNiv.appendChild(UI.inputGroup('', null, null, { bind: { obj: g, key: 'niveau' } }));
            tr.appendChild(tdNiv);
            
            const tdCol = document.createElement('td');
            tdCol.appendChild(UI.inputGroup('', null, null, { type: 'color', bind: { obj: g, key: 'color' } }));
            tr.appendChild(tdCol);
            
            const tdDel = document.createElement('td');
            tdDel.appendChild(UI.button('✕', () => {
                confirmAction(`Supprimer le niveau de gravité ${g.valeur} ?`, () => {
                    Store.data.referentiels.gravite = Store.data.referentiels.gravite.filter(x => x.valeur !== g.valeur);
                    Store.save();
                    renderGravites();
                    renderImpactsTable();
                });
            }));
            tr.appendChild(tdDel);
            
            // Re-render impacts table on color change
            tr.querySelector('input[type="color"]').addEventListener('change', renderImpactsTable);
            
            tbodyG.appendChild(tr);
        });
    };

    btnAddG.onclick = () => {
        const list = Store.data.referentiels.gravite;
        const maxVal = Math.max(0, ...list.map(g => g.valeur));
        list.push({ valeur: maxVal + 1, niveau: "Nouveau niveau", color: "#cccccc" });
        Store.save();
        renderGravites();
        renderImpactsTable();
    };

    const renderImpactsTable = () => {
        tableI.innerHTML = '';
        const typesImpacts = Store.data.referentiels.impacts || [];
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        
        const thead = document.createElement('tr');
        thead.style.cssText = 'background:var(--c-bg-panel); border-bottom:2px solid var(--c-border); text-align:left;';
        
        const thG = document.createElement('th');
        thG.style.cssText = 'padding:10px; width:150px;';
        thG.textContent = 'Niveau (Gravité)';
        thead.appendChild(thG);
        
        typesImpacts.forEach(t => {
            const th = document.createElement('th');
            th.style.cssText = 'padding:10px; position:relative;';
            th.textContent = t;
            
            th.appendChild(UI.button('✕', () => {
                confirmAction(`Supprimer la colonne "${t}" et toutes ses descriptions ?`, () => {
                    Store.data.referentiels.impacts = Store.data.referentiels.impacts.filter(i => i !== t);
                    Store.data.referentiels.grilleImpacts = Store.data.referentiels.grilleImpacts.filter(c => c.typeImpact !== t);
                    Store.save();
                    renderImpactsTable();
                });
            }), (btn) => {
                btn.style.cssText = 'position:absolute; right:5px; top:5px; padding:2px 5px; font-size:10px;';
            });
            thead.appendChild(th);
        });
        tableI.appendChild(thead);
        
        gravites.forEach(g => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--c-border)';
            
            const tdG = document.createElement('td');
            tdG.style.cssText = `padding:8px; font-weight:bold; background-color:${g.color}33; border-left:5px solid ${g.color};`;
            tdG.textContent = `${g.niveau} (${g.valeur})`;
            tr.appendChild(tdG);
            
            typesImpacts.forEach(t => {
                const td = document.createElement('td');
                td.style.padding = '5px';
                
                const cell = Store.data.referentiels.grilleImpacts.find(c => c.gravite === g.valeur && c.typeImpact === t) 
                            || (Store.data.referentiels.grilleImpacts.push({ gravite: g.valeur, typeImpact: t, description: "" }), Store.data.referentiels.grilleImpacts[Store.data.referentiels.grilleImpacts.length-1]);
                
                td.appendChild(tap(UI.inputGroup('', null, null, { multiline: true, bind: { obj: cell, key: 'description' } }), group => {
                    const ta = group.querySelector('textarea');
                    ta.rows = 2;
                    ta.style.cssText = 'margin:0; width:100%; border:1px dashed var(--c-border); font-size:12px;';
                }));
                tr.appendChild(td);
            });
            tableI.appendChild(tr);
        });
    };

    btnAddI.onclick = () => {
        const val = prompt("Nom du nouveau type d'impact (ex: Environnemental):");
        if(val?.trim()) {
            (Store.data.referentiels.impacts = Store.data.referentiels.impacts || []).push(val.trim());
            Store.save();
            renderImpactsTable();
        }
    };

    renderGravites();
    renderImpactsTable();
}

function initGenericRefPage(storeKey, tbodyId, btnAddId) {
    const tbody = document.getElementById(tbodyId);
    const btnAdd = document.getElementById(btnAddId);
    if(!tbody || !btnAdd) return;

    const renderData = () => {
        tbody.innerHTML = '';
        [...Store.data.referentiels[storeKey]].sort((a,b) => b.valeur - a.valeur).forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid var(--c-border)";
            
            tr.innerHTML = `<td style="padding:8px; font-weight:bold; text-align:center;">${item.valeur}</td>`;
            
            const tdNiv = document.createElement('td');
            tdNiv.appendChild(UI.inputGroup('', null, null, { bind: { obj: item, key: 'niveau' } }));
            tr.appendChild(tdNiv);
            
            const tdCol = document.createElement('td');
            tdCol.appendChild(UI.inputGroup('', null, null, { type: 'color', bind: { obj: item, key: 'color' } }));
            tr.appendChild(tdCol);
            
            const tdDesc = document.createElement('td');
            tdDesc.appendChild(UI.inputGroup('', null, null, { bind: { obj: item, key: 'description' } }));
            tr.appendChild(tdDesc);
            
            const tdDel = document.createElement('td');
            tdDel.style.textAlign = 'center';
            tdDel.appendChild(UI.button('✕', () => {
                confirmAction(`Supprimer l'élément (Valeur ${item.valeur}) ?`, () => {
                    Store.data.referentiels[storeKey] = Store.data.referentiels[storeKey].filter(x => x.valeur !== item.valeur);
                    Store.save();
                    renderData();
                });
            }));
            tr.appendChild(tdDel);
            tbody.appendChild(tr);
        });
    };

    btnAdd.onclick = () => {
        const list = Store.data.referentiels[storeKey];
        const maxVal = Math.max(0, ...list.map(g => g.valeur));
        list.push({ valeur: maxVal + 1, niveau: "Nouveau", color: "#cccccc", description: "" });
        Store.save();
        renderData();
    };
    renderData();
}

function initKillChainPage() {
    const tbody = document.getElementById('ref-killchain-tbody');
    const btnAdd = document.getElementById('btn-add-killchain');
    if(!tbody || !btnAdd) return;

    const renderData = () => {
        tbody.innerHTML = '';
        [...Store.data.referentiels.killChain].sort((a,b) => a.valeur - b.valeur).forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid var(--c-border)";
            tr.innerHTML = `<td style="padding:8px; font-weight:bold; text-align:center;">${item.valeur}</td>`;
            
            const tdPhase = document.createElement('td');
            tdPhase.appendChild(UI.inputGroup('', null, null, { bind: { obj: item, key: 'phase' } }));
            tr.appendChild(tdPhase);
            
            const tdDel = document.createElement('td');
            tdDel.appendChild(UI.button('✕', () => {
                confirmAction(`Supprimer la phase ${item.valeur} ?`, () => {
                    Store.data.referentiels.killChain = Store.data.referentiels.killChain.filter(x => x.valeur !== item.valeur);
                    Store.save();
                    renderData();
                });
            }));
            tr.appendChild(tdDel);
            tbody.appendChild(tr);
        });
    };

    btnAdd.onclick = () => {
        const list = Store.data.referentiels.killChain;
        const maxVal = Math.max(0, ...list.map(g => g.valeur));
        list.push({ valeur: maxVal + 1, phase: "Nouvelle phase" });
        Store.save();
        renderData();
    };
    renderData();
}

function initRefMatricePage() {
    const tbodyRisques = document.getElementById('ref-risques-tbody');
    const btnAddRisque = document.getElementById('btn-add-risque');
    const container = document.getElementById('ref-matrice-container');
    const tplRisque = document.getElementById('tpl-risque-row');
    if (!tbodyRisques || !container) return;

    const renderEchelleRisques = () => {
        tbodyRisques.innerHTML = '';
        [...Store.data.referentiels.risques].sort((a,b) => a.valeur - b.valeur).forEach(item => {
            const clone = tplRisque.content.cloneNode(true);
            const tr = clone.querySelector('.risque-row');
            clone.querySelector('.ri-valeur').textContent = item.valeur;
            
            const inpNiv = clone.querySelector('.ri-niveau');
            const inpCol = clone.querySelector('.ri-color');
            
            inpNiv.value = item.niveau;
            inpCol.value = item.color;
            
            inpNiv.oninput = () => { item.niveau = inpNiv.value; Store.save(); renderMatriceRisques(); };
            inpCol.onchange = () => { item.color = inpCol.value; Store.save(); renderMatriceRisques(); };
            
            clone.querySelector('.btn-del-risque').onclick = () => {
                confirmAction(`Supprimer le niveau de risque ${item.valeur} ?`, () => {
                    Store.data.referentiels.risques = Store.data.referentiels.risques.filter(x => x.valeur !== item.valeur);
                    Store.save();
                    renderEchelleRisques();
                    renderMatriceRisques();
                });
            };
            tbodyRisques.appendChild(clone);
        });
    };

    btnAddRisque.onclick = () => {
        const list = Store.data.referentiels.risques;
        const maxVal = Math.max(0, ...list.map(g => g.valeur));
        list.push({ valeur: maxVal + 1, niveau: "Nouveau", color: "#cccccc" });
        Store.save();
        renderEchelleRisques();
        renderMatriceRisques();
    };

    const renderMatriceRisques = () => {
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        const vraisemb = [...Store.data.referentiels.vraisemblance].sort((a,b) => a.valeur - b.valeur);
        const echelleRisques = Store.data.referentiels.risques;

        let optionsHTML = `<option value="">--</option>`;
        echelleRisques.forEach(r => optionsHTML += `<option value="${r.valeur}">${r.niveau}</option>`);

        let html = '<table class="data-table" style="border-collapse: collapse; width: 100%;"><tr><td></td>';
        vraisemb.forEach(v => html += `<th style="text-align:center; padding: 10px; background:${v.color}33; border: 1px solid var(--c-border); border-bottom: 4px solid ${v.color};">${v.niveau} (V=${v.valeur})</th>`);
        html += '</tr>';

        gravites.forEach(g => {
            html += `<tr><th style="text-align:right; padding: 10px; background:${g.color}33; border: 1px solid var(--c-border); border-right: 4px solid ${g.color}; width: 220px;">${g.niveau} (G=${g.valeur})</th>`;
            vraisemb.forEach(v => {
                const cell = Store.data.referentiels.grilleRisques.find(c => c.g === g.valeur && c.v === v.valeur);
                const val = cell ? cell.r : "";
                const bg = echelleRisques.find(er => er.valeur == val)?.color || "var(--c-bg-panel)";
                html += `<td style="border: 1px solid var(--c-border); text-align:center; padding: 5px; background-color: ${bg}; transition: background-color 0.3s; min-width:120px;">
                            <select class="matrice-select" data-g="${g.valeur}" data-v="${v.valeur}" style="width: 100%; background: rgba(0,0,0,0.05); border: 1px solid var(--c-border); font-weight: bold; padding: 4px; border-radius: 4px;">
                                ${optionsHTML.replace(`value="${val}"`, `value="${val}" selected`)}
                            </select></td>`;
            });
            html += '</tr>';
        });
        container.innerHTML = html + '</table>';

        container.querySelectorAll('.matrice-select').forEach(sel => {
            sel.onchange = (e) => {
                const gVal = parseInt(sel.dataset.g, 10), vVal = parseInt(sel.dataset.v, 10), rVal = parseInt(sel.value, 10);
                sel.parentElement.style.backgroundColor = echelleRisques.find(er => er.valeur == rVal)?.color || "var(--c-bg-panel)";
                const idx = Store.data.referentiels.grilleRisques.findIndex(c => c.g === gVal && c.v === vVal);
                if (idx >= 0) isNaN(rVal) ? Store.data.referentiels.grilleRisques.splice(idx, 1) : Store.data.referentiels.grilleRisques[idx].r = rVal;
                else if (!isNaN(rVal)) Store.data.referentiels.grilleRisques.push({ g: gVal, v: vVal, r: rVal });
                Store.save();
            };
        });
    };
    renderEchelleRisques();
    renderMatriceRisques();
}

function initSoclePage() {
    const tbody = document.getElementById('ref-socle-tbody'), btnAdd = document.getElementById('btn-add-socle'), modal = document.getElementById('modal-add-socle');
    if (!tbody || !btnAdd) return;

    const renderSocles = () => {
        tbody.innerHTML = '';
        const active = Store.data.referentiels.socles || [], map = new Map();
        (Store.defaultSocles || []).forEach(ds => map.set(ds.nom, { ...ds, active: false }));
        active.forEach(s => map.set(s.nom, { ...s, active: true }));

        Array.from(map.values()).forEach(s => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid var(--c-border)";
            tr.innerHTML = `<td style="text-align:center; padding:10px;"><input type="checkbox" class="socle-active" ${s.active ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;"></td>
                <td style="padding:10px; font-weight:bold;">${s.nom}</td>
                <td style="padding:10px; font-size:0.9em; opacity:0.8;">${s.description}</td>
                <td style="text-align:center; padding:10px;">${s.deletable ? '<button class="btn secondary btn-del-socle" style="padding:4px; min-width:auto;">✕</button>' : ''}</td>`;

            tr.querySelector('.socle-active').onchange = (e) => {
                if (e.target.checked) !Store.data.referentiels.socles.find(x => x.nom === s.nom) && Store.data.referentiels.socles.push({ ...s, active: true });
                else Store.data.referentiels.socles = Store.data.referentiels.socles.filter(x => x.nom !== s.nom);
                Store.save(); renderSocles();
            };
            const del = tr.querySelector('.btn-del-socle');
            if(del) del.onclick = () => confirmAction(`Supprimer le socle "${s.nom}" ?`, () => { Store.data.referentiels.socles = Store.data.referentiels.socles.filter(x => x.nom !== s.nom); Store.save(); renderSocles(); });
            tbody.appendChild(tr);
        });
    };

    btnAdd.onclick = () => modal.classList.remove('hidden');
    document.getElementById('btn-cancel-socle').onclick = () => modal.classList.add('hidden');
    document.getElementById('btn-confirm-socle').onclick = () => {
        const nom = document.getElementById('new-socle-nom').value, desc = document.getElementById('new-socle-desc').value, fileEl = document.getElementById('new-socle-file');
        if (!nom) return alert("Nom requis.");
        const socle = { nom, description: desc, active: true, deletable: true, exigences: [] };
        const save = () => { Store.data.referentiels.socles.push(socle); Store.save(); renderSocles(); modal.classList.add('hidden'); };
        if (fileEl.files[0]) {
            const r = new FileReader();
            r.onload = (e) => { e.target.result.split('\n').forEach(l => { const p = l.split(';'); p.length >= 2 && socle.exigences.push({ ref: p[0].trim(), description: p[1].trim(), libellé: (p[2] || p[1]).trim() }); }); save(); };
            r.readAsText(fileEl.files[0]);
        } else save();
    };
    renderSocles();
}

export function init() {
    const ids = { 'ref-socle-tbody': initSoclePage, 'ref-gravite-tbody': initImpactsGravitesPage, 'ref-vraisemblance-tbody': () => initGenericRefPage('vraisemblance', 'ref-vraisemblance-tbody', 'btn-add-vraisemblance'), 'ref-killchain-tbody': initKillChainPage, 'ref-motivation-tbody': () => { initGenericRefPage('motivation', 'ref-motivation-tbody', 'btn-add-motivation'); initGenericRefPage('ressources', 'ref-ressources-tbody', 'btn-add-ressources'); }, 'ref-matrice-container': initRefMatricePage };
    Object.entries(ids).forEach(([id, fn]) => document.getElementById(id) && fn());
}
