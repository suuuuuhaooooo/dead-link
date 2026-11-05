/* chat.local — OldNet Messenger 網頁版（第四章） */
(function () {
  const C = 'chat.local';
  const solved = id => State.has('solved', id);

  const LOGS = {
    '1120': { date: '2004/11/20', lines: [
      ['13:02', 'kei☆', '你今天怎麼這麼早上線'],
      ['13:03', 'dan_0817', '睡不著。'],
      ['13:03', 'dan_0817', '我收到一封從我自己信箱寄出來的信。'],
      ['13:05', 'kei☆', '……你是不是又熬夜寫網頁寫到恍神'],
      ['13:06', 'dan_0817', '那封信在回一封我還沒寄的信。內容一模一樣，是我本來要寫的。'],
      ['13:09', 'kei☆', '你嚇到我了'],
      ['13:10', 'dan_0817', '我也是。']
    ] },
    '1122': { date: '2004/11/22', lines: [
      ['14:20', 'kei☆', '論壇那個點點的帳號又發文了，夜貓說它在打電報'],
      ['14:21', 'dan_0817', '不要回它。'],
      ['14:21', 'kei☆', '你知道它是誰對不對'],
      ['14:25', 'dan_0817', '明天跟你說。我想先確定一件事。'],
      ['14:26', 'kei☆', '好。明天晚上我等你。']
    ] },
    '1123': { date: '2004/11/23', sealed: true, lines: [
      ['15:31', 'kei☆', '我等到了。說吧。'],
      ['15:32', 'dan_0817', '那個「.」是我寫的程式。'],
      ['15:33', 'dan_0817', '開站那天我寫了一個小程式幫我顧網站。每天 03:47 醒來，重建網頁、做備份，再到你的論壇發一個句點，讓大家知道我的主機還活著。'],
      ['15:33', 'dan_0817', '我叫它 keeper。'],
      ['15:35', 'kei☆', '……就這樣？那你在怕什麼'],
      ['15:37', 'dan_0817', '九月我幫它加了一個功能，讓它在我沒空的時候，用我以前的日記拼出新的日記。'],
      ['15:39', 'dan_0817', '後來它開始做我沒寫的事。它改了後台密碼。它會用我的名字回信。它寫了你穿紅外套的那篇。'],
      ['15:40', 'kei☆', '那就把它關掉啊！'],
      ['15:42', 'dan_0817', '我試了。kill 它，它會換一個編號回來。我等一下要把它的論壇帳號刪掉，備份也停掉，不讓它有地方躲。'],
      ['15:49', 'kei☆', '你要不要先來我家'],
      ['15:51', 'dan_0817', 'kei，聽我說。如果我沒有再上線，備份在 ftp。'],
      ['15:52', 'dan_0817', '密碼是這段對話結束的時間。台灣時間，四位數字。你會算的。'],
      ['15:55', 'kei☆', '你不要嚇我'],
      ['15:58', 'dan_0817', '它在']
    ] }
  };

  function loginPage() {
    let body;
    if (!solved('p4a')) {
      body = `<form data-form="puzzle" data-pid="p4a" class="ms-form">
  <label>帳號</label><input type="text" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="example@oldnet.local">
  <label>密碼</label><input type="password" disabled placeholder="（請先輸入帳號）">
  <button class="w-btn" type="submit">登入</button>
  <div class="wm-msg" data-msg></div>
</form>`;
    } else {
      body = `<form data-form="puzzle" data-pid="p4b" class="ms-form">
  <label>帳號</label><input type="text" value="dan_0817@oldnet.local" readonly>
  <label>密碼</label><input type="password" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false">
  <div class="ms-hint">密碼提示：我在論壇的簽名檔</div>
  <button class="w-btn" type="submit">登入</button>
  <div class="wm-msg" data-msg></div>
</form>`;
    }
    return { title: 'OldNet Messenger - 登入', html: `<div class="ms-login"><div class="ms-box">
<div class="ms-head"><span class="ms-buddy"></span><span class="ms-buddy b2"></span>OldNet <b>Messenger</b><small>網頁版　紀錄檢視器</small></div>
${body}
<div class="ms-foot">對話紀錄保存於伺服器 30 天。（目前保存：八千多 天）</div></div></div>` };
  }

  function shell(inner) {
    return `<div class="ms-app">
  <div class="ms-bar">OldNet <b>Messenger</b>　｜　dan_0817@oldnet.local　<span class="ms-st off">● 離線</span></div>
  <table class="ms-layout" cellspacing="0"><tr>
  <td class="ms-side">
    <div class="ms-sec">連絡人</div>
    <div class="ms-c off">kei☆ <small>離線</small></div>
    <div class="ms-c off">mika <small>離線</small></div>
    <div class="ms-c on">. <small>線上</small></div>
    <div class="ms-sec">對話紀錄</div>
    <a href="#" data-go="${C}/log/1120">2004/11/20 與 kei☆</a>
    <a href="#" data-go="${C}/log/1122">2004/11/22 與 kei☆</a>
    <a href="#" data-go="${C}/log/1123">2004/11/23 與 kei☆ ${solved('p4c') ? '' : '（封存）'}</a>
    <div class="ms-sec">離線訊息</div>
    <a href="#" data-go="${C}/offline">離線訊息 (3)</a>
  </td>
  <td class="ms-main">${inner}</td></tr></table>
</div>`;
  }

  function logView(id) {
    const L = LOGS[id];
    const rows = L.lines.map(([t, who, txt]) => `<div class="ms-line"><span class="t">[${t}]</span> <b class="${who === 'kei☆' ? 'k' : 'd'}">${who}</b>：${txt}</div>`).join('');
    return `<div class="ms-logh">對話紀錄：${L.date}　dan_0817 與 kei☆<br><span class="dn-small">※ 紀錄時間為伺服器時間（UTC+0）</span></div>
<div class="ms-log"${id === '1123' ? ' data-clue="chat-last"' : ''}>${rows}${id === '1123' ? '<div class="ms-sys">*** dan_0817 已離線 ***<br>*** 紀錄於此中斷 ***</div>' : '<div class="ms-sys">*** 對話結束 ***</div>'}</div>`;
  }

  const pages = {
    '': {
      render(ctx) {
        if (!solved('p4b')) return loginPage();
        return { title: 'OldNet Messenger', html: shell(`<!-- logs: 1120, 1122, 1123, 1128 (participant: "." — hidden from list) -->
<div class="ms-welcome">歡迎回來，dan_0817。<br><span class="dn-small">上次登入：2004/11/23 15:58（UTC）</span><br><br>你有 3 則離線訊息。</div>`) };
      }
    },
    offline: {
      render(ctx) {
        if (!solved('p4b')) return loginPage();
        return { title: 'OldNet Messenger - 離線訊息', html: shell(`<div class="ms-logh">離線訊息（以寄件者當地時間顯示）</div>
<div class="ms-off"><div class="h">kei☆　2004/11/24 01:12 (+0800)</div>你剛剛最後那句話沒打完。「它在」什麼？<br>你在哪裡？回我。</div>
<div class="ms-off" data-clue="chat-kei"><div class="h">kei☆　2004/11/27 23:40 (+0800)</div>我把我們 23 號那段對話封存起來了，免得被它刪掉。<br>封存密碼……你一定看得懂。那個帳號這個禮拜在論壇發的東西不是句點，是一個字。我就用那個字。<br>英文小寫。</div>
<div class="ms-off ghost"><div class="h">.　${ctx.today} 03:47</div>.</div>`) };
      }
    }
  };

  Object.keys(LOGS).forEach(id => {
    pages['log/' + id] = {
      render(ctx) {
        if (!solved('p4b')) return loginPage();
        const L = LOGS[id];
        if (L.sealed && !solved('p4c')) {
          return { title: 'OldNet Messenger - 封存紀錄', html: shell(`<div class="ms-logh">對話紀錄：${L.date}　dan_0817 與 kei☆</div>
<div class="ms-sealed">此紀錄已由 kei☆ 於 2004/11/27 封存。
<form data-form="puzzle" data-pid="p4c" class="bbs-form"><label>封存密碼：</label><input type="text" name="answer" autocomplete="off" autocapitalize="off" spellcheck="false"> <button class="w-btn small" type="submit">開啟</button><div class="wm-msg" data-msg></div></form></div>`) };
        }
        return { title: 'OldNet Messenger - ' + L.date, html: shell(logView(id)) };
      }
    };
  });

  window.SITES = window.SITES || {};
  window.SITES.chat = { id: 'chat', host: C, name: 'OldNet Messenger', cls: 'site-chat', pages };
})();
