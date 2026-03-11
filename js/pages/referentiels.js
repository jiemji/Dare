// Logique pour les Référentiels (Centralisée dans un fichier pour tous les onglets référentiels)

// --- REFERENTIEL : IMPACTS ET GRAVITES ---
function initImpactsGravitesPage() {
    const tbodyG = document.getElementById('ref-gravite-tbody');
    const btnAddG = document.getElementById('btn-add-gravite');
    const tableI = document.getElementById('table-impacts');
    const btnAddI = document.getElementById('btn-add-impact');
    const tplG = document.getElementById('tpl-gravite-row');
    
    if(!tbodyG || !tableI) return;

    // -- Gestion Echelle des Gravités --
    const renderGravites = () => {
        tbodyG.innerHTML = '';
        // Sort descending for display
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        
        gravites.forEach(g => {
            const clone = tplG.content.cloneNode(true);
            const row = clone.querySelector('.gravite-row');
            row.setAttribute('data-val', g.valeur);
            
            clone.querySelector('.g-valeur').textContent = g.valeur;
            const inpNiv = clone.querySelector('.g-niveau');
            const inpCol = clone.querySelector('.g-color');
            const btnDel = clone.querySelector('.btn-del-gravite');
            
            inpNiv.value = g.niveau;
            inpCol.value = g.color;
            
            const saveG = () => {
                g.niveau = inpNiv.value;
                g.color = inpCol.value;
                renderImpactsTable(); // Update impact table headers colors
            };
            
            inpNiv.addEventListener('input', saveG);
            inpCol.addEventListener('change', saveG);
            
            btnDel.addEventListener('click', () => {
                if(confirm(`Supprimer le niveau de gravité ${g.valeur} ?`)) {
                    Store.data.referentiels.gravite = Store.data.referentiels.gravite.filter(x => x.valeur !== g.valeur);
                    Store.save();
                    renderGravites();
                    renderImpactsTable();
                }
            });
            tbodyG.appendChild(clone);
        });
    };

    btnAddG.addEventListener('click', () => {
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
    });

    // -- Gestion Tableau des impacts --
    // Structure locale pour stocker les cellules de la matrice d'impacts:
    // array of objects: { gravite: 4, typeImpact: "Financier", description: "Perte > 1M€" }
    // Pour simplifier, on stocke ça dans data.referentiels.grilleImpacts = [] (nouveau tableau si absent)
    if(!Store.data.referentiels.grilleImpacts) {
        Store.data.referentiels.grilleImpacts = [];
    }

    const renderImpactsTable = () => {
        const typesImpacts = Store.data.referentiels.impacts || [];
        const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
        
        let html = '';
        
        // En-tête (Types d'impacts en colonnes)
        html += '<tr style="background: var(--c-bg-panel); border-bottom: 2px solid var(--c-border); text-align: left;">';
        html += '<th style="padding: 10px; width: 150px;">Niveau (Gravité)</th>';
        
        typesImpacts.forEach(t => {
            html += `<th style="padding: 10px; position:relative;">
                        ${t}
                        <button class="btn secondary btn-del-type-impact" data-type="${t}" style="position:absolute; right:5px; top:5px; padding:2px 5px; font-size:10px;">✕</button>
                     </th>`;
        });
        html += '</tr>';
        
        // Lignes (Une par niveau de gravité)
        gravites.forEach(g => {
            html += `<tr style="border-bottom: 1px solid var(--c-border);">`;
            html += `<td style="padding: 8px; font-weight:bold; background-color:${g.color}33; border-left: 5px solid ${g.color};">
                        ${g.niveau} (${g.valeur})
                     </td>`;
            
            typesImpacts.forEach(t => {
                // Find existing cell data
                const cell = Store.data.referentiels.grilleImpacts.find(c => c.gravite === g.valeur && c.typeImpact === t);
                const desc = cell ? cell.description : "";
                
                html += `<td style="padding: 5px;">
                            <textarea class="impact-cell-input" data-g="${g.valeur}" data-t="${t}" rows="2" style="margin:0; width:100%; border:1px dashed var(--c-border); font-size:12px;">${desc}</textarea>
                         </td>`;
            });
            html += `</tr>`;
        });
        
        tableI.innerHTML = html;
        bindImpactsEvents();
    };

    const bindImpactsEvents = () => {
        // Delete Type d'impact
        tableI.querySelectorAll('.btn-del-type-impact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const typ = e.target.getAttribute('data-type');
                if(confirm(`Supprimer la colonne "${typ}" et toutes ses descriptions ?`)) {
                    Store.data.referentiels.impacts = Store.data.referentiels.impacts.filter(i => i !== typ);
                    Store.data.referentiels.grilleImpacts = Store.data.referentiels.grilleImpacts.filter(c => c.typeImpact !== typ);
                    Store.save();
                    renderImpactsTable();
                }
            });
        });
        
        // Cell Edit
        tableI.querySelectorAll('.impact-cell-input').forEach(ta => {
            ta.addEventListener('change', (e) => {
                const gVal = parseInt(e.target.getAttribute('data-g'), 10);
                const tStr = e.target.getAttribute('data-t');
                const val = e.target.value;
                
                let cellIndex = Store.data.referentiels.grilleImpacts.findIndex(c => c.gravite === gVal && c.typeImpact === tStr);
                
                if(cellIndex >= 0) {
                    Store.data.referentiels.grilleImpacts[cellIndex].description = val;
                } else {
                    Store.data.referentiels.grilleImpacts.push({
                        gravite: gVal,
                        typeImpact: tStr,
                        description: val
                    });
                }
                Store.save(); // On save on blur/change
            });
        });
    };

    btnAddI.addEventListener('click', () => {
        const val = prompt("Nom du nouveau type d'impact (ex: Environnemental):");
        if(val && val.trim() !== '') {
            if(!Store.data.referentiels.impacts) Store.data.referentiels.impacts = [];
            Store.data.referentiels.impacts.push(val.trim());
            Store.save();
            renderImpactsTable();
        }
    });

    // Initial render
    renderGravites();
    renderImpactsTable();
}

