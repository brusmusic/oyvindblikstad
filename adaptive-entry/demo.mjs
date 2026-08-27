import { AdaptiveEntryController } from "./index.mjs?v=3.8";
import { detectDeviceCapabilities, requestMotionPermission } from "./DeviceCapabilities.mjs?v=1.9";

const $ = (id) => document.getElementById(id);

const els = {
  startBreathBtn: $("startBreathBtn"),
  startFullBtn: $("startFullBtn"),
  stopBtn: $("stopBtn"),
  phoneOrientationSelect: $("phoneOrientationSelect"),
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
  spectralStatus: $("spectralStatus"),
  spectralCanvas: $("spectralCanvas"),
  spectralRate: $("spectralRate"),
  spectralCycle: $("spectralCycle"),
  spectralBreath: $("spectralBreath"),
  spectralConfidence: $("spectralConfidence"),
  bodyLiftStatus: $("bodyLiftStatus"),
  bodyLiftCanvas: $("bodyLiftCanvas"),
  bodyLiftRate: $("bodyLiftRate"),
  bodyLiftCycle: $("bodyLiftCycle"),
  bodyLiftBreath: $("bodyLiftBreath"),
  bodyLiftConfidence: $("bodyLiftConfidence"),
  phaseStateStatus: $("phaseStateStatus"),
  phaseStateCanvas: $("phaseStateCanvas"),
  phaseStateRate: $("phaseStateRate"),
  phaseStateCycle: $("phaseStateCycle"),
  phaseStateBreath: $("phaseStateBreath"),
  phaseStateConfidence: $("phaseStateConfidence"),
  reportPanel: $("reportPanel"),
  reportSignal: $("reportSignal"),
  reportPlacement: $("reportPlacement"),
  reportTransition: $("reportTransition"),
  reportNotes: $("reportNotes"),
  addReportBtn: $("addReportBtn"),
  copyReportBtn: $("copyReportBtn"),
  downloadReportsBtn: $("downloadReportsBtn"),
  clearReportsBtn: $("clearReportsBtn"),
  appVersionStatus: $("appVersionStatus"),
  reportStatus: $("reportStatus"),
  reportExport: $("reportExport")
};

let entry = new AdaptiveEntryController();
let capabilities = null;
let currentProfile = null;
let currentRun = null;
let latestReport = null;
const REPORTS_KEY = "adaptive-entry-reports-v1";
const APP_VERSION = "abe-local-v3.8-golden-tempo-prior";
const VOICE_PROMPT = "I am amazing. Sometimes I forget. But here I am.";

function percent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : "--";
}

