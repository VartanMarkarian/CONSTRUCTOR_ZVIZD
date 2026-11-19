/* ===== Креативна область мислення — main.js (v3: світла + темна теми) ===== */
(() => {
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const isDark = () => root.getAttribute('data-theme') === 'dark';

/* ---------- МОВА: українська (основна) / англійська ---------- */
const EN = window.KOM_EN || {};
let LANG = (() => { try { return localStorage.getItem('kom-lang') === 'en' ? 'en' : 'uk'; } catch (e) { return 'uk'; } })();
const isEn = () => LANG === 'en';
const tr = s => (isEn() && EN[s]) ? EN[s] : s;
const fixEn = h => h.split(' — фото ').join(' — photo ').split(' — відтворити відео').join(' — play video').split('Дивитися на YouTube ↗').join('Watch on YouTube ↗');
const L = (p, k) => (isEn() && p.en && p.en[k] !== undefined) ? (k === 'body' ? fixEn(p.en[k]) : p.en[k]) : p[k];

/* ---------- NAV ---------- */
const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30), { passive: true });
burger.addEventListener('click', () => {
  const o = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', o); links.classList.toggle('open', o);
});
$$('a', links).forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', false); links.classList.remove('open'); }));
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$('a', links).forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['about', 'directions', 'projects', 'post', 'education', 'partners', 'contacts'].forEach(id => { const el = document.getElementById(id); if (el) secObs.observe(el); });

/* =========================================================
   HERO — два світи:
   світла тема → мережа людей, місць та ідей
   темна тема  → туманність частинок
   ========================================================= */
const cv = $('#field'), ctx = cv.getContext('2d');
const lc = document.createElement('canvas'); lc.id = 'fieldLabels'; lc.setAttribute('aria-hidden', 'true'); cv.after(lc);
const lx = lc.getContext('2d');
const words = ['Полтава', 'Кременчук', 'Україна', 'світ', 'митці', 'спільнота', 'пам\'ять', 'місто', 'VR', 'діалог', 'ідея', 'архів'];
let W = 0, H = 0, dpr = 1, t = 0, mode = null;
const mouse = { x: -9999, y: -9999, on: false };

/* --- світла: мережа --- */
let nodes = [];
function initNet() {
  const n = Math.round(Math.min(90, (W * H) / 16000));
  nodes = Array.from({ length: n }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
    r: Math.random() * 2.2 + 1.4, label: i < words.length ? tr(words[i]) : null, hot: i % 9 === 0
  }));
}
function drawNet() {
  ctx.clearRect(0, 0, W, H);
  const maxD = Math.min(170, W / 7);
  for (const p of nodes) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    if (mouse.on) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy) + .01;
      if (d < 140) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
    }
  }
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < maxD) {
      const hot = a.hot || b.hot;
      ctx.strokeStyle = hot ? `rgba(255,77,28,${(1 - d / maxD) * .7})` : `rgba(17,17,17,${(1 - d / maxD) * .22})`;
      ctx.lineWidth = hot ? 1.2 : 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }
  ctx.font = '600 12px "Google Sans Flex", system-ui, sans-serif';
  for (const p of nodes) {
    if (mouse.on) {
      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 220) { ctx.strokeStyle = `rgba(255,77,28,${(1 - md / 220) * .8})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    ctx.fillStyle = p.hot ? '#FF4D1C' : '#111';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.hot ? p.r + 1.5 : p.r, 0, 7); ctx.fill();
    if (p.label) { ctx.fillStyle = 'rgba(17,17,17,.55)'; ctx.fillText(p.label, p.x + 8, p.y - 6); }
  }
}

/* --- темна: туманність --- */
const PAL = [[255, 62, 165], [255, 198, 92], [45, 224, 200], [155, 107, 255]];
const sprites = PAL.map(([r, g, b]) => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},.9)`); gr.addColorStop(.25, `rgba(${r},${g},${b},.35)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return c;
});
const anchors = PAL.map((_, i) => ({ i, ph: i * 1.7 }));
let parts = [], orbs = [], labels = [];
function anchorPos(a) {
  const k = t * .00025 + a.ph;
  return { x: W * (.5 + .32 * Math.cos(k * 1.3 + a.i) * (a.i % 2 ? 1 : -1)), y: H * (.5 + .28 * Math.sin(k * 1.7 + a.i * 2)) };
}
function initNebula() {
  const n = Math.round(Math.min(2600, Math.max(700, (W * H) / 420)));
  parts = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, g: Math.floor(Math.random() * PAL.length),
    s: Math.random() * 1.6 + .4, a: Math.random() * .6 + .25, sp: Math.random() * .6 + .4
  }));
  orbs = Array.from({ length: 22 }, () => ({ p: parts[Math.floor(Math.random() * parts.length)], r: Math.random() * 26 + 10 }));
  labels = words.map((w, i) => ({ w: tr(w), p: parts[(i * 97) % parts.length] }));
  ctx.fillStyle = '#030208'; ctx.fillRect(0, 0, W, H);
}
function flow(x, y) {
  const s = .0022, k = t * .00018;
  return Math.sin(x * s + Math.cos(y * s * 1.3 + k) * 1.8 + k) * Math.PI + Math.cos(y * s * .7 - k * 1.4) * 1.2;
}
function drawNebula() {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(3,2,8,.16)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  const A = anchors.map(anchorPos);
  for (const p of parts) {
    const ang = flow(p.x, p.y), a = A[p.g];
    let ax = Math.cos(ang) * .12 * p.sp, ay = Math.sin(ang) * .12 * p.sp;
    const dx = a.x - p.x, dy = a.y - p.y, d = Math.hypot(dx, dy) + 1;
    ax += dx / d * Math.min(.09, d * .0002); ay += dy / d * Math.min(.09, d * .0002);
    if (mouse.on) {
      const mx = p.x - mouse.x, my = p.y - mouse.y, md = Math.hypot(mx, my) + 1;
      if (md < 180) { const f = (1 - md / 180) * .9; ax += (mx / md) * f - (my / md) * f * .8; ay += (my / md) * f + (mx / md) * f * .8; }
    }
    p.vx = (p.vx + ax) * .95; p.vy = (p.vy + ay) * .95;
    p.x += p.vx; p.y += p.vy;
    if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
    if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    const [r, g, b] = PAL[p.g];
    ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`;
    ctx.fillRect(p.x, p.y, p.s, p.s);
  }
  for (const o of orbs) {
    const R = o.r * (.65 + .35 * Math.sin(t * .002 + o.r));
    ctx.globalAlpha = .55; ctx.drawImage(sprites[o.p.g], o.p.x - R, o.p.y - R, R * 2, R * 2);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  lx.clearRect(0, 0, W, H);
  lx.font = '500 10.5px "IBM Plex Mono", ui-monospace, monospace';
  for (const l of labels) {
    const [r, g, b] = PAL[l.p.g];
    lx.fillStyle = `rgba(${r},${g},${b},.95)`; lx.fillRect(l.p.x - 2, l.p.y - 2, 4, 4);
    lx.strokeStyle = `rgba(${r},${g},${b},.35)`; lx.beginPath(); lx.moveTo(l.p.x + 3, l.p.y - 3); lx.lineTo(l.p.x + 12, l.p.y - 10); lx.stroke();
    lx.fillStyle = 'rgba(236,232,245,.7)'; lx.fillText(l.w.toUpperCase(), l.p.x + 15, l.p.y - 10);
  }
}

/* --- спільний цикл --- */
function sizeCanvas() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = lc.width = W * dpr; cv.height = lc.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); lx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function initField() {
  sizeCanvas();
  mode = isDark() ? 'nebula' : 'net';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, W, H); lx.clearRect(0, 0, W, H);
  if (mode === 'nebula') initNebula(); else initNet();
}
let heroVisible = true, drawing = false;
function frame() {
  t += 16;
  if (mode === 'nebula') drawNebula(); else drawNet();
  if (!reduce && heroVisible) requestAnimationFrame(frame); else drawing = false;
}
function start() { if (!drawing) { drawing = true; requestAnimationFrame(frame); } }
function renderStatic() { for (let i = 0; i < (mode === 'nebula' ? 140 : 1); i++) { t += 16; mode === 'nebula' ? drawNebula() : drawNet(); } }
initField();
if (reduce) renderStatic(); else start();
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; if (heroVisible && !reduce) start(); }).observe(cv);
addEventListener('resize', () => { if (Math.abs(cv.clientWidth - W) > 40 || Math.abs(cv.clientHeight - H) > 120) { initField(); if (reduce) renderStatic(); } });
cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
cv.parentElement.addEventListener('pointerleave', () => { mouse.on = false; });

/* світло за курсором (темна тема) */
const glow = $('#cursorGlow');
if (glow && !reduce) addEventListener('pointermove', e => { glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });

/* ---------- REVEAL ---------- */
const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { threshold: .12 });
$$('.reveal').forEach(el => rev.observe(el));

