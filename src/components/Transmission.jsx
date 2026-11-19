import { useEffect, useMemo, useRef, useState } from 'react';
import { MODULATIONS } from '../lib/modulations.js';
import { bitsToText, bytesToText, bitsToBytes } from '../lib/encode.js';
import Waveform from './Waveform.jsx';

const STAGES = [
  {
    id: 'text',
    label: 'Text message',
    icon: '✎',
    blurb: 'The user message is captured as a Unicode string. Every character will be encoded to UTF-8 bytes.',
  },
  {
    id: 'encode',
    label: 'Binary encoder',
    icon: '01',
    blurb: 'Each character becomes one or more UTF-8 bytes; each byte becomes 8 bits, most significant bit first.',
  },
  {
    id: 'digital',
    label: 'Digital signal',
    icon: '⊓',
    blurb: 'The bitstream is turned into a Non-Return-to-Zero waveform: +A for a 1, −A for a 0, held for one bit period Tb.',
  },
  {
    id: 'modulator',
    label: 'Modulator',
    icon: '∿',
    blurb: 'The NRZ message multiplies (AM), retunes (FM) or phase-shifts (PM) the high-frequency carrier.',
  },
  {
    id: 'channel',
    label: 'Transmission channel',
    icon: '⇢',
    blurb: 'The modulated wave travels the medium and picks up additive Gaussian noise on the way.',
  },
  {
    id: 'receiver',
    label: 'Receiver',
    icon: '◉',
    blurb: 'The front end captures the noisy waveform and hands whole bit intervals to the detector.',
  },
  {
    id: 'demodulator',
    label: 'Demodulator',
    icon: '⚖',
    blurb: 'One measurement per bit — amplitude, frequency or phase — compared against the decision threshold.',
  },
  {
    id: 'decoder',
    label: 'Binary decoder',
    icon: '⇄',
    blurb: 'Decided bits are regrouped into bytes and decoded back to UTF-8 characters.',
  },
  {
    id: 'output',
    label: 'Original text',
    icon: '✓',
    blurb: 'The reconstructed message, compared against what was transmitted.',
  },
];

const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

