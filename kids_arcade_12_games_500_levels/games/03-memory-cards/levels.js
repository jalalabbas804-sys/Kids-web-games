const MemoryCardsLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 60,
      pairs: 3 + Math.floor(t * 9)
    };
  }
};