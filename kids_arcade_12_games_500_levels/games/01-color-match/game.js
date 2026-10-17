const Game01 = {
  level: 1, score: 0, timeLeft: 30, timer: null,
  round: 0, totalRounds: 5, cfg: null, colors: [], targetColor: null, answered: false,

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = ColorMatchLevels.generate(this.level);
    this.totalRounds = this.cfg.rounds;
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      window.location.href = '../../index.html';
    });

    this.startTimer();
    this.newRound();
  },

  startTimer() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTime();
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.gameOver(false);
      }
    }, 1000);
  },

  updateTime() {
    document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`;
  },

  newRound() {
    if (this.round >= this.totalRounds) { this.gameOver(true); return; }
    this.answered = false;
    this.round++;

    // Generate random colors
    const baseColors = ['#FF6B6B','#4ECDC4','#FFE66D','#95E1D3','#F38181','#AA96DA','#FCBAD3','#A8D8EA','#FF9F1C','#2EC4B6'];
    const shuffled = [...baseColors].sort(() => Math.random() - 0.5);
    this.colors = shuffled.slice(0, this.cfg.tileCount);
    this.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];

    const area = document.getElementById('gameArea');
    const colorName = this.getColorName(this.targetColor);
    area.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;width:100%;">
        <div class="color-target">Find this color:<br><span style="color:${this.targetColor}">● ${colorName}</span></div>
        <div class="color-grid" id="colorGrid"></div>
      </div>
    `;

    const grid = document.getElementById('colorGrid');
    grid.style.gridTemplateColumns = `repeat(${Math.min(2, this.cfg.tileCount)}, 1fr)`;
    if (this.cfg.tileCount > 4) grid.style.gridTemplateColumns = 'repeat(3, 1fr)';

    this.colors.forEach(c => {
      const tile = document.createElement('div');
      tile.className = 'color-tile';
      tile.style.background = c;
      tile.addEventListener('click', () => this.pick(c, tile));
      grid.appendChild(tile);
    });

    this.updateProgress();
  },

  pick(color, tile) {
    if (this.answered) return;
    this.answered = true;

    if (color === this.targetColor) {
      AudioManager.play('pop');
      tile.classList.add('correct');
      this.score += 10;
      document.getElementById('scoreBadge').textContent = `⭐ ${this.score}`;
      setTimeout(() => this.newRound(), 600);
    } else {
      AudioManager.play('error');
      tile.classList.add('wrong');
      setTimeout(() => this.newRound(), 500);
    }
  },

  updateProgress() {
    const pct = ((this.round - 1) / this.totalRounds) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
  },

  getColorName(hex) {
    const map = {
      '#FF6B6B':'Red','#4ECDC4':'Teal','#FFE66D':'Yellow','#95E1D3':'Mint',
      '#F38181':'Pink','#AA96DA':'Purple','#FCBAD3':'Rose','#A8D8EA':'Blue',
      '#FF9F1C':'Orange','#2EC4B6':'Green'
    };
    return map[hex] || 'Color';
  },

  gameOver(won) {
    clearInterval(this.timer);
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');

    if (won) {
      const stars = this.timeLeft > this.cfg.time * 0.5 ? 3 : this.timeLeft > this.cfg.time * 0.2 ? 2 : 1;
      Progress.completeLevel('color-match', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Level Complete!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <p>Score: ${this.score}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" id="nextBtn">➡️ Next Level</button>
        </div>
      `;
      document.getElementById('nextBtn').addEventListener('click', () => {
        AudioManager.play('tap');
        location.href = `game.html?level=${this.level + 1}`;
      });
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Time's Up!</h2>
        <p>Score: ${this.score}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game01.init());