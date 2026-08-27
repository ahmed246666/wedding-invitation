/* ============================================================
   MAIN  — reads CONFIG (see config.js) and wires up the page
   ============================================================ */

const d = CONFIG.date;
const target = new Date(d.year, d.month - 1, d.day, d.hour, d.minute, 0);

/* ---------- VIEWPORT HEIGHT (mobile / legacy fallback) ---------- */
(function(){
  function setVH(){
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => setTimeout(setVH, 150));
})();

function pageHeight(){
  const pagesEl = document.getElementById('pages');
  if (pagesEl && pagesEl.clientHeight > 0) return pagesEl.clientHeight;
  const firstPage = document.querySelector('.page');
  if (firstPage && firstPage.offsetHeight > 0) return firstPage.offsetHeight;
  return window.innerHeight;
}

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

  /* pages 0 (hero) and 1 (split) have dark backgrounds */
  const DARK_PAGES = new Set([0, 1]);

  let cur = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smoothScroll = !reducedMotion && 'scrollBehavior' in document.documentElement.style;

  /* ---------- AUTO SCROLL ---------- */
  const autoDelay = typeof CONFIG.autoScrollDelay === 'number' ? CONFIG.autoScrollDelay : 5500;
  let autoTimer = null;
  let userPaused = false;
  let resumeTimer = null;

  function clearAutoTimer(){
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function scheduleAutoScroll(delay = autoDelay){
    clearAutoTimer();
    if (!autoDelay || autoDelay <= 0 || userPaused) return;
    if (cur >= pageEls.length - 1) return; // stay on last page (comments)

    autoTimer = setTimeout(() => {
      if (!userPaused && cur < pageEls.length - 1){
        goTo(cur + 1);
      }
    }, delay);
  }

  function handleUserInteraction(){
    userPaused = true;
    clearAutoTimer();
    if (resumeTimer) clearTimeout(resumeTimer);
    // Resume auto-scroll after 14 seconds of inactivity if not typing
    resumeTimer = setTimeout(() => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA'){
        userPaused = false;
        scheduleAutoScroll(autoDelay);
      }
    }, 14000);
  }

  /* build dot buttons */
  pageEls.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'page-dot';
    btn.setAttribute('aria-label', `Page ${i + 1}`);
    btn.addEventListener('click', () => {
      handleUserInteraction();
      goTo(i);
    });
    dotsEl.appendChild(btn);
  });

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
    const musicBtnEl = document.getElementById('musicBtn');
    if (musicBtnEl) musicBtnEl.classList.toggle('dark', DARK_PAGES.has(cur));
  }

  function goTo(n){
    n = Math.max(0, Math.min(pageEls.length - 1, n));
    cur = n;
    const top = n * pageHeight();
    if (smoothScroll) pagesEl.scrollTo({ top, behavior: 'smooth' });
    else pagesEl.scrollTop = top;
    sync();
    revealPage(n);
    if (!userPaused) {
      scheduleAutoScroll();
    }
  }

  navUp.addEventListener('click',   () => { handleUserInteraction(); goTo(cur - 1); });
  navDown.addEventListener('click', () => { handleUserInteraction(); goTo(cur + 1); });

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
  }, { passive: true });

  pagesEl.addEventListener('wheel', handleUserInteraction, { passive: true });
  pagesEl.addEventListener('touchstart', handleUserInteraction, { passive: true });

  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      userPaused = true;
      clearAutoTimer();
    });
  });

  /* keyboard navigation */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown'){ e.preventDefault(); handleUserInteraction(); goTo(cur + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')  { e.preventDefault(); handleUserInteraction(); goTo(cur - 1); }
  });

  /* initialise */
  sync();
  revealPage(0);
  scheduleAutoScroll(6000); // start auto scroll after 6s on initial hero
})();

/* ---------- iOS detect (blend-mode fix + video unlock UI) ---------- */
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '')
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (isIOS) document.documentElement.classList.add('is-ios');

/* ---------- HERO VIDEO + WORD-BY-WORD ANIMATION ---------- */
(function(){
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = window.matchMedia('(max-width: 760px)');

  function activeVideo(){
    return hero.querySelector(mobileQuery.matches ? '.hero-video--mobile' : '.hero-video--web');
  }

  function initHeroAnimation(){
    if (reducedMotion) return;

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
  }

  function markReady(){
    if (hero.classList.contains('hero--ready')) return;
    hero.classList.add('hero--ready');
    initHeroAnimation();
  }

  if (reducedMotion){
    markReady();
    return;
  }

  const video = activeVideo();
  if (!video){
    markReady();
    return;
  }

  const inactive = hero.querySelector(mobileQuery.matches ? '.hero-video--web' : '.hero-video--mobile');
  if (inactive) inactive.preload = 'none';

  if (video.readyState >= 3) markReady();
  else video.addEventListener('canplay', markReady, { once: true });

  /* show content even if the video is slow or blocked */
  setTimeout(markReady, 4000);
})();

