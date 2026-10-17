const Game10 = {
  level: 1, timeLeft: 45, timer: null, cfg: null,
  size: 0, maze: [], player: {r:0,c:0}, goal: {r:0,c:0}, cellPx: 40,

  init() {
    const params = new URLSearchParams(location.search);
    this.level = parseInt(params.get('level')) || 1;
    this.cfg = MazeAdventureLevels.generate(this.level);
    this.size = this.cfg.size;
    this.timeLeft = this.cfg.time;

    document.getElementById('levelBadge').textContent = `Level ${this.level}`;
    document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`;
    
    document.getElementById('backBtn').addEventListener('click', () => {
      if (typeof AudioManager !== 'undefined') AudioManager.play('tap');
      window.location.href = '../../index.html';
    });

    this.startTimer();
    this.generateMaze();
    this.render();
  },

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('timeBadge').textContent = `⏱ ${this.timeLeft}`;
      if (this.timeLeft <= 0) { 
        clearInterval(this.timer); 
        this.gameOver(false); 
      }
    }, 1000);
  },

  generateMaze() {
    const n = this.size;
    // 1 ka matlab deewar (wall), 0 ka matlab rasta (path)
    this.maze = Array.from({length: n}, () => Array(n).fill(1));
    
    // DFS Algorithm maze banane ke liye
    const stack = [[0, 0]];
    this.maze[0][0] = 0;
    
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const dirs = [[0,2],[0,-2],[2,0],[-2,0]].sort(() => Math.random() - 0.5);
      let moved = false;
      
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && this.maze[nr][nc] === 1) {
          this.maze[r + dr/2][c + dc/2] = 0; // Deewar todna
          this.maze[nr][nc] = 0;             // Naya rasta
          stack.push([nr, nc]);
          moved = true;
          break;
        }
      }
      if (!moved) stack.pop();
    }
    
    // Start aur End points
    this.maze[0][0] = 0;
    this.maze[n-1][n-1] = 0;
    this.player = {r: 0, c: 0};
    this.goal = {r: n-1, c: n-1};
  },

  render() {
    const n = this.size;
    // Screen ke hisaab se box ka size adjust karein
    const maxPx = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6);
    this.cellPx = Math.floor(maxPx / n) - 3;

    const area = document.getElementById('gameArea');
    area.innerHTML = `
      <div class="maze-wrap">
        <div class="maze-grid" id="mazeGrid" style="grid-template-columns:repeat(${n}, ${this.cellPx}px);"></div>
        <div class="maze-controls">
          <button class="empty"></button>
          <button class="btn btn-accent" data-dir="up">⬆️</button>
          <button class="empty"></button>
          <button class="btn btn-accent" data-dir="left">⬅️</button>
          <button class="btn btn-accent" data-dir="down">⬇️</button>
          <button class="btn btn-accent" data-dir="right">➡️</button>
        </div>
      </div>
    `;

    this.drawMaze();
    
    // Buttons par click events lagana
    area.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof AudioManager !== 'undefined') AudioManager.play('tap');
        this.move(btn.dataset.dir);
      });
    });
  },

  drawMaze() {
    const grid = document.getElementById('mazeGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'maze-cell ';
        
        if (this.maze[r][c] === 1) {
          cell.className += 'wall';
        } else if (r === this.player.r && c === this.player.c) {
          cell.className += 'player';
          cell.textContent = '🧑';
        } else if (r === this.goal.r && c === this.goal.c) {
          cell.className += 'goal';
          cell.textContent = '🏁';
        } else {
          cell.className += 'path';
        }
        
        cell.style.width = this.cellPx + 'px';
        cell.style.height = this.cellPx + 'px';
        grid.appendChild(cell);
      }
    }
  },

  move(dir) {
    if (this.timeLeft <= 0) return; // Agar time khatam hai to move na karein

    const d = { up: [-1,0], down: [1,0], left: [0,-1], right: [0,1] }[dir];
    const nr = this.player.r + d[0];
    const nc = this.player.c + d[1];

    // Check karein ke player maze ke andar hai ya nahi
    if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) return;
    
    // Check karein ke raste mein deewar (wall) hai ya nahi
    if (this.maze[nr][nc] === 1) {
      // Agar deewar hai to player ko wahan mat jane do
      return; 
    }

    // Player ko nayi position par le jayein
    this.player = { r: nr, c: nc };
    this.drawMaze(); // Maze ko dobara draw karein nayi position ke sath

    // Check karein ke goal mil gaya hai ya nahi
    if (nr === this.goal.r && nc === this.goal.c) {
      clearInterval(this.timer);
      this.gameOver(true);
    }
  },

  gameOver(won) {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    
    if (won) {
      const stars = this.timeLeft > this.cfg.time * 0.6 ? 3 : this.timeLeft > this.cfg.time * 0.3 ? 2 : 1;
      if (typeof Progress !== 'undefined') Progress.completeLevel('maze-adventure', this.level, stars);
      if (typeof AudioManager !== 'undefined') AudioManager.play('win');
      
      overlay.innerHTML = `
        <h2>🎉 Maze Solved!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
        <div class="modal-buttons">
          <button class="btn btn-secondary" onclick="location.href='../../index.html'">🏠 Home</button>
          <button class="btn btn-accent" onclick="location.href='game.html?level=${this.level+1}'">➡️ Next</button>
        </div>
      `;
    } else {
      if (typeof AudioManager !== 'undefined') AudioManager.play('lose');
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

document.addEventListener('DOMContentLoaded', () => Game10.init());