'use strict';

/* ═══════════════════════════════════════════════════════════════
   home-app.js — Logic for index.html
   Depends on: COURSE_DATA (courses-data.js), Utils (utils.js)
   NO innerHTML for dynamic content — DOM API only.
   ═══════════════════════════════════════════════════════════════ */

(function () {

  /* ─────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────── */

  var FEATURED_COUNT = 3;

  var STATS = [
    { icon: 'bi-journal-bookmark-fill', number: '8+',    label: 'Courses Available' },
    { icon: 'bi-people-fill',           number: '3,300+', label: 'Students Enrolled' },
    { icon: 'bi-star-fill',             number: '4.2',   label: 'Average Rating'    },
    { icon: 'bi-award-fill',            number: '100%',  label: 'Satisfaction Rate' }
  ];

  var CATEGORY_ICONS = {
    'Business':    'bi-briefcase-fill',
    'Health':      'bi-heart-pulse-fill',
    'IT':          'bi-hdd-network-fill',
    'Marketing':   'bi-megaphone-fill',
    'Photography': 'bi-camera-fill',
    'Design':      'bi-palette-fill',
    'Developer':   'bi-code-slash'
  };

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */

  function el(tag, classes, text) {
    var node = document.createElement(tag);
    if (classes) {
      var list = Array.isArray(classes) ? classes : [classes];
      list.forEach(function (c) { if (c) node.classList.add(c); });
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildWhatsAppUrl(phone, message) {
    var base = 'https://wa.me/' + encodeURIComponent(phone);
    if (message) base += '?text=' + encodeURIComponent(message);
    return base;
  }

  function buildCatalogUrl(category) {
    if (!category) return './course/';
    return './course/?category=' + encodeURIComponent(category);
  }

  function buildCourseUrl(id) {
    return './course/course-details/?id=' + encodeURIComponent(id);
  }

  function formatPrice(price) {
    if (price === 0) return 'Free';
    return '$' + price.toFixed(2);
  }

  function getFeaturedCourses() {
    return COURSE_DATA.courses.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    }).slice(0, FEATURED_COUNT);
  }

  function getCategoriesWithCount() {
    var map = {};
    COURSE_DATA.courses.forEach(function (c) {
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return map;
  }

  function buildStarFragment(rating) {
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= 5; i++) {
      var star = document.createElement('i');
      star.setAttribute('aria-hidden', 'true');
      star.className = rating >= i
        ? 'bi bi-star-fill'
        : rating >= i - 0.5 ? 'bi bi-star-half' : 'bi bi-star';
      frag.appendChild(star);
    }
    return frag;
  }

  /* ─────────────────────────────────────────
     SEO INJECTION — from COURSE_DATA
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand  = COURSE_DATA.BRAND_NAME;
    var domain = COURSE_DATA.DOMAIN;
    var meta   = COURSE_DATA.META;
    var base   = 'https://' + domain;

    var pageTitle = brand + ' — ' + meta.tagline;
    var pageDesc  = meta.description;
    var pageUrl   = base + '/';
    var pageImage = base + meta.ogImage;

    /* <title> */
    document.title = pageTitle;

    /* meta description */
    var descEl = document.getElementById('page-desc');
    if (descEl) descEl.setAttribute('content', pageDesc);

    /* canonical */
    var canonEl = document.getElementById('page-canonical');
    if (canonEl) canonEl.setAttribute('href', pageUrl);

    /* Open Graph */
    var ogMap = {
      'og-url':       pageUrl,
      'og-title':     pageTitle,
      'og-desc':      pageDesc,
      'og-image':     pageImage,
      'og-site-name': brand
    };
    Object.keys(ogMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('content', ogMap[id]);
    });

    /* Twitter Card */
    var twMap = {
      'tw-title': pageTitle,
      'tw-desc':  pageDesc,
      'tw-image': pageImage
    };
    Object.keys(twMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('content', twMap[id]);
    });

    /* hreflang */
    var hreflang = document.querySelector('link[rel="alternate"][hreflang="en"]');
    if (hreflang) hreflang.setAttribute('href', pageUrl);

    /* JSON-LD — WebSite + Organization */
    var schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': base + '/#website',
          'name': brand,
          'url': base,
          'description': meta.description,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': base + '/course/?search={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          }
        },
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
        }
      ]
    };

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  /* ─────────────────────────────────────────
     BUILDERS
  ───────────────────────────────────────── */

  function buildHero() {
    var line1    = document.getElementById('hero-title-line1');
    var gradient = document.getElementById('hero-title-gradient');
    var subtitle = document.getElementById('hero-subtitle');
    var navBrand = document.getElementById('nav-brand-name');

    if (navBrand)  navBrand.textContent  = COURSE_DATA.BRAND_NAME;
    if (line1)     line1.textContent     = 'Expand Your Skills,';
    if (gradient)  gradient.textContent  = 'Shape Your Future.';
    if (subtitle)  subtitle.textContent  =
      'Expert-led courses in Development, Design, Health, Marketing and more. ' +
      'Learn at your own pace with lifetime access and dedicated support.';
  }

  function buildStats() {
    var container = document.getElementById('stats-bar');
    if (!container) return;
    var frag = document.createDocumentFragment();

    STATS.forEach(function (stat) {
      var item = el('div', 'stat-item');
      item.setAttribute('role', 'listitem');

      var icon = document.createElement('i');
      icon.className = 'bi ' + stat.icon + ' stat-icon';
      icon.setAttribute('aria-hidden', 'true');

      var number = el('div', 'stat-number', stat.number);
      var label  = el('div', 'stat-label',  stat.label);

      item.appendChild(icon);
      item.appendChild(number);
      item.appendChild(label);
      frag.appendChild(item);
    });

    container.appendChild(frag);
  }

  function buildFeaturedCard(course) {
    var col  = el('div', ['col-12', 'col-md-6', 'col-lg-4']);
    var card = el('div', 'featured-card');

    /* image */
    var img = document.createElement('img');
    img.className     = 'featured-card-img';
    img.alt           = course.title;
    img.loading       = 'lazy';
    img.decoding      = 'async';
    img.width         = 400;
    img.height        = 225;
    img.src           = './assets/img/' + course.image;
    card.appendChild(img);

    /* body */
    var body = el('div', 'featured-card-body');
    body.appendChild(el('div', 'featured-card-category', course.category));

    var title = el('h3', 'featured-card-title', course.title);
    body.appendChild(title);

    body.appendChild(el('p', 'featured-card-desc', course.description));

    /* meta */
    var meta = el('div', 'featured-card-meta');

    var starsWrap = el('div', 'featured-stars');
    starsWrap.setAttribute('role', 'img');
    starsWrap.setAttribute('aria-label',
      'Rating: ' + course.rating + ' out of 5');
    starsWrap.appendChild(buildStarFragment(course.rating));
    meta.appendChild(starsWrap);

    var lessonsItem = el('span', 'featured-meta-item');
    var lessonsIcon = document.createElement('i');
    lessonsIcon.className = 'bi bi-play-circle';
    lessonsIcon.setAttribute('aria-hidden', 'true');
    lessonsItem.appendChild(lessonsIcon);
    lessonsItem.appendChild(
      document.createTextNode(' ' + course.lessons + ' lessons'));
    meta.appendChild(lessonsItem);

    var levelItem = el('span', 'featured-meta-item');
    var levelIcon = document.createElement('i');
    levelIcon.className = 'bi bi-bar-chart-fill';
    levelIcon.setAttribute('aria-hidden', 'true');
    levelItem.appendChild(levelIcon);
    levelItem.appendChild(document.createTextNode(' ' + course.level));
    meta.appendChild(levelItem);

    body.appendChild(meta);

    /* footer */
    var footer  = el('div', 'featured-card-footer');
    var priceEl = el('span');
    priceEl.className = 'featured-card-price' +
      (course.price === 0 ? ' featured-card-price--free' : '');
    priceEl.textContent = formatPrice(course.price);
    footer.appendChild(priceEl);

    var btn     = document.createElement('a');
    btn.className   = 'featured-card-btn';
    btn.href        = buildCourseUrl(course.id);
    btn.textContent = 'View Course';
    btn.setAttribute('aria-label', 'View course: ' + course.title);
    footer.appendChild(btn);

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function buildFeaturedCourses() {
    var grid = document.getElementById('featured-courses-grid');
    if (!grid) return;
    var frag = document.createDocumentFragment();
    getFeaturedCourses().forEach(function (c) {
      frag.appendChild(buildFeaturedCard(c));
    });
    grid.appendChild(frag);
  }

  function buildCategoryCard(name, count, colorKey) {
    var col    = el('div', ['col-6', 'col-sm-4', 'col-md-3', 'col-lg-2']);
    var anchor = document.createElement('a');
    anchor.className = 'category-card category-card--' + colorKey;
    anchor.href      = buildCatalogUrl(name);
    anchor.setAttribute('aria-label',
      name + ' — ' + count + (count === 1 ? ' course' : ' courses'));

    var iconWrap = el('div', ['category-icon', 'category-icon--' + colorKey]);
    var iconEl   = document.createElement('i');
    iconEl.className = 'bi ' + (CATEGORY_ICONS[name] || 'bi-bookmark-fill');
    iconEl.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(iconEl);
    anchor.appendChild(iconWrap);

    anchor.appendChild(el('span', 'category-name', name));
    anchor.appendChild(el('span', 'category-count',
      count === 1 ? '1 course' : count + ' courses'));

    col.appendChild(anchor);
    return col;
  }

  function buildCategories() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;
    var catMap = getCategoriesWithCount();
    var frag   = document.createDocumentFragment();
    Object.keys(catMap).forEach(function (name) {
      var colorKey = (COURSE_DATA.categories[name] || {}).color || 'emerald';
      frag.appendChild(buildCategoryCard(name, catMap[name], colorKey));
    });
    grid.appendChild(frag);
  }

  function buildFooterCategories() {
    var list = document.getElementById('footer-categories');
    if (!list) return;
    var catMap = getCategoriesWithCount();
    var frag   = document.createDocumentFragment();
    Object.keys(catMap).forEach(function (name) {
      var li = document.createElement('li');
      var a  = document.createElement('a');
      a.href        = buildCatalogUrl(name);
      a.textContent = name;
      li.appendChild(a);
      frag.appendChild(li);
    });
    list.appendChild(frag);
  }

  function buildWhatsAppLinks() {
    var url = buildWhatsAppUrl(
      COURSE_DATA.WHATSAPP_NUMBER,
      'Hello! I have a question about your courses.'
    );
    var ctaBtn    = document.getElementById('cta-whatsapp-btn');
    var footerBtn = document.getElementById('footer-whatsapp-link');
    if (ctaBtn)    ctaBtn.href    = url;
    if (footerBtn) footerBtn.href = url;
  }

  function buildFooter() {
    var brandEl = document.getElementById('footer-brand-name');
    var copyrEl = document.getElementById('footer-copyright');
    if (brandEl) brandEl.textContent = COURSE_DATA.BRAND_NAME;
    if (copyrEl) copyrEl.textContent =
      '© ' + new Date().getFullYear() + ' ' +
      COURSE_DATA.BRAND_NAME + '. All rights reserved.';
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  function init() {
    injectSEO();
    buildHero();
    buildStats();
    buildFeaturedCourses();
    buildCategories();
    buildFooterCategories();
    buildWhatsAppLinks();
    buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