// RUN HOOKS OR INIT IMMEDIATELY
if (document.getElementById('ref-gravite-tbody')) initImpactsGravitesPage();

// --- REFERENTIEL : VRAISEMBLANCE ---
function initVraisemblancePage() {
    initGenericRefPage('vraisemblance', 'ref-vraisemblance-tbody', 'btn-add-vraisemblance');
}

// --- REFERENTIEL : MOTIVATIONS ET RESSOURCES ---
function initMotivResPage() {
    initGenericRefPage('motivation', 'ref-motivation-tbody', 'btn-add-motivation');
    initGenericRefPage('ressources', 'ref-ressources-tbody', 'btn-add-ressources');
}

// --- GENERIC REF LIST BUILDER ---
// Works for structure: { valeur: X, niveau: "", color: "", description: "" }
function initGenericRefPage(storeKey, tbodyId, btnAddId) {
    const tbody = document.getElementById(tbodyId);
    const btnAdd = document.getElementById(btnAddId);
    // On réutilise le template row de motivations_ressources s'il existe (la structure est la même)
    // S'il n'est pas trouvé par ID car on n'a copié qu'un des fichiers, on génèrera le HTML direct
    
    if(!tbody || !btnAdd) return;

    const renderData = () => {
        tbody.innerHTML = '';
        const list = [...Store.data.referentiels[storeKey]].sort((a,b) => b.valeur - a.valeur);
        
        list.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.cssText = "border-bottom: 1px solid var(--c-border);";
            
            tr.innerHTML = `
                <td style="padding: 8px; font-weight: bold; text-align:center;">${item.valeur}</td>
                <td style="padding: 8px;"><input type="text" class="r-niveau" value="${item.niveau || ''}" style="margin:0; width:100%;"></td>
                <td style="padding: 8px;"><input type="color" class="r-color" value="${item.color || '#cccccc'}" style="margin:0; width:100%; height:30px; padding:0; cursor:pointer; border:none;"></td>
                <td style="padding: 8px;"><input type="text" class="r-desc" value="${item.description || ''}" style="margin:0; width:100%;"></td>
                <td style="padding: 8px; text-align: center;"><button class="btn secondary btn-del-item" style="padding: 4px; min-width:auto;">✕</button></td>
            `;
            
            const inpNiv = tr.querySelector('.r-niveau');
            const inpCol = tr.querySelector('.r-color');
            const inpDesc = tr.querySelector('.r-desc');
            const btnDel = tr.querySelector('.btn-del-item');
            
            const saveItem = () => {
                item.niveau = inpNiv.value;
                item.color = inpCol.value;
                item.description = inpDesc.value;
                Store.save();
            };
            
            inpNiv.addEventListener('input', saveItem);
            inpCol.addEventListener('change', saveItem);
            inpDesc.addEventListener('input', saveItem);
            
            btnDel.addEventListener('click', () => {
                if(confirm(`Supprimer l'élément (Valeur ${item.valeur}) ?`)) {
                    Store.data.referentiels[storeKey] = Store.data.referentiels[storeKey].filter(x => x.valeur !== item.valeur);
                    Store.save();
                    renderData();
                }
            });
            
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

        // Ensure we have a default options list for the selects
        let optionsHTML = `<option value="">--</option>`;
        echelleRisques.forEach(r => {
            optionsHTML += `<option value="${r.valeur}">${r.niveau}</option>`;
        });

        let html = '<table class="data-table" style="border-collapse: collapse; width: 100%;">';
        
        // Header row
        html += '<tr><td></td>';
        vraisemb.forEach(v => {
            html += `<th style="text-align:center; padding: 10px; background:${v.color}33; border: 1px solid var(--c-border); border-bottom: 4px solid ${v.color};">${v.niveau} (V=${v.valeur})</th>`;
        });
        html += '</tr>';

        // Body rows
        gravites.forEach(g => {
            html += '<tr>';
            html += `<th style="text-align:right; padding: 10px; background:${g.color}33; border: 1px solid var(--c-border); border-right: 4px solid ${g.color}; width: 220px;">${g.niveau} (G=${g.valeur})</th>`;
            
            vraisemb.forEach(v => {
                // Find saved risk configuration for this specific cell cell
                const savedCell = Store.data.referentiels.grilleRisques.find(c => c.g === g.valeur && c.v === v.valeur);
                const selectedVal = savedCell ? savedCell.r : "";
                
                // Find matching color
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

        // Bind selects
        container.querySelectorAll('.matrice-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const gVal = parseInt(e.target.getAttribute('data-g'), 10);
                const vVal = parseInt(e.target.getAttribute('data-v'), 10);
                const rVal = parseInt(e.target.value, 10);

                // Update background color immediately for UI responsiveness
                let bgCol = "var(--c-bg-panel)";
                if (!isNaN(rVal)) {
                    const matchR = echelleRisques.find(er => er.valeur == rVal);
                    if (matchR) bgCol = matchR.color;
                }
                sel.parentElement.style.backgroundColor = bgCol;

                // Save to grid data
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

// Register global hooks
document.addEventListener('pageLoaded:impacts_gravites', initImpactsGravitesPage);
document.addEventListener('pageLoaded:motivations_ressources', initMotivResPage);
document.addEventListener('pageLoaded:vraisemblance', initVraisemblancePage);
document.addEventListener('pageLoaded:matrice', initRefMatricePage);

// Initial execution
if (document.getElementById('ref-motivation-tbody')) initMotivResPage();
if (document.getElementById('ref-vraisemblance-tbody')) initVraisemblancePage();
if (document.getElementById('ref-matrice-container')) initRefMatricePage();
