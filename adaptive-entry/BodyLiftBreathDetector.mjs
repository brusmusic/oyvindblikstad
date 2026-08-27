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

function bodyLiftFilter(values, sampleRate) {
  const drift = movingAverage(values, Math.max(3, Math.round(sampleRate * 8)));
  const centered = values.map((value, index) => value - drift[index]);
  const smooth = movingAverage(centered, Math.max(2, Math.round(sampleRate * 0.65)));
  return normalize(smooth);
}

function findTurns(signal, sampleRate) {
  const smooth = movingAverage(signal, Math.max(1, Math.round(sampleRate * 0.24)));
  const minGap = Math.round(sampleRate * 0.8);
  const threshold = Math.max(0.1, robustSpread(smooth) * 0.18);
  const peaks = [];
  const troughs = [];
  const remember = (items, index, direction) => {
    if (!items.length || index - items[items.length - 1] >= minGap) {
      items.push(index);
      return;
    }
    const previous = items[items.length - 1];
    if (smooth[index] * direction > smooth[previous] * direction) items[items.length - 1] = index;
  };
  for (let i = 2; i < smooth.length - 2; i += 1) {
    if (
      smooth[i] > threshold
      && smooth[i] >= smooth[i - 1]
      && smooth[i] >= smooth[i + 1]
      && smooth[i] > smooth[i - 2]
      && smooth[i] >= smooth[i + 2]
    ) remember(peaks, i, 1);
    if (
      smooth[i] < -threshold
      && smooth[i] <= smooth[i - 1]
      && smooth[i] <= smooth[i + 1]
      && smooth[i] < smooth[i - 2]
      && smooth[i] <= smooth[i + 2]
    ) remember(troughs, i, -1);
  }
  return {
    peaks: peaks.map((index) => index / sampleRate),
    troughs: troughs.map((index) => index / sampleRate)
  };
}

function intervals(items) {
  const out = [];
  for (let i = 1; i < items.length; i += 1) out.push(items[i] - items[i - 1]);
  return out;
}

function phaseFromTurns(peaks, troughs, polarity = 1) {
  const lows = polarity > 0 ? troughs : peaks;
  const highs = polarity > 0 ? peaks : troughs;
  const inhale = [];
  const exhale = [];
  lows.forEach((low) => {
    const high = highs.find((item) => item > low);
    const nextLow = lows.find((item) => item > low);
    if (Number.isFinite(high) && Number.isFinite(nextLow) && high < nextLow) inhale.push(high - low);
  });
  highs.forEach((high) => {
    const low = lows.find((item) => item > high);
    const nextHigh = highs.find((item) => item > high);
    if (Number.isFinite(low) && Number.isFinite(nextHigh) && low < nextHigh) exhale.push(low - high);
  });
  return {
    inhaleDuration: median(inhale.filter((value) => value >= 0.5 && value <= 8)),
    exhaleDuration: median(exhale.filter((value) => value >= 0.5 && value <= 12)),
    pairs: Math.min(inhale.length, exhale.length)
  };
}

function analyzeAxis(samples, key, config) {
  const raw = resample(samples, key, config.sampleRate);
  const warmupSamples = Math.round(config.warmupSec * config.sampleRate);
  const signal = bodyLiftFilter(raw.slice(warmupSamples), config.sampleRate);
  if (signal.length < config.sampleRate * 8 || robustSpread(signal) < 0.08) return null;
  const turns = findTurns(signal, config.sampleRate);
  const peakCycles = intervals(turns.peaks);
  const troughCycles = intervals(turns.troughs);
  const cycles = peakCycles.length >= troughCycles.length ? peakCycles : troughCycles;
  const cycleDuration = median(cycles.filter((value) => value >= config.minCycleSec && value <= config.maxCycleSec));
  if (!Number.isFinite(cycleDuration)) return null;
  const deviations = cycles.map((value) => Math.abs(value - cycleDuration));
  const stability = clamp(1 - (median(deviations) / Math.max(0.5, cycleDuration * 0.25)), 0, 1);
  const amplitude = clamp(robustSpread(signal) / 1.35, 0, 1);
  const repeat = clamp((cycles.length - 1) / 4, 0, 1);
  const phasePositive = phaseFromTurns(turns.peaks, turns.troughs, 1);
  const phaseNegative = phaseFromTurns(turns.peaks, turns.troughs, -1);
  const phase = config.liftPolarity === "negative" ? phaseNegative : phasePositive;
  const alternatePhase = config.liftPolarity === "negative" ? phasePositive : phaseNegative;
  const phaseTotal = Number(phase.inhaleDuration) + Number(phase.exhaleDuration);
  const phaseAgreement = Number.isFinite(phaseTotal)
    ? clamp(1 - (Math.abs(phaseTotal - cycleDuration) / Math.max(0.5, cycleDuration)), 0, 1)
    : 0;
  const score = clamp((stability * 0.42) + (amplitude * 0.24) + (repeat * 0.18) + (phaseAgreement * 0.16), 0, 1);
  return {
    key,
    score,
    signal,
    cycleDuration,
    stability,
    amplitude,
    repeat,
    phaseAgreement,
    peaks: turns.peaks,
    troughs: turns.troughs,
    phase,
    alternatePhase
  };
}

