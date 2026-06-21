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
      const hit = e.target.closest('a, button, input, textarea, .logo, [role="button"], .content-card, .doing-item, .tag, .sidequest-item, .plate-item, .post-link');
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

    const chars = ['*', '+', 'x', 'o', '?', '!', '~', 'a', 'n', 'm', 'x', 'l', 'r'];
    let isAnimating = false;

    animatedMe.addEventListener('mouseenter', () => {
      if (isAnimating) return;
      isAnimating = true;
      playTap(0.3);
      animatedMe.classList.add('animating');

      setTimeout(() => {
        const rect = animatedMe.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Choose 8 random characters to launch
        const chosenChars = [];
        for (let i = 0; i < 8; i++) {
          chosenChars.push(chars[Math.floor(Math.random() * chars.length)]);
        }

        chosenChars.forEach((char, index) => {
          setTimeout(() => {
            createTypewriterParticle(char, centerX, centerY);
          }, index * 50);
        });

        setTimeout(() => {
          animatedMe.classList.remove('animating');
          isAnimating = false;
        }, chosenChars.length * 50 + 1500);
      }, 300);
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
      playTap(0.4);
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

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
});
