import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

// --- REFERENTIEL : IMPACTS ET GRAVITES ---
function initImpactsGravitesPage() {
    const tbodyG = document.getElementById('ref-gravite-tbody');
    const btnAddG = document.getElementById('btn-add-gravite');
    const tableI = document.getElementById('table-impacts');
    const btnAddI = document.getElementById('btn-add-impact');
    
    if(!tbodyG || !tableI) return;

    // -- Gestion Echelle des Gravités --
    const renderGravites = () => {
        tbodyG.innerHTML = '';
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        
        gravites.forEach(g => {
            const tr = document.createElement('tr');
            tr.className = 'gravite-row';
            tr.setAttribute('data-val', g.valeur);
            
            const tdVal = document.createElement('td');
            tdVal.className = 'g-valeur';
            tdVal.textContent = g.valeur;
            tr.appendChild(tdVal);
            
            const tdNiv = document.createElement('td');
            const inpNiv = document.createElement('input');
            inpNiv.type = 'text';
            inpNiv.className = 'g-niveau';
            inpNiv.value = g.niveau;
            tdNiv.appendChild(inpNiv);
            tr.appendChild(tdNiv);
            
            const tdCol = document.createElement('td');
            const inpCol = document.createElement('input');
            inpCol.type = 'color';
            inpCol.className = 'g-color';
            inpCol.value = g.color;
            tdCol.appendChild(inpCol);
            tr.appendChild(tdCol);
            
            const tdDel = document.createElement('td');
            const btnDel = UI.button('✕', () => {
                if(confirm(`Supprimer le niveau de gravité ${g.valeur} ?`)) {
                    Store.data.referentiels.gravite = Store.data.referentiels.gravite.filter(x => x.valeur !== g.valeur);
                    Store.save();
                    renderGravites();
                    renderImpactsTable();
                }
            });
            tdDel.appendChild(btnDel);
            tr.appendChild(tdDel);
            
            const saveG = () => {
                g.niveau = inpNiv.value;
                g.color = inpCol.value;
                Store.save();
                renderImpactsTable();
            };
            
            inpNiv.oninput = saveG;
            inpCol.onchange = saveG;
            
            tbodyG.appendChild(tr);
        });
    };

    btnAddG.onclick = () => {
        const gravites = Store.data.referentiels.gravite;
        let maxVal = 0;
        gravites.forEach(g => { if(g.valeur > maxVal) maxVal = g.valeur; });
        
        gravites.push({
            valeur: maxVal + 1,
            niveau: "Nouveau niveau",
            color: "#cccccc"
        });
        Store.save();
        renderGravites();
        renderImpactsTable();
    };

    // -- Gestion Tableau des impacts --
    if(!Store.data.referentiels.grilleImpacts) {
        Store.data.referentiels.grilleImpacts = [];
    }

    const renderImpactsTable = () => {
        tableI.innerHTML = '';
        const typesImpacts = Store.data.referentiels.impacts || [];
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        
        // Header
        const thead = document.createElement('tr');
        thead.style.background = 'var(--c-bg-panel)';
        thead.style.borderBottom = '2px solid var(--c-border)';
        thead.style.textAlign = 'left';
        
        const thG = document.createElement('th');
        thG.style.padding = '10px';
        thG.style.width = '150px';
        thG.textContent = 'Niveau (Gravité)';
        thead.appendChild(thG);
        
        typesImpacts.forEach(t => {
            const th = document.createElement('th');
            th.style.padding = '10px';
            th.style.position = 'relative';
            th.textContent = t;
            
            const btnDel = UI.button('✕', () => {
                if(confirm(`Supprimer la colonne "${t}" et toutes ses descriptions ?`)) {
                    Store.data.referentiels.impacts = Store.data.referentiels.impacts.filter(i => i !== t);
                    Store.data.referentiels.grilleImpacts = Store.data.referentiels.grilleImpacts.filter(c => c.typeImpact !== t);
                    Store.save();
                    renderImpactsTable();
                }
            });
            btnDel.style.position = 'absolute';
            btnDel.style.right = '5px';
            btnDel.style.top = '5px';
            btnDel.style.padding = '2px 5px';
            btnDel.style.fontSize = '10px';
            th.appendChild(btnDel);
            thead.appendChild(th);
        });
        tableI.appendChild(thead);
        
        // Rows
        gravites.forEach(g => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--c-border)';
            
            const tdG = document.createElement('td');
            tdG.style.padding = '8px';
            tdG.style.fontWeight = 'bold';
            tdG.style.backgroundColor = `${g.color}33`;
            tdG.style.borderLeft = `5px solid ${g.color}`;
            tdG.textContent = `${g.niveau} (${g.valeur})`;
            tr.appendChild(tdG);
            
            typesImpacts.forEach(t => {
                const td = document.createElement('td');
                td.style.padding = '5px';
                
                const cell = Store.data.referentiels.grilleImpacts.find(c => c.gravite === g.valeur && c.typeImpact === t);
                const ta = document.createElement('textarea');
                ta.rows = 2;
                ta.style.margin = '0';
                ta.style.width = '100%';
                ta.style.border = '1px dashed var(--c-border)';
                ta.style.fontSize = '12px';
                ta.value = cell ? cell.description : "";
                
                ta.onchange = () => {
                    let cellIndex = Store.data.referentiels.grilleImpacts.findIndex(c => c.gravite === g.valeur && c.typeImpact === t);
                    if(cellIndex >= 0) {
                        Store.data.referentiels.grilleImpacts[cellIndex].description = ta.value;
                    } else {
                        Store.data.referentiels.grilleImpacts.push({
                            gravite: g.valeur,
                            typeImpact: t,
                            description: ta.value
                        });
                    }
                    Store.save();
                };
                
                td.appendChild(ta);
                tr.appendChild(td);
            });
            tableI.appendChild(tr);
        });
    };

    btnAddI.onclick = () => {
        const val = prompt("Nom du nouveau type d'impact (ex: Environnemental):");
        if(val && val.trim() !== '') {
            if(!Store.data.referentiels.impacts) Store.data.referentiels.impacts = [];
            Store.data.referentiels.impacts.push(val.trim());
            Store.save();
            renderImpactsTable();
        }
    };

    renderGravites();
    renderImpactsTable();
}

