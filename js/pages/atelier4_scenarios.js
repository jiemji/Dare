import { Store } from '../data.js';
import { UI, Sanitize } from '../components.js';
import { MermaidEditor } from '../../mermaid-editor/editor.js';

/**
 * Crée le DOM pour une carte de scénario de risque
 */
function createRiskScenarioDom(rs, rsList) {
    // Colonne de gauche : Formulaires
    const leftCol = document.createElement('div');
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.gap = '15px';

    leftCol.appendChild(UI.inputGroup('Biens supports', rs.biensSupports || '', (val) => {
        rs.biensSupports = val;
        Store.save();
    }));

    leftCol.appendChild(UI.inputGroup('Mesures de sécurité relevées', rs.mesuresExistantes || '', (val) => {
        rs.mesuresExistantes = val;
        Store.save();
    }, { multiline: true }));

    leftCol.appendChild(UI.inputGroup('Mesures de sécurité proposées', rs.mesuresProposees || '', (val) => {
        rs.mesuresProposees = val;
        Store.save();
    }, { multiline: true }));

    // Colonne de droite : Éditeur Mermaid
    const rightCol = document.createElement('div');
    rightCol.className = 'editor-container-integrated';
    rightCol.innerHTML = MermaidEditor.createEditorMarkup();

    // Construction de la carte à rabat
    const card = UI.foldingCard(`Scénario de Risque ${rs.id || ''}`, {
        isExpanded: false,
        likelihood: {
            value: rs.vraisemblance || "1",
            options: Store.data.referentiels.vraisemblance.map(v => ({ value: v.valeur, label: `${v.valeur} - ${v.niveau}` })),
            onChange: (val) => {
                rs.vraisemblance = val;
                Store.save();
            }
        },
        onDelete: () => {
            if(confirm('Supprimer ce scénario de risque ?')){
                const index = rsList.indexOf(rs);
                if(index > -1) {
                    rsList.splice(index, 1);
                    Store.save();
                    card.remove();
                }
            }
        },
        contentLeft: leftCol,
        contentRight: rightCol,
        onToggle: (isExpanded) => {
            if (isExpanded && !card._editor) {
                // Initialisation différée de l'éditeur lors du premier déploiement
                card._editor = new MermaidEditor(rightCol, {
                    phases: Store.data.referentiels.killChain,
                    initialData: rs.diagramData || { nodes: [], links: [] },
                    onScoreChange: (score) => {
                        rs.vraisemblance = score.toString();
                        if (card._likelihoodSelect) card._likelihoodSelect.value = rs.vraisemblance;
                        Store.save();
                    },
                    onDataChange: (data) => {
                        rs.diagramData = data;
                        Store.save();
                    }
                });
            }
        }
    });

    card.setAttribute('data-rs-id', rs.id);
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
        header.className = 'ss-section-header';
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
                vraisemblance: "1",
                biensSupports: "",
                mesuresExistantes: "",
                mesuresProposees: "",
                diagramData: { nodes: [], links: [] }
            };
            rsData.push(newRS);
            Store.save();
            rsCardsContainer.appendChild(createRiskScenarioDom(newRS, rsData));
        }, 'primary');
        header.appendChild(btnAdd);
        
        section.appendChild(header);

        const rsCardsContainer = document.createElement('div');
        rsCardsContainer.className = 'cards-container';
        rsCardsContainer.style.display = 'flex';
        rsCardsContainer.style.flexDirection = 'column';
        rsCardsContainer.style.gap = '20px';
        
        const ssScenarios = rsData.filter(r => r.ssId === ss.id);
        ssScenarios.forEach(rs => {
            rsCardsContainer.appendChild(createRiskScenarioDom(rs, rsData));
        });
        
        section.appendChild(rsCardsContainer);
        container.appendChild(section);
    });
}
