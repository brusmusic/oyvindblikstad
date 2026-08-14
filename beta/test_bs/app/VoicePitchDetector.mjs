import { clamp, median, noteFromFrequency } from "./utils.mjs";

function analyzeFrame(buffer, sampleRate) {
  const rms = Math.sqrt(buffer.reduce((sum, value) => sum + value * value, 0) / buffer.length);
  if (rms < 0.012) return { rms, frequency: null, clarity: 0 };
  const minLag = Math.floor(sampleRate / 500);
  const maxLag = Math.floor(sampleRate / 75);
  let bestLag = -1;
  let best = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let corr = 0;
    for (let i = 0; i < buffer.length - lag; i += 1) corr += buffer[i] * buffer[i + lag];
    corr /= buffer.length - lag;
    if (corr > best) {
      best = corr;
      bestLag = lag;
    }
  }
  if (bestLag < 0 || best < 0.002) return { rms, frequency: null, clarity: 0 };
  return { frequency: sampleRate / bestLag, clarity: clamp(best / Math.max(0.0001, rms * rms), 0, 1), rms };
}

export class VoicePitchDetector {
  async analyze(options = {}) {
    if (!navigator.mediaDevices?.getUserMedia) {
      return { voice: { detected: false, confidence: 0 }, globalTune: null, debug: { reason: "microphone_unavailable" } };
    }
    const durationMs = (options.durationSec || 10) * 1000;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const ctx = new AudioContext();
    await ctx.resume();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    source.connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);
    const frames = [];
    const allFrames = [];
    const beforeRecordDelayMs = Math.max(0, (options.beforeRecordDelaySec || 0) * 1000);
    const prepareStarted = performance.now();
    while (performance.now() - prepareStarted < beforeRecordDelayMs) {
      analyser.getFloatTimeDomainData(buffer);
      const frame = analyzeFrame([...buffer], ctx.sampleRate);
      options.onStatus?.({
        phase: "prepare",
        progress: (performance.now() - prepareStarted) / Math.max(1, beforeRecordDelayMs),
        level: frame.rms,
        voicedFrames: 0
      });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    const started = performance.now();
    while (performance.now() - started < durationMs) {
      analyser.getFloatTimeDomainData(buffer);
      const pitch = analyzeFrame([...buffer], ctx.sampleRate);
      allFrames.push(pitch);
      if (pitch.frequency && pitch.clarity > 0.35) frames.push(pitch);
      options.onStatus?.({
        phase: "recording",
        progress: (performance.now() - started) / Math.max(1, durationMs),
        level: pitch.rms,
        voicedFrames: frames.length
      });
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    stream.getTracks().forEach((track) => track.stop());
    await ctx.close();
    const voiceActivity = clamp(frames.length / Math.max(1, allFrames.length), 0, 1);
    const intensityRms = median(allFrames.map((frame) => frame.rms));
    if (frames.length < 4) {
      return {
        voice: {
          detected: false,
          confidence: clamp(voiceActivity * 0.45 + clamp(intensityRms / 0.08, 0, 1) * 0.2, 0, 0.45),
          voiceActivity,
          intensityRms
        },
        globalTune: null,
        debug: { totalFrames: allFrames.length, voicedFrames: frames.length, voiceActivity, intensityRms }
      };
    }
    const frequencies = frames.map((frame) => frame.frequency);
    const fundamentalHz = median(frequencies);
    const deviations = frequencies.map((frequency) => Math.abs(Math.log2(frequency / fundamentalHz) * 1200));
    const stability = clamp(1 - (median(deviations) / 55), 0, 1);
    const clarity = median(frames.map((frame) => frame.clarity));
    const confidence = clamp(voiceActivity * 0.4 + clarity * 0.3 + stability * 0.18 + clamp(intensityRms / 0.08, 0, 1) * 0.12, 0, 1);
    const note = noteFromFrequency(fundamentalHz);
    return {
      voice: {
        detected: confidence >= 0.35,
        fundamentalHz,
        pitchClass: note?.pitchClass,
        centsOffset: note?.centsOffset,
        pitchVariabilityCents: median(deviations),
        intensityRms,
        voiceActivity,
        confidence
      },
      debug: { totalFrames: allFrames.length, voicedFrames: frames.length, voiceActivity, stability, clarity, intensityRms }
    };
  }
}
