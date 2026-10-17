const BalloonPopLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 30,
      target: 8 + Math.floor(t * 22),
      spawnRate: 900 - t * 400
    };
  }
};