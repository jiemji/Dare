import { Store } from './data.js';

// ---- Global Error Handling ----
window.onerror = function(msg, url, line, col, error) {
    console.error("Global error:", msg, "at", line, ":", col);
    // Don't alert for every small thing, but help find critical startup issues
    return false;
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("App starting...");
        
        // ---- Store Initialization ----
        await Store.init();

        // ---- DOM Elements ----
        const getEl = (id) => document.getElementById(id);
        const htmlEl = document.documentElement;
        
        const ui = {
            sidebar: getEl('sidebar'),
            mainContent: getEl('main-content'),
            sidebarMenu: getEl('sidebar-menu'),
            btnTheme: getEl('btn-theme'),
            btnSave: getEl('btn-save'),
            btnFileMenu: getEl('btn-file-menu'),
            burgerMenu: getEl('burger-menu'),
            closeBurger: getEl('close-burger'),
            menuNew: getEl('menu-new'),
            menuSave: getEl('menu-save'),
            menuLoad: getEl('menu-load'),
            menuHelp: getEl('menu-help')
        };

        let currentModule = null;
        
        // ---- Theme Management ----
        if (ui.btnTheme) {
            htmlEl.setAttribute('data-theme', Store.data?.settings?.theme || 'light');
            ui.btnTheme.addEventListener('click', () => {
                const currentTheme = htmlEl.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                htmlEl.setAttribute('data-theme', newTheme);
                Store.data.settings.theme = newTheme;
                Store.save();
            });
        }

        // ---- File Menu Actions ----
        const toggleFileMenu = (show) => {
            if (ui.burgerMenu) {
                console.log("Toggling file menu:", show);
                if (show) {
                    ui.burgerMenu.classList.remove('hidden');
                    ui.burgerMenu.classList.add('active');
                } else {
                    ui.burgerMenu.classList.add('hidden');
                    ui.burgerMenu.classList.remove('active');
                }
            }
        };

        if (ui.btnFileMenu) {
            ui.btnFileMenu.onclick = (e) => {
                e.stopPropagation();
                toggleFileMenu(true);
            };
        }
        
        if (ui.closeBurger) ui.closeBurger.onclick = () => toggleFileMenu(false);
        if (ui.menuNew) ui.menuNew.onclick = () => { toggleFileMenu(false); Store.clear(); };
        if (ui.menuSave) ui.menuSave.onclick = () => { toggleFileMenu(false); Store.exportJSON(); };
        if (ui.menuLoad) {
            ui.menuLoad.onclick = () => {
                toggleFileMenu(false);
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (ev) => {
                    const file = ev.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => Store.importJSON(event.target.result);
                    reader.readAsText(file);
                };
                input.click();
            };
        }

        if (ui.btnSave) {
            ui.btnSave.onclick = () => { 
                Store.save(); 
                alert("Données sauvegardées en local."); 
            };
        }

        if (ui.menuHelp) {
            ui.menuHelp.onclick = () => {
                toggleFileMenu(false);
                loadPage(pageStructure.aide[0]);
            };
        }

        // Close menu on backdrop click
        if (ui.burgerMenu) {
            ui.burgerMenu.onclick = (e) => {
                if (e.target === ui.burgerMenu) toggleFileMenu(false);
            };
        }

        // ---- Routing System ----
        const pageStructure = {
            atelier1: [
                { id: "contexte", label: "Contexte de l'analyse", file: "pages/atelier1/contexte.html", script: "pages/atelier1.js" },
                { id: "processus", label: "Chaines de valeurs", file: "pages/atelier1/processus.html", script: "pages/atelier1_suite.js" },
                { id: "inventaire", label: "Inventaire des actifs", file: "pages/atelier1/inventaire.html", script: "pages/atelier1_inventaire.js" },
                { id: "evenements", label: "Évènements regrettables", file: "pages/atelier1/evenements.html", script: "pages/atelier1_suite.js" }
            ],
            atelier2: [
                { id: "sources", label: "Sources de risque", file: "pages/atelier2/sources.html", script: "pages/atelier2.js" },
                { id: "objectifs", label: "Objectifs visés", file: "pages/atelier2/objectifs.html", script: "pages/atelier2.js" },
                { id: "evaluation", label: "Évaluation de la menace", file: "pages/atelier2/evaluation.html", script: "pages/atelier2.js" }
            ],
            atelier3: [
                { id: "parties_prenantes", label: "Parties prenantes", file: "pages/atelier3/parties_prenantes.html", script: "pages/atelier3_list.js" },
                { id: "evaluation_pp", label: "Évaluation des parties prenantes", file: "pages/atelier3/evaluation_parties_prenantes.html", script: "pages/atelier3_evaluation.js" },
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

        // ---- Navigation & Tree ----
        function generateSidebar() {
            if (!ui.sidebarMenu) return;
            ui.sidebarMenu.innerHTML = '';
            
            Object.entries(pageStructure).forEach(([key, pages]) => {
                if (key === 'aide') return; 

                const header = document.createElement('li');
                header.className = 'menu-atelier';
                header.textContent = key.replace('atelier', 'Atelier ').replace('referentiels', 'Référentiels').replace('livrables', 'Livrables');
                ui.sidebarMenu.appendChild(header);

                pages.forEach(page => {
                    const li = document.createElement('li');
                    li.className = 'menu-page';
                    li.textContent = page.label;
                    li.dataset.id = page.id;
                    li.addEventListener('click', () => {
                        document.querySelectorAll('.menu-page').forEach(el => el.classList.remove('active'));
                        li.classList.add('active');
                        loadPage(page);
                    });
                    ui.sidebarMenu.appendChild(li);
                });
            });
        }

        async function loadPage(pageDef) {
            try {
                if (currentModule && typeof currentModule.destroy === 'function') {
                    currentModule.destroy();
                }
                currentModule = null;

                const response = await fetch(pageDef.file);
                if (!response.ok) throw new Error("Fichier non trouvé : " + pageDef.file);
                const html = await response.text();
                ui.mainContent.innerHTML = html;
                
                if (pageDef.script) {
                    const module = await import(`./${pageDef.script}`);
                    currentModule = module;
                    if (typeof module.init === 'function') {
                        module.init();
                    }
                }
            } catch (err) {
                console.error("Error loading page:", err);
                ui.mainContent.innerHTML = `<div class="error">Erreur de chargement : ${pageDef.label}</div>`;
            }
        }

        generateSidebar();
        console.log("App initialization complete.");

    } catch (error) {
        console.error("Critical boot error:", error);
        alert("Erreur critique au démarrage : " + error.message);
    }
});
