window.addEventListener('DOMContentLoaded', () => {

  // 1. Add essential CSS via JS so it's guaranteed to be there
  const style = document.createElement('style');
  style.innerHTML = `
    html.lenis, html.lenis body { height: auto; }
    .lenis.lenis-smooth { scroll-behavior: auto !important; }
    .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
    .lenis.lenis-stopped { overflow: hidden; }
    .lenis.lenis-scrolling iframe { pointer-events: none; }
  `;
  document.head.appendChild(style);

  // 2. Initialize Lenis
  const lenis = new Lenis({
    duration: .2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true, // In 2026, 'smooth' is often 'smoothWheel'
    wheelMultiplier: 1,
    infinite: false,
  });

  // 3. The essential Animation Frame loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  
  // Debugging: Log to console to confirm it's running
  console.log('Lenis is active');
});

