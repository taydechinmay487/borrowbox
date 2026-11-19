import { useMemo, useState } from 'react';
import { MODULATIONS, MODULATION_ORDER } from '../lib/modulations.js';
import { bitsToText } from '../lib/encode.js';
import { MAX_CHARS, MAX_SAMPLES } from '../lib/dsp.js';
import Waveform from './Waveform.jsx';

const PARAM_FIELDS = [
  { key: 'fc', sym: 'Fc', label: 'Carrier frequency', unit: 'Hz', step: '10', hint: 'Reference tone' },
  { key: 'f0', sym: 'F0', label: 'Binary 0 frequency', unit: 'Hz', step: '10', hint: 'Low tone (FM)', mods: ['FM'] },
  { key: 'f1', sym: 'F1', label: 'Binary 1 frequency', unit: 'Hz', step: '10', hint: 'High tone (FM)', mods: ['FM'] },
  { key: 'ac', sym: 'Ac', label: 'Carrier amplitude', unit: 'V', step: '0.1', hint: 'Also the NRZ level' },
  { key: 'mu', sym: 'μ', label: 'Modulation index', unit: '', step: '0.05', hint: 'μ = 1 → OOK', mods: ['AM'] },
  { key: 'fs', sym: 'Fs', label: 'Sampling rate', unit: 'Hz', step: '500', hint: 'Samples / second' },
  { key: 'tb', sym: 'Tb', label: 'Bit duration', unit: 's', step: '0.005', hint: 'Time per bit' },
];

const WINDOW_OPTIONS = [1, 2, 3, 4, 6, 8, 12, 16];

const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

