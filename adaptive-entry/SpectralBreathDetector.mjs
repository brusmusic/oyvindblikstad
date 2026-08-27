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

function breathBandpass(values, sampleRate) {
  const drift = movingAverage(values, Math.max(3, Math.round(sampleRate * 5.5)));
  const highpassed = values.map((value, index) => value - drift[index]);
  const lowpassed = movingAverage(highpassed, Math.max(1, Math.round(sampleRate * 0.42)));
  return normalize(lowpassed);
}

function autocorrelationScore(signal, sampleRate, minCycleSec, maxCycleSec) {
  const minLag = Math.max(2, Math.round(minCycleSec * sampleRate));
  const maxLag = Math.min(signal.length - 2, Math.round(maxCycleSec * sampleRate));
  if (maxLag <= minLag) return { cycleDuration: NaN, score: 0 };
  let bestLag = 0;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    let aEnergy = 0;
    let bEnergy = 0;
    for (let i = 0; i < signal.length - lag; i += 1) {
      const a = signal[i];
      const b = signal[i + lag];
      sum += a * b;
      aEnergy += a * a;
      bEnergy += b * b;
    }
    const score = sum / Math.max(0.0001, Math.sqrt(aEnergy * bEnergy));
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  return {
    cycleDuration: bestLag / sampleRate,
    score: clamp((bestScore + 0.15) / 1.15, 0, 1)
  };
}

function spectralScore(signal, sampleRate, minCycleSec, maxCycleSec) {
  const minHz = 1 / maxCycleSec;
  const maxHz = 1 / minCycleSec;
  let bestHz = 0;
  let bestPower = 0;
  let totalPower = 0.0001;
  const stepHz = 0.006;
  for (let hz = minHz; hz <= maxHz; hz += stepHz) {
    let real = 0;
    let imag = 0;
    for (let i = 0; i < signal.length; i += 1) {
      const angle = (Math.PI * 2 * hz * i) / sampleRate;
      real += signal[i] * Math.cos(angle);
      imag -= signal[i] * Math.sin(angle);
    }
    const power = (real * real) + (imag * imag);
    totalPower += power;
    if (power > bestPower) {
      bestPower = power;
      bestHz = hz;
    }
  }
  return {
    cycleDuration: bestHz > 0 ? 1 / bestHz : NaN,
    score: clamp(bestPower / totalPower * 4.5, 0, 1)
  };
}

function findTurns(signal, sampleRate, minGapSec = 0.75) {
  const minGap = Math.max(2, Math.round(minGapSec * sampleRate));
  const threshold = Math.max(0.16, robustSpread(signal) * 0.18);
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
  return {
    peaks: peaks.map((index) => index / sampleRate),
    troughs: troughs.map((index) => index / sampleRate)
  };
}

function phaseDurations(peaks, troughs, phoneOrientation = "bottom_toward_head") {
  const read = (starts, ends) => {
    const inhale = [];
    const exhale = [];
    starts.forEach((turn) => {
      const nextEnd = ends.find((item) => item > turn);
      if (Number.isFinite(nextEnd)) inhale.push(nextEnd - turn);
    });
    ends.forEach((turn) => {
      const nextStart = starts.find((item) => item > turn);
      if (Number.isFinite(nextStart)) exhale.push(nextStart - turn);
    });
    return {
      inhaleDuration: median(inhale.filter((value) => value >= 0.45 && value <= 8)),
      exhaleDuration: median(exhale.filter((value) => value >= 0.45 && value <= 12)),
      pairs: Math.min(inhale.length, exhale.length)
    };
  };
  const peakAsInhaleTop = read(troughs, peaks);
  const troughAsInhaleTop = read(peaks, troughs);
  const candidates = [
    { ...peakAsInhaleTop, syncTurnType: "peak", syncTurns: peaks },
    { ...troughAsInhaleTop, syncTurnType: "trough", syncTurns: troughs }
  ].filter((item) => (
    Number.isFinite(item.inhaleDuration)
    && Number.isFinite(item.exhaleDuration)
    && item.pairs >= 2
  ));
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const aLong = (a.exhaleDuration - a.inhaleDuration) / Math.max(0.1, a.exhaleDuration + a.inhaleDuration);
    const bLong = (b.exhaleDuration - b.inhaleDuration) / Math.max(0.1, b.exhaleDuration + b.inhaleDuration);
    return bLong - aLong;
  });
  return {
    ...candidates[0],
    phoneOrientation,
    phaseOptions: candidates.map((candidate) => ({
      syncTurnType: candidate.syncTurnType,
      inhaleDuration: candidate.inhaleDuration,
      exhaleDuration: candidate.exhaleDuration,
      pairs: candidate.pairs
    })),
    phaseConfidence: clamp(candidates[0].pairs / 4, 0, 1)
  };
}