// --- GENERIC REF LIST BUILDER ---
function initGenericRefPage(storeKey, tbodyId, btnAddId) {
    const tbody = document.getElementById(tbodyId);
    const btnAdd = document.getElementById(btnAddId);
    
    if(!tbody || !btnAdd) return;

    const renderData = () => {
        tbody.innerHTML = '';
        const list = [...Store.data.referentiels[storeKey]].sort((a,b) => b.valeur - a.valeur);
        
        list.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid var(--c-border)";
            
            const tdVal = document.createElement('td');
            tdVal.style.padding = '8px';
            tdVal.style.fontWeight = 'bold';
            tdVal.style.textAlign = 'center';
            tdVal.textContent = item.valeur;
            tr.appendChild(tdVal);
            
            const tdNiv = document.createElement('td');
            const inpNiv = document.createElement('input');
            inpNiv.type = 'text';
            inpNiv.className = 'r-niveau';
            inpNiv.value = item.niveau || "";
            inpNiv.style.margin = '0';
            inpNiv.style.width = '100%';
            tdNiv.appendChild(inpNiv);
            tr.appendChild(tdNiv);
            
            const tdCol = document.createElement('td');
            const inpCol = document.createElement('input');
            inpCol.type = 'color';
            inpCol.className = 'r-color';
            inpCol.value = item.color || "#cccccc";
            inpCol.style.margin = '0';
            inpCol.style.width = '100%';
            inpCol.style.height = '30px';
            inpCol.style.cursor = 'pointer';
            inpCol.style.border = 'none';
            tdCol.appendChild(inpCol);
            tr.appendChild(tdCol);
            
            const tdDesc = document.createElement('td');
            const inpDesc = document.createElement('input');
            inpDesc.type = 'text';
            inpDesc.className = 'r-desc';
            inpDesc.value = item.description || "";
            inpDesc.style.margin = '0';
            inpDesc.style.width = '100%';
            tdDesc.appendChild(inpDesc);
            tr.appendChild(tdDesc);
            
            const tdDel = document.createElement('td');
            tdDel.style.textAlign = 'center';
            const btnDel = UI.button('✕', () => {
                if(confirm(`Supprimer l'élément (Valeur ${item.valeur}) ?`)) {
                    Store.data.referentiels[storeKey] = Store.data.referentiels[storeKey].filter(x => x.valeur !== item.valeur);
                    Store.save();
                    renderData();
                }
            });
            btnDel.style.padding = '4px';
            btnDel.style.minWidth = 'auto';
            tdDel.appendChild(btnDel);
            tr.appendChild(tdDel);
            
            const saveItem = () => {
                item.niveau = inpNiv.value;
                item.color = inpCol.value;
                item.description = inpDesc.value;
                Store.save();
            };
            
            inpNiv.oninput = saveItem;
            inpCol.onchange = saveItem;
            inpDesc.oninput = saveItem;
            
            tbody.appendChild(tr);
        });
    };

    btnAdd.addEventListener('click', () => {
        const list = Store.data.referentiels[storeKey];
        let maxVal = 0;
        list.forEach(g => { if(g.valeur > maxVal) maxVal = g.valeur; });
        
        list.push({
            valeur: maxVal + 1,
            niveau: "Nouveau",
            color: "#cccccc",
            description: ""
        });
        Store.save();
        renderData();
    });

    renderData();
}

