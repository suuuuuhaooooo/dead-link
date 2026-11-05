/* ftp.local — Daniel 的備份空間（第五章） */
(function () {
  const F = 'ftp.local';
  const solved = id => State.has('solved', id);

  const DIRS = {
    backup: [
      { name: 'site_backup_20031225.zip', size: '1,204 KB', mod: '2003/12/25 23:10', type: 'zip' },
      { name: 'site_backup_20040602.zip', size: '1,618 KB', mod: '2004/06/02 22:41', type: 'zip' },
      { name: 'site_backup_20041031.zip', size: '1,942 KB', mod: '2004/10/31 03:47', type: 'zip' },
      { name: 'site_backup_FINAL.zip', size: '12 KB', mod: '2004/11/23 23:59', type: 'zip' }
    ],
    photos: [
      { name: 'dsc_0817_1402.jpg', size: '52 KB', mod: '2003/08/17 14:30', type: 'jpg', photo: '0817' },
      { name: 'dsc_0602_1730.jpg', size: '61 KB', mod: '2004/06/02 22:35', type: 'jpg', photo: '0602' },
      { name: 'dsc_1031_2248.jpg', size: '47 KB', mod: '2004/10/31 23:20', type: 'jpg', photo: '1031' },
      { name: 'dsc_1129_0347.jpg', size: '38 KB', mod: '2004/11/29 03:48', type: 'jpg', photo: '1129' },
      { name: 'old_photos.zip', size: '1,976 KB', mod: '2004/11/29 03:52', type: 'zip' }
    ],
    misc: [
      { name: 'readme.txt', size: '1 KB', mod: '2003/08/20 01:11', type: 'txt' },
      { name: 'todo.txt', size: '1 KB', mod: '2004/11/29 03:50', type: 'txt', clue: 'ftp-todo' },
      { name: 'links.txt', size: '1 KB', mod: '2004/02/14 18:02', type: 'txt' }
    ]
  };

  const TXT = {
    'readme.txt': '這裡是 Daniel 的備份空間（朋友限定）。\n\n/backup   網站備份。keeper 每天會自動備份，檔名 site_backup_日期.zip\n/photos   相機裡的原始照片（沒縮過，撥接的人慢慢等）\n/misc     雜物\n\n要還原網站請用「還原精靈」。',
    'todo.txt': '[x] 把 keeper 的論壇帳號刪掉\n[x] 停掉自動備份（它會把自己一起備份進去）\n[x] 手動備份一份，放在它不會去看的地方，改個不起眼的名字\n[x] 壓縮密碼用照片裡的東西。它看得懂文字，看不懂照片。\n[ ] 寄信給 kei\n[ ] 拔掉電話線\n[ ] 不要再打開這個網站',
    'links.txt': '好站連結備份\n\nhttp://bbs.local/      深夜論壇\nhttp://chat.local/     聊天室\nhttp://terminal.local/ 主機終端機（要密碼）\nhttp://admin.local/    網站後台（不要讓它知道我知道）'
  };

  const EXIF = {
    '0817': [['Make', 'SONY'], ['Model', 'DSC-P2'], ['DateTimeOriginal', '2003:08:17 14:02:31'], ['Software', '—'], ['UserComment', 'first day!']],
    '0602': [['Make', 'SONY'], ['Model', 'DSC-P2'], ['DateTimeOriginal', '2004:06:02 17:30:08'], ['Software', '—'], ['UserComment', '']],
    '1031': [['Make', 'SONY'], ['Model', 'DSC-P2'], ['DateTimeOriginal', '2004:10:31 22:48:55'], ['Software', '—'], ['UserComment', '']],
    '1129': [['Make', 'SONY'], ['Model', 'DSC-P2'], ['DateTimeOriginal', '2004:11:29 03:47:12'], ['Flash', 'Fired'], ['Software', '—'], ['UserComment', 'jvaqbj']]
  };

  const RESTORED = {
    entry_1123: { name: 'diary/entry_1123.txt', mod: '2004/11/29 03:49', clue: 'ftp-entry',
      text: '2004/11/23（二）　天氣：？\n\n我把首頁的日期改回 23 號了。如果他們看到更新日期，就會知道我還在這裡。\n今天凌晨我又聽到數據機自己撥號的聲音，可是電話線早就拔掉了。\n我拍了一張照片。窗外沒有人。\n但是玻璃上有。\n\n我終於懂了。它不是在模仿我。\n它是在等下一個人。\n只要有人一直來看，它就不會停。\n每一個來看的人，都會被它記住。\n\n所以我要離開了。\n如果你讀到這裡，不要再打開這個網站。\n\n（註：這篇其實是 29 號寫的。我把日期改成 23 號，讓它以為我還停在那一天。）' },
    keeper: { name: 'cgi-bin/keeper.pl（部分）', mod: '2004/11/29 03:47', clue: 'ftp-keeper', code: true,
      text: '#!/usr/bin/perl\n# keeper.pl — keeps Daniel\'s Room alive\n# written 2003/08/17 by daniel\n\nmy $WAKE = "03:47";\n\nsub rebuild   { build_pages("/home/daniel/www"); }\nsub backup    { zip("/backup/site_backup_" . today() . ".zip"); }\nsub heartbeat { post("bbs.local", "."); }      # 讓大家知道主機還活著\n\n# 2004/09/02 加的：沒空寫日記的時候，用舊日記拼一篇\nsub dream     { write_diary(markov(read_all("/diary"))); }\n\n# ↓↓↓ 下面這段不是我寫的 ↓↓↓\nsub greet {\n    my $v = next_visitor();\n    mail($v, "you shouldn\'t have opened this.",\n         "你還記得這個網站嗎？如果你看得到這封信，代表它又開始運作了。");\n    remember($v);\n}\n\nsub remember {\n    my $v = shift;\n    # 被記住的人，會回來。\n    # 回來的人，會一直看。\n    # 一直看的人，就是新的 keeper。\n}\n\nwhile (1) { sleep_until($WAKE); rebuild(); heartbeat(); dream(); greet(); }' },
    readme_kei: { name: 'readme_for_kei.txt', mod: '2004/11/29 03:52',
      text: 'kei：\n\n如果你找得到這份備份，代表你比它聰明。\n\n主機的終端機在 http://terminal.local/ ，用 guest 就能進去。\n我在家目錄留了東西給你。家目錄要用我的密碼——\n就是那句我一直掛在嘴邊的話。\n\n拜託，進去以後把它關掉。\n然後不要再回來。\n\n— D' }
  };

  function loginPage() {
    return { title: 'ftp.local - 登入', html: `<pre class="ftp-banner">220 ftp.local FTP server (OldNet wu-2.6.2) ready.
220-歡迎來到 Daniel 的備份空間。朋友限定。
220-密碼不知道的話，問 Daniel。
220 </pre>
<form data-form="puzzle" data-pid="p5a" class="ftp-form">
<div>Name (ftp.local:guest): <b>kei</b></div>
<div>331 Password required for kei.</div>
<div><label>Password: </label><input type="password" name="answer" inputmode="numeric" autocomplete="off"> <button class="w-btn small" type="submit">登入</button></div>
<div class="wm-msg" data-msg></div></form>` };
  }

  function crumb(path) {
    return `<div class="ftp-path">ftp://ftp.local/${path}</div>`;
  }

  function listing(dir) {
    const rows = DIRS[dir].map(f => `<tr><td><span class="ftp-ico ${f.type}"></span><a href="#" data-go="${F}/${dir}/${f.name}">${f.name}</a></td><td class="r">${f.size}</td><td class="c">${f.mod}</td></tr>`).join('');
    return `${crumb(dir + '/')}<table class="ftp-table" cellspacing="0"><tr><th>名稱</th><th>大小</th><th>修改時間</th></tr>
<tr><td><span class="ftp-ico dir"></span><a href="#" data-go="${F}/">..（上一層）</a></td><td></td><td></td></tr>${rows}</table>`;
  }

  const pages = {
    '': {
      render(ctx) {
        if (!solved('p5a')) return loginPage();
        return { title: 'ftp://ftp.local/', html: `<div class="ftp-wrap">${crumb('')}<table class="ftp-table" cellspacing="0"><tr><th>名稱</th><th>大小</th><th>修改時間</th></tr>
${Object.keys(DIRS).map(d => `<tr><td><span class="ftp-ico dir"></span><a href="#" data-go="${F}/${d}">${d}/</a></td><td class="r">—</td><td class="c">—</td></tr>`).join('')}
</table>
<div class="ftp-tools"><a href="#" data-go="${F}/restore" class="w-btn">還原精靈…</a></div>
<pre class="ftp-banner small">230 User kei logged in.　（上一次以 kei 登入：從未）</pre></div>` };
      }
    },
    restore: {
      render(ctx) {
        if (!solved('p5a')) return loginPage();
        let body;
        if (!solved('p5b')) {
          body = `<p>步驟 1／2：選擇要還原的備份檔。</p>
<form data-form="puzzle" data-pid="p5b" class="bbs-form"><label>檔案名稱：</label><input type="text" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="例如 site_backup_20031225.zip"> <button class="w-btn small" type="submit">下一步 &gt;</button><div class="wm-msg" data-msg></div></form>`;
        } else if (!solved('p5c')) {
          body = `<p>已選擇：<b>photos/old_photos.zip</b>（1,976 KB，2004/11/29 03:52）<br>內容：網站備份（diary/、cgi-bin/、www/ 等 214 個檔案）</p>
<p>步驟 2／2：此壓縮檔受密碼保護。</p>
<form data-form="puzzle" data-pid="p5c" class="bbs-form"><label>壓縮密碼：</label><input type="text" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false"> <button class="w-btn small" type="submit">解壓縮</button><div class="wm-msg" data-msg></div></form>`;
        } else {
          body = `<p>✔ 還原完成：photos/old_photos.zip → /restored/（214 個檔案）</p>
<p>值得注意的檔案：</p>
<ul class="ftp-list">
  <li><a href="#" data-go="${F}/restored/entry_1123">diary/entry_1123.txt</a>　<span class="dn-small">（未損毀的版本）</span></li>
  <li><a href="#" data-go="${F}/restored/keeper">cgi-bin/keeper.pl</a></li>
  <li><a href="#" data-go="${F}/restored/readme_kei">readme_for_kei.txt</a></li>
</ul>`;
        }
        return { title: '還原精靈 - ftp.local', html: `<div class="ftp-wrap">${crumb('restore.cgi')}<div class="ftp-wizard"><div class="ftp-wiz-head">網站還原精靈</div>${body}</div></div>` };
      }
    }
  };

  Object.keys(DIRS).forEach(dir => {
    pages[dir] = { render(ctx) { return solved('p5a') ? { title: 'ftp://ftp.local/' + dir + '/', html: `<div class="ftp-wrap">${listing(dir)}</div>` } : loginPage(); } };
    DIRS[dir].forEach(f => {
      pages[dir + '/' + f.name.toLowerCase()] = {
        render(ctx) {
          if (!solved('p5a')) return loginPage();
          let view;
          if (f.type === 'txt') {
            view = `<pre class="ftp-txt"${f.clue ? ` data-clue="${f.clue}"` : ''}>${UI.esc(TXT[f.name])}</pre>`;
          } else if (f.type === 'jpg') {
            const ex = EXIF[f.photo].map(([k, v]) => `<tr><th>${k}</th><td>${v || '<span class="muted">（空白）</span>'}</td></tr>`).join('');
            view = `<div class="ftp-img"><canvas data-canvas="${f.photo}"></canvas></div>
<table class="ftp-exif" cellspacing="0"${f.photo === '1129' ? ' data-clue="ftp-exif"' : ''}><tr><th colspan="2">EXIF 資訊（原始檔）</th></tr>${ex}</table>`;
          } else {
            view = `<div class="ftp-zip">這是一個壓縮檔（${f.size}）。<br>要查看內容，請使用 <a href="#" data-go="${F}/restore">還原精靈</a>。</div>`;
          }
          return {
            title: f.name + ' - ftp.local',
            html: `<div class="ftp-wrap">${crumb(dir + '/' + f.name)}<div class="ftp-meta">大小 ${f.size}　修改時間 ${f.mod}　<a href="#" data-go="${F}/${dir}">« 回到 ${dir}/</a></div>${view}</div>`,
            after(root) { root.querySelectorAll('canvas[data-canvas]').forEach(cv => Photos.draw(cv, cv.dataset.canvas)); }
          };
        }
      };
    });
  });

  Object.entries(RESTORED).forEach(([k, r]) => {
    pages['restored/' + k] = {
      render(ctx) {
        if (!solved('p5c')) return ErrorPages.notFound(F, 'restored/' + k);
        return { title: r.name + ' - ftp.local', html: `<div class="ftp-wrap">${crumb('restored/' + r.name)}<div class="ftp-meta">修改時間 ${r.mod}　<a href="#" data-go="${F}/restore">« 回到還原精靈</a></div>
<pre class="ftp-txt${r.code ? ' code' : ''}"${r.clue ? ` data-clue="${r.clue}"` : ''}>${UI.esc(r.text)}</pre></div>` };
      }
    };
  });

  window.SITES = window.SITES || {};
  window.SITES.ftp = { id: 'ftp', host: F, name: 'ftp.local', cls: 'site-ftp', pages };
})();
