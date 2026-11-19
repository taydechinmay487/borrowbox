import { useMemo, useState } from 'react';
import Nav from './components/Nav.jsx';
import Simulator from './components/Simulator.jsx';
import Transmission from './components/Transmission.jsx';
import Comparison from './components/Comparison.jsx';
import Theory from './components/Theory.jsx';
import { textToBits } from './lib/encode.js';
import {
  MAX_CHARS,
  parseNum,
  simulate,
  suggestedAmpThreshold,
  validateConfig,
} from './lib/dsp.js';

const DEFAULTS = {
  fc: '200',
  f0: '140',
  f1: '260',
  ac: '1',
  mu: '1',
  fs: '4000',
  tb: '0.05',
};

export default function App() {
  const [text, setText] = useState('HELLO');
  const [modulation, setModulation] = useState('AM');
  const [params, setParams] = useState(DEFAULTS);
  const [noise, setNoise] = useState(0);
  const [noiseSeed, setNoiseSeed] = useState(1337);
  const [ampThreshold, setAmpThreshold] = useState('0.5');
  const [freqThreshold, setFreqThreshold] = useState('200');

  const setParam = (key, value) => {
    const next = { ...params, [key]: value };
    setParams(next);
    if (key === 'f0' || key === 'f1') {
      const a = parseNum(next.f0);
      const b = parseNum(next.f1);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        setFreqThreshold(String(Number(((a + b) / 2).toFixed(2))));
      }
    }
  };

  const encoded = useMemo(() => textToBits(text.slice(0, MAX_CHARS)), [text]);

  const parsed = useMemo(
    () => ({
      fc: parseNum(params.fc),
      f0: parseNum(params.f0),
      f1: parseNum(params.f1),
      ac: parseNum(params.ac),
      mu: parseNum(params.mu),
      fs: parseNum(params.fs),
      tb: parseNum(params.tb),
    }),
    [params]
  );

  const validation = useMemo(
    () => validateConfig(params, modulation, encoded.bits.length),
    [params, modulation, encoded.bits.length]
  );

  const ampSuggestion = useMemo(
    () => suggestedAmpThreshold(Number.isFinite(parsed.ac) ? parsed.ac : 1, parsed.mu),
    [parsed.ac, parsed.mu]
  );

  const sim = useMemo(() => {
    if (validation.errors.length > 0 || encoded.bits.length === 0) return null;
    return simulate({
      bits: encoded.bits,
      modulation,
      fc: parsed.fc,
      f0: parsed.f0,
      f1: parsed.f1,
      ac: parsed.ac,
      mu: parsed.mu,
      fs: parsed.fs,
      tb: parsed.tb,
      noise,
      noiseSeed,
      ampThreshold: parseNum(ampThreshold),
      freqThreshold: parseNum(freqThreshold),
      detect: true,
    });
  }, [
    encoded.bits,
    modulation,
    parsed,
    noise,
    noiseSeed,
    ampThreshold,
    freqThreshold,
    validation.errors.length,
  ]);

  const valid = validation.errors.length === 0 && encoded.bits.length > 0;

  return (
    <div className="app">
      <Nav />
      <main>
        <section id="overview" className="hero">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__inner">
            <span className="eyebrow">Data Communication · Mini Project</span>
            <h1>
              Text in, carrier out — <span className="grad">AM · FM · PM</span> demodulated for real.
            </h1>
            <p className="hero__lede">
              Type a message and watch it become UTF-8 bits, an NRZ waveform, a modulated carrier and — after a
              noisy channel — a reconstructed sentence. Every recovered bit is decided by measuring the actual
              received signal, not by copying the input.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#simulator">
                Open the simulator
              </a>
              <a className="btn btn--ghost" href="#theory">
                Read the theory
              </a>
            </div>
            <dl className="hero__stats">
              <div>
                <dt>Techniques</dt>
                <dd>AM · FM · PM</dd>
              </div>
              <div>
                <dt>Encoding</dt>
                <dd>UTF-8 / NRZ</dd>
              </div>
              <div>
                <dt>Receiver</dt>
                <dd>measured, not faked</dd>
              </div>
              <div>
                <dt>Backend</dt>
                <dd>none — runs locally</dd>
              </div>
            </dl>
          </div>
        </section>

        <Simulator
          text={text}
          setText={setText}
          encoded={encoded}
          modulation={modulation}
          setModulation={setModulation}
          params={params}
          setParam={setParam}
          parsed={parsed}
          validation={validation}
          noise={noise}
          setNoise={setNoise}
          noiseSeed={noiseSeed}
          rerollNoise={() => setNoiseSeed((s) => s + 7919)}
          ampThreshold={ampThreshold}
          setAmpThreshold={setAmpThreshold}
          freqThreshold={freqThreshold}
          setFreqThreshold={setFreqThreshold}
          ampSuggestion={ampSuggestion}
          sim={sim}
        />

        <Transmission
          sim={sim}
          encoded={encoded}
          text={text}
          parsed={parsed}
          modulation={modulation}
        />

        <Comparison
          bits={encoded.bits}
          parsed={parsed}
          modulation={modulation}
          canSimulate={valid}
        />

        <Theory />
      </main>

      <footer className="foot">
        <div className="foot__inner">
          <span>
            <b>ModuLab</b> — AM / FM / PM modulation &amp; demodulation simulator
          </span>
          <span className="muted small">
            React + HTML Canvas · all waveforms generated from closed-form maths and measured back by the
            receiver
          </span>
        </div>
      </footer>
    </div>
  );
}
