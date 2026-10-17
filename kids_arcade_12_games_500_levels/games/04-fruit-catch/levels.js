const FruitCatchLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 30,
      target: 10 + Math.floor(t * 20),
      speed: 1 + t * 3,
      spawnRate: 1000 - t * 500
    };
  }
};