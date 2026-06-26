const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.18,
  }
);

revealItems.forEach((item) => observer.observe(item));

const betaButton = document.getElementById("wavevestBetaBtn");
const modal = document.getElementById("wavevestModal");
const unlockForm = document.getElementById("wavevestUnlockForm");
const passwordInput = document.getElementById("wavevestPassword");
const statusEl = document.getElementById("wavevestStatus");

function trackWavevestGate(eventName, params = {}) {
  const payload = {
    event_category: "wavevest_beta",
    app_location: "rehuman_gate",
    transport_type: "beacon",
    ...params
  };
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
  }
}

function openWavevestModal() {
  modal?.classList.remove("hidden");
  statusEl.textContent = "";
  trackWavevestGate("wavevest_gate_open");
  window.setTimeout(() => passwordInput?.focus(), 30);
}

function closeWavevestModal() {
  modal?.classList.add("hidden");
  if (passwordInput) passwordInput.value = "";
}

function bytesFromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveWavevestKey(password, salt, iterations) {
  const encoded = new TextEncoder().encode(password);
  const keyMaterial = await crypto.subtle.importKey("raw", encoded, "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

async function unlockWavevest(password) {
  const payload = window.WAVEVEST_PAYLOAD;
  if (!payload) throw new Error("Missing Wavevest payload");

  const salt = bytesFromBase64(payload.salt);
  const iv = bytesFromBase64(payload.iv);
  const tag = bytesFromBase64(payload.tag);
  const data = bytesFromBase64(payload.data);
  const encrypted = new Uint8Array(data.length + tag.length);
  encrypted.set(data);
  encrypted.set(tag, data.length);

  const key = await deriveWavevestKey(password, salt, payload.iterations);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

betaButton?.addEventListener("click", openWavevestModal);

document.querySelectorAll("[data-wavevest-close]").forEach((button) => {
  button.addEventListener("click", closeWavevestModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal?.classList.contains("hidden")) closeWavevestModal();
});

unlockForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = unlockForm.querySelector("button");
  statusEl.className = "wavevest-status";
  statusEl.textContent = "Opening...";
  button.disabled = true;

  try {
    const html = await unlockWavevest(passwordInput.value);
    trackWavevestGate("wavevest_unlock_success");
    document.open();
    document.write(html);
    document.close();
  } catch {
    trackWavevestGate("wavevest_unlock_failed");
    statusEl.className = "wavevest-status error";
    statusEl.textContent = "Access code was not accepted.";
    button.disabled = false;
    passwordInput.select();
  }
});
