/* ============================================================
   PORTFOLIO JS — Lenis smooth scroll + all interactions
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {

  // ── 1. LENIS SMOOTH SCROLL ──────────────────────────────────
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ── 2. CUSTOM CURSOR ───────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Lerp trail
  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // ── 3. THEME TOGGLE ────────────────────────────────────────
  const toggleBtn = document.getElementById('themeToggle');
  const toggleIcon = toggleBtn.querySelector('.toggle-icon');
  const html = document.documentElement;

  // Check saved theme in localStorage
  const savedTheme = localStorage.getItem('theme');
  let isDark = savedTheme ? savedTheme !== 'light' : true;

  // Apply saved theme on load
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  toggleIcon.textContent = isDark ? '☀' : '☾';

  toggleBtn.addEventListener('click', () => {
    isDark = !isDark;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    toggleIcon.textContent = isDark ? '☀' : '☾';
    // Save to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // pulse effect on ambient
    document.querySelectorAll('.ambient').forEach(a => {
      a.style.transition = 'opacity 0.5s ease';
    });
  });

  // ── 4. ACTIVE NAV ON SCROLL ────────────────────────────────
  const sections = document.querySelectorAll('section[id], .home[id]');
  const navLinks = document.querySelectorAll('header nav a');
  const heroText = document.querySelector('.text');

  lenis.on('scroll', ({ scroll }) => {
    // Active link
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const bottom = top + section.offsetHeight;
      if (scroll >= top && scroll < bottom) {
        const id = section.id;
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });

    // Hero zoom-out on scroll
    if (heroText && scroll > 0) {
      const homeSection = document.getElementById('home');
      const maxScroll = homeSection.offsetHeight;
      const progress = Math.min(scroll / maxScroll, 1);
      const scale = 1 - (progress * 0.5);
      const opacity = 1 - progress;
      heroText.style.transform = `scale(${Math.max(scale, 0.5)})`;
      heroText.style.opacity = Math.max(opacity, 0);
    }

    // Skills container-2 shrink and fade on scroll
    const container2 = document.querySelector('.container-2');
    if (container2) {
      const skillsSection = document.getElementById('skills');
      const sectionTop = skillsSection.offsetTop;
      const sectionHeight = skillsSection.offsetHeight;
      const scrollInSection = scroll - sectionTop;
      const maxScroll = sectionHeight;

      if (scrollInSection > 0 && scrollInSection < maxScroll) {
        const progress = Math.min(scrollInSection / maxScroll, 1);
        const distanceFromCenter = Math.abs(progress - 0.5) * 2;
        // Slight shrink (max 0.85) and partial fade (min 0.5)
        const scale = 1 - (distanceFromCenter * 0.15);
        const opacity = 1 - (distanceFromCenter * 0.5);
        container2.style.transform = `scale(${Math.max(scale, 0.75)})`;
        container2.style.opacity = Math.max(opacity, 0.5);
      }
    }

    // Header shrink
    const header = document.getElementById('header');
    if (scroll > 60) {
      header.style.padding = '0.5rem 1.5rem';
    } else {
      header.style.padding = '0.75rem 2rem';
    }
  });

  // ── 5. SCROLL REVEAL (IntersectionObserver) ────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => io.observe(el));

  // ── 6. MOUSE PARALLAX ON AMBIENT BLOBS ───────────────────
  const ambients = document.querySelectorAll('.ambient');
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    ambients.forEach((amb, i) => {
      const factor = (i % 3 + 1) * 12;
      const sign = i % 2 === 0 ? 1 : -1;
      amb.style.transform = `translate(${dx * factor * sign}px, ${dy * factor * sign}px)`;
    });
  });

  // ── 7. CARD 3D TILT EFFECT ────────────────────────────────
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -15;
      const ry = ((x - cx) / cx) * 15;

      card.style.transform = `translateY(-20px) scale(1.06) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.zIndex = '10';

      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(220,0,190,0.3), transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      const base = getCardBaseTransform(card);
      card.style.transform = base;
      card.style.zIndex = '';
      const glow = card.querySelector('.card-glow');
      if (glow) glow.style.background = '';
    });
  });

  function getCardBaseTransform(card) {
    if (card.classList.contains('card1')) return 'rotate(-25deg)';
    if (card.classList.contains('card2')) return 'rotate(-12deg)';
    if (card.classList.contains('card3')) return 'translateY(-30px)';
    if (card.classList.contains('card4')) return 'rotate(12deg)';
    if (card.classList.contains('card5')) return 'rotate(25deg)';
    return '';
  }

  // ── 8. SMOOTH ANCHOR SCROLLING ────────────────────────────
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });

      // If Intro home is clicked, force-restart the SVG name animation
      if (href === '#home') {
        const paths = document.querySelectorAll('svg.makeup path');
        if (!paths.length) return;

        // Clear inline animation first
        paths.forEach(p => { p.style.animation = 'none'; });

        // Force reflow then reapply the animation explicitly so it always restarts
        void document.body.offsetWidth;
        paths.forEach(p => {
          p.style.animation = 'textDraw 3.5s ease-in-out forwards';
        });
      }
    });
  });

  // Footer scroll top
  const footerRight = document.querySelector('.footer-right');
  if (footerRight) {
    footerRight.addEventListener('click', () => {
      lenis.scrollTo(0, { duration: 2 });
    });
  }

  // ── 9. PROJECT CARD MAGNETIC HOVER ───────────────────────
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      card.style.transform = `translateY(-12px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ── 10. TIMELINE DOT PULSE ON VISIBLE ────────────────────
  const tlItems = document.querySelectorAll('.timeline-item');
  const tlObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const dot = entry.target.querySelector('.timeline-dot');
        if (dot) {
          dot.style.animation = 'none';
          dot.style.boxShadow = '0 0 30px rgba(220,0,190,0.9)';
          setTimeout(() => { dot.style.boxShadow = ''; }, 800);
        }
      }
    });
  }, { threshold: 0.5 });
  tlItems.forEach(item => tlObserver.observe(item));

  // ── 11. CTA BUTTON SHIMMER ───────────────────────────────
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('mousemove', e => {
      const rect = ctaBtn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctaBtn.style.setProperty('--mx', x + 'px');
      ctaBtn.style.setProperty('--my', y + 'px');
    });
  }

  // ── 12. PROJECTS CAROUSEL ───────────────────────────────
  (function initProjectsCarousel() {
    const slidesEl = document.querySelectorAll('.pj-slide');
    const thumbsWrap = document.getElementById('pjThumbnails');
    const infoInner = document.getElementById('pjInfoInner');
    const titleEl = document.getElementById('pjTitle');
    const descEl = document.getElementById('pjDesc');
    const p_link = document.getElementById('p_link');
    const l_link = document.getElementById('l_link');

    const currentEl = document.getElementById('pjCurrent');
    const totalEl = document.getElementById('pjTotal');
    const progressFill = document.getElementById('pjProgressFill');
    const prevBtn = document.getElementById('pjPrev');
    const nextBtn = document.getElementById('pjNext');

    if (!slidesEl.length) return;

    const slides = Array.from(slidesEl);

    const AUTO_DELAY = 4000;
    const ANIM_LOCK = 850;

    const projects = [
      {
        title: 'Lay Man Terms',
        desc: 'An AI-powered tutor that simplifies complex documents — textbooks, lecture notes, research papers — into plain-English explanations. Drop any file and get instant clarity.',
        p_link: 'https://github.com/chrisdomfeh/Lay_man_terms',
        l_link: 'https://chrisdomfeh.github.io/Lay_man_terms/'
      },
      {
        title: 'Password Generator',
        desc: 'A fast, minimal password generator built with vanilla JS. Generates cryptographically strong passwords with one click, featuring an instant clipboard copy.',
        p_link: 'https://github.com/chrisdomfeh/Password-Generator',
        l_link: 'https://chrisdomfeh.github.io/Password-Generator/'
      },
      {
        title: 'Weather App',
        desc: 'A clean weather dashboard that fetches live data from OpenWeatherMap. Search any city and see temperature, humidity, cloud coverage, and pressure at a glance.',
        p_link: 'https://github.com/chrisdomfeh/Weather-app2',
        l_link: 'https://chrisdomfeh.github.io/Weather-app2/'
      },
      {
        title: 'To-do List',
        desc: 'A lightweight task manager with smooth check/uncheck animations, real-time task counters, and persistent state — built entirely in vanilla HTML, CSS, and JS.',
        p_link: 'https://github.com/chrisdomfeh/To-do',
        l_link: 'https://chrisdomfeh.github.io/To-do/'
      },
      {
        title: 'Tic Tac Toe',
        desc: 'A simple Tic Tac Toe game with smooth and visually appealing animations and transitions - built entirely with vanilla HTML, CSS, and JS',
        p_link: 'https://github.com/chrisdomfeh/Tic-Tac-Toe.',
        l_link: 'https://chrisdomfeh.github.io/Tic-Tac-Toe./'
      }
    ];

    let current = 0;
    let locked = false;
    let autoTimer = null;
    let progressRaf = null;
    let progressStart = null;

    function pad(n) { return String(n + 1).padStart(2, '0'); }

    totalEl.textContent = String(projects.length).padStart(2, '0');
    currentEl.textContent = pad(current);

    // Returns live thumb nodes in visual order
    function getThumbs() {
      return Array.from(thumbsWrap.querySelectorAll('.pj-thumb'));
    }

    // Find the thumb whose data-index matches idx
    function getThumbByIndex(idx) {
      return thumbsWrap.querySelector(`.pj-thumb[data-index="${idx}"]`);
    }

    function goTo(nextIdx, direction) {
      if (locked || nextIdx === current) return;
      locked = true;
      stopAuto();

      const prevIdx = current;
      current = nextIdx;

      // ── Slide transition ──
      const entering = slides[nextIdx];
      const exiting = slides[prevIdx];

      if (direction === 'next') {
        entering.classList.add('active', 'entering-next');
        exiting.classList.remove('active');
        exiting.classList.add('exiting-next');
        entering.addEventListener('animationend', () => entering.classList.remove('entering-next'), { once: true });
        exiting.addEventListener('animationend', () => exiting.classList.remove('exiting-next'), { once: true });
      } else {
        exiting.classList.add('exiting-prev');
        exiting.classList.remove('active');
        entering.classList.add('active', 'entering-prev');
        exiting.addEventListener('animationend', () => {
          exiting.classList.remove('exiting-prev');
          exiting.style.opacity = '';
        }, { once: true });
        entering.addEventListener('animationend', () => entering.classList.remove('entering-prev'), { once: true });
      }

      // ── Thumb reorder: viewed thumb moves to last position ──
      const viewedThumb = getThumbByIndex(prevIdx);
      const newActiveThumb = getThumbByIndex(nextIdx);

      // 1. Animate the viewed (old active) thumb out to the right
      if (viewedThumb) {
        viewedThumb.classList.remove('active');
        viewedThumb.classList.add('thumb-exit-to-end');
        viewedThumb.addEventListener('animationend', () => {
          viewedThumb.classList.remove('thumb-exit-to-end');
          // Re-append it to the end of the container (DOM reorder)
          thumbsWrap.appendChild(viewedThumb);
          // Then animate it entering at the end
          viewedThumb.classList.add('thumb-enter-end');
          viewedThumb.addEventListener('animationend', () => {
            viewedThumb.classList.remove('thumb-enter-end');
          }, { once: true });
        }, { once: true });
      }

      // 2. Activate the new thumb
      if (newActiveThumb) {
        newActiveThumb.classList.add('active', 'thumb-activate');
        newActiveThumb.addEventListener('animationend', () => {
          newActiveThumb.classList.remove('thumb-activate');
        }, { once: true });
      }

      // ── Info text swap ──
      infoInner.classList.add('animating-out');
      infoInner.addEventListener('animationend', () => {
        titleEl.textContent = projects[current].title;
        descEl.textContent = projects[current].desc;
        p_link.href = projects[current].p_link;
        l_link.href = projects[current].l_link;
        currentEl.textContent = pad(current);
        infoInner.classList.remove('animating-out');
        infoInner.classList.add('animating-in');
        infoInner.addEventListener('animationend', () => infoInner.classList.remove('animating-in'), { once: true });
      }, { once: true });

      setTimeout(() => { locked = false; startAuto(); }, ANIM_LOCK);
    }

    // ── Progress bar ──
    function startProgress() {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
      progressStart = performance.now();
      function tick(ts) {
        const pct = Math.min(((ts - progressStart) / AUTO_DELAY) * 100, 100);
        progressFill.style.width = pct + '%';
        if (pct < 100) progressRaf = requestAnimationFrame(tick);
      }
      progressRaf = requestAnimationFrame(tick);
    }

    function stopProgress() {
      if (progressRaf) cancelAnimationFrame(progressRaf);
      progressFill.style.width = '0%';
    }

    function startAuto() {
      stopProgress();
      startProgress();
      autoTimer = setTimeout(() => goTo((current + 1) % slides.length, 'next'), AUTO_DELAY);
    }

    function stopAuto() {
      clearTimeout(autoTimer);
      stopProgress();
    }

    // ── Button listeners ──
    nextBtn.addEventListener('click', () => goTo((current + 1) % slides.length, 'next'));
    prevBtn.addEventListener('click', () => goTo((current - 1 + slides.length) % slides.length, 'prev'));

    // Thumb click (use event delegation since order changes)
    thumbsWrap.addEventListener('click', e => {
      const thumb = e.target.closest('.pj-thumb');
      if (!thumb) return;
      const idx = parseInt(thumb.dataset.index, 10);
      if (isNaN(idx) || idx === current) return;
      goTo(idx, idx > current ? 'next' : 'prev');
    });

    const carousel = document.getElementById('pjCarousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);
    }

    startAuto();
  })();

  // ── INK SCROLL REVEAL on .banner sections ─────────────────
  // Ink mask slides UP as you scroll down into section (ink peels off)
  // Ink mask slides DOWN as you scroll back up (ink re-covers)
  (function initInkReveal() {
    const banners = document.querySelectorAll('.banner');
    banners.forEach(banner => {
      const mask = document.createElement('div');
      mask.classList.add('ink-mask');
      banner.insertBefore(mask, banner.firstChild);
    });

    function updateInk({ scroll }) {
      const viewH = window.innerHeight;
      banners.forEach(banner => {
        const mask = banner.querySelector('.ink-mask');
        if (!mask) return;

        const sectionTop = banner.offsetTop;
        const sectionH = banner.offsetHeight;

        // progress 0 → section top just hit the bottom of viewport (starting to enter)
        // progress 1 → section top reached the top of viewport (fully in view)
        const rawProgress = (scroll - (sectionTop - viewH)) / viewH;
        const progress = Math.max(0, Math.min(1, rawProgress));

        // translateY: 0% = covering section (ink on screen)
        //            -120% = fully slid up off screen (ink peeled off)
        const translateY = -(progress * 120);
        mask.style.transform = `translateY(${translateY}%)`;

        // slight fade as it leaves, so it doesn't hard-clip
        mask.style.opacity = Math.max(0, 1 - progress * 1.3).toString();
      });
    }

    lenis.on('scroll', updateInk);
    updateInk({ scroll: window.scrollY || 0 });
  })();

  console.log('Portfolio JS loaded ✓');
});