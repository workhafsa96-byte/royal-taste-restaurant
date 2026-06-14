/**
 * ROYAL TASTE RESTAURANT — script.js
 * Features:
 *  - Loading Screen
 *  - Dark / Light Mode Toggle  (persisted in localStorage)
 *  - Sticky Navbar + Active Link Highlight
 *  - Mobile Menu (Hamburger)
 *  - Smooth Scroll (enhanced)
 *  - Scroll Reveal Animations (IntersectionObserver)
 *  - Menu Search + Category Filter
 *  - Testimonial Slider (auto-play, keyboard, touch)
 *  - Reservation Form Validation
 *  - Gallery Lightbox
 *  - Newsletter Form
 *  - Back To Top Button
 *  - Footer Year
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   0. HELPERS
══════════════════════════════════════════════════════════ */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════════════════════════
   1. LOADING SCREEN
══════════════════════════════════════════════════════════ */
(function initLoader() {
  const screen = qs('#loading-screen');
  if (!screen) return;

  // Hide after animation finishes (or 2.2s max)
  const hide = () => screen.classList.add('hidden');

  if (document.readyState === 'complete') {
    setTimeout(hide, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600), { once: true });
  }
})();

/* ══════════════════════════════════════════════════════════
   2. DARK / LIGHT MODE TOGGLE
══════════════════════════════════════════════════════════ */
(function initTheme() {
  const btn   = qs('#theme-toggle');
  const html  = document.documentElement;
  const STORE = 'rt-theme';

  // Restore saved preference, fallback to dark
  const saved = localStorage.getItem(STORE) || 'dark';
  html.setAttribute('data-theme', saved);
  document.body.setAttribute('data-theme', saved);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    document.body.setAttribute('data-theme', next);
    localStorage.setItem(STORE, next);
  });
})();

/* ══════════════════════════════════════════════════════════
   3. STICKY NAVBAR + ACTIVE LINK
══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar  = qs('#navbar');
  const links   = qsa('.nav-links a');
  const sections = qsa('section[id]');
  if (!navbar) return;

  /* Sticky class */
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    /* Active link highlighting */
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(a => {
      a.classList.toggle('active-link', a.getAttribute('href') === `#${current}`);
    });

    /* Back to top */
    const btt = qs('#back-to-top');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ══════════════════════════════════════════════════════════
   4. MOBILE HAMBURGER MENU
══════════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const btn   = qs('#hamburger');
  const links = qs('#nav-links');
  if (!btn || !links) return;

  const toggle = (force) => {
    const open = force !== undefined ? force : !links.classList.contains('mobile-open');
    links.classList.toggle('mobile-open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => toggle());

  // Close on link click
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') toggle(false);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) toggle(false);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggle(false);
  });
})();

