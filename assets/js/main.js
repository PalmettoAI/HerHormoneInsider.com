// HerHormoneInsider — minimal interactivity
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Newsletter form — placeholder until backend wired
  const form = document.querySelector('.cta-banner__form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]')?.value;
      if (email) {
        form.innerHTML = '<p style="color:var(--cream);margin:0;font-size:14px;">Thank you. You\'re on the list — first issue arrives Sunday.</p>';
      }
    });
  }
})();
