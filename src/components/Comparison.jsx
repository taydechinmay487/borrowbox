import { MODULATIONS, MODULATION_ORDER, COMPARISON_ROWS } from '../lib/modulations.js';
import { simulate } from '../lib/dsp.js';
import Waveform from './Waveform.jsx';

const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

export default function Comparison({ bits, parsed, modulation, canSimulate }) {
  // Same message, same timing, three different modulators.
  const sims = MODULATION_ORDER.map((key) => {
    if (!canSimulate || !bits.length) return null;
    try {
      return {
        key,
        sim: simulate({
          bits,
          modulation: key,
          fc: parsed.fc,
          f0: parsed.f0,
          f1: parsed.f1,
          ac: parsed.ac,
          mu: Number.isFinite(parsed.mu) ? parsed.mu : 1,
          fs: parsed.fs,
          tb: parsed.tb,
          noise: 0,
          detect: false,
        }),
      };
    } catch {
      return null;
    }
  });

  const viewBits = Math.min(3, Math.max(1, bits.length));

  return (
    <section id="comparison" className="section">
      <div className="section__head">
        <span className="eyebrow">04 · Comparison</span>
        <h2>One message, three carriers</h2>
        <p>
          The same bitstream drives all three modulators. Only one property of the carrier is allowed to move —
          amplitude, frequency, or phase — and that is the entire difference between them.
        </p>
      </div>

      <div className="compare__grid">
        {sims.map((entry, i) => {
          const key = MODULATION_ORDER[i];
          const m = MODULATIONS[key];
          return (
            <div key={key} className="card card--compare" style={{ '--mc': m.color }}>
              <div className="compare__head">
                <span className="compare__badge">{m.short}</span>
                <div>
                  <h3>{m.name}</h3>
                  <p className="muted small">{m.variant}</p>
                </div>
                {key === modulation && <span className="compare__active">active</span>}
              </div>
              <ul className="compare__map">
                {m.mapping.map((row) => (
                  <li key={row.bit}>
                    <span className="compare__bit">{row.bit}</span>
                    <span>{row.value}</span>
                  </li>
                ))}
              </ul>
              {entry?.sim ? (
                <Waveform
                  title="Modulated output"
                  subtitle={m.digitalEquation}
                  data={entry.sim.modulated}
                  spb={entry.sim.spb}
                  bits={bits}
                  startBit={0}
                  viewBits={viewBits}
                  fs={parsed.fs}
                  color={m.color}
                  height={118}
                  compact
                />
              ) : (
                <p className="muted small pad">Fix the parameters to preview this modulation.</p>
              )}
              <p className="compare__note">{m.blurb}</p>
            </div>
          );
        })}
      </div>

      <div className="card card--tableWrap">
        <div className="tableScroll">
          <table className="compareTable">
            <thead>
              <tr>
                <th>Feature</th>
                <th>AM / ASK</th>
                <th>FM / BFSK</th>
                <th>PM / BPSK</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  <td>{row.AM}</td>
                  <td>{row.FM}</td>
                  <td>{row.PM}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card--metrics">
        <h4>Measured with this configuration</h4>
        <div className="metricsRow">
          {sims.map((entry, i) => {
            const key = MODULATION_ORDER[i];
            const m = MODULATIONS[key];
            return (
              <div key={key} className="metric" style={{ '--mc': m.color }}>
                <span className="metric__k">{m.short} · samples/bit</span>
                <span className="metric__v mono">{entry?.sim ? entry.sim.spb : '—'}</span>
                <span className="metric__k">{m.short} · peak amplitude</span>
                <span className="metric__v mono">
                  {entry?.sim ? `${fmt(Math.max(entry.sim.levels.one, entry.sim.levels.zero), 2)} V` : '—'}
                </span>
                <span className="metric__k">{m.short} · tones in use</span>
                <span className="metric__v mono">
                  {key === 'FM'
                    ? `${parsed.f0} / ${parsed.f1} Hz`
                    : key === 'AM'
                    ? `${fmt(entry?.sim?.levels.one ?? NaN, 2)} / ${fmt(entry?.sim?.levels.zero ?? NaN, 2)} V`
                    : '0° / 180°'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
