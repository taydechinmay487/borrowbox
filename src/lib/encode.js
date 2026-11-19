// Text <-> binary (UTF-8) conversion utilities.

export function bitsFromByte(b) {
  const out = [];
  for (let k = 7; k >= 0; k--) out.push((b >> k) & 1);
  return out;
}

export function byteToBitString(b) {
  return b.toString(2).padStart(8, '0');
}

/**
 * Encode text as UTF-8 and expose both the aggregate bitstream and a
 * per-character breakdown for the UI.
 */
export function textToBits(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const chars = [];
  const bits = [];
  let offset = 0;

  for (const ch of text) {
    if (offset >= bytes.length) break;
    const cp = ch.codePointAt(0) ?? 0;
    const wanted = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
    const slice = bytes.slice(offset, Math.min(bytes.length, offset + wanted));
    const charBits = [];
    for (const b of slice) for (const bit of bitsFromByte(b)) charBits.push(bit);

    chars.push({
      char: ch,
      display: ch === ' ' ? '␠' : ch,
      codePoint: cp,
      ascii: cp < 128 ? cp : null,
      hex: slice.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
      bitString: slice.map(byteToBitString).join(' '),
      bytes: slice,
      bits: charBits,
    });

    for (const bit of charBits) bits.push(bit);
    offset += slice.length;
  }

  return { bits, chars, bytes };
}

export function bitsToBytes(bits) {
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let b = 0;
    for (let k = 0; k < 8; k++) b = (b << 1) | (bits[i + k] ? 1 : 0);
    out.push(b);
  }
  return out;
}

export function bytesToText(bytes) {
  try {
    // fatal:false -> invalid sequences become U+FFFD instead of throwing
    return new TextDecoder('utf-8', { fatal: false }).decode(Uint8Array.from(bytes));
  } catch {
    return '';
  }
}

export function bitsToText(bits) {
  return bytesToText(bitsToBytes(bits));
}

export function bytesToBitString(bytes) {
  return bytes.map(byteToBitString).join(' ');
}
