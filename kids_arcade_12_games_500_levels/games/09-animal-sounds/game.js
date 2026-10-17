const Game09 = {
  level: 1, timeLeft: 30, timer: null, cfg: null,
  round: 0, correct: 0, answered: false,

  animals: [
    { emoji: '🐶', sound: 'Woof!', name: 'Dog' },
    { emoji: '🐱', sound: 'Meow!', name: 'Cat' },
    { emoji: '🐮', sound: 'Moo!', name: 'Cow' },
    { emoji: '🐷', sound: 'Oink!', name: 'Pig' },
    { emoji: '🐸', sound: 'Ribbit!', name: 'Frog' },
    { emoji: '🐔', sound: 'Cluck!', name: 'Chicken' },
    { emoji: '🦆', sound: 'Quack!', name: 'Duck' },
    { emoji: '🐝', sound: 'Buzz!', name: 'Bee' },
    { emoji: '🐺', sound: 'Howl!', name: 'Wolf' },
    { emoji: '🐘', sound: 'Trumpet!', name: 'Elephant' },
    { emoji: '🦁', sound: 'Roar!', name: 'Lion' },
    { emoji: '🐭', sound: 'Squeak!', name: 'Mouse' }
  ],

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = AnimalSoundsLevels.generate(this.level);
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('backBtn').addEventListener('click', () => {
      AudioManager.play('tap');
      location.href = '../../index.html';
    });
    document.getElementById('roundBadge').textContent = `🎯 0/${this.cfg.rounds}`;

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

  newRound() {
    if (this.round >= this.cfg.rounds) { this.gameOver(true); return; }
    this.answered = false;
    this.round++;

    const shuffled = [...this.animals].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const options = shuffled.slice(0, 4).sort(() => Math.random() - 0.5);

    const area = document.getElementById('gameArea');
    area.innerHTML = `
      <div class="sound-wrap">
        <div class="sound-prompt">
          Which animal says:<br>
          <span class="big">"${target.sound}"</span>
        </div>
        <div class="sound-options">
          ${options.map(a => `<div class="sound-option" data-name="${a.name}">${a.emoji}</div>`).join('')}
        </div>
      </div>
    `;

    area.querySelectorAll('.sound-option').forEach(opt => {
      opt.addEventListener('click', () => this.pick(opt, target.name));
    });
  },

  pick(el, correctName) {
    if (this.answered) return;
    this.answered = true;

    if (el.dataset.name === correctName) {
      AudioManager.play('pop');
      el.classList.add('correct');
      this.correct++;
      document.getElementById('roundBadge').textContent = `🎯 ${this.correct}/${this.cfg.rounds}`;
      setTimeout(() => this.newRound(), 600);
    } else {
      AudioManager.play('error');
      el.classList.add('wrong');
      setTimeout(() => this.newRound(), 700);
    }
  },

  gameOver(won) {
    clearInterval(this.timer);
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    if (won && this.correct >= this.cfg.rounds - 1) {
      const stars = this.correct === this.cfg.rounds ? 3 : 2;
      Progress.completeLevel('animal-sounds', this.level, stars);
      AudioManager.play('win');
      overlay.innerHTML = `
        <h2>🎉 Well Done!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <p>Correct: ${this.correct}/${this.cfg.rounds}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      AudioManager.play('lose');
      overlay.innerHTML = `
        <h2>😢 Try Again!</h2>
        <p>Correct: ${this.correct}/${this.cfg.rounds}</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.reload()">🔄 Retry</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Game09.init());