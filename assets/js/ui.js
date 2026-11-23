/* UI helpers: icons, modals, toasts, printing, files, rich text */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/>',
  chart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  penTool: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  back: '<polyline points="15 18 9 12 15 6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  undo: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  redo: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
  square: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  line: '<line x1="5" y1="19" x2="19" y2="5"/>',
  arrow: '<line x1="5" y1="19" x2="19" y2="5"/><polyline points="9 5 19 5 19 15"/>',
  triangle: '<path d="M12 3L2 21h20L12 3z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  eraser: '<path d="M20 20H7L3 16l10-10 7 7-6.5 6.5"/><path d="M6 11l7 7"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  idCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><line x1="13" y1="10" x2="19" y2="10"/><line x1="13" y1="14" x2="17" y2="14"/>',
  type2: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>'
};

const UI = {
  icon(name, cls = '') {
    return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  },

  toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `${UI.icon(type === 'error' ? 'alert' : 'check')}<span>${esc(msg)}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3000);
  },

  _modals: [],
  /** modal({title, body: string|Node, buttons:[{label, cls, icon, onClick(close) -> false keeps open}], size, onClose}) */
  modal({ title = '', body = '', buttons = [], size = 'md', onClose, cls = '' }) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal modal-${size} ${cls}" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-close aria-label="close">${UI.icon('x')}</button></div>
      <div class="modal-body"></div>
      <div class="modal-foot"></div></div>`;
    const bodyEl = $('.modal-body', wrap);
    if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
    const foot = $('.modal-foot', wrap);
    let closed = false;
    const close = (result) => {
      if (closed) return;
      closed = true;
      wrap.classList.add('out');
      setTimeout(() => wrap.remove(), 150);
      UI._modals = UI._modals.filter(m => m.close !== close);
      onClose && onClose(result);
    };
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn ${b.cls || ''}`;
      btn.innerHTML = `${b.icon ? UI.icon(b.icon) : ''}<span>${esc(b.label)}</span>`;
      btn.addEventListener('click', async () => {
        if (!b.onClick) return close();
        btn.disabled = true;
        try {
          const r = await b.onClick(close, wrap);
          if (r !== false) close(r);
        } finally { btn.disabled = false; }
      });
      foot.appendChild(btn);
    });
    if (!buttons.length) foot.remove();
    $('[data-close]', wrap).addEventListener('click', () => close());
    wrap.addEventListener('mousedown', e => { if (e.target === wrap) wrap._downOnBackdrop = true; });
    wrap.addEventListener('mouseup', e => { if (e.target === wrap && wrap._downOnBackdrop) close(); wrap._downOnBackdrop = false; });
    document.body.appendChild(wrap);
    const m = { el: wrap, body: bodyEl, close };
    UI._modals.push(m);
    setTimeout(() => { const f = $('[autofocus], input:not([type=hidden]):not([type=checkbox]):not([type=file]), textarea, select', bodyEl); f && f.focus(); }, 30);
    return m;
  },

  confirm(message, { okLabel, danger = true } = {}) {
    return new Promise(resolve => {
      UI.modal({
        title: t('common.confirm'), size: 'sm',
        body: `<p class="confirm-msg">${esc(message)}</p>`,
        onClose: r => resolve(r === true),
        buttons: [
          { label: t('common.cancel') },
          { label: okLabel || t('common.delete'), cls: danger ? 'danger' : 'primary', onClick: () => true }
        ]
      });
    });
  },

  prompt(title, value = '', { multiline = false } = {}) {
    return new Promise(resolve => {
      const body = multiline
        ? `<textarea class="input" rows="4" id="ui-prompt">${esc(value)}</textarea>`
        : `<input class="input" id="ui-prompt" value="${esc(value)}">`;
      const m = UI.modal({
        title, size: 'sm', body,
        onClose: r => resolve(typeof r === 'string' ? r : null),
        buttons: [
          { label: t('common.cancel') },
          { label: t('common.ok'), cls: 'primary', onClick: (c, w) => $('#ui-prompt', w).value }
        ]
      });
      $('#ui-prompt', m.el).addEventListener('keydown', e => {
        if (e.key === 'Enter' && !multiline) { e.preventDefault(); m.close($('#ui-prompt', m.el).value); }
      });
    });
  },

  /* ---------- formatting ---------- */
  fmtDate(d) {
    if (!d) return '';
    const date = typeof d === 'number' ? new Date(d) : new Date(d + (String(d).length === 10 ? 'T00:00:00' : ''));
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString(I18n.lang === 'ar' ? 'ar-DZ' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });
  },
  fmtSize(n) {
    if (!n && n !== 0) return '';
    const u = ['B', 'KB', 'MB', 'GB']; let i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(i ? 1 : 0)} ${u[i]}`;
  },
  fmtNum(n, dec = 2) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toFixed(dec);
  },
  today() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); },

  /* ---------- files ---------- */
  _urls: new WeakMap(),
  url(blob) {
    if (!blob) return '';
    if (!UI._urls.has(blob)) UI._urls.set(blob, URL.createObjectURL(blob));
    return UI._urls.get(blob);
  },
  fileFrom(f) { return f ? { blob: f, name: f.name, type: f.type || '', size: f.size } : null; },
  isImage(file) { return !!file && /^image\//.test(file.type || ''); },
  isPdf(file) { return !!file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')); },
  download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name || 'file';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },
  blobToDataURL(blob) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
  },
  async dataURLToBlob(url) { return (await fetch(url)).blob(); },
  pickFile(accept = '', multiple = false) {
    return new Promise(resolve => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = accept; inp.multiple = multiple;
      inp.onchange = () => resolve(multiple ? [...inp.files] : inp.files[0] || null);
      inp.click();
    });
  },
  loadScript(src) {
    UI._scripts = UI._scripts || {};
    if (!UI._scripts[src]) {
      UI._scripts[src] = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.onload = res; s.onerror = () => { delete UI._scripts[src]; rej(new Error('load failed')); };
        document.head.appendChild(s);
      });
    }
    return UI._scripts[src];
  },
  async xlsx() {
    if (window.XLSX) return window.XLSX;
    try { await UI.loadScript('assets/vendor/xlsx.full.min.js'); }
    catch (e) { await UI.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'); }
    return window.XLSX;
  },

  /* ---------- html ---------- */
  sanitize(html) {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    doc.querySelectorAll('script,style,iframe,object,embed,link,meta,form,input,button').forEach(n => n.remove());
    doc.querySelectorAll('*').forEach(n => {
      [...n.attributes].forEach(a => {
        const v = a.value.trim().toLowerCase();
        if (a.name.startsWith('on') || ((a.name === 'href' || a.name === 'src') && v.startsWith('javascript:'))) n.removeAttribute(a.name);
      });
    });
    return doc.body.firstChild.innerHTML;
  },
  strip(html) {
    if (!html) return '';
    return String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  },

  richEditor(name, html = '') {
    const tools = [
      ['bold', '<b>B</b>'], ['italic', '<i>I</i>'], ['underline', '<u>U</u>'],
      ['h3', 'H'], ['insertUnorderedList', '•'], ['insertOrderedList', '1.'],
      ['justifyRight', '⇥'], ['justifyCenter', '≡'], ['justifyLeft', '⇤'],
      ['table', '▦'], ['image', UI.icon('image')], ['removeFormat', '⌫']
    ];
    return `<div class="rich-wrap">
      <div class="rich-toolbar">${tools.map(([c, l]) => `<button type="button" class="rt-btn" data-cmd="${c}" title="${esc(t('rich.' + c))}">${l}</button>`).join('')}
        <label class="rt-btn rt-color" title="${esc(t('rich.color'))}"><input type="color" data-cmd="foreColor" value="#dc2626"><span>A</span></label>
      </div>
      <div class="rich" contenteditable="true" data-name="${name}">${UI.sanitize(html)}</div></div>`;
  },
  bindRich(root) {
    $$('.rich-wrap', root).forEach(w => {
      const ed = $('.rich', w);
      w.querySelectorAll('button.rt-btn').forEach(b => b.addEventListener('mousedown', e => e.preventDefault()));
      w.addEventListener('click', async e => {
        const b = e.target.closest('button.rt-btn'); if (!b) return;
        const cmd = b.dataset.cmd;
        ed.focus();
        if (cmd === 'h3') document.execCommand('formatBlock', false, 'h3');
        else if (cmd === 'table') {
          const rows = 3, cols = 3;
          const tbl = `<table class="rt-table"><tbody>${Array.from({ length: rows }, () => `<tr>${'<td>&nbsp;</td>'.repeat(cols)}</tr>`).join('')}</tbody></table><p><br></p>`;
          document.execCommand('insertHTML', false, tbl);
        } else if (cmd === 'image') {
          const sel = window.getSelection(); const range = sel.rangeCount ? sel.getRangeAt(0) : null;
          const f = await UI.pickFile('image/*'); if (!f) return;
          const url = await UI.blobToDataURL(f);
          ed.focus(); if (range) { sel.removeAllRanges(); sel.addRange(range); }
          document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%">`);
        } else document.execCommand(cmd, false, null);
      });
      const color = $('input[data-cmd=foreColor]', w);
      color.addEventListener('input', () => { ed.focus(); document.execCommand('foreColor', false, color.value); });
    });
  },

  /* ---------- print ---------- */
  printHeader() {
    const s = Settings.get().teacher;
    const l1 = s.header1 ? `<div class="ph-line">${esc(s.header1)}</div>` : '';
    const l2 = s.header2 ? `<div class="ph-line">${esc(s.header2)}</div>` : '';
    return `<div class="print-head">${l1}${l2}
      <table class="ph-table"><tr>
        <td>${s.school ? `<b>${esc(t('settings.school'))}:</b> ${esc(s.school)}` : ''}</td>
        <td>${s.year ? `<b>${esc(t('settings.year'))}:</b> ${esc(s.year)}` : ''}</td></tr>
        <tr><td>${s.name ? `<b>${esc(t('settings.teacherName'))}:</b> ${esc(s.name)}` : ''}</td>
        <td>${s.subject ? `<b>${esc(t('settings.subject'))}:</b> ${esc(s.subject)}` : ''}</td></tr></table></div>`;
  },
  async printHTML(title, html, { header = true, landscape = false } = {}) {
    const st = Settings.get();
    const font = Settings.fontStack();
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;inset-inline-end:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    const fontHref = $('#font-link')?.href || '';
    doc.open();
    doc.write(`<!doctype html><html lang="${I18n.lang}" dir="${I18n.dir}"><head><meta charset="utf-8"><title>${esc(title)}</title>
      ${fontHref && fontHref.startsWith('http') ? `<link rel="stylesheet" href="${fontHref}">` : ''}
      <style>
        @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 12mm; }
        * { box-sizing: border-box; }
        body { font-family: ${font}; font-size: ${Math.max(12, st.fontSize - 2)}px; color: #111; margin: 0; line-height: 1.6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        h1 { font-size: 1.5em; text-align: center; margin: 8px 0 14px; }
        h2 { font-size: 1.2em; margin: 14px 0 6px; border-bottom: 1px solid #999; padding-bottom: 3px; }
        h3 { font-size: 1.08em; margin: 10px 0 4px; }
        table { border-collapse: collapse; width: 100%; }
        .grid th, .grid td, .rt-table td, .rt-table th, .content table td, .content table th { border: 1px solid #555; padding: 4px 6px; text-align: start; vertical-align: top; }
        .grid th { background: #eee; }
        .grid td.c, .grid th.c { text-align: center; }
        .print-head { border-bottom: 2px solid #333; margin-bottom: 10px; padding-bottom: 6px; }
        .ph-line { text-align: center; font-weight: 700; }
        .ph-table td { padding: 2px 4px; width: 50%; }
        .meta td { padding: 3px 6px; border: 1px solid #bbb; }
        .meta td:first-child { width: 30%; background: #f3f3f3; font-weight: 600; }
        img { max-width: 100%; }
        .full-img { display: block; margin: 10px auto; max-height: 245mm; object-fit: contain; }
        .muted { color: #666; }
        .stats { display: flex; gap: 10px; flex-wrap: wrap; margin: 8px 0; }
        .stats div { border: 1px solid #aaa; padding: 4px 10px; border-radius: 4px; }
        .sign { display: flex; justify-content: space-between; margin-top: 40px; }
        .profile { display: flex; gap: 16px; align-items: flex-start; }
        .profile img { width: 110px; height: 130px; object-fit: cover; border: 1px solid #999; }
        .page-break { page-break-after: always; }
        .low { color: #b91c1c; font-weight: 600; }
        tr { page-break-inside: avoid; }
      </style></head><body>${header ? UI.printHeader() : ''}${html}</body></html>`);
    doc.close();
    await Promise.all([...doc.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    try { await Promise.race([doc.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* ignore */ }
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 2000);
  },
  printFile(file) {
    if (!file) return;
    if (UI.isImage(file)) return UI.printHTML(file.name, `<img class="full-img" src="${UI.url(file.blob)}">`, { header: false });
    if (UI.isPdf(file)) {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;inset-inline-end:0;bottom:0;width:1px;height:1px;border:0;opacity:0;';
      iframe.src = UI.url(file.blob);
      iframe.onload = () => {
        try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
        catch (e) { window.open(iframe.src, '_blank'); }
        setTimeout(() => iframe.remove(), 60000);
      };
      document.body.appendChild(iframe);
      return;
    }
    UI.toast(t('msg.cannotPrintType'), 'error');
    UI.download(file.blob, file.name);
  },
  filePreview(file, { big = true } = {}) {
    if (!file) return `<div class="file-empty muted">${t('common.noFile')}</div>`;
    const url = UI.url(file.blob);
    if (UI.isImage(file)) return `<div class="file-preview"><img src="${url}" alt="${esc(file.name)}"></div>`;
    if (UI.isPdf(file)) return `<div class="file-preview pdf"><iframe src="${url}" title="${esc(file.name)}" style="height:${big ? '70vh' : '320px'}"></iframe></div>`;
    if (/^text\//.test(file.type)) return `<div class="file-preview"><iframe src="${url}" title="${esc(file.name)}"></iframe></div>`;
    return `<div class="file-generic">${UI.icon('file', 'ic-xl')}<div><b>${esc(file.name)}</b><div class="muted">${UI.fmtSize(file.size)}</div></div></div>`;
  }
};

// Close modals with Escape; close dropdowns when clicking outside
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && UI._modals.length) { UI._modals[UI._modals.length - 1].close(); }
});
document.addEventListener('click', e => {
  $$('details.dropdown[open]').forEach(d => { if (!d.contains(e.target) || e.target.closest('.dd-menu button')) d.removeAttribute('open'); });
});
