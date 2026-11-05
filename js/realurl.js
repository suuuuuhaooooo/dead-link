/* 真實網址同步：遊戲內的網址會反映在瀏覽器真正的網址列上。
   - 架在 http(s)（GitHub Pages）時：https://帳號.github.io/dead-link/home.local/diary
     重新整理時 GitHub 會回傳 404.html，它再把玩家導回遊戲的同一頁。
   - 直接開本機檔案（file://）時：index.html#/home.local/diary */
(function () {
  const isHttp = /^https?:$/.test(location.protocol);
  const base = location.pathname.replace(/[^/]*$/, '');   // index.html 所在資料夾

  const RealURL = {
    mode: isHttp ? 'path' : 'hash',
    base,

    href(route) { return this.mode === 'path' ? base + route : '#/' + route; },

    /* 真實檔案（新分頁用）的位址 */
    file(rel) { return base + rel; },

    /* 一開始要進入的遊戲內網址（從 404 轉址、或網址的 hash） */
    initial() {
      const q = new URLSearchParams(location.search).get('r');
      if (q) return decodeURIComponent(q);
      if (location.hash.startsWith('#/')) return decodeURIComponent(location.hash.slice(2));
      return null;
    },

    push(route, replace) {
      try {
        const url = this.href(route) || base;
        if (replace) history.replaceState({ route }, '', url);
        else history.pushState({ route }, '', url);
      } catch (e) { /* 某些環境（file://）不允許，忽略 */ }
    },

    reset() { try { history.replaceState({}, '', this.mode === 'path' ? base : location.pathname); } catch (e) {} }
  };

  window.RealURL = RealURL;
})();
