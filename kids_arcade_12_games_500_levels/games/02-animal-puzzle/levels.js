const AnimalPuzzleLevels = {
  generate(level) {
    const t = Math.min(level / 500, 1);
    return {
      time: 45,
      pieces: 4 + Math.floor(t * 12),
      animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🦄','🐔','🐧','🦉','🦋']
    };
  }
};