/* ---------- COUNTERS ---------- */
const cnt = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cnt.unobserve(e.target);
  const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
  if (reduce || to === 2019) return;
  const t0 = performance.now();
  (function step(now) { const k = Math.min(1, (now - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
}), { threshold: .6 });
$$('[data-count]').forEach(el => cnt.observe(el));

/* =========================================================
   ПРОЄКТИ — тексти з документа «Креативна область мислення»
   ========================================================= */
const STAR_PTS = '50.0,2.0 57.7,31.5 83.9,16.1 68.5,42.3 98.0,50.0 68.5,57.7 83.9,83.9 57.7,68.5 50.0,98.0 42.3,68.5 16.1,83.9 31.5,57.7 2.0,50.0 31.5,42.3 16.1,16.1 42.3,31.5';
const starsBg = Array.from({ length: 26 }, () => `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%"></i>`).join('');
const ART = {
  post: () => `<div class="art art-post"><div class="ob"></div><div class="pd"></div><span class="lbl">POST</span></div>`,
  hoda: () => {
    const d = isDark();
    return `<div class="art art-star">${starsBg}<svg viewBox="0 0 100 100"><polygon fill="${d ? '#FFC65C' : '#E8A900'}" points="${STAR_PTS}"/><circle cx="50" cy="50" r="12" fill="${d ? '#FF3EA5' : '#FF4D1C'}"/><circle cx="50" cy="50" r="5" fill="#fff"/></svg></div>`;
  },
  namysto: () => {
    const d = isDark();
    const cols = d ? ['#9B6BFF', '#2DE0C8', '#FF3EA5', '#FFC65C', '#ECE8F5', '#FFC65C', '#FF3EA5', '#2DE0C8', '#9B6BFF']
                   : ['#111', '#EEEBE3', '#5B3BFF', '#FF4D1C', '#EEEBE3', '#111', '#E8A900', '#EEEBE3', '#00A36C'];
    let s = `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><path d="M-10,70 C120,240 280,240 410,70" fill="none" stroke="${d ? 'rgba(236,232,245,.35)' : '#111'}" stroke-width="${d ? 1.5 : 2}"/>`;
    for (let i = 0; i < 9; i++) {
      const k = (i + .5) / 9, x = -10 + 420 * k, y = 70 + 4 * 127 * k * (1 - k) * 1.05;
      s += d ? `<circle cx="${x}" cy="${y}" r="${i === 4 ? 30 : 20}" fill="${cols[i]}" style="filter:drop-shadow(0 0 10px ${cols[i]})"/>`
             : `<circle cx="${x}" cy="${y}" r="${i === 4 ? 30 : 20}" fill="${cols[i]}" stroke="#111" stroke-width="2"/>`;
    }
    return `<div class="art art-beads">${s}<text x="200" y="285" text-anchor="middle" font-family="Google Sans Flex,sans-serif" font-weight="${d ? 700 : 800}" font-size="24" fill="${d ? '#ECE8F5' : '#111'}">Кременчук ⇄ Полтава</text></svg></div>`;
  },
  zvizdy: () => {
    const d = isDark();
    const cols = d ? ['#FFC65C', '#FF3EA5', '#2DE0C8'] : ['#E8A900', '#FF4D1C', '#00A36C'];
    const star = (x, y, r, c, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${r / 50})"><polygon fill="${c}" points="${STAR_PTS}" transform="translate(-50 -50)"/><circle r="9" fill="${d ? '#0f0b2a' : '#fff'}"/></g>`;
    return `<div class="art art-star">${starsBg}<svg viewBox="0 0 400 225" style="width:100%;left:0;top:0;transform:none;animation:none;filter:none"><g class="zv-spin">${star(120, 112, 62, cols[0], 0)}</g>${star(255, 80, 34, cols[1], 15)}${star(300, 160, 26, cols[2], 30)}<text x="200" y="212" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" letter-spacing="3" fill="${d ? '#ECE8F5' : '#fff'}">СТВОРИ СВОЮ ЗІРКУ</text></svg></div>`;
  },
  inter3lab: () => `<div class="art art-route"><svg viewBox="0 0 300 220"><path d="M20,180 C60,120 40,60 100,50 S170,120 200,80 S260,30 280,60"/><circle cx="20" cy="180" r="8"/><circle cx="62" cy="96" r="8"/><circle cx="100" cy="50" r="8"/><circle cx="160" cy="105" r="8"/><circle cx="215" cy="66" r="8"/><circle cx="280" cy="60" r="8"/><text x="150" y="200" text-anchor="middle" font-family="Google Sans Flex,sans-serif" font-weight="${isDark() ? 700 : 800}" font-size="28" fill="${isDark() ? '#FFC65C' : '#111'}">Inter3Lab</text></svg></div>`
};

const gal = (pref, n, alt) => `<div class="gallery">${Array.from({ length: n }, (_, i) => `<img src="img/gal/${pref}-${String(i + 1).padStart(2, '0')}.webp" alt="${alt} — фото ${i + 1}" loading="lazy">`).join('')}</div>`;
const ig = (id, h = 640, cap = '') => `<figure class="ig-embed"><iframe src="https://www.instagram.com/p/${id}/embed/captioned/" loading="lazy" height="${h}" title="Допис Instagram ${id}" allowtransparency="true" allowfullscreen></iframe>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
const FRAMED = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const ytCard = (id, title) => `<a class="yt-card" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener"><span class="yt-play" aria-hidden="true">▶</span><span><b>${title}</b><small>Дивитися на YouTube ↗</small></span></a>`;
const yt = (id, title) => `<a class="yt-embed yt-lite" data-yt="${id}" data-title="${title}" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" aria-label="${title} — відтворити відео"><img src="img/yt-${id}.webp" alt="" loading="lazy"><span class="yt-big" aria-hidden="true"><i></i></span><span class="yt-cap"><b>${title}</b><small>YouTube ↗</small></span></a>`;
const IG = u =>`<a href="https://www.instagram.com/${u}/" target="_blank" rel="noopener">@${u}</a>`;

const P = [
  {
    id: 'post', title: 'POST', meta: '2026 · Полтава', badge: 'Незабаром', live: true, cat: ['public'], pc: '#151515', art: 'post',
    short: 'Платформа сучасного публічного мистецтва: взаємодія мистецтва, міста та громади й нові підходи до художнього осмислення міського середовища.',
    tags: ['Публічне мистецтво', 'Site-specific', 'Відкриті конкурси', 'Архів'],
    lead: `POST — довгострокова платформа сучасного публічного мистецтва, що працює з міським простором, пам'яттю, історією та актуальними суспільними процесами через сучасні мистецькі практики.`,
    body: `<p>Ідея платформи виникла навколо території колишнього пам'ятника Петру І у Полтаві. Після демонтажу монумента постало питання про подальшу долю цього символічно навантаженого місця.</p>
      <p>Замість встановлення нового постійного пам'ятника POST пропонує іншу модель: перетворити локацію на відкритий простір для тимчасових мистецьких робіт, художніх інтервенцій та суспільного діалогу.</p>
      <blockquote>Не замінити один монумент іншим, а створити місце, яке може постійно змінюватися разом із містом.</blockquote>
      <h4>Концепція та підхід</h4>
      <p>POST розглядає публічний простір не лише як фізичну територію, а як середовище, у якому формуються та переосмислюються культурні сенси.</p>
      <p>Платформа працюватиме з тимчасовими інсталяціями, site-specific мистецтвом, скульптурою, цифровими та медіапрактиками, перформансами й іншими формами художнього висловлювання.</p>
      <p>Кожна робота взаємодіятиме з конкретним місцем, його історією та сучасним контекстом. Важливою складовою стануть відкриті конкурси, кураторські запрошення, мистецькі дослідження, публічні дискусії та освітні програми.</p>
      <p>POST передбачає циклічну модель роботи: одна мистецька робота змінює іншу, а кожен реалізований проєкт документується та стає частиною архіву платформи.</p>
      <div class="chips"><span>відкриті конкурси</span><span>кураторські запрошення</span><span>мистецькі дослідження</span><span>публічні дискусії</span><span>освітні програми</span><span>архів</span></div>
      <h4>Історія місця</h4>
      <p>Територія колишнього пам'ятника Петру І протягом десятиліть була простором репрезентації імперського історичного наративу. Його демонтаж відкрив можливість переосмислити не лише сам монумент, а й принцип подальшого використання цієї локації.</p>
      <p>Ще до формування POST місце ставало майданчиком для тимчасових мистецьких інтервенцій. Зокрема, тут експонувалася робота «Ракета» Роксолани Дудки, пов'язана з міжнародною мистецькою резиденцією INTER3LAB «Межі пам'яті». У 2025 році тут також було представлено гелікоптер Мі-2 як символ української військової авіації.</p>
      <p>Цей досвід став одним із поштовхів до розробки довгострокової моделі роботи з локацією.</p>
      <h4>Організаційна модель</h4>
      <p>POST розвивається як партнерська культурна платформа, а не окрема юридична структура.</p>
      <p>Концепцію POST розробили Вартан Маркар'ян та Роксолана Дудка.</p>
      <p>ГО «Креативна область Мислення» виступає ініціатором та оператором платформи, відповідаючи за художню концепцію, кураторську програму, продюсування мистецьких проєктів і розвиток партнерств.</p>
      <p>Розвиток платформи здійснюється у співпраці з МістоХабом, незалежними експертами, мистецькою спільнотою та потенційними українськими й міжнародними партнерами.</p>
      <h4>Значення для міста</h4>
      <p>POST пропонує Полтаві новий підхід до роботи з публічним простором — через сучасне мистецтво, відкритість до різних інтерпретацій та постійну культурну взаємодію.</p>
      <p>Платформа покликана створювати можливості для українських і міжнародних митців, підтримувати локальне мистецьке середовище та залучати громаду до осмислення історії й сучасності міста.</p>
      <blockquote>POST — це не новий пам'ятник. Це новий спосіб працювати з пам'яттю.<br>Місце не отримує остаточного значення. Воно продовжує говорити.</blockquote>`,
    en: { title: 'POST', meta: '2026 · Poltava', badge: 'Coming soon',
      short: 'A platform for contemporary public art: the interaction of art, city and community, and new approaches to the artistic reading of urban space.',
      tags: ['Public art', 'Site-specific', 'Open calls', 'Archive'],
      lead: `POST is a long-term platform for contemporary public art that works with urban space, memory, history and current social processes through contemporary art practices.`,
      body: `<p>The idea of the platform emerged around the site of the former monument to Peter I in Poltava. After the monument was dismantled, the question arose of what to do with this symbolically charged place.</p>
      <p>Instead of erecting a new permanent monument, POST proposes a different model: to turn the site into an open space for temporary artworks, art interventions and public dialogue.</p>
      <blockquote>Not to replace one monument with another, but to create a place that can keep changing together with the city.</blockquote>
      <h4>Concept and approach</h4>
      <p>POST sees public space not only as a physical territory but as an environment where cultural meanings are formed and rethought.</p>
      <p>The platform will work with temporary installations, site-specific art, sculpture, digital and media practices, performance and other forms of artistic expression.</p>
      <p>Each work will interact with the specific place, its history and present-day context. Open calls, curatorial invitations, artistic research, public discussions and educational programmes will be an important part of it.</p>
      <p>POST follows a cyclical model: one artwork replaces another, and every completed project is documented and becomes part of the platform's archive.</p>
      <div class="chips"><span>open calls</span><span>curatorial invitations</span><span>artistic research</span><span>public discussions</span><span>educational programmes</span><span>archive</span></div>
      <h4>History of the site</h4>
      <p>For decades the site of the former monument to Peter I was a space representing the imperial historical narrative. Its removal opened the possibility to rethink not only the monument itself but also the principle by which the site should be used.</p>
      <p>Even before POST was formed, the site hosted temporary art interventions. In particular, Roksolana Dudka's work “Rocket”, connected with the international residency INTER3LAB “Borders of Memory”, was exhibited here. In 2025 a Mi-2 helicopter was also displayed here as a symbol of Ukrainian military aviation.</p>
      <p>This experience became one of the impulses for developing a long-term model for working with the site.</p>
      <h4>Organisational model</h4>
      <p>POST is being developed as a partnership-based cultural platform rather than a separate legal entity.</p>
      <p>The concept of POST was developed by Vartan Markarian and Roksolana Dudka.</p>
      <p>NGO “Creative Area of Thinking” is the initiator and operator of the platform, responsible for the artistic concept, the curatorial programme, the production of art projects and the development of partnerships.</p>
      <p>The platform is being developed together with MistoHub, independent experts, the art community and potential Ukrainian and international partners.</p>
      <h4>Significance for the city</h4>
      <p>POST offers Poltava a new approach to public space — through contemporary art, openness to different interpretations and ongoing cultural interaction.</p>
      <p>The platform is meant to create opportunities for Ukrainian and international artists, support the local art scene and involve the community in reflecting on the city's history and present.</p>
      <blockquote>POST is not a new monument. It is a new way of working with memory.<br>The place does not receive a final meaning. It keeps speaking.</blockquote>`,
      links: ['Open Call', 'POST archive'] },
    links: [{ t: 'Open Call', u: null }, { t: 'Архів POST', u: null }]
  },
  {
    id: 'metanoia', title: 'МЕТАНОЯ', meta: '2026 · Фестиваль сучасного діджитал мистецтва в Полтаві', badge: 'Фестиваль', live: true, cat: ['digital', 'intl'], pc: '#2b1d63',
    img: 'img/fest-1.webp',
    short: 'Другий фестиваль сучасного цифрового мистецтва: внутрішня трансформація людини, переосмислення реальності та взаємодія з нею в умовах війни.',
    tags: ['Цифрове мистецтво', 'Нові медіа', '28 митців'],
    lead: `«МЕТАНОЯ» — другий фестиваль сучасного цифрового мистецтва, організований ГО «Креативна область Мислення» у Полтаві.`,
    body: `<p>Фестиваль досліджує трансформацію людського мислення, сприйняття та внутрішнього стану в умовах постійних змін. У центрі уваги — людина, яка намагається осмислити нову реальність, переоцінити власний досвід і знайти інші способи взаємодії зі світом.</p>
      <p>Назва METANOIA походить від грецького поняття, що означає глибоку зміну мислення, світогляду та внутрішньої позиції.</p>
      <h4>Галерея</h4>
      ${gal('metanoia', 10, 'МЕТАНОЯ')}
      <h4>Концепція та підхід</h4>
      <p>Війна, нестабільність і постійна трансформація суспільства змінюють не лише зовнішні обставини, а й спосіб, у який людина сприймає себе та навколишній світ.</p>
      <p>«МЕТАНОЯ» звертається до цього процесу через сучасне цифрове мистецтво, використовуючи технології як художній інструмент, середовище та спосіб дослідження людського досвіду.</p>
      <p>Водночас фестиваль не обмежує художні висловлювання безпосередньо воєнною тематикою. Його поле значно ширше: внутрішні зміни, ідентичність, пам'ять, сприйняття реальності, вразливість, адаптація та пошук нових сенсів.</p>
      <blockquote>Головне питання фестивалю: ким ми стаємо, коли світ навколо нас постійно змінюється?</blockquote>
      <h4>Виставкова програма</h4>
      <div class="stats"><div><b>28</b><small>митців з України та інших країн</small></div><div><b>2-й</b><small>фестиваль цифрового мистецтва ГО</small></div><div><b>2</b><small>поверх Полтавського художнього музею</small></div></div>
      <p>Фестиваль представив роботи 28 митців з України та інших країн.</p>
      <p>Експозиція розгорнулася на другому поверсі Полтавського художнього музею (галереї мистецтв) і об'єднала різні підходи до роботи з цифровими технологіями та сучасними медіа.</p>
      <p>Мистецькі висловлювання учасників формували багатоголосий простір, у якому особистий досвід, технологічні експерименти та рефлексія над сучасністю взаємодіяли між собою.</p>
      <h4>Місце та контекст</h4>
      <p>Виставка відбулася в просторі Полтавського художнього музею — середовищі, де зустрічаються різні мистецькі традиції та способи осмислення сучасної культури.</p>
      <p>Розміщення фестивалю в музейному просторі стало можливістю представити цифрове мистецтво як частину актуального мистецького процесу та розширити уявлення про форми його існування й експонування.</p>
      <h4>Організація та кураторство</h4>
      <p>Організатор — ГО «Креативна область Мислення».<br>Куратори фестивалю — Вартан Маркар'ян та Роксолана Дудка.</p>
      <h4>Значення для культурного середовища</h4>
      <p>«МЕТАНОЯ» продовжила розвиток сучасного цифрового мистецтва в Полтаві, започаткований фестивалем «Контури відновлення. Міжпростір» у 2025 році.</p>
      <p>Другий фестиваль розширив географію мистецької взаємодії, залучив міжнародних учасників і запропонував нову кураторську оптику для осмислення досвіду людини в умовах сучасних суспільних трансформацій.</p>
      <p>Для ГО «Креативна область Мислення» цей проєкт став наступним етапом формування незалежної культурної платформи, відкритої до експерименту, міждисциплінарності та міжнародного мистецького діалогу.</p>
      <blockquote>МЕТАНОЯ — це не лише зміна обставин. Це зміна способу бачити, мислити та бути у світі.</blockquote>`,
    en: { title: 'METANOIA', meta: '2026 · Festival of contemporary digital art in Poltava', badge: 'Festival',
      short: 'The second festival of contemporary digital art: inner transformation, rethinking reality and how we interact with it in times of war.',
      tags: ['Digital art', 'New media', '28 artists'],
      lead: `METANOIA is the second festival of contemporary digital art organised by NGO “Creative Area of Thinking” in Poltava.`,
      body: `<p>The festival explores the transformation of human thinking, perception and inner state in conditions of constant change. At its centre is a person trying to make sense of a new reality, re-evaluate their own experience and find other ways of interacting with the world.</p>
      <p>The name METANOIA comes from a Greek concept meaning a deep change of mind, worldview and inner position.</p>
      <h4>Gallery</h4>
      ${gal('metanoia', 10, 'METANOIA')}
      <h4>Concept and approach</h4>
      <p>War, instability and the constant transformation of society change not only outer circumstances but also the way a person perceives themselves and the world around them.</p>
      <p>METANOIA addresses this process through contemporary digital art, using technology as an artistic tool, an environment and a way of exploring human experience.</p>
      <p>At the same time, the festival does not limit artistic statements to the theme of war. Its field is much wider: inner change, identity, memory, perception of reality, vulnerability, adaptation and the search for new meanings.</p>
      <blockquote>The main question of the festival: who do we become when the world around us keeps changing?</blockquote>
      <h4>Exhibition programme</h4>
      <div class="stats"><div><b>28</b><small>artists from Ukraine and other countries</small></div><div><b>2nd</b><small>digital art festival of the NGO</small></div><div><b>2</b><small>floor of the Poltava Art Museum</small></div></div>
      <p>The festival presented works by 28 artists from Ukraine and other countries.</p>
      <p>The exhibition took place on the second floor of the Poltava Art Museum (Gallery of Arts) and brought together different approaches to digital technologies and contemporary media.</p>
      <p>The participants' works formed a polyphonic space in which personal experience, technological experiments and reflection on the present interacted with each other.</p>
      <h4>Venue and context</h4>
      <p>The exhibition was held at the Poltava Art Museum — a place where different art traditions and ways of understanding contemporary culture meet.</p>
      <p>Hosting the festival in a museum made it possible to present digital art as part of the current art process and to broaden ideas about how it can exist and be exhibited.</p>
      <h4>Organisation and curators</h4>
      <p>Organiser — NGO “Creative Area of Thinking”.<br>Festival curators — Vartan Markarian and Roksolana Dudka.</p>
      <h4>Significance for the cultural scene</h4>
      <p>METANOIA continued the development of contemporary digital art in Poltava begun by the festival “Contours of Restoration. Interspace” in 2025.</p>
      <p>The second festival widened the geography of artistic exchange, brought in international participants and offered a new curatorial lens for understanding human experience amid today's social transformations.</p>
      <p>For NGO “Creative Area of Thinking” the project became the next stage in building an independent cultural platform open to experiment, interdisciplinarity and international artistic dialogue.</p>
      <blockquote>METANOIA is not only a change of circumstances. It is a change in the way we see, think and are in the world.</blockquote>`,
      links: ['digitalfestpoltava.com'] },
    links: [{ t: 'digitalfestpoltava.com', u: 'https://digitalfestpoltava.com/' }]
  },
  {
    id: 'namysto', title: 'НАМИСТО', meta: '9–10 травня 2026 · Кременчук / Полтава', badge: 'Шоукейс-фестиваль', cat: ['community'], pc: '#000', art: 'namysto', img: 'img/namysto-hero.webp',
    short: 'Міжміський шоукейс-фестиваль: локальні митці, музиканти, культурні менеджери й незалежні ініціативи Полтави та Кременчука.',
    tags: ['Музика', 'Кіно', 'Література', 'Лекції', 'Виставки'],
    lead: `«Намисто» — дводенний шоукейс-фестиваль локального сучасного мистецтва, що об'єднав три незалежні культурні спільноти Полтави та Кременчука у форматі взаємного представлення.`,
    body: `<p>Протягом двох днів міста почергово ставали майданчиками для презентації мистецьких практик, локальних ініціатив і культурних середовищ одне одного.</p>
      <p>Фестиваль відбувся 9 травня в Кременчуці та 10 травня в Полтаві. Його програма поєднала музику, кіно, літературу, візуальне мистецтво, лекції, екскурсії та майстер-класи.</p>
      <h4>Відео</h4>
      ${yt('leHByRFYGVM', 'НАМИСТО — відео з фестивалю')}
      <h4>Концепція та підхід</h4>
      <p>Ідея «Намиста» виникла з потреби не лише розвивати локальні культурні сцени, а й налагоджувати сталі зв'язки між ними. Фестиваль запропонував модель горизонтального обміну, у якій міста не конкурують за культурну увагу, а відкривають одне одному власні мистецькі середовища.</p>
      <p>Назва стала метафорою такого об'єднання: окремі елементи, кожен зі своєю формою та характером, зібрані разом, утворюють цілісність. Так само різні культурні спільноти, практики й досвіди формують спільне надбання регіону.</p>
      <h4>Формат і програма</h4>
      <p>Фестиваль розгорнувся як двосторонній культурний обмін. 9 травня Кременчук приймав полтавську програму в Міському палаці культури, а наступного дня Полтава стала майданчиком для презентації кременчуцьких митців в артпросторі «Культура» (К2 АРКА).</p>
      <p>Програма охопила різні напрями сучасної культури: музичні виступи, кінопокази, літературні читання, лекції, міські екскурсії, виставки, майстер-класи та художні інсталяції. Вона знайомила аудиторію не лише з окремими авторами й роботами, а й із діяльністю спільнот, які формують культурне життя обох міст.</p>
      <p>Такий формат дозволив побачити локальні сцени зсередини — через людей, незалежні ініціативи, мистецькі практики та історії місць.</p>
      <div class="chips"><span>музичні виступи</span><span>кінопокази</span><span>літературні читання</span><span>лекції</span><span>міські екскурсії</span><span>виставки</span><span>майстер-класи</span><span>художні інсталяції</span></div>
      <h4>Організація та партнерство</h4>
      <p>Фестиваль створили три культурні спільноти:</p>
      <p><b>«О'Комова»</b> (Кременчук) — культурне об'єднання, що ініціює мистецькі події та створює платформи для взаємодії. ${IG('okomo.va')}<br><b>«Двіж Лаб»</b> (Полтава) — спільнота, яка розвиває середовище навколо сучасного мистецтва та культурної самоідентифікації. ${IG('dvij_lab')}<br><b>ГО «Креативна область Мислення»</b> (Полтава) — організація, що працює з міждисциплінарними мистецькими проєктами, аудіовізуальними колабораціями та дослідженнями.</p>
      <p>Спільна робота трьох команд стала основою фестивалю: кожна представляла власне місто, його культурне середовище та людей, які працюють над його розвитком.</p>
      <h4>Підтримка</h4>
      <p>«Намисто» стало переможцем грантової програми воркшопу «Зав'язь», реалізованої культурною агенцією «Терени». Програму профінансували Adam Harber Foundation та Obriy Holiday Village.</p>
      <p>Фестиваль також мав благодійну складову: під час подій тривав збір коштів на підтримку ініціативи Майстерні Frame зі створення мобільних госпіталів для фронту. Ціль збору становила 100 000 гривень на забезпечення евакуаційного автомобіля «Бублик».</p>
      <h4>Значення для культурного середовища</h4>
      <p>«Намисто» створило простір для знайомства та взаємодії між культурними спільнотами двох міст, які часто розвиваються окремо одна від одної. Фестиваль показав, що регіональна культурна сцена може формуватися не лише навколо окремих інституцій чи великих центрів, а й завдяки горизонтальним зв'язкам між незалежними ініціативами.</p>
      <p>Для ГО «Креативна область Мислення» участь у створенні «Намиста» стала можливістю розвивати міжміську співпрацю та представляти полтавське сучасне мистецтво в ширшому регіональному контексті.</p>
      <blockquote>«Намисто» — це спроба з'єднати окремі культурні середовища в мережу, у якій взаємодія стає основою спільного розвитку.</blockquote>`,
    en: { title: 'NAMYSTO', meta: '9–10 May 2026 · Kremenchuk / Poltava', badge: 'Showcase festival',
      short: 'An intercity showcase festival: local artists, musicians, cultural managers and independent initiatives of Poltava and Kremenchuk.',
      tags: ['Music', 'Film', 'Literature', 'Talks', 'Exhibitions'],
      lead: `NAMYSTO (“Necklace”) is a two-day showcase festival of local contemporary art that brought together three independent cultural communities of Poltava and Kremenchuk in a format of mutual presentation.`,
      body: `<p>Over two days the cities took turns hosting presentations of each other's art practices, local initiatives and cultural scenes.</p>
      <p>The festival took place on 9 May in Kremenchuk and on 10 May in Poltava. Its programme combined music, film, literature, visual art, talks, city tours and workshops.</p>
      <h4>Video</h4>
      ${yt('leHByRFYGVM', 'NAMYSTO — festival video')}
      <h4>Concept and approach</h4>
      <p>The idea of NAMYSTO grew out of the need not only to develop local cultural scenes but also to build lasting connections between them. The festival proposed a model of horizontal exchange in which cities do not compete for cultural attention but open their art scenes to each other.</p>
      <p>The name became a metaphor for this union: separate beads, each with its own shape and character, strung together form a whole. In the same way, different cultural communities, practices and experiences form the shared heritage of the region.</p>
      <h4>Format and programme</h4>
      <p>The festival unfolded as a two-way cultural exchange. On 9 May Kremenchuk hosted the Poltava programme at the City Palace of Culture, and the next day Poltava became the stage for Kremenchuk artists at the art space “Kultura” (K2 ARKA).</p>
      <p>The programme covered many areas of contemporary culture: concerts, film screenings, literary readings, talks, city tours, exhibitions, workshops and art installations. It introduced the audience not only to individual authors and works but also to the communities that shape the cultural life of both cities.</p>
      <p>This format made it possible to see the local scenes from the inside — through people, independent initiatives, art practices and the stories of places.</p>
      <div class="chips"><span>concerts</span><span>film screenings</span><span>literary readings</span><span>talks</span><span>city tours</span><span>exhibitions</span><span>workshops</span><span>art installations</span></div>
      <h4>Organisers and partnership</h4>
      <p>The festival was created by three cultural communities:</p>
      <p><b>O'Komova</b> (Kremenchuk) — a cultural association that initiates art events and creates platforms for interaction. ${IG('okomo.va')}<br><b>Dvizh Lab</b> (Poltava) — a community developing an environment around contemporary art and cultural self-identification. ${IG('dvij_lab')}<br><b>NGO “Creative Area of Thinking”</b> (Poltava) — an organisation working with interdisciplinary art projects, audiovisual collaborations and research.</p>
      <p>The joint work of the three teams became the basis of the festival: each represented its own city, its cultural scene and the people working to develop it.</p>
      <h4>Support</h4>
      <p>NAMYSTO won the grant programme of the “Zaviaz” workshop run by the cultural agency “Tereny”. The programme was funded by Adam Harber Foundation and Obriy Holiday Village.</p>
      <p>The festival also had a charity component: during the events, funds were raised for the Frame Workshop initiative building mobile hospitals for the front. The goal was UAH 100,000 for the evacuation vehicle “Bublyk”.</p>
      <h4>Significance for the cultural scene</h4>
      <p>NAMYSTO created space for the cultural communities of two cities, which often develop separately, to meet and interact. The festival showed that a regional cultural scene can form not only around institutions or big centres but also through horizontal ties between independent initiatives.</p>
      <p>For NGO “Creative Area of Thinking” co-creating NAMYSTO was an opportunity to develop intercity cooperation and to present Poltava's contemporary art in a wider regional context.</p>
      <blockquote>NAMYSTO is an attempt to string separate cultural scenes into a network where interaction becomes the basis of shared growth.</blockquote>`,
      links: ['Media coverage', 'Photos · O\'Komova', 'Photos · K2 Arka', 'O\'Komova', 'Dvizh Lab'] },
    links: [{ t: 'Публікації в медіа', u: 'https://www.instagram.com/p/DX_Wh_Yghy6/' }, { t: 'Фото · О\'Комова', u: 'https://www.instagram.com/p/DYpdkIYjM8v/' }, { t: 'Фото · K2 Арка', u: 'https://www.instagram.com/p/DYNBxrYDNC3/' }, { t: 'О\'Комова', u: 'https://www.instagram.com/okomo.va/' }, { t: 'Двіж Лаб', u: 'https://www.instagram.com/dvij_lab/' }]
  },
  {
    id: 'hoda', title: 'Полтавська Хода звіздарів', meta: '2025 → 2026 · Полтава', badge: 'Щорічно', cat: ['heritage', 'community', 'public'], pc: '#0f0b2a', art: 'hoda', img: 'img/hoda-star.webp', pos: '45% 45%',
    short: 'Відродження та сучасне переосмислення різдвяної традиції звіздарства: авторські звізди, залучення громади, нова міська традиція.',
    tags: ['Спадщина', 'Архів', 'Open Call', 'Громада', 'Місто'],
    lead: `Жива традиція. Місто. Зірка. Спільнота.`,
    body: `<p>«Полтавська Хода звіздарів» — культурна ініціатива з відродження, дослідження та сучасного переосмислення традиції різдвяного звіздарства на Полтавщині. Проєкт поєднує роботу з локальною культурною спадщиною, архівами та усною історією із сучасними мистецькими, освітніми й публічними практиками.</p>
      <p>У центрі ініціативи — різдвяна зірка як символ колядування, пам'яті та спільноти. Через створення авторських зірок, колядування та спільну ходу вулицями міста традиція повертається в сучасний культурний простір Полтави.</p>
      <h4>Концепція та підхід</h4>
      <p>Звіздарство — частина української різдвяної традиції, пов'язана з обходами колядників, які супроводжувалися різдвяною зіркою. Етнографічні матеріали засвідчують побутування цієї практики й на Полтавщині, зокрема у Великобагачанському, Зіньківському, Гадяцькому та Полтавському районах. Традиційні полтавські зірки могли мати шість-вісім променів, оздоблювалися різними матеріалами, а всередині могли містити свічку та різдвяний образ.</p>
      <p>Для проєкту важливо не просто відтворити історичну форму чи реконструювати обряд певного часу. Йдеться про повернення традиції в живе культурне середовище — так, щоб вона могла розвиватися, змінюватися та передаватися наступним поколінням.</p>
      <p>Тому поруч із традиційними зірками в Ході можуть з'являтися авторські мистецькі об'єкти, експериментальні конструкції, текстильні, світлові й цифрові інтерпретації. Незмінним залишається головне — зірка як символ, який об'єднує людей у спільній різдвяній практиці.</p>
      <h4>Перша Хода — 2025</h4>
      <p>У 2025 році в Полтаві відбулася перша сучасна «Полтавська Хода звіздарів». Ініціатива об'єднала учасників навколо різдвяної традиції: звіздарі несли зірки вулицями міста, звучали колядки, а публічний простір став місцем спільного святкування та культурної взаємодії.</p>
      <p>Одним із центральних мистецьких об'єктів стала велика різдвяна зірка розміром близько 3 × 3 метри, створена Роксоланою Дудкою та Вартаном Маркар'яном. У ній поєдналися текстиль, колаж, ручний друк, світло, RGB-підсвічування та дзвони. Традиційний образ отримав сучасне художнє втілення, спеціально створене для руху в міському просторі.</p>
      <h4>Дослідження та архівна робота</h4>
      <p>Важливою складовою проєкту стало дослідження історії різдвяних традицій Полтавщини та пошук матеріалів, що зберігають пам'ять про попередні покоління звіздарів і колядників.</p>
      <p>Під час підготовки першої Ходи були знайдені приватні фото- та відеоматеріали полтавської «Коляди» 1995 року. Їх виявила Роксолана Дудка в архіві родини Володимира Данилейка — культуролога, дослідника українських традицій та організатора тієї події.</p>
      <p>Ці матеріали відкрили можливість простежити зв'язок між різними етапами відродження різдвяної традиції в Полтаві: від подій 1995 року до сучасної Ходи. Архівна робота стає не лише способом документування минулого, а й ресурсом для подальшого розвитку живої культурної практики.</p>
      <h4>Хода як публічний простір і спільнотворення</h4>
      <p>Сам формат Ходи має принципове значення: зірка не залишається музейним предметом чи виставковим об'єктом — вона рухається містом разом із людьми та колядою.</p>
      <p>Вулиці, площі й міські маршрути стають частиною різдвяної події. Містяни можуть долучатися до процесії, співати колядки, створювати власні зірки та передавати традицію дітям.</p>
      <p>Ініціатива відкрита для різних учасників і середовищ: родин, дітей та молоді, художників, майстрів, студентів, освітніх і культурних інституцій, мистецьких колективів та локальних спільнот. Організатори не виступають власниками традиції, а створюють умови для її спільного продовження.</p>
      <h4>Подальший розвиток</h4>
      <p>У 2026 році Хода продовжує розвиватися як щорічна культурна ініціатива. Один із важливих напрямів цього етапу — відкритість авторства та децентралізація створення різдвяних зірок.</p>
      <p>Замість єдиної затвердженої форми проєкт прагне підтримувати різноманітність інтерпретацій і залучати до створення зірок нових авторів та спільноти. Серед залучених інструментів — відкриті конкурси (Open Call), освітні програми й майстер-класи, що поєднують знайомство з традиційними конструкціями та матеріалами із сучасними мистецькими підходами. У перспективі кожна Хода може отримувати нову центральну зірку, створену іншим автором або колективом. Так поступово формуватиметься багатоголосий візуальний образ традиції, а самі об'єкти зможуть ставати частиною історії сучасної Полтави та її культурних колекцій.</p>
      <h4>Організація</h4>
      <p>Засновниками «Полтавської Ходи звіздарів» є Діана Шайдаєва, Ілона Кислова-Чернявська, Роксолана Дудка, Наталка Баранник, Віктор Кропивний, Ляна Салех, Аліна Зінченко (проєкт також розвивається за участі ГО «Креативна область Мислення», кав'ярні «Кавун» та студії «Контента»). Для ГО «КОМ» цей проєкт є способом працювати з нематеріальною культурною спадщиною через сучасне мистецтво, дослідження, публічні події та залучення громади.</p>
      <p>Робота охоплює формування концепції, мистецьке кураторство, дослідження локальної традиції, роботу з архівами, взаємодію з митцями й культурними середовищами, організацію подій та документування.</p>
      <h4>Значення для міста</h4>
      <p>«Полтавська Хода звіздарів» повертає різдвяну традицію в повсякденне культурне життя міста та створює простір для взаємодії між поколіннями. Вона поєднує локальну історію з сучасними мистецькими практиками, даючи можливість не лише зберігати культурну пам'ять, а й доповнювати її новими досвідами.</p>
      <p>Цінність проєкту — у його тривалості. Кожен наступний рік може додавати нових учасників, авторські зірки, дослідницькі матеріали, колядки та історії, формуючи живий архів традиції.</p>
      <blockquote>Ми не прагнемо зберегти традицію незмінною. Ми хочемо, щоб вона продовжувала жити, рухатися містом і переходити від покоління до покоління.</blockquote>`,
    en: { title: 'Poltava Star Procession', meta: '2025 → 2026 · Poltava', badge: 'Annual',
      short: 'Reviving and reimagining the Christmas tradition of star-bearers (zvizdari): authors\' stars, community involvement, a new city tradition.',
      tags: ['Heritage', 'Archive', 'Open Call', 'Community', 'City'],
      lead: `A living tradition. City. Star. Community.`,
      body: `<p>The Poltava Star Procession (Poltavska Khoda zvizdariv) is a cultural initiative to revive, research and reimagine the Christmas tradition of star-bearing in the Poltava region. The project combines work with local cultural heritage, archives and oral history with contemporary art, educational and public practices.</p>
      <p>At the centre of the initiative is the Christmas star as a symbol of carolling, memory and community. Through the making of authors' stars, carolling and a shared procession through the city streets, the tradition returns to the contemporary cultural life of Poltava.</p>
      <h4>Concept and approach</h4>
      <p>Star-bearing is part of the Ukrainian Christmas tradition, linked to carollers' rounds accompanied by a Christmas star. Ethnographic sources record the practice in the Poltava region as well, in particular in the Velyka Bahachka, Zinkiv, Hadiach and Poltava districts. Traditional Poltava stars could have six to eight rays, were decorated with various materials and could hold a candle and a Christmas icon inside.</p>
      <p>For the project it is important not simply to reproduce a historical form or reconstruct a ritual of a certain period, but to return the tradition to a living cultural environment — so that it can develop, change and be passed on to the next generations.</p>
      <p>That is why, alongside traditional stars, the procession can include authors' art objects, experimental constructions, textile, light and digital interpretations. What stays unchanged is the essence — the star as a symbol that unites people in a shared Christmas practice.</p>
      <h4>The first procession — 2025</h4>
      <p>In 2025 the first contemporary Poltava Star Procession took place. The initiative brought participants together around the Christmas tradition: star-bearers carried stars through the city streets, carols were sung, and public space became a place of shared celebration and cultural interaction.</p>
      <p>One of the central art objects was a large Christmas star about 3 × 3 metres, created by Roksolana Dudka and Vartan Markarian. It combined textile, collage, hand printing, light, RGB lighting and bells. The traditional image received a contemporary artistic form designed specifically for moving through the city.</p>
      <h4>Research and archive work</h4>
      <p>An important part of the project was researching the history of Christmas traditions in the Poltava region and searching for materials that preserve the memory of earlier generations of star-bearers and carollers.</p>
      <p>While preparing the first procession, private photos and videos of the Poltava “Koliada” of 1995 were found. Roksolana Dudka discovered them in the family archive of Volodymyr Danyleiko — a cultural scholar, researcher of Ukrainian traditions and organiser of that event.</p>
      <p>These materials made it possible to trace the link between different stages of the revival of the Christmas tradition in Poltava: from the events of 1995 to today's procession. Archive work becomes not only a way of documenting the past but also a resource for the further development of a living cultural practice.</p>
      <h4>The procession as public space and community-making</h4>
      <p>The format of the procession is essential: the star does not stay a museum piece or an exhibit — it moves through the city together with people and carols.</p>
      <p>Streets, squares and city routes become part of the Christmas event. Residents can join the procession, sing carols, make their own stars and pass the tradition on to their children.</p>
      <p>The initiative is open to many participants and communities: families, children and young people, artists, craftspeople, students, educational and cultural institutions, art groups and local communities. The organisers do not act as owners of the tradition but create conditions for continuing it together.</p>
      <h4>Further development</h4>
      <p>In 2026 the procession continues as an annual cultural initiative. One of the key directions of this stage is open authorship and the decentralisation of star-making.</p>
      <p>Instead of a single approved form, the project aims to support a diversity of interpretations and to involve new authors and communities in making stars. Its tools include open calls, educational programmes and workshops that combine traditional constructions and materials with contemporary art approaches. In the future each procession may get a new central star made by a different author or group. Gradually this will form a polyphonic visual image of the tradition, and the objects themselves may become part of the history of contemporary Poltava and its cultural collections.</p>
      <h4>Organisation</h4>
      <p>The founders of the Poltava Star Procession are Diana Shaidaieva, Ilona Kyslova-Cherniavska, Roksolana Dudka, Natalka Barannyk, Viktor Kropyvnyi, Liana Salekh and Alina Zinchenko (the project also develops with the participation of NGO “Creative Area of Thinking”, the café “Kavun” and the studio “Kontenta”). For the NGO this project is a way of working with intangible cultural heritage through contemporary art, research, public events and community involvement.</p>
      <p>The work covers developing the concept, art curation, research into the local tradition, archive work, cooperation with artists and cultural communities, organising events and documentation.</p>
      <h4>Significance for the city</h4>
      <p>The Poltava Star Procession brings the Christmas tradition back into the everyday cultural life of the city and creates space for interaction between generations. It connects local history with contemporary art practices, making it possible not only to preserve cultural memory but also to add new experiences to it.</p>
      <p>The value of the project lies in its continuity. Every year can add new participants, authors' stars, research materials, carols and stories, forming a living archive of the tradition.</p>
      <blockquote>We do not want to keep the tradition unchanged. We want it to keep living, moving through the city and passing from generation to generation.</blockquote>`,
      links: ['Instagram · @khodazvizdariv_plt', 'Procession video'] },
    links: [{ t: 'Instagram · @khodazvizdariv_plt', u: 'https://www.instagram.com/khodazvizdariv_plt/' }, { t: 'Відео Ходи', u: 'https://www.instagram.com/p/DS7C68gCMRm/' }]
  },
  {
    id: 'zvizdy', title: 'Конструктор звізд', meta: '2026 · Полтавська Хода звіздарів', badge: 'Інтерактив', live: true, cat: ['heritage', 'community', 'digital'], pc: '#2a1b15', art: 'zvizdy', img: 'img/zvizdy-grid.webp',
    href: 'constructorzvizd/', hrefClaude: 'https://claude.ai/artifact/H7fz9JSorct1sTtwm4Zgic',
    short: 'Онлайн-конструктор різдвяних звізд за мотивами полтавської різьби, майоліки, вишивки й писанок: 18 основ, кольори, прикраси, викрійки A4–A2.',
    tags: ['Онлайн-інструмент', '18 основ', 'Викрійки A4–A2'],
    en: { title: 'Star Builder', meta: '2026 · Poltava Star Procession', badge: 'Interactive',
      short: 'An online builder of Christmas stars inspired by Poltava wood carving, majolica, embroidery and pysanky: 18 bases, colours, decorations, A4–A2 patterns.',
      tags: ['Online tool', '18 bases', 'A4–A2 patterns'] }
  },
  {
    id: 'kontury', title: 'Контури відновлення. Міжпростір', meta: '2025 · Фестиваль сучасного діджитал мистецтва в Полтаві', badge: 'Фестиваль', cat: ['digital', 'intl'], pc: '#1b1b1b', pos: '50% 6%',
    img: 'img/kontury-1.webp',
    short: 'Перший у Полтаві фестиваль сучасного цифрового мистецтва. Відбувся в умовах блекауту й досліджував взаємозв\'язок мистецтва, технологій, пам\'яті та культурного відновлення.',
    tags: ['VR', 'Відеоарт', 'Інсталяції', 'Перформанс', 'Освіта'],
    lead: `«Контури відновлення. Міжпростір» — перший у Полтаві фестиваль сучасного цифрового мистецтва, створений як простір взаємодії сучасного мистецтва, цифрових технологій, культури та суспільного досвіду війни.`,
    body: `<p>Фестиваль досліджував можливості мистецтва говорити про пам'ять, втрату, трансформацію та відновлення через цифрові й міждисциплінарні практики.</p>
      <p>Його концепція ґрунтувалася на ідеї, що навіть у часи невизначеності та руйнування люди здатні створювати нові зв'язки, сенси й простори взаємодії.</p>
      <h4>Відео · Контури відновлення. Міжпростір</h4>
      ${yt('UJdV6lPrt4k', 'Контури відновлення. Міжпростір — відео')}
      <h4>Галерея</h4>
      ${gal('kontury', 10, 'Контури відновлення')}
      <h4>Концепція та підхід</h4>
      <p>Назва фестивалю відображає два взаємопов'язані поняття.</p>
      <p><b>«Контури відновлення»</b> — пошук нових форм осмислення досвіду війни, пам'яті та змін, які переживає суспільство.</p>
      <p><b>«Міжпростір»</b> — територія взаємодії між фізичним і цифровим середовищами, мистецтвом і технологіями, особистим досвідом та колективною пам'яттю.</p>
      <p>Фестиваль об'єднав різні художні практики, у яких цифрові технології стали не лише засобом створення мистецьких робіт, а й інструментом дослідження сучасної реальності.</p>
      <h4>Фестиваль в умовах блекауту</h4>
      <p>Однією з визначальних особливостей фестивалю стали умови його проведення.</p>
      <p>Подія відбулася під час повного блекауту в Полтаві. Виставкові та освітні активності розгорнулися на п'яти поверхах обласної бібліотеки.</p>
      <p>Відсутність звичного освітлення та електропостачання стала частиною контексту фестивалю. Замість скасування події команда продовжила роботу, створивши простір для мистецтва, зустрічей та взаємодії.</p>
      <blockquote>У темряві люди створюють світло.</blockquote>
      <p>Ця ідея стала одним із ключових символічних вимірів фестивалю.</p>
      <div class="stats"><div><b>1-й</b><small>фестиваль цифрового мистецтва в Полтаві</small></div><div><b>5</b><small>поверхів обласної бібліотеки</small></div><div><b>UA + 🌍</b><small>українські та міжнародні діджитал митці</small></div></div>
      <h4>Програма</h4>
      <p>Фестиваль поєднав виставкову, освітню та комунікаційну програми. Серед представлених форматів:</p>
      <div class="chips"><span>цифрове та медіамистецтво</span><span>VR та відеоарт</span><span>мистецькі інсталяції</span><span>лекції та публічні зустрічі</span><span>воркшопи й майстер-класи</span><span>міждисциплінарні освітні формати</span></div>
      <p>До участі долучилися українські та міжнародні діджитал митці й культурні діячі.</p>
      <p>Фестиваль створив можливість для знайомства локальної аудиторії із сучасними цифровими мистецькими практиками та професійного обміну між представниками різних культурних середовищ.</p>
      <h4>Організація та підтримка</h4>
      <p>Фестиваль реалізувала ГО «Креативна область Мислення» за підтримки NOVA United у межах програми субгрантової підтримки громадських організацій Полтави.</p>
      <p>Для організації це стало важливим досвідом залучення грантових ресурсів, культурного продюсування та створення масштабної міждисциплінарної події в регіоні.</p>
      <h4>Значення для міста</h4>
      <p>«Контури відновлення. Міжпростір» став прецедентом представлення сучасного цифрового мистецтва в Полтаві у фестивальному форматі.</p>
      <p>Проєкт розширив можливості локального культурного середовища, створив простір для взаємодії митців з різних міст і представив цифрове мистецтво як повноцінну частину сучасного культурного процесу.</p>
      <p>Для ГО «Креативна область Мислення» фестиваль став важливим етапом розвитку мистецьких і міждисциплінарних практик, а також основою для подальших культурних ініціатив, зокрема фестивалю «МЕТАНОЯ» у 2026 році.</p>
      <blockquote>«Контури відновлення. Міжпростір» — про здатність створювати нові сенси навіть тоді, коли навколо темрява.</blockquote>`,
    en: { title: 'Contours of Restoration. Interspace', meta: '2025 · Festival of contemporary digital art in Poltava', badge: 'Festival',
      short: 'The first festival of contemporary digital art in Poltava. Held during a blackout, it explored the connection between art, technology, memory and cultural restoration.',
      tags: ['VR', 'Video art', 'Installations', 'Performance', 'Education'],
      lead: `“Contours of Restoration. Interspace” is the first festival of contemporary digital art in Poltava, created as a space of interaction between contemporary art, digital technologies, culture and society's experience of war.`,
      body: `<p>The festival explored the ability of art to speak about memory, loss, transformation and restoration through digital and interdisciplinary practices.</p>
      <p>Its concept was based on the idea that even in times of uncertainty and destruction people are able to create new connections, meanings and spaces of interaction.</p>
      <h4>Video · Contours of Restoration. Interspace</h4>
      ${yt('UJdV6lPrt4k', 'Contours of Restoration. Interspace — video')}
      <h4>Gallery</h4>
      ${gal('kontury', 10, 'Contours of Restoration')}
      <h4>Concept and approach</h4>
      <p>The name of the festival reflects two connected ideas.</p>
      <p><b>“Contours of Restoration”</b> — the search for new ways of making sense of the experience of war, memory and the changes society is going through.</p>
      <p><b>“Interspace”</b> — the territory of interaction between physical and digital environments, art and technology, personal experience and collective memory.</p>
      <p>The festival brought together different art practices in which digital technologies became not only a means of making artworks but also a tool for exploring today's reality.</p>
      <h4>A festival during a blackout</h4>
      <p>One of the defining features of the festival was the conditions under which it took place.</p>
      <p>The event was held during a full blackout in Poltava. The exhibition and educational activities unfolded across five floors of the regional library.</p>
      <p>The lack of usual lighting and electricity became part of the festival's context. Instead of cancelling the event, the team kept working and created a space for art, meetings and interaction.</p>
      <blockquote>In the dark, people create light.</blockquote>
      <p>This idea became one of the key symbolic dimensions of the festival.</p>
      <div class="stats"><div><b>1st</b><small>digital art festival in Poltava</small></div><div><b>5</b><small>floors of the regional library</small></div><div><b>UA + 🌍</b><small>Ukrainian and international digital artists</small></div></div>
      <h4>Programme</h4>
      <p>The festival combined exhibition, educational and communication programmes. Formats included:</p>
      <div class="chips"><span>digital and media art</span><span>VR and video art</span><span>art installations</span><span>talks and public meetings</span><span>workshops and masterclasses</span><span>interdisciplinary education</span></div>
      <p>Ukrainian and international digital artists and cultural practitioners took part.</p>
      <p>The festival gave local audiences a chance to discover contemporary digital art practices and enabled professional exchange between people from different cultural scenes.</p>
      <h4>Organisation and support</h4>
      <p>The festival was organised by NGO “Creative Area of Thinking” with support from NOVA United within its sub-grant programme for civil society organisations in Poltava.</p>
      <p>For the organisation it was important experience in raising grant funding, cultural production and creating a large interdisciplinary event in the region.</p>
      <h4>Significance for the city</h4>
      <p>“Contours of Restoration. Interspace” set a precedent for presenting contemporary digital art in Poltava in a festival format.</p>
      <p>The project expanded the possibilities of the local cultural scene, created space for artists from different cities to interact and presented digital art as a full part of the contemporary cultural process.</p>
      <p>For NGO “Creative Area of Thinking” the festival was an important stage in developing art and interdisciplinary practices and a foundation for further initiatives, including the METANOIA festival in 2026.</p>
      <blockquote>“Contours of Restoration. Interspace” is about the ability to create new meanings even when there is darkness all around.</blockquote>`,
      links: ['digitalfestpoltava.com'] },
    links: [{ t: 'digitalfestpoltava.com', u: 'https://digitalfestpoltava.com/' }]
  },
  {
    id: 'inter3lab', title: 'Inter3Lab Poltava', meta: '2024 · Полтава', badge: 'Резиденція', cat: ['public', 'intl'], pc: '#F062B8', img: 'img/inter3lab-poster.webp', pos: '50% 40%',
    short: '«Межі пам\'яті»: митці з Польщі, Грузії та України про деколонізацію й деімперіалізацію. ГО «КОМ» — кураторство та адміністрування бібліотечної локації.',
    tags: ['Публічні інтервенції', 'Україна · Польща · Грузія', 'Пам\'ять'],
    lead: `Inter3Lab Poltava — міжнародна мистецька резиденція публічних інтервенцій, що перетворила міський простір Полтави на відкриту платформу для сучасного мистецтва, дослідження пам'яті та взаємодії між міжнародними митцями й локальною спільнотою.`,
    body: `<p>Полтавська резиденція відбулася в межах міжнародної програми One Europe One Caucasus II / Inter3Labs. Її локальна назва — «Межі пам'яті» — окреслила головний напрям роботи: дослідження того, як місто зберігає, змінює та переосмислює власні історії, культурні й історичні наративи.</p>
      <h4>Бібліотечна локація</h4>
      <dl class="facts">
        <div><dt>Рік</dt><dd>2024</dd></div>
        <div><dt>Локація</dt><dd>Полтавська обласна універсальна наукова бібліотека ім. І. П. Котляревського — одна з п'яти локацій проєкту</dd></div>
        <div><dt>Кураторство</dt><dd>Роксолана Дудка (разом із Вітеком Хебановським); менеджерка — Наталя Баранник</dd></div>
        <div><dt>Партнери</dt><dd>ГО «Конгрес активістів культури», The Other Space Foundation; співфінансування — «Креативна Європа» та МЗС Польщі («Публічна дипломатія 2024»)</dd></div>
      </dl>
      <h4>Маршрут бібліотекою · фото</h4>
      <div class="filmstrip-wrap">
        <div class="filmstrip" tabindex="0" aria-label="Фото з бібліотечної локації — гортайте вбік">
          ${Array.from({ length: 11 }, (_, i) => { const n = String(i + 1).padStart(2, '0'); return `<figure class="stop"><img src="img/gal/inter3lab-${n}.webp" alt="Inter3Lab Poltava, бібліотека — фото ${i + 1}" loading="lazy"><figcaption><b>${n}</b> / 11</figcaption></figure>`; }).join('')}
        </div>
        <div class="filmstrip-nav"><button type="button" data-fs="-1" aria-label="Назад">←</button><span>гортайте маршрут</span><button type="button" data-fs="1" aria-label="Далі">→</button></div>
      </div>
      <h4>Відео · Inter3Lab Poltava</h4>
      ${yt('aQQe517zkfg', 'Inter3Lab Poltava — відео')}
      <h4>За 2 дні презентації в бібліотеці</h4>
      <div class="stats"><div><b>~500</b><small>відвідувачів</small></div><div><b>6</b><small>відеоробіт у паралельному показі</small></div><div><b>live</b><small>постійні перформанси</small></div></div>
      <div class="chips"><span>зустрічі з митцями</span><span>авторські екскурсії</span><span>інсталяції</span><span>фотопроєкт польської мисткині</span></div>
      <h4>Концепція та підхід</h4>
      <p>Inter3Lab запропонував модель мистецької роботи, у якій місто ставало не просто місцем проведення подій, а безпосереднім матеріалом для художнього дослідження.</p>
      <p>Митці працювали з конкретними локаціями, їхньою історією, архітектурою, функціями та пам'яттю мешканців. Важливими темами стали декомунізація, деколонізація, переосмислення міської спадщини та дослідження суперечливих сторінок історії Полтави.</p>
      <p>Замість демонстрації заздалегідь створених робіт резиденція передбачала занурення в локальний контекст: знайомство з містом, спілкування з людьми, дослідження просторів і створення мистецьких інтервенцій у безпосередньому зв'язку з місцем.</p>
      <h4>Місто як виставковий простір</h4>
      <p>Проєкт не обмежувався галереєю чи культурною інституцією. Виставковим простором стала сама Полтава: вулиці, площі, двори, громадські будівлі та колишні культурні простори.</p>
      <p>У межах полтавської програми було реалізовано 24 окремі мистецькі проєкти. Художники працювали з інсталяцією, перформансом, театром, танцем, фотографією, аудіовізуальним мистецтвом, архітектурою та партисипативними практиками.</p>
      <p>У листопаді 2024 року відбулася публічна артпрогулянка, що об'єднала мистецькі інтервенції, виставки, театральні виступи та екскурсії. Участь у полтавській програмі взяли митці з України та Грузії.</p>
      <p>Так міський маршрут перетворився на простір знайомства з різними художніми висловлюваннями, а мешканці отримали можливість взаємодіяти з мистецтвом безпосередньо у звичному міському середовищі.</p>
      <div class="stats"><div><b>24</b><small>окремі мистецькі проєкти</small></div><div><b>11.2024</b><small>публічна артпрогулянка</small></div><div><b>UA · PL · GE</b><small>митці резиденції</small></div></div>
      <h4>Роль ГО «Креативна область Мислення»</h4>
      <p>Команда ГО «Креативна область Мислення» долучилася до локальної організаційної та логістичної підтримки Inter3Lab у Полтаві. Організація сприяла комунікації, взаємодії з локальним контекстом, роботі з локаціями та практичній координації процесів під час реалізації мистецької програми. На бібліотечній локації резиденції команда ГО «КОМ» відповідала за кураторство та адміністрування.</p>
      <p>Таким чином, участь ГО відбувалася на рівні локального культурного посередництва та організаційного забезпечення міжнародного мистецького процесу.</p>
      <p>Представниця організації Роксолана Дудка поєднала кураторську роботу з власною мистецькою практикою в межах резиденції.</p>
      <h4>Міжнародна співпраця</h4>
      <p>Inter3Lab став прикладом взаємодії міжнародної мистецької програми з конкретним міським середовищем. Художники з різних країн працювали з локальною історією Полтави, вступали в діалог із мешканцями та створювали роботи, що виникали безпосередньо з дослідження міста.</p>
      <p>Проєкт реалізовувався в межах програми One Europe One Caucasus II за підтримки Міністерства закордонних справ Польщі в межах програми Public Diplomacy 2024 та Creative Europe.</p>
      <p>Для ГО «Креативна область Мислення» ця співпраця стала важливим досвідом роботи з міжнародними культурними процесами, міждисциплінарними командами та локальним мистецьким середовищем.</p>
      <h4>Значення для міста та подальшої роботи</h4>
      <p>Inter3Lab продемонстрував, що міська історія, архітектура, публічні простори та особисті спогади мешканців можуть ставати повноцінним матеріалом для сучасного мистецтва. Проєкт відкрив можливість інакше подивитися на звичні міські локації, поставити питання про пам'ять і спадщину та залучити мешканців до взаємодії з актуальними мистецькими практиками.</p>
      <p>Для ГО цей досвід став одним із важливих етапів розвитку компетенцій у сфері кураторства, локальної координації, міжнародної комунікації та роботи з публічним простором.</p>
      <blockquote>Inter3Lab Poltava — досвід, у якому міжнародне мистецтво зустрілося з локальною пам'яттю, а саме місто стало простором для нового прочитання власної історії.</blockquote>`,
    en: { title: 'Inter3Lab Poltava', meta: '2024 · Poltava', badge: 'Residency',
      short: '“Borders of Memory”: artists from Poland, Georgia and Ukraine on decolonisation and de-imperialisation. The NGO curated and managed the library venue.',
      tags: ['Public interventions', 'Ukraine · Poland · Georgia', 'Memory'],
      lead: `Inter3Lab Poltava is an international art residency of public interventions that turned Poltava's urban space into an open platform for contemporary art, the exploration of memory and interaction between international artists and the local community.`,
      body: `<p>The Poltava residency took place within the international programme One Europe One Caucasus II / Inter3Labs. Its local title — “Borders of Memory” — defined the main focus: exploring how a city preserves, changes and rethinks its own stories and its cultural and historical narratives.</p>
      <h4>Library venue</h4>
      <dl class="facts">
        <div><dt>Year</dt><dd>2024</dd></div>
        <div><dt>Venue</dt><dd>Poltava Regional Universal Scientific Library named after I. P. Kotliarevsky — one of the five venues of the project</dd></div>
        <div><dt>Curators</dt><dd>Roksolana Dudka (together with Witek Chebanowski); manager — Natalia Barannyk</dd></div>
        <div><dt>Partners</dt><dd>NGO “Congress of Cultural Activists”, The Other Space Foundation; co-funded by Creative Europe and the Ministry of Foreign Affairs of Poland (“Public Diplomacy 2024”)</dd></div>
      </dl>
      <h4>A route through the library · photos</h4>
      <div class="filmstrip-wrap">
        <div class="filmstrip" tabindex="0" aria-label="Photos from the library venue — scroll sideways">
          ${Array.from({ length: 11 }, (_, i) => { const n = String(i + 1).padStart(2, '0'); return `<figure class="stop"><img src="img/gal/inter3lab-${n}.webp" alt="Inter3Lab Poltava, library — photo ${i + 1}" loading="lazy"><figcaption><b>${n}</b> / 11</figcaption></figure>`; }).join('')}
        </div>
        <div class="filmstrip-nav"><button type="button" data-fs="-1" aria-label="Back">←</button><span>scroll the route</span><button type="button" data-fs="1" aria-label="Next">→</button></div>
      </div>
      <h4>Video · Inter3Lab Poltava</h4>
      ${yt('aQQe517zkfg', 'Inter3Lab Poltava — video')}
      <h4>Two days of presentations at the library</h4>
      <div class="stats"><div><b>~500</b><small>visitors</small></div><div><b>6</b><small>video works in a parallel screening</small></div><div><b>live</b><small>continuous performances</small></div></div>
      <div class="chips"><span>meetings with artists</span><span>authors' tours</span><span>installations</span><span>photo project by a Polish artist</span></div>
      <h4>Concept and approach</h4>
      <p>Inter3Lab proposed a model of artistic work in which the city became not just a venue for events but the very material for artistic research.</p>
      <p>Artists worked with specific locations, their history, architecture, functions and the memory of residents. Key themes were decommunisation, decolonisation, rethinking urban heritage and exploring the controversial pages of Poltava's history.</p>
      <p>Instead of showing pre-made works, the residency meant immersion in the local context: getting to know the city, talking to people, exploring spaces and creating art interventions in direct connection with the place.</p>
      <h4>The city as an exhibition space</h4>
      <p>The project was not limited to a gallery or a cultural institution. Poltava itself became the exhibition space: streets, squares, courtyards, public buildings and former cultural venues.</p>
      <p>The Poltava programme included 24 separate art projects. Artists worked with installation, performance, theatre, dance, photography, audiovisual art, architecture and participatory practices.</p>
      <p>In November 2024 a public art walk brought together art interventions, exhibitions, theatre performances and tours. Artists from Ukraine and Georgia took part in the Poltava programme.</p>
      <p>The city route thus became a space for encountering different artistic statements, and residents had the chance to interact with art directly in their familiar urban environment.</p>
      <div class="stats"><div><b>24</b><small>separate art projects</small></div><div><b>11.2024</b><small>public art walk</small></div><div><b>UA · PL · GE</b><small>residency artists</small></div></div>
      <h4>The role of NGO “Creative Area of Thinking”</h4>
      <p>The NGO team provided local organisational and logistical support for Inter3Lab in Poltava. The organisation helped with communication, engagement with the local context, work with venues and practical coordination during the art programme. At the library venue of the residency, the CAT team was responsible for curation and management.</p>
      <p>The NGO's participation thus took the form of local cultural mediation and organisational support for an international art process.</p>
      <p>The organisation's representative Roksolana Dudka combined curatorial work with her own art practice within the residency.</p>
      <h4>International cooperation</h4>
      <p>Inter3Lab became an example of how an international art programme can interact with a specific urban environment. Artists from different countries worked with Poltava's local history, entered into dialogue with residents and created works that grew directly out of researching the city.</p>
      <p>The project was implemented within One Europe One Caucasus II with support from the Ministry of Foreign Affairs of Poland under the Public Diplomacy 2024 programme and Creative Europe.</p>
      <p>For NGO “Creative Area of Thinking” this cooperation was important experience of working with international cultural processes, interdisciplinary teams and the local art scene.</p>
      <h4>Significance for the city and further work</h4>
      <p>Inter3Lab showed that urban history, architecture, public spaces and residents' personal memories can become full-fledged material for contemporary art. The project made it possible to look differently at familiar places, raise questions of memory and heritage and involve residents in contemporary art practices.</p>
      <p>For the NGO this experience was an important stage in developing competences in curation, local coordination, international communication and work with public space.</p>
      <blockquote>Inter3Lab Poltava — an experience in which international art met local memory, and the city itself became a space for a new reading of its own history.</blockquote>`,
      links: ['Presentation video'] },
    links: [{ t: 'Відео з презентації', u: 'https://www.instagram.com/p/DG0bwvupoz3/' }]
  },
  {
    id: 'zavyaz', title: 'Культурний менеджмент', dtitle: '«Зав\'язь» — воркшоп для культурних діячів', meta: '2026 · Полтава · воркшоп «Зав\'язь»', badge: 'Освіта', cat: ['community'], pc: '#cfc8b6',
    img: 'img/zav-group.webp',
    short: 'Освіта, професійний розвиток і обмін досвідом: чотириденний інтенсив «Зав\'язь», з якого виріс фестиваль «Намисто».',
    tags: ['Культурний менеджмент', 'Освіта', 'Партнерства', 'Грант'],
    lead: `Ми розглядаємо освіту як важливу складову розвитку незалежного культурного середовища.`,
    body: `<p>Працюємо над посиленням власних компетенцій у сфері культурного менеджменту, продюсування, комунікацій, партнерств і роботи з культурною спадщиною, а також долучаємося до освітніх програм, професійних зустрічей та міждисциплінарних обмінів.</p>
      <p>Для нас навчання — це не лише здобуття нових знань, а й можливість переосмислювати власні підходи, знаходити партнерів і перетворювати ідеї на реальні культурні проєкти.</p>
      <h4>Фото</h4>
      <div class="gallery"><img src="img/zav-group.webp" alt="Учасники воркшопу «Зав'язь»" loading="lazy"><img src="img/zav-pitch.webp" alt="Презентація проєкту «Намисто» на пітчингу" loading="lazy"><img src="img/zav-award.webp" alt="Вручення сертифіката переможцям" loading="lazy"><img src="img/zav-walk.webp" alt="Учасники воркшопу в місті" loading="lazy"></div>
      <h4>«Зав'язь» — воркшоп для культурних діячів</h4>
      <p>У 2026 році команда ГО «Креативна область Мислення» взяла участь у чотириденному інтенсиві «Зав'язь», організованому культурною агенцією «Терени» в Полтаві.</p>
      <p>Програма охоплювала культурний менеджмент, фінансування проєктів, побудову партнерств, комунікаційні стратегії, роботу в умовах війни, пам'ять і меморіалізацію. Учасники також знайомилися з діяльністю культурних інституцій та міжнародних фондів, зокрема Міжнародного фонду «Відродження» і Goethe-Institut.</p>
      <div class="stats"><div><b>4</b><small>дні інтенсиву</small></div><div><b>Топ-3</b><small>серед переможців</small></div><div><b>2 000 €</b><small>на реалізацію + менторство</small></div></div>
      <p>Важливим етапом стала презентація учасницьких ідей та фінальний пітчинг. У співпраці з ГО «О'Комова» (Кременчук) і ГО «ДВІЖЛАБ» (Полтава) наша команда представила концепцію міжрегіонального проєкту «Намисто» — культурного обміну між двома містами. Проєкт увійшов до трійки переможців і отримав грантову підтримку в розмірі 2 000 євро на реалізацію, а також менторський супровід культурної агенції «Терени». Згодом ця ідея стала дводенним шоукейс-фестивалем сучасного мистецтва Полтави й Кременчука.</p>
      <p>Участь у програмі стала для команди можливістю переглянути внутрішні процеси, посилити професійні навички та налагодити нові міжрегіональні зв'язки.</p>
      <p style="font-size:13px">Організатор програми «Зав'язь» — культурна агенція «Терени», за підтримки Міжнародного фонду «Відродження» та Goethe-Institut. Фото — Станіслава Пантелей.</p>`,
    en: { title: 'Cultural management', dtitle: '“Zaviaz” — a workshop for cultural practitioners', meta: '2026 · Poltava · “Zaviaz” workshop', badge: 'Education',
      short: 'Education, professional development and exchange: the four-day intensive “Zaviaz”, from which the NAMYSTO festival grew.',
      tags: ['Cultural management', 'Education', 'Partnerships', 'Grant'],
      lead: `We see education as an important part of developing an independent cultural environment.`,
      body: `<p>We work on strengthening our own competences in cultural management, production, communications, partnerships and work with cultural heritage, and we take part in educational programmes, professional meetings and interdisciplinary exchanges.</p>
      <p>For us, learning is not only about gaining new knowledge but also an opportunity to rethink our own approaches, find partners and turn ideas into real cultural projects.</p>
      <h4>Photos</h4>
      <div class="gallery"><img src="img/zav-group.webp" alt="Participants of the Zaviaz workshop" loading="lazy"><img src="img/zav-pitch.webp" alt="Presentation of the NAMYSTO project at the pitch" loading="lazy"><img src="img/zav-award.webp" alt="Awarding the winners' certificate" loading="lazy"><img src="img/zav-walk.webp" alt="Workshop participants in the city" loading="lazy"></div>
      <h4>“Zaviaz” — a workshop for cultural practitioners</h4>
      <p>In 2026 the team of NGO “Creative Area of Thinking” took part in the four-day intensive “Zaviaz”, organised by the cultural agency “Tereny” in Poltava.</p>
      <p>The programme covered cultural management, project funding, building partnerships, communication strategies, working in wartime, memory and memorialisation. Participants also learned about the work of cultural institutions and international foundations, including the International Renaissance Foundation and the Goethe-Institut.</p>
      <div class="stats"><div><b>4</b><small>days of intensive</small></div><div><b>Top 3</b><small>among the winners</small></div><div><b>€2,000</b><small>for the project + mentoring</small></div></div>
      <p>An important stage was the presentation of participants' ideas and the final pitch. Together with NGO “O'Komova” (Kremenchuk) and NGO “Dvizh Lab” (Poltava), our team presented the concept of the interregional project NAMYSTO — a cultural exchange between the two cities. The project was among the three winners and received a grant of €2,000 for implementation as well as mentoring from the cultural agency “Tereny”. The idea later became a two-day showcase festival of contemporary art from Poltava and Kremenchuk.</p>
      <p>Taking part in the programme gave the team a chance to review internal processes, strengthen professional skills and build new interregional connections.</p>
      <p style="font-size:13px">The “Zaviaz” programme was organised by the cultural agency “Tereny” with support from the International Renaissance Foundation and the Goethe-Institut. Photos — Stanislava Pantelei.</p>`,
      links: [] },
    links: []
  }
];

const grid = $('#projGrid');
const posterImg = src => `<img class="pbg" src="${src}" alt="" aria-hidden="true"><img class="pfg" src="${src}" alt="" loading="lazy">`;
const media = p => p.poster ? posterImg(p.img) : p.img ? `<img src="${p.img}" alt="${L(p, 'title')} — ${isEn() ? 'Creative Area of Thinking, Poltava' : 'Креативна область мислення, Полтава'}" loading="lazy"${p.pos ? ` style="object-position:${p.pos}"` : ''}>` : ART[p.art]();
let firstRender = true;
function renderGrid() {
  const f = ($('#filters .on') || {}).dataset?.f || 'all';
  grid.innerHTML = P.map((p, i) => `
    <${p.href ? `a href="${FRAMED && p.hrefClaude ? p.hrefClaude : p.href}" target="_blank" rel="noopener"` : 'button'} class="card${firstRender ? '' : ' in'}${f !== 'all' && !p.cat.includes(f) ? ' hide' : ''}" data-id="${p.id}" data-cat="${p.cat.join(' ')}" style="--pc:${p.pc};transition-delay:${firstRender ? (i % 3) * 80 : 0}ms">
      <div class="card-media${p.poster ? ' is-poster' : ''}">
        <span class="card-badge${p.live ? ' live' : ''}">${L(p, 'badge')}</span>
        <span class="card-arrow" aria-hidden="true">${p.href ? "↗" : "→"}</span>
        ${media(p)}
      </div>
      <div class="card-body">
        <span class="card-meta">${L(p, 'meta')}</span>
        <h3>${L(p, 'title')}</h3>
        <p>${L(p, 'short')}</p>
        <div class="card-tags">${L(p, 'tags').map(x => `<span>${x}</span>`).join('')}</div>
      </div>
    </${p.href ? 'a' : 'button'}>`).join('');
  if (firstRender) { $$('.card', grid).forEach(c => cardObs.observe(c)); firstRender = false; }
}
const cardObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); cardObs.unobserve(e.target); } }), { threshold: .1 });
renderGrid();

