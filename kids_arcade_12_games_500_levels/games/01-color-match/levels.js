const ColorMatchLevels = {
  generate(level) {
    const cfg = LevelManager.getLevelConfig('color-match', level);
    const t = Math.min(level / 500, 1);
    return {
      time: cfg.time,
      tileCount: cfg.items,
      targetCount: 1 + Math.floor(t * 3),
      rounds: 3 + Math.floor(t * 7)
    };
  }
};