export default function Simulator({
  text,
  setText,
  encoded,
  modulation,
  setModulation,
  params,
  setParam,
  parsed,
  validation,
  noise,
  setNoise,
  noiseSeed,
  rerollNoise,
  ampThreshold,
  setAmpThreshold,
  freqThreshold,
  setFreqThreshold,
  ampSuggestion,
  sim,
  simKey,
}) {
  const [windowMode, setWindowMode] = useState(4);
  const [startBit, setStartBit] = useState(0);
  const [channelView, setChannelView] = useState('bits');

  const nb = encoded.bits.length;
  const view = windowMode === 'all' ? Math.max(1, nb) : Math.min(windowMode, Math.max(1, nb));
  const maxStart = Math.max(0, nb - view);
  const start = Math.min(Math.max(0, startBit), maxStart);

  const recoveredText = useMemo(
    () => (sim ? bitsToText(Array.from(sim.recoveredBits)) : ''),
    [sim]
  );

  const errors = sim ? sim.errorCount : 0;
  const total = sim ? sim.nb : nb;
  const ber = total ? errors / total : 0;
  const meta = MODULATIONS[modulation];

  const fieldError = (key) => validation.errors.find((e) => e.field === key);

  const bias = useMemo(() => {
    if (!sim) return null;
    let sum = 0;
    for (let i = 0; i < sim.N; i++) sum += sim.received[i];
    return sum / Math.max(1, sim.N);
  }, [sim]);

  return (
    <section id="simulator" className="section">
      <div className="section__head">
        <span className="eyebrow">02 · Simulator</span>
        <h2>Build the transmission chain</h2>
        <p>
          Encode a message, pick a technique, tune the carrier — the four scopes below are redrawn from the
          maths on every keystroke, and the receiver only ever sees the (optionally noisy) channel signal.
        </p>
      </div>

      {/* ---------------- message + technique ---------------- */}
      <div className="sim__top">
        <div className="card">
          <div className="card__head">
            <h3>
              <span className="step">1</span> Message to binary
            </h3>
            <span className="tag">{encoded.bytes.length} bytes · {nb} bits</span>
          </div>

          <label className="field field--text">
            <span className="field__label">Message</span>
            <input
              type="text"
              value={text}
              maxLength={MAX_CHARS}
              placeholder="Type a word or short sentence…"
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
            <span className="field__count">
              {text.length}/{MAX_CHARS} chars
            </span>
          </label>

          <div className="charTable__wrap">
            {encoded.chars.length === 0 ? (
              <p className="muted small">Type something to see the UTF-8 encoding.</p>
            ) : (
              <table className="charTable">
                <thead>
                  <tr>
                    <th>Char</th>
                    <th>ASCII</th>
                    <th>Hex</th>
                    <th>Binary</th>
                  </tr>
                </thead>
                <tbody>
                  {encoded.chars.map((c, i) => (
                    <tr key={`${c.char}-${i}`}>
                      <td className="charTable__char">{c.display}</td>
                      <td>{c.ascii === null ? <span className="muted">multi-byte</span> : c.ascii}</td>
                      <td className="mono">{c.hex}</td>
                      <td className="mono bits">{c.bitString}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bitstream">
            <div className="bitstream__head">
              <span>Complete bitstream</span>
              <span className="muted mono">{nb} bits</span>
            </div>
            <div className="bitstream__body">
              {encoded.bytes.length === 0 ? (
                <span className="muted">—</span>
              ) : (
                encoded.chars.map((c, ci) => (
                  <span key={ci} className="byteGroup" title={`${c.display} → ${c.bitString}`}>
                    {Array.from({ length: c.bits.length / 8 }, (_, bi) => (
                      <b key={bi} className="byteGroup__byte">
                        {c.bits.slice(bi * 8, bi * 8 + 8).join('')}
                      </b>
                    ))}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>
              <span className="step">2</span> Modulation technique
            </h3>
            <span className="tag">pick one</span>
          </div>
          <div className="modCards">
            {MODULATION_ORDER.map((key) => {
              const m = MODULATIONS[key];
              const active = key === modulation;
              return (
                <button
                  type="button"
                  key={key}
                  className={`modCard ${active ? 'is-active' : ''}`}
                  style={{ '--mc': m.color }}
                  onClick={() => setModulation(key)}
                  aria-pressed={active}
                >
                  <span className="modCard__top">
                    <span className="modCard__badge">{m.short}</span>
                    <span className="modCard__variant">{m.variant}</span>
                  </span>
                  <span className="modCard__name">{m.name}</span>
                  <span className="modCard__prop">
                    varies <b>{m.property.toLowerCase()}</b>
                  </span>
                  <span className="modCard__eq">{m.digitalEquation}</span>
                </button>
              );
            })}
          </div>
          <p className="modNote">
            <b>{meta.digitalName}.</b> {meta.blurb}
          </p>
        </div>
      </div>

      {/* ---------------- params + plots ---------------- */}
      <div className="sim__grid">
        <aside className="card card--params">
          <div className="card__head">
            <h3>
              <span className="step">3</span> Parameters
            </h3>
            <button
              type="button"
              className="linkBtn"
              onClick={() => {
                setParam('fc', '200');
                setParam('f0', '140');
                setParam('f1', '260');
                setParam('ac', '1');
                setParam('mu', '1');
                setParam('fs', '4000');
                setParam('tb', '0.05');
              }}
            >
              Reset defaults
            </button>
          </div>

          <div className="paramGrid">
            {PARAM_FIELDS.map((f) => {
              const dim = f.mods && !f.mods.includes(modulation);
              const err = fieldError(f.key);
              return (
                <label key={f.key} className={`field ${dim ? 'is-dim' : ''} ${err ? 'is-err' : ''}`}>
                  <span className="field__label">
                    <em>{f.sym}</em> {f.label}
                  </span>
                  <span className="field__input">
                    <input
                      type="number"
                      value={params[f.key]}
                      step={f.step}
                      onChange={(e) => setParam(f.key, e.target.value)}
                      aria-invalid={!!err}
                    />
                    <span className="field__unit">{f.unit}</span>
                  </span>
                  <span className="field__hint">{err ? err.message : f.hint}</span>
                </label>
              );
            })}
          </div>

          <div className="card__sep" />

          <div className="card__head card__head--tight">
            <h4>Channel noise</h4>
            <span className="mono small muted">σ = {fmt(sim ? sim.sigma : 0, 3)} V</span>
          </div>
          <label className="slider">
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.01"
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
            />
            <span className="mono">{fmt(noise, 2)}</span>
          </label>
          <button type="button" className="btn btn--ghost btn--sm" onClick={rerollNoise}>
            New noise run
          </button>

          <div className="card__sep" />

          <div className="card__head card__head--tight">
            <h4>Receiver thresholds</h4>
          </div>

          {modulation === 'AM' && (
            <label className="field">
              <span className="field__label">
                <em>V<sub>th</sub></em> Amplitude threshold
              </span>
              <span className="field__input">
                <input type="number" step="0.05" value={ampThreshold} onChange={(e) => setAmpThreshold(e.target.value)} />
                <span className="field__unit">V</span>
              </span>
              <span className="field__hint">
                suggested {fmt(ampSuggestion, 2)} V{' '}
                <button
                  type="button"
                  className="linkBtn"
                  onClick={() => setAmpThreshold(String(ampSuggestion.toFixed(2)))}
                >
                  use
                </button>
              </span>
            </label>
          )}

          {modulation === 'FM' && (
            <label className="field">
              <span className="field__label">
                <em>F<sub>th</sub></em> Frequency threshold
              </span>
              <span className="field__input">
                <input type="number" step="5" value={freqThreshold} onChange={(e) => setFreqThreshold(e.target.value)} />
                <span className="field__unit">Hz</span>
              </span>
              <span className="field__hint">
                midpoint (F0+F1)/2 = {fmt((parsed.f0 + parsed.f1) / 2, 1)} Hz{' '}
                <button
                  type="button"
                  className="linkBtn"
                  onClick={() => setFreqThreshold(String(((parsed.f0 + parsed.f1) / 2).toFixed(1)))}
                >
                  use
                </button>
              </span>
            </label>
          )}

          {modulation === 'PM' && (
            <p className="hintBlock">
              Coherent BPSK: the detector correlates each bit against the reference carrier and decides on
              |φ| &gt; 90°. No manual threshold is needed.
            </p>
          )}

          <div className="card__sep" />

          <dl className="derived">
            <div>
              <dt>Samples / bit</dt>
              <dd className="mono">{sim ? sim.spb : '—'}</dd>
            </div>
            <div>
              <dt>Total samples</dt>
              <dd className="mono">{sim ? sim.N.toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt>Carrier cycles / bit</dt>
              <dd className="mono">{fmt(parsed.fc * parsed.tb, 1)}</dd>
            </div>
            <div>
              <dt>Frame length</dt>
              <dd className="mono">{sim ? `${(sim.duration * 1000).toFixed(0)} ms` : '—'}</dd>
            </div>
          </dl>

          {validation.warnings.length > 0 && (
            <ul className="notes notes--warn">
              {validation.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          {validation.errors.length > 0 && (
            <ul className="notes notes--err">
              {validation.errors.map((e) => (
                <li key={e.message}>{e.message}</li>
              ))}
            </ul>
          )}
        </aside>

        <div className="sim__plots">
          <div className="card card--plots">
            <div className="plots__head">
              <div>
                <h3>Waveform dashboard</h3>
                <p className="muted small">
                  {sim
                    ? `${sim.nb} bits · ${sim.N.toLocaleString()} samples @ ${parsed.fs} Hz`
                    : `limit ${MAX_SAMPLES.toLocaleString()} samples`}
                </p>
              </div>
              <div className="plots__controls">
                <div className="segmented">
                  {WINDOW_OPTIONS.map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={windowMode === n ? 'is-on' : ''}
                      onClick={() => {
                        setWindowMode(n);
                        setStartBit(0);
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={windowMode === 'all' ? 'is-on' : ''}
                    onClick={() => {
                      setWindowMode('all');
                      setStartBit(0);
                    }}
                  >
                    all
                  </button>
                </div>
                <div className="zoomer">
                  <button
                    type="button"
                    onClick={() => setStartBit(Math.max(0, start - 1))}
                    disabled={start <= 0}
                    aria-label="Previous bit"
                  >
                    ‹
                  </button>
                  <span className="mono small">
                    bits {nb ? start : 0}–{nb ? Math.min(nb - 1, start + view - 1) : 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStartBit(Math.min(maxStart, start + 1))}
                    disabled={start >= maxStart}
                    aria-label="Next bit"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {!sim ? (
              <div className="plots__empty">
                <strong>No valid signal</strong>
                <p>Fix the highlighted parameter errors (or type a message) to generate waveforms.</p>
              </div>
            ) : (
              <div className="plots__stack">
                <Waveform
                  title="1 · Digital input (NRZ)"
                  subtitle="Message signal — +A for 1, −A for 0"
                  data={sim.digital}
                  spb={sim.spb}
                  bits={encoded.bits}
                  startBit={start}
                  viewBits={view}
                  fs={parsed.fs}
                  color="#38bdf8"
                  height={132}
                  footer={
                    <span className="wf__meta mono">
                      ±{fmt(parsed.ac, 2)} V
                    </span>
                  }
                />
                <Waveform
                  title="2 · Unmodulated carrier"
                  subtitle={`Ac cos(2πFc t) · Fc = ${parsed.fc} Hz`}
                  data={sim.carrier}
                  spb={sim.spb}
                  bits={encoded.bits}
                  startBit={start}
                  viewBits={view}
                  fs={parsed.fs}
                  color="#7dd3fc"
                  height={132}
                  footer={<span className="wf__meta mono">Fc {parsed.fc} Hz</span>}
                />
                <Waveform
                  title={`3 · Modulated signal · ${meta.short} (${meta.variant})`}
                  subtitle={meta.digitalEquation}
                  data={sim.modulated}
                  spb={sim.spb}
                  bits={encoded.bits}
                  startBit={start}
                  viewBits={view}
                  fs={parsed.fs}
                  color={meta.color}
                  height={150}
                  threshold={modulation === 'AM' ? sim.ampThreshold : modulation === 'FM' ? sim.freqThreshold : null}
                  thresholdLabel={modulation === 'AM' ? 'Vth' : 'Fth (on amplitude axis for reference)'}
                  footer={
                    <span className="wf__meta mono">
                      {modulation === 'AM'
                        ? `A₁ ${fmt(sim.levels.one, 2)} V · A₀ ${fmt(sim.levels.zero, 2)} V`
                        : modulation === 'FM'
                        ? `F0 ${parsed.f0} Hz · F1 ${parsed.f1} Hz`
                        : '0° / 180°'}
                    </span>
                  }
                />

                <div className="plots__channelHead">
                  <h4>4 · Channel &amp; recovered signal</h4>
                  <div className="segmented segmented--sm">
                    <button
                      type="button"
                      className={channelView === 'bits' ? 'is-on' : ''}
                      onClick={() => setChannelView('bits')}
                    >
                      Recovered bits
                    </button>
                    <button
                      type="button"
                      className={channelView === 'analog' ? 'is-on' : ''}
                      onClick={() => setChannelView('analog')}
                    >
                      Noisy received
                    </button>
                  </div>
                </div>

                {channelView === 'bits' ? (
                  <Waveform
                    title="Recovered digital output"
                    subtitle="Bits decided by the receiver — red bands are errors"
                    data={sim.recovered}
                    spb={sim.spb}
                    bits={sim.recoveredBits}
                    startBit={start}
                    viewBits={view}
                    fs={parsed.fs}
                    color="#34d399"
                    height={132}
                    errorBits={sim.errorBits}
                    footer={<span className="wf__meta mono">{errors} error(s)</span>}
                  />
                ) : (
                  <Waveform
                    title="Received analogue signal"
                    subtitle={`Channel output · σ = ${fmt(sim.sigma, 3)} V`}
                    data={sim.received}
                    spb={sim.spb}
                    bits={encoded.bits}
                    startBit={start}
                    viewBits={view}
                    fs={parsed.fs}
                    color="#fbbf24"
                    height={132}
                    errorBits={sim.errorBits}
                    footer={<span className="wf__meta mono">DC offset {fmt(bias, 3)} V</span>}
                  />
                )}
              </div>
            )}
          </div>

          <div className="card card--results">
            <div className="results__row">
              <div className="stat">
                <span className="stat__k">Transmitted</span>
                <span className="stat__v mono">{text || '—'}</span>
              </div>
              <div className="stat">
                <span className="stat__k">Recovered</span>
                <span className={`stat__v mono ${sim && recoveredText !== text ? 'is-bad' : 'is-good'}`}>
                  {sim ? recoveredText : '—'}
                </span>
              </div>
              <div className="stat">
                <span className="stat__k">Bit errors</span>
                <span className={`stat__v mono ${errors ? 'is-bad' : 'is-good'}`}>
                  {sim ? `${errors} / ${total}` : '—'}
                </span>
              </div>
              <div className="stat">
                <span className="stat__k">BER</span>
                <span className={`stat__v mono ${errors ? 'is-bad' : 'is-good'}`}>
                  {sim ? ber.toExponential(2) : '—'}
                </span>
              </div>
              <div className="stat">
                <span className="stat__k">Integrity</span>
                <span className={`pill ${sim && errors === 0 && recoveredText === text ? 'pill--ok' : 'pill--bad'}`}>
                  {sim ? (errors === 0 && recoveredText === text ? 'message intact' : 'corrupted') : 'no signal'}
                </span>
              </div>
            </div>

            {sim && (
              <details className="bitlog">
                <summary>
                  Per-bit receiver measurements
                  <span className="muted small">
                    {' '}
                    — {modulation === 'AM' ? 'amplitude' : modulation === 'FM' ? 'frequency' : 'phase'} vs decision level
                  </span>
                </summary>
                <div className="bitlog__scroll">
                  <table className="bitlog__table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Interval (ms)</th>
                        <th>Sent</th>
                        <th>Measured</th>
                        <th>Threshold</th>
                        <th>Decided</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {sim.metrics.map((mt) => (
                        <tr key={mt.bit} className={mt.correct ? '' : 'is-bad'}>
                          <td className="mono">{mt.bit}</td>
                          <td className="mono">
                            {(mt.interval[0] * 1000).toFixed(0)}–{(mt.interval[1] * 1000).toFixed(0)}
                          </td>
                          <td className="mono">{mt.transmitted}</td>
                          <td className="mono">
                            {modulation === 'AM'
                              ? `${mt.measured.toFixed(3)} V`
                              : modulation === 'FM'
                              ? `${mt.measured.toFixed(1)} Hz`
                              : `${((mt.measured * 180) / Math.PI).toFixed(1)}°`}
                          </td>
                          <td className="mono muted">
                            {modulation === 'AM'
                              ? `${sim.ampThreshold.toFixed(2)} V`
                              : modulation === 'FM'
                              ? `${sim.freqThreshold.toFixed(1)} Hz`
                              : '90°'}
                          </td>
                          <td className="mono">{mt.decided}</td>
                          <td className={mt.correct ? 'ok' : 'bad'}>{mt.correct ? '✓' : '✗'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
