/* ============================================================
   BURNFIT GYM - JAVASCRIPT (script.js)
   Vanilla JS for navigation, live timing status, and carousel
   ============================================================ */

function init() {
  document.documentElement.classList.add('js-ready');
  try { initStickyHeader(); } catch (err) { console.error('initStickyHeader error:', err); }
  try { initMobileNav(); } catch (err) { console.error('initMobileNav error:', err); }
  try { initActiveNavSpy(); } catch (err) { console.error('initActiveNavSpy error:', err); }
  try { initLiveHoursStatus(); } catch (err) { console.error('initLiveHoursStatus error:', err); }
  try { initReviewCarousel(); } catch (err) { console.error('initReviewCarousel error:', err); }
  try { initScrollAnimations(); } catch (err) { console.error('initScrollAnimations error:', err); }
  try { initBackToTop(); } catch (err) { console.error('initBackToTop error:', err); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ============================================================
   1. STICKY HEADER
   ============================================================ */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ============================================================
   2. MOBILE NAVIGATION
   ============================================================ */
function initMobileNav() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = (open) => {
    const shouldOpen = typeof open === 'boolean' ? open : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', shouldOpen);
    toggleBtn.classList.toggle('open', shouldOpen);
    toggleBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    
    // Prevent body scroll when mobile menu is open
    document.body.style.overflow = shouldOpen && window.innerWidth <= 768 ? 'hidden' : '';
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu on nav link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close menu if user clicks outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Reset overflow on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/* ============================================================
   3. ACTIVE NAV LINK SPY ON SCROLL
   ============================================================ */
function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const onScroll = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   4. DYNAMIC "OPEN NOW" TIMINGS SCRIPT
   Hours:
   - Monday to Saturday: 6:00 AM – 10:00 PM (06:00 - 22:00)
   - Sunday: 9:00 AM – 5:00 PM (09:00 - 17:00)
   ============================================================ */
function initLiveHoursStatus() {
  const badgeElement = document.getElementById('live-status-badge');
  const messageElement = document.getElementById('live-status-message');
  const monSatCard = document.getElementById('schedule-card-monsat');
  const sunCard = document.getElementById('schedule-card-sun');

  if (!badgeElement) return;

  function updateStatus() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let isOpen = false;
    let message = '';
    const isSunday = (currentDay === 0);

    // Opening boundaries in minutes
    const monSatOpen = 6 * 60;   // 06:00 AM = 360
    const monSatClose = 22 * 60; // 10:00 PM = 1320
    const sunOpen = 9 * 60;      // 09:00 AM = 540
    const sunClose = 17 * 60;    // 05:00 PM = 1020

    // Highlight current day card
    if (isSunday) {
      if (sunCard) sunCard.classList.add('is-today');
      if (monSatCard) monSatCard.classList.remove('is-today');
    } else {
      if (monSatCard) monSatCard.classList.add('is-today');
      if (sunCard) sunCard.classList.remove('is-today');
    }

    if (isSunday) {
      if (currentMinutes >= sunOpen && currentMinutes < sunClose) {
        isOpen = true;
        message = 'Open today until 5:00 PM. Drop in for Sunday fitness!';
      } else if (currentMinutes < sunOpen) {
        isOpen = false;
        message = 'Closed right now • Opens today at 9:00 AM';
      } else {
        isOpen = false;
        message = 'Closed for the day • Opens Monday at 6:00 AM';
      }
    } else {
      // Monday through Saturday
      if (currentMinutes >= monSatOpen && currentMinutes < monSatClose) {
        isOpen = true;
        message = 'Open today until 10:00 PM. Come crush your workout!';
      } else if (currentMinutes < monSatOpen) {
        isOpen = false;
        message = 'Closed right now • Opens today at 6:00 AM';
      } else {
        // After 10:00 PM
        const nextDayIsSunday = (currentDay === 6);
        const nextOpening = nextDayIsSunday ? 'Sunday at 9:00 AM' : 'tomorrow at 6:00 AM';
        isOpen = false;
        message = `Closed for the day • Opens ${nextOpening}`;
      }
    }

    if (isOpen) {
      badgeElement.className = 'status-live-badge open';
      badgeElement.innerHTML = '<span class="status-indicator-dot"></span> Open Now';
    } else {
      badgeElement.className = 'status-live-badge closed';
      badgeElement.innerHTML = '<span class="status-indicator-dot"></span> Closed';
    }

    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  updateStatus();
  // Check every 60 seconds to ensure live status stays accurate
  setInterval(updateStatus, 60000);
}

/* ============================================================
   5. TESTIMONIAL SLIDER / CAROUSEL
   Vanilla JS swipeable carousel with dots & arrows
   ============================================================ */
function initReviewCarousel() {
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dotsContainer = document.querySelector('.carousel-dots');

  if (!track || !slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayInterval = null;

  // Create dot indicators
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (idx === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to review ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlidePosition() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    // Update accessibility attributes
    slides.forEach((slide, idx) => {
      slide.setAttribute('aria-hidden', idx === currentIndex ? 'false' : 'true');
    });
  }

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateSlidePosition();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      restartAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      restartAutoplay();
    });
  }

  // Keyboard navigation when focused inside carousel
  const carouselContainer = document.querySelector('.reviews-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentIndex - 1);
        restartAutoplay();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentIndex + 1);
        restartAutoplay();
      }
    });
  }

  // Touch Swipe Handling for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  const viewport = document.querySelector('.carousel-viewport');

  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      restartAutoplay();
    }, { passive: true });
  }

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 45; // min px travel for swipe
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // swiped left -> next
        goToSlide(currentIndex + 1);
      } else {
        // swiped right -> prev
        goToSlide(currentIndex - 1);
      }
    }
  }

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 6000);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);
  }

  updateSlidePosition();
  startAutoplay();
}

/* ============================================================
   6. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
   ============================================================ */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  // Immediately activate hero elements so the top of the page is always instantly visible
  const heroReveals = document.querySelectorAll('#home .reveal, .hero-section .reveal');
  heroReveals.forEach(el => el.classList.add('active'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.05,
      rootMargin: '0px 0px 40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // Safety fallback: after 1.2s, ensure all remaining elements are visible
    setTimeout(() => {
      revealElements.forEach(el => el.classList.add('active'));
    }, 1200);
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('active'));
  }
}

/* ============================================================
   7. BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
