// Force scroll to top on refresh/load and disable automatic scroll restoration
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
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

  initConstellation();
  initLabConsole();
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
  const lifeSection = document.getElementById('life-section');
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
  if (lifeSection) revealObserver.observe(lifeSection);
  if (nameWarpSection) revealObserver.observe(nameWarpSection);
  if (footerContent) revealObserver.observe(footerContent);

  // Async function to load projects and initialize scroll behavior
  async function loadProjects() {
    if (!projectsTrack || !projectsStack || !projectsScroller || !projectsSpacer) return;

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

    projectsSpacer.style.height = totalSlots > 1 ? `${Math.max(900, totalSlots * 360)}px` : '100%';

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

    let projectSnapTimer = null;
    projectsScroller.addEventListener('scroll', () => {
      const totalScrollable = projectsScroller.scrollHeight - projectsScroller.clientHeight;
      targetProgress = totalScrollable > 0
        ? Math.min(Math.max(projectsScroller.scrollTop / totalScrollable, 0), 1)
        : 0;

      clearTimeout(projectSnapTimer);
      projectSnapTimer = setTimeout(() => {
        if (totalSlots <= 1) return;
        const snapIndex = Math.round(targetProgress * (totalSlots - 1));
        const snapProgress = snapIndex / (totalSlots - 1);
        projectsScroller.scrollTo({
          top: snapProgress * totalScrollable,
          behavior: 'smooth'
        });
      }, 140);
    }, { passive: true });

    // Start render loop
    renderLoop();

    // Observe track for reveals
    revealObserver.observe(projectsTrack);
  }

  // Animation Loop (lerps scroll progress, custom cursor ring, and parallax coordinates)
  function renderLoop() {
    currentProgress += (targetProgress - currentProgress) * 0.08;
    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;

    // Grid animation with velocity-driven speedup
    const speed = 0.4 + Math.abs(targetProgress - currentProgress) * 25;
    gridOffset = (gridOffset + speed) % 60;

    const bounce = totalSlots > 1 ? Math.abs(Math.sin(currentProgress * Math.PI * (totalSlots - 1))) : 0;

    if (bgCircles) {
      bgCircles.style.transform = `rotate(${currentProgress * 80 + currentMouseX * 30}deg) translate3d(${currentMouseX * 35}px, ${currentMouseY * 35}px, 0) scale(${1 + bounce * 0.06})`;
    }
    if (bgGrid) {
      bgGrid.style.transform = `perspective(600px) rotateX(${65 + currentMouseY * 12}deg) rotateY(${currentMouseX * 12}deg) translateY(${gridOffset}px)`;
    }

    const activeIndex = totalSlots > 1 ? Math.round(currentProgress * (totalSlots - 1)) : 0;
    if (projectsProgress) {
      projectsProgress.style.transform = `scaleX(${Math.max(0.04, currentProgress)})`;
    }

    slots.forEach((slot, index) => {
      const x = totalSlots > 1 ? index - currentProgress * (totalSlots - 1) : 0;
      const absX = Math.abs(x);
      slot.style.transform = `translate3d(${x * 125}%, ${absX * 20}px, 0) rotateY(${x * -18}deg) skewX(${x * -5}deg) scale(${1 - Math.min(absX * 0.08, 0.2)})`;
      slot.style.opacity = Math.max(0, 1 - absX * 0.65);
      slot.style.filter = absX > 0.1 ? `blur(${Math.min(absX * 2, 4)}px)` : 'none';
      slot.classList.toggle('active', index === activeIndex);
    });

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

  function initLabConsole() {
    const chips = document.querySelectorAll('.lab-chip');
    const text = document.getElementById('lab-console-text');
    if (!chips.length || !text) return;

    const copy = {
      ai: 'Training models to become useful products, not just impressive demos.',
      web: 'Obsessing over motion, latency, layout, and the tiny details that make an interface feel inevitable.',
      backend: 'Designing APIs, data flows, and services that stay calm when the frontend gets ambitious.',
      product: 'Turning vague ideas into shippable loops: build, test, learn, tighten.'
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(item => item.classList.remove('active'));
        chip.classList.add('active');
        text.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        text.textContent = copy[chip.dataset.lab] || copy.ai;
      });
    });
  }

  function initSignalPanel() {
    const panel = document.getElementById('signal-panel');
    if (!panel) return;

    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      panel.style.transform = `perspective(700px) rotateX(${y * -7}deg) rotateY(${x * 9}deg)`;
    });

    panel.addEventListener('mouseleave', () => {
      panel.style.transform = '';
    });

    const counters = panel.querySelectorAll('[data-count-to]');
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counters.forEach(counter => {
          const target = Number(counter.dataset.countTo || 0);
          const start = performance.now();
          const duration = 1100;
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(target * eased).toString();
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