// --- REFERENTIEL : KILL-CHAIN ---
function initKillChainPage() {
    const tbody = document.getElementById('ref-killchain-tbody');
    const btnAdd = document.getElementById('btn-add-killchain');
    
    if(!tbody || !btnAdd) return;

    const renderData = () => {
        tbody.innerHTML = '';
        const list = [...Store.data.referentiels.killChain].sort((a,b) => a.valeur - b.valeur);
        
        list.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid var(--c-border)";
            
            const tdVal = document.createElement('td');
            tdVal.style.padding = '8px';
            tdVal.style.fontWeight = 'bold';
            tdVal.style.textAlign = 'center';
            tdVal.textContent = item.valeur;
            tr.appendChild(tdVal);
            
            const tdPhase = document.createElement('td');
            const inpPhase = document.createElement('input');
            inpPhase.type = 'text';
            inpPhase.value = item.phase || "";
            inpPhase.style.margin = '0';
            inpPhase.style.width = '100%';
            inpPhase.oninput = () => {
                item.phase = inpPhase.value;
                Store.save();
            };
            tdPhase.appendChild(inpPhase);
            tr.appendChild(tdPhase);
            
            const tdDel = document.createElement('td');
            tdDel.style.textAlign = 'center';
            const btnDel = UI.button('✕', () => {
                if(confirm(`Supprimer la phase ${item.valeur} ?`)) {
                    Store.data.referentiels.killChain = Store.data.referentiels.killChain.filter(x => x.valeur !== item.valeur);
                    Store.save();
                    renderData();
                }
            });
            btnDel.style.padding = '4px';
            btnDel.style.minWidth = 'auto';
            tdDel.appendChild(btnDel);
            tr.appendChild(tdDel);
            
            tbody.appendChild(tr);
        });
    };

    btnAdd.onclick = () => {
        const list = Store.data.referentiels.killChain;
        let maxVal = 0;
        list.forEach(g => { if(g.valeur > maxVal) maxVal = g.valeur; });
        
        list.push({
            valeur: maxVal + 1,
            phase: "Nouvelle phase"
        });
        Store.save();
        renderData();
    };

    renderData();
}

function initVraisemblancePage() {
    initGenericRefPage('vraisemblance', 'ref-vraisemblance-tbody', 'btn-add-vraisemblance');
}

function initMotivResPage() {
    initGenericRefPage('motivation', 'ref-motivation-tbody', 'btn-add-motivation');
    initGenericRefPage('ressources', 'ref-ressources-tbody', 'btn-add-ressources');
}

