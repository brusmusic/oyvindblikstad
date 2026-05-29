const root = document.documentElement;
const languagePanel = document.getElementById("language-panel");
const focusToggle = document.getElementById("focusToggle");
const outlineToggle = document.getElementById("outlineToggle");
const councilToggle = document.getElementById("councilToggle");
let bodySize = 18;

document.querySelectorAll("[data-panel-toggle]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const target = document.getElementById(button.dataset.panelToggle);
    target.classList.toggle("is-open");
  });
});

document.addEventListener("click", (event) => {
  if (!languagePanel.contains(event.target) && !event.target.matches("[data-panel-toggle]")) {
    languagePanel.classList.remove("is-open");
  }
});

document.querySelectorAll("[data-size]").forEach((button) => {
  button.addEventListener("click", () => {
    bodySize += button.dataset.size === "up" ? 1 : -1;
    bodySize = Math.max(16, Math.min(23, bodySize));
    root.style.setProperty("--body-size", `${bodySize}px`);
  });
});

focusToggle.addEventListener("click", () => {
  const active = document.body.classList.toggle("focus-mode");
  focusToggle.setAttribute("aria-pressed", String(active));
});

outlineToggle.addEventListener("click", () => {
  document.body.classList.toggle("show-outline");
});

councilToggle.addEventListener("click", () => {
  document.body.classList.toggle("show-council");
});
