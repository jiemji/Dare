import { Store } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
    // ---- Store Initialization ----
    await Store.init();

    // ---- DOM Elements ----
    const htmlEl = document.documentElement;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    const btnTheme = document.getElementById('btn-theme');
    const btnBurger = document.getElementById('btn-burger');
    const btnPinSidebar = document.getElementById('btn-pin-sidebar');
    const burgerMenu = document.getElementById('burger-menu');
    const closeBurger = document.getElementById('close-burger');
    
    const sidebarMenu = document.getElementById('sidebar-menu');
    const navBtns = document.querySelectorAll('.navbar .nav-btn[data-target]');
    
    // ---- Theme Management ----
    htmlEl.setAttribute('data-theme', Store.data?.settings?.theme || 'light');
    
    btnTheme.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newTheme);
        Store.data.settings.theme = newTheme;
        Store.save();
    });

    // ---- Sidebar Pinned State ----
    if (Store.data.settings.sidebarPinned) {
        sidebar.classList.add('pinned');
    }
    
    btnPinSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('pinned');
        Store.data.settings.sidebarPinned = sidebar.classList.contains('pinned');
        Store.save();
    });

    // ---- Modals ----
    btnBurger.addEventListener('click', () => burgerMenu.classList.remove('hidden'));
    closeBurger.addEventListener('click', () => burgerMenu.classList.add('hidden'));

    // Menu Burger actions
    document.getElementById('menu-new').addEventListener('click', () => {
        burgerMenu.classList.add('hidden');
        Store.clear(); 
    });

    document.getElementById('menu-save').addEventListener('click', () => {
        burgerMenu.classList.add('hidden');
        Store.exportJSON();
    });

    document.getElementById('menu-load').addEventListener('click', () => {
        burgerMenu.classList.add('hidden');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => Store.importJSON(event.target.result);
            reader.readAsText(file);
        };
        input.click();
    });

    document.getElementById('btn-save').addEventListener('click', () => {
        Store.save();
        alert("Données sauvegardées en local.");
    });

    // ---- Routing System ----
    
    const pageStructure = {
        atelier1: [
            { id: "contexte", label: "Contexte de l'analyse", file: "pages/atelier1/contexte.html", script: "pages/atelier1.js" },
            { id: "processus", label: "Processus métier", file: "pages/atelier1/processus.html", script: "pages/atelier1_suite.js" },
            { id: "evenements", label: "Évènements regrettables", file: "pages/atelier1/evenements.html", script: "pages/atelier1_suite.js" }
        ],
        atelier2: [
            { id: "sources", label: "Sources de risque", file: "pages/atelier2/sources.html", script: "pages/atelier2.js" },
            { id: "objectifs", label: "Objectifs visés", file: "pages/atelier2/objectifs.html", script: "pages/atelier2.js" },
            { id: "evaluation", label: "Évaluation de la menace", file: "pages/atelier2/evaluation.html", script: "pages/atelier2.js" }
        ],
        atelier3: [
            { id: "parties_prenantes", label: "Parties prenantes", file: "pages/atelier3/parties_prenantes.html", script: "pages/atelier3.js" },
            { id: "scenarios_strat", label: "Scénarios stratégiques", file: "pages/atelier3/scenarios_strat.html", script: "pages/atelier3_scenarios.js" }
        ],
        atelier4: [
            { id: "scenarios_risques", label: "Scénarios de risques", file: "pages/atelier4/scenarios_risques.html", script: "pages/atelier4_scenarios.js" },
            { id: "cartographie", label: "Cartographie des risques", file: "pages/atelier4/cartographie.html" }
        ],
        atelier5: [
            { id: "plan", label: "Plan de traitement", file: "pages/atelier5/plan.html", script: "pages/atelier5.js" },
            { id: "carto_resid", label: "Cartographie résiduelle", file: "pages/atelier5/cartographie_resid.html" }
        ],
        livrables: [
            { id: "livrable1", label: "Livrable 1", file: "pages/livrables/l1.html" },
            { id: "livrable2", label: "Livrable 2", file: "pages/livrables/l2.html" }
        ],
        referentiels: [
            { id: "socle", label: "Socle de sécurité", file: "pages/referentiels/socle.html", script: "pages/referentiels.js" },
            { id: "impacts_gravites", label: "Impacts et Gravités", file: "pages/referentiels/impacts_gravites.html", script: "pages/referentiels.js" },
            { id: "motivations_ressources", label: "Motivations et Ressources", file: "pages/referentiels/motivations_ressources.html", script: "pages/referentiels.js" },
            { id: "vraisemblance", label: "Vraisemblance", file: "pages/referentiels/vraisemblance.html", script: "pages/referentiels.js" },
            { id: "matrice", label: "Matrice des risques", file: "pages/referentiels/matrice.html", script: "pages/referentiels.js" }
        ],
        aide: [
            { id: "aide", label: "Aide & Méthodologie", file: "pages/aide.html" }
        ]
    };

    // Add help action
    document.getElementById('menu-help').addEventListener('click', () => {
        burgerMenu.classList.add('hidden');
        loadPage(pageStructure.aide[0]);
    });

    // ---- Current Page Cache ----
    let currentModule = null;

    // Handle primary navigation click
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            generateSidebar(target);
            if (pageStructure[target] && pageStructure[target].length > 0) {
                loadPage(pageStructure[target][0]);
            }
        });
    });

    function generateSidebar(target) {
        sidebarMenu.innerHTML = '';
        const pages = pageStructure[target];
        if(!pages) return;

        pages.forEach(page => {
            const li = document.createElement('li');
            li.textContent = page.label;
            li.addEventListener('click', () => loadPage(page));
            sidebarMenu.appendChild(li);
        });
    }

    async function loadPage(pageDef) {
        try {
            // Lifecycle: destroy previous module if it exists
            if (currentModule && typeof currentModule.destroy === 'function') {
                currentModule.destroy();
            }
            currentModule = null;

            const response = await fetch(pageDef.file);
            if (!response.ok) throw new Error("Page not found");
            const html = await response.text();
            mainContent.innerHTML = html;
            
            // Dynamic module loading logic
            if (pageDef.script) {
                // We use dynamic import to load the page as a module
                // Adding cache-busting during dev if needed, or just plain path
                const module = await import(`./${pageDef.script}`);
                currentModule = module;
                
                if (typeof module.init === 'function') {
                    module.init();
                }
            }
        } catch (error) {
            console.error("Error loading page:", error);
            mainContent.innerHTML = `<div class="error">Impossible de charger la page : ${pageDef.label}</div>`;
        }
    }

    // init welcome screen if empty
    const btnNewAnalysis = document.getElementById('btn-new-analysis');
    if (btnNewAnalysis) {
        btnNewAnalysis.addEventListener('click', () => {
            document.getElementById('btn-atelier1').click();
        });
    }
    
    const btnLoadAnalysis = document.getElementById('btn-load-analysis');
    if (btnLoadAnalysis) {
        btnLoadAnalysis.addEventListener('click', () => {
            document.getElementById('menu-load').click();
        });
    }
});
