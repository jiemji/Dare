import { Store } from '../data.js';
import { UI } from '../components.js';
import { generateNextId, confirmAction, withId } from '../utils.js';

function createMeasureDom(plan, planList) {
    const priorities = ['P0', 'P1', 'P2', 'P3'].map(p => ({ value: p, label: p }));
    const fields = [
        { label: 'Descriptif de la mesure', multiline: true, bind: { obj: plan, key: 'description' } },
        { label: 'Cibles', bind: { obj: plan, key: 'cibles' } },
        { label: 'Priorité', type: 'select', options: priorities, bind: { obj: plan, key: 'priorite' } }
    ];

    return withId(UI.dataCard('long', `Mesure ${plan.id}`, fields, () => {
        confirmAction("Supprimer cette mesure ?", () => {
            const idx = planList.indexOf(plan);
            if(idx > -1) { planList.splice(idx, 1); Store.save(); document.querySelector(`[data-id="${plan.id}"]`).remove(); }
        });
    }), plan.id);
}

export function init() {
    const containers = {
        gouvernance: document.getElementById('container-gouvernance'),
        protection: document.getElementById('container-protection'),
        detection: document.getElementById('container-detection'),
        reaction: document.getElementById('container-reaction'),
        resilience: document.getElementById('container-resilience')
    };
    if (!containers.gouvernance) return; 

    const planList = Store.data.atelier5.plans;
    Object.entries(containers).forEach(([type, el]) => {
        el.innerHTML = '';
        planList.filter(p => p.type === type).forEach(p => el.appendChild(createMeasureDom(p, planList)));
    });

    document.querySelectorAll('.btn-add-measure').forEach(btn => {
        btn.onclick = () => {
            const type = btn.getAttribute('data-type');
            const newMeasure = { id: generateNextId(planList, 'MES'), type, description: "", cibles: "", priorite: "P1" };
            planList.push(newMeasure);
            Store.save();
            containers[type].appendChild(createMeasureDom(newMeasure, planList));
        };
    });
}
