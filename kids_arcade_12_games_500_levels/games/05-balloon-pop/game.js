const Game05 = {
  level: 1, timeLeft: 30, timer: null, cfg: null,
  canvas: null, ctx: null, balloons: [], popped: 0, running: false,
  lastTime: 0, animId: null, particles: [],

  colors: ['#FF6B6B','#4ECDC4','#FFE66D','#95E1D3','#F38181','#AA96DA','#FCBAD3','#A8D8EA'],

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = BalloonPopLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      window.location.href = '../../index.html';
    });

    const area = document.getElementById('gameArea');
    area.innerHTML = '<canvas id="balloonCanvas"></canvas>';
    this.canvas = document.getElementById('balloonCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Canvas resize delay taake container ready ho jaye
    setTimeout(() => {
      this.resize();
      this.startTimer();
      this.running = true;
      this.lastTime = performance.now();
      this.loop();
      this.scheduleSpawn();
    }, 50);

    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('touchstart', (e) => this.handleTap(e), { passive: false });
    this.canvas.addEventListener('mousedown', (e) => this.handleTap(e));
  },

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  },

  scheduleSpawn() {
    if (!this.running) return;
    // Har 1.2 second mein naya balloon spawn hoga
    setTimeout(() => {
      if (!this.running) return;
      this.spawnBalloon();
      this.scheduleSpawn();
    }, 1200 + Math.random() * 500);
  },

  spawnBalloon() {
    const radius = 25 + Math.random() * 15;
    this.balloons.push({
      x: radius + Math.random() * (this.canvas.width - radius * 2),
      y: this.canvas.height + radius + 20, // Neeche se shuru hoga
      vy: 1.5 + Math.random() * 1.5,       // FIXED: Aahista upar jayega (speed normal ki)
      radius,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.5 + Math.random()
    });
  },

  startTimer() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTime();
      if (this.timeLeft <= 0) this.stop();
    }, 1000);
  },

  updateTime() { document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`; },

  loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // FPS independent smooth movement
    this.lastTime = now;
    
    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  },

  update(dt) {
    // Balloons ko upar move karein
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      b.y -= b.vy * dt * 60; // Smooth speed
      b.sway += b.swaySpeed * dt;
      b.x += Math.sin(b.sway) * 0.5;
      
      if (b.y < -b.radius * 2) this.balloons.splice(i, 1);
    }

    // Particles effect update karein (Tap karne par)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;
      p.vy += 0.1; // Gravity effect
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Balloons draw karein
    this.balloons.forEach(b => {
      // Balloon body
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Balloon highlight (shine)
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
      
      // Balloon dhaaga (string)
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.radius);
      ctx.lineTo(b.x, b.y + b.radius + 15);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();
    });

    // Tap particles draw karein
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife; // Fade out effect
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  },

  handleTap(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      const dist = Math.hypot(b.x - x, b.y - y);
      
      // Agar tap balloon ke andar hua
      if (dist < b.radius + 15) {
        AudioManager.play('pop');
        this.popped++;
        document.getElementById('scoreBadge').textContent = `🎈 ${this.popped}`;
        
        // HD Particles Effect generate karein
        this.createParticles(b.x, b.y, b.color);
        
        this.balloons.splice(i, 1);
        if (this.popped >= this.cfg.target) this.stop();
        return;
      }
    }
  },

  createParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: color,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1
      });
    }
  },

  stop() {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.timer);
    if (this.animId) cancelAnimationFrame(this.animId);

    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    const won = this.popped >= this.cfg.target;
    
    if (won) {
      const stars = this.timeLeft > this.cfg.time * 0.5 ? 3 : this.timeLeft > this.cfg.time * 0.2 ? 2 : 1;
      Progress.completeLevel('balloon-pop', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Balloons Popped!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <p>Popped: ${this.popped}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Time's Up!</h2>
        <p>Popped: ${this.popped} / ${this.cfg.target}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game05.init());