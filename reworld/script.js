const readerButton = document.querySelector(".reader-button");

readerButton.addEventListener("click", () => {
  const active = document.body.classList.toggle("reading");
  readerButton.setAttribute("aria-pressed", String(active));
  readerButton.textContent = active ? readerButton.dataset.closeLabel : readerButton.dataset.openLabel;
});
