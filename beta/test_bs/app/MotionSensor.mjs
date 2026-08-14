import { requestMotionPermission } from "./DeviceCapabilities.mjs";

function emptyVector() {
  return { x: 0, y: 0, z: 0 };
}

export class MotionSensor {
  constructor() {
    this.samples = [];
    this.running = false;
    this.startedAt = 0;
    this.handleMotion = this.handleMotion.bind(this);
  }

  async start() {
    const permission = await requestMotionPermission();
    if (permission !== "granted") throw new Error("Motion permission was not granted.");
    this.samples = [];
    this.running = true;
    this.startedAt = performance.now();
    window.addEventListener("devicemotion", this.handleMotion, { passive: true });
  }

  stop() {
    this.running = false;
    window.removeEventListener("devicemotion", this.handleMotion);
    return this.samples.slice();
  }

  handleMotion(event) {
    if (!this.running) return;
    const ag = event.accelerationIncludingGravity || emptyVector();
    const accel = event.acceleration || emptyVector();
    const rotation = event.rotationRate || {};
    const t = performance.now() - this.startedAt;
    const sample = {
      t,
      ax: Number(accel.x) || 0,
      ay: Number(accel.y) || 0,
      az: Number(accel.z) || 0,
      gx: Number(ag.x) || 0,
      gy: Number(ag.y) || 0,
      gz: Number(ag.z) || 0,
      alpha: Number(rotation.alpha) || 0,
      beta: Number(rotation.beta) || 0,
      gamma: Number(rotation.gamma) || 0
    };
    sample.gravityMagnitude = Math.hypot(sample.gx, sample.gy, sample.gz);
    sample.accelMagnitude = Math.hypot(sample.ax, sample.ay, sample.az);
    sample.rotationMagnitude = Math.hypot(sample.alpha, sample.beta, sample.gamma);
    this.samples.push(sample);
  }
}
