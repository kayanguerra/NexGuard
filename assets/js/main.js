    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    /* ============================================================
       CIRCUIT BACKGROUND — vetor SVG desenhado e animado por GSAP
       (substitui a imagem raster: fica nítido em qualquer tela)
       ============================================================ */
    const CIRCUIT_SVG = `
      <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g class="c-grey" stroke="#333a42" stroke-width="1.4" fill="none" stroke-linecap="square">
          <path d="M -20,90 L 100,90 L 180,20 L 360,20 L 440,100 L 640,100"/>
          <path d="M -20,180 L 70,180 L 70,140 L 190,140 L 250,200 L 440,200"/>
          <path d="M -20,260 L 40,260 L 100,320 L 100,380 L 240,380"/>
          <path d="M -20,340 L 120,340 L 200,420 L 480,420 L 560,500 L 840,500"/>
          <path d="M -20,420 L 60,420 L 60,460 L 160,460 L 220,520 L 420,520"/>
          <path d="M -20,500 L 160,500 L 220,560 L 520,560"/>
          <path d="M 40,720 L 40,600 L 140,520 L 140,460"/>
          <path d="M -20,560 L 30,560 L 30,610 L 100,610 L 160,670"/>
        </g>
        <g class="c-accent" stroke="#4e7fff" stroke-width="1.3" fill="none" opacity="0.55" stroke-linecap="square">
          <path d="M -20,150 L 60,150 L 120,90 L 260,90 L 320,150 L 480,150"/>
        </g>
        <g class="c-bright" stroke="#e9edf1" stroke-width="2.4" fill="none" stroke-linecap="round">
          <path d="M -20,300 L 80,300 L 160,220 L 260,220 L 340,300 L 540,300 L 640,400 L 920,400 L 1000,480 L 1220,480"/>
        </g>
        <g class="c-nodes" fill="#0a0c10" stroke="#454d56" stroke-width="1.2">
          <rect x="176" y="16" width="8" height="8"/>
          <rect x="436" y="96" width="8" height="8"/>
          <rect x="66" y="136" width="8" height="8"/>
          <rect x="246" y="196" width="8" height="8"/>
          <rect x="636" y="396" width="8" height="8"/>
          <rect x="256" y="216" width="8" height="8"/>
          <rect x="116" y="86" width="8" height="8"/>
        </g>
        <g class="c-ticks" stroke="#5a6169" stroke-width="1.4" stroke-dasharray="3 4" opacity="0.7">
          <line x1="300" y1="52" x2="360" y2="52"/>
          <line x1="500" y1="332" x2="560" y2="332"/>
          <line x1="640" y1="452" x2="700" y2="452"/>
        </g>
      </svg>
    `;

    document.getElementById('heroCircuit').innerHTML = CIRCUIT_SVG;
    document.getElementById('ctaCircuit').innerHTML = CIRCUIT_SVG;

    function initCircuit(container){
      const svg = container.querySelector('svg');
      const greys = svg.querySelectorAll('.c-grey path');
      const accents = svg.querySelectorAll('.c-accent path');
      const brights = svg.querySelectorAll('.c-bright path');
      const nodes = svg.querySelectorAll('.c-nodes rect');
      const ticks = svg.querySelectorAll('.c-ticks line');
      const allPaths = [...greys, ...accents, ...brights];

      allPaths.forEach(p => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(ticks, { opacity: 0 });

      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(greys, { strokeDashoffset: 0, duration: 1.3, stagger: 0.09, ease: 'power2.inOut' })
        .to(accents, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, '-=0.6')
        .to(brights, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '-=0.9')
        .to(nodes, { scale: 1, duration: 0.5, stagger: 0.05, ease: 'back.out(3)' }, '-=1')
        .to(ticks, { opacity: 0.7, duration: 0.6, stagger: 0.1 }, '-=0.6');

      // breathing glow on nodes
      gsap.to(nodes, {
        opacity: 0.45,
        duration: 1.8,
        stagger: { each: 0.3, repeat: -1, yoyo: true },
        delay: 1.5
      });

      // traveling light pulses along the bright + accent traces
      function launchPulse(path, color, size, dur, delay){
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', size);
        dot.setAttribute('fill', color);
        svg.appendChild(dot);
        gsap.set(dot, { opacity: 0 });
        gsap.to(dot, {
          motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] },
          duration: dur,
          ease: 'none',
          repeat: -1,
          delay: delay,
          onRepeat: () => gsap.fromTo(dot, {opacity:0},{opacity:1,duration:0.3})
        });
        gsap.to(dot, { opacity: 1, duration: 0.4, delay: delay });
        gsap.to(dot, {
          opacity: 0,
          duration: 0.6,
          repeat: -1,
          repeatDelay: dur - 0.6,
          delay: delay + dur - 0.6
        });
      }

      brights.forEach((p, i) => launchPulse(p, '#8fb4ff', 3.2, 5.5, 2 + i * 0.4));
      accents.forEach((p, i) => launchPulse(p, '#4e7fff', 2.4, 4.5, 3 + i * 0.6));
    }

    initCircuit(document.getElementById('heroCircuit'));
    initCircuit(document.getElementById('ctaCircuit'));

    // ---------- Nav on scroll ----------
    const nav = document.getElementById('nav');
    ScrollTrigger.create({
      start: 40,
      onUpdate: (self) => nav.classList.toggle('scrolled', self.scroll() > 40)
    });

    // ---------- Hero intro timeline ----------
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero h1 .word', { y: 0, duration: 1, stagger: 0.045, delay: 0.5 })
      .to('#heroP', { opacity: 1, duration: 0.9 }, '-=0.55')
      .to('#heroCta', { opacity: 1, duration: 0.8 }, '-=0.6')
      .to('#scrollCue', { opacity: 1, duration: 0.8 }, '-=0.5');

    // ---------- Node panel draw-in (sobre) ----------
    const lines = document.querySelectorAll('#nodeLines line');
    lines.forEach(line => {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    });
    ScrollTrigger.create({
      trigger: '.node-panel',
      start: 'top 75%',
      onEnter: () => {
        gsap.to('#nodeLines line', { strokeDashoffset: 0, duration: 1.1, stagger: 0.07, ease: 'power2.inOut' });
        gsap.fromTo('#nodeDots circle', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, stagger: 0.06, delay: 0.4, ease: 'back.out(3)' });
      },
      once: true
    });
    gsap.to('#nodeDots circle', { opacity: 0.4, duration: 1.4, stagger: { each: 0.25, repeat: -1, yoyo: true } });

    // ---------- Generic scroll reveals ----------
    gsap.utils.toArray('.reveal-up').forEach((el) => {
      gsap.fromTo(el, { y: 34, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // ---------- Card grid stagger ----------
    gsap.set('.reveal-card', { opacity: 0 });
    ScrollTrigger.create({
      trigger: '.cards',
      start: 'top 82%',
      onEnter: () => {
        gsap.fromTo('.reveal-card', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
      },
      once: true
    });

    // ---------- Eyebrow dash pulse ----------
    gsap.to('.hero .eyebrow .dash', {
      scaleX: 1.6, transformOrigin: 'left', duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
