/* 音效：全部以 Web Audio API 即時合成，不需要音檔 */
(function () {
  let ctx = null, master = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.16;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freqs, t, dur, vol, type, out) {
    freqs.forEach(f => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.012);
      g.gain.setValueAtTime(vol, Math.max(t + 0.013, t + dur - 0.02));
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g).connect(out || master);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }

  function noise(t, dur, vol, freq, q, out) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1800; f.Q.value = q || 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol, Math.max(t + 0.031, t + dur - 0.05));
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(f).connect(g).connect(out || master);
    src.start(t); src.stop(t + dur);
  }

  const DTMF = { '0': [941, 1336], '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], '7': [852, 1209], '8': [852, 1336], '9': [852, 1477] };

  let dialBus = null;

  const SFX = {
    enabled: true,

    dialup() {
      if (!this.enabled || !ensure()) return 0;
      dialBus = ctx.createGain(); dialBus.gain.value = 1; dialBus.connect(master);
      let t = ctx.currentTime + 0.1;
      tone([350, 440], t, 0.9, 0.25, 'sine', dialBus); t += 1.0;            // 撥號音
      '0220030817'.split('').forEach(d => { tone(DTMF[d], t, 0.09, 0.22, 'sine', dialBus); t += 0.12; });
      t += 0.35;
      tone([440, 480], t, 0.8, 0.18, 'sine', dialBus); t += 1.0;            // 回鈴
      tone([2100], t, 0.7, 0.16, 'sine', dialBus); t += 0.75;               // 對方應答
      for (let i = 0; i < 6; i++) {                                         // 交握
        tone([980 + i * 120], t, 0.07, 0.14, 'square', dialBus);
        tone([1650 - i * 60], t + 0.07, 0.07, 0.12, 'square', dialBus);
        t += 0.15;
      }
      noise(t, 0.5, 0.35, 1200, 0.6, dialBus); tone([1200, 2400], t, 0.5, 0.06, 'sawtooth', dialBus); t += 0.5;
      noise(t, 1.4, 0.4, 2000, 0.4, dialBus); t += 1.4;
      return t - ctx.currentTime;
    },

    stopDial() {
      if (dialBus && ctx) {
        const g = dialBus.gain;
        g.cancelScheduledValues(ctx.currentTime);
        g.setValueAtTime(g.value, ctx.currentTime);
        g.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        const b = dialBus; setTimeout(() => b.disconnect(), 300);
        dialBus = null;
      }
    },

    click() { if (this.enabled && ensure()) noise(ctx.currentTime, 0.03, 0.25, 3200, 2); },

    nav() {
      if (!this.enabled || !ensure()) return;
      const t = ctx.currentTime;
      tone([1800], t, 0.025, 0.06, 'square');
      noise(t + 0.03, 0.12, 0.08, 2600, 1.2);
    },

    error() {
      if (!this.enabled || !ensure()) return;
      const t = ctx.currentTime;
      tone([310, 620], t, 0.18, 0.18, 'triangle');
      tone([233, 466], t + 0.2, 0.3, 0.16, 'triangle');
    },

    ding() {
      if (!this.enabled || !ensure()) return;
      const t = ctx.currentTime;
      tone([1046], t, 0.12, 0.14, 'sine');
      tone([1568], t + 0.09, 0.25, 0.1, 'sine');
    },

    success() {
      if (!this.enabled || !ensure()) return;
      const t = ctx.currentTime;
      [523, 659, 784, 1046].forEach((f, i) => tone([f], t + i * 0.11, 0.3, 0.12, 'triangle'));
    },

    glitch() {
      if (!this.enabled || !ensure()) return;
      const t = ctx.currentTime;
      noise(t, 0.35, 0.45, 900, 0.3);
      tone([57, 113], t, 0.4, 0.12, 'sawtooth');
    },

    unlock() { ensure(); }
  };

  Object.keys(SFX).forEach(k => {
    if (typeof SFX[k] !== 'function') return;
    const fn = SFX[k];
    SFX[k] = function () { try { return fn.apply(SFX, arguments); } catch (e) { return 0; } };
  });

  window.SFX = SFX;
})();
