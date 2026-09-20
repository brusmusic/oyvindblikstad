(() => {
  "use strict";

  const durationSec = 1800;
  const curve = (points) => points.map(([t, v, type = "spline"]) => ({ t, v, curve: type }));
  const track = (id, name, type, role, unit, color, points) => ({
    id,
    name,
    type,
    role,
    unit,
    source: "authored",
    color,
    curve: curve(points)
  });

  window.TUNER_ATLAS_JOURNEY_LIBRARY.sleep_ready = {
    format: "tuner-journey",
    version: 1,
    id: "tuner-sleep-ready-chair-v1",
    name: "Sleep Ready",
    description: "A seated pre-sleep vibration journey that gradually settles the body before bed.",
    durationSec,
    view: {
      frequencyWindow: { minHz: 32, maxHz: 62 },
      timeWindow: { startSec: 0, endSec: durationSec },
      beatWindow: { min: -1, max: 1 }
    },
    transport: { loop: false, loopStartSec: 0, loopEndSec: durationSec },
    tracks: [
      track("signal_l", "L main", "tone", "main", "Hz", "#60c7a0", [
        [0, 50, "ease"], [216, 49.5, "spline"], [576, 44, "spline"],
        [1044, 41.5, "spline"], [1440, 40.5, "ease"], [1674, 40.5, "hold"], [1800, 40.5, "hold"]
      ]),
      track("signal_r", "R affected", "tone", "affected", "Hz", "#8d7cff", [
        [0, 50.22, "ease"], [216, 49.676, "spline"], [576, 44.1144, "spline"],
        [1044, 41.56, "spline"], [1440, 40.53, "ease"], [1674, 40.52, "hold"], [1800, 40.52, "hold"]
      ]),
      track("r_offset", "R offset", "automation", "signedOffsetHz", "Hz", "#f0a6ff", [
        [0, 0.22, "ease"], [288, 0.176, "spline"], [684, 0.1144, "spline"],
        [1116, 0.06, "spline"], [1476, 0.03, "ease"], [1800, 0.02, "hold"]
      ]),
      track("amplitude", "Master amplitude", "automation", "amplitude", "linear", "#f0c96b", [
        [0, 0, "ease"], [51.44, 0.81, "ease"], [403, 0.925, "spline"],
        [912.52, 0.899, "spline"], [1316.49, 0.795, "spline"], [1642.32, 0.584, "ease"], [1800, 0, "ease"]
      ]),
      track("amplitude_l", "Amplitude L", "automation", "amplitudeLeft", "linear", "#5fd0ff", [
        [0, 0.9, "ease"], [756, 0.88, "spline"], [1476, 0.86, "ease"], [1800, 0.84, "hold"]
      ]),
      track("amplitude_r", "Amplitude R", "automation", "amplitudeRight", "linear", "#ff9f6e", [
        [0, 0.86, "ease"], [756, 0.88, "spline"], [1476, 0.86, "ease"], [1800, 0.84, "hold"]
      ])
    ],
    regions: [
      { id: "sleep_ready_arrival", name: "Seated arrival", start: 0, end: 216, mode: "linked", transitionSec: 0, rules: { r: { type: "signedOffset", sourceTrackId: "signal_l", offsetTrackId: "r_offset" } } },
      { id: "sleep_ready_orientation", name: "Lower the field", start: 216, end: 576, mode: "linked", transitionSec: 5, rules: { r: { type: "signedOffset", sourceTrackId: "signal_l", offsetTrackId: "r_offset" } } },
      { id: "sleep_ready_regulation", name: "Quiet descent", start: 576, end: 1224, mode: "linked", transitionSec: 5, rules: { r: { type: "signedOffset", sourceTrackId: "signal_l", offsetTrackId: "r_offset" } } },
      { id: "sleep_ready_settling", name: "Near-still landing", start: 1224, end: 1620, mode: "linked", transitionSec: 5, rules: { r: { type: "signedOffset", sourceTrackId: "signal_l", offsetTrackId: "r_offset" } } },
      { id: "sleep_ready_integration", name: "Fade before bed", start: 1620, end: 1800, mode: "hold", transitionSec: 5, rules: {} }
    ],
    relations: [{ id: "linked_signed_offset", type: "signedOffset", sourceTrackId: "signal_l", targetTrackId: "signal_r", offsetTrackId: "r_offset" }],
    assets: [],
    outputs: [],
    routing: [],
    presetNormalization: { masterAmplitudePeak: 1 },
    meta: {
      roomId: "calm",
      publicName: "Sleep Ready",
      internalName: "Sleep Landing / Pre-Sleep Regulation",
      visibility: { adminOnly: true, showInternalNameInAtlas: false, showInternalNameInAdmin: true },
      lab: {
        presetVersion: "0.1.0",
        author: "atlas-lab",
        sourceMethodVersion: "journey-development-lab-method-v0.1",
        claimBoundary: { category: "supportive-not-treatment", publicText: "Experimental sensory vibration journey for pre-sleep regulation support." },
        stateProfile: {
          conditionInput: "pre-sleep activation / night-time thought loops / difficulty transitioning into sleep",
          arousal: "medium-high",
          cognitiveLoad: "looping",
          bodyTone: "guarded",
          sensoryTolerance: "low",
          movementTolerance: "stillness",
          safetyNeed: "very-high",
          desiredShift: ["lower activation", "less mental noise", "softened body tone", "sleep readiness"]
        },
        avoidCriteria: ["active modulation during the final phase", "rhythmic pulses", "bright or stimulating movement", "large frequency jumps", "surprise transitions", "use in bed or overnight playback"],
        regulationHypothesis: "If a predictable, low-intensity vibration field gradually narrows its bindiff and settles into near-stillness while the person remains seated, the body may have an easier transition from night-time activation toward sleep readiness.",
        sonicArchitecture: {
          fundamentalRootHz: 50,
          tactileHapticHz: 40,
          differenceFrequencyRangeHz: [0.02, 0.22],
          targetBrainwaveBand: "none-explicit",
          breathRatePerMinute: 0,
          noiseProfile: "vibration-only",
          brightness: 0.04,
          density: 0.08,
          movement: "near-still-descending-landing",
          harmony: ["warm-root", "low-body-anchor", "near-unison-landing"],
          rhythm: "none"
        },
        globalTune: { enabled: false, source: "manual", anchor: "root", anchorHz: 50, targetHz: 50, transposeHz: 0, preservesBindiff: true },
        usageGuidance: { suggestedDurationMinutes: 30, mode: "adaptive-ready", bestUse: ["in a chair before bed", "after evening activity", "when the mind is active but the body is tired"], stopIf: ["arousal increases", "restlessness", "dizziness", "nausea", "pain increases", "palpitations", "strong discomfort"] },
        phases: [
          { id: "arrival", label: "Seated arrival", startSeconds: 0, durationSeconds: 216, intention: "meet the current state without demanding change", mode: "linked" },
          { id: "orientation", label: "Lower the field", startSeconds: 216, durationSeconds: 360, intention: "reduce movement and mental pull gradually", mode: "linked" },
          { id: "regulation", label: "Quiet descent", startSeconds: 576, durationSeconds: 648, intention: "move toward a slower, softer body state", mode: "linked" },
          { id: "settling", label: "Near-still landing", startSeconds: 1224, durationSeconds: 396, intention: "continue the linked movement with minimal bindiff", mode: "linked" },
          { id: "integration", label: "Fade before bed", startSeconds: 1620, durationSeconds: 180, intention: "end quietly before leaving the chair", mode: "hold" }
        ],
        adaptive: { mode: "adaptive-ready", supportedInputs: ["You-frequency"], futureRule: "If the user's state becomes more activated, do not add movement; reduce intensity and narrow bindiff." },
        feedback: { prePostScales: ["bodyTension", "mentalNoise", "sleepReadiness", "calmSafety", "restlessness"], freeTextPrompts: ["Did the body feel more ready for sleep?", "Did the vibration quiet or increase mental activity?", "Was anything uncomfortable?", "How was sleep after the session?"] },
        architectureNotes: "Chair session before bed, not an overnight signal. Apply global tune once at the beginning if desired. The last three minutes fade to silence before the user leaves the chair."
      }
    }
  };
})();
