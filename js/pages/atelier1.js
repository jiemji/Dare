// Logique spécifique à l'atelier 1 (Contexte)

function initContextePage() {
    // Check if elements exist
    const inpOrg = document.getElementById('ctx-organisation');
    const inpSite = document.getElementById('ctx-site');
    const btnSite = document.getElementById('btn-open-site');
    const inpSect = document.getElementById('ctx-secteur');
    const inpAct = document.getElementById('ctx-activite');
    const inpPerim = document.getElementById('ctx-perimetre');

    if(!inpOrg) return; // not on the page

    // Load data
    const ctx = Store.data.atelier1.contexte;
    inpOrg.value = ctx.organisation || "";
    inpSite.value = ctx.siteInternet || "";
    inpSect.value = ctx.secteurActivite || "";
    inpAct.value = ctx.activite || "";
    inpPerim.value = ctx.perimetre || "";

    // Save data on changes
    [inpOrg, inpSite, inpSect, inpAct, inpPerim].forEach(el => {
        el.addEventListener('input', () => {
            ctx.organisation = inpOrg.value;
            ctx.siteInternet = inpSite.value;
            ctx.secteurActivite = inpSect.value;
            ctx.activite = inpAct.value;
            ctx.perimetre = inpPerim.value;
            // Note: Auto-save possible or just keep in memory until "Save" is clicked
        });
    });

    // Opening website
    btnSite.addEventListener('click', () => {
        let url = inpSite.value.trim();
        if(url) {
            if(!url.startsWith('http')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        }
    });
}

// Ensure init is run when script loads the first time
initContextePage();

// Listen to re-renders (if using our custom event system)
document.addEventListener('pageLoaded:contexte', initContextePage);
