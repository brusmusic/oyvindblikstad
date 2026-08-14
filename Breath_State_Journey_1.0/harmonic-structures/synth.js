(() => {
  "use strict";

  const MAX_PARTIALS = 24;
  const STORAGE_KEY = "breath-state-harmonic-structures-v1";
  const els = {};
  const state = {
    playing: false,
    ctx: null,
    master: null,
    analyser: null,
    voices: [],
    animationFrame: 0,
    partials: [],
    rootOctave: false,
    fixedRatioStep: 2,
    bindiffEnabled: true,
    bindiffHz: 0.42
  };

  const presets = [
    {
      id: "natural",
      label: "Natural 1-12",
      root: 48,
      partials: Array.from({ length: 12 }, (_, index) => {
        const ratio = index + 1;
        return { ratio, level: Number((1 / (ratio ** 0.78)).toFixed(3)), detune: 0, pan: index % 2 ? 0.18 : -0.18, on: true };
      })
    },
    {
      id: "warm",
      label: "Warm body",
      root: 48,
      partials: [
        { ratio: 1, level: 0.9, detune: 0, pan: 0, on: true },
        { ratio: 2, level: 0.34, detune: -3, pan: -0.18, on: true },
        { ratio: 3, level: 0.22, detune: 2, pan: 0.2, on: true },
        { ratio: 4, level: 0.16, detune: 0, pan: -0.08, on: true },
        { ratio: 5, level: 0.12, detune: -8, pan: 0.16, on: true },
        { ratio: 8, level: 0.07, detune: 5, pan: 0.32, on: true }
      ]
    },
    {
      id: "odd",
      label: "Odd hollow",
      root: 54,
      partials: [1, 3, 5, 7, 9, 11, 13, 15].map((ratio, index) => ({
        ratio,
        level: Number((0.78 / (index + 1) ** 0.68).toFixed(3)),
        detune: index > 3 ? -4 : 0,
        pan: index % 2 ? 0.34 : -0.34,
        on: true
      }))
    },
    {
      id: "bell",
      label: "Soft bell",
      root: 42,
      partials: [
        { ratio: 1, level: 0.7, detune: 0, pan: 0, on: true },
        { ratio: 2.01, level: 0.32, detune: 0, pan: -0.24, on: true },
        { ratio: 2.72, level: 0.26, detune: 0, pan: 0.2, on: true },
        { ratio: 3.76, level: 0.19, detune: 0, pan: -0.12, on: true },
        { ratio: 5.42, level: 0.13, detune: 0, pan: 0.34, on: true },
        { ratio: 8.4, level: 0.08, detune: 0, pan: -0.34, on: true }
      ]
    },
    {
      id: "air",
      label: "Air fifths",
      root: 50,
      partials: [
        { ratio: 1, level: 0.56, detune: 0, pan: 0, on: true },
        { ratio: 1.5, level: 0.38, detune: 2, pan: -0.3, on: true },
        { ratio: 2, level: 0.28, detune: -2, pan: 0.28, on: true },
        { ratio: 3, level: 0.18, detune: 3, pan: -0.42, on: true },
        { ratio: 4.5, level: 0.1, detune: -5, pan: 0.42, on: true },
        { ratio: 6, level: 0.08, detune: 6, pan: 0.16, on: true }
      ]
    },
    {
      id: "thin",
      label: "Thin shimmer",
      root: 64,
      partials: [
        { ratio: 2, level: 0.22, detune: -6, pan: -0.36, on: true },
        { ratio: 3, level: 0.3, detune: 4, pan: 0.26, on: true },
        { ratio: 5, level: 0.2, detune: -9, pan: -0.18, on: true },
        { ratio: 8, level: 0.16, detune: 7, pan: 0.36, on: true },
        { ratio: 13, level: 0.1, detune: -12, pan: 0.08, on: true }
      ]
    }
  ];

  const phaseStructures = [
    {
      id: "inhale",
      label: "Inhale Csus2",
      partials: [
        { ratio: 1, level: 0.72, detune: 0, pan: -0.08, on: true },
        { ratio: 2, level: 0.24, detune: 0, pan: 0.08, on: true },
        { ratio: 9 / 4, level: 0.36, detune: 0, pan: -0.26, on: true },
        { ratio: 3, level: 0.3, detune: 0, pan: 0.24, on: true },
        { ratio: 4, level: 0.16, detune: 0, pan: 0, on: true }
      ]
    },
    {
      id: "holdInhale",
      label: "Hold Fm/C",
      partials: [
        { ratio: 1, level: 0.68, detune: 0, pan: 0, on: true },
        { ratio: 2, level: 0.22, detune: 0, pan: -0.1, on: true },
        { ratio: 8 / 3, level: 0.34, detune: -4, pan: 0.22, on: true },
        { ratio: 16 / 5, level: 0.26, detune: 3, pan: -0.24, on: true },
        { ratio: 4, level: 0.14, detune: 0, pan: 0.1, on: true }
      ]
    },
    {
      id: "exhale",
      label: "Exhale G/B",
      partials: [
        { ratio: 15 / 16, level: 0.54, detune: 0, pan: -0.14, on: true },
        { ratio: 3 / 2, level: 0.34, detune: 0, pan: 0.12, on: true },
        { ratio: 9 / 4, level: 0.24, detune: -3, pan: -0.28, on: true },
        { ratio: 3, level: 0.24, detune: 3, pan: 0.28, on: true },
        { ratio: 4.5, level: 0.1, detune: 0, pan: 0, on: true }
      ]
    },
    {
      id: "holdExhale",
      label: "Hold Bdim7",
      partials: [
        { ratio: 15 / 16, level: 0.48, detune: 0, pan: 0, on: true },
        { ratio: 45 / 32, level: 0.3, detune: 0, pan: -0.2, on: true },
        { ratio: 8 / 5, level: 0.28, detune: -2, pan: 0.2, on: true },
        { ratio: 9 / 4, level: 0.2, detune: 2, pan: -0.34, on: true },
        { ratio: 3.2, level: 0.12, detune: 0, pan: 0.34, on: true }
      ]
    }
  ];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function collectEls() {
    [
      "playBtn",
      "stopBtn",
      "rootInput",
      "rootValue",
      "rootOctaveToggle",
      "ratioStepInput",
      "ratioStepValue",
      "applyRatioBtn",
      "masterInput",
      "masterValue",
      "attackInput",
      "attackValue",
      "releaseInput",
      "releaseValue",
      "spreadInput",
      "spreadValue",
      "bindiffToggle",
      "bindiffInput",
      "bindiffValue",
      "presetGrid",
      "phaseGrid",
      "copyBtn",
      "jsonOutput",
      "scopeCanvas",
      "addPartialBtn",
      "normalizeBtn",
      "clearBtn",
      "partialsList",
      "statusText"
    ].forEach((id) => {
      els[id] = qs(id);
    });
  }

  function clonePartials(partials) {
    return partials.map((partial) => ({
      ratio: Number(partial.ratio) || 1,
      level: clamp(Number(partial.level) || 0, 0, 1),
      detune: clamp(Number(partial.detune) || 0, -100, 100),
      pan: clamp(Number(partial.pan) || 0, -1, 1),
      on: partial.on !== false
    }));
  }

  function rootHz() {
    return Number(els.rootInput.value) || 48;
  }

  function soundRootHz() {
    return rootHz() * (state.rootOctave ? 2 : 1);
  }

  function masterValue() {
    return Number(els.masterInput.value) || 0;
  }

  function attackSec() {
    return Number(els.attackInput.value) || 0.18;
  }

  function releaseSec() {
    return Number(els.releaseInput.value) || 1.2;
  }

  function spreadValue() {
    return Number(els.spreadInput.value) || 0;
  }

  function ratioStepValue() {
    return clamp(Number(els.ratioStepInput.value) || state.fixedRatioStep || 2, 1.01, 4);
  }

  function bindiffValue() {
    const numeric = Number(els.bindiffInput.value);
    if (Number.isFinite(numeric)) return Math.max(0, numeric);
    return Math.max(0, state.bindiffHz || 0);
  }

  function partialFrequency(partial) {
    return soundRootHz() * partial.ratio * (2 ** (partial.detune / 1200));
  }

  function bindiffPairOffset() {
    return state.bindiffEnabled ? bindiffValue() / 2 : 0;
  }

  function setOutput(el, text) {
    if (el) el.textContent = text;
  }

  function renderReadouts() {
    setOutput(els.rootValue, `${soundRootHz().toFixed(2)} Hz${state.rootOctave ? " (x2)" : ""}`);
    setOutput(els.ratioStepValue, `${ratioStepValue().toFixed(3)}x`);
    setOutput(els.masterValue, `${Math.round(masterValue() * 100)}%`);
    setOutput(els.attackValue, `${attackSec().toFixed(2)}s`);
    setOutput(els.releaseValue, `${releaseSec().toFixed(2)}s`);
    setOutput(els.spreadValue, `${Math.round(spreadValue() * 100)}%`);
    setOutput(els.bindiffValue, `${bindiffValue().toFixed(2)} Hz`);
  }

  function normalizedStructure() {
    return {
      rootHz: Number(rootHz().toFixed(2)),
      startOnOctave: state.rootOctave,
      fixedRatioStep: Number(ratioStepValue().toFixed(3)),
      bindiffEnabled: state.bindiffEnabled,
      bindiffHz: Number(bindiffValue().toFixed(2)),
      partials: state.partials.map((partial) => ({
        ratio: Number(partial.ratio.toFixed(4)),
        frequencyHz: Number(partialFrequency(partial).toFixed(2)),
        level: Number(partial.level.toFixed(3)),
        detuneCents: Number(partial.detune.toFixed(1)),
        pan: Number(partial.pan.toFixed(2)),
        on: partial.on
      }))
    };
  }

  function renderJson() {
    els.jsonOutput.value = JSON.stringify(normalizedStructure(), null, 2);
  }

  function renderPresetButtons() {
    els.presetGrid.innerHTML = presets.map((preset) => (
      `<button type="button" data-preset-id="${preset.id}">${preset.label}</button>`
    )).join("");
    els.phaseGrid.innerHTML = phaseStructures.map((preset) => (
      `<button type="button" data-phase-id="${preset.id}">${preset.label}</button>`
    )).join("");
  }

  function renderPartials() {
    els.partialsList.innerHTML = state.partials.map((partial, index) => {
      const frequency = partialFrequency(partial);
      return `
        <div class="partial-row" data-index="${index}">
          <input type="checkbox" data-field="on" ${partial.on ? "checked" : ""} aria-label="Partial ${index + 1} on">
          <label>
            <input type="number" data-field="ratio" min="0.05" max="32" step="0.001" value="${partial.ratio}">
            <span class="row-output">${frequency.toFixed(1)} Hz</span>
          </label>
          <label>
            <input type="range" data-field="level" min="0" max="1" step="0.001" value="${partial.level}">
            <span class="row-output">${Math.round(partial.level * 100)}%</span>
          </label>
          <label>
            <input type="number" data-field="detune" min="-100" max="100" step="0.1" value="${partial.detune}">
            <span class="row-output">cents</span>
          </label>
          <label>
            <input type="range" data-field="pan" min="-1" max="1" step="0.01" value="${partial.pan}">
            <span class="row-output">${partial.pan < -0.02 ? "L" : partial.pan > 0.02 ? "R" : "C"} ${Math.round(Math.abs(partial.pan) * 100)}%</span>
          </label>
          <button class="mini danger" type="button" data-remove="${index}" aria-label="Remove partial ${index + 1}">x</button>
        </div>
      `;
    }).join("");
    renderJson();
  }

  function updatePartialRowReadouts(row, partial) {
    const outputs = row.querySelectorAll(".row-output");
    if (outputs[0]) outputs[0].textContent = `${partialFrequency(partial).toFixed(1)} Hz`;
    if (outputs[1]) outputs[1].textContent = `${Math.round(partial.level * 100)}%`;
    if (outputs[2]) outputs[2].textContent = "cents";
    if (outputs[3]) outputs[3].textContent = `${partial.pan < -0.02 ? "L" : partial.pan > 0.02 ? "R" : "C"} ${Math.round(Math.abs(partial.pan) * 100)}%`;
  }

  function rebuildFixedRatioSeries() {
    const count = Math.max(4, state.partials.length || 12);
    const step = ratioStepValue();
    state.partials = Array.from({ length: count }, (_, index) => ({
      ratio: Number((step ** index).toFixed(6)),
      level: Number((index === 0 ? 0.92 : 0.76 / ((index + 1) ** 0.78)).toFixed(3)),
      detune: 0,
      pan: index === 0 ? 0 : index % 2 ? 0.22 : -0.22,
      on: true
    }));
    saveLocal();
    renderPartials();
    updateVoices();
  }

  function drawCanvas() {
    const canvas = els.scopeCanvas;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, rect.width);
    const height = Math.max(220, rect.height);
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(154, 212, 200, 0.10)");
    gradient.addColorStop(1, "rgba(142, 167, 255, 0.04)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(207, 234, 225, 0.11)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i += 1) {
      const y = (height * i) / 5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const activePartials = state.partials.filter((partial) => partial.on && partial.level > 0);
    const maxFrequency = Math.max(120, ...activePartials.map(partialFrequency));
    activePartials.forEach((partial, index) => {
      const frequency = partialFrequency(partial);
      const x = 28 + ((frequency / maxFrequency) * (width - 56));
      const barHeight = partial.level * (height * 0.54);
      const hue = 162 + (index * 18);
      ctx.fillStyle = `hsla(${hue}, 58%, 72%, 0.82)`;
      if (state.bindiffEnabled) {
        ctx.fillRect(x - 10, height * 0.68 - barHeight, 7, barHeight);
        ctx.fillRect(x + 3, height * 0.68 - barHeight, 7, barHeight);
      } else {
        ctx.fillRect(x - 4, height * 0.68 - barHeight, 8, barHeight);
      }
      ctx.fillStyle = "rgba(242, 246, 242, 0.7)";
      ctx.font = "11px ui-sans-serif, system-ui";
      ctx.fillText(`${partial.ratio.toFixed(partial.ratio % 1 ? 2 : 0)}x`, x - 12, height * 0.72);
      if (state.bindiffEnabled) {
        ctx.fillStyle = "rgba(169, 234, 225, 0.8)";
        ctx.fillText(`Δ${bindiffValue().toFixed(2)}Hz`, x - 18, height * 0.72 + 12);
      }
    });

    ctx.strokeStyle = "rgba(213, 185, 110, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const samples = 240;
    for (let i = 0; i < samples; i += 1) {
      const t = i / samples;
      let value = 0;
      activePartials.forEach((partial) => {
        value += Math.sin(t * Math.PI * 2 * partial.ratio) * partial.level;
      });
      value = activePartials.length ? value / Math.max(1, activePartials.reduce((sum, partial) => sum + partial.level, 0)) : 0;
      const x = (i / (samples - 1)) * width;
      const y = height * 0.24 + (value * height * 0.13);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (state.analyser) {
      const data = new Uint8Array(state.analyser.frequencyBinCount);
      state.analyser.getByteTimeDomainData(data);
      ctx.strokeStyle = "rgba(154, 212, 200, 0.62)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      data.forEach((sample, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height * 0.42 + (((sample - 128) / 128) * height * 0.11);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(242, 246, 242, 0.78)";
    ctx.font = "12px ui-sans-serif, system-ui";
    ctx.fillText("drawn timbre", 18, 28);
    ctx.fillText(state.playing ? "live signal" : "press Play to hear", 18, height * 0.42 - 22);
    ctx.fillText("partials", 18, height * 0.72 + 2);

    state.animationFrame = window.requestAnimationFrame(drawCanvas);
  }

  function createVoice(partial, index) {
    const ctx = state.ctx;
    const modules = [0, 1].map((moduleIndex) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      osc.type = "sine";
      gain.gain.value = 0.0001;
      pan.pan.value = 0;
      osc.connect(gain).connect(pan);
      osc.start();
      return { osc, gain, pan, moduleIndex };
    });
    const sum = ctx.createGain();
    modules[0].pan.connect(sum);
    modules[1].pan.connect(sum);
    sum.connect(state.master);
    return { modules, sum, index };
  }

  function updateVoices() {
    if (!state.ctx) return;
    const now = state.ctx.currentTime;
    const targetVoiceCount = state.partials.length;
    while (state.voices.length < targetVoiceCount) {
      state.voices.push(createVoice(state.partials[state.voices.length], state.voices.length));
    }
    while (state.voices.length > targetVoiceCount) {
      const voice = state.voices.pop();
      voice.modules.forEach((module) => {
        module.gain.gain.setTargetAtTime(0.0001, now, 0.03);
        module.osc.stop(now + 0.12);
      });
    }
    state.voices.forEach((voice, index) => {
      const partial = state.partials[index];
      const baseFrequency = partialFrequency(partial);
      const offset = bindiffPairOffset();
      const spread = spreadValue() * 0.24;
      const targetGain = state.playing && partial.on ? partial.level * partial.level * 0.16 : 0.0001;
      const pairGain = state.playing && partial.on && state.bindiffEnabled ? targetGain * 0.92 : targetGain;
      voice.modules[0].osc.frequency.setTargetAtTime(Math.max(20, baseFrequency - offset), now, 0.03);
      voice.modules[1].osc.frequency.setTargetAtTime(Math.max(20, baseFrequency + offset), now, 0.03);
      voice.modules[0].pan.pan.setTargetAtTime(clamp(partial.pan - spread, -1, 1), now, 0.04);
      voice.modules[1].pan.pan.setTargetAtTime(clamp(partial.pan + spread, -1, 1), now, 0.04);
      voice.modules[0].gain.gain.setTargetAtTime(targetGain, now, state.playing ? attackSec() : releaseSec());
      voice.modules[1].gain.gain.setTargetAtTime(state.bindiffEnabled ? pairGain : 0.0001, now, state.playing ? attackSec() : releaseSec());
    });
    if (state.master) state.master.gain.setTargetAtTime(masterValue(), now, 0.04);
    renderReadouts();
    renderJson();
  }

  async function ensureAudio() {
    if (state.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.ctx = new AudioContext();
    state.master = state.ctx.createGain();
    state.analyser = state.ctx.createAnalyser();
    state.analyser.fftSize = 2048;
    state.master.gain.value = 0.0001;
    state.master.connect(state.analyser).connect(state.ctx.destination);
    updateVoices();
  }

  async function play() {
    await ensureAudio();
    if (state.ctx.state === "suspended") await state.ctx.resume();
    state.playing = true;
    els.playBtn.disabled = true;
    els.stopBtn.disabled = false;
    els.statusText.textContent = "listening";
    updateVoices();
  }

  function stop() {
    if (!state.ctx) return;
    state.playing = false;
    els.playBtn.disabled = false;
    els.stopBtn.disabled = true;
    els.statusText.textContent = "silent";
    updateVoices();
  }

  function loadStructure(structure) {
    if (Number.isFinite(structure.root)) els.rootInput.value = String(structure.root);
    if (Number.isFinite(structure.fixedRatioStep)) els.ratioStepInput.value = String(structure.fixedRatioStep);
    if (typeof structure.startOnOctave === "boolean") els.rootOctaveToggle.checked = structure.startOnOctave;
    if (typeof structure.bindiffEnabled === "boolean") els.bindiffToggle.checked = structure.bindiffEnabled;
    if (Number.isFinite(structure.bindiffHz)) els.bindiffInput.value = String(structure.bindiffHz);
    state.rootOctave = Boolean(els.rootOctaveToggle.checked);
    state.fixedRatioStep = ratioStepValue();
    state.bindiffEnabled = Boolean(els.bindiffToggle.checked);
    state.bindiffHz = bindiffValue();
    state.partials = clonePartials(structure.partials || []).slice(0, MAX_PARTIALS);
    saveLocal();
    renderReadouts();
    renderPartials();
    updateVoices();
  }

  function addPartial() {
    if (state.partials.length >= MAX_PARTIALS) return;
    const ratio = state.partials.length ? Math.round(state.partials[state.partials.length - 1].ratio + 1) : 1;
    state.partials.push({ ratio, level: 0.12, detune: 0, pan: 0, on: true });
    saveLocal();
    renderPartials();
    updateVoices();
  }

  function normalizeLevels() {
    const peak = Math.max(0.001, ...state.partials.map((partial) => partial.level));
    state.partials = state.partials.map((partial) => ({ ...partial, level: clamp(partial.level / peak, 0, 1) }));
    saveLocal();
    renderPartials();
    updateVoices();
  }

  function clearStructure() {
    state.partials = [];
    saveLocal();
    renderPartials();
    updateVoices();
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        root: rootHz(),
        startOnOctave: state.rootOctave,
        fixedRatioStep: ratioStepValue(),
        bindiffEnabled: state.bindiffEnabled,
        bindiffHz: bindiffValue(),
        partials: state.partials
      }));
    } catch {
      // Local storage is optional in private browsing.
    }
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved.partials)) return false;
      loadStructure({
        root: Number(saved.root) || 48,
        startOnOctave: Boolean(saved.startOnOctave),
        fixedRatioStep: Number(saved.fixedRatioStep) || 2,
        bindiffEnabled: saved.bindiffEnabled !== false,
        bindiffHz: Number(saved.bindiffHz) || 0.42,
        partials: saved.partials
      });
      return true;
    } catch {
      return false;
    }
  }

  function updatePartialFromInput(input) {
    const row = input.closest(".partial-row");
    const index = Number(row?.dataset.index);
    if (!Number.isInteger(index) || !state.partials[index]) return;
    const field = input.dataset.field;
    const partial = state.partials[index];
    if (field === "on") partial.on = input.checked;
    if (field === "ratio") partial.ratio = clamp(Number(input.value) || 1, 0.05, 32);
    if (field === "level") partial.level = clamp(Number(input.value) || 0, 0, 1);
    if (field === "detune") partial.detune = clamp(Number(input.value) || 0, -100, 100);
    if (field === "pan") partial.pan = clamp(Number(input.value) || 0, -1, 1);
    saveLocal();
    updatePartialRowReadouts(row, partial);
    renderJson();
    updateVoices();
  }

  function copyJson() {
    const text = els.jsonOutput.value;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        els.copyBtn.textContent = "Copied";
        window.setTimeout(() => { els.copyBtn.textContent = "Copy JSON"; }, 1100);
      }).catch(() => {
        els.jsonOutput.select();
      });
    } else {
      els.jsonOutput.select();
    }
  }

  function bindEvents() {
    els.playBtn.addEventListener("click", play);
    els.stopBtn.addEventListener("click", stop);
    els.addPartialBtn.addEventListener("click", addPartial);
    els.applyRatioBtn.addEventListener("click", rebuildFixedRatioSeries);
    els.normalizeBtn.addEventListener("click", normalizeLevels);
    els.clearBtn.addEventListener("click", clearStructure);
    els.copyBtn.addEventListener("click", copyJson);
    [els.rootInput, els.ratioStepInput, els.masterInput, els.attackInput, els.releaseInput, els.spreadInput, els.bindiffInput].forEach((input) => {
      input.addEventListener("input", () => {
        saveLocal();
        renderReadouts();
        renderPartials();
        updateVoices();
      });
    });
    els.rootOctaveToggle.addEventListener("change", () => {
      state.rootOctave = els.rootOctaveToggle.checked;
      saveLocal();
      renderReadouts();
      renderPartials();
      updateVoices();
    });
    els.bindiffToggle.addEventListener("change", () => {
      state.bindiffEnabled = els.bindiffToggle.checked;
      saveLocal();
      renderReadouts();
      renderPartials();
      updateVoices();
    });
    els.presetGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-preset-id]");
      if (!button) return;
      const preset = presets.find((item) => item.id === button.dataset.presetId);
      if (preset) loadStructure(preset);
    });
    els.phaseGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-phase-id]");
      if (!button) return;
      const preset = phaseStructures.find((item) => item.id === button.dataset.phaseId);
      if (preset) loadStructure({ root: rootHz(), partials: preset.partials });
    });
    els.partialsList.addEventListener("input", (event) => {
      const input = event.target.closest("[data-field]");
      if (input) updatePartialFromInput(input);
    });
    els.partialsList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove]");
      if (!button) return;
      const index = Number(button.dataset.remove);
      state.partials.splice(index, 1);
      saveLocal();
      renderPartials();
      updateVoices();
    });
  }

  function init() {
    collectEls();
    renderPresetButtons();
    if (!loadLocal()) loadStructure(presets[0]);
    state.rootOctave = els.rootOctaveToggle.checked;
    state.fixedRatioStep = ratioStepValue();
    state.bindiffEnabled = els.bindiffToggle.checked;
    state.bindiffHz = bindiffValue();
    renderReadouts();
    renderPartials();
    bindEvents();
    drawCanvas();
  }

  init();
})();
