(() => {
  const canvas = document.getElementById("particleCanvas");
  const stage = document.getElementById("visualStage");
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const config = {
    particleCount: 400,

    inhaleSpeed: 0.004,
    frictionInhale: 0.72,

    exhaleForceMin: 2.4,
    exhaleForceMax: 4.8,
    exhaleSpread: 0.9,
    exhaleRightDrift: 1.4,
    frictionExhaleX: 0.975,
    frictionExhaleY: 0.965,

    particleSizeMin: 1,
    particleSizeMax: 3,
    fieldRadiusScale: 0.22,
    baseAlpha: 0.8
  };

  const state = {
    width: 0,
    height: 0,
    cx: 0,
    cy: 0,
    fieldRadius: 100,
    particles: [],
    phase: "free",
    prevPhase: "free",
    currentExhaleHue: 24
  };

  function resize() {
    const rect = stage.getBoundingClientRect();

    state.width = rect.width;
    state.height = rect.height;
    state.cx = rect.width / 2;
    state.cy = rect.height / 2;
    state.fieldRadius =
      Math.min(rect.width, rect.height) * config.fieldRadiusScale;

    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function spawnParticle() {
    return {
      x: Math.random() * state.cx * 1.2 - state.cx * 0.2,
      y: Math.random() * state.height,
      vx: 0,
      vy: 0,
      size:
        Math.random() *
          (config.particleSizeMax - config.particleSizeMin) +
        config.particleSizeMin,
      alpha: config.baseAlpha,
      depth: Math.random(),
      active: false,
      dead: false,
      releaseOffset: null
    };
  }

  function createParticles() {
    state.particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      state.particles.push(spawnParticle());
    }
  }

  function ensureParticles() {
    while (state.particles.length < config.particleCount) {
      state.particles.push(spawnParticle());
    }
  }

  function setPhase(phase) {
    state.prevPhase = state.phase;
    state.phase = phase || "free";

    if (state.phase === "exhale" && state.prevPhase !== "exhale") {
      state.currentExhaleHue = 10 + Math.random() * 50;

      for (const p of state.particles) {
        p.releaseOffset = null;
        p.active = false;
      }
    }
  }

  function updateInhale(p) {
    if (p.x > state.cx) {
      p.dead = true;
      return;
    }

    const tx = state.cx;
    const ty = state.cy;

    const dx = tx - p.x;
    const dy = ty - p.y;

    p.vx += dx * config.inhaleSpeed;
    p.vy += dy * config.inhaleSpeed;

    p.vx *= config.frictionInhale;
    p.vy *= config.frictionInhale;

    p.x += p.vx;
    p.y += p.vy;

    p.alpha = config.baseAlpha;
  }

  function updateExhale(p, breathProgress) {
    if (p.x < state.cx - state.fieldRadius * 1.2) return;

    if (p.releaseOffset == null) {
      p.releaseOffset = Math.random() * 0.05;
    }

    const localP = Math.max(
      0,
      (breathProgress - p.releaseOffset) / (1 - p.releaseOffset)
    );

    if (localP > 0) {
      const angle =
        (Math.random() - 0.5) * config.exhaleSpread;

      const force =
        (config.exhaleForceMin +
          Math.random() *
            (config.exhaleForceMax - config.exhaleForceMin)) *
        Math.sin(localP * Math.PI);

      p.vx += Math.cos(angle) * force + config.exhaleRightDrift;
      p.vy += Math.sin(angle) * force;

      p.active = true;
    }

    if (p.active) {
      p.vx *= config.frictionExhaleX;
      p.vy *= config.frictionExhaleY;

      p.x += p.vx;
      p.y += p.vy;
    }

    if (p.x > state.width + 50) {
      p.dead = true;
    }

    p.alpha = config.baseAlpha;
  }

  function drawParticle(p) {
    const isLeft = p.x < state.cx;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    if (isLeft) {
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    } else {
      ctx.fillStyle = `hsla(${state.currentExhaleHue}, 80%, 60%, ${p.alpha})`;
    }

    ctx.fill();
  }

  function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function animate(time) {
    requestAnimationFrame(animate);

    drawBackground();
    ensureParticles();

    const t = time * 0.001;
    const breathProgress = (Math.sin(t) + 1) / 2;

    for (const p of state.particles) {
      if (state.phase === "inhale") updateInhale(p);
      else if (state.phase === "exhale")
        updateExhale(p, breathProgress);

      drawParticle(p);
    }

    state.particles = state.particles.filter(p => !p.dead);
  }

  resize();
  createParticles();
  animate(0);

  window.addEventListener("resize", resize);

  window.BcycVisuals = {
    setPhase
  };
})();