function analyzeKey(samples, key, options) {
  const sampleRate = options.sampleRate;
  const minCycleSec = options.minCycleSec;
  const maxCycleSec = options.maxCycleSec;
  const raw = resample(samples, key, sampleRate);
  const warmupSamples = Math.round(options.warmupSec * sampleRate);
  const signal = breathBandpass(raw.slice(warmupSamples), sampleRate);
  if (signal.length < sampleRate * 8 || robustSpread(signal) < 0.08) return null;
  const auto = autocorrelationScore(signal, sampleRate, minCycleSec, maxCycleSec);
  const spectrum = spectralScore(signal, sampleRate, minCycleSec, maxCycleSec);
  const agreement = Number.isFinite(auto.cycleDuration) && Number.isFinite(spectrum.cycleDuration)
    ? clamp(1 - (Math.abs(auto.cycleDuration - spectrum.cycleDuration) / Math.max(0.5, auto.cycleDuration, spectrum.cycleDuration)), 0, 1)
    : 0;
  let cycleDuration = agreement >= 0.42
    ? ((auto.cycleDuration * 0.58) + (spectrum.cycleDuration * 0.42))
    : (auto.score >= spectrum.score ? auto.cycleDuration : spectrum.cycleDuration);
  const turns = findTurns(signal, sampleRate, Math.max(0.75, cycleDuration * 0.22));
  const phase = phaseDurations(turns.peaks, turns.troughs, options.phoneOrientation);
  const phaseTotal = Number(phase?.inhaleDuration) + Number(phase?.exhaleDuration);
  const autoToSpectrum = auto.cycleDuration / Math.max(0.001, spectrum.cycleDuration);
  const looksLikeDoubleCycle = autoToSpectrum >= 1.72 && autoToSpectrum <= 2.25;
  const phaseSupportsSpectrum = Number.isFinite(phaseTotal)
    && Number.isFinite(spectrum.cycleDuration)
    && Math.abs(phaseTotal - spectrum.cycleDuration) <= Math.max(0.55, spectrum.cycleDuration * 0.18);
  const phaseSupportsAuto = Number.isFinite(phaseTotal)
    && Number.isFinite(auto.cycleDuration)
    && Math.abs(phaseTotal - auto.cycleDuration) <= Math.max(0.55, auto.cycleDuration * 0.18);
  if (looksLikeDoubleCycle && phaseSupportsSpectrum && !phaseSupportsAuto) {
    cycleDuration = spectrum.cycleDuration;
  }
  const amplitude = clamp(robustSpread(signal) / 1.35, 0, 1);
  const resolvedDoubleCycle = looksLikeDoubleCycle && phaseSupportsSpectrum && !phaseSupportsAuto;
  const agreementScore = resolvedDoubleCycle ? 0.82 : agreement;
  const score = clamp(((auto.score * 0.36) + (spectrum.score * 0.36) + (agreementScore * 0.22) + (amplitude * 0.06)), 0, 1);
  return {
    key,
    score,
    signal,
    cycleDuration,
    resolvedDoubleCycle,
    autocorrelationCycle: auto.cycleDuration,
    autocorrelationScore: auto.score,
    spectralCycle: spectrum.cycleDuration,
    spectralScore: spectrum.score,
    agreement,
    peaks: turns.peaks,
    troughs: turns.troughs,
    phase
  };
}

