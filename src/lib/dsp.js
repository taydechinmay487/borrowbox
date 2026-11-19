// ---------------------------------------------------------------------------
// dsp.js — signal generation, validation and measurement.
//
// Everything here is computed from the same maths the receiver sees: the
// demodulator only ever reads `received[]`, never the transmitted bit array.
// ---------------------------------------------------------------------------

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function parseNum(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const s = String(value ?? '').trim();
  if (s === '') return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export const MAX_SAMPLES = 400000;
export const MAX_CHARS = 48;

// --- random ---------------------------------------------------------------

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller transform over any uniform source. */
export function makeGaussian(rand) {
  let spare = null;
  return function gauss() {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    let u = 0;
    let v = 0;
    let s = 0;
    do {
      u = rand() * 2 - 1;
      v = rand() * 2 - 1;
      s = u * u + v * v;
    } while (s === 0 || s >= 1);
    const m = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * m;
    return u * m;
  };
}

// --- spectral estimation --------------------------------------------------

/**
 * Goertzel magnitude of one frequency bin over x[start .. start+count-1],
 * with a Hann window applied to reduce spectral leakage.
 */
export function goertzelMag(x, start, count, freq, fs) {
  if (count < 2) return 0;
  const w = (2 * Math.PI * freq) / fs;
  const coeff = 2 * Math.cos(w);
  const norm = 1 / (count - 1);
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < count; i++) {
    const win = 0.5 - 0.5 * Math.cos(2 * Math.PI * i * norm);
    const s0 = x[start + i] * win + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const real = s1 - s2 * Math.cos(w);
  const imag = s2 * Math.sin(w);
  return Math.hypot(real, imag);
}

/**
 * Estimate the dominant frequency inside one bit interval by scanning a
 * filter bank and refining the peak with parabolic interpolation on the
 * log-magnitude curve (log interpolation matches a Hann main lobe well).
 */
export function estimateFrequency(x, start, count, fs, fMin, fMax, grid = 180) {
  const lo = Math.max(1, fMin);
  const hi = Math.min(fMax, fs * 0.47);
  if (!(hi > lo)) return Math.max(lo, hi);
  if (grid < 3) grid = 3;

  const mags = new Float64Array(grid);
  let bestI = 0;
  let best = -1;
  for (let k = 0; k < grid; k++) {
    const f = lo + ((hi - lo) * k) / (grid - 1);
    const m = goertzelMag(x, start, count, f, fs);
    mags[k] = m;
    if (m > best) {
      best = m;
      bestI = k;
    }
  }

  let idx = bestI;
  if (bestI > 0 && bestI < grid - 1) {
    const a = Math.log(mags[bestI - 1] + 1e-12);
    const b = Math.log(mags[bestI] + 1e-12);
    const c = Math.log(mags[bestI + 1] + 1e-12);
    const denom = a - 2 * b + c;
    if (Math.abs(denom) > 1e-12) {
      const delta = (0.5 * (a - c)) / denom;
      if (Number.isFinite(delta) && Math.abs(delta) <= 1) idx = bestI + delta;
    }
  }
  return lo + ((hi - lo) * idx) / (grid - 1);
}

// --- validation -----------------------------------------------------------

export function samplesPerBit(tb, fs) {
  return Math.max(8, Math.round(tb * fs));
}

/**
 * Returns { errors: [{field, message}], warnings: [string], derived }
 * `field` lets the UI highlight the offending control.
 */
export function validateConfig(p, modulation, bitCount = 0) {
  const errors = [];
  const warnings = [];

  const fc = parseNum(p.fc);
  const f0 = parseNum(p.f0);
  const f1 = parseNum(p.f1);
  const ac = parseNum(p.ac);
  const mu = parseNum(p.mu);
  const fs = parseNum(p.fs);
  const tb = parseNum(p.tb);

  if (!Number.isFinite(fc) || fc <= 0) {
    errors.push({ field: 'fc', message: 'Carrier frequency Fc must be a positive number.' });
  }
  if (!Number.isFinite(ac) || ac <= 0) {
    errors.push({ field: 'ac', message: 'Carrier amplitude Ac must be greater than 0 V.' });
  }
  if (!Number.isFinite(fs) || fs < 100) {
    errors.push({ field: 'fs', message: 'Sampling rate Fs must be at least 100 Hz.' });
  }
  if (!Number.isFinite(tb) || tb < 0.001) {
    errors.push({ field: 'tb', message: 'Bit duration Tb must be at least 1 ms.' });
  }

  if (modulation === 'FM') {
    if (!Number.isFinite(f0) || f0 <= 0) {
      errors.push({ field: 'f0', message: 'F0 must be a positive frequency.' });
    }
    if (!Number.isFinite(f1) || f1 <= 0) {
      errors.push({ field: 'f1', message: 'F1 must be a positive frequency.' });
    }
    if (Number.isFinite(f0) && Number.isFinite(f1) && f1 <= f0) {
      errors.push({ field: 'f1', message: 'F1 must be greater than F0 (bit 1 uses the higher tone).' });
    }
  }

  if (modulation === 'AM') {
    if (!Number.isFinite(mu) || mu < 0 || mu > 1) {
      errors.push({ field: 'mu', message: 'Modulation index \u03bc must be between 0 and 1.' });
    }
  }

  const spb = samplesPerBit(tb, fs);
  const derived = { fc, f0, f1, ac, mu, fs, tb, spb };

  if (!errors.length) {
    const maxFreq = modulation === 'FM' ? Math.max(f1, fc) : fc;
    if (fs <= 2 * maxFreq) {
      errors.push({
        field: 'fs',
        message: `Sampling rate (${fs} Hz) must exceed the Nyquist limit 2 \u00d7 ${maxFreq} Hz for ${modulation}.`,
      });
    } else if (fs < 6 * maxFreq) {
      warnings.push(`Only ${(fs / maxFreq).toFixed(1)} samples per carrier cycle — the drawn waveform will look coarse.`);
    }

    if (tb * fs < 8) {
      errors.push({
        field: 'tb',
        message: `Only ${(tb * fs).toFixed(1)} sample(s) per bit. Raise Fs or Tb so that Fs \u00d7 Tb \u2265 8.`,
      });
    }

    if (modulation === 'FM') {
      const separation = Math.abs(f1 - f0);
      const resolution = 1 / tb;
      if (separation < resolution) {
        errors.push({
          field: 'f1',
          message: `F0 and F1 overlap: |F1 \u2212 F0| = ${separation.toFixed(1)} Hz but one bit only resolves ${resolution.toFixed(
            1
          )} Hz. Widen the separation or shorten Tb.`,
        });
      } else if (separation < 2 * resolution) {
        warnings.push(
          `Frequency separation is only ${(separation / resolution).toFixed(1)} \u00d7 the bit resolution (1/Tb = ${resolution.toFixed(
            1
          )} Hz). Detection becomes noise sensitive.`
        );
      }
      if (fc <= f0 || fc >= f1) {
        warnings.push('The reference carrier Fc sits outside [F0, F1]; the carrier panel is shown for reference only.');
      }
    }

    if (modulation === 'AM' && mu === 0) {
      warnings.push('\u03bc = 0 means no modulation at all — the envelope never changes. Use \u03bc > 0.');
    }
    if (fc * tb < 3) {
      warnings.push(`Only ${(fc * tb).toFixed(1)} carrier cycles per bit; increase Fc or Tb for a clearer picture.`);
    }
    if (bitCount * spb > MAX_SAMPLES) {
      errors.push({
        field: 'tb',
        message: `This would generate ${(bitCount * spb).toLocaleString()} samples (limit ${MAX_SAMPLES.toLocaleString()}). Shorten the message or reduce Fs/Tb.`,
      });
    }
  }

  return { errors, warnings, derived };
}

/** Suggested amplitude decision level for AM/ASK. */
export function suggestedAmpThreshold(ac, mu) {
  const m = clamp(Number.isFinite(mu) ? mu : 1, 0, 1);
  const one = ac;
  const zero = (ac * (1 - m)) / (1 + m);
  return (one + zero) / 2;
}

// --- simulation -----------------------------------------------------------

/**
 * Generate the whole transmission chain and measure the result.
 *
 * cfg = { bits, modulation, fc, f0, f1, ac, mu, fs, tb,
 *         noise, noiseSeed, ampThreshold, freqThreshold, detect }
 */
export function simulate(cfg) {
  const {
    bits,
    modulation,
    fc,
    f0,
    f1,
    ac,
    mu,
    fs,
    tb,
    noise = 0,
    noiseSeed = 1337,
    ampThreshold = 0.5,
    freqThreshold = 200,
    detect = true,
  } = cfg;

  const nb = bits.length;
  const spb = samplesPerBit(tb, fs);
  const N = nb * spb;
  const dt = 1 / fs;
  const TAU = 2 * Math.PI;

  const digital = new Float32Array(N);
  const carrier = new Float32Array(N);
  const modulated = new Float32Array(N);
  const received = new Float32Array(N);

  const m = clamp(Number.isFinite(mu) ? mu : 1, 0, 1);
  const level1 = ac;
  const level0 = modulation === 'AM' ? (ac * (1 - m)) / (1 + m) : ac;

  const gauss = makeGaussian(mulberry32(noiseSeed));
  const sigma = Math.max(0, noise) * ac * 0.75;

  // FM uses a phase accumulator so the tone stays phase-continuous.
  let phase = 0;

  for (let i = 0; i < N; i++) {
    const bit = bits[(i / spb) | 0];
    const t = i * dt;

    digital[i] = (bit ? 1 : -1) * ac;

    const car = ac * Math.cos(TAU * fc * t);
    carrier[i] = car;

    let s;
    if (modulation === 'AM') {
      s = (bit ? level1 : level0) * car;
    } else if (modulation === 'FM') {
      const fi = bit ? f1 : f0;
      phase += TAU * fi * dt;
      s = ac * Math.cos(phase);
    } else {
      s = ac * Math.cos(TAU * fc * t + (bit ? Math.PI : 0));
    }
    modulated[i] = s;
    received[i] = sigma > 0 ? s + sigma * gauss() : s;
  }

  // --- receiver -----------------------------------------------------------
  const recoveredBits = new Uint8Array(nb);
  const recovered = new Float32Array(N);
  const metrics = [];
  const errorBits = [];
  let errorCount = 0;

  const fThreshold = Number.isFinite(freqThreshold) ? freqThreshold : (f0 + f1) / 2;
  const aThreshold = Number.isFinite(ampThreshold) ? ampThreshold : suggestedAmpThreshold(ac, m);

  if (detect) {
    for (let b = 0; b < nb; b++) {
      const start = b * spb;
      let measured = 0;
      let decided = 0;

      if (modulation === 'AM') {
        let sum = 0;
        for (let i = start; i < start + spb; i++) {
          const v = received[i];
          sum += v * v;
        }
        measured = Math.sqrt(sum / spb) * Math.SQRT2; // peak of the sinusoid
        decided = measured > aThreshold ? 1 : 0;
      } else if (modulation === 'FM') {
        const lo = Math.min(f0, f1) * 0.55;
        const hi = Math.max(f0, f1) * 1.45;
        measured = estimateFrequency(received, start, spb, fs, lo, hi, 180);
        decided = measured > fThreshold ? 1 : 0;
      } else {
        let I = 0;
        let Q = 0;
        for (let i = start; i < start + spb; i++) {
          const a = TAU * fc * (i * dt);
          I += received[i] * Math.cos(a);
          Q += received[i] * Math.sin(a);
        }
        measured = Math.atan2(-Q, I); // radians in (-pi, pi]
        decided = Math.abs(measured) > Math.PI / 2 ? 1 : 0;
      }

      recoveredBits[b] = decided;
      const correct = decided === bits[b];
      if (!correct) {
        errorCount += 1;
        errorBits.push(b);
      }
      metrics.push({
        bit: b,
        interval: [start / fs, (start + spb) / fs],
        transmitted: bits[b],
        measured,
        decided,
        correct,
      });
    }

    for (let i = 0; i < N; i++) {
      recovered[i] = recoveredBits[(i / spb) | 0] ? ac : -ac;
    }
  }

  return {
    modulation,
    spb,
    nb,
    N,
    dt,
    fs,
    tb,
    duration: N / fs,
    levels: { one: level1, zero: level0 },
    sigma,
    ampThreshold: aThreshold,
    freqThreshold: fThreshold,
    digital,
    carrier,
    modulated,
    received,
    recovered,
    recoveredBits,
    metrics,
    errorCount,
    errorBits,
  };
}
