/* 虛構網際網路的路由：host/path → 頁面 */
(function () {
  const pad = n => String(n).padStart(2, '0');

  const Router = {
    parse(input) {
      let s = String(input || '').trim().replace(/^view-source:/i, '').replace(/^[a-z]+:\/\//i, '');
      if (!s) s = 'home.local';
      s = s.split('#')[0].split('?')[0];
      const i = s.indexOf('/');
      let host = (i < 0 ? s : s.slice(0, i)).toLowerCase();
      let path = i < 0 ? '' : s.slice(i + 1);
      if (!host.includes('.')) host += '.local';
      if (host.startsWith('www.')) host = host.slice(4);
      path = path.replace(/\/+$/, '').replace(/\.(html?|php|asp|cgi)$/i, '').replace(/^index$/i, '').toLowerCase();
      return { host, path };
    },

    site(host) { return Object.values(SITES).find(s => s.host === host); },

    reachable(site) {
      const gate = SITE_GATES[site.id];
      return !gate || State.has('solved', gate);
    },

    resolve(host, path) {
      const site = this.site(host);
      if (!site || !this.reachable(site)) return Object.assign(ErrorPages.dns(host), { site: null });
      const page = site.pages[path];
      if (!page) {
        if (site.id === 'home' && path === 'b') return Object.assign(ErrorPages.forbidden(host, 'b'), { site });
        return Object.assign(ErrorPages.notFound(host, path), { site });
      }
      const d = new Date();
      const ctx = {
        S: State.data,
        visits: State.visit(host + '/' + path),
        solved: pid => State.has('solved', pid),
        today: `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
        now: `${pad(d.getHours())}:${pad(d.getMinutes())}`
      };
      const r = page.render(ctx);
      return Object.assign({ title: page.title || site.name, cls: site.cls, site }, r);
    }
  };
  window.Router = Router;
})();
