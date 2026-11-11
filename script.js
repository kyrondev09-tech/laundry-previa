(() => {
  const toggle = document.querySelector('#menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canAnimate = !prefersReducedMotion && typeof Element.prototype.animate === 'function';
  let menuOpen = false;
  let menuAnimation = null;

  const setMenu = (open) => {
    if (menuAnimation) menuAnimation.finish();
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');

    if (!canAnimate) {
      mobileNav.hidden = !open;
      return;
    }
    if (open) mobileNav.hidden = false;
    if (!open && mobileNav.hidden) return;

    menuAnimation = mobileNav.animate(
      open
        ? [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0)' }]
        : [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }],
      { duration: 240, easing: 'ease-in-out' }
    );
    menuAnimation.onfinish = () => {
      if (!open) mobileNav.hidden = true;
      menuAnimation = null;
    };
  };

  const closeMenu = () => { if (menuOpen) setMenu(false); };
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (innerWidth > 900) closeMenu(); });

  // Mantém o <details> nativo e anima sua altura na abertura e no fechamento.
  document.querySelectorAll('.faq-items details').forEach(details => {
    const summary = details.querySelector('summary');
    let animation = null;
    summary.addEventListener('click', event => {
      event.preventDefault();
      if (animation) animation.finish();
      const opening = !details.open;
      if (!canAnimate) {
        details.open = opening;
        return;
      }
      if (opening) details.open = true;
      const from = opening ? summary.offsetHeight + 1 : details.offsetHeight;
      const to = opening ? details.offsetHeight : summary.offsetHeight + 1;
      animation = details.animate(
        [{ height: from + 'px' }, { height: to + 'px' }],
        { duration: 320, easing: 'cubic-bezier(.2, .7, .2, 1)' }
      );
      animation.onfinish = () => {
        if (!opening) details.open = false;
        animation = null;
      };
    });
  });

  const form = document.querySelector('#order-form');
  const result = document.querySelector('#result');
  const summary = document.querySelector('#summary');
  const status = document.querySelector('#copy-status');
  const choices = [...form.querySelectorAll('input[name="servico"]')];
  document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
    const input = choices.find(item => item.value === button.dataset.service);
    if (input) input.checked = true;
    document.querySelector('#pedido').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = choices.filter(input => input.checked).map(input => input.value);
    if (!selected.length) {
      choices[0].setCustomValidity('Selecione ao menos um serviço.');
      choices[0].reportValidity();
      return;
    }
    const details = form.elements.detalhes.value.trim();
    summary.textContent = 'Olá! Tenho interesse em: ' + selected.join(', ') + '.' + (details ? ' Detalhes: ' + details : '') + ' Gostaria de saber sobre disponibilidade, prazo e orçamento.';
    const wasHidden = result.hidden;
    result.hidden = false;
    status.textContent = '';
    if (wasHidden && canAnimate) {
      result.animate(
        [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 360, easing: 'ease-out' }
      );
    }
    result.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth', block: 'nearest' });
  });
  choices.forEach(input => input.addEventListener('change', () => choices[0].setCustomValidity('')));
  document.querySelector('#copy-button').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary.textContent);
      status.textContent = 'Resumo copiado!';
    } catch {
      status.textContent = 'Não foi possível copiar automaticamente. Selecione o texto acima.';
    }
  });
  // Revela os blocos quando entram na área visível. Sem suporte ou com movimento reduzido, ficam visíveis.
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealTargets = document.querySelectorAll(
      '.hero-copy, .hero-image, .section-head, .card, .process-grid > div:first-child, .steps li, .care-photo, .care-grid > div:last-child, .quote .container, .faq-grid > div:first-child, .faq-items details, .order-copy, .order-form'
    );
    revealTargets.forEach(target => target.classList.add('reveal'));
    document.body.classList.add('reveal-ready');
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(target => observer.observe(target));
  }

  document.querySelector('#year').textContent = new Date().getFullYear();
})();
