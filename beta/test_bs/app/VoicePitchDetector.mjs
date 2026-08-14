import { clamp, median, noteFromFrequency } from "./utils.mjs";

function autocorrelate(buffer, sampleRate) {
  const rms = Math.sqrt(buffer.reduce((sum, value) => sum + value * value, 0) / buffer.length);
  if (rms < 0.012) return null;
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
  if (bestLag < 0 || best < 0.002) return null;
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
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    source.connect(analyser);
    const buffer = new Float32Array(analyser.fftSize);
    const frames = [];
    const started = performance.now();
    while (performance.now() - started < durationMs) {
      analyser.getFloatTimeDomainData(buffer);
      const pitch = autocorrelate([...buffer], ctx.sampleRate);
      if (pitch && pitch.clarity > 0.45) frames.push(pitch);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    stream.getTracks().forEach((track) => track.stop());
    await ctx.close();
    if (frames.length < 6) {
      return { voice: { detected: false, confidence: 0.2 }, globalTune: null, debug: { voicedFrames: frames.length } };
    }
    const frequencies = frames.map((frame) => frame.frequency);
    const fundamentalHz = median(frequencies);
    const deviations = frequencies.map((frequency) => Math.abs(Math.log2(frequency / fundamentalHz) * 1200));
    const stability = clamp(1 - (median(deviations) / 55), 0, 1);
    const clarity = median(frames.map((frame) => frame.clarity));
    const confidence = clamp((frames.length / 18) * 0.25 + stability * 0.45 + clarity * 0.3, 0, 1);
    const note = noteFromFrequency(fundamentalHz);
    return {
      voice: {
        detected: confidence >= 0.55,
        fundamentalHz,
        pitchClass: note?.pitchClass,
        centsOffset: note?.centsOffset,
        confidence
      },
      debug: { voicedFrames: frames.length, stability, clarity }
    };
  }
}
