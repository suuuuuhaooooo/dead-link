/* admin.local — 網站管理後台（第六章終點、第七章） */
(function () {
  const A = 'admin.local';
  const solved = id => State.has('solved', id);
  const pad = n => String(n).padStart(2, '0');

  function form(pid, label, type, note) {
    return `<form data-form="puzzle" data-pid="${pid}" class="ad-form">
  <label>${label}</label><input type="${type || 'text'}" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false"${type === 'tel' ? ' inputmode="numeric"' : ''}>
  <button class="w-btn" type="submit">確定</button>${note ? `<div class="dn-small">${note}</div>` : ''}
  <div class="wm-msg" data-msg></div>
</form>`;
  }

  function loginPage() {
    const done = (id, label, val) => `<div class="ad-done"><span>${label}</span><b>${val}</b> <span class="ok">（正確）</span></div>`;
    let body = '';
    if (solved('p6d')) body += done('p6d', '帳號', 'keeper');
    if (solved('p6e')) body += done('p6e', '密碼', '••••••••••••••');
    if (!solved('p6d')) body += form('p6d', '帳號', 'text');
    else if (!solved('p6e')) body += form('p6e', '密碼', 'password');
    else body += form('p6c', '安全碼', 'tel', '請輸入目前執行中的主程序編號（PID）。');
    return { title: "Daniel's Room 管理後台 - 登入", html: `<div class="ad-login"><div class="ad-box">
<div class="ad-head">Daniel's Room<small>網站管理系統 v1.2</small></div>
<div class="ad-body">${body}</div>
<div class="ad-foot">未經授權的存取將被記錄。<br>所有存取都會被記錄。</div>
</div></div>` };
  }

  function stampDisp() {
    const s = State.data.flags.adminLoginStamp || '';
    return s ? `${s.slice(0, 4)}/${s.slice(4, 6)}/${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}` : '';
  }

  function daysSince() {
    return Math.floor((Date.now() - new Date(2004, 10, 30).getTime()) / 86400000);
  }

  function shell(tab, inner) {
    const tabs = [['', '總覽'], ['logins', '登入紀錄'], ['cron', '排程工作'], ['queue', '郵件佇列'], ['kill', '終止程序']];
    return `<div class="ad-app">
<div class="ad-top"><span class="ad-brand">Daniel's Room <small>管理後台</small></span><span>登入身分：<b>keeper</b>　｜　${stampDisp()} 自 10.20.03.17</span></div>
<div class="ad-tabs">${tabs.map(([k, l]) => `<a href="#" data-go="${A}/${k}" class="${tab === k ? 'on' : ''}">${l}</a>`).join('')}</div>
<div class="ad-main">${inner}</div></div>`;
  }

  const guard = fn => (solved('p6c') ? fn() : loginPage());

  const pages = {
    '': {
      render(ctx) {
        return guard(() => ({ title: '管理後台 - 總覽', html: shell('', `<h3>歡迎回來，keeper。</h3>
<table class="ad-stats" cellspacing="0">
<tr><th>網站狀態</th><td><span class="ok">● 運作中</span>（連續 ${(daysSince() + 470).toLocaleString()} 天）</td></tr>
<tr><th>最後更新</th><td>今天 03:47（自動）</td></tr>
<tr><th>今日訪客</th><td>1</td></tr>
<tr><th>累計訪客</th><td>001129 → <b>001130</b></td></tr>
<tr><th>主程序</th><td>keeper.pl（PID 817）</td></tr>
<tr><th>網站管理員</th><td>daniel（已停用）、keeper</td></tr>
</table>
<!-- 訪客名單：/visitors -->
<p class="ad-note">網站一直都在。<br>只是需要有人看著它。</p>`) }));
      }
    },
    logins: {
      render(ctx) {
        return guard(() => {
          const d = new Date();
          const rows = [[stampDisp(), 'keeper', '10.20.03.17', '網頁', '目前工作階段']];
          for (let i = 1; i <= 3; i++) {
            const x = new Date(d.getTime() - i * 86400000);
            rows.push([`${x.getFullYear()}/${pad(x.getMonth() + 1)}/${pad(x.getDate())} 03:47`, 'keeper', '127.0.0.1', '排程', '']);
          }
          rows.push(['⋮', '', '', '', `（略 ${(daysSince() - 4).toLocaleString()} 筆，全部來自 127.0.0.1）`]);
          rows.push(['2004/11/30 03:47', 'keeper', '127.0.0.1', '排程', '']);
          rows.push(['2004/11/29 03:47', 'daniel', '10.20.03.17', '網頁', '']);
          rows.push(['2004/11/29 03:47', 'keeper', '127.0.0.1', '排程', '']);
          rows.push(['2004/11/23 23:41', 'daniel', '10.20.03.17', '網頁', '']);
          rows.push(['2004/11/23 03:47', 'keeper', '127.0.0.1', '排程', '']);
          rows.push(['2004/10/31 03:47', 'keeper', '127.0.0.1', '排程', '後台密碼變更']);
          rows.push(['2004/10/30 22:10', 'daniel', '10.20.03.17', '網頁', '']);
          const html = rows.map(r => `<tr class="${r[2] === '127.0.0.1' ? 'lo' : r[2] ? 'ext' : 'gap'}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('');
          return { title: '管理後台 - 登入紀錄', html: shell('logins', `<table class="ad-table" cellspacing="0" data-clue="admin-ip"><tr><th>時間</th><th>帳號</th><th>來源 IP</th><th>方式</th><th>備註</th></tr>${html}</table>
<div class="dn-small">127.0.0.1 = 本機（主機自己）。</div>`) };
        });
      }
    },
    cron: {
      render(ctx) {
        return guard(() => ({ title: '管理後台 - 排程工作', html: shell('cron', `<table class="ad-table" cellspacing="0"><tr><th>時間</th><th>擁有者</th><th>指令</th><th></th></tr>
<tr><td>47 3 * * *</td><td>keeper</td><td><code>keeper.pl --rebuild --heartbeat --dream --greet</code></td><td><button class="w-btn small" data-act="cron-disable">停用</button></td></tr>
<tr class="off"><td>59 23 * * *</td><td>daniel</td><td><code>backup.sh</code></td><td>已停用</td></tr></table>`) }));
      }
    },
    queue: {
      render(ctx) {
        return guard(() => ({ title: '管理後台 - 郵件佇列', html: shell('queue', `<table class="ad-table" cellspacing="0"><tr><th>收件者</th><th>主旨</th><th>預計寄送</th><th>已寄出</th></tr>
<tr class="ext"><td>（下一位訪客）</td><td><a href="#" data-act="open-last-mail">you shouldn't have opened this.</a></td><td>明天 03:47</td><td>${daysSince().toLocaleString()} 次</td></tr></table>
<div class="dn-small">這是佇列裡的最後一封郵件。</div>`) }));
      }
    },
    'queue/1': {
      render(ctx) {
        return guard(() => {
          State.flag('openedLastMail', true);
          const p = State.data.player.startedAt ? new Date(State.data.player.startedAt) : new Date();
          const pd = `${p.getFullYear()}/${pad(p.getMonth() + 1)}/${pad(p.getDate())} ${pad(p.getHours())}:${pad(p.getMinutes())}`;
          return { title: "管理後台 - you shouldn't have opened this.", html: shell('queue', `<table class="wm-hdr" cellspacing="0">
<tr><th>寄件者</th><td>keeper@home.local（以「無寄件者資訊」顯示）</td></tr>
<tr><th>主旨</th><td>you shouldn't have opened this.</td></tr>
<tr><th>上一次寄送</th><td>${pd}　→　10.20.03.17</td></tr>
<tr><th>下一次寄送</th><td>明天 03:47　→　（由新的管理者指定）</td></tr></table>
<div class="wm-body ad-mail">你還記得這個網站嗎？<br>如果你看得到這封信，代表它又開始運作了。<br>不要相信首頁顯示的日期。<br>尤其不要打開最後一封郵件。</div>
<p class="ad-note">上一次寄送的對象，就是你。<br>你收到的那封信，是它寄的。</p>`) };
        });
      }
    },
    kill: {
      render(ctx) {
        return guard(() => {
          let body;
          if (!solved('p7a')) {
            body = `<p>即將終止：<b>keeper.pl（PID 817）</b></p>
<p>為防止程式自行終止，需要真人確認。</p>
${form('p7a', '請輸入最後一次由「真人」登入此後台的時間（YYYYMMDDHHMM）', 'tel')}`;
          } else {
            body = `<p>真人確認完成。</p>
<p class="ad-q">在終止之前，請回答最後一個問題：</p>
<p class="ad-q big">「究竟是誰，一直在維護這個網站？」</p>
${form('p7b', '回答', 'text')}
<p class="dn-small ad-warn">admin.txt：「不要回答它的問題。」</p>`;
          }
          return { title: '管理後台 - 終止程序', html: shell('kill', body) };
        });
      }
    }
  };

  window.SITES = window.SITES || {};
  window.SITES.admin = { id: 'admin', host: A, name: '管理後台', cls: 'site-admin', pages };
})();
