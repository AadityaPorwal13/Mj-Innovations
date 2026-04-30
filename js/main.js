/* ═══════════════════════════════════════════════
   MJ INNOVATIONS FZ LLC — main.js v5
   Shared across all pages
═══════════════════════════════════════════════ */

'use strict';

/* ── Scroll-triggered animations ── */
const motionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      motionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-in, .stagger, .scale-in').forEach(el => {
  motionObserver.observe(el);
});

/* ── Sticky nav ── */
const nav = document.getElementById('main-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ── Mobile hamburger ── */
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('drawer');
if (hamburger && drawer) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    drawer.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (nav && !nav.contains(e.target) && !drawer.contains(e.target)) {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
    }
  });
}

/* ── Live clock — Gulf Standard Time (UTC+4) ── */
function updateClock() {
  const el = document.getElementById('live-time');
  if (!el) return;
  const now = new Date();
  // GST = UTC + 4 hours
  const gstOffset = 4 * 60; // minutes
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const gst = new Date(utcMs + gstOffset * 60000);
  const hh = String(gst.getHours()).padStart(2,'0');
  const mm = String(gst.getMinutes()).padStart(2,'0');
  const ss = String(gst.getSeconds()).padStart(2,'0');
  el.textContent = `${hh}:${mm}:${ss} GST`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── Simulated alert counter ── */
(function simulateAlerts() {
  const el = document.getElementById('alert-count');
  if (!el) return;
  setInterval(() => {
    if (Math.random() > 0.75) {
      const count = Math.floor(Math.random() * 6) + 1;
      el.textContent = count + ' Alert' + (count !== 1 ? 's' : '');
    }
  }, 4000);
})();

/* ── Tech tabs (technology.html) ── */
document.querySelectorAll('.tech-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.tech-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tech-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + target);
    if (panel) panel.classList.add('active');
  });
});

/* ── X Device tab switcher ── */
document.querySelectorAll('.xdev-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.xdev-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.xdev-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(tab.dataset.panel);
    if (panel) panel.classList.add('active');
  });
});

/* ── Animate detection box confidence labels ── */
(function animateDetBoxes() {
  document.querySelectorAll('.dbox').forEach((box, i) => {
    const label = box.querySelector('.dbox-label');
    if (!label) return;
    const parts = label.textContent.split('·');
    if (parts.length < 2) return;
    setInterval(() => {
      const conf = Math.floor(Math.random() * 5) + 93;
      label.textContent = parts[0].trim() + ' · ' + conf + '%';
    }, 2500 + i * 700);
  });
})();

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Illustration tab switcher ── */
window.switchIllus = function(idx) {
  document.querySelectorAll('.illus-tab').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
  document.querySelectorAll('.illus-panel').forEach((p, i) => {
    const isActive = i === idx;
    p.classList.toggle('active', isActive);
    if (isActive) {
      const si = p.querySelector('.scale-in');
      if (si) {
        si.classList.remove('vis');
        requestAnimationFrame(() => setTimeout(() => si.classList.add('vis'), 30));
      }
    }
  });
};

/* ── Solution card video — play on hover ── */
document.querySelectorAll('.sol-card').forEach(card => {
  const video = card.querySelector('video');
  if (!video) return;
  video.muted = true;
  video.loop  = true;
  video.playsInline = true;
  // Autoplay all solution videos silently
  video.play().catch(() => {});
});

/* ── Lazy load videos when visible ── */
const vidObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const v = e.target;
      v.play().catch(() => {});
      vidObserver.unobserve(v);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('video[data-lazy]').forEach(v => vidObserver.observe(v));

