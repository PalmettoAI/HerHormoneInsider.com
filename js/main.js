/* Her Hormone Insider — Marlowe Bennett letters
   Vanilla JS, no dependencies. Loaded with `defer`. */

(function () {
  'use strict';

  var IG_DEEPLINK = 'instagram://user?username=HealthierLivingDaily';
  var IG_WEB_URL = 'https://instagram.com/HealthierLivingDaily';
  var PAGE_URL = window.location.href;
  var PAGE_TITLE = document.title;

  function trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  }

  function getScrollPercent() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  }

  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  // Slug pulled from canonical link (or empty string for non-letter pages)
  var canonicalEl = document.querySelector('link[rel="canonical"]');
  var slug = '';
  if (canonicalEl) {
    var match = canonicalEl.href.match(/\/letters\/([^\/]+?)(?:\/)?$/);
    if (match) slug = match[1];
  }

  // ==========================================================
  // 1. Mobile nav toggle
  // ==========================================================
  var navToggle = document.querySelector('.mobile-nav-toggle');
  var primaryNav = document.querySelector('.primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  // ==========================================================
  // 2. Sticky header — hide on scroll down, show on scroll up
  // ==========================================================
  var header = document.querySelector('.site-header');
  var lastScrollY = window.pageYOffset;

  if (header) {
    window.addEventListener('scroll', function () {
      var currentScrollY = window.pageYOffset;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // ==========================================================
  // 3. Scroll depth tracking
  // ==========================================================
  var scrollThresholds = [25, 50, 75, 100];
  var scrollFired = {};

  function checkScrollDepth() {
    if (!slug) return;
    var percent = getScrollPercent();
    scrollThresholds.forEach(function (threshold) {
      if (percent >= threshold && !scrollFired[threshold]) {
        scrollFired[threshold] = true;
        trackEvent('scroll_depth', {
          letter_slug: slug,
          depth_percent: threshold
        });
      }
    });
  }

  window.addEventListener('scroll', checkScrollDepth, { passive: true });

  // ==========================================================
  // 4. Read complete — P.S. visible
  // ==========================================================
  var postscript = document.querySelector('.postscript');
  var readCompleteFired = false;

  if (postscript && 'IntersectionObserver' in window && slug) {
    var psObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !readCompleteFired) {
          readCompleteFired = true;
          trackEvent('read_complete', { letter_slug: slug });
          psObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    psObserver.observe(postscript);
  }

  // ==========================================================
  // 5. Instagram follow CTA — deep link on mobile
  // ==========================================================
  var followLinks = document.querySelectorAll('a[data-track="follow_initiated"]');

  followLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var placement = link.getAttribute('data-placement') || 'unknown';

      trackEvent('follow_initiated', {
        letter_slug: slug,
        placement: placement
      });

      if (isMobile()) {
        e.preventDefault();
        var fallbackTimeout = setTimeout(function () {
          window.location.href = IG_WEB_URL;
        }, 600);

        document.addEventListener('visibilitychange', function onHide() {
          if (document.hidden) {
            clearTimeout(fallbackTimeout);
            document.removeEventListener('visibilitychange', onHide);
          }
        });

        window.location.href = IG_DEEPLINK;
      }
    });
  });

  // ==========================================================
  // 6. Share bar
  // ==========================================================
  var copyBtn = document.querySelector('.share-btn--copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var originalText = copyBtn.textContent;

      var done = function () {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(function () {
          copyBtn.textContent = originalText;
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(PAGE_URL).then(done);
      } else {
        var tempInput = document.createElement('input');
        tempInput.value = PAGE_URL;
        document.body.appendChild(tempInput);
        tempInput.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(tempInput);
        done();
      }

      trackEvent('share_initiated', {
        letter_slug: slug,
        channel: 'copy_link'
      });
    });
  }

  var nativeBtn = document.querySelector('.share-btn--native');
  if (nativeBtn) {
    if (navigator.share) {
      nativeBtn.addEventListener('click', function () {
        navigator.share({
          title: PAGE_TITLE,
          url: PAGE_URL
        }).then(function () {
          trackEvent('share_initiated', {
            letter_slug: slug,
            channel: 'native'
          });
        }).catch(function () { });
      });
    } else if (nativeBtn.parentElement) {
      nativeBtn.parentElement.style.display = 'none';
    }
  }

  document.querySelectorAll('.share-btn[data-channel]').forEach(function (btn) {
    if (btn.classList.contains('share-btn--copy') ||
        btn.classList.contains('share-btn--native')) {
      return;
    }
    btn.addEventListener('click', function () {
      trackEvent('share_initiated', {
        letter_slug: slug,
        channel: btn.getAttribute('data-channel')
      });
    });
  });

  // ==========================================================
  // 7. Lateral letter link tracking
  // ==========================================================
  document.querySelectorAll('a[data-track="lateral_click"]').forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('lateral_click', {
        from_slug: link.getAttribute('data-from') || slug,
        to_slug: link.getAttribute('data-to') || 'unknown'
      });
    });
  });

  // ==========================================================
  // 8. CTA card viewport tracking
  // ==========================================================
  var ctaCard = document.querySelector('.cta-card--instagram');
  if (ctaCard && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          trackEvent('follow_cta_view', {
            letter_slug: slug,
            placement: 'primary_cta'
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(ctaCard);
  }

  // ==========================================================
  // 9. Letter view event (fires on every letter page)
  // ==========================================================
  if (slug) {
    var bodyEl = document.body;
    trackEvent('letter_view', {
      letter_slug: slug,
      keyword_target: bodyEl.getAttribute('data-keyword') || '',
      cluster: bodyEl.getAttribute('data-cluster') || '',
      awareness_stage: bodyEl.getAttribute('data-awareness') || '',
      letter_type: bodyEl.getAttribute('data-letter-type') || ''
    });
  }
})();
