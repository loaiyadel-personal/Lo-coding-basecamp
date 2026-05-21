/**
 * Loaiy Adel CV — Interaction Layer
 * Applied design intelligence from UI/UX Pro Max skill:
 *   - Scroll reveal (Intersection Observer)
 *   - Hero entrance animation
 *   - Progressive card entrance with stagger
 *   - Navbar scroll behaviour
 *   - Smooth anchor scrolling
 *   - prefers-reduced-motion respected throughout
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. HERO ENTRANCE ────────────────────────────────────────────────────── */
(function heroEntrance() {
  if (reducedMotion) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.classList.add('hero--ready');
  // Stagger hero children
  const parts = hero.querySelectorAll(
    '.hero-top, .hero-bio, .hero-stats, .hero-chips'
  );
  parts.forEach((el, i) => {
    el.style.setProperty('--stagger', i);
    el.classList.add('hero-child--animate');
  });
})();

/* ── 2. SCROLL REVEAL ────────────────────────────────────────────────────── */
(function scrollReveal() {
  if (reducedMotion) return;

  // Mark every card and sidebar card for reveal
  const targets = document.querySelectorAll(
    '.exp-card, .side-card, .contact-section, .hero-stats .stat'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(i * 60, 400)}ms`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          io.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();

/* ── 3. NAVBAR SCROLL SHADOW ─────────────────────────────────────────────── */
(function navbarScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('navbar--scrolled', window.scrollY > 24);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── 4. EXPERIENCE CARD TILT (subtle) ───────────────────────────────────── */
(function cardTilt() {
  if (reducedMotion) return;
  document.querySelectorAll('.exp-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-3px) rotateX(${-dy * 1.5}deg) rotateY(${dx * 1.5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── 5. SMOOTH SECTION SCROLL ────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

/* ── 6. ACTIVE SECTION HIGHLIGHT IN STATS ───────────────────────────────── */
(function statsCounter() {
  if (reducedMotion) return;
  const stats = document.querySelectorAll('.stat-num');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();   // e.g. "11+"
      const num = parseInt(raw);
      if (isNaN(num)) return;
      const suffix = raw.replace(/\d+/, '');
      let start = 0;
      const duration = 1200;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * num) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  stats.forEach((el) => io.observe(el));
})();
