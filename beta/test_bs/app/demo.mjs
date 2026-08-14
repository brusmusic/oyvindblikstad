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
  voicePrompt: $("voicePrompt"),
  voicePromptText: $("voicePromptText"),
  entryProgress: $("entryProgress"),
  profileOutput: $("profileOutput"),
  capabilitiesOutput: $("capabilitiesOutput"),
  debugStatus: $("debugStatus"),
  breathCanvas: $("breathCanvas"),
  breathRate: $("breathRate"),
  cycleDuration: $("cycleDuration"),
  confidence: $("confidence"),
  motionQuality: $("motionQuality"),
  reportPanel: $("reportPanel"),
  reportSignal: $("reportSignal"),
  reportPlacement: $("reportPlacement"),
  reportTransition: $("reportTransition"),
  reportNotes: $("reportNotes"),
  addReportBtn: $("addReportBtn"),
  copyReportBtn: $("copyReportBtn"),
  downloadReportsBtn: $("downloadReportsBtn"),
  reportStatus: $("reportStatus"),
  reportExport: $("reportExport")
};

let entry = new AdaptiveEntryController();
let capabilities = null;
let currentProfile = null;
let currentRun = null;
let latestReport = null;
const REPORTS_KEY = "adaptive-entry-reports-v1";
const VOICE_PROMPT = "I am amazing. Sometimes I forget. But here I am.";

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
  currentProfile = profile;
  els.profileOutput.textContent = JSON.stringify(profile, null, 2);
  els.breathRate.textContent = profile?.breath?.detected ? profile.breath.breathsPerMinute.toFixed(1) : "--";
  els.cycleDuration.textContent = profile?.breath?.detected ? seconds(profile.breath.cycleDuration) : "--";
  els.confidence.textContent = percent(profile?.breath?.confidence);
  els.motionQuality.textContent = percent(profile?.motion?.signalQuality);
  drawSignal(profile?.debug?.breath);
}

function readReports() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeReports(reports) {
  let trimmed = reports.slice(-30);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(trimmed));
  } catch {
    trimmed = reports.slice(-10);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(trimmed));
  }
  return trimmed.length;
}

function reportSummary(profile) {
  return {
    breathDetected: Boolean(profile?.breath?.detected),
    breathsPerMinute: profile?.breath?.breathsPerMinute ?? null,
    cycleDuration: profile?.breath?.cycleDuration ?? null,
    inhaleDuration: profile?.breath?.inhaleDuration ?? null,
    exhaleDuration: profile?.breath?.exhaleDuration ?? null,
    breathConfidence: profile?.breath?.confidence ?? null,
    breathPhaseConfidence: profile?.breath?.phaseConfidence ?? null,
    motionSignalQuality: profile?.motion?.signalQuality ?? null,
    voiceFrequency: profile?.voice?.fundamentalHz ?? profile?.voice?.frequency ?? null,
    voiceConfidence: profile?.voice?.confidence ?? null,
    voiceActivity: profile?.voice?.voiceActivity ?? null,
    voiceIntensityRms: profile?.voice?.intensityRms ?? null,
    voicePitchVariabilityCents: profile?.voice?.pitchVariabilityCents ?? null,
    globalTuneFrequency: profile?.globalTune?.frequency ?? null,
    motionBestKey: profile?.motion?.bestKey ?? profile?.debug?.breath?.bestKey ?? null,
    warmupSec: profile?.motion?.warmupSec ?? profile?.debug?.breath?.warmupSec ?? null,
    breathPeaks: profile?.debug?.breath?.peaks?.length ?? null,
    breathTroughs: profile?.debug?.breath?.troughs?.length ?? null
  };
}