/* ══════════════════════════════════════════════════════════
   5. SMOOTH SCROLLING (with offset for fixed navbar)
══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = qs(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH   = qs('#navbar')?.offsetHeight ?? 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════════════════════
   6. SCROLL REVEAL ANIMATIONS
══════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = qsa('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger siblings within the same parent
      const siblings = qsa('.reveal', entry.target.parentElement);
      const idx = siblings.indexOf(entry.target);
      const delay = Math.min(idx * 80, 400);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════
   7. MENU SEARCH + CATEGORY FILTER
══════════════════════════════════════════════════════════ */
(function initMenu() {
  const searchInput = qs('#menu-search');
  const filterBtns  = qsa('.filter-btn');
  const items       = qsa('.menu-item');
  const emptyMsg    = qs('#menu-empty');
  if (!searchInput) return;

  let activeFilter = 'all';

  const applyFilters = () => {
    const query = searchInput.value.toLowerCase().trim();
    let visible = 0;

    items.forEach(item => {
      const cat     = item.dataset.cat || '';
      const text    = item.textContent.toLowerCase();
      const matchCat  = activeFilter === 'all' || cat === activeFilter;
      const matchQuery = !query || text.includes(query);
      const show = matchCat && matchQuery;
      item.classList.toggle('hidden', !show);
      if (show) visible++;
    });

    if (emptyMsg) emptyMsg.hidden = visible > 0;
  };

  searchInput.addEventListener('input', applyFilters);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   8. TESTIMONIAL SLIDER
══════════════════════════════════════════════════════════ */
(function initSlider() {
  const slider  = qs('#testimonial-slider');
  const prevBtn = qs('#testi-prev');
  const nextBtn = qs('#testi-next');
  const dotsWrap= qs('#testi-dots');
  if (!slider) return;

  const slides = qsa('.testimonial-slide', slider);
  let current  = 0;
  let autoTimer = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    dot.setAttribute('aria-selected', String(i === 0));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap?.appendChild(dot);
  });

  const dots = () => qsa('.testi-dot', dotsWrap);

  const goTo = (idx) => {
    slides[current].classList.remove('active');
    dots()[current].classList.remove('active');
    dots()[current].setAttribute('aria-selected', 'false');

    current = (idx + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots()[current].classList.add('active');
    dots()[current].setAttribute('aria-selected', 'true');

    slider.setAttribute('aria-label', `Review ${current + 1} of ${slides.length}`);
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  nextBtn?.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn?.addEventListener('click', () => { prev(); resetAuto(); });

  const startAuto = () => { autoTimer = setInterval(next, 5000); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  startAuto();

  // Pause on hover / focus
  slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
  slider.addEventListener('mouseleave',  startAuto);
  slider.addEventListener('focusin',    () => clearInterval(autoTimer));
  slider.addEventListener('focusout',    startAuto);

  // Keyboard
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  // Touch / swipe
  let touchStartX = null;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX = null;
    resetAuto();
  });
})();

/* ══════════════════════════════════════════════════════════
   9. RESERVATION FORM VALIDATION
══════════════════════════════════════════════════════════ */
(function initReservation() {
  const form    = qs('#reserve-form');
  if (!form) return;

  const field = (id) => qs(`#${id}`);
  const error = (id) => qs(`#err-${id}`);
  const group = (id) => field(id)?.closest('.form-group');

  const setError = (id, msg) => {
    const err = error(id);
    const grp = group(id);
    if (err) err.textContent = msg;
    grp?.classList.toggle('error', !!msg);
  };

  const clearError = (id) => setError(id, '');

  // Live clear on change
  ['res-name','res-email','res-phone','res-guests','res-date','res-time'].forEach(id => {
    const el = qs(`#${id}`);
    el?.addEventListener('input',  () => clearError(id.replace('res-', '')));
    el?.addEventListener('change', () => clearError(id.replace('res-', '')));
  });

  const validate = () => {
    let valid = true;

    // Name
    const name = field('res-name')?.value.trim() ?? '';
    if (name.length < 2) { setError('name', 'Please enter your full name.'); valid = false; }
    else clearError('name');

    // Email
    const email = field('res-email')?.value.trim() ?? '';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) { setError('email', 'Please enter a valid email address.'); valid = false; }
    else clearError('email');

    // Phone
    const phone = field('res-phone')?.value.trim() ?? '';
    const phoneRe = /^[\+\d\s\-\(\)]{7,20}$/;
    if (!phoneRe.test(phone)) { setError('phone', 'Please enter a valid phone number.'); valid = false; }
    else clearError('phone');

    // Guests
    const guests = field('res-guests')?.value ?? '';
    if (!guests) { setError('guests', 'Please select number of guests.'); valid = false; }
    else clearError('guests');

    // Date
    const dateVal = field('res-date')?.value ?? '';
    if (!dateVal) {
      setError('date', 'Please select a date.'); valid = false;
    } else {
      const chosen = new Date(dateVal);
      const today  = new Date(); today.setHours(0,0,0,0);
      if (chosen < today) { setError('date', 'Please choose a future date.'); valid = false; }
      else clearError('date');
    }

    // Time
    const timeVal = field('res-time')?.value ?? '';
    if (!timeVal) {
      setError('time', 'Please select a time.'); valid = false;
    } else {
      const [h, m] = timeVal.split(':').map(Number);
      const mins = h * 60 + m;
      if (mins < 12 * 60 || mins > 22 * 60 + 30) {
        setError('time', 'We are open 12:00 PM – 10:30 PM.'); valid = false;
      } else clearError('time');
    }

    return valid;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate success (replace with real API call)
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Confirming…'; }

    setTimeout(() => {
      const success = qs('#form-success');
      if (success) success.hidden = false;
      form.reset();
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-regular fa-calendar-check"></i> Confirm Reservation'; }
      setTimeout(() => { if (success) success.hidden = true; }, 6000);
    }, 1200);
  });
})();

/* ══════════════════════════════════════════════════════════
   10. GALLERY LIGHTBOX
══════════════════════════════════════════════════════════ */
(function initLightbox() {
  const gallery   = qs('.gallery-grid');
  const lightbox  = qs('#lightbox');
  const lbImg     = qs('#lightbox-img');
  const lbClose   = qs('#lightbox-close');
  if (!gallery || !lightbox) return;

  const open = (img) => {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
  };

  gallery.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const img = qs('img', item);
    if (img) open(img);
  });

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) close(); });
})();

/* ══════════════════════════════════════════════════════════
   11. NEWSLETTER FORM
══════════════════════════════════════════════════════════ */
(function initNewsletter() {
  const form = qs('#newsletter-form');
  const msg  = qs('#nl-msg');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = qs('#nl-email');
    const val   = input?.value.trim() ?? '';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRe.test(val)) {
      if (msg) { msg.textContent = 'Please enter a valid email.'; msg.style.color = '#e74c3c'; msg.hidden = false; }
      return;
    }

    // Simulate subscription
    if (msg) {
      msg.textContent = 'You\'re subscribed! Welcome to the Royal Taste family.';
      msg.style.color = '#27ae60';
      msg.hidden = false;
    }
    form.reset();
    setTimeout(() => { if (msg) msg.hidden = true; }, 5000);
  });
})();

/* ══════════════════════════════════════════════════════════
   12. BACK TO TOP BUTTON
══════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ══════════════════════════════════════════════════════════
   13. FOOTER YEAR
══════════════════════════════════════════════════════════ */
(function setYear() {
  const el = qs('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ══════════════════════════════════════════════════════════
   14. RESERVATION DATE MIN (today)
══════════════════════════════════════════════════════════ */
(function setDateMin() {
  const dateInput = qs('#res-date');
  if (!dateInput) return;
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
})();

/* ══════════════════════════════════════════════════════════
   15. DISH "ORDER NOW" BUTTONS — feedback microinteraction
══════════════════════════════════════════════════════════ */
(function initOrderButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-gold-sm');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.style.background = 'linear-gradient(135deg, #1a6b3c, #27ae60)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.disabled = false;
    }, 1800);
  });
})();