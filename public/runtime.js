document.addEventListener('DOMContentLoaded', () => {
  const AUTOPLAY_INTERVAL_MS = 4000;
  const MANUAL_PAUSE_MS = 15000;

  const STATUS_CLASSES = {
    sending: 'mt-4 text-center font-semibold text-gray-600',
    success: 'mt-4 text-center font-semibold text-green-500',
    error: 'mt-4 text-center font-semibold text-red-500',
  };

  function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu-panel a');
    const firstMobileMenuLink = mobileMenuLinks[0];

    function setMenuExpanded(expanded) {
      if (!menuBtn) {
        return;
      }

      menuBtn.setAttribute(
        'aria-expanded',
        expanded ? 'true' : 'false'
      );
    }

    function openMenu() {
      document.body.classList.add('menu-open');
      setMenuExpanded(true);

      if (firstMobileMenuLink) {
        firstMobileMenuLink.focus();
      }
    }

    function closeMenu() {
      const wasOpen = document.body.classList.contains('menu-open');

      document.body.classList.remove('menu-open');
      setMenuExpanded(false);

      if (wasOpen && menuBtn) {
        menuBtn.focus();
      }
    }

    if (menuBtn) {
      menuBtn.addEventListener('click', openMenu);
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', closeMenu);
    }

    mobileMenuLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (
        event.key !== 'Escape'
        || !document.body.classList.contains('menu-open')
      ) {
        return;
      }

      closeMenu();
    });

    setMenuExpanded(false);
  }

  function initAccordions() {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    function setAccordionExpanded(
      button,
      content,
      expanded
    ) {
      button.classList.toggle(
        'active',
        expanded
      );

      button.setAttribute(
        'aria-expanded',
        expanded ? 'true' : 'false'
      );

      content.setAttribute(
        'aria-hidden',
        expanded ? 'false' : 'true'
      );

      content.toggleAttribute(
        'inert',
        !expanded
      );
    }

    accordionButtons.forEach((button) => {
      const contentId = button.getAttribute(
        'aria-controls'
      );

      if (!contentId) {
        return;
      }

      const content = document.getElementById(
        contentId
      );

      if (!content) {
        return;
      }

      setAccordionExpanded(
        button,
        content,
        button.classList.contains('active')
      );

      button.addEventListener('click', () => {
        setAccordionExpanded(
          button,
          content,
          !button.classList.contains('active')
        );
      });
    });
  }

  function initTabs() {
    const tabComponents = document.querySelectorAll('.tabs-component');

    tabComponents.forEach((tabContainer) => {
      const tabButtons = Array.from(
        tabContainer.querySelectorAll('.tab-button')
      );

      const tabContents = Array.from(
        tabContainer.querySelectorAll('.tab-content')
      );

      function activateTab(button, shouldFocus = false) {
        const tabId = button.dataset.tab;

        if (!tabId) {
          return;
        }

        const activeTabContent = tabContainer.querySelector(`#${tabId}`);

        if (!activeTabContent) {
          return;
        }

        tabButtons.forEach((item) => {
          const selected = item === button;

          item.classList.toggle(
            'active',
            selected
          );

          item.setAttribute(
            'aria-selected',
            selected ? 'true' : 'false'
          );

          item.setAttribute(
            'tabindex',
            selected ? '0' : '-1'
          );
        });

        tabContents.forEach((content) => {
          content.classList.toggle(
            'active',
            content === activeTabContent
          );
        });

        if (shouldFocus) {
          button.focus();
        }
      }

      tabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          activateTab(button);
        });

        button.addEventListener('keydown', (event) => {
          let targetIndex = null;

          if (event.key === 'ArrowRight') {
            targetIndex = (
              index + 1
            ) % tabButtons.length;
          } else if (event.key === 'ArrowLeft') {
            targetIndex = (
              index - 1 + tabButtons.length
            ) % tabButtons.length;
          } else if (event.key === 'Home') {
            targetIndex = 0;
          } else if (event.key === 'End') {
            targetIndex = tabButtons.length - 1;
          } else {
            return;
          }

          event.preventDefault();

          activateTab(
            tabButtons[targetIndex],
            true
          );
        });
      });
    });
  }

  function initGalleries() {
    const galleryContainers = document.querySelectorAll('.gallery-container');
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    galleryContainers.forEach((galleryContainer) => {
      const slides = Array.from(
        galleryContainer.querySelectorAll('.gallery-slide')
      );

      const dotsContainer = galleryContainer.nextElementSibling;

      if (
        !dotsContainer
        || !dotsContainer.classList.contains('gallery-dots')
      ) {
        return;
      }

      const dots = Array.from(
        dotsContainer.querySelectorAll('.gallery-dot')
      );

      if (
        slides.length === 0
        || dots.length === 0
        || slides.length !== dots.length
      ) {
        return;
      }

      let currentIndex = 0;
      let intervalId = null;
      let resumeTimeoutId = null;

      function showSlide(index) {
        if (!slides[index] || !dots[index]) {
          return;
        }

        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === index;

          slide.classList.toggle(
            'opacity-100',
            active
          );

          slide.classList.toggle(
            'opacity-0',
            !active
          );

          slide.setAttribute(
            'aria-hidden',
            active ? 'false' : 'true'
          );

          slide.toggleAttribute(
            'inert',
            !active
          );
        });

        dots.forEach((dot, dotIndex) => {
          const active = dotIndex === index;

          dot.classList.toggle(
            'active',
            active
          );

          if (active) {
            dot.setAttribute(
              'aria-current',
              'true'
            );
          } else {
            dot.removeAttribute(
              'aria-current'
            );
          }
        });

        currentIndex = index;
      }

      function nextSlide() {
        const nextIndex = (
          currentIndex + 1
        ) % slides.length;

        showSlide(nextIndex);
      }

      function stopAutoplay() {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }

      }

      function startAutoplay() {
        stopAutoplay();

        intervalId = setInterval(
          nextSlide,
          AUTOPLAY_INTERVAL_MS
        );

      }

      function scheduleAutoplayResume() {
        if (resumeTimeoutId !== null) {
          clearTimeout(resumeTimeoutId);
          resumeTimeoutId = null;
        }

        if (prefersReducedMotion) {
          return;
        }

        resumeTimeoutId = setTimeout(
          () => {
            resumeTimeoutId = null;
            startAutoplay();
          },
          MANUAL_PAUSE_MS
        );
      }

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
          stopAutoplay();
          scheduleAutoplayResume();
        });
      });

      showSlide(0);
      if (!prefersReducedMotion) {
        startAutoplay();
      }
    });
  }

  function initInternalHotelLinks() {
    const hotelLinks = document.querySelectorAll('.internal-hotel-link');

    hotelLinks.forEach((link) => {
      link.addEventListener('click', function handleHotelLink(event) {
        event.preventDefault();

        const targetId = this.getAttribute('href');

        if (!targetId) {
          return;
        }

        const targetElement = document.querySelector(targetId);

        if (!targetElement) {
          return;
        }

        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        const accordionButton = targetElement.querySelector(
          '.accordion-button',
        );

        if (
          accordionButton
          && !accordionButton.classList.contains('active')
        ) {
          accordionButton.click();
        }
      });
    });
  }

  function initDeferredVideos() {
    const deferredVideos = document.querySelectorAll(
      'video[data-video-loading="viewport"]',
    );

    if (deferredVideos.length === 0) {
      return;
    }

    function activateVideo(video) {
      if (
        video.dataset.videoLoading !== 'viewport'
      ) {
        return;
      }

      const deferredSources = video.querySelectorAll(
        'source[data-src]',
      );

      deferredSources.forEach((source) => {
        const src = source.dataset.src;

        if (!src) {
          return;
        }

        source.setAttribute('src', src);
        source.removeAttribute('data-src');
      });

      video.removeAttribute(
        'data-video-loading',
      );

      video.load();

      if (video.autoplay) {
        const playPromise = video.play();

        if (
          playPromise
          && typeof playPromise.catch === 'function'
        ) {
          playPromise.catch(() => {});
        }
      }
    }

    if (!('IntersectionObserver' in window)) {
      deferredVideos.forEach(
        activateVideo,
      );

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          activateVideo(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '600px 0px',
      },
    );

    deferredVideos.forEach((video) => {
      observer.observe(video);
    });
  }

  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (!contactForm) {
      return;
    }

    const messages = {
      emptyForm: contactForm.dataset.messageEmptyForm || '',
      sending: contactForm.dataset.messageSending || '',
      success: contactForm.dataset.messageSuccess || '',
      submitError: contactForm.dataset.messageSubmitError || '',
      networkError: contactForm.dataset.messageNetworkError || '',
    };

    function setStatus(message, className) {
      if (!formStatus) {
        return;
      }

      formStatus.textContent = message;
      formStatus.className = className;
    }

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const form = event.target;
      const data = new FormData(form);

      const hasUserInput = Array.from(
        data.values()
      ).some((value) => (
        typeof value === 'string'
        && value.trim() !== ''
      ));

      if (!hasUserInput) {
        setStatus(
          messages.emptyForm,
          STATUS_CLASSES.error,
        );

        return;
      }

      setStatus(
        messages.sending,
        STATUS_CLASSES.sending,
      );

      fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (response.ok) {
            setStatus(
              messages.success,
              STATUS_CLASSES.success,
            );

            form.reset();
            return;
          }

          setStatus(
            messages.submitError,
            STATUS_CLASSES.error,
          );
        })
        .catch(() => {
          setStatus(
            messages.networkError,
            STATUS_CLASSES.error,
          );
        });
    });
  }

  window.scrollTo(0, 0);

  initMobileMenu();
  initAccordions();
  initTabs();
  initGalleries();
  initDeferredVideos();
  initInternalHotelLinks();
  initContactForm();
});