$$('#filters button').forEach(b => b.addEventListener('click', () => {
  $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
  const f = b.dataset.f;
  $$('.card', grid).forEach(c => c.classList.toggle('hide', f !== 'all' && !c.dataset.cat.split(' ').includes(f)));
}));

/* ---------- DRAWER ---------- */
const dr = $('#drawer');
let lastFocus = null, openId = null;
function fillMedia(p) { $('#dMedia').style.setProperty('--pc', p.pc); $('#dMedia').classList.toggle('is-poster', !!p.poster && !p.hero); if (p.poster && !p.hero) { $('#dMedia').innerHTML = posterImg(p.img); return; } const src = p.hero || p.img; $('#dMedia').innerHTML = src ? `<img src="${src}" alt=""${!p.hero && p.pos ? ` style="object-position:${p.pos}"` : ''}>` : ART[p.art](); }
function openP(id) {
  const p = P.find(x => x.id === id); if (!p) return;
  lastFocus = document.activeElement; openId = id;
  fillMedia(p);
  $('#dMeta').textContent = L(p, 'meta');
  $('#dTitle').textContent = isEn() && p.en ? (p.en.dtitle || p.en.title) : (p.dtitle || p.title);
  $('#dLead').textContent = L(p, 'lead');
  $('#dText').innerHTML = L(p, 'body');
  $('#dTags').innerHTML = L(p, 'tags').map(x => `<span>${x}</span>`).join('');
  const lt = (l, i) => (isEn() && p.en && p.en.links && p.en.links[i]) || l.t;
  $('#dLinks').innerHTML = (p.links || []).map((l, i) => l.u
    ? `<a href="${l.u}" target="_blank" rel="noopener">${lt(l, i)} ↗</a>`
    : `<a class="pending" href="#" onclick="return false" title="${tr('Посилання додамо')}">${lt(l, i)} · ${tr('скоро')}</a>`).join('');
  $('#dLinksTop').innerHTML = $('#dLinks').innerHTML;
  $('#dLinksTop').hidden = !(p.links || []).length;
  dr.classList.add('open'); dr.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
  $('.drawer-panel').scrollTop = 0;
  $('.drawer-close').focus();
  try { history.replaceState(null, '', '#p-' + id); } catch (e) {}
}
function closeP() {
  dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); openId = null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  if (lastFocus) lastFocus.focus();
}
/* сторінка-застосунок усередині сайту (коли нову вкладку відкрити не можна, напр. на claude.ai) */
let appLayer = null;
function openApp(href, title) {
  if (!appLayer) {
    appLayer = document.createElement('div');
    appLayer.className = 'app-layer';
    appLayer.setAttribute('role', 'dialog'); appLayer.setAttribute('aria-modal', 'true');
    appLayer.innerHTML = `<div class="app-bar"><span class="app-title"></span><button type="button" class="app-close" aria-label="${tr('Закрити')}">${tr('✕ Закрити')}</button></div><iframe class="app-frame" title=""></iframe>`;
    document.body.appendChild(appLayer);
    $('.app-close', appLayer).addEventListener('click', closeApp);
  }
  $('.app-title', appLayer).textContent = title;
  const fr = $('.app-frame', appLayer); fr.title = title; fr.src = href;
  appLayer.classList.add('open'); document.body.classList.add('lock');
  $('.app-close', appLayer).focus();
}
function closeApp() { if (!appLayer) return; appLayer.classList.remove('open'); $('.app-frame', appLayer).src = 'about:blank'; document.body.classList.remove('lock'); }
addEventListener('keydown', e => { if (e.key === 'Escape' && appLayer && appLayer.classList.contains('open')) closeApp(); });

