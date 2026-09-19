document.addEventListener('DOMContentLoaded', () => {
  const AUTOPLAY_INTERVAL_MS = 4000;

  const STATUS_CLASSES = {
    sending: 'mt-4 text-center font-semibold text-gray-600',
    success: 'mt-4 text-center font-semibold text-green-500',
    error: 'mt-4 text-center font-semibold text-red-500',
  };

  function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu-panel a');

    function openMenu() {
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      document.body.classList.remove('menu-open');
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
  }

  function initAccordions() {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        button.classList.toggle('active');
      });
    });
  }

  function initTabs() {
    const tabComponents = document.querySelectorAll('.tabs-component');

    tabComponents.forEach((tabContainer) => {
      const tabButtons = tabContainer.querySelectorAll('.tab-button');
      const tabContents = tabContainer.querySelectorAll('.tab-content');

      tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
          tabButtons.forEach((item) => {
            item.classList.remove('active');
          });

          tabContents.forEach((content) => {
            content.classList.remove('active');
          });

          button.classList.add('active');

          const tabId = button.dataset.tab;

          if (!tabId) {
            return;
          }

          const activeTabContent = tabContainer.querySelector(`#${tabId}`);

          if (activeTabContent) {
            activeTabContent.classList.add('active');
          }
        });
      });
    });
  }

  function initGalleries() {
    const galleryContainers = document.querySelectorAll('.gallery-container');

    galleryContainers.forEach((galleryContainer) => {
      const slides = galleryContainer.querySelectorAll('.gallery-slide');
      const dotsContainer = galleryContainer.nextElementSibling;

      if (
        !dotsContainer
        || !dotsContainer.classList.contains('gallery-dots')
      ) {
        return;
      }

      const dots = dotsContainer.querySelectorAll('.gallery-dot');

      if (
        slides.length === 0
        || dots.length === 0
        || slides.length !== dots.length
      ) {
        return;
      }

      let currentIndex = 0;
      let intervalId = null;

      function showSlide(index) {
        if (!slides[index] || !dots[index]) {
          return;
        }

        slides.forEach((slide) => {
          slide.classList.replace('opacity-100', 'opacity-0');
        });

        slides[index].classList.replace('opacity-0', 'opacity-100');

        dots.forEach((dot) => {
          dot.classList.remove('active');
        });

        dots[index].classList.add('active');
        currentIndex = index;
      }

      function nextSlide() {
        const nextIndex = (currentIndex + 1) % slides.length;
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
        intervalId = setInterval(nextSlide, AUTOPLAY_INTERVAL_MS);
      }

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
          stopAutoplay();
          startAutoplay();
        });
      });

      showSlide(0);
      startAutoplay();
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

  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (!contactForm) {
      return;
    }

    const messages = {
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

          response
            .json()
            .then((responseData) => {
              if (
                Object.hasOwn(responseData, 'errors')
                && Array.isArray(responseData.errors)
              ) {
                const errorText = responseData.errors
                  .map((error) => error.message)
                  .join(', ');

                setStatus(
                  errorText,
                  STATUS_CLASSES.error,
                );

                return;
              }

              setStatus(
                messages.submitError,
                STATUS_CLASSES.error,
              );
            })
            .catch(() => {
              setStatus(
                messages.submitError,
                STATUS_CLASSES.error,
              );
            });
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
  initInternalHotelLinks();
  initContactForm();
});
