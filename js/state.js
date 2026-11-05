/* 遊戲進度（LocalStorage） */
(function () {
  const KEY = 'deadlink.save.v1';

  function fresh() {
    return {
      version: '0.1.0',
      player: { started: false, currentChapter: 1, startedAt: null },
      discovered: ['home'],   // 出現在「我的最愛」的網站
      unlocked: ['home'],     // 已通過驗證的網站
      solved: [],
      clues: [],
      notes: '',
      visits: {},
      attempts: {},
      hintsUsed: {},
      flags: {},
      settings: { sound: true, crt: true }
    };
  }

  const State = {
    data: fresh(),

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const d = JSON.parse(raw);
          const f = fresh();
          this.data = Object.assign(f, d);
          this.data.player = Object.assign(fresh().player, d.player || {});
          this.data.settings = Object.assign(fresh().settings, d.settings || {});
        }
      } catch (e) { this.data = fresh(); }
      return this.data;
    },

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* 無痕模式等情況 */ }
    },

    hasSave() {
      try {
        const raw = localStorage.getItem(KEY);
        return !!raw && !!JSON.parse(raw).player.started;
      } catch (e) { return false; }
    },

    reset() {
      const settings = this.data.settings;
      this.data = fresh();
      this.data.settings = settings;
      this.save();
    },

    has(list, v) { return this.data[list].includes(v); },

    add(list, v) {
      if (this.data[list].includes(v)) return false;
      this.data[list].push(v);
      this.save();
      return true;
    },

    visit(key) {
      this.data.visits[key] = (this.data.visits[key] || 0) + 1;
      this.save();
      return this.data.visits[key];
    },

    flag(k, v) {
      if (v === undefined) return !!this.data.flags[k];
      this.data.flags[k] = v;
      this.save();
      return v;
    }
  };

  window.State = State;
})();
