const NumberMergeLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 60,
      target: 8 + Math.floor(t * 24)
    };
  }
};