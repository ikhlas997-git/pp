/* Drawings: gallery (generic CRUD) + a canvas drawing editor */
const Drawings = (() => {
  const TOOLS = ['pen', 'line', 'arrow', 'rect', 'ellipse', 'triangle', 'text', 'eraser'];
  const TOOL_ICONS = { pen: 'pen', line: 'line', arrow: 'arrow', rect: 'square', ellipse: 'circle', triangle: 'triangle', text: 'type', eraser: 'eraser' };
  const COLORS = ['#111827', '#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#ffffff'];
  const BGS = ['white', 'grid', 'dots', 'lines', 'transparent'];

  function render(el, params) { return Crud.page(Schemas.drawings, el, params); }

  function drawBg(ctx, W, H, type) {
    ctx.clearRect(0, 0, W, H);
    if (type === 'transparent') return;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    const step = 40;
    ctx.strokeStyle = '#cbd5e1'; ctx.fillStyle = '#94a3b8'; ctx.lineWidth = 1;
    if (type === 'grid') {
      ctx.beginPath();
      for (let x = step; x < W; x += step) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for (let y = step; y < H; y += step) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
    } else if (type === 'dots') {
      for (let x = step; x < W; x += step) for (let y = step; y < H; y += step) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    } else if (type === 'lines') {
      ctx.beginPath();
      for (let y = step * 1.5; y < H; y += step) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
    }
  }

  function shape(ctx, tool, a, b, o) {
    ctx.beginPath();
    if (tool === 'line' || tool === 'arrow') {
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      if (tool === 'arrow') {
        const ang = Math.atan2(b.y - a.y, b.x - a.x), len = 12 + o.size * 2.5;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - len * Math.cos(ang - Math.PI / 7), b.y - len * Math.sin(ang - Math.PI / 7));
        ctx.lineTo(b.x - len * Math.cos(ang + Math.PI / 7), b.y - len * Math.sin(ang + Math.PI / 7));
        ctx.closePath(); ctx.fillStyle = o.color; ctx.fill();
      }
      return;
    }
    if (tool === 'rect') ctx.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    if (tool === 'ellipse') ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
    if (tool === 'triangle') { ctx.moveTo((a.x + b.x) / 2, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(a.x, b.y); ctx.closePath(); }
    if (o.fill) { ctx.fillStyle = o.color + '55'; ctx.fill(); }
    ctx.stroke();
  }

  async function openEditor(rec, onSaved) {
    let W = 1600, H = 1000;
    let baseImg = null;
    if (rec?.image?.blob) {
      baseImg = await createImageBitmap(rec.image.blob).catch(() => null);
      if (baseImg) {
        const k = Math.min(1, 2400 / Math.max(baseImg.width, baseImg.height));
        W = Math.round(baseImg.width * k); H = Math.round(baseImg.height * k);
      }
    }
    const o = { tool: 'pen', color: COLORS[0], size: 4, fill: false, bg: baseImg ? 'white' : 'grid' };
    const body = document.createElement('div');
    body.className = 'draw-wrap';
    body.innerHTML = `
      <div class="draw-tools">
        <input class="input draw-title" placeholder="${t('f.title')}" value="${esc(rec?.title || '')}">
        <div class="tool-group">${TOOLS.map(tl => `<button type="button" class="tool ${o.tool === tl ? 'active' : ''}" data-tool="${tl}" title="${t('draw.tool.' + tl)}">${UI.icon(TOOL_ICONS[tl])}</button>`).join('')}</div>
        <div class="tool-group">${COLORS.map(c => `<button type="button" class="color-dot ${o.color === c ? 'active' : ''}" data-color="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}
          <input type="color" class="color-input" value="${o.color}" title="${t('rich.color')}"></div>
        <div class="tool-group"><label class="small">${t('draw.size')}<input type="range" min="1" max="40" value="${o.size}" data-size class="range"></label>
          <label class="check small"><input type="checkbox" data-fill> ${t('draw.fill')}</label></div>
        <div class="tool-group"><select class="input sm" data-bg>${BGS.map(b => `<option value="${b}" ${o.bg === b ? 'selected' : ''}>${t('draw.bg.' + b)}</option>`).join('')}</select></div>
        <div class="tool-group">
          <button type="button" class="tool" data-do="undo" title="${t('draw.undo')}">${UI.icon('undo')}</button>
          <button type="button" class="tool" data-do="redo" title="${t('draw.redo')}">${UI.icon('redo')}</button>
          <button type="button" class="tool" data-do="image" title="${t('draw.insertImage')}">${UI.icon('image')}</button>
          <button type="button" class="tool danger" data-do="clear" title="${t('common.clear')}">${UI.icon('trash')}</button>
        </div>
      </div>
      <div class="draw-stage" style="aspect-ratio:${W}/${H}">
        <canvas class="cv-bg" width="${W}" height="${H}"></canvas>
        <canvas class="cv-fg" width="${W}" height="${H}"></canvas>
      </div>`;

    const bg = $('.cv-bg', body).getContext('2d');
    const fgCanvas = $('.cv-fg', body);
    const fg = fgCanvas.getContext('2d');
    drawBg(bg, W, H, o.bg);
    if (baseImg) fg.drawImage(baseImg, 0, 0, W, H);
    const undo = [], redo = [];
    const snap = () => { undo.push(fg.getImageData(0, 0, W, H)); if (undo.length > 40) undo.shift(); redo.length = 0; };
    let dirty = false;

    const pos = e => { const r = fgCanvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    let drawing = false, start = null, last = null, before = null;
    const setStyle = () => {
      fg.lineCap = 'round'; fg.lineJoin = 'round';
      fg.strokeStyle = o.color; fg.lineWidth = o.tool === 'eraser' ? o.size * 4 : o.size;
      fg.globalCompositeOperation = o.tool === 'eraser' ? 'destination-out' : 'source-over';
    };
    fgCanvas.addEventListener('pointerdown', async e => {
      e.preventDefault();
      const p = pos(e);
      if (o.tool === 'text') {
        const text = await UI.prompt(t('draw.enterText'));
        if (!text) return;
        snap();
        fg.globalCompositeOperation = 'source-over';
        fg.fillStyle = o.color;
        fg.font = `600 ${12 + o.size * 3}px ${Settings.fontStack()}`;
        fg.textBaseline = 'top';
        fg.direction = /[؀-ۿ]/.test(text) ? 'rtl' : 'ltr';
        fg.textAlign = fg.direction === 'rtl' ? 'right' : 'left';
        text.split('\n').forEach((ln, i) => fg.fillText(ln, p.x, p.y + i * (16 + o.size * 3.6)));
        dirty = true;
        return;
      }
      fgCanvas.setPointerCapture(e.pointerId);
      snap();
      drawing = true; start = last = p;
      before = fg.getImageData(0, 0, W, H);
      setStyle();
      if (o.tool === 'pen' || o.tool === 'eraser') { fg.beginPath(); fg.moveTo(p.x, p.y); fg.lineTo(p.x + .01, p.y + .01); fg.stroke(); }
    });
    fgCanvas.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = pos(e);
      if (o.tool === 'pen' || o.tool === 'eraser') {
        fg.beginPath(); fg.moveTo(last.x, last.y); fg.lineTo(p.x, p.y); fg.stroke(); last = p;
      } else {
        fg.putImageData(before, 0, 0); setStyle();
        let q = p;
        if (e.shiftKey && (o.tool === 'rect' || o.tool === 'ellipse')) { const d = Math.max(Math.abs(p.x - start.x), Math.abs(p.y - start.y)); q = { x: start.x + Math.sign(p.x - start.x) * d, y: start.y + Math.sign(p.y - start.y) * d }; }
        shape(fg, o.tool, start, q, o);
      }
      dirty = true;
    });
    const end = () => { drawing = false; fg.globalCompositeOperation = 'source-over'; };
    fgCanvas.addEventListener('pointerup', end);
    fgCanvas.addEventListener('pointercancel', end);

    body.addEventListener('click', async e => {
      const tl = e.target.closest('[data-tool]');
      if (tl) { o.tool = tl.dataset.tool; $$('[data-tool]', body).forEach(b => b.classList.toggle('active', b === tl)); return; }
      const cl = e.target.closest('[data-color]');
      if (cl) { o.color = cl.dataset.color; $$('[data-color]', body).forEach(b => b.classList.toggle('active', b === cl)); $('.color-input', body).value = o.color; if (o.tool === 'eraser') $(`[data-tool=pen]`, body).click(); return; }
      const d = e.target.closest('[data-do]');
      if (!d) return;
      if (d.dataset.do === 'undo' && undo.length) { redo.push(fg.getImageData(0, 0, W, H)); fg.putImageData(undo.pop(), 0, 0); }
      if (d.dataset.do === 'redo' && redo.length) { undo.push(fg.getImageData(0, 0, W, H)); fg.putImageData(redo.pop(), 0, 0); }
      if (d.dataset.do === 'clear') { snap(); fg.clearRect(0, 0, W, H); dirty = true; }
      if (d.dataset.do === 'image') {
        const f = await UI.pickFile('image/*'); if (!f) return;
        const img = await createImageBitmap(f);
        const k = Math.min(W * 0.8 / img.width, H * 0.8 / img.height, 1);
        snap();
        fg.drawImage(img, (W - img.width * k) / 2, (H - img.height * k) / 2, img.width * k, img.height * k);
        dirty = true;
      }
    });
    $('.color-input', body).addEventListener('input', e => { o.color = e.target.value; $$('[data-color]', body).forEach(b => b.classList.remove('active')); });
    $('[data-size]', body).addEventListener('input', e => { o.size = +e.target.value; });
    $('[data-fill]', body).addEventListener('change', e => { o.fill = e.target.checked; });
    $('[data-bg]', body).addEventListener('change', e => { o.bg = e.target.value; drawBg(bg, W, H, o.bg); dirty = true; });

    const composite = () => new Promise(res => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d');
      x.drawImage($('.cv-bg', body), 0, 0); x.drawImage(fgCanvas, 0, 0);
      c.toBlob(res, 'image/png');
    });

    UI.modal({
      title: rec ? `${t('draw.editCanvas')} — ${rec.title}` : t('draw.new'), size: 'full', body, cls: 'draw-modal',
      buttons: [
        { label: t('common.cancel'), onClick: async () => (dirty && !await UI.confirm(t('draw.discard'), { okLabel: t('common.close') })) ? false : undefined },
        { label: t('common.download'), icon: 'download', onClick: async () => { UI.download(await composite(), `${$('.draw-title', body).value || 'drawing'}.png`); return false; } },
        {
          label: t('common.save'), cls: 'primary', icon: 'check', onClick: async () => {
            const title = $('.draw-title', body).value.trim() || `${t('entity.drawing')} ${new Date().toLocaleString()}`;
            const blob = await composite();
            const out = { ...(rec || {}), title, source: rec?.source || 'drawn', image: { blob, name: title + '.png', type: 'image/png', size: blob.size } };
            await DB.put('drawings', out);
            UI.toast(t('msg.saved'));
            onSaved && onSaved();
          }
        }
      ]
    });
  }

  return { render, openEditor };
})();
