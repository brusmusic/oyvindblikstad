(() => {
  const canvas = document.getElementById("particleCanvas");
  const stage = document.getElementById("visualStage");
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const config = {
    particleCount: 320,

    // størrelse / utseende
    particleSizeMin: 1,
    particleSizeMax: 3,
    baseAlpha: 0.8,

    // "lungefelt" i sentrum
    lungRadius: 100,

    // hvor nye ambient-partikler kommer fra
    ambientSpawnMinX: -0.35,
    ambientSpawnMaxX: 0.05,
    ambientSpawnPadY: 40,

    // inhale
    inhalePull: 0.004,
    inhaleFriction: 0.9,

    // hold in
    holdInPull: 0.92,
    holdInFriction: 0.9,

    // exhale
    exhaleRightDrift: 1.5,
    exhaleForceMin: 2,
    exhaleForceMax: 5,
    exhaleSpread: 2.0,
    exhaleFrictionX: 0.985,
    exhaleFrictionY: 0.985,
    exhaleReleaseMax: 0.4,

    // hold out
    holdOutPull: 0.01,
    holdOutFriction: 0.96,

    // glow
    glowRadius: 1.8,
    glowAlphaFree: 0.02,
    glowAlphaHoldIn: 0.05,
    glowAlphaHoldOut: 0.09
  };

  const state = {
    width: 0,
    height: 0,
    cx: 0,
    cy: 0,
    particles: [],
    phase: "free",
    prevPhase: "free",
    phaseProgress: 0,
    currentExhaleHue: 24,
    track: null
  };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    const rect = stage.getBoundingClientRect();

    state.width = rect.width;
    state.height = rect.height;
    state.cx = rect.width / 2;
    state.cy = rect.height / 2;

    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function spawnParticle() {
    return {
      x: state.width * rand(config.ambientSpawnMinX, config.ambientSpawnMaxX),
      y: rand(-config.ambientSpawnPadY, state.height + config.ambientSpawnPadY),
      vx: 0,
      vy: 0,
      size: rand(config.particleSizeMin, config.particleSizeMax),
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

  function setPhase(phase, progress = 0) {
    state.prevPhase = state.phase;
    state.phase = phase || "free";
    state.phaseProgress = Math.max(0, Math.min(1, progress));

    if (state.phase !== state.prevPhase) {
      if (state.phase === "exhale") {
        state.currentExhaleHue = 10 + Math.random() * 50;

        for (const p of state.particles) {
          p.releaseOffset = null;
        }
      }

      if (state.phase === "inhale") {
        for (const p of state.particles) {
          p.active = false;
          p.releaseOffset = null;
        }
      }
    }
  }

  function setTrack(track) {
    state.track = track;
  }

  function setProgress(progress) {
    state.phaseProgress = Math.max(0, Math.min(1, progress));
  }

  function respawnAmbient(p) {
    p.x = state.width * rand(config.ambientSpawnMinX, config.ambientSpawnMaxX);
    p.y = rand(-config.ambientSpawnPadY, state.height + config.ambientSpawnPadY);
    p.vx = 0;
    p.vy = 0;
    p.alpha = config.baseAlpha;
    p.active = false;
    p.dead = false;
    p.releaseOffset = null;
  }

  function updateFree(p) {
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.x += p.vx;
    p.y += p.vy;
    p.alpha = config.baseAlpha;
  }

  function updateInhale(p, progress) {
    // Partikler som allerede er på høyresiden fjernes og erstattes fra venstre
    if (p.x > state.cx) {
      p.dead = true;
      return;
    }

    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * config.lungRadius;

    const tx = state.cx + Math.cos(angle) * r;
    const ty = state.cy + Math.sin(angle) * r;

    const dx = tx - p.x;
    const dy = ty - p.y;

    const wave = Math.sin(progress * Math.PI);
    const depthFactor = 0.5 + p.depth;

    p.vx += dx * config.inhalePull * wave * depthFactor;
    p.vy += dy * config.inhalePull * wave * depthFactor;

    p.vx *= config.inhaleFriction;
    p.vy *= config.inhaleFriction;

    p.x += p.vx;
    p.y += p.vy;

    p.alpha = config.baseAlpha;
    p.active = false;
  }

  function updateHoldIn(p) {
    const dx = state.cx - p.x;
    const dy = state.cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

    if (p.x < state.cx + config.lungRadius * 0.25) {
      p.vx += (dx / dist) * config.holdInPull;
      p.vy += (dy / dist) * config.holdInPull;
    }

    p.vx *= config.holdInFriction;
    p.vy *= config.holdInFriction;

    p.x += p.vx;
    p.y += p.vy;

    p.alpha = config.baseAlpha;
  }

  function updateExhale(p, progress) {
    // Partikler på venstresiden trekkes først mot sentrum før utblåsning
    if (p.x < state.cx) {
      const recoil = 1 - Math.exp(-progress * 6);

      const dx = state.cx - p.x;
      const dy = state.cy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

      p.vx -= (dx / dist) * recoil * 0.002;
      p.vy -= (dy / dist) * recoil * 0.004;

      p.vx *= 0.8;
      p.vy *= 0.95;
    }

    const dx = p.x - state.cx;
    const dy = p.y - state.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Bare partikler nær sentrum slippes ut i utpusten
    if (dist < config.lungRadius) {
      if (p.releaseOffset == null) {
        p.releaseOffset = Math.random() * config.exhaleReleaseMax;
      }

      const localP = Math.max(
        0,
        (progress - p.releaseOffset) / (1 - p.releaseOffset)
      );

      if (localP > 0) {
        const angle =
          Math.atan2(dy, dx) +
          (Math.random() - 0.5) * config.exhaleSpread;

        const force =
          (config.exhaleForceMin +
            Math.random() * (config.exhaleForceMax - config.exhaleForceMin)) *
          Math.sin(localP * Math.PI);

        p.vx += Math.cos(angle) * force + config.exhaleRightDrift;
        p.vy += Math.sin(angle) * force;

        p.active = true;
      }
    }

    if (p.active) {
      p.vx *= config.exhaleFrictionX;
      p.vy *= config.exhaleFrictionY;

      p.x += p.vx;
      p.y += p.vy;
    }

    if (p.x > state.width + 40) {
      p.dead = true;
    }

    p.alpha = config.baseAlpha;
  }

  function updateHoldOut(p) {
    const dx = state.cx - p.x;
    const dy = state.cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

    p.vx += (dx / dist) * config.holdOutPull;
    p.vy += (dy / dist) * config.holdOutPull;

    p.vx *= config.holdOutFriction;
    p.vy *= config.holdOutFriction;

    p.x += p.vx;
    p.y += p.vy;

    p.alpha = config.baseAlpha;
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    if (p.x < state.cx) {
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    } else {
      ctx.fillStyle = `hsla(${state.currentExhaleHue}, 80%, 60%, ${p.alpha})`;
    }

    ctx.fill();
  }

  function drawCenterGlow() {
    let alpha = config.glowAlphaFree;

    if (state.phase === "holdIn") alpha = config.glowAlphaHoldIn;
    if (state.phase === "holdOut") alpha = config.glowAlphaHoldOut;

    const radius = config.lungRadius * config.glowRadius;
    const g = ctx.createRadialGradient(
      state.cx, state.cy, 0,
      state.cx, state.cy, radius
    );

    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(0.35, `rgba(255,255,255,${alpha * 0.55})`);
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(state.cx, state.cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function animate() {
    requestAnimationFrame(animate);

    drawBackground();
    drawCenterGlow();
    ensureParticles();

    for (const p of state.particles) {
      if (state.phase === "inhale") {
        updateInhale(p, state.phaseProgress);
      } else if (state.phase === "holdIn") {
        updateHoldIn(p);
      } else if (state.phase === "exhale") {
        updateExhale(p, state.phaseProgress);
      } else if (state.phase === "holdOut") {
        updateHoldOut(p);
      } else {
        updateFree(p);
      }

      drawParticle(p);
    }

    state.particles = state.particles.filter(p => !p.dead);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener("resize", () => {
    resize();
    for (const p of state.particles) {
      if (
        p.x < -state.width * 0.6 ||
        p.x > state.width * 1.4 ||
        p.y < -200 ||
        p.y > state.height + 200
      ) {
        respawnAmbient(p);
      }
    }
  });

  window.BcycVisuals = {
    setPhase,
    setTrack,
    setProgress
  };
})();
