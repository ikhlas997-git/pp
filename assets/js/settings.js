/* Settings: persisted in localStorage, applied to the document (theme, font, language) */
const Settings = (() => {
  const KEY = 'teacher-app-settings';
  const now = new Date();
  const y = now.getFullYear();
  const defaultYear = now.getMonth() >= 7 ? `${y}/${y + 1}` : `${y - 1}/${y}`;

  const FONTS = [
    { id: 'Cairo', g: 'Cairo:wght@400;600;700' },
    { id: 'Tajawal', g: 'Tajawal:wght@400;500;700' },
    { id: 'Almarai', g: 'Almarai:wght@400;700' },
    { id: 'IBM Plex Sans Arabic', g: 'IBM+Plex+Sans+Arabic:wght@400;500;700' },
    { id: 'Noto Kufi Arabic', g: 'Noto+Kufi+Arabic:wght@400;600;700' },
    { id: 'Noto Naskh Arabic', g: 'Noto+Naskh+Arabic:wght@400;600;700' },
    { id: 'Amiri', g: 'Amiri:wght@400;700' },
    { id: 'Readex Pro', g: 'Readex+Pro:wght@400;600' },
    { id: 'El Messiri', g: 'El+Messiri:wght@400;600;700' },
    { id: 'Changa', g: 'Changa:wght@400;600' },
    { id: 'system', g: null }
  ];
  const ACCENTS = ['#2563eb', '#059669', '#7c3aed', '#0d9488', '#d97706', '#e11d48', '#475569', '#0891b2', '#9333ea', '#65a30d'];
  const THEMES = ['light', 'dark', 'sepia', 'midnight', 'system'];

  const defaults = {
    lang: 'ar', theme: 'light', accent: '#2563eb', font: 'Cairo', fontSize: 15, radius: 12, density: 'comfortable',
    teacher: { name: '', school: '', subject: '', year: defaultYear, header1: '', header2: '' },
    grades: { max: 20, assignments: 1, wEval: 1, wAssign: 1, wExam: 2, pass: 10, decimals: 2 }
  };

  let state;
  function load() {
    try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
    state = { ...defaults, ...state, teacher: { ...defaults.teacher, ...(state.teacher || {}) }, grades: { ...defaults.grades, ...(state.grades || {}) } };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn(e); } }
  load();

  function fontStack(id = state.font) {
    const base = "system-ui, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif";
    return id === 'system' ? base : `'${id}', ${base}`;
  }

  function resolvedTheme() {
    if (state.theme !== 'system') return state.theme;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply() {
    const root = document.documentElement;
    I18n.set(state.lang);
    root.dataset.theme = resolvedTheme();
    root.dataset.density = state.density;
    root.style.setProperty('--primary', state.accent);
    root.style.setProperty('--font', fontStack());
    root.style.setProperty('--fs', state.fontSize + 'px');
    root.style.setProperty('--radius', state.radius + 'px');
    const f = FONTS.find(x => x.id === state.font);
    const link = document.getElementById('font-link');
    if (link) {
      const href = f && f.g ? `https://fonts.googleapis.com/css2?family=${f.g}&display=swap` : '';
      if (link.getAttribute('href') !== href) link.setAttribute('href', href);
    }
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.setAttribute('content', state.accent);
  }
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => state.theme === 'system' && apply());

  function set(patch) {
    if (patch.teacher) patch.teacher = { ...state.teacher, ...patch.teacher };
    if (patch.grades) patch.grades = { ...state.grades, ...patch.grades };
    state = { ...state, ...patch };
    save();
    apply();
  }

  /* ---------- backup ---------- */
  async function serialize(v) {
    if (v instanceof Blob) return { __blob: await UI.blobToDataURL(v), __type: v.type };
    if (Array.isArray(v)) return Promise.all(v.map(serialize));
    if (v && typeof v === 'object') {
      const o = {};
      for (const k of Object.keys(v)) o[k] = await serialize(v[k]);
      return o;
    }
    return v;
  }
  async function deserialize(v) {
    if (v && typeof v === 'object' && v.__blob) {
      const b = await UI.dataURLToBlob(v.__blob);
      return v.__type && b.type !== v.__type ? new Blob([b], { type: v.__type }) : b;
    }
    if (Array.isArray(v)) return Promise.all(v.map(deserialize));
    if (v && typeof v === 'object') {
      const o = {};
      for (const k of Object.keys(v)) o[k] = await deserialize(v[k]);
      return o;
    }
    return v;
  }
  async function exportBackup() {
    const data = { app: 'teacher-app', version: 1, date: new Date().toISOString(), settings: state, stores: {} };
    for (const s of DB.STORES) data.stores[s] = await serialize(await DB.all(s));
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    UI.download(blob, `teacher-backup-${UI.today()}.json`);
    UI.toast(t('settings.backupDone'));
  }
  async function importBackup() {
    const f = await UI.pickFile('application/json,.json');
    if (!f) return;
    let data;
    try { data = JSON.parse(await f.text()); } catch (e) { return UI.toast(t('msg.invalidFile'), 'error'); }
    if (!data || data.app !== 'teacher-app' || !data.stores) return UI.toast(t('msg.invalidFile'), 'error');
    if (!await UI.confirm(t('settings.restoreConfirm'), { okLabel: t('settings.restore') })) return;
    for (const s of DB.STORES) {
      if (!data.stores[s]) continue;
      await DB.clear(s);
      const recs = await deserialize(data.stores[s]);
      if (recs.length) await DB.bulkPut(s, recs.map(r => ({ ...r })));
    }
    if (data.settings) set(data.settings);
    UI.toast(t('settings.restoreDone'));
    App.render();
  }
  async function wipe() {
    if (!await UI.confirm(t('settings.wipeConfirm'), { okLabel: t('settings.wipe') })) return;
    for (const s of DB.STORES) await DB.clear(s);
    UI.toast(t('settings.wipeDone'));
    App.render();
  }

  /* ---------- page ---------- */
  function render(el) {
    const s = state;
    const tr = s.teacher, g = s.grades;
    el.innerHTML = `
      <div class="page-head"><div><h1>${UI.icon('settings')} ${t('nav.settings')}</h1><p class="muted">${t('settings.desc')}</p></div></div>
      <div class="settings-grid">
        <section class="card">
          <h2>${UI.icon('globe')} ${t('settings.language')}</h2>
          <div class="seg" data-set="lang">
            <button data-v="ar" class="${s.lang === 'ar' ? 'active' : ''}">العربية</button>
            <button data-v="en" class="${s.lang === 'en' ? 'active' : ''}">English</button>
          </div>
        </section>

        <section class="card">
          <h2>${UI.icon('sun')} ${t('settings.theme')}</h2>
          <div class="theme-picker">
            ${THEMES.map(th => `<button class="theme-opt ${s.theme === th ? 'active' : ''}" data-theme-v="${th}"><span class="tp tp-${th}"></span>${t('theme.' + th)}</button>`).join('')}
          </div>
          <h3>${t('settings.accent')}</h3>
          <div class="swatches">
            ${ACCENTS.map(c => `<button class="swatch ${s.accent === c ? 'active' : ''}" data-accent="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}
            <label class="swatch custom" title="${t('settings.customColor')}" style="--c:${s.accent}"><input type="color" id="accent-custom" value="${s.accent}"></label>
          </div>
          <h3>${t('settings.radius')}</h3>
          <input type="range" min="0" max="20" value="${s.radius}" id="radius-range" class="range">
          <h3>${t('settings.density')}</h3>
          <div class="seg" data-set="density">
            <button data-v="compact" class="${s.density === 'compact' ? 'active' : ''}">${t('settings.compact')}</button>
            <button data-v="comfortable" class="${s.density === 'comfortable' ? 'active' : ''}">${t('settings.comfortable')}</button>
          </div>
        </section>

        <section class="card">
          <h2>${UI.icon('type')} ${t('settings.font')}</h2>
          <div class="font-list">
            ${FONTS.map(f => `<button class="font-opt ${s.font === f.id ? 'active' : ''}" data-font="${esc(f.id)}" style="font-family:${esc(fontStack(f.id))}">
              <span>${f.id === 'system' ? t('settings.systemFont') : esc(f.id)}</span><small>أبجد هوز — Aa Bb 123</small></button>`).join('')}
          </div>
          <h3>${t('settings.fontSize')}: <span id="fs-val">${s.fontSize}px</span></h3>
          <input type="range" min="12" max="20" value="${s.fontSize}" id="fs-range" class="range">
        </section>

        <section class="card">
          <h2>${UI.icon('user')} ${t('settings.teacherInfo')}</h2>
          <p class="muted small">${t('settings.teacherInfoHint')}</p>
          <form id="teacher-form" class="form-grid">
            ${[['name', 'settings.teacherName'], ['subject', 'settings.subject'], ['school', 'settings.school'], ['year', 'settings.year'], ['header1', 'settings.header1'], ['header2', 'settings.header2']]
              .map(([k, l]) => `<label class="field ${k.startsWith('header') ? 'full' : ''}"><span>${t(l)}</span><input class="input" name="${k}" value="${esc(tr[k])}"></label>`).join('')}
          </form>
        </section>

        <section class="card">
          <h2>${UI.icon('chart')} ${t('settings.gradesCfg')}</h2>
          <p class="muted small">${t('settings.gradesHint')}</p>
          <form id="grades-form" class="form-grid">
            <label class="field"><span>${t('settings.maxScore')}</span><input class="input" type="number" min="1" step="1" name="max" value="${g.max}"></label>
            <label class="field"><span>${t('settings.passMark')}</span><input class="input" type="number" min="0" step="0.25" name="pass" value="${g.pass}"></label>
            <label class="field"><span>${t('settings.assignCount')}</span><select class="input" name="assignments"><option value="1" ${g.assignments == 1 ? 'selected' : ''}>1</option><option value="2" ${g.assignments == 2 ? 'selected' : ''}>2</option></select></label>
            <label class="field"><span>${t('settings.decimals')}</span><input class="input" type="number" min="0" max="3" name="decimals" value="${g.decimals}"></label>
            <label class="field"><span>${t('settings.wEval')}</span><input class="input" type="number" min="0" step="0.5" name="wEval" value="${g.wEval}"></label>
            <label class="field"><span>${t('settings.wAssign')}</span><input class="input" type="number" min="0" step="0.5" name="wAssign" value="${g.wAssign}"></label>
            <label class="field"><span>${t('settings.wExam')}</span><input class="input" type="number" min="0" step="0.5" name="wExam" value="${g.wExam}"></label>
            <div class="field full formula" id="formula"></div>
          </form>
        </section>

        <section class="card">
          <h2>${UI.icon('database')} ${t('settings.data')}</h2>
          <p class="muted small">${t('settings.dataHint')}</p>
          <div class="btn-row">
            <button class="btn primary" id="backup-btn">${UI.icon('download')}<span>${t('settings.backup')}</span></button>
            <button class="btn" id="restore-btn">${UI.icon('upload')}<span>${t('settings.restore')}</span></button>
            <button class="btn danger ghost" id="wipe-btn">${UI.icon('trash')}<span>${t('settings.wipe')}</span></button>
          </div>
          <div class="muted small" id="storage-est"></div>
        </section>
      </div>`;

    const rerender = () => { App.refreshChrome(); render(el); };
    $$('.seg[data-set]', el).forEach(seg => seg.addEventListener('click', e => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      set({ [seg.dataset.set]: b.dataset.v }); rerender();
    }));
    $$('[data-theme-v]', el).forEach(b => b.addEventListener('click', () => { set({ theme: b.dataset.themeV }); rerender(); }));
    $$('[data-accent]', el).forEach(b => b.addEventListener('click', () => { set({ accent: b.dataset.accent }); rerender(); }));
    $('#accent-custom', el).addEventListener('change', e => { set({ accent: e.target.value }); rerender(); });
    $$('[data-font]', el).forEach(b => b.addEventListener('click', () => { set({ font: b.dataset.font }); rerender(); }));
    $('#fs-range', el).addEventListener('input', e => { set({ fontSize: +e.target.value }); $('#fs-val', el).textContent = e.target.value + 'px'; });
    $('#radius-range', el).addEventListener('input', e => set({ radius: +e.target.value }));
    $('#teacher-form', el).addEventListener('input', e => {
      if (!e.target.name) return;
      set({ teacher: { [e.target.name]: e.target.value } });
      App.refreshChrome();
    });
    const showFormula = () => {
      const gg = state.grades;
      const a = gg.assignments > 1 ? `(${t('grades.a1')} + ${t('grades.a2')}) / 2` : t('grades.a1');
      $('#formula', el).innerHTML = `<b>${t('settings.formula')}:</b> ${t('grades.avg')} = (${t('grades.eval')} × ${gg.wEval} + ${a} × ${gg.wAssign} + ${t('grades.exam')} × ${gg.wExam}) ÷ ${(+gg.wEval) + (+gg.wAssign) + (+gg.wExam)}`;
    };
    showFormula();
    $('#grades-form', el).addEventListener('input', e => {
      const n = e.target.name; if (!n) return;
      const v = parseFloat(e.target.value);
      if (isNaN(v) || v < 0) return;
      set({ grades: { [n]: v } });
      showFormula();
    });
    $('#backup-btn', el).addEventListener('click', exportBackup);
    $('#restore-btn', el).addEventListener('click', importBackup);
    $('#wipe-btn', el).addEventListener('click', wipe);
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(est => {
        const se = $('#storage-est', el);
        if (se) se.textContent = `${t('settings.storageUsed')}: ${UI.fmtSize(est.usage)} / ${UI.fmtSize(est.quota)}`;
      });
    }
  }

  return { get: () => state, set, apply, render, fontStack, resolvedTheme, FONTS, THEMES };
})();
