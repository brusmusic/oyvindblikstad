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
    fieldRadius: 100,
    particles: [],
    sparkles: [],
    phase: "free",
    prevPhase: "free",
    track: null,
    currentExhaleHue: 24
  };

  const PARTICLE_COUNT = 300;
  const MAX_SPARKLES = 120;

  function resize() {
    const rect = stage.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.cx = rect.width / 2;
    state.cy = rect.height / 2;
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

  function spawnParticle() {
    return {
      x: Math.random() * state.cx * 1.2 - state.cx * 0.2,
      y: Math.random() * state.height,
      vx: 0,
      vy: 0,
      size: Math.random() * 2 + 1,
      alpha: 0.8,
      depth: Math.random(),
      active: false,
      dead: false,
      releaseOffset: null,
      returnToCenter: false
    };
  }

  function spawnSparkle(x, y) {
    return {
      x,
      y,
      vx: rand(-0.5, -0.08),
      vy: rand(-0.18, 0.18),
      size: rand(0.8, 1.8),
      alpha: rand(0.25, 0.7),
      life: rand(24, 60),
      hue: state.currentExhaleHue
    };
  }

  function createParticles() {
    state.particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      state.particles.push(spawnParticle());
    }
  }

  function ensureParticles() {
    while (state.particles.length < PARTICLE_COUNT) {
      state.particles.push(spawnParticle());
    }
  }

  function setTrack(track) {
    state.track = track;
  }

  function setPhase(phase) {
    state.prevPhase = state.phase;
    state.phase = phase || "free";

    if (state.phase === "exhale" && state.prevPhase !== "exhale") {
      state.currentExhaleHue = 10 + Math.random() * 50; // varme toner
      for (const p of state.particles) {
        p.releaseOffset = null;
        p.returnToCenter = false;
        p.active = false;
      }
    }
  }

  function updateFree(p) {
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.vx += (Math.random() - 0.5) * 0.02;
    p.vy += (Math.random() - 0.5) * 0.02;
    p.x += p.vx;
    p.y += p.vy;
  }

  function updateInhale(p) {
    p.releaseOffset = null;
    p.active = false;
    p.returnToCenter = false;

    if (p.x > state.cx) {
      p.dead = true;
      return;
    }

    const tx = state.cx - 20 + Math.random() * 40;
    const ty = state.cy + (Math.random() - 0.5) * state.fieldRadius * 1.2;

    const ddx = tx - p.x;
    const ddy = ty - p.y;
    const depthFactor = 0.5 + p.depth;

    // mer motstand / friksjon
    p.vx += ddx * 0.0028 * depthFactor;
    p.vy += ddy * 0.0028 * depthFactor;

    p.vx *= 0.72;
    p.vy *= 0.72;

    p.x += p.vx;
    p.y += p.vy;

    p.alpha = 0.8;
  }

  function updateHoldIn(p, time) {
    p.vx *= 0.92;
    p.vy *= 0.92;

    p.vx += Math.sin(time * 0.0012 + p.depth * 10) * 0.01;
    p.vy += Math.cos(time * 0.0014 + p.depth * 10) * 0.01;

    p.x += p.vx;
    p.y += p.vy;

    // hold partiklene i venstre/sentrum-feltet
    if (p.x > state.cx + state.fieldRadius * 0.25) {
      p.vx -= 0.06;
    }

    p.alpha = 0.8;
  }

  function updateExhale(p, breathProgress) {
    // venstre side skal alltid forbli hvit og rolig
    if (p.x < state.cx) {
      p.vx *= 0.9;
      p.vy *= 0.9;

      p.x += p.vx;
      p.y += p.vy;

      p.alpha = 0.8;
      return;
    }

    const dx = p.x - state.cx;
    const dy = p.y - state.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < state.fieldRadius) {
      if (p.releaseOffset == null) {
        p.releaseOffset = Math.random() * 0.4;
      }

      const localP = Math.max(0, (breathProgress - p.releaseOffset) / (1 - p.releaseOffset));

      if (localP > 0) {
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2;

        // dempet kraft
        const force = (0.8 + Math.random() * 2.2) * Math.sin(localP * Math.PI);

        p.vx += Math.cos(angle) * force + 0.45;
        p.vy += Math.sin(angle) * force * 0.65;

        p.active = true;
      }
    }

    if (p.active) {
      // mer friksjon
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.x += p.vx;
      p.y += p.vy;
    }

    if (p.x > state.width) {
      p.dead = true;
      return;
    }

    if (p.x > state.cx && p.active) {
      const fadeStart = 0.8;

      if (breathProgress > fadeStart) {
        const fadeProgress = (breathProgress - fadeStart) / (1 - fadeStart);
        p.alpha = 0.8 * (1 - fadeProgress);
      } else {
        p.alpha = 0.8;
      }
    } else {
      p.alpha = 0.8;
    }
  }

  function updateHoldOut(p, time) {
    if (!p.returnToCenter && p.x > state.cx && Math.random() < 0.01) {
      p.returnToCenter = true;
    }

    if (p.returnToCenter) {
      const dx = state.cx - p.x;
      const dy = state.cy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

      p.vx += (dx / dist) * 0.018;
      p.vy += (dy / dist) * 0.012;

      p.vx *= 0.985;
      p.vy *= 0.985;

      if (Math.random() < 0.05) {
        state.sparkles.push(spawnSparkle(p.x, p.y));
      }
    } else {
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.vx += Math.sin(time * 0.001 + p.depth * 10) * 0.005;
      p.vy += Math.cos(time * 0.0012 + p.depth * 10) * 0.005;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.alpha = Math.max(p.alpha, 0.35);

    if (p.returnToCenter) {
      const dx = p.x - state.cx;
      const dy = p.y - state.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < state.fieldRadius * 0.45) {
        p.dead = true;
      }
    }
  }

  function updateSparkles() {
    for (const s of state.sparkles) {
      s.x += s.vx;
      s.y += s.vy;
      s.alpha *= 0.97;
      s.life -= 1;
    }

    state.sparkles = state.sparkles.filter(s => s.life > 0 && s.alpha > 0.03);

    while (state.sparkles.length > MAX_SPARKLES) {
      state.sparkles.shift();
    }
  }

  function inhaleGlowAlpha(p, time) {
    return 0.08 + Math.sin(time * 0.002 + p.depth * 10) * 0.04;
  }

  function holdInGlowAlpha(p, time) {
    return 0.14 + Math.sin(time * 0.003 + p.depth * 10) * 0.08;
  }

  function exhaleGlowAlpha(p, time) {
    return 0.05 + Math.sin(time * 0.002 + p.depth * 10) * 0.03;
  }

  function holdOutGlowAlpha(p, time) {
    return 0.12 + Math.sin(time * 0.003 + p.depth * 10) * 0.06;
  }

  function drawParticle(p, time) {
    const isLeftSide = p.x < state.cx;

    let fill;
    let glow;
    let glowSize;

    if (isLeftSide) {
      if (state.phase === "holdIn") {
        fill = `rgba(255,255,255,${p.alpha})`;
        glow = `rgba(255,255,255,${Math.max(0, holdInGlowAlpha(p, time))})`;
        glowSize = p.size * 2.8;
      } else {
        fill = `rgba(255,255,255,${p.alpha})`;
        glow = `rgba(255,255,255,${Math.max(0, inhaleGlowAlpha(p, time))})`;
        glowSize = p.size * 2.2;
      }
    } else {
      if (state.phase === "holdOut") {
        fill = `hsla(${state.currentExhaleHue}, 80%, 60%, ${p.alpha})`;
        glow = `hsla(${state.currentExhaleHue}, 80%, 60%, ${Math.max(0, holdOutGlowAlpha(p, time))})`;
        glowSize = p.size * 3.0;
      } else {
        fill = `hsla(${state.currentExhaleHue}, 80%, 60%, ${p.alpha})`;
        glow = `hsla(${state.currentExhaleHue}, 80%, 60%, ${Math.max(0, exhaleGlowAlpha(p, time))})`;
        glowSize = p.size * 2.4;
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawSparkle(s) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${s.hue}, 90%, 65%, ${s.alpha * 0.22})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${s.alpha})`;
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

    // enkel intern fremdrift for exhale release/fade
    const phaseTime = time * 0.001;
    const breathProgress = (Math.sin(phaseTime) + 1) / 2;

    for (const p of state.particles) {
      if (state.phase === "inhale") updateInhale(p);
      else if (state.phase === "holdIn") updateHoldIn(p, time);
      else if (state.phase === "exhale") updateExhale(p, breathProgress);
      else if (state.phase === "holdOut") updateHoldOut(p, time);
      else updateFree(p);

      drawParticle(p, time);
    }

    state.particles = state.particles.filter(p => !p.dead);

    updateSparkles();
    for (const s of state.sparkles) drawSparkle(s);
  }

  resize();
  createParticles();
  animate(0);

  window.addEventListener("resize", resize);

  window.BcycVisuals = {
    setPhase,
    setTrack
  };
})();
