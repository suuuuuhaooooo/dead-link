/* 謎題驗證、三級提示、章節進度 */
(function () {
  const PuzzleEngine = {
    hash(pid, s) {
      let h = 0x811c9dc5;
      const str = 'deadlink:' + pid + ':' + s;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      return h.toString(16).padStart(8, '0');
    },

    // 必須與產生謎題資料的工具一致
    normalize(fmt, input) {
      let s = String(input || '').normalize('NFKC').toLowerCase();
      if (fmt === 'digits') return s.replace(/\D/g, '');
      if (fmt === 'alpha') return s.replace(/[^a-z0-9一-鿿]/g, '');
      if (fmt === 'file') return s.split(/[\/]/).pop().replace(/[^a-z0-9._-]/g, '');
      if (fmt === 'id') return s.split('@')[0].replace(/[^a-z0-9_]/g, '');
      return s.trim();
    },

    isSolved(pid) { return State.has('solved', pid); },

    /* 動態答案（例如：取決於玩家登入時間） */
    dynamic: {
      p7a() { return State.data.flags.adminLoginStamp || ''; }
    },

    check(pid, input) {
      const p = PUZZLES[pid];
      const fmt = p.format || 'digits';
      const n = this.normalize(fmt, input);
      if (!n) return { ok: false, msg: '請輸入內容。', soft: true };

      let ok = false, h = this.hash(pid, n);
      if (p.type === 'dynamic') {
        if (n.length !== 12) return { ok: false, msg: p.formatMsg, soft: true };
        ok = n === this.dynamic[pid]();
      } else {
        if (p.length && n.length !== p.length) return { ok: false, msg: p.formatMsg, soft: true };
        ok = p.answers.includes(h);
      }
      if (ok) { this.solve(pid); return { ok: true }; }

      const a = State.data.attempts;
      a[pid] = (a[pid] || 0) + 1;
      State.save();
      if (p.special && p.special[h]) return { ok: false, msg: p.special[h], count: a[pid] };
      const list = p.wrong || ['錯誤。'];
      return { ok: false, msg: list[(a[pid] - 1) % list.length], count: a[pid] };
    },

    solve(pid) {
      if (State.add('solved', pid) && window.App) App.onSolved(pid);
    },

    hintsShown(pid) { return State.data.hintsUsed[pid] || 0; },

    nextHint(pid) {
      const p = PUZZLES[pid];
      const used = this.hintsShown(pid);
      if (used >= p.hints.length) return null;
      State.data.hintsUsed[pid] = used + 1;
      State.save();
      return p.hints[used];
    },

    /* ---- 章節 ---- */
    chapterDone(ch) {
      return ch.puzzles.every(id => PUZZLES[id].optional || this.isSolved(id));
    },
    currentChapter() {
      return CHAPTERS.find(ch => !this.chapterDone(ch)) || null;
    },
    activePuzzle(ch) {
      return ch.puzzles.find(id => !this.isSolved(id) && !PUZZLES[id].optional) || null;
    },
    total() { return Object.keys(PUZZLES).length; },
    solvedCount() { return State.data.solved.filter(id => PUZZLES[id]).length; }
  };

  window.PuzzleEngine = PuzzleEngine;
})();
