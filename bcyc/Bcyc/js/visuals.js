(() => {
  const canvas = document.getElementById("particleCanvas");
  const stage = document.getElementById("visualStage");
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const state = {
    phase: "free",
    track: null,
    particles: [],
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    phaseEnergy: 0.5,
    targetRadius: 120,
    visualRadius: 120,
    hueShift: 0
  };

  const PARTICLE_COUNT = 110;

  function resize() {
    const rect = stage.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.centerX = rect.width / 2;
    state.centerY = rect.height / 2;

    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticles() {
    state.particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      angle: rand(0, Math.PI * 2),
      radius: rand(50, 160),
      orbitSpeed: rand(0.0008, 0.003),
      size: rand(1.2, 4.2),
      drift: rand(0.1, 0.6),
      alpha: rand(0.08, 0.45),
      seed: rand(0, 1000)
    }));
  }

  function setTrack(track) {
    state.track = track;
  }

  function setPhase(phase) {
    state.phase = phase || "free";

    switch (state.phase) {
      case "inhale":
        state.targetRadius = 145;
        state.phaseEnergy = 1.0;
        break;
      case "exhale":
        state.targetRadius = 92;
        state.phaseEnergy = 0.45;
        break;
      case "holdIn":
        state.targetRadius = 145;
        state.phaseEnergy = 0.78;
        break;
      case "holdOut":
        state.targetRadius = 92;
        state.phaseEnergy = 0.22;
        break;
      default:
        state.targetRadius = 118;
        state.phaseEnergy = 0.55;
    }
  }

  function phaseColor(alpha = 1) {
    switch (state.phase) {
      case "inhale":
        return `rgba(110, 210, 255, ${alpha})`;
      case "exhale":
        return `rgba(110, 170, 220, ${alpha})`;
      case "holdIn":
        return `rgba(150, 220, 255, ${alpha})`;
      case "holdOut":
        return `rgba(90, 135, 180, ${alpha})`;
      default:
        return `rgba(180, 210, 235, ${alpha})`;
    }
  }

  function update(time) {
    state.visualRadius += (state.targetRadius - state.visualRadius) * 0.06;

    for (const p of state.particles) {
      let orbitFactor = 1;
      let radialDrift = 0;

      if (state.phase === "inhale") {
        orbitFactor = 0.9;
        radialDrift = 0.25;
      } else if (state.phase === "exhale") {
        orbitFactor = 0.65;
        radialDrift = -0.22;
      } else if (state.phase === "holdIn") {
        orbitFactor = 0.35;
        radialDrift = 0.02;
      } else if (state.phase === "holdOut") {
        orbitFactor = 0.18;
        radialDrift = -0.015;
      } else {
        orbitFactor = 0.5;
        radialDrift = 0.01;
      }

      p.angle += p.orbitSpeed * orbitFactor * 16;
      p.radius += radialDrift * p.drift;

      const minR = state.visualRadius * 0.55;
      const maxR = state.visualRadius * 1.7;

      if (p.radius < minR) p.radius = minR + rand(0, 8);
      if (p.radius > maxR) p.radius = maxR - rand(0, 8);

      // Mikrodrift på hold
      if (state.phase === "holdIn" || state.phase === "holdOut") {
        p.radius += Math.sin((time * 0.001) + p.seed) * 0.03;
      }
    }
  }

  function drawCoreGlow() {
    const r = state.visualRadius;

    const gradient = ctx.createRadialGradient(
      state.centerX,
      state.centerY,
      r * 0.15,
      state.centerX,
      state.centerY,
      r * 1.45
    );

    if (state.phase === "holdOut") {
      gradient.addColorStop(0, "rgba(120,180,255,0.10)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
    } else if (state.phase === "holdIn") {
      gradient.addColorStop(0, "rgba(170,225,255,0.22)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
    } else if (state.phase === "inhale") {
      gradient.addColorStop(0, "rgba(120,220,255,0.18)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
    } else if (state.phase === "exhale") {
      gradient.addColorStop(0, "rgba(90,160,220,0.12)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      gradient.addColorStop(0, "rgba(140,200,235,0.14)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, r * 1.45, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticles(time) {
    for (const p of state.particles) {
      const wobble = Math.sin((time * 0.0015) + p.seed) * 4;
      const x = state.centerX + Math.cos(p.angle) * (p.radius + wobble);
      const y = state.centerY + Math.sin(p.angle) * (p.radius + wobble);

      let alpha = p.alpha;

      if (state.phase === "holdOut") alpha *= 0.45;
      if (state.phase === "holdIn") alpha *= 0.9;
      if (state.phase === "inhale") alpha *= 1.1;

      ctx.fillStyle = phaseColor(alpha);
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, state.width, state.height);

    drawCoreGlow();
    drawParticles(time);
  }

  function animate(time) {
    update(time);
    draw(time);
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  setPhase("free");
  requestAnimationFrame(animate);

  window.addEventListener("resize", resize);

  window.BcycVisuals = {
    setPhase,
    setTrack
  };
})();
