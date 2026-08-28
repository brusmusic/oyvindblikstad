const form = document.getElementById("newsletterForm");
const email = document.getElementById("email");
const note = document.getElementById("note");
const statusEl = document.getElementById("formStatus");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const address = email.value.trim();
  const message = note.value.trim();
  const subject = encodeURIComponent("Resonance Atlas interest list");
  const body = encodeURIComponent([
    "Please add me to the Resonance Atlas interest list.",
    "",
    `Email: ${address}`,
    message ? `Note: ${message}` : ""
  ].filter(Boolean).join("\n"));

  statusEl.textContent = "Opening your email app...";
  window.location.href = `mailto:oyvindblikstad@gmail.com?subject=${subject}&body=${body}`;
});
