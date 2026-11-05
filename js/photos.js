/* 相簿照片：用 canvas 即時畫出低解析度、帶雜訊的「2004 年數位相機」照片 */
(function () {
  const W = 120, H = 90;

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function glow(c, x, y, r, color, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', a));
    g.addColorStop(1, color.replace('A', 0));
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function blob(c, x, y, rx, ry, fill) {
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
  }

  const scenes = {
    // 2003/08/17 開站那天的書桌：檯燈、CRT 螢幕、杯子
    desk(c, r) {
      let g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#3b2a1e'); g.addColorStop(0.62, '#58402c'); g.addColorStop(0.63, '#6b4a2f'); g.addColorStop(1, '#2d1d12');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      glow(c, 22, 18, 60, 'rgba(255,214,150,A)', 0.55);
      // 窗簾
      c.fillStyle = 'rgba(120,90,60,.5)'; c.fillRect(96, 0, 24, 56);
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(60,40,25,.35)'; c.fillRect(98 + i * 4, 0, 1.2, 56); }
      // 螢幕
      c.fillStyle = '#c9c1aa'; c.beginPath(); c.moveTo(42, 18); c.lineTo(88, 17); c.lineTo(90, 58); c.lineTo(40, 59); c.closePath(); c.fill();
      c.fillStyle = '#9d957f'; c.fillRect(56, 58, 20, 5);
      g = c.createLinearGradient(46, 22, 84, 52);
      g.addColorStop(0, '#5f8fd6'); g.addColorStop(1, '#2a4d93');
      c.fillStyle = g; c.fillRect(46, 22, 38, 30);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(49, 25, 18, 2); c.fillRect(49, 29, 26, 1.5); c.fillRect(49, 32, 22, 1.5);
      glow(c, 65, 37, 40, 'rgba(120,170,255,A)', 0.18);
      // 鍵盤
      c.save(); c.translate(64, 72); c.rotate(-0.04);
      c.fillStyle = '#d6cfba'; c.fillRect(-26, -5, 52, 10);
      c.fillStyle = 'rgba(80,70,50,.35)';
      for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) c.fillRect(-24 + i * 4.2, -3.5 + j * 3, 3, 2);
      c.restore();
      // 杯子
      blob(c, 101, 70, 7, 2.5, '#efe7d8'); c.fillStyle = '#e6dccb'; c.fillRect(94, 62, 14, 8); blob(c, 101, 62, 7, 2.2, '#5a3519');
      // 檯燈
      c.fillStyle = '#2b2b2b'; c.beginPath(); c.moveTo(10, 10); c.lineTo(30, 6); c.lineTo(28, 16); c.closePath(); c.fill();
      c.strokeStyle = '#333'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(20, 12); c.lineTo(14, 40); c.lineTo(18, 66); c.stroke();
      blob(c, 18, 67, 7, 2, '#222');
    },

    // 2004/06/02 網聚的咖啡店：逆光的窗、桌上的杯子、模糊的人影
    cafe(c, r) {
      let g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#d8c7a3'); g.addColorStop(0.55, '#a27e57'); g.addColorStop(1, '#4b3221');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,250,232,.85)'; c.fillRect(8, 6, 46, 34); c.fillRect(62, 6, 46, 34);
      c.fillStyle = 'rgba(150,170,120,.35)'; c.fillRect(8, 26, 100, 14);
      glow(c, 34, 22, 50, 'rgba(255,248,220,A)', 0.5);
      // 人影（逆光）
      blob(c, 30, 40, 10, 12, 'rgba(70,48,34,.85)'); blob(c, 30, 24, 6, 7, 'rgba(70,48,34,.9)');
      blob(c, 86, 42, 12, 13, 'rgba(58,40,30,.85)'); blob(c, 86, 25, 6.5, 7.5, 'rgba(58,40,30,.9)');
      blob(c, 60, 46, 8, 9, 'rgba(90,62,42,.7)'); blob(c, 60, 34, 5, 6, 'rgba(90,62,42,.75)');
      // 桌子
      blob(c, 60, 72, 58, 18, '#6b4529');
      blob(c, 60, 70, 55, 15, '#7d5534');
      [[38, 66], [58, 72], [80, 65], [70, 78]].forEach(([x, y]) => {
        blob(c, x, y + 2, 6, 2.2, 'rgba(0,0,0,.25)');
        blob(c, x, y, 5, 2, '#f4efe6'); blob(c, x, y - 0.4, 3.6, 1.3, '#4a2a14');
      });
      c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(48, 60, 6, 9);
    },

    // 2004/10/31 巷口：夜晚、路燈、潮濕的地面
    street(c, r) {
      let g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0f1426'); g.addColorStop(0.55, '#1e2236'); g.addColorStop(1, '#141018');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      // 建築
      c.fillStyle = '#0b0d16';
      c.fillRect(0, 14, 34, 48); c.fillRect(30, 26, 22, 36); c.fillRect(78, 8, 42, 54); c.fillRect(64, 30, 18, 32);
      for (let i = 0; i < 26; i++) {
        const x = [3, 33, 68, 82][i % 4] + Math.floor(r() * 26), y = 16 + Math.floor(r() * 38);
        if ((x > 52 && x < 64) || x > 118) continue;
        c.fillStyle = r() > .3 ? 'rgba(255,205,120,.75)' : 'rgba(170,200,255,.6)';
        c.fillRect(x, y, 2.4, 2);
      }
      // 招牌
      c.fillStyle = 'rgba(255,90,60,.85)'; c.fillRect(18, 30, 4, 16);
      glow(c, 20, 38, 14, 'rgba(255,90,60,A)', 0.35);
      // 路燈
      c.strokeStyle = '#222'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(58, 62); c.lineTo(58, 18); c.lineTo(64, 16); c.stroke();
      glow(c, 64, 18, 34, 'rgba(255,170,80,A)', 0.55);
      blob(c, 64, 18, 2, 1.5, '#ffe2b0');
      // 路面與倒影
      g = c.createLinearGradient(0, 62, 0, H);
      g.addColorStop(0, '#2a2530'); g.addColorStop(1, '#0d0b10');
      c.fillStyle = g; c.fillRect(0, 62, W, H - 62);
      c.fillStyle = 'rgba(255,170,80,.35)'; c.fillRect(61, 64, 6, 24);
      c.fillStyle = 'rgba(255,90,60,.25)'; c.fillRect(18, 64, 4, 16);
      // 機車
      blob(c, 92, 74, 9, 4, '#121218'); blob(c, 86, 78, 3, 3, '#050505'); blob(c, 99, 78, 3, 3, '#050505');
      glow(c, 84, 73, 5, 'rgba(255,240,200,A)', 0.4);
    },

    // 2004/11/29 03:47 窗戶：幾乎全黑、遠處燈火、玻璃上有一點不該有的東西
    window(c, r) {
      c.fillStyle = '#05060a'; c.fillRect(0, 0, W, H);
      let g = c.createLinearGradient(0, 8, 0, 80);
      g.addColorStop(0, '#0d1630'); g.addColorStop(1, '#090b14');
      c.fillStyle = g; c.fillRect(14, 8, 92, 72);
      for (let i = 0; i < 18; i++) {
        c.fillStyle = 'rgba(255,200,130,' + (0.25 + r() * 0.4) + ')';
        c.fillRect(16 + r() * 88, 52 + r() * 22, 1.2, 1);
      }
      glow(c, 70, 68, 26, 'rgba(255,160,90,A)', 0.12);
      // 窗框
      c.fillStyle = '#23252b';
      c.fillRect(12, 6, 96, 3); c.fillRect(12, 79, 96, 3); c.fillRect(12, 6, 3, 76); c.fillRect(105, 6, 3, 76); c.fillRect(58.5, 6, 3, 76);
      // 螢幕的反光
      glow(c, 34, 60, 22, 'rgba(110,150,230,A)', 0.16);
      c.fillStyle = 'rgba(130,170,240,.12)'; c.fillRect(24, 52, 20, 14);
      // 右側玻璃上淡淡的人影
      c.globalAlpha = 0.09;
      blob(c, 84, 40, 6, 7.5, '#c9d4ea');
      c.beginPath(); c.moveTo(72, 70); c.quadraticCurveTo(74, 50, 84, 49); c.quadraticCurveTo(95, 50, 97, 70); c.closePath();
      c.fillStyle = '#c9d4ea'; c.fill();
      c.globalAlpha = 1;
      // 閃光燈在玻璃上的白點
      glow(c, 40, 30, 10, 'rgba(255,255,255,A)', 0.55);
    }
  };

  function finish(c, r, strength) {
    // 感光雜訊 + 輕微色偏 + 暗角
    const img = c.getImageData(0, 0, W, H), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * strength;
      d[i] = Math.max(0, Math.min(255, d[i] + n + 3));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 1.2));
    }
    c.putImageData(img, 0, 0);
    const v = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }

  const Photos = {
    list: [
      { id: '0817', file: 'dsc_0817_1402.jpg', caption: '開站那天的書桌（螢幕上就是這個網站！）', date: '2003/08/17 14:02', scene: 'desk', seed: 817 },
      { id: '0602', file: 'dsc_0602_1730.jpg', caption: '論壇網聚＠老地方咖啡', date: '2004/06/02 17:30', scene: 'cafe', seed: 602 },
      { id: '1031', file: 'dsc_1031_2248.jpg', caption: '萬聖節晚上的巷口，好安靜', date: '2004/10/31 22:48', scene: 'street', seed: 1031 },
      { id: '1129', file: 'dsc_1129_0347.jpg', caption: '', date: '----/--/-- --:--（EXIF 資料損毀）', scene: 'window', seed: 1129, clue: 'photo-1129' }
    ],

    get(id) { return this.list.find(p => p.id === id); },

    draw(canvas, id) {
      const p = this.get(id);
      canvas.width = W; canvas.height = H;
      const c = canvas.getContext('2d');
      const r = rng(p.seed);
      scenes[p.scene](c, r);
      finish(c, r, p.scene === 'window' ? 26 : 16);
    }
  };

  window.Photos = Photos;
})();