function seconds(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} sec` : "--";
}

function drawSignal(debug, canvas = els.breathCanvas, colors = {}) {
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
  ctx.strokeStyle = colors.line || "#9ad4c8";
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
  drawMarkers(debug.peaks || [], colors.peaks || "#d5b96e");
  drawMarkers(debug.troughs || [], colors.troughs || "#f09a86");
}

function showProfile(profile) {
  currentProfile = profile;
  els.profileOutput.textContent = JSON.stringify(profile, null, 2);
  els.breathRate.textContent = profile?.breath?.detected ? profile.breath.breathsPerMinute.toFixed(1) : "--";
  els.cycleDuration.textContent = profile?.breath?.detected ? seconds(profile.breath.cycleDuration) : "--";
  els.confidence.textContent = percent(profile?.breath?.confidence);
  els.motionQuality.textContent = percent(profile?.motion?.signalQuality);
  drawSignal(profile?.debug?.breath);
  const spectral = profile?.spectralBreath;
  els.spectralStatus.textContent = spectral?.detected
    ? `${spectral.key || "motion"}${spectral.phaseKey && spectral.phaseKey !== spectral.key ? ` / ${spectral.phaseKey}` : ""} · ${spectral.phaseAssist || (spectral.phaseReliable ? "phase" : "tempo")}`
    : "No spectral lock";
  els.spectralRate.textContent = spectral?.detected && Number.isFinite(spectral.breathsPerMinute) ? spectral.breathsPerMinute.toFixed(1) : "--";
  els.spectralCycle.textContent = spectral?.detected ? seconds(spectral.cycleDuration) : "--";
  els.spectralBreath.textContent = spectral?.detected
    ? `${spectral.inhaleDuration.toFixed(1)} / ${spectral.exhaleDuration.toFixed(1)}`
    : "--";
  els.spectralConfidence.textContent = percent(spectral?.confidence);
  drawSignal(profile?.debug?.spectralBreath, els.spectralCanvas, {
    line: "#8ea7ff",
    peaks: "#d5b96e",
    troughs: "#f09a86"
  });
  const bodyLift = profile?.bodyLiftBreath;
  els.bodyLiftStatus.textContent = bodyLift?.detected
    ? `${bodyLift.key || "gravity"} · ${bodyLift.polarity || "positive"} · ${bodyLift.phaseReliable ? "phase" : "tempo"}`
    : "No body lift lock";
  els.bodyLiftRate.textContent = bodyLift?.detected && Number.isFinite(bodyLift.breathsPerMinute) ? bodyLift.breathsPerMinute.toFixed(1) : "--";
  els.bodyLiftCycle.textContent = bodyLift?.detected ? seconds(bodyLift.cycleDuration) : "--";
  els.bodyLiftBreath.textContent = bodyLift?.detected
    ? `${bodyLift.inhaleDuration.toFixed(1)} / ${bodyLift.exhaleDuration.toFixed(1)}`
    : "--";
  els.bodyLiftConfidence.textContent = percent(bodyLift?.confidence);
  drawSignal(profile?.debug?.bodyLiftBreath, els.bodyLiftCanvas, {
    line: "#a8e0a2",
    peaks: "#d5b96e",
    troughs: "#f09a86"
  });
  const phaseState = profile?.phaseStateBreath;
  els.phaseStateStatus.textContent = phaseState?.detected
    ? `${phaseState.key || "motion"} · ${phaseState.polarity || "positive"} · ${phaseState.phaseState || "phase"}`
    : "No phase state lock";
  els.phaseStateRate.textContent = phaseState?.detected && Number.isFinite(phaseState.breathsPerMinute) ? phaseState.breathsPerMinute.toFixed(1) : "--";
  els.phaseStateCycle.textContent = phaseState?.detected ? seconds(phaseState.cycleDuration) : "--";
  els.phaseStateBreath.textContent = phaseState?.detected
    ? `${phaseState.inhaleDuration.toFixed(1)} / ${phaseState.exhaleDuration.toFixed(1)}`
    : "--";
  els.phaseStateConfidence.textContent = percent(phaseState?.confidence);
  drawSignal(profile?.debug?.phaseStateBreath, els.phaseStateCanvas, {
    line: "#f0c36a",
    peaks: "#d5b96e",
    troughs: "#f09a86"
  });
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
    phoneOrientation: profile?.context?.phoneOrientation ?? null,
    breathDetected: Boolean(profile?.breath?.detected),
    breathUsable: Boolean(profile?.breath?.usable),
    breathQualityLabel: profile?.breath?.qualityLabel ?? null,
    breathsPerMinute: profile?.breath?.breathsPerMinute ?? null,
    cycleDuration: profile?.breath?.cycleDuration ?? null,
    inhaleDuration: profile?.breath?.inhaleDuration ?? null,
    exhaleDuration: profile?.breath?.exhaleDuration ?? null,
    breathConfidence: profile?.breath?.confidence ?? null,
    breathPhaseConfidence: profile?.breath?.phaseConfidence ?? null,
    breathPhaseReliable: profile?.breath?.phaseReliable ?? null,
    breathPhaseInverted: profile?.breath?.phaseInverted ?? null,
    breathPhaseBalance: profile?.breath?.phaseBalance ?? null,
    breathDurationSource: profile?.breath?.durationSource ?? null,
    motionSignalQuality: profile?.motion?.signalQuality ?? null,
    voiceFrequency: profile?.voice?.fundamentalHz ?? profile?.voice?.frequency ?? null,
    voiceConfidence: profile?.voice?.confidence ?? null,
    voiceActivity: profile?.voice?.voiceActivity ?? null,
    voiceIntensityRms: profile?.voice?.intensityRms ?? null,
    voicePitchVariabilityCents: profile?.voice?.pitchVariabilityCents ?? null,
    globalTuneFrequency: profile?.globalTune?.frequency ?? null,
    motionBestKey: profile?.motion?.bestKey ?? profile?.debug?.breath?.bestKey ?? null,
    breathSelectionReason: profile?.debug?.breath?.selectionReason ?? null,
    spectralBreathDetected: Boolean(profile?.spectralBreath?.detected),
    spectralBreathUsable: Boolean(profile?.spectralBreath?.usable),
    spectralBreathsPerMinute: profile?.spectralBreath?.breathsPerMinute ?? null,
    spectralCycleDuration: profile?.spectralBreath?.cycleDuration ?? null,
    spectralInhaleDuration: profile?.spectralBreath?.inhaleDuration ?? null,
    spectralExhaleDuration: profile?.spectralBreath?.exhaleDuration ?? null,
    spectralConfidence: profile?.spectralBreath?.confidence ?? null,
    spectralPhaseConfidence: profile?.spectralBreath?.phaseConfidence ?? null,
    spectralPhaseReliable: profile?.spectralBreath?.phaseReliable ?? null,
    spectralPhaseAssist: profile?.spectralBreath?.phaseAssist ?? null,
    spectralBestKey: profile?.spectralBreath?.key ?? profile?.debug?.spectralBreath?.bestKey ?? null,
    spectralPhaseKey: profile?.spectralBreath?.phaseKey ?? profile?.debug?.spectralBreath?.phaseKey ?? null,
    spectralAutocorrelationCycle: profile?.debug?.spectralBreath?.autocorrelationCycle ?? null,
    spectralCycleFromDft: profile?.debug?.spectralBreath?.spectralCycle ?? null,
    spectralAgreement: profile?.debug?.spectralBreath?.agreement ?? null,
    spectralPhaseAgreementToTempo: profile?.debug?.spectralBreath?.phaseAgreementToTempo ?? null,
    spectralResolvedDoubleCycle: profile?.debug?.spectralBreath?.resolvedDoubleCycle ?? null,
    bodyLiftBreathDetected: Boolean(profile?.bodyLiftBreath?.detected),
    bodyLiftBreathUsable: Boolean(profile?.bodyLiftBreath?.usable),
    bodyLiftBreathsPerMinute: profile?.bodyLiftBreath?.breathsPerMinute ?? null,
    bodyLiftCycleDuration: profile?.bodyLiftBreath?.cycleDuration ?? null,
    bodyLiftInhaleDuration: profile?.bodyLiftBreath?.inhaleDuration ?? null,
    bodyLiftExhaleDuration: profile?.bodyLiftBreath?.exhaleDuration ?? null,
    bodyLiftConfidence: profile?.bodyLiftBreath?.confidence ?? null,
    bodyLiftPhaseReliable: profile?.bodyLiftBreath?.phaseReliable ?? null,
    bodyLiftBestKey: profile?.bodyLiftBreath?.key ?? profile?.debug?.bodyLiftBreath?.bestKey ?? null,
    bodyLiftPolarity: profile?.bodyLiftBreath?.polarity ?? profile?.debug?.bodyLiftBreath?.liftPolarity ?? null,
    bodyLiftAlternateInhaleDuration: profile?.debug?.bodyLiftBreath?.alternateInhaleDuration ?? null,
    bodyLiftAlternateExhaleDuration: profile?.debug?.bodyLiftBreath?.alternateExhaleDuration ?? null,
    phaseStateBreathDetected: Boolean(profile?.phaseStateBreath?.detected),
    phaseStateBreathUsable: Boolean(profile?.phaseStateBreath?.usable),
    phaseStateBreathsPerMinute: profile?.phaseStateBreath?.breathsPerMinute ?? null,
    phaseStateCycleDuration: profile?.phaseStateBreath?.cycleDuration ?? null,
    phaseStateInhaleDuration: profile?.phaseStateBreath?.inhaleDuration ?? null,
    phaseStateExhaleDuration: profile?.phaseStateBreath?.exhaleDuration ?? null,
    phaseStateConfidence: profile?.phaseStateBreath?.confidence ?? null,
    phaseStatePhaseReliable: profile?.phaseStateBreath?.phaseReliable ?? null,
    phaseStateBestKey: profile?.phaseStateBreath?.key ?? profile?.debug?.phaseStateBreath?.bestKey ?? null,
    phaseStatePolarity: profile?.phaseStateBreath?.polarity ?? profile?.debug?.phaseStateBreath?.polarity ?? null,
    phaseStateCycleFromPeaks: profile?.debug?.phaseStateBreath?.cycleFromPeaks ?? null,
    phaseStateCycleFromRising: profile?.debug?.phaseStateBreath?.cycleFromRising ?? null,
    phaseStateRawInhaleDuration: profile?.debug?.phaseStateBreath?.rawInhaleDuration ?? null,
    phaseStateRawExhaleDuration: profile?.debug?.phaseStateBreath?.rawExhaleDuration ?? null,
    phaseStatePlateauShare: profile?.debug?.phaseStateBreath?.plateauShare ?? null,
    bridgeBreathDetected: Boolean(profile?.bridgeBreath?.detected),
    bridgeBreathsPerMinute: profile?.bridgeBreath?.breathsPerMinute ?? null,
    bridgeCycleDuration: profile?.bridgeBreath?.cycleDuration ?? null,
    bridgeInhaleDuration: profile?.bridgeBreath?.inhaleDuration ?? null,
    bridgeExhaleDuration: profile?.bridgeBreath?.exhaleDuration ?? null,
    bridgeConfidence: profile?.bridgeBreath?.confidence ?? null,
    bridgeTempoSource: profile?.bridgeBreath?.tempoSource ?? null,
    bridgePhaseSource: profile?.bridgeBreath?.phaseSource ?? null,
    bridgePhaseScore: profile?.bridgeBreath?.phaseScore ?? null,
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
      appVersion: APP_VERSION,
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
      phoneOrientation: els.phoneOrientationSelect?.value || "bottom_toward_head",
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

function clearReports() {
  localStorage.removeItem(REPORTS_KEY);
  latestReport = null;
  els.reportExport.value = "";
  els.reportStatus.textContent = "Stored reports cleared. Next download will only include new measurements.";
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
    phoneOrientation: els.phoneOrientationSelect?.value || "bottom_toward_head",
    voicePrompt: options.voice ? VOICE_PROMPT : null,
    startedAt: new Date().toISOString()
  };
  els.reportPanel.hidden = true;
  els.reportExport.value = "";
  els.voicePrompt.hidden = !options.voice;
  setProgress(0);
  els.entryTitle.textContent = options.voice ? "Read the sentence." : "Place the phone and breathe normally.";
  els.entryInstruction.textContent = options.voice
    ? "First allow motion access, then microphone access. Read once in your normal voice, then place the phone with the bottom edge toward your head."
    : "Allow motion access. Place the phone straight down with the bottom edge toward your head.";
  els.debugStatus.textContent = "Preparing";
  try {
    const needsMotionPermission = typeof DeviceMotionEvent !== "undefined"
      && typeof DeviceMotionEvent.requestPermission === "function";
    let motionPermission = "granted";
    if (needsMotionPermission) {
      els.debugStatus.textContent = "REQUESTING_MOTION_ACCESS";
      els.entryTitle.textContent = "Allow motion access.";
      els.entryInstruction.textContent = "Tap Allow so the phone can read the small movement from your breath.";
      motionPermission = await requestMotionPermission();
      if (motionPermission !== "granted") throw new Error("Motion permission was not granted.");
    }
    const profile = await entry.run({
      durationSec: Number(els.durationInput.value) || 45,
      detectVoicePitch: Boolean(options.voice),
      phoneOrientation: els.phoneOrientationSelect?.value || "bottom_toward_head",
      voiceDurationSec: 7,
      voicePrepareSec: 3,
      placementDelaySec: options.voice ? 5 : 0,
      motionPermissionGranted: motionPermission === "granted",
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
          els.entryInstruction.textContent = "Now place the phone straight down on your belly, bottom edge toward your head.";
          if (update.profile) showProfile(update.profile);
        }
        if (update.state === "PLACE_PHONE") {
          els.voicePrompt.hidden = true;
          els.entryTitle.textContent = "Place the phone on your belly.";
          els.entryInstruction.textContent = "Bottom edge toward your head. Keep it still; breath sensing starts in a few seconds.";
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
  els.clearReportsBtn.addEventListener("click", clearReports);
  capabilities = await detectDeviceCapabilities();
  els.appVersionStatus.textContent = `ABE local ${APP_VERSION}`;
  els.capabilitiesOutput.textContent = JSON.stringify(capabilities, null, 2);
  drawSignal(null);
  drawSignal(null, els.spectralCanvas, { line: "#8ea7ff" });
  drawSignal(null, els.bodyLiftCanvas, { line: "#a8e0a2" });
  drawSignal(null, els.phaseStateCanvas, { line: "#f0c36a" });
}

boot();
