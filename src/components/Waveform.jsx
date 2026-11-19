import { useEffect, useMemo, useRef, useState } from 'react';

const PAD = { left: 46, right: 14, top: 26, bottom: 26 };

function fmtVal(v, digits = 2) {
  const abs = Math.abs(v);
  if (abs !== 0 && (abs < 0.01 || abs >= 10000)) return v.toExponential(2);
  return v.toFixed(digits);
}

/**
 * Generic signal plotter: grid, bit shading, bit boundaries, bit labels,
 * min/max column decimation, optional decision threshold and hover readout.
 */
export default function Waveform({
  title,
  subtitle,
  data,
  spb,
  bits,
  startBit = 0,
  viewBits = 4,
  fs = 4000,
  color = '#38bdf8',
  height = 158,
  unit = 'V',
  threshold = null,
  thresholdLabel = 'Decision threshold',
  errorBits = null,
  showBitLabels = true,
  compact = false,
  emptyMessage = 'No signal — fix the parameters to generate a waveform.',
  footer = null,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState(null);

  const errorSet = useMemo(() => {
    if (!errorBits) return null;
    return errorBits instanceof Set ? errorBits : new Set(errorBits);
  }, [errorBits]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(240, Math.round(entry.contentRect.width));
        setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
      }
    });
    ro.observe(el);
    setWidth(Math.max(240, Math.round(el.getBoundingClientRect().width)));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const w = width;
    const h = height;
    const plotLeft = PAD.left;
    const plotRight = w - PAD.right;
    const plotTop = PAD.top;
    const plotBottom = h - PAD.bottom;
    const plotW = Math.max(10, plotRight - plotLeft);
    const plotH = Math.max(10, plotBottom - plotTop);

    if (!data || !data.length) {
      ctx.fillStyle = 'rgba(139,156,192,0.75)';
      ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emptyMessage, w / 2, h / 2);
      return;
    }

    const N = data.length;
    const i0 = Math.max(0, Math.min(N - 1, Math.round(startBit * spb)));
    const i1 = Math.max(i0 + 2, Math.min(N, Math.round((startBit + viewBits) * spb)));

    // y-range: symmetric around zero, always showing the threshold
    let peak = 0;
    for (let i = i0; i < i1; i++) {
      const v = Math.abs(data[i]);
      if (v > peak) peak = v;
    }
    if (Number.isFinite(threshold)) peak = Math.max(peak, Math.abs(threshold));
    if (peak <= 1e-9) peak = 1;
    const yMax = peak * 1.18;
    const yMin = -yMax;

    const yToPx = (v) => plotBottom - ((v - yMin) / (yMax - yMin)) * plotH;
    const xAt = (idx) => plotLeft + ((idx - i0) / (i1 - i0)) * plotW;

    // --- bit shading + boundaries -----------------------------------------
    const firstBit = Math.floor(i0 / spb);
    const lastBit = Math.ceil(i1 / spb);
    const minLabelPx = compact ? 9999 : 20;

    for (let b = firstBit; b < lastBit; b++) {
      const xa = Math.max(plotLeft, xAt(b * spb));
      const xb = Math.min(plotRight, xAt((b + 1) * spb));
      if (xb <= xa) continue;
      const isErr = errorSet ? errorSet.has(b) : false;
      if (isErr) {
        ctx.fillStyle = 'rgba(248,113,113,0.13)';
        ctx.fillRect(xa, plotTop, xb - xa, plotH);
      } else if ((b - firstBit) % 2 === 0) {
        ctx.fillStyle = 'rgba(148,180,230,0.045)';
        ctx.fillRect(xa, plotTop, xb - xa, plotH);
      }
      if (b > firstBit) {
        ctx.strokeStyle = 'rgba(148,180,230,0.16)';
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa + 0.5, plotTop);
        ctx.lineTo(xa + 0.5, plotBottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (showBitLabels && xb - xa >= minLabelPx && bits) {
        ctx.fillStyle = isErr ? 'rgba(248,113,113,0.95)' : 'rgba(160,182,214,0.72)';
        ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(String(bits[b] ?? ''), (xa + xb) / 2, plotTop - 7);
      }
    }

    // --- grid --------------------------------------------------------------
    ctx.strokeStyle = 'rgba(148,180,230,0.10)';
    ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const y = plotTop + (plotH * k) / 4;
      ctx.beginPath();
      ctx.moveTo(plotLeft, Math.round(y) + 0.5);
      ctx.lineTo(plotRight, Math.round(y) + 0.5);
      ctx.stroke();
    }
    const steps = compact ? 2 : 6;
    for (let k = 0; k <= steps; k++) {
      const x = plotLeft + (plotW * k) / steps;
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, plotTop);
      ctx.lineTo(Math.round(x) + 0.5, plotBottom);
      ctx.stroke();
    }

    // --- y axis ------------------------------------------------------------
    ctx.fillStyle = 'rgba(139,156,192,0.85)';
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let k = 0; k <= 4; k++) {
      const y = plotTop + (plotH * k) / 4;
      const val = yMax - ((yMax - yMin) * k) / 4;
      ctx.fillText(fmtVal(val, Math.abs(val) < 10 ? 2 : 1), plotLeft - 7, y);
    }

    // zero line
    if (yMin < 0 && yMax > 0) {
      const y0 = yToPx(0);
      ctx.strokeStyle = 'rgba(148,180,230,0.28)';
      ctx.beginPath();
      ctx.moveTo(plotLeft, Math.round(y0) + 0.5);
      ctx.lineTo(plotRight, Math.round(y0) + 0.5);
      ctx.stroke();
    }

    // --- x axis labels -----------------------------------------------------
    ctx.fillStyle = 'rgba(139,156,192,0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let k = 0; k <= steps; k++) {
      const x = plotLeft + (plotW * k) / steps;
      const idx = i0 + ((i1 - i0) * k) / steps;
      const t = idx / fs;
      const label = t >= 1 ? `${t.toFixed(2)}s` : `${(t * 1000).toFixed(0)}ms`;
      const anchor = k === 0 ? 'left' : k === steps ? 'right' : 'center';
      ctx.textAlign = anchor;
      ctx.fillText(label, x, plotBottom + 7);
    }

    // --- threshold ---------------------------------------------------------
    if (Number.isFinite(threshold) && threshold > yMin && threshold < yMax) {
      const ty = yToPx(threshold);
      ctx.strokeStyle = 'rgba(251,191,36,0.85)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(plotLeft, ty);
      ctx.lineTo(plotRight, ty);
      ctx.stroke();
      ctx.setLineDash([]);
      if (!compact) {
        ctx.fillStyle = 'rgba(251,191,36,0.95)';
        ctx.font = '600 9px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${thresholdLabel} ${fmtVal(threshold, 2)}`, plotLeft + 5, ty - 3);
      }
    }

    // --- waveform ----------------------------------------------------------
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotLeft, plotTop - (showBitLabels ? 14 : 2), plotW, plotH + (showBitLabels ? 14 : 2));
    ctx.clip();

    const span = i1 - i0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (span <= plotW * 1.6) {
      // few enough samples: draw an honest polyline through every sample
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let i = i0; i < i1; i++) {
        const x = xAt(i);
        const y = yToPx(data[i]);
        if (i === i0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // dense: min/max envelope per pixel column keeps the shape truthful
      const cols = Math.max(1, Math.floor(plotW));
      const spp = span / cols;
      ctx.beginPath();
      for (let px = 0; px < cols; px++) {
        const a = i0 + Math.floor(px * spp);
        const b = Math.min(i1, i0 + Math.floor((px + 1) * spp));
        let mn = Infinity;
        let mx = -Infinity;
        for (let i = a; i < Math.max(b, a + 1); i++) {
          const v = data[i];
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
        if (!Number.isFinite(mn)) continue;
        const x = plotLeft + px + 0.5;
        ctx.moveTo(x, yToPx(mn));
        ctx.lineTo(x, yToPx(mx));
      }
      ctx.stroke();
    }
    ctx.restore();

    // --- plot frame --------------------------------------------------------
    ctx.strokeStyle = 'rgba(148,180,230,0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotLeft + 0.5, plotTop + 0.5, plotW, plotH);

    // unit tag
    ctx.fillStyle = 'rgba(139,156,192,0.7)';
    ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(unit, 4, 13);
  }, [
    width,
    height,
    data,
    spb,
    bits,
    startBit,
    viewBits,
    fs,
    color,
    unit,
    threshold,
    thresholdLabel,
    errorSet,
    showBitLabels,
    compact,
    emptyMessage,
  ]);

  const handleMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !data || !data.length) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const plotLeft = PAD.left;
    const plotRight = w - PAD.right;
    const x = event.clientX - rect.left;
    if (x < plotLeft || x > plotRight) {
      setHover(null);
      return;
    }
    const N = data.length;
    const i0 = Math.max(0, Math.min(N - 1, Math.round(startBit * spb)));
    const i1 = Math.max(i0 + 2, Math.min(N, Math.round((startBit + viewBits) * spb)));
    const frac = (x - plotLeft) / (plotRight - plotLeft);
    const idx = Math.min(i1 - 1, Math.max(i0, Math.round(i0 + frac * (i1 - i0))));
    const bitIndex = Math.min(bits ? bits.length - 1 : 0, Math.floor(idx / spb));
    setHover({
      x,
      y: event.clientY - rect.top,
      time: idx / fs,
      value: data[idx],
      bitIndex,
      bitValue: bits ? bits[bitIndex] : null,
    });
  };

  return (
    <figure className={`wf ${compact ? 'wf--compact' : ''}`}>
      {(title || subtitle) && (
        <figcaption className="wf__head">
          <div>
            <h4 className="wf__title">{title}</h4>
            {subtitle && <p className="wf__sub">{subtitle}</p>}
          </div>
          {footer}
        </figcaption>
      )}
      <div className="wf__canvasWrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label={title ? `${title} waveform` : 'Waveform'}
        />
        {hover && (
          <div
            className="wf__tip"
            style={{
              left: Math.min(Math.max(8, hover.x + 14), Math.max(8, width - 172)),
              top: Math.max(4, hover.y - 68),
            }}
          >
            <span>t = {(hover.time * 1000).toFixed(2)} ms</span>
            <span>y = {fmtVal(hover.value, 3)} {unit}</span>
            {hover.bitValue !== null && (
              <span>
                bit #{hover.bitIndex} → {hover.bitValue}
              </span>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}
