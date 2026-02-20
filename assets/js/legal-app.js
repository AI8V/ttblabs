'use strict';

/* ═══════════════════════════════════════════════════════════════
   legal-app.js — Shared logic for legal/privacy.html
                  and legal/terms.html
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

  /**
   * Set textContent on element by id — no-op if not found.
   * @param {string} id
   * @param {string} text
   */
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /**
   * Set href on anchor by id — no-op if not found.
   * @param {string} id
   * @param {string} href
   */
  function setHref(id, href) {
    var el = document.getElementById(id);
    if (el) el.href = href;
  }

  /* ─────────────────────────────────────────
     BUILDERS
  ───────────────────────────────────────── */

  function buildNavBrand() {
    setText('nav-brand-name', COURSE_DATA.BRAND_NAME);
  }

  function buildInlineBrandDomain() {
    var brand  = COURSE_DATA.BRAND_NAME;
    var domain = COURSE_DATA.DOMAIN;

    /* all brand inline references — ids used in both pages */
    var brandIds = [
      'brand-inline-1',
      'brand-inline-2',
      'brand-inline-3',
      'brand-inline-4',
      'brand-inline-5',
      'brand-inline-6'
    ];
    brandIds.forEach(function (id) { setText(id, brand); });

    /* domain inline text nodes */
    setText('domain-inline-1',    domain);
    setText('legal-domain-inline', domain);

    /* domain link in contact block */
    var domainLink = document.getElementById('domain-link');
    if (domainLink) {
      domainLink.textContent = domain;
      domainLink.href = 'https://' + domain;
    }

    /* terms page: self-referencing URL link */
    var termsUrlLink = document.getElementById('terms-url-link');
    if (termsUrlLink) {
      termsUrlLink.textContent = 'https://' + domain + '/legal/terms.html';
      termsUrlLink.href        = 'https://' + domain + '/legal/terms.html';
    }
  }

  function buildWhatsAppLinks() {
    var phone   = COURSE_DATA.WHATSAPP_NUMBER;
    var message = 'Hello! I have a question about your courses.';
    var url     = buildWhatsAppUrl(phone, message);

    var ids = [
      'contact-whatsapp-link',
      'footer-whatsapp-link',
      'footer-wa-link-2'
    ];
    ids.forEach(function (id) { setHref(id, url); });
  }

  function buildFooter() {
    setText('footer-brand-name', COURSE_DATA.BRAND_NAME);
    setText(
      'footer-copyright',
      '© ' + new Date().getFullYear() + ' ' +
      COURSE_DATA.BRAND_NAME + '. All rights reserved.'
    );
  }

  /* ─────────────────────────────────────────
     SMOOTH SCROLL for TOC links
  ───────────────────────────────────────── */
  function initTocScroll() {
    var toc = document.querySelector('.legal-toc');
    if (!toc) return;

    toc.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      var targetId = anchor.getAttribute('href').slice(1);
      var target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (history.pushState) {
        history.pushState(null, '', '#' + targetId);
      }
    });
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    buildNavBrand();
    buildInlineBrandDomain();
    buildWhatsAppLinks();
    buildFooter();
    initTocScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
