'use strict';
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const field = document.querySelector('#field');
const scoreLabel = document.querySelector('#score');
const bestLabel = document.querySelector('#best');
const livesLabel = document.querySelector('#lives');
const overlay = document.querySelector('#overlay');
let width = 1, height = 1, basketX = .5, balls = [], score = 0, lives = 3;
let running = false, lastTime = 0, spawnTime = 0, best = 0;
const held = new Set();
try { best = Number(localStorage.getItem('sorairo-best')) || 0; } catch {}
bestLabel.textContent = best;
function resize() {
  width = field.clientWidth; height = field.clientHeight;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
new ResizeObserver(resize).observe(field);
function moveTo(clientX) {
  const rect = canvas.getBoundingClientRect();
  basketX = Math.max(42 / width, Math.min(1 - 42 / width, (clientX - rect.left) / width));
}
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); moveTo(e.clientX); });
canvas.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') moveTo(e.clientX); });
for (const [id, direction] of [['left', 'ArrowLeft'], ['right', 'ArrowRight']]) {
  const button = document.getElementById(id);
  button.addEventListener('pointerdown', e => { button.setPointerCapture(e.pointerId); held.add(direction); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => held.delete(direction));
}
window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight'].includes(e.key) && running) { e.preventDefault(); held.add(e.key); }
});
window.addEventListener('keyup', e => held.delete(e.key));
window.addEventListener('blur', () => held.clear());
document.addEventListener('visibilitychange', () => { lastTime = 0; held.clear(); });
function updateLabels() { scoreLabel.textContent = score; livesLabel.textContent = '♥ '.repeat(lives).trim() || '—'; }
function finish() {
  running = false; held.clear();
  best = Math.max(best, score); bestLabel.textContent = best;
  try { localStorage.setItem('sorairo-best', String(best)); } catch {}
  document.querySelector('#title').textContent = 'ナイスキャッチ！';
  document.querySelector('#message').textContent = `${score}個キャッチできました。もう一度チャレンジしよう！`;
  document.querySelector('#start').innerHTML = 'もういちど <span>→</span>';
  overlay.hidden = false;
  document.querySelector('#start').focus();
}
document.querySelector('#start').addEventListener('click', () => {
  balls = []; score = 0; lives = 3; basketX = .5; spawnTime = .45; lastTime = 0;
  held.clear(); running = true; overlay.hidden = true; updateLabels();
});
function cloud(x, y, scale) {
  ctx.fillStyle = '#ffffff99'; ctx.beginPath();
  ctx.ellipse(x, y, 34 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 10 * scale, y - 7 * scale, 15 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 9 * scale, y - 11 * scale, 17 * scale, 16 * scale, 0, 0, Math.PI * 2); ctx.fill();
}
function draw() {
  ctx.clearRect(0, 0, width, height);
  cloud(width * .18, 65, 1); cloud(width * .83, 120, .8);
  ctx.fillStyle = '#d6e6d6'; ctx.beginPath(); ctx.ellipse(width * .5, height + 55, width * .8, 100, 0, 0, Math.PI * 2); ctx.fill();
  for (const ball of balls) {
    ctx.fillStyle = ball.color; ctx.beginPath(); ctx.arc(ball.x * width, ball.y * height, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff70'; ctx.beginPath(); ctx.arc(ball.x * width - 4, ball.y * height - 4, 4, 0, Math.PI * 2); ctx.fill();
  }
  const x = basketX * width, y = height - 58;
  ctx.fillStyle = '#284f4512'; ctx.beginPath(); ctx.ellipse(x, y + 30, 40, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ac7549'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y + 1, 23, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#d6a769'; ctx.beginPath(); ctx.moveTo(x - 36, y); ctx.lineTo(x + 36, y); ctx.lineTo(x + 27, y + 29); ctx.quadraticCurveTo(x, y + 35, x - 27, y + 29); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#b2834d'; ctx.lineWidth = 2;
  for (let i = -20; i <= 20; i += 10) { ctx.beginPath(); ctx.moveTo(x + i, y + 4); ctx.lineTo(x + i * .8, y + 29); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - 31, y + 12); ctx.lineTo(x + 31, y + 12); ctx.moveTo(x - 29, y + 22); ctx.lineTo(x + 29, y + 22); ctx.stroke();
  ctx.fillStyle = '#edc68e'; ctx.fillRect(x - 38, y - 3, 76, 7);
}
function frame(time) {
  const dt = lastTime ? Math.min((time - lastTime) / 1000, .04) : 0; lastTime = time;
  if (running && !document.hidden) {
    basketX += ((held.has('ArrowRight') ? 1 : 0) - (held.has('ArrowLeft') ? 1 : 0)) * dt * .95;
    basketX = Math.max(42 / width, Math.min(1 - 42 / width, basketX));
    spawnTime -= dt;
    if (spawnTime <= 0) {
      balls.push({ x: .06 + Math.random() * .88, y: -15 / height, color: ['#e99a77', '#e4be59', '#85b7a6', '#91acc9'][Math.floor(Math.random() * 4)] });
      spawnTime = Math.max(.48, 1.05 - score * .013);
    }
    const catchY = (height - 58) / height;
    for (const ball of balls) {
      const previous = ball.y;
      ball.y += dt * (135 + Math.min(score * 4, 170)) / height;
      if (previous <= catchY && ball.y >= catchY && Math.abs((ball.x - basketX) * width) <= 37) {
        ball.done = true; score++; updateLabels();
      } else if (ball.y * height > height + 12) {
        ball.done = true; lives--; updateLabels();
        if (lives === 0) { finish(); break; }
      }
    }
    balls = balls.filter(ball => !ball.done);
  }
  draw(); requestAnimationFrame(frame);
}
resize(); requestAnimationFrame(frame);
