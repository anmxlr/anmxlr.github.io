// ── About Page JS ──────────────────────────────────
// Stripped-down script for the about page only.
// No intro/loading screen – page is visible immediately.

function startAboutPage() {
  const mainPage = document.getElementById('main-page');
  const topBar = document.getElementById('top-bar');
  const scrollIndicator = document.getElementById('scroll-indicator');

  // ── Instant Visibility (no loading delay) ─────────
  if (mainPage) mainPage.classList.add('visible');
  if (topBar) topBar.classList.add('visible');
  document.documentElement.classList.remove('scroll-locked');
  document.body.classList.remove('scroll-locked');

  // ── Reverse Nether Portal Transition ──────────────
  const transitionEl = document.getElementById('portal-transition');
  if (transitionEl && (localStorage.getItem('nether_transition_back') === 'true' || localStorage.getItem('nether_transition') === 'true')) {
    localStorage.removeItem('nether_transition_back');
    localStorage.removeItem('nether_transition');
    transitionEl.classList.add('active');
    transitionEl.style.transition = 'none';
    transitionEl.style.transform = 'scale(1)';
    transitionEl.style.opacity = '1';
    transitionEl.style.borderRadius = '0%';
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        transitionEl.style.transition = 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease, border-radius 1.5s ease';
        transitionEl.style.transform = 'scale(0)';
        transitionEl.style.opacity = '0';
        transitionEl.style.borderRadius = '50%';
      }, 50);
    });
  }

  // ── Tap Sound ─────────────────────────────────────
  const tapAudioSrc = '../assets/audio/tap.mp3';
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

  // ── Image Cursor ──────────────────────────────────
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let cursorEl = null;
  let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  let cursorVisible = false;
  let cursorRAF = null;

  if (isDesktop) {
    // Create cursor element
    cursorEl = document.createElement('div');
    cursorEl.className = 'image-cursor';
    cursorEl.innerHTML = '<img src="../assets/images/about/cursor.png" alt="" draggable="false">';
    document.body.appendChild(cursorEl);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
      *, *::before, *::after { cursor: none !important; }
      .image-cursor {
        position: fixed;
        left: 0; top: 0;
        width: 40px; height: 40px;
        pointer-events: none;
        z-index: 99999;
        transform: translate(var(--cursor-offset-x, -20px), var(--cursor-offset-y, -20px));
        will-change: transform, left, top;
        opacity: 0;
        transition: opacity 0.25s ease, width 0.3s cubic-bezier(0.22,1,0.36,1), height 0.3s cubic-bezier(0.22,1,0.36,1);
      }
      .image-cursor::before {
        content: '';
        position: absolute;
        inset: -30px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;
      }
      .image-cursor.visible { opacity: 1; }
      .image-cursor.hovering {
        width: 52px; height: 52px;
      }
      .image-cursor.hovering::before {
        transform: scale(1.3);
        background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%);
      }
      .image-cursor.clicking {
        width: 32px; height: 32px;
      }
      .image-cursor.clicking::before {
        transform: scale(0.85);
      }
      .image-cursor img {
        width: 100%; height: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
        transition: transform 0.2s ease;
      }
      .image-cursor.hovering img {
        transform: rotate(-12deg) scale(1.1);
      }
      .image-cursor.clicking img {
        transform: scale(0.85);
      }
      .image-cursor.swinging img {
        transform: rotate(-35deg) scale(1.15) !important;
        transition: transform 0.05s ease-out !important;
      }
    `;
    document.head.appendChild(cursorStyle);

    // Visual cursor show/hide listeners
    window.addEventListener('mouseenter', () => {
      if (cursorEl) cursorEl.classList.add('visible');
    });

    window.addEventListener('mouseleave', () => {
      if (cursorEl) cursorEl.classList.remove('visible');
    });

    window.updateGlobalCursor = function (tier) {
      if (!cursorEl) return;
      const img = cursorEl.querySelector('img');
      if (img) {
        const paths = [
          '../assets/images/about/cursor.png',
          '../assets/images/minecraft/Wooden_Pickaxe_JE3_BE3.webp',
          '../assets/images/minecraft/Iron_Pickaxe_JE3_BE2.webp',
          '../assets/images/minecraft/Golden_Pickaxe_JE4_BE3.webp',
          '../assets/images/minecraft/Diamond_Pickaxe_JE3_BE3.webp',
          '../assets/images/minecraft/Enchanted_Netherite_Pickaxe.webp'
        ];
        const newSrc = paths[tier] || paths[0];
        if (img.getAttribute('src') !== newSrc) {
          img.src = newSrc;
          img.onerror = () => {
            img.src = '../assets/images/about/cursor.png';
          };
        }
        
        if (tier === 0) {
          cursorEl.style.setProperty('--cursor-offset-x', '-20px');
          cursorEl.style.setProperty('--cursor-offset-y', '-20px');
        } else {
          cursorEl.style.setProperty('--cursor-offset-x', '0px');
          cursorEl.style.setProperty('--cursor-offset-y', '-32px');
        }
      }
    };

    // Load tier from localStorage for cursor initialization
    let initialTier = 0;
    const savedStateForCursor = localStorage.getItem('mc_pocket_miner_state');
    if (savedStateForCursor) {
      try {
        const parsed = JSON.parse(savedStateForCursor);
        if (typeof parsed.tier === 'number') {
          initialTier = parsed.tier;
        }
      } catch (e) {}
    }
    window.currentMinecraftTier = initialTier;
    window.updateGlobalCursor(initialTier);

    // Hover on interactive elements
    window.addEventListener('mouseover', (e) => {
      const isBlock = e.target.closest('#mc-active-block');
      if (isBlock) {
        cursorEl.classList.add('mc-custom-cursor');
        cursorEl.classList.remove('hovering');
      } else {
        cursorEl.classList.remove('mc-custom-cursor');
        const hit = e.target.closest('a, button, input, textarea, .logo, [role="button"], .content-card, .doing-item, .tag, .sidequest-item, .plate-item, .post-link, .decor-image');
        cursorEl.classList.toggle('hovering', !!hit);
      }
    });

    // Click states
    window.addEventListener('mousedown', () => {
      cursorEl.classList.add('clicking');
      if (cursorEl.classList.contains('mc-custom-cursor')) {
        cursorEl.classList.add('swinging');
      }
    });
    window.addEventListener('mouseup', () => {
      cursorEl.classList.remove('clicking');
      cursorEl.classList.remove('swinging');
    });

    // Smooth follow loop
    function animateCursor() {
      cursorX += (targetX - cursorX) * 0.18;
      cursorY += (targetY - cursorY) * 0.18;
      cursorEl.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      cursorRAF = requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // Track mouse and touch coordinates unconditionally (for Endermen AI)
  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!cursorVisible) {
      cursorVisible = true;
      if (cursorEl) {
        cursorEl.classList.add('visible');
        // Snap custom cursor to first position
        cursorX = targetX;
        cursorY = targetY;
        cursorEl.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      }
    }
  }, { passive: true });

  window.addEventListener('mouseenter', () => {
    cursorVisible = true;
    if (cursorEl) cursorEl.classList.add('visible');
  });

  window.addEventListener('mouseleave', () => {
    cursorVisible = false;
    if (cursorEl) cursorEl.classList.remove('visible');
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      targetX = e.touches[0].clientX;
      targetY = e.touches[0].clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        cursorX = targetX;
        cursorY = targetY;
      }
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      targetX = e.touches[0].clientX;
      targetY = e.touches[0].clientY;
      cursorVisible = true;
    }
  }, { passive: true });

  // ── Constellation Canvas ──────────────────────────
  initConstellation();

  // ── Scroll Indicator Fade ─────────────────────────
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      scrollIndicator.classList.toggle('fade-out', window.scrollY > 80);
    }, { passive: true });
  }

  // ── Logo Click to Top ─────────────────────────────
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      playTap(0.4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Tap Sound on Interactive Elements ──────────────
  // Back button
  const backBtn = document.getElementById('contact-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => playTap(0.45));
  }

  // Tags
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => playTap(0.3));
  });

  // Content cards and sidequests
  document.querySelectorAll('.content-card, .sidequest-item').forEach(card => {
    card.addEventListener('click', () => playTap(0.25));
  });

  // Doing / plate items
  document.querySelectorAll('.doing-item, .plate-item').forEach(item => {
    item.addEventListener('click', () => playTap(0.25));
  });

  // Music collage items
  document.querySelectorAll('.collage-item').forEach(item => {
    item.addEventListener('click', () => playTap(0.25));
  });

  // Form submit button
  const reachSend = document.querySelector('.reach-send');
  if (reachSend) {
    reachSend.addEventListener('click', () => playTap(0.45));
  }

  // ── Animated Me (Hover Emoji Explosion) ───────────
  initAnimatedMe();

  // ── Reach Form ────────────────────────────────────
  initReachForm();

  // ── Vinyl Player ──────────────────────────────────
  initVinylPlayer();

  // ── Passport System ────────────────────────────────
  initPassport();

  // ── Draggable Scrapbook Stickers ───────────────────
  initDraggableDecor();

  // ── Decor Fly Out from Brain ───────────────────────
  initDecorFlyOut();

  // ── Minecraft Pocket Miner ─────────────────────────
  initMinecraftGame();

  // ── Section Reveal on Scroll ──────────────────────
  const sections = document.querySelectorAll('.about-content-section');
  const reachSection = document.getElementById('reach-section');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });

    sections.forEach(section => {
      revealObserver.observe(section);
    });

    if (reachSection) revealObserver.observe(reachSection);
  } else {
    // Fallback if IntersectionObserver is not supported
    sections.forEach(section => section.classList.add('visible'));
    if (reachSection) reachSection.classList.add('visible');
  }

  // Double check elements that are already visible in viewport on load/scroll
  function checkRevealFallback() {
    sections.forEach(section => {
      if (!section.classList.contains('visible')) {
        const rect = section.getBoundingClientRect();
        // If element top is above the viewport bottom (with a 20px buffer), reveal it
        if (rect.top < window.innerHeight - 20) {
          section.classList.add('visible');
        }
      }
    });
  }

  // Trigger fallback check on load, scroll and resize
  window.addEventListener('scroll', checkRevealFallback, { passive: true });
  window.addEventListener('resize', checkRevealFallback, { passive: true });
  setTimeout(checkRevealFallback, 600); // Wait for page layouts/stickers to settle

  // ──────────────────────────────────────────────────
  // Function Definitions
  // ──────────────────────────────────────────────────

  function initConstellation() {
    const canvas = document.getElementById('constellation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const points = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = null;
    let mouseInfluenceX = 0, mouseInfluenceY = 0;

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

    // Track mouse for subtle constellation response
    window.addEventListener('mousemove', (e) => {
      mouseInfluenceX = (e.clientX / window.innerWidth) - 0.5;
      mouseInfluenceY = (e.clientY / window.innerHeight) - 0.5;
    }, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(192, 132, 252, 0.65)';
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.15)';
      points.forEach((point, index) => {
        point.x += point.vx + mouseInfluenceX * 0.04;
        point.y += point.vy + mouseInfluenceY * 0.04;
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

  function initAnimatedMe() {
    const animatedMe = document.getElementById('animated-me');
    if (!animatedMe) return;

    const frames = [
      '../assets/images/about/1.PNG',
      '../assets/images/about/2.PNG',
      '../assets/images/about/3.PNG',
      '../assets/images/about/4.PNG',
      '../assets/images/about/5.PNG'
    ];

    // Preload frames to prevent flicker
    frames.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    let intervalId = null;
    let currentFrame = 0; // 0 to 4
    let direction = 1; // 1 = forward, -1 = backward
    let isHovered = false;
    let clickLoopActive = false; // true if running a click-induced loop (1 -> 5 -> 1)

    function startAnimation() {
      if (intervalId) return; // already running
      
      animatedMe.classList.add('animating');
      
      intervalId = setInterval(() => {
        currentFrame += direction;
        
        if (direction === 1) {
          if (currentFrame >= frames.length - 1) {
            currentFrame = frames.length - 1;
            
            if (clickLoopActive) {
              // Click loop: reached the top, now go back
              direction = -1;
            } else if (isHovered) {
              // Hover: hold at frame 5, stop interval
              clearInterval(intervalId);
              intervalId = null;
            } else {
              // Left hover while animating up: go back
              direction = -1;
            }
          }
        } else {
          // direction === -1
          if (currentFrame <= 0) {
            currentFrame = 0;
            clearInterval(intervalId);
            intervalId = null;
            clickLoopActive = false;
            animatedMe.classList.remove('animating');
          }
        }
        
        animatedMe.src = frames[currentFrame];
      }, 100);
    }

    animatedMe.addEventListener('mouseenter', () => {
      isHovered = true;
      clickLoopActive = false; // Hover overrides click loop
      direction = 1;
      startAnimation();
    });

    animatedMe.addEventListener('mouseleave', () => {
      isHovered = false;
      if (!clickLoopActive) {
        direction = -1;
        startAnimation();
      }
    });

    animatedMe.addEventListener('click', () => {
      // Typewriter Particle Burst
      const rect = animatedMe.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const chars = ['*', '+', 'x', 'o', '?', '!', '~', 'a', 'n', 'm', 'x', 'l', 'r'];
      const chosenChars = [];
      for (let i = 0; i < 8; i++) {
        chosenChars.push(chars[Math.floor(Math.random() * chars.length)]);
      }

      chosenChars.forEach((char, index) => {
        setTimeout(() => {
          createTypewriterParticle(char, centerX, centerY);
        }, index * 50);
      });

      // Play click sound
      playTap(0.35);

      // If clicked and not hovered (like mobile tap), run a full cycle 1 -> 5 -> 1
      if (!isHovered) {
        clickLoopActive = true;
        direction = 1;
        startAnimation();
      }
    });
  }

  function createTypewriterParticle(char, startX, startY) {
    const particle = document.createElement('div');
    particle.className = 'typewriter-particle';
    particle.textContent = char;

    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const rotation = Math.random() * 720 - 360;

    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--rot', `${rotation}deg`);

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1500);
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

  function initVinylPlayer() {
    const player = document.getElementById('vinyl-player');
    const sleeve = player ? player.querySelector('.vinyl-sleeve') : null;
    const diskImg = player ? player.querySelector('.vinyl-disk-img') : null;
    const audio = document.getElementById('vinyl-audio');
    if (!player || !sleeve || !diskImg || !audio) return;

    let currentAngle = 0;
    let isDragging = false;
    let lastMouseAngle = 0;
    let centerX = 0, centerY = 0;
    let rafId = null;

    function rotateLoop() {
      if (player.classList.contains('playing')) {
        if (!isDragging) {
          // Spin the vinyl smoothly at 33 RPM (approx 2 degrees per frame at 60fps)
          currentAngle += 1.5;
          diskImg.style.transform = `rotate(${currentAngle}deg)`;
        }
        rafId = requestAnimationFrame(rotateLoop);
      } else {
        rafId = null;
      }
    }

    // Click on sleeve to toggle play/pause
    sleeve.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.unlockPassportStamp) {
        window.unlockPassportStamp('melophile');
      }
      const isPlaying = player.classList.contains('playing');
      if (!isPlaying) {
        player.classList.add('playing');
        audio.play().catch(err => {
          console.warn('Audio playback failed or was blocked by the browser:', err);
        });
        if (!rafId) {
          rafId = requestAnimationFrame(rotateLoop);
        }
      } else {
        player.classList.remove('playing');
        audio.pause();
        audio.currentTime = 0;
        // Reset rotation angle
        currentAngle = 0;
        diskImg.style.transform = 'rotate(0deg)';
      }
    });

    // Handle scratching / dragging the vinyl disk
    diskImg.addEventListener('mousedown', (e) => {
      if (!player.classList.contains('playing')) return;

      if (window.unlockPassportStamp) {
        window.unlockPassportStamp('melophile');
      }

      isDragging = true;
      diskImg.classList.add('scratching');

      const rect = diskImg.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      lastMouseAngle = Math.atan2(dy, dx);

      // Pitch bend down temporarily on grab
      audio.playbackRate = 0.5;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const currentMouseAngle = Math.atan2(dy, dx);

      let deltaAngle = currentMouseAngle - lastMouseAngle;
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

      currentAngle += deltaAngle * (180 / Math.PI);
      diskImg.style.transform = `rotate(${currentAngle}deg)`;

      // Move needle in the audio track based on rotation
      // Clockwise skips forward, counter-clockwise skips backward
      const timeShift = deltaAngle * (1.8 / (2 * Math.PI)); // 1.8 seconds per full spin
      audio.currentTime = Math.max(0, Math.min(audio.duration || 9999, audio.currentTime + timeShift));

      // Pitch/speed modulation based on drag speed
      const speed = Math.abs(deltaAngle) * 15; // velocity factor
      audio.playbackRate = Math.min(2.5, Math.max(0.3, speed));

      lastMouseAngle = currentMouseAngle;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        diskImg.classList.remove('scratching');
        audio.playbackRate = 1.0;
      }
    });

    audio.addEventListener('ended', () => {
      player.classList.remove('playing');
      currentAngle = 0;
      diskImg.style.transform = 'rotate(0deg)';
    });
  }

  function initPassport() {
    const stamps = {
      melophile: document.getElementById('stamp-melophile'),
      hacker: document.getElementById('stamp-hacker'),
      investigator: document.getElementById('stamp-investigator'),
      miner: document.getElementById('stamp-miner')
    };

    function updateStampVisuals(key) {
      const el = stamps[key];
      if (!el) return;
      const isUnlocked = localStorage.getItem(`passport_stamp_${key}`) === 'unlocked';
      if (isUnlocked && !el.classList.contains('unlocked')) {
        el.classList.add('unlocked');
        const statusSpan = el.querySelector('.stamp-status');
        if (statusSpan) statusSpan.textContent = 'PASSED';
      }
    }

    // Initial load
    Object.keys(stamps).forEach(updateStampVisuals);

    // Expose unlock function globally for page actions
    window.unlockPassportStamp = function (key) {
      if (localStorage.getItem(`passport_stamp_${key}`) === 'unlocked') return;
      localStorage.setItem(`passport_stamp_${key}`, 'unlocked');
      
      // Play double thud stamp sound
      if (typeof playTap === 'function') {
        playTap(0.7);
        setTimeout(() => playTap(0.55), 80);
      }

      // Show toast
      showPassportToast(key);

      // Update element
      updateStampVisuals(key);
    };
  }

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

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ── Drag & Drop Decor Images ──────────────────────
  function initDraggableDecor() {
    const decorImages = document.querySelectorAll('.decor-image');
    
    decorImages.forEach(el => {
      // Prevent default browser image dragging
      el.addEventListener('dragstart', (e) => e.preventDefault());
      
      el.addEventListener('mousedown', startDrag);
      el.addEventListener('touchstart', startDrag, { passive: false });
    });
    
    function startDrag(e) {
      // Only drag with left mouse button click
      if (e.type === 'mousedown' && e.button !== 0) return;
      
      const el = this;
      
      // Play a soft tap sound when grabbing the sticker
      if (typeof playTap === 'function') {
        playTap(0.3);
      }
      
      // Get positions
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      
      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent ? el.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
      
      // Absolute positioning relative to offsets
      let currentLeft = rect.left - parentRect.left;
      let currentTop = rect.top - parentRect.top;
      
      // Remove right and bottom offsets
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.left = currentLeft + 'px';
      el.style.top = currentTop + 'px';
      
      const shiftX = clientX - rect.left;
      const shiftY = clientY - rect.top;
      
      // Temporarily raise Z-index and cursor class
      el.style.zIndex = '1000';
      el.classList.add('dragging');
      
      function moveAt(clientX, clientY) {
        let x = clientX - parentRect.left - shiftX;
        let y = clientY - parentRect.top - shiftY;
        
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }
      
      function onMouseMove(e) {
        const moveX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const moveY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        moveAt(moveX, moveY);
      }
      
      if (e.type === 'touchstart') {
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
      } else {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
      
      function onMouseUp() {
        el.classList.remove('dragging');
        el.style.zIndex = '16'; // Keep it slightly higher than normal so it sits above non-dragged items
        
        // Play soft tap sound on drop
        if (typeof playTap === 'function') {
          playTap(0.25);
        }
        
        if (e.type === 'touchstart') {
          document.removeEventListener('touchmove', onMouseMove);
          document.removeEventListener('touchend', onMouseUp);
        } else {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
      }
    }
  }

  // ── Decor Fly Out from Brain ───────────────────────
  function initDecorFlyOut() {
    const animatedMe = document.getElementById('animated-me');
    const aboutHero = document.getElementById('about-hero');
    const decorImages = document.querySelectorAll('.decor-image');
    if (!animatedMe || !aboutHero || decorImages.length === 0) return;

    let hasSpread = false;
    let fadeOutTimer = null;
    const isMobile = window.innerWidth <= 768;

    // Move all decor images to the hero section so they are visible immediately,
    // share the same stacking context, and do not inherit fade/scroll effects from lower sections.
    decorImages.forEach(el => {
      if (el.parentNode !== aboutHero) {
        aboutHero.appendChild(el);
      }
    });

    // Calculate and set initial state (condensed inside the head/brain of animated-me)
    function setupInitialState() {
      if (hasSpread) return;

      const meRect = animatedMe.getBoundingClientRect();
      const heroRect = aboutHero.getBoundingClientRect();
      const brainX = (meRect.left - heroRect.left) + meRect.width / 2;
      const brainY = (meRect.top - heroRect.top) + meRect.height * 0.35;

      decorImages.forEach(el => {
        const elWidth = el.offsetWidth || 80;
        const elHeight = el.offsetHeight || 80;

        // Position directly at the center of the brain
        el.style.transition = 'none';
        el.style.left = `${brainX - elWidth / 2}px`;
        el.style.top = `${brainY - elHeight / 2}px`;
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.transform = 'scale(0)';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });
    }

    // Wait for layout to stabilize
    window.addEventListener('load', setupInitialState);
    setTimeout(setupInitialState, 200);

    function scatterDecor() {
      hasSpread = true;
      clearTimeout(fadeOutTimer);

      const meRect = animatedMe.getBoundingClientRect();
      const heroRect = aboutHero.getBoundingClientRect();
      const brainX = (meRect.left - heroRect.left) + meRect.width / 2;
      const brainY = (meRect.top - heroRect.top) + meRect.height * 0.35;

      const xRangeMin = isMobile ? 55 : 140;
      const xRangeMax = isMobile ? 120 : 380;
      const yRangeMax = isMobile ? 100 : 250;

      // Staggered scatter fly out
      decorImages.forEach((el, index) => {
        const elWidth = el.offsetWidth || 80;
        const elHeight = el.offsetHeight || 80;

        // Reset directly to the brain center instantly
        el.style.transition = 'none';
        el.style.left = `${brainX - elWidth / 2}px`;
        el.style.top = `${brainY - elHeight / 2}px`;
        el.style.transform = 'scale(0)';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';

        // Alternate left and right sides of the profile
        const side = index % 2 === 0 ? -1 : 1;
        const targetX = brainX + side * (xRangeMin + Math.random() * (xRangeMax - xRangeMin)) - elWidth / 2;
        const targetY = brainY + (Math.random() - 0.5) * 2 * yRangeMax - elHeight / 2;
        const randomRot = Math.random() * 40 - 20; // -20deg to 20deg

        setTimeout(() => {
          el.style.transition = 'left 1.4s cubic-bezier(0.16, 1, 0.3, 1), top 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease';
          el.style.left = `${targetX}px`;
          el.style.top = `${targetY}px`;
          el.style.transform = `scale(1) rotate(${randomRot}deg)`;
          el.style.opacity = '1';
          
          // Disable transitions after animation to prevent lag during dragging
          setTimeout(() => {
            el.style.transition = 'filter 0.4s ease, opacity 2.5s ease, transform 2.5s ease';
            el.style.pointerEvents = 'auto';
          }, 1400);
        }, 50 + index * 60);
      });

      // Slowly disappear/fade out after a display duration
      fadeOutTimer = setTimeout(() => {
        decorImages.forEach(el => {
          el.style.transition = 'opacity 3.0s ease, transform 3.0s ease, filter 0.4s ease';
          el.style.opacity = '0';
          // Retain rotation while shrinking
          const currentRotation = el.style.transform.match(/rotate\([^)]+\)/);
          const rotStr = currentRotation ? currentRotation[0] : 'rotate(0deg)';
          el.style.transform = `${rotStr} scale(0.6)`;
          el.style.pointerEvents = 'none';
        });
        hasSpread = false;
      }, 1400 + decorImages.length * 60 + 3500);
    }

    // Hover listener to trigger the scatter spread
    animatedMe.addEventListener('mouseenter', () => {
      if (!hasSpread) {
        scatterDecor();
      }
    });

    // Click listener to force a re-scatter (condenses back and spreads out again)
    animatedMe.addEventListener('click', () => {
      scatterDecor();
    });
  }

  function initMinecraftGame() {
    const blockEl = document.getElementById('mc-active-block');
    const cracksEl = document.getElementById('mc-block-cracks');
    const symbolEl = document.getElementById('mc-block-symbol');
    const nameEl = document.getElementById('mc-block-name');
    const hpFillEl = document.getElementById('mc-block-hp-fill');
    const hpTextEl = document.getElementById('mc-block-hp-text');
    const escapeBtn = document.getElementById('mc-escape-btn');
    const escapeStatusEl = document.getElementById('mc-escape-status');
    const toolInfoEl = document.getElementById('mc-tool-info');
    
    if (!blockEl) return;
    
    const state = {
      inventory: { cobble: 0, coal: 0, iron: 0, gold: 0, diamond: 0 },
      tier: 6
    };
    
    let activeBlock = { name: 'Obsidian Block', hp: 150, symbol: '../assets/images/minecraft/obsidian.png' };
    let currentHP = 150;
    let obsidianMined = 0;
    
    // Page level health parameters
    let health = 10;
    let isGameOver = false;
    let isInvincible = false;
    
    // Load state
    const saved = localStorage.getItem('mc_pocket_miner_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.inventory) {
          state.inventory = parsed.inventory;
          state.tier = parsed.tier || 6;
        }
      } catch (e) {
        console.warn('Failed to parse pocket miner state:', e);
      }
    }
    
    // Web Audio Synthesizer
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
    
    function playNoiseBurst(duration, volume) {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1.0;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + duration);
      } catch (e) {
        console.warn(e);
      }
    }
    
    function playHitSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        playNoiseBurst(0.04, 0.15);
      } catch (e) {
        console.warn(e);
      }
    }
    
    function playBreakSound() {
      try {
        playHitSound();
        setTimeout(() => playHitSound(), 50);
        setTimeout(() => {
          const ctx = getAudioContext();
          if (!ctx) return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 300;
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
        }, 100);
      } catch (e) {
        console.warn(e);
      }
    }
    
    function playHurtSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.15);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch (e) {
        console.warn(e);
      }
    }

    function playTeleportSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch (e) {
        console.warn(e);
      }
    }
    
    function drawHearts(currentHealth) {
      const healthBar = document.getElementById('mc-health-bar');
      if (!healthBar) return;
      healthBar.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const heartImg = document.createElement('img');
        heartImg.style.width = '24px';
        heartImg.style.height = '24px';
        heartImg.style.imageRendering = 'pixelated';
        const heartVal = currentHealth - (i * 2);
        if (heartVal >= 2) {
          heartImg.src = '../assets/images/minecraft/full.png';
        } else if (heartVal === 1) {
          heartImg.src = '../assets/images/minecraft/half.png';
        } else {
          heartImg.src = '../assets/images/minecraft/empty.png';
        }
        healthBar.appendChild(heartImg);
      }
    }
    
    function updateHPBar() {
      const pct = Math.max(0, (currentHP / activeBlock.hp) * 100);
      hpFillEl.style.width = `${pct}%`;
      hpTextEl.textContent = `HP: ${Math.max(0, currentHP)} / ${activeBlock.hp}`;
      
      const ratio = currentHP / activeBlock.hp;
      cracksEl.className = 'mc-block-cracks';
      if (ratio <= 0.15) {
        cracksEl.classList.add('crack-heavy');
      } else if (ratio <= 0.45) {
        cracksEl.classList.add('crack-medium');
      } else if (ratio <= 0.75) {
        cracksEl.classList.add('crack-light');
      }
    }
    
    function saveState() {
      localStorage.setItem('mc_pocket_miner_state', JSON.stringify(state));
    }
    
    function updateUI() {
      document.getElementById('mc-count-cobble').textContent = state.inventory.cobble;
      document.getElementById('mc-count-coal').textContent = state.inventory.coal;
      document.getElementById('mc-count-iron').textContent = state.inventory.iron;
      document.getElementById('mc-count-gold').textContent = state.inventory.gold;
      document.getElementById('mc-count-diamond').textContent = state.inventory.diamond;
      
      if (toolInfoEl) {
        toolInfoEl.textContent = "Tool: Netherite Pickaxe (Power: 50)";
      }
      
      const counterEl = document.getElementById('mc-obsidian-count');
      if (counterEl) {
        counterEl.textContent = `Obsidian Mined: ${obsidianMined} / 10`;
      }
    }
    
    function spawnParticles(color) {
      const screenEl = document.querySelector('.mc-screen');
      if (!screenEl) return;
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'mc-particle';
        const dx = (Math.random() - 0.5) * 80 + 'px';
        const dy = (Math.random() - 0.5) * 60 - 20 + 'px';
        const rot = (Math.random() * 360) + 'deg';
        p.style.setProperty('--dx', dx);
        p.style.setProperty('--dy', dy);
        p.style.setProperty('--rot', rot);
        p.style.setProperty('--color', color);
        p.style.left = '52px';
        p.style.top = '52px';
        screenEl.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }
    
    function spawnFloatingText(text) {
      const screenEl = document.querySelector('.mc-screen');
      if (!screenEl) return;
      const ft = document.createElement('div');
      ft.className = 'mc-floating-text';
      ft.textContent = text;
      ft.style.left = '40px';
      ft.style.top = '30px';
      screenEl.appendChild(ft);
      setTimeout(() => ft.remove(), 800);
    }

    function spawnPurpleParticles(cx, cy) {
      const count = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'mc-particle';
        const dx = (Math.random() - 0.5) * 60 + 'px';
        const dy = (Math.random() - 0.5) * 60 + 'px';
        const rot = (Math.random() * 360) + 'deg';
        p.style.setProperty('--dx', dx);
        p.style.setProperty('--dy', dy);
        p.style.setProperty('--rot', rot);
        p.style.setProperty('--color', '#c084fc');
        p.style.left = `${cx}px`;
        p.style.top = `${cy}px`;
        p.style.position = 'fixed';
        p.style.zIndex = '10003';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }
    
    blockEl.addEventListener('click', () => {
      if (obsidianMined >= 10) {
        escapeNetherPortal();
        return;
      }
      
      blockEl.classList.remove('shake');
      void blockEl.offsetWidth;
      blockEl.classList.add('shake');
      setTimeout(() => blockEl.classList.remove('shake'), 150);
      
      playHitSound();
      spawnParticles('#8b5cf6');
      
      currentHP -= 50;
      
      if (currentHP <= 0) {
        playBreakSound();
        obsidianMined++;
        spawnFloatingText("+1 Obsidian");
        updateUI();
        
        if (obsidianMined < 10) {
          currentHP = 150;
          cracksEl.className = 'mc-block-cracks';
          updateHPBar();
        } else {
          symbolEl.innerHTML = `<img src="../assets/images/minecraft/nether-portal-minecraft.gif" alt="Nether Portal" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated;" />`;
          nameEl.textContent = "Nether Portal Rebuilt";
          cracksEl.className = 'mc-block-cracks';
          hpFillEl.style.width = '100%';
          hpTextEl.textContent = "ACTIVE";
          
          if (escapeBtn) {
            escapeBtn.style.display = 'block';
            escapeBtn.disabled = false;
            escapeStatusEl.textContent = "Portal Active";
          }
          spawnFloatingText("Portal Restored!");
        }
      } else {
        updateHPBar();
      }
    });
    
    if (escapeBtn) {
      escapeBtn.addEventListener('click', () => {
        escapeNetherPortal();
      });
    }
    
    function escapeNetherPortal() {
      playTeleportSound();
      localStorage.setItem('nether_transition_back', 'true');
      const transitionEl = document.getElementById('portal-transition');
      if (transitionEl) {
        transitionEl.classList.add('active');
        setTimeout(() => {
          window.location.href = 'about.html';
        }, 1500);
      } else {
        window.location.href = 'about.html';
      }
    }
    
    let healthBar = document.getElementById('mc-health-bar');
      if (!healthBar) {
        healthBar = document.createElement('div');
        healthBar.id = 'mc-health-bar';
        document.body.appendChild(healthBar);
      }
      
      let hitFlash = document.getElementById('mc-hit-flash');
      if (!hitFlash) {
        hitFlash = document.createElement('div');
        hitFlash.id = 'mc-hit-flash';
        document.body.appendChild(hitFlash);
      }
      
      let gameOverOverlay = document.getElementById('mc-gameover-overlay');
      if (!gameOverOverlay) {
        gameOverOverlay = document.createElement('div');
        gameOverOverlay.id = 'mc-gameover-overlay';
        gameOverOverlay.innerHTML = `
          <div class="mc-go-title" style="color: #9333ea;">YOU DIED!</div>
          <div class="mc-go-sub">Inventory Lost in Nether</div>
          <button class="mc-go-btn" id="mc-respawn-btn" style="background: #3b0764; border-color: #9333ea;">RESPAWN</button>
        `;
        document.body.appendChild(gameOverOverlay);
      }
      
      const endermen = [];
      const endermanElements = [];
      const ENDERMAN_COUNT = 5;
      
      for (let idx = 0; idx < ENDERMAN_COUNT; idx++) {
        let el = document.getElementById(`mc-enderman-${idx}`);
        if (!el) {
          el = document.createElement('img');
          el.id = `mc-enderman-${idx}`;
          el.className = 'mc-mob mc-enderman-nether';
          el.src = '../assets/images/minecraft/Enderman_Screaming.webp';
          el.style.width = '50px';
          el.style.height = '85px';
          document.body.appendChild(el);
        }
        endermanElements.push(el);
        
        endermen.push({
          x: 50 + idx * (window.innerWidth / (ENDERMAN_COUNT + 1)),
          y: window.innerHeight - 150 - (Math.random() * 100),
          width: 50,
          height: 85,
          lastTeleport: Date.now() - Math.random() * 6000,
          wanderTargetX: 50 + idx * (window.innerWidth / (ENDERMAN_COUNT + 1)),
          wanderTargetY: window.innerHeight - 150,
          wanderWaitUntil: 0
        });
      }
      
      function pickWanderTarget(mob, consoleRect) {
        const minY = 72;
        for (let i = 0; i < 25; i++) {
          const tx = Math.random() * (window.innerWidth - mob.width);
          const ty = minY + Math.random() * (window.innerHeight - minY - mob.height);
          if (!consoleRect || !isInside(tx, ty, consoleRect)) {
            mob.wanderTargetX = tx;
            mob.wanderTargetY = ty;
            mob.wanderWaitUntil = 0;
            return;
          }
        }
        mob.wanderTargetX = mob.x;
        mob.wanderTargetY = mob.y;
      }
      
      function resetMobs() {
        const consoleRect = getConsoleRect();
        const minY = 72;
        endermen.forEach((enderman, idx) => {
          enderman.x = 50 + idx * (window.innerWidth / (ENDERMAN_COUNT + 1));
          enderman.y = minY + Math.random() * (window.innerHeight - 150 - minY);
          enderman.y = Math.max(minY, enderman.y);
          pickWanderTarget(enderman, consoleRect);
          enderman.wanderWaitUntil = 0;
          endermanElements[idx].style.left = `${enderman.x}px`;
          endermanElements[idx].style.top = `${enderman.y}px`;
        });
      }
      
      resetMobs();
      drawHearts(health);
      
      document.getElementById('mc-respawn-btn').addEventListener('click', () => {
        state.inventory = { cobble: 0, coal: 0, iron: 0, gold: 0, diamond: 0 };
        state.tier = 0;
        saveState();
        localStorage.setItem('nether_transition_back', 'true');
        window.location.href = 'about.html';
      });
      
      function getConsoleRect() {
        const consoleEl = document.querySelector('.mc-console');
        if (!consoleEl) return null;
        const r = consoleEl.getBoundingClientRect();
        const padding = 20;
        return {
          left: r.left - padding,
          right: r.right + padding,
          top: r.top - padding,
          bottom: r.bottom + padding
        };
      }
      
      function isInside(x, y, rect) {
        if (!rect) return false;
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      }
      
      function clipToRectBoundary(x, y, rect) {
        if (!rect) return { x, y };
        if (!isInside(x, y, rect)) return { x, y };
        const dl = Math.abs(x - rect.left);
        const dr = Math.abs(x - rect.right);
        const dt = Math.abs(y - rect.top);
        const db = Math.abs(y - rect.bottom);
        const min = Math.min(dl, dr, dt, db);
        if (min === dl) return { x: rect.left, y };
        if (min === dr) return { x: rect.right, y };
        if (min === dt) return { x, y: rect.top };
        return { x, y: rect.bottom };
      }
      
      function triggerHitFlash() {
        const flash = document.getElementById('mc-hit-flash');
        if (flash) {
          flash.style.opacity = '1';
          setTimeout(() => {
            flash.style.opacity = '0';
          }, 100);
        }
      }
      
      function moveMob(mob, vx, vy, consoleRect) {
        let nextX = mob.x + vx;
        let nextY = mob.y + vy;
        if (consoleRect && isInside(nextX, nextY, consoleRect)) {
          const wasOutsideX = mob.x < consoleRect.left || mob.x > consoleRect.right;
          const wasOutsideY = mob.y < consoleRect.top || mob.y > consoleRect.bottom;
          if (wasOutsideX && !wasOutsideY) {
            nextX = mob.x;
          } else if (wasOutsideY && !wasOutsideX) {
            nextY = mob.y;
          } else {
            const clipped = clipToRectBoundary(nextX, nextY, consoleRect);
            nextX = clipped.x;
            nextY = clipped.y;
          }
        }
        const minY = 72;
        mob.x = Math.max(0, Math.min(window.innerWidth - mob.width, nextX));
        mob.y = Math.max(minY, Math.min(window.innerHeight - mob.height, nextY));
      }
      
      function updateMobs() {
        if (isGameOver) {
          endermen.forEach((enderman, idx) => {
            endermanElements[idx].style.left = `${enderman.x}px`;
            endermanElements[idx].style.top = `${enderman.y}px`;
          });
          requestAnimationFrame(updateMobs);
          return;
        }
        
        const consoleRect = getConsoleRect();
        const minY = 72;
        const isCursorInBottomZone = cursorVisible;
        const DETECTION_RADIUS = 280;
        
        endermen.forEach((enderman, idx) => {
          const endermanEl = endermanElements[idx];
          const mobCenterE = enderman.x + enderman.width / 2;
          const mobCenterEH = enderman.y + enderman.height / 2;
          const distE = isCursorInBottomZone ? Math.sqrt(Math.pow(targetX - mobCenterE, 2) + Math.pow(targetY - mobCenterEH, 2)) : Infinity;
          
          const endermanChasing = isCursorInBottomZone;
          const teleportInterval = endermanChasing ? 4000 : 12000;
          
          if (Date.now() - enderman.lastTeleport > teleportInterval) {
            const refX = endermanChasing ? targetX : enderman.x;
            const refY = endermanChasing ? targetY : enderman.y;
            const refDist = endermanChasing ? 150 : 250;
            
            for (let a = 0; a < 15; a++) {
              const ang = Math.random() * Math.PI * 2;
              const dst = 80 + Math.random() * refDist;
              const tx = refX + Math.cos(ang) * dst;
              let ty = refY + Math.sin(ang) * dst;
              ty = Math.max(minY, Math.min(window.innerHeight - enderman.height, ty));
              
              if (tx > 20 && tx < window.innerWidth - 70) {
                if (!consoleRect || !isInside(tx, ty, consoleRect)) {
                  spawnPurpleParticles(enderman.x + enderman.width / 2, enderman.y + enderman.height / 2);
                  enderman.x = tx;
                  enderman.y = ty;
                  spawnPurpleParticles(enderman.x + enderman.width / 2, enderman.y + enderman.height / 2);
                  enderman.lastTeleport = Date.now();
                  if (!endermanChasing) {
                    pickWanderTarget(enderman, consoleRect);
                  }
                  break;
                }
              }
            }
          }
          
          if (endermanChasing) {
            let targetChaseX = targetX;
            let targetChaseY = targetY;
            if (consoleRect && isInside(targetX, targetY, consoleRect)) {
              const clipped = clipToRectBoundary(targetX, targetY, consoleRect);
              targetChaseX = clipped.x;
              targetChaseY = clipped.y;
            }
            targetChaseY = Math.max(minY, targetChaseY);
            const dx = targetChaseX - (enderman.x + enderman.width / 2);
            const dy = targetChaseY - (enderman.y + enderman.height / 2);
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 5) {
              const vx = (dx / len) * 1.5;
              const vy = (dy / len) * 1.5;
              moveMob(enderman, vx, vy, consoleRect);
            }
          } else {
            const distToWander = Math.sqrt(Math.pow(enderman.wanderTargetX - enderman.x, 2) + Math.pow(enderman.wanderTargetY - enderman.y, 2));
            if (distToWander < 10) {
              if (enderman.wanderWaitUntil === 0) {
                enderman.wanderWaitUntil = Date.now() + Math.random() * 1500 + 1000;
              } else if (Date.now() >= enderman.wanderWaitUntil) {
                pickWanderTarget(enderman, consoleRect);
              }
            } else {
              const dx = enderman.wanderTargetX - enderman.x;
              const dy = enderman.wanderTargetY - enderman.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              if (len > 0) {
                const vx = (dx / len) * 0.5;
                const vy = (dy / len) * 0.5;
                moveMob(enderman, vx, vy, consoleRect);
              }
            }
          }
          endermanEl.style.left = `${enderman.x}px`;
          endermanEl.style.top = `${enderman.y}px`;
        });
        
        if (cursorVisible && !isInvincible) {
          let hit = false;
          endermen.forEach(enderman => {
            if (targetX >= enderman.x + 5 && targetX <= enderman.x + enderman.width - 5 &&
                targetY >= enderman.y + 5 && targetY <= enderman.y + enderman.height - 5) {
              hit = true;
            }
          });
          
          if (hit) {
            health -= 1;
            playHurtSound();
            triggerHitFlash();
            if (health <= 0) {
              health = 0;
              isGameOver = true;
              document.getElementById('mc-gameover-overlay').classList.add('visible');
            } else {
              isInvincible = true;
              healthBar.classList.add('mc-heart-invincible');
              setTimeout(() => {
                isInvincible = false;
                healthBar.classList.remove('mc-heart-invincible');
              }, 1000);
            }
            drawHearts(health);
          }
        }
        requestAnimationFrame(updateMobs);
      }
      requestAnimationFrame(updateMobs);
    
    updateUI();
    updateHPBar();
    
    symbolEl.innerHTML = `<img src="${activeBlock.symbol}" alt="${activeBlock.name}" />`;
    nameEl.textContent = activeBlock.name;
    cracksEl.className = 'mc-block-cracks';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAboutPage);
} else {
  startAboutPage();
}
