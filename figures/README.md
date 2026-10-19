# Figures

Interactive isometric figures built with the [Anatomy](https://github.com/wheresryan22/anatomy) skill (MIT, pinned at commit `1482e84`). The rule of the skill: *the object is the explanation* — instead of boxes and arrows, a real physical bench whose working is the concept, with every number on the card coming from one model.

| Figure | Concept | Used in |
|---|---|---|
| `relay-bench/` | An MCU sets the MOSFET gate voltage, the MOSFET drives a relay coil with a flyback diode, the relay switches a lamp. Pull-in and drop-out hysteresis, and MOSFET heating in the partly-on region. | Questions Q21, Q64, Q65, Q66 and the relay component page |

## Rebuild

```bash
node figures/relay-bench/build.mjs            # dark page
node figures/relay-bench/build.mjs --light    # light page
node figures/embed.mjs                        # pack into src/39k-anatomy-figures.js
./build.sh                                    # rebuild the app
```

Checks used during the build (from the Anatomy repository, needs Chrome): `scripts/lines.mjs` must report `line ends: 0` in both themes; `scripts/capture.mjs` for screenshots. The relay bench passed with 0 floating line ends of 207.

All component values in the figures are examples (V_th = 1.5 V, coil 480 Ω, pull-in 18 V, drop-out 2.4 V). The app shows the figure in the reader's theme.
