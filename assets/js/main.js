(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Tema claro / escuro ---------- */
  var themeBtn = document.getElementById('themeToggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    var chosen = root.getAttribute('data-theme');
    return chosen ? chosen === 'dark' : systemDark.matches;
  }

  function syncTheme() {
    var dark = isDark();
    root.classList.toggle('is-dark', dark);
    themeBtn.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
  }

  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('nexguard-tema', next); } catch (e) {}
    syncTheme();
  });
  systemDark.addEventListener('change', syncTheme);
  syncTheme();

  /* ---------- Menu no celular ---------- */
  var menuBtn = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  menuBtn.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  /* ---------- Cabeçalho ao rolar ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() { header.classList.toggle('is-stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Link ativo no menu ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Entrada suave ao rolar ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Herói: destaca um pilar por vez ---------- */
  var stage = document.getElementById('heroStage');
  var cards = stage.querySelectorAll('[data-card]');
  var traces = stage.querySelectorAll('[data-trace]');
  var heroTimer = null;
  var activeIndex = 0;

  function highlight(index) {
    activeIndex = index;
    cards.forEach(function (card, i) { card.classList.toggle('is-active', i === index); });
    traces.forEach(function (trace, i) { trace.classList.toggle('is-active', i === index); });
  }
  function startCycle() {
    stopCycle();
    if (reduceMotion.matches) return;
    heroTimer = window.setInterval(function () { highlight((activeIndex + 1) % cards.length); }, 3200);
  }
  function stopCycle() {
    if (heroTimer) window.clearInterval(heroTimer);
    heroTimer = null;
  }
  highlight(0);
  startCycle();
  cards.forEach(function (card, i) {
    card.addEventListener('mouseenter', function () { stopCycle(); highlight(i); });
    card.addEventListener('mouseleave', startCycle);
  });

  /* Reação suave ao mouse: o símbolo e os cartões se movem em sentidos opostos. */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (finePointer.matches && !reduceMotion.matches) {
    var heroSection = document.getElementById('topo');
    heroSection.addEventListener('pointermove', function (event) {
      var box = stage.getBoundingClientRect();
      var x = (event.clientX - (box.left + box.width / 2)) / box.width;
      var y = (event.clientY - (box.top + box.height / 2)) / box.height;
      stage.style.setProperty('--mx', Math.max(-1, Math.min(1, x)).toFixed(3));
      stage.style.setProperty('--my', Math.max(-1, Math.min(1, y)).toFixed(3));
    });
    heroSection.addEventListener('pointerleave', function () {
      stage.style.setProperty('--mx', '0');
      stage.style.setProperty('--my', '0');
    });
  }

  /* Pausa as animações contínuas quando o bloco sai da tela. */
  if ('IntersectionObserver' in window) {
    var fxObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('fx-paused', !entry.isIntersecting);
      });
    });
    fxObserver.observe(stage);
    fxObserver.observe(document.querySelector('.process'));
  }

  /* ---------- Soluções: filtro por necessidade ---------- */
  var chips = document.querySelectorAll('.chip');
  var solutionCards = document.querySelectorAll('.card[data-tags]');
  var filterStatus = document.getElementById('filterStatus');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.getAttribute('data-filter');
      var shown = 0;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      solutionCards.forEach(function (card) {
        var match = filter === 'todas' || card.getAttribute('data-tags').split(' ').indexOf(filter) !== -1;
        card.classList.toggle('is-dim', !match);
        if (match) shown += 1;
      });
      filterStatus.textContent = shown + ' soluções em destaque';
    });
  });

  /* ---------- Formulário de contato ---------- */
  var form = document.getElementById('contactForm');
  var subject = document.getElementById('fSubject');
  var message = document.getElementById('fMessage');
  var nameInput = document.getElementById('fName');
  var formStatus = document.getElementById('formStatus');
  var EMAIL = 'contato@nexguardtech.com.br';

  document.querySelectorAll('[data-subject]').forEach(function (link) {
    link.addEventListener('click', function () {
      subject.value = link.getAttribute('data-subject');
      window.setTimeout(function () { nameInput.focus({ preventScroll: true }); }, 500);
    });
  });

  function setFieldError(input, hasError) {
    var error = document.getElementById(input.getAttribute('aria-describedby'));
    if (hasError) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    error.hidden = !hasError;
  }

  function isFieldValid(input) {
    var value = input.value.trim();
    if (!value) return false;
    return input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  var required = form.querySelectorAll('[required]');
  required.forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') setFieldError(input, !isFieldValid(input));
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var firstInvalid = null;
    required.forEach(function (input) {
      var valid = isFieldValid(input);
      setFieldError(input, !valid);
      if (!valid && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      formStatus.hidden = true;
      firstInvalid.focus();
      return;
    }

    var data = new FormData(form);
    var company = data.get('empresa').trim();
    var body = [
      'Nome: ' + data.get('nome').trim(),
      company ? 'Empresa: ' + company : null,
      'E-mail: ' + data.get('email').trim(),
      '',
      data.get('mensagem').trim()
    ].filter(function (line) { return line !== null; }).join('\n');

    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(data.get('assunto') + (company ? ' | ' + company : '')) +
      '&body=' + encodeURIComponent(body);

    formStatus.innerHTML = 'Seu aplicativo de e-mail deve abrir com a mensagem pronta para enviar. Se não abrir, escreva para <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.';
    formStatus.hidden = false;
  });

  /* ---------- Checkup de TI ---------- */
  var QUESTIONS = [
    { area: 'Backup e continuidade', text: 'Os backups são testados e a equipe sabe como recuperar os dados?' },
    { area: 'Segurança de contas e acessos', text: 'Todas as contas importantes usam verificação em duas etapas?' },
    { area: 'Microsoft 365 & Cloud', text: 'O Microsoft 365 ou a nuvem da empresa têm um responsável e uma organização definida?' },
    { area: 'Suporte técnico especializado', text: 'Quando alguém tem um problema de TI, existe um canal claro para pedir ajuda?' },
    { area: 'Monitoramento e redes', text: 'Vocês ficam sabendo de falhas na rede e nos servidores antes de os usuários reclamarem?' },
    { area: 'Proteção contra ameaças', text: 'Se um computador for infectado hoje, a equipe sabe o que fazer nas primeiras horas?' }
  ];
  var OPTIONS = [
    { value: 'ok', label: 'Sim' },
    { value: 'part', label: 'Em parte' },
    { value: 'no', label: 'Não ou não sei' }
  ];
  var TAGS = { ok: 'Em dia', part: 'Atenção', no: 'Prioridade' };

  var ckCard = document.getElementById('ckCard');
  var bands = document.querySelectorAll('#ckShield .ck-band');
  var answers = [];
  var current = 0;

  function paintShield() {
    bands.forEach(function (band, i) {
      band.setAttribute('class', 'ck-band' +
        (answers[i] ? ' is-' + answers[i] : '') +
        (i === current && !answers[i] ? ' is-current' : ''));
    });
  }

  function renderQuestion(moveFocus) {
    var q = QUESTIONS[current];
    var html = '<div class="ck-top"><span class="ck-count">Pergunta ' + (current + 1) + ' de ' + QUESTIONS.length + '</span>' +
      '<span class="ck-area">' + q.area.replace('&', '&amp;') + '</span></div>' +
      '<div class="ck-progress" aria-hidden="true"><span style="width:' + (current / QUESTIONS.length * 100) + '%"></span></div>' +
      '<h3 class="ck-q" tabindex="-1">' + q.text + '</h3>' +
      '<div class="ck-options">';
    OPTIONS.forEach(function (option) {
      html += '<button type="button" class="ck-option' + (answers[current] === option.value ? ' is-chosen' : '') + '" data-value="' + option.value + '">' +
        option.label + '<svg class="icon" aria-hidden="true"><use href="#i-right"/></svg></button>';
    });
    html += '</div><button type="button" class="ck-back"' + (current === 0 ? ' hidden' : '') + '>Voltar à pergunta anterior</button>';
    ckCard.innerHTML = html;
    paintShield();
    if (moveFocus) ckCard.querySelector('.ck-q').focus({ preventScroll: true });
  }

  function summarize() {
    var no = answers.filter(function (a) { return a === 'no'; }).length;
    var part = answers.filter(function (a) { return a === 'part'; }).length;
    if (no + part === 0) return {
      title: 'Sua base está bem cuidada.',
      text: 'Para continuar assim, revise esses pontos com frequência. Podemos ajudar a manter essa rotina.'
    };
    if (no >= 3) return {
      title: 'Seu ambiente pede atenção agora.',
      text: 'Algumas áreas podem parar a operação ou expor dados. Comece pelos itens marcados como prioridade.'
    };
    if (no === 0 && part <= 2) return {
      title: 'Faltam poucos ajustes.',
      text: 'A base está no caminho certo. Veja os pontos que ainda merecem atenção.'
    };
    return {
      title: 'Há pontos para priorizar.',
      text: 'Parte do ambiente está coberta, mas algumas áreas ainda deixam a empresa exposta.'
    };
  }

  function orderedResults() {
    var weight = { no: 0, part: 1, ok: 2 };
    return QUESTIONS.map(function (q, i) { return { area: q.area, state: answers[i] }; })
      .sort(function (a, b) { return weight[a.state] - weight[b.state]; });
  }

  function renderResult() {
    current = QUESTIONS.length;
    paintShield();
    var summary = summarize();
    var items = orderedResults();
    var html = '<div class="ck-result"><span class="ck-count">Seu resultado</span>' +
      '<h3 class="ck-q" tabindex="-1">' + summary.title + '</h3><p>' + summary.text + '</p><ul class="ck-list">';
    items.forEach(function (item) {
      html += '<li>' + item.area.replace('&', '&amp;') + '<span class="tag tag-' + item.state + '">' + TAGS[item.state] + '</span></li>';
    });
    html += '</ul><div class="ck-actions">' +
      '<button type="button" class="btn btn-primary" id="ckSend">Enviar resultado para a NexGuard<svg class="icon" aria-hidden="true"><use href="#i-ne"/></svg></button>' +
      '<button type="button" class="btn btn-outline" id="ckRestart">Refazer checkup</button></div>' +
      '<p class="ck-fine">Esta é uma orientação inicial e não substitui uma avaliação técnica. Suas respostas só saem desta página se você decidir enviá-las.</p></div>';
    ckCard.innerHTML = html;
    ckCard.querySelector('.ck-q').focus({ preventScroll: true });
  }

  ckCard.addEventListener('click', function (event) {
    var option = event.target.closest('.ck-option');
    if (option) {
      answers[current] = option.getAttribute('data-value');
      current += 1;
      if (current < QUESTIONS.length) renderQuestion(true);
      else renderResult();
      return;
    }
    if (event.target.closest('.ck-back')) {
      current -= 1;
      renderQuestion(true);
      return;
    }
    if (event.target.closest('#ckRestart')) {
      answers = [];
      current = 0;
      renderQuestion(true);
      return;
    }
    if (event.target.closest('#ckSend')) {
      var lines = orderedResults().map(function (item) { return '- ' + item.area + ': ' + TAGS[item.state]; });
      subject.value = 'Resultado do checkup de TI';
      message.value = 'Fiz o checkup de TI no site e gostaria de conversar sobre o resultado:\n\n' + lines.join('\n');
      setFieldError(message, false);
      document.getElementById('contato').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      nameInput.focus({ preventScroll: true });
    }
  });

  renderQuestion(false);
})();
