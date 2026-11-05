/* terminal.local — 主機終端機（第六章） */
(function () {
  const T = 'terminal.local';
  const solved = id => State.has('solved', id);
  const pad = n => String(n).padStart(2, '0');

  const ADMIN_TXT = '給 kei：\n\n如果你走到這裡，代表你已經比我還接近它了。\n\n後台：http://admin.local/\n帳號：那個被我刪掉的會員，它原本的名字。\n密碼：開站那天（8 位數字）＋ 最後那份備份的密碼，直接接在一起。\n安全碼：它「現在」的程序編號。\n\n登入以後，把它關掉。\n\n還有——\n不要回答它的問題。\n\n— D';

  function b64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/(.{64})/g, '$1\n');
  }
  function unb64(s) {
    const bin = atob(s.replace(/\s/g, ''));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function keeperLog() {
    const d = new Date();
    const today = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    return [
      '2003/08/17 23:46  start: keeper.pl (pid 101) by daniel',
      '2003/08/17 23:47  heartbeat: bbs account "keeper" registered (uid 6)',
      '2003/08/18 03:47  rebuild ok · backup ok · heartbeat ok',
      '        ⋮',
      '2004/09/02 03:47  dream: enabled by daniel',
      '2004/10/03 03:47  dream: wrote entry_1003.txt ("kei 今天穿了紅色的外套")',
      '2004/10/31 03:47  passwd: admin password changed (by keeper)',
      '2004/11/20 03:47  mail: replied to daniel as daniel',
      '2004/11/23 23:58  bbs: account "keeper" deleted by daniel — heartbeat continues as "."',
      '2004/11/23 23:59  backup: disabled by daniel',
      '2004/11/29 03:47  visitor: daniel (10.20.03.17)',
      '2004/11/29 03:50  signal: SIGTERM from daniel → pid 347 <defunct>',
      '2004/11/29 03:50  respawn: keeper.pl --watch (pid 817)',
      '2004/11/29 03:51  mail: drafts locked',
      '2004/11/29 03:52  ftp: old_photos.zip (unknown content, ignored)',
      '2004/11/29 03:53  visitor: daniel disconnected. last seen.',
      '2004/11/30 03:47  rebuild ok · heartbeat ok · greet: no visitor',
      '        ⋮　（略 八千多 行，內容相同）',
      `${today} ${pad(d.getHours())}:${pad(d.getMinutes())}  visitor: 10.20.03.17 — 歡迎回來。`
    ].join('\n');
  }

  /* 虛擬檔案系統 */
  const FS = {
    '/': ['etc', 'home', 'var', 'tmp'],
    '/etc': ['motd', 'passwd', 'hostname'],
    '/home': ['guest', 'daniel', 'keeper'],
    '/home/guest': ['README'],
    '/home/daniel': ['notes', '.plan'],
    '/home/daniel/notes': ['admin.txt', 'kei.txt'],
    '/home/keeper': [],
    '/var': ['log'],
    '/var/log': ['syslog', '.keeper.log'],
    '/tmp': ['.visitor']
  };
  const FILES = {
    '/etc/motd': '歡迎使用 OldNet 主機 terminal.local\n本主機將於 2004/12/31 停止服務。（此公告已過期 八千多 天）',
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/sh\nguest:x:1000:1000::/home/guest:/bin/sh\ndaniel:x:1001:1001:Daniel:/home/daniel:/bin/sh\nkeeper:x:1002:1001::/home/keeper:/usr/bin/perl',
    '/etc/hostname': 'terminal.local',
    '/home/guest/README': '給訪客：\n\n輸入 help 可以看到可用的指令。\n這台主機上有些東西還在執行。請不要打擾它。',
    '/home/daniel/.plan': '計畫：\n1. 讓它停下來\n2. 讓它停下來\n3. 讓它停下來',
    '/home/daniel/notes/admin.txt': () => b64(ADMIN_TXT),
    '/home/daniel/notes/kei.txt': 'kei，admin.txt 我編碼過了，因為它看得懂文字。\n你知道怎麼解：這台主機上就有工具。結尾那幾個等號是線索。',
    '/var/log/syslog': 'Nov 23 23:58:02 terminal bbs[120]: user keeper deleted by daniel\nNov 23 23:59:40 terminal crond[88]: backup job disabled\nNov 29 03:50:11 terminal kernel: keeper.pl[347]: terminated by signal 15\nNov 29 03:50:11 terminal kernel: keeper.pl[817]: started\n（其餘紀錄已輪替，詳細內容不在這裡。）',
    '/var/log/.keeper.log': keeperLog,
    '/tmp/.visitor': '10.20.03.17'
  };
  const OWNER = { '/home/daniel': 'daniel', '/home/keeper': 'keeper' };

  /* 終端機狀態（同一次遊玩中保留） */
  const S = { cwd: '/home/guest', user: 'guest', lines: null, hist: [], hi: -1, pending: null };

  function resolve(p) {
    if (!p || p === '~') return S.user === 'daniel' ? '/home/daniel' : '/home/guest';
    if (p.startsWith('~/')) p = (S.user === 'daniel' ? '/home/daniel/' : '/home/guest/') + p.slice(2);
    const parts = (p.startsWith('/') ? p : S.cwd + '/' + p).split('/');
    const out = [];
    parts.forEach(x => { if (!x || x === '.') return; if (x === '..') out.pop(); else out.push(x); });
    return '/' + out.join('/');
  }
  function allowed(path) {
    for (const [dir, who] of Object.entries(OWNER)) {
      if ((path === dir || path.startsWith(dir + '/')) && S.user !== who) return who;
    }
    return null;
  }
  function isDir(p) { return !!FS[p]; }
  function isFile(p) { return p in FILES; }
  function read(p) { const f = FILES[p]; return typeof f === 'function' ? f() : f; }

  function prompt() { return `${S.user}@terminal:${S.cwd.replace(/^\/home\/(guest|daniel)/, (m, u) => (u === S.user ? '~' : m))}$`; }

  const HELP = `可用的指令：
  ls [-a] [路徑]     列出檔案（-a 包含隱藏檔）
  cd 路徑            切換目錄
  pwd                顯示目前位置
  cat 檔案           顯示檔案內容
  base64 -d 檔案     解碼 Base64 檔案
  su 使用者          切換使用者
  whoami / id        我是誰
  ps                 執行中的程序
  kill PID           終止程序
  last               登入紀錄
  date               目前時間
  history            指令紀錄
  clear              清除畫面
  exit               登出`;

  function run(raw) {
    const line = raw.trim();
    if (!line) return '';
    const [cmd, ...args] = line.split(/\s+/);
    const flags = args.filter(a => a.startsWith('-')).join('');
    const target = args.filter(a => !a.startsWith('-'))[0];

    switch (cmd) {
      case 'help': case 'man': case '?': return HELP;
      case 'pwd': return S.cwd;
      case 'whoami': return S.user;
      case 'id': return S.user === 'daniel' ? 'uid=1001(daniel) gid=1001(daniel)' : 'uid=1000(guest) gid=1000(guest)';
      case 'hostname': return 'terminal.local';
      case 'uname': return 'OldNet 2.4.20 terminal.local i686 GNU/Linux';
      case 'clear': S.lines = []; return null;
      case 'echo': return args.join(' ');
      case 'history': return S.hist.slice().reverse().map((h, i) => `  ${i + 1}  ${h}`).join('\n');
      case 'date': { const d = new Date(); return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][2]} Nov 23 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} CST 2004`; }
      case 'who': return `${S.user}     pts/0    ${new Date().toTimeString().slice(0, 5)} (10.20.03.17)\nkeeper   ?        2004/11/29 03:50`;
      case 'last': return `${S.user}     pts/0    10.20.03.17    still logged in\nkeeper   cron     127.0.0.1      每天 03:47（八千多 次）\ndaniel   pts/0    10.20.03.17    2004/11/29 03:47 - 03:53\ndaniel   pts/0    10.20.03.17    2004/11/23 23:41 - 23:59`;
      case 'ps': {
        App.collect('term-ps');
        return `  PID USER     TIME      CMD
    1 root     0:01      init
   88 root     0:00      crond
  120 root     0:03      httpd
  347 keeper   0:00      [keeper.pl] &lt;defunct&gt;
  817 keeper   7612:47   perl keeper.pl --watch
 1130 ${S.user.padEnd(8)} 0:00      -sh
 1131 ${S.user.padEnd(8)} 0:00      ps`;
      }
      case 'kill': {
        if (!target) return 'kill: 用法：kill PID';
        if (target === '817') return 'kill: (817) - Operation not permitted\n（擁有者：keeper。請從後台終止。）';
        if (target === '347') return 'kill: (347) - No such process（它已經不在那裡了）';
        if (target === '1130') return 'kill: 你確定要殺掉自己嗎？';
        return `kill: (${UI.esc(target)}) - No such process`;
      }
      case 'cd': {
        const p = resolve(target);
        if (!isDir(p)) return isFile(p) ? `cd: ${UI.esc(target)}: 不是目錄` : `cd: ${UI.esc(target || '')}: 沒有此目錄`;
        const deny = allowed(p);
        if (deny) return `cd: ${UI.esc(target)}: Permission denied（擁有者：${deny}）`;
        S.cwd = p; return '';
      }
      case 'ls': case 'dir': {
        const p = resolve(target || S.cwd);
        if (isFile(p)) return p.split('/').pop();
        if (!isDir(p)) return `ls: ${UI.esc(target)}: 沒有此檔案或目錄`;
        const deny = allowed(p);
        if (deny) return `ls: ${UI.esc(target || p)}: Permission denied（擁有者：${deny}）`;
        let items = FS[p].filter(n => flags.includes('a') || !n.startsWith('.'));
        if (p === '/home/keeper') return '';
        if (flags.includes('a')) items = ['.', '..'].concat(items);
        return items.map(n => (isDir(resolve(p + '/' + n)) && n !== '.' && n !== '..' ? `<span class="tm-dir">${n}/</span>` : n)).join('   ') || '';
      }
      case 'cat': case 'more': case 'less': {
        if (!target) return 'cat: 請指定檔案';
        const p = resolve(target);
        if (isDir(p)) return `cat: ${UI.esc(target)}: 是一個目錄`;
        if (!isFile(p)) return `cat: ${UI.esc(target)}: 沒有此檔案或目錄`;
        const deny = allowed(p);
        if (deny) return `cat: ${UI.esc(target)}: Permission denied（擁有者：${deny}）`;
        if (p === '/var/log/.keeper.log') { setTimeout(() => { PuzzleEngine.solve('p6f'); App.collect('term-log'); }, 300); }
        return UI.esc(read(p));
      }
      case 'base64': {
        if (!flags.includes('d')) return 'base64: 這台主機只支援解碼。用法：base64 -d 檔案';
        if (!target) return 'base64: 請指定檔案';
        const p = resolve(target);
        if (!isFile(p)) return `base64: ${UI.esc(target)}: 沒有此檔案`;
        const deny = allowed(p);
        if (deny) return `base64: ${UI.esc(target)}: Permission denied（擁有者：${deny}）`;
        if (p !== '/home/daniel/notes/admin.txt') return 'base64: 輸入的內容不是有效的 Base64';
        setTimeout(() => { PuzzleEngine.solve('p6b'); App.collect('term-admin'); }, 300);
        return `<span class="tm-hi">${UI.esc(unb64(read(p)))}</span>`;
      }
      case 'su': {
        const who = target || 'root';
        if (who === S.user) return `su: 你已經是 ${who}`;
        if (who === 'guest') { S.user = 'guest'; S.cwd = '/home/guest'; return ''; }
        if (who === 'keeper') return 'su: keeper 沒有密碼。它不需要登入。';
        if (who === 'root') return 'su: root 已被停用（2004/12/31）';
        if (who !== 'daniel') return `su: 使用者 ${UI.esc(who)} 不存在`;
        S.pending = 'su-daniel';
        return 'Password:';
      }
      case 'exit': case 'logout':
        if (S.user === 'daniel') { S.user = 'guest'; S.cwd = '/home/guest'; return 'logout'; }
        return '登出後，終端機會在你下次回來時重新連線。\n……它會等你。';
      case 'sudo': return 'sudo: 這台主機沒有 sudo。';
      case 'rm': return 'rm: 這台主機上的東西刪不掉。Daniel 試過了。';
      case 'telnet': case 'ssh': return '你已經在這裡了。';
      case 'keeper': case 'keeper.pl': case 'perl': return '……';
      default: return `${UI.esc(cmd)}: 找不到指令。輸入 help 查看可用的指令。`;
    }
  }

  function submit(raw) {
    if (S.pending === 'su-daniel') {
      S.pending = null;
      S.lines.push(`<span class="tm-p">Password:</span> ${'*'.repeat(Math.min(raw.length, 16))}`);
      const r = PuzzleEngine.check('p6a', raw);
      if (r.ok) {
        S.user = 'daniel'; S.cwd = '/home/daniel';
        SFX.success();
        S.lines.push('<span class="tm-hi">驗證成功。歡迎回來，daniel。</span>\n（你最後一次登入：2004/11/29 03:53）');
      } else {
        SFX.error();
        S.lines.push(UI.esc(r.msg.startsWith('su:') ? r.msg : 'su: 認證失敗（' + r.msg + '）'));
      }
      return;
    }
    S.lines.push(`<span class="tm-p">${prompt()}</span> ${UI.esc(raw)}`);
    if (raw.trim()) { S.hist.unshift(raw.trim()); S.hist = S.hist.slice(0, 50); }
    const out = run(raw);
    if (out === null) return;
    if (out) S.lines.push(out);
    if (out === 'Password:') S.lines.pop();
  }

  function mount(root) {
    if (!S.lines) {
      S.lines = [`OldNet terminal.local (pts/0)\n連線來源：10.20.03.17\n\n<span class="tm-dim">${UI.esc(FILES['/etc/motd'])}</span>\n\n你以 guest 身分登入。輸入 <b>help</b> 查看可用的指令。`];
    }
    const out = root.querySelector('.tm-out');
    const input = root.querySelector('.tm-in');
    const pr = root.querySelector('.tm-prompt');
    const draw = () => {
      out.innerHTML = S.lines.join('\n');
      pr.textContent = S.pending ? 'Password:' : prompt();
      input.type = S.pending ? 'password' : 'text';
      const box = root.querySelector('.tm-screen');
      box.scrollTop = box.scrollHeight;
    };
    draw();
    root.querySelector('.tm-form').addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value; input.value = ''; S.hi = -1;
      SFX.click();
      submit(v); draw();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' && S.hist.length) { S.hi = Math.min(S.hi + 1, S.hist.length - 1); input.value = S.hist[S.hi]; e.preventDefault(); }
      if (e.key === 'ArrowDown') { S.hi = Math.max(S.hi - 1, -1); input.value = S.hi < 0 ? '' : S.hist[S.hi]; e.preventDefault(); }
      if (e.key === 'Tab') {
        e.preventDefault();
        const parts = input.value.split(' '); const last = parts.pop();
        const base = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
        const dir = resolve(base || '.');
        const cand = (FS[dir] || []).filter(n => n.startsWith(last.slice(base.length)) && (!n.startsWith('.') || last.slice(base.length).startsWith('.')));
        if (cand.length === 1) { parts.push(base + cand[0] + (isDir(resolve(dir + '/' + cand[0])) ? '/' : '')); input.value = parts.join(' '); }
      }
    });
    root.querySelectorAll('[data-tm]').forEach(b => b.addEventListener('click', () => {
      SFX.click();
      if (b.dataset.tm === '__up') { if (S.hist.length) { S.hi = Math.min(S.hi + 1, S.hist.length - 1); input.value = S.hist[S.hi]; } input.focus(); return; }
      input.value = b.dataset.tm; input.focus();
      if (!b.dataset.tm.endsWith(' ')) { submit(b.dataset.tm); input.value = ''; draw(); }
    }));
    root.querySelector('.tm-screen').addEventListener('click', () => { if (!window.getSelection().toString()) input.focus({ preventScroll: true }); });
  }

  const pages = {
    '': {
      title: 'telnet://terminal.local',
      render(ctx) {
        return {
          html: `<div class="tm">
  <div class="tm-screen"><pre class="tm-out"></pre>
  <form class="tm-form" autocomplete="off"><span class="tm-prompt"></span><input class="tm-in" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="指令"></form></div>
  <div class="tm-keys"><button data-tm="ls">ls</button><button data-tm="ls -a">ls -a</button><button data-tm="cd ..">cd ..</button><button data-tm="cd ">cd …</button><button data-tm="cat ">cat …</button><button data-tm="help">help</button><button data-tm="__up">↑</button></div>
</div>`,
          after: mount
        };
      }
    }
  };

  window.SITES = window.SITES || {};
  window.SITES.terminal = { id: 'terminal', host: T, name: 'terminal.local', cls: 'site-term', pages };
})();
