const App = {
  currentScreen: 'splash',
  currentGame: null,

  init() {
    console.log('✅ App.init() called');
    try {
      Progress.init();
      console.log('✅ Progress.init() done');
    } catch (e) { console.error('❌ Progress error:', e); }

    try {
      AudioManager.init();
      console.log('✅ AudioManager.init() done');
    } catch (e) { console.error('❌ AudioManager error:', e); }

    try {
      UI.init();
      console.log('✅ UI.init() done');
    } catch (e) { console.error('❌ UI error:', e); }

    try {
      Splash.init(() => this.showHome());
      console.log('✅ Splash.init() done');
    } catch (e) { console.error('❌ Splash error:', e); }
  },

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(`${name}-screen`);
    if (el) el.classList.remove('hidden');
    this.currentScreen = name;
  },

  showHome() {
    console.log('✅ showHome() called');
    Home.render();
    this.showScreen('home');
  },

  openLevels(gameId) {
    this.currentGame = gameId;
    LevelManager.renderLevels(gameId);
    this.showScreen('levels');
  },

  startGame(gameId, level) {
    AudioManager.play('tap');
    const meta = LevelManager.getGameMeta(gameId);
    Progress.setCurrentLevel(gameId, level);
    window.location.href = `games/${meta.folder}/game.html?level=${level}`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM loaded, starting App');
  App.init();
});