/* Students: list, profile, import / export, printing */
const Students = (() => {
  const cfg = Schemas.students;
  const st = { classId: '', q: '', sort: 'number', dir: 1, selected: new Set() };

  const fullName = s => [s.lastName, s.firstName].filter(Boolean).join(' ');
  const initials = s => ((s.lastName || '')[0] || '') + ((s.firstName || '')[0] || '');
  const avatar = (s, cls = '') => s.photo && UI.isImage(s.photo)
    ? `<img class="avatar ${cls}" src="${UI.url(s.photo.blob)}" alt="">`
    : `<span class="avatar ${cls} ${s.gender === 'f' ? 'f' : ''}">${esc(initials(s))}</span>`;
  const age = d => {
    if (!d) return '';
    const b = new Date(d); if (isNaN(b)) return '';
    const n = new Date(); let a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
    return a;
  };
  const cmpNum = (a, b) => String(a || '').localeCompare(String(b || ''), undefined, { numeric: true });
  const sorters = {
    number: (a, b) => cmpNum(a.number, b.number) || fullName(a).localeCompare(fullName(b)),
    name: (a, b) => fullName(a).localeCompare(fullName(b)),
    gender: (a, b) => (a.gender || '').localeCompare(b.gender || ''),
    birthDate: (a, b) => (a.birthDate || '').localeCompare(b.birthDate || ''),
    class: (a, b, ctx) => (ctx.cmap[a.classId]?.name || '').localeCompare(ctx.cmap[b.classId]?.name || '', undefined, { numeric: true })
  };
  const sortStudents = (list, ctx, key = 'number', dir = 1) =>
    list.sort((a, b) => dir * (sorters[key](a, b, ctx) || sorters.number(a, b)));

  /* ------------------------------ list ------------------------------ */
  async function render(el, params) {
    if (params.id) return profile(el, params.id);
    if (params.query?.class !== undefined) st.classId = params.query.class;
    let ctx = await Crud.loadCtx();
    if (st.classId && !ctx.cmap[st.classId]) st.classId = '';
    let all = [];

    el.innerHTML = `
      <div class="page-head">
        <div><h1>${UI.icon('users')} ${t('nav.students')}</h1><p class="muted">${t('students.desc')}</p></div>
        <div class="actions">
          <button class="btn" data-act="import">${UI.icon('upload')}<span>${t('common.import')}</span></button>
          <details class="dropdown"><summary class="btn">${UI.icon('download')}<span>${t('common.export')}</span>${UI.icon('chevronDown')}</summary>
            <div class="dd-menu">
              <button data-exp="xlsx">Excel (.xlsx)</button><button data-exp="csv">CSV</button><button data-exp="json">JSON</button>
              <hr><button data-exp="template">${t('students.template')}</button>
            </div></details>
          <button class="btn" data-act="print">${UI.icon('printer')}<span>${t('common.print')}</span></button>
          <button class="btn primary" data-act="add">${UI.icon('plus')}<span>${t('common.add')}</span></button>
        </div>
      </div>
      <div class="toolbar">
        <select class="input" data-class><option value="">${t('f.class')}: ${t('common.all')}</option>${ctx.classes.map(c => `<option value="${c.id}" ${st.classId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <div class="search-box">${UI.icon('search')}<input type="search" class="input" data-q placeholder="${t('students.searchPh')}" value="${esc(st.q)}"></div>
        <button class="btn danger ghost sel-only" data-act="bulk-delete" hidden>${UI.icon('trash')}<span>${t('common.deleteSelected')} (<b class="sel-n">0</b>)</span></button>
        <button class="btn ghost sel-only" data-act="bulk-move" hidden>${UI.icon('layers')}<span>${t('students.move')}</span></button>
        <span class="count muted"></span>
      </div>
      <div class="stats-row" id="st-stats"></div>
      <div class="list-area"></div>`;

    const listEl = $('.list-area', el);
    const filtered = () => {
      const q = Search.norm(st.q);
      const rows = all.filter(s => (!st.classId || s.classId === st.classId) &&
        (!q || q.split(' ').every(w => Search.norm([fullName(s), s.firstName + ' ' + s.lastName, s.number, s.phone, s.guardian, s.birthPlace].join(' ')).includes(w))));
      return sortStudents(rows, ctx, st.sort, st.dir);
    };
    const updateSel = () => {
      const n = st.selected.size;
      $$('.sel-only', el).forEach(b => { b.hidden = !n; });
      $('.sel-n', el).textContent = n;
    };
    const renderStats = rows => {
      const m = rows.filter(s => s.gender === 'm').length, f = rows.filter(s => s.gender === 'f').length;
      const rep = rows.filter(s => s.status === 'repeat').length;
      $('#st-stats', el).innerHTML = rows.length ? `
        <span class="pill">${t('common.total')}: <b>${rows.length}</b></span>
        <span class="pill">${t('gender.m')}: <b>${m}</b></span><span class="pill">${t('gender.f')}: <b>${f}</b></span>
        <span class="pill">${t('status.repeat')}: <b>${rep}</b></span>` : '';
    };
    const th = (key, label) => `<th class="sortable ${st.sort === key ? 'sorted' : ''}" data-sort="${key}">${t(label)} ${st.sort === key ? (st.dir > 0 ? '▲' : '▼') : ''}</th>`;
    const renderList = () => {
      const rows = filtered();
      $('.count', el).textContent = `${rows.length} / ${all.length}`;
      renderStats(rows);
      if (!all.length) {
        listEl.innerHTML = `<div class="empty">${UI.icon('users', 'ic-xxl')}<h3>${t('students.empty')}</h3><p class="muted">${t('students.emptyHint')}</p>
          <div class="btn-row center"><button class="btn primary" data-act="add">${UI.icon('plus')}<span>${t('common.add')}</span></button><button class="btn" data-act="import">${UI.icon('upload')}<span>${t('common.import')}</span></button></div></div>`;
        return;
      }
      if (!rows.length) { listEl.innerHTML = `<div class="empty small">${UI.icon('search', 'ic-xl')}<p class="muted">${t('common.noResults')}</p></div>`; return; }
      const allSel = rows.every(r => st.selected.has(r.id));
      listEl.innerHTML = `<div class="table-wrap"><table class="table students-table"><thead><tr>
        <th class="chk"><input type="checkbox" data-selall ${allSel ? 'checked' : ''}></th><th>#</th>
        ${th('number', 'f.studentNumber')}${th('name', 'f.fullName')}${th('gender', 'f.gender')}${th('birthDate', 'f.birthDate')}${th('class', 'f.class')}
        <th>${t('f.phone')}</th><th class="actions-col">${t('common.actions')}</th></tr></thead><tbody>
        ${rows.map((s, i) => `<tr data-row="${s.id}" class="${st.selected.has(s.id) ? 'selected' : ''}">
          <td class="chk"><input type="checkbox" data-sel="${s.id}" ${st.selected.has(s.id) ? 'checked' : ''}></td>
          <td class="muted">${i + 1}</td><td>${esc(s.number)}</td>
          <td><div class="name-cell">${avatar(s, 'sm')}<div><b>${esc(fullName(s))}</b>${s.status === 'repeat' ? ` <span class="badge warning">${t('status.repeat')}</span>` : ''}</div></div></td>
          <td>${s.gender ? t('gender.' + s.gender) : ''}</td>
          <td>${UI.fmtDate(s.birthDate)} ${s.birthDate ? `<small class="muted">(${age(s.birthDate)})</small>` : ''}</td>
          <td>${esc(ctx.cmap[s.classId]?.name || '')}</td>
          <td dir="ltr" class="ltr-cell">${esc(s.phone)}</td>
          <td class="row-actions">
            <a class="icon-btn" href="#/students/${s.id}" title="${t('students.profile')}">${UI.icon('user')}</a>
            <button class="icon-btn" data-act="edit" data-id="${s.id}" title="${t('common.edit')}">${UI.icon('edit')}</button>
            <button class="icon-btn danger" data-act="delete" data-id="${s.id}" title="${t('common.delete')}">${UI.icon('trash')}</button>
          </td></tr>`).join('')}
        </tbody></table></div>`;
    };
    const reload = async () => {
      ctx = await Crud.loadCtx();
      all = await DB.all('students');
      const ids = new Set(all.map(s => s.id));
      [...st.selected].forEach(id => !ids.has(id) && st.selected.delete(id));
      renderList(); updateSel();
    };
    await reload();
    const find = id => all.find(s => s.id === id);

    el.addEventListener('input', e => { if (e.target.matches('[data-q]')) { st.q = e.target.value; renderList(); } });
    el.addEventListener('change', e => {
      if (e.target.matches('[data-class]')) { st.classId = e.target.value; history.replaceState(null, '', st.classId ? `#/students?class=${st.classId}` : '#/students'); renderList(); }
      if (e.target.matches('[data-sel]')) { e.target.checked ? st.selected.add(e.target.dataset.sel) : st.selected.delete(e.target.dataset.sel); e.target.closest('tr').classList.toggle('selected', e.target.checked); updateSel(); }
      if (e.target.matches('[data-selall]')) { filtered().forEach(s => e.target.checked ? st.selected.add(s.id) : st.selected.delete(s.id)); renderList(); updateSel(); }
    });
    el.addEventListener('click', async e => {
      const sortEl = e.target.closest('[data-sort]');
      if (sortEl) { const k = sortEl.dataset.sort; st.dir = st.sort === k ? -st.dir : 1; st.sort = k; renderList(); return; }
      const exp = e.target.closest('[data-exp]');
      if (exp) return exportStudents(exp.dataset.exp, filtered(), ctx);
      const b = e.target.closest('[data-act]');
      if (b) {
        switch (b.dataset.act) {
          case 'add': if (await Crud.form(cfg, null, ctx, { classId: st.classId })) reload(); return;
          case 'edit': if (await Crud.form(cfg, find(b.dataset.id), ctx)) reload(); return;
          case 'delete': if (await Crud.remove(cfg, find(b.dataset.id))) reload(); return;
          case 'import': return importStudents(ctx, st.classId, reload);
          case 'print': return printOptions(filtered(), ctx, st.classId);
          case 'bulk-delete': {
            const ids = [...st.selected];
            if (!await UI.confirm(t('students.bulkDeleteConfirm', { n: ids.length }))) return;
            await DB.bulkDelete('students', ids);
            const set = new Set(ids);
            const g = (await DB.all('grades')).filter(x => set.has(x.studentId)).map(x => x.id);
            if (g.length) await DB.bulkDelete('grades', g);
            st.selected.clear(); UI.toast(t('msg.deleted')); return reload();
          }
          case 'bulk-move': {
            const m = UI.modal({
              title: t('students.move'), size: 'sm',
              body: `<label class="field"><span>${t('f.class')}</span><select class="input" id="mv-class">${ctx.classes.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>`,
              buttons: [{ label: t('common.cancel') }, {
                label: t('common.save'), cls: 'primary', onClick: async (c, w) => {
                  const cid = $('#mv-class', w).value; if (!cid) return false;
                  await DB.bulkPut('students', [...st.selected].map(id => ({ ...find(id), classId: cid })));
                  st.selected.clear(); UI.toast(t('msg.saved')); reload();
                }
              }]
            });
            return m;
          }
        }
      }
      const row = e.target.closest('tr[data-row]');
      if (row && !e.target.closest('button, a, input')) location.hash = `#/students/${row.dataset.row}`;
    });
    if (params.query?.new) { if (await Crud.form(cfg, null, ctx, { classId: st.classId })) reload(); }
  }

  /* ------------------------------ profile ------------------------------ */
  async function profile(el, id) {
    const s = await DB.get('students', id);
    const ctx = await Crud.loadCtx();
    if (!s) { el.innerHTML = `<div class="empty">${UI.icon('alert', 'ic-xxl')}<h3>${t('common.notFound')}</h3><a class="btn" href="#/students">${t('common.back')}</a></div>`; return; }
    const cls = ctx.cmap[s.classId];
    const summary = await Grades.studentSummary(s);
    const g = Settings.get().grades;
    const info = cfg.fields.filter(f => !['file', 'textarea'].includes(f.type) && s[f.key]);

    const gradesTable = () => `<div class="table-wrap"><table class="table grades-mini"><thead><tr><th>${t('f.term')}</th><th>${t('grades.eval')}</th><th>${t('grades.a1')}</th>${g.assignments > 1 ? `<th>${t('grades.a2')}</th>` : ''}<th>${t('grades.exam')}</th><th>${t('grades.avg')}</th><th>${t('grades.rank')}</th><th>${t('grades.appreciation')}</th></tr></thead><tbody>
      ${summary.terms.map(x => `<tr><td><b>${t('term.' + x.term)}</b></td><td>${UI.fmtNum(x.g?.eval, 2)}</td><td>${UI.fmtNum(x.g?.a1, 2)}</td>${g.assignments > 1 ? `<td>${UI.fmtNum(x.g?.a2, 2)}</td>` : ''}<td>${UI.fmtNum(x.g?.exam, 2)}</td>
        <td class="${x.avg != null && x.avg < g.pass ? 'low' : ''}"><b>${UI.fmtNum(x.avg, g.decimals)}</b></td><td>${x.rank ? `${x.rank} / ${x.of}` : '—'}</td><td>${x.avg != null ? Grades.appreciation(x.avg) : ''}</td></tr>`).join('')}
      <tr class="total-row"><td><b>${t('grades.annual')}</b></td><td colspan="${g.assignments > 1 ? 4 : 3}"></td><td class="${summary.annual != null && summary.annual < g.pass ? 'low' : ''}"><b>${UI.fmtNum(summary.annual, g.decimals)}</b></td><td>${summary.annualRank ? `${summary.annualRank} / ${summary.of}` : '—'}</td><td>${summary.annual != null ? Grades.appreciation(summary.annual) : ''}</td></tr>
      </tbody></table></div>`;

    el.innerHTML = `
      <div class="page-head">
        <div class="head-with-back"><a class="icon-btn" href="#/students${s.classId ? '?class=' + s.classId : ''}" title="${t('common.back')}">${UI.icon('back', 'flip')}</a>
          <div><h1>${esc(fullName(s))}</h1><p class="muted">${t('students.profile')} · ${esc(cls?.name || '')}</p></div></div>
        <div class="actions">
          <a class="btn" href="#/grades?class=${s.classId}">${UI.icon('chart')}<span>${t('nav.grades')}</span></a>
          <button class="btn" data-act="print">${UI.icon('printer')}<span>${t('common.print')}</span></button>
          <button class="btn" data-act="edit">${UI.icon('edit')}<span>${t('common.edit')}</span></button>
          <button class="btn danger ghost" data-act="delete">${UI.icon('trash')}<span>${t('common.delete')}</span></button>
        </div>
      </div>
      <div class="profile-grid">
        <section class="card profile-card">
          ${avatar(s, 'xl')}
          <h2>${esc(fullName(s))}</h2>
          <div class="muted">${esc(s.number ? `${t('f.studentNumber')}: ${s.number}` : '')}</div>
          <div class="badges center">${s.gender ? `<span class="badge">${t('gender.' + s.gender)}</span>` : ''}${s.status ? `<span class="badge ${s.status === 'repeat' ? 'warning' : ''}">${t('status.' + s.status)}</span>` : ''}${s.birthDate ? `<span class="badge">${age(s.birthDate)} ${t('students.years')}</span>` : ''}</div>
        </section>
        <section class="card">
          <h2>${t('students.info')}</h2>
          <table class="meta">${info.map(f => `<tr><td>${t(f.label)}</td><td>${Crud.display(f, s[f.key], ctx)}</td></tr>`).join('')}</table>
          ${s.notes ? `<h3>${t('f.notes')}</h3><p>${esc(s.notes).replace(/\n/g, '<br>')}</p>` : ''}
        </section>
        <section class="card span-2">
          <h2>${UI.icon('chart')} ${t('students.results')}</h2>
          ${gradesTable()}
        </section>
      </div>`;

    el.addEventListener('click', async e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'edit') { if (await Crud.form(cfg, s, ctx)) App.render(); }
      if (b.dataset.act === 'delete') { if (await Crud.remove(cfg, s)) location.hash = '#/students'; }
      if (b.dataset.act === 'print') {
        const photo = s.photo && UI.isImage(s.photo) ? `<img src="${UI.url(s.photo.blob)}">` : '';
        UI.printHTML(fullName(s), `<h1>${t('students.profileCard')}</h1>
          <div class="profile">${photo}<table class="meta" style="flex:1">${info.map(f => `<tr><td>${t(f.label)}</td><td>${Crud.display(f, s[f.key], ctx)}</td></tr>`).join('')}</table></div>
          <h2>${t('students.results')}</h2>${gradesTable().replace('class="table grades-mini"', 'class="grid"')}
          ${s.notes ? `<h2>${t('f.notes')}</h2><p>${esc(s.notes)}</p>` : ''}
          <div class="sign"><span>${t('print.teacherSign')}</span><span>${t('print.parentSign')}</span></div>`);
      }
    }, { once: false });
  }

  /* ------------------------------ export ------------------------------ */
  const EXPORT_COLS = [
    ['number', 'f.studentNumber'], ['lastName', 'f.lastName'], ['firstName', 'f.firstName'], ['gender', 'f.gender'],
    ['birthDate', 'f.birthDate'], ['birthPlace', 'f.birthPlace'], ['class', 'f.class'], ['status', 'f.status'],
    ['guardian', 'f.guardian'], ['phone', 'f.phone'], ['address', 'f.address'], ['notes', 'f.notes']
  ];
  function toRows(list, ctx) {
    return list.map(s => EXPORT_COLS.map(([k]) => {
      if (k === 'class') return ctx.cmap[s.classId]?.name || '';
      if (k === 'gender') return s.gender ? t('gender.' + s.gender) : '';
      if (k === 'status') return s.status ? t('status.' + s.status) : '';
      return s[k] ?? '';
    }));
  }
  const csvCell = v => { const s = String(v ?? ''); return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  function toCSV(header, rows) { return '﻿' + [header, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n'); }

  async function exportTable(name, header, rows, format, sheetName = 'Sheet1') {
    if (format === 'csv') return UI.download(new Blob([toCSV(header, rows)], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
    try {
      const X = await UI.xlsx();
      const ws = X.utils.aoa_to_sheet([header, ...rows]);
      ws['!cols'] = header.map((h, i) => ({ wch: Math.min(40, Math.max(String(h).length, ...rows.map(r => String(r[i] ?? '').length)) + 2) }));
      if (I18n.dir === 'rtl') ws['!views'] = [{ RTL: true }];
      const wb = X.utils.book_new();
      wb.Workbook = { Views: [{ RTL: I18n.dir === 'rtl' }] };
      X.utils.book_append_sheet(wb, ws, sheetName.slice(0, 30).replace(/[\\/?*[\]:]/g, ' '));
      X.writeFile(wb, `${name}.xlsx`);
    } catch (e) {
      UI.toast(t('msg.xlsxUnavailable'), 'error');
      UI.download(new Blob([toCSV(header, rows)], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
    }
  }

  async function exportStudents(format, list, ctx) {
    const header = EXPORT_COLS.map(([, l]) => t(l));
    const cname = st.classId ? ctx.cmap[st.classId]?.name : t('nav.students');
    const name = `${t('nav.students')}-${cname || ''}`.replace(/\s+/g, '_');
    if (format === 'template') {
      const sample = ['001', t('students.sampleLast'), t('students.sampleFirst'), t('gender.m'), '2012-05-14', t('students.samplePlace'), cname || '1M1', t('status.new'), '', '', '', ''];
      return exportTable(t('students.templateFile'), header, [sample], 'xlsx');
    }
    if (!list.length) return UI.toast(t('common.noData'), 'error');
    if (format === 'json') {
      const data = list.map(s => { const { photo, ...rest } = s; return { ...rest, className: ctx.cmap[s.classId]?.name || '' }; });
      return UI.download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${name}.json`);
    }
    return exportTable(name, header, toRows(list, ctx), format, cname || 'students');
  }

  /* ------------------------------ import ------------------------------ */
  const aliases = () => ({
    number: ['number', 'no', 'num', 'n°', 'nº', 'id', 'matricule', 'رقم', 'الرقم', 'رقم التسجيل', 'رقم التعريف', 'رقم التلميذ', t('f.studentNumber')],
    lastName: ['lastname', 'last name', 'last_name', 'surname', 'family name', 'nom', 'اللقب', 'النسب', t('f.lastName')],
    firstName: ['firstname', 'first name', 'first_name', 'prenom', 'prénom', 'الاسم', t('f.firstName')],
    fullName: ['name', 'full name', 'fullname', 'student', 'nom et prenom', 'nom et prénom', 'اللقب والاسم', 'الاسم واللقب', 'الاسم الكامل', 'التلميذ', 'اسم التلميذ', t('f.fullName')],
    gender: ['gender', 'sex', 'sexe', 'الجنس', t('f.gender')],
    birthDate: ['birthdate', 'birth date', 'birth_date', 'date of birth', 'dob', 'date de naissance', 'تاريخ الميلاد', 'تاريخ الازدياد', t('f.birthDate')],
    birthPlace: ['birthplace', 'birth place', 'place of birth', 'lieu de naissance', 'مكان الميلاد', 'مكان الازدياد', t('f.birthPlace')],
    className: ['class', 'classname', 'class name', 'classe', 'القسم', 'الفوج', 'الفصل', t('f.class')],
    status: ['status', 'repeat', 'redoublant', 'الحالة', 'الاعادة', 'معيد', t('f.status')],
    guardian: ['guardian', 'parent', 'tuteur', 'الولي', 'اسم الولي', t('f.guardian')],
    phone: ['phone', 'tel', 'téléphone', 'telephone', 'mobile', 'الهاتف', 'رقم الهاتف', t('f.phone')],
    address: ['address', 'adresse', 'العنوان', t('f.address')],
    notes: ['notes', 'remarks', 'observation', 'ملاحظات', 'ملاحظة', t('f.notes')]
  });
  function headerKey(h) {
    const n = Search.norm(String(h || '')).replace(/[:*]/g, '').trim();
    if (!n) return null;
    for (const [k, list] of Object.entries(aliases())) if (list.some(a => Search.norm(a) === n)) return k;
    return null;
  }
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const first = text.split(/\r?\n/)[0] || '';
    const delim = [',', ';', '\t'].map(d => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === delim) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(c => String(c).trim()));
  }
  function parseDate(v) {
    if (v == null || v === '') return '';
    if (v instanceof Date && !isNaN(v)) return new Date(v.getTime() - v.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (typeof v === 'number' && v > 1000 && v < 80000) return new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10);
    const s = String(v).trim();
    let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return s;
  }
  function parseGender(v) {
    const s = Search.norm(String(v || ''));
    if (!s) return '';
    if (['m', 'male', 'boy', 'ذكر', 'ذ', 'masculin', 'h', 'homme', 'garcon', t('gender.m')].map(Search.norm).includes(s)) return 'm';
    if (['f', 'female', 'girl', 'انثي', 'ا', 'feminin', 'féminin', 'fille', t('gender.f')].map(Search.norm).includes(s)) return 'f';
    return '';
  }
  function parseStatus(v) {
    const s = Search.norm(String(v || ''));
    if (!s) return '';
    if (['repeat', 'yes', 'oui', 'نعم', 'معيد', 'معيده', 'r', 'redoublant', t('status.repeat')].map(Search.norm).includes(s)) return 'repeat';
    return 'new';
  }

  async function readRows(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) {
      const data = JSON.parse(await file.text());
      const arr = Array.isArray(data) ? data : data.students || [];
      if (!arr.length) return [];
      const keys = [...new Set(arr.flatMap(o => Object.keys(o)))];
      return [keys, ...arr.map(o => keys.map(k => o[k]))];
    }
    if (name.endsWith('.csv') || name.endsWith('.txt')) return parseCSV(await file.text());
    const X = await UI.xlsx();
    const wb = X.read(await file.arrayBuffer(), { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return X.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
  }

  function mapRows(rows) {
    let hi = -1, map = null;
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const m = rows[i].map(headerKey);
      if (m.filter(Boolean).length >= 2) { hi = i; map = m; break; }
    }
    if (hi < 0) return null;
    const out = [];
    for (const r of rows.slice(hi + 1)) {
      const o = {};
      map.forEach((k, i) => { if (k && o[k] == null && r[i] !== '' && r[i] != null) o[k] = r[i]; });
      if (o.fullName && !o.lastName && !o.firstName) {
        const parts = String(o.fullName).trim().split(/\s+/);
        o.lastName = parts.shift() || ''; o.firstName = parts.join(' ');
      }
      if (!o.lastName && !o.firstName) continue;
      out.push({
        number: o.number != null ? String(o.number).trim() : '',
        lastName: String(o.lastName || '').trim(), firstName: String(o.firstName || '').trim(),
        gender: parseGender(o.gender), birthDate: parseDate(o.birthDate), birthPlace: String(o.birthPlace || '').trim(),
        className: String(o.className || '').trim(), status: parseStatus(o.status), guardian: String(o.guardian || '').trim(),
        phone: String(o.phone || '').trim(), address: String(o.address || '').trim(), notes: String(o.notes || '').trim()
      });
    }
    return out;
  }

  async function importStudents(ctx, defaultClass, reload) {
    const file = await UI.pickFile('.csv,.xlsx,.xls,.ods,.json,.txt');
    if (!file) return;
    let items;
    try { items = mapRows(await readRows(file)); }
    catch (e) { console.error(e); return UI.toast(/load failed/.test(e.message) ? t('msg.xlsxUnavailable') : t('msg.invalidFile'), 'error'); }
    if (!items || !items.length) return UI.toast(t('students.importNoRows'), 'error');
    const hasClassCol = items.some(i => i.className);
    const body = `
      <p>${t('students.importFound', { n: items.length, file: esc(file.name) })}</p>
      <label class="field"><span>${hasClassCol ? t('students.importClassFallback') : t('students.importClass')}</span>
        <select class="input" id="imp-class"><option value="">— ${t('classes.newFromName')} —</option>${ctx.classes.map(c => `<option value="${c.id}" ${(defaultClass || (hasClassCol ? '' : ctx.classes[0]?.id)) === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <label class="field" id="imp-newname-wrap"><span>${t('classes.newName')}</span><input class="input" id="imp-newname" placeholder="${t('ph.className')}"></label>
      <label class="check"><input type="checkbox" id="imp-skipdup" checked> ${t('students.skipDuplicates')}</label>
      <div class="table-wrap small-table"><table class="table"><thead><tr><th>${t('f.studentNumber')}</th><th>${t('f.lastName')}</th><th>${t('f.firstName')}</th><th>${t('f.gender')}</th><th>${t('f.birthDate')}</th>${hasClassCol ? `<th>${t('f.class')}</th>` : ''}</tr></thead>
      <tbody>${items.slice(0, 8).map(i => `<tr><td>${esc(i.number)}</td><td>${esc(i.lastName)}</td><td>${esc(i.firstName)}</td><td>${i.gender ? t('gender.' + i.gender) : ''}</td><td>${esc(i.birthDate)}</td>${hasClassCol ? `<td>${esc(i.className)}</td>` : ''}</tr>`).join('')}
      ${items.length > 8 ? `<tr><td colspan="6" class="muted center">… +${items.length - 8}</td></tr>` : ''}</tbody></table></div>`;
    const m = UI.modal({
      title: t('students.importTitle'), size: 'lg', body,
      buttons: [{ label: t('common.cancel') }, {
        label: t('common.import'), cls: 'primary', icon: 'upload', onClick: async (c, w) => {
          let fallback = $('#imp-class', w).value;
          const newName = $('#imp-newname', w).value.trim();
          const byName = Object.fromEntries(ctx.classes.map(c => [Search.norm(c.name), c.id]));
          const teacher = Settings.get().teacher;
          const ensureClass = async name => {
            const k = Search.norm(name);
            if (!byName[k]) { const cl = await DB.put('classes', { name, year: teacher.year, subject: teacher.subject }); byName[k] = cl.id; }
            return byName[k];
          };
          if (!fallback && newName) fallback = await ensureClass(newName);
          if (!fallback && items.some(i => !i.className)) { UI.toast(t('students.importNeedClass'), 'error'); return false; }
          const existing = await DB.all('students');
          const key = s => Search.norm(`${s.classId}|${s.lastName}|${s.firstName}`);
          const seen = new Set(existing.map(key));
          const skip = $('#imp-skipdup', w).checked;
          const recs = [];
          for (const i of items) {
            const { className, ...rest } = i;
            const classId = className ? await ensureClass(className) : fallback;
            const rec = { ...rest, classId };
            if (skip && seen.has(key(rec))) continue;
            seen.add(key(rec)); recs.push(rec);
          }
          if (recs.length) await DB.bulkPut('students', recs);
          UI.toast(t('students.imported', { n: recs.length, s: items.length - recs.length }));
          reload();
        }
      }]
    });
    const sel = $('#imp-class', m.el), wrap = $('#imp-newname-wrap', m.el);
    const upd = () => { wrap.hidden = !!sel.value; };
    sel.addEventListener('change', upd); upd();
  }

  /* ------------------------------ printing ------------------------------ */
  function printOptions(list, ctx, classId) {
    if (!list.length) return UI.toast(t('common.noData'), 'error');
    UI.modal({
      title: t('students.printTitle'), size: 'sm',
      body: `<label class="field"><span>${t('students.printType')}</span><select class="input" id="pt-type">
          <option value="list">${t('students.printList')}</option><option value="attendance">${t('students.printAttendance')}</option><option value="blank">${t('students.printBlank')}</option><option value="cards">${t('students.printCards')}</option></select></label>
        <label class="field"><span>${t('students.blankCols')}</span><input class="input" type="number" id="pt-cols" min="0" max="31" value="6"></label>
        <label class="field"><span>${t('students.sheetTitle')}</span><input class="input" id="pt-title" value="${esc(t('students.listOf'))} ${esc(ctx.cmap[classId]?.name || '')}"></label>`,
      buttons: [{ label: t('common.cancel') }, {
        label: t('common.print'), cls: 'primary', icon: 'printer', onClick: (c, w) => {
          const type = $('#pt-type', w).value, cols = Math.max(0, Math.min(31, +$('#pt-cols', w).value || 0)), title = $('#pt-title', w).value;
          printList(list, ctx, type, cols, title);
        }
      }]
    });
  }
  function printList(list, ctx, type, cols, title) {
    const showClass = new Set(list.map(s => s.classId)).size > 1;
    if (type === 'cards') {
      const html = `<h1>${esc(title)}</h1><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${list.map(s => `
        <div style="border:1px solid #888;border-radius:6px;padding:8px;display:flex;gap:8px;page-break-inside:avoid">
          ${s.photo && UI.isImage(s.photo) ? `<img src="${UI.url(s.photo.blob)}" style="width:60px;height:72px;object-fit:cover">` : ''}
          <div><b>${esc(fullName(s))}</b><br>${t('f.studentNumber')}: ${esc(s.number)}<br>${t('f.birthDate')}: ${UI.fmtDate(s.birthDate)}<br>${t('f.class')}: ${esc(ctx.cmap[s.classId]?.name || '')}</div></div>`).join('')}</div>`;
      return UI.printHTML(title, html);
    }
    const blank = type === 'list' ? 0 : cols;
    const extraHead = type === 'attendance' ? Array.from({ length: blank }, (_, i) => `<th class="c" style="width:${Math.max(18, 60 / Math.max(blank, 1))}px">${i + 1}</th>`).join('')
      : Array.from({ length: blank }, () => '<th class="c" style="min-width:40px">&nbsp;</th>').join('');
    const html = `<h1>${esc(title)}</h1>
      <table class="grid"><thead><tr><th class="c">#</th><th>${t('f.studentNumber')}</th><th>${t('f.fullName')}</th>
      ${type === 'list' ? `<th>${t('f.gender')}</th><th>${t('f.birthDate')}</th><th>${t('f.birthPlace')}</th>${showClass ? `<th>${t('f.class')}</th>` : ''}<th>${t('f.status')}</th>` : ''}${extraHead}</tr></thead>
      <tbody>${list.map((s, i) => `<tr><td class="c">${i + 1}</td><td>${esc(s.number)}</td><td>${esc(fullName(s))}</td>
        ${type === 'list' ? `<td>${s.gender ? t('gender.' + s.gender) : ''}</td><td>${UI.fmtDate(s.birthDate)}</td><td>${esc(s.birthPlace)}</td>${showClass ? `<td>${esc(ctx.cmap[s.classId]?.name || '')}</td>` : ''}<td>${s.status ? t('status.' + s.status) : ''}</td>` : ''}
        ${'<td></td>'.repeat(blank)}</tr>`).join('')}</tbody></table>
      <p class="muted">${t('common.total')}: ${list.length} — ${t('gender.m')}: ${list.filter(s => s.gender === 'm').length} — ${t('gender.f')}: ${list.filter(s => s.gender === 'f').length}</p>`;
    UI.printHTML(title, html, { landscape: blank > 10 });
  }

  return { render, fullName, avatar, sortStudents, exportTable };
})();
