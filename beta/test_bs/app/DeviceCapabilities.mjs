export async function detectDeviceCapabilities() {
  const motionPermission = typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function";
  const orientationPermission = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
  return {
    accelerometer: typeof DeviceMotionEvent !== "undefined",
    gyroscope: typeof DeviceMotionEvent !== "undefined",
    microphone: Boolean(navigator.mediaDevices?.getUserMedia),
    haptics: false,
    advancedHaptics: false,
    headphonesDetected: false,
    secureContext: window.isSecureContext,
    needsMotionPermission: motionPermission || orientationPermission
  };
}

export async function requestMotionPermission() {
  const requests = [];
  if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
    requests.push(DeviceMotionEvent.requestPermission());
  }
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    requests.push(DeviceOrientationEvent.requestPermission());
  }
  if (!requests.length) return "granted";
  const results = await Promise.allSettled(requests);
  return results.every((result) => result.status === "fulfilled" && result.value === "granted") ? "granted" : "denied";
}
