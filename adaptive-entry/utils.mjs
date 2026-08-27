export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function average(values) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

export function median(values) {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) return NaN;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[mid] : (clean[mid - 1] + clean[mid]) / 2;
}

export function percentile(values, pct) {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) return NaN;
  const index = clamp((clean.length - 1) * pct, 0, clean.length - 1);
  const low = Math.floor(index);
  const high = Math.ceil(index);
  return low === high ? clean[low] : clean[low] + ((clean[high] - clean[low]) * (index - low));
}

export function movingAverage(values, radius) {
  return values.map((_, index) => {
    let sum = 0;
    let count = 0;
    for (let i = Math.max(0, index - radius); i <= Math.min(values.length - 1, index + radius); i += 1) {
      sum += values[i];
      count += 1;
    }
    return count ? sum / count : values[index];
  });
}

export function robustSpread(values) {
  const p95 = percentile(values, 0.95);
  const p05 = percentile(values, 0.05);
  return Number.isFinite(p95) && Number.isFinite(p05) ? p95 - p05 : 0;
}

export function noteFromFrequency(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0) return null;
  const noteNames = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const midi = 69 + (12 * Math.log2(frequency / 440));
  const nearest = Math.round(midi);
  const pitchClass = noteNames[((nearest % 12) + 12) % 12];
  const centsOffset = Math.round((midi - nearest) * 100);
  return { midi, nearestMidi: nearest, pitchClass, centsOffset };
}

export function mapFrequencyToRange(frequency, min = 36, max = 70) {
  if (!Number.isFinite(frequency) || frequency <= 0) return null;
  let mapped = frequency;
  while (mapped < min) mapped *= 2;
  while (mapped > max) mapped /= 2;
  return mapped;
}
