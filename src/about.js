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
      .image-cursor.visible { opacity: 1; }
      .image-cursor.hovering {
        width: 52px; height: 52px;
      }
      .image-cursor.clicking {
        width: 32px; height: 32px;
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
    const decorImages = document.querySelectorAll('.decor-image');
    if (!animatedMe || decorImages.length === 0) return;

    let hasSpread = false;

    // Calculate and set initial state (condensed inside the brain)
    function setupInitialState() {
      if (hasSpread) return;

      const meRect = animatedMe.getBoundingClientRect();
      const brainX = meRect.left + meRect.width / 2;
      const brainY = meRect.top + meRect.height * 0.3; // head/brain area

      decorImages.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        const deltaX = brainX - elCenterX;
        const deltaY = brainY - elCenterY;

        el.style.transition = 'none';
        el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0)`;
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });
    }

    // Wait for everything to load and layout to stabilize before calculating coordinates
    window.addEventListener('load', setupInitialState);
    // Also run immediately just in case load already fired
    setTimeout(setupInitialState, 200);

    // Hover listener to trigger the spread
    animatedMe.addEventListener('mouseenter', () => {
      if (hasSpread) return;
      hasSpread = true;

      // Staggered fly out
      decorImages.forEach((el, index) => {
        setTimeout(() => {
          el.style.transition = 'transform 1.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.6s ease, filter 0.4s ease';
          el.style.transform = '';
          el.style.opacity = '';
          
          // Enable mouse events/drag-and-drop after animation completes
          setTimeout(() => {
            el.style.pointerEvents = 'auto';
          }, 1600);
        }, index * 60);
      });
    });
  }
});
