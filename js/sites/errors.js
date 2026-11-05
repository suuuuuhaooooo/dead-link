/* 舊式瀏覽器錯誤頁 */
window.ErrorPages = {
  dns(host) {
    return {
      title: '無法顯示網頁',
      cls: 'site-error',
      html:
`<div class="ie-err">
  <div class="ie-err-head"><span class="ie-err-ico">i</span><h1>無法顯示網頁</h1></div>
  <p>您要查看的網頁目前無法使用。可能是該網站發生技術性問題，或您需要調整瀏覽器設定。</p>
  <hr>
  <p>請嘗試下列動作：</p>
  <ul>
    <li>確認網址 <b>${host}</b> 拼寫正確。</li>
    <li>按一下 <a href="#" data-act="back">上一頁</a> 試試其他連結。</li>
    <li>這個伺服器可能還在沉睡。也許它在等你先找到什麼。</li>
  </ul>
  <p class="ie-err-code">找不到伺服器或發生 DNS 錯誤<br>Dead Link Browser</p>
</div>`
    };
  },

  notFound(host, path) {
    return {
      title: 'HTTP 404 - 找不到檔案',
      cls: 'site-error',
      html:
`<!--
You found the wrong page.
Try looking where it all began.
-->
<div class="ie-err">
  <div class="ie-err-head"><span class="ie-err-ico warn">!</span><h1>找不到網頁</h1></div>
  <p>您要尋找的網頁 <b>/${path}</b> 可能已被移除、名稱已變更，或暫時無法使用。</p>
  <hr>
  <ul>
    <li>開啟 <a href="index.html" data-go="${host}/">${host}</a> 首頁，然後尋找您要的資訊連結。</li>
    <li>按一下 <a href="#" data-act="back">上一頁</a> 試試其他連結。</li>
  </ul>
  <p class="ie-err-code">HTTP 404 - 找不到檔案<br>Dead Link Browser</p>
</div>`
    };
  },

  forbidden(host, path) {
    return {
      title: 'HTTP 403 - 禁止存取',
      cls: 'site-error',
      html:
`<!-- 還沒到時候。 -->
<div class="ie-err">
  <div class="ie-err-head"><span class="ie-err-ico stop">×</span><h1>您沒有檢視此網頁的權限</h1></div>
  <p>您沒有使用所提供認證檢視 <b>/${path}/</b> 目錄或網頁的權限。</p>
  <hr>
  <p>Index of /${path}/ 已被站長鎖定。</p>
  <p class="ie-err-code">HTTP 403 - 禁止存取<br>Dead Link Browser</p>
</div>`
    };
  }
};
