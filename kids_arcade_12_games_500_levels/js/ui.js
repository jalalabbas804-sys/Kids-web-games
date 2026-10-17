const UI = {
  init() {},

  modal(html, buttons = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = html;
    if (buttons.length) {
      const row = document.createElement('div');
      row.className = 'modal-buttons';
      buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'btn ' + (b.class || '');
        btn.textContent = b.text;
        btn.addEventListener('click', () => {
          AudioManager.play('tap');
          if (b.action) b.action();
          overlay.remove();
        });
        row.appendChild(btn);
      });
      modal.appendChild(row);
    }
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    return overlay;
  },

  win(level, stars, onNext) {
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    this.modal(
      `<h2>🎉 Level ${level} Complete!</h2>
       <div class="stars-display">${starStr}</div>
       <p>Great job! Keep going!</p>`,
      [
        { text: '🏠 Home', class: 'btn-secondary', action: () => App.showHome() },
        { text: '➡️ Next', action: onNext }
      ]
    );
  },

  lose(level, onRetry) {
    this.modal(
      `<h2>😢 Try Again!</h2>
       <p>Level ${level} was tough. Don't give up!</p>`,
      [
        { text: '🏠 Home', class: 'btn-secondary', action: () => App.showHome() },
        { text: '🔄 Retry', class: 'btn-accent', action: onRetry }
      ]
    );
  }
};