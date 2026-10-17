const Game11 = {
  level: 1, timeLeft: 60, timer: null, cfg: null,
  gridSize: 3, pieces: [], placed: 0, selected: null,
  emojis: ['🍎','🍌','🍇','🍓','🍒','🥝','🍍','🥕','🌽','🍕','🍔','🍟','🍩','🎂','🍭','🍫'],

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = JigsawKidsLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      location.href = '../../index.html';
    });

    this.gridSize = Math.ceil(Math.sqrt(this.cfg.pieces));
    this.totalCells = this.gridSize * this.gridSize;
    this.startTimer();
    this.build();
  },

  startTimer() {
    this.updateTime();
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTime();
      if (this.timeLeft <= 0) { clearInterval(this.timer); this.gameOver(false); }
    }, 1000);
  },

  updateTime() { document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`; },

  build() {
    const n = this.gridSize;
    const maxPx = Math.min(window.innerWidth * 0.85, window.innerHeight * 0.5);
    const cellPx = Math.floor(maxPx / n) - 6;

    // Pick unique emojis for each cell
    const chosen = [...this.emojis].sort(() => Math.random() - 0.5).slice(0, this.totalCells);
    this.target = chosen;
    this.shuffled = [...chosen].sort(() => Math.random() - 0.5);

    const area = document.getElementById('gameArea');
    area.innerHTML = `
      <div class="jigsaw-wrap">
        <div class="jigsaw-board" id="board" style="grid-template-columns:repeat(${n}, ${cellPx}px);"></div>
        <div class="jigsaw-pieces" id="pieces"></div>
      </div>
    `;

    const board = document.getElementById('board');
    chosen.forEach((emoji, i) => {
      const slot = document.createElement('div');
      slot.className = 'jigsaw-slot';
      slot.dataset.i = i;
      slot.dataset.emoji = emoji;
      slot.style.width = cellPx + 'px';
      slot.style.height = cellPx + 'px';
      slot.addEventListener('click', () => this.place(slot));
      board.appendChild(slot);
    });

    const piecesEl = document.getElementById('pieces');
    this.shuffled.forEach((emoji) => {
      const piece = document.createElement('div');
      piece.className = 'jigsaw-piece';
      piece.dataset.emoji = emoji;
      piece.textContent = emoji;
      piece.style.width = cellPx + 'px';
      piece.style.height = cellPx + 'px';
      piece.addEventListener('click', () => {
        AudioManager.play('tap');
        piecesEl.querySelectorAll('.jigsaw-piece').forEach(p => p.classList.remove('selected'));
        piece.classList.add('selected');
        this.selected = piece;
      });
      piecesEl.appendChild(piece);
    });
  },

  place(slot) {
    if (!this.selected || slot.classList.contains('filled')) return;
    if (slot.dataset.emoji === this.selected.dataset.emoji) {
      AudioManager.play('pop');
      slot.textContent = this.selected.dataset.emoji;
      slot.classList.add('filled');
      this.selected.classList.add('used');
      this.selected.classList.remove('selected');
      this.selected = null;
      this.placed++;
      if (this.placed === this.totalCells) {
        clearInterval(this.timer);
        this.gameOver(true);
      }
    } else {
      AudioManager.play('error');
      slot.style.animation = 'shake 0.4s';
      setTimeout(() => slot.style.animation = '', 400);
    }
  },

  gameOver(won) {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    if (won) {
      const stars = this.timeLeft > this.cfg.time * 0.6 ? 3 : this.timeLeft > this.cfg.time * 0.3 ? 2 : 1;
      Progress.completeLevel('jigsaw-kids', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Puzzle Complete!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Time's Up!</h2>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game11.init());