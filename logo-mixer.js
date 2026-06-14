const mixerRoot = document.documentElement;
const mixerPanel = document.querySelector("#mixer-panel");
const mixerToggle = document.querySelector(".panel-toggle");
const mixerClose = document.querySelector(".close-panel");
const mixerTurbulence = document.querySelector("#irrational-field feTurbulence");
const mixerDisplacement = document.querySelector("#irrational-field feDisplacementMap");
const mixerCenter = document.querySelector(".shared-center");
const mixerStrings = document.querySelectorAll(".irrational-line");

if (mixerPanel && mixerToggle && mixerClose) {
  const channels = {
    a: { hue: 160, saturation: 34, lightness: 44, opacity: 55 },
    b: { hue: 214, saturation: 32, lightness: 46, opacity: 55 },
    c: { hue: 32, saturation: 38, lightness: 52, opacity: 55 },
  };
  let lastSeed = 17;
  let emergenceTimer;

  function setPanel(open) {
    mixerPanel.dataset.open = String(open);
    mixerToggle.setAttribute("aria-expanded", String(open));
  }

  function syncChannel(channel) {
    const value = channels[channel];
    const opacity = value.opacity / 100;
    mixerRoot.style.setProperty(
      `--field-${channel}`,
      `hsl(${value.hue} ${value.saturation}% ${value.lightness}%)`
    );
    mixerRoot.style.setProperty(`--field-${channel}-opacity`, String(opacity));
    mixerRoot.style.setProperty(`--ring-${channel}-opacity`, String(opacity * 0.5));
    document.querySelector(`[data-readout="${channel}-color"]`).textContent = `${value.hue}°`;
    document.querySelector(`[data-readout="${channel}-opacity"]`).textContent = `${value.opacity}%`;
  }

  function point(x, y, amount) {
    const radius = amount * (0.25 + Math.random());
    const angle = Math.random() * Math.PI * 2;
    return [Math.round(x + Math.cos(angle) * radius), Math.round(y + Math.sin(angle) * radius)];
  }

  function randomCenterPath() {
    const amount = 6 + Math.random() * 24;
    const p1 = point(158, 149, amount);
    const c1 = point(178, 129, amount);
    const c2 = point(208, 136, amount);
    const p2 = point(232, 145, amount);
    const c3 = point(260, 156, amount);
    const c4 = point(278, 184, amount);
    const p3 = point(272, 212, amount);
    const c5 = point(265, 242, amount);
    const c6 = point(237, 264, amount);
    const p4 = point(207, 272, amount);
    const c7 = point(178, 279, amount);
    const c8 = point(144, 265, amount);
    const p5 = point(130, 239, amount);
    const c9 = point(116, 213, amount);
    const c10 = point(122, 180, amount);
    const p6 = point(143, 162, amount);
    const c11 = point(149, 157, amount);
    const c12 = point(153, 153, amount);

    return `M${p1[0]} ${p1[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]} C${c3[0]} ${c3[1]} ${c4[0]} ${c4[1]} ${p3[0]} ${p3[1]} C${c5[0]} ${c5[1]} ${c6[0]} ${c6[1]} ${p4[0]} ${p4[1]} C${c7[0]} ${c7[1]} ${c8[0]} ${c8[1]} ${p5[0]} ${p5[1]} C${c9[0]} ${c9[1]} ${c10[0]} ${c10[1]} ${p6[0]} ${p6[1]} C${c11[0]} ${c11[1]} ${c12[0]} ${c12[1]} ${p1[0]} ${p1[1]}Z`;
  }

  function randomStringPath(index) {
    const templates = [
      [
        [143, 192],
        [158, 176],
        [178, 184],
        [190, 203],
        [202, 222],
        [222, 226],
        [238, 211],
        [252, 198],
        [250, 177],
        [266, 168],
      ],
      [
        [138, 221],
        [157, 237],
        [181, 229],
        [188, 207],
        [196, 184],
        [218, 171],
        [239, 184],
        [254, 193],
        [259, 214],
        [273, 225],
      ],
      [
        [154, 166],
        [175, 158],
        [185, 176],
        [179, 195],
        [173, 216],
        [190, 239],
        [214, 236],
        [236, 233],
        [242, 207],
        [259, 197],
      ],
    ];
    const amount = 5 + Math.random() * 18;
    const p = templates[index].map(([x, y]) => point(x, y, amount));
    return `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]} C${p[4][0]} ${p[4][1]} ${p[5][0]} ${p[5][1]} ${p[6][0]} ${p[6][1]} C${p[7][0]} ${p[7][1]} ${p[8][0]} ${p[8][1]} ${p[9][0]} ${p[9][1]}`;
  }

  function mutateEmergence() {
    if (!mixerTurbulence || !mixerDisplacement || !mixerCenter) return;
    let seed = Math.floor(Math.random() * 997) + 1;
    if (seed === lastSeed) seed += 1;
    lastSeed = seed;

    mixerTurbulence.setAttribute("seed", String(seed));
    mixerTurbulence.setAttribute("baseFrequency", (0.018 + Math.random() * 0.07).toFixed(3));
    mixerDisplacement.setAttribute("scale", (4 + Math.random() * 24).toFixed(1));
    mixerCenter.setAttribute("d", randomCenterPath());
    mixerStrings.forEach((line, index) => line.setAttribute("d", randomStringPath(index)));
  }

  function triggerEmergence() {
    clearTimeout(emergenceTimer);
    emergenceTimer = setTimeout(mutateEmergence, 120);
  }

  mixerToggle.addEventListener("click", () => setPanel(mixerPanel.dataset.open !== "true"));
  mixerClose.addEventListener("click", () => setPanel(false));

  document.querySelectorAll("[data-color]").forEach((input) => {
    input.addEventListener("input", () => {
      channels[input.dataset.channel].hue = Number(input.value);
      syncChannel(input.dataset.channel);
      triggerEmergence();
    });
  });

  document.querySelectorAll("[data-opacity]").forEach((input) => {
    input.addEventListener("input", () => {
      channels[input.dataset.channel].opacity = Number(input.value);
      syncChannel(input.dataset.channel);
      triggerEmergence();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setPanel(false);
  });

  Object.keys(channels).forEach(syncChannel);
}
