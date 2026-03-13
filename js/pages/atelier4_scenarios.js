import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';

/**
 * Crée le DOM pour une carte de scénario de risque
 * La carte est découpée en phases de la kill-chain (verticalement)
 */
/**
 * Crée le DOM pour une carte de scénario de risque
 */
function createRiskScenarioDom(rs, rsList) {
    const card = UI.card('long', `Scénario de Risque ${rs.id || ''}`);
    card.setAttribute('data-rs-id', rs.id);
    
    // Style pour s'assurer que la carte s'étire bien et prend tout l'espace
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.width = '100%';
    card.style.flex = '1 1 100%';
    card.style.maxWidth = 'none';

    // Conteneur des phases (côte à côte, ordre croissant)
    const phasesContainer = document.createElement('div');
    phasesContainer.style.display = 'flex';
    phasesContainer.style.flexDirection = 'row'; // Ordre naturel de gauche à droite
    phasesContainer.style.gap = '15px';
    phasesContainer.style.width = '100%';
    phasesContainer.style.minHeight = '150px';
    phasesContainer.style.overflowX = 'auto'; // Support pour le défilement horizontal si nécessaire
    phasesContainer.style.paddingBottom = '10px';

    const phases = [...Store.data.referentiels.killChain].sort((a,b) => a.valeur - b.valeur);
    
    phases.forEach(p => {
        const col = document.createElement('div');
        col.className = 'killchain-phase-col';
        col.style.flex = '1';
        col.style.minWidth = '220px';
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.gap = '10px';
        col.style.padding = '12px';
        col.style.backgroundColor = 'var(--c-bg-panel)';
        col.style.borderRadius = 'var(--border-radius)';
        col.style.border = '1px solid var(--c-border)';
        col.style.borderTop = '4px solid var(--c-accent)';

        const colHeader = document.createElement('div');
        colHeader.style.display = 'flex';
        colHeader.style.justifyContent = 'space-between';
        colHeader.style.alignItems = 'center';
        colHeader.style.marginBottom = '5px';

        const colTitle = document.createElement('h5');
        colTitle.textContent = p.phase;
        colTitle.style.fontSize = '12px';
        colTitle.style.margin = '0';
        colTitle.style.textTransform = 'uppercase';
        colTitle.style.letterSpacing = '0.5px';
        colTitle.style.fontWeight = 'bold';
        colHeader.appendChild(colTitle);

        const btnAdd = UI.button('+', () => {
            if(!rs.phases[p.valeur]) rs.phases[p.valeur] = [];
            rs.phases[p.valeur].push("");
            Store.save();
            renderPhaseActions();
        }, 'secondary');
        btnAdd.style.padding = '2px 8px';
        btnAdd.style.fontSize = '14px';
        btnAdd.style.minWidth = 'auto';
        btnAdd.title = "Ajouter une action";
        colHeader.appendChild(btnAdd);

        col.appendChild(colHeader);

        const actionsList = document.createElement('div');
        actionsList.style.display = 'flex';
        actionsList.style.flexDirection = 'column';
        actionsList.style.gap = '8px';

        const renderPhaseActions = () => {
            actionsList.innerHTML = '';
            const actions = rs.phases[p.valeur] || [];
            actions.forEach((act, idx) => {
                const actDiv = document.createElement('div');
                actDiv.style.display = 'flex';
                actDiv.style.gap = '5px';
                actDiv.style.alignItems = 'center';
                actDiv.style.backgroundColor = 'var(--c-bg-main)';
                actDiv.style.padding = '4px';
                actDiv.style.borderRadius = '4px';
                actDiv.style.border = '1px solid var(--c-border)';

                const inp = document.createElement('input');
                inp.type = 'text';
                inp.placeholder = 'Action...';
                inp.value = act;
                inp.style.fontSize = '12px';
                inp.style.padding = '4px';
                inp.style.flex = '1';
                inp.style.border = 'none';
                inp.style.background = 'transparent';
                inp.oninput = () => {
                    rs.phases[p.valeur][idx] = inp.value;
                    Store.save();
                };
                actDiv.appendChild(inp);

                const btnDel = UI.button('×', () => {
                    rs.phases[p.valeur].splice(idx, 1);
                    Store.save();
                    renderPhaseActions();
                }, 'secondary');
                btnDel.style.padding = '2px 6px';
                btnDel.style.fontSize = '12px';
                btnDel.style.minWidth = 'auto';
                btnDel.style.border = 'none';
                actDiv.appendChild(btnDel);

                actionsList.appendChild(actDiv);
            });
        };

        renderPhaseActions();
        col.appendChild(actionsList);
        phasesContainer.appendChild(col);
    });

    card.appendChild(phasesContainer);

    const footer = document.createElement('div');
    footer.style.marginTop = '15px';
    footer.style.textAlign = 'right';
    const btnDelCard = UI.button('Supprimer ce scénario', () => {
        if(confirm('Supprimer ce scénario de risque ?')){
            const index = rsList.indexOf(rs);
            if(index > -1) {
                rsList.splice(index, 1);
                Store.save();
                card.remove();
            }
        }
    }, 'secondary');
    footer.appendChild(btnDelCard);
    card.appendChild(footer);

    return card;
}

