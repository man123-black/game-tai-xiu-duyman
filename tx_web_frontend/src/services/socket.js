import { io } from "socket.io-client";

// Kết nối tới backend cổng 5000
export const socket = io("https://game-tai-xiu-duyman.onrender.com", {
    transports: ["websocket"], 
    autoConnect: true
});