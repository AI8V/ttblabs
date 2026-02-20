'use strict';

/**
 * course-details-app.js — Course Details Page Logic
 *
 * التغيير الوحيد عن النسخة السابقة:
 *   - الكورسات المدفوعة: زرار "Access Course" بيروح لـ /course/paid/:courseId
 *   - الـ Worker هو اللي يتحقق من الـ cookie ويعمل redirect للـ Drive URL
 *   - مفيش modal، مفيش /api/course-access، مفيش Drive URL في الـ frontend
 *   - الكورسات المجانية: زرار "Start Learning Now" بيفتح driveUrl مباشرة (مش بيتغير)
 */

(function () {

  var U    = window.Utils;
  var DATA = window.COURSE_DATA;

  if (!U || !DATA) {
    console.error('course-details-app: Utils or COURSE_DATA missing.');
    return;
  }

  var RS = window.RatingSystem || null;

  /* ── Constants ── */

  var BRAND_NAME = DATA.BRAND_NAME || 'Ai8V';
  var DOMAIN     = DATA.DOMAIN     || 'ttblabs.com';

  /**
   * Returns the WhatsApp number for a course.
   * Falls back to platform default if teacherPhone is missing.
   * @param {object} course
   * @returns {string}
   */
  function getWhatsApp(course) {
    return (course.teacherPhone && String(course.teacherPhone).trim())
      ? String(course.teacherPhone).trim()
      : (DATA.WHATSAPP_NUMBER || '1234567890');
  }

  /* ── Course Lookup ── */

  function getCourseIdFromURL() {
    var params  = new URLSearchParams(window.location.search);
    var raw     = params.get('id');
    if (!raw) return null;
    var trimmed = raw.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) return null;
    var id = parseInt(trimmed, 10);
    return id >= 1 ? id : null;
  }

  function findCourse(id) {
    for (var i = 0; i < DATA.courses.length; i++) {
      if (DATA.courses[i].id === id) return DATA.courses[i];
    }
    return null;
  }

  /* ── Meta ── */

  function updateMeta(course) {
    document.title = course.title + ' | ' + BRAND_NAME;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', course.description);
    _setMetaProperty('og:title',       course.title + ' | ' + BRAND_NAME);
    _setMetaProperty('og:description', course.description);
    _setMetaProperty('og:type',        'website');
    _setMetaProperty('og:url',         window.location.href);
    _setMetaProperty('og:image',
      window.location.origin + '/assets/img/' + course.image);
  }

  function _setMetaProperty(property, content) {
    var el = document.querySelector('meta[property="' + property + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  /* ── JSON-LD ── */

  function buildSchema(course) {
    var schemas = [];

    schemas.push({
      '@context':   'https://schema.org',
      '@type':      'Course',
      'name':       course.title,
      'description': course.description,
      'url':        window.location.href,
      'provider': {
        '@type':  'Organization',
        'name':   BRAND_NAME,
        'sameAs': 'https://' + DOMAIN
      },
      'instructor': {
        '@type': 'Person',
        'name':  course.instructor
      },
      'offers': {
        '@type':         'Offer',
        'price':         course.price.toFixed(2),
        'priceCurrency': 'EGP',
        'availability':  'https://schema.org/InStock'
      }
    });

    schemas.push({
      '@context': 'https://schema.org',
      '@type':    'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1,
          'name': 'Home',    'item': window.location.origin + '/' },
        { '@type': 'ListItem', 'position': 2,
          'name': 'Courses', 'item': window.location.origin + '/course/' },
        { '@type': 'ListItem', 'position': 3,
          'name': course.title, 'item': window.location.href }
      ]
    });

    if (course.faq && course.faq.length > 0) {
      schemas.push({
        '@context':   'https://schema.org',
        '@type':      'FAQPage',
        'mainEntity': course.faq.map(function (item) {
          return {
            '@type': 'Question',
            'name':  item.question,
            'acceptedAnswer': { '@type': 'Answer', 'text': item.answer }
          };
        })
      });
    }

    schemas.forEach(function (schema, idx) {
      var el       = document.createElement('script');
      el.type      = 'application/ld+json';
      el.id        = 'jsonld-details-' + idx;
      el.textContent = JSON.stringify(schema);
      document.head.appendChild(el);
    });
  }

  function addRatingToSchema(average, count) {
    var el = document.getElementById('jsonld-details-0');
    if (!el) return;
    try {
      var schema = JSON.parse(el.textContent);
      schema.aggregateRating = {
        '@type':       'AggregateRating',
        'ratingValue': average.toFixed(1),
        'bestRating':  '5',
        'ratingCount': String(count)
      };
      el.textContent = JSON.stringify(schema);
    } catch (e) {}
  }

  /* ── WhatsApp Link ── */

  function buildWhatsAppLink(course) {
    var phone   = getWhatsApp(course);
    var price   = course.price > 0
      ? 'EGP ' + course.price.toFixed(2)
      : 'Free';
    var message = 'Hello, I want to purchase the course "' +
                  course.title + '" — Price: ' + price;
    return 'https://wa.me/' + phone +
           '?text=' + encodeURIComponent(message);
  }

  /* ── Error Page ── */

  function renderError(container) {
    document.title = 'Course Not Found | ' + BRAND_NAME;
    container.appendChild(
      U.el('div', { className: 'error-container' }, [
        U.el('i',  { className: 'bi bi-exclamation-triangle error-icon',
                     aria: { hidden: 'true' } }),
        U.el('h1', { className: 'error-title',
                     textContent: 'Course Not Found' }),
        U.el('p',  { className: 'error-text',
                     textContent: 'The course you are looking for does not exist.' }),
        U.el('a',  { className: 'error-btn', href: '../index.html' }, [
          U.el('i', { className: 'bi bi-arrow-left',
                      aria: { hidden: 'true' } }),
          'Browse Courses'
        ])
      ])
    );
  }

  /* ── Breadcrumb ── */

  function buildBreadcrumb(course) {
    var ol = U.el('ol', { className: 'breadcrumb' });

    var li1 = U.el('li', { className: 'breadcrumb-item' });
    li1.appendChild(U.el('a', {
      href: '../../index.html', textContent: 'Home'
    }));
    ol.appendChild(li1);

    var li2 = U.el('li', { className: 'breadcrumb-item' });
    li2.appendChild(U.el('a', {
      href: '../index.html', textContent: 'Courses'
    }));
    ol.appendChild(li2);

    var li3 = U.el('li', {
      className: 'breadcrumb-item active',
      aria:      { current: 'page' }
    });
    li3.appendChild(U.el('span', { textContent: course.title }));
    ol.appendChild(li3);

    return U.el('nav', {
      className: 'breadcrumb-nav',
      aria:      { label: 'Breadcrumb' }
    }, [ol]);
  }

  /* ── Header ── */

  function buildHeader(course) {
    return U.el('header', { className: 'details-header' }, [
      U.el('div', { className: 'page-container' }, [
        U.el('a', { className: 'back-link', href: '../index.html' }, [
          U.el('i', { className: 'bi bi-arrow-left',
                      aria: { hidden: 'true' } }),
          'Back to Courses'
        ]),
        buildBreadcrumb(course),
        U.el('h1', { className: 'page-title', textContent: course.title })
      ])
    ]);
  }

  /* ── Learning Objectives ── */

  function buildObjectives(course) {
    if (!course.learningObjectives || !course.learningObjectives.length) {
      return null;
    }

    var list = U.el('ul', { className: 'objectives-list' });
    course.learningObjectives.forEach(function (obj) {
      list.appendChild(U.el('li', null, [
        U.el('i', { className: 'bi bi-check-circle-fill obj-icon',
                    aria: { hidden: 'true' } }),
        U.el('span', { textContent: obj })
      ]));
    });

    return U.el('section', {
      className: 'details-section',
      aria:      { label: 'What you will learn' }
    }, [
      U.el('h2', { className: 'details-section-title' }, [
        U.el('i', { className: 'bi bi-lightbulb',
                    aria: { hidden: 'true' } }),
        "What You'll Learn"
      ]),
      list
    ]);
  }

  /* ── Curriculum ── */

  function buildCurriculum(course) {
    if (!course.curriculum || !course.curriculum.length) return null;

    var totalLessons     = 0;
    var totalDurationSec = 0;

    course.curriculum.forEach(function (section) {
      if (!section.lessons) return;
      totalLessons += section.lessons.length;
      section.lessons.forEach(function (lesson) {
        if (!lesson.duration) return;
        var parts = lesson.duration.split(':');
        totalDurationSec +=
          (parseInt(parts[0], 10) || 0) * 60 +
          (parseInt(parts[1], 10) || 0);
      });
    });

    var totalHours   = Math.floor(totalDurationSec / 3600);
    var totalMins    = Math.ceil((totalDurationSec % 3600) / 60);
    var durationText = (totalHours > 0 ? totalHours + 'h ' : '') +
                       totalMins + 'm total';

    var summaryLine = U.el('p', {
      className: 'mb-3',
      style: { color: 'var(--text-muted)', fontSize: '0.85rem' },
      textContent: course.curriculum.length + ' sections • ' +
                   totalLessons + ' lessons • ' + durationText
    });

    var accordion = U.el('div', {
      className: 'accordion curriculum-accordion',
      id:        'curriculum-accordion'
    });

    course.curriculum.forEach(function (section, sIdx) {
      var headerId = 'curr-head-' + sIdx;
      var bodyId   = 'curr-body-' + sIdx;

      var sectionLessons = section.lessons ? section.lessons.length : 0;
      var sectionDurSec  = 0;
      if (section.lessons) {
        section.lessons.forEach(function (l) {
          if (!l.duration) return;
          var p = l.duration.split(':');
          sectionDurSec +=
            (parseInt(p[0], 10) || 0) * 60 +
            (parseInt(p[1], 10) || 0);
        });
      }
      var sectionDurMin = Math.ceil(sectionDurSec / 60);

      var btn = U.el('button', {
        className: 'accordion-button' + (sIdx === 0 ? '' : ' collapsed'),
        type:      'button',
        dataset:   { bsToggle: 'collapse', bsTarget: '#' + bodyId },
        aria:      {
          expanded: sIdx === 0 ? 'true' : 'false',
          controls: bodyId
        }
      });
      btn.appendChild(U.el('span', { textContent: section.title }));
      btn.appendChild(U.el('span', {
        className:   'curriculum-section-meta',
        textContent: sectionLessons + ' lessons • ' + sectionDurMin + ' min'
      }));

      var header = U.el('h2', {
        className: 'accordion-header',
        id:        headerId
      });
      header.appendChild(btn);

      var lessonList = U.el('ul', { className: 'lesson-list' });

      if (section.lessons) {
        section.lessons.forEach(function (lesson) {
          var iconClass = lesson.preview
            ? 'bi bi-play-circle-fill'
            : 'bi bi-lock-fill';

          var metaEl = U.el('div', { className: 'lesson-meta' });
          if (lesson.duration) {
            metaEl.appendChild(U.el('span', {
              className:   'lesson-duration',
              textContent: lesson.duration
            }));
          }
          if (lesson.preview) {
            metaEl.appendChild(U.el('span', {
              className:   'lesson-preview-badge',
              textContent: 'Preview'
            }));
          }

          lessonList.appendChild(U.el('li', { className: 'lesson-item' }, [
            U.el('i',    { className: iconClass + ' lesson-icon',
                           aria: { hidden: 'true' } }),
            U.el('span', { className: 'lesson-title',
                           textContent: lesson.title }),
            metaEl
          ]));
        });
      }

      var bodyContent = U.el('div', {
        className: 'accordion-collapse collapse' +
                   (sIdx === 0 ? ' show' : ''),
        id:        bodyId,
        aria:      { labelledby: headerId },
        dataset:   { bsParent: '#curriculum-accordion' }
      });
      bodyContent.appendChild(
        U.el('div', { className: 'accordion-body' }, [lessonList])
      );

      var item = U.el('div', { className: 'accordion-item' });
      item.appendChild(header);
      item.appendChild(bodyContent);
      accordion.appendChild(item);
    });

    return U.el('section', {
      className: 'details-section',
      aria:      { label: 'Course curriculum' }
    }, [
      U.el('h2', { className: 'details-section-title' }, [
        U.el('i', { className: 'bi bi-journal-text',
                    aria: { hidden: 'true' } }),
        'Curriculum'
      ]),
      summaryLine,
      accordion
    ]);
  }

  /* ── FAQ ── */

  function buildFAQ(course) {
    if (!course.faq || !course.faq.length) return null;

    var accordion = U.el('div', {
      className: 'accordion faq-accordion',
      id:        'faq-accordion'
    });

    course.faq.forEach(function (item, idx) {
      var headerId = 'faq-head-' + idx;
      var bodyId   = 'faq-body-' + idx;

      var btn = U.el('button', {
        className:   'accordion-button collapsed',
        type:        'button',
        textContent: item.question,
        dataset:     { bsToggle: 'collapse', bsTarget: '#' + bodyId },
        aria:        { expanded: 'false', controls: bodyId }
      });

      var hdr = U.el('h3', {
        className: 'accordion-header',
        id:        headerId
      });
      hdr.appendChild(btn);

      var body = U.el('div', {
        className: 'accordion-collapse collapse',
        id:        bodyId,
        aria:      { labelledby: headerId },
        dataset:   { bsParent: '#faq-accordion' }
      });
      body.appendChild(U.el('div', {
        className:   'accordion-body',
        textContent: item.answer
      }));

      var accItem = U.el('div', { className: 'accordion-item' });
      accItem.appendChild(hdr);
      accItem.appendChild(body);
      accordion.appendChild(accItem);
    });

    return U.el('section', {
      className: 'details-section',
      aria:      { label: 'Frequently asked questions' }
    }, [
      U.el('h2', { className: 'details-section-title' }, [
        U.el('i', { className: 'bi bi-question-circle',
                    aria: { hidden: 'true' } }),
        'Frequently Asked Questions'
      ]),
      accordion
    ]);
  }

  /* ── Sidebar Card ── */

  /**
   * Builds the sticky sidebar card with price, action buttons, and meta.
   *
   * FREE  course → "Start Learning Now" → opens driveUrl directly
   * PAID  course → two buttons:
   *   1. "Buy Now" → WhatsApp link
   *   2. "Access Course" → /course/paid/:courseId
   *      Worker checks cookie:
   *        valid   → 302 redirect to Drive URL (from Worker secret)
   *        invalid → login page (email + password)
   *
   * The Drive URL for paid courses is NEVER in the frontend code.
   */
  function buildSidebarCard(course) {
    var img = U.el('img', {
      className: 'sidebar-course-img',
      src:       '../../assets/img/' + course.image,
      alt:       course.title,
      loading:   'eager',
      decoding:  'async'
    });

    var isFree    = parseFloat(course.price) === 0;
    var priceText = isFree
      ? 'Free'
      : 'EGP ' + parseFloat(course.price).toFixed(2);

    var priceEl = U.el('div', { className: 'price-display' }, [
      U.el('span', {
        className:   'price-current' + (isFree ? ' free' : ''),
        textContent: priceText
      })
    ]);

    var buttonsWrapper = U.el('div', { className: 'sidebar-buttons' });

    if (isFree) {
      // ── Free: open Drive URL directly ──
      var driveUrl = U.sanitizeUrl(course.driveUrl || '');
      buttonsWrapper.appendChild(
        U.el('a', {
          className: 'btn-buy',
          href:      driveUrl || '#',
          target:    driveUrl ? '_blank' : '_self',
          rel:       'noopener noreferrer',
          aria: {
            label: 'Start learning ' + course.title + ' for free'
          }
        }, [
          U.el('i', { className: 'bi bi-play-circle-fill',
                      aria: { hidden: 'true' } }),
          ' Start Learning Now'
        ])
      );

    } else {
      // ── Paid: Buy via WhatsApp ──
      var waLink = U.sanitizeUrl(buildWhatsAppLink(course));
      buttonsWrapper.appendChild(
        U.el('a', {
          className: 'btn-buy',
          href:      waLink,
          target:    '_blank',
          rel:       'noopener noreferrer',
          aria: {
            label: 'Buy ' + course.title +
                   ' for EGP ' + parseFloat(course.price).toFixed(2) +
                   ' via WhatsApp'
          }
        }, [
          U.el('i', { className: 'bi bi-whatsapp',
                      aria: { hidden: 'true' } }),
          ' Buy Now — EGP ' + parseFloat(course.price).toFixed(2)
        ])
      );

      // ── Paid: Access Course (already purchased) ──
      // Navigates to /course/paid/:id
      // Worker handles the rest — no Drive URL in frontend
      buttonsWrapper.appendChild(
        U.el('a', {
          className: 'btn-enter-course',
          href:      '/course/paid/' + course.id,
          aria: {
            label: 'Access course — sign in to enter'
          }
        }, [
          U.el('i', { className: 'bi bi-box-arrow-in-right',
                      aria: { hidden: 'true' } }),
          ' Already Purchased? Enter Course'
        ])
      );
    }

    // ── Meta list ──
    var metaList = U.el('ul', { className: 'course-meta-list' });

    metaList.appendChild(
      _buildMetaItem('bi-person-fill',    'Instructor', course.instructor)
    );
    metaList.appendChild(
      _buildMetaItem('bi-tag-fill',       'Category',   course.category)
    );
    metaList.appendChild(
      _buildMetaItem('bi-bar-chart-fill', 'Level',      course.level)
    );
    metaList.appendChild(
      _buildMetaItem('bi-people-fill',    'Students',
        U.formatNumber(course.students))
    );
    metaList.appendChild(
      _buildMetaItem('bi-book-fill',      'Lessons',    String(course.lessons))
    );

    // Rating meta item (updated after fetch)
    var ratingMetaValue = U.el('span', {
      className: 'meta-value',
      id:        'meta-rating-value'
    });
    var ratingInline = U.el('span', { className: 'meta-rating-inline' });
    if (RS) ratingInline.appendChild(RS.renderStars(course.rating, false));
    ratingInline.appendChild(U.el('span', {
      textContent: ' ' + (course.rating || 0).toFixed(1)
    }));
    ratingMetaValue.appendChild(ratingInline);

    metaList.appendChild(U.el('li', { className: 'course-meta-item' }, [
      U.el('span', { className: 'meta-label' }, [
        U.el('i', { className: 'bi bi-star-fill',
                    aria: { hidden: 'true' } }),
        'Rating'
      ]),
      ratingMetaValue
    ]));

    metaList.appendChild(
      _buildMetaItem('bi-calendar3', 'Updated', _formatDate(course.date))
    );

    var content = U.el('div', { className: 'sidebar-content' },
      [priceEl, buttonsWrapper, metaList]);

    return U.el('div', { className: 'sidebar-card' }, [img, content]);
  }

  function _buildMetaItem(icon, label, value) {
    return U.el('li', { className: 'course-meta-item' }, [
      U.el('span', { className: 'meta-label' }, [
        U.el('i', { className: 'bi ' + icon, aria: { hidden: 'true' } }),
        label
      ]),
      U.el('span', { className: 'meta-value', textContent: value })
    ]);
  }

  function _formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) { return dateStr; }
  }

  /* ── Rating Card ── */

  function buildRatingCard(course) {
    var card = U.el('div', { className: 'rating-card', id: 'rating-card' });

    card.appendChild(U.el('h3', {
      className:   'rating-card-title',
      textContent: 'Rate This Course'
    }));
    card.appendChild(U.el('p', {
      className:   'rating-card-subtitle',
      textContent: 'Share your experience with other students'
    }));

    var bigNumber = U.el('div', {
      className:   'rating-big-number',
      id:          'rating-big-number',
      textContent: '—'
    });
    card.appendChild(bigNumber);

    var displayStarsContainer = U.el('div', {
      id: 'rating-display-stars'
    });
    if (RS) {
      displayStarsContainer.appendChild(RS.renderStars(0, false));
    }
    card.appendChild(displayStarsContainer);

    card.appendChild(U.el('p', {
      className:   'rating-count',
      id:          'rating-count-text',
      textContent: 'Loading ratings...'
    }));

    var interactiveContainer = U.el('div', {
      id: 'rating-interactive-stars'
    });
    if (RS) {
      var interactiveStars = RS.renderStars(0, true);
      interactiveContainer.appendChild(interactiveStars);
      RS.initializeStarEvents(interactiveStars, function (value) {
        _handleRatingSubmit(course.id, value);
      });
    } else {
      interactiveContainer.appendChild(U.el('p', {
        className:   'rating-status',
        textContent: 'Rating system not available'
      }));
    }
    card.appendChild(interactiveContainer);

    card.appendChild(U.el('p', {
      className: 'rating-status',
      id:        'rating-status-msg'
    }));

    return card;
  }

  function _handleRatingSubmit(courseId, value) {
    var statusEl             = U.qs('#rating-status-msg');
    var interactiveContainer = U.qs(
      '#rating-interactive-stars .stars-interactive'
    );

    if (statusEl) {
      statusEl.textContent = 'Submitting your rating...';
      statusEl.className   = 'rating-status';
    }

    if (RS && interactiveContainer) RS.disableStars(interactiveContainer);

    RS.submitRating(courseId, value).then(function (result) {
      if (result.status === 'success') {
        if (statusEl) {
          statusEl.textContent = 'Thank you for your rating!';
          statusEl.className   = 'rating-status success';
        }
        U.showToast('Rating submitted successfully!', 'success');
        U.announce('Rating submitted successfully');
        _loadAndDisplayRatings(courseId);
      } else {
        if (statusEl) {
          statusEl.textContent =
            result.message || 'Failed to submit. Please try again.';
          statusEl.className = 'rating-status error';
        }
        if (interactiveContainer) {
          interactiveContainer.classList.remove('stars-disabled');
          interactiveContainer
            .querySelectorAll('.star-btn')
            .forEach(function (s) { s.disabled = false; });
          var firstStar =
            interactiveContainer.querySelector('.star-btn');
          if (firstStar) firstStar.setAttribute('tabindex', '0');
        }
      }
    });
  }

  function _loadAndDisplayRatings(courseId) {
    if (!RS) return;
    RS.fetchRatings(courseId).then(function (data) {
      var avg   = data.average || 0;
      var count = data.count   || 0;

      var bigNum = U.qs('#rating-big-number');
      if (bigNum) bigNum.textContent = avg > 0 ? avg.toFixed(1) : '—';

      var displayContainer = U.qs('#rating-display-stars');
      if (displayContainer && RS) {
        clearElement(displayContainer);
        displayContainer.appendChild(RS.renderStars(avg, false));
      }

      var countText = U.qs('#rating-count-text');
      if (countText) {
        countText.textContent = count > 0
          ? U.formatNumber(count) + ' rating' + (count !== 1 ? 's' : '')
          : 'No ratings yet — be the first!';
      }

      var metaRating = U.qs('#meta-rating-value');
      if (metaRating && RS) {
        clearElement(metaRating);
        var inline = U.el('span', { className: 'meta-rating-inline' });
        inline.appendChild(RS.renderStars(avg, false));
        inline.appendChild(U.el('span', {
          textContent: ' ' + (avg > 0 ? avg.toFixed(1) : '—')
        }));
        metaRating.appendChild(inline);
      }

      if (count > 0 && !data.error) addRatingToSchema(avg, count);
    });
  }

  /* ── Utilities ── */

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /* ── Page Builder ── */

  function buildPage(course, container) {
    updateMeta(course);
    buildSchema(course);

    var frag          = document.createDocumentFragment();
    var mainContainer = U.el('div', { className: 'page-container' });
    var row           = U.el('div', { className: 'row g-4' });
    var leftCol       = U.el('div', { className: 'col-lg-8' });
    var rightCol      = U.el('div', { className: 'col-lg-4' });
    var sidebar       = U.el('div', { className: 'details-sidebar' });

    var objectives = buildObjectives(course);
    if (objectives) leftCol.appendChild(objectives);

    var curriculum = buildCurriculum(course);
    if (curriculum) leftCol.appendChild(curriculum);

    var faq = buildFAQ(course);
    if (faq) leftCol.appendChild(faq);

    sidebar.appendChild(buildSidebarCard(course));
    sidebar.appendChild(buildRatingCard(course));
    rightCol.appendChild(sidebar);

    row.appendChild(leftCol);
    row.appendChild(rightCol);
    mainContainer.appendChild(row);

    frag.appendChild(buildHeader(course));
    frag.appendChild(mainContainer);
    container.appendChild(frag);

    _loadAndDisplayRatings(course.id);
  }

  function injectSEO(course) {
  var brand   = COURSE_DATA.BRAND_NAME;
  var domain  = COURSE_DATA.DOMAIN;
  var meta    = COURSE_DATA.META;
  var base    = 'https://' + domain;
  var pageUrl = base + '/course/course-details/?id=' + course.id;

  var pageTitle = course.title + ' — ' + brand;
  var pageDesc  = course.description + ' ' + meta.descriptionShort;
  var pageImage = base + '/assets/img/' + course.image;

  document.title = pageTitle;

  // meta description
  var descEl = document.getElementById('page-desc');
  if (descEl) descEl.setAttribute('content', pageDesc);

  // canonical
  var canonEl = document.getElementById('page-canonical');
  if (canonEl) canonEl.setAttribute('href', pageUrl);

  // OG
  var ogMap = {
    'og-url':       pageUrl,
    'og-title':     pageTitle,
    'og-desc':      pageDesc,
    'og-image':     pageImage,
    'og-site-name': brand
  };
  Object.keys(ogMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('content', ogMap[id]);
  });

  // Twitter
  ['tw-title','tw-desc','tw-image'].forEach(function(id) {
    var val = id === 'tw-title' ? pageTitle
            : id === 'tw-desc'  ? pageDesc
            : pageImage;
    var el = document.getElementById(id);
    if (el) el.setAttribute('content', val);
  });

  // hreflang
  var hreflang = document.getElementById('hreflang-en');
  if (hreflang) hreflang.setAttribute('href', pageUrl);

  // JSON-LD — Course schema
  var schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': course.title,
    'description': course.description,
    'url': pageUrl,
    'provider': {
      '@type': 'Organization',
      'name': brand,
      'url': base
    },
    'educationalLevel': course.level,
    'inLanguage': 'en',
    'offers': {
      '@type': 'Offer',
      'price': course.price,
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'aggregateRating': course.rating > 0 ? {
      '@type': 'AggregateRating',
      'ratingValue': course.rating,
      'bestRating': 5,
      'worstRating': 1,
      'ratingCount': course.students
    } : undefined
  };

  // remove undefined keys
  Object.keys(schema).forEach(function(k) {
    if (schema[k] === undefined) delete schema[k];
  });

  var script = document.createElement('script');
  script.type        = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

  /* ── Init ── */

  function init() {
    var app      = U.qs('#app') || document.body;
    var courseId = getCourseIdFromURL();

    if (!courseId) { renderError(app); return; }

    var course = findCourse(courseId);
    if (!course) { renderError(app); return; }

    buildPage(course, app);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
