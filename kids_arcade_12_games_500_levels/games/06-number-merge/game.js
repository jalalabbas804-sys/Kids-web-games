const Game06 = {
  level: 1, timeLeft: 60, timer: null, cfg: null,
  board: [], score: 0, best: 0,

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = NumberMergeLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      location.href = '../../index.html';
    });

    this.board = Array(16).fill(0);
    this.addRandom();
    this.addRandom();
    this.render();
    this.startTimer();
  },

  startTimer() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTime();
      if (this.timeLeft <= 0) this.gameOver();
    }, 1000);
  },

  updateTime() { document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`; },

  addRandom() {
    const empty = [];
    this.board.forEach((v, i) => { if (v === 0) empty.push(i); });
    if (empty.length === 0) return;
    const idx = empty[Math.floor(Math.random() * empty.length)];
    this.board[idx] = Math.random() < 0.9 ? 2 : 4;
  },

  render() {
    const area = document.getElementById('gameArea');
    area.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div class="merge-board" id="board">
          ${this.board.map((v, i) => `<div class="merge-cell ${v ? 'filled' : ''}" data-val="${v}" data-i="${i}">${v || ''}</div>`).join('')}
        </div>
        <div class="merge-controls">
          <button class="empty"></button>
          <button class="btn" data-dir="up">⬆️</button>
          <button class="empty"></button>
          <button class="btn" data-dir="left">⬅️</button>
          <button class="btn" data-dir="down">⬇️</button>
          <button class="btn" data-dir="right">➡️</button>
        </div>
      </div>
    `;
    area.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioManager.play('tap');
        this.move(btn.dataset.dir);
      });
    });
  },

  move(dir) {
    const before = this.board.join(',');
    let moved = false;
    const rotate = (arr) => {
      // Returns rows for left movement
      const rows = [];
      for (let r = 0; r < 4; r++) rows.push(arr.slice(r*4, r*4+4));
      return rows;
    };

    let rows = rotate(this.board);

    if (dir === 'up') {
      rows = this.transpose(rows);
    } else if (dir === 'down') {
      rows = this.transpose(rows).map(r => r.reverse());
    } else if (dir === 'right') {
      rows = rows.map(r => r.reverse());
    }

    rows = rows.map(row => {
      let filtered = row.filter(v => v !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i+1]) {
          filtered[i] *= 2;
          this.best = Math.max(this.best, filtered[i]);
          filtered.splice(i+1, 1);
        }
      }
      while (filtered.length < 4) filtered.push(0);
      return filtered;
    });

    if (dir === 'up') {
      rows = this.transpose(rows);
    } else if (dir === 'down') {
      rows = this.transpose(rows.map(r => r.reverse())).map(r => r.reverse());
    } else if (dir === 'right') {
      rows = rows.map(r => r.reverse());
    }

    this.board = rows.flat();
    if (this.board.join(',') !== before) {
      moved = true;
      this.addRandom();
      this.render();
      this.score = this.best;
      document.getElementById('scoreBadge').textContent = `🎯 ${this.best}`;
      if (this.best >= this.cfg.target) this.gameOver(true);
    }
  },

  transpose(m) {
    return m[0].map((_, i) => m.map(r => r[i]));
  },

  gameOver(won) {
    clearInterval(this.timer);
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    if (won) {
      const stars = this.timeLeft > this.cfg.time * 0.5 ? 3 : this.timeLeft > this.cfg.time * 0.2 ? 2 : 1;
      Progress.completeLevel('number-merge', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Target Reached!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <p>Best: ${this.best}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Time's Up!</h2>
        <p>Best: ${this.best} / ${this.cfg.target}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game06.init());