function createReport() {
  if (!currentProfile) return null;
  const now = new Date();
  return {
    schema: "adaptive-entry-report-v1",
    id: `entry-${now.toISOString()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.toISOString(),
    page: {
      href: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      secureContext: window.isSecureContext,
      screen: {
        width: window.screen?.width ?? null,
        height: window.screen?.height ?? null,
        devicePixelRatio: window.devicePixelRatio ?? null
      }
    },
    run: currentRun,
    observer: {
      signalFelt: els.reportSignal?.value || "uncertain",
      phonePlacement: els.reportPlacement?.value || "unknown",
      transitionTest: els.reportTransition?.value || "not_tested",
      notes: els.reportNotes?.value.trim() || ""
    },
    summary: reportSummary(currentProfile),
    capabilities,
    profile: currentProfile
  };
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  els.reportExport.focus();
  els.reportExport.select();
  return document.execCommand("copy");
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function addReport() {
  const report = createReport();
  if (!report) {
    els.reportStatus.textContent = "No completed measurement to report yet.";
    return;
  }
  const reports = readReports();
  reports.push(report);
  const storedCount = writeReports(reports);
  latestReport = report;
  const text = JSON.stringify(report, null, 2);
  els.reportExport.value = text;
  try {
    await copyText(text);
    els.reportStatus.textContent = `Report added and copied. Stored locally: ${storedCount}.`;
  } catch {
    els.reportStatus.textContent = `Report added. Stored locally: ${storedCount}. Copy it from the box below.`;
  }
}

async function copyLatestReport() {
  const reports = readReports();
  const report = latestReport || reports[reports.length - 1];
  if (!report) {
    els.reportStatus.textContent = "No report has been added yet.";
    return;
  }
  const text = JSON.stringify(report, null, 2);
  els.reportExport.value = text;
  await copyText(text);
  els.reportStatus.textContent = "Latest report copied.";
}

function downloadReports() {
  const reports = readReports();
  if (!reports.length) {
    els.reportStatus.textContent = "No reports to download yet.";
    return;
  }
  downloadJson(`adaptive-entry-reports-${new Date().toISOString().slice(0, 10)}.json`, reports);
  els.reportStatus.textContent = `Downloaded ${reports.length} reports.`;
}

function setProgress(value) {
  els.entryProgress.style.setProperty("--progress", `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`);
}

async function start(options) {
  entry.abort();
  entry = new AdaptiveEntryController();
  currentProfile = null;
  latestReport = null;
  currentRun = {
    mode: options.voice ? "breath_voice" : "breath",
    requestedDurationSec: Number(els.durationInput.value) || 45,
    voicePrompt: options.voice ? VOICE_PROMPT : null,
    startedAt: new Date().toISOString()
  };
  els.reportPanel.hidden = true;
  els.reportExport.value = "";
  els.voicePrompt.hidden = !options.voice;
  setProgress(0);
  els.entryTitle.textContent = options.voice ? "Read the sentence." : "Place the phone and breathe normally.";
  els.entryInstruction.textContent = options.voice
    ? "Allow microphone access, read once in your normal voice, then wait for the next instruction."
    : "The phone is listening for small rhythmic motion from your breath.";
  els.debugStatus.textContent = "Preparing";
  try {
    const profile = await entry.run({
      durationSec: Number(els.durationInput.value) || 45,
      detectVoicePitch: Boolean(options.voice),
      voiceDurationSec: 7,
      voicePrepareSec: 3,
      placementDelaySec: options.voice ? 5 : 0,
      onUpdate(update) {
        els.debugStatus.textContent = update.state;
        if (Number.isFinite(update.progress)) setProgress(update.progress);
        if (update.state === "REQUESTING_MOTION_ACCESS") {
          els.entryTitle.textContent = "Allow motion access.";
          els.entryInstruction.textContent = "This lets the phone read the small movement from your breath after the voice check.";
        }
        if (update.state === "REQUESTING_MIC_ACCESS") {
          els.voicePrompt.hidden = false;
          els.entryTitle.textContent = "Allow microphone access.";
          els.entryInstruction.textContent = "The sentence will be recorded after a short pause.";
        }
        if (update.state === "PREPARE_VOICE") {
          els.voicePrompt.hidden = false;
          els.entryTitle.textContent = "Get ready to read.";
          els.entryInstruction.textContent = "When the bar fills, read the sentence once in your normal voice.";
        }
        if (update.state === "SENSING_VOICE") {
          els.voicePrompt.hidden = false;
          els.entryTitle.textContent = "Read now.";
          els.entryInstruction.textContent = `Use your normal voice. Voice level: ${percent(Math.min(1, (update.voiceLevel || 0) / 0.08))}`;
        }
        if (update.state === "VOICE_ACQUIRED") {
          els.entryTitle.textContent = "Voice captured.";
          els.entryInstruction.textContent = "Now place the phone gently on your belly.";
          if (update.profile) showProfile(update.profile);
        }
        if (update.state === "PLACE_PHONE") {
          els.voicePrompt.hidden = true;
          els.entryTitle.textContent = "Place the phone on your belly.";
          els.entryInstruction.textContent = "Keep it still. Breath sensing starts in a few seconds.";
        }
        if (update.state === "SENSING_BREATH") {
          els.voicePrompt.hidden = true;
          els.entryTitle.textContent = "Stay just as you are.";
          els.entryInstruction.textContent = "The phone is listening for small rhythmic motion from your breath.";
        }
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
    currentRun.completedAt = new Date().toISOString();
    currentRun.completed = true;
    els.entryTitle.textContent = profile.breath.detected ? "Ready to meet you there." : "Use fallback entry.";
    els.entryInstruction.textContent = profile.breath.detected
      ? "The profile can now be handed to Composer."
      : "The module did not pretend to know more than it knows.";
    showProfile(profile);
    els.reportPanel.hidden = false;
    els.voicePrompt.hidden = true;
  } catch (error) {
    currentRun.completedAt = new Date().toISOString();
    currentRun.completed = false;
    currentRun.error = error.message || "Unknown error";
    els.debugStatus.textContent = "Error";
    els.entryTitle.textContent = "Sensor access failed.";
    els.entryInstruction.textContent = error.message || "The phone did not provide motion data.";
    els.profileOutput.textContent = JSON.stringify({ error: error.message }, null, 2);
    els.voicePrompt.hidden = true;
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
    els.voicePrompt.hidden = true;
  });
  els.addReportBtn.addEventListener("click", addReport);
  els.copyReportBtn.addEventListener("click", copyLatestReport);
  els.downloadReportsBtn.addEventListener("click", downloadReports);
  capabilities = await detectDeviceCapabilities();
  els.capabilitiesOutput.textContent = JSON.stringify(capabilities, null, 2);
  drawSignal(null);
}

boot();
