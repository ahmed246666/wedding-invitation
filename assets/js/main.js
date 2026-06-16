/* ============================================================
   MAIN  — reads CONFIG (see config.js) and wires up the page
   ============================================================ */

const d = CONFIG.date;
const target = new Date(d.year, d.month - 1, d.day, d.hour, d.minute, 0);

/* ---------- FOOTER DATE ---------- */
function formatDateHtml(day, month, year){
  const num = n => `<span class="date-num">${n}</span>`;
  const sep = `<span class="date-sep">–</span>`;
  return num(day) + sep + num(month) + sep + num(year);
}
document.getElementById('footerDate').innerHTML = formatDateHtml(d.day, d.month, d.year);

/* ---------- COUNTDOWN ---------- */
const cd = document.getElementById('countdown');
const labels = {d:'Days',h:'Hours',m:'Minutes',s:'Seconds'};
function tick(){
  const now = new Date();
  let diff = Math.floor((target - now)/1000);
  if (diff <= 0){
    cd.innerHTML = '<p class="count-msg">Today is the day! 🤍</p>';
    return;
  }
  const days=Math.floor(diff/86400); diff-=days*86400;
  const hrs=Math.floor(diff/3600); diff-=hrs*3600;
  const mins=Math.floor(diff/60); const secs=diff-mins*60;
  const box=(n,key)=>`<div class="count-box"><div class="count-num">${String(n).padStart(2,'0')}</div>
    <div class="count-label">${labels[key]}</div></div>`;
  cd.innerHTML = box(days,'d')+box(hrs,'h')+box(mins,'m')+box(secs,'s');
}
tick(); setInterval(tick,1000);

/* ---------- DIRECTIONS ---------- */
document.getElementById('mapBtn').href = CONFIG.venue.mapsUrl;

/* ---------- ADD TO CALENDAR (Google) ---------- */
function fmt(dt){return dt.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';}
const calEnd = new Date(target.getTime() + CONFIG.durationHours*3600*1000);
const calTitle = encodeURIComponent(CONFIG.calendarTitle);
const calLoc = encodeURIComponent(CONFIG.venue.name + ', ' + CONFIG.venue.address);
document.getElementById('calBtn').href =
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${fmt(target)}/${fmt(calEnd)}&location=${calLoc}`;
document.getElementById('calBtn').target = '_blank';

/* ---------- PAGE NAVIGATION ---------- */
(function(){
  const pagesEl   = document.getElementById('pages');
  const pageEls   = Array.from(document.querySelectorAll('.page'));
  const navUp     = document.getElementById('navUp');
  const navDown   = document.getElementById('navDown');
  const dotsEl    = document.getElementById('pageDots');
  const pageNavEl = document.getElementById('pageNav');

  /* pages 0 (hero), 1 (split), and last (footer) have dark backgrounds */
  const DARK_PAGES = new Set([0, 1, pageEls.length - 1]);

  let cur = 0;

  /* build dot buttons */
  pageEls.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'page-dot';
    btn.setAttribute('aria-label', `Page ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(btn);
  });

  function pageHeight(){
    return pageEls[0].offsetHeight || window.innerHeight;
  }

  function revealPage(idx){
    pageEls[idx].querySelectorAll('.reveal:not(.in)')
      .forEach(el => el.classList.add('in'));
  }

  function sync(){
    const dots = dotsEl.querySelectorAll('.page-dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === cur));
    navUp.disabled  = cur === 0;
    navDown.disabled = cur === pageEls.length - 1;
    pageNavEl.classList.toggle('dark', DARK_PAGES.has(cur));
  }

  function goTo(n){
    n = Math.max(0, Math.min(pageEls.length - 1, n));
    cur = n;
    pagesEl.scrollTo({ top: n * pageHeight(), behavior: 'smooth' });
    sync();
    revealPage(n);
  }

  navUp.addEventListener('click',   () => goTo(cur - 1));
  navDown.addEventListener('click', () => goTo(cur + 1));

  /* keep state in sync when user scrolls with trackpad / touch */
  let ticking = false;
  pagesEl.addEventListener('scroll', () => {
    if (!ticking){
      requestAnimationFrame(() => {
        const idx = Math.round(pagesEl.scrollTop / pageHeight());
        if (idx !== cur){
          cur = idx;
          sync();
          revealPage(idx);
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  /* keyboard navigation */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown'){ e.preventDefault(); goTo(cur + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')  { e.preventDefault(); goTo(cur - 1); }
  });

  /* initialise */
  sync();
  revealPage(0);
})();

/* ---------- HERO WORD-BY-WORD ANIMATION ---------- */
(function(){
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const STAGGER = 0.22;
  let idx = 0;

  function wordSpan(text){
    const span = document.createElement('span');
    span.className = 'hero-word';
    span.style.setProperty('--word-delay', `${idx * STAGGER}s`);
    span.textContent = text;
    idx++;
    return span;
  }

  function splitText(el){
    [...el.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE){
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else if (part) frag.appendChild(wordSpan(part));
        });
        el.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE){
        if (child.tagName === 'BR') return;
        if (child.classList.contains('amp')){
          const span = wordSpan(child.textContent.trim());
          span.classList.add('amp');
          el.replaceChild(span, child);
        } else {
          splitText(child);
        }
      }
    });
  }

  ['.eyebrow', '.couple', '.hero-date'].forEach(sel => {
    const el = hero.querySelector(sel);
    if (el) splitText(el);
  });

  const ornament = hero.querySelector('.ornament');
  if (ornament){
    ornament.classList.add('hero-reveal');
    ornament.style.setProperty('--word-delay', `${idx * STAGGER}s`);
  }
})();
