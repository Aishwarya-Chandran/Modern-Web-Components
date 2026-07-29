
export const PATH_SETTINGS = {

  
  spacing: 190,
  loopSize: 34,
  heartSize: 24,
  miniHeartSize: 13,     
  curveAmount: 50,
  margin: 90,
  baseY: 130,
  height: 260,
  jitter: 6,
  customPath: null,       
  customViewBox: null     
};


export function wobble(seed, amount) {
  return (Math.sin(seed * 12.9898) * 43758.5453 % 1) * amount;
}

export function waveSegment(fromX, fromY, toX, toY, curveAmount, jitterVal) {
  const dx = toX - fromX;
  const cp1x = fromX + dx * 0.33, cp1y = fromY - curveAmount + jitterVal;
  const cp2x = fromX + dx * 0.66, cp2y = fromY + curveAmount - jitterVal;
  return ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`;
}


export function heartStitch(cx, cy, size) {
  return ` C ${cx - size} ${cy - size * 1.3}, ${cx - size * 1.8} ${cy + size * 0.4}, ${cx} ${cy + size * 1.3}` +
         ` C ${cx + size * 1.8} ${cy + size * 0.4}, ${cx + size} ${cy - size * 1.3}, ${cx} ${cy}`;
}


export function gapWithHearts(fromX, fromY, toX, toY, cfg, seed) {
  const showHeart = Math.abs(wobble(seed + 50, 1)) > 0.22;
  if (!showHeart) {
    return waveSegment(fromX, fromY, toX, toY, cfg.curveAmount, wobble(seed, cfg.jitter));
  }
  const tPos = 0.4 + wobble(seed + 20, 0.18);           
  const midX = fromX + (toX - fromX) * tPos;
  const size = cfg.miniHeartSize * (0.65 + Math.abs(wobble(seed + 30, 1)) * 0.9); 
  let d = waveSegment(fromX, fromY, midX, cfg.baseY, cfg.curveAmount * 0.55, wobble(seed, cfg.jitter));
  d += heartStitch(midX, cfg.baseY, size);
  d += waveSegment(midX, cfg.baseY, toX, toY, cfg.curveAmount * 0.55, wobble(seed + 5, cfg.jitter) * -1);
  return d;
}


export function reversePathD(d) {
  const num = (s) => parseFloat(s);
  const mMatch = d.match(/M\s*([-\d.]+)\s+([-\d.]+)/);
  const start = { x: num(mMatch[1]), y: num(mMatch[2]) };

  const cRegex = /C\s*([-\d.]+)\s+([-\d.]+),\s*([-\d.]+)\s+([-\d.]+),\s*([-\d.]+)\s+([-\d.]+)/g;
  const segments = [];
  let m;
  while ((m = cRegex.exec(d)) !== null) {
    segments.push({
      cp1: { x: num(m[1]), y: num(m[2]) },
      cp2: { x: num(m[3]), y: num(m[4]) },
      end: { x: num(m[5]), y: num(m[6]) }
    });
  }

  const points = [start, ...segments.map(s => s.end)];
  const n = segments.length;
  let out = `M ${points[n].x} ${points[n].y}`;
  for (let i = n - 1; i >= 0; i--) {
    const seg = segments[i];
    const target = points[i];
    out += ` C ${seg.cp2.x} ${seg.cp2.y}, ${seg.cp1.x} ${seg.cp1.y}, ${target.x} ${target.y}`;
  }
  return out;
}


export function buildThreadPath(cfg, icons, dir) {
  const { spacing, loopSize, heartSize, margin, baseY } = cfg;
  const width = margin * 2 + spacing * (icons.length - 1) + 40;
  const rtl = dir !== 'ltr';

  
  const xAt = (i) => rtl ? (width - margin - i * spacing) : (margin + i * spacing);
  const startX = rtl ? width - 20 : 20;
  const endX   = rtl ? 20 : width - 20;

  let x = startX;
  let d = `M ${x} ${baseY}`;
  const anchors = [];


  d += gapWithHearts(x, baseY, xAt(0), baseY, cfg, 1);
  x = xAt(0);

  icons.forEach((icon, i) => {
    const cx = xAt(i);

  
    if (i > 0) {
      d += gapWithHearts(x, baseY, cx, baseY, cfg, i + 10);
    }

    if (icon.type === 'heart') {
      const s = heartSize;
      d += heartStitch(cx, baseY, s);
      anchors.push({ x: cx, y: baseY + s * 0.35 });
    } else {
      const r = loopSize;
      const j = wobble(i, cfg.jitter);
      d += ` C ${cx - r} ${baseY - r * 1.7 + j}, ${cx + r * 1.3} ${baseY - r * 1.6 - j}, ${cx + r * 0.15} ${baseY - r * 0.1}`;
      d += ` C ${cx - r * 1.2} ${baseY + r * 1.35}, ${cx + r} ${baseY + r * 1.4}, ${cx} ${baseY}`;
      anchors.push({ x: cx, y: baseY });
    }

    x = cx;
  });


  d += gapWithHearts(x, baseY, endX, baseY, cfg, 99);
  const knotDir = rtl ? -1 : 1;
  d += ` C ${endX - knotDir * 6} ${baseY - 9}, ${endX + knotDir * 8} ${baseY - 9}, ${endX + knotDir * 2} ${baseY}`;

  return { d, anchors, width, height: cfg.height };
}


export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}