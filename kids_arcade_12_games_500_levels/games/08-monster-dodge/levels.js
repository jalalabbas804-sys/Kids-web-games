const MonsterDodgeLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 30,
      speed: 1 + t * 4,
      spawnRate: 1200 - t * 700
    };
  }
};