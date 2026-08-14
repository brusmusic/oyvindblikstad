import { AdaptiveEntryController } from "./index.mjs";
import { detectDeviceCapabilities } from "./DeviceCapabilities.mjs";

const $ = (id) => document.getElementById(id);

const els = {
  startBreathBtn: $("startBreathBtn"),
  startFullBtn: $("startFullBtn"),
  stopBtn: $("stopBtn"),
  durationInput: $("durationInput"),
  durationValue: $("durationValue"),
  entryTitle: $("entryTitle"),
  entryInstruction: $("entryInstruction"),
  entryProgress: $("entryProgress"),
  profileOutput: $("profileOutput"),
  capabilitiesOutput: $("capabilitiesOutput"),
  debugStatus: $("debugStatus"),
  breathCanvas: $("breathCanvas"),
  breathRate: $("breathRate"),
  cycleDuration: $("cycleDuration"),
  confidence: $("confidence"),
  motionQuality: $("motionQuality")
};

let entry = new AdaptiveEntryController();

function percent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : "--";
}

function seconds(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} sec` : "--";
}

function drawSignal(debug) {
  const canvas = els.breathCanvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, rect.width);
  const height = Math.max(160, rect.height || width / 3.2);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(8, 14, 14, 0.52)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(207, 234, 225, 0.12)";
  for (let i = 0; i <= 4; i += 1) {
    const y = (i / 4) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  const signal = debug?.signal || [];
  if (!signal.length) {
    ctx.fillStyle = "rgba(174, 187, 183, 0.8)";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("No breath signal yet.", 18, 32);
    return;
  }
  const spread = Math.max(0.35, Math.max(...signal.map(Math.abs)));
  ctx.strokeStyle = "#9ad4c8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  signal.forEach((value, index) => {
    const x = (index / Math.max(1, signal.length - 1)) * width;
    const y = (height / 2) - ((value / spread) * (height * 0.38));
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const duration = signal.length / (debug?.sampleRate || 20);
  const drawMarkers = (times, color) => {
    ctx.fillStyle = color;
    times.forEach((time) => {
      const x = (time / duration) * width;
      ctx.beginPath();
      ctx.arc(x, height * 0.18, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  drawMarkers(debug.peaks || [], "#d5b96e");
  drawMarkers(debug.troughs || [], "#f09a86");
}

function showProfile(profile) {
  els.profileOutput.textContent = JSON.stringify(profile, null, 2);
  els.breathRate.textContent = profile?.breath?.detected ? profile.breath.breathsPerMinute.toFixed(1) : "--";
  els.cycleDuration.textContent = profile?.breath?.detected ? seconds(profile.breath.cycleDuration) : "--";
  els.confidence.textContent = percent(profile?.breath?.confidence);
  els.motionQuality.textContent = percent(profile?.motion?.signalQuality);
  drawSignal(profile?.debug?.breath);
}

function setProgress(value) {
  els.entryProgress.style.setProperty("--progress", `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`);
}

async function start(options) {
  entry.abort();
  entry = new AdaptiveEntryController();
  setProgress(0);
  els.entryTitle.textContent = "Stay just as you are.";
  els.entryInstruction.textContent = "The phone is listening for small rhythmic motion from your breath.";
  els.debugStatus.textContent = "Preparing";
  try {
    const profile = await entry.run({
      durationSec: Number(els.durationInput.value) || 45,
      detectVoicePitch: Boolean(options.voice),
      onUpdate(update) {
        els.debugStatus.textContent = update.state;
        if (Number.isFinite(update.progress)) setProgress(update.progress);
        if (update.state === "BREATH_ACQUIRED") {
          els.entryTitle.textContent = "Got it.";
          els.entryInstruction.textContent = "A usable breath rhythm was detected.";
        }
        if (update.state === "BREATH_UNKNOWN") {
          els.entryTitle.textContent = "Still listening.";
          els.entryInstruction.textContent = "The signal was uncertain. Composer should use a gentle fallback.";
        }
        if (update.profile) showProfile(update.profile);
      }
    });
    setProgress(1);
    els.entryTitle.textContent = profile.breath.detected ? "Ready to meet you there." : "Use fallback entry.";
    els.entryInstruction.textContent = profile.breath.detected
      ? "The profile can now be handed to Composer."
      : "The module did not pretend to know more than it knows.";
    showProfile(profile);
  } catch (error) {
    els.debugStatus.textContent = "Error";
    els.entryTitle.textContent = "Sensor access failed.";
    els.entryInstruction.textContent = error.message || "The phone did not provide motion data.";
    els.profileOutput.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

async function boot() {
  els.durationInput.addEventListener("input", () => {
    els.durationValue.textContent = `${els.durationInput.value} sec`;
  });
  els.startBreathBtn.addEventListener("click", () => start({ voice: false }));
  els.startFullBtn.addEventListener("click", () => start({ voice: true }));
  els.stopBtn.addEventListener("click", () => {
    entry.abort();
    els.debugStatus.textContent = "Stopped";
    els.entryTitle.textContent = "Stopped.";
    els.entryInstruction.textContent = "You can start again when ready.";
  });
  const capabilities = await detectDeviceCapabilities();
  els.capabilitiesOutput.textContent = JSON.stringify(capabilities, null, 2);
  drawSignal(null);
}

boot();
