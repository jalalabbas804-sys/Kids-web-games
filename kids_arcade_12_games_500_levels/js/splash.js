const Splash = {
  init(onDone) {
    console.log('✅ Splash started');
    const screen = document.getElementById('splash-screen');
    if (!screen) {
      console.error('❌ splash-screen not found!');
      onDone && onDone();
      return;
    }

    screen.innerHTML = `
      <div class="splash-emoji">🎮</div>
      <div class="splash-logo">Kids Fun<br>Games</div>
      <div class="splash-subtitle">12 Amazing Games · 6000 Levels</div>
      <div class="splash-loader"><div class="splash-loader-bar" id="splashBar"></div></div>
      <div class="splash-tip">✨ Loading your adventure...</div>
    `;

    let progress = 0;
    const bar = document.getElementById('splashBar');
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 5;
      if (progress >= 100) {
        progress = 100;
        bar.style.width = '100%';
        clearInterval(interval);
        setTimeout(() => {
          screen.style.transition = 'opacity 0.6s';
          screen.style.opacity = '0';
          setTimeout(() => {
            screen.classList.add('hidden');
            screen.style.display = 'none';
            onDone && onDone();
          }, 600);
        }, 400);
      } else {
        bar.style.width = progress + '%';
      }
    }, 180);
  }
};

console.log('✅ splash.js loaded');