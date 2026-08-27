import { clamp } from "./utils.mjs";

export function createAdaptiveBreathCurves(entryProfile, options = {}) {
  const fallback = options.fallback || { inhale: 4, exhale: 6, holdInhale: 0, holdExhale: 1 };
  const confidenceThreshold = Number.isFinite(options.confidenceThreshold) ? options.confidenceThreshold : 0.55;
  const multiplier = Number.isFinite(options.cycleMultiplier) ? options.cycleMultiplier : 1.45;
  const exhaleBias = Number.isFinite(options.exhaleBias) ? options.exhaleBias : 1.15;
  const detected = entryProfile?.breath?.detected && entryProfile.breath.confidence >= confidenceThreshold;
  const cycleDuration = Number.isFinite(entryProfile?.breath?.cycleDuration) ? entryProfile.breath.cycleDuration : fallback.inhale + fallback.exhale;
  const phaseReliable = Boolean(entryProfile?.breath?.phaseReliable);
  const measuredInhale = phaseReliable ? entryProfile.breath.inhaleDuration : cycleDuration * 0.42;
  const measuredExhale = phaseReliable ? entryProfile.breath.exhaleDuration : cycleDuration * 0.58;
  const startInhale = detected ? clamp(measuredInhale, 1.5, 9) : fallback.inhale;
  const startExhale = detected ? clamp(measuredExhale, 2, 14) : fallback.exhale;
  const startHoldInhale = detected ? 0 : fallback.holdInhale;
  const startHoldExhale = detected ? clamp(startExhale * 0.12, 0.4, 2.2) : fallback.holdExhale;
  const endInhale = clamp(startInhale * multiplier, 2.5, 10);
  const endExhale = clamp(startExhale * multiplier * exhaleBias, 4, 18);
  const endHoldInhale = clamp(startHoldInhale + 0.8, 0, 3);
  const endHoldExhale = clamp(startHoldExhale * multiplier + 0.8, 0.8, 4);
  return {
    source: detected ? "adaptive-entry" : "fallback",
    confidence: entryProfile?.breath?.confidence || 0,
    phaseReliable,
    phaseInverted: Boolean(entryProfile?.breath?.phaseInverted),
    durationSource: detected ? (phaseReliable ? "measured_phase" : "cycle_default_ratio") : "fallback",
    breathCurves: {
      inhale: [{ t: 0, v: startInhale }, { t: 1, v: endInhale }],
      holdInhale: [{ t: 0, v: startHoldInhale }, { t: 1, v: endHoldInhale }],
      exhale: [{ t: 0, v: startExhale }, { t: 1, v: endExhale }],
      holdExhale: [{ t: 0, v: startHoldExhale }, { t: 1, v: endHoldExhale }]
    }
  };
}
