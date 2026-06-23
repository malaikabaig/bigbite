const reveals = document.querySelectorAll('.reveal');

function revealElements() {
  reveals.forEach((item) => {
    const top = item.getBoundingClientRect().top;

    const windowHeight = window.innerHeight;

    if (top < windowHeight - 100) {
      item.classList.add('active');
    }
  });
}

// Initial Load

revealElements();

// On Scroll

window.addEventListener(
  'scroll',

  revealElements,
);
