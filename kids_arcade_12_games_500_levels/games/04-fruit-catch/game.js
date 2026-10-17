const Game04 = {
  level: 1, timeLeft: 30, timer: null, cfg: null,
  canvas: null, ctx: null, items: [], score: 0, running: false,
  basket: { x: 0, w: 100, h: 30 },
  fruits: ['🍎','🍌','🍇','🍓','🍒','🥝','🍍','🍊','🍉','🍑'],
  spawnTimer: 0, lastTime: 0, animId: null,

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = FruitCatchLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      location.href = '../../index.html';
    });

    const area = document.getElementById('gameArea');
    area.innerHTML = '<canvas id="catchCanvas"></canvas>';
    this.canvas = document.getElementById('catchCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.basket.x = this.canvas.width / 2 - this.basket.w / 2;

    // Input
    const move = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      this.basket.x = Math.max(0, Math.min(this.canvas.width - this.basket.w, x - this.basket.w / 2));
    };
    this.canvas.addEventListener('touchmove', move, { passive: false });
    this.canvas.addEventListener('mousemove', move);

    this.startTimer();
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
    this.scheduleSpawn();
  },

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  },

  scheduleSpawn() {
    if (!this.running) return;
    const delay = this.cfg.spawnRate + Math.random() * 400;
    setTimeout(() => {
      if (!this.running) return;
      this.spawnItem();
      this.scheduleSpawn();
    }, delay);
  },

  spawnItem() {
    const isBomb = Math.random() < 0.15;
    const emoji = isBomb ? '💣' : this.fruits[Math.floor(Math.random() * this.fruits.length)];
    this.items.push({
      x: Math.random() * (this.canvas.width - 50) + 25,
      y: -40,
      vy: (80 + Math.random() * 60) * this.cfg.speed * 0.01,
      emoji, isBomb, size: 40
    });
  },

  startTimer() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTime();
      if (this.timeLeft <= 0) { this.stop(true); }
    }, 1000);
  },

  updateTime() { document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`; },

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
    const speed = 60 * this.cfg.speed * 3;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += speed * dt;
      // Catch check
      if (it.y + it.size/2 > this.canvas.height - this.basket.h - 20 && it.y < this.canvas.height) {
        if (it.x > this.basket.x && it.x < this.basket.x + this.basket.w) {
          if (it.isBomb) {
            AudioManager.play('error');
            this.score = Math.max(0, this.score - 5);
          } else {
            AudioManager.play('pop');
            this.score += 10;
          }
          document.getElementById('scoreBadge').textContent = `⭐ ${this.score}`;
          this.items.splice(i, 1);
          if (this.score >= this.cfg.target * 10) this.stop(true);
          continue;
        }
      }
      if (it.y > this.canvas.height + 50) this.items.splice(i, 1);
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, 'rgba(108,99,255,0.15)');
    grad.addColorStop(1, 'rgba(255,101,132,0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Items
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    this.items.forEach(it => ctx.fillText(it.emoji, it.x, it.y));

    // Basket
    const b = this.basket;
    const by = this.canvas.height - b.h - 20;
    ctx.font = '50px serif';
    ctx.fillText('🧺', b.x + b.w/2, by + b.h + 10);
  },

  stop(won) {
    this.running = false;
    clearInterval(this.timer);
    if (this.animId) cancelAnimationFrame(this.animId);

    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    if (won && this.score >= this.cfg.target * 10) {
      const stars = this.timeLeft > this.cfg.time * 0.5 ? 3 : this.timeLeft > this.cfg.time * 0.2 ? 2 : 1;
      Progress.completeLevel('fruit-catch', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Great Catching!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <p>Score: ${this.score}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Game Over!</h2>
        <p>Score: ${this.score} / ${this.cfg.target * 10}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game04.init());