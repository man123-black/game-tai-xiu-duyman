import { io } from "socket.io-client";

// Kết nối tới backend cổng 5000
export const socket = io("http://localhost:5000", {
    transports: ["websocket"], // Dùng websocket cho nhanh
    autoConnect: true
});