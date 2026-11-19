export const MODULATION_ORDER = ['AM', 'FM', 'PM'];

export const MODULATIONS = {
  AM: {
    key: 'AM',
    short: 'AM',
    name: 'Amplitude Modulation',
    variant: 'ASK / OOK',
    digitalName: 'Amplitude Shift Keying (On-Off Keying)',
    property: 'Amplitude',
    color: '#38bdf8',
    equation: 's(t) = Ac [ 1 + \u03bc m(t) ] \u00b7 cos(2\u03c0Fc t)',
    digitalEquation: '1 \u2192 A\u2081 cos(2\u03c0Fc t)\u2003\u2003 0 \u2192 A\u2080 cos(2\u03c0Fc t)',
    mapping: [
      { bit: '1', value: 'Carrier at full amplitude A\u2081 = Ac' },
      { bit: '0', value: 'Carrier at low / zero amplitude A\u2080' },
    ],
    blurb:
      'The carrier amplitude follows the message. With \u03bc = 1 the low level collapses to zero and you get On-Off Keying; with \u03bc < 1 the two levels stay above zero and you get conventional two-level ASK.',
    receiver: 'Envelope power per bit (RMS \u00d7 \u221a2) against an amplitude threshold.',
    detection: 'Measured amplitude > threshold \u2192 1, otherwise 0.',
  },
  FM: {
    key: 'FM',
    short: 'FM',
    name: 'Frequency Modulation',
    variant: 'BFSK',
    digitalName: 'Binary Frequency Shift Keying',
    property: 'Frequency',
    color: '#a855f7',
    equation: 's(t) = Ac cos( 2\u03c0 [ Fc t + \u0394f \u222b m(\u03c4) d\u03c4 ] )',
    digitalEquation: '1 \u2192 Ac cos(2\u03c0F\u2081t)\u2003\u2003 0 \u2192 Ac cos(2\u03c0F\u2080t)',
    mapping: [
      { bit: '1', value: 'Tone at the higher frequency F\u2081' },
      { bit: '0', value: 'Tone at the lower frequency F\u2080' },
    ],
    blurb:
      'The carrier frequency is shifted between two tones while the amplitude stays constant. This build integrates phase continuously, so the waveform never jumps at a bit boundary (continuous-phase BFSK).',
    receiver: 'Per-bit spectral estimate (Goertzel filter bank) against the midpoint threshold.',
    detection: 'Estimated frequency > (F\u2080 + F\u2081)/2 \u2192 1, otherwise 0.',
  },
  PM: {
    key: 'PM',
    short: 'PM',
    name: 'Phase Modulation',
    variant: 'BPSK',
    digitalName: 'Binary Phase Shift Keying',
    property: 'Phase',
    color: '#34d399',
    equation: 's(t) = Ac cos(2\u03c0Fc t + \u03c6)',
    digitalEquation: '1 \u2192 \u03c6 = 180\u00b0\u2003\u2003 0 \u2192 \u03c6 = 0\u00b0',
    mapping: [
      { bit: '1', value: 'Carrier inverted (180\u00b0 phase)' },
      { bit: '0', value: 'Carrier in phase (0\u00b0 phase)' },
    ],
    blurb:
      'Amplitude and frequency stay fixed; only the phase of the carrier flips. A 180\u00b0 shift is a sign inversion, so the wave looks mirrored at every 0 \u2192 1 or 1 \u2192 0 transition.',
    receiver: 'In-phase / quadrature correlation against a reference carrier each bit.',
    detection: '|phase| > 90\u00b0 \u2192 1, otherwise 0.',
  },
};

export const COMPARISON_ROWS = [
  {
    feature: 'Changed property',
    AM: 'Amplitude',
    FM: 'Frequency',
    PM: 'Phase',
  },
  {
    feature: 'Amplitude of carrier',
    AM: 'Variable (two levels / on-off)',
    FM: 'Constant',
    PM: 'Constant',
  },
  {
    feature: 'Frequency',
    AM: 'Constant carrier Fc',
    FM: 'Two frequencies F\u2080 and F\u2081',
    PM: 'Constant carrier Fc',
  },
  {
    feature: 'Phase',
    AM: 'Constant',
    FM: 'Usually continuous phase in continuous-phase BFSK; otherwise depends on implementation',
    PM: '0\u00b0 or 180\u00b0 per bit',
  },
  {
    feature: 'Binary representation',
    AM: 'Two amplitudes',
    FM: 'Two frequencies',
    PM: 'Two phases',
  },
];
