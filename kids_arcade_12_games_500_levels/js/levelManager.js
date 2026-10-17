const LevelManager = {
  games: [
    { id: 'color-match',    name: 'Color Match',     icon: '🎨', folder: '01-color-match',    color: '#FF6584' },
    { id: 'animal-puzzle',  name: 'Animal Puzzle',   icon: '🧩', folder: '02-animal-puzzle',  color: '#6C63FF' },
    { id: 'memory-cards',   name: 'Memory Cards',    icon: '🃏', folder: '03-memory-cards',   color: '#FFC93C' },
    { id: 'fruit-catch',    name: 'Fruit Catch',     icon: '🍎', folder: '04-fruit-catch',    color: '#4CAF50' },
    { id: 'balloon-pop',    name: 'Balloon Pop',     icon: '🎈', folder: '05-balloon-pop',    color: '#F44336' },
    { id: 'number-merge',   name: 'Number Merge',    icon: '🔢', folder: '06-number-merge',   color: '#00BCD4' },
    { id: 'shape-sorter',   name: 'Shape Sorter',    icon: '🔷', folder: '07-shape-sorter',   color: '#9C27B0' },
    { id: 'monster-dodge',  name: 'Monster Dodge',   icon: '👾', folder: '08-monster-dodge',  color: '#FF9800' },
    { id: 'animal-sounds',  name: 'Animal Sounds',   icon: '🐶', folder: '09-animal-sounds',  color: '#795548' },
    { id: 'maze-adventure', name: 'Maze Adventure',  icon: '🌀', folder: '10-maze-adventure', color: '#3F51B5' },
    { id: 'jigsaw-kids',    name: 'Jigsaw Kids',     icon: '🖼️', folder: '11-jigsaw-kids',    color: '#E91E63' },
    { id: 'sequence-master',name: 'Sequence Master', icon: '🎵', folder: '12-sequence-master',color: '#009688' }
  ],

  getAllGames() {
    return this.games;
  },

  getGameMeta(id) {
    return this.games.find(g => g.id === id) || this.games[0];
  },

  getLevelConfig(gameId, level) {
    const t = Math.min(level / 500, 1);
    const base = {
      'color-match':    { time: 30, items: 3 + Math.floor(t * 7) },
      'animal-puzzle':  { time: 45, pieces: 4 + Math.floor(t * 12) },
      'memory-cards':   { time: 60, pairs: 3 + Math.floor(t * 9) },
      'fruit-catch':    { time: 30, speed: 1 + t * 3, target: 10 + Math.floor(t * 20) },
      'balloon-pop':    { time: 30, target: 8 + Math.floor(t * 22) },
      'number-merge':   { time: 60, target: 8 + Math.floor(t * 24) },
      'shape-sorter':   { time: 40, shapes: 3 + Math.floor(t * 7) },
      'monster-dodge':  { time: 30, speed: 1 + t * 4 },
      'animal-sounds':  { time: 30, rounds: 4 + Math.floor(t * 8) },
      'maze-adventure': { time: 45, size: 5 + Math.floor(t * 10) },
      'jigsaw-kids':    { time: 60, pieces: 4 + Math.floor(t * 12) },
      'sequence-master':{ time: 30, length: 3 + Math.floor(t * 7) }
    };
    return base[gameId] || { time: 30 };
  },

  renderLevels(gameId) {
    const meta = this.getGameMeta(gameId);
    const screen = document.getElementById('levels-screen');
    if (!screen) return;

    // Safely get progress data (fallback to 1 if Progress is broken)
    const unlocked = (typeof Progress !== 'undefined') ? Progress.getUnlocked(gameId) : 1;
    const completed = (typeof Progress !== 'undefined') ? Progress.getCompleted(gameId) : 0;

    screen.innerHTML = `
      <div class="levels-header">
        <button class="icon-btn" id="backHome">←</button>
        <span class="game-emoji">${meta.icon}</span>
        <h2>${meta.name}</h2>
        <div class="stat-badge">⭐ ${(typeof Progress !== 'undefined') ? Progress.getStars(gameId) : 0}</div>
      </div>
      <div class="levels-legend">
        <div class="legend-item"><span class="legend-dot" style="background:#FFC93C"></span>Unlocked</div>
        <div class="legend-item"><span class="legend-dot" style="background:#FF6584"></span>Current</div>
        <div class="legend-item"><span class="legend-dot" style="background:#4CAF50"></span>Completed</div>
        <div class="legend-item"><span class="legend-dot" style="background:#555"></span>Locked</div>
      </div>
      <div class="levels-scroll" id="levelsScroll">
        <div class="level-path" id="levelPath"></div>
      </div>
    `;

    const backBtn = document.getElementById('backHome');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (typeof AudioManager !== 'undefined') AudioManager.play('tap');
        if (typeof App !== 'undefined') App.showHome();
      });
    }

    const path = document.getElementById('levelPath');
    if (!path) return;

    const startLevel = Math.max(1, Math.min(unlocked - 20, 480));
    const endLevel = Math.min(500, startLevel + 60);

    for (let i = startLevel; i <= endLevel; i += 4) {
      const row = document.createElement('div');
      row.className = 'level-row';
      
      for (let j = 0; j < 4 && (i + j) <= endLevel; j++) {
        const lvl = i + j;
        const node = document.createElement('div');
        let cls = 'level-node ';
        
        if (lvl < unlocked || (lvl === unlocked && completed >= lvl)) cls += 'completed';
        else if (lvl === unlocked) cls += 'current';
        else if (lvl < unlocked + 1) cls += 'unlocked';
        else cls += 'locked';

        node.className = cls;
        node.innerHTML = `${lvl}${lvl <= completed ? '<div class="level-check">✓</div>' : ''}`;
        
        if (lvl <= unlocked) {
          node.addEventListener('click', () => {
            if (typeof App !== 'undefined') App.startGame(gameId, lvl);
          });
        }
        row.appendChild(node);
      }
      path.appendChild(row);
    }

    setTimeout(() => {
      const current = document.querySelector('.level-node.current');
      if (current) current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 100);
  }
};

console.log('✅ levelManager.js loaded properly');