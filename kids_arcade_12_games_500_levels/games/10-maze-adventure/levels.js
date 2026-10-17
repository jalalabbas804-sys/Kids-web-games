const MazeAdventureLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    let size = 5 + Math.floor(t * 8);
    if (size % 2 === 0) size++; // Force odd number
    return { time: 45, size: size };
  }
};