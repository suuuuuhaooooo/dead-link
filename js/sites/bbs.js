/* bbs.local — 深夜論壇（第三章） */
(function () {
  const B = 'bbs.local';
  const solved = id => State.has('solved', id);

  const USERS = {
    kei: { uid: 1, reg: '2003/06/30', posts: 412, title: '站長', sig: '夜深了，記得睡覺。' },
    mika: { uid: 2, reg: '2003/07/12', posts: 188, title: '話很多', sig: '(=^･ω･^=)' },
    '路人甲': { uid: 3, reg: '2003/07/30', posts: 57, title: '潛水員', sig: '' },
    '阿哲': { uid: 4, reg: '2003/08/02', posts: 23, title: 'OldNet 主機管理', sig: 'admin@oldnet.local' },
    daniel: { uid: 5, reg: '2003/08/17', posts: 301, title: '網頁設計師', sig: 'qljkwrzo', sigClue: true },
    '小雨': { uid: 7, reg: '2003/09/09', posts: 76, title: '新手上路', sig: '' },
    tofu: { uid: 8, reg: '2004/01/14', posts: 34, title: '新手上路', sig: '豆腐不是我' },
    '夜貓': { uid: 9, reg: '2004/03/03', posts: 12, title: '新手上路', sig: '' }
  };

  const BOARDS = {
    news: { name: '站務公告', desc: '論壇規則、公告與帳號問題', threads: ['t1', 't5'] },
    chat: { name: '閒聊區', desc: '什麼都可以聊（除了期中考）', threads: ['t2', 't4'] },
    web: { name: '網頁設計', desc: 'HTML、CSS、Flash、各種跑版求救', threads: ['t3'] }
  };

  const THREADS = {
    t1: { board: 'news', title: '關於帳號「.」', posts: [
      ['kei', '2004/06/10 22:01', '很多人私訊問我那個只發句點的帳號。<br>我查過了：它沒有個人資料，會員列表裡也找不到它。<br>但我發誓，我沒有刪過任何人。'],
      ['mika', '2004/06/10 22:15', '它每天凌晨都會發一篇耶，我熬夜看過，三點四十幾分準時出現。'],
      ['路人甲', '2004/06/11 01:02', '是不是誰寫的機器人啊'],
      ['daniel', '2004/06/11 09:30', '大家不要理它就好。我會處理。'],
      ['kei', '2004/06/11 12:44', '……你會處理？你知道它是誰？']
    ] },
    t2: { board: 'chat', title: '一年前的今天', posts: [
      ['mika', '2004/08/17 20:03', '去年的今天 Daniel 開了他的網站，也是同一天加入我們論壇的！生日快樂～'],
      ['daniel', '2004/08/17 20:40', '謝謝 XD 一年了，網站還活著。'],
      ['kei', '2004/08/17 21:12', '說到那天，其實那天晚上註冊了兩個帳號。<br>一個是 daniel，另一個晚了兩個多小時，名字我現在想不起來了。我當時以為是 Daniel 的分身，就沒管它。', 'bbs-two'],
      ['小雨', '2004/08/17 22:30', '我九月才來的，編號是 7。所以 7 號以前就是元老嗎 XD', 'bbs-two'],
      ['tofu', '2004/08/17 23:05', '元老們好（鞠躬）']
    ] },
    t3: { board: 'web', title: '[心得] 用記事本寫網頁的一年', posts: [
      ['daniel', '2004/07/02 23:50', '分享一下，我的網站從第一天就是用記事本一個字一個字打的。<br>好處是每一行我都知道在做什麼。壞處是……我現在不確定了。<br>最近網站會自己多出一些我沒寫過的東西。'],
      ['kei', '2004/07/03 00:21', '你簽名檔那串亂碼到底是什麼意思啦，看了一年了'],
      ['daniel', '2004/07/03 00:40', '凱撒說了算 XD 每個字母往前推三格。<br>解出來就是我。順便說，那也是我在聊天室的密碼，不要告訴別人。', 'bbs-sig'],
      ['阿哲', '2004/07/03 09:12', '在公開論壇說密碼的人我第一次看到']
    ] },
    t4: { board: 'chat', title: '凌晨的句點', posts: [
      ['夜貓', '2004/11/22 04:10', '最近「.」發的文章不是只有句點了。<br>有點有槓，長短不一，好像在打電報。點它的名字可以看到它所有文章。'],
      ['mika', '2004/11/22 09:30', '你半夜不睡覺盯著它看？？'],
      ['夜貓', '2004/11/22 11:02', '我就夜貓啊。'],
      ['kei', '2004/11/22 21:15', '大家先不要回它的文章。拜託。']
    ] },
    t5: { board: 'news', title: '【公告】Daniel 失聯', posts: [
      ['kei', '2004/11/30 02:03', '有人知道 Daniel 去哪了嗎？<br>從 23 號晚上之後，他就沒有再上線，電話也不通。<br>如果有人看到他，請告訴我。'],
      ['.', '2004/11/30 03:47', '.'],
      ['mika', '2004/11/30 08:40', '他的網站首頁還在啊……可是日期停在 23 號。'],
      ['kei', '2004/11/30 12:00', '會員封存查詢的通行碼，我已經寄給他了。<br>Daniel，如果你看得到，你知道去哪裡找。']
    ] }
  };

  // 「.」的文章：最近七篇是摩斯電碼 O F F L I N E
  const DOT_RECENT = [
    ['2004/11/16 03:47', '---'], ['2004/11/17 03:47', '..-.'], ['2004/11/18 03:47', '..-.'],
    ['2004/11/19 03:47', '.-..'], ['2004/11/20 03:47', '..'], ['2004/11/21 03:47', '-.'], ['2004/11/22 03:47', '.']
  ];

  function head(ctx) {
    return `<div class="bbs-top">
  <div class="bbs-logo">深夜論壇<small>MIDNIGHT BBS</small></div>
  <div class="bbs-menu"><a href="#" data-go="${B}/">論壇首頁</a> | <a href="#" data-go="${B}/members">會員列表</a> | <a href="#" data-go="${B}/archive">會員封存查詢</a> | <span>訪客，您好</span></div>
</div>`;
  }
  function foot() {
    return `<div class="bbs-foot">深夜論壇 MIDNIGHT BBS　since 2003/06/30　站長 kei<br>Powered by OldBoard 1.3 · 目前線上：訪客 1 人、會員 <span class="bbs-dot">.</span></div>`;
  }
  function page(ctx, inner) { return `${head(ctx)}<div class="bbs-wrap">${inner}</div>${foot()}`; }

  function userBox(name) {
    if (name === '.') {
      return `<td class="bbs-user dead"><a href="#" data-go="${B}/author/dot" class="bbs-uname">.</a><div class="bbs-utitle">此使用者已不存在</div><div class="bbs-umeta"><span>會員編號：—</span><span>註冊：—</span><span>文章：462</span></div></td>`;
    }
    const u = USERS[name];
    return `<td class="bbs-user"><span class="bbs-uname">${name}</span><div class="bbs-utitle">${u.title}</div><div class="bbs-umeta"><span>會員編號：${u.uid}</span><span>註冊：${u.reg}</span><span>文章：${u.posts}</span></div></td>`;
  }

  function sig(name) {
    const u = USERS[name];
    if (!u || !u.sig) return '';
    return `<div class="bbs-sig"${u.sigClue ? ' data-clue="bbs-sig"' : ''}>--<br>${u.sig}</div>`;
  }

  const pages = {
    '': {
      title: '深夜論壇 MIDNIGHT BBS',
      render(ctx) {
        const rows = Object.entries(BOARDS).map(([k, b]) => `<tr><td class="bbs-bico">■</td><td><a href="#" data-go="${B}/board/${k}"><b>${b.name}</b></a><div class="dn-small">${b.desc}</div></td><td class="c">${b.threads.length}</td></tr>`).join('');
        return { html: page(ctx, `<!-- guest access enabled by kei 2004/11/23 21:38 -->
<table class="bbs-table" cellspacing="1"><tr><th colspan="2">討論區</th><th>主題</th></tr>${rows}</table>
<div class="bbs-note">★ 訪客可以閱讀所有文章，但不能發文。</div>`) };
      }
    },
    members: {
      title: '深夜論壇 - 會員列表',
      render(ctx) {
        const rows = Object.entries(USERS).sort((a, b) => a[1].uid - b[1].uid).map(([n, u]) => `<tr><td class="c">${u.uid}</td><td>${n}</td><td>${u.title}</td><td class="c">${u.reg}</td><td class="c">${u.posts}</td></tr>`).join('');
        return { html: page(ctx, `<table class="bbs-table" cellspacing="1" data-clue="bbs-members"><tr><th>編號</th><th>會員名稱</th><th>頭銜</th><th>註冊日期</th><th>文章</th></tr>${rows}</table>
<div class="bbs-note">共 8 位會員。依會員編號排序。</div>`) };
      }
    },
    'author/dot': {
      title: '深夜論壇 - 作者「.」的文章',
      render(ctx) {
        const rec = DOT_RECENT.slice().reverse().map(([d, t]) => `<tr><td class="c">${d}</td><td class="bbs-morse">${t}</td></tr>`).join('');
        return { html: page(ctx, `<div class="bbs-crumb">作者「.」的文章　共 462 篇　（最新的在最上面）</div>
<table class="bbs-table" cellspacing="1" data-clue="bbs-morse"><tr><th>發表時間</th><th>內容</th></tr>${rec}
<tr><td class="c dn-small">2004/11/15 03:47<br>⋮<br>2003/08/18 03:47</td><td class="bbs-morse">.<br>⋮<br>.</td></tr></table>
<div class="bbs-note">更早的 455 篇文章內容都只有「.」。每天一篇，從沒漏過。</div>`) };
      }
    },
    archive: {
      title: '深夜論壇 - 會員封存查詢',
      render(ctx) {
        let body;
        if (!solved('p3c')) {
          body = `<p>此功能可以查詢已刪除會員的封存資料。由站長 kei 於 2004/11/23 開放。</p>
${form('p3c', '請輸入查詢通行碼', 'numeric')}`;
        } else if (!solved('p3a')) {
          body = `<p>通行碼正確。</p>${form('p3a', '要查詢的會員編號', 'numeric')}`;
        } else if (!solved('p3b')) {
          body = `<p>找到 1 筆刪除紀錄：會員編號 6。<br>為保護隱私，請輸入該會員的<b>註冊日期</b>以確認身分。</p>${form('p3b', '註冊日期（YYYYMMDD）', 'numeric')}`;
        } else {
          body = `<table class="bbs-table rec" cellspacing="1" data-clue="bbs-record">
<tr><th colspan="2">封存資料：會員編號 6</th></tr>
<tr><td>原帳號名稱</td><td><b>keeper</b></td></tr>
<tr><td>顯示名稱</td><td>.</td></tr>
<tr><td>註冊時間</td><td>2003/08/17 23:47</td></tr>
<tr><td>註冊 IP</td><td>10.20.03.17</td></tr>
<tr><td>文章數</td><td>462</td></tr>
<tr><td>最後發文</td><td>${ctx.today} 03:47</td></tr>
<tr><td>狀態</td><td>已刪除（刪除者：daniel，2004/11/23 23:58）</td></tr>
<tr><td>備註</td><td>帳號刪除後仍持續發文。聊天室帳號同名，見 <a href="#" data-go="chat.local/">chat.local</a></td></tr>
</table>
<div class="bbs-note">刪除後仍持續發文？這不應該發生。——kei</div>`;
        }
        return { html: page(ctx, `<div class="bbs-crumb">會員封存查詢</div><div class="bbs-box">${body}</div>`) };
      }
    }
  };

  function form(pid, label, mode) {
    return `<form data-form="puzzle" data-pid="${pid}" class="bbs-form"><label>${label}：</label>
<input type="text" name="answer" ${mode === 'numeric' ? 'inputmode="numeric"' : ''} autocomplete="off"> <button class="w-btn small" type="submit">查詢</button>
<div class="wm-msg" data-msg></div></form>`;
  }

  Object.entries(BOARDS).forEach(([k, b]) => {
    pages['board/' + k] = {
      title: '深夜論壇 - ' + b.name,
      render(ctx) {
        const rows = b.threads.map(id => {
          const t = THREADS[id]; const last = t.posts[t.posts.length - 1];
          return `<tr><td><a href="#" data-go="${B}/${id}">${t.title}</a></td><td class="c">${t.posts[0][0]}</td><td class="c">${t.posts.length - 1}</td><td class="c dn-small">${last[1]}<br>by ${last[0]}</td></tr>`;
        }).join('');
        return { html: page(ctx, `<div class="bbs-crumb"><a href="#" data-go="${B}/">論壇首頁</a> › ${b.name}</div>
<table class="bbs-table" cellspacing="1"><tr><th>主題</th><th>作者</th><th>回覆</th><th>最後發表</th></tr>${rows}</table>`) };
      }
    };
  });

  Object.entries(THREADS).forEach(([id, t]) => {
    pages[id] = {
      title: '深夜論壇 - ' + t.title,
      render(ctx) {
        const posts = t.posts.map(([n, d, txt, clue], i) => `<table class="bbs-post" cellspacing="0"><tr>${userBox(n)}<td class="bbs-pbody">
<div class="bbs-pmeta">#${i + 1}　發表於 ${d}</div><div class="bbs-ptxt"${clue ? ` data-clue="${clue}"` : ''}>${txt}</div>${sig(n)}</td></tr></table>`).join('');
        return { html: page(ctx, `<div class="bbs-crumb"><a href="#" data-go="${B}/">論壇首頁</a> › <a href="#" data-go="${B}/board/${t.board}">${BOARDS[t.board].name}</a> › ${t.title}</div>${posts}`) };
      }
    };
  });

  window.SITES = window.SITES || {};
  window.SITES.bbs = { id: 'bbs', host: B, name: '深夜論壇', cls: 'site-bbs', pages };
})();