// --- REFERENTIEL : MATRICE DES RISQUES ---
function initRefMatricePage() {
    const tbodyRisques = document.getElementById('ref-risques-tbody');
    const btnAddRisque = document.getElementById('btn-add-risque');
    const container = document.getElementById('ref-matrice-container');
    const tplRisque = document.getElementById('tpl-risque-row');
    if (!tbodyRisques || !container) return;

    if (!Store.data.referentiels.risques) {
        Store.data.referentiels.risques = [
            { valeur: 1, niveau: "Faible", color: "#66cc66" },
            { valeur: 2, niveau: "Moyen", color: "#ffcc00" },
            { valeur: 3, niveau: "Élevé", color: "#ff6600" },
            { valeur: 4, niveau: "Critique", color: "#ff0000" }
        ];
    }
    if (!Store.data.referentiels.grilleRisques) {
        Store.data.referentiels.grilleRisques = [];
    }

    const renderEchelleRisques = () => {
        tbodyRisques.innerHTML = '';
        const list = [...Store.data.referentiels.risques].sort((a,b) => a.valeur - b.valeur);
        list.forEach(item => {
            const clone = tplRisque.content.cloneNode(true);
            const tr = clone.querySelector('.risque-row');
            
            clone.querySelector('.ri-valeur').textContent = item.valeur;
            const inpNiv = clone.querySelector('.ri-niveau');
            const inpCol = clone.querySelector('.ri-color');
            const btnDel = clone.querySelector('.btn-del-risque');
            
            inpNiv.value = item.niveau;
            inpCol.value = item.color;
            
            const saveItem = () => {
                item.niveau = inpNiv.value;
                item.color = inpCol.value;
                Store.save();
                renderMatriceRisques();
            };
            
            inpNiv.addEventListener('input', saveItem);
            inpCol.addEventListener('change', saveItem);
            
            btnDel.addEventListener('click', () => {
                if(confirm(`Supprimer le niveau de risque ${item.valeur} ?`)) {
                    Store.data.referentiels.risques = Store.data.referentiels.risques.filter(x => x.valeur !== item.valeur);
                    Store.save();
                    renderEchelleRisques();
                    renderMatriceRisques();
                }
            });
            tbodyRisques.appendChild(clone);
        });
    };

    btnAddRisque.addEventListener('click', () => {
        const list = Store.data.referentiels.risques;
        let maxVal = 0;
        list.forEach(g => { if(g.valeur > maxVal) maxVal = g.valeur; });
        list.push({ valeur: maxVal + 1, niveau: "Nouveau", color: "#cccccc" });
        Store.save();
        renderEchelleRisques();
        renderMatriceRisques();
    });

    const renderMatriceRisques = () => {
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        const vraisemb = [...Store.data.referentiels.vraisemblance].sort((a,b) => a.valeur - b.valeur);
        const echelleRisques = Store.data.referentiels.risques;

        let optionsHTML = `<option value="">--</option>`;
        echelleRisques.forEach(r => {
            optionsHTML += `<option value="${r.valeur}">${r.niveau}</option>`;
        });

        let html = '<table class="data-table" style="border-collapse: collapse; width: 100%;">';
        html += '<tr><td></td>';
        vraisemb.forEach(v => {
            html += `<th style="text-align:center; padding: 10px; background:${v.color}33; border: 1px solid var(--c-border); border-bottom: 4px solid ${v.color};">${v.niveau} (V=${v.valeur})</th>`;
        });
        html += '</tr>';

        gravites.forEach(g => {
            html += '<tr>';
            html += `<th style="text-align:right; padding: 10px; background:${g.color}33; border: 1px solid var(--c-border); border-right: 4px solid ${g.color}; width: 220px;">${g.niveau} (G=${g.valeur})</th>`;
            
            vraisemb.forEach(v => {
                const savedCell = Store.data.referentiels.grilleRisques.find(c => c.g === g.valeur && c.v === v.valeur);
                const selectedVal = savedCell ? savedCell.r : "";
                
                let bgCol = "var(--c-bg-panel)";
                if (selectedVal) {
                    const matchR = echelleRisques.find(er => er.valeur == selectedVal);
                    if (matchR) bgCol = matchR.color;
                }

                html += `<td style="border: 1px solid var(--c-border); text-align:center; padding: 5px; background-color: ${bgCol}; transition: background-color 0.3s; min-width:120px;">
                            <select class="matrice-select" data-g="${g.valeur}" data-v="${v.valeur}" style="width: 100%; background: rgba(0,0,0,0.05); border: 1px solid var(--c-border); font-weight: bold; color: #000; padding: 4px; border-radius: 4px;">
                                ${optionsHTML.replace(`value="${selectedVal}"`, `value="${selectedVal}" selected`)}
                            </select>
                         </td>`;
            });
            html += '</tr>';
        });

        html += '</table>';
        container.innerHTML = html;

        container.querySelectorAll('.matrice-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const gVal = parseInt(e.target.getAttribute('data-g'), 10);
                const vVal = parseInt(e.target.getAttribute('data-v'), 10);
                const rVal = parseInt(e.target.value, 10);

                let bgCol = "var(--c-bg-panel)";
                if (!isNaN(rVal)) {
                    const matchR = echelleRisques.find(er => er.valeur == rVal);
                    if (matchR) bgCol = matchR.color;
                }
                sel.parentElement.style.backgroundColor = bgCol;

                let cellIndex = Store.data.referentiels.grilleRisques.findIndex(c => c.g === gVal && c.v === vVal);
                if (cellIndex >= 0) {
                    if (isNaN(rVal)) Store.data.referentiels.grilleRisques.splice(cellIndex, 1);
                    else Store.data.referentiels.grilleRisques[cellIndex].r = rVal;
                } else if (!isNaN(rVal)) {
                    Store.data.referentiels.grilleRisques.push({ g: gVal, v: vVal, r: rVal });
                }
                Store.save();
            });
        });
    };

    renderEchelleRisques();
    renderMatriceRisques();
}

