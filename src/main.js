document.addEventListener('DOMContentLoaded', () => {
  const introScreen = document.getElementById('intro-screen');
  const mainPage = document.getElementById('main-page');
  const topBar = document.getElementById('top-bar');
  const contactBtn = document.getElementById('contact-btn');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');

  // ── Intro Animation Sequence ───────────────────────
  // 1. Show intro text (handled by CSS animation on load)
  // 2. After a beat, slide the white screen up
  // 3. Reveal the main content underneath

  setTimeout(() => {
    introScreen.classList.add('slide-up');
  }, 1400);

  setTimeout(() => {
    mainPage.classList.add('visible');
    topBar.classList.add('visible');
  }, 1800);

  setTimeout(() => {
    introScreen.classList.add('hidden');
    // Enable scrolling now that intro is done
    document.body.classList.add('scrollable');
    document.documentElement.style.overflow = 'auto';
  }, 2600);

  // ── Scroll Indicator Fade ──────────────────────────
  const scrollIndicator = document.getElementById('scroll-indicator');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      scrollIndicator.classList.add('fade-out');
    } else {
      scrollIndicator.classList.remove('fade-out');
    }
  }, { passive: true });

  // ── Footer Reveal on Scroll ────────────────────────
  const footerContent = document.querySelector('.footer-content');

  if (footerContent) {
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    footerObserver.observe(footerContent);
  }

  // ── Contact Modal ──────────────────────────────────
  contactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modalOverlay.classList.add('active');
  });

  modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
    }
  });

  // ── Subtle Mouse-Follow Glow ───────────────────────
  const glowPrimary = document.querySelector('.glow-orb--primary');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let orbX = mouseX;
  let orbY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateOrb() {
    orbX += (mouseX - orbX) * 0.03;
    orbY += (mouseY - orbY) * 0.03;

    if (glowPrimary) {
      glowPrimary.style.left = `${orbX}px`;
      glowPrimary.style.top = `${orbY}px`;
      glowPrimary.style.transform = 'translate(-50%, -50%)';
    }

    requestAnimationFrame(animateOrb);
  }

  animateOrb();
});
