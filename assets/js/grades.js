/* Grades entry (صب النقاط): continuous evaluation, assignments, exams, averages, ranking */
const Grades = (() => {
  const st = { classId: '', term: '1' };
  const TERMS = ['1', '2', '3'];
  const gid = (sid, term) => `${sid}:${term}`;
  const num = v => (v === '' || v == null || isNaN(Number(v))) ? null : Number(v);
  const mean = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const LEVELS = ['excellent', 'veryGood', 'good', 'fairlyGood', 'pass', 'weak'];

  function compute(g) {
    if (!g) return null;
    const c = Settings.get().grades;
    const e = num(g.eval), x = num(g.exam);
    const as = [num(g.a1), c.assignments > 1 ? num(g.a2) : null].filter(v => v != null);
    const a = mean(as);
    const parts = [[e, +c.wEval], [a, +c.wAssign], [x, +c.wExam]].filter(([v, w]) => v != null && w > 0);
    if (!parts.length) return null;
    const ws = parts.reduce((s, [, w]) => s + w, 0);
    return parts.reduce((s, [v, w]) => s + v * w, 0) / ws;
  }
  function level(avg) {
    const max = +Settings.get().grades.max || 20;
    const r = avg / max;
    return r >= 0.9 ? 'excellent' : r >= 0.8 ? 'veryGood' : r >= 0.7 ? 'good' : r >= 0.6 ? 'fairlyGood' : r >= 0.5 ? 'pass' : 'weak';
  }
  const appreciation = avg => avg == null ? '' : t('appr.' + level(avg));

  function rank(entries) { // entries: [{id, avg}] -> Map id -> rank
    const sorted = entries.filter(e => e.avg != null).sort((a, b) => b.avg - a.avg);
    const ranks = new Map();
    sorted.forEach((e, i) => {
      const prev = sorted[i - 1];
      ranks.set(e.id, prev && Math.abs(prev.avg - e.avg) < 1e-9 ? ranks.get(prev.id) : i + 1);
    });
    return ranks;
  }

  async function loadClass(classId) {
    const ctx = await Crud.loadCtx();
    const students = Students.sortStudents((await DB.all('students')).filter(s => s.classId === classId), ctx, 'number', 1);
    const ids = new Set(students.map(s => s.id));
    const gmap = {};
    (await DB.all('grades')).forEach(g => { if (ids.has(g.studentId)) gmap[g.id] = g; });
    return { ctx, students, gmap };
  }

  function termResults(students, gmap, term) {
    const rows = students.map(s => ({ id: s.id, s, g: gmap[gid(s.id, term)], avg: compute(gmap[gid(s.id, term)]) }));
    const ranks = rank(rows);
    rows.forEach(r => { r.rank = ranks.get(r.id) || null; });
    return rows;
  }
  function annualResults(students, gmap) {
    const rows = students.map(s => {
      const terms = TERMS.map(tm => compute(gmap[gid(s.id, tm)]));
      return { id: s.id, s, terms, avg: mean(terms.filter(v => v != null)) };
    });
    const ranks = rank(rows);
    rows.forEach(r => { r.rank = ranks.get(r.id) || null; });
    return rows;
  }
  function stats(rows) {
    const c = Settings.get().grades;
    const avgs = rows.map(r => r.avg).filter(v => v != null);
    const dist = Object.fromEntries(LEVELS.map(l => [l, 0]));
    avgs.forEach(a => dist[level(a)]++);
    return {
      count: rows.length, graded: avgs.length,
      mean: mean(avgs), max: avgs.length ? Math.max(...avgs) : null, min: avgs.length ? Math.min(...avgs) : null,
      pass: avgs.filter(a => a >= +c.pass).length,
      rate: avgs.length ? avgs.filter(a => a >= +c.pass).length / avgs.length * 100 : null,
      dist
    };
  }

  async function studentSummary(s) {
    const { students, gmap } = await loadClass(s.classId);
    const terms = TERMS.map(term => {
      const rows = termResults(students, gmap, term);
      const me = rows.find(r => r.id === s.id) || {};
      return { term, g: me.g, avg: me.avg ?? null, rank: me.rank, of: rows.filter(r => r.avg != null).length };
    });
    const ann = annualResults(students, gmap);
    const me = ann.find(r => r.id === s.id) || {};
    return { terms, annual: me.avg ?? null, annualRank: me.rank, of: ann.filter(r => r.avg != null).length };
  }

  /* ------------------------------ page ------------------------------ */
  async function render(el, params) {
    const ctx = await Crud.loadCtx();
    if (params.query?.class) st.classId = params.query.class;
    if (params.query?.term) st.term = params.query.term;
    if (!ctx.cmap[st.classId]) st.classId = ctx.classes[0]?.id || '';
    const c = Settings.get().grades;

    el.innerHTML = `
      <div class="page-head">
        <div><h1>${UI.icon('chart')} ${t('nav.grades')}</h1><p class="muted">${t('grades.desc')}</p></div>
        <div class="actions">
          <a class="btn ghost" href="#/settings" title="${t('settings.gradesCfg')}">${UI.icon('settings')}<span>${t('grades.config')}</span></a>
          <details class="dropdown"><summary class="btn">${UI.icon('download')}<span>${t('common.export')}</span>${UI.icon('chevronDown')}</summary>
            <div class="dd-menu"><button data-exp="xlsx">Excel (.xlsx)</button><button data-exp="csv">CSV</button></div></details>
          <button class="btn primary" data-act="print">${UI.icon('printer')}<span>${t('common.print')}</span></button>
        </div>
      </div>
      ${!ctx.classes.length ? `<div class="empty">${UI.icon('layers', 'ic-xxl')}<h3>${t('grades.noClasses')}</h3><a class="btn primary" href="#/classes?new=1">${UI.icon('plus')}<span>${t('classes.new')}</span></a></div>` : `
      <div class="toolbar">
        <select class="input" data-class>${ctx.classes.map(cl => `<option value="${cl.id}" ${st.classId === cl.id ? 'selected' : ''}>${esc(cl.name)}</option>`).join('')}</select>
        <div class="seg tabs" data-terms>${[...TERMS, 'annual'].map(tm => `<button data-term="${tm}" class="${st.term === tm ? 'active' : ''}">${tm === 'annual' ? t('grades.annual') : t('term.' + tm)}</button>`).join('')}</div>
        <span class="muted small hint">${st.term === 'annual' ? '' : t('grades.hint', { max: c.max })}</span>
      </div>
      <div class="grade-stats" id="g-stats"></div>
      <div id="g-table"></div>`}`;
    if (!ctx.classes.length) return;

    let { students, gmap } = await loadClass(st.classId);
    const tableEl = $('#g-table', el), statsEl = $('#g-stats', el);
    const cols = () => ['eval', 'a1', ...(c.assignments > 1 ? ['a2'] : []), 'exam'];

    const renderStats = rows => {
      const s = stats(rows);
      const total = Math.max(1, s.graded);
      statsEl.innerHTML = `
        <div class="stat"><span>${t('grades.studentsCount')}</span><b>${s.count}</b></div>
        <div class="stat"><span>${t('grades.classAvg')}</span><b>${UI.fmtNum(s.mean, c.decimals)}</b></div>
        <div class="stat"><span>${t('grades.highest')}</span><b>${UI.fmtNum(s.max, c.decimals)}</b></div>
        <div class="stat"><span>${t('grades.lowest')}</span><b>${UI.fmtNum(s.min, c.decimals)}</b></div>
        <div class="stat"><span>${t('grades.passRate')}</span><b>${s.rate == null ? '—' : s.rate.toFixed(1) + '%'}</b><small class="muted">${s.pass} / ${s.graded}</small></div>
        <div class="stat dist"><span>${t('grades.distribution')}</span>
          <div class="bars">${LEVELS.map(l => `<div class="bar-row"><span>${t('appr.' + l)}</span><div class="bar"><i class="lv-${l}" style="width:${s.dist[l] / total * 100}%"></i></div><b>${s.dist[l]}</b></div>`).join('')}</div></div>`;
    };

    const renderTerm = () => {
      const rows = termResults(students, gmap, st.term);
      renderStats(rows);
      if (!students.length) { tableEl.innerHTML = emptyClass(); return; }
      tableEl.innerHTML = `<div class="table-wrap"><table class="table grades-table"><thead><tr>
        <th>#</th><th>${t('f.studentNumber')}</th><th>${t('f.fullName')}</th>
        ${cols().map(k => `<th class="c">${t('grades.' + k)}<small class="muted"> ×${k === 'eval' ? c.wEval : k === 'exam' ? c.wExam : c.wAssign}</small></th>`).join('')}
        <th class="c">${t('grades.avg')}</th><th class="c">${t('grades.rank')}</th><th>${t('grades.appreciation')}</th><th>${t('grades.remark')}</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr data-sid="${r.id}">
          <td class="muted">${i + 1}</td><td>${esc(r.s.number)}</td>
          <td><a href="#/students/${r.id}" class="name-link">${esc(Students.fullName(r.s))}</a></td>
          ${cols().map(k => `<td class="c"><input class="grade-input" inputmode="decimal" data-f="${k}" value="${r.g?.[k] ?? ''}" aria-label="${t('grades.' + k)}"></td>`).join('')}
          <td class="c avg-cell"></td><td class="c rank-cell"></td><td class="appr-cell"></td>
          <td><input class="input remark-input" data-f="remark" value="${esc(r.g?.remark || '')}"></td></tr>`).join('')}
        </tbody></table></div>`;
      refreshComputed();
    };

    const refreshComputed = () => {
      const rows = termResults(students, gmap, st.term);
      rows.forEach(r => {
        const tr = $(`tr[data-sid="${r.id}"]`, tableEl); if (!tr) return;
        const ac = $('.avg-cell', tr);
        ac.textContent = UI.fmtNum(r.avg, c.decimals);
        ac.className = `c avg-cell ${r.avg != null ? 'lv-text-' + level(r.avg) : ''} ${r.avg != null && r.avg < c.pass ? 'low' : ''}`;
        $('.rank-cell', tr).textContent = r.rank || '—';
        $('.appr-cell', tr).textContent = appreciation(r.avg);
      });
      renderStats(rows);
    };

    const renderAnnual = () => {
      const rows = annualResults(students, gmap);
      renderStats(rows);
      if (!students.length) { tableEl.innerHTML = emptyClass(); return; }
      tableEl.innerHTML = `<div class="table-wrap"><table class="table grades-table"><thead><tr><th>#</th><th>${t('f.studentNumber')}</th><th>${t('f.fullName')}</th>
        ${TERMS.map(tm => `<th class="c">${t('term.' + tm)}</th>`).join('')}<th class="c">${t('grades.annual')}</th><th class="c">${t('grades.rank')}</th><th>${t('grades.appreciation')}</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr><td class="muted">${i + 1}</td><td>${esc(r.s.number)}</td><td><a href="#/students/${r.id}" class="name-link">${esc(Students.fullName(r.s))}</a></td>
          ${r.terms.map(v => `<td class="c ${v != null && v < c.pass ? 'low' : ''}">${UI.fmtNum(v, c.decimals)}</td>`).join('')}
          <td class="c ${r.avg != null && r.avg < c.pass ? 'low' : ''}"><b>${UI.fmtNum(r.avg, c.decimals)}</b></td><td class="c">${r.rank || '—'}</td><td>${appreciation(r.avg)}</td></tr>`).join('')}</tbody></table></div>`;
    };
    const emptyClass = () => `<div class="empty">${UI.icon('users', 'ic-xxl')}<h3>${t('grades.noStudents')}</h3><a class="btn primary" href="#/students?class=${st.classId}">${UI.icon('users')}<span>${t('nav.students')}</span></a></div>`;
    const renderAll = () => (st.term === 'annual' ? renderAnnual : renderTerm)();
    renderAll();

    // saving
    const timers = {};
    const save = sid => {
      clearTimeout(timers[sid]);
      timers[sid] = setTimeout(async () => {
        const rec = gmap[gid(sid, st.term)];
        if (rec) await DB.put('grades', rec);
        const tr = $(`tr[data-sid="${sid}"]`, tableEl);
        if (tr) { tr.classList.add('saved-flash'); setTimeout(() => tr.classList.remove('saved-flash'), 600); }
      }, 350);
    };
    el.addEventListener('input', e => {
      const inp = e.target.closest('[data-f]'); if (!inp) return;
      const sid = inp.closest('tr').dataset.sid, f = inp.dataset.f, term = st.term;
      const id = gid(sid, term);
      const rec = gmap[id] || (gmap[id] = { id, studentId: sid, classId: st.classId, term });
      if (f === 'remark') { rec.remark = inp.value; save(sid); return; }
      const raw = inp.value.replace(',', '.').trim();
      const v = raw === '' ? null : Number(raw);
      const bad = raw !== '' && (isNaN(v) || v < 0 || v > +c.max);
      inp.classList.toggle('invalid', bad);
      if (bad) return;
      rec[f] = v;
      refreshComputed();
      save(sid);
    });
    el.addEventListener('keydown', e => {
      const inp = e.target.closest('.grade-input'); if (!inp) return;
      const move = { Enter: 1, ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (!move) return;
      e.preventDefault();
      const tr = inp.closest('tr');
      const next = move > 0 ? tr.nextElementSibling : tr.previousElementSibling;
      const target = next && $(`[data-f="${inp.dataset.f}"]`, next);
      if (target) { target.focus(); target.select(); }
    });
    el.addEventListener('focusin', e => { if (e.target.matches('.grade-input')) e.target.select(); });
    el.addEventListener('change', async e => {
      if (e.target.matches('[data-class]')) {
        st.classId = e.target.value;
        history.replaceState(null, '', `#/grades?class=${st.classId}`);
        ({ students, gmap } = await loadClass(st.classId));
        renderAll();
      }
    });
    el.addEventListener('click', e => {
      const tb = e.target.closest('[data-term]');
      if (tb) {
        st.term = tb.dataset.term;
        $$('[data-term]', el).forEach(b => b.classList.toggle('active', b === tb));
        $('.hint', el).textContent = st.term === 'annual' ? '' : t('grades.hint', { max: c.max });
        renderAll(); return;
      }
      const exp = e.target.closest('[data-exp]');
      if (exp) return exportGrades(exp.dataset.exp, ctx, students, gmap);
      if (e.target.closest('[data-act=print]')) printGrades(ctx, students, gmap);
    });
  }

  function tableData(students, gmap) {
    const c = Settings.get().grades;
    if (st.term === 'annual') {
      const rows = annualResults(students, gmap);
      return {
        header: ['#', t('f.studentNumber'), t('f.fullName'), ...TERMS.map(tm => t('term.' + tm)), t('grades.annual'), t('grades.rank'), t('grades.appreciation')],
        rows: rows.map((r, i) => [i + 1, r.s.number || '', Students.fullName(r.s), ...r.terms.map(v => v == null ? '' : +v.toFixed(c.decimals)), r.avg == null ? '' : +r.avg.toFixed(c.decimals), r.rank || '', appreciation(r.avg)]),
        results: rows
      };
    }
    const keys = ['eval', 'a1', ...(c.assignments > 1 ? ['a2'] : []), 'exam'];
    const rows = termResults(students, gmap, st.term);
    return {
      header: ['#', t('f.studentNumber'), t('f.fullName'), ...keys.map(k => t('grades.' + k)), t('grades.avg'), t('grades.rank'), t('grades.appreciation'), t('grades.remark')],
      rows: rows.map((r, i) => [i + 1, r.s.number || '', Students.fullName(r.s), ...keys.map(k => r.g?.[k] ?? ''), r.avg == null ? '' : +r.avg.toFixed(c.decimals), r.rank || '', appreciation(r.avg), r.g?.remark || '']),
      results: rows
    };
  }
  const termLabel = () => st.term === 'annual' ? t('grades.annual') : t('term.' + st.term);

  function exportGrades(format, ctx, students, gmap) {
    if (!students.length) return UI.toast(t('common.noData'), 'error');
    const { header, rows } = tableData(students, gmap);
    const cname = ctx.cmap[st.classId]?.name || '';
    Students.exportTable(`${t('nav.grades')}-${cname}-${termLabel()}`.replace(/\s+/g, '_'), header, rows, format, cname);
  }

  function printGrades(ctx, students, gmap) {
    if (!students.length) return UI.toast(t('common.noData'), 'error');
    const c = Settings.get().grades;
    const { header, rows, results } = tableData(students, gmap);
    const s = stats(results);
    const avgIdx = header.indexOf(st.term === 'annual' ? t('grades.annual') : t('grades.avg'));
    const cname = ctx.cmap[st.classId]?.name || '';
    const html = `<h1>${t('grades.sheet')} — ${esc(cname)} — ${esc(termLabel())}</h1>
      <table class="grid"><thead><tr>${header.map(h => `<th class="c">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td class="${i === 2 || i >= header.length - 2 ? '' : 'c'} ${i === avgIdx && v !== '' && v < c.pass ? 'low' : ''}">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="stats"><div>${t('grades.classAvg')}: <b>${UI.fmtNum(s.mean, c.decimals)}</b></div><div>${t('grades.highest')}: <b>${UI.fmtNum(s.max, c.decimals)}</b></div>
      <div>${t('grades.lowest')}: <b>${UI.fmtNum(s.min, c.decimals)}</b></div><div>${t('grades.passRate')}: <b>${s.rate == null ? '—' : s.rate.toFixed(1) + '%'}</b></div></div>
      <div class="sign"><span>${t('print.teacherSign')}</span><span>${t('print.directorSign')}</span></div>`;
    UI.printHTML(`${t('grades.sheet')} ${cname}`, html, { landscape: header.length > 9 });
  }

  return { render, compute, appreciation, studentSummary, TERMS };
})();