// --- REFERENTIEL : SOCLE DE SECURITE ---
function initSoclePage() {
    const tbody = document.getElementById('ref-socle-tbody');
    const btnAdd = document.getElementById('btn-add-socle');
    const modal = document.getElementById('modal-add-socle');
    const btnCancel = document.getElementById('btn-cancel-socle');
    const btnConfirm = document.getElementById('btn-confirm-socle');

    if (!tbody || !btnAdd) return;

    const renderSocles = () => {
        tbody.innerHTML = '';
        const activeSocles = Store.data.referentiels.socles || [];
        const displayMap = new Map();
        
        if (Store.defaultSocles && Store.defaultSocles.length > 0) {
            Store.defaultSocles.forEach(ds => {
                displayMap.set(ds.nom, { ...ds, active: false });
            });
        }
        
        activeSocles.forEach(s => {
            displayMap.set(s.nom, { ...s, active: true });
        });

        const sortedLibrary = Array.from(displayMap.values());

        sortedLibrary.forEach((s) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid var(--c-border)";

            const checkboxHTML = `<input type="checkbox" class="socle-active" ${s.active ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">`;
            const deleteBtnHTML = s.deletable ? 
                `<button class="btn secondary btn-del-socle" style="padding:4px; min-width:auto;">✕</button>` : '';

            tr.innerHTML = `
                <td style="text-align:center; padding:10px;">${checkboxHTML}</td>
                <td style="padding:10px; font-weight:bold;">${s.nom}</td>
                <td style="padding:10px; font-size:0.9em; opacity:0.8;">${s.description}</td>
                <td style="text-align:center; padding:10px;">${deleteBtnHTML}</td>
            `;

            const cb = tr.querySelector('.socle-active');
            cb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const exists = Store.data.referentiels.socles.find(x => x.nom === s.nom);
                    if (!exists) {
                        Store.data.referentiels.socles.push({ ...s, active: true });
                    }
                } else {
                    Store.data.referentiels.socles = Store.data.referentiels.socles.filter(x => x.nom !== s.nom);
                }
                Store.save();
                renderSocles();
            });

            const del = tr.querySelector('.btn-del-socle');
            if (del) {
                del.addEventListener('click', () => {
                    if (confirm(`Supprimer le socle "${s.nom}" du référentiel ?`)) {
                        Store.data.referentiels.socles = Store.data.referentiels.socles.filter(x => x.nom !== s.nom);
                        Store.save();
                        renderSocles();
                    }
                });
            }

            tbody.appendChild(tr);
        });
    };

    btnAdd.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    btnCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    btnConfirm.addEventListener('click', () => {
        const nom = document.getElementById('new-socle-nom').value;
        const desc = document.getElementById('new-socle-desc').value;
        const fileInput = document.getElementById('new-socle-file');

        if (!nom) {
            alert("Le nom du socle est requis.");
            return;
        }

        const newSocle = {
            nom: nom,
            description: desc,
            active: true,
            deletable: true,
            exigences: []
        };

        const addAndClose = () => {
            Store.data.referentiels.socles.push(newSocle);
            Store.save();
            renderSocles();
            modal.classList.add('hidden');
            document.getElementById('new-socle-nom').value = '';
            document.getElementById('new-socle-desc').value = '';
            fileInput.value = '';
        };

        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split('\n');
                lines.forEach(line => {
                    const parts = line.split(';');
                    if (parts.length >= 2) {
                        newSocle.exigences.push({
                            ref: parts[0].trim(),
                            description: parts[1].trim(),
                            libellé: parts[2] ? parts[2].trim() : parts[1].trim()
                        });
                    }
                });
                addAndClose();
            };
            reader.readAsText(fileInput.files[0]);
        } else {
            addAndClose();
        }
    });

    renderSocles();
}

export function init() {
    if (document.getElementById('ref-socle-tbody')) initSoclePage();
    if (document.getElementById('ref-gravite-tbody')) initImpactsGravitesPage();
    if (document.getElementById('ref-vraisemblance-tbody')) initVraisemblancePage();
    if (document.getElementById('ref-killchain-tbody')) initKillChainPage();
    if (document.getElementById('ref-motivation-tbody')) initMotivResPage();
    if (document.getElementById('ref-matrice-container')) initRefMatricePage();
}
