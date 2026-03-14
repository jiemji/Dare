import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';
import { MermaidEditor } from '../../mermaid-editor/editor.js';
import { generateNextId, confirmAction, withId, tap } from '../utils.js';

function createRiskScenarioDom(rs, rsList) {
    const leftCol = tap(document.createElement('div'), el => {
        el.style.cssText = 'display:flex; flex-direction:column; gap:15px;';
        el.appendChild(UI.inputGroup('Biens supports', null, null, { bind: { obj: rs, key: 'biensSupports' } }));
        el.appendChild(UI.inputGroup('Mesures de sécurité relevées', null, null, { multiline: true, bind: { obj: rs, key: 'mesuresExistantes' } }));
        el.appendChild(UI.inputGroup('Mesures de sécurité proposées', null, null, { multiline: true, bind: { obj: rs, key: 'mesuresProposees' } }));
    });

    const rightCol = tap(document.createElement('div'), el => {
        el.className = 'editor-container-integrated';
        el.innerHTML = MermaidEditor.createEditorMarkup();
    });

    const card = withId(UI.foldingCard(`Scénario de Risque ${rs.id || ''}`, {
        isExpanded: false,
        likelihood: {
            value: rs.vraisemblance || "1",
            options: Store.data.referentiels.vraisemblance.map(v => ({ value: v.valeur, label: `${v.valeur} - ${v.niveau}` })),
            onChange: (val) => { rs.vraisemblance = val; Store.save(); }
        },
        onDelete: () => confirmAction('Supprimer ce scénario de risque ?', () => {
            const idx = rsList.indexOf(rs);
            if(idx > -1) { rsList.splice(idx, 1); Store.save(); card.remove(); }
        }),
        contentLeft: leftCol,
        contentRight: rightCol,
        onToggle: (isExpanded) => {
            if (isExpanded && !card._editor) {
                card._editor = new MermaidEditor(rightCol, {
                    phases: Store.data.referentiels.killChain,
                    initialData: rs.diagramData || { nodes: [], links: [] },
                    onScoreChange: (score) => {
                        rs.vraisemblance = score.toString();
                        if (card._likelihoodSelect) card._likelihoodSelect.value = rs.vraisemblance;
                        Store.save();
                    },
                    onDataChange: (data) => { rs.diagramData = data; Store.save(); }
                });
            }
        }
    }), rs.id);

    return card;
}

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
        const section = tap(document.createElement('div'), el => el.style.cssText = 'width:100%; margin-bottom:30px;');
        const header = tap(document.createElement('div'), el => {
            el.className = 'ss-section-header';
            el.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--c-bg-panel); padding:10px 15px; border-radius:var(--border-radius); border-left:4px solid var(--c-accent); margin-bottom:15px;';
        });

        const titleInfo = tap(document.createElement('div'), el => {
            el.appendChild(tap(document.createElement('h3'), h => h.textContent = `SS ${ss.id} : ${Sanitize.escape(ss.scenario || '(Pas de description)')}`));
            el.appendChild(tap(document.createElement('div'), d => {
                d.style.cssText = 'font-size:12px; opacity:0.8;';
                d.textContent = `Cible: ${ss.cible || '?'}`;
            }));
        });
        header.appendChild(titleInfo);

        const rsCardsContainer = tap(document.createElement('div'), el => {
            el.className = 'cards-container';
            el.style.cssText = 'display:flex; flex-direction:column; gap:20px;';
        });

        header.appendChild(UI.button('Ajouter Scénario de Risque', () => {
            const newRS = { id: generateNextId(rsData, 'RS'), ssId: ss.id, vraisemblance: "1", biensSupports: "", mesuresExistantes: "", mesuresProposees: "", diagramData: { nodes: [], links: [] } };
            rsData.push(newRS);
            Store.save();
            rsCardsContainer.appendChild(createRiskScenarioDom(newRS, rsData));
        }, 'primary'));
        
        section.appendChild(header);
        rsData.filter(r => r.ssId === ss.id).forEach(rs => rsCardsContainer.appendChild(createRiskScenarioDom(rs, rsData)));
        section.appendChild(rsCardsContainer);
        container.appendChild(section);
    });
}
