const ShapeSorterLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 40,
      shapes: 3 + Math.floor(t * 7)
    };
  }
};