grid.addEventListener('click', e => {
  const c = e.target.closest('.card'); if (!c) return;
  if (c.tagName !== 'A') { openP(c.dataset.id); return; }
  const pr = P.find(x => x.id === c.dataset.id);
  if (FRAMED && !(pr && pr.hrefClaude)) { e.preventDefault(); openApp(c.getAttribute('href'), c.querySelector('h3').textContent); }
});
$$('[data-open]').forEach(b => b.addEventListener('click', () => openP(b.dataset.open)));
$$('[data-close]', dr).forEach(b => b.addEventListener('click', closeP));
addEventListener('keydown', e => { if (e.key === 'Escape' && dr.classList.contains('open')) closeP(); });
if (location.hash.startsWith('#p-')) openP(location.hash.slice(3));

/* ---------- LIGHTBOX для галерей ---------- */
const lb = $('#lightbox'), lbImg = $('img', lb), lbCount = $('.lb-count', lb);
let lbList = [], lbI = 0;
function lbShow(i) { lbI = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbI].src; lbImg.alt = lbList[lbI].alt; lbCount.textContent = (lbI + 1) + ' / ' + lbList.length; }
$('#dText').addEventListener('click', e => {
  const lite = e.target.closest('.yt-lite');
  if (lite && !FRAMED) {
    e.preventDefault();
    lite.outerHTML = `<figure class="yt-embed"><iframe src="https://www.youtube-nocookie.com/embed/${lite.dataset.yt}?rel=0&autoplay=1" title="${lite.dataset.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></figure>`;
    return;
  }
  const fsBtn = e.target.closest('[data-fs]');
  if (fsBtn) { const fs = $('.filmstrip', fsBtn.closest('.filmstrip-wrap')); fs.scrollBy({ left: +fsBtn.dataset.fs * fs.clientWidth * .8, behavior: 'smooth' }); return; }
  const img = e.target.closest('.gallery img, .filmstrip img'); if (!img) return;
  lbList = img.closest('.filmstrip') ? $$('img', img.closest('.filmstrip')) : $$('img', img.parentElement); lb.classList.add('open'); lbShow(lbList.indexOf(img)); $('.lb-close', lb).focus();
});
const lbClose = () => lb.classList.remove('open');
$('.lb-close', lb).addEventListener('click', lbClose);
$('.lb-prev', lb).addEventListener('click', () => lbShow(lbI - 1));
$('.lb-next', lb).addEventListener('click', () => lbShow(lbI + 1));
lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') { e.stopImmediatePropagation(); lbClose(); }
  if (e.key === 'ArrowLeft') lbShow(lbI - 1);
  if (e.key === 'ArrowRight') lbShow(lbI + 1);
}, true);

