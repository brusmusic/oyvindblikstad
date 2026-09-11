(() => {
  "use strict";

  const data = window.RESONANCE_ATLAS_3D_DATA;
  const library = window.TUNER_ATLAS_JOURNEY_LIBRARY || {};
  const playerApi = window.TunerAtlasPlayer;
  const PERSONAL_TUNE_MIN_HZ = 36;
  const PERSONAL_TUNE_MAX_HZ = 70;
  const YOU_SWEEP_MIN_HZ = 39;
  const YOU_SWEEP_MAX_HZ = 62;
  const YOU_SWEEP_DEFAULT_HZ = 39;
  const YOU_SWEEP_CYCLE_SEC = 20;
  const YOU_JOURNEY_MASTER_GAIN = 0.2;
  const YOU_START_FADE_SECONDS = 2;
  const YOU_MANUAL_END_FADE_SECONDS = 2;
  const YOU_NATURAL_END_FADE_SECONDS = 2;
  const GLOBAL_TUNE_RAMP_SECONDS = 2;
  const FLOWER_MODE = data.layoutMode === "flower";
  const STATIC_FLOWER_MODE = FLOWER_MODE;
  const GLOBAL_TUNE_SETTINGS_KEY = "resonance-atlas.global-tune.v1";
  const flowerExtents = data.rooms.reduce((bounds, room) => ({
    left: Math.max(bounds.left, Math.abs(room.position[0]) + room.radius),
    top: Math.max(bounds.top, Math.abs(Math.min(0, room.position[1])) + room.radius),
    bottom: Math.max(bounds.bottom, Math.max(0, room.position[1]) + room.radius)
  }), { left: 0, top: 0, bottom: 0 });

  const stage = document.getElementById("atlasStage");
  const layer = document.getElementById("roomLayer");
  const networkLines = document.getElementById("networkLines");
  const doNotDisturbReminder = document.getElementById("doNotDisturbReminder");
  const status = document.getElementById("journeyStatus");
  const journeyRoom = document.getElementById("journeyRoom");
  const journeyTitle = document.getElementById("journeyTitle");
  const journeyText = document.getElementById("journeyText");
  const journeyProgress = document.getElementById("journeyProgress");
  const pauseBtn = document.getElementById("pauseBtn");
  const endBtn = document.getElementById("endBtn");
  const hint = document.getElementById("stageHint");
  const adminGlobalTuneWrap = document.getElementById("adminGlobalTuneWrap");
  const adminGlobalTuneToggle = document.getElementById("adminGlobalTuneToggle");
  const adminGlobalTuneRange = document.getElementById("adminGlobalTuneRange");

  const state = {
    yaw: -0.28,
    pitch: 0.14,
    targetYaw: -0.28,
    targetPitch: 0.14,
    dragging: false,
    dragStart: null,
    orienting: null,
    selectedId: null,
    hoveredId: null,
    playingId: null,
    wakeLock: {
      sentinel: null,
      wanted: false
    },
    youTuner: {
      phase: "idle",
      selectedFrequency: YOU_SWEEP_DEFAULT_HZ,
      fineTuneBase: YOU_SWEEP_DEFAULT_HZ,
      sweepStartedAt: 0,
      sweepElapsedSec: 0,
      sweepDirection: 1,
      audio: null
    },
    activeGlobalTune: null,
    player: null
  };

  const roomEls = new Map();
  const projectedRooms = new Map();
  let resizeRenderTimer = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value, decimals = 2) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readStoredYouTune() {
    try {
      const saved = JSON.parse(window.localStorage.getItem("wavewest.session.v1") || "{}");
      const hz = Number(saved.resonanceHz) + Number(saved.fineTuneHz || 0);
      if (Number.isFinite(hz)) return round(clamp(hz, YOU_SWEEP_MIN_HZ, YOU_SWEEP_MAX_HZ), 2);
    } catch {
      // Ignore stale or partial session data.
    }
    return state.youTuner.selectedFrequency;
  }

  function rememberYouTune(frequency) {
    const hz = round(clamp(frequency, YOU_SWEEP_MIN_HZ, YOU_SWEEP_MAX_HZ), 2);
    try {
      const existing = JSON.parse(window.localStorage.getItem("wavewest.session.v1") || "{}");
      window.localStorage.setItem("wavewest.session.v1", JSON.stringify({
        ...existing,
        resonanceHz: hz,
        fineTuneHz: 0,
        source: "atlas-1.31-you",
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // Local storage may be unavailable in private or restricted contexts.
    }
    return hz;
  }

  function readStoredGlobalTune() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(GLOBAL_TUNE_SETTINGS_KEY) || "null");
      if (!saved) return { enabled: true, targetHz: readStoredYouTune(), hasSavedSettings: false };
      const savedHz = Number(saved.targetHz);
      return {
        enabled: saved.enabled !== false,
        targetHz: Number.isFinite(savedHz)
          ? round(clamp(savedHz, YOU_SWEEP_MIN_HZ, YOU_SWEEP_MAX_HZ), 2)
          : readStoredYouTune(),
        hasSavedSettings: true
      };
    } catch {
      return { enabled: true, targetHz: readStoredYouTune(), hasSavedSettings: false };
    }
  }

  function writeGlobalTuneSettings() {
    if (!adminGlobalTuneToggle || !adminGlobalTuneRange) return;
    try {
      window.localStorage.setItem(GLOBAL_TUNE_SETTINGS_KEY, JSON.stringify({
        enabled: adminGlobalTuneToggle.checked,
        targetHz: round(Number(adminGlobalTuneRange.value), 2),
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // Local storage may be unavailable in private or restricted contexts.
    }
  }

  function updateGlobalTuneColor() {
    if (!adminGlobalTuneRange) return;
    adminGlobalTuneRange.style.setProperty("--global-tune-color", spectrumColorForFrequency(Number(adminGlobalTuneRange.value)));
  }

  function setupGlobalTune() {
    if (!adminGlobalTuneWrap) return;
    const stored = readStoredGlobalTune();
    if (adminGlobalTuneToggle) adminGlobalTuneToggle.checked = stored.enabled;
    if (adminGlobalTuneRange) adminGlobalTuneRange.value = String(stored.targetHz);
    updateGlobalTuneColor();
    adminGlobalTuneToggle?.addEventListener("change", () => {
      writeGlobalTuneSettings();
      syncActiveGlobalTune();
    });
    adminGlobalTuneRange?.addEventListener("input", () => {
      updateGlobalTuneColor();
      writeGlobalTuneSettings();
      syncActiveGlobalTune();
    });
    if (!stored.hasSavedSettings) writeGlobalTuneSettings();
  }

  function readGlobalTuneSettings() {
    if (!adminGlobalTuneToggle?.checked) return { enabled: false };
    const targetHz = Number(adminGlobalTuneRange?.value);
    if (!Number.isFinite(targetHz)) return { enabled: false };
    return {
      enabled: true,
      targetHz: round(clamp(targetHz, YOU_SWEEP_MIN_HZ, YOU_SWEEP_MAX_HZ), 2),
      anchor: "root"
    };
  }

  function getTrackValueRange(track) {
    if (!Array.isArray(track?.curve)) return null;
    const values = track.curve.map((point) => Number(point.v)).filter(Number.isFinite);
    if (!values.length) return null;
    return { min: Math.min(...values), max: Math.max(...values) };
  }

  function findAnchorHz(journey, settings) {
    const architecture = journey.meta?.lab?.sonicArchitecture || journey.meta?.sonicArchitecture || {};
    const preferred = settings.anchor === "tactile"
      ? architecture.tactileHapticHz
      : architecture.fundamentalRootHz;
    if (Number.isFinite(Number(preferred))) return Number(preferred);
    const signalL = journey.tracks?.find((track) => track.id === "signal_l");
    const first = Number(signalL?.curve?.[0]?.v);
    return Number.isFinite(first) ? first : null;
  }

  function shouldTransposeTrack(track) {
    if (!track || track.id === "r_offset") return false;
    return track.unit === "Hz" && (track.id === "signal_l" || track.id === "signal_r" || track.role === "main" || track.role === "affected");
  }

  function applyGlobalTune(journey) {
    const settings = readGlobalTuneSettings();
    if (!journey?.tracks?.length) return { journey, applied: false };
    const tunedJourney = clone(journey);
    const anchorHz = findAnchorHz(tunedJourney, settings);
    if (!Number.isFinite(anchorHz)) return { journey, applied: false };
    const transposable = tunedJourney.tracks.filter(shouldTransposeTrack);
    if (!transposable.length) return { journey, applied: false };
    const ranges = transposable.map(getTrackValueRange).filter(Boolean);
    const minValue = Math.min(...ranges.map((range) => range.min));
    const maxValue = Math.max(...ranges.map((range) => range.max));
    const minTransposeHz = 20 - minValue;
    const maxTransposeHz = 120 - maxValue;
    const requestedTransposeHz = settings.enabled ? settings.targetHz - anchorHz : 0;
    const transposeHz = round(clamp(requestedTransposeHz, minTransposeHz, maxTransposeHz), 4);
    transposable.forEach((track) => {
      track.curve = track.curve.map((point) => ({
        ...point,
        v: round(Number(point.v) + transposeHz, 4)
      }));
    });
    if (settings.enabled && transposeHz !== 0) tunedJourney.meta = {
      ...(tunedJourney.meta || {}),
      lab: {
        ...(tunedJourney.meta?.lab || {}),
        globalTune: {
          enabled: true,
          source: "atlas-1.31",
          anchor: settings.anchor,
          anchorHz,
          targetHz: settings.targetHz,
          requestedTransposeHz: round(requestedTransposeHz, 4),
          transposeHz,
          preservesBindiff: true
        }
      }
    };
    return {
      journey: tunedJourney,
      applied: settings.enabled && transposeHz !== 0,
      enabled: settings.enabled,
      anchorHz,
      transposeHz,
      minTransposeHz,
      maxTransposeHz,
      targetHz: settings.targetHz
    };
  }

  function syncActiveGlobalTune() {
    const active = state.activeGlobalTune;
    if (!active || !state.player?.setTuneOffset) return;
    const settings = readGlobalTuneSettings();
    const requestedOffset = settings.enabled ? settings.targetHz - active.anchorHz : 0;
    const targetOffset = clamp(requestedOffset, active.minTransposeHz, active.maxTransposeHz);
    const liveOffset = targetOffset - active.initialOffsetHz;
    active.targetOffsetHz = targetOffset;
    state.player.setTuneOffset(liveOffset, GLOBAL_TUNE_RAMP_SECONDS);
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
  }

  function mixColor(from, to, amount) {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    return rgbToHex({
      r: a.r + ((b.r - a.r) * amount),
      g: a.g + ((b.g - a.g) * amount),
      b: a.b + ((b.b - a.b) * amount)
    });
  }

  function spectrumColorForFrequency(frequency) {
    const stops = [
      { p: 0, color: "#6957d8" },
      { p: 0.18, color: "#3d9ee3" },
      { p: 0.36, color: "#52d6c2" },
      { p: 0.54, color: "#d4df78" },
      { p: 0.72, color: "#f0b35f" },
      { p: 1, color: "#e6608f" }
    ];
    const ratio = clamp((frequency - YOU_SWEEP_MIN_HZ) / (YOU_SWEEP_MAX_HZ - YOU_SWEEP_MIN_HZ), 0, 1);
    const nextIndex = stops.findIndex((stop) => stop.p >= ratio);
    if (nextIndex <= 0) return stops[0].color;
    const before = stops[nextIndex - 1];
    const after = stops[nextIndex];
    const span = Math.max(0.0001, after.p - before.p);
    return mixColor(before.color, after.color, (ratio - before.p) / span);
  }

  function nowSeconds() {
    return performance.now() / 1000;
  }

  function rotateVector(source, yaw, pitch) {
    const [x, y, z] = source;
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const x1 = (x * cy) - (z * sy);
    const z1 = (x * sy) + (z * cy);
    const y1 = (y * cp) - (z1 * sp);
    const z2 = (y * sp) + (z1 * cp);
    return [x1, y1, z2];
  }

  function project(room, rect, time) {
    if (FLOWER_MODE) return projectFlower(room, rect, time);
    const rotated = rotateVector(room.position, state.yaw, state.pitch);
    const camera = Math.max(640, rect.width * 0.9);
    const depth = camera / (camera - rotated[2]);
    const breathe = 1 + (Math.sin((time / 1200) + room.position[0]) * 0.018);
    const selected = state.selectedId === room.id;
    return {
      x: (rect.width / 2) + (rotated[0] * depth),
      y: (rect.height / 2) + (rotated[1] * depth),
      z: rotated[2],
      scale: clamp(depth * breathe * (selected ? 1.38 : 1), 0.56, 2.08),
      opacity: clamp(0.48 + ((rotated[2] + 270) / 720), 0.32, 1)
    };
  }

  function projectFlower(room, rect, time) {
    const [x, y, z] = room.position;
    const selected = state.selectedId === room.id;
    const minSide = Math.min(rect.width, rect.height);
    const availableWidth = Math.max(1, rect.width - 48);
    const availableHeight = Math.max(1, rect.height - 48);
    const layoutScale = clamp(
      Math.min(
        availableWidth / (flowerExtents.left * 2),
        availableHeight / (flowerExtents.top + flowerExtents.bottom)
      ),
      0.42,
      1.28
    );
    const centerY = (rect.height / 2) + ((flowerExtents.top - flowerExtents.bottom) * layoutScale / 2);
    const depth = 1 + (z / 1200);
    const breathe = STATIC_FLOWER_MODE ? 1 : 1 + (Math.sin((time / 1400) + (x * 0.02) + (y * 0.01)) * 0.012);
    const maxSelectedScale = Math.max(0.72, (minSide - 32) / Math.max(1, room.radius * 2));
    const selectedBoost = selected ? Math.min(1.82, maxSelectedScale) : 1;
    return {
      x: selected ? rect.width / 2 : (rect.width / 2) + (x * layoutScale),
      y: selected ? rect.height / 2 : centerY + (y * layoutScale),
      z,
      scale: clamp(depth * breathe * selectedBoost, 0.72, 2.22),
      opacity: selected ? 1 : clamp(0.62 + ((z + 90) / 560), 0.48, 0.94)
    };
  }

  function targetAnglesForRoom(room) {
    const [x, y, z] = room.position;
    const flat = Math.sqrt((x * x) + (z * z));
    return {
      yaw: Math.atan2(x, z),
      pitch: Math.atan2(y, flat)
    };
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function orientUniverseTo(room) {
    if (FLOWER_MODE) {
      state.orienting = null;
      return;
    }
    const target = targetAnglesForRoom(room);
    state.orienting = {
      startedAt: performance.now(),
      durationMs: 1800,
      fromYaw: state.yaw,
      fromPitch: state.pitch,
      toYaw: target.yaw,
      toPitch: target.pitch
    };
    state.targetYaw = target.yaw;
    state.targetPitch = target.pitch;
  }

  function makeRoom(room) {
    const button = document.createElement("div");
    button.className = "room-field";
    button.dataset.roomId = room.id;
    button.tabIndex = 0;
    button.setAttribute("role", "button");
    button.style.setProperty("--room-color", room.color);
    button.style.setProperty("--room-size", String(room.radius * 2));
    button.style.setProperty("--journey-progress", "0deg");
    button.setAttribute("aria-label", `${room.name}. ${room.phrase}`);
    const journeys = renderRoomActions(room);
    button.innerHTML = `
      <span class="room-name">${room.name}</span>
      <div class="room-menu">${journeys}</div>
      ${room.id === "you" ? `
        <div class="you-tuner-panel">
          <span class="you-frequency-readout" aria-hidden="true"><strong data-you-frequency>${YOU_SWEEP_DEFAULT_HZ.toFixed(2)}</strong></span>
          <span class="you-sweep-clock" aria-hidden="true">
            <i></i>
          </span>
          <label class="finetune-control frequency-control">
            <span class="visually-hidden">Frequency</span>
            <input type="range" min="${YOU_SWEEP_MIN_HZ}" max="${YOU_SWEEP_MAX_HZ}" step="0.01" value="${YOU_SWEEP_DEFAULT_HZ}" aria-label="Frequency color spectrum" data-you-frequency-slider>
          </label>
          <div class="you-step-controls">
            <button type="button" data-you-step="-0.03" aria-label="Frequency down">↓</button>
            <button type="button" data-you-pause>Hold</button>
            <button type="button" data-you-step="0.03" aria-label="Frequency up">↑</button>
          </div>
          <button type="button" data-you-start>Let's go</button>
          <button class="you-return-button" type="button" data-you-return>Return</button>
        </div>` : ""}
      <div class="room-playback" aria-live="polite">
        <span class="playback-title">${room.name}</span>
        <span class="playback-clock" aria-hidden="true"></span>
        <div class="playback-actions">
          <button type="button" data-playback-action="return">Return</button>
        </div>
      </div>`;
    button.querySelector(".room-menu").addEventListener("click", (event) => {
      const journeyButton = event.target.closest("[data-journey-index]");
      if (!journeyButton) return;
      event.preventDefault();
      event.stopPropagation();
      const roomJourneys = getRoomJourneys(room);
      beginJourneyFromRoom(room, roomJourneys[Number(journeyButton.dataset.journeyIndex)]);
    });
    const youPanel = button.querySelector(".you-tuner-panel");
    if (youPanel) {
      youPanel.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.target.closest("[data-you-start]")) beginYouJourney(room);
        if (event.target.closest("[data-you-pause]")) toggleYouSweepPause(room);
        const stepButton = event.target.closest("[data-you-step]");
        if (stepButton) stepYouFrequency(button, Number(stepButton.dataset.youStep));
        if (event.target.closest("[data-you-return]")) returnToYou();
      });
      youPanel.addEventListener("input", (event) => {
        const slider = event.target.closest("[data-you-frequency-slider]");
        if (!slider) return;
        updateYouManualFrequency(button, Number(slider.value));
      });
      youPanel.addEventListener("change", (event) => {
        const slider = event.target.closest("[data-you-frequency-slider]");
        if (!slider) return;
        updateYouManualFrequency(button, Number(slider.value));
      });
      youPanel.addEventListener("pointerdown", (event) => event.stopPropagation());
    }
    button.querySelector(".room-playback").addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-playback-action]");
      if (!actionButton) return;
      event.stopPropagation();
      if (actionButton.dataset.playbackAction === "return") returnToYou();
    });
    button.addEventListener("pointerenter", () => {
      state.hoveredId = room.id;
      button.classList.add("is-hovered");
    });
    button.addEventListener("pointerleave", () => {
      if (state.hoveredId === room.id) state.hoveredId = null;
      button.classList.remove("is-hovered");
    });
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      enterRoom(room.id);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      enterRoom(room.id);
    });
    layer.appendChild(button);
    roomEls.set(room.id, button);
  }

  function renderRoomActions(room) {
    return getRoomJourneys(room).map((journey, index) => {
      const label = room.id === "you" ? getYouActionLabel(journey) : journey.label;
      return `<button type="button" data-journey-index="${index}">${label}</button>`;
    }).join("");
  }

  function getRoomJourneys(room) {
    if (room.journeyIds && data.journeys) {
      return room.journeyIds.map((id) => data.journeys[id]).filter(Boolean);
    }
    return room.journeys || [];
  }

  function refreshRoomMenu(room) {
    const el = roomEls.get(room.id);
    const menu = el?.querySelector(".room-menu");
    if (!menu) return;
    el.dataset.youPhase = room.id === "you" ? state.youTuner.phase : "";
    menu.innerHTML = renderRoomActions(room);
    if (room.id === "you") syncYouTunerPanel(el);
  }

  function syncYouTunerPanel(el) {
    const panel = el?.querySelector(".you-tuner-panel");
    const menu = el?.querySelector(".room-menu");
    if (!panel) return;
    el.dataset.youPhase = state.youTuner.phase;
    const slider = panel.querySelector("[data-you-frequency-slider]");
    const value = panel.querySelector("[data-you-frequency]");
    const pauseButton = panel.querySelector("[data-you-pause]");
    if (slider) slider.value = String(clamp(state.youTuner.selectedFrequency, YOU_SWEEP_MIN_HZ, YOU_SWEEP_MAX_HZ));
    if (value) value.textContent = state.youTuner.selectedFrequency.toFixed(2);
    if (pauseButton) pauseButton.textContent = state.youTuner.phase === "paused" ? "Resume" : "Hold";
    el.style.setProperty("--you-sweep-angle", `${youClockAngle()}deg`);
    el.style.setProperty("--you-spectrum-color", spectrumColorForFrequency(state.youTuner.selectedFrequency));
    const active = state.youTuner.phase === "sweeping" || state.youTuner.phase === "paused";
    panel.hidden = !active;
    panel.style.opacity = active ? "1" : "0";
    panel.style.pointerEvents = active ? "auto" : "none";
    panel.style.transform = active ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)";
    if (menu) {
      menu.style.opacity = active ? "0" : "";
      menu.style.pointerEvents = active ? "none" : "";
    }
  }

  function updateYouManualFrequency(roomEl, value) {
    if (state.youTuner.phase === "sweeping") pauseYouSweep();
    state.youTuner.selectedFrequency = round(clamp(value, YOU_SWEEP_MIN_HZ, YOU_SWEEP_MAX_HZ), 2);
    rememberYouTune(state.youTuner.selectedFrequency);
    syncYouTunerPanel(roomEl);
    setYouAudioFrequency(state.youTuner.selectedFrequency);
  }

  function stepYouFrequency(roomEl, delta) {
    updateYouManualFrequency(roomEl, state.youTuner.selectedFrequency + delta);
  }

  function getYouActionLabel(action) {
    if (action.kind !== "youTuner") return action.label;
    return "Find your resonance";
  }

  function render(time = performance.now()) {
    const rect = stage.getBoundingClientRect();
    if (state.orienting) {
      const progress = clamp((time - state.orienting.startedAt) / state.orienting.durationMs, 0, 1);
      const eased = easeInOutCubic(progress);
      state.yaw = state.orienting.fromYaw + ((state.orienting.toYaw - state.orienting.fromYaw) * eased);
      state.pitch = state.orienting.fromPitch + ((state.orienting.toPitch - state.orienting.fromPitch) * eased);
      if (progress >= 1) state.orienting = null;
    } else if (!state.dragging && !state.selectedId && !state.playingId) {
      state.targetYaw += 0.00028;
      state.yaw += (state.targetYaw - state.yaw) * 0.08;
      state.pitch += (state.targetPitch - state.pitch) * 0.08;
    } else if (!state.orienting) {
      state.yaw += (state.targetYaw - state.yaw) * 0.08;
      state.pitch += (state.targetPitch - state.pitch) * 0.08;
    }

    const projections = data.rooms.map((room) => ({ room, ...project(room, rect, time) }));
    projectedRooms.clear();
    projections.forEach((item) => projectedRooms.set(item.room.id, item));
    renderNetwork(rect, projections);
    projections.sort((a, b) => a.z - b.z);
    projections.forEach((item, index) => {
      const el = roomEls.get(item.room.id);
      const selected = state.selectedId === item.room.id;
      const muted = state.selectedId && !selected;
      el.style.left = `${item.x}px`;
      el.style.top = `${item.y}px`;
      el.style.opacity = muted ? "0.22" : String(item.opacity);
      el.style.zIndex = String(selected || state.playingId === item.room.id ? 1000 : 10 + index);
      el.style.transform = `translate(-50%, -50%) scale(${item.scale})`;
      el.classList.toggle("is-selected", selected);
      el.classList.toggle("is-muted", Boolean(muted));
    });

    if (!STATIC_FLOWER_MODE) requestAnimationFrame(render);
  }

  function rerenderStaticLayout() {
    if (!STATIC_FLOWER_MODE) return;
    render();
  }

  function setRoomPlayback(roomId, progress) {
    const el = roomEls.get(roomId);
    if (!el) return;
    const percent = clamp(progress, 0, 1);
    el.style.setProperty("--journey-progress", `${percent * 360}deg`);
  }

  function showRoomPlayback(room, title) {
    const el = roomEls.get(room.id);
    if (!el) return;
    const titleEl = el.querySelector(".playback-title");
    if (titleEl) titleEl.textContent = title || room.name;
    setRoomPlayback(room.id, 0);
    el.classList.add("is-playing");
  }

  function hideRoomPlayback(roomId) {
    const el = roomEls.get(roomId);
    if (!el) return;
    el.classList.remove("is-playing");
    setRoomPlayback(roomId, 0);
  }

  async function requestJourneyWakeLock() {
    state.wakeLock.wanted = true;
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
    if (state.wakeLock.sentinel) return;
    try {
      state.wakeLock.sentinel = await navigator.wakeLock.request("screen");
      if (!state.wakeLock.wanted) {
        await releaseJourneyWakeLock();
        return;
      }
      state.wakeLock.sentinel.addEventListener("release", () => {
        state.wakeLock.sentinel = null;
      });
    } catch (error) {
      console.warn("Screen wake lock unavailable", error);
    }
  }

  async function releaseJourneyWakeLock() {
    state.wakeLock.wanted = false;
    const sentinel = state.wakeLock.sentinel;
    state.wakeLock.sentinel = null;
    if (sentinel && !sentinel.released) {
      try {
        await sentinel.release();
      } catch (error) {
        console.warn("Screen wake lock release failed", error);
      }
    }
  }

  function restoreJourneyWakeLock() {
    if (document.visibilityState === "visible" && state.wakeLock.wanted && state.playingId) {
      requestJourneyWakeLock();
    }
  }

  function setPlaybackHoldLabel(label) {
    pauseBtn.textContent = label;
  }

  function renderNetwork(rect) {
    networkLines.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    const selected = state.selectedId;
    const connections = data.connections || [];
    networkLines.replaceChildren(...connections.flatMap(([fromId, toId]) => {
      const from = projectedRooms.get(fromId);
      const to = projectedRooms.get(toId);
      if (!from || !to) return [];
      const relevant = !selected || fromId === selected || toId === selected;
      const depth = clamp(((from.z + to.z) / 2 + 320) / 680, 0.12, 0.82);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", from.x.toFixed(2));
      line.setAttribute("y1", from.y.toFixed(2));
      line.setAttribute("x2", to.x.toFixed(2));
      line.setAttribute("y2", to.y.toFixed(2));
      line.setAttribute("opacity", String(relevant ? depth : depth * 0.2));
      const n1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      n1.setAttribute("cx", (from.x + ((to.x - from.x) * 0.5)).toFixed(2));
      n1.setAttribute("cy", (from.y + ((to.y - from.y) * 0.5)).toFixed(2));
      n1.setAttribute("r", String(relevant ? 2.2 : 1.2));
      n1.setAttribute("opacity", String(relevant ? depth * 0.8 : depth * 0.16));
      return [line, n1];
    }));
  }

  function findRoom(id) {
    return data.rooms.find((room) => room.id === id);
  }

  function enterRoom(id) {
    const room = findRoom(id);
    if (!room || state.playingId) return;
    state.selectedId = id;
    orientUniverseTo(room);
    refreshRoomMenu(room);
    rerenderStaticLayout();
    hint.textContent = STATIC_FLOWER_MODE
      ? "Choose a journey in this room, or return to You."
      : "The universe is turning this room toward you.";
  }

  function returnToYou() {
    const hasYouAudio = Boolean(state.youTuner.audio);
    releaseJourneyWakeLock();
    if (state.player) {
      state.player.end();
      return;
    }
    stopYouSweep({ fadeSeconds: hasYouAudio ? YOU_MANUAL_END_FADE_SECONDS : 0.18 });
    state.youTuner.phase = "idle";
    refreshRoomMenu(findRoom("you"));
    state.selectedId = null;
    state.playingId = null;
    stage.classList.remove("journey-active");
    roomEls.forEach((_, roomId) => hideRoomPlayback(roomId));
    status.classList.add("is-hidden");
    journeyProgress.style.width = "0%";
    pauseBtn.textContent = "Hold";
    hint.textContent = STATIC_FLOWER_MODE
      ? "Select a point in the field. Every journey starts with you."
      : "Drag to rotate. Select a room to move closer.";
    rerenderStaticLayout();
  }

  async function beginJourneyFromRoom(room, action) {
    if (!room || !action) return;
    if (action.kind === "youTuner") {
      handleYouTuner(room);
      return;
    }
    if (action.kind === "route") {
      window.location.href = action.href;
      return;
    }
    const tuned = applyGlobalTune(library[action.journeyId]);
    const journey = tuned.journey;
    if (!journey || !playerApi) {
      return;
    }
    status.classList.add("is-hidden");
    stage.classList.add("journey-active");
    state.playingId = room.id;
    state.activeGlobalTune = Number.isFinite(tuned.anchorHz) ? {
      anchorHz: tuned.anchorHz,
      initialOffsetHz: tuned.transposeHz || 0,
      targetOffsetHz: tuned.transposeHz || 0,
      minTransposeHz: tuned.minTransposeHz ?? -100,
      maxTransposeHz: tuned.maxTransposeHz ?? 100
    } : null;
    requestJourneyWakeLock();
    rerenderStaticLayout();
    showRoomPlayback(room, action.label || journey.name || room.name);
    journeyRoom.textContent = room.name;
    journeyTitle.textContent = action.label || journey.name || room.name;
    journeyText.textContent = tuned.applied
      ? `${room.phrase} The field is tuned to your chosen point.`
      : room.phrase;
    state.player = playerApi.createPlayer({
      onTick: (snapshot) => {
        journeyProgress.style.width = `${Math.round(snapshot.progress * 100)}%`;
        setRoomPlayback(room.id, snapshot.progress);
      },
      onComplete: () => completeJourney(room),
      onEnded: () => completeJourney(room)
    });
    await state.player.start(clone(journey));
    syncActiveGlobalTune();
  }

  function getSweepFrequency() {
    return getSweepPosition().frequency;
  }

  function getSweepPosition() {
    const min = YOU_SWEEP_MIN_HZ;
    const max = YOU_SWEEP_MAX_HZ;
    const elapsed = nowSeconds() - state.youTuner.sweepStartedAt;
    const phase = (elapsed % YOU_SWEEP_CYCLE_SEC) / YOU_SWEEP_CYCLE_SEC;
    const triangle = phase < 0.5 ? phase * 2 : 2 - (phase * 2);
    return {
      phase,
      direction: phase < 0.5 ? 1 : -1,
      frequency: min + ((max - min) * triangle)
    };
  }

  function youClockAngle() {
    if (state.youTuner.phase === "sweeping") {
      return 180 + (getSweepPosition().phase * 360);
    }
    const ratio = (state.youTuner.selectedFrequency - YOU_SWEEP_MIN_HZ) / (YOU_SWEEP_MAX_HZ - YOU_SWEEP_MIN_HZ);
    return 180 + (clamp(ratio, 0, 1) * 180);
  }

  function ensureYouAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (state.youTuner.audio) return state.youTuner.audio;
    const ctx = new AudioContext();
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    const master = ctx.createGain();
    const merger = ctx.createChannelMerger(2);
    left.type = "sine";
    right.type = "sine";
    leftGain.gain.value = 0.7;
    rightGain.gain.value = 0.7;
    master.gain.value = 0;
    left.connect(leftGain).connect(merger, 0, 0);
    right.connect(rightGain).connect(merger, 0, 1);
    merger.connect(master).connect(ctx.destination);
    left.start();
    right.start();
    state.youTuner.audio = {
      ctx,
      left,
      right,
      master,
      updateTimer: 0,
      leftTargetHz: null,
      rightTargetHz: null,
      masterTarget: 0,
      masterRamp: {
        startTime: ctx.currentTime,
        startValue: 0,
        targetValue: 0,
        duration: 0
      }
    };
    return state.youTuner.audio;
  }

  function currentYouMasterLevel(audio = state.youTuner.audio, time = audio?.ctx.currentTime || 0) {
    if (!audio) return 0;
    const ramp = audio.masterRamp;
    if (!ramp || ramp.duration <= 0) return audio.masterTarget || 0;
    const progress = clamp((time - ramp.startTime) / ramp.duration, 0, 1);
    if (progress >= 1) return ramp.targetValue;
    return ramp.startValue + ((ramp.targetValue - ramp.startValue) * progress);
  }

  function holdAudioParam(param, time) {
    if (typeof param.cancelAndHoldAtTime === "function") {
      param.cancelAndHoldAtTime(time);
      return;
    }
    const heldValue = param.value;
    param.cancelScheduledValues(time);
    param.setValueAtTime(heldValue, time);
  }

  function rampYouMaster(value, seconds, options = {}) {
    const audio = state.youTuner.audio;
    if (!audio) return;
    const target = clamp(value, 0, 0.9);
    if (!options.force && Math.abs((audio.masterTarget ?? audio.master.gain.value) - target) < 0.001) return;
    const time = audio.ctx.currentTime;
    const current = currentYouMasterLevel(audio, time);
    holdAudioParam(audio.master.gain, time);
    audio.master.gain.setValueAtTime(current, time);
    audio.master.gain.linearRampToValueAtTime(target, time + Math.max(0.01, seconds));
    audio.masterTarget = target;
    audio.masterRamp = {
      startTime: time,
      startValue: current,
      targetValue: target,
      duration: seconds
    };
  }

  function setYouAudioFrequency(frequency, bindiff = 0, options = {}) {
    const audio = state.youTuner.audio;
    if (!audio) return;
    const time = audio.ctx.currentTime;
    const leftTarget = Math.max(0.1, frequency);
    const rightTarget = Math.max(0.1, frequency + bindiff);
    if (options.force || audio.leftTargetHz === null || Math.abs(audio.leftTargetHz - leftTarget) >= 0.005) {
      audio.left.frequency.setTargetAtTime(leftTarget, time, 0.025);
      audio.leftTargetHz = leftTarget;
    }
    if (options.force || audio.rightTargetHz === null || Math.abs(audio.rightTargetHz - rightTarget) >= 0.005) {
      audio.right.frequency.setTargetAtTime(rightTarget, time, 0.025);
      audio.rightTargetHz = rightTarget;
    }
  }

  function startYouSweep(room) {
    const audio = ensureYouAudio();
    if (!audio) {
      return;
    }
    audio.ctx.resume().catch(() => {});
    state.youTuner.phase = "sweeping";
    state.youTuner.sweepStartedAt = nowSeconds();
    state.youTuner.sweepElapsedSec = 0;
    const sweep = getSweepPosition();
    state.youTuner.sweepDirection = sweep.direction;
    state.youTuner.selectedFrequency = sweep.frequency;
    rememberYouTune(state.youTuner.selectedFrequency);
    setYouAudioFrequency(state.youTuner.selectedFrequency, 0, { force: true });
    syncYouTunerPanel(roomEls.get(room.id));
    window.clearInterval(audio.updateTimer);
    audio.updateTimer = window.setInterval(() => updateYouSweep(room), 50);
    rampYouMaster(0.2, YOU_START_FADE_SECONDS, { force: true });
    refreshRoomMenu(room);
  }

  function updateYouSweep(room) {
    if (state.youTuner.phase !== "sweeping") return;
    const sweep = getSweepPosition();
    state.youTuner.sweepDirection = sweep.direction;
    state.youTuner.selectedFrequency = round(sweep.frequency, 2);
    rememberYouTune(state.youTuner.selectedFrequency);
    setYouAudioFrequency(state.youTuner.selectedFrequency);
    syncYouTunerPanel(roomEls.get(room.id));
  }

  function stopYouSweep(options = {}) {
    const audio = state.youTuner.audio;
    if (!audio) return;
    window.clearInterval(audio.updateTimer);
    if (options.keepPreview) return;
    rampYouMaster(0, options.fadeSeconds ?? YOU_MANUAL_END_FADE_SECONDS, { force: true });
  }

  function pauseYouSweep() {
    if (state.youTuner.phase !== "sweeping") return;
    const audio = state.youTuner.audio;
    const sweep = getSweepPosition();
    state.youTuner.sweepElapsedSec = nowSeconds() - state.youTuner.sweepStartedAt;
    state.youTuner.sweepDirection = sweep.direction;
    state.youTuner.phase = "paused";
    rememberYouTune(state.youTuner.selectedFrequency);
    if (audio) window.clearInterval(audio.updateTimer);
    setYouAudioFrequency(state.youTuner.selectedFrequency);
  }

  function resumeYouSweep(room) {
    const audio = state.youTuner.audio || ensureYouAudio();
    if (!audio) return;
    audio.ctx.resume().catch(() => {});
    state.youTuner.phase = "sweeping";
    state.youTuner.sweepStartedAt = nowSeconds() - sweepElapsedForFrequency(
      state.youTuner.selectedFrequency,
      state.youTuner.sweepDirection
    );
    window.clearInterval(audio.updateTimer);
    audio.updateTimer = window.setInterval(() => updateYouSweep(room), 50);
    rampYouMaster(0.2, YOU_START_FADE_SECONDS, { force: true });
    updateYouSweep(room);
  }

  function sweepElapsedForFrequency(frequency, direction = 1) {
    const ratio = clamp((frequency - YOU_SWEEP_MIN_HZ) / (YOU_SWEEP_MAX_HZ - YOU_SWEEP_MIN_HZ), 0, 1);
    const phase = direction < 0 ? 1 - (ratio / 2) : ratio / 2;
    return phase * YOU_SWEEP_CYCLE_SEC;
  }

  function toggleYouSweepPause(room) {
    if (state.youTuner.phase === "sweeping") {
      pauseYouSweep();
      syncYouTunerPanel(roomEls.get(room.id));
      return;
    }
    if (state.youTuner.phase === "paused") {
      resumeYouSweep(room);
      syncYouTunerPanel(roomEls.get(room.id));
    }
  }

  function handleYouTuner(room) {
    if (state.youTuner.phase === "idle") {
      startYouSweep(room);
      return;
    }
    if (state.youTuner.phase === "sweeping" || state.youTuner.phase === "paused") beginYouJourney(room);
  }

  function createYouDefaultJourney(frequency) {
    return {
      format: "tuner-journey",
      version: 1,
      id: "you_default_tuning",
      name: "Right Now",
      description: "A simple five minute tuning journey.",
      durationSec: 300,
      view: {
        frequencyWindow: { minHz: 20, maxHz: 80 },
        beatWindow: { min: -1, max: 1 }
      },
      transport: { loop: false, loopStartSec: 0, loopEndSec: 300 },
      tracks: [
        {
          id: "signal_l",
          name: "L main",
          type: "tone",
          role: "main",
          unit: "Hz",
          source: "authored",
          color: "#60c7a0",
          curve: [
            { t: 0, v: frequency, curve: "hold" },
            { t: 300, v: frequency, curve: "hold" }
          ]
        },
        {
          id: "r_offset",
          name: "R offset",
          type: "automation",
          role: "signedOffsetHz",
          unit: "Hz",
          source: "authored",
          color: "#f0a6ff",
          curve: [
            { t: 0, v: 0.5, curve: "ease" },
            { t: 300, v: 0.2, curve: "ease" }
          ]
        },
        {
          id: "signal_r",
          name: "R affected",
          type: "tone",
          role: "affected",
          unit: "Hz",
          source: "authored",
          color: "#8d7cff",
          curve: [
            { t: 0, v: frequency + 0.5, curve: "hold" },
            { t: 300, v: frequency + 0.2, curve: "hold" }
          ]
        },
        {
          id: "amplitude",
          name: "Master amplitude",
          type: "automation",
          role: "amplitude",
          unit: "linear",
          source: "authored",
          color: "#f0c96b",
          curve: [
            { t: 0, v: 0.82, curve: "hold" },
            { t: 290, v: 0.82, curve: "hold" },
            { t: 300, v: 0, curve: "ease" }
          ]
        }
      ],
      regions: [
        {
          id: "you_tuning",
          name: "Tuning",
          start: 0,
          end: 300,
          mode: "linked",
          transitionSec: 5,
          rules: {
            r: {
              type: "signedOffset",
              sourceTrackId: "signal_l",
              offsetTrackId: "r_offset"
            }
          }
        }
      ],
      relations: [],
      assets: [],
      outputs: [],
      routing: []
    };
  }

  async function beginYouJourney(room) {
    if (!playerApi) {
      return;
    }
    const roomEl = roomEls.get(room.id);
    try {
      stopYouSweep({ keepPreview: true });
      rememberYouTune(state.youTuner.selectedFrequency);
      const journey = createYouDefaultJourney(state.youTuner.selectedFrequency);
      state.player = createContinuousYouPlayer(journey, {
        onTick: (snapshot) => {
          journeyProgress.style.width = `${Math.round(snapshot.progress * 100)}%`;
          setRoomPlayback(room.id, snapshot.progress);
        },
        onComplete: () => completeJourney(room),
        onEnded: () => completeJourney(room)
      });
      await state.player.start();
      status.classList.add("is-hidden");
      stage.classList.add("journey-active");
      state.playingId = room.id;
      requestJourneyWakeLock();
      rerenderStaticLayout();
      showRoomPlayback(room, "Right Now");
      journeyRoom.textContent = "YOU";
      journeyTitle.textContent = "Right Now";
      journeyText.textContent = "Stay with the field as it moves from active to steady.";
      state.youTuner.phase = "idle";
      refreshRoomMenu(room);
    } catch (error) {
      state.player = null;
      state.playingId = null;
      stage.classList.remove("journey-active");
      hideRoomPlayback(room.id);
      state.youTuner.phase = "paused";
      refreshRoomMenu(room);
      syncYouTunerPanel(roomEl);
      const audio = ensureYouAudio();
      if (audio) {
        audio.ctx.resume().catch(() => {});
        setYouAudioFrequency(state.youTuner.selectedFrequency, 0);
        rampYouMaster(0.2, YOU_START_FADE_SECONDS, { force: true });
      }
      console.warn("YOU journey start failed", error);
    }
  }

  function createContinuousYouPlayer(journey, callbacks = {}) {
    const playerState = {
      journey: playerApi.normalizeJourney(journey),
      playing: false,
      paused: false,
      currentTime: 0,
      startedAt: 0,
      rafId: 0,
      lastLHz: null,
      lastDiffHz: null,
      lastMaster: null,
      lastAudioAt: 0
    };

    function snapshot() {
      return {
        journey: playerState.journey,
        playing: playerState.playing,
        paused: playerState.paused,
        currentTime: playerState.currentTime,
        durationSec: playerState.journey.durationSec
      };
    }

    function targetChanged(key, value, threshold, force) {
      if (force || playerState[key] === null || Math.abs(playerState[key] - value) >= threshold) {
        playerState[key] = value;
        return true;
      }
      return false;
    }

    function applyAtCurrentTime(force = false) {
      const values = playerApi.evaluateAt(playerState.journey, playerState.currentTime);
      const audio = state.youTuner.audio;
      if (audio && (force || audio.ctx.currentTime - playerState.lastAudioAt >= 0.08)) {
        playerState.lastAudioAt = audio.ctx.currentTime;
        const leftChanged = targetChanged("lastLHz", values.lHz, 0.005, force);
        const diffChanged = targetChanged("lastDiffHz", values.signedDiffHz, 0.005, force);
        if (leftChanged || diffChanged) setYouAudioFrequency(values.lHz, values.signedDiffHz, { force });
        const master = clamp(values.masterAmplitude * YOU_JOURNEY_MASTER_GAIN, 0, YOU_JOURNEY_MASTER_GAIN);
        if (targetChanged("lastMaster", master, 0.002, force)) {
          rampYouMaster(master, force ? YOU_START_FADE_SECONDS : 0.12, { force });
        }
      }
      callbacks.onTick?.({
        ...snapshot(),
        values,
        progress: playerState.journey.durationSec ? playerState.currentTime / playerState.journey.durationSec : 0
      });
    }

    function stopLoop() {
      if (!playerState.rafId) return;
      cancelAnimationFrame(playerState.rafId);
      playerState.rafId = 0;
    }

    function tick() {
      if (!playerState.playing) {
        playerState.rafId = 0;
        return;
      }
      playerState.currentTime = clamp(nowSeconds() - playerState.startedAt, 0, playerState.journey.durationSec);
      applyAtCurrentTime();
      if (playerState.currentTime >= playerState.journey.durationSec) {
        playerState.playing = false;
        playerState.paused = false;
        playerState.rafId = 0;
        rampYouMaster(0, YOU_NATURAL_END_FADE_SECONDS, { force: true });
        callbacks.onComplete?.(snapshot());
        return;
      }
      playerState.rafId = requestAnimationFrame(tick);
    }

    return {
      async start() {
        const audio = ensureYouAudio();
        if (!audio) throw new Error("AudioContext unavailable");
        audio.ctx.resume().catch(() => {});
        playerState.playing = true;
        playerState.paused = false;
        playerState.currentTime = 0;
        playerState.startedAt = nowSeconds();
        applyAtCurrentTime(true);
        stopLoop();
        playerState.rafId = requestAnimationFrame(tick);
      },
      pause() {
        if (!playerState.playing) return;
        playerState.currentTime = clamp(nowSeconds() - playerState.startedAt, 0, playerState.journey.durationSec);
        playerState.playing = false;
        playerState.paused = true;
        stopLoop();
        applyAtCurrentTime(true);
      },
      resume() {
        if (!playerState.paused) return;
        playerState.playing = true;
        playerState.paused = false;
        playerState.startedAt = nowSeconds() - playerState.currentTime;
        applyAtCurrentTime(true);
        stopLoop();
        playerState.rafId = requestAnimationFrame(tick);
      },
      end() {
        if (!playerState.playing && !playerState.paused) return;
        playerState.playing = false;
        playerState.paused = false;
        stopLoop();
        rampYouMaster(0, YOU_MANUAL_END_FADE_SECONDS, { force: true });
        callbacks.onEnded?.(snapshot());
      },
      getState: snapshot
    };
  }

  function completeJourney(room) {
    releaseJourneyWakeLock();
    stopYouSweep({ fadeSeconds: YOU_MANUAL_END_FADE_SECONDS });
    stage.classList.remove("journey-active");
    status.classList.add("is-hidden");
    hideRoomPlayback(room.id);
    state.playingId = null;
    state.player = null;
    state.activeGlobalTune = null;
    state.selectedId = null;
    journeyProgress.style.width = "0%";
    pauseBtn.textContent = "Hold";
    hint.textContent = STATIC_FLOWER_MODE
      ? "Select a point in the field. Every journey starts with you."
      : "Drag to rotate. Select a room to move closer.";
    rerenderStaticLayout();
  }

  function togglePause() {
    if (!state.player) return;
    const snapshot = state.player.getState();
    if (snapshot.playing) {
      state.player.pause();
      setPlaybackHoldLabel("Resume");
    } else {
      state.player.resume();
      setPlaybackHoldLabel("Hold");
    }
  }

  function attachStageGestures() {
    stage.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".room-field, .journey-status")) return;
      if (FLOWER_MODE) return;
      state.dragging = true;
      state.dragStart = {
        x: event.clientX,
        y: event.clientY,
        yaw: state.targetYaw,
        pitch: state.targetPitch
      };
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove", (event) => {
      if (FLOWER_MODE) return;
      if (!state.dragging || !state.dragStart) return;
      state.orienting = null;
      const dx = event.clientX - state.dragStart.x;
      const dy = event.clientY - state.dragStart.y;
      state.targetYaw = state.dragStart.yaw + (dx * 0.006);
      state.targetPitch = clamp(state.dragStart.pitch - (dy * 0.005), -0.72, 0.72);
    });
    stage.addEventListener("pointerup", () => {
      state.dragging = false;
      state.dragStart = null;
    });
    stage.addEventListener("click", (event) => {
      if (event.target.closest(".room-field, .journey-status")) return;
      if (state.selectedId || state.playingId) returnToYou();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (state.playingId || state.selectedId) {
        event.preventDefault();
        returnToYou();
      }
    });
  }

  function init() {
    if (FLOWER_MODE) {
      stage.classList.add("is-flower-layout");
      stage.classList.add("is-static-layout");
      hint.textContent = "Select a point in the field. Every journey starts with you.";
    }
    setupGlobalTune();
    data.rooms.forEach(makeRoom);
    attachStageGestures();
    doNotDisturbReminder?.addEventListener("click", (event) => {
      const { clientX, clientY } = event;
      doNotDisturbReminder.classList.add("is-hidden");
      if (event.target !== doNotDisturbReminder) return;
      const underlyingTarget = document.elementFromPoint(clientX, clientY);
      const roomTarget = underlyingTarget?.closest?.(".room-field");
      const forwardTarget = underlyingTarget?.closest?.("button") || roomTarget;
      if (forwardTarget) forwardTarget.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY
      }));
    });
    pauseBtn.addEventListener("click", togglePause);
    endBtn.addEventListener("click", returnToYou);
    document.addEventListener("visibilitychange", restoreJourneyWakeLock);
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeRenderTimer);
      resizeRenderTimer = window.setTimeout(rerenderStaticLayout, 80);
    });
    enterRoom("you");
    render();
  }

  init();
})();
