window.TUNER_ATLAS_JOURNEY_LIBRARY = {
  "classic": {
    "format": "tuner-journey",
    "version": 1,
    "id": "journey_830457a8",
    "name": "Classic Linked Journey",
    "description": "Created in Tuner Composer.",
    "durationSec": 300,
    "view": {
      "frequencyWindow": {
        "minHz": 20,
        "maxHz": 80
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 300
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 300
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 50,
            "curve": "ease"
          },
          {
            "t": 80,
            "v": 54,
            "curve": "spline"
          },
          {
            "t": 145,
            "v": 48,
            "curve": "spline"
          },
          {
            "t": 215,
            "v": 52,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 50,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 50.5,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 53.9,
            "curve": "spline"
          },
          {
            "t": 150,
            "v": 48.3,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 51.8,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 50.2,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.5,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 0.25,
            "curve": "spline"
          },
          {
            "t": 150,
            "v": -0.25,
            "curve": "spline"
          },
          {
            "t": 235,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.2,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 10,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 260,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 300,
            "v": 0,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "region_1",
        "name": "Linked mode",
        "start": 0,
        "end": 120,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "region_2",
        "name": "Free mode",
        "start": 120,
        "end": 185,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "region_3",
        "name": "Linked mode",
        "start": 185,
        "end": 260,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "region_4",
        "name": "Hold",
        "start": 260,
        "end": 300,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "soft_wave": {
    "format": "tuner-journey",
    "version": 1,
    "id": "journey_0a7eb874",
    "name": "Soft Wave",
    "description": "Created in Tuner Composer.",
    "durationSec": 240,
    "view": {
      "frequencyWindow": {
        "minHz": 20,
        "maxHz": 80
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 240
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 240
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 48,
            "curve": "ease"
          },
          {
            "t": 45,
            "v": 52,
            "curve": "spline"
          },
          {
            "t": 92,
            "v": 45,
            "curve": "spline"
          },
          {
            "t": 145,
            "v": 51,
            "curve": "spline"
          },
          {
            "t": 200,
            "v": 43,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 42,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 48.4,
            "curve": "ease"
          },
          {
            "t": 62,
            "v": 51.5,
            "curve": "spline"
          },
          {
            "t": 110,
            "v": 44.8,
            "curve": "spline"
          },
          {
            "t": 166,
            "v": 51.1,
            "curve": "spline"
          },
          {
            "t": 220,
            "v": 42.8,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 42.2,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.4,
            "curve": "ease"
          },
          {
            "t": 55,
            "v": 0.12,
            "curve": "spline"
          },
          {
            "t": 100,
            "v": -0.16,
            "curve": "spline"
          },
          {
            "t": 160,
            "v": 0.12,
            "curve": "spline"
          },
          {
            "t": 215,
            "v": -0.08,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.1,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 18,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 180,
            "v": 0.8727,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "region_1",
        "name": "Linked mode",
        "start": 0,
        "end": 80,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "region_2",
        "name": "Ratio mode",
        "start": 80,
        "end": 150,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 48,
            "ratio": -1.618
          }
        }
      },
      {
        "id": "region_3",
        "name": "Linked mode",
        "start": 150,
        "end": 210,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "region_4",
        "name": "Hold",
        "start": 210,
        "end": 240,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "free_crossing": {
    "format": "tuner-journey",
    "version": 1,
    "id": "journey_fbbde4e9",
    "name": "Free Crossing Test",
    "description": "Created in Tuner Composer.",
    "durationSec": 210,
    "view": {
      "frequencyWindow": {
        "minHz": 20,
        "maxHz": 80
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 210
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 210
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 42,
            "curve": "ease"
          },
          {
            "t": 38,
            "v": 56,
            "curve": "spline"
          },
          {
            "t": 82,
            "v": 44,
            "curve": "spline"
          },
          {
            "t": 130,
            "v": 58,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 40,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 55,
            "curve": "ease"
          },
          {
            "t": 45,
            "v": 43,
            "curve": "spline"
          },
          {
            "t": 88,
            "v": 57,
            "curve": "spline"
          },
          {
            "t": 138,
            "v": 41,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 39.8,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.6,
            "curve": "ease"
          },
          {
            "t": 72,
            "v": -0.45,
            "curve": "spline"
          },
          {
            "t": 120,
            "v": 0.38,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": -0.18,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 0.1,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 8,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 160,
            "v": 0.9677,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 0,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "region_1",
        "name": "Free mode",
        "start": 0,
        "end": 95,
        "mode": "free",
        "transitionSec": 0,
        "rules": {}
      },
      {
        "id": "region_2",
        "name": "Linked mode",
        "start": 95,
        "end": 150,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "region_3",
        "name": "Ratio mode",
        "start": 150,
        "end": 185,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 48,
            "ratio": 1.5
          }
        }
      },
      {
        "id": "region_4",
        "name": "Hold",
        "start": 185,
        "end": 210,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "explore": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-explore-v1",
    "name": "Explore",
    "description": "A curious, searching journey with wider L/R crossings, golden-ratio inversion, and gentle amplitude movement.",
    "durationSec": 300,
    "view": {
      "frequencyWindow": {
        "minHz": 30,
        "maxHz": 80
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 300
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 300
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 44,
            "curve": "ease"
          },
          {
            "t": 25,
            "v": 47,
            "curve": "spline"
          },
          {
            "t": 55,
            "v": 53,
            "curve": "spline"
          },
          {
            "t": 85,
            "v": 41,
            "curve": "spline"
          },
          {
            "t": 120,
            "v": 58,
            "curve": "spline"
          },
          {
            "t": 155,
            "v": 49,
            "curve": "spline"
          },
          {
            "t": 190,
            "v": 62,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 46,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 54,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 48,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 44.35,
            "curve": "ease"
          },
          {
            "t": 55,
            "v": 52.8,
            "curve": "spline"
          },
          {
            "t": 80,
            "v": 45,
            "curve": "spline"
          },
          {
            "t": 108,
            "v": 61,
            "curve": "spline"
          },
          {
            "t": 138,
            "v": 43.5,
            "curve": "spline"
          },
          {
            "t": 170,
            "v": 58.5,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 47,
            "curve": "spline"
          },
          {
            "t": 238,
            "v": 60,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 48.2,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.35,
            "curve": "ease"
          },
          {
            "t": 35,
            "v": 0.55,
            "curve": "spline"
          },
          {
            "t": 65,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 95,
            "v": -0.32,
            "curve": "spline"
          },
          {
            "t": 125,
            "v": 0.72,
            "curve": "spline"
          },
          {
            "t": 155,
            "v": -0.58,
            "curve": "spline"
          },
          {
            "t": 190,
            "v": 0.44,
            "curve": "spline"
          },
          {
            "t": 230,
            "v": -0.22,
            "curve": "spline"
          },
          {
            "t": 265,
            "v": 0.28,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.2,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 12,
            "v": 0.8088,
            "curve": "ease"
          },
          {
            "t": 70,
            "v": 0.9118,
            "curve": "spline"
          },
          {
            "t": 118,
            "v": 0.7059,
            "curve": "spline"
          },
          {
            "t": 165,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 220,
            "v": 0.7647,
            "curve": "spline"
          },
          {
            "t": 275,
            "v": 0.8529,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 70,
            "v": 0.95,
            "curve": "spline"
          },
          {
            "t": 130,
            "v": 0.82,
            "curve": "spline"
          },
          {
            "t": 190,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.85,
            "curve": "ease"
          },
          {
            "t": 70,
            "v": 0.75,
            "curve": "spline"
          },
          {
            "t": 130,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 190,
            "v": 0.82,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.88,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "explore_orient",
        "name": "Orient",
        "start": 0,
        "end": 60,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "explore_open_field",
        "name": "Open field",
        "start": 60,
        "end": 150,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "explore_golden_inverse",
        "name": "Golden inverse",
        "start": 150,
        "end": 205,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 52,
            "ratio": -1.618
          }
        }
      },
      {
        "id": "explore_crossing",
        "name": "Crossing",
        "start": 205,
        "end": 255,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "explore_integrate",
        "name": "Integrate",
        "start": 255,
        "end": 285,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "explore_landing",
        "name": "Landing",
        "start": 285,
        "end": 300,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "get_energy": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-get-energy-v1",
    "name": "Get Energy",
    "description": "A lifting journey with higher main-frequency arcs, stronger positive offset, and alternating channel amplitude.",
    "durationSec": 240,
    "view": {
      "frequencyWindow": {
        "minHz": 30,
        "maxHz": 90
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 240
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 240
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 42,
            "curve": "ease"
          },
          {
            "t": 20,
            "v": 48,
            "curve": "spline"
          },
          {
            "t": 45,
            "v": 60,
            "curve": "spline"
          },
          {
            "t": 70,
            "v": 54,
            "curve": "spline"
          },
          {
            "t": 100,
            "v": 66,
            "curve": "spline"
          },
          {
            "t": 130,
            "v": 58,
            "curve": "spline"
          },
          {
            "t": 160,
            "v": 72,
            "curve": "spline"
          },
          {
            "t": 190,
            "v": 63,
            "curve": "spline"
          },
          {
            "t": 220,
            "v": 58,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 56,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 42.35,
            "curve": "ease"
          },
          {
            "t": 50,
            "v": 62,
            "curve": "spline"
          },
          {
            "t": 85,
            "v": 53.5,
            "curve": "spline"
          },
          {
            "t": 115,
            "v": 69.5,
            "curve": "spline"
          },
          {
            "t": 145,
            "v": 55,
            "curve": "spline"
          },
          {
            "t": 175,
            "v": 74,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 60,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 56.3,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.35,
            "curve": "ease"
          },
          {
            "t": 30,
            "v": 0.55,
            "curve": "spline"
          },
          {
            "t": 60,
            "v": 0.82,
            "curve": "spline"
          },
          {
            "t": 95,
            "v": 0.42,
            "curve": "spline"
          },
          {
            "t": 125,
            "v": -0.28,
            "curve": "spline"
          },
          {
            "t": 155,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 185,
            "v": 0.62,
            "curve": "spline"
          },
          {
            "t": 215,
            "v": 0.38,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.3,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 6,
            "v": 0.6667,
            "curve": "ease"
          },
          {
            "t": 35,
            "v": 0.9444,
            "curve": "spline"
          },
          {
            "t": 80,
            "v": 0.7778,
            "curve": "spline"
          },
          {
            "t": 125,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 165,
            "v": 0.8333,
            "curve": "spline"
          },
          {
            "t": 215,
            "v": 0.9167,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 40,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 80,
            "v": 0.82,
            "curve": "spline"
          },
          {
            "t": 120,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 160,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 200,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.85,
            "curve": "ease"
          },
          {
            "t": 40,
            "v": 0.78,
            "curve": "spline"
          },
          {
            "t": 80,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 120,
            "v": 0.84,
            "curve": "spline"
          },
          {
            "t": 160,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 200,
            "v": 0.86,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.9,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "energy_ignition",
        "name": "Ignition",
        "start": 0,
        "end": 45,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "energy_lift",
        "name": "Lift",
        "start": 45,
        "end": 120,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "energy_focus_ratio",
        "name": "Focus ratio",
        "start": 120,
        "end": 160,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 58,
            "ratio": 1.5
          }
        }
      },
      {
        "id": "energy_pulse",
        "name": "Pulse",
        "start": 160,
        "end": 215,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "energy_ready",
        "name": "Ready",
        "start": 215,
        "end": 240,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "ground": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-ground-v1",
    "name": "Ground",
    "description": "A slower downward journey that narrows the signed offset and settles near 40 Hz.",
    "durationSec": 360,
    "view": {
      "frequencyWindow": {
        "minHz": 20,
        "maxHz": 75
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 360
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 360
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 58,
            "curve": "ease"
          },
          {
            "t": 45,
            "v": 55,
            "curve": "spline"
          },
          {
            "t": 90,
            "v": 50,
            "curve": "spline"
          },
          {
            "t": 135,
            "v": 53,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 47,
            "curve": "spline"
          },
          {
            "t": 230,
            "v": 44,
            "curve": "spline"
          },
          {
            "t": 280,
            "v": 41.5,
            "curve": "spline"
          },
          {
            "t": 320,
            "v": 40,
            "curve": "ease"
          },
          {
            "t": 360,
            "v": 40,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 58.5,
            "curve": "ease"
          },
          {
            "t": 80,
            "v": 49.8,
            "curve": "spline"
          },
          {
            "t": 130,
            "v": 54,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 46.7,
            "curve": "spline"
          },
          {
            "t": 250,
            "v": 43.5,
            "curve": "spline"
          },
          {
            "t": 320,
            "v": 40.2,
            "curve": "ease"
          },
          {
            "t": 360,
            "v": 40.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.5,
            "curve": "ease"
          },
          {
            "t": 60,
            "v": 0.42,
            "curve": "spline"
          },
          {
            "t": 110,
            "v": 0.26,
            "curve": "spline"
          },
          {
            "t": 155,
            "v": -0.12,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 0.22,
            "curve": "spline"
          },
          {
            "t": 320,
            "v": 0.2,
            "curve": "ease"
          },
          {
            "t": 360,
            "v": 0.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 20,
            "v": 0.9231,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 150,
            "v": 0.8462,
            "curve": "spline"
          },
          {
            "t": 230,
            "v": 0.9615,
            "curve": "spline"
          },
          {
            "t": 310,
            "v": 0.8077,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 0.95,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 270,
            "v": 0.94,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.9,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 0.92,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 270,
            "v": 0.89,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.9,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "ground_arrive",
        "name": "Arrive",
        "start": 0,
        "end": 80,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "ground_wide_breath",
        "name": "Wide breath",
        "start": 80,
        "end": 135,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 50,
            "ratio": -1.2
          }
        }
      },
      {
        "id": "ground_descend",
        "name": "Descend",
        "start": 135,
        "end": 260,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "ground_low_wave",
        "name": "Low wave",
        "start": 260,
        "end": 320,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "ground_landing",
        "name": "Ground",
        "start": 320,
        "end": 360,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "vagal_reset": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-vagal-reset-v1",
    "name": "Vagal Reset",
    "description": "A fast regulation journey aimed at awake calm: orient, downshift, lengthen exhale, settle, and return alert.",
    "durationSec": 240,
    "view": {
      "frequencyWindow": {
        "minHz": 30,
        "maxHz": 72
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 240
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 240
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 54,
            "curve": "ease"
          },
          {
            "t": 12,
            "v": 52,
            "curve": "spline"
          },
          {
            "t": 30,
            "v": 49,
            "curve": "spline"
          },
          {
            "t": 55,
            "v": 45.5,
            "curve": "spline"
          },
          {
            "t": 82,
            "v": 48,
            "curve": "spline"
          },
          {
            "t": 110,
            "v": 44,
            "curve": "spline"
          },
          {
            "t": 138,
            "v": 47,
            "curve": "spline"
          },
          {
            "t": 168,
            "v": 43,
            "curve": "spline"
          },
          {
            "t": 198,
            "v": 42,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 44,
            "curve": "ease"
          },
          {
            "t": 240,
            "v": 44,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 54.45,
            "curve": "ease"
          },
          {
            "t": 30,
            "v": 49.35,
            "curve": "spline"
          },
          {
            "t": 56,
            "v": 45.7,
            "curve": "spline"
          },
          {
            "t": 84,
            "v": 47.6,
            "curve": "spline"
          },
          {
            "t": 112,
            "v": 44.28,
            "curve": "spline"
          },
          {
            "t": 140,
            "v": 46.78,
            "curve": "spline"
          },
          {
            "t": 168,
            "v": 43.2,
            "curve": "spline"
          },
          {
            "t": 198,
            "v": 42.18,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 44.2,
            "curve": "ease"
          },
          {
            "t": 240,
            "v": 44.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.45,
            "curve": "ease"
          },
          {
            "t": 20,
            "v": 0.5,
            "curve": "spline"
          },
          {
            "t": 42,
            "v": 0.35,
            "curve": "spline"
          },
          {
            "t": 65,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 88,
            "v": -0.16,
            "curve": "spline"
          },
          {
            "t": 112,
            "v": 0.28,
            "curve": "spline"
          },
          {
            "t": 138,
            "v": -0.22,
            "curve": "spline"
          },
          {
            "t": 166,
            "v": 0.2,
            "curve": "spline"
          },
          {
            "t": 196,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 0.2,
            "curve": "ease"
          },
          {
            "t": 240,
            "v": 0.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 8,
            "v": 0.7778,
            "curve": "ease"
          },
          {
            "t": 28,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 70,
            "v": 0.8519,
            "curve": "spline"
          },
          {
            "t": 116,
            "v": 0.963,
            "curve": "spline"
          },
          {
            "t": 165,
            "v": 0.8148,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 0.7778,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 48,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 92,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 138,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 184,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 48,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 92,
            "v": 0.86,
            "curve": "spline"
          },
          {
            "t": 138,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 184,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "vagal_orient",
        "name": "Orient",
        "start": 0,
        "end": 30,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "vagal_downshift",
        "name": "Downshift",
        "start": 30,
        "end": 78,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "vagal_exhale_gate",
        "name": "Exhale gate",
        "start": 78,
        "end": 138,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 46,
            "ratio": -1.2
          }
        }
      },
      {
        "id": "vagal_resonance",
        "name": "Resonance",
        "start": 138,
        "end": 198,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "vagal_awake_settle",
        "name": "Awake settle",
        "start": 198,
        "end": 225,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "vagal_return",
        "name": "Return",
        "start": 225,
        "end": 240,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "breath_sync": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-breath-sync-v1",
    "name": "Breath Sync",
    "description": "A 10 minute breath-following journey: each beat peak is placed on the inhale/exhale transition while breath length gradually expands from 3:6 to 8:16.",
    "durationSec": 600,
    "view": {
      "frequencyWindow": {
        "minHz": 30,
        "maxHz": 64
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 600
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 600
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 52,
            "curve": "spline"
          },
          {
            "t": 3,
            "v": 52.749,
            "curve": "spline"
          },
          {
            "t": 9,
            "v": 51.542,
            "curve": "spline"
          },
          {
            "t": 12,
            "v": 52.735,
            "curve": "spline"
          },
          {
            "t": 18.01,
            "v": 51.519,
            "curve": "spline"
          },
          {
            "t": 21.02,
            "v": 52.706,
            "curve": "spline"
          },
          {
            "t": 27.05,
            "v": 51.48,
            "curve": "spline"
          },
          {
            "t": 30.08,
            "v": 52.661,
            "curve": "spline"
          },
          {
            "t": 36.14,
            "v": 51.426,
            "curve": "spline"
          },
          {
            "t": 39.19,
            "v": 52.6,
            "curve": "spline"
          },
          {
            "t": 45.3,
            "v": 51.358,
            "curve": "spline"
          },
          {
            "t": 48.38,
            "v": 52.524,
            "curve": "spline"
          },
          {
            "t": 54.54,
            "v": 51.274,
            "curve": "spline"
          },
          {
            "t": 57.66,
            "v": 52.432,
            "curve": "spline"
          },
          {
            "t": 63.89,
            "v": 51.176,
            "curve": "spline"
          },
          {
            "t": 67.05,
            "v": 52.325,
            "curve": "spline"
          },
          {
            "t": 73.36,
            "v": 51.062,
            "curve": "spline"
          },
          {
            "t": 76.57,
            "v": 52.202,
            "curve": "spline"
          },
          {
            "t": 82.98,
            "v": 50.933,
            "curve": "spline"
          },
          {
            "t": 86.24,
            "v": 52.064,
            "curve": "spline"
          },
          {
            "t": 92.76,
            "v": 50.788,
            "curve": "spline"
          },
          {
            "t": 96.08,
            "v": 51.908,
            "curve": "spline"
          },
          {
            "t": 102.73,
            "v": 50.627,
            "curve": "spline"
          },
          {
            "t": 106.12,
            "v": 51.736,
            "curve": "spline"
          },
          {
            "t": 112.89,
            "v": 50.449,
            "curve": "spline"
          },
          {
            "t": 116.36,
            "v": 51.547,
            "curve": "spline"
          },
          {
            "t": 123.29,
            "v": 50.255,
            "curve": "spline"
          },
          {
            "t": 126.83,
            "v": 51.339,
            "curve": "spline"
          },
          {
            "t": 133.93,
            "v": 50.042,
            "curve": "spline"
          },
          {
            "t": 137.56,
            "v": 51.113,
            "curve": "spline"
          },
          {
            "t": 144.84,
            "v": 49.812,
            "curve": "spline"
          },
          {
            "t": 148.57,
            "v": 50.869,
            "curve": "spline"
          },
          {
            "t": 156.04,
            "v": 49.563,
            "curve": "spline"
          },
          {
            "t": 159.87,
            "v": 50.604,
            "curve": "spline"
          },
          {
            "t": 167.55,
            "v": 49.294,
            "curve": "spline"
          },
          {
            "t": 171.5,
            "v": 50.32,
            "curve": "spline"
          },
          {
            "t": 179.41,
            "v": 49.005,
            "curve": "spline"
          },
          {
            "t": 183.48,
            "v": 50.014,
            "curve": "spline"
          },
          {
            "t": 191.63,
            "v": 48.696,
            "curve": "spline"
          },
          {
            "t": 195.83,
            "v": 49.687,
            "curve": "spline"
          },
          {
            "t": 204.24,
            "v": 48.365,
            "curve": "spline"
          },
          {
            "t": 208.59,
            "v": 49.338,
            "curve": "spline"
          },
          {
            "t": 217.27,
            "v": 48.014,
            "curve": "spline"
          },
          {
            "t": 221.77,
            "v": 48.967,
            "curve": "spline"
          },
          {
            "t": 230.75,
            "v": 47.64,
            "curve": "spline"
          },
          {
            "t": 235.4,
            "v": 48.573,
            "curve": "spline"
          },
          {
            "t": 244.7,
            "v": 47.245,
            "curve": "spline"
          },
          {
            "t": 249.52,
            "v": 48.157,
            "curve": "spline"
          },
          {
            "t": 259.15,
            "v": 46.828,
            "curve": "spline"
          },
          {
            "t": 264.14,
            "v": 47.718,
            "curve": "spline"
          },
          {
            "t": 274.13,
            "v": 46.39,
            "curve": "spline"
          },
          {
            "t": 279.3,
            "v": 47.258,
            "curve": "spline"
          },
          {
            "t": 289.66,
            "v": 45.931,
            "curve": "spline"
          },
          {
            "t": 295.03,
            "v": 46.777,
            "curve": "spline"
          },
          {
            "t": 305.77,
            "v": 45.454,
            "curve": "spline"
          },
          {
            "t": 311.34,
            "v": 46.278,
            "curve": "spline"
          },
          {
            "t": 322.49,
            "v": 44.96,
            "curve": "spline"
          },
          {
            "t": 328.27,
            "v": 45.762,
            "curve": "spline"
          },
          {
            "t": 339.83,
            "v": 44.452,
            "curve": "spline"
          },
          {
            "t": 345.82,
            "v": 45.233,
            "curve": "spline"
          },
          {
            "t": 357.81,
            "v": 43.933,
            "curve": "spline"
          },
          {
            "t": 364.03,
            "v": 44.694,
            "curve": "spline"
          },
          {
            "t": 376.45,
            "v": 43.409,
            "curve": "spline"
          },
          {
            "t": 382.89,
            "v": 44.151,
            "curve": "spline"
          },
          {
            "t": 395.76,
            "v": 42.884,
            "curve": "spline"
          },
          {
            "t": 402.42,
            "v": 43.61,
            "curve": "spline"
          },
          {
            "t": 415.73,
            "v": 42.367,
            "curve": "spline"
          },
          {
            "t": 422.6,
            "v": 43.079,
            "curve": "spline"
          },
          {
            "t": 436.35,
            "v": 41.864,
            "curve": "spline"
          },
          {
            "t": 443.44,
            "v": 42.567,
            "curve": "spline"
          },
          {
            "t": 457.61,
            "v": 41.385,
            "curve": "spline"
          },
          {
            "t": 464.9,
            "v": 42.083,
            "curve": "spline"
          },
          {
            "t": 479.48,
            "v": 40.942,
            "curve": "spline"
          },
          {
            "t": 486.96,
            "v": 41.641,
            "curve": "spline"
          },
          {
            "t": 501.91,
            "v": 40.547,
            "curve": "spline"
          },
          {
            "t": 509.55,
            "v": 41.251,
            "curve": "spline"
          },
          {
            "t": 524.84,
            "v": 40.211,
            "curve": "spline"
          },
          {
            "t": 532.62,
            "v": 40.929,
            "curve": "spline"
          },
          {
            "t": 548.19,
            "v": 39.95,
            "curve": "spline"
          },
          {
            "t": 556.08,
            "v": 40.687,
            "curve": "spline"
          },
          {
            "t": 571.87,
            "v": 39.776,
            "curve": "spline"
          },
          {
            "t": 579.84,
            "v": 40.541,
            "curve": "spline"
          },
          {
            "t": 595.78,
            "v": 39.702,
            "curve": "spline"
          },
          {
            "t": 600,
            "v": 39.7,
            "curve": "spline"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 52.333,
            "curve": "spline"
          },
          {
            "t": 3,
            "v": 53.082,
            "curve": "spline"
          },
          {
            "t": 9,
            "v": 51.709,
            "curve": "spline"
          },
          {
            "t": 12,
            "v": 53.068,
            "curve": "spline"
          },
          {
            "t": 18.01,
            "v": 51.685,
            "curve": "spline"
          },
          {
            "t": 21.02,
            "v": 53.038,
            "curve": "spline"
          },
          {
            "t": 27.05,
            "v": 51.646,
            "curve": "spline"
          },
          {
            "t": 30.08,
            "v": 52.991,
            "curve": "spline"
          },
          {
            "t": 36.14,
            "v": 51.591,
            "curve": "spline"
          },
          {
            "t": 39.19,
            "v": 52.928,
            "curve": "spline"
          },
          {
            "t": 45.3,
            "v": 51.521,
            "curve": "spline"
          },
          {
            "t": 48.38,
            "v": 52.848,
            "curve": "spline"
          },
          {
            "t": 54.54,
            "v": 51.436,
            "curve": "spline"
          },
          {
            "t": 57.66,
            "v": 52.753,
            "curve": "spline"
          },
          {
            "t": 63.89,
            "v": 51.336,
            "curve": "spline"
          },
          {
            "t": 67.05,
            "v": 52.642,
            "curve": "spline"
          },
          {
            "t": 73.36,
            "v": 51.22,
            "curve": "spline"
          },
          {
            "t": 76.57,
            "v": 52.514,
            "curve": "spline"
          },
          {
            "t": 82.98,
            "v": 51.089,
            "curve": "spline"
          },
          {
            "t": 86.24,
            "v": 52.37,
            "curve": "spline"
          },
          {
            "t": 92.76,
            "v": 50.941,
            "curve": "spline"
          },
          {
            "t": 96.08,
            "v": 52.209,
            "curve": "spline"
          },
          {
            "t": 102.73,
            "v": 50.777,
            "curve": "spline"
          },
          {
            "t": 106.12,
            "v": 52.031,
            "curve": "spline"
          },
          {
            "t": 112.89,
            "v": 50.597,
            "curve": "spline"
          },
          {
            "t": 116.36,
            "v": 51.835,
            "curve": "spline"
          },
          {
            "t": 123.29,
            "v": 50.399,
            "curve": "spline"
          },
          {
            "t": 126.83,
            "v": 51.621,
            "curve": "spline"
          },
          {
            "t": 133.93,
            "v": 50.183,
            "curve": "spline"
          },
          {
            "t": 137.56,
            "v": 51.388,
            "curve": "spline"
          },
          {
            "t": 144.84,
            "v": 49.949,
            "curve": "spline"
          },
          {
            "t": 148.57,
            "v": 51.137,
            "curve": "spline"
          },
          {
            "t": 156.04,
            "v": 49.696,
            "curve": "spline"
          },
          {
            "t": 159.87,
            "v": 50.865,
            "curve": "spline"
          },
          {
            "t": 167.55,
            "v": 49.424,
            "curve": "spline"
          },
          {
            "t": 171.5,
            "v": 50.573,
            "curve": "spline"
          },
          {
            "t": 179.41,
            "v": 49.132,
            "curve": "spline"
          },
          {
            "t": 183.48,
            "v": 50.259,
            "curve": "spline"
          },
          {
            "t": 191.63,
            "v": 48.819,
            "curve": "spline"
          },
          {
            "t": 195.83,
            "v": 49.925,
            "curve": "spline"
          },
          {
            "t": 204.24,
            "v": 48.484,
            "curve": "spline"
          },
          {
            "t": 208.59,
            "v": 49.568,
            "curve": "spline"
          },
          {
            "t": 217.27,
            "v": 48.129,
            "curve": "spline"
          },
          {
            "t": 221.77,
            "v": 49.189,
            "curve": "spline"
          },
          {
            "t": 230.75,
            "v": 47.751,
            "curve": "spline"
          },
          {
            "t": 235.4,
            "v": 48.788,
            "curve": "spline"
          },
          {
            "t": 244.7,
            "v": 47.352,
            "curve": "spline"
          },
          {
            "t": 249.52,
            "v": 48.364,
            "curve": "spline"
          },
          {
            "t": 259.15,
            "v": 46.932,
            "curve": "spline"
          },
          {
            "t": 264.14,
            "v": 47.918,
            "curve": "spline"
          },
          {
            "t": 274.13,
            "v": 46.49,
            "curve": "spline"
          },
          {
            "t": 279.3,
            "v": 47.451,
            "curve": "spline"
          },
          {
            "t": 289.66,
            "v": 46.028,
            "curve": "spline"
          },
          {
            "t": 295.03,
            "v": 46.963,
            "curve": "spline"
          },
          {
            "t": 305.77,
            "v": 45.547,
            "curve": "spline"
          },
          {
            "t": 311.34,
            "v": 46.457,
            "curve": "spline"
          },
          {
            "t": 322.49,
            "v": 45.05,
            "curve": "spline"
          },
          {
            "t": 328.27,
            "v": 45.935,
            "curve": "spline"
          },
          {
            "t": 339.83,
            "v": 44.539,
            "curve": "spline"
          },
          {
            "t": 345.82,
            "v": 45.399,
            "curve": "spline"
          },
          {
            "t": 357.81,
            "v": 44.017,
            "curve": "spline"
          },
          {
            "t": 364.03,
            "v": 44.855,
            "curve": "spline"
          },
          {
            "t": 376.45,
            "v": 43.49,
            "curve": "spline"
          },
          {
            "t": 382.89,
            "v": 44.307,
            "curve": "spline"
          },
          {
            "t": 395.76,
            "v": 42.962,
            "curve": "spline"
          },
          {
            "t": 402.42,
            "v": 43.761,
            "curve": "spline"
          },
          {
            "t": 415.73,
            "v": 42.442,
            "curve": "spline"
          },
          {
            "t": 422.6,
            "v": 43.225,
            "curve": "spline"
          },
          {
            "t": 436.35,
            "v": 41.936,
            "curve": "spline"
          },
          {
            "t": 443.44,
            "v": 42.708,
            "curve": "spline"
          },
          {
            "t": 457.61,
            "v": 41.456,
            "curve": "spline"
          },
          {
            "t": 464.9,
            "v": 42.221,
            "curve": "spline"
          },
          {
            "t": 479.48,
            "v": 41.011,
            "curve": "spline"
          },
          {
            "t": 486.96,
            "v": 41.774,
            "curve": "spline"
          },
          {
            "t": 501.91,
            "v": 40.613,
            "curve": "spline"
          },
          {
            "t": 509.55,
            "v": 41.382,
            "curve": "spline"
          },
          {
            "t": 524.84,
            "v": 40.277,
            "curve": "spline"
          },
          {
            "t": 532.62,
            "v": 41.057,
            "curve": "spline"
          },
          {
            "t": 548.19,
            "v": 40.014,
            "curve": "spline"
          },
          {
            "t": 556.08,
            "v": 40.814,
            "curve": "spline"
          },
          {
            "t": 571.87,
            "v": 39.839,
            "curve": "spline"
          },
          {
            "t": 579.84,
            "v": 40.666,
            "curve": "spline"
          },
          {
            "t": 595.78,
            "v": 39.765,
            "curve": "spline"
          },
          {
            "t": 600,
            "v": 39.763,
            "curve": "spline"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.333,
            "curve": "hold"
          },
          {
            "t": 3,
            "v": 0.167,
            "curve": "hold"
          },
          {
            "t": 9,
            "v": 0.333,
            "curve": "hold"
          },
          {
            "t": 12,
            "v": 0.166,
            "curve": "hold"
          },
          {
            "t": 18.01,
            "v": 0.332,
            "curve": "hold"
          },
          {
            "t": 21.02,
            "v": 0.166,
            "curve": "hold"
          },
          {
            "t": 27.05,
            "v": 0.33,
            "curve": "hold"
          },
          {
            "t": 30.08,
            "v": 0.165,
            "curve": "hold"
          },
          {
            "t": 36.14,
            "v": 0.328,
            "curve": "hold"
          },
          {
            "t": 39.19,
            "v": 0.164,
            "curve": "hold"
          },
          {
            "t": 45.3,
            "v": 0.325,
            "curve": "hold"
          },
          {
            "t": 48.38,
            "v": 0.162,
            "curve": "hold"
          },
          {
            "t": 54.54,
            "v": 0.321,
            "curve": "hold"
          },
          {
            "t": 57.66,
            "v": 0.16,
            "curve": "hold"
          },
          {
            "t": 63.89,
            "v": 0.317,
            "curve": "hold"
          },
          {
            "t": 67.05,
            "v": 0.158,
            "curve": "hold"
          },
          {
            "t": 73.36,
            "v": 0.312,
            "curve": "hold"
          },
          {
            "t": 76.57,
            "v": 0.156,
            "curve": "hold"
          },
          {
            "t": 82.98,
            "v": 0.307,
            "curve": "hold"
          },
          {
            "t": 86.24,
            "v": 0.153,
            "curve": "hold"
          },
          {
            "t": 92.76,
            "v": 0.301,
            "curve": "hold"
          },
          {
            "t": 96.08,
            "v": 0.151,
            "curve": "hold"
          },
          {
            "t": 102.73,
            "v": 0.295,
            "curve": "hold"
          },
          {
            "t": 106.12,
            "v": 0.148,
            "curve": "hold"
          },
          {
            "t": 112.89,
            "v": 0.289,
            "curve": "hold"
          },
          {
            "t": 116.36,
            "v": 0.144,
            "curve": "hold"
          },
          {
            "t": 123.29,
            "v": 0.282,
            "curve": "hold"
          },
          {
            "t": 126.83,
            "v": 0.141,
            "curve": "hold"
          },
          {
            "t": 133.93,
            "v": 0.275,
            "curve": "hold"
          },
          {
            "t": 137.56,
            "v": 0.138,
            "curve": "hold"
          },
          {
            "t": 144.84,
            "v": 0.268,
            "curve": "hold"
          },
          {
            "t": 148.57,
            "v": 0.134,
            "curve": "hold"
          },
          {
            "t": 156.04,
            "v": 0.261,
            "curve": "hold"
          },
          {
            "t": 159.87,
            "v": 0.13,
            "curve": "hold"
          },
          {
            "t": 167.55,
            "v": 0.253,
            "curve": "hold"
          },
          {
            "t": 171.5,
            "v": 0.127,
            "curve": "hold"
          },
          {
            "t": 179.41,
            "v": 0.245,
            "curve": "hold"
          },
          {
            "t": 183.48,
            "v": 0.123,
            "curve": "hold"
          },
          {
            "t": 191.63,
            "v": 0.238,
            "curve": "hold"
          },
          {
            "t": 195.83,
            "v": 0.119,
            "curve": "hold"
          },
          {
            "t": 204.24,
            "v": 0.23,
            "curve": "hold"
          },
          {
            "t": 208.59,
            "v": 0.115,
            "curve": "hold"
          },
          {
            "t": 217.27,
            "v": 0.223,
            "curve": "hold"
          },
          {
            "t": 221.77,
            "v": 0.111,
            "curve": "hold"
          },
          {
            "t": 230.75,
            "v": 0.215,
            "curve": "hold"
          },
          {
            "t": 235.4,
            "v": 0.108,
            "curve": "hold"
          },
          {
            "t": 244.7,
            "v": 0.208,
            "curve": "hold"
          },
          {
            "t": 249.52,
            "v": 0.104,
            "curve": "hold"
          },
          {
            "t": 259.15,
            "v": 0.2,
            "curve": "hold"
          },
          {
            "t": 264.14,
            "v": 0.1,
            "curve": "hold"
          },
          {
            "t": 274.13,
            "v": 0.193,
            "curve": "hold"
          },
          {
            "t": 279.3,
            "v": 0.097,
            "curve": "hold"
          },
          {
            "t": 289.66,
            "v": 0.186,
            "curve": "hold"
          },
          {
            "t": 295.03,
            "v": 0.093,
            "curve": "hold"
          },
          {
            "t": 305.77,
            "v": 0.179,
            "curve": "hold"
          },
          {
            "t": 311.34,
            "v": 0.09,
            "curve": "hold"
          },
          {
            "t": 322.49,
            "v": 0.173,
            "curve": "hold"
          },
          {
            "t": 328.27,
            "v": 0.086,
            "curve": "hold"
          },
          {
            "t": 339.83,
            "v": 0.167,
            "curve": "hold"
          },
          {
            "t": 345.82,
            "v": 0.083,
            "curve": "hold"
          },
          {
            "t": 357.81,
            "v": 0.161,
            "curve": "hold"
          },
          {
            "t": 364.03,
            "v": 0.08,
            "curve": "hold"
          },
          {
            "t": 376.45,
            "v": 0.155,
            "curve": "hold"
          },
          {
            "t": 382.89,
            "v": 0.078,
            "curve": "hold"
          },
          {
            "t": 395.76,
            "v": 0.15,
            "curve": "hold"
          },
          {
            "t": 402.42,
            "v": 0.075,
            "curve": "hold"
          },
          {
            "t": 415.73,
            "v": 0.145,
            "curve": "hold"
          },
          {
            "t": 422.6,
            "v": 0.073,
            "curve": "hold"
          },
          {
            "t": 436.35,
            "v": 0.141,
            "curve": "hold"
          },
          {
            "t": 443.44,
            "v": 0.071,
            "curve": "hold"
          },
          {
            "t": 457.61,
            "v": 0.137,
            "curve": "hold"
          },
          {
            "t": 464.9,
            "v": 0.069,
            "curve": "hold"
          },
          {
            "t": 479.48,
            "v": 0.134,
            "curve": "hold"
          },
          {
            "t": 486.96,
            "v": 0.067,
            "curve": "hold"
          },
          {
            "t": 501.91,
            "v": 0.131,
            "curve": "hold"
          },
          {
            "t": 509.55,
            "v": 0.065,
            "curve": "hold"
          },
          {
            "t": 524.84,
            "v": 0.128,
            "curve": "hold"
          },
          {
            "t": 532.62,
            "v": 0.064,
            "curve": "hold"
          },
          {
            "t": 548.19,
            "v": 0.127,
            "curve": "hold"
          },
          {
            "t": 556.08,
            "v": 0.063,
            "curve": "hold"
          },
          {
            "t": 571.87,
            "v": 0.126,
            "curve": "hold"
          },
          {
            "t": 579.84,
            "v": 0.063,
            "curve": "hold"
          },
          {
            "t": 595.78,
            "v": 0.125,
            "curve": "hold"
          },
          {
            "t": 600,
            "v": 0.063,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 18,
            "v": 0.8846,
            "curve": "ease"
          },
          {
            "t": 150,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.8846,
            "curve": "spline"
          },
          {
            "t": 560,
            "v": 0.7308,
            "curve": "ease"
          },
          {
            "t": 600,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 3,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 9,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 12,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 18.01,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 21.02,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 27.05,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 30.08,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 36.14,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 39.19,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 45.3,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 48.38,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 54.54,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 57.66,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 63.89,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 67.05,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 73.36,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 76.57,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 82.98,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 86.24,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 92.76,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 96.08,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 102.73,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 106.12,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 112.89,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 116.36,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 123.29,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 126.83,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 133.93,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 137.56,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 144.84,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 148.57,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 156.04,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 159.87,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 167.55,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 171.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 179.41,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 183.48,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 191.63,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 195.83,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 204.24,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 208.59,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 217.27,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 221.77,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 230.75,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 235.4,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 244.7,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 249.52,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 259.15,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 264.14,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 274.13,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 279.3,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 289.66,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 295.03,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 305.77,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 311.34,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 322.49,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 328.27,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 339.83,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 345.82,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 357.81,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 364.03,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 376.45,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 382.89,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 395.76,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 402.42,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 415.73,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 422.6,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 436.35,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 443.44,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 457.61,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 464.9,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 479.48,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 486.96,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 501.91,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 509.55,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 524.84,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 532.62,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 548.19,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 556.08,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 571.87,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 579.84,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 595.78,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 600,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 3,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 9,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 12,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 18.01,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 21.02,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 27.05,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 30.08,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 36.14,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 39.19,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 45.3,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 48.38,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 54.54,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 57.66,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 63.89,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 67.05,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 73.36,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 76.57,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 82.98,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 86.24,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 92.76,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 96.08,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 102.73,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 106.12,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 112.89,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 116.36,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 123.29,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 126.83,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 133.93,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 137.56,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 144.84,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 148.57,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 156.04,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 159.87,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 167.55,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 171.5,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 179.41,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 183.48,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 191.63,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 195.83,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 204.24,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 208.59,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 217.27,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 221.77,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 230.75,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 235.4,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 244.7,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 249.52,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 259.15,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 264.14,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 274.13,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 279.3,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 289.66,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 295.03,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 305.77,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 311.34,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 322.49,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 328.27,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 339.83,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 345.82,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 357.81,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 364.03,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 376.45,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 382.89,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 395.76,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 402.42,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 415.73,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 422.6,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 436.35,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 443.44,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 457.61,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 464.9,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 479.48,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 486.96,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 501.91,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 509.55,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 524.84,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 532.62,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 548.19,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 556.08,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 571.87,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 579.84,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 595.78,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 600,
            "v": 1,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "breath_orient",
        "name": "Orient",
        "start": 0,
        "end": 90,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "breath_lengthen",
        "name": "Lengthen",
        "start": 90,
        "end": 240,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "breath_deepen",
        "name": "Deepen",
        "start": 240,
        "end": 420,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "breath_long_exhale",
        "name": "Long Exhale",
        "start": 420,
        "end": 570,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "breath_land",
        "name": "Land",
        "start": 570,
        "end": 600,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "breathGuide": {
      "inhaleStartSec": 3,
      "exhaleStartSec": 6,
      "inhaleEndSec": 8,
      "exhaleEndSec": 16,
      "bindiff": "Phase-aligned breath beat: inhale diff is 1 / inhale seconds, exhale diff is 1 / exhale seconds."
    },
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "breath_wave_test": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-breath-wave-test-v1",
    "name": "Breath Wave Test",
    "description": "A 1 minute breath-wave test with L held stable at 39 Hz: each 3 second rise is inhale, each 6 second fall is exhale, and one full bindiff wave equals one full breath cycle.",
    "durationSec": 60,
    "view": {
      "frequencyWindow": {
        "minHz": 36,
        "maxHz": 41
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 60
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 60
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 1.5,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 3,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 6,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 9,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 10.5,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 12,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 15,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 18,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 19.5,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 21,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 24,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 27,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 28.5,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 30,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 33,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 36,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 37.5,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 39,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 42,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 45,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 46.5,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 48,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 51,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 54,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 55.5,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 57,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 60,
            "v": 39,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 39.1,
            "curve": "spline"
          },
          {
            "t": 1.5,
            "v": 39.246,
            "curve": "spline"
          },
          {
            "t": 3,
            "v": 39.339,
            "curve": "spline"
          },
          {
            "t": 6,
            "v": 39.196,
            "curve": "spline"
          },
          {
            "t": 9,
            "v": 39.096,
            "curve": "spline"
          },
          {
            "t": 10.5,
            "v": 39.241,
            "curve": "spline"
          },
          {
            "t": 12,
            "v": 39.333,
            "curve": "spline"
          },
          {
            "t": 15,
            "v": 39.187,
            "curve": "spline"
          },
          {
            "t": 18,
            "v": 39.085,
            "curve": "spline"
          },
          {
            "t": 19.5,
            "v": 39.229,
            "curve": "spline"
          },
          {
            "t": 21,
            "v": 39.32,
            "curve": "spline"
          },
          {
            "t": 24,
            "v": 39.174,
            "curve": "spline"
          },
          {
            "t": 27,
            "v": 39.07,
            "curve": "spline"
          },
          {
            "t": 28.5,
            "v": 39.214,
            "curve": "spline"
          },
          {
            "t": 30,
            "v": 39.305,
            "curve": "spline"
          },
          {
            "t": 33,
            "v": 39.158,
            "curve": "spline"
          },
          {
            "t": 36,
            "v": 39.055,
            "curve": "spline"
          },
          {
            "t": 37.5,
            "v": 39.199,
            "curve": "spline"
          },
          {
            "t": 39,
            "v": 39.29,
            "curve": "spline"
          },
          {
            "t": 42,
            "v": 39.144,
            "curve": "spline"
          },
          {
            "t": 45,
            "v": 39.041,
            "curve": "spline"
          },
          {
            "t": 46.5,
            "v": 39.185,
            "curve": "spline"
          },
          {
            "t": 48,
            "v": 39.277,
            "curve": "spline"
          },
          {
            "t": 51,
            "v": 39.133,
            "curve": "spline"
          },
          {
            "t": 54,
            "v": 39.032,
            "curve": "spline"
          },
          {
            "t": 55.5,
            "v": 39.178,
            "curve": "spline"
          },
          {
            "t": 57,
            "v": 39.271,
            "curve": "spline"
          },
          {
            "t": 60,
            "v": 39.03,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.1,
            "curve": "spline"
          },
          {
            "t": 1.5,
            "v": 0.2463,
            "curve": "spline"
          },
          {
            "t": 3,
            "v": 0.3395,
            "curve": "spline"
          },
          {
            "t": 6,
            "v": 0.1964,
            "curve": "spline"
          },
          {
            "t": 9,
            "v": 0.0957,
            "curve": "spline"
          },
          {
            "t": 10.5,
            "v": 0.2407,
            "curve": "spline"
          },
          {
            "t": 12,
            "v": 0.3327,
            "curve": "spline"
          },
          {
            "t": 15,
            "v": 0.1875,
            "curve": "spline"
          },
          {
            "t": 18,
            "v": 0.0849,
            "curve": "spline"
          },
          {
            "t": 19.5,
            "v": 0.229,
            "curve": "spline"
          },
          {
            "t": 21,
            "v": 0.3203,
            "curve": "spline"
          },
          {
            "t": 24,
            "v": 0.1738,
            "curve": "spline"
          },
          {
            "t": 27,
            "v": 0.0702,
            "curve": "spline"
          },
          {
            "t": 28.5,
            "v": 0.214,
            "curve": "spline"
          },
          {
            "t": 30,
            "v": 0.305,
            "curve": "spline"
          },
          {
            "t": 33,
            "v": 0.1582,
            "curve": "spline"
          },
          {
            "t": 36,
            "v": 0.0546,
            "curve": "spline"
          },
          {
            "t": 37.5,
            "v": 0.1985,
            "curve": "spline"
          },
          {
            "t": 39,
            "v": 0.2897,
            "curve": "spline"
          },
          {
            "t": 42,
            "v": 0.1435,
            "curve": "spline"
          },
          {
            "t": 45,
            "v": 0.0409,
            "curve": "spline"
          },
          {
            "t": 46.5,
            "v": 0.1854,
            "curve": "spline"
          },
          {
            "t": 48,
            "v": 0.2773,
            "curve": "spline"
          },
          {
            "t": 51,
            "v": 0.1327,
            "curve": "spline"
          },
          {
            "t": 54,
            "v": 0.032,
            "curve": "spline"
          },
          {
            "t": 55.5,
            "v": 0.1775,
            "curve": "spline"
          },
          {
            "t": 57,
            "v": 0.2705,
            "curve": "spline"
          },
          {
            "t": 60,
            "v": 0.03,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 8,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 54,
            "v": 1,
            "curve": "hold"
          },
          {
            "t": 60,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 1.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 3,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 6,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 9,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 10.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 12,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 15,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 18,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 19.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 21,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 24,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 27,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 28.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 30,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 33,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 36,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 37.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 39,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 42,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 45,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 46.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 48,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 51,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 54,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 55.5,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 57,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 60,
            "v": 0.88,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 1.5,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 3,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 6,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 9,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 10.5,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 12,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 15,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 18,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 19.5,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 21,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 24,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 27,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 28.5,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 30,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 33,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 36,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 37.5,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 39,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 42,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 45,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 46.5,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 48,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 51,
            "v": 1,
            "curve": "ease"
          },
          {
            "t": 54,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 55.5,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 57,
            "v": 0.94,
            "curve": "ease"
          },
          {
            "t": 60,
            "v": 1,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "breath_wave_arrive",
        "name": "Arrive",
        "start": 0,
        "end": 9,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "breath_wave_follow",
        "name": "Follow",
        "start": 9,
        "end": 45,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "breath_wave_land",
        "name": "Land",
        "start": 45,
        "end": 60,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "breathGuide": {
      "inhaleSec": 3,
      "exhaleSec": 6,
      "cycleSec": 9,
      "model": "One continuous wave per breath cycle. Rising wave is inhale; falling wave is exhale."
    }
  },
  "cycle_ease": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-cycle-ease-v1",
    "name": "Cycle Ease",
    "description": "A gentle settling journey for cycle-related discomfort support: warm waves, narrow offset, and soft landing.",
    "durationSec": 360,
    "view": {
      "frequencyWindow": {
        "minHz": 28,
        "maxHz": 70
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 360
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 360
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 50,
            "curve": "ease"
          },
          {
            "t": 35,
            "v": 47,
            "curve": "spline"
          },
          {
            "t": 70,
            "v": 44,
            "curve": "spline"
          },
          {
            "t": 110,
            "v": 46,
            "curve": "spline"
          },
          {
            "t": 155,
            "v": 41.5,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 45,
            "curve": "spline"
          },
          {
            "t": 255,
            "v": 40.5,
            "curve": "spline"
          },
          {
            "t": 315,
            "v": 42,
            "curve": "ease"
          },
          {
            "t": 360,
            "v": 42,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 50.35,
            "curve": "ease"
          },
          {
            "t": 70,
            "v": 44.25,
            "curve": "spline"
          },
          {
            "t": 112,
            "v": 45.65,
            "curve": "spline"
          },
          {
            "t": 155,
            "v": 41.7,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 44.78,
            "curve": "spline"
          },
          {
            "t": 255,
            "v": 40.68,
            "curve": "spline"
          },
          {
            "t": 315,
            "v": 42.18,
            "curve": "ease"
          },
          {
            "t": 360,
            "v": 42.18,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.35,
            "curve": "ease"
          },
          {
            "t": 45,
            "v": 0.28,
            "curve": "spline"
          },
          {
            "t": 85,
            "v": 0.16,
            "curve": "spline"
          },
          {
            "t": 130,
            "v": -0.08,
            "curve": "spline"
          },
          {
            "t": 175,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": -0.06,
            "curve": "spline"
          },
          {
            "t": 285,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.18,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 18,
            "v": 0.8936,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 150,
            "v": 0.8085,
            "curve": "spline"
          },
          {
            "t": 220,
            "v": 0.9574,
            "curve": "spline"
          },
          {
            "t": 315,
            "v": 0.7234,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 100,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.9,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 100,
            "v": 0.86,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 0.98,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.9,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "cycle_warm",
        "name": "Warm",
        "start": 0,
        "end": 80,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "cycle_release",
        "name": "Release",
        "start": 80,
        "end": 150,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 44,
            "ratio": -0.85
          }
        }
      },
      {
        "id": "cycle_wave",
        "name": "Wave",
        "start": 150,
        "end": 255,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "cycle_soften",
        "name": "Soften",
        "start": 255,
        "end": 320,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "cycle_rest",
        "name": "Rest",
        "start": 320,
        "end": 360,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "clear_mind": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-clear-mind-v1",
    "name": "Clear Mind",
    "description": "A steady coherence journey for mental quieting: narrow crossings, regular waves, and awake clarity.",
    "durationSec": 300,
    "view": {
      "frequencyWindow": {
        "minHz": 34,
        "maxHz": 76
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 300
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 300
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 56,
            "curve": "ease"
          },
          {
            "t": 28,
            "v": 52,
            "curve": "spline"
          },
          {
            "t": 60,
            "v": 49,
            "curve": "spline"
          },
          {
            "t": 96,
            "v": 51,
            "curve": "spline"
          },
          {
            "t": 132,
            "v": 46,
            "curve": "spline"
          },
          {
            "t": 170,
            "v": 48,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 44.5,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 46,
            "curve": "ease"
          },
          {
            "t": 300,
            "v": 46,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 56.55,
            "curve": "ease"
          },
          {
            "t": 60,
            "v": 49.42,
            "curve": "spline"
          },
          {
            "t": 96,
            "v": 50.72,
            "curve": "spline"
          },
          {
            "t": 132,
            "v": 46.28,
            "curve": "spline"
          },
          {
            "t": 170,
            "v": 47.82,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 44.72,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 46.2,
            "curve": "ease"
          },
          {
            "t": 300,
            "v": 46.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.55,
            "curve": "ease"
          },
          {
            "t": 40,
            "v": 0.42,
            "curve": "spline"
          },
          {
            "t": 80,
            "v": 0.24,
            "curve": "spline"
          },
          {
            "t": 120,
            "v": -0.18,
            "curve": "spline"
          },
          {
            "t": 160,
            "v": 0.28,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": -0.12,
            "curve": "spline"
          },
          {
            "t": 250,
            "v": 0.2,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 10,
            "v": 0.8846,
            "curve": "ease"
          },
          {
            "t": 70,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 145,
            "v": 0.8462,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 0.9231,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 75,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 150,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 0.98,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 75,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 150,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 225,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "mind_catch",
        "name": "Catch",
        "start": 0,
        "end": 55,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "mind_cohere",
        "name": "Coherence",
        "start": 55,
        "end": 145,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "mind_decenter",
        "name": "Decenter",
        "start": 145,
        "end": 205,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 47,
            "ratio": -0.6
          }
        }
      },
      {
        "id": "mind_clear",
        "name": "Clear",
        "start": 205,
        "end": 270,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "mind_awake",
        "name": "Awake",
        "start": 270,
        "end": 300,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "sleep_ready": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-sleep-ready-v1",
    "name": "Sleep Ready",
    "description": "A slow sleep-preparation journey: descending main frequency, narrowing offset, and long fade into quiet.",
    "durationSec": 480,
    "view": {
      "frequencyWindow": {
        "minHz": 20,
        "maxHz": 65
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 480
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 480
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 52,
            "curve": "ease"
          },
          {
            "t": 55,
            "v": 49,
            "curve": "spline"
          },
          {
            "t": 115,
            "v": 46,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 43,
            "curve": "spline"
          },
          {
            "t": 245,
            "v": 41,
            "curve": "spline"
          },
          {
            "t": 315,
            "v": 39.5,
            "curve": "spline"
          },
          {
            "t": 390,
            "v": 38.5,
            "curve": "ease"
          },
          {
            "t": 480,
            "v": 38.5,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 52.4,
            "curve": "ease"
          },
          {
            "t": 115,
            "v": 46.25,
            "curve": "spline"
          },
          {
            "t": 180,
            "v": 42.86,
            "curve": "spline"
          },
          {
            "t": 245,
            "v": 41.18,
            "curve": "spline"
          },
          {
            "t": 315,
            "v": 39.62,
            "curve": "spline"
          },
          {
            "t": 390,
            "v": 38.62,
            "curve": "ease"
          },
          {
            "t": 480,
            "v": 38.62,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.4,
            "curve": "ease"
          },
          {
            "t": 70,
            "v": 0.28,
            "curve": "spline"
          },
          {
            "t": 140,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 220,
            "v": -0.1,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.14,
            "curve": "spline"
          },
          {
            "t": 390,
            "v": 0.12,
            "curve": "ease"
          },
          {
            "t": 480,
            "v": 0.12,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 25,
            "v": 0.95,
            "curve": "ease"
          },
          {
            "t": 140,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 0.85,
            "curve": "spline"
          },
          {
            "t": 385,
            "v": 0.7,
            "curve": "spline"
          },
          {
            "t": 480,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 160,
            "v": 0.94,
            "curve": "spline"
          },
          {
            "t": 320,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 480,
            "v": 0.86,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.88,
            "curve": "ease"
          },
          {
            "t": 160,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 320,
            "v": 0.94,
            "curve": "spline"
          },
          {
            "t": 480,
            "v": 0.86,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "sleep_arrive",
        "name": "Arrive",
        "start": 0,
        "end": 90,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "sleep_exhale",
        "name": "Exhale",
        "start": 90,
        "end": 170,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 45,
            "ratio": -0.5
          }
        }
      },
      {
        "id": "sleep_drift",
        "name": "Drift",
        "start": 170,
        "end": 360,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "sleep_low",
        "name": "Low",
        "start": 360,
        "end": 430,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "sleep_ready",
        "name": "Ready",
        "start": 430,
        "end": 480,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "recover": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-recover-v1",
    "name": "Recover",
    "description": "A post-training recovery journey: gradual parasympathetic downshift, broad-to-narrow waves, and steady landing.",
    "durationSec": 420,
    "view": {
      "frequencyWindow": {
        "minHz": 28,
        "maxHz": 82
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 420
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 420
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 60,
            "curve": "ease"
          },
          {
            "t": 45,
            "v": 56,
            "curve": "spline"
          },
          {
            "t": 90,
            "v": 52,
            "curve": "spline"
          },
          {
            "t": 145,
            "v": 55,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 49,
            "curve": "spline"
          },
          {
            "t": 270,
            "v": 46,
            "curve": "spline"
          },
          {
            "t": 335,
            "v": 44,
            "curve": "ease"
          },
          {
            "t": 420,
            "v": 44,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 60.5,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 52.38,
            "curve": "spline"
          },
          {
            "t": 145,
            "v": 54.72,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 49.25,
            "curve": "spline"
          },
          {
            "t": 270,
            "v": 46.18,
            "curve": "spline"
          },
          {
            "t": 335,
            "v": 44.2,
            "curve": "ease"
          },
          {
            "t": 420,
            "v": 44.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.5,
            "curve": "ease"
          },
          {
            "t": 55,
            "v": 0.62,
            "curve": "spline"
          },
          {
            "t": 115,
            "v": 0.34,
            "curve": "spline"
          },
          {
            "t": 175,
            "v": -0.18,
            "curve": "spline"
          },
          {
            "t": 235,
            "v": 0.25,
            "curve": "spline"
          },
          {
            "t": 300,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 420,
            "v": 0.2,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 12,
            "v": 0.8667,
            "curve": "ease"
          },
          {
            "t": 80,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 160,
            "v": 0.8333,
            "curve": "spline"
          },
          {
            "t": 255,
            "v": 0.8,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.6667,
            "curve": "spline"
          },
          {
            "t": 420,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.95,
            "curve": "ease"
          },
          {
            "t": 100,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 315,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 420,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.9,
            "curve": "ease"
          },
          {
            "t": 100,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 210,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 315,
            "v": 0.9,
            "curve": "spline"
          },
          {
            "t": 420,
            "v": 0.92,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "recover_cooldown",
        "name": "Cooldown",
        "start": 0,
        "end": 85,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "recover_flush",
        "name": "Flush",
        "start": 85,
        "end": 170,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "recover_reset",
        "name": "Reset",
        "start": 170,
        "end": 235,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 50,
            "ratio": -0.9
          }
        }
      },
      {
        "id": "recover_restore",
        "name": "Restore",
        "start": 235,
        "end": 360,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "recover_ready",
        "name": "Ready",
        "start": 360,
        "end": 420,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  },
  "repair": {
    "format": "tuner-journey",
    "version": 1,
    "id": "tuner-repair-v1",
    "name": "Repair",
    "description": "An experimental alternative journey for deep restoration language: golden crossings, quiet wells, and long integration.",
    "durationSec": 540,
    "view": {
      "frequencyWindow": {
        "minHz": 24,
        "maxHz": 72
      },
      "timeWindow": {
        "startSec": 0,
        "endSec": 540
      },
      "beatWindow": {
        "min": -1,
        "max": 1
      }
    },
    "transport": {
      "loop": false,
      "loopStartSec": 0,
      "loopEndSec": 540
    },
    "tracks": [
      {
        "id": "signal_l",
        "name": "L main",
        "type": "tone",
        "role": "main",
        "unit": "Hz",
        "source": "authored",
        "color": "#60c7a0",
        "curve": [
          {
            "t": 0,
            "v": 48,
            "curve": "ease"
          },
          {
            "t": 60,
            "v": 44,
            "curve": "spline"
          },
          {
            "t": 120,
            "v": 52,
            "curve": "spline"
          },
          {
            "t": 190,
            "v": 40,
            "curve": "spline"
          },
          {
            "t": 260,
            "v": 46,
            "curve": "spline"
          },
          {
            "t": 335,
            "v": 39,
            "curve": "spline"
          },
          {
            "t": 420,
            "v": 43,
            "curve": "spline"
          },
          {
            "t": 500,
            "v": 40,
            "curve": "ease"
          },
          {
            "t": 540,
            "v": 40,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "signal_r",
        "name": "R affected",
        "type": "tone",
        "role": "affected",
        "unit": "Hz",
        "source": "authored",
        "color": "#8d7cff",
        "curve": [
          {
            "t": 0,
            "v": 48.32,
            "curve": "ease"
          },
          {
            "t": 72,
            "v": 43.6,
            "curve": "spline"
          },
          {
            "t": 140,
            "v": 54,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": 39.4,
            "curve": "spline"
          },
          {
            "t": 280,
            "v": 47.5,
            "curve": "spline"
          },
          {
            "t": 350,
            "v": 38.5,
            "curve": "spline"
          },
          {
            "t": 430,
            "v": 43.18,
            "curve": "spline"
          },
          {
            "t": 500,
            "v": 40.18,
            "curve": "ease"
          },
          {
            "t": 540,
            "v": 40.18,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "r_offset",
        "name": "R offset",
        "type": "automation",
        "role": "signedOffsetHz",
        "unit": "Hz",
        "source": "authored",
        "color": "#f0a6ff",
        "curve": [
          {
            "t": 0,
            "v": 0.32,
            "curve": "ease"
          },
          {
            "t": 70,
            "v": -0.24,
            "curve": "spline"
          },
          {
            "t": 135,
            "v": 0.42,
            "curve": "spline"
          },
          {
            "t": 205,
            "v": -0.34,
            "curve": "spline"
          },
          {
            "t": 280,
            "v": 0.28,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": -0.18,
            "curve": "spline"
          },
          {
            "t": 450,
            "v": 0.18,
            "curve": "spline"
          },
          {
            "t": 540,
            "v": 0.18,
            "curve": "hold"
          }
        ]
      },
      {
        "id": "amplitude",
        "name": "Master amplitude",
        "type": "automation",
        "role": "amplitude",
        "unit": "linear",
        "source": "authored",
        "color": "#f0c96b",
        "curve": [
          {
            "t": 0,
            "v": 0,
            "curve": "ease"
          },
          {
            "t": 24,
            "v": 0.72,
            "curve": "ease"
          },
          {
            "t": 90,
            "v": 0.96,
            "curve": "spline"
          },
          {
            "t": 165,
            "v": 0.68,
            "curve": "spline"
          },
          {
            "t": 245,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 330,
            "v": 0.64,
            "curve": "spline"
          },
          {
            "t": 430,
            "v": 0.88,
            "curve": "spline"
          },
          {
            "t": 540,
            "v": 0,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_l",
        "name": "Amplitude L",
        "type": "automation",
        "role": "amplitudeLeft",
        "unit": "linear",
        "source": "authored",
        "color": "#5fd0ff",
        "curve": [
          {
            "t": 0,
            "v": 0.92,
            "curve": "ease"
          },
          {
            "t": 120,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 0.84,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.98,
            "curve": "spline"
          },
          {
            "t": 540,
            "v": 0.9,
            "curve": "ease"
          }
        ]
      },
      {
        "id": "amplitude_r",
        "name": "Amplitude R",
        "type": "automation",
        "role": "amplitudeRight",
        "unit": "linear",
        "source": "authored",
        "color": "#ff9f6e",
        "curve": [
          {
            "t": 0,
            "v": 0.86,
            "curve": "ease"
          },
          {
            "t": 120,
            "v": 0.82,
            "curve": "spline"
          },
          {
            "t": 240,
            "v": 1,
            "curve": "spline"
          },
          {
            "t": 360,
            "v": 0.86,
            "curve": "spline"
          },
          {
            "t": 540,
            "v": 0.9,
            "curve": "ease"
          }
        ]
      }
    ],
    "regions": [
      {
        "id": "repair_orient",
        "name": "Orient",
        "start": 0,
        "end": 75,
        "mode": "linked",
        "transitionSec": 0,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "repair_golden",
        "name": "Golden",
        "start": 75,
        "end": 170,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 46,
            "ratio": -1.618
          }
        }
      },
      {
        "id": "repair_field",
        "name": "Field",
        "start": 170,
        "end": 285,
        "mode": "free",
        "transitionSec": 5,
        "rules": {}
      },
      {
        "id": "repair_ratio",
        "name": "Ratio",
        "start": 285,
        "end": 365,
        "mode": "ratio",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "centeredRatio",
            "centerHz": 42,
            "ratio": 1.618
          }
        }
      },
      {
        "id": "repair_integrate",
        "name": "Integrate",
        "start": 365,
        "end": 500,
        "mode": "linked",
        "transitionSec": 5,
        "rules": {
          "r": {
            "type": "signedOffset",
            "sourceTrackId": "signal_l",
            "offsetTrackId": "r_offset"
          }
        }
      },
      {
        "id": "repair_rest",
        "name": "Rest",
        "start": 500,
        "end": 540,
        "mode": "hold",
        "transitionSec": 5,
        "rules": {}
      }
    ],
    "relations": [
      {
        "id": "linked_signed_offset",
        "type": "signedOffset",
        "sourceTrackId": "signal_l",
        "targetTrackId": "signal_r",
        "offsetTrackId": "r_offset"
      }
    ],
    "assets": [],
    "outputs": [],
    "routing": [],
    "presetNormalization": {
      "masterAmplitudePeak": 1
    }
  }
};
