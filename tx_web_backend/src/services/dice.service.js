export const rollDice = () =>
  Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1);

export const calcResult = dice =>
  dice.reduce((a, b) => a + b, 0) >= 11 ? "tai" : "xiu";
