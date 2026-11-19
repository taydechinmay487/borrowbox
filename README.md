# ModuLab — AM / FM / PM Modulation & Demodulation Simulator

An interactive Data Communication project that takes a text message through a **complete
transmission chain** and back again:

```
TEXT → UTF-8 BINARY → NRZ DIGITAL SIGNAL → MODULATOR → CHANNEL (+noise)
     → RECEIVER → DEMODULATOR → BINARY DECODER → TEXT
```

Every waveform is generated from closed-form mathematics in JavaScript, and — crucially —
the receiver is never given the original bits. It measures the generated (and optionally
noisy) waveform per bit interval and decides `0` or `1` from that measurement alone.

---

## Quick start

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the printed URL (default <http://localhost:5173>).

Production build:

```bash
npm run build
npm run preview
```

No backend, no API keys, no network calls at runtime.

---

## What it does

### 1. Text → binary
- UTF-8 encoding, so `HELLO` becomes 5 bytes / 40 bits.
- Per-character table with the ASCII value, the hex bytes and the bit pattern.
- Full bitstream display, grouped per byte.
- Multi-byte characters (e.g. `é`, emoji) are handled correctly and shown as multi-byte rows.

### 2. Digital signal (NRZ)
`1 → +A`, `0 → −A`, held for one bit period `Tb`. `A` is the carrier amplitude `Ac`
(default `1 V`).

### 3. Modulation

| | Mapping | Equation |
|---|---|---|
| **AM / ASK** | `1 → A₁ cos(2πF꜀t)`, `0 → A₀ cos(2πF꜀t)` | `s(t) = Ac[1 + μm(t)]cos(2πF꜀t)` |
| **FM / BFSK** | `1 → F₁` tone, `0 → F₀` tone | `s(t) = Ac cos(2πfᵢt)` |
| **PM / BPSK** | `1 → 180°`, `0 → 0°` | `s(t) = Ac cos(2πF꜀t + φ)` |

AM is normalised so the high level is exactly `Ac` and the low level is
`Ac(1−μ)/(1+μ)`: `μ = 1` gives pure On-Off Keying, `μ < 1` gives two-level ASK.

FM uses a phase accumulator, i.e. **continuous-phase BFSK** — the tone changes but the
waveform never jumps at a bit boundary.

PM uses an absolute-time reference carrier, so a `1` bit is the exact inverse of the
`0` bit — a real 180° shift.

### 4. Receiver (measured, not simulated)

| Scheme | Measurement | Decision |
|---|---|---|
| AM / ASK | per-bit RMS × √2 → peak envelope amplitude | `Â > Vth` → 1 |
| FM / BFSK | Goertzel filter bank + parabolic peak interpolation → frequency | `f̂ > (F₀+F₁)/2` → 1 |
| PM / BPSK | I/Q correlation against the reference carrier → `φ = atan2(−Q, I)` | `|φ| > 90°` → 1 |

The expandable **per-bit measurement log** shows, for every bit, the sent value, the
measured quantity, the threshold and the decision — so any error can be traced to a
specific measurement.

### 5. Noise
Additive white Gaussian noise (Box–Muller, seeded RNG) with `σ = noise × Ac × 0.75`.
Raise the slider and watch bit errors appear; "New noise run" re-seeds the generator so
you can see that the errors are genuinely random.

### 6. Visualization
Four canvas scopes: digital input, unmodulated carrier, modulated output and
channel/recovered output. Each has a grid, bit boundaries, bit labels, a zero axis, a
hover tooltip (time / amplitude / bit index) and — where relevant — the decision
threshold drawn in amber. A zoom window (1…16 bits or the whole frame) keeps dense
waveforms readable; dense regions use min/max column decimation so nothing is faked.

### 7. Transmission animation
Nine stages with play / pause / step / reset and a 0.5×–3× speed control. Each stage
shows its own live view of the signal or data at that point in the chain.

### 8. Comparison & theory
A side-by-side visual comparison of all three schemes driven by the same bitstream and
the same timing, the full feature table, plus a theory section covering modulation,
carriers, message signals, analogue vs digital modulation, demodulation and decision
rules.

### 9. Validation
- All parameters must be numeric and positive where required.
- `F1 > F0`, the FM tones must not overlap (`|F1−F0| ≥ 1/Tb`), with a warning below `2/Tb`.
- Nyquist check: `Fs > 2 × max frequency`.
- At least 8 samples per bit.
- Total sample cap (400 000) to keep the browser responsive.
- Warnings for `μ = 0`, fewer than 3 carrier cycles per bit, and coarse sampling.

Invalid input disables waveform generation and explains exactly which control is wrong.

---

## Project structure

```
.
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src
    ├── main.jsx                 entry point
    ├── App.jsx                  state, validation, simulation wiring
    ├── styles.css               dashboard theme
    ├── lib
    │   ├── encode.js            UTF-8 ⇄ bits ⇄ text
    │   ├── dsp.js               generation, Goertzel, validation, detection
    │   └── modulations.js       descriptive metadata + comparison table
    └── components
        ├── Nav.jsx
        ├── Simulator.jsx        controls, binary view, 4 scopes, results
        ├── Waveform.jsx         canvas renderer (grid, bits, tooltips)
        ├── Transmission.jsx     9-stage animation
        ├── Comparison.jsx       side-by-side + feature table
        └── Theory.jsx           explanations and equations
```

---

## Suggested demo parameters

| Parameter | Value | Why |
|---|---|---|
| `Fc` | 200 Hz | reference carrier |
| `F0` / `F1` | 140 / 260 Hz | 120 Hz separation vs 20 Hz resolution (`1/Tb`) |
| `Ac` | 1 V | NRZ level and carrier peak |
| `μ` | 1 | On-Off Keying |
| `Fs` | 4000 Hz | 20 samples per carrier cycle |
| `Tb` | 0.05 s | ~10 carrier cycles per bit |

With `noise = 0` all three schemes recover `HELLO` with zero bit errors. Push noise to
about `0.35` and AM starts to misread weak bits, while FM and PM remain more robust —
a good illustration of why constant-envelope schemes are preferred on noisy channels.

---

## Notes

- The digital NRZ amplitude and the carrier amplitude share `Ac`, which keeps the
  default message level at the specified 1 V.
- Decoding is non-fatal UTF-8: corrupted bytes render as `�` instead of throwing, so the
  app always shows a result.
- Waveforms are drawn on `<canvas>` (the accepted alternative to Plotly/Chart.js) so that
  hundreds of thousands of samples stay smooth at 60 fps.
