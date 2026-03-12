(function() {
    function init() {
        const containers = {
            gouvernance: document.getElementById('container-gouvernance'),
            protection: document.getElementById('container-protection'),
            detection: document.getElementById('container-detection'),
            reaction: document.getElementById('container-reaction'),
            resilience: document.getElementById('container-resilience')
        };

        if (!containers.gouvernance) return; // Not on the right page

        // --- Render existing data ---
        renderAll();

        // --- Events ---
        document.querySelectorAll('.btn-add-measure').forEach(btn => {
            btn.onclick = () => {
                const type = btn.getAttribute('data-type');
                addMeasure(type);
            };
        });
    }

    function renderAll() {
        // Clear containers
        const types = ['gouvernance', 'protection', 'detection', 'reaction', 'resilience'];
        types.forEach(t => {
            const container = document.getElementById(`container-${t}`);
            if (container) container.innerHTML = '';
        });

        // Add cards
        Store.data.atelier5.plans.forEach(plan => {
            renderMeasure(plan);
        });
    }

    function renderMeasure(plan) {
        const container = document.getElementById(`container-${plan.type}`);
        if (!container) return;

        const template = document.getElementById('tpl-measure-card');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.measure-card');

        card.setAttribute('data-measure-id', plan.id);
        card.querySelector('.measure-ref').textContent = plan.id;
        
        const descInput = card.querySelector('.measure-desc');
        descInput.value = plan.description || "";
        descInput.oninput = (e) => {
            plan.description = e.target.value;
            Store.save();
        };

        const ciblesInput = card.querySelector('.measure-cibles');
        ciblesInput.value = plan.cibles || "";
        ciblesInput.oninput = (e) => {
            plan.cibles = e.target.value;
            Store.save();
        };

        const prioritySelect = card.querySelector('.measure-priority');
        prioritySelect.value = plan.priorite || "P1";
        prioritySelect.onchange = (e) => {
            plan.priorite = e.target.value;
            Store.save();
        };

        card.querySelector('.btn-del-measure').onclick = () => {
            if (confirm("Supprimer cette mesure ?")) {
                Store.data.atelier5.plans = Store.data.atelier5.plans.filter(p => p.id !== plan.id);
                Store.save();
                card.remove();
            }
        };

        container.appendChild(clone);
    }

    function addMeasure(type) {
        // Find next ID: MES01, MES02...
        // We need to find the max number across all types according to design.md
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
        renderMeasure(newMeasure);
    }

    // Initial load
    init();

    // Re-init when page is reloaded via navigation (CustomEvent from app.js)
    document.addEventListener('pageLoaded:plan', init);

})();
