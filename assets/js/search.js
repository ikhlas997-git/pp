/* Global quick search across documents, students, classes, lessons, exams, exercises and drawings */
const Search = (() => {
  let cache = null;
  DB.onChange(() => { cache = null; });

  function norm(s) {
    return String(s ?? '').toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '')   // diacritics & tatweel
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  const SOURCES = ['students', 'documents', 'lessons', 'exams', 'exercises', 'drawings', 'classes'];
  const ICON = { students: 'user', documents: 'folder', lessons: 'book', exams: 'clipboard', exercises: 'zap', drawings: 'penTool', classes: 'layers' };

  async function build() {
    const ctx = await Crud.loadCtx();
    const items = [];
    for (const src of SOURCES) {
      const recs = await DB.all(src);
      const cfg = Schemas[src];
      for (const r of recs) {
        let title, sub, route;
        if (src === 'students') {
          title = Students.fullName(r); sub = [ctx.cmap[r.classId]?.name, r.number].filter(Boolean).join(' · ');
          route = `#/students/${r.id}`;
        } else if (src === 'classes') {
          title = r.name; sub = [r.level, r.year].filter(Boolean).join(' · ');
          route = `#/students?class=${r.id}`;
        } else {
          title = r.title; sub = cfg.card(r, ctx).subtitle;
          route = `#/${src}?open=${r.id}`;
        }
        const text = cfg.fields.map(f => Crud.fieldValueText(f, r[f.key], ctx)).join(' ');
        items.push({ src, id: r.id, title: title || '—', sub, route, t: norm(title), h: norm(text + ' ' + (sub || '')), file: r.file || r.image || r.photo });
      }
    }
    return items;
  }

  async function query(q, limit = 30) {
    const n = norm(q);
    if (!n) return [];
    if (!cache) cache = await build();
    const words = n.split(' ');
    const res = [];
    for (const it of cache) {
      if (!words.every(w => it.h.includes(w) || it.t.includes(w))) continue;
      const score = (it.t.startsWith(n) ? 0 : it.t.includes(n) ? 1 : 2) + SOURCES.indexOf(it.src) * 0.01;
      res.push({ ...it, score });
    }
    return res.sort((a, b) => a.score - b.score).slice(0, limit);
  }

  function highlight(text, q) {
    const s = esc(text);
    const words = String(q).trim().split(/\s+/).filter(w => w.length > 1).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!words.length) return s;
    try { return s.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>'); } catch (e) { return s; }
  }

  function init() {
    const input = $('#gs-input'), box = $('#gs-results');
    let results = [], active = 0, seq = 0;
    const close = () => { box.hidden = true; };
    const paint = q => {
      if (!q.trim()) { close(); return; }
      if (!results.length) { box.innerHTML = `<div class="gs-empty muted">${t('search.none')}</div>`; box.hidden = false; return; }
      let html = '', lastSrc = null;
      results.forEach((r, i) => {
        if (r.src !== lastSrc) { html += `<div class="gs-group">${t('nav.' + r.src)}</div>`; lastSrc = r.src; }
        html += `<a class="gs-item ${i === active ? 'active' : ''}" href="${r.route}" data-i="${i}">
          <span class="gs-ic">${UI.icon(ICON[r.src])}</span>
          <span class="gs-text"><b>${highlight(r.title, q)}</b>${r.sub ? `<small class="muted">${highlight(r.sub, q)}</small>` : ''}</span></a>`;
      });
      box.innerHTML = html;
      box.hidden = false;
    };
    const run = async () => {
      const q = input.value, my = ++seq;
      const r = await query(q);
      if (my !== seq) return;
      results = r; active = 0; paint(q);
    };
    input.addEventListener('input', run);
    input.addEventListener('focus', () => { if (input.value.trim()) run(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!results.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
        paint(input.value);
        $('.gs-item.active', box)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (results[active]) { go(results[active]); }
      } else if (e.key === 'Escape') { close(); input.blur(); }
    });
    const go = r => { location.hash = r.route; if (location.hash === r.route) App.render(); close(); input.blur(); };
    box.addEventListener('mousedown', e => {
      const a = e.target.closest('.gs-item'); if (!a) return;
      e.preventDefault();
      go(results[+a.dataset.i]);
    });
    document.addEventListener('click', e => { if (!e.target.closest('#global-search')) close(); });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); }
      else if (e.key === '/' && !e.target.closest('input, textarea, [contenteditable=true], select')) { e.preventDefault(); input.focus(); }
    });
  }

  return { norm, query, init };
})();
