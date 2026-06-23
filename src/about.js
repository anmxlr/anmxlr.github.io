// ── About Page JS ──────────────────────────────────
// Stripped-down script for the about page only.
// No intro/loading screen – page is visible immediately.

document.addEventListener('DOMContentLoaded', () => {
  const mainPage = document.getElementById('main-page');
  const topBar = document.getElementById('top-bar');
  const scrollIndicator = document.getElementById('scroll-indicator');

  // ── Instant Visibility (no loading delay) ─────────
  if (mainPage) mainPage.classList.add('visible');
  if (topBar) topBar.classList.add('visible');
  document.documentElement.classList.remove('scroll-locked');
  document.body.classList.remove('scroll-locked');

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

  // ── Image Cursor ──────────────────────────────────
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let cursorEl = null;
  let cursorX = 0, cursorY = 0;
  let targetX = 0, targetY = 0;
  let cursorVisible = false;
  let cursorRAF = null;

  if (isDesktop) {
    // Create cursor element
    cursorEl = document.createElement('div');
    cursorEl.className = 'image-cursor';
    cursorEl.innerHTML = '<img src="src/assets/images/about/cursor.PNG" alt="" draggable="false">';
    document.body.appendChild(cursorEl);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
      *, *::before, *::after { cursor: none !important; }
      .image-cursor {
        position: fixed;
        top: 0; left: 0;
        width: 40px; height: 40px;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        will-change: transform;
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
    `;
    document.head.appendChild(cursorStyle);

    // Track mouse
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        cursorEl.classList.add('visible');
        // Snap to first position
        cursorX = targetX;
        cursorY = targetY;
        cursorEl.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      }
    }, { passive: true });

    window.addEventListener('mouseenter', () => {
      cursorEl.classList.add('visible');
      cursorVisible = true;
    });

    window.addEventListener('mouseleave', () => {
      cursorEl.classList.remove('visible');
      cursorVisible = false;
    });

    // Hover on interactive elements
    window.addEventListener('mouseover', (e) => {
      const hit = e.target.closest('a, button, input, textarea, .logo, [role="button"], .content-card, .doing-item, .tag, .sidequest-item, .plate-item, .post-link, .decor-image');
      cursorEl.classList.toggle('hovering', !!hit);
    });

    // Click states
    window.addEventListener('mousedown', () => cursorEl.classList.add('clicking'));
    window.addEventListener('mouseup', () => cursorEl.classList.remove('clicking'));

    // Smooth follow loop
    function animateCursor() {
      cursorX += (targetX - cursorX) * 0.18;
      cursorY += (targetY - cursorY) * 0.18;
      cursorEl.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      cursorRAF = requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

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
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.about-content-section').forEach(section => {
    revealObserver.observe(section);
  });

  // Also reveal reach section & footer
  const reachSection = document.getElementById('reach-section');
  const footerContent = document.querySelector('.footer-content');
  if (reachSection) revealObserver.observe(reachSection);
  if (footerContent) revealObserver.observe(footerContent);

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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
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
      'src/assets/images/about/1.PNG',
      'src/assets/images/about/2.PNG',
      'src/assets/images/about/3.PNG',
      'src/assets/images/about/4.PNG',
      'src/assets/images/about/5.PNG'
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
      investigator: document.getElementById('stamp-investigator')
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
    const upgradeBtn = document.getElementById('mc-upgrade-btn');
    const upgradeCostEl = document.getElementById('mc-upgrade-cost');
    const toolInfoEl = document.getElementById('mc-tool-info');
    
    if (!blockEl) return;
    
    // Tools progression: 0 = Hand, 1 = Wood Pickaxe, 2 = Iron Pickaxe, 3 = Diamond Pickaxe, 4 = Nether Pickaxe, 5 = Nether Star
    const tools = [
      { name: 'Hand', power: 1 },
      { name: 'Wood Pickaxe', power: 2 },
      { name: 'Iron Pickaxe', power: 4 },
      { name: 'Diamond Pickaxe', power: 8 },
      { name: 'Nether Pickaxe', power: 16 },
      { name: 'Nether Star', power: 50 }
    ];
    
    const upgradeCosts = [
      { cobble: 15 },
      { cobble: 30, coal: 8 },
      { cobble: 50, coal: 15, iron: 8 },
      { cobble: 80, coal: 25, iron: 15, gold: 8 },
      { cobble: 100, coal: 40, iron: 25, gold: 15, diamond: 5 }
    ];
    
    const blockPools = [
      // Tier 0
      [ { name: 'Stone', symbol: '🪨', hp: 5, weight: 80, drops: { cobble: 1 } },
        { name: 'Coal Ore', symbol: '⚫', hp: 10, weight: 20, drops: { cobble: 1, coal: 1 } } ],
      // Tier 1
      [ { name: 'Stone', symbol: '🪨', hp: 5, weight: 55, drops: { cobble: 1 } },
        { name: 'Coal Ore', symbol: '⚫', hp: 10, weight: 30, drops: { cobble: 1, coal: 1 } },
        { name: 'Iron Ore', symbol: '⚙️', hp: 20, weight: 15, drops: { cobble: 1, iron: 1 } } ],
      // Tier 2
      [ { name: 'Stone', symbol: '🪨', hp: 5, weight: 40, drops: { cobble: 1 } },
        { name: 'Coal Ore', symbol: '⚫', hp: 10, weight: 25, drops: { cobble: 1, coal: 1 } },
        { name: 'Iron Ore', symbol: '⚙️', hp: 20, weight: 25, drops: { cobble: 1, iron: 1 } },
        { name: 'Gold Ore', symbol: '🪙', hp: 40, weight: 10, drops: { cobble: 1, gold: 1 } } ],
      // Tier 3
      [ { name: 'Stone', symbol: '🪨', hp: 5, weight: 30, drops: { cobble: 1 } },
        { name: 'Coal Ore', symbol: '⚫', hp: 10, weight: 20, drops: { cobble: 1, coal: 1 } },
        { name: 'Iron Ore', symbol: '⚙️', hp: 20, weight: 25, drops: { cobble: 1, iron: 1 } },
        { name: 'Gold Ore', symbol: '🪙', hp: 40, weight: 20, drops: { cobble: 1, gold: 1 } },
        { name: 'Diamond Ore', symbol: '💎', hp: 80, weight: 5, drops: { cobble: 1, diamond: 1 } } ],
      // Tier 4
      [ { name: 'Stone', symbol: '🪨', hp: 5, weight: 20, drops: { cobble: 1 } },
        { name: 'Coal Ore', symbol: '⚫', hp: 10, weight: 20, drops: { cobble: 1, coal: 1 } },
        { name: 'Iron Ore', symbol: '⚙️', hp: 20, weight: 20, drops: { cobble: 1, iron: 1 } },
        { name: 'Gold Ore', symbol: '🪙', hp: 40, weight: 25, drops: { cobble: 1, gold: 1 } },
        { name: 'Diamond Ore', symbol: '💎', hp: 80, weight: 15, drops: { cobble: 1, diamond: 1 } } ],
      // Tier 5
      [ { name: 'Stone', symbol: '🪨', hp: 5, weight: 10, drops: { cobble: 1 } },
        { name: 'Coal Ore', symbol: '⚫', hp: 10, weight: 15, drops: { cobble: 1, coal: 1 } },
        { name: 'Iron Ore', symbol: '⚙️', hp: 20, weight: 20, drops: { cobble: 1, iron: 1 } },
        { name: 'Gold Ore', symbol: '🪙', hp: 40, weight: 25, drops: { cobble: 1, gold: 1 } },
        { name: 'Diamond Ore', symbol: '💎', hp: 80, weight: 30, drops: { cobble: 1, diamond: 1 } } ]
    ];
    
    const state = {
      inventory: { cobble: 0, coal: 0, iron: 0, gold: 0, diamond: 0 },
      tier: 0
    };
    
    let activeBlock = null;
    let currentHP = 0;
    
    // Load state
    const saved = localStorage.getItem('mc_pocket_miner_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.inventory && typeof parsed.tier === 'number') {
          state.inventory = parsed.inventory;
          state.tier = parsed.tier;
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
    
    function playUpgradeSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          
          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      } catch (e) {
        console.warn(e);
      }
    }
    
    function playNetherStarSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
        
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = (idx === notes.length - 1) ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          
          gain.gain.setValueAtTime(0, now + idx * 0.06);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.3);
        });
      } catch (e) {
        console.warn(e);
      }
    }
    
    // Core game functions
    function selectRandomBlock() {
      const pool = blockPools[Math.min(state.tier, 5)];
      const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
      let rand = Math.random() * totalWeight;
      for (const block of pool) {
        if (rand < block.weight) {
          return block;
        }
        rand -= block.weight;
      }
      return pool[0];
    }
    
    function spawnNewBlock() {
      activeBlock = selectRandomBlock();
      currentHP = activeBlock.hp;
      
      // Update UI
      symbolEl.textContent = activeBlock.symbol;
      nameEl.textContent = activeBlock.name;
      cracksEl.className = 'mc-block-cracks'; // Reset cracks
      
      updateHPBar();
    }
    
    function updateHPBar() {
      const pct = Math.max(0, (currentHP / activeBlock.hp) * 100);
      hpFillEl.style.width = `${pct}%`;
      hpTextEl.textContent = `HP: ${Math.max(0, currentHP)} / ${activeBlock.hp}`;
      
      // Update cracks class based on remaining HP percentage
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
    
    function canAffordUpgrade() {
      if (state.tier >= 5) return false;
      const cost = upgradeCosts[state.tier];
      for (const res in cost) {
        if ((state.inventory[res] || 0) < cost[res]) {
          return false;
        }
      }
      return true;
    }
    
    function deductUpgradeCost() {
      if (state.tier >= 5) return;
      const cost = upgradeCosts[state.tier];
      for (const res in cost) {
        state.inventory[res] -= cost[res];
      }
    }
    
    function getUpgradeCostString() {
      if (state.tier >= 5) return 'MAX TIER';
      const cost = upgradeCosts[state.tier];
      const parts = [];
      if (cost.cobble) parts.push(`${cost.cobble} Cobble`);
      if (cost.coal) parts.push(`${cost.coal} Coal`);
      if (cost.iron) parts.push(`${cost.iron} Iron`);
      if (cost.gold) parts.push(`${cost.gold} Gold`);
      if (cost.diamond) parts.push(`${cost.diamond} Diamond`);
      return 'Cost: ' + parts.join(', ');
    }
    
    function getUpgradeLabel() {
      if (state.tier >= 5) return 'Legendary Miner!';
      if (state.tier === 4) return 'Craft Nether Star';
      return `Upgrade to ${tools[state.tier + 1].name}`;
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
      
      const currentTool = tools[state.tier];
      toolInfoEl.textContent = `Tool: ${currentTool.name} (Power: ${currentTool.power})`;
      
      if (state.tier >= 5) {
        upgradeBtn.disabled = true;
        upgradeBtn.classList.remove('afford');
        upgradeBtn.querySelector('.mc-btn-label').textContent = getUpgradeLabel();
        upgradeCostEl.textContent = '';
      } else {
        upgradeBtn.querySelector('.mc-btn-label').textContent = getUpgradeLabel();
        upgradeCostEl.textContent = getUpgradeCostString();
        
        if (canAffordUpgrade()) {
          upgradeBtn.disabled = false;
          upgradeBtn.classList.add('afford');
        } else {
          upgradeBtn.disabled = true;
          upgradeBtn.classList.remove('afford');
        }
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
    
    blockEl.addEventListener('click', () => {
      blockEl.classList.remove('shake');
      void blockEl.offsetWidth;
      blockEl.classList.add('shake');
      setTimeout(() => blockEl.classList.remove('shake'), 150);
      
      const currentTool = tools[state.tier];
      currentHP -= currentTool.power;
      
      let particleColor = '#a4e07a';
      if (activeBlock.name === 'Stone') particleColor = '#888888';
      else if (activeBlock.name === 'Coal Ore') particleColor = '#3a3a3a';
      else if (activeBlock.name === 'Iron Ore') particleColor = '#cc9966';
      else if (activeBlock.name === 'Gold Ore') particleColor = '#ffcc00';
      else if (activeBlock.name === 'Diamond Ore') particleColor = '#5de2e7';
      
      spawnParticles(particleColor);
      
      if (currentHP <= 0) {
        playBreakSound();
        
        let rewardTexts = [];
        for (const res in activeBlock.drops) {
          const qty = activeBlock.drops[res];
          state.inventory[res] = (state.inventory[res] || 0) + qty;
          
          let label = res;
          if (res === 'cobble') label = 'Cobble';
          else if (res === 'coal') label = 'Coal';
          else if (res === 'iron') label = 'Iron';
          else if (res === 'gold') label = 'Gold';
          else if (res === 'diamond') label = 'Diamond';
          
          rewardTexts.push(`+${qty} ${label}`);
        }
        
        spawnFloatingText(rewardTexts.join(' '));
        saveState();
        updateUI();
        spawnNewBlock();
      } else {
        playHitSound();
        updateHPBar();
      }
    });
    
    upgradeBtn.addEventListener('click', () => {
      if (!canAffordUpgrade()) return;
      
      deductUpgradeCost();
      state.tier++;
      
      if (state.tier === 5) {
        playNetherStarSound();
        if (window.unlockPassportStamp) {
          window.unlockPassportStamp('hacker');
        }
        spawnParticles('#ffd700');
        spawnParticles('#5de2e7');
      } else {
        playUpgradeSound();
      }
      
      saveState();
      updateUI();
      spawnNewBlock();
    });
    
    updateUI();
    spawnNewBlock();
  }
});
