const breathOverlay = document.getElementById("breathOverlay");
const breathCanvas = document.getElementById("breathCanvas");
const breathAudio = document.getElementById("breathAudio");
const breathPhase = document.getElementById("breathPhase");
const breathStage = document.querySelector(".breath-stage");
const breathToggleButtons = document.querySelectorAll("[data-breath-toggle]");

if (breathOverlay && breathCanvas && breathAudio && breathPhase) {
  const ctx = breathCanvas.getContext("2d");
  const lungRadius = 100;
  let particles = [];
  let currentExhaleHue = 20;
  let lastPhase = null;
  let hasStarted = false;
  let lastTap = 0;
  let cx = 0;
  let cy = 0;

  function resizeBreathCanvas() {
    const rect = breathCanvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    breathCanvas.width = Math.max(1, Math.floor(rect.width * scale));
    breathCanvas.height = Math.max(1, Math.floor(rect.height * scale));
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    cx = rect.width / 2;
    cy = rect.height / 2;
  }

  function spawn() {
    return {
      x: Math.random() * cx * 0.9,
      y: Math.random() * breathCanvas.getBoundingClientRect().height,
      vx: 0,
      vy: 0,
      size: Math.random() * 2 + 1,
      alpha: 0.8,
      depth: Math.random(),
      active: false,
    };
  }

  function resetParticles() {
    particles = [];
    for (let i = 0; i < 300; i += 1) particles.push(spawn());
  }

  function getBreath(t) {
    const cycle = 10;
    const l = t % cycle;

    if (l < 5) return { phase: "inhale", p: l / 5 };
    return { phase: "exhale", p: (l - 5) / 5 };
  }

  function draw(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    if (p.x < cx) {
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    } else {
      ctx.fillStyle = `hsla(${currentExhaleHue}, 80%, 60%, ${p.alpha})`;
    }

    ctx.fill();
  }

  function setToggleLabels() {
    const label = breathAudio.paused ? "Start" : "Pause";
    breathToggleButtons.forEach((button) => {
      button.textContent = label;
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    const rect = breathCanvas.getBoundingClientRect();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, rect.width, rect.height);

    const t = breathAudio.currentTime || 0;
    const isPaused = breathAudio.paused;
    const b = isPaused ? null : getBreath(t);

    breathPhase.innerText = isPaused ? "TAP TO START" : b.phase.toUpperCase();

    if (!isPaused && b.phase !== lastPhase) {
      if (b.phase === "exhale") {
        currentExhaleHue = 10 + Math.random() * 50;
      }
      lastPhase = b.phase;
    }

    while (particles.length < 300) {
      particles.push(spawn());
    }

    particles.forEach((p) => {
      if (isPaused) {
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;
        draw(p);
        return;
      }

      if (b.phase === "inhale" && p.x > cx) {
        p.dead = true;
        return;
      }

      if (b.phase === "inhale") {
        p.releaseOffset = null;
        p.active = false;

        if (p.x < cx) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * lungRadius;

          const tx = cx + Math.cos(angle) * r;
          const ty = cy + Math.sin(angle) * r;

          const ddx = tx - p.x;
          const ddy = ty - p.y;

          const wave = Math.sin(b.p * Math.PI);
          const depthFactor = 0.5 + p.depth;

          p.vx += ddx * 0.004 * wave * depthFactor;
          p.vy += ddy * 0.004 * wave * depthFactor;

          p.vx *= 0.79;
          p.vy *= 0.79;

          p.x += p.vx;
          p.y += p.vy;
        }

        p.alpha = 0.8;
      }

      if (b.phase === "exhale") {
        if (p.x < cx) {
          const recoil = 1 - Math.exp(-b.p * 6);

          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

          p.vx -= (dx / dist) * recoil * 0.002;
          p.vy -= (dy / dist) * recoil * 0.004;

          p.vx *= 0.8;
          p.vy *= 0.95;
        }

        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < lungRadius) {
          if (!p.releaseOffset) {
            p.releaseOffset = Math.random() * 0.4;
          }

          const localP = Math.max(0, (b.p - p.releaseOffset) / (1 - p.releaseOffset));

          if (localP > 0) {
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2;
            const force = (2 + Math.random() * 5) * Math.sin(localP * Math.PI);

            p.vx += Math.cos(angle) * force + 1.5;
            p.vy += Math.sin(angle) * force;

            p.active = true;
          }
        }

        if (p.active) {
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.x > rect.width) {
          p.dead = true;
        }

        if (p.x > cx && p.active) {
          const fadeStart = 0.8;

          if (b.p > fadeStart) {
            const fadeProgress = (b.p - fadeStart) / (1 - fadeStart);
            p.alpha = 0.8 * (1 - fadeProgress);
          } else {
            p.alpha = 0.8;
          }
        } else {
          p.alpha = 0.8;
        }
      }

      draw(p);
    });

    particles = particles.filter((p) => !p.dead);

    ctx.beginPath();
    ctx.arc(cx, cy, lungRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.stroke();
  }

  async function playBreath() {
    breathAudio.muted = false;
    breathOverlay.classList.add("has-started");
    hasStarted = true;
    try {
      await breathAudio.play();
    } catch {
      // Browser autoplay restrictions are resolved by the next user press.
    }
    setToggleLabels();
  }

  function pauseBreath() {
    breathAudio.pause();
    setToggleLabels();
  }

  function toggleBreath() {
    if (breathAudio.paused) {
      playBreath();
    } else {
      pauseBreath();
    }
  }

  function restartBreath() {
    breathAudio.pause();
    breathAudio.currentTime = 0;
    lastPhase = null;
    resetParticles();
    playBreath();
  }

  function openBreathing() {
    breathOverlay.classList.add("is-open");
    breathOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("breath-open");
    resizeBreathCanvas();
    resetParticles();
    playBreath();
  }

  function closeBreathing() {
    breathAudio.pause();
    breathAudio.currentTime = 0;
    breathOverlay.classList.remove("is-open", "has-started");
    breathOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("breath-open");
    hasStarted = false;
    lastTap = 0;
    lastPhase = null;
    setToggleLabels();
  }

  document.querySelector("[data-open-breathing]")?.addEventListener("click", openBreathing);

  document.querySelectorAll("[data-close-breathing]").forEach((button) => {
    button.addEventListener("click", closeBreathing);
  });

  breathToggleButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleBreath();
    });
  });

  breathStage?.addEventListener("pointerdown", () => {
    breathAudio.muted = false;

    if (!hasStarted) {
      playBreath();
      lastTap = Date.now();
      return;
    }

    const now = Date.now();

    if (now - lastTap < 300) {
      restartBreath();
      lastTap = 0;
      return;
    }

    toggleBreath();
    lastTap = now;
  });

  document.body.addEventListener("touchstart", () => {
    breathAudio.muted = false;
  }, { once: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && breathOverlay.classList.contains("is-open")) {
      closeBreathing();
    }
  });

  window.addEventListener("resize", () => {
    if (!breathOverlay.classList.contains("is-open")) return;
    resizeBreathCanvas();
    resetParticles();
  });

  resizeBreathCanvas();
  resetParticles();
  setToggleLabels();
  animate();
}