export default function Transmission({ sim, encoded, text, parsed, modulation }) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef(null);

  const total = STAGES.length;

  useEffect(() => {
    if (!playing) return undefined;
    const delay = 1400 / speed;
    timer.current = setInterval(() => {
      setStage((s) => {
        if (s >= total - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, delay);
    return () => clearInterval(timer.current);
  }, [playing, speed, total]);

  const play = () => {
    if (!sim) return;
    if (stage >= total - 1) setStage(0);
    setPlaying(true);
  };
  const pause = () => setPlaying(false);
  const reset = () => {
    setPlaying(false);
    setStage(0);
  };
  const step = () => {
    setPlaying(false);
    setStage((s) => Math.min(total - 1, s + 1));
  };

  const nb = encoded.bits.length;
  const viewBits = Math.min(4, Math.max(1, nb));
  const recovered = useMemo(() => (sim ? bitsToText(Array.from(sim.recoveredBits)) : ''), [sim]);
  const decodedBytes = useMemo(
    () => (sim ? bitsToBytes(Array.from(sim.recoveredBits)) : []),
    [sim]
  );
  const meta = MODULATIONS[modulation];

  const body = () => {
    if (!sim) {
      return <p className="muted">Fix the parameter errors to run the transmission.</p>;
    }
    switch (STAGES[stage].id) {
      case 'text':
        return (
          <div className="stageView__text">
            <span className="stageView__label">message</span>
            <p className="stageView__big">{text || '—'}</p>
            <span className="muted small">
              {encoded.chars.length} characters · {encoded.bytes.length} UTF-8 bytes
            </span>
          </div>
        );
      case 'encode':
        return (
          <div className="stageView__bits">
            {encoded.chars.map((c, i) => (
              <span key={i} className="chip">
                <b>{c.display}</b>
                <em className="mono">{c.bitString}</em>
              </span>
            ))}
          </div>
        );
      case 'digital':
        return (
          <Waveform
            data={sim.digital}
            spb={sim.spb}
            bits={encoded.bits}
            startBit={0}
            viewBits={viewBits}
            fs={parsed.fs}
            color="#38bdf8"
            height={148}
            title="NRZ message signal"
            subtitle={`±${fmt(parsed.ac, 2)} V, Tb = ${parsed.tb} s`}
          />
        );
      case 'modulator':
        return (
          <Waveform
            data={sim.modulated}
            spb={sim.spb}
            bits={encoded.bits}
            startBit={0}
            viewBits={viewBits}
            fs={parsed.fs}
            color={meta.color}
            height={148}
            title={`${meta.short} output`}
            subtitle={meta.digitalEquation}
          />
        );
      case 'channel':
        return (
          <Waveform
            data={sim.received}
            spb={sim.spb}
            bits={encoded.bits}
            startBit={0}
            viewBits={viewBits}
            fs={parsed.fs}
            color="#fbbf24"
            height={148}
            title="Channel output"
            subtitle={`AWGN σ = ${fmt(sim.sigma, 3)} V`}
            errorBits={sim.errorBits}
          />
        );
      case 'receiver':
        return (
          <div className="stageView__recv">
            <Waveform
              data={sim.received}
              spb={sim.spb}
              bits={encoded.bits}
              startBit={0}
              viewBits={viewBits}
              fs={parsed.fs}
              color="#fbbf24"
              height={130}
              threshold={
                modulation === 'AM' ? sim.ampThreshold : modulation === 'FM' ? sim.freqThreshold : null
              }
              thresholdLabel="threshold"
              compact
            />
            <div className="metricsRow metricsRow--tight">
              <div className="metric">
                <span className="metric__k">Detector</span>
                <span className="metric__v mono">{meta.receiver}</span>
              </div>
              <div className="metric">
                <span className="metric__k">Decision rule</span>
                <span className="metric__v mono">{meta.detection}</span>
              </div>
            </div>
          </div>
        );
      case 'demodulator':
        return (
          <div className="stageView__bits">
            {Array.from(sim.recoveredBits).map((b, i) => {
              const wrong = sim.recoveredBits[i] !== encoded.bits[i];
              return (
                <span key={i} className={`chip chip--bit ${wrong ? 'chip--bad' : 'chip--ok'}`}>
                  <em className="mono">{b}</em>
                </span>
              );
            })}
            <p className="muted small full">
              {sim.errorCount} bit error(s) detected · {meta.short} decided each bit from the measured{' '}
              {modulation === 'AM' ? 'amplitude' : modulation === 'FM' ? 'frequency' : 'phase'}.
            </p>
          </div>
        );
      case 'decoder':
        return (
          <div className="stageView__bits">
            {decodedBytes.map((b, i) => (
              <span key={i} className="chip">
                <b className="mono">{b.toString(16).toUpperCase().padStart(2, '0')}</b>
                <em className="mono">{b.toString(2).padStart(8, '0')}</em>
              </span>
            ))}
            <p className="muted small full">→ &nbsp;"{bytesToText(decodedBytes)}"</p>
          </div>
        );
      default:
        return (
          <div className="stageView__text">
            <span className="stageView__label">received</span>
            <p className="stageView__big">{recovered || '—'}</p>
            <span className={`pill ${recovered === text ? 'pill--ok' : 'pill--bad'}`}>
              {recovered === text ? 'identical to the original' : 'message corrupted'}
            </span>
          </div>
        );
    }
  };

  const progress = ((stage + 1) / total) * 100;

  return (
    <section id="transmission" className="section">
      <div className="section__head">
        <span className="eyebrow">03 · Transmission</span>
        <h2>Watch the message travel</h2>
        <p>Nine stages from keystroke to reconstructed text. Play it, pause it, or step through one block at a time.</p>
      </div>

      <div className="card card--anim">
        <div className="anim__controls">
          <button type="button" className="btn btn--primary" onClick={play} disabled={!sim || playing}>
            ▶ Play
          </button>
          <button type="button" className="btn" onClick={pause} disabled={!playing}>
            ⏸ Pause
          </button>
          <button type="button" className="btn" onClick={step} disabled={!sim}>
            ⏭ Step
          </button>
          <button type="button" className="btn btn--ghost" onClick={reset}>
            ⟲ Reset
          </button>
          <label className="speed">
            <span className="small muted">speed</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="mono small">{speed.toFixed(2)}×</span>
          </label>
          <span className="anim__stage mono small">
            stage {stage + 1}/{total}
          </span>
        </div>

        <div className="anim__track">
          <div className="anim__bar" style={{ width: `${progress}%` }} />
        </div>

        <ol className="pipeline">
          {STAGES.map((s, i) => {
            const state = i < stage ? 'done' : i === stage ? 'active' : 'idle';
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`pipe ${state === 'active' ? 'is-active' : ''} ${state === 'done' ? 'is-done' : ''}`}
                  onClick={() => {
                    setPlaying(false);
                    setStage(i);
                  }}
                  disabled={!sim && i > 1}
                >
                  <span className="pipe__icon">{s.icon}</span>
                  <span className="pipe__label">{s.label}</span>
                </button>
                {i < total - 1 && <span className={`pipe__arrow ${state === 'done' ? 'is-done' : ''}`}>↓</span>}
              </li>
            );
          })}
        </ol>

        <div className="stageView">
          <div className="stageView__head">
            <span className="stageView__no mono">{String(stage + 1).padStart(2, '0')}</span>
            <div>
              <h3>{STAGES[stage].label}</h3>
              <p className="muted small">{STAGES[stage].blurb}</p>
            </div>
          </div>
          <div className="stageView__body">{body()}</div>
        </div>
      </div>
    </section>
  );
}
