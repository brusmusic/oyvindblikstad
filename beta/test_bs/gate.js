const PASSWORD_HASH = "2049614dcd8608316fc27a9b3a259fb4c526c516773de05bc8bb69152843f445";
const ACCESS_KEY = "resonance-lab-test-bs-access";

const form = document.getElementById("gateForm");
const input = document.getElementById("accessCode");
const statusEl = document.getElementById("status");
const params = new URLSearchParams(window.location.search);

async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function accessTarget() {
  const next = params.get("next");
  if (!next) return "app/";
  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return "app/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "app/";
  }
}

function openTest() {
  sessionStorage.setItem(ACCESS_KEY, "granted");
  window.location.href = accessTarget();
}

if (params.get("lock") === "1") {
  sessionStorage.removeItem(ACCESS_KEY);
  history.replaceState(null, "", window.location.pathname);
}

if (sessionStorage.getItem(ACCESS_KEY) === "granted") {
  openTest();
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.className = "status";
  statusEl.textContent = "Checking...";

  const hash = await sha256(input.value.trim());
  if (hash === PASSWORD_HASH) {
    statusEl.textContent = "Opening...";
    openTest();
    return;
  }

  statusEl.className = "status error";
  statusEl.textContent = "Access code was not accepted.";
  input.select();
});
