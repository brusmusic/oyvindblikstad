export class HapticEngine {
  constructor() {
    this.supported = false;
    this.events = [];
  }

  trigger(name = "softPulse", options = {}) {
    this.events.push({ name, options, at: Date.now() });
    return { supported: false, pattern: [] };
  }

  cancel() {}
}
