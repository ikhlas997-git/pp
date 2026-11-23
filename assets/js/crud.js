/* Generic CRUD pages: list (cards/table), form, preview, print, delete */
const Crud = {
  state: {},

  async loadCtx(cfg) {
    const classes = (await DB.all('classes')).sort(Schemas.classes.sort);
    const ctx = { classes, cmap: Object.fromEntries(classes.map(c => [c.id, c])) };
    if (cfg && cfg.extraCtx) Object.assign(ctx, await cfg.extraCtx());
    return ctx;
  },

  display(f, v, ctx) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) return '';
    switch (f.type) {
      case 'select': return esc(t(f.optPrefix + v));
      case 'class': return esc(ctx.cmap[v]?.name || '');
      case 'date': return esc(UI.fmtDate(v));
      case 'tags': return v.map(x => `<span class="chip">#${esc(x)}</span>`).join(' ');
      case 'file': return esc(v.name);
      case 'textarea': return esc(v).replace(/\n/g, '<br>');
      case 'rich': return UI.sanitize(v);
      default: return esc(v);
    }
  },

  fieldValueText(f, v, ctx) {
    if (f.type === 'rich') return UI.strip(v);
    if (f.type === 'tags') return (v || []).join(' ');
    if (f.type === 'file') return v?.name || '';
    if (f.type === 'select') return v ? t(f.optPrefix + v) : '';
    if (f.type === 'class') return ctx.cmap[v]?.name || '';
    return v == null ? '' : String(v);
  },

  /* ------------------------------ list page ------------------------------ */
  async page(cfg, el, params = {}) {
    const st = this.state[cfg.store] ||= { q: '', filters: {}, view: cfg.view || 'cards' };
    let ctx = await this.loadCtx(cfg);
    let records = [];
    const filterFields = cfg.fields.filter(f => f.filter);

    el.innerHTML = `
      <div class="page-head">
        <div><h1>${UI.icon(cfg.icon)} ${t(cfg.title)}</h1>${cfg.desc ? `<p class="muted">${t(cfg.desc)}</p>` : ''}</div>
        <div class="actions">
          ${(cfg.toolbar || []).map((b, i) => `<button class="btn ${b.cls || ''}" data-tb="${i}">${UI.icon(b.icon)}<span>${t(b.label)}</span></button>`).join('')}
          <button class="btn ${cfg.toolbar ? '' : 'primary'}" data-act="add">${UI.icon(cfg.store === 'drawings' ? 'upload' : 'plus')}<span>${cfg.store === 'drawings' ? t('draw.upload') : t('common.add')}</span></button>
        </div>
      </div>
      <div class="toolbar">
        <div class="search-box">${UI.icon('search')}<input type="search" class="input" data-q placeholder="${t('common.searchIn')} ${t(cfg.title)}..." value="${esc(st.q)}"></div>
        <div class="filters"></div>
        ${cfg.view === 'table' ? '' : `<div class="seg view-toggle"><button data-view="cards" class="${st.view === 'cards' ? 'active' : ''}" title="${t('common.cards')}">${UI.icon('grid')}</button><button data-view="list" class="${st.view === 'list' ? 'active' : ''}" title="${t('common.list')}">${UI.icon('list')}</button></div>`}
        <span class="count muted"></span>
      </div>
      <div class="list-area"></div>`;

    const listEl = $('.list-area', el);
    const renderFilters = () => {
      $('.filters', el).innerHTML = filterFields.map(f => {
        let opts;
        if (f.type === 'select') opts = f.options.map(o => [o, t(f.optPrefix + o)]);
        else if (f.type === 'class') opts = ctx.classes.map(c => [c.id, c.name]);
        else opts = [...new Set(records.map(r => r[f.key]).filter(Boolean))].sort().map(v => [v, v]);
        const cur = st.filters[f.key] || '';
        return `<select class="input" data-filter="${f.key}"><option value="">${t(f.label)}: ${t('common.all')}</option>${opts.map(([v, l]) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      }).join('');
    };

    const filtered = () => {
      const q = Search.norm(st.q);
      return records.filter(r => {
        for (const [k, v] of Object.entries(st.filters)) if (v && String(r[k] ?? '') !== v) return false;
        if (!q) return true;
        const hay = Search.norm(cfg.fields.map(f => this.fieldValueText(f, r[f.key], ctx)).join(' '));
        return q.split(' ').every(w => hay.includes(w));
      });
    };

    const thumbHtml = r => {
      const f = cfg.thumb ? r[cfg.thumb] : r.file;
      if (f && UI.isImage(f)) return `<div class="card-thumb"><img loading="lazy" src="${UI.url(f.blob)}" alt=""></div>`;
      const ic = f ? (UI.isPdf(f) ? 'fileText' : 'file') : cfg.icon;
      return `<div class="card-thumb icon-thumb">${UI.icon(ic, 'ic-xl')}${f && UI.isPdf(f) ? '<span class="pdf-tag">PDF</span>' : ''}</div>`;
    };
    const badge = b => typeof b === 'string' ? `<span class="badge">${esc(b)}</span>` : `<span class="badge ${b.cls || ''}">${esc(b.text)}</span>`;
    const actionsHtml = r => `
      <button class="icon-btn" data-act="preview" data-id="${r.id}" title="${t('common.preview')}">${UI.icon('eye')}</button>
      <button class="icon-btn" data-act="edit" data-id="${r.id}" title="${t('common.edit')}">${UI.icon('edit')}</button>
      ${(cfg.recordActions || []).map((a, i) => `<button class="icon-btn" data-ra="${i}" data-id="${r.id}" title="${t(a.label)}">${UI.icon(a.icon)}</button>`).join('')}
      <button class="icon-btn" data-act="print" data-id="${r.id}" title="${t('common.print')}">${UI.icon('printer')}</button>
      <button class="icon-btn danger" data-act="delete" data-id="${r.id}" title="${t('common.delete')}">${UI.icon('trash')}</button>`;

    const renderList = () => {
      const rows = filtered();
      $('.count', el).textContent = `${rows.length} / ${records.length}`;
      if (!records.length) {
        listEl.innerHTML = `<div class="empty">${UI.icon(cfg.icon, 'ic-xxl')}<h3>${t('common.empty')}</h3><p class="muted">${t('common.emptyHint')}</p><button class="btn primary" data-act="add">${UI.icon('plus')}<span>${t('common.add')}</span></button></div>`;
        return;
      }
      if (!rows.length) { listEl.innerHTML = `<div class="empty small">${UI.icon('search', 'ic-xl')}<p class="muted">${t('common.noResults')}</p></div>`; return; }
      if (cfg.view === 'table') {
        listEl.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>#</th>${cfg.columns.map(c => `<th>${t(c.label)}</th>`).join('')}<th class="actions-col">${t('common.actions')}</th></tr></thead>
          <tbody>${rows.map((r, i) => `<tr data-row="${r.id}"><td class="muted">${i + 1}</td>${cfg.columns.map(c => `<td>${c.value(r, ctx)}</td>`).join('')}<td class="row-actions">${actionsHtml(r)}</td></tr>`).join('')}</tbody></table></div>`;
      } else if (st.view === 'list') {
        listEl.innerHTML = `<div class="rows">${rows.map(r => {
          const c = cfg.card(r, ctx);
          return `<div class="row-item" data-row="${r.id}">${thumbHtml(r)}<div class="ri-body"><div class="ri-title">${esc(c.title)}</div><div class="muted small">${esc(c.subtitle || '')}</div></div>
            <div class="badges">${(c.badges || []).map(badge).join('')}</div><div class="row-actions">${actionsHtml(r)}</div></div>`;
        }).join('')}</div>`;
      } else {
        listEl.innerHTML = `<div class="cards">${rows.map(r => {
          const c = cfg.card(r, ctx);
          return `<article class="item-card" data-row="${r.id}">${thumbHtml(r)}
            <div class="ic-body"><h3 class="ic-title">${esc(c.title)}</h3><div class="muted small">${esc(c.subtitle || '')}</div>
            ${c.excerpt ? `<p class="excerpt small">${esc(c.excerpt)}</p>` : ''}
            <div class="badges">${(c.badges || []).map(badge).join('')}</div></div>
            <div class="ic-actions">${actionsHtml(r)}</div></article>`;
        }).join('')}</div>`;
      }
    };

    const reload = async () => {
      ctx = await this.loadCtx(cfg);
      records = (await DB.all(cfg.store)).sort(cfg.sort || ((a, b) => b.updatedAt - a.updatedAt));
      renderFilters();
      renderList();
    };
    ctx.reload = reload;
    await reload();

    const find = id => records.find(r => r.id === id);
    const add = async () => { if (await this.form(cfg, null, ctx)) reload(); };

    el.addEventListener('input', e => {
      if (e.target.matches('[data-q]')) { st.q = e.target.value; renderList(); }
    });
    el.addEventListener('change', e => {
      if (e.target.matches('[data-filter]')) { st.filters[e.target.dataset.filter] = e.target.value; renderList(); }
    });
    el.addEventListener('click', async e => {
      const vt = e.target.closest('[data-view]');
      if (vt) { st.view = vt.dataset.view; $$('[data-view]', el).forEach(b => b.classList.toggle('active', b === vt)); renderList(); return; }
      const tb = e.target.closest('[data-tb]');
      if (tb) { cfg.toolbar[+tb.dataset.tb].onClick({ ...ctx, reload }); return; }
      const ra = e.target.closest('[data-ra]');
      if (ra) { cfg.recordActions[+ra.dataset.ra].onClick(find(ra.dataset.id), { ...ctx, reload }); return; }
      const btn = e.target.closest('[data-act]');
      if (btn) {
        const r = find(btn.dataset.id);
        switch (btn.dataset.act) {
          case 'add': return add();
          case 'preview': return this.preview(cfg, r, ctx, reload);
          case 'edit': if (await this.form(cfg, r, ctx)) reload(); return;
          case 'print': return this.print(cfg, r, ctx);
          case 'delete': if (await this.remove(cfg, r)) reload(); return;
        }
      }
      const row = e.target.closest('[data-row]');
      if (row && !e.target.closest('button, a, input')) this.preview(cfg, find(row.dataset.row), ctx, reload);
    });

    if (params.query?.open) {
      const r = find(params.query.open);
      if (r) this.preview(cfg, r, ctx, reload);
    }
    if (params.query?.new) add();
  },

  /* ------------------------------ form ------------------------------ */
  fieldInput(f, v, ctx) {
    const req = f.required ? 'required' : '';
    const ph = f.placeholder ? `placeholder="${esc(t(f.placeholder))}"` : '';
    const label = `<span>${t(f.label)}${f.required ? ' <i class="req">*</i>' : ''}</span>`;
    let input;
    switch (f.type) {
      case 'textarea':
        input = `<textarea class="input" name="${f.key}" rows="3" ${req} ${ph}>${esc(v)}</textarea>`; break;
      case 'select':
        input = `<select class="input" name="${f.key}" ${req}><option value="">—</option>${f.options.map(o => `<option value="${o}" ${String(v) === o ? 'selected' : ''}>${esc(t(f.optPrefix + o))}</option>`).join('')}</select>`; break;
      case 'class':
        input = `<div class="inline-field"><select class="input" name="${f.key}" ${req}><option value="">—</option>${ctx.classes.map(c => `<option value="${c.id}" ${v === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
          <button type="button" class="btn sm" data-new-class title="${t('classes.new')}">${UI.icon('plus')}</button></div>`; break;
      case 'tags':
        input = `<input class="input" name="${f.key}" value="${esc((v || []).join(', '))}" ${ph}>`; break;
      case 'rich':
        return `<div class="field full"><span>${t(f.label)}${f.secret ? ` <small class="muted">(${t('common.notPrintedByDefault')})</small>` : ''}</span>${UI.richEditor(f.key, v || '')}</div>`;
      case 'file':
        return `<div class="field full"><span>${t(f.label)}${f.required ? ' <i class="req">*</i>' : ''}</span>
          <label class="dropzone" data-drop="${f.key}">
            <input type="file" name="${f.key}" accept="${f.accept || ''}" hidden>
            <div class="dz-preview">${v ? this.miniFile(v) : `${UI.icon('upload', 'ic-lg')}<span>${t('common.dropFile')}</span>`}</div>
          </label>
          ${v ? `<label class="check"><input type="checkbox" name="__remove_${f.key}"> ${t('common.removeFile')}</label>` : ''}</div>`;
      default:
        input = `<input class="input" type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : (f.inputType || 'text')}" ${f.type === 'number' ? 'step="any"' : ''} name="${f.key}" value="${esc(v)}" ${req} ${ph}>`;
    }
    return `<label class="field ${f.full ? 'full' : ''}">${label}${input}</label>`;
  },

  miniFile(file) {
    if (UI.isImage(file)) return `<img src="${UI.url(file.blob)}" alt=""><span>${esc(file.name)}</span>`;
    return `${UI.icon(UI.isPdf(file) ? 'fileText' : 'file', 'ic-lg')}<span>${esc(file.name)} <small class="muted">${UI.fmtSize(file.size)}</small></span>`;
  },

  form(cfg, record, ctx, preset = {}) {
    return new Promise(async resolve => {
      ctx = ctx || await this.loadCtx(cfg);
      const isNew = !record;
      const r = record ? { ...record } : { ...preset };
      if (isNew) cfg.fields.forEach(f => { if (r[f.key] == null && f.default) r[f.key] = f.default(); });
      const pendingFiles = {};
      const hasRich = cfg.fields.some(f => f.type === 'rich');
      const form = document.createElement('form');
      form.className = 'form-grid';
      form.noValidate = true;
      form.innerHTML = cfg.fields.map(f => this.fieldInput(f, r[f.key], ctx)).join('');
      UI.bindRich(form);

      // file inputs & drag-drop
      $$('[data-drop]', form).forEach(dz => {
        const key = dz.dataset.drop;
        const inp = $('input[type=file]', dz);
        const setFile = file => {
          pendingFiles[key] = file;
          $('.dz-preview', dz).innerHTML = this.miniFile(UI.fileFrom(file));
          if (cfg.fields.find(f => f.key === key)?.type === 'file') {
            const title = $('[name=title]', form);
            if (title && !title.value) title.value = file.name.replace(/\.[^.]+$/, '');
          }
        };
        inp.addEventListener('change', () => inp.files[0] && setFile(inp.files[0]));
        dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('over'));
        dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); const f = e.dataTransfer.files[0]; f && setFile(f); });
      });
      form.addEventListener('click', async e => {
        if (!e.target.closest('[data-new-class]')) return;
        const name = await UI.prompt(t('classes.new'));
        if (!name || !name.trim()) return;
        const c = await DB.put('classes', { name: name.trim(), year: Settings.get().teacher.year, subject: Settings.get().teacher.subject });
        ctx.classes.push(c); ctx.cmap[c.id] = c;
        $$('select[name=classId]', form).forEach(s => { s.insertAdjacentHTML('beforeend', `<option value="${c.id}">${esc(c.name)}</option>`); s.value = c.id; });
      });

      UI.modal({
        title: `${isNew ? t('common.add') : t('common.edit')} — ${t(cfg.singular)}`,
        size: hasRich ? 'xl' : 'lg',
        body: form,
        onClose: res => resolve(res || null),
        buttons: [
          { label: t('common.cancel') },
          {
            label: t('common.save'), cls: 'primary', icon: 'check', onClick: async () => {
              const out = { ...r };
              let missing = null;
              for (const f of cfg.fields) {
                if (f.type === 'rich') { out[f.key] = UI.sanitize($(`.rich[data-name="${f.key}"]`, form).innerHTML); continue; }
                if (f.type === 'file') {
                  if (pendingFiles[f.key]) out[f.key] = UI.fileFrom(pendingFiles[f.key]);
                  else if (form.elements['__remove_' + f.key]?.checked) out[f.key] = null;
                  if (f.required && !out[f.key]) missing = missing || f;
                  continue;
                }
                const el = form.elements[f.key];
                let v = el.value.trim();
                if (f.type === 'tags') v = v.split(/[,،]/).map(x => x.trim()).filter(Boolean);
                else if (f.type === 'number') v = v === '' ? null : Number(v);
                out[f.key] = v;
                el.classList.toggle('invalid', f.required && !v);
                if (f.required && (v === '' || v == null)) missing = missing || f;
              }
              if (missing) { UI.toast(`${t('msg.required')}: ${t(missing.label)}`, 'error'); return false; }
              const saved = await DB.put(cfg.store, out);
              UI.toast(t('msg.saved'));
              return saved;
            }
          }
        ]
      });
    });
  },

  /* ------------------------------ preview ------------------------------ */
  detailsHtml(cfg, r, ctx, { withSecret = true, forPrint = false } = {}) {
    const meta = cfg.fields.filter(f => !['rich', 'file', 'textarea'].includes(f.type) && f.key !== 'title' && r[f.key] != null && r[f.key] !== '' && !(Array.isArray(r[f.key]) && !r[f.key].length));
    const longs = cfg.fields.filter(f => (f.type === 'textarea' || f.type === 'rich') && r[f.key] && (UI.strip(r[f.key]) || /<img|<table/i.test(r[f.key])) && (withSecret || !f.secret));
    const metaHtml = meta.length ? `<table class="meta">${meta.map(f => `<tr><td>${t(f.label)}</td><td>${this.display(f, r[f.key], ctx)}</td></tr>`).join('')}</table>` : '';
    const longHtml = longs.map(f => `<section class="${forPrint ? '' : 'pv-section'}"><h2>${t(f.label)}</h2><div class="content">${this.display(f, r[f.key], ctx)}</div></section>`).join('');
    return { metaHtml, longHtml };
  },

  preview(cfg, r, ctx, reload) {
    if (!r) return;
    const { metaHtml, longHtml } = this.detailsHtml(cfg, r, ctx);
    const fileField = cfg.fields.find(f => f.type === 'file' && r[f.key]);
    const file = fileField && r[fileField.key];
    const hasSecret = cfg.fields.some(f => f.secret && UI.strip(r[f.key]));
    const body = `<div class="preview">
      ${metaHtml ? `<div class="pv-meta">${metaHtml}</div>` : ''}
      ${longHtml}
      ${file ? `<section class="pv-section"><h2>${t(fileField.label)} <small class="muted">${esc(file.name)} · ${UI.fmtSize(file.size)}</small></h2>${UI.filePreview(file)}</section>` : ''}
    </div>`;
    const buttons = [
      { label: t('common.delete'), cls: 'danger ghost', icon: 'trash', onClick: async () => { if (await this.remove(cfg, r)) { reload && reload(); return true; } return false; } },
      { label: t('common.edit'), icon: 'edit', onClick: async (close) => { close(); if (await this.form(cfg, r, ctx)) reload && reload(); } }
    ];
    if (file) {
      buttons.push({ label: t('common.download'), icon: 'download', onClick: () => { UI.download(file.blob, file.name); return false; } });
      buttons.push({ label: t('common.printFile'), icon: 'printer', onClick: () => { UI.printFile(file); return false; } });
    }
    if (hasSecret) buttons.push({ label: t('common.printWithSolution'), icon: 'printer', onClick: () => { this.print(cfg, r, ctx, true); return false; } });
    buttons.push({ label: t('common.print'), cls: 'primary', icon: 'printer', onClick: () => { this.print(cfg, r, ctx); return false; } });
    UI.modal({ title: r.title || r.name || t(cfg.singular), size: 'xl', body, buttons });
  },

  print(cfg, r, ctx, withSecret = false) {
    const { metaHtml, longHtml } = this.detailsHtml(cfg, r, ctx, { withSecret, forPrint: true });
    const fileField = cfg.fields.find(f => f.type === 'file' && r[f.key]);
    const file = fileField && r[fileField.key];
    const img = file && UI.isImage(file) ? `<img class="full-img" src="${UI.url(file.blob)}">` : '';
    const note = file && !UI.isImage(file) ? `<p class="muted">${t(fileField.label)}: ${esc(file.name)}</p>` : '';
    UI.printHTML(r.title || r.name, `<h1>${esc(r.title || r.name || '')}</h1>${metaHtml}${longHtml}${img}${note}`);
  },

  async remove(cfg, r) {
    if (!r) return false;
    let extra = '', classStudents = [];
    if (cfg.store === 'classes') {
      classStudents = (await DB.all('students')).filter(s => s.classId === r.id);
      if (classStudents.length) extra = ' ' + t('msg.classDeleteStudents', { n: classStudents.length });
    }
    if (!await UI.confirm(`${t('msg.confirmDelete')} "${r.title || r.name || [r.lastName, r.firstName].join(' ')}"?${extra}`)) return false;
    await DB.delete(cfg.store, r.id);
    if (classStudents.length) {
      const ids = new Set(classStudents.map(s => s.id));
      await DB.bulkDelete('students', [...ids]);
      const g = (await DB.all('grades')).filter(x => ids.has(x.studentId)).map(x => x.id);
      if (g.length) await DB.bulkDelete('grades', g);
    }
    if (cfg.store === 'students') {
      const g = (await DB.all('grades')).filter(x => x.studentId === r.id).map(x => x.id);
      if (g.length) await DB.bulkDelete('grades', g);
    }
    UI.toast(t('msg.deleted'));
    return true;
  }
};
