import { clamp, median, movingAverage, robustSpread } from "./utils.mjs";

function resample(samples, key, sampleRate = 20) {
  if (samples.length < 2) return [];
  const durationMs = samples[samples.length - 1].t - samples[0].t;
  const count = Math.max(1, Math.floor((durationMs / 1000) * sampleRate));
  const values = [];
  let cursor = 0;
  for (let i = 0; i < count; i += 1) {
    const t = samples[0].t + ((i / Math.max(1, count - 1)) * durationMs);
    while (cursor < samples.length - 2 && samples[cursor + 1].t < t) cursor += 1;
    const a = samples[cursor];
    const b = samples[Math.min(samples.length - 1, cursor + 1)];
    const local = (t - a.t) / Math.max(1, b.t - a.t);
    values.push((a[key] || 0) + (((b[key] || 0) - (a[key] || 0)) * local));
  }
  return values;
}

function normalize(values) {
  const center = median(values);
  const spread = robustSpread(values) || 1;
  return values.map((value) => (value - center) / spread);
}

function phaseSignal(values, sampleRate) {
  const drift = movingAverage(values, Math.max(3, Math.round(sampleRate * 7)));
  const centered = values.map((value, index) => value - drift[index]);
  const smooth = movingAverage(centered, Math.max(2, Math.round(sampleRate * 0.55)));
  return normalize(smooth);
}

function derivative(signal, sampleRate) {
  const diff = signal.map((value, index) => (index === 0 ? 0 : value - signal[index - 1]));
  return movingAverage(diff, Math.max(1, Math.round(sampleRate * 0.3)));
}

function findTurns(signal, sampleRate, minGapSec) {
  const minGap = Math.max(2, Math.round(minGapSec * sampleRate));
  const threshold = Math.max(0.12, robustSpread(signal) * 0.16);
  const peaks = [];
  const troughs = [];
  const remember = (items, index, direction) => {
    if (!items.length || index - items[items.length - 1] >= minGap) {
      items.push(index);
      return;
    }
    const previous = items[items.length - 1];
    if (signal[index] * direction > signal[previous] * direction) items[items.length - 1] = index;
  };
  for (let i = 2; i < signal.length - 2; i += 1) {
    if (
      signal[i] > threshold
      && signal[i] >= signal[i - 1]
      && signal[i] >= signal[i + 1]
      && signal[i] > signal[i - 2]
      && signal[i] >= signal[i + 2]
    ) remember(peaks, i, 1);
    if (
      signal[i] < -threshold
      && signal[i] <= signal[i - 1]
      && signal[i] <= signal[i + 1]
      && signal[i] < signal[i - 2]
      && signal[i] <= signal[i + 2]
    ) remember(troughs, i, -1);
  }
  return { peaks, troughs };
}

function sustainedRisingStart(signal, slope, fromIndex, toIndex, sampleRate) {
  const slopeThreshold = Math.max(0.006, robustSpread(slope) * 0.14);
  const hold = Math.max(2, Math.round(sampleRate * 0.28));
  for (let i = Math.max(1, fromIndex); i < Math.max(fromIndex, toIndex - hold); i += 1) {
    let ok = 0;
    for (let j = 0; j < hold; j += 1) {
      if (slope[i + j] > slopeThreshold) ok += 1;
    }
    if (ok >= hold - 1 && signal[i] < 0.55) return i;
  }
  return NaN;
}

function intervals(values) {
  const out = [];
  for (let i = 1; i < values.length; i += 1) out.push(values[i] - values[i - 1]);
  return out;
}