/**
 * Initialisation de la page des scénarios de risques
 */
export function init() {
    const container = document.getElementById('rs-container');
    if(!container) return;
    
    container.innerHTML = '';
    const ssList = Store.data.atelier3.scenariosStrategiques;
    const rsData = Store.data.atelier4.scenariosRisques;
    
    if(ssList.length === 0) {
        container.innerHTML = "<p class='full-width'><em>Veuillez d'abord créer des scénarios stratégiques dans l'Atelier 3.</em></p>";
        return;
    }
    
    ssList.forEach(ss => {
        const section = document.createElement('div');
        section.className = 'ss-section';
        section.style.width = '100%';
        section.style.marginBottom = '30px';
        
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.backgroundColor = 'var(--c-bg-panel)';
        header.style.padding = '10px 15px';
        header.style.borderRadius = 'var(--border-radius)';
        header.style.borderLeft = '4px solid var(--c-accent)';
        header.style.marginBottom = '15px';

        const titleInfo = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = `SS ${ss.id} : ${Sanitize.escape(ss.scenario || '(Pas de description)')}`;
        titleInfo.appendChild(title);
        
        const subtitle = document.createElement('div');
        subtitle.style.fontSize = '12px';
        subtitle.style.opacity = '0.8';
        subtitle.textContent = `Cible: ${ss.cible || '?'}`;
        titleInfo.appendChild(subtitle);
        
        header.appendChild(titleInfo);

        const btnAdd = UI.button('Ajouter Scénario de Risque', () => {
            let maxRef = 0;
            rsData.forEach(r => {
                const num = parseInt((r.id || '0').replace('RS', ''), 10);
                if (!isNaN(num) && num > maxRef) maxRef = num;
            });
            const newRef = `RS${(maxRef + 1).toString().padStart(2, '0')}`;
            
            const newRS = {
                id: newRef,
                ssId: ss.id,
                phases: {}
            };
            rsData.push(newRS);
            Store.save();
            rsCardsContainer.appendChild(createRiskScenarioDom(newRS, rsData));
        }, 'primary');
        header.appendChild(btnAdd);
        
        section.appendChild(header);

        const rsCardsContainer = document.createElement('div');
        rsCardsContainer.className = 'cards-container';
        
        const ssScenarios = rsData.filter(r => r.ssId === ss.id);
        ssScenarios.forEach(rs => {
            rsCardsContainer.appendChild(createRiskScenarioDom(rs, rsData));
        });
        
        section.appendChild(rsCardsContainer);
        container.appendChild(section);
    });
}
