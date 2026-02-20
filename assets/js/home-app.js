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

  /* Map category name → Bootstrap Icon class */
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

  /**
   * Create element with optional class names and text.
   * @param {string} tag
   * @param {string|string[]} [classes]
   * @param {string} [text]
   * @returns {HTMLElement}
   */
  function el(tag, classes, text) {
    var node = document.createElement(tag);
    if (classes) {
      var list = Array.isArray(classes) ? classes : [classes];
      list.forEach(function (c) { if (c) node.classList.add(c); });
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /**
   * Safely build a wa.me WhatsApp URL.
   * @param {string} phone
   * @param {string} [message]
   * @returns {string}
   */
  function buildWhatsAppUrl(phone, message) {
    var base = 'https://wa.me/' + encodeURIComponent(phone);
    if (message) base += '?text=' + encodeURIComponent(message);
    return base;
  }

  /**
   * Build catalog URL with optional category filter.
   * @param {string} [category]
   * @returns {string}
   */
  function buildCatalogUrl(category) {
    if (!category) return './course/';
    return './course/?category=' + encodeURIComponent(category);
  }

  /**
   * Build course-details URL from course id.
   * @param {number} id
   * @returns {string}
   */
  function buildCourseUrl(id) {
    return './course/course-details/?id=' + encodeURIComponent(id);
  }

  /**
   * Format price to display string.
   * @param {number} price
   * @returns {string}
   */
  function formatPrice(price) {
    if (price === 0) return 'Free';
    return '$' + price.toFixed(2);
  }

  /**
   * Get 3 latest courses sorted by date desc.
   * @returns {Array}
   */
  function getFeaturedCourses() {
    var sorted = COURSE_DATA.courses.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    return sorted.slice(0, FEATURED_COUNT);
  }

  /**
   * Build categories map: { name → count }
   * @returns {Object}
   */
  function getCategoriesWithCount() {
    var map = {};
    COURSE_DATA.courses.forEach(function (course) {
      var cat = course.category;
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }

  /**
   * Render star icons for a given rating (supports .5).
   * Returns a document fragment.
   * @param {number} rating  0–5
   * @returns {DocumentFragment}
   */
  function buildStarFragment(rating) {
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= 5; i++) {
      var star = el('i');
      star.setAttribute('aria-hidden', 'true');
      if (rating >= i) {
        star.className = 'bi bi-star-fill';
      } else if (rating >= i - 0.5) {
        star.className = 'bi bi-star-half';
      } else {
        star.className = 'bi bi-star';
      }
      frag.appendChild(star);
    }
    return frag;
  }

  /* ─────────────────────────────────────────
     BUILDERS
  ───────────────────────────────────────── */

  /** Populate hero text nodes */
  function buildHero() {
    var line1 = document.getElementById('hero-title-line1');
    var gradient = document.getElementById('hero-title-gradient');
    var subtitle = document.getElementById('hero-subtitle');
    var navBrand = document.getElementById('nav-brand-name');

    if (navBrand) navBrand.textContent = COURSE_DATA.BRAND_NAME;

    if (line1)    line1.textContent    = 'Expand Your Skills,';
    if (gradient) gradient.textContent = 'Shape Your Future.';
    if (subtitle) subtitle.textContent =
      'Expert-led courses in Development, Design, Health, Marketing and more. ' +
      'Learn at your own pace with lifetime access and dedicated support.';
  }

  /** Build stats bar */
  function buildStats() {
    var container = document.getElementById('stats-bar');
    if (!container) return;

    STATS.forEach(function (stat) {
      var item = el('div', 'stat-item');

      var icon = el('i', ['stat-icon', stat.icon]);
      icon.setAttribute('aria-hidden', 'true');

      var number = el('div', 'stat-number', stat.number);
      var label  = el('div', 'stat-label',  stat.label);

      item.appendChild(icon);
      item.appendChild(number);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  /** Build a single featured course card */
  function buildFeaturedCard(course) {
    /* wrapper col */
    var col = el('div', ['col-12', 'col-md-6', 'col-lg-4']);

    /* card */
    var card = el('div', 'featured-card');

    /* image */
    var img = document.createElement('img');
    img.className = 'featured-card-img';
    img.alt = course.title;
    img.loading = 'lazy';
    img.src = './assets/img/' + course.image;
    card.appendChild(img);

    /* body */
    var body = el('div', 'featured-card-body');

    /* category */
    var cat = el('div', 'featured-card-category', course.category);
    body.appendChild(cat);

    /* title */
    var title = el('h3', 'featured-card-title', course.title);
    body.appendChild(title);

    /* description */
    var desc = el('p', 'featured-card-desc', course.description);
    body.appendChild(desc);

    /* meta row */
    var meta = el('div', 'featured-card-meta');

    /* stars */
    var starsWrap = el('div', 'featured-stars');
    starsWrap.setAttribute('aria-label', 'Rating: ' + course.rating + ' out of 5');
    starsWrap.appendChild(buildStarFragment(course.rating));
    meta.appendChild(starsWrap);

    /* lessons */
    var lessonsItem = el('span', 'featured-meta-item');
    var lessonsIcon = el('i', ['bi', 'bi-play-circle']);
    lessonsIcon.setAttribute('aria-hidden', 'true');
    var lessonsText = document.createTextNode(' ' + course.lessons + ' lessons');
    lessonsItem.appendChild(lessonsIcon);
    lessonsItem.appendChild(lessonsText);
    meta.appendChild(lessonsItem);

    /* level */
    var levelItem = el('span', 'featured-meta-item');
    var levelIcon = el('i', ['bi', 'bi-bar-chart-fill']);
    levelIcon.setAttribute('aria-hidden', 'true');
    var levelText = document.createTextNode(' ' + course.level);
    levelItem.appendChild(levelIcon);
    levelItem.appendChild(levelText);
    meta.appendChild(levelItem);

    body.appendChild(meta);

    /* footer: price + button */
    var footer = el('div', 'featured-card-footer');

    var priceEl = el('span');
    priceEl.className = 'featured-card-price' +
      (course.price === 0 ? ' featured-card-price--free' : '');
    priceEl.textContent = formatPrice(course.price);
    footer.appendChild(priceEl);

    var btn = document.createElement('a');
    btn.className = 'featured-card-btn';
    btn.href = buildCourseUrl(course.id);
    btn.textContent = 'View Course';
    footer.appendChild(btn);

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);

    return col;
  }

  /** Build featured courses grid */
  function buildFeaturedCourses() {
    var grid = document.getElementById('featured-courses-grid');
    if (!grid) return;

    var courses = getFeaturedCourses();
    var frag = document.createDocumentFragment();
    courses.forEach(function (course) {
      frag.appendChild(buildFeaturedCard(course));
    });
    grid.appendChild(frag);
  }

  /** Build a single category card */
  function buildCategoryCard(name, count, colorKey) {
    var colClass = 'col-6 col-sm-4 col-md-3 col-lg-2';
    var colClasses = colClass.split(' ');
    var col = el('div', colClasses);

    var anchor = document.createElement('a');
    anchor.className = 'category-card category-card--' + colorKey;
    anchor.href = buildCatalogUrl(name);
    anchor.setAttribute('aria-label', name + ' — ' + count + ' courses');

    /* icon */
    var iconWrap = el('div', ['category-icon', 'category-icon--' + colorKey]);
    var iconEl = el('i', ['bi', CATEGORY_ICONS[name] || 'bi-bookmark-fill']);
    iconEl.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(iconEl);
    anchor.appendChild(iconWrap);

    /* name */
    var nameEl = el('span', 'category-name', name);
    anchor.appendChild(nameEl);

    /* count */
    var countEl = el('span', 'category-count',
      count === 1 ? '1 course' : count + ' courses');
    anchor.appendChild(countEl);

    col.appendChild(anchor);
    return col;
  }

  /** Build categories grid */
  function buildCategories() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;

    var catMap = getCategoriesWithCount();
    var frag = document.createDocumentFragment();

    Object.keys(catMap).forEach(function (name) {
      var count    = catMap[name];
      var catInfo  = COURSE_DATA.categories[name];
      var colorKey = catInfo ? catInfo.color : 'emerald';
      frag.appendChild(buildCategoryCard(name, count, colorKey));
    });

    grid.appendChild(frag);
  }

  /** Build footer categories list */
  function buildFooterCategories() {
    var list = document.getElementById('footer-categories');
    if (!list) return;

    var catMap = getCategoriesWithCount();
    var frag   = document.createDocumentFragment();

    Object.keys(catMap).forEach(function (name) {
      var li = el('li');
      var a  = document.createElement('a');
      a.href = buildCatalogUrl(name);
      a.textContent = name;
      li.appendChild(a);
      frag.appendChild(li);
    });

    list.appendChild(frag);
  }

  /** Set WhatsApp links */
  function buildWhatsAppLinks() {
    var phone   = COURSE_DATA.WHATSAPP_NUMBER;
    var message = 'Hello! I have a question about your courses.';
    var url     = buildWhatsAppUrl(phone, message);

    var ctaBtn    = document.getElementById('cta-whatsapp-btn');
    var footerBtn = document.getElementById('footer-whatsapp-link');

    if (ctaBtn) {
      ctaBtn.href = url;
    }
    if (footerBtn) {
      footerBtn.href = url;
    }
  }

  /** Build footer brand + copyright */
  function buildFooter() {
    var brandEl = document.getElementById('footer-brand-name');
    var copyrEl = document.getElementById('footer-copyright');

    if (brandEl) brandEl.textContent = COURSE_DATA.BRAND_NAME;
    if (copyrEl) {
      copyrEl.textContent =
        '© ' + new Date().getFullYear() + ' ' + COURSE_DATA.BRAND_NAME + '. All rights reserved.';
    }
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
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