function analyzePhase(signal, sampleRate, tempoCycle) {
  const targetCycle = Number(tempoCycle);
  const minGap = Number.isFinite(targetCycle) ? clamp(targetCycle * 0.24, 0.75, 2.7) : 1.1;
  const turns = findTurns(signal, sampleRate, minGap);
  const slope = derivative(signal, sampleRate);
  const inhale = [];
  const exhale = [];
  const risingStarts = [];
  turns.peaks.forEach((peak) => {
    const previousTrough = turns.troughs.filter((trough) => trough < peak).at(-1);
    const nextPeak = turns.peaks.find((item) => item > peak);
    if (!Number.isFinite(previousTrough) || !Number.isFinite(nextPeak)) return;
    const minNextInhale = Number.isFinite(targetCycle) ? clamp(targetCycle * 0.25, 0.85, 3.2) : 0.85;
    const latestLow = turns.troughs
      .filter((trough) => trough > peak + Math.round(sampleRate * 0.45))
      .filter((trough) => trough < nextPeak - Math.round(sampleRate * minNextInhale))
      .at(-1);
    const earliestRising = Number.isFinite(latestLow)
      ? latestLow
      : (Number.isFinite(targetCycle)
        ? peak + Math.round(sampleRate * clamp(targetCycle * 0.3, 0.45, 3.1))
        : peak + Math.round(sampleRate * 0.45));
    const rising = sustainedRisingStart(
      signal,
      slope,
      earliestRising,
      nextPeak - Math.round(sampleRate * 0.28),
      sampleRate
    );
    const nextRising = Number.isFinite(latestLow) ? latestLow : rising;
    if (!Number.isFinite(nextRising)) return;
    risingStarts.push(nextRising);
    inhale.push((peak - previousTrough) / sampleRate);
    exhale.push((nextRising - peak) / sampleRate);
  });
  const cycleFromPeaks = median(intervals(turns.peaks).map((value) => value / sampleRate));
  const cycleFromRising = median(intervals(risingStarts).map((value) => value / sampleRate));
  const cycleDuration = Number.isFinite(targetCycle) ? targetCycle : (Number.isFinite(cycleFromRising) ? cycleFromRising : cycleFromPeaks);
  const rawInhale = median(inhale.filter((value) => value >= 0.45 && value <= 8));
  const rawExhale = median(exhale.filter((value) => value >= 0.45 && value <= 12));
  const rawTotal = rawInhale + rawExhale;
  const scale = Number.isFinite(rawTotal) && rawTotal > 0 ? cycleDuration / rawTotal : 1;
  const inhaleDuration = rawInhale * scale;
  const exhaleDuration = rawExhale * scale;
  const cycleAgreement = Number.isFinite(cycleFromPeaks) && Number.isFinite(cycleDuration)
    ? clamp(1 - (Math.abs(cycleFromPeaks - cycleDuration) / Math.max(0.5, cycleDuration)), 0, 1)
    : 0;
  const phasePairs = Math.min(inhale.length, exhale.length);
  const plateauShare = Number.isFinite(rawExhale) && Number.isFinite(rawTotal) && rawTotal > 0
    ? clamp((rawExhale - rawInhale) / rawTotal, 0, 1)
    : 0;
  return {
    peaks: turns.peaks,
    troughs: turns.troughs,
    risingStarts,
    cycleDuration,
    inhaleDuration,
    exhaleDuration,
    rawInhaleDuration: rawInhale,
    rawExhaleDuration: rawExhale,
    cycleFromPeaks,
    cycleFromRising,
    phasePairs,
    cycleAgreement,
    plateauShare
  };
}

function analyzeAxis(samples, key, polarity, config) {
  const raw = resample(samples, key, config.sampleRate);
  const warmupSamples = Math.round(config.warmupSec * config.sampleRate);
  const signal = phaseSignal(raw.slice(warmupSamples), config.sampleRate).map((value) => value * polarity);
  if (signal.length < config.sampleRate * 8 || robustSpread(signal) < 0.08) return null;
  const phase = analyzePhase(signal, config.sampleRate, config.tempoCycle);
  const phaseTotal = phase.inhaleDuration + phase.exhaleDuration;
  const phaseValid = Number.isFinite(phase.inhaleDuration)
    && Number.isFinite(phase.exhaleDuration)
    && Number.isFinite(phaseTotal)
    && phase.phasePairs >= 2;
  const amplitude = clamp(robustSpread(signal) / 1.35, 0, 1);
  const repeat = clamp((phase.phasePairs - 1) / 3, 0, 1);
  const ratio = phase.exhaleDuration / Math.max(0.1, phase.inhaleDuration);
  const shape = phase.cycleDuration <= 5.1
    ? clamp(1 - (Math.abs(ratio - 1.8) / 1.25), 0, 1)
    : clamp(1 - (Math.abs(ratio - 1.15) / 0.95), 0, 1);
  const longPlateauShape = phase.cycleDuration >= 7.2 && phase.plateauShare >= 0.22
    ? clamp(1 - (Math.abs(ratio - 2.35) / 1.25), 0, 1)
    : 0;
  const phaseShape = Math.max(shape, longPlateauShape);
  const score = phaseValid
    ? clamp((phase.cycleAgreement * 0.32) + (amplitude * 0.2) + (repeat * 0.2) + (phaseShape * 0.2) + (phase.plateauShare * 0.08), 0, 1)
    : 0;
  return {
    key,
    polarity,
    score,
    signal,
    ...phase
  };
}