function scalePhase(phase, cycleDuration) {
  const inhale = Number(phase?.inhaleDuration);
  const exhale = Number(phase?.exhaleDuration);
  const total = inhale + exhale;
  if (!Number.isFinite(inhale) || !Number.isFinite(exhale) || total <= 0) {
    return {
      inhaleDuration: cycleDuration * 0.5,
      exhaleDuration: cycleDuration * 0.5,
      phaseReliable: false
    };
  }
  const scale = cycleDuration / total;
  return {
    inhaleDuration: inhale * scale,
    exhaleDuration: exhale * scale,
    phaseReliable: Number(phase.pairs || 0) >= 2
  };
}

function debugCandidate(candidate) {
  return {
    key: candidate.key,
    score: candidate.score,
    cycleDuration: candidate.cycleDuration,
    stability: candidate.stability,
    amplitude: candidate.amplitude,
    repeat: candidate.repeat,
    phaseAgreement: candidate.phaseAgreement,
    phaseInhaleDuration: candidate.phase?.inhaleDuration ?? null,
    phaseExhaleDuration: candidate.phase?.exhaleDuration ?? null,
    alternateInhaleDuration: candidate.alternatePhase?.inhaleDuration ?? null,
    alternateExhaleDuration: candidate.alternatePhase?.exhaleDuration ?? null,
    peaks: candidate.peaks.length,
    troughs: candidate.troughs.length
  };
}

export class BodyLiftBreathDetector {
  analyze(samples, options = {}) {
    const sampleRate = Number.isFinite(options.sampleRate) ? options.sampleRate : 20;
    const durationSec = samples?.length > 1 ? (samples[samples.length - 1].t - samples[0].t) / 1000 : 0;
    const config = {
      sampleRate,
      warmupSec: Number.isFinite(options.warmupSec) ? options.warmupSec : clamp(durationSec * 0.12, 2, 5),
      minCycleSec: Number.isFinite(options.minCycleSec) ? options.minCycleSec : 2.2,
      maxCycleSec: Number.isFinite(options.maxCycleSec) ? options.maxCycleSec : 12,
      liftPolarity: options.liftPolarity === "negative" ? "negative" : "positive"
    };
    if (!samples || samples.length < 160) {
      return { detected: false, confidence: 0, debug: { reason: "not_enough_motion_samples", sampleRate } };
    }
    const candidates = ["gx", "gy", "gz"]
      .map((key) => analyzeAxis(samples, key, config))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (!best) {
      return { detected: false, confidence: 0, debug: { reason: "no_body_lift_candidate", sampleRate, candidates: [] } };
    }
    const fitted = scalePhase(best.phase, best.cycleDuration);
    const confidence = clamp(best.score, 0, 1);
    return {
      detected: confidence >= 0.32,
      usable: confidence >= 0.46,
      confidence,
      breathsPerMinute: 60 / best.cycleDuration,
      cycleDuration: best.cycleDuration,
      inhaleDuration: fitted.inhaleDuration,
      exhaleDuration: fitted.exhaleDuration,
      phaseReliable: fitted.phaseReliable,
      key: best.key,
      polarity: config.liftPolarity,
      source: "body_lift",
      debug: {
        bestKey: best.key,
        sampleRate,
        warmupSec: config.warmupSec,
        liftPolarity: config.liftPolarity,
        signal: best.signal,
        peaks: best.peaks,
        troughs: best.troughs,
        alternateInhaleDuration: best.alternatePhase?.inhaleDuration ?? null,
        alternateExhaleDuration: best.alternatePhase?.exhaleDuration ?? null,
        candidates: candidates.map(debugCandidate)
      }
    };
  }
}
