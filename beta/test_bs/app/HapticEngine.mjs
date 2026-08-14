const patterns = {
  softPulse: [22],
  doubleSoftPulse: [18, 90, 18],
  transitionPulse: [35, 75, 24],
  heartbeat: [28, 120, 42],
  fadePulse: [12, 50, 18, 70, 24]
};

export class HapticEngine {
  constructor() {
    this.supported = typeof navigator.vibrate === "function";
    this.events = [];
  }

  trigger(name = "softPulse", options = {}) {
    const pattern = patterns[name] || patterns.softPulse;
    const intensity = Number.isFinite(options.intensity) ? Math.max(0.15, Math.min(1, options.intensity)) : 0.45;
    const scaled = pattern.map((value, index) => index % 2 ? value : Math.max(8, Math.round(value * intensity)));
    this.events.push({ name, intensity, at: Date.now() });
    if (this.supported) navigator.vibrate(scaled);
    return { supported: this.supported, pattern: scaled };
  }

  cancel() {
    if (this.supported) navigator.vibrate(0);
  }
}
