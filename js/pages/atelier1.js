import { Store } from '../data.js';
import { UI } from '../components.js';

export function init() {
    const container = document.getElementById('contexte-container');
    if (!container) return;

    container.innerHTML = '';
    
    const card = UI.card('extended', 'Contexte de l\'analyse');
    
    card.appendChild(UI.inputGroup('Nom de l\'étude', Store.data.atelier1.contexte.nom, (val) => {
        Store.data.atelier1.contexte.nom = val;
        Store.save();
    }));

    card.appendChild(UI.inputGroup('Description et portée', Store.data.atelier1.contexte.description, (val) => {
        Store.data.atelier1.contexte.description = val;
        Store.save();
    }, { multiline: true }));

    container.appendChild(card);
}
