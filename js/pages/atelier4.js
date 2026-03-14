import { Store } from '../data.js';

export function init() {
    const container = document.getElementById('matrice-container');
    if (!container) return;

    const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
    const vraisemb = [...Store.data.referentiels.vraisemblance].sort((a,b) => a.valeur - b.valeur);

    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.borderCollapse = 'collapse';

    const renderCell = (content, isHeader, style = '') => {
        const el = document.createElement(isHeader ? 'th' : 'td');
        el.innerHTML = content;
        el.style.cssText = style + '; border:1px solid var(--c-border); padding:10px;';
        return el;
    };

    const headerRow = document.createElement('tr');
    headerRow.appendChild(renderCell('', true));
    vraisemb.forEach(v => headerRow.appendChild(renderCell(`${v.niveau}<br>(V=${v.valeur})`, true, 'text-align:center; background:var(--c-bg-panel);')));
    table.appendChild(headerRow);

    gravites.forEach(g => {
        const row = document.createElement('tr');
        row.appendChild(renderCell(`${g.niveau}<br>(G=${g.valeur})`, true, 'text-align:right; background:var(--c-bg-panel);'));
        vraisemb.forEach(v => {
            const score = v.valeur * g.valeur;
            let bgColor = "var(--c-bg-input)", color = "var(--c-text-main)";
            if(score >= 12) { bgColor = "#ff0000"; color = "#fff"; }
            else if(score >= 8) { bgColor = "#ff6600"; color = "#fff"; }
            else if(score >= 4) { bgColor = "#ffcc00"; color = "#222"; }
            else { bgColor = "#ffff00"; color = "#222"; }
            row.appendChild(renderCell(score, false, `width:100px; height:100px; text-align:center; background-color:${bgColor}; color:${color}; font-weight:bold;`));
        });
        table.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(table);
}
