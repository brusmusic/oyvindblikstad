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

function findExtrema(signal, sampleRate, direction = 1, options = {}) {
  const minGapSec = Number.isFinite(options.minCycleSec) ? options.minCycleSec : 3;
  const edgeGuardSec = Number.isFinite(options.edgeGuardSec) ? options.edgeGuardSec : 1.2;
  const minGap = Math.round(sampleRate * minGapSec);
  const edgeGuard = Math.round(sampleRate * edgeGuardSec);
  const threshold = Math.max(0.1, robustSpread(signal) * 0.24);
  const peaks = [];
  for (let i = Math.max(2, edgeGuard); i < signal.length - Math.max(2, edgeGuard); i += 1) {
    const value = signal[i] * direction;
    if (value < threshold) continue;
    if (value > signal[i - 1] * direction && value >= signal[i + 1] * direction && value > signal[i - 2] * direction && value >= signal[i + 2] * direction) {
      if (!peaks.length || i - peaks[peaks.length - 1] >= minGap) peaks.push(i);
      else if (value > signal[peaks[peaks.length - 1]] * direction) peaks[peaks.length - 1] = i;
    }
  }
  return peaks;
}

function scoreSignal(signal, sampleRate, options = {}) {
  const positive = findExtrema(signal, sampleRate, 1, options);
  const negative = findExtrema(signal, sampleRate, -1, options);
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
  const calmBreathBias = cycleDuration >= 6 ? 1.18 : (cycleDuration < 4 ? 0.74 : 1);
  return {
    score: amplitude * stability * repeat * physiologic * calmBreathBias,
    peaks,
    troughs: positive.length >= negative.length ? negative : positive,
    cycleDuration,
    stability
  };
}

function estimateRatio(signal, peaks, troughs, sampleRate, cycleDuration) {
  if (peaks.length < 2 || troughs.length < 2) return { inhaleDuration: NaN, exhaleDuration: NaN, phaseConfidence: 0 };
  const riseDurations = [];
  const fallDurations = [];
  troughs.forEach((trough) => {
    const nextPeak = peaks.find((peak) => peak > trough);
    const nextTrough = troughs.find((item) => item > trough);
    if (Number.isFinite(nextPeak) && Number.isFinite(nextTrough) && nextPeak < nextTrough) {
      riseDurations.push((nextPeak - trough) / sampleRate);
    }
  });
  peaks.forEach((peak) => {
    const nextTrough = troughs.find((trough) => trough > peak);
    const nextPeak = peaks.find((item) => item > peak);
    if (Number.isFinite(nextTrough) && Number.isFinite(nextPeak) && nextTrough < nextPeak) {
      fallDurations.push((nextTrough - peak) / sampleRate);
    }
  });
  const rise = median(riseDurations);
  const fall = median(fallDurations);
  if (!Number.isFinite(rise) || !Number.isFinite(fall)) return { inhaleDuration: NaN, exhaleDuration: NaN, phaseConfidence: 0 };
  const total = rise + fall;
  const durationMatch = Number.isFinite(cycleDuration) ? clamp(1 - (Math.abs(total - cycleDuration) / Math.max(0.5, cycleDuration)), 0, 1) : 0.5;
  const scale = Number.isFinite(cycleDuration) && total > cycleDuration * 1.08 ? cycleDuration / total : 1;
  return {
    inhaleDuration: rise * scale,
    exhaleDuration: fall * scale,
    phaseConfidence: clamp(durationMatch * Math.min(riseDurations.length, fallDurations.length) / 3, 0, 1)
  };
}

function attachPhase(candidate, sampleRate) {
  const ratio = candidate?.signal
    ? estimateRatio(candidate.signal, candidate.peaks || [], candidate.troughs || [], sampleRate, candidate.cycleDuration)
    : { inhaleDuration: NaN, exhaleDuration: NaN, phaseConfidence: 0 };
  const phaseTotal = ratio.inhaleDuration + ratio.exhaleDuration;
  return {
    ...candidate,
    phaseInhaleDuration: ratio.inhaleDuration,
    phaseExhaleDuration: ratio.exhaleDuration,
    phaseConfidence: ratio.phaseConfidence,
    phaseBalance: Number.isFinite(phaseTotal) && phaseTotal > 0 ? ratio.inhaleDuration / phaseTotal : null
  };
}

function hasUsablePhase(candidate) {
  return Number.isFinite(candidate?.phaseInhaleDuration)
    && Number.isFinite(candidate?.phaseExhaleDuration)
    && candidate.phaseConfidence >= 0.55
    && Math.min(candidate.peaks?.length || 0, candidate.troughs?.length || 0) >= 3;
}

function chooseBreathCandidate(candidates) {
  const top = candidates[0];
  if (!top || !Number.isFinite(top.cycleDuration)) {
    return { best: top, reason: "top_score" };
  }
  const longer = candidates.find((candidate) => {
    if (!Number.isFinite(candidate.cycleDuration) || !Number.isFinite(candidate.score)) return false;
    const ratio = candidate.cycleDuration / top.cycleDuration;
    return top.cycleDuration < 4.1
      && candidate.cycleDuration >= 5.2
      && ratio >= 1.72
      && ratio <= 2.18
      && candidate.score >= top.score * 0.55;
  });
  if (longer) return { best: longer, reason: "prefer_longer_near_double_cycle" };
  if (!hasUsablePhase(top)) {
    const phaseCandidate = candidates.find((candidate) => {
      if (!hasUsablePhase(candidate) || !Number.isFinite(candidate.score)) return false;
      if (!Number.isFinite(top.score) || top.score <= 0) return true;
      return candidate.score >= top.score * 0.52;
    });
    if (phaseCandidate) return { best: phaseCandidate, reason: "prefer_phase_readable_candidate" };
  }
  const weakCalmCandidate = candidates.find((candidate) => {
    if (!Number.isFinite(candidate.cycleDuration) || !Number.isFinite(candidate.score)) return false;
    return top.score < 0.18
      && top.cycleDuration < 6.2
      && candidate.cycleDuration >= 7
      && candidate.score >= top.score * 0.22;
  });
  if (weakCalmCandidate) return { best: weakCalmCandidate, reason: "prefer_longer_weak_calm_candidate" };
  return { best: top, reason: "top_score" };
}

