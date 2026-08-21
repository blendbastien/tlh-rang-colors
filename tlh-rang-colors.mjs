// TLH — Rang colors + World themes v1.3 — rang select + robuste CSB/Foundry v12-v13

/* ══════════════ RANGS ══════════════ */
const RANGS = ['F','E','D','C','B','A','S','SS','SSS'];
const RANG_CLASSES = RANGS.map(r => 'rang-' + r);

function rangField(el) {
  // le rang peut être un input (ancien) ou un select (nouveau)
  if (el.matches('input, select')) return el;
  return el.querySelector('select') || el.querySelector('input[type="text"]');
}

function applyRang(el) {
  const f = rangField(el);
  if (!f) return;
  const val = (f.value || '').trim().toUpperCase();
  RANG_CLASSES.forEach(c => el.classList.remove(c));
  if (RANGS.includes(val)) el.classList.add('rang-' + val);
}

function bindRang(el) {
  const f = rangField(el);
  if (!f || f.dataset.tlhBound) return;
  f.dataset.tlhBound = '1';
  ['input','change','blur','keyup'].forEach(evt =>
    f.addEventListener(evt, () => applyRang(el))
  );
}

/* ══════════════ THÈMES PAR MONDE ══════════════ */
const MONDES = ['systeme','eos','andromeda','clockwork','cordelia','eryndor','hyperion','inertia','nova','triangulum'];
const MONDE_CLASSES = MONDES.map(m => 'monde-' + m);

function getSelect(el) {
  // CSB peut poser la cssClass sur le <select> lui-même OU sur son conteneur
  if (el.matches && el.matches('select')) return el;
  return el.querySelector ? el.querySelector('select') : null;
}

function themeTargets(sel) {
  // Poser la classe sur tous les ancêtres plausibles : fenêtre v1, v2, et le form
  const targets = [];
  const f = sel.closest('form');                    if (f) targets.push(f);
  const a1 = sel.closest('.app.window-app');        if (a1) targets.push(a1);
  const a2 = sel.closest('.application');           if (a2) targets.push(a2);
  const sh = sel.closest('.custom-system-actor');   if (sh) targets.push(sh);
  return targets.length ? targets : [sel.parentElement];
}

function applyMonde(sel) {
  const val = (sel.value || '').trim().toLowerCase();
  themeTargets(sel).forEach(root => {
    if (!root) return;
    MONDE_CLASSES.forEach(c => root.classList.remove(c));
    if (MONDES.includes(val)) root.classList.add('monde-' + val);
  });
}

function bindMonde(el) {
  const sel = getSelect(el);
  if (!sel) return;
  if (!sel.dataset.tlhMondeBound) {
    sel.dataset.tlhMondeBound = '1';
    sel.addEventListener('change', () => applyMonde(sel));
  }
  applyMonde(sel);
}

/* ══════════════ SCAN GLOBAL ══════════════ */
function scanAll(root) {
  let r = document;
  if (root instanceof HTMLElement) r = root;
  else if (root && root[0] instanceof HTMLElement) r = root[0];
  r.querySelectorAll('.badge-rang').forEach(el => { applyRang(el); bindRang(el); });
  // les deux cas de placement de la classe
  r.querySelectorAll('.monde-select, select.monde-select, .monde-select select, select[name$=".monde"]')
    .forEach(el => bindMonde(el.matches('select') ? el : el));
}

const observer = new MutationObserver(() => scanAll(document));

Hooks.once('ready', () => {
  scanAll(document);
  observer.observe(document.body, { childList: true, subtree: true });
  // filet de sécurité : rescan léger périodique (fiches restaurées, re-rendus CSB)
  setInterval(() => scanAll(document), 2000);
});

Hooks.on('renderActorSheet', (app, html) => scanAll(html));
Hooks.on('renderApplication', (app, html) => scanAll(html));


/* ═══════ v1.5 — couleurs par valeur (double stratégie + mouchard) ═══════ */
const TLH_RANGS = ['F','E','D','C','B','A','S','SS','SSS'];
function tlhSlug(t){return t.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\+/g,'plus').replace(/[^a-z]/g,'');}
function tlhSetCell(td, kind, token){
  if (!td) return 0;
  [...td.classList].forEach(c=>{ if(c.startsWith('cell-'+kind+'-')) td.classList.remove(c); });
  if (token) { td.classList.add('cell-'+kind+'-'+token); return 1; }
  return 0;
}
function tlhDecorateTables(){
  let n=0;
  document.querySelectorAll('.custom-system-entity table').forEach(table=>{
    // stratégie B : index de colonnes d'après la ligne d'en-tête
    let idxRang=-1, idxRar=-1;
    const head = table.querySelector('tr');
    if (head) [...head.children].forEach((c,i)=>{
      const t=c.textContent.trim().toLowerCase();
      if (idxRang<0 && /\brang\b/.test(t)) idxRang=i;
      if (idxRar<0 && /raret/.test(t)) idxRar=i;
    });
    table.querySelectorAll('tr').forEach((tr,ri)=>{
      if (ri===0) return;
      // stratégie A : data-name où qu'il soit dans la ligne
      let elR = tr.querySelector('[data-name*="rang" i]');
      let elQ = tr.querySelector('[data-name*="rarete" i]');
      let tdR = elR ? (elR.closest('td') || elR) : (idxRang>=0 ? tr.children[idxRang] : null);
      let tdQ = elQ ? (elQ.closest('td') || elQ) : (idxRar>=0 ? tr.children[idxRar] : null);
      if (tdR){ const v=tdR.textContent.trim().toUpperCase();
        n+=tlhSetCell(tdR,'rang', TLH_RANGS.includes(v)?v:null); }
      if (tdQ){ const s=tlhSlug(tdQ.textContent);
        n+=tlhSetCell(tdQ,'rar', s||null); }
    });
  });
  return n;
}
let tlhTblScheduled=false, tlhAnnounced=false;
function tlhScheduleTables(){
  if (tlhTblScheduled) return;
  tlhTblScheduled=true;
  requestAnimationFrame(()=>{ tlhTblScheduled=false;
    const n=tlhDecorateTables();
    if (n>0 && !tlhAnnounced){ tlhAnnounced=true;
      console.info('%cTLH v1.5 — '+n+' cellules rang/rareté décorées','color:#22c55e;font-weight:bold'); }
  });
}
Hooks.once('ready', ()=>{
  tlhScheduleTables();
  new MutationObserver(tlhScheduleTables).observe(document.body,{childList:true,subtree:true,characterData:true});
});
