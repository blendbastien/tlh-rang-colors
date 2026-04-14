// TLH — Couleurs dynamiques rang (textField)
const RANGS = ['F','E','D','C','B','A','S','SS','SSS'];

function applyRang(container) {
  // Cherche le conteneur .badge-rang
  container.querySelectorAll('.badge-rang').forEach(el => {
    const input = el.querySelector('input');
    if (!input) return;
    const val = input.value.trim().toUpperCase();
    // Retire toutes les classes rang
    RANGS.forEach(r => el.classList.remove('rang-' + r));
    // Applique la bonne classe
    if (RANGS.includes(val)) el.classList.add('rang-' + val);
    // Bind event si pas déjà fait
    if (!input.dataset.tlhBound) {
      input.dataset.tlhBound = '1';
      input.addEventListener('input', () => applyRang(container));
      input.addEventListener('change', () => applyRang(container));
    }
  });
}

function scanAll(html) {
  const root = html instanceof HTMLElement ? html : (html?.[0] ?? document);
  applyRang(root);
}

Hooks.on('renderActorSheet',  (app, html) => scanAll(html));
Hooks.on('renderApplication', (app, html) => {
  if (html?.[0]?.querySelector?.('.custom-system-entity')) scanAll(html);
});

// Applique immédiatement sur les fiches déjà ouvertes
Hooks.once('ready', () => {
  document.querySelectorAll('.custom-system-entity').forEach(el => applyRang(el));
});
