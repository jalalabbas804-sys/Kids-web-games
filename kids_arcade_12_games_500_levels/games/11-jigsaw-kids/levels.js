const JigsawKidsLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 60,
      pieces: 4 + Math.floor(t * 12)
    };
  }
};