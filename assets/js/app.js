/* App shell: navigation, router, top bar */
const App = (() => {
  const NAV = [
    ['dashboard', 'home'], ['documents', 'folder'], ['classes', 'layers'], ['students', 'users'], ['grades', 'chart'],
    ['lessons', 'book'], ['exams', 'clipboard'], ['exercises', 'zap'], ['drawings', 'penTool'], ['settings', 'settings']
  ];
  const ROUTES = {
    dashboard: el => Dashboard.render(el),
    documents: (el, p) => Crud.page(Schemas.documents, el, p),
    classes: (el, p) => Crud.page(Schemas.classes, el, p),
    students: (el, p) => Students.render(el, p),
    grades: (el, p) => Grades.render(el, p),
    lessons: (el, p) => Crud.page(Schemas.lessons, el, p),
    exams: (el, p) => Crud.page(Schemas.exams, el, p),
    exercises: (el, p) => Crud.page(Schemas.exercises, el, p),
    drawings: (el, p) => Drawings.render(el, p),
    settings: el => Settings.render(el)
  };

  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const [name, id] = (path || 'dashboard').split('/');
    const query = Object.fromEntries(new URLSearchParams(qs || ''));
    return { name: ROUTES[name] ? name : 'dashboard', id, query };
  }

  function refreshChrome() {
    I18n.translateDom();
    const cur = parse().name;
    $('#nav').innerHTML = NAV.map(([k, ic]) => `<a href="#/${k}" class="nav-item ${cur === k ? 'active' : ''}">${UI.icon(ic)}<span>${t('nav.' + k)}</span></a>`).join('');
    const tch = Settings.get().teacher;
    $('#brand-sub').textContent = [tch.name, tch.subject].filter(Boolean).join(' · ') || t('app.tagline');
    $('#menu-btn').innerHTML = UI.icon('menu');
    $('#lang-btn').innerHTML = `<span class="lang-label">${I18n.lang === 'ar' ? 'EN' : 'ع'}</span>`;
    $('#theme-btn').innerHTML = UI.icon(Settings.resolvedTheme() === 'dark' || Settings.resolvedTheme() === 'midnight' ? 'sun' : 'moon');
    $('#settings-btn').innerHTML = UI.icon('settings');
    $('.gs-icon').innerHTML = UI.icon('search');
    document.title = `${t('nav.' + cur)} — ${t('app.name')}`;
  }

  let renderSeq = 0;
  async function render() {
    const my = ++renderSeq;
    const p = parse();
    refreshChrome();
    document.body.classList.remove('nav-open');
    [...UI._modals].forEach(m => m.close());
    const old = $('#view');
    const view = old.cloneNode(false);  // fresh element -> no stale listeners
    old.replaceWith(view);
    view.innerHTML = '<div class="loading"><span class="spinner"></span></div>';
    try {
      const tmp = document.createElement('div');
      tmp.className = 'page';
      await ROUTES[p.name](tmp, p);
      if (my !== renderSeq) return;
      view.innerHTML = '';
      view.appendChild(tmp);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      view.innerHTML = `<div class="empty">${UI.icon('alert', 'ic-xxl')}<h3>${t('msg.error')}</h3><p class="muted">${esc(e.message)}</p></div>`;
    }
  }

  function init() {
    Settings.apply();
    window.addEventListener('hashchange', render);
    $('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('#sidebar-overlay').addEventListener('click', () => document.body.classList.remove('nav-open'));
    $('#lang-btn').addEventListener('click', () => { Settings.set({ lang: I18n.lang === 'ar' ? 'en' : 'ar' }); render(); });
    $('#theme-btn').addEventListener('click', () => {
      const dark = ['dark', 'midnight'].includes(Settings.resolvedTheme());
      Settings.set({ theme: dark ? 'light' : 'dark' });
      parse().name === 'settings' ? render() : refreshChrome();
    });
    Search.init();
    render();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }

  return { init, render, refreshChrome };
})();

document.addEventListener('DOMContentLoaded', App.init);
