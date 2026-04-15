// TLH — Rang colors v4 — MutationObserver + scan complet

const RANGS = ['F','E','D','C','B','A','S','SS','SSS'];
const RANG_CLASSES = RANGS.map(r => 'rang-' + r);

function applyRang(el) {
  const input = el.querySelector('input[type="text"]');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  RANG_CLASSES.forEach(c => el.classList.remove(c));
  if (RANGS.includes(val)) el.classList.add('rang-' + val);
}

function bindInput(el) {
  const input = el.querySelector('input[type="text"]');
  if (!input || input.dataset.tlhBound) return;
  input.dataset.tlhBound = '1';
  ['input','change','blur','keyup'].forEach(evt =>
    input.addEventListener(evt, () => applyRang(el))
  );
}

function scanAll(root) {
  const r = root instanceof HTMLElement ? root : (root?.[0] ?? document);
  r.querySelectorAll('.badge-rang').forEach(el => {
    applyRang(el);
    bindInput(el);
  });
}

// Observer global — re-scan à chaque changement DOM
const observer = new MutationObserver(() => {
  document.querySelectorAll('.badge-rang').forEach(el => {
    applyRang(el);
    bindInput(el);
  });
});

Hooks.once('ready', () => {
  scanAll(document);
  observer.observe(document.body, { childList: true, subtree: true });
});

// Hooks Foundry
Hooks.on('renderActorSheet', (app, html) => scanAll(html));
Hooks.on('renderApplication', (app, html) => {
  if (html?.[0]?.querySelector?.('.badge-rang')) scanAll(html);
});

// Re-scan quand la fiche est restaurée depuis l'état minimisé
Hooks.on('getApplicationHeaderButtons', () => {
  setTimeout(() => scanAll(document), 200);
});
