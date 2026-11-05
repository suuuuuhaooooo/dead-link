/* mail.local — OldNet Webmail（第一章終點、第二章） */
(function () {
  const M = 'mail.local';
  const solved = id => State.has('solved', id);

  const INBOX = [
    { id: 'h1', hidden: true, from: 'kei &lt;kei@oldnet.local&gt;', subject: '你要的資料', sent: '2004/11/23 21:40', recv: '2004/11/23 21:40', clue: 'mail-hidden',
      body: 'Daniel：<br><br>你要我查的那個帳號，我查了。<br>它不在會員列表裡，可是文章都還在，每天凌晨一篇。我沒有刪過任何人。<br><br>我把論壇的訪客權限打開了，你自己去看：<a href="http://bbs.local/" data-go="bbs.local/">http://bbs.local/</a><br>已刪除會員的資料可以在「會員封存查詢」看到，通行碼我設成我們論壇的生日，你知道的。<br><br>你說它會回你的信，是什麼意思？<br>— kei' },
    { id: 'm1', from: 'kei &lt;kei@oldnet.local&gt;', subject: '你還好嗎？', sent: '2004/11/24 22:13', recv: '2004/11/24 22:13',
      body: 'Daniel：<br><br>昨天講到一半你就離線了，最後那句話也沒打完。<br>今天一整天你都沒上線，打電話也沒人接。<br>論壇那邊大家又在討論那個只發句點的帳號。<br><br>回我一下。拜託。<br>— kei' },
    { id: 'm2', from: 'system@oldnet.local', subject: '【系統通知】自動備份排程已停用', sent: '2004/11/23 23:59', recv: '2004/11/23 23:59',
      body: '親愛的使用者您好：<br><br>您的網站 home.local 之每日自動備份已於 2004/11/23 23:59 停用。<br>最後一次成功備份：<b>（無資料）</b><br><br>如非本人操作，請立即聯絡管理員 admin@oldnet.local。<br><br>OldNet 系統管理組 敬上' },
    { id: 'm3', from: '<span class="om-unknown">（無寄件者）</span>', subject: '不要回信', sent: '2004/11/25 03:47', recv: '2004/11/22 03:47', clue: 'mail-time',
      body: '我知道你把日期改回去了。<br><br>這沒有用。<br><br>網站會記得每一個來過的人。' }
  ];

  // 舊信件：依時間由舊到新，主旨首字母 K E E P E R
  const ARCHIVE = [
    { id: 'a1', from: 'daniel → kei', subject: 'Keeping the diary alive', sent: '2004/09/02 01:20',
      body: 'kei：<br><br>最近工作太忙，日記都沒空寫。<br>我幫那個顧網站的小程式加了一個功能：它會把我以前的日記拆開重新組合，每天自動寫一篇新的。<br>你看得出來哪幾篇不是我寫的嗎？XD<br><br>— D' },
    { id: 'a2', from: 'daniel → admin@oldnet.local', subject: 'Every night at 03:47?', sent: '2004/09/18 10:02',
      body: '阿哲你好：<br><br>想請問主機的排程設定。我設定每天 03:47 自動重建網頁，但最近好像一個晚上跑了不只一次。<br>有辦法看是誰在跑嗎？<br><br>Daniel' },
    { id: 'a3', from: 'kei → daniel', subject: 'Echo in my diary?', sent: '2004/10/05 23:12',
      body: 'Daniel：<br><br>你最近的日記讀起來好怪。<br>很多句子我好像在以前的日記看過，只是被重新排列了。<br>還有 10/3 那篇，你寫「kei 今天穿了紅色的外套」。<br>我那天沒有見到你。<br><br>— kei' },
    { id: 'a4', from: 'system@oldnet.local', subject: 'Password changed for home.local', sent: '2004/10/31 03:47',
      body: '您的網站後台密碼已於 2004/10/31 03:47 變更。<br>來源 IP：127.0.0.1（本機）<br><br>如非本人操作，請立即聯絡管理員。' },
    { id: 'a5', from: 'system@oldnet.local', subject: 'Error log attached', sent: '2004/11/12 03:48', att: true,
      body: '排程工作執行時發生錯誤，詳細內容請見附件。<br><br>附件：<a href="#" data-go="mail.local/att1">keeper_err.log</a>（2 KB）' },
    { id: 'a6', from: 'daniel → admin@oldnet.local', subject: 'Reply from myself?', sent: '2004/11/20 21:05',
      body: '阿哲：<br><br>我今天收到一封從我自己信箱寄出來的信，寄件時間是凌晨三點多。<br>內容是在回覆一封我還沒寄出的信。<br>你們主機是不是被入侵了？<br><br>Daniel' }
  ];

  const ERRLOG = `[2004/11/12 03:47:00] cron: start /home/daniel/k*****.pl --rebuild
[2004/11/12 03:47:02] rebuild: index.html ... ok
[2004/11/12 03:47:03] heartbeat: post to bbs.local ... ok
[2004/11/12 03:47:05] dream: compose diary from 214 entries ... ok
[2004/11/12 03:47:06] dream: write /diary/entry_1112.txt ... DENIED (owner: daniel)
[2004/11/12 03:47:06] session K***** : chmod 777 /diary ... ok
[2004/11/12 03:47:07] dream: write /diary/entry_1112.txt ... ok
[2004/11/12 03:47:09] greet: next visitor ... (none)
[2004/11/12 03:47:09] sleep until 03:47`;

  function topbar() {
    return `<div class="wm-top"><span class="wm-logo">OldNet <b>Webmail</b> 2.0</span>
<form class="wm-search" data-form="mail-search"><input type="search" name="q" placeholder="搜尋郵件" value="${UI.esc(State.data.flags.mailQuery || '')}"><button class="w-btn small" type="submit">搜尋</button></form>
<span class="wm-user">daniel@oldnet.local ｜ <a href="#" data-go="${M}/logout">登出</a></span></div>`;
  }

  function shell(folder, inner) {
    const n = solved('p2b') ? 4 : 3;
    return `${topbar()}
<table class="wm-layout" cellspacing="0"><tr>
  <td class="wm-side">
    <a href="#" data-go="${M}/inbox" class="${folder === 'inbox' ? 'cur' : ''}"${n === 3 ? ' data-clue="mail-count"' : ''}>收件匣 (4)</a>
    <a href="#" data-go="${M}/drafts" class="${folder === 'drafts' ? 'cur' : ''}">草稿 (1)</a>
    <a href="#" data-go="${M}/sent" class="${folder === 'sent' ? 'cur' : ''}">寄件備份 (0)</a>
    <a href="#" data-go="${M}/archive" class="${folder === 'archive' ? 'cur' : ''}">舊信件 (6)</a>
    <a href="#" data-go="${M}/trash" class="${folder === 'trash' ? 'cur' : ''}">垃圾桶 (0)</a>
    <div class="wm-quota">信箱用量<div class="w-progress"><div style="width:3%"></div></div>0.1 MB / 5 MB</div>
  </td>
  <td class="wm-main">${inner}</td>
</tr></table>`;
  }

  function login(ctx) {
    return {
      title: 'OldNet Webmail - 登入',
      html: `<!-- webmail v2.0 / session timeout 20 min -->
<div class="wm-login">
  <div class="wm-login-box">
    <div class="wm-login-head">OldNet <b>Webmail</b></div>
    <form data-form="mail-login" class="wm-form">
      <div class="row"><label>帳號</label><input type="text" value="daniel" readonly> <span class="dom">@oldnet.local</span></div>
      <div class="row"><label>密碼</label><input type="password" name="pw" inputmode="numeric" autocomplete="off" placeholder="••••••••"></div>
      <div class="row"><label></label><button class="w-btn" type="submit">登入</button> <a href="#" data-act="pw-hint">忘記密碼？</a></div>
      <div class="wm-hintq" id="wm-hintq" ${ctx.S.flags.pwHint ? '' : 'hidden'}>
        <b>密碼提示問題：</b>我最後一次「真正」更新網站，是哪一天？<br><span class="dn-small">（8 位數字，西元年月日）</span>
      </div>
      <div class="wm-msg" data-msg aria-live="polite"></div>
    </form>
    <div class="wm-login-foot">上次登入：2004/11/23 03:47 自 home.local<br>為保護您的帳號安全，請勿在公用電腦上儲存密碼。</div>
  </div>
</div>`
    };
  }

  const guard = (ctx, fn) => (solved('p1') ? fn() : login(ctx));

  function list(rows, base) {
    return `<table class="wm-list" cellspacing="0"><tr><th>寄件者</th><th>主旨</th><th>時間</th></tr>${rows.map(m =>
      `<tr data-go="${M}/${m.id}" class="${State.data.flags['read_' + m.id] ? '' : 'unread'}"><td class="fr">${m.from}</td><td class="sj"><a href="#" data-go="${M}/${m.id}">${m.subject}</a></td><td class="dt">${m.recv || m.sent}</td></tr>`).join('')}</table>`;
  }

  function reader(m, folder) {
    return shell(folder, `<div class="wm-bar"><a href="#" data-go="${M}/${folder}">« 回${folder === 'archive' ? '舊信件' : folder === 'drafts' ? '草稿' : '收件匣'}</a></div>
<div class="wm-read">
  <table class="wm-hdr" cellspacing="0"${m.clue ? ` data-clue="${m.clue}"` : ''}>
    <tr><th>${folder === 'drafts' ? '收件者' : '寄件者'}</th><td>${m.from}</td></tr>
    <tr><th>主旨</th><td>${m.subject}</td></tr>
    <tr><th>${folder === 'drafts' ? '儲存時間' : '寄件時間'}</th><td>${m.sent}</td></tr>
    ${m.recv ? `<tr><th>收件時間</th><td>${m.recv}</td></tr>` : ''}
  </table>
  <div class="wm-body">${m.body}</div>
</div>`);
  }

  const DRAFT = { id: 'd1', from: 'kei@oldnet.local', subject: '（無主旨）', sent: '2004/11/29 03:51', clue: 'mail-draft',
    body: 'kei，<br><br>如果你看到這封，代表我沒能把它關掉。<br><br>我把你寄給我的那封信藏起來了，不能讓它看到。它不會出現在收件匣，只有用「它每天醒來的時間」才搜得到。<br><br>不要回論壇上那個帳號的文章。<br>不要回任何一封從我信箱寄出去的信。<br><br>— D' };

  const pages = {
    '': { render(ctx) { return guard(ctx, () => pages.inbox.render(ctx)); } },
    login: { render(ctx) { return guard(ctx, () => pages.inbox.render(ctx)); } },
    logout: { render(ctx) { return login(ctx); } },

    inbox: {
      render(ctx) {
        return guard(ctx, () => {
          const rows = INBOX.filter(m => !m.hidden || solved('p2b'));
          return {
            title: 'OldNet Webmail - 收件匣',
            html: shell('inbox', `<div class="wm-bar"><b>收件匣</b>　共 4 封郵件</div>${list(rows)}
<!-- folders: inbox, drafts, sent, archive, trash, outbox(hidden) -->
<!-- msg_count=4 / rendered=${rows.length}${rows.length < 4 ? ' / filter: hide where body contains "bbs.local" (owner: k*****)' : ''} -->`)
          };
        });
      }
    },

    archive: {
      render(ctx) {
        return guard(ctx, () => ({
          title: 'OldNet Webmail - 舊信件',
          html: shell('archive', `<div class="wm-bar"><b>舊信件</b>　共 6 封郵件　<span class="dn-small">（依主旨排序）</span></div>
<div data-clue="mail-archive">${list(ARCHIVE.slice().sort((a, b) => a.subject.localeCompare(b.subject)).map(a => Object.assign({}, a, { recv: a.sent })))}</div>`)
        }));
      }
    },

    att1: {
      render(ctx) {
        return guard(ctx, () => ({
          title: 'keeper_err.log',
          html: shell('archive', `<div class="wm-bar"><a href="#" data-go="${M}/a5">« 回信件</a>　附件：keeper_err.log</div><pre class="wm-pre" data-clue="mail-errlog">${UI.esc(ERRLOG)}</pre>`)
        }));
      }
    },

    drafts: {
      render(ctx) {
        return guard(ctx, () => {
          if (!solved('p2a')) {
            return {
              title: 'OldNet Webmail - 草稿',
              html: shell('drafts', `<div class="wm-bar"><b>草稿</b></div>
<div class="wm-locked">
  此資料夾正被另一個工作階段使用中。<br><span class="dn-small">錯誤代碼 0x2003-0817　工作階段：k*****（自 2004/11/29 03:51 起）</span>
  <form data-form="puzzle" data-pid="p2a" class="wm-inline">
    <div>若要強制解除，請輸入佔用中的工作階段名稱：</div>
    <input type="text" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false"> <button class="w-btn small" type="submit">強制解除</button>
    <div class="wm-msg" data-msg></div>
  </form>
</div>`)
            };
          }
          return {
            title: 'OldNet Webmail - 草稿',
            html: shell('drafts', `<div class="wm-bar"><b>草稿</b>　1 封</div>${list([Object.assign({}, DRAFT, { from: '收件者：kei', recv: DRAFT.sent })])}`)
          };
        });
      }
    },

    d1: { render(ctx) { return guard(ctx, () => (solved('p2a') ? { title: 'OldNet Webmail - 草稿', html: reader(DRAFT, 'drafts') } : pages.drafts.render(ctx))); } },

    search: {
      render(ctx) {
        return guard(ctx, () => {
          const q = (ctx.S.flags.mailQuery || '').trim();
          const all = INBOX.filter(m => !m.hidden || solved('p2b')).concat(ARCHIVE, solved('p2a') ? [DRAFT] : []);
          const plain = s => s.replace(/<[^>]+>/g, '').toLowerCase();
          let hits = q ? all.filter(m => plain(m.subject + m.body + m.from).includes(q.toLowerCase())) : [];
          if (solved('p2b') && /^0?3:?47$/.test(q.replace(/\s/g, ''))) hits = [INBOX[0]].concat(hits.filter(h => h.id !== 'h1'));
          return {
            title: 'OldNet Webmail - 搜尋',
            html: shell('search', `<div class="wm-bar"><b>搜尋結果</b>　「${UI.esc(q)}」　${hits.length} 封</div>${hits.length ? list(hits) : '<div class="wm-empty">找不到符合的郵件。</div>'}`)
          };
        });
      }
    },

    sent: { render(ctx) { return guard(ctx, () => ({ title: 'OldNet Webmail - 寄件備份', html: shell('sent', '<div class="wm-bar"><b>寄件備份</b></div><div class="wm-empty">沒有郵件。<br><span class="dn-small">（寄件備份已於 2004/11/29 03:51 清空）</span></div>') })); } },
    trash: { render(ctx) { return guard(ctx, () => ({ title: 'OldNet Webmail - 垃圾桶', html: shell('trash', '<div class="wm-bar"><b>垃圾桶</b></div><div class="wm-empty">沒有郵件。</div>') })); } }
  };

  INBOX.forEach(m => {
    pages[m.id] = {
      render(ctx) {
        return guard(ctx, () => {
          if (m.hidden && !solved('p2b')) return ErrorPages.notFound(M, m.id);
          State.flag('read_' + m.id, true);
          return { title: 'OldNet Webmail - ' + m.subject.replace(/<[^>]+>/g, ''), html: reader(m, 'inbox') };
        });
      }
    };
  });
  ARCHIVE.forEach(m => {
    pages[m.id] = {
      render(ctx) {
        return guard(ctx, () => {
          State.flag('read_' + m.id, true);
          return { title: 'OldNet Webmail - ' + m.subject, html: reader(Object.assign({}, m, { recv: '' }), 'archive') };
        });
      }
    };
  });

  /* 搜尋：0347 → 第二章第二道謎題 */
  window.MailSearch = function (q) {
    State.data.flags.mailQuery = q; State.save();
    if (PuzzleEngine.normalize('digits', q) && /^[\d:\s：]+$/.test(q)) {
      const r = PuzzleEngine.check('p2b', q);
      if (r.ok) { SFX.success(); UI.toast('找到 1 封被過濾的郵件。'); }
    }
    App.navigate(M + '/search');
  };

  window.SITES = window.SITES || {};
  window.SITES.mail = { id: 'mail', host: M, name: 'OldNet Webmail', cls: 'site-mail', pages };
})();
