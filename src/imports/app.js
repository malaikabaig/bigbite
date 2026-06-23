// ============================
// Navbar Background on Scroll
// ============================

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ============================
// Smooth Scroll
// ============================

const navLinks = document.querySelectorAll('a[href^="#"]');

navLinks.forEach((link) => {
  link.addEventListener(
    'click',

    function (e) {
      const targetId = this.getAttribute('href');

      if (targetId === '#' || targetId.length <= 1) return;

      e.preventDefault();

      const target = document.querySelector(targetId);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',

          block: 'start',
        });
      }
    },
  );
});

// ============================
// Active Nav Link
// ============================

const sections = document.querySelectorAll('section');

const navItems = document.querySelectorAll('.navbar .nav-link');

window.addEventListener(
  'scroll',

  () => {
    let current = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150;

      const sectionHeight = section.offsetHeight;

      if (
        pageYOffset >= sectionTop &&
        pageYOffset < sectionTop + sectionHeight
      ) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach((link) => {
      link.classList.remove('active');

      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  },
);

// ============================
// WhatsApp Button
// ============================

const whatsappButtons = document.querySelectorAll('.whatsapp-btn');

whatsappButtons.forEach((btn) => {
  btn.addEventListener(
    'click',

    () => {
      const message = encodeURIComponent(
        'Hi BigBite! I want to place an order.',
      );

      window.open(
        `https://wa.me/923001234567?text=${message}`,

        '_blank',
      );
    },
  );
});

// ============================
// Back To Top Button
// ============================

const backTop = document.querySelector('.back-to-top');

if (backTop) {
  window.addEventListener(
    'scroll',

    () => {
      if (window.scrollY > 400) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    },
  );

  backTop.addEventListener(
    'click',

    () => {
      window.scrollTo({
        top: 0,

        behavior: 'smooth',
      });
    },
  );
}

// ============================
// Preloader (Optional)
// ============================

window.addEventListener(
  'load',

  () => {
    const loader = document.querySelector('.preloader');

    if (loader) {
      loader.classList.add('hide');

      setTimeout(() => {
        loader.remove();
      }, 500);
    }
  },
);
