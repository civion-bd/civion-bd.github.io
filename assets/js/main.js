/* ============================================================
   Civion BD — main.js
   Vanilla JS. No framework (add-ins.md Dependency Checklist).
   Handles: shared navbar/footer injection, mobile nav, scroll
   state, stat counters, contact/career forms (Formspree).

   PATH CONVENTION (file-system.md §2): every internal reference in
   this site is relative, never root-absolute (no leading "/"), so
   the whole thing works unmodified under any domain or subpath —
   including a Cloudflare Pages preview URL, a custom domain, or a
   project hosted in a subdirectory. Each page declares how many
   folders deep it sits via <body data-depth="N">: 0 for the home
   page, 1 for everything under /<page>/index.html. main.js reads
   that once and uses it to fetch includes/navbar.html + footer.html
   correctly, then rewrites the internal href/src attributes inside
   those two fetched fragments the same way — because a shared
   include is written once (paths relative to the SITE root, e.g.
   "about/index.html"), but gets reused from pages sitting at two
   different depths, so it can't hardcode a single relative prefix
   itself.
   ============================================================ */

(function () {
  'use strict';

  const DEPTH = parseInt(document.body.getAttribute('data-depth') || '0', 10);
  const BASE = '../'.repeat(DEPTH); // '' at site root, '../' one level down, etc.

  /* ---------- Include Injection (navbar/footer) ---------- */


  function setActiveNavLink() {
    const page = document.body.getAttribute('data-page');
    if (!page) return;
    document.querySelectorAll('.nav__link').forEach((link) => {
      if (link.getAttribute('data-page') === page) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initMobileNav() {
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  function initNavScrollState() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Stat Counters (homepage / about — database.md §8) ---------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => io.observe(c));
  }

  /* ---------- Formspree Forms (contact + careers) ---------- */
  function initForms() {
    document.querySelectorAll('form[data-formspree]').forEach((form) => {
      const status = form.querySelector('[data-form-status]');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const endpoint = form.getAttribute('data-formspree');
        if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
          if (status) {
            status.textContent = 'Form endpoint not yet configured — see README §Formspree.';
            status.dataset.state = 'error';
          }
          return;
        }
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalLabel = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
          });
          if (res.ok) {
            form.reset();
            if (status) { status.textContent = 'Message sent — we will be in touch shortly.'; status.dataset.state = 'success'; }
          } else {
            if (status) { status.textContent = 'Something went wrong. Please try again or email us directly.'; status.dataset.state = 'error'; }
          }
        } catch (err) {
          if (status) { status.textContent = 'Network error — please try again.'; status.dataset.state = 'error'; }
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        }
      });
    });
  }

  /* ---------- Current Year (footer) ---------- */
  function setYear() {
    document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    initMobileNav();
    initNavScrollState();
    initCounters();
    initForms();
    setYear();
    document.dispatchEvent(new CustomEvent('civion:chrome-ready'));
  });
})();
