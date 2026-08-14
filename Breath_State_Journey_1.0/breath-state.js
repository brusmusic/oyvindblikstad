(() => {
  "use strict";

  const MASTER_PEAK = 0.46;
  const FADE_IN_SEC = 2.4;
  const FADE_OUT_SEC = 1.2;
  const MIN_FUNDAMENTAL_HZ = 36;
  const MAX_FUNDAMENTAL_HZ = 70;
  const HOLD_MOTION = 0.15;
  const DEFAULT_BREATH_CURVE_Y_MAX_SEC = 20;
  const MIN_BREATH_CURVE_Y_MAX_SEC = 5;
  const MAX_BREATH_CURVE_Y_MAX_SEC = 60;
  const MIN_BREATH_CURVE_X_WINDOW = 0.12;
  const INTERFERENCE_GAIN_BASE = 0.04;
  const INTERFERENCE_GAIN_PULSE = 0.035;
  const BREATH_CURVE_HIT_RADIUS = 12;
  const CURVE_HIT_RADIUS = 12;
  const PRESET_STORAGE_KEY = "breath-state-journey-1.0-presets";
  const GUIDE_AUDIO_URL = "../audio/in_hold_out_voice.mp3";
  const GUIDE_CUE_DURATION_SEC = 1.08;
  const ABE_DURATION_SEC = 28;
  const ABE_BROWN_START_PROGRESS = 0.58;
  const ABE_USABLE_CONFIDENCE = 0.42;
  const EASY_DEFAULT_PRESET_ID = "builtin-vagal-reset";
  const EASY_READY_INSTRUCTION = "Lay down comfortably, place your phone vertically on your upper belly and press start.";
  const VOICE_PROMPT_TEXT = "I am amazing. Sometimes I forget. Well, here I am.";
  const VOICE_RECORDING_SEC = 8;
  const GUIDE_CUES = {
    inhaleStart: "in",
    holdAfterInhaleStart: "hold",
    holdAfterExhaleStart: "hold",
    exhaleStart: "out"
  };
  const guideCueOffsets = {
    in: [0, 6, 12, 18],
    hold: [2, 8, 14, 20],
    out: [4, 10, 16, 22]
  };
  const tonalGuideSemitones = {
    inhaleStart: 0,
    holdAfterInhaleStart: 2,
    exhaleStart: -5,
    holdAfterExhaleStart: -7
  };
  const breathTracks = {
    inhale: { label: "Inhale", color: "#9ad4c8", fallback: 3 },
    holdInhale: { label: "Hold in", color: "#d5b96e", fallback: 0 },
    exhale: { label: "Exhale", color: "#f09a86", fallback: 6 },
    holdExhale: { label: "Hold out", color: "#8ea7ff", fallback: 0 }
  };
  const breathEndpointInputs = {
    inhale: { start: "startInhaleInput", end: "endInhaleInput" },
    holdInhale: { start: "startHoldInhaleInput", end: "endHoldInhaleInput" },
    exhale: { start: "startExhaleInput", end: "endExhaleInput" },
    holdExhale: { start: "startHoldExhaleInput", end: "endHoldExhaleInput" }
  };
  const layerAutomationTracks = {
    breath: { label: "Breath", color: "#9ad4c8" },
    guideVoice: { label: "Guide voice", color: "#d5b96e" },
    guideTonal: { label: "Guide tonal", color: "#f7dca0" },
    interference: { label: "Interference", color: "#f09a86" },
    harmonic: { label: "Harmonic", color: "#8ea7ff" },
    nature: { label: "Nature", color: "#b9e38f" }
  };
  const noiseProfiles = {
    white: { label: "white", gain: 1, filterType: "bandpass", q: 0.85, frequencyScale: 1 },
    pink: { label: "pink", gain: 1.1, filterType: "bandpass", q: 0.78, frequencyScale: 0.86 },
    brown: { label: "brown", gain: 1.35, filterType: "lowpass", q: 0.7, frequencyScale: 0.62 },
    green: { label: "green soft", gain: 1.2, filterType: "bandpass", q: 1.15, frequencyScale: 0.72 },
    blue: { label: "blue", gain: 0.82, filterType: "bandpass", q: 0.95, frequencyScale: 1.35 },
    violet: { label: "violet", gain: 0.7, filterType: "highpass", q: 0.72, frequencyScale: 1.72 }
  };
  const natureSources = {
    birds: { label: "birds", url: "../audio/ambience_birds.mp3" },
    rain: { label: "rain", url: "../audio/ambience_rain.mp3" },
    waves: { label: "waves", url: "../audio/ambience_waves.mp3" },
    fireplace: { label: "fireplace", url: "../audio/ambience_fireplace.mp3" }
  };
  const NATURE_SAMPLE_GAIN_DB = 30;
  const NATURE_SAMPLE_GAIN = 10 ** (NATURE_SAMPLE_GAIN_DB / 20);

  const relationshipSets = {
    harmonic: {
      tension: [1, 9 / 8, 4 / 3, 15 / 8],
      release: [1, 3 / 2, 2, 5 / 2],
      label: "harmonic"
    },
    simple: {
      tension: [1, 6 / 5, 4 / 3, 8 / 5],
      release: [1, 5 / 4, 3 / 2, 2],
      label: "simple"
    },
    phi: {
      tension: [1, 1.118, 1.382, 1.618],
      release: [1, 1.236, 1.5, 2.0],
      label: "phi"
    }
  };

  const journeys = [
    {
      id: "settle-awake",
      name: "Settle Awake",
      description: "A short movement from active presence into regulated alertness.",
      durationSec: 300,
      states: [
        makeState("State A", 0, "#f09a86", { intensity: 0.72, density: 0.58, movement: 0.38, breath: [3, 6], silence: 0.02, noise: 0.74, beat: 0.2, harmonic: 0.45, reverb: 0.46 }),
        makeState("State B", 0.48, "#d5b96e", { intensity: 0.52, density: 0.42, movement: 0.28, breath: [5, 8], silence: 0.1, noise: 0.62, beat: 0.16, harmonic: 0.52, reverb: 0.62 }),
        makeState("State C", 1, "#9ad4c8", { intensity: 0.36, density: 0.27, movement: 0.18, breath: [7, 12], silence: 0.24, noise: 0.46, beat: 0.11, harmonic: 0.38, reverb: 0.7 })
      ]
    },
    {
      id: "space-between",
      name: "Space Between",
      description: "A sparse journey where absence becomes part of the score.",
      durationSec: 420,
      states: [
        makeState("Presence", 0, "#8ea7ff", { intensity: 0.46, density: 0.32, movement: 0.16, breath: [4, 6], silence: 0.18, noise: 0.56, beat: 0.11, harmonic: 0.4, reverb: 0.74 }),
        makeState("Space", 0.44, "#9ad4c8", { intensity: 0.28, density: 0.18, movement: 0.08, breath: [6, 10], silence: 0.42, noise: 0.36, beat: 0.07, harmonic: 0.3, reverb: 0.82 }),
        makeState("Return", 1, "#d5b96e", { intensity: 0.34, density: 0.24, movement: 0.12, breath: [6, 9], silence: 0.32, noise: 0.42, beat: 0.08, harmonic: 0.34, reverb: 0.78 })
      ]
    },
    {
      id: "open-release",
      name: "Open Release",
      description: "Clear inhale tension and softer exhale resolution.",
      durationSec: 360,
      states: [
        makeState("Open", 0, "#f09a86", { intensity: 0.66, density: 0.54, movement: 0.48, breath: [3, 5], silence: 0.03, noise: 0.68, beat: 0.22, harmonic: 0.56, reverb: 0.48 }),
        makeState("Suspend", 0.5, "#d5b96e", { intensity: 0.58, density: 0.44, movement: 0.42, breath: [4.5, 8], silence: 0.08, noise: 0.55, beat: 0.17, harmonic: 0.64, reverb: 0.66 }),
        makeState("Land", 1, "#9ad4c8", { intensity: 0.34, density: 0.28, movement: 0.2, breath: [6.5, 11], silence: 0.2, noise: 0.42, beat: 0.1, harmonic: 0.42, reverb: 0.74 })
      ]
    }
  ];

  const state = {
    audio: null,
    appMode: "easy",
    playing: false,
    holding: false,
    startedAt: 0,
    heldAt: 0,
    elapsedSec: 0,
    phase: "inhale",
    phaseElapsed: 0,
    phasePeakSeen: false,
    eventLog: [],
    lastEventAt: 0,
    rafId: 0,
    breathCurves: null,
    layerAutomation: null,
    activeBreathCurve: "inhale",
    activeLayerAutomation: "breath",
    selectedBreathPoint: null,
    selectedAutomationPoint: null,
    breathCurveView: { xStart: 0, xEnd: 1, yMaxSec: DEFAULT_BREATH_CURVE_Y_MAX_SEC },
    curveDrag: null,
    abe: {
      running: false,
      startedAt: 0,
      rafId: 0,
      samples: [],
      listener: null,
      lastResult: null,
      motionAllowed: false
    },
    voiceReflection: {
      before: null,
      after: null,
      recorder: null,
      stream: null,
      chunks: [],
      recordingSlot: null,
      timerId: 0,
      intervalId: 0,
      recordingStartedAt: 0,
      afterReady: false
    },
    guideRoundRobin: {
      in: 0,
      hold: 0,
      out: 0
    }
  };

  const els = {};

  function makeState(name, at, color, values) {
    return { name, at, color, ...values };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + ((b - a) * t);
  }

  function smoothstep(x) {
    return x * x * (3 - (2 * x));
  }

  function formatClock(sec) {
    const total = Math.max(0, Math.round(sec));
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function selectedNoiseProfile() {
    return noiseProfiles[els.noiseColorSelect?.value] || noiseProfiles.white;
  }

  function selectedNatureSource() {
    return natureSources[els.natureSourceSelect?.value] || natureSources.birds;
  }

  function normalizeNoise(data, targetPeak = 0.95) {
    let peak = 0.0001;
    for (let i = 0; i < data.length; i += 1) {
      peak = Math.max(peak, Math.abs(data[i]));
    }
    const gain = targetPeak / peak;
    for (let i = 0; i < data.length; i += 1) {
      data[i] *= gain;
    }
  }

  function createNoiseBuffer(ctx, color = "white") {
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastWhite = 0;
    let lastBlue = 0;
    let brown = 0;
    let green = 0;
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < length; i += 1) {
      const white = (Math.random() * 2) - 1;
      if (color === "pink") {
        b0 = (0.99886 * b0) + (white * 0.0555179);
        b1 = (0.99332 * b1) + (white * 0.0750759);
        b2 = (0.96900 * b2) + (white * 0.1538520);
        b3 = (0.86650 * b3) + (white * 0.3104856);
        b4 = (0.55000 * b4) + (white * 0.5329522);
        b5 = (-0.7616 * b5) - (white * 0.0168980);
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + (white * 0.5362)) * 0.11;
        b6 = white * 0.115926;
      } else if (color === "brown") {
        brown = ((brown + (0.055 * white)) / 1.055);
        data[i] = brown * 3.5;
      } else if (color === "green") {
        green = (green * 0.94) + (white * 0.06);
        data[i] = (white * 0.25) + (green * 0.75);
      } else if (color === "blue") {
        const blue = white - lastWhite;
        lastWhite = white;
        data[i] = blue;
      } else if (color === "violet") {
        const blue = white - lastWhite;
        lastWhite = white;
        data[i] = blue - lastBlue;
        lastBlue = blue;
      } else {
        data[i] = white;
      }
    }
    normalizeNoise(data);
    return buffer;
  }

  function createImpulse(ctx, seconds = 6.8, decay = 3.2) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        const t = i / length;
        data[i] = ((Math.random() * 2) - 1) * ((1 - t) ** decay);
      }
    }
    return buffer;
  }

  function makeAudioGraph() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    let breathSource = null;
    const noiseProfile = selectedNoiseProfile();
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = noiseProfile.filterType;
    breathFilter.frequency.value = 900;
    breathFilter.Q.value = noiseProfile.q;
    const breathGain = ctx.createGain();
    breathGain.gain.value = 0;
    const breathPan = ctx.createStereoPanner();
    breathFilter.connect(breathGain);
    breathGain.connect(breathPan);
    breathPan.connect(master);

    function setBreathNoiseColor(color) {
      const nextSource = ctx.createBufferSource();
      nextSource.buffer = createNoiseBuffer(ctx, color || "white");
      nextSource.loop = true;
      nextSource.connect(breathFilter);
      nextSource.start();
      const previousSource = breathSource;
      breathSource = nextSource;
      if (previousSource) {
        window.setTimeout(() => {
          try {
            previousSource.stop();
          } catch {
            // Already stopped.
          }
        }, 60);
      }
    }

    const beatA = ctx.createOscillator();
    const beatB = ctx.createOscillator();
    beatA.type = "sine";
    beatB.type = "sine";
    const beatGain = ctx.createGain();
    beatGain.gain.value = 0;
    beatA.connect(beatGain);
    beatB.connect(beatGain);
    beatGain.connect(master);

    const harmonicBus = ctx.createGain();
    const harmonicDry = ctx.createGain();
    const harmonicWet = ctx.createGain();
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulse(ctx);
    harmonicDry.gain.value = 0.025;
    harmonicWet.gain.value = 0.14;
    harmonicBus.connect(harmonicDry);
    harmonicBus.connect(convolver);
    convolver.connect(harmonicWet);
    harmonicDry.connect(master);
    harmonicWet.connect(master);

    const harmonicVoices = [0, 1, 2, 3].map((index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      osc.type = index === 0 ? "sine" : "triangle";
      gain.gain.value = 0;
      pan.pan.value = [-0.42, -0.12, 0.18, 0.46][index];
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(harmonicBus);
      return { osc, gain, pan };
    });

    const natureFilter = ctx.createBiquadFilter();
    natureFilter.type = "lowpass";
    natureFilter.frequency.value = 5200;
    const natureGain = ctx.createGain();
    natureGain.gain.value = 0;
    const natureBus = ctx.createGain();
    natureBus.gain.value = 1;
    natureBus.connect(natureFilter);
    natureFilter.connect(natureGain);
    natureGain.connect(master);
    const natureBuffers = new Map();
    let natureLoop = null;
    let natureLoopToken = 0;

    function clearNatureLoop(fadeSec = 0.18) {
      natureLoopToken += 1;
      if (!natureLoop) return;
      const now = ctx.currentTime;
      natureLoop.timers.forEach((timerId) => window.clearTimeout(timerId));
      natureLoop.clips.forEach(({ source, gain }) => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0, now + fadeSec);
          source.stop(now + fadeSec + 0.04);
        } catch {
          // Already stopped.
        }
      });
      natureLoop = null;
    }

    async function ensureNatureBuffer(sourceId) {
      const config = natureSources[sourceId] || natureSources.birds;
      if (!natureBuffers.has(sourceId)) {
        const promise = fetch(config.url)
          .then((response) => {
            if (!response.ok) throw new Error(`Nature audio could not be loaded (${response.status})`);
            return response.arrayBuffer();
          })
          .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer));
        natureBuffers.set(sourceId, promise);
      }
      return natureBuffers.get(sourceId);
    }

    function scheduleNatureClip(loop, buffer, when, offsetSec, durationSec, fadeInSec, fadeOutSec) {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      const duration = Math.max(0.1, Math.min(durationSec, buffer.duration - offsetSec));
      source.buffer = buffer;
      gain.gain.setValueAtTime(fadeInSec > 0 ? 0 : 1, when);
      if (fadeInSec > 0) gain.gain.linearRampToValueAtTime(1, when + fadeInSec);
      if (fadeOutSec > 0 && duration > fadeOutSec) {
        gain.gain.setValueAtTime(1, when + duration - fadeOutSec);
        gain.gain.linearRampToValueAtTime(0, when + duration);
      }
      source.connect(gain);
      gain.connect(natureBus);
      source.start(when, offsetSec, duration);
      source.stop(when + duration + 0.06);
      loop.clips.push({ source, gain });
    }

    function startNatureLoop(buffer, sourceId) {
      clearNatureLoop(0.08);
      const token = natureLoopToken;
      const loop = { sourceId, clips: [], timers: [] };
      natureLoop = loop;
      const now = ctx.currentTime + 0.02;
      const firstEnd = Math.min(55, Math.max(10, buffer.duration - 0.1));
      const loopStart = Math.min(10, Math.max(0, buffer.duration - 0.2));
      const loopEnd = Math.min(55, Math.max(loopStart + 1, buffer.duration - 0.1));
      const crossfade = Math.min(5, Math.max(0.5, (loopEnd - loopStart) / 3));
      const loopDuration = Math.max(1, loopEnd - loopStart);
      const loopInterval = Math.max(1, loopDuration - crossfade);
      scheduleNatureClip(loop, buffer, now, 0, firstEnd, 0, crossfade);

      const queueLoop = (when) => {
        if (token !== natureLoopToken || natureLoop !== loop) return;
        scheduleNatureClip(loop, buffer, when, loopStart, loopDuration, crossfade, crossfade);
        const delayMs = Math.max(0, ((when + loopInterval) - ctx.currentTime) * 1000);
        loop.timers.push(window.setTimeout(() => queueLoop(when + loopInterval), delayMs));
      };
      const nextWhen = now + Math.max(1, firstEnd - crossfade);
      loop.timers.push(window.setTimeout(() => queueLoop(nextWhen), Math.max(0, (nextWhen - ctx.currentTime) * 1000)));
    }

    async function setNatureSource(sourceId = "birds") {
      const id = natureSources[sourceId] ? sourceId : "birds";
      if (natureLoop?.sourceId === id) return;
      const buffer = await ensureNatureBuffer(id);
      startNatureLoop(buffer, id);
    }

    const guideGain = ctx.createGain();
    guideGain.gain.value = controlValue("guideVoiceVolumeInput", 1.15);
    guideGain.connect(master);
    const tonalGuideGain = ctx.createGain();
    tonalGuideGain.gain.value = controlValue("guideTonalVolumeInput", 1.2);
    tonalGuideGain.connect(master);
    const tonalGuideReverb = ctx.createConvolver();
    const tonalGuideWet = ctx.createGain();
    tonalGuideReverb.buffer = createImpulse(ctx);
    tonalGuideWet.gain.value = controlValue("guideTonalVolumeInput", 1.2) * 0.2;
    tonalGuideReverb.connect(tonalGuideWet);
    tonalGuideWet.connect(master);
    let guideBufferPromise = null;

    async function ensureGuideBuffer() {
      if (!guideBufferPromise) {
        guideBufferPromise = fetch(GUIDE_AUDIO_URL)
          .then((response) => {
            if (!response.ok) throw new Error(`Guide audio could not be loaded (${response.status})`);
            return response.arrayBuffer();
          })
          .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer));
      }
      return guideBufferPromise;
    }

    async function playGuideCue(cueName, offsetSec) {
      const buffer = await ensureGuideBuffer();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(guideGain);
      source.start(ctx.currentTime, offsetSec, GUIDE_CUE_DURATION_SEC);
    }

    function playTonalGuide(eventName, fundamentalHz, harmonicMode) {
      const semitones = tonalGuideSemitones[eventName];
      if (!Number.isFinite(semitones)) return;
      const now = ctx.currentTime;
      const baseHz = clamp(fundamentalHz, MIN_FUNDAMENTAL_HZ, MAX_FUNDAMENTAL_HZ);
      const cueHz = baseHz * (2 ** (semitones / 12));
      const set = relationshipSets[harmonicMode] || relationshipSets.harmonic;
      const isOpening = eventName === "inhaleStart" || eventName === "holdAfterInhaleStart";
      const cueRegister = {
        inhaleStart: { min: 170, max: 360 },
        holdAfterInhaleStart: { min: 150, max: 320 },
        exhaleStart: { min: 115, max: 230 },
        holdAfterExhaleStart: { min: 105, max: 205 }
      }[eventName] || { min: 115, max: 320 };
      const guideRootHz = fitFrequencyToRange(cueHz, cueRegister.min, cueRegister.max);
      const relationshipRatios = (isOpening ? set.tension : set.release)
        .filter((ratio) => Number.isFinite(ratio) && ratio > 0);
      const rootRatios = eventName === "holdAfterExhaleStart" ? [1, 2] : [1, 2, 4];
      const colorRatios = eventName === "holdAfterExhaleStart"
        ? []
        : relationshipRatios
          .filter((ratio) => Math.abs(ratio - 1) > 0.03)
          .flatMap((ratio) => [ratio, ratio * 2]);
      const cueVoices = [
        ...rootRatios.map((ratio, index) => ({ ratio, weight: [0.92, 0.22, 0.1, 0.05][index] || 0.04 })),
        ...colorRatios.map((ratio, index) => ({ ratio, weight: 0.045 / (index + 1) }))
      ]
        .map((voice) => ({ ...voice, hz: guideRootHz * voice.ratio }))
        .filter((voice) => voice.hz >= 100 && voice.hz <= 4200)
        .filter((voice, index, voices) => voices.findIndex((candidate) => Math.abs(candidate.ratio - voice.ratio) < 0.001) === index)
        .sort((a, b) => a.hz - b.hz);
      const cueBus = ctx.createGain();
      const cueHighpass = ctx.createBiquadFilter();
      const cueFilter = ctx.createBiquadFilter();
      const cuePan = ctx.createStereoPanner();
      cueBus.gain.setValueAtTime(0, now);
      cueBus.gain.linearRampToValueAtTime(0.26, now + 0.026);
      cueBus.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      cueHighpass.type = "highpass";
      cueHighpass.frequency.setValueAtTime(115, now);
      cueHighpass.Q.value = 0.72;
      cueFilter.type = "lowpass";
      cueFilter.frequency.setValueAtTime(clamp(cueHz * 9, 950, 4200), now);
      cueFilter.Q.value = 0.58;
      const cuePanByEvent = {
        inhaleStart: -0.8,
        holdAfterInhaleStart: 0,
        exhaleStart: 0.8,
        holdAfterExhaleStart: 0
      };
      cuePan.pan.value = cuePanByEvent[eventName] ?? 0;
      cueBus.connect(cueHighpass);
      cueHighpass.connect(cueFilter);
      cueFilter.connect(cuePan);
      cuePan.connect(tonalGuideGain);
      cuePan.connect(tonalGuideReverb);
      cueVoices.forEach((voice, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(voice.hz, now);
        const holdOutWeight = eventName === "holdAfterExhaleStart" ? 0.72 : 1;
        gain.gain.setValueAtTime(voice.weight * holdOutWeight, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + lerp(0.42, 0.9, index / Math.max(1, cueVoices.length - 1)));
        osc.connect(gain);
        gain.connect(cueBus);
        osc.start(now);
        osc.stop(now + 1);
      });
    }

    setBreathNoiseColor(els.noiseColorSelect?.value || "white");
    beatA.start();
    beatB.start();
    harmonicVoices.forEach((voice) => voice.osc.start());

    return {
      ctx,
      master,
      breathFilter,
      breathGain,
      breathPan,
      beatA,
      beatB,
      beatGain,
      harmonicBus,
      harmonicDry,
      harmonicWet,
      harmonicVoices,
      natureFilter,
      natureGain,
      guideGain,
      tonalGuideGain,
      tonalGuideWet,
      ensureGuideBuffer,
      playGuideCue,
      playTonalGuide,
      setBreathNoiseColor,
      setNatureSource,
      stopSources() {
        clearNatureLoop(0);
        [breathSource, beatA, beatB, ...harmonicVoices.map((voice) => voice.osc)].forEach((source) => {
          try {
            source.stop();
          } catch {
            // Already stopped.
          }
        });
      }
    };
  }

  function selectedJourney() {
    return journeys.find((journey) => journey.id === els.journeySelect.value) || journeys[0];
  }

  function journeyDuration() {
    return Number(els.durationInput.value) || selectedJourney().durationSec;
  }

  function selectedFundamental() {
    return clamp(Number(els.fundamentalInput.value) || 48, MIN_FUNDAMENTAL_HZ, MAX_FUNDAMENTAL_HZ);
  }

  function controlValue(id, fallback = 1) {
    const value = Number(els[id]?.value);
    return Number.isFinite(value) ? value : fallback;
  }

  function inputValue(id, fallback = 0) {
    const value = Number(els[id]?.value);
    return Number.isFinite(value) ? value : fallback;
  }

  function fitFrequencyToRange(frequency, min, max) {
    let fitted = frequency;
    while (fitted < min) fitted *= 2;
    while (fitted > max) fitted /= 2;
    if (fitted < min) fitted = min;
    return fitted;
  }

  function breathValues(item) {
    const breath = Array.isArray(item?.breath) ? item.breath : [3, 6];
    if (breath.length >= 4) return breath;
    return [breath[0] ?? 3, 0, breath[1] ?? 6, 0];
  }

  function curvePoints(startValue, endValue) {
    return [
      { t: 0, v: clamp(startValue, 0, MAX_BREATH_CURVE_Y_MAX_SEC) },
      { t: 1, v: clamp(endValue, 0, MAX_BREATH_CURVE_Y_MAX_SEC) }
    ];
  }

  function resetBreathCurvesFromControls() {
    state.breathCurves = {
      inhale: curvePoints(inputValue("startInhaleInput", 3), inputValue("endInhaleInput", 7)),
      holdInhale: curvePoints(inputValue("startHoldInhaleInput", 0), inputValue("endHoldInhaleInput", 0)),
      exhale: curvePoints(inputValue("startExhaleInput", 6), inputValue("endExhaleInput", 12)),
      holdExhale: curvePoints(inputValue("startHoldExhaleInput", 0), inputValue("endHoldExhaleInput", 0))
    };
    renderBreathCurveEditor();
  }

  function ensureBreathCurves() {
    if (!state.breathCurves) resetBreathCurvesFromControls();
    return state.breathCurves;
  }

  function resetLayerAutomation() {
    state.layerAutomation = Object.fromEntries(
      Object.keys(layerAutomationTracks).map((trackId) => [trackId, [{ t: 0, v: 1 }, { t: 1, v: 1 }]])
    );
    renderLayerAutomationEditor();
  }

  function ensureLayerAutomation() {
    if (!state.layerAutomation) resetLayerAutomation();
    return state.layerAutomation;
  }

  function sortCurve(curve) {
    curve.sort((a, b) => a.t - b.t);
  }

  function evaluateValueCurve(curve, progress, fallback = 1) {
    if (!curve?.length) return fallback;
    sortCurve(curve);
    const t = clamp(progress, 0, 1);
    if (t <= curve[0].t) return curve[0].v;
    const last = curve[curve.length - 1];
    if (t >= last.t) return last.v;
    for (let i = 0; i < curve.length - 1; i += 1) {
      const a = curve[i];
      const b = curve[i + 1];
      if (t >= a.t && t <= b.t) {
        const local = (t - a.t) / Math.max(0.0001, b.t - a.t);
        return lerp(a.v, b.v, smoothstep(local));
      }
    }
    return last.v;
  }

  function layerAutomationValue(trackId, progress) {
    const curve = ensureLayerAutomation()[trackId];
    return clamp(evaluateValueCurve(curve, progress, 1), 0, 1);
  }

  function evaluateBreathCurve(trackId, progress) {
    const curves = ensureBreathCurves();
    const curve = curves[trackId] || curvePoints(breathTracks[trackId]?.fallback || 0, breathTracks[trackId]?.fallback || 0);
    sortCurve(curve);
    const t = clamp(progress, 0, 1);
    if (t <= curve[0].t) return curve[0].v;
    const last = curve[curve.length - 1];
    if (t >= last.t) return last.v;
    for (let i = 0; i < curve.length - 1; i += 1) {
      const a = curve[i];
      const b = curve[i + 1];
      if (t >= a.t && t <= b.t) {
        const local = (t - a.t) / Math.max(0.0001, b.t - a.t);
        return lerp(a.v, b.v, smoothstep(local));
      }
    }
    return last.v;
  }

  function evaluateJourney(progress) {
    const journey = selectedJourney();
    const t = clamp(progress, 0, 1);
    const states = journey.states;
    let from = states[0];
    let to = states[states.length - 1];
    for (let i = 0; i < states.length - 1; i += 1) {
      if (t >= states[i].at && t <= states[i + 1].at) {
        from = states[i];
        to = states[i + 1];
        break;
      }
    }
    const span = Math.max(0.0001, to.at - from.at);
    const local = smoothstep(clamp((t - from.at) / span, 0, 1));
    return {
      activeState: local < 0.5 ? from : to,
      color: mixColor(from.color, to.color, local),
      intensity: lerp(from.intensity, to.intensity, local),
      density: lerp(from.density, to.density, local),
      movement: lerp(from.movement, to.movement, local) * (Number(els.movementInput.value) || 0.34) / 0.34,
      silence: lerp(from.silence, to.silence, local),
      noise: lerp(from.noise, to.noise, local),
      beat: lerp(from.beat, to.beat, local),
      harmonic: lerp(from.harmonic, to.harmonic, local),
      reverb: lerp(from.reverb, to.reverb, local),
      inhaleSec: evaluateBreathCurve("inhale", t),
      holdInhaleSec: evaluateBreathCurve("holdInhale", t),
      exhaleSec: evaluateBreathCurve("exhale", t),
      holdExhaleSec: evaluateBreathCurve("holdExhale", t)
    };
  }

  function mixColor(a, b, t) {
    const ca = parseColor(a);
    const cb = parseColor(b);
    const mixed = ca.map((value, index) => Math.round(lerp(value, cb[index], t)));
    return `rgb(${mixed[0]} ${mixed[1]} ${mixed[2]})`;
  }

  function parseColor(hex) {
    const clean = hex.replace("#", "");
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16)
    ];
  }

  function emitEvent(name) {
    state.lastEventAt = state.elapsedSec;
    state.eventLog.unshift({
      name,
      at: state.elapsedSec
    });
    state.eventLog = state.eventLog.slice(0, 12);
    triggerGuideCue(name);
    triggerTonalGuideCue(name);
  }

  function triggerGuideCue(eventName) {
    const cueName = GUIDE_CUES[eventName];
    if (!cueName || !els.guideLayerToggle?.checked || !state.audio) return;
    const offsets = guideCueOffsets[cueName] || [0];
    const index = state.guideRoundRobin[cueName] % offsets.length;
    state.guideRoundRobin[cueName] = index + 1;
    state.audio.playGuideCue(cueName, offsets[index]).catch((error) => {
      console.warn(error);
    });
  }

  function triggerTonalGuideCue(eventName) {
    if (!els.guideTonalToggle?.checked || !state.audio) return;
    state.audio.playTonalGuide(eventName, selectedFundamental(), els.relationshipSelect.value);
  }

  function phaseDuration(params) {
    if (state.phase === "inhale") return params.inhaleSec;
    if (state.phase === "holdInhale") return params.holdInhaleSec >= 1 ? params.holdInhaleSec : 0;
    if (state.phase === "exhale") return params.exhaleSec;
    return params.holdExhaleSec >= 1 ? params.holdExhaleSec : 0;
  }

  function phaseLabel(phase = state.phase) {
    if (phase === "holdInhale") return "Hold";
    if (phase === "holdExhale") return "Hold";
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  }

  function isMovingBreathPhase(phase = state.phase) {
    return phase === "inhale" || phase === "exhale";
  }

  function nextBreathPhase(currentPhase) {
    if (currentPhase === "inhale") return "holdInhale";
    if (currentPhase === "holdInhale") return "exhale";
    if (currentPhase === "exhale") return "holdExhale";
    return "inhale";
  }

  function nextPlayablePhase(currentPhase, params) {
    let nextPhase = nextBreathPhase(currentPhase);
    for (let i = 0; i < 4; i += 1) {
      const duration = nextPhase === "inhale"
        ? params.inhaleSec
        : nextPhase === "holdInhale"
          ? (params.holdInhaleSec >= 1 ? params.holdInhaleSec : 0)
          : nextPhase === "exhale"
            ? params.exhaleSec
            : (params.holdExhaleSec >= 1 ? params.holdExhaleSec : 0);
      if (duration > 0.001) return nextPhase;
      nextPhase = nextBreathPhase(nextPhase);
    }
    return "inhale";
  }

  function enterPhase(nextPhase, params) {
    let phase = nextPhase;
    for (let i = 0; i < 4; i += 1) {
      state.phase = phase;
      if (phaseDuration(params) > 0.001) {
        if (phase === "holdInhale") emitEvent("holdAfterInhaleStart");
        if (phase === "exhale") emitEvent("exhaleStart");
        if (phase === "holdExhale") emitEvent("holdAfterExhaleStart");
        if (phase === "inhale") emitEvent("inhaleStart");
        return;
      }
      phase = nextBreathPhase(phase);
    }
    state.phase = "inhale";
    emitEvent("inhaleStart");
  }

  function advanceBreath(dt, params) {
    if (!state.playing || state.holding) return;
    state.phaseElapsed += dt;
    let duration = phaseDuration(params);
    if (duration <= 0.001) {
      enterPhase(nextBreathPhase(state.phase), params);
      state.phaseElapsed = 0;
      duration = phaseDuration(params);
    }
    if (isMovingBreathPhase() && !state.phasePeakSeen && state.phaseElapsed >= duration / 2) {
      state.phasePeakSeen = true;
      emitEvent(state.phase === "inhale" ? "inhalePeak" : "exhalePeak");
    }
    if (state.phaseElapsed < duration) return;

    if (state.phase === "inhale") {
      emitEvent("inhaleEnd");
    } else if (state.phase === "exhale") {
      emitEvent("exhaleEnd");
    } else if (state.phase === "holdExhale") {
      emitEvent("cycleComplete");
    }
    state.phaseElapsed = Math.max(0, state.phaseElapsed - duration);
    state.phasePeakSeen = false;
    enterPhase(nextBreathPhase(state.phase), params);
  }

  function applyAudio(params) {
    if (!state.audio) return;
    const audio = state.audio;
    const ctx = audio.ctx;
    const now = ctx.currentTime;
    const fundamental = selectedFundamental();
    const duration = phaseDuration(params);
    const phaseProgress = clamp(state.phaseElapsed / Math.max(0.001, duration), 0, 1);
    const silence = clamp(params.silence, 0, 0.92);
    const presence = 1 - silence;
    const breathVolume = controlValue("breathVolumeInput", 1.65);
    const beatVolume = controlValue("beatVolumeInput", 2.2);
    const harmonicVolume = controlValue("harmonicVolumeInput", 2.4);
    const harmonicSpace = controlValue("harmonicSpaceInput", 2.2);
    const natureVolume = controlValue("natureVolumeInput", 1.6);
    const journeyProgress = clamp(state.elapsedSec / Math.max(1, journeyDuration()), 0, 1);
    const layerBreath = els.breathLayerToggle.checked ? params.noise * presence * breathVolume * layerAutomationValue("breath", journeyProgress) : 0;
    const layerBeat = els.beatLayerToggle.checked ? params.beat * presence * beatVolume * layerAutomationValue("interference", journeyProgress) : 0;
    const layerHarmonic = els.harmonicLayerToggle.checked ? params.harmonic * presence * harmonicVolume * layerAutomationValue("harmonic", journeyProgress) : 0;
    const layerNature = els.natureLayerToggle.checked ? 0.08 * presence * natureVolume * layerAutomationValue("nature", journeyProgress) : 0;
    const attackPulse = Math.exp(-Math.max(0, state.elapsedSec - state.lastEventAt) * 2.6);
    audio.guideGain.gain.setTargetAtTime(controlValue("guideVoiceVolumeInput", 1.15) * layerAutomationValue("guideVoice", journeyProgress), now, 0.05);
    audio.tonalGuideGain.gain.setTargetAtTime(controlValue("guideTonalVolumeInput", 1.2) * layerAutomationValue("guideTonal", journeyProgress), now, 0.05);
    audio.tonalGuideWet.gain.setTargetAtTime(controlValue("guideTonalVolumeInput", 1.2) * layerAutomationValue("guideTonal", journeyProgress) * 0.22, now, 0.08);

    let breathAmp = 0;
    let breathPan = 0;
    if (state.phase === "inhale") {
      breathAmp = smoothstep(phaseProgress);
      breathPan = lerp(-0.85, 0, smoothstep(phaseProgress));
    } else if (state.phase === "holdInhale") {
      breathAmp = 1;
      breathPan = 0;
    } else if (state.phase === "exhale") {
      breathAmp = 1 - smoothstep(phaseProgress);
      breathPan = lerp(0, 0.85, smoothstep(phaseProgress));
    } else {
      breathAmp = 0;
      breathPan = 0.85;
    }
    const noiseProfile = selectedNoiseProfile();
    const breathGain = layerBreath * 0.085 * breathAmp * params.intensity * noiseProfile.gain;
    let breathFreqBase = 620;
    if (state.phase === "inhale") {
      breathFreqBase = lerp(520, 1450, phaseProgress);
    } else if (state.phase === "holdInhale") {
      const holdDip = Math.sin(phaseProgress * Math.PI) * HOLD_MOTION;
      breathFreqBase = 1450 * (1 - (holdDip * 0.32));
    } else if (state.phase === "exhale") {
      breathFreqBase = lerp(1450, 620, phaseProgress);
    } else {
      breathFreqBase = 620;
    }
    const breathFreq = clamp(breathFreqBase * noiseProfile.frequencyScale, 90, 6000);
    if (audio.breathFilter.type !== noiseProfile.filterType) audio.breathFilter.type = noiseProfile.filterType;
    audio.breathGain.gain.setTargetAtTime(breathGain, now, 0.05);
    audio.breathPan.pan.setTargetAtTime(breathPan, now, 0.08);
    audio.breathFilter.frequency.setTargetAtTime(breathFreq, now, 0.08);
    audio.breathFilter.Q.setTargetAtTime(noiseProfile.q, now, 0.08);

    const beatDiff = clamp(1 / Math.max(1, duration || (params.inhaleSec + params.exhaleSec)), 0.025, 1);
    audio.beatA.frequency.setTargetAtTime(fundamental, now, 0.05);
    audio.beatB.frequency.setTargetAtTime(fundamental + beatDiff, now, 0.05);
    audio.beatGain.gain.setTargetAtTime(layerBeat * (INTERFERENCE_GAIN_BASE + (INTERFERENCE_GAIN_PULSE * attackPulse)), now, 0.04);

    const set = relationshipSets[els.relationshipSelect.value] || relationshipSets.harmonic;
    let harmonicLiftSemitone = 0;
    if (state.phase === "inhale") harmonicLiftSemitone = lerp(-1.5, 2.2, smoothstep(phaseProgress));
    if (state.phase === "holdInhale") harmonicLiftSemitone = 2.2;
    if (state.phase === "exhale") harmonicLiftSemitone = lerp(2.2, -5.8, smoothstep(phaseProgress));
    if (state.phase === "holdExhale") harmonicLiftSemitone = -5.8;
    const harmonicLift = 2 ** (harmonicLiftSemitone / 12);
    const releaseWeight = state.phase === "inhale"
      ? smoothstep(phaseProgress) * 0.24
      : state.phase === "exhale"
        ? 0.58 + (smoothstep(phaseProgress) * 0.42)
        : state.phase === "holdInhale"
          ? 0.24
          : 1;
    audio.harmonicVoices.forEach((voice, index) => {
      const tensionRatio = set.tension[index] || 1;
      const releaseRatio = set.release[index] || tensionRatio;
      const ratio = lerp(tensionRatio, releaseRatio, releaseWeight);
      const drift = Math.sin((state.elapsedSec * (0.06 + (params.movement * 0.16))) + index) * params.movement * 0.25;
      voice.osc.frequency.setTargetAtTime((fundamental * ratio * harmonicLift) + drift, now, 0.12);
      const voiceLevel = layerHarmonic * (index === 0 ? 0.026 : 0.014) * (1 + (params.density * 0.7));
      const exhaleLift = state.phase === "exhale" ? 1.05 : 0.82;
      voice.gain.gain.setTargetAtTime(voiceLevel * exhaleLift, now, 0.12);
      voice.pan.pan.setTargetAtTime((index - 1.5) * 0.28 * (0.45 + params.movement), now, 0.18);
    });
    audio.harmonicWet.gain.setTargetAtTime(layerHarmonic * harmonicSpace * lerp(0.08, 0.28, params.reverb), now, 0.22);
    audio.harmonicDry.gain.setTargetAtTime(layerHarmonic * 0.022, now, 0.12);

    audio.natureFilter.frequency.setTargetAtTime(3200 + (params.intensity * 3600), now, 0.4);
    audio.natureGain.gain.setTargetAtTime(layerNature * 0.035 * NATURE_SAMPLE_GAIN, now, 0.2);

    updateMeters({
      breath: clamp((breathGain * noiseProfile.gain) / 0.07, 0, 1),
      beat: clamp((layerBeat * (0.4 + attackPulse)) / 0.32, 0, 1),
      harmonic: clamp(layerHarmonic, 0, 1),
      space: clamp(params.reverb * harmonicSpace, 0, 1)
    });
  }

  function setAbeStatus(message, signal = "gentle") {
    if (els.abeStatus) els.abeStatus.textContent = message;
    if (els.abeSignalText) els.abeSignalText.textContent = signal;
  }

  function setAbeValues(startText = "--", targetText = "--") {
    if (els.abeStartValue) els.abeStartValue.textContent = startText;
    if (els.abeTargetValue) els.abeTargetValue.textContent = targetText;
  }

  function abePrepValues(result) {
    const usable = result?.confidence >= ABE_USABLE_CONFIDENCE && Number.isFinite(result.cycleDuration);
    const hasCandidate = result && Number.isFinite(result.cycleDuration);
    const cycle = hasCandidate ? clamp(result.cycleDuration, 3.1, 8.5) : 8.5;
    const startInhale = hasCandidate ? clamp(cycle * 0.42, 1.2, 3.4) : 3;
    const startExhale = hasCandidate ? clamp(cycle * 0.58, 1.7, 5.8) : 5.5;
    const endInhale = clamp(Math.max(inputValue("endInhaleInput", 7), startInhale + 2.4, 6.2), 1, 20);
    const endExhale = clamp(Math.max(inputValue("endExhaleInput", 12), startExhale + 4.8, 10.5), 1, 30);
    return { usable, hasCandidate, cycle, startInhale, startExhale, endInhale, endExhale };
  }

  function abeBreathLabel(inhaleSec, exhaleSec) {
    return `${inhaleSec.toFixed(1)} in / ${exhaleSec.toFixed(1)} out`;
  }

  function abeMotionSupported() {
    return typeof window.DeviceMotionEvent !== "undefined" || typeof window.DeviceOrientationEvent !== "undefined";
  }

  async function requestAbeMotionAccess() {
    if (!abeMotionSupported()) return false;
    const requests = [];
    if (typeof window.DeviceMotionEvent?.requestPermission === "function") {
      requests.push(window.DeviceMotionEvent.requestPermission.call(window.DeviceMotionEvent));
    }
    if (typeof window.DeviceOrientationEvent?.requestPermission === "function") {
      requests.push(window.DeviceOrientationEvent.requestPermission.call(window.DeviceOrientationEvent));
    }
    if (!requests.length) return true;
    try {
      const results = await Promise.allSettled(requests);
      return results.every((result) => result.status === "fulfilled" && result.value === "granted");
    } catch {
      return false;
    }
  }

  function startAbeMotionCapture() {
    state.abe.samples = [];
    if (typeof window.DeviceMotionEvent === "undefined") return;
    const startedAt = performance.now() / 1000;
    state.abe.listener = (event) => {
      const rotation = event.rotationRate || {};
      const accel = event.accelerationIncludingGravity || event.acceleration || {};
      const motion = event.acceleration || {};
      const gx = Number(accel.x) || 0;
      const gy = Number(accel.y) || 0;
      const gz = Number(accel.z) || 0;
      const ax = Number(motion.x) || 0;
      const ay = Number(motion.y) || 0;
      const az = Number(motion.z) || 0;
      const alpha = Number(rotation.alpha) || 0;
      const beta = Number(rotation.beta) || 0;
      const gamma = Number(rotation.gamma) || 0;
      const t = (performance.now() / 1000) - startedAt;
      state.abe.samples.push({
        t,
        ax,
        ay,
        az,
        gx,
        gy,
        gz,
        alpha,
        beta,
        gamma,
        rotationMagnitude: Math.hypot(alpha, beta, gamma),
        gravityMagnitude: Math.hypot(gx, gy, gz)
      });
      if (state.abe.samples.length > 1800) state.abe.samples.shift();
    };
    window.addEventListener("devicemotion", state.abe.listener, { passive: true });
  }

  function stopAbeMotionCapture() {
    if (state.abe.listener) {
      window.removeEventListener("devicemotion", state.abe.listener);
      state.abe.listener = null;
    }
  }

  function median(values) {
    const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!finite.length) return 0;
    const middle = Math.floor(finite.length / 2);
    return finite.length % 2 ? finite[middle] : (finite[middle - 1] + finite[middle]) / 2;
  }

  function movingAverage(values, radius = 4) {
    return values.map((_, index) => {
      let sum = 0;
      let count = 0;
      for (let i = Math.max(0, index - radius); i <= Math.min(values.length - 1, index + radius); i += 1) {
        sum += values[i];
        count += 1;
      }
      return sum / Math.max(1, count);
    });
  }

  function analyzeAbeCandidate(samples, key) {
    const usableSamples = samples.filter((sample) => sample.t >= 3.2 && Number.isFinite(sample[key]));
    if (usableSamples.length < 80) return null;
    const raw = usableSamples.map((sample) => sample[key]);
    const smooth = movingAverage(raw, 5);
    const mean = smooth.reduce((sum, value) => sum + value, 0) / smooth.length;
    const centered = smooth.map((value) => value - mean);
    const rms = Math.sqrt(centered.reduce((sum, value) => sum + (value * value), 0) / centered.length);
    if (rms <= 0.0001) return null;
    const z = centered.map((value) => value / rms);
    const range = Math.max(...smooth) - Math.min(...smooth);
    const minGap = 1.15;
    const peaks = [];
    const troughs = [];
    for (let i = 2; i < z.length - 2; i += 1) {
      const t = usableSamples[i].t;
      if (z[i] > 0.55 && z[i] >= z[i - 1] && z[i] >= z[i + 1] && z[i] >= z[i - 2] && z[i] >= z[i + 2]) {
        if (!peaks.length || t - peaks[peaks.length - 1] >= minGap) peaks.push(t);
      }
      if (z[i] < -0.55 && z[i] <= z[i - 1] && z[i] <= z[i + 1] && z[i] <= z[i - 2] && z[i] <= z[i + 2]) {
        if (!troughs.length || t - troughs[troughs.length - 1] >= minGap) troughs.push(t);
      }
    }
    const periods = [
      ...peaks.slice(1).map((time, index) => time - peaks[index]),
      ...troughs.slice(1).map((time, index) => time - troughs[index])
    ].filter((period) => period >= 2.4 && period <= 8.5);
    if (periods.length < 2) return null;
    const cycleDuration = median(periods);
    const deviation = median(periods.map((period) => Math.abs(period - cycleDuration)));
    const regularity = clamp(1 - (deviation / Math.max(0.001, cycleDuration * 0.34)), 0, 1);
    const extremaBalance = clamp(Math.min(peaks.length, troughs.length) / Math.max(1, Math.max(peaks.length, troughs.length)), 0, 1);
    const countScore = clamp(periods.length / 6, 0, 1);
    const amplitudeScore = clamp(range / Math.max(0.18, rms * 3.2), 0, 1);
    const confidence = clamp((regularity * 0.36) + (countScore * 0.26) + (extremaBalance * 0.18) + (amplitudeScore * 0.2), 0, 1);
    const anchors = [...peaks, ...troughs].sort((a, b) => b - a);
    return {
      key,
      confidence,
      cycleDuration,
      breathsPerMinute: 60 / cycleDuration,
      peaks,
      troughs,
      anchorSec: anchors[0] || usableSamples[usableSamples.length - 1].t,
      sampleCount: usableSamples.length,
      range,
      rms
    };
  }

  function analyzeAbeSamples(samples = state.abe.samples) {
    const keys = ["gx", "gy", "gz", "gravityMagnitude", "rotationMagnitude", "alpha", "beta", "gamma"];
    const candidates = keys
      .map((key) => analyzeAbeCandidate(samples, key))
      .filter(Boolean)
      .sort((a, b) => b.confidence - a.confidence);
    return candidates[0] || null;
  }

  function abePreviewBreathAmp(elapsedSec, result) {
    const cycle = clamp(result?.cycleDuration || 5.8, 3.2, 8.2);
    const anchor = Number.isFinite(result?.anchorSec) ? result.anchorSec : 0;
    const local = ((elapsedSec - anchor) % cycle + cycle) % cycle;
    const phase = local / cycle;
    return 0.5 - (Math.cos(phase * Math.PI * 2) * 0.5);
  }

  function applyAbePreviewAudio(progress, elapsedSec, result) {
    if (!state.audio) return;
    const audio = state.audio;
    const now = audio.ctx.currentTime;
    const brownFade = smoothstep(clamp((progress - ABE_BROWN_START_PROGRESS) / (1 - ABE_BROWN_START_PROGRESS), 0, 1));
    const breathAmp = abePreviewBreathAmp(elapsedSec, result);
    const confidence = result?.confidence || 0;
    const listeningWeight = result && confidence >= ABE_USABLE_CONFIDENCE ? 1 : 0.62;
    const natureLevel = 0.012 + (progress * 0.004);
    const breathLevel = 0.022 * brownFade * (0.32 + (breathAmp * 0.68)) * listeningWeight;
    audio.natureFilter.frequency.setTargetAtTime(3600 + (progress * 2200), now, 0.5);
    const boostedNatureLevel = natureLevel * NATURE_SAMPLE_GAIN;
    audio.natureGain.gain.setTargetAtTime(boostedNatureLevel, now, 0.3);
    audio.breathGain.gain.setTargetAtTime(breathLevel, now, 0.08);
    audio.breathFilter.type = "lowpass";
    audio.breathFilter.frequency.setTargetAtTime(120 + (breathAmp * 420), now, 0.12);
    audio.breathFilter.Q.setTargetAtTime(0.68, now, 0.12);
    audio.breathPan.pan.setTargetAtTime(0, now, 0.16);
    audio.beatGain.gain.setTargetAtTime(0, now, 0.12);
    audio.harmonicVoices.forEach((voice) => voice.gain.gain.setTargetAtTime(0, now, 0.16));
    audio.harmonicDry.gain.setTargetAtTime(0, now, 0.16);
    audio.harmonicWet.gain.setTargetAtTime(0, now, 0.16);
    updateMeters({
      breath: brownFade * (0.35 + (breathAmp * 0.65)),
      beat: 0,
      harmonic: 0,
      space: clamp(boostedNatureLevel / 0.55, 0, 1)
    });
  }

  function applyAbePreparation(result) {
    const prep = abePrepValues(result);

    els.noiseColorSelect.value = "brown";
    els.breathLayerToggle.checked = true;
    els.natureLayerToggle.checked = true;
    els.guideLayerToggle.checked = true;
    els.guideTonalToggle.checked = false;
    els.beatLayerToggle.checked = false;
    els.harmonicLayerToggle.checked = true;
    els.breathVolumeInput.value = "1.28";
    els.guideVoiceVolumeInput.value = "0.42";
    els.natureVolumeInput.value = "0.2";
    els.harmonicVolumeInput.value = "1.15";
    els.harmonicSpaceInput.value = "2.8";
    els.movementInput.value = prep.usable ? String(clamp(0.14 + ((1 - result.confidence) * 0.14), 0.12, 0.3)) : "0.16";
    if (Number(els.durationInput.value) < 300) els.durationInput.value = "300";

    els.startInhaleInput.value = prep.startInhale.toFixed(1);
    els.startHoldInhaleInput.value = "0";
    els.startExhaleInput.value = prep.startExhale.toFixed(1);
    els.startHoldExhaleInput.value = "0";
    els.endInhaleInput.value = prep.endInhale.toFixed(1);
    els.endHoldInhaleInput.value = "0";
    els.endExhaleInput.value = prep.endExhale.toFixed(1);
    els.endHoldExhaleInput.value = "0";
    resetBreathCurvesFromControls();
    state.layerAutomation = {
      breath: [{ t: 0, v: 0.74 }, { t: 0.14, v: 1 }, { t: 0.72, v: 0.7 }, { t: 1, v: 0.34 }],
      guideVoice: [{ t: 0, v: 0.42 }, { t: 0.16, v: 0.32 }, { t: 0.38, v: 0.08 }, { t: 0.56, v: 0.34 }, { t: 0.72, v: 0.12 }, { t: 1, v: 0 }],
      guideTonal: [{ t: 0, v: 0 }, { t: 1, v: 0 }],
      interference: [{ t: 0, v: 0 }, { t: 1, v: 0 }],
      harmonic: [{ t: 0, v: 0.32 }, { t: 0.34, v: 0.58 }, { t: 1, v: 0.28 }],
      nature: [{ t: 0, v: 0.24 }, { t: 0.6, v: 0.2 }, { t: 1, v: 0.12 }]
    };
    if (state.audio) state.audio.setBreathNoiseColor("brown");
    renderControlReadouts();
    render(evaluateJourney(0), 0);
    setAbeValues(abeBreathLabel(prep.startInhale, prep.startExhale), abeBreathLabel(prep.endInhale, prep.endExhale));
    return prep;
  }

  function cancelAbeEntry() {
    cancelAnimationFrame(state.abe.rafId);
    stopAbeMotionCapture();
    state.abe.running = false;
    if (els.abePrepareBtn) {
      els.abePrepareBtn.disabled = false;
      els.abePrepareBtn.textContent = "Prepare & start";
    }
    syncEasyTransport();
  }

  async function finishAbeEntry(result) {
    cancelAbeEntry();
    state.abe.lastResult = result;
    const prep = applyAbePreparation(result);
    const status = prep.usable
      ? `Start values set from ${result.key}: ${abeBreathLabel(prep.startInhale, prep.startExhale)}. The journey now leads slower.`
      : `Signal stayed uncertain. Starting with default values: ${abeBreathLabel(prep.startInhale, prep.startExhale)}.`;
    setAbeStatus(status, prep.usable ? "matched" : "default");
    await startJourney({ reuseAudio: true });
  }

  function tickAbeEntry() {
    if (!state.abe.running) return;
    const elapsedSec = (performance.now() - state.abe.startedAt) / 1000;
    const progress = clamp(elapsedSec / ABE_DURATION_SEC, 0, 1);
    if (state.abe.samples.length > 100 && Math.round(elapsedSec * 5) % 3 === 0) {
      state.abe.lastResult = analyzeAbeSamples();
    }
    const result = state.abe.lastResult;
    const prep = abePrepValues(result);
    applyAbePreviewAudio(progress, elapsedSec, result);
    els.phaseLabel.textContent = progress < ABE_BROWN_START_PROGRESS ? "Settling" : "Listening";
    els.phaseTime.hidden = false;
    els.phaseTime.textContent = `${Math.ceil(Math.max(0, ABE_DURATION_SEC - elapsedSec))}s`;
    els.phaseDetail.textContent = progress < ABE_BROWN_START_PROGRESS
      ? "Keep the phone flat and breathe normally."
      : "Brown noise is meeting the last breath cycles.";
    const signal = result?.confidence >= ABE_USABLE_CONFIDENCE
      ? `${Math.round(result.confidence * 100)}%`
      : "gentle";
    setAbeValues(
      prep.hasCandidate ? abeBreathLabel(prep.startInhale, prep.startExhale) : "measuring",
      abeBreathLabel(prep.endInhale, prep.endExhale)
    );
    if (!state.abe.motionAllowed) {
      setAbeStatus("Motion access is unavailable or denied. ABE is preparing a default calm start.", "default");
    } else if (elapsedSec > 5 && state.abe.samples.length < 10) {
      setAbeStatus("Motion access is granted, but no movement samples are arriving yet. Keep the page open and phone still.", "waiting");
    } else if (progress < 0.22) {
      setAbeStatus("Place the phone flat on belly or chest. Let the speaker play quietly.", "place");
    } else if (progress < ABE_BROWN_START_PROGRESS) {
      setAbeStatus("Stay still enough for the phone to feel the breath. No special breathing yet.", signal);
    } else {
      setAbeStatus(
        result
          ? `Candidate: ${result.key} · ${result.breathsPerMinute.toFixed(1)} bpm · ${Math.round(result.confidence * 100)}%.`
          : "Brown noise is now following a calm default while ABE waits for a clearer signal.",
        signal
      );
    }
    if (elapsedSec >= ABE_DURATION_SEC) {
      finishAbeEntry(analyzeAbeSamples());
      return;
    }
    state.abe.rafId = requestAnimationFrame(tickAbeEntry);
  }

  async function startAbeEntry() {
    try {
      if (state.abe.running) return;
      stopJourney(true);
      els.abePrepareBtn.disabled = true;
      els.abePrepareBtn.textContent = "Preparing...";
      setAbeValues("measuring", "calm target");
      setAbeStatus("Asking the phone for motion access before audio starts.", "opening");
      els.noiseColorSelect.value = "brown";
      els.natureLayerToggle.checked = true;
      els.breathLayerToggle.checked = true;
      state.abe.lastResult = null;
      state.abe.motionAllowed = false;
      const motionAllowed = await requestAbeMotionAccess();
      state.abe.motionAllowed = motionAllowed;
      state.audio = makeAudioGraph();
      state.audio.setBreathNoiseColor("brown");
      await state.audio.ctx.resume();
      await state.audio.setNatureSource(els.natureSourceSelect.value);
      if (motionAllowed) startAbeMotionCapture();
      if (!motionAllowed) {
        setAbeStatus("Motion access was not granted. ABE will use the default calm start.", "default");
      }
      state.abe.running = true;
      state.abe.startedAt = performance.now();
      syncEasyTransport();
      const now = state.audio.ctx.currentTime;
      state.audio.master.gain.cancelScheduledValues(now);
      state.audio.master.gain.setValueAtTime(0, now);
      state.audio.master.gain.linearRampToValueAtTime(MASTER_PEAK * 0.62, now + 2.4);
      els.stopBtn.disabled = false;
      tickAbeEntry();
    } catch (error) {
      console.error(error);
      cancelAbeEntry();
      stopJourney(true);
      setAbeStatus(error?.message || "ABE could not start audio on this browser.", "blocked");
    }
  }

  async function startJourney(options = {}) {
    try {
      const reuseAudio = Boolean(options?.reuseAudio);
      els.playBtn.disabled = true;
      els.phaseLabel.textContent = "Starting";
      els.phaseDetail.textContent = "Opening the audio engine.";
      cancelAbeEntry();
      if (!reuseAudio) {
        stopJourney(true);
        state.audio = makeAudioGraph();
      } else if (!state.audio) {
        state.audio = makeAudioGraph();
      }
      await state.audio.ctx.resume();
      if (els.natureLayerToggle.checked) await state.audio.setNatureSource(els.natureSourceSelect.value);
      state.playing = true;
      state.holding = false;
      state.elapsedSec = 0;
      state.phase = "inhale";
      state.phaseElapsed = 0;
      state.phasePeakSeen = false;
      state.eventLog = [];
      state.lastEventAt = 0;
      state.guideRoundRobin = { in: 0, hold: 0, out: 0 };
      state.voiceReflection.afterReady = false;
      updateVoiceReflectionUI();
      state.startedAt = performance.now();
      if (els.guideLayerToggle.checked) await state.audio.ensureGuideBuffer();
      emitEvent("inhaleStart");
      const now = state.audio.ctx.currentTime;
      state.audio.master.gain.cancelScheduledValues(now);
      state.audio.master.gain.setValueAtTime(reuseAudio ? (state.audio.master.gain.value || (MASTER_PEAK * 0.62)) : 0, now);
      state.audio.master.gain.linearRampToValueAtTime(MASTER_PEAK, now + FADE_IN_SEC);
      els.playBtn.textContent = "Replay journey";
      els.holdBtn.disabled = false;
      els.stopBtn.disabled = false;
      syncEasyTransport();
      tick();
    } catch (error) {
      console.error(error);
      stopJourney(true);
      els.phaseLabel.textContent = "Audio blocked";
      els.phaseTime.textContent = "--";
      els.phaseDetail.textContent = error?.message || "The browser did not allow the audio engine to start.";
    } finally {
      els.playBtn.disabled = false;
    }
  }

  function stopJourney(immediate = false) {
    cancelAnimationFrame(state.rafId);
    cancelAbeEntry();
    if (!state.audio) {
      state.playing = false;
      state.holding = false;
      syncEasyTransport();
      return;
    }
    const audio = state.audio;
    const now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    if (immediate) {
      audio.master.gain.setValueAtTime(0, now);
      audio.stopSources();
      audio.ctx.close();
    } else {
      audio.master.gain.setValueAtTime(audio.master.gain.value, now);
      audio.master.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC);
      window.setTimeout(() => {
        audio.stopSources();
        audio.ctx.close();
      }, (FADE_OUT_SEC * 1000) + 80);
    }
    state.audio = null;
    state.playing = false;
    state.holding = false;
    els.holdBtn.disabled = true;
    els.stopBtn.disabled = true;
    els.holdBtn.textContent = "Hold";
    syncEasyTransport();
  }

  function toggleHold() {
    if (!state.playing) return;
    state.holding = !state.holding;
    els.holdBtn.textContent = state.holding ? "Resume" : "Hold";
    if (!state.holding) {
      state.startedAt = performance.now() - (state.elapsedSec * 1000);
      tick();
    }
  }

  function tick() {
    if (!state.playing) return;
    const nextElapsed = state.holding ? state.elapsedSec : (performance.now() - state.startedAt) / 1000;
    const dt = clamp(nextElapsed - state.elapsedSec, 0, 0.12);
    state.elapsedSec = nextElapsed;
    const duration = journeyDuration();
    const progress = clamp(state.elapsedSec / duration, 0, 1);
    const params = evaluateJourney(progress);
    advanceBreath(dt, params);
    applyAudio(params);
    render(params, progress);
    if (state.elapsedSec >= duration) {
      state.voiceReflection.afterReady = true;
      stopJourney();
      els.playBtn.textContent = "Replay journey";
      render(params, 1);
      setVoiceReflectionStatus("Record the after clip when you are ready.");
      updateVoiceReflectionUI();
      return;
    }
    state.rafId = requestAnimationFrame(tick);
  }

  function updateMeters(levels) {
    els.breathMeter.style.setProperty("--meter", `${Math.round(levels.breath * 100)}%`);
    els.beatMeter.style.setProperty("--meter", `${Math.round(levels.beat * 100)}%`);
    els.harmonicMeter.style.setProperty("--meter", `${Math.round(levels.harmonic * 100)}%`);
    els.spaceMeter.style.setProperty("--meter", `${Math.round(levels.space * 100)}%`);
  }

  function curveCanvasGeometry(canvas = els.breathCurveCanvas, aspectRatio = 2.24, minHeight = 160) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, rect.width);
    const height = Math.max(minHeight, rect.height || (width / aspectRatio));
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {
      canvas,
      ctx,
      width,
      height,
      margin: { left: 34, right: 12, top: 16, bottom: 26 }
    };
  }

  function curvePlotBounds(geometry) {
    const { width, height, margin } = geometry;
    return {
      x: margin.left,
      y: margin.top,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom
    };
  }

  function curveView() {
    if (!state.breathCurveView) {
      state.breathCurveView = { xStart: 0, xEnd: 1, yMaxSec: DEFAULT_BREATH_CURVE_Y_MAX_SEC };
    }
    const view = state.breathCurveView;
    view.xStart = clamp(Number(view.xStart) || 0, 0, 1 - MIN_BREATH_CURVE_X_WINDOW);
    view.xEnd = clamp(Number(view.xEnd) || 1, view.xStart + MIN_BREATH_CURVE_X_WINDOW, 1);
    view.yMaxSec = clamp(Number(view.yMaxSec) || DEFAULT_BREATH_CURVE_Y_MAX_SEC, MIN_BREATH_CURVE_Y_MAX_SEC, MAX_BREATH_CURVE_Y_MAX_SEC);
    return view;
  }

  function curvePointToCanvas(point, bounds) {
    const view = curveView();
    const xSpan = Math.max(MIN_BREATH_CURVE_X_WINDOW, view.xEnd - view.xStart);
    return {
      x: bounds.x + (((clamp(point.t, 0, 1) - view.xStart) / xSpan) * bounds.width),
      y: bounds.y + ((1 - (clamp(point.v, 0, MAX_BREATH_CURVE_Y_MAX_SEC) / view.yMaxSec)) * bounds.height)
    };
  }

  function canvasToCurvePoint(x, y, bounds) {
    const view = curveView();
    const xSpan = Math.max(MIN_BREATH_CURVE_X_WINDOW, view.xEnd - view.xStart);
    return {
      t: clamp(view.xStart + (((x - bounds.x) / bounds.width) * xSpan), 0, 1),
      v: clamp((1 - ((y - bounds.y) / bounds.height)) * view.yMaxSec, 0, MAX_BREATH_CURVE_Y_MAX_SEC)
    };
  }

  function automationPointToCanvas(point, bounds) {
    const view = curveView();
    const xSpan = Math.max(MIN_BREATH_CURVE_X_WINDOW, view.xEnd - view.xStart);
    return {
      x: bounds.x + (((clamp(point.t, 0, 1) - view.xStart) / xSpan) * bounds.width),
      y: bounds.y + ((1 - clamp(point.v, 0, 1)) * bounds.height)
    };
  }

  function canvasToAutomationPoint(x, y, bounds) {
    const view = curveView();
    const xSpan = Math.max(MIN_BREATH_CURVE_X_WINDOW, view.xEnd - view.xStart);
    return {
      t: clamp(view.xStart + (((x - bounds.x) / bounds.width) * xSpan), 0, 1),
      v: clamp(1 - ((y - bounds.y) / bounds.height), 0, 1)
    };
  }

  function renderBreathCurveToolbar() {
    if (!els.breathCurveToolbar) return;
    els.breathCurveToolbar.querySelectorAll("[data-curve-track]").forEach((button) => {
      const active = button.dataset.curveTrack === state.activeBreathCurve;
      button.classList.toggle("is-active", active);
      button.style.setProperty("--curve-color", breathTracks[button.dataset.curveTrack]?.color || "#9ad4c8");
    });
  }

  function renderLayerAutomationToolbar() {
    if (!els.layerAutomationToolbar) return;
    els.layerAutomationToolbar.querySelectorAll("[data-layer-track]").forEach((button) => {
      const active = button.dataset.layerTrack === state.activeLayerAutomation;
      button.classList.toggle("is-active", active);
      button.style.setProperty("--curve-color", layerAutomationTracks[button.dataset.layerTrack]?.color || "#9ad4c8");
    });
  }

  function renderBreathCurveEditor(progress = clamp(state.elapsedSec / Math.max(1, journeyDuration()), 0, 1)) {
    if (!els.breathCurveCanvas) return;
    const curves = ensureBreathCurves();
    const view = curveView();
    const geometry = curveCanvasGeometry();
    const bounds = curvePlotBounds(geometry);
    const { ctx, width, height } = geometry;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "rgba(8, 14, 14, 0.55)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(207, 234, 225, 0.13)";
    ctx.lineWidth = 1;
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = "rgba(174, 187, 183, 0.8)";
    const yStep = view.yMaxSec <= 20 ? 5 : view.yMaxSec <= 40 ? 10 : 15;
    const yMarks = [];
    for (let sec = 0; sec <= view.yMaxSec + 0.01; sec += yStep) yMarks.push(sec);
    if (Math.abs(yMarks[yMarks.length - 1] - view.yMaxSec) > 0.01) yMarks.push(view.yMaxSec);
    yMarks.forEach((sec) => {
      const y = bounds.y + ((1 - (sec / view.yMaxSec)) * bounds.height);
      ctx.beginPath();
      ctx.moveTo(bounds.x, y);
      ctx.lineTo(bounds.x + bounds.width, y);
      ctx.stroke();
      ctx.fillText(String(sec), 8, y + 4);
    });
    for (let i = 0; i <= 5; i += 1) {
      const x = bounds.x + ((i / 5) * bounds.width);
      const t = view.xStart + ((view.xEnd - view.xStart) * (i / 5));
      ctx.beginPath();
      ctx.moveTo(x, bounds.y);
      ctx.lineTo(x, bounds.y + bounds.height);
      ctx.stroke();
      ctx.fillText(formatClock(t * journeyDuration()), x - 13, bounds.y + bounds.height + 18);
    }

    ctx.save();
    ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.clip();
    Object.entries(breathTracks).forEach(([trackId, track]) => {
      const curve = curves[trackId];
      sortCurve(curve);
      ctx.globalAlpha = trackId === state.activeBreathCurve ? 1 : 0.48;
      ctx.strokeStyle = track.color;
      ctx.lineWidth = trackId === state.activeBreathCurve ? 3 : 2;
      ctx.beginPath();
      curve.forEach((point, index) => {
        const p = curvePointToCanvas(point, bounds);
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      curve.forEach((point) => {
        const p = curvePointToCanvas(point, bounds);
        ctx.beginPath();
        ctx.fillStyle = track.color;
        ctx.arc(p.x, p.y, trackId === state.activeBreathCurve ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();
      });
      if (trackId === state.activeBreathCurve && state.selectedBreathPoint?.trackId === trackId) {
        const point = curve[state.selectedBreathPoint.index];
        if (point) {
          const p = curvePointToCanvas(point, bounds);
          ctx.beginPath();
          ctx.strokeStyle = "#f2f6f2";
          ctx.lineWidth = 2;
          ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;

    const playheadX = bounds.x + (((clamp(progress, 0, 1) - view.xStart) / Math.max(MIN_BREATH_CURVE_X_WINDOW, view.xEnd - view.xStart)) * bounds.width);
    ctx.strokeStyle = "rgba(242, 246, 242, 0.82)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, bounds.y);
    ctx.lineTo(playheadX, bounds.y + bounds.height);
    ctx.stroke();
    ctx.restore();
    renderBreathCurveToolbar();
    updateCurvePointControls();
  }

  function renderLayerAutomationEditor(progress = clamp(state.elapsedSec / Math.max(1, journeyDuration()), 0, 1)) {
    if (!els.layerAutomationCanvas) return;
    const curves = ensureLayerAutomation();
    const view = curveView();
    const geometry = curveCanvasGeometry(els.layerAutomationCanvas, 3.45, 120);
    const bounds = curvePlotBounds(geometry);
    const { ctx, width, height } = geometry;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(8, 14, 14, 0.48)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(207, 234, 225, 0.13)";
    ctx.lineWidth = 1;
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = "rgba(174, 187, 183, 0.8)";
    [0, 0.25, 0.5, 0.75, 1].forEach((value) => {
      const y = bounds.y + ((1 - value) * bounds.height);
      ctx.beginPath();
      ctx.moveTo(bounds.x, y);
      ctx.lineTo(bounds.x + bounds.width, y);
      ctx.stroke();
      ctx.fillText(`${Math.round(value * 100)}`, 8, y + 4);
    });
    for (let i = 0; i <= 5; i += 1) {
      const x = bounds.x + ((i / 5) * bounds.width);
      const t = view.xStart + ((view.xEnd - view.xStart) * (i / 5));
      ctx.beginPath();
      ctx.moveTo(x, bounds.y);
      ctx.lineTo(x, bounds.y + bounds.height);
      ctx.stroke();
      ctx.fillText(formatClock(t * journeyDuration()), x - 13, bounds.y + bounds.height + 18);
    }

    ctx.save();
    ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.clip();
    Object.entries(layerAutomationTracks).forEach(([trackId, track]) => {
      const curve = curves[trackId];
      sortCurve(curve);
      ctx.globalAlpha = trackId === state.activeLayerAutomation ? 1 : 0.42;
      ctx.strokeStyle = track.color;
      ctx.lineWidth = trackId === state.activeLayerAutomation ? 3 : 2;
      ctx.beginPath();
      curve.forEach((point, index) => {
        const p = automationPointToCanvas(point, bounds);
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      curve.forEach((point) => {
        const p = automationPointToCanvas(point, bounds);
        ctx.beginPath();
        ctx.fillStyle = track.color;
        ctx.arc(p.x, p.y, trackId === state.activeLayerAutomation ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();
      });
      if (trackId === state.activeLayerAutomation && state.selectedAutomationPoint?.trackId === trackId) {
        const point = curve[state.selectedAutomationPoint.index];
        if (point) {
          const p = automationPointToCanvas(point, bounds);
          ctx.beginPath();
          ctx.strokeStyle = "#f2f6f2";
          ctx.lineWidth = 2;
          ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
    const playheadX = bounds.x + (((clamp(progress, 0, 1) - view.xStart) / Math.max(MIN_BREATH_CURVE_X_WINDOW, view.xEnd - view.xStart)) * bounds.width);
    ctx.strokeStyle = "rgba(242, 246, 242, 0.82)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, bounds.y);
    ctx.lineTo(playheadX, bounds.y + bounds.height);
    ctx.stroke();
    ctx.restore();
    renderLayerAutomationToolbar();
    updateCurvePointControls();
  }

  function findCurvePointAt(clientX, clientY) {
    const geometry = curveCanvasGeometry();
    const bounds = curvePlotBounds(geometry);
    const rect = geometry.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const curve = ensureBreathCurves()[state.activeBreathCurve];
    let nearest = null;
    curve.forEach((point, index) => {
      const p = curvePointToCanvas(point, bounds);
      const distance = Math.hypot(p.x - x, p.y - y);
      if (distance <= BREATH_CURVE_HIT_RADIUS && (!nearest || distance < nearest.distance)) {
        nearest = { point, index, distance };
      }
    });
    return { nearest, canvasPoint: canvasToCurvePoint(x, y, bounds), bounds };
  }

  function findAutomationPointAt(clientX, clientY) {
    const geometry = curveCanvasGeometry(els.layerAutomationCanvas, 3.45, 120);
    const bounds = curvePlotBounds(geometry);
    const rect = geometry.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const curve = ensureLayerAutomation()[state.activeLayerAutomation];
    let nearest = null;
    curve.forEach((point, index) => {
      const p = automationPointToCanvas(point, bounds);
      const distance = Math.hypot(p.x - x, p.y - y);
      if (distance <= CURVE_HIT_RADIUS && (!nearest || distance < nearest.distance)) {
        nearest = { point, index, distance };
      }
    });
    return { nearest, canvasPoint: canvasToAutomationPoint(x, y, bounds), bounds };
  }

  function constrainCurvePoint(trackId, index, point) {
    const curve = ensureBreathCurves()[trackId] || [];
    let minT = 0;
    let maxT = 1;
    if (Number.isInteger(index)) {
      minT = index > 0 ? curve[index - 1].t + 0.01 : 0;
      maxT = index < curve.length - 1 ? curve[index + 1].t - 0.01 : 1;
    }
    const endpointT = index === 0 ? 0 : index === curve.length - 1 ? 1 : null;
    return {
      t: endpointT === null ? clamp(point.t, minT, maxT) : endpointT,
      v: clamp(point.v, 0, MAX_BREATH_CURVE_Y_MAX_SEC)
    };
  }

  function updateBreathInputsFromCurveEndpoints() {
    const curves = ensureBreathCurves();
    Object.entries(breathEndpointInputs).forEach(([trackId, ids]) => {
      const curve = curves[trackId];
      if (!curve?.length) return;
      sortCurve(curve);
      const first = curve[0];
      const last = curve[curve.length - 1];
      if (els[ids.start]) els[ids.start].value = first.v.toFixed(1);
      if (els[ids.end]) els[ids.end].value = last.v.toFixed(1);
    });
  }

  function updateBreathCurveEndpointsFromInputs() {
    const curves = ensureBreathCurves();
    Object.entries(breathEndpointInputs).forEach(([trackId, ids]) => {
      const curve = curves[trackId];
      if (!curve?.length) return;
      sortCurve(curve);
      curve[0] = { ...curve[0], t: 0, v: clamp(inputValue(ids.start, curve[0].v), 0, MAX_BREATH_CURVE_Y_MAX_SEC) };
      curve[curve.length - 1] = {
        ...curve[curve.length - 1],
        t: 1,
        v: clamp(inputValue(ids.end, curve[curve.length - 1].v), 0, MAX_BREATH_CURVE_Y_MAX_SEC)
      };
      sortCurve(curve);
    });
  }

  function renderAfterCurveEdit(syncInputs = true) {
    if (syncInputs) updateBreathInputsFromCurveEndpoints();
    renderControlReadouts();
    const progress = state.playing ? state.elapsedSec / Math.max(1, journeyDuration()) : 0;
    render(evaluateJourney(progress), progress);
  }

  function curveEditT() {
    if (state.playing) return clamp(state.elapsedSec / Math.max(1, journeyDuration()), 0.02, 0.98);
    const view = curveView();
    return clamp((view.xStart + view.xEnd) / 2, 0.02, 0.98);
  }

  function updateCurvePointControls() {
    if (els.deleteBreathPointBtn) {
      const selected = state.selectedBreathPoint;
      const curve = selected?.trackId ? ensureBreathCurves()[selected.trackId] : null;
      els.deleteBreathPointBtn.disabled = !curve || selected.index <= 0 || selected.index >= curve.length - 1;
    }
    if (els.deleteAutomationPointBtn) {
      const selected = state.selectedAutomationPoint;
      const curve = selected?.trackId ? ensureLayerAutomation()[selected.trackId] : null;
      els.deleteAutomationPointBtn.disabled = !curve || selected.index <= 0 || selected.index >= curve.length - 1;
    }
  }

  function setCurvePoint(trackId, index, point) {
    const curve = ensureBreathCurves()[trackId];
    const previousT = index > 0 ? curve[index - 1].t + 0.01 : 0;
    const nextT = index < curve.length - 1 ? curve[index + 1].t - 0.01 : 1;
    curve[index] = {
      t: index === 0 ? 0 : index === curve.length - 1 ? 1 : clamp(point.t, previousT, nextT),
      v: clamp(point.v, 0, MAX_BREATH_CURVE_Y_MAX_SEC)
    };
    sortCurve(curve);
  }

  function addCurvePoint(trackId, point) {
    const curve = ensureBreathCurves()[trackId];
    const nextPoint = {
      t: clamp(point.t, 0, 1),
      v: clamp(point.v, 0, MAX_BREATH_CURVE_Y_MAX_SEC)
    };
    curve.push(nextPoint);
    sortCurve(curve);
    return curve.indexOf(nextPoint);
  }

  function removeCurvePoint(trackId, index) {
    const curve = ensureBreathCurves()[trackId];
    if (curve.length <= 2) return;
    if (index === 0 || index === curve.length - 1) return;
    curve.splice(index, 1);
  }

  function setAutomationPoint(trackId, index, point) {
    const curve = ensureLayerAutomation()[trackId];
    const previousT = index > 0 ? curve[index - 1].t + 0.01 : 0;
    const nextT = index < curve.length - 1 ? curve[index + 1].t - 0.01 : 1;
    curve[index] = {
      t: index === 0 ? 0 : index === curve.length - 1 ? 1 : clamp(point.t, previousT, nextT),
      v: clamp(point.v, 0, 1)
    };
    sortCurve(curve);
  }

  function addAutomationPoint(trackId, point) {
    const curve = ensureLayerAutomation()[trackId];
    const nextPoint = {
      t: clamp(point.t, 0, 1),
      v: clamp(point.v, 0, 1)
    };
    curve.push(nextPoint);
    sortCurve(curve);
    return curve.indexOf(nextPoint);
  }

  function removeAutomationPoint(trackId, index) {
    const curve = ensureLayerAutomation()[trackId];
    if (curve.length <= 2) return;
    if (index === 0 || index === curve.length - 1) return;
    curve.splice(index, 1);
  }

  function renderAfterAutomationEdit() {
    renderControlReadouts();
    const progress = state.playing ? state.elapsedSec / Math.max(1, journeyDuration()) : 0;
    render(evaluateJourney(progress), progress);
  }

  function addBreathPointFromControls() {
    const trackId = state.activeBreathCurve;
    const t = curveEditT();
    const curve = ensureBreathCurves()[trackId];
    const v = evaluateValueCurve(curve, t, breathTracks[trackId]?.fallback || 0);
    const index = addCurvePoint(trackId, { t, v });
    state.selectedBreathPoint = { trackId, index };
    renderAfterCurveEdit(true);
  }

  function deleteSelectedBreathPoint() {
    const selected = state.selectedBreathPoint;
    if (!selected) return;
    removeCurvePoint(selected.trackId, selected.index);
    state.selectedBreathPoint = null;
    renderAfterCurveEdit(true);
  }

  function addAutomationPointFromControls() {
    const trackId = state.activeLayerAutomation;
    const t = curveEditT();
    const curve = ensureLayerAutomation()[trackId];
    const v = evaluateValueCurve(curve, t, 1);
    const index = addAutomationPoint(trackId, { t, v });
    state.selectedAutomationPoint = { trackId, index };
    renderAfterAutomationEdit();
  }

  function deleteSelectedAutomationPoint() {
    const selected = state.selectedAutomationPoint;
    if (!selected) return;
    removeAutomationPoint(selected.trackId, selected.index);
    state.selectedAutomationPoint = null;
    renderAfterAutomationEdit();
  }

  function zoomBreathCurveTime(factor) {
    const view = curveView();
    const span = clamp((view.xEnd - view.xStart) * factor, MIN_BREATH_CURVE_X_WINDOW, 1);
    const progress = clamp(state.elapsedSec / Math.max(1, journeyDuration()), 0, 1);
    const center = clamp(state.playing ? progress : ((view.xStart + view.xEnd) / 2), span / 2, 1 - (span / 2));
    view.xStart = clamp(center - (span / 2), 0, 1 - span);
    view.xEnd = view.xStart + span;
    renderBreathCurveEditor();
    renderLayerAutomationEditor();
  }

  function zoomBreathCurveSeconds(factor) {
    const view = curveView();
    const raw = clamp(view.yMaxSec * factor, MIN_BREATH_CURVE_Y_MAX_SEC, MAX_BREATH_CURVE_Y_MAX_SEC);
    const rounded = clamp(Math.round(raw / 5) * 5, MIN_BREATH_CURVE_Y_MAX_SEC, MAX_BREATH_CURVE_Y_MAX_SEC);
    view.yMaxSec = rounded === view.yMaxSec ? clamp(view.yMaxSec + (factor > 1 ? 5 : -5), MIN_BREATH_CURVE_Y_MAX_SEC, MAX_BREATH_CURVE_Y_MAX_SEC) : rounded;
    renderBreathCurveEditor();
    renderLayerAutomationEditor();
  }

  function resetBreathCurveView() {
    state.breathCurveView = { xStart: 0, xEnd: 1, yMaxSec: DEFAULT_BREATH_CURVE_Y_MAX_SEC };
    renderBreathCurveEditor();
    renderLayerAutomationEditor();
  }

  function isBreathEndpointElement(input) {
    return Object.values(breathEndpointInputs).some((ids) => input === els[ids.start] || input === els[ids.end]);
  }

  function cloneCurveMap(map) {
    return Object.fromEntries(
      Object.entries(map || {}).map(([trackId, curve]) => [
        trackId,
        (curve || []).map((point) => ({ t: Number(point.t) || 0, v: Number(point.v) || 0 }))
      ])
    );
  }

  function builtInPresetLibrary() {
    const view = { xStart: 0, xEnd: 1, yMaxSec: 20 };
    return [
      {
        id: "builtin-vagal-reset",
        name: "Vagal Reset",
        savedAt: "builtin",
        journeyId: "settle-awake",
        fundamental: 48,
        duration: 360,
        relationship: "simple",
        movement: 0.28,
        noiseColor: "pink",
        toggles: {
          breath: true,
          guideVoice: true,
          guideTonal: true,
          interference: true,
          harmonic: true,
          nature: true
        },
        volumes: {
          breath: 1.8,
          guideVoice: 0.55,
          guideTonal: 1.35,
          interference: 3.2,
          harmonic: 2.15,
          harmonicSpace: 2.7,
          nature: 0.18
        },
        breathCurves: {
          inhale: [{ t: 0, v: 3.2 }, { t: 0.45, v: 4.2 }, { t: 1, v: 5 }],
          holdInhale: [{ t: 0, v: 0 }, { t: 0.55, v: 0.8 }, { t: 1, v: 1 }],
          exhale: [{ t: 0, v: 5.8 }, { t: 0.42, v: 7.2 }, { t: 1, v: 8.5 }],
          holdExhale: [{ t: 0, v: 0.5 }, { t: 0.5, v: 1.3 }, { t: 1, v: 1.7 }]
        },
        layerAutomation: {
          breath: [{ t: 0, v: 0.62 }, { t: 0.08, v: 1 }, { t: 0.7, v: 0.92 }, { t: 1, v: 0.58 }],
          guideVoice: [{ t: 0, v: 0.44 }, { t: 0.16, v: 0.42 }, { t: 0.3, v: 0.12 }, { t: 0.5, v: 0.36 }, { t: 0.68, v: 0.16 }, { t: 1, v: 0 }],
          guideTonal: [{ t: 0, v: 1 }, { t: 0.3, v: 0.92 }, { t: 0.8, v: 0.58 }, { t: 1, v: 0.34 }],
          interference: [{ t: 0, v: 0.9 }, { t: 0.22, v: 1 }, { t: 0.72, v: 0.45 }, { t: 1, v: 0.2 }],
          harmonic: [{ t: 0, v: 0.28 }, { t: 0.38, v: 0.72 }, { t: 0.78, v: 0.86 }, { t: 1, v: 0.48 }],
          nature: [{ t: 0, v: 0.24 }, { t: 0.6, v: 0.22 }, { t: 1, v: 0.16 }]
        },
        view
      },
      {
        id: "builtin-coherent-ease",
        name: "Coherent Ease",
        savedAt: "builtin",
        journeyId: "space-between",
        fundamental: 45,
        duration: 600,
        relationship: "harmonic",
        movement: 0.16,
        noiseColor: "green",
        toggles: {
          breath: true,
          guideVoice: true,
          guideTonal: true,
          interference: true,
          harmonic: true,
          nature: true
        },
        volumes: {
          breath: 1.45,
          guideVoice: 0.45,
          guideTonal: 0.95,
          interference: 2.4,
          harmonic: 1.8,
          harmonicSpace: 3.1,
          nature: 0.16
        },
        breathCurves: {
          inhale: [{ t: 0, v: 5 }, { t: 0.45, v: 5.2 }, { t: 1, v: 5.5 }],
          holdInhale: [{ t: 0, v: 0 }, { t: 0.65, v: 0.4 }, { t: 1, v: 0.6 }],
          exhale: [{ t: 0, v: 5 }, { t: 0.35, v: 5.8 }, { t: 1, v: 6.6 }],
          holdExhale: [{ t: 0, v: 0 }, { t: 0.65, v: 0.6 }, { t: 1, v: 1 }]
        },
        layerAutomation: {
          breath: [{ t: 0, v: 0.48 }, { t: 0.12, v: 0.82 }, { t: 0.88, v: 0.82 }, { t: 1, v: 0.38 }],
          guideVoice: [{ t: 0, v: 0.34 }, { t: 0.15, v: 0.26 }, { t: 0.42, v: 0.16 }, { t: 0.58, v: 0.25 }, { t: 0.78, v: 0.12 }, { t: 1, v: 0 }],
          guideTonal: [{ t: 0, v: 0.72 }, { t: 0.5, v: 0.55 }, { t: 1, v: 0.25 }],
          interference: [{ t: 0, v: 0.52 }, { t: 0.18, v: 0.75 }, { t: 0.82, v: 0.62 }, { t: 1, v: 0.22 }],
          harmonic: [{ t: 0, v: 0.34 }, { t: 0.5, v: 0.68 }, { t: 1, v: 0.4 }],
          nature: [{ t: 0, v: 0.22 }, { t: 0.64, v: 0.2 }, { t: 1, v: 0.16 }]
        },
        view
      },
      {
        id: "builtin-deep-ground",
        name: "Deep Ground",
        savedAt: "builtin",
        journeyId: "open-release",
        fundamental: 39,
        duration: 720,
        relationship: "phi",
        movement: 0.08,
        noiseColor: "brown",
        toggles: {
          breath: true,
          guideVoice: true,
          guideTonal: true,
          interference: true,
          harmonic: true,
          nature: true
        },
        volumes: {
          breath: 1.55,
          guideVoice: 0.42,
          guideTonal: 0.72,
          interference: 1.85,
          harmonic: 1.65,
          harmonicSpace: 3.6,
          nature: 0.15
        },
        breathCurves: {
          inhale: [{ t: 0, v: 3.5 }, { t: 0.4, v: 4.6 }, { t: 1, v: 6 }],
          holdInhale: [{ t: 0, v: 0 }, { t: 0.52, v: 1 }, { t: 1, v: 1.5 }],
          exhale: [{ t: 0, v: 7 }, { t: 0.45, v: 9.5 }, { t: 1, v: 12 }],
          holdExhale: [{ t: 0, v: 1 }, { t: 0.5, v: 2 }, { t: 1, v: 3 }]
        },
        layerAutomation: {
          breath: [{ t: 0, v: 0.58 }, { t: 0.16, v: 0.94 }, { t: 0.76, v: 0.72 }, { t: 1, v: 0.28 }],
          guideVoice: [{ t: 0, v: 0.3 }, { t: 0.16, v: 0.24 }, { t: 0.38, v: 0.12 }, { t: 0.54, v: 0.22 }, { t: 0.72, v: 0.1 }, { t: 1, v: 0 }],
          guideTonal: [{ t: 0, v: 0.62 }, { t: 0.35, v: 0.42 }, { t: 1, v: 0.12 }],
          interference: [{ t: 0, v: 0.42 }, { t: 0.3, v: 0.32 }, { t: 1, v: 0.08 }],
          harmonic: [{ t: 0, v: 0.42 }, { t: 0.42, v: 0.86 }, { t: 0.78, v: 0.72 }, { t: 1, v: 0.25 }],
          nature: [{ t: 0, v: 0.2 }, { t: 0.66, v: 0.16 }, { t: 1, v: 0.12 }]
        },
        view
      }
    ];
  }

  function ensureBuiltInPresets() {
    const presets = readPresets();
    const builtIns = builtInPresetLibrary();
    let changed = false;
    builtIns.forEach((builtIn) => {
      const index = presets.findIndex((preset) => preset.id === builtIn.id);
      if (index >= 0 && presets[index].savedAt === "builtin") {
        presets[index] = builtIn;
        changed = true;
      } else if (index < 0) {
        presets.unshift(builtIn);
        changed = true;
      }
    });
    if (changed) writePresets(presets);
  }

  function readPresets() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writePresets(presets) {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
  }

  function setPresetStatus(message) {
    if (els.presetStatus) els.presetStatus.textContent = message;
  }

  function presetById(id) {
    return readPresets().find((preset) => preset.id === id) || null;
  }

  function syncPresetSelectors(id) {
    const preset = presetById(id);
    if (els.presetSelect && preset) els.presetSelect.value = preset.id;
    if (els.easyPresetSelect && preset) els.easyPresetSelect.value = preset.id;
    if (els.presetNameInput && preset) els.presetNameInput.value = preset.name;
  }

  function applyPresetById(id) {
    const preset = presetById(id);
    if (!preset) return;
    syncPresetSelectors(preset.id);
    applyPreset(preset);
  }

  function readyPhaseDetail() {
    return state.appMode === "easy"
      ? EASY_READY_INSTRUCTION
      : "Choose a journey and press Play.";
  }

  function syncEasyTransport() {
    if (!els.easyStartBtn || !els.easyStopBtn) return;
    if (state.abe.running) {
      els.easyStartBtn.disabled = true;
      els.easyStartBtn.textContent = "Preparing...";
      els.easyStopBtn.disabled = false;
      return;
    }
    els.easyStartBtn.disabled = false;
    els.easyStartBtn.textContent = state.playing ? "Restart" : "Start";
    els.easyStopBtn.disabled = !state.playing && !state.audio;
  }

  function setAppMode(mode) {
    state.appMode = mode === "advanced" ? "advanced" : "easy";
    document.body.dataset.appMode = state.appMode;
    els.easyModeBtn?.classList.toggle("is-active", state.appMode === "easy");
    els.advancedModeBtn?.classList.toggle("is-active", state.appMode === "advanced");
    if (!state.playing && !state.abe.running && els.phaseDetail) {
      els.phaseDetail.textContent = readyPhaseDetail();
    }
    syncEasyTransport();
  }

  function voiceMimeType() {
    if (typeof window.MediaRecorder === "undefined") return "";
    const preferredTypes = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
    return preferredTypes.find((type) => window.MediaRecorder.isTypeSupported?.(type)) || "";
  }

  function voiceFileExtension(type = "") {
    if (type.includes("mp4")) return "m4a";
    if (type.includes("webm")) return "webm";
    return "audio";
  }

  function voiceSlotStatusEl(slot) {
    return slot === "before" ? els.beforeVoiceStatus : els.afterVoiceStatus;
  }

  function voiceSlotAudioEl(slot) {
    return slot === "before" ? els.beforeVoiceAudio : els.afterVoiceAudio;
  }

  function voiceSlotButtonEl(slot) {
    return slot === "before" ? els.recordBeforeVoiceBtn : els.recordAfterVoiceBtn;
  }

  function voiceSlotDownloadEl(slot) {
    return slot === "before" ? els.downloadBeforeVoiceBtn : els.downloadAfterVoiceBtn;
  }

  function voiceSlotPanelEl(slot) {
    return slot === "before" ? els.beforeVoiceSlot : els.afterVoiceSlot;
  }

  function setVoiceReflectionStatus(message) {
    if (els.voiceReflectionStatus) els.voiceReflectionStatus.textContent = message;
  }

  function voiceRecordingName(slot, recording) {
    const preset = presetById(els.easyPresetSelect?.value || els.presetSelect?.value);
    const presetName = (preset?.name || "breath-state").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const stamp = new Date(recording.createdAt || Date.now()).toISOString().replace(/[:.]/g, "-");
    return `${presetName}-${slot}-${stamp}.${voiceFileExtension(recording.type)}`;
  }

  function updateVoiceReflectionUI() {
    ["before", "after"].forEach((slot) => {
      const recording = state.voiceReflection[slot];
      const isRecording = state.voiceReflection.recordingSlot === slot;
      const panel = voiceSlotPanelEl(slot);
      const status = voiceSlotStatusEl(slot);
      const audio = voiceSlotAudioEl(slot);
      const button = voiceSlotButtonEl(slot);
      const download = voiceSlotDownloadEl(slot);
      panel?.classList.toggle("is-ready", Boolean(recording));
      panel?.classList.toggle("is-next", slot === "after" && state.voiceReflection.afterReady && !recording && !state.voiceReflection.recordingSlot);
      if (status && !isRecording) status.textContent = recording ? "Ready to play" : "Not recorded";
      if (audio) {
        audio.hidden = !recording;
        if (recording && audio.src !== recording.url) audio.src = recording.url;
      }
      if (button) {
        button.disabled = Boolean(state.voiceReflection.recordingSlot && !isRecording);
        button.textContent = isRecording ? "Stop" : `Record ${slot}`;
      }
      if (download) download.disabled = !recording || Boolean(state.voiceReflection.recordingSlot);
    });
    if (!state.voiceReflection.recordingSlot) {
      if (state.voiceReflection.before && state.voiceReflection.after) {
        setVoiceReflectionStatus("Before and after are ready.");
      } else if (state.voiceReflection.afterReady && !state.voiceReflection.after) {
        setVoiceReflectionStatus("Record the after clip when you are ready.");
      } else {
        setVoiceReflectionStatus("Optional before / after recording");
      }
    }
  }

  function cleanupVoiceRecorder() {
    clearTimeout(state.voiceReflection.timerId);
    clearInterval(state.voiceReflection.intervalId);
    state.voiceReflection.timerId = 0;
    state.voiceReflection.intervalId = 0;
    state.voiceReflection.stream?.getTracks().forEach((track) => track.stop());
    state.voiceReflection.stream = null;
    state.voiceReflection.recorder = null;
    state.voiceReflection.recordingSlot = null;
    state.voiceReflection.recordingStartedAt = 0;
  }

  function stopVoiceRecording() {
    const recorder = state.voiceReflection.recorder;
    if (!recorder) return;
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  async function startVoiceRecording(slot) {
    if (state.voiceReflection.recordingSlot === slot) {
      stopVoiceRecording();
      return;
    }
    if (state.voiceReflection.recordingSlot) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
      setVoiceReflectionStatus("Voice recording is not available in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      const mimeType = voiceMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      state.voiceReflection.stream = stream;
      state.voiceReflection.recorder = recorder;
      state.voiceReflection.chunks = [];
      state.voiceReflection.recordingSlot = slot;
      state.voiceReflection.recordingStartedAt = performance.now();
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) state.voiceReflection.chunks.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(state.voiceReflection.chunks, { type });
        const previous = state.voiceReflection[slot];
        if (previous?.url) URL.revokeObjectURL(previous.url);
        state.voiceReflection[slot] = {
          blob,
          type,
          url: URL.createObjectURL(blob),
          createdAt: Date.now()
        };
        cleanupVoiceRecorder();
        updateVoiceReflectionUI();
      }, { once: true });
      recorder.start();
      state.voiceReflection.timerId = window.setTimeout(stopVoiceRecording, VOICE_RECORDING_SEC * 1000);
      state.voiceReflection.intervalId = window.setInterval(() => {
        const elapsed = (performance.now() - state.voiceReflection.recordingStartedAt) / 1000;
        const remaining = Math.max(0, Math.ceil(VOICE_RECORDING_SEC - elapsed));
        voiceSlotStatusEl(slot).textContent = `Recording ${remaining}s`;
        setVoiceReflectionStatus(`Read once: ${VOICE_PROMPT_TEXT}`);
      }, 180);
      updateVoiceReflectionUI();
    } catch (error) {
      console.error(error);
      cleanupVoiceRecorder();
      setVoiceReflectionStatus(error?.message || "Microphone access was blocked.");
      updateVoiceReflectionUI();
    }
  }

  function downloadVoiceRecording(slot) {
    const recording = state.voiceReflection[slot];
    if (!recording) return;
    const link = document.createElement("a");
    link.href = recording.url;
    link.download = voiceRecordingName(slot, recording);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function currentPresetSnapshot(name) {
    ensureBreathCurves();
    ensureLayerAutomation();
    return {
      id: `preset-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      journeyId: els.journeySelect.value,
      fundamental: Number(els.fundamentalInput.value),
      duration: Number(els.durationInput.value),
      relationship: els.relationshipSelect.value,
      movement: Number(els.movementInput.value),
      noiseColor: els.noiseColorSelect.value,
      natureSource: els.natureSourceSelect.value,
      toggles: {
        breath: els.breathLayerToggle.checked,
        guideVoice: els.guideLayerToggle.checked,
        guideTonal: els.guideTonalToggle.checked,
        interference: els.beatLayerToggle.checked,
        harmonic: els.harmonicLayerToggle.checked,
        nature: els.natureLayerToggle.checked
      },
      volumes: {
        breath: Number(els.breathVolumeInput.value),
        guideVoice: Number(els.guideVoiceVolumeInput.value),
        guideTonal: Number(els.guideTonalVolumeInput.value),
        interference: Number(els.beatVolumeInput.value),
        harmonic: Number(els.harmonicVolumeInput.value),
        harmonicSpace: Number(els.harmonicSpaceInput.value),
        nature: Number(els.natureVolumeInput.value)
      },
      breathCurves: cloneCurveMap(state.breathCurves),
      layerAutomation: cloneCurveMap(state.layerAutomation),
      view: { ...curveView() }
    };
  }

  function renderPresetSelect() {
    const presets = readPresets();
    const options = presets.length
      ? presets.map((preset) => `<option value="${preset.id}">${preset.name}</option>`).join("")
      : "<option value=\"\">No presets saved</option>";
    if (els.presetSelect) els.presetSelect.innerHTML = options;
    if (els.easyPresetSelect) els.easyPresetSelect.innerHTML = options;
    if (els.loadPresetBtn) els.loadPresetBtn.disabled = presets.length === 0;
    if (els.deletePresetBtn) els.deletePresetBtn.disabled = presets.length === 0;
  }

  function savePreset() {
    const name = (els.presetNameInput.value || "").trim() || `Preset ${readPresets().length + 1}`;
    const presets = readPresets();
    const existingIndex = presets.findIndex((preset) => preset.name.toLowerCase() === name.toLowerCase());
    const snapshot = currentPresetSnapshot(name);
    if (existingIndex >= 0) {
      snapshot.id = presets[existingIndex].id;
      presets[existingIndex] = snapshot;
    } else {
      presets.push(snapshot);
    }
    writePresets(presets);
    renderPresetSelect();
    syncPresetSelectors(snapshot.id);
    setPresetStatus(`Saved "${name}".`);
  }

  function applyPreset(preset) {
    if (!preset) return;
    syncPresetSelectors(preset.id);
    if (preset.journeyId && [...els.journeySelect.options].some((option) => option.value === preset.journeyId)) {
      els.journeySelect.value = preset.journeyId;
    }
    if (Number.isFinite(preset.fundamental)) els.fundamentalInput.value = String(preset.fundamental);
    if (Number.isFinite(preset.duration)) els.durationInput.value = String(preset.duration);
    if (preset.relationship) els.relationshipSelect.value = preset.relationship;
    if (Number.isFinite(preset.movement)) els.movementInput.value = String(preset.movement);
    if (preset.noiseColor) els.noiseColorSelect.value = preset.noiseColor;
    if (preset.natureSource && natureSources[preset.natureSource]) els.natureSourceSelect.value = preset.natureSource;
    if (preset.toggles) {
      els.breathLayerToggle.checked = Boolean(preset.toggles.breath);
      els.guideLayerToggle.checked = Boolean(preset.toggles.guideVoice);
      els.guideTonalToggle.checked = Boolean(preset.toggles.guideTonal);
      els.beatLayerToggle.checked = Boolean(preset.toggles.interference);
      els.harmonicLayerToggle.checked = Boolean(preset.toggles.harmonic);
      els.natureLayerToggle.checked = Boolean(preset.toggles.nature);
    }
    if (preset.volumes) {
      if (Number.isFinite(preset.volumes.breath)) els.breathVolumeInput.value = String(preset.volumes.breath);
      if (Number.isFinite(preset.volumes.guideVoice)) els.guideVoiceVolumeInput.value = String(preset.volumes.guideVoice);
      if (Number.isFinite(preset.volumes.guideTonal)) els.guideTonalVolumeInput.value = String(preset.volumes.guideTonal);
      if (Number.isFinite(preset.volumes.interference)) els.beatVolumeInput.value = String(preset.volumes.interference);
      if (Number.isFinite(preset.volumes.harmonic)) els.harmonicVolumeInput.value = String(preset.volumes.harmonic);
      if (Number.isFinite(preset.volumes.harmonicSpace)) els.harmonicSpaceInput.value = String(preset.volumes.harmonicSpace);
      if (Number.isFinite(preset.volumes.nature)) els.natureVolumeInput.value = String(preset.volumes.nature);
    }
    state.breathCurves = cloneCurveMap(preset.breathCurves);
    state.layerAutomation = cloneCurveMap(preset.layerAutomation);
    state.breathCurveView = {
      xStart: Number(preset.view?.xStart) || 0,
      xEnd: Number(preset.view?.xEnd) || 1,
      yMaxSec: Number(preset.view?.yMaxSec) || DEFAULT_BREATH_CURVE_Y_MAX_SEC
    };
    updateBreathInputsFromCurveEndpoints();
    if (state.audio) state.audio.setBreathNoiseColor(els.noiseColorSelect.value);
    if (state.audio && els.natureLayerToggle.checked) {
      state.audio.setNatureSource(els.natureSourceSelect.value).catch((error) => console.warn(error));
    }
    renderControlReadouts();
    render(evaluateJourney(state.playing ? state.elapsedSec / Math.max(1, journeyDuration()) : 0), state.playing ? state.elapsedSec / Math.max(1, journeyDuration()) : 0);
    setPresetStatus(`Loaded "${preset.name}".`);
  }

  function loadSelectedPreset() {
    applyPresetById(els.presetSelect.value);
  }

  function deleteSelectedPreset() {
    const presets = readPresets();
    const preset = presets.find((item) => item.id === els.presetSelect.value);
    if (!preset) return;
    writePresets(presets.filter((item) => item.id !== preset.id));
    renderPresetSelect();
    setPresetStatus(`Deleted "${preset.name}".`);
  }

  function curveEndpoint(trackId, edge, fallback) {
    const curve = ensureBreathCurves()[trackId] || [];
    if (!curve.length) return fallback;
    sortCurve(curve);
    return edge === "end" ? curve[curve.length - 1].v : curve[0].v;
  }

  function render(params = evaluateJourney(0), progress = 0) {
    const phaseDurationSec = phaseDuration(params);
    const phaseProgress = clamp(state.phaseElapsed / Math.max(0.001, phaseDurationSec), 0, 1);
    let visualProgress = 0;
    let wallOpacity = 0;
    let holdWallOpacity = 0;
    let holdWallX = 0;
    if (state.phase === "inhale") {
      visualProgress = phaseProgress * 0.5;
      wallOpacity = smoothstep(phaseProgress);
    } else if (state.phase === "holdInhale") {
      visualProgress = 0.5;
      wallOpacity = 1;
      holdWallOpacity = state.playing ? 1 : 0;
      holdWallX = smoothstep(phaseProgress);
    } else if (state.phase === "exhale") {
      visualProgress = 0.5 + (phaseProgress * 0.5);
      wallOpacity = 1 - smoothstep(phaseProgress);
    } else {
      visualProgress = 1;
      wallOpacity = 0;
      holdWallOpacity = state.playing ? 0.72 : 0;
      holdWallX = 1 - smoothstep(phaseProgress);
    }
    if (!state.playing) {
      visualProgress = 0;
      wallOpacity = 0;
      holdWallOpacity = 0;
    }
    const phaseScale = (state.phase === "inhale" || state.phase === "holdInhale")
      ? (state.phase === "holdInhale" ? 1 : lerp(0.74, 1, smoothstep(phaseProgress)))
      : lerp(1, 0.74, smoothstep(state.phase === "exhale" ? phaseProgress : 1));

    els.ambientField.style.setProperty("--state-color", params.color);
    els.breathOrb.style.setProperty("--breath-fill", `${visualProgress * 100}%`);
    els.breathOrb.style.setProperty("--wall-x", `${visualProgress * 100}%`);
    els.breathOrb.style.setProperty("--wall-opacity", String(clamp(wallOpacity, 0, 1)));
    els.breathOrb.style.setProperty("--phase-scale", String(phaseScale));
    els.holdWall.style.setProperty("--hold-wall-x", `${holdWallX * 100}%`);
    els.holdWall.style.setProperty("--hold-wall-opacity", String(clamp(holdWallOpacity, 0, 1)));
    els.phaseLabel.textContent = state.playing ? phaseLabel() : "Ready";
    els.phaseTime.textContent = "";
    els.phaseDetail.textContent = state.playing
      ? "Stay with the breath."
      : readyPhaseDetail();
    els.journeyProgressFill.style.setProperty("--journey-progress", `${clamp(progress, 0, 1) * 100}%`);
    els.nextPhaseReadout.textContent = `Next: ${phaseLabel(nextPlayablePhase(state.phase, params)).toLowerCase()}`;
    els.currentState.textContent = params.activeState.name;
    els.currentStateDetail.textContent = `intensity ${Math.round(params.intensity * 100)} · silence ${Math.round(params.silence * 100)}`;
    els.breathReadout.textContent = `${params.inhaleSec.toFixed(1)} in · ${params.holdInhaleSec.toFixed(1)} hold · ${params.exhaleSec.toFixed(1)} out · ${params.holdExhaleSec.toFixed(1)} hold`;
    els.cycleReadout.textContent = state.playing ? phaseLabel() : "inhale -> hold -> exhale -> hold";
    els.soundReadout.textContent = state.playing ? (params.silence > 0.38 ? "space" : "presence") : "silent";
    const guideLabels = [
      els.guideLayerToggle.checked ? "voice" : "",
      els.guideTonalToggle.checked ? "tonal" : ""
    ].filter(Boolean).join("+");
    const natureLabel = els.natureLayerToggle.checked ? ` · nature ${selectedNatureSource().label}` : "";
    els.soundDetail.textContent = `${selectedNoiseProfile().label}${natureLabel} · ${guideLabels ? `guide ${guideLabels} · ` : ""}${relationshipSets[els.relationshipSelect.value].label} · tune ${selectedFundamental().toFixed(2)} Hz`;
    renderStates(params.activeState.name);
    renderEventLog();
    renderBreathCurveEditor(progress);
    renderLayerAutomationEditor(progress);
    syncEasyTransport();
  }

  function renderStates(activeName = "") {
    const journey = selectedJourney();
    els.stateRow.innerHTML = journey.states.map((item) => {
      const breath = breathValues(item);
      return `
        <article class="state-pill ${item.name === activeName ? "is-active" : ""}" style="--state-color: ${item.color}">
          <strong>${item.name}</strong>
          <span>${breath[0]} in / ${breath[1]} hold / ${breath[2]} out / ${breath[3]} hold · ${Math.round(item.intensity * 100)} intensity</span>
        </article>
      `;
    }).join("");
  }

  function renderEventLog() {
    els.eventLog.innerHTML = state.eventLog.map((event) => `
      <li><strong>${formatClock(event.at)}</strong> ${event.name}</li>
    `).join("");
  }

  function syncControlsFromJourney() {
    const journey = selectedJourney();
    els.durationInput.value = String(journey.durationSec);
    const first = breathValues(journey.states[0]);
    const last = breathValues(journey.states[journey.states.length - 1]);
    els.startInhaleInput.value = String(first[0]);
    els.startHoldInhaleInput.value = String(first[1]);
    els.startExhaleInput.value = String(first[2]);
    els.startHoldExhaleInput.value = String(first[3]);
    els.endInhaleInput.value = String(last[0]);
    els.endHoldInhaleInput.value = String(last[1]);
    els.endExhaleInput.value = String(last[2]);
    els.endHoldExhaleInput.value = String(last[3]);
    resetBreathCurvesFromControls();
    renderControlReadouts();
    render(evaluateJourney(0), 0);
  }

  function renderControlReadouts() {
    els.fundamentalValue.textContent = `${selectedFundamental().toFixed(2)} Hz`;
    els.durationValue.textContent = formatClock(journeyDuration());
    els.movementValue.textContent = `${Number(els.movementInput.value) < 0.5 ? "Still" : "Active"} ${Math.round(Number(els.movementInput.value) * 100)}%`;
    els.startBreathText.textContent = `${curveEndpoint("inhale", "start", 3).toFixed(1)} / ${curveEndpoint("holdInhale", "start", 0).toFixed(1)} / ${curveEndpoint("exhale", "start", 6).toFixed(1)} / ${curveEndpoint("holdExhale", "start", 0).toFixed(1)}`;
    els.endBreathText.textContent = `${curveEndpoint("inhale", "end", 7).toFixed(1)} / ${curveEndpoint("holdInhale", "end", 0).toFixed(1)} / ${curveEndpoint("exhale", "end", 12).toFixed(1)} / ${curveEndpoint("holdExhale", "end", 0).toFixed(1)}`;
    els.breathVolumeValue.textContent = `${Math.round(controlValue("breathVolumeInput", 1.65) * 100)}%`;
    els.guideVoiceVolumeValue.textContent = `${Math.round(controlValue("guideVoiceVolumeInput", 1.15) * 100)}%`;
    els.guideTonalVolumeValue.textContent = `${Math.round(controlValue("guideTonalVolumeInput", 1.2) * 100)}%`;
    els.beatVolumeValue.textContent = `${Math.round(controlValue("beatVolumeInput", 2.2) * 100)}%`;
    els.harmonicVolumeValue.textContent = `${Math.round(controlValue("harmonicVolumeInput", 2.4) * 100)}%`;
    els.harmonicSpaceValue.textContent = `${Math.round(controlValue("harmonicSpaceInput", 2.2) * 100)}%`;
    els.natureVolumeValue.textContent = `${Math.round(controlValue("natureVolumeInput", 1.6) * 100)}%`;
  }

  function bind() {
    [
      "easyModeBtn",
      "advancedModeBtn",
      "easyPanel",
      "easyPresetSelect",
      "easyStartBtn",
      "easyStopBtn",
      "voiceReflectionPanel",
      "voiceReflectionStatus",
      "beforeVoiceSlot",
      "beforeVoiceStatus",
      "beforeVoiceAudio",
      "recordBeforeVoiceBtn",
      "downloadBeforeVoiceBtn",
      "afterVoiceSlot",
      "afterVoiceStatus",
      "afterVoiceAudio",
      "recordAfterVoiceBtn",
      "downloadAfterVoiceBtn",
      "journeySelect",
      "presetNameInput",
      "presetSelect",
      "savePresetBtn",
      "loadPresetBtn",
      "deletePresetBtn",
      "presetStatus",
      "abePrepareBtn",
      "abeStatus",
      "abeSignalText",
      "abeStartValue",
      "abeTargetValue",
      "fundamentalInput",
      "fundamentalValue",
      "durationInput",
      "durationValue",
      "startInhaleInput",
      "startHoldInhaleInput",
      "startExhaleInput",
      "startHoldExhaleInput",
      "endInhaleInput",
      "endHoldInhaleInput",
      "endExhaleInput",
      "endHoldExhaleInput",
      "startBreathText",
      "endBreathText",
      "advancedToggle",
      "advancedPanel",
      "resetBreathCurvesBtn",
      "breathCurveToolbar",
      "breathCurveCanvas",
      "addBreathPointBtn",
      "deleteBreathPointBtn",
      "resetLayerAutomationBtn",
      "layerAutomationToolbar",
      "layerAutomationCanvas",
      "addAutomationPointBtn",
      "deleteAutomationPointBtn",
      "breathCurveHint",
      "curveTimeZoomOutBtn",
      "curveTimeZoomInBtn",
      "curveSecondsZoomOutBtn",
      "curveSecondsZoomInBtn",
      "curveZoomResetBtn",
      "breathLayerToggle",
      "noiseColorSelect",
      "breathVolumeInput",
      "breathVolumeValue",
      "guideLayerToggle",
      "guideVoiceVolumeInput",
      "guideVoiceVolumeValue",
      "guideTonalToggle",
      "guideTonalVolumeInput",
      "guideTonalVolumeValue",
      "beatLayerToggle",
      "beatVolumeInput",
      "beatVolumeValue",
      "harmonicLayerToggle",
      "harmonicVolumeInput",
      "harmonicVolumeValue",
      "harmonicSpaceInput",
      "harmonicSpaceValue",
      "natureLayerToggle",
      "natureSourceSelect",
      "natureVolumeInput",
      "natureVolumeValue",
      "relationshipSelect",
      "movementInput",
      "movementValue",
      "playBtn",
      "holdBtn",
      "stopBtn",
      "ambientField",
      "breathOrb",
      "breathClock",
      "phaseDot",
      "holdWall",
      "phaseLabel",
      "phaseTime",
      "phaseDetail",
      "stateRow",
      "currentState",
      "currentStateDetail",
      "breathReadout",
      "cycleReadout",
      "soundReadout",
      "soundDetail",
      "breathMeter",
      "beatMeter",
      "harmonicMeter",
      "spaceMeter",
      "eventLog",
      "journeyProgressCylinder",
      "journeyProgressFill",
      "nextPhaseReadout"
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });

    els.journeySelect.innerHTML = journeys.map((journey) => `<option value="${journey.id}">${journey.name}</option>`).join("");
    ensureBuiltInPresets();
    renderPresetSelect();
    els.savePresetBtn.addEventListener("click", savePreset);
    els.loadPresetBtn.addEventListener("click", loadSelectedPreset);
    els.deletePresetBtn.addEventListener("click", deleteSelectedPreset);
    els.abePrepareBtn.addEventListener("click", startAbeEntry);
    els.presetSelect.addEventListener("change", () => {
      syncPresetSelectors(els.presetSelect.value);
    });
    els.easyPresetSelect.addEventListener("change", () => applyPresetById(els.easyPresetSelect.value));
    els.easyModeBtn.addEventListener("click", () => setAppMode("easy"));
    els.advancedModeBtn.addEventListener("click", () => setAppMode("advanced"));
    els.recordBeforeVoiceBtn.addEventListener("click", () => startVoiceRecording("before"));
    els.recordAfterVoiceBtn.addEventListener("click", () => startVoiceRecording("after"));
    els.downloadBeforeVoiceBtn.addEventListener("click", () => downloadVoiceRecording("before"));
    els.downloadAfterVoiceBtn.addEventListener("click", () => downloadVoiceRecording("after"));
    els.journeySelect.addEventListener("change", syncControlsFromJourney);
    els.advancedToggle.addEventListener("click", () => {
      els.advancedPanel.hidden = !els.advancedPanel.hidden;
    });
    els.resetBreathCurvesBtn.addEventListener("click", () => {
      resetBreathCurvesFromControls();
      state.selectedBreathPoint = null;
      render(evaluateJourney(state.playing ? state.elapsedSec / Math.max(1, journeyDuration()) : 0), state.playing ? state.elapsedSec / Math.max(1, journeyDuration()) : 0);
    });
    els.breathCurveToolbar.querySelectorAll("[data-curve-track]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeBreathCurve = button.dataset.curveTrack;
        state.selectedBreathPoint = null;
        renderBreathCurveEditor();
      });
    });
    els.layerAutomationToolbar.querySelectorAll("[data-layer-track]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeLayerAutomation = button.dataset.layerTrack;
        state.selectedAutomationPoint = null;
        renderLayerAutomationEditor();
      });
    });
    els.resetLayerAutomationBtn.addEventListener("click", () => {
      resetLayerAutomation();
      state.selectedAutomationPoint = null;
      renderAfterAutomationEdit();
    });
    els.addBreathPointBtn.addEventListener("click", addBreathPointFromControls);
    els.deleteBreathPointBtn.addEventListener("click", deleteSelectedBreathPoint);
    els.addAutomationPointBtn.addEventListener("click", addAutomationPointFromControls);
    els.deleteAutomationPointBtn.addEventListener("click", deleteSelectedAutomationPoint);
    els.breathCurveCanvas.addEventListener("pointerdown", (event) => {
      const hit = findCurvePointAt(event.clientX, event.clientY);
      if (!hit.nearest) return;
      state.selectedBreathPoint = {
        trackId: state.activeBreathCurve,
        index: hit.nearest.index
      };
      state.curveDrag = {
        editor: "breath",
        trackId: state.activeBreathCurve,
        index: hit.nearest.index
      };
      els.breathCurveCanvas.setPointerCapture(event.pointerId);
    });
    els.breathCurveCanvas.addEventListener("pointermove", (event) => {
      if (!state.curveDrag || state.curveDrag.editor !== "breath") return;
      const hit = findCurvePointAt(event.clientX, event.clientY);
      setCurvePoint(state.curveDrag.trackId, state.curveDrag.index, hit.canvasPoint);
      state.selectedBreathPoint = {
        trackId: state.curveDrag.trackId,
        index: state.curveDrag.index
      };
      renderAfterCurveEdit(true);
    });
    els.breathCurveCanvas.addEventListener("pointerup", (event) => {
      state.curveDrag = null;
      try {
        els.breathCurveCanvas.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    });
    els.breathCurveCanvas.addEventListener("dblclick", (event) => {
      const hit = findCurvePointAt(event.clientX, event.clientY);
      if (hit.nearest && hit.nearest.index > 0 && hit.nearest.index < ensureBreathCurves()[state.activeBreathCurve].length - 1) {
        removeCurvePoint(state.activeBreathCurve, hit.nearest.index);
        state.selectedBreathPoint = null;
      } else if (!hit.nearest) {
        const index = addCurvePoint(state.activeBreathCurve, hit.canvasPoint);
        state.selectedBreathPoint = { trackId: state.activeBreathCurve, index };
      }
      renderAfterCurveEdit(true);
    });
    els.layerAutomationCanvas.addEventListener("pointerdown", (event) => {
      const hit = findAutomationPointAt(event.clientX, event.clientY);
      if (!hit.nearest) return;
      state.selectedAutomationPoint = {
        trackId: state.activeLayerAutomation,
        index: hit.nearest.index
      };
      state.curveDrag = {
        editor: "automation",
        trackId: state.activeLayerAutomation,
        index: hit.nearest.index
      };
      els.layerAutomationCanvas.setPointerCapture(event.pointerId);
    });
    els.layerAutomationCanvas.addEventListener("pointermove", (event) => {
      if (!state.curveDrag || state.curveDrag.editor !== "automation") return;
      const hit = findAutomationPointAt(event.clientX, event.clientY);
      setAutomationPoint(state.curveDrag.trackId, state.curveDrag.index, hit.canvasPoint);
      state.selectedAutomationPoint = {
        trackId: state.curveDrag.trackId,
        index: state.curveDrag.index
      };
      renderAfterAutomationEdit();
    });
    els.layerAutomationCanvas.addEventListener("pointerup", (event) => {
      state.curveDrag = null;
      try {
        els.layerAutomationCanvas.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    });
    els.layerAutomationCanvas.addEventListener("dblclick", (event) => {
      const hit = findAutomationPointAt(event.clientX, event.clientY);
      if (hit.nearest && hit.nearest.index > 0 && hit.nearest.index < ensureLayerAutomation()[state.activeLayerAutomation].length - 1) {
        removeAutomationPoint(state.activeLayerAutomation, hit.nearest.index);
        state.selectedAutomationPoint = null;
      } else if (!hit.nearest) {
        const index = addAutomationPoint(state.activeLayerAutomation, hit.canvasPoint);
        state.selectedAutomationPoint = { trackId: state.activeLayerAutomation, index };
      }
      renderAfterAutomationEdit();
    });
    els.curveTimeZoomOutBtn.addEventListener("click", () => zoomBreathCurveTime(1.25));
    els.curveTimeZoomInBtn.addEventListener("click", () => zoomBreathCurveTime(0.8));
    els.curveSecondsZoomOutBtn.addEventListener("click", () => zoomBreathCurveSeconds(1.25));
    els.curveSecondsZoomInBtn.addEventListener("click", () => zoomBreathCurveSeconds(0.8));
    els.curveZoomResetBtn.addEventListener("click", resetBreathCurveView);
    window.addEventListener("resize", () => {
      renderBreathCurveEditor();
      renderLayerAutomationEditor();
    });
    [
      els.fundamentalInput,
      els.durationInput,
      els.startInhaleInput,
      els.startHoldInhaleInput,
      els.startExhaleInput,
      els.startHoldExhaleInput,
      els.endInhaleInput,
      els.endHoldInhaleInput,
      els.endExhaleInput,
      els.endHoldExhaleInput,
      els.relationshipSelect,
      els.movementInput,
      els.breathLayerToggle,
      els.noiseColorSelect,
      els.breathVolumeInput,
      els.guideLayerToggle,
      els.guideVoiceVolumeInput,
      els.guideTonalToggle,
      els.guideTonalVolumeInput,
      els.beatLayerToggle,
      els.beatVolumeInput,
      els.harmonicLayerToggle,
      els.harmonicVolumeInput,
      els.harmonicSpaceInput,
      els.natureLayerToggle,
      els.natureSourceSelect,
      els.natureVolumeInput
    ].forEach((input) => {
      input.addEventListener("input", () => {
        if (isBreathEndpointElement(input)) {
          updateBreathCurveEndpointsFromInputs();
        }
        renderControlReadouts();
        if (input === els.noiseColorSelect && state.audio) {
          state.audio.setBreathNoiseColor(els.noiseColorSelect.value);
        }
        if (input === els.natureSourceSelect && state.audio) {
          state.audio.setNatureSource(els.natureSourceSelect.value).catch((error) => console.warn(error));
        }
        if (input === els.natureLayerToggle && input.checked && state.audio) {
          state.audio.setNatureSource(els.natureSourceSelect.value).catch((error) => console.warn(error));
        }
        if (!state.playing) renderBreathCurveEditor();
        if (!state.playing) render(evaluateJourney(0), 0);
      });
    });
    els.playBtn.addEventListener("click", startJourney);
    els.easyStartBtn.addEventListener("click", () => {
      if (state.playing || state.abe.running) stopJourney(true);
      startAbeEntry();
    });
    els.easyStopBtn.addEventListener("click", () => {
      stopJourney();
      render(evaluateJourney(0), 0);
    });
    els.holdBtn.addEventListener("click", toggleHold);
    els.stopBtn.addEventListener("click", () => stopJourney());
    window.addEventListener("beforeunload", () => stopJourney(true));
    syncControlsFromJourney();
    applyPresetById(EASY_DEFAULT_PRESET_ID);
    setAppMode("easy");
    updateVoiceReflectionUI();
  }

  bind();
})();