/* ---------- BACKGROUND VIDEOS (autoplay + iOS tap-to-unlock) ---------- */
(function(){
  const pagesEl = document.getElementById('pages');
  const pageEls = Array.from(document.querySelectorAll('.page'));
  if (!pagesEl || pageEls.length === 0) return;

  const mobileQuery = window.matchMedia('(max-width: 760px)');
  let userUnlocked = false;
  let lastActive = -1;
  let overlayEl = null;

  function visibleVideo(page){
    const selector = mobileQuery.matches ? '.hero-video--mobile' : '.hero-video--web';
    return page.querySelector(selector);
  }

  function setInlineSafe(video){
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.removeAttribute('controls');
  }

  function playVideo(video){
    if (!video) return Promise.resolve();
    setInlineSafe(video);
    const attempt = video.play();
    return attempt && typeof attempt.then === 'function' ? attempt : Promise.resolve();
  }

  function showUnlockUI(){
    if (userUnlocked || !isIOS) return;
    document.documentElement.classList.add('needs-video-unlock');
    if (overlayEl) overlayEl.hidden = false;
  }

  function hideUnlockUI(){
    document.documentElement.classList.remove('needs-video-unlock');
    if (overlayEl) overlayEl.hidden = true;
  }

  function checkActiveVideoPaused(){
    if (userUnlocked) return;
    const idx = computeActiveIndex();
    const video = visibleVideo(pageEls[idx]);
    if (video && video.paused && video.readyState >= 2) showUnlockUI();
  }

  function unlockVideos(){
    if (userUnlocked) return;
    userUnlocked = true;
    hideUnlockUI();
    setPageVideosActive(computeActiveIndex(), true);
  }

  function setPageVideosActive(activeIdx, fromGesture){
    pageEls.forEach((page, idx) => {
      const vids = Array.from(page.querySelectorAll('video.hero-video'));
      vids.forEach(v => {
        setInlineSafe(v);
        if (idx === activeIdx){
          v.preload = 'auto';
          playVideo(v).catch(() => {
            if (!fromGesture) showUnlockUI();
          });
        } else {
          v.preload = 'none';
          try { v.pause(); } catch {}
        }
      });
    });
    if (!fromGesture) {
      setTimeout(checkActiveVideoPaused, 400);
      setTimeout(checkActiveVideoPaused, 2000);
    }
  }

  function computeActiveIndex(){
    return Math.max(0, Math.min(pageEls.length - 1, Math.round(pagesEl.scrollTop / pageHeight())));
  }

  function syncActive(){
    const idx = computeActiveIndex();
    if (idx === lastActive) return;
    lastActive = idx;
    setPageVideosActive(idx, userUnlocked);
  }

  function onUserGesture(){
    unlockVideos();
    document.removeEventListener('touchstart', onUserGesture);
    document.removeEventListener('click', onUserGesture);
  }

  overlayEl = document.createElement('button');
  overlayEl.type = 'button';
  overlayEl.className = 'video-unlock-overlay';
  overlayEl.hidden = true;
  overlayEl.setAttribute('aria-label', 'Tap to play background video');
  overlayEl.innerHTML =
    '<span class="video-unlock-icon" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
    '</span><span class="video-unlock-label">Tap to continue</span>';
  document.body.appendChild(overlayEl);
  overlayEl.addEventListener('click', onUserGesture);

  document.addEventListener('touchstart', onUserGesture, { passive: true });
  document.addEventListener('click', onUserGesture);

  document.querySelectorAll('video.hero-video').forEach(v => {
    v.addEventListener('playing', hideUnlockUI);
  });

  syncActive();
  pagesEl.addEventListener('scroll', () => requestAnimationFrame(syncActive), { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(syncActive));
})();

/* ---------- COMMENT FORM ---------- */
(function(){
  const form    = document.getElementById('commentForm');
  const thanks  = document.getElementById('commentThanks');
  const status  = document.getElementById('commentStatus');
  const submit  = document.getElementById('commentSubmit');
  const nameEl  = document.getElementById('commentName');
  const msgEl   = document.getElementById('commentMessage');
  const trapEl  = document.getElementById('commentHoneypot');
  if (!form) return;

  function setStatus(msg, isError){
    status.textContent = msg;
    status.classList.toggle('is-error', !!isError);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    setStatus('');

    if (trapEl.value) return;

    const message = msgEl.value.trim();
    if (!message){
      setStatus('Please write a message before sending.', true);
      msgEl.focus();
      return;
    }

    const scriptUrl = CONFIG.commentsScriptUrl;
    if (!scriptUrl){
      setStatus('Comments are not set up yet. Please try again later.', true);
      return;
    }

    submit.disabled = true;
    setStatus('Sending…');

    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name: nameEl.value.trim(),
          message,
          secret: CONFIG.commentsSecret || '',
          website: trapEl.value
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success){
        throw new Error(data.error || 'Submission failed');
      }
      form.hidden = true;
      thanks.hidden = false;
    } catch {
      setStatus('Something went wrong. Please try again.', true);
      submit.disabled = false;
    }
  });
})();

/* ---------- BACKGROUND AUDIO MANAGER ---------- */
(function(){
  const audio = document.getElementById('bgAudio');
  const btn   = document.getElementById('musicBtn');
  if (!audio || !btn) return;

  let isPlaying = false;
  let userManuallyToggled = false;

  function updateBtnUI(playing){
    isPlaying = playing;
    btn.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    btn.setAttribute('title', playing ? 'Pause music' : 'Play music');
  }

  function playAudio(){
    const promise = audio.play();
    if (promise !== undefined){
      promise.then(() => {
        updateBtnUI(true);
      }).catch(() => {
        updateBtnUI(false);
      });
    }
  }

  function pauseAudio(){
    audio.pause();
    updateBtnUI(false);
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    userManuallyToggled = true;
    if (isPlaying){
      pauseAudio();
    } else {
      playAudio();
    }
  });

  // Attempt auto-play on initial load
  playAudio();

  // If autoplay was blocked by browser policy, play on first user interaction anywhere
  function onFirstUserGesture(){
    if (!isPlaying && !userManuallyToggled){
      playAudio();
    }
    document.removeEventListener('click', onFirstUserGesture);
    document.removeEventListener('touchstart', onFirstUserGesture);
    document.removeEventListener('keydown', onFirstUserGesture);
  }

  document.addEventListener('click', onFirstUserGesture, { once: true });
  document.addEventListener('touchstart', onFirstUserGesture, { once: true });
  document.addEventListener('keydown', onFirstUserGesture, { once: true });
})();
