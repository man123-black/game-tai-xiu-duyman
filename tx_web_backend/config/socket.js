import { Server } from "socket.io";
import { gameSocket } from "../src/sockets/game.socket.js";

export const initSocket = server => {
  const io = new Server(server, { cors: { origin: "*" } });
  gameSocket(io);
};
