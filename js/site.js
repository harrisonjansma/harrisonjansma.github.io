/*==============================================================
  site.js — behavior for the 2026 refresh (Home, About, Projects, Huck)

  Plain vanilla JS, no dependencies. Every block is a no-op when its
  markup is absent, so all four pages load the same file.
==============================================================*/
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*--------------------  Scroll reveal  --------------------*/
  /* Content that is opacity:0 with no callback is invisible content —
     the failure mode is total. Hence three layers: IntersectionObserver
     (the path that normally runs), a rect check on scroll/resize, and a
     1.5s deadline that forces everything visible regardless. */
  function armReveal() {
    var nodes = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return;

    if (reduced) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    var pending = nodes.slice();
    var io = null;

    function show(n) {
      n.classList.add('is-in');
      if (io) io.unobserve(n);
      var i = pending.indexOf(n);
      if (i > -1) pending.splice(i, 1);
    }
    function showAll() {
      pending.slice().forEach(show);
      disarm();
    }
    function check() {
      var vh = window.innerHeight || 800;
      pending.slice().forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) show(n);
      });
      if (!pending.length) disarm();
    }
    function disarm() {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    }

    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);

    var ioFired = false;
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(function (entries) {
        ioFired = true;
        entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
        if (!pending.length) disarm();
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      nodes.forEach(function (n) { io.observe(n); });
    }

    requestAnimationFrame(check);
    setTimeout(check, 250);
    setTimeout(function () { if (!ioFired) showAll(); }, 1500);
  }

  /*--------------------  Mobile nav  --------------------*/
  function armNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav-list]');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('span').className = 'lnr lnr-menu';
    }
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('span').className = open ? 'lnr lnr-cross' : 'lnr lnr-menu';
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) close();
    });
  }

  /*--------------------  Live demo overlay  --------------------*/
  function armDemo() {
    var overlay = document.querySelector('[data-demo]');
    if (!overlay) return;
    var frame = overlay.querySelector('iframe');
    var openers = document.querySelectorAll('[data-demo-open]');
    if (!openers.length) return;

    function open() {
      /* src is held in data-src so the demo host is only contacted
         when someone actually asks for it. */
      if (frame && !frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-src'));
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (frame) frame.removeAttribute('src'); /* stops audio/mic capture */
    }

    [].forEach.call(openers, function (b) { b.addEventListener('click', open); });
    [].forEach.call(overlay.querySelectorAll('[data-demo-close]'), function (b) {
      b.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });
  }

  /*--------------------  Projects filter  --------------------*/
  function armFilters() {
    var buttons = document.querySelectorAll('[data-filter]');
    if (!buttons.length) return;
    var rows = document.querySelectorAll('[data-cat]');
    var groups = document.querySelectorAll('[data-group]');

    function apply(f) {
      [].forEach.call(buttons, function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-filter') === f);
        b.setAttribute('aria-pressed', b.getAttribute('data-filter') === f ? 'true' : 'false');
      });
      [].forEach.call(rows, function (row) {
        row.style.display = (f === 'all' || row.getAttribute('data-cat') === f) ? '' : 'none';
      });
      var first = true;
      [].forEach.call(groups, function (group) {
        var cats = (group.getAttribute('data-group') || '').split(' ');
        var show = f === 'all' || cats.indexOf(f) !== -1;
        group.style.display = show ? '' : 'none';
        /* Clear the top margin of whichever group ends up first so a
           filtered view doesn't open with dead space. */
        if (show) { group.style.marginTop = first ? '0' : ''; first = false; }
      });
    }

    [].forEach.call(buttons, function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
    });
    apply('all');
  }

  /*--------------------  Timeline expanders  --------------------*/
  function armExpanders() {
    var items = document.querySelectorAll('[data-exp]');
    if (!items.length) return;
    var single = false; /* multiple panels may be open at once */

    function setOpen(item, open) {
      var btn = item.querySelector('[data-exp-btn]');
      var panel = item.querySelector('[data-exp-panel]');
      if (!btn || !panel) return;
      item._open = open;
      panel.style.maxHeight = open ? (panel.scrollHeight + 60) + 'px' : '0px';
      panel.style.opacity = open ? '1' : '0';
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    [].forEach.call(items, function (item) {
      var btn = item.querySelector('[data-exp-btn]');
      var panel = item.querySelector('[data-exp-panel]');
      if (!btn || !panel) return;
      setOpen(item, item.hasAttribute('data-exp-open'));
      btn.addEventListener('click', function () {
        var isOpen = !!item._open;
        if (single && !isOpen) {
          [].forEach.call(items, function (o) { if (o !== item) setOpen(o, false); });
        }
        setOpen(item, !isOpen);
      });
    });

    /* Re-measure open panels after a reflow — a wrapped paragraph is
       taller than the max-height captured at the previous width. */
    window.addEventListener('resize', function () {
      [].forEach.call(items, function (item) { if (item._open) setOpen(item, true); });
    });
  }

  /*--------------------  Huck lightbox  --------------------*/
  function armLightbox() {
    var box = document.querySelector('[data-lightbox]');
    var photos = document.querySelectorAll('[data-photo]');
    if (!box || !photos.length) return;

    var img = box.querySelector('img');
    var index = -1;

    function open(i) {
      index = i;
      img.setAttribute('src', photos[i].getAttribute('src'));
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close() {
      index = -1;
      box.hidden = true;
      document.body.style.overflow = '';
    }
    function step(d) {
      if (index < 0) return;
      open((index + d + photos.length) % photos.length); /* wraps at both ends */
    }

    [].forEach.call(photos, function (p, i) {
      p.addEventListener('click', function () { open(i); });
    });
    box.addEventListener('click', close); /* backdrop */
    box.querySelector('[data-lightbox-close]').addEventListener('click', function (e) {
      e.stopPropagation(); close();
    });
    [].forEach.call(box.querySelectorAll('[data-lightbox-step]'), function (b) {
      /* stopPropagation, or an arrow click closes the overlay under it */
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        step(parseInt(b.getAttribute('data-lightbox-step'), 10));
      });
    });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  function init() {
    armReveal();
    armNav();
    armDemo();
    armFilters();
    armExpanders();
    armLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
