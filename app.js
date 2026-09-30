/**
 * Romantic Interactive Keepsake Web App
 * Features: High-DPI Love Tree Canvas Engine with Offscreen Buffer, Particle System, Typewriter, 
 * Polaroid Lightbox, Interactive Pillars, Runaway "No" Physics, 
 * Smooth Audio Fading & Sparkle Cursor.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 0. SCROLL PROGRESS BAR & INTERSECTION OBSERVER
  // ========================================================
  const scrollProgress = document.getElementById('scroll-progress');
  
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${scrolled}%`;
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // Scroll Reveal Observer for Sections & Cards
  const revealElements = document.querySelectorAll('section, .feature-card, .polaroid-card, .question-arena');
  revealElements.forEach(el => el.classList.add('reveal-on-scroll'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }


  // ========================================================
  // 1. CLASSIC LOVE TREE CANVAS ENGINE (HIGH-DPI & OFFSCREEN BUFFER)
  // ========================================================

  function random(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function bezier(cp, t) {  
    const p1 = cp[0].mul((1 - t) * (1 - t));
    const p2 = cp[1].mul(2 * t * (1 - t));
    const p3 = cp[2].mul(t * t); 
    return p1.add(p2).add(p3);
  }

  function inHeart(x, y, r) {
    const z = Math.pow(Math.pow(x / r, 2) + Math.pow(y / r, 2) - 1, 3) - Math.pow(x / r, 2) * Math.pow(y / r, 3);
    return z < 0;
  }

  class Point {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    clone() { return new Point(this.x, this.y); }
    add(o) { return new Point(this.x + o.x, this.y + o.y); }
    sub(o) { return new Point(this.x - o.x, this.y - o.y); }
    div(n) { return new Point(this.x / n, this.y / n); }
    mul(n) { return new Point(this.x * n, this.y * n); }
  }

  class HeartShape {
    constructor() {
      this.points = [];
      const step = Math.PI / 40;
      for (let t = 0; t <= Math.PI * 2; t += step) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        this.points.push(new Point(x, y));
      }
      this.length = this.points.length;
    }
    get(i, scale = 1) {
      return this.points[i].mul(scale);
    }
  }

  class TreeSeed {
    constructor(tree, point, scale = 2.4, color = '#f43f5e') {
      this.tree = tree;
      this.point = point;
      this.scale = scale;
      this.color = color;
      this.figure = new HeartShape();
      this.radius = 8;
    }
    draw() {
      const ctx = this.tree.ctx;
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.shadowColor = 'rgba(244, 63, 94, 0.9)';
      ctx.shadowBlur = 25;
      ctx.translate(this.point.x, this.point.y);
      ctx.beginPath();
      const first = this.figure.get(0, this.scale);
      ctx.moveTo(first.x, -first.y);
      for (let i = 1; i < this.figure.length; i++) {
        const p = this.figure.get(i, this.scale);
        ctx.lineTo(p.x, -p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    canScale() { return this.scale > 0.3; }
    scaleDown(factor = 0.94) { this.scale *= factor; }
    canMove() { return this.point.y < (this.tree.height - 10); }
    move(dy = 3) { this.point.y += dy; }
  }

  class TreeFooter {
    constructor(tree, width = 1100, height = 4, speed = 12) {
      this.tree = tree;
      this.point = new Point(tree.width / 2, tree.height - height / 2);
      this.maxWidth = width;
      this.height = height;
      this.speed = speed;
      this.length = 0;
    }
    draw() {
      const ctx = this.tree.ctx;
      const len = this.length / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
      ctx.shadowBlur = 6;
      ctx.lineWidth = this.height;
      ctx.lineCap = 'round';
      ctx.translate(this.point.x, this.point.y);
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.restore();

      if (this.length < this.maxWidth) {
        this.length += this.speed;
      }
    }
  }

  class TreeBranch {
    constructor(tree, p1, p2, p3, radius, length, subBranches = []) {
      this.tree = tree;
      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;
      this.radius = radius;
      this.length = length || 100;
      this.len = 0;
      this.t = 1 / (this.length - 1);
      this.subBranches = subBranches;
    }
    grow() {
      if (this.len <= this.length) {
        const p = bezier([this.p1, this.p2, this.p3], this.len * this.t);
        this.draw(p);
        this.len++;
        this.radius *= 0.985;
      } else {
        this.tree.removeBranch(this);
        this.tree.addBranchData(this.subBranches);
      }
    }
    draw(p) {
      const ctx = this.tree.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = '#4a2828';
      ctx.shadowColor = 'rgba(74, 40, 40, 0.4)';
      ctx.shadowBlur = 3;
      ctx.arc(p.x, p.y, Math.max(0.6, this.radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class TreeBloom {
    constructor(tree, point, figure, color, alpha, scale, place, speed) {
      this.tree = tree;
      this.point = point;
      this.figure = figure;
      const hues = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#e11d48', '#f472b6', '#ff758f', '#fbb6ce', '#ffe4e6'];
      this.color = color || hues[Math.floor(Math.random() * hues.length)];
      this.alpha = alpha || (Math.random() * 0.4 + 0.6);
      this.angle = Math.random() * Math.PI * 2;
      this.scale = scale || 0.05;
      this.maxScale = Math.random() * 0.22 + 0.32;
      this.place = place;
      this.speed = speed;
    }
    flower() {
      this.draw();
      this.scale += 0.035;
      if (this.scale > this.maxScale) {
        this.tree.removeBloom(this);
      }
    }
    draw() {
      const ctx = this.tree.ctx;
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 3;
      ctx.translate(this.point.x, this.point.y);
      ctx.scale(this.scale, this.scale);
      ctx.rotate(this.angle);
      ctx.beginPath();
      const first = this.figure.get(0);
      ctx.moveTo(first.x, -first.y);
      for (let i = 1; i < this.figure.length; i++) {
        const p = this.figure.get(i);
        ctx.lineTo(p.x, -p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    jump() {
      if (this.point.x < -30 || this.point.y > this.tree.height + 30) {
        this.tree.removeBloom(this);
      } else {
        this.draw();
        this.point = this.place.sub(this.point).div(this.speed).add(this.point);
        this.angle += 0.03;
        this.speed = Math.max(12, this.speed - 0.4);
      }
    }
  }

  class LoveTree {
    constructor(canvas, width = 1100, height = 680) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = width;
      this.height = height;
      this.treeCenterX = 720;
      this.staticTreeCanvas = null;

      this.seed = new TreeSeed(this, new Point(this.treeCenterX, height / 2 + 30));
      this.footer = new TreeFooter(this, width, 4, 12);
      this.branches = [];
      this.blooms = [];
      this.bloomsCache = [];
      this.figure = this.seed.figure;
      this.initBranchesData();
      this.initBloomsCache(450);
    }

    initBranchesData() {
      const cx = this.treeCenterX;
      const cy = this.height;
      this.rawBranchData = [
        [cx, cy, cx + 25, cy - 430, cx - 35, cy - 480, 24, 90, [
          [cx + 5, cy - 180, cx - 80, cy - 265, cx - 190, cy - 280, 11, 80, [
            [cx - 85, cy - 245, cx - 100, cy - 250, cx - 140, cy - 285, 2, 40]
          ]],
          [cx + 15, cy - 235, cx + 65, cy - 325, cx + 145, cy - 335, 10, 80, [
            [cx + 45, cy - 280, cx + 115, cy - 270, cx + 130, cy - 255, 3, 60]
          ]],
          [cx + 4, cy - 400, cx + 2, cy - 430, cx - 2, cy - 460, 3, 40],
          [cx + 11, cy - 285, cx - 120, cy - 430, cx - 205, cy - 435, 8, 70, [
            [cx - 105, cy - 395, cx - 150, cy - 425, cx - 160, cy - 475, 2, 40],
            [cx - 35, cy - 335, cx - 100, cy - 365, cx - 140, cy - 350, 3, 50]
          ]],
          [cx + 11, cy - 325, cx + 75, cy - 430, cx + 145, cy - 460, 6, 80, [
            [cx + 55, cy - 390, cx + 110, cy - 405, cx + 115, cy - 410, 2, 60]
          ]]
        ]]
      ];
    }

    startGrowing() {
      this.addBranchData(this.rawBranchData);
    }

    addBranchData(dataList) {
      for (let b of dataList) {
        const p1 = new Point(b[0], b[1]);
        const p2 = new Point(b[2], b[3]);
        const p3 = new Point(b[4], b[5]);
        const r = b[6];
        const l = b[7];
        const sub = b[8] || [];
        this.branches.push(new TreeBranch(this, p1, p2, p3, r, l, sub));
      }
    }

    removeBranch(branch) {
      const idx = this.branches.indexOf(branch);
      if (idx !== -1) this.branches.splice(idx, 1);
    }

    canGrow() { return this.branches.length > 0; }
    
    grow() {
      for (let i = 0; i < this.branches.length; i++) {
        const b = this.branches[i];
        if (b) b.grow();
      }
    }

    initBloomsCache(num = 450) {
      const r = 205;
      const w = this.width;
      const h = this.height;
      const cx = this.treeCenterX;
      const cy = h - (h - 60) / 2;
      for (let i = 0; i < num; i++) {
        let x, y;
        while (true) {
          x = random(cx - r - 40, Math.min(w - 20, cx + r + 40));
          y = random(40, h - 100);
          if (inHeart(x - cx, cy - y, r)) {
            this.bloomsCache.push(new TreeBloom(this, new Point(x, y), this.figure));
            break;
          }
        }
      }
    }

    canFlower() { return this.bloomsCache.length > 0 || this.blooms.length > 0; }

    flower(batch = 4) {
      const fresh = this.bloomsCache.splice(0, batch);
      for (let b of fresh) {
        this.blooms.push(b);
      }
      for (let i = 0; i < this.blooms.length; i++) {
        this.blooms[i].flower();
      }
    }

    removeBloom(bloom) {
      const idx = this.blooms.indexOf(bloom);
      if (idx !== -1) this.blooms.splice(idx, 1);
    }

    captureStaticTree() {
      if (!this.staticTreeCanvas) {
        this.staticTreeCanvas = document.createElement('canvas');
        this.staticTreeCanvas.width = this.width;
        this.staticTreeCanvas.height = this.height;
        const staticCtx = this.staticTreeCanvas.getContext('2d');
        staticCtx.drawImage(this.canvas, 0, 0);
      }
    }

    jump() {
      if (this.staticTreeCanvas) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.staticTreeCanvas, 0, 0);
      }

      for (let i = 0; i < this.blooms.length; i++) {
        this.blooms[i].jump();
      }
      if (this.blooms.length < 15) {
        const w = this.width;
        const h = this.height;
        const cx = this.treeCenterX;
        for (let i = 0; i < random(1, 3); i++) {
          let x = random(cx - 180, Math.min(w - 30, cx + 180));
          let y = random(100, 400);
          const target = new Point(random(cx - 350, w + 50), h + 40);
          this.blooms.push(new TreeBloom(this, new Point(x, y), this.figure, null, 0.9, 0.8, target, random(140, 220)));
        }
      }
    }
  }

  const treeCanvas = document.getElementById('tree-canvas');
  const postBloomReveal = document.getElementById('post-bloom-reveal');

  let treeApp = null;
  let treeStarted = false;

  function initLoveTree() {
    if (!treeCanvas) return;
    treeCanvas.width = 1100;
    treeCanvas.height = 680;
    treeApp = new LoveTree(treeCanvas, 1100, 680);
    treeCanvas.classList.add('clickable-seed');
    ensureSeedPrompt();
    renderSeedPulsing();
  }

  function ensureSeedPrompt() {
    let prompt = document.getElementById('tree-seed-prompt');
    const stage = document.getElementById('tree-stage-wrapper');
    if (!prompt && stage && !treeStarted) {
      prompt = document.createElement('div');
      prompt.id = 'tree-seed-prompt';
      prompt.className = 'absolute z-30 flex flex-col items-center justify-center p-6 text-center transition-all duration-700 pointer-events-auto';
      prompt.innerHTML = `
        <button id="start-tree-btn" class="group relative px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-sky-400 text-white font-semibold text-base sm:text-lg shadow-[0_0_35px_rgba(244,63,94,0.7)] hover:shadow-[0_0_55px_rgba(56,189,248,0.85)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/50 backdrop-blur-xl flex items-center space-x-3 cursor-pointer">
          <span class="text-2xl animate-bounce">💖</span>
          <span class="tracking-wide drop-shadow-md">Click To Bloom Love Tree ✨</span>
          <span class="text-xl group-hover:rotate-12 transition-transform">🌸</span>
        </button>
        <p class="text-xs sm:text-sm text-pink-200/90 mt-3.5 font-normal tracking-wide drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          ✨ Tap the button to watch the heart tree grow & unveil the story ✨
        </p>
      `;
      stage.appendChild(prompt);
    }
    const btn = document.getElementById('start-tree-btn');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        startTreeSequence();
      });
    }
  }

  let seedPulseAngle = 0;
  let seedAnimId = null;

  function renderSeedPulsing() {
    if (treeStarted || !treeApp) return;
    treeApp.ctx.clearRect(0, 0, treeApp.width, treeApp.height);
    seedPulseAngle += 0.05;
    treeApp.seed.scale = 2.4 + Math.sin(seedPulseAngle) * 0.3;
    treeApp.seed.draw();
    seedAnimId = requestAnimationFrame(renderSeedPulsing);
  }

  async function startTreeSequence() {
    if (treeStarted) return;
    treeStarted = true;
    cancelAnimationFrame(seedAnimId);
    treeCanvas.classList.remove('clickable-seed');

    // Start music synchronously in user click gesture context for iOS
    startMusicTrack();

    const prompt = document.getElementById('tree-seed-prompt');
    if (prompt) {
      prompt.style.opacity = '0';
      prompt.style.transform = 'translate(-50%, -50%) scale(0.9)';
      prompt.style.pointerEvents = 'none';
      setTimeout(() => prompt.remove(), 700);
    }

    playSoundEffect(523, 'triangle', 0.4);

    while (treeApp.seed.canScale()) {
      treeApp.ctx.clearRect(0, 0, treeApp.width, treeApp.height);
      treeApp.seed.scaleDown(0.92);
      treeApp.seed.draw();
      await sleep(15);
    }

    while (treeApp.seed.canMove()) {
      treeApp.ctx.clearRect(0, 0, treeApp.width, treeApp.height);
      treeApp.seed.move(4);
      treeApp.seed.draw();
      treeApp.footer.draw();
      await sleep(12);
    }

    treeApp.startGrowing();
    while (treeApp.canGrow()) {
      treeApp.grow();
      treeApp.footer.draw();
      await sleep(10);
    }

    // Reveal typewriter card on left as blossoms open
    const overlay = document.getElementById('tree-text-overlay');
    if (overlay) {
      overlay.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
      overlay.classList.add('opacity-100');
      const lines = overlay.querySelectorAll('.typewriter-line');
      lines.forEach((line) => {
        const delay = parseInt(line.getAttribute('data-delay') || '0', 10);
        setTimeout(() => {
          line.classList.add('visible');
          playSoundEffect(660, 'sine', 0.08);
        }, delay);
      });
    }

    while (treeApp.canFlower()) {
      treeApp.flower(4);
      await sleep(10);
    }

    // Capture clean static tree snapshot onto offscreen canvas to prevent smearing
    treeApp.captureStaticTree();

    // Confetti celebration pop
    if (window.confetti) {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { x: 0.68, y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#38bdf8', '#fda4af', '#fbb6ce']
      });
    }

    if (postBloomReveal) {
      setTimeout(() => {
        postBloomReveal.classList.remove('opacity-0', 'translate-y-6', 'pointer-events-none');
        postBloomReveal.classList.add('opacity-100', 'translate-y-0');
      }, 1500);
    }

    function loopJump() {
      if (!document.hidden) {
        treeApp.jump();
      }
      requestAnimationFrame(loopJump);
    }
    loopJump();
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  if (treeCanvas) {
    treeCanvas.addEventListener('click', () => {
      if (treeStarted) return;
      startTreeSequence();
    });
  }
  initLoveTree();


  // ========================================================
  // 2. BACKGROUND PARTICLES & FLOATING HEARTS
  // ========================================================
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
  let bgWidth, bgHeight;
  let bgParticles = [];

  function initBgCanvas() {
    if (!bgCanvas) return;
    bgWidth = bgCanvas.width = window.innerWidth;
    bgHeight = bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', initBgCanvas, { passive: true });
  initBgCanvas();

  class BgParticle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * (bgWidth || window.innerWidth);
      this.y = initial ? Math.random() * (bgHeight || window.innerHeight) : -20;
      this.size = Math.random() * 8 + 5;
      this.speedY = Math.random() * 1.0 + 0.5;
      this.speedX = Math.random() * 1.2 - 0.6;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.025;
      this.isPetal = Math.random() > 0.4;
      this.opacity = Math.random() * 0.35 + 0.2;
      this.color = this.isPetal 
        ? `rgba(${240 + Math.random() * 15}, ${110 + Math.random() * 40}, ${150 + Math.random() * 40}, ${this.opacity})`
        : `rgba(56, 189, 248, ${this.opacity * 0.9})`;
    }
    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.7 + this.speedX;
      this.angle += this.spinSpeed;
      if (this.y > (bgHeight || window.innerHeight) + 20 || this.x < -30 || this.x > (bgWidth || window.innerWidth) + 30) {
        this.reset(false);
      }
    }
    draw() {
      if (!bgCtx) return;
      bgCtx.save();
      bgCtx.translate(this.x, this.y);
      bgCtx.rotate(this.angle);
      if (this.isPetal) {
        bgCtx.fillStyle = this.color;
        bgCtx.beginPath();
        bgCtx.moveTo(0, 0);
        bgCtx.bezierCurveTo(-this.size, -this.size / 2, -this.size / 2, -this.size * 1.2, 0, -this.size * 1.5);
        bgCtx.bezierCurveTo(this.size / 2, -this.size * 1.2, this.size, -this.size / 2, 0, 0);
        bgCtx.fill();
      } else {
        bgCtx.fillStyle = this.color;
        bgCtx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        bgCtx.shadowBlur = 6;
        bgCtx.beginPath();
        bgCtx.arc(0, 0, this.size * 0.22, 0, Math.PI * 2);
        bgCtx.fill();
      }
      bgCtx.restore();
    }
  }

  if (bgCanvas) {
    const pCount = window.innerWidth < 640 ? 20 : 40;
    for (let i = 0; i < pCount; i++) bgParticles.push(new BgParticle());

    function animateBg() {
      if (!document.hidden && bgCtx) {
        bgCtx.clearRect(0, 0, bgWidth, bgHeight);
        for (let p of bgParticles) {
          p.update();
          p.draw();
        }
      }
      requestAnimationFrame(animateBg);
    }
    animateBg();
  }

  // Floating Hearts Canvas
  const heartCanvas = document.getElementById('heart-canvas');
  if (heartCanvas) {
    const hCtx = heartCanvas.getContext('2d');
    let hWidth = heartCanvas.width = window.innerWidth;
    let hHeight = heartCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      hWidth = heartCanvas.width = window.innerWidth;
      hHeight = heartCanvas.height = window.innerHeight;
    }, { passive: true });

    const floatingHearts = [];
    const heartCount = window.innerWidth < 640 ? 12 : 24;

    class FloatingHeart {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * hWidth;
        this.y = hHeight + Math.random() * 50;
        this.size = Math.random() * 14 + 10;
        this.speed = Math.random() * 0.8 + 0.4;
        this.opacity = Math.random() * 0.4 + 0.15;
        this.swing = Math.random() * 2;
        this.swingSpeed = Math.random() * 0.02 + 0.01;
        this.color = Math.random() > 0.5 ? 'rgba(244, 63, 94,' : 'rgba(251, 113, 133,';
      }
      update() {
        this.y -= this.speed;
        this.x += Math.sin(this.swing) * 0.6;
        this.swing += this.swingSpeed;
        if (this.y < -30) {
          this.reset();
        }
      }
      draw() {
        hCtx.save();
        hCtx.translate(this.x, this.y);
        hCtx.scale(this.size / 20, this.size / 20);
        hCtx.fillStyle = `${this.color} ${this.opacity})`;
        hCtx.beginPath();
        hCtx.moveTo(0, 0);
        hCtx.bezierCurveTo(-10, -10, -20, 5, 0, 20);
        hCtx.bezierCurveTo(20, 5, 10, -10, 0, 0);
        hCtx.fill();
        hCtx.restore();
      }
    }

    for (let i = 0; i < heartCount; i++) {
      const h = new FloatingHeart();
      h.y = Math.random() * hHeight;
      floatingHearts.push(h);
    }

    function animateFloatingHearts() {
      if (!document.hidden) {
        hCtx.clearRect(0, 0, hWidth, hHeight);
        floatingHearts.forEach(h => {
          h.update();
          h.draw();
        });
      }
      requestAnimationFrame(animateFloatingHearts);
    }
    animateFloatingHearts();
  }


  // ========================================================
  // 3. TIMELINE COUNTER (Removed upon user request)
  // ========================================================


  // ========================================================
  // 4. POLAROID TAP-TO-ZOOM LIGHTBOX
  // ========================================================
  const polaroidLightbox = document.getElementById('polaroid-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');
  const polaroidCards = document.querySelectorAll('.polaroid-card');

  function openLightbox(imgSrc, captionText) {
    if (!polaroidLightbox || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    if (lightboxCaption) lightboxCaption.textContent = captionText || '';
    polaroidLightbox.classList.remove('hidden');
    document.body.classList.add('modal-open');
    playSoundEffect(620, 'sine', 0.15);
  }

  function closeLightbox() {
    if (!polaroidLightbox) return;
    polaroidLightbox.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  polaroidCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const caption = card.querySelector('.polaroid-caption');
      if (img) {
        openLightbox(img.src, caption ? caption.textContent : '');
      }
    });
  });

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
  if (polaroidLightbox) {
    polaroidLightbox.addEventListener('click', (e) => {
      if (e.target === polaroidLightbox) closeLightbox();
    });
  }


  // ========================================================
  // 5. INTERACTIVE PILLARS (CRICKET, SALUTE, ROSES)
  // ========================================================
  const cricketBtn = document.getElementById('cricket-shot-btn');
  const cricketScore = document.getElementById('cricket-score');
  const shots = [
    { text: "Glorious Cover Drive! 🏏 (4)", sound: [440, 554, 659] },
    { text: "Massive Six over Mid-wicket! 💥 (6)", sound: [523, 659, 784, 1046] },
    { text: "Crisp Square Cut! ⚡ (4)", sound: [493, 622, 740] },
    { text: "Unstoppable Pull Shot! 🌟 (6)", sound: [587, 740, 880] }
  ];
  let shotIndex = 0;

  if (cricketBtn && cricketScore) {
    cricketBtn.addEventListener('click', () => {
      const shot = shots[shotIndex];
      shotIndex = (shotIndex + 1) % shots.length;
      cricketScore.textContent = shot.text;
      
      shot.sound.forEach((freq, i) => {
        setTimeout(() => playSoundEffect(freq, 'triangle', 0.25), i * 70);
      });

      if (window.confetti) {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#38bdf8', '#fb7185', '#ffffff']
        });
      }
    });
  }

  const saluteBtn = document.getElementById('salute-btn');
  const saluteStatus = document.getElementById('salute-status');
  if (saluteBtn && saluteStatus) {
    saluteBtn.addEventListener('click', () => {
      saluteStatus.textContent = "🫡 Jai Hind!";
      [392, 523, 659, 784].forEach((freq, idx) => {
        setTimeout(() => playSoundEffect(freq, 'triangle', 0.22, 0.1), idx * 110);
      });
      if (window.confetti) {
        confetti({
          particleCount: 30,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#ff9933', '#ffffff', '#138808']
        });
      }
    });
  }

  const roseBtn = document.getElementById('rose-shower-btn');
  const roseCounter = document.getElementById('rose-counter');
  let roseCount = 0;
  if (roseBtn && roseCounter) {
    roseBtn.addEventListener('click', () => {
      roseCount++;
      roseCounter.textContent = `${roseCount} 🌹`;
      playSoundEffect(659, 'sine', 0.3);
      if (window.confetti) {
        confetti({
          particleCount: 35,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#f43f5e', '#fda4af', '#e11d48']
        });
      }
    });
  }


  // ========================================================
  // 6. THE PLAYFUL RUNAWAY 'NO' BUTTON & CONFIRMATION FLOW
  // ========================================================
  const runawayNoBtn = document.getElementById('runaway-no-btn');
  const runawayHint = document.getElementById('runaway-hint');
  const buttonsStage = document.getElementById('buttons-stage');
  const agreementYesBtn = document.getElementById('agreement-yes-btn');
  const confirmationModal = document.getElementById('confirmation-modal');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const modalYesTooBtn = document.getElementById('modal-yes-too-btn');
  const celebrationModal = document.getElementById('celebration-modal');
  const closeCelebrationBtn = document.getElementById('close-celebration-btn');

  const runawayPhrases = [
    "'No' is disabled by Java compiler! ☕",
    "Catch me if you can! 🏃‍♀️✨",
    "Oops! 'No' button jumped to safe harbor! ⚓",
    "Here 'No' option throws an error! 😂",
    "Only 'YES' has O(1) time complexity! 😉",
    "'No' is not on the syllabus! 👑",
    "The only right choice is YES! 💖"
  ];
  let runawayCount = 0;

  function moveNoButton() {
    if (!runawayNoBtn || !buttonsStage) return;

    const stageRect = buttonsStage.getBoundingClientRect();
    const noWidth = runawayNoBtn.offsetWidth || 100;
    const noHeight = runawayNoBtn.offsetHeight || 44;

    const maxX = Math.max(30, (stageRect.width / 2) - (noWidth / 2) - 10);
    const maxY = Math.max(20, (stageRect.height / 2) - (noHeight / 2) - 8);

    const randomX = (Math.random() * (maxX * 2) - maxX);
    const randomY = (Math.random() * (maxY * 2) - maxY);

    runawayNoBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.95)`;
    playSoundEffect(850 + Math.random() * 200, 'triangle', 0.1, 0.08);

    if (runawayHint) {
      runawayHint.textContent = `"${runawayPhrases[runawayCount % runawayPhrases.length]}"`;
      runawayHint.classList.add('text-pink-300', 'font-semibold');
    }
    runawayCount++;
  }

  if (runawayNoBtn) {
    runawayNoBtn.addEventListener('mouseenter', moveNoButton);
    runawayNoBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      moveNoButton();
    }, { passive: false });
    runawayNoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      moveNoButton();
    });
  }

  if (agreementYesBtn) {
    agreementYesBtn.addEventListener('click', () => {
      playSoundEffect(659, 'sine', 0.3);
      if (confirmationModal) {
        confirmationModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
      }
    });
  }

  function triggerGrandCelebration() {
    if (confirmationModal) confirmationModal.classList.add('hidden');
    if (celebrationModal) {
      celebrationModal.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }

    playSoundEffect(523, 'triangle', 0.4);
    setTimeout(() => playSoundEffect(659, 'sine', 0.4), 120);
    setTimeout(() => playSoundEffect(784, 'sine', 0.5), 240);

    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#fb7185', '#f43f5e', '#fbbf24']
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 80,
          origin: { x: 0 },
          colors: ['#38bdf8', '#fbbf24']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 80,
          origin: { x: 1 },
          colors: ['#f43f5e', '#38bdf8']
        });
      }, 300);
    }
  }

  if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', triggerGrandCelebration);
  if (modalYesTooBtn) modalYesTooBtn.addEventListener('click', triggerGrandCelebration);
  
  if (closeCelebrationBtn) {
    closeCelebrationBtn.addEventListener('click', () => {
      if (celebrationModal) celebrationModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    });
  }

  // Close modals on backdrop click or ESC key
  [confirmationModal, celebrationModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          document.body.classList.remove('modal-open');
        }
      });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      if (confirmationModal) confirmationModal.classList.add('hidden');
      if (celebrationModal) celebrationModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  });


  // ========================================================
  // 7. WAX-SEALED SECRET LETTER UNLOCK (IDEMPOTENT FIX)
  // ========================================================
  const waxSeal = document.getElementById('wax-seal');
  const envelopeClosed = document.getElementById('envelope-closed');
  const envelopeOpen = document.getElementById('envelope-open');
  const sendReactionBtn = document.getElementById('send-reaction-btn');
  let letterOpened = false;

  function openLetter(e) {
    if (e) e.stopPropagation();
    if (letterOpened) return;
    letterOpened = true;

    playSoundEffect(587, 'triangle', 0.4);
    setTimeout(() => playSoundEffect(880, 'sine', 0.5), 150);

    if (envelopeClosed) envelopeClosed.classList.add('hidden');
    if (envelopeOpen) {
      envelopeOpen.classList.remove('hidden');
      envelopeOpen.classList.add('animate-unfold');
    }

    if (window.confetti) {
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fb7185', '#f43f5e']
      });
    }
  }

  if (waxSeal) {
    waxSeal.addEventListener('click', openLetter);
  } else if (envelopeClosed) {
    envelopeClosed.addEventListener('click', openLetter);
  }

  if (sendReactionBtn) {
    sendReactionBtn.addEventListener('click', () => {
      sendReactionBtn.innerHTML = `<span>Sent with Love ❤️</span>`;
      sendReactionBtn.classList.remove('bg-rose-600', 'hover:bg-rose-500');
      sendReactionBtn.classList.add('bg-pink-600', 'hover:bg-pink-500', 'pointer-events-none', 'opacity-90');
      playSoundEffect(784, 'sine', 0.3);
      if (window.confetti) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#38bdf8', '#f43f5e']
        });
      }
    });
  }


  // ========================================================
  // 8. AUDIO SOUND EFFECTS & SOUNDTRACK FADING
  // ========================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSoundEffect(freq, type = 'sine', duration = 0.2, volume = 0.1) {
    try {
      initAudioContext();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.015); // 15ms attack ramp eliminates clicks
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  const bgAudio = document.getElementById('bg-audio');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioStatusText = document.getElementById('audio-status-text');
  const audioVisualizer = document.getElementById('audio-visualizer');
  let isAudioPlaying = false;
  let audioFadeInterval = null;

  function fadeAudioIn(targetVol = 0.65, durationMs = 800) {
    if (!bgAudio) return;
    clearInterval(audioFadeInterval);
    bgAudio.volume = 0;
    bgAudio.play().then(() => {
      isAudioPlaying = true;
      updateAudioUI(true);
      const stepTime = 40;
      const steps = durationMs / stepTime;
      const volStep = targetVol / steps;
      audioFadeInterval = setInterval(() => {
        if (bgAudio.volume + volStep >= targetVol) {
          bgAudio.volume = targetVol;
          clearInterval(audioFadeInterval);
        } else {
          bgAudio.volume += volStep;
        }
      }, stepTime);
    }).catch(() => {});
  }

  function fadeAudioOut(durationMs = 600) {
    if (!bgAudio || !isAudioPlaying) return;
    clearInterval(audioFadeInterval);
    const startVol = bgAudio.volume;
    const stepTime = 40;
    const steps = durationMs / stepTime;
    const volStep = startVol / steps;
    audioFadeInterval = setInterval(() => {
      if (bgAudio.volume - volStep <= 0.02) {
        bgAudio.volume = 0;
        bgAudio.pause();
        isAudioPlaying = false;
        updateAudioUI(false);
        clearInterval(audioFadeInterval);
      } else {
        bgAudio.volume -= volStep;
      }
    }, stepTime);
  }

  function updateAudioUI(playing) {
    if (audioIcon) audioIcon.textContent = playing ? "🔊" : "🎵";
    if (audioStatusText) audioStatusText.textContent = playing ? "Playing Melody" : "Play Melody";
    if (audioVisualizer) {
      if (playing) {
        audioVisualizer.classList.remove('hidden');
        audioVisualizer.classList.add('flex');
      } else {
        audioVisualizer.classList.add('hidden');
        audioVisualizer.classList.remove('flex');
      }
    }
    if (audioToggleBtn) {
      if (playing) {
        audioToggleBtn.classList.add('border-lime-400', 'bg-lime-950/80');
      } else {
        audioToggleBtn.classList.remove('border-lime-400', 'bg-lime-950/80');
      }
    }
  }

  function startMusicTrack() {
    if (bgAudio && !isAudioPlaying) {
      fadeAudioIn();
    }
  }

  function toggleMusicTrack() {
    if (!bgAudio) return;
    if (isAudioPlaying) {
      fadeAudioOut();
    } else {
      fadeAudioIn();
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleMusicTrack);
  }

  window.startMusicTrack = startMusicTrack;


  // ========================================================
  // 9. SUBTLE DESKTOP SPARKLE CURSOR TRAIL (FINE POINTERS ONLY)
  // ========================================================
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let lastSparkleTime = 0;
    const sparkleColors = ['#38bdf8', '#fb7185', '#f43f5e', '#fcd34d', '#ffffff'];

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSparkleTime < 55) return;
      lastSparkleTime = now;

      const p = document.createElement('div');
      p.className = 'sparkle-particle';
      const size = Math.random() * 6 + 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${e.clientX}px`;
      p.style.top = `${e.clientY}px`;
      p.style.backgroundColor = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      p.style.boxShadow = `0 0 8px ${p.style.backgroundColor}`;
      document.body.appendChild(p);

      setTimeout(() => p.remove(), 750);
    }, { passive: true });
  }

});