function debugCandidate(candidate) {
  const phaseTotal = Number(candidate.phase?.inhaleDuration) + Number(candidate.phase?.exhaleDuration);
  const phaseCycleAgreement = Number.isFinite(phaseTotal) && Number.isFinite(candidate.cycleDuration)
    ? clamp(1 - (Math.abs(phaseTotal - candidate.cycleDuration) / Math.max(0.5, candidate.cycleDuration)), 0, 1)
    : 0;
  return {
    key: candidate.key,
    score: candidate.score,
    cycleDuration: candidate.cycleDuration,
    autocorrelationCycle: candidate.autocorrelationCycle,
    autocorrelationScore: candidate.autocorrelationScore,
    spectralCycle: candidate.spectralCycle,
    spectralScore: candidate.spectralScore,
    agreement: candidate.agreement,
    resolvedDoubleCycle: Boolean(candidate.resolvedDoubleCycle),
    phaseInhaleDuration: candidate.phase?.inhaleDuration ?? null,
    phaseExhaleDuration: candidate.phase?.exhaleDuration ?? null,
    phaseConfidence: candidate.phase?.phaseConfidence ?? 0,
    phaseCycleAgreement,
    phaseOptions: candidate.phase?.phaseOptions || [],
    syncTurnType: candidate.phase?.syncTurnType ?? null
  };
}

function choosePhaseCandidate(candidates, tempoCycle) {
  const topScore = Number(candidates[0]?.score || 0);
  const choices = candidates
    .filter((candidate) => {
      const phase = candidate.phase || {};
      const phaseTotal = Number(phase.inhaleDuration) + Number(phase.exhaleDuration);
      return candidate.score >= topScore * 0.72
        && Number.isFinite(phase.inhaleDuration)
        && Number.isFinite(phase.exhaleDuration)
        && Number.isFinite(phaseTotal)
        && phaseTotal > 0
        && Number(phase.phaseConfidence || 0) >= 0.45;
    })
    .map((candidate) => {
      const phase = candidate.phase;
      const phaseTotal = phase.inhaleDuration + phase.exhaleDuration;
      const ratio = Math.max(phase.inhaleDuration, phase.exhaleDuration) / Math.max(0.1, Math.min(phase.inhaleDuration, phase.exhaleDuration));
      const agreementToTempo = clamp(1 - (Math.abs(phaseTotal - tempoCycle) / Math.max(0.5, tempoCycle)), 0, 1);
      const selfAgreement = clamp(1 - (Math.abs(phaseTotal - candidate.cycleDuration) / Math.max(0.5, candidate.cycleDuration)), 0, 1);
      const balanceFit = tempoCycle >= 5.2 && tempoCycle <= 6.8
        ? clamp(1 - ((ratio - 1) / 0.95), 0, 1)
        : 0;
      const score = (candidate.score * 0.34)
        + ((phase.phaseConfidence || 0) * 0.24)
        + (agreementToTempo * 0.28)
        + (selfAgreement * 0.14)
        + (balanceFit * 0.12);
      return { candidate, score, agreementToTempo, selfAgreement, balanceFit };
    })
    .sort((a, b) => b.score - a.score);
  return choices[0] || null;
}

function fitPhaseToTempo(phase, tempoCycle) {
  const inhale = Number(phase?.inhaleDuration);
  const exhale = Number(phase?.exhaleDuration);
  const cycle = Number(tempoCycle);
  const total = inhale + exhale;
  if (
    !Number.isFinite(inhale)
    || !Number.isFinite(exhale)
    || !Number.isFinite(cycle)
    || inhale <= 0
    || exhale <= 0
    || total <= 0
  ) {
    return {
      inhaleDuration: cycle * 0.5,
      exhaleDuration: cycle * 0.5,
      phaseFit: "balanced_fallback"
    };
  }

  let inhaleShare = inhale / total;
  const ratio = exhale / Math.max(0.1, inhale);
  let phaseFit = Math.abs(total - cycle) > Math.max(0.18, cycle * 0.035)
    ? "scaled_to_tempo"
    : "raw_phase";

  if (cycle < 7 && ratio >= 1.1 && ratio <= 1.45) {
    inhaleShare = (inhaleShare * 0.75) + 0.125;
    phaseFit = `${phaseFit}_soft_equal`;
  } else if (cycle >= 7.2 && cycle < 9.2 && ratio >= 1.1 && ratio <= 1.35) {
    inhaleShare = (inhaleShare * 0.65) + 0.175;
    phaseFit = `${phaseFit}_soft_equal`;
  } else if (cycle >= 8.8 && ratio >= 1.1 && ratio <= 1.95) {
    inhaleShare = (inhaleShare * 0.38) + 0.31;
    phaseFit = `${phaseFit}_slow_equal`;
  }

  inhaleShare = clamp(inhaleShare, 0.28, 0.55);
  const inhaleDuration = cycle * inhaleShare;
  return {
    inhaleDuration,
    exhaleDuration: cycle - inhaleDuration,
    phaseFit
  };
}

