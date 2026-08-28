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
  const YOU_MANUAL_END_FADE_SECONDS = 2;
  const FLOWER_MODE = data.layoutMode === "flower";
  const STATIC_FLOWER_MODE = FLOWER_MODE;

  const stage = document.getElementById("atlasStage");
  const layer = document.getElementById("roomLayer");
  const networkLines = document.getElementById("networkLines");
  const invitation = document.getElementById("roomInvitation");
  const roomType = document.getElementById("roomType");
  const roomTitle = document.getElementById("roomTitle");
  const roomText = document.getElementById("roomText");
  const beginBtn = document.getElementById("beginBtn");
  const returnBtn = document.getElementById("returnBtn");
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  const status = document.getElementById("journeyStatus");
  const journeyRoom = document.getElementById("journeyRoom");
  const journeyTitle = document.getElementById("journeyTitle");
  const journeyText = document.getElementById("journeyText");
  const journeyProgress = document.getElementById("journeyProgress");
  const pauseBtn = document.getElementById("pauseBtn");
  const endBtn = document.getElementById("endBtn");
  const hint = document.getElementById("stageHint");

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
    bookmarks: readBookmarks(),
    player: null
  };

  const roomEls = new Map();
  const projectedRooms = new Map();
  let resizeRenderTimer = 0;

  function readBookmarks() {
    try {
      return JSON.parse(window.localStorage.getItem(data.stateKey) || "{}").bookmarks || [];
    } catch {
      return [];
    }
  }

  function writeBookmarks() {
    window.localStorage.setItem(data.stateKey, JSON.stringify({ bookmarks: state.bookmarks }));
  }

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
    const layoutScale = clamp(minSide / 760, 0.52, 1.28);
    const depth = 1 + (z / 1200);
    const breathe = STATIC_FLOWER_MODE ? 1 : 1 + (Math.sin((time / 1400) + (x * 0.02) + (y * 0.01)) * 0.012);
    const maxSelectedScale = Math.max(0.72, (minSide - 32) / Math.max(1, room.radius * 2));
    const selectedBoost = selected ? Math.min(1.82, maxSelectedScale) : 1;
    return {
      x: selected ? rect.width / 2 : (rect.width / 2) + (x * layoutScale),
      y: selected ? rect.height / 2 : (rect.height / 2) + (y * layoutScale),
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
        <span class="playback-time">0%</span>
        <div class="playback-actions">
          <button type="button" data-playback-action="hold">Hold</button>
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
      if (actionButton.dataset.playbackAction === "hold") togglePause();
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
    syncYouTunerPanel(roomEl);
    setYouAudioFrequency(state.youTuner.selectedFrequency);
  }

  function stepYouFrequency(roomEl, delta) {
    updateYouManualFrequency(roomEl, state.youTuner.selectedFrequency + delta);
  }

  function getYouActionLabel(action) {
    if (action.kind !== "youTuner") return action.label;
    return "Find frequency";
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

  function setRoomPlayback(roomId, progress, label = "") {
    const el = roomEls.get(roomId);
    if (!el) return;
    const percent = clamp(progress, 0, 1);
    el.style.setProperty("--journey-progress", `${percent * 360}deg`);
    const time = el.querySelector(".playback-time");
    if (time) time.textContent = label || `${Math.round(percent * 100)}%`;
  }

  function showRoomPlayback(room, title) {
    const el = roomEls.get(room.id);
    if (!el) return;
    const titleEl = el.querySelector(".playback-title");
    const holdButton = el.querySelector('[data-playback-action="hold"]');
    if (titleEl) titleEl.textContent = title || room.name;
    if (holdButton) holdButton.textContent = "Hold";
    setRoomPlayback(room.id, 0);
    el.classList.add("is-playing");
  }

  function hideRoomPlayback(roomId) {
    const el = roomEls.get(roomId);
    if (!el) return;
    const holdButton = el.querySelector('[data-playback-action="hold"]');
    if (holdButton) holdButton.textContent = "Hold";
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
    if (state.playingId) {
      const holdButton = roomEls.get(state.playingId)?.querySelector('[data-playback-action="hold"]');
      if (holdButton) holdButton.textContent = label;
    }
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
    invitation.classList.remove("is-hidden");
    roomType.textContent = room.type === "origin" ? "Origin" : "Resonance room";
    roomTitle.textContent = room.name;
    roomText.textContent = room.phrase;
    beginBtn.hidden = true;
    bookmarkBtn.hidden = room.id === "you";
    bookmarkBtn.textContent = state.bookmarks.includes(room.id) ? "Bookmarked" : "Bookmark";
    refreshRoomMenu(room);
    rerenderStaticLayout();
    hint.textContent = STATIC_FLOWER_MODE
      ? "Choose a journey in this room, or return to You."
      : "The universe is turning this room toward you.";
  }

  function returnToYou() {
    const hasYouAudio = Boolean(state.youTuner.audio);
    releaseJourneyWakeLock();
    if (state.player) state.player.end();
    stopYouSweep({ fadeSeconds: hasYouAudio ? YOU_MANUAL_END_FADE_SECONDS : 0.18 });
    state.youTuner.phase = "idle";
    refreshRoomMenu(findRoom("you"));
    state.selectedId = null;
    state.playingId = null;
    stage.classList.remove("journey-active");
    roomEls.forEach((_, roomId) => hideRoomPlayback(roomId));
    invitation.classList.add("is-hidden");
    status.classList.add("is-hidden");
    journeyProgress.style.width = "0%";
    pauseBtn.textContent = "Hold";
    hint.textContent = STATIC_FLOWER_MODE
      ? "Select a point in the field. Every journey starts and ends with you."
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
    const journey = library[action.journeyId];
    if (!journey || !playerApi) {
      roomText.textContent = "This room is ready visually. Its journey is not connected yet.";
      return;
    }
    invitation.classList.add("is-hidden");
    status.classList.add("is-hidden");
    stage.classList.add("journey-active");
    state.playingId = room.id;
    requestJourneyWakeLock();
    rerenderStaticLayout();
    showRoomPlayback(room, action.label || journey.name || room.name);
    journeyRoom.textContent = room.name;
    journeyTitle.textContent = action.label || journey.name || room.name;
    journeyText.textContent = room.phrase;
    state.player = playerApi.createPlayer({
      onTick: (snapshot) => {
        journeyProgress.style.width = `${Math.round(snapshot.progress * 100)}%`;
        setRoomPlayback(room.id, snapshot.progress);
      },
      onComplete: () => completeJourney(room),
      onEnded: () => completeJourney(room)
    });
    await state.player.start(clone(journey));
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
    state.youTuner.audio = { ctx, left, right, master, updateTimer: 0 };
    return state.youTuner.audio;
  }

  function rampYouMaster(value, seconds) {
    const audio = state.youTuner.audio;
    if (!audio) return;
    const time = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(time);
    audio.master.gain.setValueAtTime(audio.master.gain.value, time);
    audio.master.gain.linearRampToValueAtTime(value, time + seconds);
  }

  function setYouAudioFrequency(frequency, bindiff = 0) {
    const audio = state.youTuner.audio;
    if (!audio) return;
    const time = audio.ctx.currentTime;
    audio.left.frequency.setTargetAtTime(frequency, time, 0.025);
    audio.right.frequency.setTargetAtTime(frequency + bindiff, time, 0.025);
  }

  function startYouSweep(room) {
    const audio = ensureYouAudio();
    if (!audio) {
      roomText.textContent = "Audio could not start in this browser.";
      return;
    }
    audio.ctx.resume().catch(() => {});
    state.youTuner.phase = "sweeping";
    state.youTuner.sweepStartedAt = nowSeconds();
    state.youTuner.sweepElapsedSec = 0;
    const sweep = getSweepPosition();
    state.youTuner.sweepDirection = sweep.direction;
    state.youTuner.selectedFrequency = sweep.frequency;
    setYouAudioFrequency(state.youTuner.selectedFrequency);
    syncYouTunerPanel(roomEls.get(room.id));
    window.clearInterval(audio.updateTimer);
    audio.updateTimer = window.setInterval(() => updateYouSweep(room), 50);
    rampYouMaster(0.2, 3);
    roomText.textContent = "Listen for the point that feels right. Hold to adjust, then press Let's go.";
    refreshRoomMenu(room);
  }

  function updateYouSweep(room) {
    if (state.youTuner.phase !== "sweeping") return;
    const sweep = getSweepPosition();
    state.youTuner.sweepDirection = sweep.direction;
    state.youTuner.selectedFrequency = round(sweep.frequency, 2);
    setYouAudioFrequency(state.youTuner.selectedFrequency);
    syncYouTunerPanel(roomEls.get(room.id));
  }

  function stopYouSweep(options = {}) {
    const audio = state.youTuner.audio;
    if (!audio) return;
    window.clearInterval(audio.updateTimer);
    if (options.keepPreview) return;
    rampYouMaster(0, options.fadeSeconds ?? 0.18);
  }

  function pauseYouSweep() {
    if (state.youTuner.phase !== "sweeping") return;
    const audio = state.youTuner.audio;
    const sweep = getSweepPosition();
    state.youTuner.sweepElapsedSec = nowSeconds() - state.youTuner.sweepStartedAt;
    state.youTuner.sweepDirection = sweep.direction;
    state.youTuner.phase = "paused";
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
    rampYouMaster(0.2, 0.08);
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
      roomText.textContent = "The Tuner engine is not available here.";
      return;
    }
    const roomEl = roomEls.get(room.id);
    try {
      stopYouSweep({ keepPreview: true });
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
      invitation.classList.add("is-hidden");
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
      roomText.textContent = "Journey could not start. Adjust frequency or press Let's go again.";
      refreshRoomMenu(room);
      syncYouTunerPanel(roomEl);
      const audio = ensureYouAudio();
      if (audio) {
        audio.ctx.resume().catch(() => {});
        setYouAudioFrequency(state.youTuner.selectedFrequency, 0);
        rampYouMaster(0.2, 0.08);
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
      rafId: 0
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

    function applyAtCurrentTime() {
      const values = playerApi.evaluateAt(playerState.journey, playerState.currentTime);
      setYouAudioFrequency(values.lHz, values.signedDiffHz);
      if (state.youTuner.audio) {
        const master = clamp(values.masterAmplitude * YOU_JOURNEY_MASTER_GAIN, 0, YOU_JOURNEY_MASTER_GAIN);
        rampYouMaster(master, 0.08);
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
        rampYouMaster(0, 1.2);
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
        applyAtCurrentTime();
        stopLoop();
        playerState.rafId = requestAnimationFrame(tick);
      },
      pause() {
        if (!playerState.playing) return;
        playerState.currentTime = clamp(nowSeconds() - playerState.startedAt, 0, playerState.journey.durationSec);
        playerState.playing = false;
        playerState.paused = true;
        stopLoop();
        applyAtCurrentTime();
      },
      resume() {
        if (!playerState.paused) return;
        playerState.playing = true;
        playerState.paused = false;
        playerState.startedAt = nowSeconds() - playerState.currentTime;
        applyAtCurrentTime();
        stopLoop();
        playerState.rafId = requestAnimationFrame(tick);
      },
      end() {
        if (!playerState.playing && !playerState.paused) return;
        playerState.playing = false;
        playerState.paused = false;
        stopLoop();
        rampYouMaster(0, 2);
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
    invitation.classList.remove("is-hidden");
    state.playingId = null;
    state.player = null;
    roomType.textContent = "Return";
    roomTitle.textContent = "YOU";
    roomText.textContent = `${room.name} has returned to the center.`;
    beginBtn.hidden = true;
    state.selectedId = "you";
    orientUniverseTo(findRoom("you"));
    rerenderStaticLayout();
  }

  function toggleBookmark() {
    const id = state.selectedId;
    if (!id || id === "you") return;
    if (state.bookmarks.includes(id)) {
      state.bookmarks = state.bookmarks.filter((item) => item !== id);
    } else {
      state.bookmarks = [...state.bookmarks, id];
    }
    writeBookmarks();
    bookmarkBtn.textContent = state.bookmarks.includes(id) ? "Bookmarked" : "Bookmark";
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
      if (event.target.closest(".room-field, .room-invitation, .journey-status")) return;
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
      if (event.target.closest(".room-field, .room-invitation, .journey-status")) return;
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
      hint.textContent = "Select a point in the field. Every journey starts and ends with you.";
    }
    data.rooms.forEach(makeRoom);
    attachStageGestures();
    returnBtn.addEventListener("click", returnToYou);
    bookmarkBtn.addEventListener("click", toggleBookmark);
    pauseBtn.addEventListener("click", togglePause);
    endBtn.addEventListener("click", returnToYou);
    document.addEventListener("visibilitychange", restoreJourneyWakeLock);
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeRenderTimer);
      resizeRenderTimer = window.setTimeout(rerenderStaticLayout, 80);
    });
    render();
  }

  init();
})();
