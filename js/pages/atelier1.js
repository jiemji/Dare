import { Store } from '../data.js';
import { UI } from '../components.js';

export function init() {
    const container = document.getElementById('contexte-container');
    if (!container) return;

    container.innerHTML = '';
    const ctx = Store.data.atelier1.contexte;
    const fields = [
        { label: "Nom de l'étude", bind: { obj: ctx, key: 'nom' } },
        { label: "Description et portée", multiline: true, bind: { obj: ctx, key: 'description' } }
    ];
    
    container.appendChild(UI.dataCard('extended', 'Contexte de l\'analyse', fields));
}
