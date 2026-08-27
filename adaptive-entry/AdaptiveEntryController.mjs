import { detectDeviceCapabilities, requestMotionPermission } from "./DeviceCapabilities.mjs?v=1.9";
import { MotionSensor } from "./MotionSensor.mjs?v=1.9";
import { BreathDetector } from "./BreathDetector.mjs?v=1.9";
import { SpectralBreathDetector } from "./SpectralBreathDetector.mjs?v=1.6";
import { BodyLiftBreathDetector } from "./BodyLiftBreathDetector.mjs?v=1.0";
import { PhaseStateBreathDetector } from "./PhaseStateBreathDetector.mjs?v=1.4";
import { VoicePitchDetector } from "./VoicePitchDetector.mjs?v=1.9";
import { GlobalTuneMapper } from "./GlobalTuneMapper.mjs?v=1.9";
import { clamp } from "./utils.mjs";

export class AdaptiveEntryController {
  constructor() {
    this.motionSensor = new MotionSensor();
    this.breathDetector = new BreathDetector();
    this.spectralBreathDetector = new SpectralBreathDetector();
    this.bodyLiftBreathDetector = new BodyLiftBreathDetector();
    this.phaseStateBreathDetector = new PhaseStateBreathDetector();
    this.voicePitchDetector = new VoicePitchDetector();
    this.globalTuneMapper = new GlobalTuneMapper();
    this.state = "IDLE";
    this.aborted = false;
  }

  transition(next, onUpdate, extra = {}) {
    this.state = next;
    onUpdate?.({ state: next, ...extra });
  }

  abort() {
    this.aborted = true;
    this.motionSensor.stop();
    this.state = "IDLE";
  }

  async wait(seconds, onUpdate, state) {
    const started = performance.now();
    while (!this.aborted && performance.now() - started < seconds * 1000) {
      onUpdate?.({
        state,
        progress: (performance.now() - started) / Math.max(1, seconds * 1000)
      });
      await new Promise((resolve) => setTimeout(resolve, 160));
    }
  }

