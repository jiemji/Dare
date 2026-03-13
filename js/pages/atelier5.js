import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

function createMeasureDom(plan) {
    const card = UI.card('long', `Mesure ${plan.id}`);
    card.setAttribute('data-measure-id', plan.id);

    card.appendChild(UI.inputGroup('Descriptif de la mesure', plan.description, (val) => {
        plan.description = val;
        Store.save();
    }, { multiline: true }));

    card.appendChild(UI.inputGroup('Cibles', plan.cibles, (val) => {
        plan.cibles = val;
        Store.save();
    }));

    const priorities = [
        { value: 'P0', label: 'P0' },
        { value: 'P1', label: 'P1' },
        { value: 'P2', label: 'P2' },
        { value: 'P3', label: 'P3' }
    ];
    card.appendChild(UI.selectGroup('Priorité', plan.priorite, priorities, (val) => {
        plan.priorite = val;
        Store.save();
    }));

    card.appendChild(UI.button('Supprimer la mesure', () => {
        if (confirm("Supprimer cette mesure ?")) {
            Store.data.atelier5.plans = Store.data.atelier5.plans.filter(p => p.id !== plan.id);
            Store.save();
            card.remove();
        }
    }));

    return card;
}

function initAtelier5Page() {
    const containers = {
        gouvernance: document.getElementById('container-gouvernance'),
        protection: document.getElementById('container-protection'),
        detection: document.getElementById('container-detection'),
        reaction: document.getElementById('container-reaction'),
        resilience: document.getElementById('container-resilience')
    };

    if (!containers.gouvernance) return; 

    // Render existing
    Object.keys(containers).forEach(type => {
        const container = containers[type];
        container.innerHTML = '';
        const typePlans = Store.data.atelier5.plans.filter(p => p.type === type);
        typePlans.forEach(plan => {
            container.appendChild(createMeasureDom(plan));
        });
    });

    // Bind Add buttons
    document.querySelectorAll('.btn-add-measure').forEach(btn => {
        btn.onclick = () => {
            const type = btn.getAttribute('data-type');
            const container = containers[type];
            
            let maxId = 0;
            Store.data.atelier5.plans.forEach(p => {
                const num = parseInt(p.id.replace('MES', ''));
                if (num > maxId) maxId = num;
            });
            const newId = "MES" + String(maxId + 1).padStart(2, '0');
            
            const newMeasure = {
                id: newId,
                type: type,
                description: "",
                cibles: "",
                priorite: "P1"
            };

            Store.data.atelier5.plans.push(newMeasure);
            Store.save();
            container.appendChild(createMeasureDom(newMeasure));
        };
    });
}

export function init() {
    initAtelier5Page();
}
