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

  function setAttr(id, attr, val) {
    var el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand  = COURSE_DATA.BRAND_NAME;
    var domain = COURSE_DATA.DOMAIN;
    var meta   = COURSE_DATA.META;
    var base   = 'https://' + domain;
    var pageUrl = base + '/about.html';

    var pageTitle = 'About Us — ' + brand;
    var pageDesc  = 'Learn about ' + brand +
      ' — our mission, how we work, and how to get in touch with us.';
    var pageImage = base + meta.ogImage;

    /* <title> */
    document.title = pageTitle;

    /* meta description */
    setAttr('page-desc',    'content', pageDesc);
    setAttr('page-canonical','href',   pageUrl);

    /* Open Graph */
    setAttr('og-url',      'content', pageUrl);
    setAttr('og-title',    'content', pageTitle);
    setAttr('og-desc',     'content', pageDesc);
    setAttr('og-image',    'content', pageImage);
    setAttr('og-site-name','content', brand);

    /* Twitter Card */
    setAttr('tw-title', 'content', pageTitle);
    setAttr('tw-desc',  'content', pageDesc);
    setAttr('tw-image', 'content', pageImage);

    /* hreflang */
    var hreflang = document.querySelector(
      'link[rel="alternate"][hreflang="en"]');
    if (hreflang) hreflang.setAttribute('href', pageUrl);

    /* JSON-LD — Organization + ContactPage */
    var schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': base + '/#organization',
          'name': brand,
          'url': base,
          'logo': base + '/assets/img/fav180.png',
          'foundingDate': meta.foundingYear,
          'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'customer support',
            'availableLanguage': 'English'
          }
        },
        {
          '@type': 'WebPage',
          '@id': pageUrl + '#webpage',
          'url': pageUrl,
          'name': pageTitle,
          'description': pageDesc,
          'isPartOf': { '@id': base + '/#website' },
          'about': { '@id': base + '/#organization' },
          'inLanguage': 'en'
        }
      ]
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

  function buildInlineBrands() {
    /* brand-inline-1 — used in platform section body text */
    setText('brand-inline-1', COURSE_DATA.BRAND_NAME);
  }

  function buildWhatsAppLinks() {
    var url = buildWhatsAppUrl(
      COURSE_DATA.WHATSAPP_NUMBER,
      'Hello! I have a question about your courses.'
    );
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

  function buildEmailLinks() {
    var email = COURSE_DATA.META.supportEmail;
    var mailto = 'mailto:' + email;

    var contactLink = document.getElementById('contact-email-link');
    if (contactLink) contactLink.href = mailto;

    var contactText = document.getElementById('contact-email-text');
    if (contactText) contactText.textContent = email;

    var footerLink = document.getElementById('footer-email-link');
    if (footerLink) footerLink.href = mailto;
  }

  function buildFooter() {
    setText('footer-brand-name', COURSE_DATA.BRAND_NAME);
    setText('footer-copyright',
      '© ' + new Date().getFullYear() + ' ' +
      COURSE_DATA.BRAND_NAME + '. All rights reserved.'
    );
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  function init() {
    injectSEO();
    buildNavBrand();
    buildInlineBrands();
    buildWhatsAppLinks();
    buildEmailLinks();
    buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
