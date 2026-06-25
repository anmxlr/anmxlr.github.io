// Force scroll to top on refresh/load and disable automatic scroll restoration
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  // ── Tap Sound ─────────────────────────────────────
  const tapAudioSrc = 'src/assets/audio/tap.mp3';
  const tapPool = [];
  const TAP_POOL_SIZE = 6;
  for (let i = 0; i < TAP_POOL_SIZE; i++) {
    const a = new Audio(tapAudioSrc);
    a.volume = 0.35;
    tapPool.push(a);
  }
  let tapIndex = 0;

  function playTap(volume) {
    const a = tapPool[tapIndex];
    tapIndex = (tapIndex + 1) % TAP_POOL_SIZE;
    a.volume = volume !== undefined ? volume : 0.35;
    a.currentTime = 0;
    a.play().catch(() => {});
  }

  // ── Tap Sound on Interactive Elements ──────────────
  window.addEventListener('click', (e) => {
    const hit = e.target.closest('a, button, input[type="submit"], input[type="button"], .logo, [role="button"], project-card, .connect-btn, .signal-panel, .chip');
    if (hit) {
      playTap(0.35);
    }
  });

  // ── Passport System ────────────────────────────────
  window.unlockPassportStamp = function (key) {
    if (localStorage.getItem(`passport_stamp_${key}`) === 'unlocked') return;
    localStorage.setItem(`passport_stamp_${key}`, 'unlocked');
    
    // Play double thud stamp sound
    playTap(0.7);
    setTimeout(() => playTap(0.55), 80);

    // Show toast
    showPassportToast(key);
  };

  function showPassportToast(key) {
    const toast = document.createElement('div');
    toast.className = 'passport-toast';
    toast.innerHTML = `
      <span class="toast-kicker">Passport Stamp Earned</span>
      <span class="toast-title">${key.toUpperCase()}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  const introScreen = document.getElementById('intro-screen');
  const mainPage = document.getElementById('main-page');
  const topBar = document.getElementById('top-bar');
  const contactBtn = document.getElementById('contact-btn');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const glowPrimary = document.querySelector('.glow-orb--primary');

  // Custom Cursor elements
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorRing = document.querySelector('.custom-cursor-ring');
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isDesktop) {
    document.documentElement.classList.add('has-custom-cursor');

    // Custom cursor click & hover triggers (event delegation)
    window.addEventListener('mouseover', (e) => {
      const isInteractive = e.target.closest('a, button, input, project-card, .logo, [role="button"], #name-warp-canvas, .connect-btn, .signal-panel');
      document.documentElement.classList.toggle('cursor-hover', !!isInteractive);
    });
    window.addEventListener('mousedown', () => document.documentElement.classList.add('cursor-click'));
    window.addEventListener('mouseup', () => document.documentElement.classList.remove('cursor-click'));
  }

  // ── Load and Animate Intro Logo SVG ───────────────
  const introLogoContainer = document.getElementById('intro-logo-container');
  if (introLogoContainer) {
    fetch('src/assets/images/logo.svg')
      .then(response => response.text())
      .then(svgText => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        if (svgElement) {
          svgElement.setAttribute('class', 'intro-logo-svg');
          introLogoContainer.appendChild(svgElement);

          const groups = Array.from(svgElement.querySelectorAll('g'));
          const validGroups = groups.filter(g => {
            const path = g.querySelector('path');
            if (path) {
              const d = path.getAttribute('d') || '';
              return !d.includes('1600.00 1600.00'); // Filter out visual boundary box
            }
            return true;
          });

          const total = validGroups.length;
          validGroups.forEach((g, index) => {
            // Animate from smallest (end of groups array) to largest (start of array)
            const reverseIndex = total - 1 - index;
            // Delay starts at 0.15s, incrementing by 13ms per group chamber
            const delay = 0.15 + (reverseIndex * 0.013);
            g.style.animationDelay = `${delay}s`;
          });
        }
      })
      .catch(err => {
        console.error('Failed to load intro logo SVG:', err);
        introLogoContainer.innerHTML = `<img src="src/assets/images/logo.svg" alt="anmxlr logo" class="intro-logo-fallback">`;
      });
  }

  // ── Intro Animation Timers ───────────────────────
  setTimeout(() => introScreen.classList.add('slide-up'), 2800);
  setTimeout(() => {
    mainPage.classList.add('visible');
    topBar.classList.add('visible');
    startHeroAnimation();
  }, 3800);
  setTimeout(() => {
    introScreen.classList.add('hidden');
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
  }, 5000);

  // ── Hero Title Word Animation ─────────────────────
  function startHeroAnimation() {
    const wrapper = document.querySelector('.change-wrapper');
    const strike = document.querySelector('.word-strike');
    const pop = document.querySelector('.word-pop');
    if (!wrapper || !strike || !pop) return;

    wrapper.style.width = `${strike.offsetWidth}px`;
    setTimeout(() => wrapper.classList.add('cut'), 1200);
    setTimeout(() => {
      wrapper.classList.add('split');

      const targetWord = "cool";

      // Dynamic measurement of target word width
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.style.font = window.getComputedStyle(pop).font;
      tempSpan.textContent = targetWord;
      document.body.appendChild(tempSpan);

      // Let's add extra width for the cursor block (4px width + 4px margin)
      const targetWidth = tempSpan.offsetWidth + 8;
      document.body.removeChild(tempSpan);

      wrapper.style.width = `${targetWidth}px`;
    }, 1500);

    setTimeout(() => {
      wrapper.classList.add('pop');
      typewriterEffect(pop.querySelector('.typewriter-text'), 'cool');
    }, 1750);
  }

  function typewriterEffect(element, text) {
    if (!element) return;
    element.textContent = '';
    let index = 0;

    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, 180 + Math.random() * 120);
      }
    }

    setTimeout(type, 150);
  }

  // ── Scroll Indicator Fade ──────────────────────────
  window.addEventListener('scroll', () => {
    scrollIndicator.classList.toggle('fade-out', window.scrollY > 80);
  }, { passive: true });

  // ── Projects Slide-Stack Dynamic Loading & Interaction ──────
  const projectsTrack = document.getElementById('projects-scroll-track');
  const projectsSec = document.getElementById('projects-section');
  const projectsScroller = document.getElementById('projects-stack-scroller');
  const projectsSpacer = document.getElementById('projects-stack-spacer');
  const projectsProgress = document.querySelector('.projects-stack-progress span');
  const projectsStack = document.querySelector('.projects-stack');
  const bgCircles = document.querySelector('.projects-bg-circles');
  const bgGrid = document.querySelector('.projects-bg-grid');

  let targetProgress = 0, currentProgress = 0;
  let targetMouseX = 0, targetMouseY = 0, currentMouseX = 0, currentMouseY = 0;
  let gridOffset = 0;
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let orbX = mouseX, orbY = mouseY;
  let ringX = mouseX, ringY = mouseY;
  let totalSlots = 0;
  let slots = [];

  const PROJECT_HOLD_VH = 0.5;
  const PROJECT_TRANS_VH = 0.15;

  function easeInOutCubic(t) {
    const x = Math.min(Math.max(t, 0), 1);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function getProjectsScrollableVh(slotCount) {
    if (slotCount <= 1) return 0;
    return slotCount * PROJECT_HOLD_VH + (slotCount - 1) * PROJECT_TRANS_VH;
  }

  function scrolledToProjectProgress(scrolledPx, slotCount) {
    if (slotCount <= 1) return 0;

    const vh = window.innerHeight;
    let cursorVh = 0;

    for (let i = 0; i < slotCount; i++) {
      if (scrolledPx / vh < cursorVh + PROJECT_HOLD_VH) {
        return i / (slotCount - 1);
      }
      cursorVh += PROJECT_HOLD_VH;

      if (i < slotCount - 1) {
        if (scrolledPx / vh < cursorVh + PROJECT_TRANS_VH) {
          const t = easeInOutCubic((scrolledPx / vh - cursorVh) / PROJECT_TRANS_VH);
          return (i + t) / (slotCount - 1);
        }
        cursorVh += PROJECT_TRANS_VH;
      }
    }

    return 1;
  }

  function lockIndexToProjectScrollPx(lockIndex, slotCount) {
    const vh = window.innerHeight;
    let cursorVh = 0;

    for (let i = 0; i < lockIndex; i++) {
      cursorVh += PROJECT_HOLD_VH + PROJECT_TRANS_VH;
    }
    cursorVh += PROJECT_HOLD_VH * 0.5;
    return cursorVh * vh;
  }

  function applyDesktopStackSlots(fractionalIndex, slotCount) {
    if (!slots.length || slotCount <= 0) return;
    const activeIndex = slotCount > 1 ? fractionalIndex * (slotCount - 1) : 0;

    slots.forEach((slot, index) => {
      const x = slotCount > 1 ? index - activeIndex : 0;
      const absX = Math.abs(x);

      if (absX > 1.25) {
        slot.style.opacity = '0';
        slot.style.visibility = 'hidden';
        slot.style.pointerEvents = 'none';
        slot.style.filter = 'none';
        slot.classList.remove('active');
        return;
      }

      slot.style.visibility = 'visible';
      const isActive = absX < 0.28;
      slot.classList.toggle('active', isActive);
      slot.style.pointerEvents = isActive ? 'auto' : 'none';

      const scale = 1 - Math.min(absX * 0.05, 0.11);
      const translateY = x * -18;
      const translateZ = -absX * 64;
      const rotateY = Math.max(-7, Math.min(7, x * -4.5));
      const opacity = absX < 0.06 ? 1 : Math.max(0, 0.95 - absX * 0.78);

      slot.style.zIndex = String(100 - Math.round(absX * 10));
      slot.style.transform = `translate3d(0, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      slot.style.opacity = String(opacity);
      slot.style.filter = absX > 0.5 ? `blur(${Math.min((absX - 0.5) * 2.8, 2)}px)` : 'none';
    });
  }

  function applyMobileStackSlots() {
    if (!projectsScroller || !slots.length) return;
    const scrollerWidth = projectsScroller.clientWidth;
    const scrollerCenter = projectsScroller.scrollLeft + scrollerWidth / 2;

    slots.forEach((slot) => {
      const slotWidth = slot.offsetWidth || 290;
      const slotCenter = slot.offsetLeft + slotWidth / 2;
      const diff = slotCenter - scrollerCenter;
      const gap = 20;
      const normalizedDiff = diff / (slotWidth + gap);
      const absDiff = Math.abs(normalizedDiff);

      const isActive = absDiff < 0.38;
      slot.classList.toggle('active', isActive);
      slot.style.pointerEvents = isActive ? 'auto' : 'none';
      slot.style.visibility = absDiff > 1.1 ? 'hidden' : 'visible';

      const scale = 1 - Math.min(0.1, absDiff * 0.12);
      const opacity = absDiff < 0.08 ? 1 : Math.max(0, 0.96 - absDiff * 0.7);
      const rotateY = normalizedDiff * -5;
      const translateX = normalizedDiff * -14;

      slot.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`;
      slot.style.opacity = String(opacity);
      slot.style.filter = absDiff > 0.35 ? `blur(${Math.min((absDiff - 0.35) * 2.5, 2)}px)` : 'none';
    });
  }

  initConstellation();
  initLabScroll();
  initHiddenTerminal();
  initSignalPanel();
  initEasterEggs();
  initPhonePuzzle();
  initReachForm();

  // Shared mouse move listener for 3D parallax, mouse-glow orb, and custom cursor
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Position dot instantly
    if (isDesktop && cursorDot) {
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
    }

    targetMouseX = (e.clientX / window.innerWidth) - 0.5;
    targetMouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  // ── Name Warp Animation Setup ────────────────────
  let nameWarpController = null;
  const nameWarpSection = document.getElementById('name-warp-section');
  if (nameWarpSection) {
    nameWarpController = initNameWarp();
  }

  // ── Intersection Observer for Scroll Reveals ──────
  const educationSection = document.getElementById('education-section');
  const experienceSection = document.getElementById('experience-section');
  const aboutSection = document.getElementById('about-section');
  const labSection = document.getElementById('lab-section');
  const footerContent = document.querySelector('.footer-content');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === projectsTrack) {
          projectsSec.classList.add('visible');
        } else {
          entry.target.classList.add('visible');
          if (entry.target === nameWarpSection && nameWarpController) {
            nameWarpController.start();
          }
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  if (educationSection) revealObserver.observe(educationSection);
  if (experienceSection) revealObserver.observe(experienceSection);
  if (aboutSection) revealObserver.observe(aboutSection);
  if (labSection) revealObserver.observe(labSection);
  if (nameWarpSection) revealObserver.observe(nameWarpSection);
  if (footerContent) revealObserver.observe(footerContent);

  // Async function to load projects and initialize scroll behavior
  async function loadProjects() {
    if (!projectsTrack || !projectsStack || !projectsScroller) return;

    let projects = [];
    try {
      const response = await fetch('src/data/projects.json');
      if (!response.ok) throw new Error('Failed to fetch projects JSON');
      projects = await response.json();
    } catch (err) {
      console.warn('Could not load projects.json, using default project list.', err);
      projects = [
        {
          "id": "1",
          "title": "Project Alpha",
          "description": "An elegant open-source web application designed with absolute-black themes and high performance.",
          "tags": "HTML, CSS, Vanilla JS",
          "link": "https://github.com/anmxlr",
          "github": "https://github.com/anmxlr",
          "image": ""
        }
      ];
    }

    totalSlots = projects.length;
    if (totalSlots === 0) {
      projectsTrack.style.display = 'none';
      return;
    }

    // Dynamic track height for desktop scroll-pinning (e.g. 100vh per project)
    function handleResize() {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        projectsTrack.style.height = 'auto';
      } else {
        projectsTrack.style.height = `${window.innerHeight + getProjectsScrollableVh(totalSlots) * window.innerHeight}px`;
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    // Clear and inject slots
    projectsStack.innerHTML = '';
    projects.forEach((proj, idx) => {
      const slot = document.createElement('div');
      slot.className = 'stack-slot';
      if (idx === 0) slot.classList.add('active');

      const card = document.createElement('project-card');
      card.setAttribute('title', proj.title);
      card.setAttribute('description', proj.description);
      card.setAttribute('tags', proj.tags);
      card.setAttribute('link', proj.link);
      if (proj.github) card.setAttribute('github', proj.github);
      if (proj.image) card.setAttribute('image', proj.image);
      if (proj.year) card.setAttribute('year', proj.year);
      if (proj.status) card.setAttribute('status', proj.status);

      slot.appendChild(card);
      projectsStack.appendChild(slot);
    });

    slots = document.querySelectorAll('.stack-slot');

    let pageSnapTimer = null;

    // Desktop Page Scroll (Sticky Pinning) logic
    window.addEventListener('scroll', () => {
      if (window.innerWidth <= 768) return;

      const trackRect = projectsTrack.getBoundingClientRect();
      const trackHeight = trackRect.height - window.innerHeight;
      if (trackHeight <= 0) return;

      const scrolled = Math.min(Math.max(-trackRect.top, 0), trackHeight);
      targetProgress = scrolledToProjectProgress(scrolled, totalSlots);

      clearTimeout(pageSnapTimer);
      if (trackRect.top <= 80 && trackRect.bottom >= window.innerHeight - 80 && totalSlots > 1) {
        pageSnapTimer = setTimeout(() => {
          const snapIndex = Math.round(targetProgress * (totalSlots - 1));
          const snapOffset = lockIndexToProjectScrollPx(snapIndex, totalSlots);
          if (Math.abs(scrolled - snapOffset) < 32) return;

          window.scrollTo({
            top: window.scrollY + trackRect.top + snapOffset,
            behavior: 'smooth'
          });
        }, 320);
      }
    }, { passive: true });

    // Mobile Horizontal Scroll logic
    projectsScroller.addEventListener('scroll', () => {
      if (window.innerWidth > 768) return; // Handled by page scroll on desktop

      const maxScroll = projectsScroller.scrollWidth - projectsScroller.clientWidth;
      targetProgress = maxScroll > 0 ? projectsScroller.scrollLeft / maxScroll : 0;
    }, { passive: true });

    // Start render loop
    renderLoop();

    // Observe track for reveals
    revealObserver.observe(projectsTrack);
  }

  // Animation Loop (lerps scroll progress, custom cursor ring, and parallax coordinates)
  function renderLoop() {
    const isMobile = window.innerWidth <= 768;
    const progressDelta = Math.abs(targetProgress - currentProgress);
    const progressLerp = progressDelta > 0.01 ? 0.14 : 0.1;

    currentProgress += (targetProgress - currentProgress) * progressLerp;

    if (projectsProgress) {
      projectsProgress.style.transform = `scaleX(${Math.max(0.04, currentProgress)})`;
    }

    if (slots.length && totalSlots > 0) {
      if (isMobile) {
        applyMobileStackSlots();
      } else {
        applyDesktopStackSlots(currentProgress, totalSlots);
      }
    }

    if (!isMobile) {
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      const gridSpeed = 0.28 + progressDelta * 18;
      gridOffset = (gridOffset + gridSpeed) % 60;

      if (bgCircles) {
        bgCircles.style.transform = `rotate(${currentProgress * 48 + currentMouseX * 18}deg) translate3d(${currentMouseX * 22}px, ${currentMouseY * 22}px, 0)`;
      }
      if (bgGrid) {
        bgGrid.style.transform = `perspective(600px) rotateX(${65 + currentMouseY * 8}deg) rotateY(${currentMouseX * 8}deg) translateY(${gridOffset}px)`;
      }
    }

    // Animate mouse follow glow orb
    if (glowPrimary) {
      orbX += (mouseX - orbX) * 0.03;
      orbY += (mouseY - orbY) * 0.03;
      glowPrimary.style.left = `${orbX}px`;
      glowPrimary.style.top = `${orbY}px`;
      glowPrimary.style.transform = 'translate3d(-50%, -50%, 0)';
    }

    // Animate custom cursor ring
    if (isDesktop && cursorRing) {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }

    requestAnimationFrame(renderLoop);
  }

  // Load projects
  loadProjects();

  // ── Logo click to top ─────────────────────────────
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Contact Modal Toggle ─────────────────────────
  const toggleModal = (show) => modalOverlay.classList.toggle('active', show);
  if (contactBtn && modalOverlay && modalClose) {
    contactBtn.addEventListener('click', (e) => { e.preventDefault(); toggleModal(true); });
    modalClose.addEventListener('click', () => toggleModal(false));
    modalOverlay.addEventListener('click', (e) => e.target === modalOverlay && toggleModal(false));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && toggleModal(false));

    // Let's Connect button click handler
    const nameConnectBtn = document.getElementById('name-connect-btn');
    if (nameConnectBtn) {
      nameConnectBtn.addEventListener('click', (e) => { e.preventDefault(); toggleModal(true); });
    }
  }

  // ── Mobile Navigation Menu Toggle ──────────────────
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileContactTrigger = document.getElementById('mobile-contact-trigger');

  const toggleMobileMenu = (show) => {
    const isShowing = show !== undefined ? show : !mobileNavOverlay.classList.contains('active');
    menuToggleBtn.classList.toggle('active', isShowing);
    mobileNavOverlay.classList.toggle('active', isShowing);
    document.documentElement.classList.toggle('scroll-locked', isShowing);
    document.body.classList.toggle('scroll-locked', isShowing);
  };

  if (menuToggleBtn && mobileNavOverlay) {
    menuToggleBtn.addEventListener('click', () => toggleMobileMenu());

    // Close menu when clicking any nav link
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link === mobileContactTrigger) {
          e.preventDefault();
          toggleMobileMenu(false);
          // Small delay to let the menu close transition finish before showing the contact modal
          setTimeout(() => toggleModal(true), 350);
        } else {
          toggleMobileMenu(false);
        }
      });
    });

    // Close menu when clicking outside of links (on the overlay itself)
    mobileNavOverlay.addEventListener('click', (e) => {
      if (e.target === mobileNavOverlay) {
        toggleMobileMenu(false);
      }
    });
  }

  function initConstellation() {
    const canvas = document.getElementById('constellation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const points = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = null;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points.length = 0;
      const count = Math.min(70, Math.max(28, Math.floor(width * height / 24000)));
      for (let i = 0; i < count; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.2 + 0.4
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      points.forEach((point, index) => {
        point.x += point.vx + targetMouseX * 0.04;
        point.y += point.vy + targetMouseY * 0.04;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = index + 1; j < points.length; j++) {
          const other = points[j];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 115) {
            ctx.globalAlpha = (1 - distance / 115) * 0.55;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });
      rafId = requestAnimationFrame(draw);
    }

    const onResize = debounce(resize, 150);
    window.addEventListener('resize', onResize);
    resize();
    draw();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
      } else if (!document.hidden) {
        draw();
      }
    });
  }

  function initLabScroll() {
    const track = document.getElementById('lab-scroll-track');
    const textTrack = document.getElementById('lab-scroll-text-track');
    const viewport = textTrack?.parentElement;
    if (!track || !textTrack || !viewport) return;

    const items = Array.from(textTrack.querySelectorAll('.lab-scroll-text-item'));
    if (!items.length) return;

    const totalItems = items.length;
    const HOLD_VH = 0.42;
    const TRANS_VH = 0.16;
    const VIEWPORT_PAD = 16;
    let labSnapTimer = null;
    let itemOffsets = [0];
    let targetIndex = 0;
    let currentIndex = 0;
    let displayOffset = 0;
    let isLocked = true;

    function easeInOutCubic(t) {
      const x = Math.min(Math.max(t, 0), 1);
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function getScrollableVh() {
      return totalItems * HOLD_VH + (totalItems - 1) * TRANS_VH;
    }

    function measureItems() {
      itemOffsets = [0];
      const heights = items.map((item) => {
        item.style.height = 'auto';
        return item.getBoundingClientRect().height;
      });

      for (let i = 1; i < heights.length; i++) {
        itemOffsets.push(itemOffsets[i - 1] + heights[i - 1]);
      }

      const maxHeight = Math.max(...heights, 1);
      viewport.style.height = `${maxHeight + VIEWPORT_PAD}px`;
      return maxHeight;
    }

    function scrolledToIndex(scrolledPx) {
      const vh = window.innerHeight;
      let cursorVh = 0;

      for (let i = 0; i < totalItems; i++) {
        if (scrolledPx / vh < cursorVh + HOLD_VH) {
          return { index: i, locked: true };
        }
        cursorVh += HOLD_VH;

        if (i < totalItems - 1) {
          if (scrolledPx / vh < cursorVh + TRANS_VH) {
            const t = easeInOutCubic((scrolledPx / vh - cursorVh) / TRANS_VH);
            return { index: i + t, locked: false };
          }
          cursorVh += TRANS_VH;
        }
      }

      return { index: totalItems - 1, locked: true };
    }

    function lockIndexToScrollPx(lockIndex) {
      const vh = window.innerHeight;
      let cursorVh = 0;

      for (let i = 0; i < lockIndex; i++) {
        cursorVh += HOLD_VH + TRANS_VH;
      }
      cursorVh += HOLD_VH * 0.5;
      return cursorVh * vh;
    }

    function nearestLockIndex(scrolledPx) {
      let nearest = 0;
      let minDist = Infinity;

      for (let i = 0; i < totalItems; i++) {
        const dist = Math.abs(scrolledPx - lockIndexToScrollPx(i));
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }

      return nearest;
    }

    function applyItemStates() {
      const activeIndex = Math.min(Math.round(currentIndex), totalItems - 1);

      items.forEach((item, i) => {
        const isActive = i === activeIndex;
        item.classList.toggle('is-active', isActive);
        item.classList.toggle('is-locked', isActive && isLocked);
        item.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
    }

    function labRenderLoop() {
      if (window.innerWidth > 768) {
        const lerp = isLocked ? 0.14 : 0.1;
        currentIndex += (targetIndex - currentIndex) * lerp;

        if (Math.abs(targetIndex - currentIndex) < 0.001) {
          currentIndex = targetIndex;
        }

        const activeIndex = Math.min(Math.round(currentIndex), totalItems - 1);
        const targetOffset = itemOffsets[activeIndex] ?? 0;
        displayOffset += (targetOffset - displayOffset) * lerp;

        textTrack.style.transform = `translate3d(0, ${-displayOffset}px, 0)`;
        applyItemStates();
      }

      requestAnimationFrame(labRenderLoop);
    }

    function setTrackHeight() {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        track.style.height = 'auto';
        viewport.style.height = 'auto';
        textTrack.style.transform = '';
        items.forEach((item, i) => {
          item.classList.toggle('is-active', i === 0);
          item.classList.remove('is-locked');
        });
        return;
      }

      measureItems();
      track.style.height = `${window.innerHeight + getScrollableVh() * window.innerHeight}px`;
      currentIndex = targetIndex;
      displayOffset = itemOffsets[Math.min(Math.round(currentIndex), totalItems - 1)] ?? 0;
      textTrack.style.transform = `translate3d(0, ${-displayOffset}px, 0)`;
    }

    function updateScrollText() {
      if (window.innerWidth <= 768) return;

      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const state = scrolledToIndex(scrolled);
      targetIndex = state.index;
      isLocked = state.locked;

      clearTimeout(labSnapTimer);
      if (rect.top <= 80 && rect.bottom >= window.innerHeight - 80) {
        labSnapTimer = setTimeout(() => {
          const snapIndex = nearestLockIndex(scrolled);
          const snapOffset = lockIndexToScrollPx(snapIndex);
          if (Math.abs(scrolled - snapOffset) < 24) return;

          window.scrollTo({
            top: window.scrollY + rect.top + snapOffset,
            behavior: 'smooth'
          });
        }, 280);
      }
    }

    window.addEventListener('resize', () => {
      setTrackHeight();
      updateScrollText();
    });
    window.addEventListener('scroll', updateScrollText, { passive: true });

    setTrackHeight();
    updateScrollText();
    labRenderLoop();

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        setTrackHeight();
        updateScrollText();
      });
    }
  }

  function initSignalPanel() {
    const panel = document.getElementById('signal-panel');
    const ambient = document.getElementById('signal-ambient');
    const dialFill = document.getElementById('signal-dial-fill');
    const timeEl = document.getElementById('signal-time');
    if (!panel) return;

    const DIAL_ARC = 367;

    function updateTime() {
      if (!timeEl) return;
      timeEl.textContent = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      }).format(new Date());
    }

    updateTime();
    setInterval(updateTime, 30000);

    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -4;
      const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 5;

      panel.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

      if (ambient) {
        ambient.style.background = `radial-gradient(circle 150px at ${x}% ${y}%, rgba(255, 255, 255, 0.1), transparent 70%)`;
      }
    });

    panel.addEventListener('mouseleave', () => {
      panel.style.transform = '';
      if (ambient) {
        ambient.style.background = '';
      }
    });

    const counters = panel.querySelectorAll('[data-count-to]');
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counters.forEach(counter => {
          const target = Number(counter.dataset.countTo || 0);
          const suffix = counter.dataset.suffix || '';
          const start = performance.now();
          const duration = 1400;
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const value = Math.round(target * eased);
            counter.textContent = `${value}${suffix}`;

            if (dialFill && counter.classList.contains('signal-dial-value')) {
              dialFill.style.strokeDashoffset = String(DIAL_ARC * (1 - eased * (target / 100)));
            }

            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counterObserver.observe(panel);
  }

  function initHiddenTerminal() {
    const overlay = document.getElementById('terminal-overlay');
    const body = document.getElementById('terminal-body');
    const form = document.getElementById('terminal-form');
    const input = document.getElementById('terminal-input');
    const close = document.getElementById('terminal-close');
    const trigger = document.getElementById('command-trigger');
    if (!overlay || !body || !form || !input || !close) return;

    const openTerminal = () => {
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => input.focus(), 80);
      
      if (typeof window.unlockPassportStamp === 'function') {
        window.unlockPassportStamp('hacker');
      }
    };
    const closeTerminal = () => {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    };
    const writeLine = (text, muted = false) => {
      const p = document.createElement('p');
      if (muted) p.className = 'terminal-muted';
      p.textContent = text;
      body.appendChild(p);
      body.scrollTop = body.scrollHeight;
    };

    if (trigger) trigger.addEventListener('click', openTerminal);
    close.addEventListener('click', closeTerminal);
    overlay.addEventListener('click', (e) => e.target === overlay && closeTerminal());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const command = input.value.trim().toLowerCase();
      if (!command) return;
      writeLine(`$ ${command}`, true);
      input.value = '';

      if (command === 'projects') {
        closeTerminal();
        document.getElementById('projects-scroll-track')?.scrollIntoView({ behavior: 'smooth' });
      } else if (command === 'contact') {
        closeTerminal();
        toggleModal(true);
      } else if (command === 'manifesto') {
        writeLine('make it fast. make it useful. hide a little magic inside.');
      } else if (command === 'clear') {
        body.innerHTML = '';
      } else if (command === 'close' || command === 'exit') {
        closeTerminal();
      } else if (command === 'home') {
        closeTerminal();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        writeLine('unknown command. try: projects, contact, manifesto, clear, close, home');
      }
    });

    document.addEventListener('keydown', (e) => {
      const typing = e.target.matches('input, textarea');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openTerminal();
      } else if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeTerminal();
      } else if (!typing && e.key === '`') {
        e.preventDefault();
        openTerminal();
      }
    });
  }

  function initEasterEggs() {
    const toast = document.getElementById('egg-toast');
    const logo = document.querySelector('.logo');
    let logoClicks = 0;
    let toastTimer = null;
    let keyBuffer = '';

    const showToast = (message) => {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    };

    if (logo) {
      logo.addEventListener('click', () => {
        logoClicks++;
        if (logoClicks === 3) showToast('logo frequency unlocked: triple tap detected.');
        if (logoClicks >= 5) {
          document.documentElement.classList.add('logo-tilt');
          showToast('easter egg: spin protocol armed.');
          setTimeout(() => document.documentElement.classList.remove('logo-tilt'), 950);
          logoClicks = 0;
        }
        setTimeout(() => { logoClicks = 0; }, 1400);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-12);
      if (keyBuffer.endsWith('anmxlr')) {
        showToast('secret handshake accepted.');
        document.documentElement.classList.add('logo-tilt');
        setTimeout(() => document.documentElement.classList.remove('logo-tilt'), 950);
      }
    });
  }

  function initPhonePuzzle() {
    const trigger = document.getElementById('footer-contact-lock');
    const puzzle = document.getElementById('phone-puzzle');
    const input = document.getElementById('phone-puzzle-input');
    const submit = document.getElementById('phone-puzzle-submit');
    const result = document.getElementById('phone-puzzle-result');
    if (!trigger || !puzzle || !input || !submit || !result) return;

    const contactNumber = '9153905708';
    const unlock = () => {
      const answer = input.value.trim().replace(/\s+/g, '');
      if (answer === '16.67') {
        result.textContent = contactNumber;
        result.classList.add('unlocked');
        trigger.textContent = 'Mobile number unlocked';
        
        if (typeof window.unlockPassportStamp === 'function') {
          window.unlockPassportStamp('investigator');
        }
      } else {
        result.textContent = 'Not quite. Hint: Think about all possible outcomes when rolling two dice.';
        result.classList.remove('unlocked');
      }
    };

    trigger.addEventListener('click', () => {
      const isOpen = puzzle.classList.toggle('active');
      puzzle.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) setTimeout(() => input.focus(), 80);
    });

    submit.addEventListener('click', unlock);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') unlock();
    });
  }

  function initReachForm() {
    const form = document.getElementById('reach-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const location = (data.get('location') || '').toString().trim();
      const building = (data.get('building') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      const subject = `Portfolio reach out from ${name || 'someone building something'}`;
      const body = [
        'Hey Anmol,',
        '',
        `Name: ${name}`,
        `Location: ${location || 'Not shared'}`,
        `Email: ${email}`,
        `What I am building: ${building}`,
        '',
        'Message:',
        message,
        '',
        'Sent from anmxlr.github.io'
      ].join('\n');

      window.location.href = `mailto:anmxlr@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }


  function initNameWarp() {
    const canvas = document.getElementById('name-warp-canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let mouse = { x: null, y: null, radius: 100 };
    let time = 0;
    let animId = null;
    let active = false;
    const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;
    let mobileSizedOnce = false;

    class WarpParticle {
      constructor(canvasWidth, canvasHeight, x, y, size) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.originX = x;
        this.originY = y;
        this.baseSize = size;
        this.size = size;
        this.vx = 0;
        this.vy = 0;
        this.ease = 0.04 + Math.random() * 0.04;
        this.friction = 0.85 + Math.random() * 0.05;
      }

      update(mouseX, mouseY, mouseRadius, time) {
        const targetX = this.originX;
        const targetY = this.originY;

        let targetSize = this.baseSize;
        let pushX = 0;
        let pushY = 0;

        if (mouseX !== null && mouseY !== null) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius) {
            const force = (mouseRadius - distance) / mouseRadius;
            const angle = Math.atan2(dy, dx);
            const pushDistance = 45 * force;
            pushX = Math.cos(angle) * pushDistance;
            pushY = Math.sin(angle) * pushDistance;
            targetSize = this.baseSize * (1 + force * 2.5);
          }
        }

        this.size += (targetSize - this.size) * 0.15;

        const destX = targetX + pushX;
        const destY = targetY + pushY;

        const ax = (destX - this.x) * this.ease;
        const ay = (destY - this.y) * this.ease;

        this.vx += ax;
        this.vy += ay;
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      }
    }

    function resize() {
      if (isMobileViewport() && mobileSizedOnce) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      mouse.radius = Math.min(rect.width * 0.15, 110);
      createTextParticles(rect.width, rect.height);
      if (isMobileViewport()) mobileSizedOnce = true;
    }

    function createTextParticles(wFloat, hFloat) {
      const w = Math.floor(wFloat);
      const h = Math.floor(hFloat);
      particles = [];
      if (w <= 0 || h <= 0) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const octx = offscreen.getContext('2d');

      const textString = 'Building AI, Products, and Other Cool Stuff.';
      let lines = [];
      let shouldWrap = false;
      let mobileStyle = false;

      if (w < 480) {
        // Very narrow screen (mobile portrait): split into 3 lines for max font size
        lines = ["Building AI,", "Products, and", "Other Cool Stuff."];
        shouldWrap = true;
        mobileStyle = true;
      } else if (w < 768) {
        // Medium narrow screen (tablet portrait): split into 2 lines
        lines = ["Building AI, Products,", "and Other Cool Stuff."];
        shouldWrap = true;
      } else {
        lines = [textString];
      }

      const maxAllowedWidth = w * (mobileStyle ? 0.96 : 0.92);
      let fontSize = Math.min(w * 0.08, shouldWrap ? 42 : 100);
      if (mobileStyle) {
        fontSize = Math.min(w * 0.16, 48); // Allow much larger relative font size when wrapping into 3 lines
      } else if (shouldWrap) {
        fontSize = Math.min(w * 0.12, 42); 
      }
      octx.font = `900 ${fontSize}px 'Inter', sans-serif`;

      let maxLineWidth = 0;
      lines.forEach(line => {
        const lineW = octx.measureText(line).width;
        if (lineW > maxLineWidth) {
          maxLineWidth = lineW;
        }
      });

      if (maxLineWidth > maxAllowedWidth) {
        fontSize = fontSize * (maxAllowedWidth / maxLineWidth);
        octx.font = `900 ${fontSize}px 'Inter', sans-serif`;
      }

      octx.fillStyle = '#ffffff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';

      const lineGap = fontSize * 0.25;
      const totalHeight = lines.length * fontSize + (lines.length - 1) * lineGap;
      const startY = (h - totalHeight) / 2 + fontSize / 2;

      lines.forEach((line, index) => {
        const y = startY + index * (fontSize + lineGap);
        octx.fillText(line, w / 2, y);
      });

      const imgData = octx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Increase pixel sampling density and particle size on mobile for high readability
      const step = w > 768 ? 4 : (w < 480 ? 2 : 3);
      const baseParticleSize = w > 768 ? 1.5 : (w < 480 ? 2.8 : 2.0);
      const particleSizeVar = w > 768 ? 1.5 : (w < 480 ? 2.0 : 1.8);

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const index = (y * w + x) * 4;
          const alpha = data[index + 3];
          if (alpha > 128) {
            const size = Math.random() * particleSizeVar + baseParticleSize;
            particles.push(new WarpParticle(w, h, x, y, size));
          }
        }
      }
    }

    function animate() {
      if (!active) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      time++;

      particles.forEach(p => {
        p.update(mouse.x, mouse.y, mouse.radius, time);
        p.draw(ctx);
      });

      animId = requestAnimationFrame(animate);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = null;
      mouse.y = null;
    }

    function onTouchMove(e) {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
      }
    }

    // Trigger redraw when fonts finish loading to ensure correct typeface shapes
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (active && !isMobileViewport()) resize();
      });
    }

    function onTouchEnd() {
      mouse.x = null;
      mouse.y = null;
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });

    const handleResize = debounce(() => {
      if (isMobileViewport()) return;
      resize();
    }, 150);

    window.addEventListener('resize', handleResize);

    return {
      start() {
        if (active) return;
        active = true;
        resize();
        animate();
      },
      stop() {
        active = false;
        if (animId) cancelAnimationFrame(animId);
      }
    };
  }

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
});
