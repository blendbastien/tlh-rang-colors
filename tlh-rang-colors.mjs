// TLH — Rang colors v5 — debounce rAF, compat v12/v13, rang hissé sur la fenêtre

const RANGS = ['F','E','D','C','B','A','S','SS','SSS'];
const RANG_CLASSES = RANGS.map(r => 'rang-' + r);

function applyRang(el) {
  const input = el.querySelector('input[type="text"]');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  RANG_CLASSES.forEach(c => el.classList.remove(c));
  const ok = RANGS.includes(val);
  if (ok) el.classList.add('rang-' + val);
  // hisser la classe sur la fenêtre (bordure de la fiche perso)
  const win = el.closest('.window-app, .application');
  if (win) {
    RANG_CLASSES.forEach(c => win.classList.remove(c));
    if (ok) win.classList.add('rang-' + val);
  }
}

function bindInput(el) {
  const input = el.querySelector('input[type="text"]');
  if (!input || input.dataset.tlhBound) return;
  input.dataset.tlhBound = '1';
  ['input','change','blur','keyup'].forEach(evt =>
    input.addEventListener(evt, () => applyRang(el))
  );
}

function scanAll(rootLike) {
  let root = rootLike;
  if (root && typeof root.jquery !== 'undefined') root = root[0];
  if (!(root instanceof HTMLElement) && root !== document) root = document;
  (root.querySelectorAll ? root : document)
    .querySelectorAll('.badge-rang')
    .forEach(el => { applyRang(el); bindInput(el); });
}

// Observer global, dégrossi : un seul scan par frame, limité aux fenêtres CSB
let scheduled = false;
function scheduleScan() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    document
      .querySelectorAll('.custom-system-actor-content .badge-rang, .window-app .badge-rang, .application .badge-rang')
      .forEach(el => { applyRang(el); bindInput(el); });
  });
}

Hooks.once('ready', () => {
  console.info('%cTLH Rang Colors v5 actif', 'color:#fbbf24;font-weight:bold');
  scanAll(document);
  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
});

// Rendu des fiches (v12 jQuery ou v13 HTMLElement)
Hooks.on('renderActorSheet', (_app, html) => scanAll(html));
Hooks.on('renderApplication', (_app, html) => {
  const el = (html && typeof html.jquery !== 'undefined') ? html[0] : html;
  if (el?.querySelector?.('.badge-rang')) scanAll(el);
});
