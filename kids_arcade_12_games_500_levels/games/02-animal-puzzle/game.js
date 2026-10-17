const Game02 = {
  level: 1, timeLeft: 45, timer: null, cfg: null,
  pieces: [], slots: [], selected: null, placed: 0,

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = AnimalPuzzleLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      location.href = '../../index.html';
    });

    this.startTimer();
    this.buildPuzzle();
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

  buildPuzzle() {
    const count = this.cfg.pieces;
    const animals = [...this.cfg.animals].sort(() => Math.random() - 0.5).slice(0, count);
    this.pieces = animals.map(a => ({ id: a, animal: a }));
    this.slots = [...animals].sort(() => Math.random() - 0.5);

    const cols = Math.min(4, Math.ceil(Math.sqrt(count)));

    const area = document.getElementById('gameArea');
    area.innerHTML = `
      <div class="puzzle-wrap">
        <div class="puzzle-slots" id="slots" style="grid-template-columns:repeat(${cols}, 1fr)"></div>
        <div class="puzzle-pieces" id="pieces"></div>
      </div>
    `;

    const slotsEl = document.getElementById('slots');
    this.slots.forEach((animal, i) => {
      const slot = document.createElement('div');
      slot.className = 'puzzle-slot';
      slot.dataset.index = i;
      slot.dataset.animal = animal;
      slot.addEventListener('click', () => this.placePiece(slot));
      slotsEl.appendChild(slot);
    });

    const piecesEl = document.getElementById('pieces');
    [...this.pieces].sort(() => Math.random() - 0.5).forEach(p => {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.textContent = p.animal;
      piece.dataset.animal = p.animal;
      piece.addEventListener('click', () => this.selectPiece(piece));
      piecesEl.appendChild(piece);
    });
  },

  selectPiece(el) {
    AudioManager.play('tap');
    document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    this.selected = el;
  },

  placePiece(slot) {
    if (!this.selected) return;
    if (slot.classList.contains('filled')) return;
    if (slot.dataset.animal === this.selected.dataset.animal) {
      AudioManager.play('pop');
      slot.textContent = this.selected.dataset.animal;
      slot.classList.add('filled');
      this.selected.classList.add('used');
      this.selected.classList.remove('selected');
      this.selected = null;
      this.placed++;
      if (this.placed >= this.slots.length) {
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
      const stars = this.timeLeft > 30 ? 3 : this.timeLeft > 15 ? 2 : 1;
      Progress.completeLevel('animal-puzzle', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Puzzle Solved!</h2>
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

document.addEventListener('DOMContentLoaded', () => Game02.init());