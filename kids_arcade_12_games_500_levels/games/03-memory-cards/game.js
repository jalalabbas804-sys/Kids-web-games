const Game03 = {
  level: 1, timeLeft: 60, timer: null, cfg: null,
  moves: 0, flipped: [], matched: 0, lock: false,

  emojis: ['🍎','🍌','🍇','🍓','🍒','🥝','🍍','🥕','🌽','🍕','🍔','🍟','🍩','🍪','🎂','🍭','🍫','🍿','🥨','🍉'],

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = MemoryCardsLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      location.href = '../../index.html';
    });

    this.startTimer();
    this.buildBoard();
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

  buildBoard() {
    const pairs = this.cfg.pairs;
    const selected = [...this.emojis].sort(() => Math.random() - 0.5).slice(0, pairs);
    const deck = [...selected, ...selected].sort(() => Math.random() - 0.5);

    const cols = pairs <= 4 ? 4 : pairs <= 6 ? 4 : pairs <= 8 ? 4 : 5;

    const area = document.getElementById('gameArea');
    area.innerHTML = `<div class="memory-grid" id="grid" style="grid-template-columns:repeat(${cols}, 1fr)"></div>`;

    const grid = document.getElementById('grid');
    deck.forEach((emoji, i) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.emoji = emoji;
      card.innerHTML = `
        <div class="face back">?</div>
        <div class="face front">${emoji}</div>
      `;
      card.addEventListener('click', () => this.flip(card));
      grid.appendChild(card);
    });
  },

  flip(card) {
    if (this.lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    AudioManager.play('tap');
    card.classList.add('flipped');
    this.flipped.push(card);

    if (this.flipped.length === 2) {
      this.moves++;
      document.getElementById('movesBadge').textContent = `🎯 ${this.moves}`;
      this.lock = true;
      const [a, b] = this.flipped;
      if (a.dataset.emoji === b.dataset.emoji) {
        AudioManager.play('pop');
        setTimeout(() => {
          a.classList.add('matched');
          b.classList.add('matched');
          this.matched++;
          this.flipped = [];
          this.lock = false;
          if (this.matched === this.cfg.pairs) {
            clearInterval(this.timer);
            this.gameOver(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          AudioManager.play('error');
          a.classList.remove('flipped');
          b.classList.remove('flipped');
          this.flipped = [];
          this.lock = false;
        }, 800);
      }
    }
  },

  gameOver(won) {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    if (won) {
      const stars = this.timeLeft > this.cfg.time * 0.6 ? 3 : this.timeLeft > this.cfg.time * 0.3 ? 2 : 1;
      Progress.completeLevel('memory-cards', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 All Matched!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <p>Moves: ${this.moves} · Time: ${this.timeLeft}s</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Time's Up!</h2>
        <p>Matched: ${this.matched}/${this.cfg.pairs}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game03.init());