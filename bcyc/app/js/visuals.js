(() => {
  const canvas = document.getElementById("particleCanvas");
  const stage = document.getElementById("visualStage");
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const config = {
    ambientCount: 420,

    inhaleForce: 0.0038,
    inhaleFriction: 0.0265,
    inhaleWander: 0.018,
    inhaleCenterPullY: 0.0018,

    exhaleSpawnRate: 190,
    exhaleForce: 0.055,
    exhaleDriftX: 0.16,
    exhaleSpreadY: 0.085,
    exhaleFrictionX: 0.992,
    exhaleFrictionY: 0.985,
    exhaleCenterJitterX: 10,
    exhaleCenterJitterY: 26,

    particleSizeMin: 0.8,
    particleSizeMax: 2.8,
    baseAlpha: 0.82,

    ambientSpawnMinX: -0.45,
    ambientSpawnMaxX: -0.05,
    ambientRespawnPad: 120,
    exhaleKillPad: 120
  };

  const state = {
    width: 0,
    height: 0,
    cx: 0,
    cy: 0,
    particles: [],
    phase: "free",
    prevPhase: "free",
    currentExhaleHue: 28,
    lastTime: 0,
    exhaleSpawnAccumulator: 0,
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

  function makeAmbientParticle() {
    return {
      mode: "ambient",
      x: state.width * rand(config.ambientSpawnMinX, config.ambientSpawnMaxX),
      y: rand(-40, state.height + 40),
      vx: rand(0.1, 0.5),
      vy: rand(-0.15, 0.15),
      size: rand(config.particleSizeMin, config.particleSizeMax),
      alpha: rand(config.baseAlpha * 0.65, config.baseAlpha),
      dead: false
    };
  }

  function makeExhaleParticle() {
    return {
      mode: "exhale",
      x: state.cx + rand(-config.exhaleCenterJitterX, config.exhaleCenterJitterX),
      y: state.cy + rand(-config.exhaleCenterJitterY, config.exhaleCenterJitterY),
      vx: rand(0.4, 1.2),
      vy: rand(-0.4, 0.4),
      size: rand(config.particleSizeMin, config.particleSizeMax + 0.6),
      alpha: rand(config.baseAlpha * 0.75, config.baseAlpha),
      dead: false
    };
  }

  function createParticles() {
    state.particles = [];
    for (let i = 0; i < config.ambientCount; i++) {
      state.particles.push(makeAmbientParticle());
    }
  }

  function ensureAmbientParticles() {
    let ambientCount = 0;

    for (const p of state.particles) {
      if (!p.dead && p.mode === "ambient") ambientCount++;
    }

    while (ambientCount < config.ambientCount) {
      state.particles.push(makeAmbientParticle());
      ambientCount++;
    }
  }

  function setPhase(phase) {
    state.prevPhase = state.phase;
    state.phase = phase || "free";

    if (state.phase === "exhale" && state.prevPhase !== "exhale") {
      state.currentExhaleHue = rand(12, 58);
      state.exhaleSpawnAccumulator = 0;
    }
  }

  function setTrack(track) {
    state.track = track;
  }

  function updateAmbientInhale(p, dt) {
    const dx = state.cx - p.x;
    const dy = state.cy - p.y;

    p.vx += dx * config.inhaleForce * dt;
    p.vy += dy * config.inhaleCenterPullY * dt;

    p.vx += rand(-config.inhaleWander, config.inhaleWander) * dt;
    p.vy += rand(-config.inhaleWander, config.inhaleWander) * dt;

    p.vx *= Math.pow(config.inhaleFriction, dt);
    p.vy *= Math.pow(config.inhaleFriction, dt);

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (
      p.x > state.cx + 10 ||
      p.x < -config.ambientRespawnPad - 50 ||
      p.y < -config.ambientRespawnPad ||
      p.y > state.height + config.ambientRespawnPad
    ) {
      p.dead = true;
    }
  }

  function updateAmbientFree(p, dt) {
    p.vx += rand(0.002, 0.01) * dt;
    p.vy += rand(-0.01, 0.01) * dt;

    p.vx *= 0.995;
    p.vy *= 0.995;

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (
      p.x > state.cx * 0.92 ||
      p.y < -config.ambientRespawnPad ||
      p.y > state.height + config.ambientRespawnPad
    ) {
      p.dead = true;
    }
  }

  function updateExhaleParticle(p, dt) {
    p.vx += config.exhaleDriftX * dt;
    p.vx += rand(0, config.exhaleForce) * dt;
    p.vy += rand(-config.exhaleSpreadY, config.exhaleSpreadY) * dt;

    p.vx *= Math.pow(config.exhaleFrictionX, dt);
    p.vy *= Math.pow(config.exhaleFrictionY, dt);

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (
      p.x > state.width + config.exhaleKillPad ||
      p.y < -config.exhaleKillPad ||
      p.y > state.height + config.exhaleKillPad
    ) {
      p.dead = true;
    }
  }

  function spawnExhaleFlow(dt) {
    state.exhaleSpawnAccumulator += config.exhaleSpawnRate * dt / 60;

    while (state.exhaleSpawnAccumulator >= 1) {
      state.particles.push(makeExhaleParticle());
      state.exhaleSpawnAccumulator -= 1;
    }
  }

  function drawParticle(p) {
    const colored = p.x >= state.cx && p.mode === "exhale";

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    if (colored) {
      ctx.fillStyle = `hsla(${state.currentExhaleHue}, 85%, 62%, ${p.alpha})`;
    } else {
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    }

    ctx.fill();
  }

  function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function animate(time) {
    requestAnimationFrame(animate);

    if (!state.lastTime) state.lastTime = time;
    let dt = (time - state.lastTime) / (1000 / 60);
    state.lastTime = time;

    if (dt < 0.25) dt = 0.25;
    if (dt > 2.5) dt = 2.5;

    drawBackground();

    if (state.phase === "exhale") {
      spawnExhaleFlow(dt);
    }

    for (const p of state.particles) {
      if (p.mode === "ambient") {
        if (state.phase === "inhale") updateAmbientInhale(p, dt);
        else updateAmbientFree(p, dt);
      } else if (p.mode === "exhale") {
        updateExhaleParticle(p, dt);
      }

      drawParticle(p);
    }

    state.particles = state.particles.filter(p => !p.dead);
    ensureAmbientParticles();
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
