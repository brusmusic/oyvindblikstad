const books = [
  {
    id: "children-01",
    level: "children",
    series: "Series 01",
    title: "Why Can't Everyone Just Be Friends?",
    subtitle: "The Line That Moved",
    path: "books/children/01_why_cant_everyone_just_be_friends.md",
    teaser: "A crack in the schoolyard becomes an invisible border. Some children get to play. Others wait to be invited.",
  },
  {
    id: "children-02",
    level: "children",
    series: "Series 02",
    title: "Why Can't We Build It Together?",
    subtitle: "The Open Hut",
    path: "books/children/02_why_cant_we_build_it_together.md",
    teaser: "A class is given a pile of wood and asked to build something together. The loudest voices shape the first plan.",
  },
  {
    id: "children-03",
    level: "children",
    series: "Series 03",
    title: "Why Do We Need Each Other?",
    subtitle: "The Air in the Room",
    path: "books/children/03_why_do_we_need_each_other.md",
    teaser: "A glass of water spills when the lights go out. The first question is not who did it, but what is needed now.",
  },
  {
    id: "youth-01",
    level: "youth",
    series: "Series 01",
    title: "Why Can't Everyone Just Be Friends?",
    subtitle: "Shadows in the Feed",
    path: "books/youth/01_why_cant_everyone_just_be_friends.md",
    teaser: "A seven-second clip turns Samir into a villain before anyone asks what happened before the camera started.",
  },
  {
    id: "youth-02",
    level: "youth",
    series: "Series 02",
    title: "Why Can't We Build It Together?",
    subtitle: "The City in the Server Room",
    path: "books/youth/02_why_cant_we_build_it_together.md",
    teaser: "A youth group designs a digital city for everyone, until the first testers reveal who was never imagined.",
  },
  {
    id: "youth-03",
    level: "youth",
    series: "Series 03",
    title: "Why Do We Need Each Other?",
    subtitle: "Shared Air",
    path: "books/youth/03_why_do_we_need_each_other.md",
    teaser: "An air-quality warning turns breathing into a shared lesson about risk, dependence, and invisible vulnerability.",
  },
  {
    id: "adult-01",
    level: "adult",
    series: "Series 01",
    title: "Why Can't Everyone Just Be Friends?",
    subtitle: "The Room That Paid for Silence",
    path: "books/adult/01_why_cant_everyone_just_be_friends.md",
    teaser: "A child's question enters an adult room full of borders, institutions, humiliation, profit, and fear.",
  },
  {
    id: "adult-02",
    level: "adult",
    series: "Series 02",
    title: "Why Can't We Build It Together?",
    subtitle: "The Foundation Room",
    path: "books/adult/02_why_cant_we_build_it_together.md",
    teaser: "A city plans a public house for everyone, but the process reveals who was invited after the foundations were drawn.",
  },
  {
    id: "adult-03",
    level: "adult",
    series: "Series 03",
    title: "Why Do We Need Each Other?",
    subtitle: "The Shared Body",
    path: "books/adult/03_why_do_we_need_each_other.md",
    teaser: "A city crisis exposes the systems people mistake for normal life: water, heat, care, transport, air, and trust.",
  },
  {
    id: "parenting-intro",
    level: "intro",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Introduksjon",
    path: "books/parenting/00_intro.md",
    audio: "audio/parenting/00_intro.mp3",
    art: {
      src: "images/parenting/00_intro.jpg",
      alt: "A quiet symbolic image for the question of good parenting.",
    },
    teaser: "Et spørsmål om barn, grenser, frihet og voksne som må tåle å undersøke seg selv.",
  },
  {
    id: "parenting-children",
    level: "children",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Tre gode historier for barn",
    path: "books/parenting/01_children.md",
    audio: "audio/parenting/01_children.mp3",
    art: {
      src: "images/parenting/01_children.jpg",
      alt: "A symbolic image for a children's book about care and boundaries.",
    },
    teaser: "Tre enkle historier om varme, grenser, reparasjon og hva voksne gjør når barn trenger hjelp.",
  },
  {
    id: "parenting-youth",
    level: "youth",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Grenser som holder",
    path: "books/parenting/02_youth.md",
    audio: "audio/parenting/02_youth.mp3",
    art: {
      src: "images/parenting/02_youth.jpg",
      alt: "A symbolic image for a youth book about freedom and responsibility.",
    },
    teaser: "En ungdomsbok om tillit, motstand, skjermliv, ansvar og voksne som må være tydelige uten å eie barnet.",
  },
  {
    id: "parenting-adult",
    level: "adult",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Kontakt, grense, reparasjon",
    path: "books/parenting/03_adult.md",
    audio: "audio/parenting/03_adult.mp3",
    art: {
      src: "images/parenting/03_adult.jpg",
      alt: "A symbolic image for an adult book about parenting and repair.",
    },
    teaser: "En voksen tekst om trygghet, makt, skam, reparasjon og hva barn trenger fra voksne som ikke alltid får det til.",
  },
];

