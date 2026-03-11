// Logique spécifique à l'atelier 4 : Cartographie

function initCartographiePage() {
    const container = document.getElementById('matrice-container');
    if (!container) return;

    // Build the risk matrix table
    // Rows = Gravité (descending), Cols = Vraisemblance (ascending)
    const gravites = [...Store.data.referentiels.gravite].sort((a,b) => b.valeur - a.valeur);
    const vraisemb = [...Store.data.referentiels.vraisemblance].sort((a,b) => a.valeur - b.valeur);

    let html = '<table class="data-table" style="border-collapse: collapse;">';
    
    // Header row
    html += '<tr><td></td>';
    vraisemb.forEach(v => {
        html += `<th style="text-align:center; padding: 10px; background:var(--c-bg-panel); border: 1px solid var(--c-border);">${v.niveau}<br>(V=${v.valeur})</th>`;
    });
    html += '</tr>';

    // Body rows
    gravites.forEach(g => {
        html += '<tr>';
        html += `<th style="text-align:right; padding: 10px; background:var(--c-bg-panel); border: 1px solid var(--c-border);">${g.niveau}<br>(G=${g.valeur})</th>`;
        
        vraisemb.forEach(v => {
            // Calculate a theoretical score or level based on V * G for demonstration, 
            // In a full implementation, you'd plot the "Scénarios de risques" into these cells
            const score = v.valeur * g.valeur;
            let bgColor = "var(--c-bg-input)";
            let color = "var(--c-text-main)";

            if(score >= 12) { bgColor = "#ff0000"; color = "#fff"; }
            else if(score >= 8) { bgColor = "#ff6600"; color = "#fff"; }
            else if(score >= 4) { bgColor = "#ffcc00"; color = "#222"; }
            else { bgColor = "#ffff00"; color = "#222"; }

            html += `<td style="width:100px; height:100px; text-align:center; border: 1px solid var(--c-border); background-color:${bgColor}; color:${color}; font-weight:bold;">${score}</td>`;
        });
        
        html += '</tr>';
    });

    html += '</table>';
    
    container.innerHTML = html;
}

// Global hook
document.addEventListener('pageLoaded:cartographie', initCartographiePage);

if(document.getElementById('matrice-container')) initCartographiePage();
