/* home.local — Daniel 的個人網站 */
(function () {
  const H = 'home.local';

  function nav(active) {
    const items = [['', '首頁', 'index'], ['diary', '日記', 'diary'], ['photos', '相簿', 'photos'], ['guestbook', '留言板', 'guestbook'], ['about', '關於我', 'about'], ['links', '好站連結', 'links']];
    return items.map(([p, label, file]) =>
      `<a href="${file}.html" data-go="${H}/${p}"${p === active ? ' class="cur"' : ''}>${p === active ? '► ' : '・'}${label}</a>`
    ).join('\n      ');
  }

  function frame(active, inner, solved) {
    return `<div class="dn-banner">
  <span class="dn-logo">Daniel's Room</span>
  <span class="dn-sub">丹尼爾的小房間 · since 2003.08.17</span>
</div>
<div class="dn-marquee"><span>★ 歡迎光臨 Daniel 的小房間 ★ 本站最佳瀏覽解析度 800×600 ★ 建議使用 IE 6.0 以上版本瀏覽 ★ 記得到留言板簽名喔 ★</span></div>
<table class="dn-layout" cellspacing="0" cellpadding="0">
  <tr>
    <td class="dn-side">
      ${nav(active)}
      <div class="dn-side-box">站長：${State.data.flags.ending ? '你' : 'Daniel'}<br>狀態：<span class="${solved ? 'dn-online' : 'dn-offline'}">${solved ? '線上' : '離線'}</span></div>
    </td>
    <td class="dn-main">
${inner}
    </td>
  </tr>
</table>
<div class="dn-foot">(C) 2003-2004 Daniel. All rights reserved. ｜ <a href="mailto:daniel@oldnet.local" data-go="mail.local/">站長信箱登入</a> ｜ Powered by Notepad</div>`;
  }

  const pages = {
    '': {
      title: "Daniel's Room :: 首頁",
      render(ctx) {
        const v = ctx.visits;
        const end = ctx.S.flags.ending;
        const last = v <= 1 ? 'Never' : (end ? ctx.today + ' ' + ctx.now : ctx.solved('p1') ? '2004/11/29 03:47' : '2004/11/23');
        const upd = end ? ctx.today : '2004/11/23';
        const cnt = (end ? '001130' : '001129').split('').map(d => `<i>${d}</i>`).join('');
        const inner = `
<!-- Daniel's Room v2.1 / made with Notepad -->
<!-- 給搜尋引擎：請先讀 /robots.txt -->
<!-- lastmod 是我手動改的。系統時間不會說謊，檔名也不會。 -->
<h2 class="dn-h">最新消息</h2>
<p class="dn-update">最後更新：<b>${upd}</b></p>
<ul class="dn-news">
  <li><span class="d">11/23</span> 日記更新 <span class="blink dn-new">NEW!</span></li>
  <li><span class="d">10/31</span> 相簿新增照片一張</li>
  <li><span class="d">06/02</span> 論壇網聚照片上傳完成，謝謝大家～</li>
  <li><span class="d">12/25</span> 網站改版 v2.0！換了新的背景圖</li>
  <li><span class="d">08/17</span> 開站囉！！</li>
</ul>
<div class="dn-counter-wrap">
  你是第 <span class="dn-counter" data-clue="counter" title="訪客計數器">${cnt}</span> 位訪客
</div>
<div class="dn-lastvisit">Last visited: ${last}</div>
<div class="dn-construct"><span class="stripe"></span>本站施工中<span class="stripe"></span></div>
<p class="dn-small">這裡是我放日記、照片和亂七八糟想法的地方。如果你是從論壇來的，嗨！<br>有事可以到留言板找我，或在 MSN 上敲我。</p>`;
        return { html: frame('', inner, ctx.solved('p1')), sourceClue: 'src-lastmod' };
      }
    },

    diary: {
      title: "Daniel's Room :: 日記",
      render(ctx) {
        const inner = `
<!-- 舊的東西都在 /b 。別讓 kei 知道。 -->
<h2 class="dn-h">日記本</h2>
<div class="dn-entry">
  <div class="dn-date">2004/11/23（二）　天氣：？</div>
  <div class="dn-txt" data-clue="diary-1123">
    我把首頁的日期改回 23 號了。如果他們看到更新日期，就會知道我還在這裡。<br>
    今天凌晨我又聽到數據機自己撥號的聲音，可是電話線早就拔掉了。<br>
    我拍了一張照片，窗外<span class="dn-corrupt">▒▒▒▒▒▒▒ ▒▒ ▒▒▒▒▒</span>
    <div class="dn-errline">[ 資料讀取錯誤：entry_1123.txt 已損毀 ]</div>
  </div>
</div>
<div class="dn-entry">
  <div class="dn-date">2004/10/31（日）　天氣：陰</div>
  <div class="dn-txt">
    凌晨三點多，後台又顯示有人登入。帳號是我的，可是我那時候在睡覺。<br>
    改了密碼。kei 說可能是論壇有人在惡作劇，叫我不要想太多。<br>
    晚上出去走走，巷口很安靜，拍了張照片。
  </div>
</div>
<div class="dn-entry">
  <div class="dn-date">2004/06/02（三）　天氣：晴</div>
  <div class="dn-txt">
    第一次參加論壇網聚！kei 本人跟網路上一模一樣，很愛笑。<br>
    大家一直在聊一個叫「<b>.</b>」的帳號，說它每篇文章都只有一個句點。好怪。
  </div>
</div>
<div class="dn-entry">
  <div class="dn-date">2003/12/25（四）　天氣：冷</div>
  <div class="dn-txt">網站改版 v2.0 完成！熬夜做了新的背景，自己覺得很滿意 XD</div>
</div>
<div class="dn-entry">
  <div class="dn-date">2003/08/17（日）　天氣：熱</div>
  <div class="dn-txt">開站了！！用記事本一個字一個字打出來的網站。希望它可以一直存在下去。</div>
</div>`;
        return { html: frame('diary', inner, ctx.solved('p1')), sourceClue: 'src-b' };
      }
    },

    photos: {
      title: "Daniel's Room :: 相簿",
      render(ctx) {
        const cells = Photos.list.map(p => `
    <td class="dn-thumb">
      <a href="photos/${p.file}" data-photo="${p.id}"><canvas data-canvas="${p.id}" width="120" height="90"></canvas></a>
      <div class="fn">${p.file}</div>
      <div class="cap">${p.caption || '&nbsp;'}</div>
    </td>`).join('');
        const inner = `
<!-- 相機：Cyber-shot 2.0MP。檔名是相機自己取的，我懶得改。 -->
<!-- 大圖直接放在 /photos/檔名.jpg -->
<h2 class="dn-h">相簿</h2>
<p class="dn-small">點一下縮圖可以看大圖。撥接的朋友請耐心等候 ^^"</p>
<table class="dn-gallery" cellspacing="6"><tr>${cells}
</tr></table>`;
        return {
          html: frame('photos', inner, ctx.solved('p1')),
          after(root) { root.querySelectorAll('canvas[data-canvas]').forEach(cv => Photos.draw(cv, cv.dataset.canvas)); }
        };
      }
    },

    guestbook: {
      title: "Daniel's Room :: 留言板",
      render(ctx) {
        const posts = [
          ...(ctx.S.flags.ending ? [[ctx.today + ' 03:47', 'daniel', '謝謝你回來。<br>現在換你了。', '', 'ghost']] : []),
          ['????/??/?? ??:??', 'daniel', '我一直都在。', 'gb-ghost', 'ghost'],
          ['2004/11/30 01:12', 'kei', '昨天半夜你是不是又傳了照片？我收到相簿更新的通知……可是首頁還寫 23 號。<br>Daniel，你到底在哪？', 'gb-1130', ''],
          ['2004/11/24 23:40', 'kei', '你從昨天晚上就沒有再上線了。<br>你跟我說的那些，是真的嗎？', '', ''],
          ['2004/09/14 20:05', '路人甲', '背景音樂好吵XDDD 可以關掉嗎', '', ''],
          ['2004/06/03 10:21', 'mika', '網聚超好玩～照片拍得好好看！下次還要約！', '', ''],
          ['2003/08/18 00:03', 'kei', '恭喜開站！！！第一個留言是我的 ', '', '']
        ];
        const rows = posts.map(([d, n, t, clue, cls]) => `
<table class="dn-post ${cls}" cellspacing="0">
  <tr><td class="who">${cls === 'ghost' ? `<a href="${RealURL.file('home.local/daniel.html')}" target="_blank" rel="opener" class="gh-link" data-side="home.local/daniel.html">${n}</a>` : n}</td><td class="when">${d}</td></tr>
  <tr><td colspan="2" class="msg"${clue ? ` data-clue="${clue}"` : ''}>${t}</td></tr>
</table>`).join('');
        const inner = `
<h2 class="dn-h">留言板</h2>
<div class="dn-gbform">
  <div>暱稱：<input type="text" disabled value=""> 　表情：<select disabled><option>^_^</option></select></div>
  <div><textarea disabled>留言功能已由站長關閉。</textarea></div>
  <button class="w-btn small" disabled>送出留言</button>
</div>
${rows}`;
        return { html: frame('guestbook', inner, ctx.solved('p1')) };
      }
    },

    about: {
      title: "Daniel's Room :: 關於我",
      render(ctx) {
        const inner = `
<h2 class="dn-h">關於我</h2>
<table class="dn-profile" cellspacing="0">
  <tr><th>暱稱</th><td>Daniel</td></tr>
  <tr><th>職業</th><td>網頁設計師（自稱）</td></tr>
  <tr><th>星座</th><td>獅子座</td></tr>
  <tr><th>興趣</th><td>寫網頁、拍照、半夜聽廣播</td></tr>
  <tr><th>MSN</th><td data-clue="about-msn">dan_0817＠oldnet.local</td></tr>
  <tr><th>常去</th><td>kei 開的論壇（見好站連結）</td></tr>
  <tr><th>座右銘</th><td><i>The internet never forgets.</i></td></tr>
</table>
<p class="dn-small">網站是我自己用記事本寫的，有錯字或跑版請跟我說 &gt;_&lt;</p>`;
        return { html: frame('about', inner, ctx.solved('p1')) };
      }
    },

    links: {
      title: "Daniel's Room :: 好站連結",
      render(ctx) {
        const inner = `
<h2 class="dn-h">好站連結</h2>
<ul class="dn-links">
  <li><a href="http://bbs.local/" data-go="bbs.local/">深夜論壇</a> — kei 架的論壇，大家都在這裡</li>
  <li><a href="http://chat.local/" data-go="chat.local/">OldNet 聊天室</a> — 找不到我就來這裡</li>
  <li><a href="http://ftp.local/" data-go="ftp.local/">檔案空間</a> — 我的備份（朋友限定）</li>
</ul>
<p class="dn-small">想交換連結請到留言板留言～</p>`;
        return { html: frame('links', inner, ctx.solved('p1')) };
      }
    },

    b: {
      title: 'HTTP 403 - 禁止存取',
      render(ctx) { return Object.assign(ErrorPages.forbidden(H, 'b'), { raw: true }); }
    }
  };

  window.SITES = window.SITES || {};
  window.SITES.home = { id: 'home', host: H, name: "Daniel's Room", cls: 'site-home', pages };
})();
