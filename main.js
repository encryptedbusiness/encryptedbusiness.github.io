import create, { meta } from "./scenes/himalaya-peaks.js";

const scene = create();
const canvas = document.getElementById("peaks");
const ctx = canvas.getContext("2d", { alpha: false });
const { cols, rows, palette, fps } = meta;
const ground = palette[Object.keys(palette)[0]];
const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let cellW = 8;
let cellH = 16;
let originX = 0;
let originY = 0;
let fontPx = 16;
let running = false;
let raf = 0;
const start = performance.now();
const frameMs = 1000 / fps;

function layout() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const aspect = 0.56;
  const scale = Math.max(canvas.width / (cols * aspect), canvas.height / rows);
  cellH = scale;
  cellW = scale * aspect;
  originX = (canvas.width - cols * cellW) / 2;
  originY = (canvas.height - rows * cellH) / 2;
  ctx.font = `100px Menlo, ui-monospace, SFMono-Regular, Consolas, monospace`;
  const adv = ctx.measureText("█").width || 60;
  fontPx = Math.max(1, (cellW / adv) * 100 * 0.98);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
}

function paint(t) {
  const frame = scene(t);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontPx}px Menlo, ui-monospace, SFMono-Regular, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let y = 0; y < rows; y++) {
    const row = frame.chars[y];
    const colors = frame.colors[y];
    const py = originY + (y + 0.5) * cellH;
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = palette[colors[x]] || ground;
      ctx.fillText(row[x], originX + (x + 0.5) * cellW, py);
    }
  }
}

function tick(now) {
  if (!running) return;
  const elapsed = now - start;
  if (elapsed - tick.last >= frameMs) {
    tick.last = elapsed;
    paint(elapsed / 1000);
  }
  raf = requestAnimationFrame(tick);
}
tick.last = 0;

function still() {
  paint(3.2);
}

function startLoop() {
  if (running) return;
  running = true;
  raf = requestAnimationFrame(tick);
}

function stopLoop() {
  running = false;
  cancelAnimationFrame(raf);
}

function applyMotion() {
  layout();
  if (reducedQuery.matches || document.hidden) {
    stopLoop();
    still();
    return;
  }
  paint((performance.now() - start) / 1000);
  startLoop();
}

window.addEventListener("resize", applyMotion);
document.addEventListener("visibilitychange", applyMotion);
reducedQuery.addEventListener("change", applyMotion);
applyMotion();
