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

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHref(id, href) {
    var el = document.getElementById(id);
    if (el) el.href = href;
  }

  function setAttr(id, attr, val) {
    var el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  }

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand   = COURSE_DATA.BRAND_NAME;
    var domain  = COURSE_DATA.DOMAIN;
    var meta    = COURSE_DATA.META;
    var base    = 'https://' + domain;

    /* detect current page */
    var isTerms   = window.location.pathname.indexOf('terms') !== -1;
    var pageSlug  = isTerms ? 'terms.html' : 'privacy.html';
    var pageUrl   = base + '/legal/' + pageSlug;
    var pageImage = base + meta.ogImage;

    var pageTitle, pageDesc;

    if (isTerms) {
      pageTitle = 'Terms of Use — ' + brand;
      pageDesc  = 'Terms of Use for ' + brand +
        ' — purchase conditions, refund policy, content rights, and access terms.';
    } else {
      pageTitle = 'Privacy Policy — ' + brand;
      pageDesc  = 'Privacy Policy for ' + brand +
        ' — how we collect, use and protect your personal information.';
    }

    /* <title> */
    document.title = pageTitle;

    /* meta tags */
    setAttr('page-desc',     'content', pageDesc);
    setAttr('page-canonical','href',    pageUrl);

    /* Open Graph */
    setAttr('og-url',       'content', pageUrl);
    setAttr('og-title',     'content', pageTitle);
    setAttr('og-desc',      'content', pageDesc);
    setAttr('og-image',     'content', pageImage);
    setAttr('og-site-name', 'content', brand);

    /* Twitter Card */
    setAttr('tw-title', 'content', pageTitle);
    setAttr('tw-desc',  'content', pageDesc);
    setAttr('tw-image', 'content', pageImage);

    /* hreflang */
    var hreflang = document.querySelector(
      'link[rel="alternate"][hreflang="en"]');
    if (hreflang) hreflang.setAttribute('href', pageUrl);

    /* JSON-LD — WebPage schema */
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': pageUrl + '#webpage',
      'url': pageUrl,
      'name': pageTitle,
      'description': pageDesc,
      'isPartOf': { '@id': base + '/#website' },
      'inLanguage': 'en',
      'dateModified': '2026-02-19'
    };

    var script = document.createElement('script');
    script.type        = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
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
    var base   = 'https://' + domain;

    /* brand inline references — no-op if ID not present in page */
    ['brand-inline-1','brand-inline-2','brand-inline-3',
     'brand-inline-4','brand-inline-5','brand-inline-6'
    ].forEach(function (id) { setText(id, brand); });

    /* domain inline text */
    setText('domain-inline-1',     domain);
    setText('legal-domain-inline', domain);

    /* domain link in contact block */
    var domainLink = document.getElementById('domain-link');
    if (domainLink) {
      domainLink.textContent = domain;
      domainLink.href        = base;
    }

    /* terms page: self-referencing URL */
    var termsLink = document.getElementById('terms-url-link');
    if (termsLink) {
      var termsUrl = base + '/legal/terms.html';
      termsLink.textContent = termsUrl;
      termsLink.href        = termsUrl;
    }
  }

  function buildEmailLinks() {
    var email  = COURSE_DATA.META.supportEmail;
    var mailto = 'mailto:' + email;

    var contactLink = document.getElementById('contact-email-link');
    if (contactLink) contactLink.href = mailto;

    var contactText = document.getElementById('contact-email-text');
    if (contactText) contactText.textContent = email;

    var footerLink = document.getElementById('footer-email-link');
    if (footerLink) footerLink.href = mailto;
  }

  function buildWhatsAppLinks() {
    var url = buildWhatsAppUrl(
      COURSE_DATA.WHATSAPP_NUMBER,
      'Hello! I have a question about your courses.'
    );
    ['contact-whatsapp-link',
     'footer-whatsapp-link',
     'footer-wa-link-2'
    ].forEach(function (id) { setHref(id, url); });
  }

  function buildFooter() {
    setText('footer-brand-name', COURSE_DATA.BRAND_NAME);
    setText('footer-copyright',
      '© ' + new Date().getFullYear() + ' ' +
      COURSE_DATA.BRAND_NAME + '. All rights reserved.'
    );
  }

  /* ─────────────────────────────────────────
     SMOOTH SCROLL — TOC links
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
    injectSEO();
    buildNavBrand();
    buildInlineBrandDomain();
    buildEmailLinks();
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
