(() => {
  const canvas = document.getElementById("particleCanvas");
  const stage = document.getElementById("visualStage");
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  // --- JUSTERBARE PARAMETRE (Tweak disse!) ---
  const config = {
    particleCount: 400,
    inhaleSpeed: 0.004,    // Hvor raskt de trekkes mot midten
    exhaleSpeed: 0.15,     // Kraften i utpusten mot høyre
    frictionInhale: 0.75,  // Motstand under innpust (lavverdi = mer "snappy")
    frictionExhale: 0.96,  // VIKTIG: Jo nærmere 1.0, jo lenger flyter partiklene
    particleSize: 1.5,
    centerGlow: 100        // Størrelsen på "lungen" i midten
  };

  const state = {
    width: 0, height: 0, cx: 0, cy: 0,
    particles: [],
    phase: "free",
    currentExhaleHue: 24,
    startTime: Date.now()
  };

  function resize() {
    const rect = stage.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.cx = rect.width / 2;
    state.cy = rect.height / 2;
    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function spawnParticle(side = 'left') {
    return {
      // Starter fra venstre side for innpust
      x: side === 'left' ? Math.random() * (state.cx * 0.8) : state.cx,
      y: Math.random() * state.height,
      vx: 0,
      vy: 0,
      size: Math.random() * config.particleSize + 0.5,
      alpha: 0,
      targetAlpha: 0.8,
      hue: 0,
      isProcessed: false // Blir true når den krysser midten
    };
  }

  function createParticles() {
    state.particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      state.particles.push(spawnParticle('left'));
    }
  }

  // OPPGAVE: Innpust - Trekkes fra venstre mot senter
  function updateInhale(p) {
    const dx = state.cx - p.x;
    const dy = state.cy - p.y;
    
    // Trekkkraft mot midten
    p.vx += dx * config.inhaleSpeed;
    p.vy += dy * config.inhaleSpeed * 0.5;

    p.vx *= config.frictionInhale;
    p.vy *= config.frictionInhale;

    p.x += p.vx;
    p.y += p.vy;
    
    // Fade inn partikler som kommer inn
    if (p.alpha < p.targetAlpha) p.alpha += 0.02;

    // Hvis partikkelen er veldig nær midten under innpust, "venter" den
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 10) {
        p.alpha *= 0.9; // Forsvinner inn i "lungen"
    }
  }

  // OPPGAVE: Utpust - Sendes ut mot høyre med farge
  function updateExhale(p) {
    // Hvis partikkelen er i "senter", gi den et dytt mot høyre
    if (p.x < state.cx + 20) {
        p.vx += Math.random() * config.exhaleSpeed * 5;
        p.vy += (Math.random() - 0.5) * 2;
    }

    // Jevn kraft mot høyre
    p.vx += config.exhaleSpeed;
    
    // Friksjon som styrer "flyten"
    p.vx *= config.frictionExhale;
    p.vy *= config.frictionExhale;

    p.x += p.vx;
    p.y += p.vy;

    // Fargeendring ved kryssing av midtlinjen
    if (p.x > state.cx) {
        p.isProcessed = true;
        p.hue = state.currentExhaleHue;
    }

    // Fade ut når de når kanten av skjermen
    if (p.x > state.width * 0.9) {
        p.alpha *= 0.9;
    }
    
    if (p.x > state.width || p.alpha < 0.01) {
        Object.assign(p, spawnParticle('left'));
    }
  }

  function updateFree(p) {
    p.vx += (Math.random() - 0.5) * 0.1;
    p.vy += (Math.random() - 0.5) * 0.1;
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
  }

  function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // Litt trail-effekt
    ctx.fillRect(0, 0, state.width, state.height);

    state.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      
      if (p.isProcessed) {
        // "Prosessert" utpust - farget
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha})`;
        // Legg til en liten glød på utpust
        ctx.shadowBlur = 5;
        ctx.shadowColor = `hsla(${p.hue}, 70%, 60%, ${p.alpha})`;
      } else {
        // Ren innpust - hvit/stjernehimmel
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
    });
    ctx.shadowBlur = 0; // Reset skygge for ytelse
  }

  function animate() {
    state.particles.forEach(p => {
      if (state.phase === "inhale") updateInhale(p);
      else if (state.phase === "exhale") updateExhale(p);
      else updateFree(p);
    });

    draw();
    requestAnimationFrame(animate);
  }

  function setPhase(phase) {
    state.phase = phase;
    if (phase === "exhale") {
      state.currentExhaleHue = 180 + Math.random() * 60; // Blått/Grønt/Turkis toner
    }
  }

  window.addEventListener("resize", resize);
  resize();
  createParticles();
  animate();

  window.BcycVisuals = { setPhase };
})();