  async run(options = {}) {
    this.aborted = false;
    const onUpdate = options.onUpdate;
    const durationSec = options.durationSec || 45;
    const detectBreath = options.detectBreath !== false;
    const detectVoicePitch = Boolean(options.detectVoicePitch);
    const placementDelaySec = Number.isFinite(options.placementDelaySec) ? options.placementDelaySec : (detectVoicePitch ? 5 : 0);
    this.transition("PREPARING", onUpdate);
    const capabilities = await detectDeviceCapabilities();
    const profile = {
      timestamp: Date.now(),
      capabilities,
      context: {
        phoneOrientation: options.phoneOrientation || "bottom_toward_head"
      },
      breath: { detected: false, confidence: 0 },
      voice: { detected: false, confidence: 0 },
      globalTune: null,
      motion: { stability: 0, signalQuality: 0 }
    };

    if (detectBreath && !capabilities.accelerometer) {
      const reason = capabilities.motionBlockedReason === "motion_requires_https_on_iphone"
        ? "Motion access requires HTTPS on iPhone. The local HTTP link can open the page, but Safari will not expose breath motion sensors there."
        : "Motion sensors are not available in this browser.";
      throw new Error(reason);
    }

    if (detectBreath && capabilities.accelerometer && !options.motionPermissionGranted) {
      this.transition("REQUESTING_MOTION_ACCESS", onUpdate, { message: "Allow motion access before we begin." });
      const permission = await requestMotionPermission();
      if (permission !== "granted") throw new Error("Motion permission was not granted.");
    }

    if (!this.aborted && detectVoicePitch && capabilities.microphone) {
      this.transition("REQUESTING_MIC_ACCESS", onUpdate, { message: "Allow microphone access." });
      const voiceResult = await this.voicePitchDetector.analyze({
        durationSec: options.voiceDurationSec || 7,
        beforeRecordDelaySec: Number.isFinite(options.voicePrepareSec) ? options.voicePrepareSec : 3,
        onStatus: (status) => {
          if (this.aborted) return;
          const state = status.phase === "prepare" ? "PREPARE_VOICE" : "SENSING_VOICE";
          onUpdate?.({ state, progress: status.progress, voiceLevel: status.level, voicedFrames: status.voicedFrames });
        }
      });
      profile.voice = voiceResult.voice;
      profile.globalTune = this.globalTuneMapper.map(voiceResult.voice);
      profile.debug = { ...(profile.debug || {}), voice: voiceResult.debug };
      this.transition("VOICE_ACQUIRED", onUpdate, { profile });
    }

    if (detectBreath && capabilities.accelerometer) {
      if (placementDelaySec > 0) {
        this.transition("PLACE_PHONE", onUpdate, { message: "Place the phone gently on your belly." });
        await this.wait(placementDelaySec, onUpdate, "PLACE_PHONE");
      }
      this.transition("SENSING_BREATH", onUpdate, { message: "Finding your rhythm..." });
      await this.motionSensor.start({ permissionGranted: Boolean(options.motionPermissionGranted) });
      const started = performance.now();
      while (!this.aborted && performance.now() - started < durationSec * 1000) {
        onUpdate?.({
          state: "SENSING_BREATH",
          progress: (performance.now() - started) / (durationSec * 1000),
          samples: this.motionSensor.samples.length
        });
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      const samples = this.motionSensor.stop();
      const result = this.breathDetector.analyze(samples);
      const spectralResult = this.spectralBreathDetector.analyze(samples, {
        phoneOrientation: profile.context.phoneOrientation
      });
      const bodyLiftResult = this.bodyLiftBreathDetector.analyze(samples, {
        liftPolarity: options.liftPolarity || "positive"
      });
      const assistedSpectral = assistSpectralPhaseWithLegacy(result.breath, spectralResult);
      const phaseStateResult = this.phaseStateBreathDetector.analyze(samples, {
        tempoCycle: assistedSpectral.cycleDuration
      });
      profile.breath = result.breath;
      profile.motion = result.motion;
      profile.debug = {
        ...(profile.debug || {}),
        breath: result.debug,
        spectralBreath: spectralResult.debug,
        bodyLiftBreath: bodyLiftResult.debug,
        phaseStateBreath: phaseStateResult.debug
      };
      profile.spectralBreath = {
        detected: assistedSpectral.detected,
        usable: assistedSpectral.usable,
        confidence: assistedSpectral.confidence,
        breathsPerMinute: assistedSpectral.breathsPerMinute,
        cycleDuration: assistedSpectral.cycleDuration,
        inhaleDuration: assistedSpectral.inhaleDuration,
        exhaleDuration: assistedSpectral.exhaleDuration,
        phaseConfidence: assistedSpectral.phaseConfidence,
        phaseReliable: assistedSpectral.phaseReliable,
        phaseAssist: assistedSpectral.phaseAssist,
        key: spectralResult.key,
        phaseKey: spectralResult.phaseKey,
        source: spectralResult.source
      };
      profile.bodyLiftBreath = bodyLiftResult;
      profile.phaseStateBreath = phaseStateResult;
      profile.bridgeBreath = createBridgeBreath(assistedSpectral, bodyLiftResult, phaseStateResult);
      this.transition(result.breath.detected ? "BREATH_ACQUIRED" : "BREATH_UNKNOWN", onUpdate, { profile });
    }

    this.transition("PROFILE_READY", onUpdate, { profile });
    return profile;
  }
}

function scaleDurations(inhaleDuration, exhaleDuration, cycleDuration) {
  const inhale = Number(inhaleDuration);
  const exhale = Number(exhaleDuration);
  const cycle = Number(cycleDuration);
  const total = inhale + exhale;
  if (!Number.isFinite(inhale) || !Number.isFinite(exhale) || !Number.isFinite(cycle) || total <= 0) {
    return { inhaleDuration: cycle * 0.42, exhaleDuration: cycle * 0.58 };
  }
  const scale = cycle / total;
  return { inhaleDuration: inhale * scale, exhaleDuration: exhale * scale };
}

function naturalBreathDurations(cycleDuration) {
  const cycle = Number(cycleDuration);
  if (!Number.isFinite(cycle) || cycle <= 0) return { inhaleDuration: 2, exhaleDuration: 3 };
  return {
    inhaleDuration: cycle * 0.38196601125,
    exhaleDuration: cycle * 0.61803398875
  };
}

function phaseOptionScore(option, cycleDuration) {
  const inhale = Number(option.inhaleDuration);
  const exhale = Number(option.exhaleDuration);
  const cycle = Number(cycleDuration);
  const total = inhale + exhale;
  if (!Number.isFinite(inhale) || !Number.isFinite(exhale) || !Number.isFinite(cycle) || total <= 0) return 0;
  const scaled = scaleDurations(inhale, exhale, cycle);
  const ratio = scaled.exhaleDuration / Math.max(0.1, scaled.inhaleDuration);
  const longExhaleFit = clamp(1 - (Math.abs(ratio - 1.75) / 1.15), 0, 1);
  const balancedFit = clamp(1 - (Math.abs(ratio - 1) / 0.55), 0, 1);
  const shapeFit = cycle <= 5.1
    ? longExhaleFit
    : (cycle <= 6.8 ? Math.max(balancedFit, longExhaleFit * 0.5) : Math.max(balancedFit, longExhaleFit * 0.62));
  const plateauShare = Number(option.plateauShare || 0);
  const sourceFit = option.source?.startsWith("phase_state") && option.phaseReliable && plateauShare >= 0.12 ? 0.05 : 0;
  return (Number(option.confidence || 0) * 0.36)
    + (Number(option.phaseReliable ? 1 : 0.55) * 0.18)
    + (Number(option.cycleAgreement || 0) * 0.2)
    + (shapeFit * 0.26)
    + sourceFit;
}

function exhaleRatio(option) {
  const inhale = Number(option?.inhaleDuration);
  const exhale = Number(option?.exhaleDuration);
  if (!Number.isFinite(inhale) || !Number.isFinite(exhale) || inhale <= 0) return NaN;
  return exhale / inhale;
}

function isConfidentLongBodyLift(option, cycleDuration) {
  const ratio = exhaleRatio(option);
  return option?.source === "body_lift"
    && Number(cycleDuration) >= 7.2
    && Number(option.confidence || 0) >= 0.68
    && Number(option.cycleAgreement || 0) >= 0.85
    && ratio >= 1.55
    && ratio <= 2.75;
}

function isConfidentLongPlateau(option, cycleDuration) {
  const ratio = exhaleRatio(option);
  const isRescue = option?.source === "phase_state_rescue";
  const lowerRatio = isRescue ? 1.55 : 2.25;
  return option?.source?.startsWith("phase_state")
    && Number(cycleDuration) >= 7.2
    && Number(option.confidence || 0) >= 0.58
    && Number(option.cycleAgreement || 0) >= 0.8
    && Number(option.plateauShare || 0) >= 0.22
    && ratio >= lowerRatio
    && ratio <= 2.6;
}

function shouldPreferBalancedSpectral(selected, spectralResult, bodyLiftResult, cycleDuration) {
  const selectedRatio = exhaleRatio(selected);
  const spectralRatio = Number(spectralResult?.exhaleDuration) / Math.max(0.1, Number(spectralResult?.inhaleDuration));
  const bodyRatio = Number(bodyLiftResult?.exhaleDuration) / Math.max(0.1, Number(bodyLiftResult?.inhaleDuration));
  return selected?.source === "phase_state"
    && Number(cycleDuration) >= 7.2
    && Number(spectralResult?.confidence || 0) >= 0.55
    && Number.isFinite(selectedRatio)
    && selectedRatio >= 1.55
    && selectedRatio < 2.25
    && Number.isFinite(spectralRatio)
    && spectralRatio >= 0.82
    && spectralRatio <= 1.32
    && (!Number.isFinite(bodyRatio) || (bodyRatio >= 0.82 && bodyRatio <= 1.32));
}

function createBridgeBreath(spectralResult, bodyLiftResult, phaseStateResult) {
  const base = spectralResult?.detected ? spectralResult : (phaseStateResult?.detected ? phaseStateResult : bodyLiftResult);
  const cycleDuration = Number(base?.cycleDuration);
  if (!base?.detected || !Number.isFinite(cycleDuration)) {
    return { detected: false, confidence: 0, source: "none" };
  }
  const options = [];
  const addOption = (source, result, inhaleDuration, exhaleDuration, extra = {}) => {
    const sourceCycle = Number(result?.cycleDuration);
    const cycleAgreement = Number.isFinite(sourceCycle)
      ? clamp(1 - (Math.abs(sourceCycle - cycleDuration) / Math.max(0.5, cycleDuration)), 0, 1)
      : 0.5;
    options.push({
      source,
      confidence: Number(result?.confidence || 0),
      phaseReliable: Boolean(result?.phaseReliable),
      cycleAgreement,
      inhaleDuration,
      exhaleDuration,
      ...extra
    });
  };
  addOption("spectral", spectralResult, spectralResult?.inhaleDuration, spectralResult?.exhaleDuration);
  addOption("phase_state", phaseStateResult, phaseStateResult?.inhaleDuration, phaseStateResult?.exhaleDuration, {
    plateauShare: phaseStateResult?.debug?.plateauShare
  });
  (phaseStateResult?.debug?.candidates || []).forEach((candidate) => {
    const sameAsSelectedPhase = candidate.key === phaseStateResult?.key
      && candidate.polarity === phaseStateResult?.polarity;
    if (sameAsSelectedPhase) return;
    const ratio = Number(candidate.exhaleDuration) / Math.max(0.1, Number(candidate.inhaleDuration));
    const rescueCandidate = Number(candidate.cycleDuration) >= 7.2
      && Number(candidate.score || 0) >= 0.5
      && Number(candidate.cycleAgreement || 0) >= 0.8
      && Number(candidate.plateauShare || 0) >= 0.2
      && ratio >= 1.55
      && ratio <= 2.6;
    if (!rescueCandidate) return;
    options.push({
      source: "phase_state_rescue",
      confidence: Number(candidate.score || 0),
      phaseReliable: true,
      cycleAgreement: Number(candidate.cycleAgreement || 0),
      inhaleDuration: candidate.inhaleDuration,
      exhaleDuration: candidate.exhaleDuration,
      plateauShare: candidate.plateauShare,
      key: candidate.key,
      polarity: candidate.polarity
    });
  });
  addOption("body_lift", bodyLiftResult, bodyLiftResult?.inhaleDuration, bodyLiftResult?.exhaleDuration);
  addOption(
    "body_lift_alternate",
    bodyLiftResult,
    bodyLiftResult?.debug?.alternateInhaleDuration,
    bodyLiftResult?.debug?.alternateExhaleDuration,
    { phaseReliable: Boolean(bodyLiftResult?.phaseReliable) }
  );
  const ranked = options
    .map((option) => ({ ...option, score: phaseOptionScore(option, cycleDuration) }))
    .filter((option) => option.score > 0)
    .sort((a, b) => b.score - a.score);
  const longPlateau = ranked.find((option) => isConfidentLongPlateau(option, cycleDuration));
  const longBodyLift = ranked.find((option) => isConfidentLongBodyLift(option, cycleDuration));
  let selected = longPlateau || longBodyLift || ranked[0] || options[0];
  if (shouldPreferBalancedSpectral(selected, spectralResult, bodyLiftResult, cycleDuration)) {
    selected = ranked.find((option) => option.source === "spectral") || selected;
  }
  const fitted = naturalBreathDurations(cycleDuration);
  return {
    detected: true,
    usable: Boolean(base.usable),
    confidence: Math.max(Number(spectralResult?.confidence || 0), Number(bodyLiftResult?.confidence || 0), Number(phaseStateResult?.confidence || 0)),
    breathsPerMinute: 60 / cycleDuration,
    cycleDuration,
    inhaleDuration: fitted.inhaleDuration,
    exhaleDuration: fitted.exhaleDuration,
    tempoSource: spectralResult?.detected ? "spectral" : "body_lift",
    phaseSource: selected.source,
    phaseScore: selected.score,
    durationSource: "natural_40_60_prior",
    source: "bridge_natural_prior"
  };
}

function assistSpectralPhaseWithLegacy(legacyBreath, spectralResult) {
  const spectralCycle = Number(spectralResult?.cycleDuration);
  const legacyCycle = Number(legacyBreath?.cycleDuration);
  const legacyInhale = Number(legacyBreath?.inhaleDuration);
  const legacyExhale = Number(legacyBreath?.exhaleDuration);
  const canAssist = spectralResult?.detected
    && Number.isFinite(spectralCycle)
    && Number.isFinite(legacyCycle)
    && Number.isFinite(legacyInhale)
    && Number.isFinite(legacyExhale)
    && legacyInhale > 0
    && legacyExhale > legacyInhale * 1.55
    && Math.abs(legacyCycle - spectralCycle) <= Math.max(0.75, spectralCycle * 0.22);
  if (!canAssist) return spectralResult;
  const legacyTotal = legacyInhale + legacyExhale;
  const scale = spectralCycle / Math.max(0.1, legacyTotal);
  return {
    ...spectralResult,
    inhaleDuration: legacyInhale * scale,
    exhaleDuration: legacyExhale * scale,
    phaseReliable: true,
    phaseConfidence: Math.max(Number(spectralResult.phaseConfidence || 0), 0.62),
    phaseAssist: "legacy_long_exhale_ratio"
  };
}