function debugCandidate(candidate) {
  return {
    key: candidate.key,
    polarity: candidate.polarity > 0 ? "positive" : "negative",
    score: candidate.score,
    cycleDuration: candidate.cycleDuration,
    inhaleDuration: candidate.inhaleDuration,
    exhaleDuration: candidate.exhaleDuration,
    rawInhaleDuration: candidate.rawInhaleDuration,
    rawExhaleDuration: candidate.rawExhaleDuration,
    cycleFromPeaks: candidate.cycleFromPeaks,
    cycleFromRising: candidate.cycleFromRising,
    phasePairs: candidate.phasePairs,
    cycleAgreement: candidate.cycleAgreement,
    plateauShare: candidate.plateauShare
  };
}

function choosePhaseStateCandidate(candidates) {
  const best = candidates[0];
  if (!best) return null;
  const cycle = Number(best.cycleDuration);
  const ratio = best.exhaleDuration / Math.max(0.1, best.inhaleDuration);
  const balancedWindow = cycle >= 5.2 && cycle <= 6.8;
  if (!balancedWindow || (ratio >= 0.85 && ratio <= 1.22)) return best;

  const balanced = candidates.find((candidate) => {
    const candidateRatio = candidate.exhaleDuration / Math.max(0.1, candidate.inhaleDuration);
    return candidate.score >= best.score * 0.92
      && candidateRatio >= 0.85
      && candidateRatio <= 1.22
      && candidate.cycleAgreement >= 0.72;
  });
  return balanced || best;
}

export class PhaseStateBreathDetector {
  analyze(samples, options = {}) {
    const sampleRate = Number.isFinite(options.sampleRate) ? options.sampleRate : 20;
    const durationSec = samples?.length > 1 ? (samples[samples.length - 1].t - samples[0].t) / 1000 : 0;
    const config = {
      sampleRate,
      warmupSec: Number.isFinite(options.warmupSec) ? options.warmupSec : clamp(durationSec * 0.12, 2, 5),
      tempoCycle: Number(options.tempoCycle)
    };
    if (!samples || samples.length < 160) {
      return { detected: false, confidence: 0, debug: { reason: "not_enough_motion_samples", sampleRate } };
    }
    const candidates = [];
    ["gx", "gy", "gz", "alpha", "beta", "gamma"].forEach((key) => {
      [1, -1].forEach((polarity) => {
        const candidate = analyzeAxis(samples, key, polarity, config);
        if (candidate) candidates.push(candidate);
      });
    });
    candidates.sort((a, b) => b.score - a.score);
    const best = choosePhaseStateCandidate(candidates);
    if (!best || best.score <= 0) {
      return { detected: false, confidence: 0, debug: { reason: "no_phase_state_candidate", sampleRate, candidates: candidates.map(debugCandidate) } };
    }
    const confidence = clamp(best.score, 0, 1);
    return {
      detected: confidence >= 0.32,
      usable: confidence >= 0.48,
      confidence,
      breathsPerMinute: 60 / best.cycleDuration,
      cycleDuration: best.cycleDuration,
      inhaleDuration: best.inhaleDuration,
      exhaleDuration: best.exhaleDuration,
      phaseReliable: confidence >= 0.48,
      key: best.key,
      polarity: best.polarity > 0 ? "positive" : "negative",
      phaseState: "top_to_next_rising",
      source: "phase_state",
      debug: {
        bestKey: best.key,
        polarity: best.polarity > 0 ? "positive" : "negative",
        sampleRate,
        warmupSec: config.warmupSec,
        signal: best.signal,
        peaks: best.peaks.map((index) => index / sampleRate),
        troughs: best.troughs.map((index) => index / sampleRate),
        risingStarts: best.risingStarts.map((index) => index / sampleRate),
        cycleFromPeaks: best.cycleFromPeaks,
        cycleFromRising: best.cycleFromRising,
        rawInhaleDuration: best.rawInhaleDuration,
        rawExhaleDuration: best.rawExhaleDuration,
        plateauShare: best.plateauShare,
        candidates: candidates.map(debugCandidate)
      }
    };
  }
}
