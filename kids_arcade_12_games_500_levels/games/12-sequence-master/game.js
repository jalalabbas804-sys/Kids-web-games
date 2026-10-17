const Game12 = {
  level: 1, timeLeft: 30, timer: null, cfg: null,
  round: 0, correct: 0, sequence: [], userIdx: 0, showing: false,
  colors: ['red', 'blue', 'green', 'yellow'],
  icons: { red: '🍎', blue: '💧', green: '🌿', yellow: '⭐' },

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = SequenceMasterLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      location.href = '../../index.html';
    });
    document.getElementById('roundBadge').textContent = `🎯 0/${this.cfg.rounds}`;

    this.renderGrid();
    this.startTimer();
    this.newRound();
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

  renderGrid() {
    const area = document.getElementById('gameArea');
    area.innerHTML = `
      <div class="seq-wrap">
        <div class="seq-status" id="status">Watch closely...</div>
        <div class="seq-grid" id="seqGrid">
          ${this.colors.map(c => `<div class="seq-pad" data-color="${c}">${this.icons[c]}</div>`).join('')}
        </div>
      </div>
    `;
    area.querySelectorAll('.seq-pad').forEach(pad => {
      pad.addEventListener('click', () => this.onPad(pad.dataset.color, pad));
    });
  },

  newRound() {
    if (this.round >= this.cfg.rounds) { this.gameOver(true); return; }
    this.round++;
    const len = this.cfg.length + this.round - 1;
    this.sequence = Array.from({length: len}, () => this.colors[Math.floor(Math.random() * this.colors.length)]);
    this.userIdx = 0;
    this.showSequence();
  },

  async showSequence() {
    this.showing = true;
    document.getElementById('status').textContent = 'Watch closely...';
    await this.sleep(700);
    for (const color of this.sequence) {
      await this.lightPad(color, 500);
      await this.sleep(200);
    }
    this.showing = false;
    document.getElementById('status').textContent = 'Your turn! Repeat the sequence';
  },

  lightPad(color, dur) {
    return new Promise(resolve => {
      const pad = document.querySelector(`.seq-pad[data-color="${color}"]`);
      if (!pad) return resolve();
      pad.classList.add('lit');
      AudioManager.play('tap');
      setTimeout(() => {
        pad.classList.remove('lit');
        setTimeout(resolve, 100);
      }, dur);
    });
  },

  onPad(color, pad) {
    if (this.showing) return;
    if (color === this.sequence[this.userIdx]) {
      AudioManager.play('pop');
      pad.classList.add('lit');
      setTimeout(() => pad.classList.remove('lit'), 200);
      this.userIdx++;
      if (this.userIdx >= this.sequence.length) {
        this.correct++;
        document.getElementById('roundBadge').textContent = `🎯 ${this.correct}/${this.cfg.rounds}`;
        this.showing = true;
        document.getElementById('status').textContent = '✅ Correct!';
        setTimeout(() => this.newRound(), 900);
      }
    } else {
      AudioManager.play('error');
      document.getElementById('status').textContent = '❌ Wrong! Watch again...';
      this.showing = true;
      setTimeout(() => this.showSequence(), 800);
    }
  },

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

  gameOver(won) {
    clearInterval(this.timer);
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    if (won) {
      const stars = this.timeLeft > this.cfg.time * 0.5 ? 3 : this.timeLeft > this.cfg.time * 0.2 ? 2 : 1;
      Progress.completeLevel('sequence-master', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Sequence Master!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <p>Rounds: ${this.correct}/${this.cfg.rounds}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Time's Up!</h2>
        <p>Rounds: ${this.correct}/${this.cfg.rounds}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game12.init());