export class SpectralBreathDetector {
  analyze(samples, options = {}) {
    const sampleRate = Number.isFinite(options.sampleRate) ? options.sampleRate : 20;
    const durationSec = samples?.length > 1 ? (samples[samples.length - 1].t - samples[0].t) / 1000 : 0;
    const config = {
      sampleRate,
      warmupSec: Number.isFinite(options.warmupSec) ? options.warmupSec : clamp(durationSec * 0.12, 2, 5),
      minCycleSec: Number.isFinite(options.minCycleSec) ? options.minCycleSec : 2.2,
      maxCycleSec: Number.isFinite(options.maxCycleSec) ? options.maxCycleSec : 12,
      phoneOrientation: options.phoneOrientation || "bottom_toward_head"
    };
    if (!samples || samples.length < 160) {
      return { detected: false, confidence: 0, debug: { reason: "not_enough_motion_samples", sampleRate } };
    }
    const keys = ["gx", "gy", "gz", "gravityMagnitude", "rotationMagnitude", "alpha", "beta", "gamma"];
    const candidates = keys
      .map((key) => analyzeKey(samples, key, config))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (!best || !Number.isFinite(best.cycleDuration)) {
      return { detected: false, confidence: 0, debug: { reason: "no_spectral_candidate", sampleRate, candidates: [] } };
    }
    const confidence = clamp(best.score, 0, 1);
    const phaseChoice = choosePhaseCandidate(candidates, best.cycleDuration);
    const phaseSource = phaseChoice?.candidate || best;
    const phase = phaseSource.phase || {};
    const phaseReliable = Boolean(phaseChoice)
      && phaseChoice.agreementToTempo >= 0.68
      && Number.isFinite(phase.inhaleDuration)
      && Number.isFinite(phase.exhaleDuration);
    const fittedPhase = phaseReliable
      ? fitPhaseToTempo(phase, best.cycleDuration)
      : fitPhaseToTempo(null, best.cycleDuration);
    const inhaleDuration = fittedPhase.inhaleDuration;
    const exhaleDuration = fittedPhase.exhaleDuration;
    return {
      detected: confidence >= 0.32,
      usable: confidence >= 0.46,
      confidence,
      breathsPerMinute: 60 / best.cycleDuration,
      cycleDuration: best.cycleDuration,
      inhaleDuration,
      exhaleDuration,
      phaseConfidence: phase.phaseConfidence || 0,
      phaseReliable,
      key: best.key,
      phaseKey: phaseSource.key,
      source: "spectral",
      debug: {
        bestKey: best.key,
        phaseKey: phaseSource.key,
        phaseSelectionScore: phaseChoice?.score ?? 0,
        phaseAgreementToTempo: phaseChoice?.agreementToTempo ?? 0,
        phaseSelfAgreement: phaseChoice?.selfAgreement ?? 0,
        phaseBalanceFit: phaseChoice?.balanceFit ?? 0,
        sampleRate,
        warmupSec: config.warmupSec,
        phoneOrientation: config.phoneOrientation,
        signal: best.signal,
        peaks: best.peaks,
        troughs: best.troughs,
        autocorrelationCycle: best.autocorrelationCycle,
        autocorrelationScore: best.autocorrelationScore,
        spectralCycle: best.spectralCycle,
        spectralScore: best.spectralScore,
        agreement: best.agreement,
        resolvedDoubleCycle: Boolean(best.resolvedDoubleCycle),
        phaseFit: fittedPhase.phaseFit,
        syncTurnType: phase.syncTurnType || null,
        syncTurns: phase.syncTurns || [],
        candidates: candidates.map(debugCandidate)
      }
    };
  }
}
