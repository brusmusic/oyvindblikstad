export async function detectDeviceCapabilities() {
  const secureContext = window.isSecureContext;
  const hasMotionEvent = typeof DeviceMotionEvent !== "undefined";
  const motionPermission = typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function";
  const orientationPermission = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
  const motionBlockedReason = !secureContext
    ? "motion_requires_https_on_iphone"
    : (!hasMotionEvent ? "device_motion_event_unavailable" : null);
  return {
    accelerometer: hasMotionEvent,
    gyroscope: hasMotionEvent,
    microphone: Boolean(navigator.mediaDevices?.getUserMedia),
    haptics: false,
    advancedHaptics: false,
    headphonesDetected: false,
    secureContext,
    needsMotionPermission: motionPermission || orientationPermission,
    motionBlockedReason
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
