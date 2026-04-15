// TLH — Couleurs dynamiques rang v3
// Utilise MutationObserver pour survivre aux re-renders CSB

const RANGS = ['F','E','D','C','B','A','S','SS','SSS'];
const RANG_CLASSES = RANGS.map(r => 'rang-' + r);

function applyRang(container) {
  container.querySelectorAll('.badge-rang').forEach(el => {
    const input = el.querySelector('input[type="text"]');
    if (!input) return;
    const val = input.value.trim().toUpperCase();
    RANG_CLASSES.forEach(c => el.classList.remove(c));
    if (RANGS.includes(val)) el.classList.add('rang-' + val);
  });
}

function bindRang(container) {
  container.querySelectorAll('.badge-rang input[type="text"]').forEach(input => {
    if (input.dataset.tlhBound) return;
    input.dataset.tlhBound = '1';
    const el = input.closest('.badge-rang');
    const handler = () => {
      RANG_CLASSES.forEach(c => el.classList.remove(c));
      const val = input.value.trim().toUpperCase();
      if (RANGS.includes(val)) el.classList.add('rang-' + val);
    };
    input.addEventListener('input', handler);
    input.addEventListener('change', handler);
    input.addEventListener('blur', handler);
    handler();
  });
}

function scanAndBind(html) {
  const root = html instanceof HTMLElement ? html : (html?.[0] ?? document);
  applyRang(root);
  bindRang(root);
}

// MutationObserver — survit aux re-renders
const observer = new MutationObserver((mutations) => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        if (node.classList?.contains('badge-rang') || node.querySelector?.('.badge-rang')) {
          applyRang(node.closest?.('.custom-system-entity') ?? node);
          bindRang(node.closest?.('.custom-system-entity') ?? node);
        }
      }
    });
  });
});

Hooks.once('ready', () => {
  // Scan initial
  document.querySelectorAll('.custom-system-entity').forEach(el => {
    applyRang(el);
    bindRang(el);
  });
  // Observer global
  observer.observe(document.body, { childList: true, subtree: true });
});

Hooks.on('renderActorSheet', (app, html) => scanAndBind(html));
Hooks.on('renderApplication', (app, html) => {
  if (html?.[0]?.querySelector?.('.badge-rang')) scanAndBind(html);
});
