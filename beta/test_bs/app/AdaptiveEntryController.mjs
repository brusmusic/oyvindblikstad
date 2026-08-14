import { detectDeviceCapabilities } from "./DeviceCapabilities.mjs";
import { MotionSensor } from "./MotionSensor.mjs";
import { BreathDetector } from "./BreathDetector.mjs";
import { VoicePitchDetector } from "./VoicePitchDetector.mjs";
import { GlobalTuneMapper } from "./GlobalTuneMapper.mjs";
import { HapticEngine } from "./HapticEngine.mjs";

export class AdaptiveEntryController {
  constructor() {
    this.motionSensor = new MotionSensor();
    this.breathDetector = new BreathDetector();
    this.voicePitchDetector = new VoicePitchDetector();
    this.globalTuneMapper = new GlobalTuneMapper();
    this.haptics = new HapticEngine();
    this.state = "IDLE";
    this.aborted = false;
  }

  transition(next, onUpdate, extra = {}) {
    this.state = next;
    onUpdate?.({ state: next, ...extra });
  }

  abort() {
    this.aborted = true;
    this.motionSensor.stop();
    this.haptics.cancel();
    this.state = "IDLE";
  }

  async run(options = {}) {
    this.aborted = false;
    const onUpdate = options.onUpdate;
    const durationSec = options.durationSec || 45;
    const detectBreath = options.detectBreath !== false;
    const detectVoicePitch = Boolean(options.detectVoicePitch);
    this.transition("PREPARING", onUpdate);
    const capabilities = await detectDeviceCapabilities();
    const profile = {
      timestamp: Date.now(),
      capabilities,
      breath: { detected: false, confidence: 0 },
      voice: { detected: false, confidence: 0 },
      globalTune: null,
      motion: { stability: 0, signalQuality: 0 }
    };

    if (detectBreath && capabilities.accelerometer) {
      this.transition("SENSING_BREATH", onUpdate, { message: "Finding your rhythm..." });
      await this.motionSensor.start();
      const started = performance.now();
      while (!this.aborted && performance.now() - started < durationSec * 1000) {
        onUpdate?.({
          state: "SENSING_BREATH",
          progress: (performance.now() - started) / (durationSec * 1000),
          samples: this.motionSensor.samples.length
        });
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      const samples = this.motionSensor.stop();
      const result = this.breathDetector.analyze(samples);
      profile.breath = result.breath;
      profile.motion = result.motion;
      profile.debug = { breath: result.debug };
      this.transition(result.breath.detected ? "BREATH_ACQUIRED" : "BREATH_UNKNOWN", onUpdate, { profile });
      this.haptics.trigger(result.breath.detected ? "softPulse" : "doubleSoftPulse", { intensity: result.breath.detected ? 0.35 : 0.22 });
    }

    if (!this.aborted && detectVoicePitch && capabilities.microphone) {
      this.transition("SENSING_VOICE", onUpdate, { message: "If it feels natural, hum softly on the exhale." });
      const voiceResult = await this.voicePitchDetector.analyze({ durationSec: options.voiceDurationSec || 10 });
      profile.voice = voiceResult.voice;
      profile.globalTune = this.globalTuneMapper.map(voiceResult.voice);
      profile.debug = { ...(profile.debug || {}), voice: voiceResult.debug };
    }

    this.transition("PROFILE_READY", onUpdate, { profile });
    return profile;
  }
}
