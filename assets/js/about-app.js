'use strict';

/* ═══════════════════════════════════════════════════════════════
   about-app.js — Logic for about.html
   Depends on: COURSE_DATA (courses-data.js)
   NO innerHTML for dynamic content — DOM API only.
   ═══════════════════════════════════════════════════════════════ */

(function () {

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */

  function buildWhatsAppUrl(phone, message) {
    var base = 'https://wa.me/' + encodeURIComponent(phone);
    if (message) base += '?text=' + encodeURIComponent(message);
    return base;
  }

  /* ─────────────────────────────────────────
     BUILDERS
  ───────────────────────────────────────── */

  function buildNavBrand() {
    var el = document.getElementById('nav-brand-name');
    if (el) el.textContent = COURSE_DATA.BRAND_NAME;
  }

  function buildWhatsAppLinks() {
    var phone   = COURSE_DATA.WHATSAPP_NUMBER;
    var message = 'Hello! I have a question about your courses.';
    var url     = buildWhatsAppUrl(phone, message);

    var ids = [
      'contact-whatsapp-btn',
      'footer-whatsapp-link',
      'footer-wa-link-2'
    ];

    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = url;
    });
  }

  function buildFooter() {
    var brandEl = document.getElementById('footer-brand-name');
    var copyrEl = document.getElementById('footer-copyright');

    if (brandEl) brandEl.textContent = COURSE_DATA.BRAND_NAME;
    if (copyrEl) {
      copyrEl.textContent =
        '© ' + new Date().getFullYear() + ' ' +
        COURSE_DATA.BRAND_NAME + '. All rights reserved.';
    }
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    buildNavBrand();
    buildWhatsAppLinks();
    buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
