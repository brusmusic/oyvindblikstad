import { average, clamp, median, movingAverage, robustSpread } from "./utils.mjs";

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

function findExtrema(signal, sampleRate, direction = 1) {
  const minGap = Math.round(sampleRate * 1.8);
  const threshold = Math.max(0.08, robustSpread(signal) * 0.18);
  const peaks = [];
  for (let i = 2; i < signal.length - 2; i += 1) {
    const value = signal[i] * direction;
    if (value < threshold) continue;
    if (value > signal[i - 1] * direction && value >= signal[i + 1] * direction && value > signal[i - 2] * direction && value >= signal[i + 2] * direction) {
      if (!peaks.length || i - peaks[peaks.length - 1] >= minGap) peaks.push(i);
      else if (value > signal[peaks[peaks.length - 1]] * direction) peaks[peaks.length - 1] = i;
    }
  }
  return peaks;
}

function scoreSignal(signal, sampleRate) {
  const positive = findExtrema(signal, sampleRate, 1);
  const negative = findExtrema(signal, sampleRate, -1);
  const peaks = positive.length >= negative.length ? positive : negative;
  if (peaks.length < 3) {
    return { score: 0, peaks, troughs: negative, cycleDuration: NaN, stability: 0 };
  }
  const intervals = [];
  for (let i = 1; i < peaks.length; i += 1) intervals.push((peaks[i] - peaks[i - 1]) / sampleRate);
  const cycleDuration = median(intervals);
  const deviations = intervals.map((interval) => Math.abs(interval - cycleDuration));
  const stability = clamp(1 - (median(deviations) / Math.max(0.4, cycleDuration * 0.28)), 0, 1);
  const physiologic = cycleDuration >= 2.5 && cycleDuration <= 18 ? 1 : 0.25;
  const amplitude = clamp(robustSpread(signal) / 1.2, 0, 1);
  const repeat = clamp((peaks.length - 2) / 5, 0, 1);
  return {
    score: amplitude * stability * repeat * physiologic,
    peaks,
    troughs: positive.length >= negative.length ? negative : positive,
    cycleDuration,
    stability
  };
}

function estimateRatio(signal, peaks, troughs, sampleRate) {
  if (peaks.length < 2 || troughs.length < 2) return { inhaleDuration: NaN, exhaleDuration: NaN };
  const riseDurations = [];
  const fallDurations = [];
  troughs.forEach((trough) => {
    const nextPeak = peaks.find((peak) => peak > trough);
    if (Number.isFinite(nextPeak)) riseDurations.push((nextPeak - trough) / sampleRate);
  });
  peaks.forEach((peak) => {
    const nextTrough = troughs.find((trough) => trough > peak);
    if (Number.isFinite(nextTrough)) fallDurations.push((nextTrough - peak) / sampleRate);
  });
  const rise = median(riseDurations);
  const fall = median(fallDurations);
  if (!Number.isFinite(rise) || !Number.isFinite(fall)) return { inhaleDuration: NaN, exhaleDuration: NaN };
  return {
    inhaleDuration: rise,
    exhaleDuration: fall
  };
}

export class BreathDetector {
  analyze(samples, options = {}) {
    const sampleRate = options.sampleRate || 20;
    if (!samples || samples.length < 80) {
      return {
        breath: { detected: false, confidence: 0 },
        motion: { stability: 0, signalQuality: 0 },
        debug: { reason: "not_enough_motion_samples" }
      };
    }
    const keys = ["gx", "gy", "gz", "gravityMagnitude", "rotationMagnitude", "alpha", "beta", "gamma"];
    const candidates = keys.map((key) => {
      const raw = resample(samples, key, sampleRate);
      const slow = movingAverage(raw, Math.max(3, Math.round(sampleRate * 1.6)));
      const highpassed = raw.map((value, index) => value - slow[index]);
      const filtered = movingAverage(normalize(highpassed), Math.max(1, Math.round(sampleRate * 0.22)));
      return { key, signal: filtered, ...scoreSignal(filtered, sampleRate) };
    }).sort((a, b) => b.score - a.score);

    const best = candidates[0];
    const durationSec = (samples[samples.length - 1].t - samples[0].t) / 1000;
    const sampleRateQuality = clamp(samples.length / Math.max(1, durationSec * 18), 0, 1);
    const confidence = clamp((best?.score || 0) * 0.78 + sampleRateQuality * 0.22, 0, 1);
    if (!best || confidence < 0.42 || !Number.isFinite(best.cycleDuration)) {
      return {
        breath: { detected: false, confidence },
        motion: { stability: best?.stability || 0, signalQuality: best?.score || 0 },
        debug: { bestKey: best?.key || "", candidates }
      };
    }
    const ratio = estimateRatio(best.signal, best.peaks, best.troughs, sampleRate);
    const cycleDuration = best.cycleDuration;
    const breathsPerMinute = 60 / cycleDuration;
    const inhaleDuration = Number.isFinite(ratio.inhaleDuration) ? ratio.inhaleDuration : cycleDuration * 0.42;
    const exhaleDuration = Number.isFinite(ratio.exhaleDuration) ? ratio.exhaleDuration : cycleDuration - inhaleDuration;
    return {
      breath: {
        detected: true,
        breathsPerMinute,
        cycleDuration,
        inhaleDuration,
        exhaleDuration,
        confidence
      },
      motion: {
        stability: best.stability,
        signalQuality: best.score
      },
      debug: {
        bestKey: best.key,
        sampleRate,
        signal: best.signal,
        peaks: best.peaks.map((index) => index / sampleRate),
        troughs: best.troughs.map((index) => index / sampleRate),
        candidates: candidates.map((candidate) => ({ key: candidate.key, score: candidate.score, cycleDuration: candidate.cycleDuration }))
      }
    };
  }
}
