// TLH — Couleurs dynamiques rangs & raretés
// Fonctionne avec le Custom System Builder 5.2.x

const RANG_CLASSES = ['rang-F','rang-E','rang-D','rang-C','rang-B','rang-A','rang-S','rang-SS','rang-SSS'];

function updateRangSelect(selectEl) {
  RANG_CLASSES.forEach(c => selectEl.classList.remove(c));
  const val = selectEl.value;
  if (val) selectEl.classList.add('rang-' + val);
}

function updateAllRangs(html) {
  html.querySelectorAll('.badge-rang select').forEach(sel => {
    updateRangSelect(sel);
    sel.addEventListener('change', () => updateRangSelect(sel));
  });
}

// Applique au rendu de chaque fiche
Hooks.on('renderActorSheet', (app, html) => updateAllRangs(html[0] ?? html));
Hooks.on('renderItemSheet',  (app, html) => updateAllRangs(html[0] ?? html));

// Relance sur tout re-rendu CSB
Hooks.on('renderApplication', (app, html) => {
  if (app?.constructor?.name?.includes('CustomActor') || 
      html?.querySelector?.('.custom-system-entity')) {
    updateAllRangs(html[0] ?? html);
  }
});
