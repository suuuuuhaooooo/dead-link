/* 共用介面：XP 對話框、提示訊息、原始碼檢視器、看圖 */
(function () {
  const layer = () => document.getElementById('modal-layer');

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  const UI = {
    esc,

    dialog({ title, html, buttons = [{ label: '確定', value: true, primary: true }], icon, wide, cls }) {
      return new Promise(resolve => {
        const wrap = document.createElement('div');
        wrap.className = 'modal';
        wrap.innerHTML = `<div class="xp-window dlg ${wide ? 'wide' : ''} ${cls || ''}" role="dialog" aria-modal="true">
  <div class="xp-title"><span class="xp-title-text">${title}</span><span class="xp-title-btns"><button class="tbtn x" data-v="__close" aria-label="關閉">×</button></span></div>
  <div class="dlg-body">${icon ? `<span class="dlg-ico ${icon}">${icon === 'warn' ? '!' : icon === 'err' ? '×' : 'i'}</span>` : ''}<div class="dlg-content">${html}</div></div>
  <div class="dlg-btns">${buttons.map((b, i) => `<button class="w-btn${b.primary ? ' primary' : ''}" data-i="${i}">${b.label}</button>`).join('')}</div>
</div>`;
        layer().appendChild(wrap);
        const close = v => { wrap.remove(); resolve(v); };
        wrap.addEventListener('click', e => {
          const b = e.target.closest('[data-i],[data-v]');
          if (!b) return;
          SFX.click();
          if (b.dataset.v === '__close') return close(null);
          close(buttons[+b.dataset.i].value);
        });
        const p = wrap.querySelector('.w-btn.primary') || wrap.querySelector('.w-btn');
        if (p) setTimeout(() => p.focus(), 30);
        UI._escClose = () => close(null);
      });
    },

    toast(text, ms) {
      const t = document.getElementById('toast');
      t.innerHTML = text;
      t.hidden = false;
      t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
      clearTimeout(UI._tt);
      UI._tt = setTimeout(() => { t.hidden = true; }, ms || 2600);
    },

    highlight(src) {
      let s = esc(src.trim())
        .replace(/ data-[a-z-]+="[^"]*"/g, '')
        .replace(/ data-[a-z-]+(?=[ &])/g, '');
      // 註解
      s = s.replace(/&lt;!--[\s\S]*?--&gt;/g, m => `<span class="hl-c">${m}</span>`);
      // 標籤（避開註解）
      s = s.replace(/(&lt;\/?)([a-z0-9]+)((?:(?!&gt;)[\s\S])*?)(\/?&gt;)/gi, (m, a, tag, attrs, b) => {
        if (m.indexOf('hl-c') >= 0) return m;
        attrs = attrs.replace(/([a-z-]+)=("[^"]*")/gi, '<span class="hl-a">$1</span>=<span class="hl-v">$2</span>');
        return `<span class="hl-t">${a}${tag}</span>${attrs}<span class="hl-t">${b}</span>`;
      });
      return s;
    },

    source(url, html, title) {
      const doc = `<html>\n<head>\n<meta http-equiv="Content-Type" content="text/html; charset=big5">\n<title>${title || ''}</title>\n</head>\n<body>\n${html.trim()}\n</body>\n</html>`;
      const lines = this.highlight(doc).split('\n');
      const numbered = lines.map((l, i) => `<span class="ln">${String(i + 1).padStart(3, ' ')}</span>${l}`).join('\n');
      return this.dialog({
        title: `${url} - 記事本`,
        html: `<pre class="src-view">${numbered}</pre>`,
        buttons: [{ label: '關閉', value: true, primary: true }],
        wide: true, cls: 'notepad'
      });
    },

    photo(p) {
      const wrap = document.createElement('div');
      wrap.className = 'modal';
      wrap.innerHTML = `<div class="xp-window dlg photo-dlg" role="dialog" aria-modal="true">
  <div class="xp-title"><span class="xp-title-text">${p.file} - 圖片與傳真檢視器</span><span class="xp-title-btns"><button class="tbtn x" data-v="__close">×</button></span></div>
  <div class="photo-stage"><canvas></canvas><div class="photo-load"><i></i></div></div>
  <table class="photo-info" cellspacing="0">
    <tr><th>檔名</th><td>${p.file}</td></tr>
    <tr><th>尺寸</th><td>640 × 480　JPEG　${p.id === '1129' ? '38' : '52'} KB</td></tr>
    <tr><th>拍攝日期</th><td>${p.date}</td></tr>
    <tr><th>說明</th><td>${p.caption || '<span class="muted">（無）</span>'}</td></tr>
  </table>
  <div class="dlg-btns">${p.id === '1129' ? `<a class="w-btn" href="${RealURL.file('home.local/photos/dsc_1129_0347.html')}" target="_blank" rel="opener" data-side="home.local/photos/dsc_1129_0347.html">以原始大小開啟（新視窗）</a>` : ''}<button class="w-btn primary" data-v="__close">關閉</button></div>
</div>`;
      layer().appendChild(wrap);
      Photos.draw(wrap.querySelector('canvas'), p.id);
      // 模擬撥接時代慢慢載入
      const ld = wrap.querySelector('.photo-load');
      requestAnimationFrame(() => ld.classList.add('go'));
      setTimeout(() => ld.remove(), 1300);
      return new Promise(res => {
        const close = () => { wrap.remove(); res(); };
        wrap.addEventListener('click', e => { if (e.target.closest('[data-v]') || e.target === wrap) { SFX.click(); close(); } });
        UI._escClose = close;
      });
    }
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && UI._escClose && document.querySelector('#modal-layer .modal')) {
      const f = UI._escClose; UI._escClose = null; f();
    }
  });

  window.UI = UI;
})();
