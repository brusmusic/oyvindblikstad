const readerButton = document.querySelector(".reader-button");
const bookModal = document.getElementById("bookModal");
const bookModalContent = bookModal?.querySelector(".book-modal-content");
let lastBookTrigger = null;

readerButton.addEventListener("click", () => {
  const active = document.body.classList.toggle("reading");
  readerButton.setAttribute("aria-pressed", String(active));
  readerButton.textContent = active ? readerButton.dataset.closeLabel : readerButton.dataset.openLabel;
});

function openBook(trigger) {
  const panel = trigger.closest(".book-panel");
  const source = panel?.querySelector(".book-text");
  if (!panel || !source || !bookModal || !bookModalContent) return;

  lastBookTrigger = trigger;
  bookModalContent.replaceChildren(source.cloneNode(true));
  bookModal.classList.add("is-open");
  bookModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("book-open");
  bookModal.querySelector("[data-close-book]").focus();
}

function closeBook() {
  if (!bookModal || !bookModalContent) return;

  bookModal.classList.remove("is-open");
  bookModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("book-open");
  bookModalContent.replaceChildren();
  lastBookTrigger?.focus();
}

document.querySelectorAll("[data-open-book]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openBook(trigger);
  });
});

document.querySelectorAll("[data-close-book]").forEach((trigger) => {
  trigger.addEventListener("click", closeBook);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && bookModal?.classList.contains("is-open")) {
    closeBook();
  }
});
