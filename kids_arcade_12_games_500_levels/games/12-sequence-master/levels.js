const SequenceMasterLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 30,
      rounds: 4 + Math.floor(t * 8),
      length: 3 + Math.floor(t * 7)
    };
  }
};