function candidateDebug(candidate, sampleRate) {
  return {
    key: candidate.key,
    score: candidate.score,
    cycleDuration: candidate.cycleDuration,
    phaseInhaleDuration: candidate.phaseInhaleDuration,
    phaseExhaleDuration: candidate.phaseExhaleDuration,
    phaseConfidence: candidate.phaseConfidence,
    phaseBalance: candidate.phaseBalance,
    alternatePhaseInhaleDuration: candidate.phaseExhaleDuration,
    alternatePhaseExhaleDuration: candidate.phaseInhaleDuration
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
    const durationSec = (samples[samples.length - 1].t - samples[0].t) / 1000;
    const warmupSec = Number.isFinite(options.warmupSec) ? options.warmupSec : clamp(durationSec * 0.12, 2, 5);
    const keys = ["gx", "gy", "gz", "gravityMagnitude", "rotationMagnitude", "alpha", "beta", "gamma"];
    const candidates = keys.map((key) => {
      const raw = resample(samples, key, sampleRate).slice(Math.round(warmupSec * sampleRate));
      const slow = movingAverage(raw, Math.max(3, Math.round(sampleRate * 5.2)));
      const highpassed = raw.map((value, index) => value - slow[index]);
      const filtered = movingAverage(normalize(highpassed), Math.max(1, Math.round(sampleRate * 0.32)));
      return { key, signal: filtered, ...scoreSignal(filtered, sampleRate, options) };
    }).map((candidate) => attachPhase(candidate, sampleRate)).sort((a, b) => b.score - a.score);

    const selection = chooseBreathCandidate(candidates);
    const best = selection.best;
    const sampleRateQuality = clamp(samples.length / Math.max(1, durationSec * 18), 0, 1);
    const confidence = clamp((best?.score || 0) * 0.78 + sampleRateQuality * 0.22, 0, 1);
    const detectionThreshold = Number.isFinite(options.detectionThreshold) ? options.detectionThreshold : 0.24;
    const usableThreshold = Number.isFinite(options.usableThreshold) ? options.usableThreshold : 0.32;
    if (!best || confidence < detectionThreshold || !Number.isFinite(best.cycleDuration)) {
      return {
        breath: { detected: false, confidence, usable: false },
        motion: { stability: best?.stability || 0, signalQuality: best?.score || 0, bestKey: best?.key || "", warmupSec },
        debug: {
          bestKey: best?.key || "",
          selectionReason: selection.reason,
          warmupSec,
          sampleRate,
          signal: best?.signal || [],
          peaks: (best?.peaks || []).map((index) => index / sampleRate),
          troughs: (best?.troughs || []).map((index) => index / sampleRate),
          candidates: candidates.map((candidate) => candidateDebug(candidate, sampleRate))
        }
      };
    }
    const ratio = {
      inhaleDuration: best.phaseInhaleDuration,
      exhaleDuration: best.phaseExhaleDuration,
      phaseConfidence: best.phaseConfidence
    };
    const cycleDuration = best.cycleDuration;
    const breathsPerMinute = 60 / cycleDuration;
    const phaseConfidence = ratio.phaseConfidence || 0;
    const phaseReliable = phaseConfidence >= 0.55 && Math.min(best.peaks.length, best.troughs.length) >= 3;
    const preferLongExhale = options.preferLongExhale === true;
    const shouldInvertPhase = phaseReliable
      && preferLongExhale
      && Number.isFinite(ratio.inhaleDuration)
      && Number.isFinite(ratio.exhaleDuration)
      && ratio.exhaleDuration < ratio.inhaleDuration;
    const measuredInhale = shouldInvertPhase ? ratio.exhaleDuration : ratio.inhaleDuration;
    const measuredExhale = shouldInvertPhase ? ratio.inhaleDuration : ratio.exhaleDuration;
    const inhaleDuration = phaseReliable && Number.isFinite(measuredInhale) ? measuredInhale : cycleDuration * 0.42;
    const exhaleDuration = phaseReliable && Number.isFinite(measuredExhale) ? measuredExhale : cycleDuration - inhaleDuration;
    return {
      breath: {
        detected: true,
        breathsPerMinute,
        cycleDuration,
        inhaleDuration,
        exhaleDuration,
        phaseConfidence,
        phaseReliable,
        phaseInverted: shouldInvertPhase,
        phaseBalance: Number.isFinite(inhaleDuration) && Number.isFinite(cycleDuration) && cycleDuration > 0
          ? inhaleDuration / cycleDuration
          : null,
        durationSource: phaseReliable ? "measured_phase" : "cycle_default_ratio",
        usable: confidence >= usableThreshold,
        qualityLabel: confidence >= 0.55 ? "strong" : "weak",
        confidence
      },
      motion: {
        stability: best.stability,
        signalQuality: best.score,
        bestKey: best.key,
        selectionReason: selection.reason,
        warmupSec
      },
      debug: {
        bestKey: best.key,
        selectionReason: selection.reason,
        warmupSec,
        sampleRate,
        signal: best.signal,
        peaks: best.peaks.map((index) => index / sampleRate),
        troughs: best.troughs.map((index) => index / sampleRate),
        candidates: candidates.map((candidate) => candidateDebug(candidate, sampleRate))
      }
    };
  }
}
