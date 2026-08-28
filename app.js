/**
 * Medhavie's Personalized Web Experience
 * Interactive scripts, canvas particle engine, sound synthesizer & stress buster
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 1. ROSE PETALS & PARTICLES CANVAS ENGINE
  // ========================================================
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', initCanvas);
  initCanvas();

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 1.2 + 0.6;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.03;
      this.isPetal = Math.random() > 0.3; // 70% petals, 30% golden stars
      this.opacity = Math.random() * 0.5 + 0.3;
      this.color = this.isPetal 
        ? `rgba(${220 + Math.random() * 35}, ${50 + Math.random() * 40}, ${90 + Math.random() * 40}, ${this.opacity})`
        : `rgba(251, 191, 36, ${this.opacity * 0.8})`;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.angle) * 0.8 + this.speedX;
      this.angle += this.spinSpeed;

      if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.isPetal) {
        // Draw Soft Rose Petal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size / 2, -this.size * 1.2, 0, -this.size * 1.5);
        ctx.bezierCurveTo(this.size / 2, -this.size * 1.2, this.size, -this.size / 2, 0, 0);
        ctx.fill();
      } else {
        // Draw Golden Stardust
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Populate particles
  const particleCount = window.innerWidth < 640 ? 30 : 60;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();


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
  
  // Cricket Shot Button
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
      
      // Play triumphant chord
      shot.sound.forEach((freq, i) => {
        setTimeout(() => playSoundEffect(freq, 'triangle', 0.25), i * 70);
      });

      if (window.confetti) {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff']
        });
      }
    });
  }

  // Salute Button
  const saluteBtn = document.getElementById('salute-btn');
  const saluteStatus = document.getElementById('salute-status');
  if (saluteBtn && saluteStatus) {
    saluteBtn.addEventListener('click', () => {
      saluteStatus.textContent = "🫡 Jai Hind!";
      // Play brass salute triad
      [392, 523, 659, 784].forEach((freq, idx) => {
        setTimeout(() => playSoundEffect(freq, 'sawtooth', 0.2, 0.08), idx * 110);
      });
      if (window.confetti) {
        confetti({
          particleCount: 30,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#ff9933', '#ffffff', '#138808'] // Indian tricolor
        });
      }
    });
  }

  // Rose Shower Button
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
  // 5. DE-STRESS ZONE (BREATHING & BUBBLE WRAP)
  // ========================================================
  
  // 4-7-8 Breathing Guide
  const breathCircle = document.getElementById('breath-circle');
  const breathText = document.getElementById('breath-text');
  const breathTimer = document.getElementById('breath-timer');
  const toggleBreatheBtn = document.getElementById('toggle-breathe-btn');
  let isBreathingActive = false;
  let breathInterval = null;
  let breathState = 'inhale'; // inhale (4s), hold (7s), exhale (8s)
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
          breathCircle.className = "absolute inset-0 rounded-full border-2 border-emerald-400/50 bg-emerald-500/20 backdrop-blur-md transition-all duration-1000 flex items-center justify-center shadow-xl shadow-emerald-500/20 breathe-expand";
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
        toggleBreatheBtn.classList.replace('bg-emerald-500/20', 'bg-amber-500/20');
        breathState = 'inhale';
        secondsRemaining = 4;
        if (breathText) breathText.textContent = "Breathe In 🌸";
        if (breathCircle) breathCircle.classList.add('breathe-expand');
        breathInterval = setInterval(runBreathStep, 1000);
      } else {
        toggleBreatheBtn.textContent = "Resume Session ▶️";
        toggleBreatheBtn.classList.replace('bg-amber-500/20', 'bg-emerald-500/20');
        clearInterval(breathInterval);
        if (breathText) breathText.textContent = "Paused";
        if (breathTimer) breathTimer.textContent = "--";
      }
    });
  }

  // Pop The Overthinking Bubble Game
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
            <span class="truncate text-emerald-300">Popped! ✓</span>
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
  // 6. JAVA DSA INTERACTIVE TERMINAL
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
          p.className = i >= 3 ? 'text-emerald-300' : 'text-slate-300';
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
  // 7. THE MEDHAVIE TRIVIA QUIZ
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
      btn.className = 'p-3 text-left rounded-xl bg-slate-800/80 border border-slate-700 hover:border-rose-500 text-xs sm:text-sm text-slate-200 transition-all';
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

    // Disable all option buttons
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
  // 8. WAX-SEALED SECRET LETTER UNLOCK
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
        colors: ['#f43f5e', '#fb7185', '#ffe4e6']
      });
    }
  }

  if (waxSeal) waxSeal.addEventListener('click', openLetter);
  if (envelopeClosed) envelopeClosed.addEventListener('click', openLetter);

  if (sendReactionBtn) {
    sendReactionBtn.addEventListener('click', () => {
      sendReactionBtn.innerHTML = `<span>Sent with Love ❤️</span>`;
      sendReactionBtn.classList.replace('bg-rose-600', 'bg-emerald-600');
      playSoundEffect(784, 'sine', 0.3);
      if (window.confetti) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#e11d48', '#fb7185']
        });
      }
    });
  }


  // ========================================================
  // 9. WEB AUDIO AMBIENT SOUND GENERATOR (RELIABLE & SOOTHING)
  // ========================================================
  let audioCtx = null;
  let isAudioPlaying = false;
  let audioTimer = null;
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioStatusText = document.getElementById('audio-status-text');

  // Pentatonic warm calm scale chords (F# major / peaceful frequencies)
  const calmChords = [
    [370.0, 440.0, 554.37, 659.25], // F#m7
    [329.63, 415.30, 493.88, 659.25], // E
    [293.66, 370.0, 440.0, 554.37],  // Dmaj7
    [329.63, 392.0, 493.88, 587.33]  // Em7
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
    } catch (e) {
      // Audio context policy fallback
    }
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

          // Soft slow attack & gentle decay
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
        if (audioStatusText) audioStatusText.textContent = "Melody Playing";
        audioToggleBtn.classList.add('border-rose-400', 'bg-rose-500/20');
        playAmbientChord();
      } else {
        if (audioIcon) audioIcon.textContent = "🎵";
        if (audioStatusText) audioStatusText.textContent = "Play Melody";
        audioToggleBtn.classList.remove('border-rose-400', 'bg-rose-500/20');
        if (audioTimer) clearTimeout(audioTimer);
      }
    });
  }

});