const seriesAnchors = {
  "Series 01": {
    src: "images/series-01-line.jpg",
    alt: "A thin dark line across a gray surface.",
  },
  "Series 02": {
    src: "images/series-02-structure.jpg",
    alt: "An unfinished wooden structure beneath an open sky.",
  },
  "Series 03": {
    src: "images/series-03-ripples.jpg",
    alt: "A single drop forming ripples on water.",
  },
  "Series 04": {
    src: "images/parenting/00_intro.jpg",
    alt: "A quiet symbolic image for the question of good parenting.",
  },
};

const bookGrid = document.getElementById("bookGrid");
const reader = document.getElementById("reader");
const readerTitle = document.getElementById("readerTitle");
const readerKicker = document.getElementById("readerKicker");
const readerBody = document.getElementById("readerBody");
const readerAudioMount = document.getElementById("readerAudioMount");
const languagePanel = document.getElementById("language-panel");
let readerSize = 19;
let activeAudio = null;

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderBooks(filter = "all") {
  const visible = filter === "all" ? books : books.filter((book) => book.level === filter);
  bookGrid.innerHTML = visible.map((book) => {
    const anchor = book.art || seriesAnchors[book.series];
    return `
      <article class="book-card" data-level="${book.level}">
        <div class="book-card-layout">
          <div class="book-strip">
            <img src="${anchor.src}" alt="${anchor.alt}" loading="lazy">
          </div>
          <div class="book-copy">
          <p class="book-meta">${book.series} / ${titleCase(book.level)}</p>
          <h3>${book.title}</h3>
          <p><strong>${book.subtitle}</strong></p>
          <p>${book.teaser}</p>
          </div>
        </div>
        <button type="button" data-open-book="${book.id}">Open book</button>
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listType = null;

  function closeList() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    const ordered = line.match(/^(\d+)\.\s+(.*)$/);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${formatInline(ordered[2])}</li>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.*)$/);
    if (unordered) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${formatInline(unordered[1])}</li>`);
      continue;
    }

    closeList();

    if (line.startsWith("# ")) {
      html.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      html.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else {
      html.push(`<p>${formatInline(line)}</p>`);
    }
  }

  closeList();

  return html.join("");
}

function formatInline(value) {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function clearAudioPlayer() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  readerAudioMount.innerHTML = "";
}

