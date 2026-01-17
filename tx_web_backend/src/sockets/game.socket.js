let time = 60;

export const gameSocket = io => {
  setInterval(() => {
    time--;
    io.emit("timer", time);
    if (time === 0) time = 60;
  }, 1000);
};
