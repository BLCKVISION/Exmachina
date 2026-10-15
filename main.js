/* ============================================================
   EXMACHINA® — Main JavaScript
   Hero Section: Dot pattern hover, GSAP staggered entries,
   Lenis smooth scroll, fullscreen menu
   ============================================================ */

// ============================================================
// 1. LENIS SMOOTH SCROLL
// ============================================================

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// ============================================================
// 2. DOT PATTERN HOVER EFFECT (Canvas)
// ============================================================

(function initDotPattern() {
  const canvas = document.getElementById('heroDots');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = -9999;
  let mouseY = -9999;
  let targetMouseX = -9999;
  let targetMouseY = -9999;
  let animationId;

  // Dot grid config
  const DOT_SPACING = 24;
  const DOT_RADIUS_BASE = 0.8;
  const DOT_RADIUS_HOVER = 1.8;
  const HOVER_RADIUS = 110;
  const DOT_COLOR_BASE = 'rgba(244, 244, 247, 0.06)';
  const DOT_COLOR_HOVER = 'rgba(244, 244, 247, 0.28)';

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.12;
    mouseY += (targetMouseY - mouseY) * 0.12;

    const cols = Math.ceil(width / DOT_SPACING) + 1;
    const rows = Math.ceil(height / DOT_SPACING) + 1;
    const offsetX = (width % DOT_SPACING) / 2;
    const offsetY = (height % DOT_SPACING) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * DOT_SPACING;
        const y = offsetY + r * DOT_SPACING;

        const dx = x - mouseX;
        const dy = y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let radius = DOT_RADIUS_BASE;
        let alpha = 0.06;

        if (dist < HOVER_RADIUS) {
          const t = 1 - (dist / HOVER_RADIUS);
          const eased = t * t; // ease in quad
          radius = DOT_RADIUS_BASE + (DOT_RADIUS_HOVER - DOT_RADIUS_BASE) * eased;
          alpha = 0.06 + (0.28 - 0.06) * eased;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 244, 247, ${alpha})`;
        ctx.fill();
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    targetMouseX = e.clientX - rect.left;
    targetMouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    targetMouseX = -9999;
    targetMouseY = -9999;
  });

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


// ============================================================
// 3. HERO ENTRY ANIMATIONS (Staggered)
// ============================================================

(function initHeroAnimations() {
  const ctx = gsap.context(() => {

    // Master timeline for hero entry
    const heroTL = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: 'power3.out',
      }
    });

    // --- 1. Label (eyebrow) ---
    heroTL.to('#heroLabel', {
      opacity: 1,
      y: 0,
      duration: 0.6,
    }, 0);

    // Set initial state
    gsap.set('#heroLabel', { y: 12, opacity: 0 });

    // --- 2. Horizontal line ---
    heroTL.to('#heroLine', {
      width: '95%',
      duration: 1.0,
      ease: 'power2.inOut',
    }, 0.2);

    // --- 3. Title lines (staggered line-by-line mask reveal) ---
    const titleLines = document.querySelectorAll('.hero__title-line');
    titleLines.forEach((line, i) => {
      // Wrap inner text in a span for animation
      const text = line.textContent;
      line.innerHTML = `<span class="hero__title-inner">${text}</span>`;

      gsap.set(line.querySelector('.hero__title-inner'), {
        y: '110%',
        opacity: 0,
      });

      heroTL.to(line.querySelector('.hero__title-inner'), {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
      }, 0.35 + (i * 0.1));
    });

    // --- 4. Description text ---
    gsap.set('#heroDescription', { y: 18, opacity: 0 });
    heroTL.to('#heroDescription', {
      y: 0,
      opacity: 1,
      duration: 0.7,
    }, 0.65);

    // --- 5. CTA Button ---
    gsap.set('#heroBtn', { y: 18, opacity: 0 });
    heroTL.to('#heroBtn', {
      y: 0,
      opacity: 1,
      duration: 0.7,
    }, 0.8);

    // --- 6. Navbar elements ---
    gsap.set('.navbar__logo-img, .navbar__menu-toggle, .navbar__cta:not(.navbar__cta--menu)', {
      y: -12,
      opacity: 0,
    });
    heroTL.to('.navbar__logo-img', {
      y: 0,
      opacity: 1,
      duration: 0.6,
    }, 0.1);
    heroTL.to('.navbar__menu-toggle', {
      y: 0,
      opacity: 1,
      duration: 0.6,
    }, 0.2);
    heroTL.to('.navbar__cta:not(.navbar__cta--menu)', {
      y: 0,
      opacity: 1,
      duration: 0.6,
    }, 0.3);
  });
})();


// ============================================================
// 4. FULLSCREEN MENU (drop from top)
// ============================================================

(function initMenu() {
  const toggleBtn = document.getElementById('menuToggle');
  const overlay = document.getElementById('menuOverlay');
  if (!toggleBtn || !overlay) return;

  let menuTL = null;
  let isOpen = false;
  let lockedScrollY = 0;

  function preventScroll(e) {
    e.preventDefault();
  }

  function preventKeyScroll(e) {
    const keys = ['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
    if (keys.includes(e.code) || keys.includes(e.key)) {
      e.preventDefault();
    }
  }

  function forceScrollLock() {
    if (isOpen) {
      window.scrollTo(0, lockedScrollY);
    }
  }

  function lockScroll() {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop;
    lenis.stop();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventKeyScroll, { passive: false });
    window.addEventListener('scroll', forceScrollLock, { passive: false });
  }

  function unlockScroll() {
    lenis.start();
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    window.removeEventListener('keydown', preventKeyScroll);
    window.removeEventListener('scroll', forceScrollLock);
  }

  function createMenuTimeline() {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.inOut' },
      onStart: () => {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        lockScroll();
      },
      onReverseComplete: () => {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        unlockScroll();
      },
    });

    // Menu slides down from top
    gsap.set(overlay, {
      yPercent: -100,
      visibility: 'visible',
      opacity: 1,
    });

    tl.to(overlay, {
      yPercent: 0,
      duration: 0.8,
      ease: 'power3.inOut',
    });

    // Stagger in menu links - more noticeable stagger
    const links = overlay.querySelectorAll('.menu-overlay__link');
    gsap.set(links, { y: 45, opacity: 0 });
    tl.to(links, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.09,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    }, 0.35);

    // Labels
    const labels = overlay.querySelectorAll('.menu-overlay__label');
    gsap.set(labels, { y: 20, opacity: 0 });
    tl.to(labels, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power3.out',
    }, 0.3);

    // Buttons
    const btns = overlay.querySelectorAll('.menu-overlay__btn');
    gsap.set(btns, { y: 20, opacity: 0 });
    tl.to(btns, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power3.out',
    }, 0.5);

    // Footer
    const footerLine = overlay.querySelector('.menu-overlay__footer-line');
    const footerContent = overlay.querySelector('.menu-overlay__footer-content');
    gsap.set(footerLine, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(footerContent, { y: 20, opacity: 0 });
    tl.to(footerLine, {
      scaleX: 1,
      duration: 0.6,
      ease: 'power2.inOut',
    }, 0.55);
    tl.to(footerContent, {
      y: 0,
      opacity: 1,
      duration: 0.5,
    }, 0.65);

    return tl;
  }

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');

    if (!menuTL) {
      menuTL = createMenuTimeline();
    }
    menuTL.timeScale(1).play();
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');

    if (menuTL) {
      menuTL.timeScale(1.8).reverse();
    }
  }

  toggleBtn.addEventListener('click', () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on link click
  overlay.querySelectorAll('.menu-overlay__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });
})();


// ============================================================
// 5. BUTTON ARROW HOVER ANIMATION (GSAP)
// ============================================================

(function initButtonHover() {
  const btn = document.getElementById('heroBtn');
  if (!btn) return;

  const arrow = btn.querySelector('.hero__btn-arrow svg');
  if (!arrow) return;

  btn.addEventListener('mouseenter', () => {
    gsap.to(arrow, {
      x: 3,
      y: -3,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(arrow, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  });
})();


// ============================================================
// 6. CUSTOM CIRCULAR CURSOR (Smooth low delay follower)
// ============================================================

(function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  // Disable on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    return;
  }

  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let isVisible = false;

  // LERP factor 0.65: ultra-low delay, immediate responsive tracking
  const LERP = 0.65;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      cursorX = mouseX;
      cursorY = mouseY;
      isVisible = true;
      cursor.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    isVisible = true;
  });

  function renderCursor() {
    if (isVisible) {
      cursorX += (mouseX - cursorX) * LERP;
      cursorY += (mouseY - cursorY) * LERP;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover scale effect on interactive elements via delegation
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, [role="button"], .navbar__menu-toggle, .hero__btn, .menu-overlay__link, .menu-overlay__social')) {
      cursor.classList.add('is-hovering');
    } else {
      cursor.classList.remove('is-hovering');
    }
  });
})();


// ============================================================
// 7. SECTION 2: NUESTRO ENFOQUE (Staggered ScrollTrigger)
// ============================================================

(function initApproachSection() {
  const section = document.getElementById('enfoque');
  if (!section) return;

  // Master timeline triggered when user reaches section
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      once: true,
    },
    defaults: { ease: 'power3.out' }
  });

  // 1. Label "NUESTRO ENFOQUE"
  tl.fromTo('#approachLabel',
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6 }
  );

  // 2. Paragraph 1 ("Exmachina...") staggered line-by-line mask reveal
  const p1Lines = section.querySelectorAll('#approachP1 .approach__line-inner');
  tl.fromTo(p1Lines,
    { y: '110%', opacity: 0 },
    { y: '0%', opacity: 1, duration: 0.8, stagger: 0.14 },
    '-=0.2'
  );

  // 3. Paragraph 2 ("Cada Sistema...") staggered line-by-line mask reveal
  const p2Lines = section.querySelectorAll('#approachP2 .approach__line-inner');
  tl.fromTo(p2Lines,
    { y: '110%', opacity: 0 },
    { y: '0%', opacity: 1, duration: 0.8, stagger: 0.14 },
    '-=0.1'
  );

  // 4. Statistics sequence: linea -> linea blanca -> titulo -> numero (countup from 0)
  const statCols = section.querySelectorAll('.approach__stat-col');

  statCols.forEach((col, index) => {
    const line = col.querySelector('.approach__stat-line');
    const whiteBar = col.querySelector('.approach__stat-bar');
    const title = col.querySelector('.approach__stat-title');
    const numEl = col.querySelector('.approach__stat-num');
    const unit = col.querySelector('.approach__stat-unit');
    const targetValue = parseInt(numEl.getAttribute('data-target'), 10) || 0;

    const colStartTime = 1.6 + (index * 0.28);

    // a) Faint vertical line (scale from top)
    tl.fromTo(line,
      { scaleY: 0, transformOrigin: 'top center' },
      { scaleY: 1, duration: 0.7, ease: 'power2.inOut' },
      colStartTime
    );

    // b) White line bar (scale from bottom)
    tl.fromTo(whiteBar,
      { scaleY: 0, transformOrigin: 'bottom center' },
      { scaleY: 1, duration: 0.5, ease: 'power3.out' },
      colStartTime + 0.2
    );

    // c) Title
    tl.fromTo(title,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      colStartTime + 0.3
    );

    // d) Unit fade in
    tl.fromTo(unit,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      colStartTime + 0.4
    );

    // e) Number countup from 0 to target
    const counterObj = { val: 0 };
    tl.to(counterObj, {
      val: targetValue,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        numEl.textContent = Math.round(counterObj.val);
      }
    }, colStartTime + 0.4);
  });
})();