/* ══════════════════════════════════════════════
   ILLUSTRATION SLIDER — unified desktop + mobile
═════════════════════════════════════════════ */
(function initIllustrationSlider() {
  const track     = document.getElementById('islider-track');
  if (!track) return;

  const slides    = Array.from(track.querySelectorAll('.islide'));
  const trackWrap = track.parentElement;
  const btnPrev   = document.getElementById('islider-prev');
  const btnNext   = document.getElementById('islider-next');
  const MOBILE_BP = 768;

  let current   = 0;
  let isDragging = false;
  let startX    = 0;
  let dragDelta = 0;

  /* ── Build progress dots ── */
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'islider-dots';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'islider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const navRow = document.querySelector('.islider-nav');
  if (navRow) navRow.appendChild(dotsWrap);

  /* ── Helpers ── */
  function isMobile() { return window.innerWidth <= MOBILE_BP; }

  function getGap() {
    return isMobile() ? 0 : (parseInt(getComputedStyle(track).gap) || 16);
  }

  /* Desktop: pixel offset so active slide is centred in viewport */
  function desktopOffset(idx) {
    const gap  = getGap();
    let total  = 0;
    slides.forEach((s, i) => {
      if (i < idx) total += s.getBoundingClientRect().width + gap;
    });
    const wrapW   = trackWrap.getBoundingClientRect().width;
    const activeW = slides[idx] ? slides[idx].getBoundingClientRect().width : 0;
    const centre  = (wrapW - activeW) / 2;
    return Math.max(0, total - centre);
  }

  /* Mobile: each slide is 100vw wide (set in CSS via width:100% + padding)
     We step by the actual rendered width of one slide. */
  function mobileOffset(idx) {
    const slideW = slides[0] ? slides[0].getBoundingClientRect().width : trackWrap.getBoundingClientRect().width;
    return idx * slideW;
  }

  /* ── Core: go to slide idx ── */
  function goTo(idx) {
    if (idx < 0 || idx >= slides.length) return;
    current = idx;

    /* Update active class */
    slides.forEach((s, i) => s.classList.toggle('islide-active', i === idx));

    /* Update dots */
    dotsWrap.querySelectorAll('.islider-dot')
      .forEach((d, i) => d.classList.toggle('active', i === idx));

    /* Disable nav at edges */
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === slides.length - 1;

    if (isMobile()) {
      /* Mobile: instant pixel step — no CSS width transition needed */
      track.style.transform = `translateX(-${mobileOffset(idx)}px)`;
    } else {
      /* Desktop: wait one frame for CSS width transition to start,
         then recalc pixel offset after transition settles (450ms) */
      requestAnimationFrame(() => {
        setTimeout(() => {
          track.style.transform = `translateX(-${desktopOffset(idx)}px)`;
        }, 460);
      });
    }
  }

  /* ── Arrow buttons ── */
  if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));

  /* ── Click collapsed slide (desktop) ── */
  slides.forEach((s, i) => {
    s.addEventListener('click', () => { if (i !== current) goTo(i); });
  });

  /* ── Drag / touch swipe ── */
  function dragStart(x) {
    isDragging = true;
    startX     = x;
    dragDelta  = 0;
    trackWrap.classList.add('is-dragging');
  }
  function dragMove(x) {
    if (!isDragging) return;
    dragDelta = x - startX;
  }
  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    trackWrap.classList.remove('is-dragging');
    const threshold = isMobile() ? 35 : 55;
    if      (dragDelta < -threshold) goTo(current + 1);
    else if (dragDelta >  threshold) goTo(current - 1);
    else                             goTo(current);     /* snap back */
  }

  trackWrap.addEventListener('mousedown',  e => dragStart(e.clientX));
  window   .addEventListener('mousemove',  e => dragMove(e.clientX));
  window   .addEventListener('mouseup',    ()  => dragEnd());
  trackWrap.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
  trackWrap.addEventListener('touchmove',  e => dragMove(e.touches[0].clientX),  { passive: true });
  trackWrap.addEventListener('touchend',   ()  => dragEnd());

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ── Resize: recalculate without animation ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      track.style.transition = 'none';
      if (isMobile()) {
        track.style.transform = `translateX(-${mobileOffset(current)}px)`;
      } else {
        track.style.transform = `translateX(-${desktopOffset(current)}px)`;
      }
      requestAnimationFrame(() => { track.style.transition = ''; });
    }, 100);
  }, { passive: true });

  /* ── Init ── */
  slides[0] && slides[0].classList.add('islide-active');
  if (btnPrev) btnPrev.disabled = true;
  goTo(0);
})();
