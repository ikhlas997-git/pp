/* Dashboard: counters, upcoming exams, recent items, expiring documents */
const Dashboard = (() => {
  const CARDS = [
    ['students', 'users'], ['classes', 'layers'], ['documents', 'folder'], ['lessons', 'book'],
    ['exams', 'clipboard'], ['exercises', 'zap'], ['drawings', 'penTool']
  ];

  async function render(el) {
    const s = Settings.get().teacher;
    const data = {};
    for (const [k] of CARDS) data[k] = await DB.all(k);
    const ctx = await Crud.loadCtx();
    const today = UI.today();
    const upcoming = data.exams.filter(e => e.date && e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    const soon = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
    const expiring = data.documents.filter(d => d.expiry && d.expiry <= soon).sort((a, b) => a.expiry.localeCompare(b.expiry));
    const recent = ['documents', 'lessons', 'exams', 'exercises', 'drawings']
      .flatMap(k => data[k].map(r => ({ k, r }))).sort((a, b) => b.r.updatedAt - a.r.updatedAt).slice(0, 8);
    const hour = new Date().getHours();
    const greet = hour < 12 ? t('dash.morning') : hour < 18 ? t('dash.afternoon') : t('dash.evening');
    const dateStr = new Date().toLocaleDateString(I18n.lang === 'ar' ? 'ar-DZ' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    el.innerHTML = `
      <section class="hero">
        <div><h1>${greet}${s.name ? '، ' + esc(s.name) : ''} 👋</h1>
        <p>${esc(dateStr)}${s.school ? ' · ' + esc(s.school) : ''}${s.year ? ' · ' + esc(s.year) : ''}</p></div>
        ${!s.name ? `<a class="btn light" href="#/settings">${UI.icon('user')}<span>${t('dash.setupProfile')}</span></a>` : ''}
      </section>
      <div class="stat-cards">
        ${CARDS.map(([k, ic]) => `<a class="stat-card" href="#/${k}"><span class="sc-icon">${UI.icon(ic)}</span><div><b>${data[k].length}</b><span>${t('nav.' + k)}</span></div></a>`).join('')}
      </div>
      <section class="card">
        <h2>${UI.icon('zap')} ${t('dash.quick')}</h2>
        <div class="quick-actions">
          <a class="qa" href="#/students?new=1">${UI.icon('users')}<span>${t('dash.addStudent')}</span></a>
          <a class="qa" href="#/grades">${UI.icon('chart')}<span>${t('dash.enterGrades')}</span></a>
          <a class="qa" href="#/lessons?new=1">${UI.icon('book')}<span>${t('dash.newLesson')}</span></a>
          <a class="qa" href="#/exams?new=1">${UI.icon('clipboard')}<span>${t('dash.newExam')}</span></a>
          <a class="qa" href="#/documents?new=1">${UI.icon('folder')}<span>${t('dash.addDoc')}</span></a>
          <a class="qa" href="#/exercises?new=1">${UI.icon('zap')}<span>${t('dash.newExercise')}</span></a>
          <button class="qa" data-act="draw">${UI.icon('penTool')}<span>${t('draw.new')}</span></button>
        </div>
      </section>
      <div class="dash-grid">
        <section class="card">
          <h2>${UI.icon('calendar')} ${t('dash.upcoming')}</h2>
          ${upcoming.length ? `<ul class="simple-list">${upcoming.map(e => `<li><a href="#/exams?open=${e.id}"><span class="date-chip">${UI.fmtDate(e.date)}</span><span><b>${esc(e.title)}</b><small class="muted">${esc([t('exam.type.' + e.type), ctx.cmap[e.classId]?.name].filter(Boolean).join(' · '))}</small></span></a></li>`).join('')}</ul>`
            : `<p class="muted">${t('dash.noUpcoming')}</p>`}
        </section>
        <section class="card">
          <h2>${UI.icon('clock')} ${t('dash.recent')}</h2>
          ${recent.length ? `<ul class="simple-list">${recent.map(({ k, r }) => `<li><a href="#/${k}?open=${r.id}"><span class="li-ic">${UI.icon(Schemas[k].icon)}</span><span><b>${esc(r.title)}</b><small class="muted">${t('nav.' + k)} · ${UI.fmtDate(r.updatedAt)}</small></span></a></li>`).join('')}</ul>`
            : `<p class="muted">${t('dash.noRecent')}</p>`}
        </section>
        ${expiring.length ? `<section class="card warn-card">
          <h2>${UI.icon('alert')} ${t('dash.expiring')}</h2>
          <ul class="simple-list">${expiring.map(d => `<li><a href="#/documents?open=${d.id}"><span class="date-chip ${d.expiry < today ? 'danger' : ''}">${UI.fmtDate(d.expiry)}</span><span><b>${esc(d.title)}</b><small class="muted">${t('doc.cat.' + d.category)}</small></span></a></li>`).join('')}</ul>
        </section>` : ''}
      </div>`;
    $('[data-act=draw]', el).addEventListener('click', () => Drawings.openEditor(null, () => { location.hash = '#/drawings'; }));
  }
  return { render };
})();
