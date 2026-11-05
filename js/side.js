/* 真實分頁（分支小網頁）共用：把「玩家打開了這一頁」告訴遊戲主分頁 */
window.Side = {
  send(id, secret) {
    try {
      const q = JSON.parse(localStorage.getItem('deadlink.side') || '[]');
      q.push({ id, secret, t: Date.now() });
      localStorage.setItem('deadlink.side', JSON.stringify(q));
    } catch (e) {}
  },
  game() {
    // 回到遊戲首頁（index.html 在網站根目錄）
    const parts = location.pathname.split('/');
    const i = parts.findIndex(p => /\.local$/.test(p));
    return (i > 0 ? parts.slice(0, i).join('/') : '') + '/';
  }
};

/* 單獨開成分頁時，提供一個回去的出口（在遊戲的小視窗裡就不顯示） */
document.addEventListener('DOMContentLoaded', () => {
  if (window.top !== window) return;
  const a = document.createElement('a');
  a.textContent = '« 關閉視窗，回到網站';
  a.href = Side.game();
  a.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9;font:12px Tahoma,Arial,sans-serif;color:#888;background:rgba(0,0,0,.6);padding:4px 8px;text-decoration:none;';
  a.addEventListener('click', e => {
    if (window.opener) { e.preventDefault(); window.close(); setTimeout(() => { location.href = Side.game(); }, 300); }
  });
  document.body.appendChild(a);
});
