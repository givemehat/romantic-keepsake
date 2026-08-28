/**
 * Medhavie's Dedicated Web App
 * Features: Classic Love Tree Canvas Engine, Particle System, Typewriter, 
 * Polaroid Gallery, PIN Vault, Stress-Relief Oasis, Java DSA Console, Trivia Quiz, 
 * Runaway "No" Button & Web Audio Synthesis.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 0. CLASSIC LOVE TREE CANVAS ENGINE (ES6 MODERNIZED)
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
      for (let i = 10; i < 30; i += 0.2) {
        const t = i / Math.PI;
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
      ctx.shadowColor = 'rgba(244, 63, 94, 0.8)';
      ctx.shadowBlur = 15;
      ctx.translate(this.point.x, this.point.y);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 0; i < this.figure.length; i++) {
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
    hover(x, y) {
      const dx = x - this.point.x;
      const dy = y - this.point.y;
      return Math.sqrt(dx * dx + dy * dy) < 45;
    }
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
      ctx.strokeStyle = '#a3c28d';
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 8;
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
        this.radius *= 0.975;
      } else {
        this.tree.removeBranch(this);
        this.tree.addBranchData(this.subBranches);
      }
    }
    draw(p) {
      const ctx = this.tree.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = '#a3c28d';
      ctx.shadowColor = '#657e55';
      ctx.shadowBlur = 4;
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
      const hues = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#e11d48', '#84cc16', '#fbbf24'];
      this.color = color || hues[Math.floor(Math.random() * hues.length)];
      this.alpha = alpha || (Math.random() * 0.6 + 0.4);
      this.angle = Math.random() * Math.PI * 2;
      this.scale = scale || 0.1;
      this.maxScale = Math.random() * 0.6 + 0.6;
      this.place = place;
      this.speed = speed;
    }
    flower() {
      this.draw();
      this.scale += 0.06;
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
      ctx.shadowBlur = 6;
      ctx.translate(this.point.x, this.point.y);
      ctx.scale(this.scale, this.scale);
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 0; i < this.figure.length; i++) {
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
        this.angle += 0.04;
        this.speed = Math.max(10, this.speed - 0.5);
      }
    }
  }

  class LoveTree {
    constructor(canvas, width = 1100, height = 680) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = width;
      this.height = height;

      this.seed = new TreeSeed(this, new Point(width / 2, height / 2 + 30));
      this.footer = new TreeFooter(this, width, 4, 12);
      this.branches = [];
      this.blooms = [];
      this.bloomsCache = [];
      this.figure = this.seed.figure;
      this.initBranchesData();
      this.initBloomsCache(450);
    }

    initBranchesData() {
      const cx = this.width / 2;
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
      const r = 210;
      const w = this.width;
      const h = this.height;
      for (let i = 0; i < num; i++) {
        let x, y;
        while (true) {
          x = random(40, w - 40);
          y = random(40, h - 100);
          if (inHeart(x - w / 2, h - (h - 60) / 2 - y, r)) {
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

    jump() {
      for (let i = 0; i < this.blooms.length; i++) {
        this.blooms[i].jump();
      }
      if (this.blooms.length < 15) {
        const r = 210;
        const w = this.width;
        const h = this.height;
        for (let i = 0; i < random(1, 3); i++) {
          let x = random(w / 2 - 200, w / 2 + 200);
          let y = random(100, 400);
          const target = new Point(random(-50, w + 50), h + 40);
          this.blooms.push(new TreeBloom(this, new Point(x, y), this.figure, null, 0.9, 0.8, target, random(140, 220)));
        }
      }
    }
  }

  const treeCanvas = document.getElementById('tree-canvas');
  let treeApp = null;
  let treeStarted = false;

  function initLoveTree() {
    if (!treeCanvas) return;
    treeCanvas.width = 1100;
    treeCanvas.height = 680;
    treeApp = new LoveTree(treeCanvas, 1100, 680);
    treeCanvas.classList.add('clickable-seed');
    renderSeedPulsing();
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

  const seedInstruction = document.getElementById('seed-instruction');
  const treeTextOverlay = document.getElementById('tree-text-overlay');
  const postBloomReveal = document.getElementById('post-bloom-reveal');

  async function startTreeSequence() {
    if (treeStarted) return;
    treeStarted = true;
    cancelAnimationFrame(seedAnimId);
    treeCanvas.classList.remove('clickable-seed');

    if (seedInstruction) {
      seedInstruction.style.opacity = '0';
      setTimeout(() => seedInstruction.remove(), 700);
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

    while (treeApp.canFlower()) {
      treeApp.flower(3);
      await sleep(12);
    }

    if (treeTextOverlay) {
      treeTextOverlay.classList.remove('hidden');
      const lines = treeTextOverlay.querySelectorAll('.typewriter-line');
      lines.forEach((line) => {
        const delay = parseInt(line.getAttribute('data-delay') || '0', 10);
        setTimeout(() => {
          line.classList.add('visible');
          playSoundEffect(660, 'sine', 0.08);
        }, delay);
      });
    }

    if (postBloomReveal) {
      setTimeout(() => {
        postBloomReveal.classList.remove('opacity-0', 'translate-y-6');
        postBloomReveal.classList.add('opacity-100', 'translate-y-0');
      }, 2500);
    }

    function loopJump() {
      treeApp.jump();
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
  // 1. BACKGROUND ROSE PETALS & OLIVE-GOLD STARDUST CANVAS
  // ========================================================
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');
  let bgWidth, bgHeight;
  let bgParticles = [];

  function initBgCanvas() {
    bgWidth = bgCanvas.width = window.innerWidth;
    bgHeight = bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', initBgCanvas);
  initBgCanvas();

  class BgParticle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * bgWidth;
      this.y = initial ? Math.random() * bgHeight : -20;
      this.size = Math.random() * 8 + 5;
      this.speedY = Math.random() * 1.0 + 0.5;
      this.speedX = Math.random() * 1.2 - 0.6;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.025;
      this.isPetal = Math.random() > 0.4;
      this.opacity = Math.random() * 0.4 + 0.25;
      this.color = this.isPetal 
        ? `rgba(${220 + Math.random() * 35}, ${50 + Math.random() * 40}, ${90 + Math.random() * 40}, ${this.opacity})`
        : `rgba(163, 194, 141, ${this.opacity * 0.9})`;
    }
    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.7 + this.speedX;
      this.angle += this.spinSpeed;
      if (this.y > bgHeight + 20 || this.x < -30 || this.x > bgWidth + 30) {
        this.reset(false);
      }
    }
    draw() {
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
        bgCtx.shadowColor = 'rgba(163, 194, 141, 0.8)';
        bgCtx.shadowBlur = 6;
        bgCtx.beginPath();
        bgCtx.arc(0, 0, this.size * 0.22, 0, Math.PI * 2);
        bgCtx.fill();
      }
      bgCtx.restore();
    }
  }

  const pCount = window.innerWidth < 640 ? 25 : 50;
  for (let i = 0; i < pCount; i++) bgParticles.push(new BgParticle());

  function animateBg() {
    bgCtx.clearRect(0, 0, bgWidth, bgHeight);
    for (let p of bgParticles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateBg);
  }
  animateBg();


  // ========================================================
  // 2. TIMELINE COUNTER (KNOWN SINCE SEPT 6, 2024)
  // ========================================================
  const knownDate = new Date('2024-09-06T00:00:00');

  function updateTimeline() {
    const now = new Date();
    const diff = Math.max(0, now - knownDate);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const daysEl = document.getElementById('days-count');
    const hoursEl = document.getElementById('hours-count');
    const minsEl = document.getElementById('mins-count');
    const secsEl = document.getElementById('secs-count');

    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minsEl) minsEl.textContent = mins;
    if (secsEl) secsEl.textContent = secs;

    const treeClockText = document.getElementById('tree-clock-text');
    if (treeClockText) {
      treeClockText.textContent = `${days} Days • ${hours} Hours • ${mins} Mins • ${secs} Secs`;
    }
  }
  setInterval(updateTimeline, 1000);
  updateTimeline();


  // ========================================================
  // 3. NICKNAMES CYCLER
  // ========================================================
  const nicknames = [
    '"Medu Vada" 🥟',
    '"Mahadevi" 👑',
    '"Punjab State Cricketer" 🏏',
    '"Cadet Medhavie" 🎖️',
    '"Java DSA Ninja" ☕',
    '"Leader & Champion" ✨'
  ];
  let nicknameIndex = 0;
  const nicknameTrigger = document.getElementById('nickname-trigger');
  const currentNickname = document.getElementById('current-nickname');

  if (nicknameTrigger && currentNickname) {
    nicknameTrigger.addEventListener('click', () => {
      nicknameIndex = (nicknameIndex + 1) % nicknames.length;
      currentNickname.style.opacity = '0';
      playSoundEffect(520, 'sine', 0.1);
      setTimeout(() => {
        currentNickname.textContent = nicknames[nicknameIndex];
        currentNickname.style.opacity = '1';
      }, 150);
    });
  }


  // ========================================================
  // 4. INTERACTIVE PILLARS (CRICKET, SALUTE, ROSES)
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
          colors: ['#84cc16', '#a3c28d', '#ffffff']
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
        setTimeout(() => playSoundEffect(freq, 'sawtooth', 0.2, 0.08), idx * 110);
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
  // 5. SECRET PASSCODE PIN VAULT LOGIC
  // ========================================================
  const pinInputs = [
    document.getElementById('pin-1'),
    document.getElementById('pin-2'),
    document.getElementById('pin-3'),
    document.getElementById('pin-4')
  ];
  const pinUnlockBtn = document.getElementById('pin-unlock-btn');
  const pinErrorMsg = document.getElementById('pin-error-msg');
  const vaultModal = document.getElementById('vault-modal');
  const closeVaultBtn = document.getElementById('close-vault-btn');

  // Auto-focus next input box as user types
  pinInputs.forEach((input, index) => {
    if (!input) return;
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1 && index < pinInputs.length - 1) {
        pinInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        pinInputs[index - 1].focus();
      }
      if (e.key === 'Enter') {
        checkPinCode();
      }
    });
  });

  function checkPinCode() {
    const enteredPin = pinInputs.map(i => i.value).join('');
    // Accepts: '0609' (6 Sept) OR '2302' (23 Feb)
    if (enteredPin === '0609' || enteredPin === '2302') {
      if (pinErrorMsg) pinErrorMsg.classList.add('hidden');
      playSoundEffect(523, 'triangle', 0.3);
      setTimeout(() => playSoundEffect(659, 'sine', 0.3), 100);
      setTimeout(() => playSoundEffect(784, 'sine', 0.4), 200);

      if (vaultModal) vaultModal.classList.remove('hidden');

      if (window.confetti) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#84cc16']
        });
      }
    } else {
      if (pinErrorMsg) pinErrorMsg.classList.remove('hidden');
      pinInputs.forEach(i => {
        i.classList.add('pin-shake');
        setTimeout(() => i.classList.remove('pin-shake'), 500);
      });
      playSoundEffect(220, 'sawtooth', 0.2);
    }
  }

  if (pinUnlockBtn) pinUnlockBtn.addEventListener('click', checkPinCode);
  if (closeVaultBtn) {
    closeVaultBtn.addEventListener('click', () => {
      if (vaultModal) vaultModal.classList.add('hidden');
    });
  }


  // ========================================================
  // 6. DE-STRESS ZONE (BREATHING & BUBBLE WRAP)
  // ========================================================
  const breathCircle = document.getElementById('breath-circle');
  const breathText = document.getElementById('breath-text');
  const breathTimer = document.getElementById('breath-timer');
  const toggleBreatheBtn = document.getElementById('toggle-breathe-btn');
  let isBreathingActive = false;
  let breathInterval = null;
  let breathState = 'inhale';
  let secondsRemaining = 4;

  function runBreathStep() {
    if (!isBreathingActive) return;

    if (secondsRemaining > 0) {
      if (breathTimer) breathTimer.textContent = `${secondsRemaining}s`;
      secondsRemaining--;
    } else {
      if (breathState === 'inhale') {
        breathState = 'hold';
        secondsRemaining = 7;
        if (breathText) breathText.textContent = "Hold Breath 🧘‍♀️";
        if (breathCircle) {
          breathCircle.className = "absolute inset-0 rounded-full border-2 border-amber-400/50 bg-amber-500/20 backdrop-blur-md transition-all duration-700 flex items-center justify-center shadow-xl shadow-amber-500/20 breathe-hold";
        }
        playSoundEffect(440, 'sine', 0.2);
      } else if (breathState === 'hold') {
        breathState = 'exhale';
        secondsRemaining = 8;
        if (breathText) breathText.textContent = "Exhale Tension 💨";
        if (breathCircle) {
          breathCircle.className = "absolute inset-0 rounded-full border-2 border-blue-400/50 bg-blue-500/20 backdrop-blur-md transition-all duration-1000 flex items-center justify-center shadow-xl shadow-blue-500/20 breathe-contract";
        }
        playSoundEffect(330, 'sine', 0.3);
      } else {
        breathState = 'inhale';
        secondsRemaining = 4;
        if (breathText) breathText.textContent = "Breathe In 🌸";
        if (breathCircle) {
          breathCircle.className = "absolute inset-0 rounded-full border-2 border-lime-400/50 bg-lime-500/20 backdrop-blur-md transition-all duration-1000 flex items-center justify-center shadow-xl shadow-lime-500/20 breathe-expand";
        }
        playSoundEffect(523, 'sine', 0.2);
      }
      if (breathTimer) breathTimer.textContent = `${secondsRemaining}s`;
      secondsRemaining--;
    }
  }

  if (toggleBreatheBtn) {
    toggleBreatheBtn.addEventListener('click', () => {
      isBreathingActive = !isBreathingActive;
      if (isBreathingActive) {
        toggleBreatheBtn.textContent = "Pause Session ⏸️";
        toggleBreatheBtn.classList.replace('bg-lime-500/20', 'bg-amber-500/20');
        breathState = 'inhale';
        secondsRemaining = 4;
        if (breathText) breathText.textContent = "Breathe In 🌸";
        if (breathCircle) breathCircle.classList.add('breathe-expand');
        breathInterval = setInterval(runBreathStep, 1000);
      } else {
        toggleBreatheBtn.textContent = "Resume Session ▶️";
        toggleBreatheBtn.classList.replace('bg-amber-500/20', 'bg-lime-500/20');
        clearInterval(breathInterval);
        if (breathText) breathText.textContent = "Paused";
        if (breathTimer) breathTimer.textContent = "--";
      }
    });
  }

  const stressBubbles = [
    { title: "Exam / Career Pressure", note: "You have an exceptionally sharp mind and top-tier resilience. One step at a time, Medhavie! 🌟", icon: "📚" },
    { title: "Carrying Everything Alone", note: "You don't always have to be the strongest in the room. It's okay to lean back and rest. 🤍", icon: "🫂" },
    { title: "Self-Doubt Moments", note: "Remember: You played state cricket for Punjab and lead in NCC! You are a born warrior! 🏏", icon: "👑" },
    { title: "Overthinking The Future", note: "Time Complexity of current worry = O(0). Focus on today's peace, the rest will align. ☕", icon: "💻" },
    { title: "Fear of Failing Expectations", note: "You are doing great just as you are. Your worth is never tied to perfection. 🌹", icon: "✨" },
    { title: "Midnight Restlessness", note: "Medu Vada, drink some water, take a deep breath, and let your mind unwind. 🌙", icon: "🥟" }
  ];

  const bubblesGrid = document.getElementById('bubbles-grid');
  const revealedIcon = document.getElementById('revealed-icon');
  const revealedText = document.getElementById('revealed-text');
  const resetBubblesBtn = document.getElementById('reset-bubbles-btn');

  function renderBubbles() {
    if (!bubblesGrid) return;
    bubblesGrid.innerHTML = '';
    stressBubbles.forEach((item, index) => {
      const bubble = document.createElement('button');
      bubble.className = 'stress-bubble flex items-center justify-between p-3 rounded-xl border';
      bubble.innerHTML = `
        <span class="truncate">${item.title}</span>
        <span class="text-sm">🫧</span>
      `;
      bubble.addEventListener('click', () => {
        if (!bubble.classList.contains('popped')) {
          bubble.classList.add('popped');
          bubble.innerHTML = `
            <span class="truncate text-lime-300">Popped! ✓</span>
            <span class="text-sm">✨</span>
          `;
          playSoundEffect(800 + index * 60, 'sine', 0.15);
          if (revealedIcon) revealedIcon.textContent = item.icon;
          if (revealedText) revealedText.textContent = `"${item.note}"`;
        }
      });
      bubblesGrid.appendChild(bubble);
    });
  }
  renderBubbles();

  if (resetBubblesBtn) {
    resetBubblesBtn.addEventListener('click', () => {
      renderBubbles();
      if (revealedText) revealedText.textContent = `"Pop a bubble above whenever a heavy thought tries to cloud your smile."`;
      if (revealedIcon) revealedIcon.textContent = "💡";
      playSoundEffect(400, 'sine', 0.1);
    });
  }


  // ========================================================
  // 7. JAVA DSA INTERACTIVE TERMINAL
  // ========================================================
  const runJavaBtn = document.getElementById('run-java-btn');
  const optimizeBtn = document.getElementById('optimize-stress-btn');
  const terminalOutput = document.getElementById('terminal-output');

  if (runJavaBtn && terminalOutput) {
    runJavaBtn.addEventListener('click', () => {
      terminalOutput.innerHTML = '';
      const lines = [
        `$ javac Medhavie.java`,
        `[OK] Compiled successfully (0 warnings, 0 errors)`,
        `$ java Medhavie`,
        `>> Loading Attributes: [Punjab Cricket 🏏, NCC Cadet 🎖️, Java Master ☕]`,
        `>> Soul Status: Deep, Compassionate & Resilient 🌹`,
        `>> Checking Stress Levels: High Ambition Detected... Applying Calm Protocol.`,
        `>> Output: "Medhavie, you are destined for wonderful things. Keep your head high!" ✨`
      ];

      lines.forEach((line, i) => {
        setTimeout(() => {
          const p = document.createElement('p');
          p.className = i >= 3 ? 'text-lime-300' : 'text-stone-300';
          p.textContent = line;
          terminalOutput.appendChild(p);
          playSoundEffect(300 + i * 80, 'sine', 0.08);
        }, i * 300);
      });
    });
  }

  if (optimizeBtn && terminalOutput) {
    optimizeBtn.addEventListener('click', () => {
      terminalOutput.innerHTML = '';
      const lines = [
        `$ jcmd Medhavie GC.run --target=Overthinking`,
        `[INFO] Garbage Collector started...`,
        `[INFO] Freed 100% of unnecessary doubts & tension.`,
        `[INFO] Allocated: Infinite Confidence & Peaceful Heart ❤️`,
        `>> Stress Space Complexity optimized to O(0).`
      ];
      lines.forEach((line, i) => {
        setTimeout(() => {
          const p = document.createElement('p');
          p.className = 'text-cyan-300';
          p.textContent = line;
          terminalOutput.appendChild(p);
          playSoundEffect(450 + i * 90, 'triangle', 0.08);
        }, i * 250);
      });
    });
  }


  // ========================================================
  // 8. THE MEDHAVIE TRIVIA QUIZ
  // ========================================================
  const quizData = [
    {
      question: "Which state cricket jersey belongs to Medhavie's proud journey?",
      options: ["Punjab 🏏", "Delhi", "Maharashtra", "Karnataka"],
      correct: 0,
      expl: "Correct! She represented Punjab at state level with pure grit!"
    },
    {
      question: "What makes Medhavie's leadership shine the brightest?",
      options: ["NCC Cadet Spirit 🎖️", "Quiet Patience", "Fearless Honesty", "All of the above ⭐"],
      correct: 3,
      expl: "Spot on! Her leadership is multifaceted and commanding."
    },
    {
      question: "What is Medhavie's best defense against life's complex problems?",
      options: ["Java DSA & Pure Logic 💻", "Giving Up", "Overthinking", "Ignoring"],
      correct: 0,
      expl: "Exactly! Sharp analytical logic is her natural superpower."
    },
    {
      question: "What should Medhavie remember whenever she feels overwhelmed?",
      options: ["She has survived 100% of storms and is deeply valued 🌸", "Take more stress", "Stay silent", "None"],
      correct: 0,
      expl: "Always remember this, Mahadevi. You are precious beyond words."
    }
  ];

  let currentQuestion = 0;
  let score = 0;

  const quizProgress = document.getElementById('quiz-progress');
  const quizScoreBadge = document.getElementById('quiz-score-badge');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizContainer = document.getElementById('quiz-container');
  const quizComplete = document.getElementById('quiz-complete');
  const quizRestartBtn = document.getElementById('quiz-restart-btn');

  function loadQuizQuestion() {
    if (!quizQuestion) return;
    const q = quizData[currentQuestion];
    quizProgress.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    quizScoreBadge.textContent = `Score: ${score}`;
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = '';
    quizFeedback.className = 'hidden';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'p-3 text-left rounded-xl bg-[#121c13] border border-lime-800/40 hover:border-lime-400 text-xs sm:text-sm text-stone-200 transition-all';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(idx));
      quizOptions.appendChild(btn);
    });
  }

  function handleAnswer(selectedIdx) {
    const q = quizData[currentQuestion];
    const isCorrect = selectedIdx === q.correct;
    
    if (isCorrect) {
      score++;
      playSoundEffect(600, 'sine', 0.2);
    } else {
      playSoundEffect(250, 'sawtooth', 0.2);
    }

    quizFeedback.className = isCorrect 
      ? 'p-3 rounded-xl text-xs font-medium bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 block'
      : 'p-3 rounded-xl text-xs font-medium bg-rose-950/60 border border-rose-500/40 text-rose-300 block';
    quizFeedback.textContent = q.expl;

    const buttons = quizOptions.querySelectorAll('button');
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add('bg-emerald-900/60', 'border-emerald-500');
    });

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < quizData.length) {
        loadQuizQuestion();
      } else {
        showQuizResults();
      }
    }, 1500);
  }

  function showQuizResults() {
    if (quizContainer) quizContainer.classList.add('hidden');
    if (quizComplete) quizComplete.classList.remove('hidden');

    if (window.confetti) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  }

  if (quizRestartBtn) {
    quizRestartBtn.addEventListener('click', () => {
      currentQuestion = 0;
      score = 0;
      if (quizComplete) quizComplete.classList.add('hidden');
      if (quizContainer) quizContainer.classList.remove('hidden');
      loadQuizQuestion();
    });
  }
  loadQuizQuestion();


  // ========================================================
  // 9. THE PLAYFUL RUNAWAY 'NO' BUTTON & CONFIRMATION FLOW
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
    "Medu Vada, 'No' is disabled by Java compiler! ☕",
    "Catch me if you can, State Cricketer! 🏃‍♀️🏏",
    "Oops! 'No' button jumped to safe harbor! ⚓",
    "Rajnish ke samne 'No' option error throw karta hai! 😂",
    "Punjab batting line-up doesn't give up! 💪",
    "Only 'YES' has O(1) time complexity! 😉",
    "Mahadevi, 'No' is not on the syllabus! 👑"
  ];
  let runawayCount = 0;

  function moveNoButton() {
    if (!runawayNoBtn || !buttonsStage) return;

    const stageRect = buttonsStage.getBoundingClientRect();
    const maxX = (stageRect.width / 2) - 50;
    const maxY = (stageRect.height / 2) - 20;

    const randomX = (Math.random() * (maxX * 2) - maxX);
    const randomY = (Math.random() * (maxY * 2) - maxY);

    runawayNoBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(0.95)`;
    playSoundEffect(850 + Math.random() * 200, 'triangle', 0.1, 0.08);

    if (runawayHint) {
      runawayHint.textContent = `"${runawayPhrases[runawayCount % runawayPhrases.length]}"`;
      runawayHint.classList.add('text-lime-300', 'font-semibold');
    }
    runawayCount++;
  }

  if (runawayNoBtn) {
    runawayNoBtn.addEventListener('mouseenter', moveNoButton);
    runawayNoBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      moveNoButton();
    });
    runawayNoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      moveNoButton();
    });
  }

  if (agreementYesBtn) {
    agreementYesBtn.addEventListener('click', () => {
      playSoundEffect(659, 'sine', 0.3);
      if (confirmationModal) confirmationModal.classList.remove('hidden');
    });
  }

  function triggerGrandCelebration() {
    if (confirmationModal) confirmationModal.classList.add('hidden');
    if (celebrationModal) celebrationModal.classList.remove('hidden');

    playSoundEffect(523, 'triangle', 0.4);
    setTimeout(() => playSoundEffect(659, 'sine', 0.4), 120);
    setTimeout(() => playSoundEffect(784, 'sine', 0.5), 240);

    if (window.confetti) {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#84cc16', '#a3c28d', '#f43f5e', '#fbbf24']
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 80,
          origin: { x: 0 },
          colors: ['#84cc16', '#eab308']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 80,
          origin: { x: 1 },
          colors: ['#f43f5e', '#a3c28d']
        });
      }, 300);
    }
  }

  if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', triggerGrandCelebration);
  if (modalYesTooBtn) modalYesTooBtn.addEventListener('click', triggerGrandCelebration);
  
  if (closeCelebrationBtn) {
    closeCelebrationBtn.addEventListener('click', () => {
      if (celebrationModal) celebrationModal.classList.add('hidden');
    });
  }


  // ========================================================
  // 10. WAX-SEALED SECRET LETTER UNLOCK
  // ========================================================
  const waxSeal = document.getElementById('wax-seal');
  const envelopeClosed = document.getElementById('envelope-closed');
  const envelopeOpen = document.getElementById('envelope-open');
  const sendReactionBtn = document.getElementById('send-reaction-btn');

  function openLetter() {
    playSoundEffect(587, 'triangle', 0.4);
    setTimeout(() => playSoundEffect(880, 'sine', 0.5), 150);

    if (envelopeClosed) envelopeClosed.classList.add('hidden');
    if (envelopeOpen) envelopeOpen.classList.remove('hidden');

    if (window.confetti) {
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#84cc16', '#a3c28d', '#f43f5e']
      });
    }
  }

  if (waxSeal) waxSeal.addEventListener('click', openLetter);
  if (envelopeClosed) envelopeClosed.addEventListener('click', openLetter);

  if (sendReactionBtn) {
    sendReactionBtn.addEventListener('click', () => {
      sendReactionBtn.innerHTML = `<span>Sent with Love ❤️</span>`;
      sendReactionBtn.classList.replace('bg-emerald-700', 'bg-lime-700');
      playSoundEffect(784, 'sine', 0.3);
      if (window.confetti) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#84cc16', '#f43f5e']
        });
      }
    });
  }


  // ========================================================
  // 11. WEB AUDIO AMBIENT SOUND GENERATOR & VISUALIZER
  // ========================================================
  let audioCtx = null;
  let isAudioPlaying = false;
  let audioTimer = null;
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioStatusText = document.getElementById('audio-status-text');
  const audioVisualizer = document.getElementById('audio-visualizer');

  const calmChords = [
    [370.0, 440.0, 554.37, 659.25],
    [329.63, 415.30, 493.88, 659.25],
    [293.66, 370.0, 440.0, 554.37],
    [329.63, 392.0, 493.88, 587.33]
  ];
  let chordIndex = 0;

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
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playAmbientChord() {
    if (!isAudioPlaying || !audioCtx) return;

    const chord = calmChords[chordIndex];
    chordIndex = (chordIndex + 1) % calmChords.length;

    chord.forEach((freq, idx) => {
      setTimeout(() => {
        if (!isAudioPlaying) return;
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

          const now = audioCtx.currentTime;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.025, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(now);
          osc.stop(now + 4.0);
        } catch (e) {}
      }, idx * 180);
    });

    audioTimer = setTimeout(playAmbientChord, 3800);
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      initAudioContext();
      isAudioPlaying = !isAudioPlaying;

      if (isAudioPlaying) {
        if (audioIcon) audioIcon.textContent = "🔊";
        if (audioStatusText) audioStatusText.textContent = "Playing Melody";
        if (audioVisualizer) {
          audioVisualizer.classList.remove('hidden');
          audioVisualizer.classList.add('flex');
        }
        audioToggleBtn.classList.add('border-lime-400', 'bg-lime-950/80');
        playAmbientChord();
      } else {
        if (audioIcon) audioIcon.textContent = "🎵";
        if (audioStatusText) audioStatusText.textContent = "Play Melody";
        if (audioVisualizer) {
          audioVisualizer.classList.add('hidden');
          audioVisualizer.classList.remove('flex');
        }
        audioToggleBtn.classList.remove('border-lime-400', 'bg-lime-950/80');
        if (audioTimer) clearTimeout(audioTimer);
      }
    });
  }

});
