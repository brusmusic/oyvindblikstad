(() => {
  const canvas = document.getElementById("particleCanvas");
  const stage = document.getElementById("visualStage");
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const state = {
    width: 0,
    height: 0,
    cx: 0,
    cy: 0,
    fieldRadius: 110,
    particles: [],
    phase: "free",
    prevPhase: "free",
    track: null,
    currentExhaleColor: { r: 255, g: 170, b: 90 },
    inhaleColor: { r: 220, g: 240, b: 255 },
    sparklePool: []
  };

  const PARTICLE_COUNT = 260;
  const SPARKLE_COUNT = 40;

  const EXHALE_PALETTE = [
    { r: 255, g: 170, b: 90 },   // varm amber
    { r: 255, g: 120, b: 90 },   // varm rød/oransje
    { r: 255, g: 205, b: 120 },  // gull
    { r: 220, g: 110, b: 170 },  // varm magenta
    { r: 170, g: 120, b: 255 }   // varm lilla
  ];

  function resize() {
    const rect = stage.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.cx = rect.width * 0.5;
    state.cy = rect.height * 0.5;
    state.fieldRadius = Math.min(rect.width, rect.height) * 0.18;

    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickExhaleColor() {
    return EXHALE_PALETTE[Math.floor(Math.random() * EXHALE_PALETTE.length)];
  }

  function rgba(c, a = 1) {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
  }

  function spawnLeftParticle() {
    return {
      x: rand(0, state.cx * 0.85),
      y: rand(0, state.height),
      vx: 0,
      vy: 0,
      size: rand(1.2, 3.4),
      alpha: rand(0.35, 0.9),
      depth: rand(0.5, 1.4),
      active: false,
      dead: false,
      colorMode: "inhale",
      color: state.inhaleColor,
      releaseOffset: null,
      glow: 0,
      driftSeed: rand(0, 1000),
      returnToCenter: false
    };
  }

  function spawnSparkle(x, y, color) {
    return {
      x,
      y,
      vx: rand(-0.35, -0.05),
      vy: rand(-0.2, 0.2),
      size: rand(1.0, 2.0),
      alpha: rand(0.3, 0.8),
      color,
      life: rand(40, 80)
    };
  }

  function createParticles() {
    state.particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      state.particles.push(spawnLeftParticle());
    }
  }

  function setTrack(track) {
    state.track = track;
  }

  function setPhase(phase) {
    state.prevPhase = state.phase;
    state.phase = phase || "free";

    if (state.phase === "exhale" && state.prevPhase !== "exhale") {
      state.currentExhaleColor = pickExhaleColor();
      // nullstill release-egenskaper ved hver nye utpust
      state.particles.forEach(p => {
        p.releaseOffset = null;
        p.returnToCenter = false;
      });
    }
  }

  function refillParticles() {
    while (state.particles.length < PARTICLE_COUNT) {
      state.particles.push(spawnLeftParticle());
    }
  }

  function updateInhale(p, time) {
    p.colorMode = "inhale";
    p.color = state.inhaleColor;
    p.returnToCenter = false;
    p.releaseOffset = null;
    p.active = false;

    if (p.x > state.cx + state.fieldRadius * 1.6) {
      p.dead = true;
      return;
    }

    const angle = rand(0, Math.PI * 2);
    const r = rand(0, state.fieldRadius);
    const tx = state.cx + Math.cos(angle) * r;
    const ty = state.cy + Math.sin(angle) * r;

    const ddx = tx - p.x;
    const ddy = ty - p.y;

    p.vx += ddx * 0.0036 * p.depth;
    p.vy += ddy * 0.0036 * p.depth;

    p.vx *= 0.83;
    p.vy *= 0.83;

    p.x += p.vx;
    p.y += p.vy;

    p.glow = 0.08;
  }

  function updateHoldIn(p, time) {
    p.colorMode = "inhale";
    p.color = state.inhaleColor;

    const wave = (Math.sin(time * 0.002 + p.driftSeed) + 1) * 0.5;
    const glowEnvelope = 0.25 + 0.35 * wave;

    p.vx *= 0.92;
    p.vy *= 0.92;
    p.vx += Math.sin(time * 0.001 + p.driftSeed) * 0.004;
    p.vy += Math.cos(time * 0.0013 + p.driftSeed) * 0.004;

    p.x += p.vx;
    p.y += p.vy;

    p.glow = glowEnvelope;
    p.alpha = Math.max(p.alpha, 0.5);
  }

  function updateExhale(p, time) {
    p.colorMode = "exhale";
    p.color = state.currentExhaleColor;

    const dx = p.x - state.cx;
    const dy = p.y - state.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < state.fieldRadius * 1.05) {
      if (p.releaseOffset == null) {
        p.releaseOffset = Math.random() * 0.45;
      }

      const localP = rand(0.55, 1.0) - p.releaseOffset;

      if (localP > 0) {
        const angle = Math.atan2(dy, dx) + rand(-0.7, 0.7);
        const force = rand(1.2, 4.8);

        p.vx += Math.cos(angle) * force + rand(1.0, 2.2);
        p.vy += Math.sin(angle) * force;
        p.active = true;
      }
    } else if (p.x < state.cx) {
      // skubb venstre-sidige partikler ut av sentrum før de slippes
      p.vx += 0.03;
    }

    if (p.active) {
      p.vx *= 0.987;
      p.vy *= 0.987;
      p.x += p.vx;
      p.y += p.vy;
    }

    if (p.x > state.width + 20) {
      p.dead = true;
      return;
    }

    // Fade bare ute mot høyre
    const fadeStartX = state.cx + state.width * 0.18;
    const fadeEndX = state.width * 0.98;
    if (p.x > fadeStartX) {
      const fade = 1 - Math.min(1, (p.x - fadeStartX) / (fadeEndX - fadeStartX));
      p.alpha = Math.max(0, fade * 0.85);
    } else {
      p.alpha = 0.82;
    }

    p.glow = 0.12;
  }

  function updateHoldOut(p, time) {
    if (p.colorMode !== "exhale") {
      p.colorMode = "exhale";
      p.color = state.currentExhaleColor;
    }

    const dx = state.cx - p.x;
    const dy = state.cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

    // bare noen få vender rolig tilbake
    if (!p.returnToCenter && Math.random() < 0.008) {
      p.returnToCenter = true;
    }

    if (p.returnToCenter) {
      p.vx += (dx / dist) * 0.018;
      p.vy += (dy / dist) * 0.018;

      // sparkle-spor
      if (Math.random() < 0.06) {
        state.sparklePool.push(spawnSparkle(p.x, p.y, p.color));
      }
    } else {
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.vx += Math.sin(time * 0.001 + p.driftSeed) * 0.003;
      p.vy += Math.cos(time * 0.0012 + p.driftSeed) * 0.003;
    }

    p.x += p.vx;
    p.y += p.vy;

    const glowWave = (Math.sin(time * 0.002 + p.driftSeed) + 1) * 0.5;
    p.glow = 0.2 + glowWave * 0.35;
    p.alpha = Math.max(p.alpha, 0.38);

    // hvis partikkel er nesten tilbake i sentrum, respawn den
    if (dist < state.fieldRadius * 0.45 && p.returnToCenter) {
      p.dead = true;
    }
  }

  function updateFree(p, time) {
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.vx += (Math.random() - 0.5) * 0.02;
    p.vy += (Math.random() - 0.5) * 0.02;
    p.x += p.vx;
    p.y += p.vy;
    p.glow = 0.04;
    p.alpha = 0.45;
    p.color = state.inhaleColor;
  }

  function updateParticles(time) {
    refillParticles();

    for (const p of state.particles) {
      if (state.phase === "inhale") updateInhale(p, time);
      else if (state.phase === "holdIn") updateHoldIn(p, time);
      else if (state.phase === "exhale") updateExhale(p, time);
      else if (state.phase === "holdOut") updateHoldOut(p, time);
      else updateFree(p, time);
    }

    state.particles = state.particles.filter(p => !p.dead);
  }

  function updateSparkles() {
    for (const s of state.sparklePool) {
      s.x += s.vx;
      s.y += s.vy;
      s.alpha *= 0.97;
      s.life -= 1;
    }
    state.sparklePool = state.sparklePool.filter(s => s.life > 0 && s.alpha > 0.03);
    while (state.sparklePool.length > SPARKLE_COUNT) state.sparklePool.shift();
  }

  function drawBackgroundGlow() {
    const grad = ctx.createLinearGradient(0, 0, state.width, 0);

    if (state.phase === "inhale" || state.phase === "holdIn") {
      grad.addColorStop(0, "rgba(170, 220, 255, 0.08)");
      grad.addColorStop(0.5, "rgba(40, 70, 110, 0.03)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else if (state.phase === "exhale" || state.phase === "holdOut") {
      const c = state.currentExhaleColor;
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, 0.04)`);
      grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.09)`);
    } else {
      grad.addColorStop(0, "rgba(255,255,255,0.02)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function drawFieldHint() {
    ctx.beginPath();
    ctx.ellipse(state.cx, state.cy, state.fieldRadius, state.fieldRadius * 0.72, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.stroke();
  }

  function drawParticle(p) {
    const glowAlpha = Math.min(0.35, p.glow);
    if (glowAlpha > 0.01) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (2.8 + p.glow * 2), 0, Math.PI * 2);
      ctx.fillStyle = rgba(p.color, glowAlpha * 0.45);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(p.color, p.alpha);
    ctx.fill();
  }

  function drawSparkle(s) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = rgba(s.color, s.alpha * 0.25);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(s.color, s.alpha);
    ctx.fill();
  }

  function draw(time) {
    ctx.clearRect(0, 0, state.width, state.height);
    drawBackgroundGlow();
    drawFieldHint();

    for (const p of state.particles) drawParticle(p);
    for (const s of state.sparklePool) drawSparkle(s);
  }

  function animate(time) {
    updateParticles(time);
    updateSparkles();
    draw(time);
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  requestAnimationFrame(animate);
  window.addEventListener("resize", resize);

  window.BcycVisuals = {
    setPhase,
    setTrack
  };
})();
