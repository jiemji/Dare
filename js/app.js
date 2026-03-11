document.addEventListener('DOMContentLoaded', () => {
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
    // Initialize theme from store
    htmlEl.setAttribute('data-theme', Store.data.settings.theme);
    
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
            { id: "contexte", label: "Contexte de l'analyse", file: "pages/atelier1/contexte.html", script: "js/pages/atelier1.js" },
            { id: "processus", label: "Processus métier", file: "pages/atelier1/processus.html", script: "js/pages/atelier1_suite.js" },
            { id: "evenements", label: "Évènements regrettables", file: "pages/atelier1/evenements.html", script: "js/pages/atelier1_suite.js" }
        ],
        atelier2: [
            { id: "sources", label: "Sources de risque", file: "pages/atelier2/sources.html", script: "js/pages/atelier2.js" },
            { id: "objectifs", label: "Objectifs visés", file: "pages/atelier2/objectifs.html", script: "js/pages/atelier2.js" },
            { id: "evaluation", label: "Évaluation de la menace", file: "pages/atelier2/evaluation.html", script: "js/pages/atelier2.js" }
        ],
        atelier3: [
            { id: "parties_prenantes", label: "Parties prenantes", file: "pages/atelier3/parties_prenantes.html", script: "js/pages/atelier3.js" },
            { id: "scenarios_strat", label: "Scénarios stratégiques", file: "pages/atelier3/scenarios_strat.html" }
        ],
        atelier4: [
            { id: "scenarios_risques", label: "Scénarios de risques", file: "pages/atelier4/scenarios_risques.html" },
            { id: "cartographie", label: "Cartographie des risques", file: "pages/atelier4/cartographie.html" }
        ],
        atelier5: [
            { id: "plan", label: "Plan de traitement", file: "pages/atelier5/plan.html" },
            { id: "carto_resid", label: "Cartographie résiduelle", file: "pages/atelier5/cartographie_resid.html" }
        ],
        livrables: [
            { id: "livrable1", label: "Livrable 1", file: "pages/livrables/l1.html" },
            { id: "livrable2", label: "Livrable 2", file: "pages/livrables/l2.html" }
        ],
        referentiels: [
            { id: "socle", label: "Socle de sécurité", file: "pages/referentiels/socle.html" },
            { id: "impacts_gravites", label: "Impacts et Gravités", file: "pages/referentiels/impacts_gravites.html", script: "js/pages/referentiels.js" },
            { id: "motivations_ressources", label: "Motivations et Ressources", file: "pages/referentiels/motivations_ressources.html", script: "js/pages/referentiels.js" },
            { id: "vraisemblance", label: "Vraisemblance", file: "pages/referentiels/vraisemblance.html", script: "js/pages/referentiels.js" },
            { id: "matrice", label: "Matrice des risques", file: "pages/referentiels/matrice.html", script: "js/pages/referentiels.js" }
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

    function loadWelcomeScreen() {
        mainContent.innerHTML = `
            <div class="welcome-screen">
                <h1>Bienvenue dans Dare</h1>
                <p>Application d'analyse des risques (EBIOS RM / ISO 27005).</p>
                <div class="actions" style="margin-top: 20px;">
                    <button class="btn primary" id="btn-start">Commencer l'Atelier 1</button>
                </div>
            </div>
        `;
        document.getElementById('btn-start').addEventListener('click', () => {
            document.getElementById('btn-atelier1').click();
        });
        navBtns.forEach(btn => btn.classList.remove('active'));
        sidebarMenu.innerHTML = '';
    }

    // Handle primary navigation click
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            
            // Set active state
            navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Generate Sidebar menu
            generateSidebar(target);
            
            // Auto open first page
            if (pageStructure[target] && pageStructure[target].length > 0) {
                loadPage(pageStructure[target][0]);
            } else {
                mainContent.innerHTML = `<h2>En construction</h2><p>Page pour ${target}</p>`;
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
            const response = await fetch(pageDef.file);
            if (!response.ok) throw new Error("Page not found");
            const html = await response.text();
            mainContent.innerHTML = html;
            
            // Dynamic script loading logic if needed
            if (pageDef.script) {
                // To avoid reloading the same script on every click:
                if (!document.querySelector(`script[src="${pageDef.script}"]`)) {
                    const script = document.createElement('script');
                    script.src = pageDef.script;
                    document.body.appendChild(script);
                } else {
                    // Script is already loaded, we might need a way to initialize the view again
                    // E.g., emitting an event or calling a global init function based on page
                    document.dispatchEvent(new CustomEvent(`pageLoaded:${pageDef.id}`));
                }
            }
        } catch (error) {
            mainContent.innerHTML = `<div class="error">Impossible de charger la page : ${pageDef.label}<br/>(créez le fichier HTML correspondant pour voir le résultat)</div>`;
        }
    }

    // init welcome screen if empty
    const btnNewAnalysis = document.getElementById('btn-new-analysis');
    if (btnNewAnalysis) {
        btnNewAnalysis.addEventListener('click', () => {
            document.getElementById('btn-atelier1').click();
        });
    }
});
