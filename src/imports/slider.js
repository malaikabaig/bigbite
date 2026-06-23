const dealsSlider = new Swiper('.deals-slider', {
  loop: true,

  speed: 800,

  grabCursor: true,

  centeredSlides: true,

  autoplay: {
    delay: 3500,

    disableOnInteraction: false,

    pauseOnMouseEnter: true,
  },

  breakpoints: {
    0: {
      slidesPerView: 1,

      spaceBetween: 20,
    },

    768: {
      slidesPerView: 1.15,

      spaceBetween: 25,
    },

    992: {
      slidesPerView: 1.3,

      spaceBetween: 35,
    },

    1400: {
      slidesPerView: 1.45,

      spaceBetween: 40,
    },
  },

  pagination: {
    el: '.swiper-pagination',

    clickable: true,
  },

  keyboard: {
    enabled: true,
  },

  on: {
    init() {
      updateSlides();
    },

    slideChangeTransitionEnd() {
      updateSlides();
    },
  },
});

function updateSlides() {
  document

    .querySelectorAll('.deals-slider .swiper-slide')

    .forEach((slide) => {
      slide.classList.remove('active-slide');
    });

  const activeSlide = document.querySelector(
    '.deals-slider .swiper-slide-active',
  );

  if (activeSlide) {
    activeSlide.classList.add('active-slide');
  }
}
