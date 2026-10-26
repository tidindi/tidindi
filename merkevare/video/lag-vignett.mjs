import pw from '/opt/npm-tools/node_modules/playwright/index.js'; const { chromium } = pw;
import fs from 'node:fs';
// node lag3.mjs <inn|ut> W H FELTBREDDE LUFT UTMAPPE
// Flaten følger nettstedets rutenett: PC = 4 av 12 kolonner (1200/32 px, skalert til bildebredden),
// stående = én kolonne med mobilmarger. Luften = 24 px (som Morgenbrief-boksen), skalert likt.
const [,, modus, W, H, FB, LUFT, UT] = process.argv; const w = +W, h = +H, fb = +FB, luft = +LUFT;
fs.rmSync(UT, { recursive: true, force: true }); fs.mkdirSync(UT, { recursive: true });
const html = `<style>@font-face{font-family:U;src:url(file:///home/claude/tidindi/public/fonter/unifrakturmaguntia-latin-400-normal.woff2)}
html,body{margin:0;width:${w}px;height:${h}px;background:#1C1E20;overflow:hidden}
#scene{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
#felt{width:${fb}px;box-sizing:border-box;padding:${luft}px;background:#E6FF2B;display:flex;align-items:center;justify-content:center}
#ord{font-family:U;line-height:1;white-space:nowrap;color:#1C1E20}
#T,#rest{display:inline-block}
#merke{border-radius:50%;background:#1C1E20;color:#E6FF2B;display:flex;align-items:center;justify-content:center;font-family:U;line-height:1}</style>
<div id=scene><div id=felt><div id=ord><span id=T>T</span><span id=rest>idindi</span></div></div></div>`;
fs.writeFileSync(UT + '/scene.html', html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('file://' + UT + '/scene.html'); await p.evaluate(() => document.fonts.ready);
// Tilpass ordmerket til flatens innerbredde, og lås flatens høyde (samme flate i vignett og sluttmerke).
await p.evaluate(([fb, luft, modus]) => {
  const ord = document.getElementById('ord'); ord.style.fontSize = '100px';
  const fs = 100 * (fb - 2 * luft) / ord.getBoundingClientRect().width;
  ord.style.fontSize = fs + 'px';
  const felt = document.getElementById('felt'); felt.style.height = felt.getBoundingClientRect().height + 'px';
  if (modus === 'ut') {
    const d = Math.round(fs * 0.62);
    felt.innerHTML = `<div id=merke style="width:${d}px;height:${d}px;font-size:${Math.round(d * 0.74)}px"><span style="transform:translateY(${Math.round(d * 0.03)}px)">T</span></div>`;
  }
}, [fb, luft, modus]);
const fps = 30, varighet = modus === 'inn' ? 1.3 : 2.0, n = Math.round(fps * varighet);
for (let i = 0; i < n; i++) {
  const t = i / fps * 1000;
  await p.evaluate(([t, modus]) => {
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const felt = document.getElementById('felt'), f = ease(t / 220);
    felt.style.opacity = f; felt.style.transform = `scale(${0.96 + 0.04 * f})`;
    if (modus === 'inn') {
      const T = document.getElementById('T'), rest = document.getElementById('rest'), ord = document.getElementById('ord');
      const forskyv = (ord.getBoundingClientRect().width / (0.96 + 0.04 * f) - T.getBoundingClientRect().width / (0.96 + 0.04 * f)) / 2;
      const a = ease((t - 140) / 320), s = ease((t - 470) / 400);
      T.style.opacity = a; T.style.transform = `translateX(${forskyv * (1 - s)}px)`;
      rest.style.clipPath = `inset(0 ${100 * (1 - s)}% 0 0)`; rest.style.transform = `translateX(${forskyv * (1 - s)}px)`;
    } else {
      const m = ease((t - 120) / 260), mk = document.getElementById('merke');
      mk.style.opacity = m; mk.style.transform = `scale(${0.6 + 0.4 * m})`;
    }
  }, [t, modus]);
  await p.screenshot({ path: `${UT}/f${String(i).padStart(3, '0')}.png` });
}
await b.close(); console.log(modus, w + 'x' + h, n, 'bilder');
