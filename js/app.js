/* 主程式：畫面切換、瀏覽器、筆記本、劇情觸發、結局 */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const SEALED_LABEL = '▒▒▒▒.local';
  const ORDER = ['home', 'mail', 'bbs', 'chat', 'ftp', 'terminal', 'admin'];

  const AUTHOR = {
    threads: 'https://www.threads.com/@suuuuuhaooooo',
    handle: '@suuuuuhaooooo',
    support: 'https://suuuuuhaooooo.bobaboba.me/'
  };

  const SUMMARY = {
    1: '真正的最後更新：2004/11/29 03:47',
    2: '被藏起來的信：kei 寄來的論壇連結',
    3: '被刪除的會員：#6 keeper',
    4: '最後一句話：「它在」　2004/11/23 23:58',
    5: '最後的備份：old_photos.zip',
    6: '登入身分：keeper'
  };

  const App = {
    history: [], hi: -1, cur: null, loadingTimer: null,

    /* ---------- 啟動 ---------- */
    init() {
      State.load();
      this.applySettings();
      this.refreshTitle();

      $('#btn-new').addEventListener('click', () => this.newGame());
      $('#btn-continue').addEventListener('click', () => { SFX.unlock(); SFX.click(); this.openBrowser(); });
      $('#btn-skip').addEventListener('click', () => this.finishBoot());
      $('#prologue-link').addEventListener('click', e => { e.preventDefault(); SFX.click(); this.openBrowser('home.local/'); });
      $$('[data-author="threads"]').forEach(a => { a.href = AUTHOR.threads; });
      $$('[data-author="support"]').forEach(a => { a.href = AUTHOR.support; });

      this.bindBrowser();
      this.tickClock();
      setInterval(() => this.tickClock(), 1000);
    },

    refreshTitle() {
      $('#btn-continue').hidden = !State.hasSave();
      $('#title-archive').textContent = State.flag('ending')
        ? 'ARCHIVE NO. 2003-0817 · MAINTAINER: YOU'
        : 'ARCHIVE NO. 2003-0817 · ACCESS RESTRICTED';
    },

    show(id) { $$('.screen').forEach(s => { s.hidden = s.id !== id; }); },

    applySettings() {
      const st = State.data.settings;
      SFX.enabled = st.sound;
      document.body.classList.toggle('no-crt', !st.crt);
    },

    async newGame() {
      SFX.unlock();
      if (State.hasSave()) {
        const ok = await UI.dialog({
          title: '開始新的調查', icon: 'warn',
          html: '已經有一份調查紀錄。重新開始會清除所有線索、筆記與進度。<br>確定要重新開始嗎？',
          buttons: [{ label: '重新開始', value: true, primary: true }, { label: '取消', value: false }]
        });
        if (!ok) return;
      }
      State.reset();
      State.data.player.started = true;
      State.data.player.startedAt = new Date().toISOString();
      State.add('clues', 'prologue');
      this.history = []; this.hi = -1; this.cur = null;
      this.boot();
    },

    /* ---------- 撥接 ---------- */
    boot() {
      this.show('screen-boot');
      const steps = [
        [0, 2, '正在初始化數據機...', 'ATZ\nOK'],
        [900, 12, '正在撥號 (02) 2003-0817...', 'ATDT 0220030817'],
        [2600, 30, '正在等待對方回應...', ''],
        [3500, 48, '已連接，正在交握...', 'CONNECT 56000/V90'],
        [5000, 72, '正在驗證使用者名稱及密碼...', 'LOGIN: guest\nPASSWORD: ********'],
        [6200, 90, '正在網路上註冊您的電腦...', 'IP 10.20.03.17'],
        [7000, 100, '已連線，速度 56.0 Kbps', 'OK']
      ];
      const log = $('#dial-log'); log.textContent = '';
      $('#dial-bar').style.width = '0%';
      SFX.dialup();
      this.bootTimers = steps.map(([t, pct, txt, l]) => setTimeout(() => {
        $('#dial-status').textContent = txt;
        $('#dial-bar').style.width = pct + '%';
        if (l) log.textContent += l + '\n';
        log.scrollTop = log.scrollHeight;
      }, t));
      this.bootTimers.push(setTimeout(() => this.finishBoot(), 8200));
    },

    finishBoot() {
      (this.bootTimers || []).forEach(clearTimeout);
      this.bootTimers = [];
      SFX.stopDial();
      SFX.ding();
      const d = new Date();
      $('#prologue-date').textContent = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      this.show('screen-prologue');
    },

    /* ---------- 瀏覽器 ---------- */
    openBrowser(url) {
      this.show('screen-browser');
      this.renderSidebar();
      this.renderNotebook();
      $('#notes').value = State.data.notes || '';
      this.navigate(url || State.data.flags.lastUrl || 'home.local/');
    },

    bindBrowser() {
      document.addEventListener('click', e => {
        const a = e.target.closest('[data-act]');
        if (a && !a.closest('.modal')) { e.preventDefault(); this.act(a.dataset.act, a); }
      });

      $('#addr-form').addEventListener('submit', e => {
        e.preventDefault();
        $('#addr').blur();
        this.navigate($('#addr').value);
      });

      $('#site-select').addEventListener('change', e => { if (e.target.value) this.navigate(e.target.value + '/'); });

      const page = $('#page');
      page.addEventListener('click', e => {
        if (e.target.closest('[data-act]')) return;
        const go = e.target.closest('[data-go]');
        const ph = e.target.closest('[data-photo]');
        const cl = e.target.closest('[data-clue]');
        if (cl) this.collect(cl.dataset.clue, cl);
        if (ph) { e.preventDefault(); this.openPhoto(ph.dataset.photo); return; }
        if (go) { e.preventDefault(); this.navigate(go.dataset.go); return; }
        const a = e.target.closest('a');
        if (a && !a.target) e.preventDefault();
      });

      page.addEventListener('submit', e => {
        const f = e.target.closest('[data-form]');
        if (!f) return;
        e.preventDefault();
        const kind = f.dataset.form;
        if (kind === 'mail-login') this.mailLogin(f);
        else if (kind === 'mail-search') { SFX.click(); MailSearch(f.querySelector('[name=q]').value); }
        else if (kind === 'puzzle') this.puzzleSubmit(f);
      });

      $$('.nb-tabs button').forEach(b => b.addEventListener('click', () => this.tab(b.dataset.tab)));

      let t;
      $('#notes').addEventListener('input', e => {
        clearTimeout(t);
        t = setTimeout(() => { State.data.notes = e.target.value; State.save(); this.status('筆記已儲存'); }, 400);
      });

      $('#goal-panel').addEventListener('click', e => {
        const h = e.target.closest('[data-hint]');
        if (h) this.hint(h.dataset.hint);
      });

      $('#site-list').addEventListener('click', e => {
        const li = e.target.closest('[data-host]');
        if (li) this.navigate(li.dataset.host + '/');
      });
      $('#history-list').addEventListener('click', e => {
        const li = e.target.closest('[data-url]');
        if (li) this.navigate(li.dataset.url);
      });
    },

    async act(name, el) {
      SFX.click();
      switch (name) {
        case 'back': if (this.hi > 0) { this.hi--; this.load(this.history[this.hi]); } else SFX.error(); break;
        case 'fwd': if (this.hi < this.history.length - 1) { this.hi++; this.load(this.history[this.hi]); } else SFX.error(); break;
        case 'reload': if (this.cur) this.load(this.cur.url); break;
        case 'home': this.navigate('home.local/'); break;
        case 'source': this.viewSource(); break;
        case 'notes-toggle': this.toggleNotes(); break;
        case 'settings': this.settings(); break;
        case 'help': this.help(); break;
        case 'menu-file': this.fileMenu(); break;
        case 'pw-hint': {
          State.flag('pwHint', true);
          const q = document.getElementById('wm-hintq'); if (q) q.hidden = false;
          break;
        }
        case 'cron-disable':
          SFX.error();
          UI.dialog({ title: '排程工作', icon: 'err', html: '權限不足。<br>此排程由 <b>keeper</b> 擁有，無法停用。<br><br><span class="muted">要讓它停下來，請使用「終止程序」。</span>' });
          break;
        case 'open-last-mail': {
          const ok = State.flag('openedLastMail') || await UI.dialog({
            title: '郵件佇列', icon: 'warn',
            html: '這是佇列裡的<b>最後一封郵件</b>。<br><br><span class="muted">「尤其不要打開最後一封郵件。」</span><br><br>仍要開啟嗎？',
            buttons: [{ label: '開啟', value: true, primary: true }, { label: '取消', value: false }]
          });
          if (ok) { SFX.glitch(); this.navigate('admin.local/queue/1'); }
          break;
        }
        case 'min': SFX.error(); this.status('無法最小化：有程序仍在執行中。'); break;
        case 'max': document.body.classList.toggle('maxed'); break;
        case 'close': this.closeBrowser(); break;
      }
    },

    navigate(input) {
      const { host, path } = Router.parse(input);
      const url = host + '/' + path;
      if (this.cur && this.cur.url === url) { this.load(url); return; }
      this.history = this.history.slice(0, this.hi + 1);
      this.history.push(url);
      this.hi = this.history.length - 1;
      this.load(url);
    },

    load(url) {
      const { host, path } = Router.parse(url);
      const full = 'http://' + host + '/' + path;
      $('#addr').value = full;
      clearTimeout(this.loadingTimer);
      SFX.nav();
      this.status('正在開啟網頁 ' + full + '...');
      $('#throbber').classList.add('on');
      const bar = $('#status-bar');
      bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth;
      bar.style.transition = 'width .55s linear'; bar.style.width = '85%';
      $('#page').classList.add('loading');

      const site = Router.site(host);
      if (site && Router.reachable(site) && State.add('discovered', site.id)) {
        this.renderSidebar();
        setTimeout(() => UI.toast(`已加入「我的最愛」：<b>${host}</b>`), 700);
      }

      const delay = 380 + Math.random() * 420;
      this.loadingTimer = setTimeout(() => {
        // 劇情：第三次回到首頁時，網站短暫「消失」
        if (host === 'home.local' && path === '' && (State.data.visits['home.local/'] || 0) === 2 && !State.flag('glitch404')) {
          State.flag('glitch404', true);
          this.render(url, Object.assign(ErrorPages.notFound(host, 'index.html'), { site }));
          this.glitch(600);
          this.loadingTimer = setTimeout(() => { this.status('正在重新連線...'); this.load(url); }, 1700);
          return;
        }
        this.render(url, Router.resolve(host, path));
      }, delay);
    },

    render(url, res) {
      const page = $('#page');
      page.className = 'page ' + (res.cls || '');
      page.innerHTML = res.html;
      $('#viewport').scrollTop = 0;
      page.querySelectorAll('[data-clue]').forEach(el => { if (State.has('clues', el.dataset.clue)) el.classList.add('noted'); });
      this.cur = { url, res };
      this.setTitle(res.title);
      if (res.after) res.after(page);
      $('#status-bar').style.width = '100%';
      $('#throbber').classList.remove('on');
      setTimeout(() => { $('#status-bar').style.transition = 'none'; $('#status-bar').style.width = '0%'; }, 250);
      this.status('完成');
      State.data.flags.lastUrl = url; State.save();
      this.pushHistory(url, res.title);
      this.syncSelect();
      // 桌機自動聚焦輸入框（手機不自動跳出鍵盤）
      if (!matchMedia('(max-width: 820px)').matches) {
        const f = page.querySelector('[data-form=puzzle] input[name=answer], .tm-in');
        if (f) setTimeout(() => f.focus({ preventScroll: true }), 50);
      }
    },

    glitch(ms) {
      SFX.glitch();
      document.body.classList.add('glitching');
      setTimeout(() => document.body.classList.remove('glitching'), ms || 600);
    },

    setTitle(t) {
      this.pageTitle = t || '';
      $('#win-title').textContent = (t ? t + ' - ' : '') + 'DEAD LINK BROWSER v1.0';
      document.title = (t ? t + ' · ' : '') + 'PROJECT: DEAD LINK';
    },

    status(t) { $('#status-text').textContent = t; },

    pushHistory(url, title) {
      const h = State.data.flags.hist || [];
      const i = h.findIndex(x => x[0] === url);
      if (i >= 0) h.splice(i, 1);
      h.unshift([url, title || url]);
      State.data.flags.hist = h.slice(0, 8);
      State.save();
      $('#history-list').innerHTML = State.data.flags.hist.map(([u, t]) => `<li data-url="${u}" title="http://${u}">${UI.esc(t)}</li>`).join('');
    },

    renderSidebar() {
      $('#site-list').innerHTML = ORDER.map(id => {
        const s = SITES[id];
        return State.has('discovered', id)
          ? `<li data-host="${s.host}"><span class="fav-ico ${id}"></span>${s.host}</li>`
          : `<li class="sealed"><span class="fav-ico"></span>${SEALED_LABEL}</li>`;
      }).join('');
      $('#site-select').innerHTML = '<option value="">我的最愛 ▾</option>' +
        ORDER.filter(id => State.has('discovered', id)).map(id => `<option value="${SITES[id].host}">${SITES[id].host}</option>`).join('');
      this.syncSelect();
    },

    syncSelect() {
      const sel = $('#site-select');
      const host = this.cur ? Router.parse(this.cur.url).host : '';
      sel.value = [...sel.options].some(o => o.value === host) ? host : '';
    },

    /* ---------- 謎題 ---------- */
    puzzleSubmit(form) {
      const pid = form.dataset.pid;
      const input = form.querySelector('[name=answer]');
      const msg = form.querySelector('[data-msg]');
      const r = PuzzleEngine.check(pid, input.value);
      msg.className = 'wm-msg';
      if (r.ok) {
        SFX.success();
        msg.classList.add('ok');
        msg.textContent = '正確。';
        input.disabled = true;
        const url = this.cur && this.cur.url;
        setTimeout(() => { if (!this.inEnding && this.cur && this.cur.url === url) this.load(url); }, 900);
        return;
      }
      this.wrong(form, input, msg, r, pid);
    },

    wrong(form, input, msg, r, pid) {
      SFX.error();
      msg.classList.add(r.soft ? 'soft' : 'bad');
      msg.textContent = r.msg;
      input.select();
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      if (!r.soft && r.count === 3 && !PuzzleEngine.hintsShown(pid)) {
        setTimeout(() => UI.toast('卡住了嗎？筆記本的「目標」頁可以打開提示。', 3400), 900);
      }
    },

    mailLogin(form) {
      const input = form.querySelector('[name=pw]');
      const msg = form.querySelector('[data-msg]');
      const r = PuzzleEngine.check('p1', input.value);
      msg.className = 'wm-msg';
      if (r.ok) {
        SFX.success();
        msg.classList.add('ok');
        msg.textContent = '驗證成功。正在載入信箱……';
        setTimeout(() => this.navigate('mail.local/inbox'), 1100);
        return;
      }
      this.wrong(form, input, msg, r, 'p1');
    },

    onSolved(pid) {
      // 解鎖網站
      Object.entries(SITE_GATES).forEach(([id, gate]) => {
        if (gate === pid && State.add('discovered', id)) {
          setTimeout(() => UI.toast(`新的網站已可連線：<b>${SITES[id].host}</b>`, 3200), 1200);
        }
      });
      if (pid === 'p6c') {
        const d = new Date();
        State.data.flags.adminLoginStamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
        State.save();
      }
      const ch = CHAPTERS.find(c => c.puzzles.includes(pid));
      State.data.player.currentChapter = (PuzzleEngine.currentChapter() || { id: 7 }).id;
      State.save();
      this.renderSidebar();
      this.renderNotebook();
      this.flashBadge();
      if (pid === 'p7b') { setTimeout(() => this.ending(), 1200); return; }
      if (ch && PuzzleEngine.chapterDone(ch) && !State.flag('chDone' + ch.id)) {
        State.flag('chDone' + ch.id, true);
        setTimeout(() => this.chapterDialog(ch), pid === 'p1' ? 2400 : 1500);
      }
    },

    async chapterDialog(ch) {
      const next = CHAPTERS.find(c => c.id === ch.id + 1);
      SFX.success();
      await UI.dialog({
        title: 'ARCHIVE NO. 2003-0817', cls: 'chapter-dlg',
        html: `<div class="chap-done">
  <div class="cd-code">${ch.code} — ${ch.name}</div>
  <div class="cd-state">COMPLETE</div>
  <div class="cd-line">${SUMMARY[ch.id] || ''}</div>
  ${ch.unlockText ? `<div class="cd-unlock">已解鎖：<b>${ch.unlockText}</b></div>` : ''}
  ${next ? `<div class="cd-next">NEXT ▸ ${next.code} — ${next.name}</div>` : ''}
</div>`,
        buttons: [{ label: '繼續', value: true, primary: true }]
      });
      if (ch.id === 1) setTimeout(() => UI.toast('收件匣 (4)……？', 3000), 1200);
      if (ch.id === 6) setTimeout(() => this.glitch(900), 800);
    },

    /* ---------- 線索 ---------- */
    collect(id, el) {
      const c = CLUES[id];
      if (!c) return;
      if (el) el.classList.add('noted');
      if (State.add('clues', id)) {
        SFX.ding();
        UI.toast(`✎ 已記下線索：<b>${c.title}</b>`);
        this.renderNotebook();
        this.flashBadge();
      }
    },

    flashBadge() {
      const n = State.data.clues.length;
      ['#clue-count', '#badge-m'].forEach(s => { const b = $(s); b.textContent = n; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
    },

    tab(name) {
      $$('.nb-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
      $$('.nb-panel').forEach(p => { p.hidden = p.dataset.panel !== name; });
    },

    renderNotebook() {
      const S = State.data;
      $('#clue-count').textContent = S.clues.length;
      $('#badge-m').textContent = S.clues.length;
      $('#clue-list').innerHTML = S.clues.length
        ? S.clues.slice().reverse().map(id => {
          const c = CLUES[id]; if (!c) return '';
          return `<li><div class="cl-t">${c.title}</div><div class="cl-x">${c.text}</div><div class="cl-f">來源：${c.from}</div></li>`;
        }).join('')
        : '<li class="empty">還沒有線索。看到可疑的地方，點一下就能記下來。</li>';

      const total = PuzzleEngine.total(), done = PuzzleEngine.solvedCount();
      const ch = PuzzleEngine.currentChapter();
      let html;
      if (!ch) {
        html = `<div class="ch-card end"><div class="ch-code">ARCHIVE NO. 2003-0817</div><div class="ch-name">MAINTAINER: YOU</div></div>
<div class="goal-txt">調查結束了。</div>
<div class="goal-where">謎題 ${done} / ${total}　·　線索 ${S.clues.length} / ${Object.keys(CLUES).length}</div>
<div class="goal-tip">網站還在運作。<br>回首頁看看——它記得你來過。<br><br>有些事情，它到現在都還沒告訴你：<br>・窗戶玻璃上的，是誰？<br>・Daniel 後來去了哪裡？</div>`;
      } else {
        const active = PuzzleEngine.activePuzzle(ch);
        const items = ch.puzzles.map(id => {
          const p = PUZZLES[id];
          const ok = PuzzleEngine.isSolved(id);
          const cls = ok ? 'ok' : id === active ? 'on' : '';
          return `<li class="${cls}"><span class="mk">${ok ? '✔' : id === active ? '▸' : '○'}</span>${p.optional && !ok ? '（隱藏）？？？' : p.title}</li>`;
        }).join('');
        let hintBlock = '';
        if (active) {
          const p = PUZZLES[active];
          const used = PuzzleEngine.hintsShown(active);
          hintBlock = `<div class="goal-where">目前：<b>${p.title}</b><br><span class="dn-small">地點：${p.where}</span></div>
<ol class="hint-list">${p.hints.slice(0, used).map((h, i) => `<li><b>提示 ${i + 1}</b>　${h}</li>`).join('')}</ol>
${used < 3 ? `<button class="w-btn small" data-hint="${active}">${used ? '再給我一個提示' : '我需要提示'}（${used}/3）</button>` : '<div class="dn-small">提示已全部用完。最後一步交給你。</div>'}`;
        }
        html = `<div class="ch-card"><div class="ch-code">${ch.code}</div><div class="ch-name">${ch.name}</div></div>
<div class="goal-txt"><b>目標：</b>${ch.goal}</div>
<ul class="pz-list">${items}</ul>
${hintBlock}
<div class="goal-prog">全部謎題 <b>${done}</b> / ${total}<div class="w-progress"><div style="width:${done / total * 100}%"></div></div></div>
${ch.id <= 2 ? `<div class="goal-tip">調查小技巧<br>・可疑的文字或圖片，點一下就能記到筆記本。<br>・瀏覽器上方的「原始碼」也是網頁的一部分。<br>・網址列可以直接輸入路徑。<br>・答錯不會失去任何進度。</div>` : ''}`;
      }
      $('#goal-panel').innerHTML = html;
    },

    async hint(pid) {
      if (PuzzleEngine.hintsShown(pid) === 0 && !State.flag('hintIntro')) {
        const ok = await UI.dialog({
          title: '提示系統', icon: 'info',
          html: '提示會一步一步引導方向，但不會直接給出答案。<br>每道謎題有三個提示。要打開第一個嗎？',
          buttons: [{ label: '打開提示', value: true, primary: true }, { label: '我再找找', value: false }]
        });
        if (!ok) return;
        State.flag('hintIntro', true);
      }
      if (PuzzleEngine.nextHint(pid)) { SFX.ding(); this.renderNotebook(); }
    },

    toggleNotes() {
      if (matchMedia('(max-width: 820px)').matches) document.body.classList.toggle('drawer-open');
      else document.body.classList.toggle('notes-hidden');
    },
    closeDrawer() { document.body.classList.remove('drawer-open'); },

    /* ---------- 原始碼、照片 ---------- */
    viewSource() {
      if (!this.cur) return;
      const { url, res } = this.cur;
      UI.source('view-source:http://' + url, res.html, res.title);
      if (res.sourceClue) setTimeout(() => this.collect(res.sourceClue), 500);
    },

    openPhoto(id) {
      const p = Photos.get(id);
      UI.photo(p);
      if (p.clue) {
        setTimeout(() => this.collect(p.clue), 1400);
        if (!State.flag('glitchTitle')) {
          State.flag('glitchTitle', true);
          setTimeout(() => {
            this.glitch(1300);
            $('#win-title').textContent = '他還在這裡 - DEAD LINK BROWSER v1.0';
            setTimeout(() => this.setTitle(this.pageTitle), 1300);
          }, 2200);
        }
      }
    },

    /* ---------- 結局 ---------- */
    async ending() {
      this.inEnding = true;
      State.flag('ending', true);
      State.data.flags.endedAt = new Date().toISOString();
      State.save();
      this.closeDrawer();
      this.glitch(1200);
      await wait(1300);
      this.show('screen-ending');
      const out = $('#end-log');
      out.textContent = '';
      $('#end-credits').hidden = true;
      const d = new Date();
      const now = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const lines = [
        ['> kill 817', 900],
        ['keeper.pl (817) 已終止。', 1200],
        ['home.local 停止運作中', 400], ['.', 500], ['.', 500], ['.', 1400],
        ['', 300],
        ['網站已離線。', 2200],
        ['', 800],
        ['03:47:00  crond: 執行排程工作 keeper.pl', 1100],
        ['03:47:00  keeper.pl (pid 1130) 啟動', 900],
        ['03:47:00  執行者：10.20.03.17', 1600],
        ['', 300],
        ['你回答了它的問題。', 1800],
        ['它記住了你的答案，也記住了你。', 2000],
        ['', 400],
        [`最後登入：${now}　使用者：你`, 2200],
        ['', 400],
        ['從今天起，由你來記得。', 2400]
      ];
      for (const [t, ms] of lines) {
        if (t === '.') out.textContent = out.textContent.replace(/\n$/, '') + '.\n';
        else out.textContent += t + '\n';
        if (t) SFX.click();
        await wait(ms);
      }
      SFX.glitch();
      const start = State.data.player.startedAt ? new Date(State.data.player.startedAt) : null;
      const mins = start ? Math.max(1, Math.round((Date.now() - start.getTime()) / 60000)) : 0;
      const h = PuzzleEngine.total();
      $('#end-stats').innerHTML = `謎題 ${PuzzleEngine.solvedCount()} / ${h}　·　線索 ${State.data.clues.length} / ${Object.keys(CLUES).length}　·　提示 ${Object.values(State.data.hintsUsed).reduce((a, b) => a + b, 0)} 次${mins ? `　·　調查時間 ${mins >= 60 ? Math.floor(mins / 60) + ' 小時 ' : ''}${mins % 60} 分鐘` : ''}`;
      $('#end-credits').hidden = false;
      SFX.success();
    },

    afterEnding(where) {
      this.inEnding = false;
      if (where === 'site') { this.openBrowser('home.local/'); }
      else { this.refreshTitle(); this.show('screen-title'); }
    },

    /* ---------- 選單 ---------- */
    async settings() {
      const st = State.data.settings;
      const v = await UI.dialog({
        title: '網際網路選項', icon: 'info',
        html: `<label class="opt"><input type="checkbox" id="opt-sound" ${st.sound ? 'checked' : ''}> 播放音效</label>
<label class="opt"><input type="checkbox" id="opt-crt" ${st.crt ? 'checked' : ''}> CRT 掃描線效果</label>
<hr><div class="dn-small">調查紀錄只儲存在這台裝置的瀏覽器裡。</div>`,
        buttons: [{ label: '確定', value: 'ok', primary: true }, { label: '清除進度並重新開始', value: 'reset' }]
      });
      if (v === 'reset') this.resetAll();
    },

    async resetAll() {
      const ok = await UI.dialog({
        title: '清除調查紀錄', icon: 'warn',
        html: '所有線索、筆記與進度都會被刪除，無法復原。',
        buttons: [{ label: '刪除', value: true, primary: true }, { label: '取消', value: false }]
      });
      if (!ok) return;
      State.reset();
      location.reload();
    },

    help() {
      UI.dialog({
        title: '關於 DEAD LINK BROWSER', icon: 'info',
        html: `<b>PROJECT: DEAD LINK　死亡連結</b><br><br>
・點選連結、在網址列輸入位址來瀏覽「舊網路」。<br>
・可疑的文字、圖片點一下會記到筆記本。<br>
・「原始碼」可以看到網頁背後的 HTML。<br>
・筆記本的「目標」頁有分級提示，不會直接給答案。<br>
・輸入錯誤不會讓你失去任何進度，進度會自動儲存。<br><br>
作者：<a href="${AUTHOR.threads}" target="_blank" rel="noopener">${AUTHOR.handle}（Threads）</a><br>
喜歡這個遊戲嗎？<a href="${AUTHOR.support}" target="_blank" rel="noopener">贊助作者</a>`
      });
    },

    async fileMenu() {
      const v = await UI.dialog({
        title: '檔案', icon: 'info', html: '要做什麼？',
        buttons: [{ label: '中斷連線', value: 'close', primary: true }, { label: '取消', value: null }]
      });
      if (v === 'close') this.closeBrowser(true);
    },

    async closeBrowser(skip) {
      const ok = skip || await UI.dialog({
        title: 'DEAD LINK BROWSER', icon: 'warn',
        html: '要中斷連線並回到標題畫面嗎？<br>進度已自動儲存。<br><br><span class="muted">……它會記得你來過。</span>',
        buttons: [{ label: '中斷連線', value: true, primary: true }, { label: '取消', value: false }]
      });
      if (!ok) return;
      SFX.error();
      this.closeDrawer();
      this.refreshTitle();
      this.show('screen-title');
      document.title = 'PROJECT: DEAD LINK';
    },

    tickClock() {
      const d = new Date();
      const el = document.getElementById('clock');
      if (el) el.textContent = `2004/11/23 ${pad(d.getHours())}${d.getSeconds() % 2 ? ':' : ' '}${pad(d.getMinutes())}`;
    }
  };

  document.addEventListener('change', e => {
    if (e.target.id === 'opt-sound') { State.data.settings.sound = e.target.checked; State.save(); App.applySettings(); if (e.target.checked) SFX.ding(); }
    if (e.target.id === 'opt-crt') { State.data.settings.crt = e.target.checked; State.save(); App.applySettings(); }
  });

  // 對話框裡的外部連結（作者、贊助）要能正常開啟
  document.addEventListener('click', e => {
    const a = e.target.closest('.modal a[target=_blank]');
    if (a) { e.stopPropagation(); }
  }, true);

  function pad(n) { return String(n).padStart(2, '0'); }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  window.App = App;
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
