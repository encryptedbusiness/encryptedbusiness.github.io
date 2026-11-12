export const TAU = Math.PI * 2;

export const KEYS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function clamp(v, lo = 0, hi = 1) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hash2(ix, iy, seed) {
  let n = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function noise2(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const s = seed | 0;
  const v00 = hash2(x0, y0, s);
  const v10 = hash2(x0 + 1, y0, s);
  const v01 = hash2(x0, y0 + 1, s);
  const v11 = hash2(x0 + 1, y0 + 1, s);
  const a = v00 + (v10 - v00) * sx;
  const b = v01 + (v11 - v01) * sx;
  return a + (b - a) * sy;
}

export function fbm(x, y, octaves, seed) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  let sum = 0;
  const n = octaves | 0;
  for (let i = 0; i < n; i++) {
    v += a * noise2(x * f, y * f, (seed + i) | 0);
    sum += a;
    a *= 0.5;
    f *= 2;
  }
  return sum > 0 ? v / sum : 0;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(c) {
  return "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
}

export function gradient(stops, count) {
  const cs = stops.map(hexToRgb);
  const out = [];
  const n = count | 0;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (i / (n - 1)) * (cs.length - 1);
    const k = Math.min(cs.length - 2, Math.floor(t));
    const f = cs.length === 1 ? 0 : t - k;
    const a = cs[k];
    const b = cs[Math.min(cs.length - 1, k + 1)];
    out.push(rgbToHex([
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f,
      a[2] + (b[2] - a[2]) * f,
    ]));
  }
  return out;
}

export function palette(hexes) {
  const out = {};
  for (let i = 0; i < hexes.length; i++) {
    if (!KEYS[i]) throw new Error("palette exceeds KEYS");
    out[KEYS[i]] = hexes[i];
  }
  return out;
}

export class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.chars = Array.from({ length: rows }, () => Array(cols).fill(" "));
    this.colors = Array.from({ length: rows }, () => Array(cols).fill(KEYS[0]));
  }

  clear() {
    for (let y = 0; y < this.rows; y++) {
      this.chars[y].fill(" ");
      this.colors[y].fill(KEYS[0]);
    }
  }

  set(x, y, ch, color) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.cols || iy >= this.rows) return;
    this.chars[iy][ix] = ch;
    this.colors[iy][ix] = color;
  }

  frame() {
    return { chars: this.chars, colors: this.colors, cols: this.cols, rows: this.rows };
  }
}