function renderAudioPlayer(book) {
  clearAudioPlayer();
  if (!book.audio) return;

  readerAudioMount.innerHTML = `
    <div class="audio-player">
      <audio preload="metadata" src="${book.audio}"></audio>
      <button class="audio-toggle" type="button" aria-label="Play audiobook">Play</button>
      <input class="audio-seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Audio position">
      <span class="audio-time">0:00 / 0:00</span>
    </div>
  `;

  const audio = readerAudioMount.querySelector("audio");
  const toggle = readerAudioMount.querySelector(".audio-toggle");
  const seek = readerAudioMount.querySelector(".audio-seek");
  const time = readerAudioMount.querySelector(".audio-time");
  let seeking = false;
  activeAudio = audio;

  function syncTime() {
    const duration = audio.duration || 0;
    const current = audio.currentTime || 0;
    seek.value = duration ? String((current / duration) * 100) : "0";
    time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  }

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    toggle.textContent = "Pause";
    toggle.setAttribute("aria-label", "Pause audiobook");
  });

  audio.addEventListener("pause", () => {
    toggle.textContent = "Play";
    toggle.setAttribute("aria-label", "Play audiobook");
  });

  audio.addEventListener("loadedmetadata", syncTime);
  audio.addEventListener("timeupdate", () => {
    if (!seeking) syncTime();
  });
  audio.addEventListener("ended", syncTime);

  seek.addEventListener("input", () => {
    seeking = true;
    const duration = audio.duration || 0;
    const current = duration * (Number(seek.value) / 100);
    time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  });

  seek.addEventListener("change", () => {
    const duration = audio.duration || 0;
    audio.currentTime = duration * (Number(seek.value) / 100);
    seeking = false;
    syncTime();
  });
}

async function openBook(id) {
  const book = books.find((item) => item.id === id);
  if (!book) return;

  readerTitle.textContent = book.title;
  readerKicker.textContent = `${book.series} / ${titleCase(book.level)} / ${book.subtitle}`;
  renderAudioPlayer(book);
  readerBody.innerHTML = "<p>Loading book...</p>";
  reader.classList.add("is-open");
  reader.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");

  try {
    const response = await fetch(book.path);
    if (!response.ok) throw new Error(`Could not load ${book.path}`);
    const markdown = await response.text();
    const anchor = book.art || seriesAnchors[book.series];
    readerBody.innerHTML = `
      <div class="reader-art">
        <img src="${anchor.src}" alt="${anchor.alt}" loading="lazy">
      </div>
      ${markdownToHtml(markdown)}
    `;
    readerBody.scrollTop = 0;
  } catch (error) {
    readerBody.innerHTML = `<p>Could not load this book. Start the local server from the project folder and try again.</p><p>${escapeHtml(error.message)}</p>`;
  }
}

function closeReader() {
  reader.classList.remove("is-open");
  reader.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
  clearAudioPlayer();
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-book]");
  if (openButton) {
    openBook(openButton.dataset.openBook);
  }

  if (event.target.closest("[data-close-reader]")) {
    closeReader();
  }

  const panelButton = event.target.closest("[data-panel-toggle]");
  if (panelButton) {
    event.stopPropagation();
    document.getElementById(panelButton.dataset.panelToggle).classList.toggle("is-open");
  } else if (!event.target.closest(".language-panel")) {
    languagePanel.classList.remove("is-open");
  }
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderBooks(button.dataset.filter);
  });
});

document.querySelectorAll("[data-size]").forEach((button) => {
  button.addEventListener("click", () => {
    readerSize += button.dataset.size === "up" ? 1 : -1;
    readerSize = Math.max(16, Math.min(25, readerSize));
    document.documentElement.style.setProperty("--reader-size", `${readerSize}px`);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeReader();
  }
});

function drawCouncilField() {
  const canvas = document.getElementById("councilCanvas");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
  ctx.scale(scale, scale);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfaf7";
  ctx.fillRect(0, 0, width, height);

  const centerX = width * 0.72;
  const centerY = height * 0.47;
  const radius = Math.min(width, height) * 0.28;
  const labels = ["Child", "Science", "Faith", "Power", "Peace", "Nature", "Memory", "Dignity", "Blix"];
  const colors = ["#b38b45", "#455e7b", "#2e5d55", "#9b6040", "#6f7569"];

  ctx.strokeStyle = "rgba(46, 93, 85, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * (0.42 + i * 0.11), 0, Math.PI * 2);
    ctx.stroke();
  }

  labels.forEach((label, index) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(22, 24, 22, 0.10)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fillStyle = colors[index % colors.length];
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#fff";
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y);
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 54, 0, Math.PI * 2);
  ctx.fillStyle = "#161816";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("The", centerX, centerY - 9);
  ctx.fillText("Council", centerX, centerY + 9);
}

renderBooks();
drawCouncilField();
window.addEventListener("resize", drawCouncilField);
