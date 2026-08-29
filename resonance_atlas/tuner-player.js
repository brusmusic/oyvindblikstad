(() => {
  "use strict";

  const MIN_FREQ_HZ = 0.1;
  const MASTER_GAIN = 0.22;
  const FADE_IN_SECONDS = 0.14;
  const MANUAL_END_FADE_SECONDS = 2;
  const NATURAL_END_FADE_SECONDS = 1.2;
  const DEFAULT_TRANSITION_SEC = 5;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function ensureNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function smoothstep(x) {
    return x * x * (3 - (2 * x));
  }

  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      (2 * p1) +
      ((-p0 + p2) * t) +
      (((2 * p0) - (5 * p1) + (4 * p2) - p3) * t2) +
      ((-p0 + (3 * p1) - (3 * p2) + p3) * t3)
    );
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function defaultCurveForTrack(id, durationSec) {
    if (id === "signal_l") return [{ t: 0, v: 50, curve: "hold" }, { t: durationSec, v: 50, curve: "hold" }];
    if (id === "signal_r") return [{ t: 0, v: 50.2, curve: "hold" }, { t: durationSec, v: 50.2, curve: "hold" }];
    if (id === "r_offset") return [{ t: 0, v: 0.2, curve: "hold" }, { t: durationSec, v: 0.2, curve: "hold" }];
    if (id === "amplitude") return [{ t: 0, v: 0, curve: "ease" }, { t: 8, v: 0.5, curve: "ease" }, { t: durationSec, v: 0, curve: "ease" }];
    return [{ t: 0, v: 1, curve: "hold" }, { t: durationSec, v: 1, curve: "hold" }];
  }

  function linkedRegion(start, end) {
    return {
      id: "region_linked",
      name: "Journey",
      start,
      end,
      mode: "linked",
      transitionSec: 0,
      rules: {
        r: {
          type: "signedOffset",
          sourceTrackId: "signal_l",
          offsetTrackId: "r_offset"
        }
      }
    };
  }

  function normalizeJourney(raw) {
    const durationSec = Math.max(1, ensureNumber(raw?.durationSec, 300));
    const journey = {
      format: "tuner-journey",
      version: 1,
      id: raw?.id || "journey",
      name: raw?.name || "Journey",
      description: raw?.description || "",
      durationSec,
      view: raw?.view || {},
      transport: raw?.transport || {},
      tracks: Array.isArray(raw?.tracks) ? clone(raw.tracks) : [],
      regions: Array.isArray(raw?.regions) && raw.regions.length ? clone(raw.regions) : [linkedRegion(0, durationSec)],
      relations: Array.isArray(raw?.relations) ? clone(raw.relations) : [],
      assets: Array.isArray(raw?.assets) ? clone(raw.assets) : [],
      outputs: Array.isArray(raw?.outputs) ? clone(raw.outputs) : [],
      routing: Array.isArray(raw?.routing) ? clone(raw.routing) : []
    };

    journey.view.frequencyWindow = journey.view.frequencyWindow || { minHz: 20, maxHz: 80 };
    journey.transport.loop = Boolean(journey.transport.loop);
    journey.transport.loopStartSec = ensureNumber(journey.transport.loopStartSec, 0);
    journey.transport.loopEndSec = ensureNumber(journey.transport.loopEndSec, durationSec);

    ["signal_l", "signal_r", "r_offset", "amplitude", "amplitude_l", "amplitude_r"].forEach((id) => {
      if (!getTrack(journey, id)) {
        journey.tracks.push({
          id,
          curve: defaultCurveForTrack(id, durationSec)
        });
      }
    });

    journey.tracks.forEach((track) => {
      track.curve = Array.isArray(track.curve) ? track.curve : defaultCurveForTrack(track.id, durationSec);
      track.curve.sort((a, b) => a.t - b.t);
    });
    journey.regions.sort((a, b) => a.start - b.start);
    return journey;
  }

  function getTrack(journey, id) {
    return journey.tracks.find((track) => track.id === id);
  }

  function evaluateCurve(curve, t, fallback = 0) {
    if (!Array.isArray(curve) || !curve.length) return fallback;
    if (t <= curve[0].t) return curve[0].v;
    const last = curve[curve.length - 1];
    if (t >= last.t) return last.v;

    let index = 0;
    for (let i = 0; i < curve.length - 1; i += 1) {
      if (t >= curve[i].t && t <= curve[i + 1].t) {
        index = i;
        break;
      }
    }

    const p0 = curve[index];
    const p1 = curve[index + 1];
    const span = Math.max(0.0001, p1.t - p0.t);
    let u = clamp((t - p0.t) / span, 0, 1);
    const curveType = p0.curve || "linear";
    if (curveType === "hold") return p0.v;
    if (curveType === "ease") u = smoothstep(u);
    if (curveType === "spline") {
      const before = curve[Math.max(0, index - 1)].v;
      const after = curve[Math.min(curve.length - 1, index + 2)].v;
      return catmullRom(before, p0.v, p1.v, after, u);
    }
    return p0.v + ((p1.v - p0.v) * u);
  }

  function getRegionContext(journey, t) {
    const regions = journey.regions;
    const region = regions.find((item) => t >= item.start && t < item.end) || regions[regions.length - 1];
    return {
      regions,
      region,
      index: Math.max(0, regions.indexOf(region))
    };
  }

  function evaluateRForRegion(journey, region, sampleTime, lHz, authoredR, signedOffset, options = {}) {
    let mode = region?.mode || "linked";
    const view = journey.view.frequencyWindow || { minHz: 20, maxHz: 80 };

    if (mode === "hold" && !options.ignoreHold) {
      const held = evaluateAt(journey, region.start, { ignoreHold: true, ignoreTransitions: true });
      return { rHz: held.rHz, mode };
    }

    if (mode === "linked") return { rHz: lHz + signedOffset, mode };

    if (mode === "ratio") {
      const rule = region.rules?.r || {};
      const centerHz = ensureNumber(rule.centerHz, (view.minHz + view.maxHz) / 2);
      const ratio = ensureNumber(rule.ratio, 1.5);
      return { rHz: centerHz + ((lHz - centerHz) * ratio), mode };
    }

    if (mode === "free") return { rHz: authoredR, mode };

    mode = "linked";
    return { rHz: lHz + signedOffset, mode };
  }

  function regionBlendKey(region) {
    return `${region?.mode || "linked"}:${JSON.stringify(region?.rules?.r || {})}`;
  }

  function applyRegionTransition(journey, context, sampleTime, current, lHz, authoredR, signedOffset, options = {}) {
    if (options.ignoreTransitions) return current;
    const { regions, region, index } = context;
    const previousRegion = regions[index - 1];
    if (!region || !previousRegion) return current;
    if (regionBlendKey(previousRegion) === regionBlendKey(region)) return current;

    const transitionSec = clamp(ensureNumber(region.transitionSec, DEFAULT_TRANSITION_SEC), 0, 30);
    const maxTransitionSec = Math.min(
      transitionSec,
      Math.max(0, (region.end - region.start) / 2),
      Math.max(0, (previousRegion.end - previousRegion.start) / 2)
    );
    if (maxTransitionSec <= 0) return current;

    const progress = (sampleTime - region.start) / maxTransitionSec;
    if (progress < 0 || progress >= 1) return current;

    const previous = evaluateRForRegion(
      journey,
      previousRegion,
      sampleTime,
      lHz,
      authoredR,
      signedOffset,
      { ...options, ignoreTransitions: true }
    );
    const eased = smoothstep(clamp(progress, 0, 1));
    return {
      rHz: previous.rHz + ((current.rHz - previous.rHz) * eased),
      mode: current.mode
    };
  }

  function evaluateAt(journey, t, options = {}) {
    const sampleTime = clamp(t, 0, journey.durationSec);
    const view = journey.view.frequencyWindow || { maxHz: 80 };
    const lTrack = getTrack(journey, "signal_l");
    const rTrack = getTrack(journey, "signal_r");
    const offsetTrack = getTrack(journey, "r_offset");
    const ampTrack = getTrack(journey, "amplitude");
    const ampLTrack = getTrack(journey, "amplitude_l");
    const ampRTrack = getTrack(journey, "amplitude_r");
    const context = getRegionContext(journey, sampleTime);
    const region = context.region;

    const lHz = clamp(evaluateCurve(lTrack.curve, sampleTime, 50), MIN_FREQ_HZ, view.maxHz * 2);
    const authoredR = evaluateCurve(rTrack.curve, sampleTime, lHz);
    const signedOffset = evaluateCurve(offsetTrack.curve, sampleTime, 0.2);
    const masterAmplitude = clamp(evaluateCurve(ampTrack.curve, sampleTime, 0.55), 0, 1);
    const amplitudeL = clamp(evaluateCurve(ampLTrack.curve, sampleTime, 1), 0, 1);
    const amplitudeR = clamp(evaluateCurve(ampRTrack.curve, sampleTime, 1), 0, 1);
    const evaluatedR = applyRegionTransition(
      journey,
      context,
      sampleTime,
      evaluateRForRegion(journey, region, sampleTime, lHz, authoredR, signedOffset, options),
      lHz,
      authoredR,
      signedOffset,
      options
    );
    const rHz = clamp(evaluatedR.rHz, MIN_FREQ_HZ, view.maxHz * 2);
    return {
      t: sampleTime,
      lHz,
      rHz,
      signedDiffHz: rHz - lHz,
      masterAmplitude,
      amplitudeL,
      amplitudeR,
      leftGain: masterAmplitude * amplitudeL,
      rightGain: masterAmplitude * amplitudeR,
      mode: evaluatedR.mode,
      region
    };
  }

  function createPlayer(callbacks = {}) {
    const state = {
      journey: null,
      playing: false,
      paused: false,
      currentTime: 0,
      startedAt: 0,
      rafId: 0,
      audio: null
    };
    const lastTargets = {
      lHz: null,
      rHz: null,
      leftGain: null,
      rightGain: null
    };

    function nowSeconds() {
      return performance.now() / 1000;
    }

    function emitState(status, extra = {}) {
      callbacks.onStateChange?.({ status, ...snapshot(), ...extra });
    }

    function snapshot() {
      return {
        journey: state.journey,
        playing: state.playing,
        paused: state.paused,
        currentTime: state.currentTime,
        durationSec: state.journey?.durationSec || 0
      };
    }

    function ensureAudio() {
      if (state.audio) {
        clearTimeout(state.audio.destroyTimer);
        return state.audio;
      }
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      state.audio = {
        ctx,
        master,
        left: createVoice(ctx, master, -1),
        right: createVoice(ctx, master, 1),
        destroyTimer: 0,
        masterLevel: 0,
        masterRamp: {
          startTime: ctx.currentTime,
          startValue: 0,
          targetValue: 0,
          duration: 0
        }
      };
      return state.audio;
    }

    function createVoice(ctx, destination, panValue) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      oscillator.type = "sine";
      oscillator.frequency.value = 50;
      oscillator.connect(gain);
      if (ctx.createStereoPanner) {
        const pan = ctx.createStereoPanner();
        pan.pan.value = panValue;
        gain.connect(pan);
        pan.connect(destination);
      } else {
        gain.connect(destination);
      }
      oscillator.start();
      return { oscillator, gain };
    }

    function currentMasterLevel(audio = state.audio, now = audio?.ctx.currentTime || 0) {
      if (!audio) return 0;
      const ramp = audio.masterRamp;
      if (!ramp || ramp.duration <= 0) return audio.masterLevel || 0;
      const progress = clamp((now - ramp.startTime) / ramp.duration, 0, 1);
      if (progress >= 1) return ramp.targetValue;
      return ramp.startValue + ((ramp.targetValue - ramp.startValue) * progress);
    }

    function rampMaster(target, seconds) {
      const audio = state.audio;
      if (!audio) return;
      const now = audio.ctx.currentTime;
      const current = currentMasterLevel(audio, now);
      const nextTarget = clamp(target, 0, 0.9);
      if (Math.abs((audio.masterRamp?.targetValue ?? audio.masterLevel) - nextTarget) < 0.001) return;
      if (typeof audio.master.gain.cancelAndHoldAtTime === "function") {
        audio.master.gain.cancelAndHoldAtTime(now);
      } else {
        audio.master.gain.cancelScheduledValues(now);
        audio.master.gain.setValueAtTime(current, now);
      }
      audio.master.gain.linearRampToValueAtTime(nextTarget, now + Math.max(0.01, seconds));
      audio.masterLevel = nextTarget;
      audio.masterRamp = {
        startTime: now,
        startValue: current,
        targetValue: nextTarget,
        duration: seconds
      };
    }

    function holdParamAtCurrentValue(param, when) {
      if (typeof param.cancelAndHoldAtTime === "function") {
        param.cancelAndHoldAtTime(when);
        return;
      }
      param.cancelScheduledValues(when);
      param.setValueAtTime(param.value, when);
    }

    function setParamTarget(param, value, when, timeConstant, min = 0) {
      holdParamAtCurrentValue(param, when);
      param.setTargetAtTime(Math.max(min, value), when, timeConstant);
    }

    function targetChanged(key, value, threshold, force) {
      if (force || lastTargets[key] === null || Math.abs(lastTargets[key] - value) >= threshold) {
        lastTargets[key] = value;
        return true;
      }
      return false;
    }

    function updateAudio(force = false) {
      const audio = state.audio;
      if (!audio || !state.journey) return;
      const values = evaluateAt(state.journey, state.currentTime);
      const now = audio.ctx.currentTime;
      const smoothing = force ? 0.01 : 0.035;
      if (targetChanged("lHz", values.lHz, 0.01, force)) {
        setParamTarget(audio.left.oscillator.frequency, values.lHz, now, smoothing, MIN_FREQ_HZ);
      }
      if (targetChanged("rHz", values.rHz, 0.01, force)) {
        setParamTarget(audio.right.oscillator.frequency, values.rHz, now, smoothing, MIN_FREQ_HZ);
      }
      if (targetChanged("leftGain", values.leftGain, 0.002, force)) {
        setParamTarget(audio.left.gain.gain, values.leftGain, now, 0.055);
      }
      if (targetChanged("rightGain", values.rightGain, 0.002, force)) {
        setParamTarget(audio.right.gain.gain, values.rightGain, now, 0.055);
      }
    }

    function fadeAndDestroyAudio(seconds) {
      const audio = state.audio;
      if (!audio) return;
      clearTimeout(audio.destroyTimer);
      rampMaster(0, seconds);
      audio.destroyTimer = window.setTimeout(() => {
        try {
          audio.left.oscillator.stop();
          audio.right.oscillator.stop();
        } catch {
          // The browser may already have stopped the audio graph.
        }
        audio.left.gain.disconnect();
        audio.right.gain.disconnect();
        audio.master.disconnect();
        if (audio.ctx.state !== "closed") audio.ctx.close().catch(() => {});
        state.audio = null;
      }, Math.max(80, (seconds * 1000) + 80));
    }

    function startLoop() {
      if (state.rafId) return;
      const tick = () => {
        if (!state.playing) {
          state.rafId = 0;
          return;
        }
        state.rafId = requestAnimationFrame(tick);
        state.currentTime = clamp(nowSeconds() - state.startedAt, 0, state.journey.durationSec);
        updateAudio();
        callbacks.onTick?.({
          ...snapshot(),
          values: evaluateAt(state.journey, state.currentTime),
          progress: state.journey.durationSec ? state.currentTime / state.journey.durationSec : 0
        });
        if (state.currentTime >= state.journey.durationSec) {
          completeNaturally();
        }
      };
      tick();
    }

    async function start(journey) {
      state.journey = normalizeJourney(journey);
      state.playing = true;
      state.paused = false;
      state.currentTime = 0;
      state.startedAt = nowSeconds();
      const audio = ensureAudio();
      audio.ctx.resume().catch(() => {});
      rampMaster(MASTER_GAIN, FADE_IN_SECONDS);
      updateAudio(true);
      emitState("playing");
      startLoop();
    }

    function pause() {
      if (!state.playing) return;
      state.currentTime = clamp(nowSeconds() - state.startedAt, 0, state.journey.durationSec);
      state.playing = false;
      state.paused = true;
      updateAudio(true);
      emitState("paused");
    }

    async function resume() {
      if (!state.paused || !state.journey) return;
      state.playing = true;
      state.paused = false;
      state.startedAt = nowSeconds() - state.currentTime;
      const audio = ensureAudio();
      audio.ctx.resume().catch(() => {});
      updateAudio(true);
      emitState("playing");
      startLoop();
    }

    function end() {
      if (!state.journey) return;
      state.playing = false;
      state.paused = false;
      fadeAndDestroyAudio(MANUAL_END_FADE_SECONDS);
      emitState("ended");
      callbacks.onEnded?.(snapshot());
    }

    function completeNaturally() {
      if (!state.journey) return;
      state.playing = false;
      state.paused = false;
      state.currentTime = state.journey.durationSec;
      fadeAndDestroyAudio(NATURAL_END_FADE_SECONDS);
      emitState("complete");
      callbacks.onComplete?.(snapshot());
    }

    return {
      start,
      pause,
      resume,
      end,
      evaluateAt: (journey, t) => evaluateAt(normalizeJourney(journey), t),
      getState: snapshot
    };
  }

  window.TunerAtlasPlayer = {
    createPlayer,
    normalizeJourney,
    evaluateAt,
    formatTime(seconds) {
      const safe = Math.max(0, Number(seconds) || 0);
      const minutes = Math.floor(safe / 60);
      const rest = Math.floor(safe % 60);
      return `${minutes}:${String(rest).padStart(2, "0")}`;
    }
  };
})();
