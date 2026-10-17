const Home = {
  render() {
    const screen = document.getElementById('home-screen');
    if (!screen) return;

    // Purana data clear karne ke liye
    screen.innerHTML = '';
    
    const totalStars = typeof Progress !== 'undefined' ? Progress.getTotalStars() : 0;
    const totalCompleted = typeof Progress !== 'undefined' ? Progress.getTotalCompleted() : 0;

    // Header banana
    screen.innerHTML = `
      <div class="home-header">
        <div class="home-logo">🎮 Kids HD</div>
        <div class="home-stats">
          <div class="stat-badge">⭐ ${totalStars}</div>
          <div class="stat-badge">🏆 ${totalCompleted}</div>
          <button class="icon-btn" id="soundBtn">🔊</button>
        </div>
      </div>
      <div class="home-title">
        <h1>Choose Your Game</h1>
        <p>Scroll down to see all levels</p>
      </div>
      <div class="games-grid" id="gamesGrid"></div>
    `;

    const grid = document.getElementById('gamesGrid');
    const realGames = typeof LevelManager !== 'undefined' ? LevelManager.getAllGames() : [];

    // 1. Asli 12 Games Render Karein
    realGames.forEach((g, i) => {
      const unlocked = typeof Progress !== 'undefined' ? Progress.getUnlocked(g.id) : 1;
      const completed = typeof Progress !== 'undefined' ? Progress.getCompleted(g.id) : 0;
      const pct = Math.round((completed / 500) * 100);
      
      const card = document.createElement('div');
      card.className = 'game-card';
      // Animation delay taake ek ke baad ek aayein
      card.style.animationDelay = (i * 0.05) + 's'; 
      card.innerHTML = `
        <span class="game-icon">${g.icon}</span>
        <div class="game-name">${g.name}</div>
        <div class="game-progress">Level ${unlocked} / 500</div>
        <div class="game-progress-bar">
          <div class="game-progress-fill" style="width:${pct}%"></div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        if (typeof AudioManager !== 'undefined') AudioManager.play('tap');
        if (typeof App !== 'undefined' && App.openLevels) App.openLevels(g.id);
      });
      grid.appendChild(card);
    });

    // 2. Fake Locked Cards Generate Karein (Scroll aur look ke liye)
    // Ye sirf dikhawe ke liye hain, click par kuch nahi hoga (locked hain)
    const extraCardsCount = 40; 
    
    for (let i = 1; i <= extraCardsCount; i++) {
      const card = document.createElement('div');
      card.className = 'game-card locked'; // 'locked' class CSS mein lock icon lagayegi
      card.style.animationDelay = ((realGames.length + i) * 0.05) + 's';
      
      // Random icons taake acha lage
      const randomIcons = ['🎲', '🎯', '🧸', '🪁', '🎳', '🎰', '🕹️', '🧩', '♟️', '🎭'];
      const randomIcon = randomIcons[Math.floor(Math.random() * randomIcons.length)];

      card.innerHTML = `
        <span class="game-icon">${randomIcon}</span>
        <div class="game-name">Coming Soon</div>
        <div class="game-progress">Level ${i} / 500</div>
        <div class="game-progress-bar">
          <div class="game-progress-fill" style="width:0%"></div>
        </div>
      `;
      
      // Locked card par click karne se bas error sound aaye
      card.addEventListener('click', () => {
        if (typeof AudioManager !== 'undefined') AudioManager.play('error');
      });
      
      grid.appendChild(card);
    }

    // Sound button setup
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn && typeof AudioManager !== 'undefined') {
      soundBtn.textContent = AudioManager.isMuted() ? '🔇' : '🔊';
      soundBtn.addEventListener('click', () => {
        AudioManager.toggleMute();
        soundBtn.textContent = AudioManager.isMuted() ? '🔇' : '🔊';
      });
    }
  }
};