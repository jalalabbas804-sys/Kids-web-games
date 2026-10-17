const Game08 = {
  level: 1, timeLeft: 30, timer: null, cfg: null,
  canvas: null, ctx: null, monsters: [],
  running: false, lastTime: 0, animId: null, playerX: 0,
  playerSize: 40, hitCount: 0, invincible: 0,

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = MonsterDodgeLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    // UI Setup
    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`;
    document.getElementById('scoreBadge').textContent = `❤️ 3`;

    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      window.location.href = '../../index.html';
    });

    const area = document.getElementById('gameArea');
    area.innerHTML = '<canvas id="dodgeCanvas"></canvas>';
    this.canvas = document.getElementById('dodgeCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Canvas size delay to ensure container is ready
    setTimeout(() => {
      this.resize();
      this.playerX = this.canvas.width / 2;
      this.startTimer();
      this.running = true;
      this.lastTime = performance.now();
      this.loop();
      this.scheduleSpawn();
    }, 50);

    window.addEventListener('resize', () => this.resize());

    // Controls
    const move = (e) => {
      e.preventDefault();
      if (!this.running) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      this.playerX = Math.max(this.playerSize, Math.min(this.canvas.width - this.playerSize, x));
    };
    
    this.canvas.addEventListener('touchmove', move, { passive: false });
    this.canvas.addEventListener('mousemove', move);
  },

  resize() {
    if(!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  },

  scheduleSpawn() {
    if (!this.running) return;
    setTimeout(() => {
      if (!this.running) return;
      this.spawnMonster();
      this.scheduleSpawn();
    }, this.cfg.spawnRate + Math.random() * 500);
  },

  spawnMonster() {
    this.monsters.push({
      x: Math.random() * (this.canvas.width - 40) + 20,
      y: -40,
      vy: (60 + Math.random() * 80) * this.cfg.speed * 0.015,
      size: 36 + Math.random() * 14,
      emoji: ['👾','👹','👻','💀','🦇'][Math.floor(Math.random() * 5)]
    });
  },

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`;
      if (this.timeLeft <= 0) this.stop(true);
    }, 1000);
  },

  loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  },

  update(dt) {
    const speed = 60 * this.cfg.speed * 0.015;
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      m.y += speed * dt * 60;
      if (m.y > this.canvas.height + 50) this.monsters.splice(i, 1);
    }
    
    if (this.invincible > 0) {
      this.invincible -= dt;
    } else {
      const py = this.canvas.height - 60;
      for (let i = this.monsters.length - 1; i >= 0; i--) {
        const m = this.monsters[i];
        if (Math.abs(m.x - this.playerX) < (m.size + this.playerSize) * 0.6 &&
            Math.abs(m.y - py) < (m.size + this.playerSize) * 0.6) {
          AudioManager.play('error');
          this.hitCount++;
          document.getElementById('scoreBadge').textContent = `❤️ ${3 - this.hitCount}`;
          this.invincible = 1.5;
          this.monsters.splice(i, 1);
          if (this.hitCount >= 3) this.stop(false);
          break;
        }
      }
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background Stars
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 137.5) % this.canvas.width;
      const y = (i * 73.3 + Date.now() * 0.02) % this.canvas.height;
      ctx.fillRect(x, y, 2, 2);
    }

    // Monsters
    ctx.textAlign = 'center';
    this.monsters.forEach(m => {
      ctx.font = m.size + 'px serif';
      ctx.fillText(m.emoji, m.x, m.y);
    });

    // Player
    const py = this.canvas.height - 60;
    const alpha = this.invincible > 0 ? (Math.floor(Date.now() / 100) % 2 === 0 ? 0.3 : 1) : 1;
    ctx.globalAlpha = alpha;
    ctx.font = this.playerSize + 'px serif';
    ctx.fillText('🚀', this.playerX, py);
    ctx.globalAlpha = 1;
  },

  stop(won) {
    this.running = false;
    clearInterval(this.timer);
    if (this.animId) cancelAnimationFrame(this.animId);

    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    
    if (won) {
      const stars = this.hitCount === 0 ? 3 : this.hitCount <= 1 ? 2 : 1;
      Progress.completeLevel('monster-dodge', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 You Survived!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>💥 Caught!</h2>
        <p>Survived: ${this.cfg.time - this.timeLeft}s</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game08.init());