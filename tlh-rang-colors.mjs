// TLH — Rang colors + World themes v1.1 — MutationObserver + scan complet

/* ══════════════ RANGS ══════════════ */
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

/* ══════════════ THÈMES PAR MONDE ══════════════ */
const MONDES = ['eos','andromeda','clockwork','cordelia','eryndor','hyperion','inertia','nova','triangulum'];
const MONDE_CLASSES = MONDES.map(m => 'monde-' + m);

function applyMonde(sel) {
  // La classe se pose sur la fenêtre entière de la fiche pour thémer tout
  const root = sel.closest('.app') || sel.closest('.window-app') || sel.closest('form');
  if (!root) return;
  const val = (sel.value || '').trim().toLowerCase();
  MONDE_CLASSES.forEach(c => root.classList.remove(c));
  if (MONDES.includes(val)) root.classList.add('monde-' + val);
}

function bindMonde(wrapper) {
  const sel = wrapper.querySelector('select');
  if (!sel) return;
  if (!sel.dataset.tlhMondeBound) {
    sel.dataset.tlhMondeBound = '1';
    sel.addEventListener('change', () => applyMonde(sel));
  }
  applyMonde(sel);
}

/* ══════════════ SCAN GLOBAL ══════════════ */
function scanAll(root) {
  const r = root instanceof HTMLElement ? root : (root?.[0] ?? document);
  r.querySelectorAll('.badge-rang').forEach(el => {
    applyRang(el);
    bindInput(el);
  });
  r.querySelectorAll('.monde-select').forEach(el => bindMonde(el));
}

// Observer global — re-scan à chaque changement DOM
const observer = new MutationObserver(() => {
  document.querySelectorAll('.badge-rang').forEach(el => {
    applyRang(el);
    bindInput(el);
  });
  document.querySelectorAll('.monde-select').forEach(el => bindMonde(el));
});

Hooks.once('ready', () => {
  scanAll(document);
  observer.observe(document.body, { childList: true, subtree: true });
});

// Hooks Foundry
Hooks.on('renderActorSheet', (app, html) => scanAll(html));
Hooks.on('renderApplication', (app, html) => {
  if (html?.[0]?.querySelector?.('.badge-rang, .monde-select')) scanAll(html);
});

// Re-scan quand la fiche est restaurée depuis l'état minimisé
Hooks.on('getApplicationHeaderButtons', () => {
  setTimeout(() => scanAll(document), 200);
});