/* =========================================================
   ПЕРЕМИКАЧ ТЕМ — світла (графічна) / темна (туманність)
   ========================================================= */
const toggle = $('#themeToggle'), metaTheme = $('meta[name="theme-color"]');
function syncUi() {
  const d = isDark();
  toggle.setAttribute('aria-pressed', d);
  toggle.title = tr(d ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
  metaTheme.setAttribute('content', d ? '#06050B' : '#EEEBE3');
}
function applyTheme(next) {
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('kom-theme', next); } catch (e) {}
  syncUi();
  initField(); if (reduce) renderStatic();
  renderGrid();
  if (openId) fillMedia(P.find(x => x.id === openId));
}
syncUi();
toggle.addEventListener('click', e => {
  const next = isDark() ? 'light' : 'dark';
  if (!document.startViewTransition || reduce || document.hidden) { applyTheme(next); return; }
  const r = toggle.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(() => applyTheme(next));
  vt.finished.catch(() => {}); vt.updateCallbackDone.catch(() => {});
  vt.ready.then(() => {
    root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' });
  }).catch(() => {});
});

/* =========================================================
   ПЕРЕМИКАЧ МОВИ — UA / EN (конструктор має власний переклад)
   ========================================================= */
const ukText = new WeakMap(), ukAttr = new WeakMap();
const SKIP = '#projGrid, #dText, #dTitle, #dLead, #dMeta, #dTags, #dLinks, #dLinksTop, .lang, script, style';
const UK_META = { title: document.title, desc: ($('meta[name="description"]') || {}).content };
function applyLang() {
  root.lang = isEn() ? 'en' : 'uk';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!ukText.has(n)) { if (!n.nodeValue.trim()) continue; ukText.set(n, n.nodeValue); }
    const uk = ukText.get(n), key = uk.replace(/\s+/g, ' ').trim();
    if (isEn() && EN[key]) { const m = uk.match(/^(\s*)[\s\S]*?(\s*)$/); n.nodeValue = m[1] + EN[key] + m[2]; } else n.nodeValue = uk;
  }
  for (const el of document.querySelectorAll('[aria-label], [title], [alt]')) {
    if (el.closest('#projGrid, #dText, #dMedia')) continue;
    let o = ukAttr.get(el); if (!o) { o = {}; for (const a of ['aria-label', 'title', 'alt']) if (el.hasAttribute(a)) o[a] = el.getAttribute(a); ukAttr.set(el, o); }
    for (const a in o) el.setAttribute(a, isEn() && EN[o[a]] ? EN[o[a]] : o[a]);
  }
  document.title = isEn() ? (window.KOM_EN_META || {}).title || UK_META.title : UK_META.title;
  const md = $('meta[name="description"]'); if (md) md.content = isEn() ? (window.KOM_EN_META || {}).description || UK_META.desc : UK_META.desc;
  const lb = $('#langToggle');
  if (lb) { $$('[data-l]', lb).forEach(sp => sp.classList.toggle('on', sp.dataset.l === LANG)); lb.setAttribute('aria-pressed', isEn()); lb.title = isEn() ? 'Українською' : 'English'; }
}
function setLang(l) {
  LANG = l; try { localStorage.setItem('kom-lang', l); } catch (e) {}
  applyLang(); syncUi(); renderGrid(); initField(); if (reduce) renderStatic();
  if (openId) { const id = openId; openP(id); }
}
const langBtn = $('#langToggle');
if (langBtn) langBtn.addEventListener('click', () => setLang(isEn() ? 'uk' : 'en'));
applyLang(); syncUi();
if (isEn()) { renderGrid(); initField(); if (reduce) renderStatic(); }
})();
