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
  let isDark = true;

  toggleBtn.addEventListener('click', () => {
    isDark = !isDark;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    toggleIcon.textContent = isDark ? '☀' : '☾';
    // pulse effect on ambient
    document.querySelectorAll('.ambient').forEach(a => {
      a.style.transition = 'opacity 0.5s ease';
    });
  });

  // ── 4. ACTIVE NAV ON SCROLL ────────────────────────────────
  const sections = document.querySelectorAll('section[id], .home[id]');
  const navLinks = document.querySelectorAll('header nav a');

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
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,0,221,0.3), transparent 60%)`;
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
      const target = document.querySelector(link.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
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
          dot.style.boxShadow = '0 0 30px rgba(255,0,221,0.9)';
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

  console.log('Portfolio JS loaded ✓');
});