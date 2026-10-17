const Progress = {
  KEY: 'kidsGamesProgress_v1',
  data: null,

  init() {
    try {
      this.data = JSON.parse(localStorage.getItem(this.KEY)) || this.defaultData();
      
      // Safety Check: Agar purana data corrupt hai toh reset kar do
      if (!this.data || !this.data.games) {
        this.data = this.defaultData();
      }
    } catch (e) { 
      console.warn('Progress load error, resetting data');
      this.data = this.defaultData(); 
    }
  },

  defaultData() {
    const d = { games: {}, totalStars: 0 };
    
    // SAFETY CHECK: Agar LevelManager load nahi hua toh crash na ho
    if (typeof LevelManager !== 'undefined' && LevelManager.games) {
      LevelManager.games.forEach(g => {
        d.games[g.id] = { unlocked: 1, completed: 0, stars: 0, current: 1 };
      });
    }
    
    return d;
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save progress');
    }
  },

  getGame(id) {
    // Safety Check: Agar data null hai
    if (!this.data) this.init();
    if (!this.data.games[id]) {
      this.data.games[id] = { unlocked: 1, completed: 0, stars: 0, current: 1 };
    }
    return this.data.games[id];
  },

  getUnlocked(id) { return this.getGame(id).unlocked; },
  getCompleted(id) { return this.getGame(id).completed; },
  getStars(id) { return this.getGame(id).stars; },
  
  setCurrentLevel(id, lvl) { 
    this.getGame(id).current = lvl; 
    this.save(); 
  },

  getTotalStars() {
    if (!this.data || !this.data.games) return 0;
    return Object.values(this.data.games).reduce((s, g) => s + (g.stars || 0), 0);
  },

  getTotalCompleted() {
    if (!this.data || !this.data.games) return 0;
    return Object.values(this.data.games).reduce((s, g) => s + (g.completed || 0), 0);
  },

  completeLevel(gameId, level, stars = 3) {
    const g = this.getGame(gameId);
    if (level > g.completed) {
      g.completed = level;
      g.unlocked = Math.min(500, level + 1);
    }
    g.stars = Math.max(g.stars, g.completed * 3);
    this.save();
  },

  reset() {
    this.data = this.defaultData();
    this.save();
  }
};

console.log('✅ progress.js loaded perfectly');