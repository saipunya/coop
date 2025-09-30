(function () {
  const toggler = document.querySelector('.navbar-toggler');
  const target = document.querySelector('#navbarSupportedContent');
  if (!toggler || !target) return;

  // If Bootstrap loaded, let it handle; also ensure instance exists.
  if (window.bootstrap && window.bootstrap.Collapse) {
    if (!bootstrap.Collapse.getInstance(target)) {
      new bootstrap.Collapse(target, { toggle: false });
    }
    return;
  }

  // Fallback manual toggle
  toggler.addEventListener('click', function () {
    const shown = target.classList.toggle('show');
    toggler.setAttribute('aria-expanded', shown ? 'true' : 'false');
  });

  // Close menu when clicking a nav link (mobile UX)
  target.addEventListener('click', e => {
    if (e.target.matches('.nav-link')) {
      target.classList.remove('show');
      toggler.setAttribute('aria-expanded', 'false');
    }
  });

  // Basic resize listener: remove inline state if back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      target.classList.remove('show');
      toggler.setAttribute('aria-expanded', 'false');
    }
  });
})();
