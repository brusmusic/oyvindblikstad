const PASSWORD_HASH = "24567e19a5eda8230a7d5a49080fade2cdceb7c24e6c60cc6c807ce669607bfd";
const ACCESS_KEY = "resonance-atlas-access";

const form = document.getElementById("gateForm");
const input = document.getElementById("accessCode");
const statusEl = document.getElementById("status");

async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function openAtlas() {
  sessionStorage.setItem(ACCESS_KEY, "granted");
  window.location.href = "app/";
}

if (new URLSearchParams(window.location.search).get("lock") === "1") {
  sessionStorage.removeItem(ACCESS_KEY);
  history.replaceState(null, "", window.location.pathname);
}

if (sessionStorage.getItem(ACCESS_KEY) === "granted") {
  openAtlas();
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.className = "status";
  statusEl.textContent = "Checking...";

  const hash = await sha256(input.value.trim());
  if (hash === PASSWORD_HASH) {
    statusEl.textContent = "Opening...";
    openAtlas();
    return;
  }

  statusEl.className = "status error";
  statusEl.textContent = "Password was not accepted.";
  input.select();
});
