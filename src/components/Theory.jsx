const CARDS = [
  {
    title: 'What is modulation?',
    body: 'Modulation is the process of changing one property of a high-frequency carrier wave — its amplitude, frequency or phase — in proportion to a low-frequency message signal. The message itself (your voice, or in this project a stream of bits) cannot be sent efficiently on its own; the carrier is the vehicle that carries it.',
  },
  {
    title: 'Why is it required?',
    body: '1) Antennas need to be comparable in size to a wavelength; a 1 kHz baseband signal would need a 75 km antenna. 2) Many users must share one medium, so each is given a different carrier frequency (frequency-division multiplexing). 3) Modulation moves the signal into a band where the channel actually works and improves noise immunity.',
  },
  {
    title: 'Carrier signal',
    body: 'A carrier is a pure sinusoid c(t) = Ac cos(2πFct) generated at the transmitter. It carries no information by itself — it only becomes information-bearing once the message modifies it. Fc is far higher than the message bandwidth.',
  },
  {
    title: 'Message signal m(t)',
    body: 'The information that must travel. Here the message is a binary NRZ waveform: each bit lasts Tb seconds, and is transmitted as +A (bit 1) or −A (bit 0). Normalised, this is m(t) ∈ {−1, +1}.',
  },
  {
    title: 'Amplitude modulation',
    body: 's(t) = Ac[1 + μ m(t)] cos(2πFct). The envelope of the carrier follows the message; μ is the modulation index and must stay ≤ 1 to avoid over-modulation (phase inversion of the envelope). For digital data the same idea is Amplitude Shift Keying, and with μ = 1 the low level disappears entirely: On-Off Keying.',
  },
  {
    title: 'Frequency modulation',
    body: 's(t) = Ac cos(2π[Fct + Δf ∫m(τ)dτ]). The instantaneous frequency shifts with the message while the amplitude stays constant: the carrier is "wobbled" faster or slower. The digital form is BFSK — bit 0 uses tone F0 and bit 1 uses tone F1. Continuous-phase BFSK integrates the phase so the waveform never jumps at a bit boundary.',
  },
  {
    title: 'Phase modulation',
    body: 's(t) = Ac cos(2πFct + φ(t)). The phase of the carrier is set by the message while amplitude and frequency are untouched. Its digital form is BPSK: bit 0 at 0° and bit 1 at 180°, which is exactly a sign inversion of the carrier.',
  },
  {
    title: 'Analogue vs digital modulation',
    body: 'In analogue modulation the message is continuous (voice, video) and the carrier property varies smoothly. In digital modulation, or keying, the message is a finite set of symbols — here two bits — so the carrier property switches between a fixed set of states. ASK, FSK and PSK are the digital counterparts of AM, FM and PM, which is why this project can demonstrate both ideas at once.',
  },
];

const STEPS = [
  ['Demodulation', 'Recovering the message from the received waveform. It is the inverse of modulation, and in every case it means measuring the carrier property that was changed and deciding which symbol it represents.'],
  ['AM / ASK receiver', 'The envelope is squared and averaged over one bit (RMS), giving the peak amplitude. Compare it with a threshold placed between the two levels: above → 1, below → 0.'],
  ['FM / BFSK receiver', 'Inside each bit interval the receiver runs a bank of narrowband filters (Goertzel) and finds the strongest frequency. Compare it with (F0 + F1)/2: above → 1, below → 0.'],
  ['PM / BPSK receiver', 'Multiply the received bit by the reference carrier in phase (I) and in quadrature (Q), integrate, then take φ = atan2(−Q, I). Phase magnitude above 90° means the carrier was inverted → 1.'],
  ['Why the receiver must measure', 'The receiver never sees the transmitted bit list. It only sees samples of a noisy channel waveform, so every decision here is derived from the actual signal — which is why noise produces real, visible bit errors rather than a simulated counter.'],
];

export default function Theory() {
  return (
    <section id="theory" className="section">
      <div className="section__head">
        <span className="eyebrow">05 · Theory</span>
        <h2>The engineering behind the dashboard</h2>
        <p>Short, exam-ready explanations of every block in the chain above.</p>
      </div>

      <div className="theory__grid">
        {CARDS.map((c) => (
          <article key={c.title} className="card card--theory">
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </article>
        ))}
      </div>

      <div className="card card--eqns">
        <h3>Equations used by the simulator</h3>
        <div className="eqnRow">
          <div className="eqn">
            <span className="eqn__k">AM / ASK</span>
            <span className="eqn__v">
              s(t) = A<sub>c</sub>[1 + μ m(t)] · cos(2πF<sub>c</sub>t)
            </span>
            <span className="eqn__n">OOK when μ = 1 → A<sub>0</sub> = 0</span>
          </div>
          <div className="eqn">
            <span className="eqn__k">FM / BFSK</span>
            <span className="eqn__v">
              s(t) = A<sub>c</sub> · cos(2πf<sub>i</sub>t), f<sub>i</sub> ∈ {'{F'}<sub>0</sub>{', F'}<sub>1</sub>{'}'}
            </span>
            <span className="eqn__n">constant envelope, phase-continuous</span>
          </div>
          <div className="eqn">
            <span className="eqn__k">PM / BPSK</span>
            <span className="eqn__v">
              s(t) = A<sub>c</sub> · cos(2πF<sub>c</sub>t + φ), φ ∈ {'{0, π}'}
            </span>
            <span className="eqn__n">sign inversion at every 0↔1</span>
          </div>
        </div>

        <div className="eqnRow eqnRow--recv">
          <div className="eqn">
            <span className="eqn__k">ASK detector</span>
            <span className="eqn__v">Â = √2·√( (1/Tb)∫ r²(t) dt )</span>
            <span className="eqn__n">Â &gt; Vth → 1</span>
          </div>
          <div className="eqn">
            <span className="eqn__k">BFSK detector</span>
            <span className="eqn__v">f̂ = argmax<sub>f</sub> |Σ r(t)·w(t)·e<sup>−j2πft</sup>|</span>
            <span className="eqn__n">
              f̂ &gt; (F<sub>0</sub>+F<sub>1</sub>)/2 → 1
            </span>
          </div>
          <div className="eqn">
            <span className="eqn__k">BPSK detector</span>
            <span className="eqn__v">φ̂ = atan2(−Q, I), I = ∫r·cos, Q = ∫r·sin</span>
            <span className="eqn__n">|φ̂| &gt; 90° → 1</span>
          </div>
        </div>
      </div>

      <div className="theory__steps">
        {STEPS.map(([title, body], i) => (
          <div key={title} className="card card--step">
            <span className="card__index">{String(i + 1).padStart(2, '0')}</span>
            <h4>{title}</h4>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
