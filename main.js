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
// 1.1 INTERACTIVE NAVBAR (Hide on scroll down, show on scroll up)
// ============================================================

(function initInteractiveNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Track landing page scroll with Lenis
  lenis.on('scroll', (e) => {
    // If fullscreen menu overlay is open, keep navbar visible
    if (document.body.classList.contains('menu-open')) {
      navbar.classList.remove('navbar--hidden');
      return;
    }

    const currentScroll = e.scroll;
    const direction = e.direction; // 1 = down, -1 = up

    if (currentScroll <= 30) {
      navbar.classList.remove('navbar--hidden');
    } else if (direction === 1 && currentScroll > 80) {
      navbar.classList.add('navbar--hidden');
    } else if (direction === -1) {
      navbar.classList.remove('navbar--hidden');
    }
  });

  // Track modal scroll container when modal is active
  const modalScroll = document.getElementById('projectModalScroll');
  if (modalScroll) {
    let lastModalY = 0;
    modalScroll.addEventListener('scroll', () => {
      if (document.body.classList.contains('menu-open')) return;
      const currentY = modalScroll.scrollTop;

      if (currentY <= 30) {
        navbar.classList.remove('navbar--hidden');
      } else if (currentY > lastModalY && currentY > 80) {
        navbar.classList.add('navbar--hidden');
      } else if (currentY < lastModalY) {
        navbar.classList.remove('navbar--hidden');
      }
      lastModalY = currentY;
    }, { passive: true });
  }
})();


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

  // Hover across both columns: dim non-hovered links, highlight active
  const allMenuLinks = overlay.querySelectorAll('.menu-overlay__link');
  allMenuLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      overlay.classList.add('is-hovering-link');
      allMenuLinks.forEach(l => l.classList.remove('is-active-hover'));
      link.classList.add('is-active-hover');
    });
    link.addEventListener('mouseleave', () => {
      link.classList.remove('is-active-hover');
      overlay.classList.remove('is-hovering-link');
    });
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
    if (e.target.closest('a, button, input, [role="button"], .navbar__menu-toggle, .hero__btn, .menu-overlay__link, .menu-overlay__social, .project-card, .project-modal__see-more-card')) {
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


// ============================================================
// 8. SECTION 3: NUESTROS PROYECTOS & FULLSCREEN MODAL
// ============================================================

(function initProjectsSection() {
  const section = document.getElementById('proyectos');
  if (!section) return;

  const eyebrow = document.getElementById('projectsEyebrow');
  const line = document.getElementById('projectsLine');
  const cards = section.querySelectorAll('.project-card');

  // Initial states
  gsap.set(eyebrow, { y: 15, opacity: 0 });
  gsap.set(line, { width: '0%' });
  gsap.set(cards, { y: 60, opacity: 0 });

  // GSAP ScrollTrigger for Section 3 Header and Cards
  const projectsTL = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      once: true,
    },
  });

  // Eyebrow and line animation
  projectsTL.to(eyebrow, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power3.out',
  });

  projectsTL.to(line, {
    width: '95%',
    duration: 1.1,
    ease: 'power3.inOut',
  }, 0.2);

  // Stagger in cards
  projectsTL.to(cards, {
    y: 0,
    opacity: 1,
    duration: 0.9,
    stagger: 0.25,
    ease: 'power3.out',
    clearProps: 'transform,opacity',
  }, 0.4);


  // Project Data Dictionary
  const projectsData = {
    'chatbot-ai': {
      title: 'ChatBot AI',
      year: '2025',
      heroImg: 'img/projects/project-1-original.png',
      detailImg: 'img/projects/p1-detail.png',
      overview: 'Arquitectura de agentes autónomos y sistemas conversacionales con memoria persistente, integración de bases de datos vectoriales y ejecución de herramientas en tiempo real para optimizar operaciones críticas.',
      deliverables: [
        'SISTEMAS AGÉNTICOS & LLMS',
        'ARQUITECTURA DE DATOS VECTORIALES',
        'AUTOMATIZACIÓN DE FLUJOS COMPLEJOS'
      ]
    },
    'traffic-app': {
      title: 'Traffic App',
      year: '2025',
      heroImg: 'img/projects/project-2-original.png',
      detailImg: 'img/projects/p2-detail.png',
      overview: 'Plataforma de inteligencia de movilidad y ruteo dinámico de flotas en tiempo real. Análisis predictivo de tráfico, volumetría de pasajeros y telemetría de transporte público masivo.',
      deliverables: [
        'ANÁLISIS PREDICTIVO EN TIEMPO REAL',
        'TELEMETRÍA & GESTIÓN DE FLOTAS',
        'DASHBOARD DE ALTO RENDIMIENTO'
      ]
    },
    'corelia-app': {
      title: 'Corelia App',
      year: '2026',
      heroImg: 'img/projects/project-3-original.png',
      detailImg: 'img/projects/p3-detail.png',
      overview: 'Suite integral para la administración logística y cadena de suministro de raciones y activos. Control de inventario en tiempo real, trazabilidad de pedidos programados y reportería analítica.',
      deliverables: [
        'GESTIÓN LOGÍSTICA & DISTRIBUCIÓN',
        'CONTROL DE INVENTARIO EN VIVO',
        'SISTEMA MULTI-PLATAFORMA'
      ]
    }
  };

  // Fullscreen Project Modal Controller with Smooth Physical Image Expansion
  const modal = document.getElementById('projectModal');
  const modalScroll = document.getElementById('projectModalScroll');
  const heroImg = document.getElementById('projectModalHeroImg');
  const heroTitle = document.getElementById('projectModalHeroTitle');
  const backBtn = document.getElementById('projectModalBackBtn');
  const infoTitle = document.getElementById('projectModalInfoTitle');
  const infoYear = document.getElementById('projectModalInfoYear');
  const overviewText = document.getElementById('projectModalOverviewText');
  const detailImg = document.getElementById('projectModalDetailImg');
  const deliverablesEl = document.getElementById('projectModalDeliverables');
  const seeMoreGrid = document.getElementById('projectModalSeeMoreGrid');
  const modalDetail = document.getElementById('projectModalDetail');

  let isModalOpen = false;
  let activeProjectId = null;
  let activeCardEl = null;

  function populateModalContent(projectId) {
    const data = projectsData[projectId];
    if (!data) return;

    activeProjectId = projectId;
    heroImg.src = data.heroImg;
    heroTitle.textContent = data.title;
    infoTitle.textContent = data.title;
    infoYear.textContent = data.year;
    overviewText.textContent = data.overview;
    detailImg.src = data.detailImg;

    // Populate deliverables
    deliverablesEl.innerHTML = data.deliverables.map(del => `
      <div class="project-modal__deliverable">
        <span>${del}</span>
      </div>
    `).join('');

    // Populate "Ver Más Proyectos" with other projects
    const otherKeys = Object.keys(projectsData).filter(k => k !== projectId);
    seeMoreGrid.innerHTML = otherKeys.map(k => {
      const p = projectsData[k];
      return `
        <div class="project-modal__see-more-card" data-switch-project="${k}">
          <img src="${p.heroImg}" alt="${p.title}" loading="lazy">
          <div class="project-modal__see-more-card-content">
            <span class="project-modal__see-more-card-title">${p.title}</span>
            <span class="project-modal__see-more-card-year">${p.year}</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach switch events on see more cards
    seeMoreGrid.querySelectorAll('[data-switch-project]').forEach(smCard => {
      smCard.addEventListener('click', () => {
        const nextId = smCard.getAttribute('data-switch-project');
        switchProjectModal(nextId);
      });
    });
  }

  function openProjectModal(projectId, cardEl) {
    const data = projectsData[projectId];
    if (!data) return;

    activeCardEl = cardEl;
    const cardImg = cardEl ? cardEl.querySelector('.project-card__img') : null;
    const rect = cardImg ? cardImg.getBoundingClientRect() : null;

    // Stop main lenis scroll
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.stop();
    }
    document.body.classList.add('modal-open');

    // Populate data
    populateModalContent(projectId);

    // Reset modal scroll to top
    if (modalScroll) {
      modalScroll.scrollTop = 0;
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    isModalOpen = true;

    // Smooth physical expansion from clicked card position to fullscreen 100vw x 100vh!
    if (rect) {
      gsap.fromTo(heroImg, {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 4,
        zIndex: 350,
      }, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.85,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(heroImg, { clearProps: 'position,top,left,width,height,borderRadius,zIndex' });
        }
      });
    }

    // Smooth reveal of hero title and back button
    gsap.fromTo([backBtn, heroTitle], {
      y: 40,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: 0.35,
      stagger: 0.12,
      ease: 'power3.out',
    });

    // Smooth reveal of detail section
    gsap.fromTo(modalDetail, {
      y: 60,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: 0.45,
      ease: 'power3.out',
    });
  }

  function switchProjectModal(nextId) {
    if (!projectsData[nextId]) return;

    // Scroll smoothly to top
    if (modalScroll) {
      modalScroll.scrollTo({ top: 0, behavior: 'smooth' });
    }

    gsap.to([heroImg, heroTitle, modalDetail], {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        populateModalContent(nextId);
        activeCardEl = document.querySelector(`.project-card[data-project-id="${nextId}"]`);

        gsap.fromTo(heroImg, {
          scale: 1.05,
          opacity: 0,
        }, {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'scale,opacity',
        });

        gsap.fromTo([heroTitle, modalDetail], {
          y: 30,
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.15,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      }
    });
  }

  function closeProjectModal() {
    if (!isModalOpen) return;

    const targetCard = activeCardEl || document.querySelector(`.project-card[data-project-id="${activeProjectId}"]`);
    const cardImg = targetCard ? targetCard.querySelector('.project-card__img') : null;
    const rect = cardImg ? cardImg.getBoundingClientRect() : null;

    // Hide textual content first
    gsap.to([backBtn, heroTitle, modalDetail], {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.out',
    });

    // Animate hero image back to card rect if visible in viewport
    if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
      gsap.fromTo(heroImg, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        zIndex: 350,
      }, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 4,
        duration: 0.7,
        ease: 'power3.inOut',
        onComplete: () => {
          modal.classList.remove('is-open');
          modal.setAttribute('aria-hidden', 'true');
          gsap.set(heroImg, { clearProps: 'position,top,left,width,height,borderRadius,zIndex' });
          document.body.classList.remove('modal-open');
          isModalOpen = false;

          // Resume main lenis scroll
          if (typeof lenis !== 'undefined' && lenis) {
            lenis.start();
          }
        }
      });
    } else {
      // Smooth fade out fallback
      gsap.to(modal, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          modal.classList.remove('is-open');
          modal.setAttribute('aria-hidden', 'true');
          modal.style.opacity = '';
          document.body.classList.remove('modal-open');
          isModalOpen = false;

          if (typeof lenis !== 'undefined' && lenis) {
            lenis.start();
          }
        }
      });
    }
  }

  // Card click triggers
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open modal if clicking the CTA button
      if (e.target.closest('.project-card__audit-btn')) return;
      const id = card.getAttribute('data-project-id');
      if (id) {
        openProjectModal(id, card);
      }
    });
  });

  // Prevent card click when clicking audit button directly
  section.querySelectorAll('.project-card__audit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Back button and close links
  if (backBtn) {
    backBtn.addEventListener('click', closeProjectModal);
  }

  modal.querySelectorAll('[data-close-modal]').forEach(link => {
    link.addEventListener('click', closeProjectModal);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeProjectModal();
    }
  });

})();
