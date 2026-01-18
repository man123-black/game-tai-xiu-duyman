import User from "../models/User.js";
import GameRound from "../models/GameRound.js";

// Lưu danh sách người chơi
let currentBets = []; 

let gameState = {
    roundId: 1,
    timeRemaining: 50, 
    status: "BETTING",
    dices: [1, 1, 1],
    result: "",
    totalTai: 0, 
    totalXiu: 0, 
    history: []
};

// Hàm random số tiền :
const randMoney = (min, max) => {
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    // Làm tròn đến hàng trăm nghìn
    return Math.floor(val / 100000) * 100000;
};

export const initGameLoop = async (io) => {
    const recentRounds = await GameRound.find().sort({ roundId: -1 }).limit(20);
    gameState.history = recentRounds.map(r => ({ 
        result: (r.result.reduce((a,b)=>a+b,0) >= 11 ? "TAI" : "XIU"), 
        dices: r.result 
    })).reverse();
    
    if(recentRounds.length > 0) gameState.roundId = recentRounds[0].roundId + 1;

    setInterval(async () => {
        gameState.timeRemaining--;

        // --- LOGIC TĂNG TIỀN ---
        if (gameState.status === "BETTING" && gameState.timeRemaining > 2) {
            
            let chanceToBet = 0;
            let minAmount = 0;
            let maxAmount = 0;

            if (gameState.timeRemaining > 30) {
                chanceToBet = 0.4; 
                minAmount = 500000; 
                maxAmount = 5000000; 
            } else if (gameState.timeRemaining > 10) {
                chanceToBet = 0.8; 
                minAmount = 2000000; 
                maxAmount = 20000000; 
            } else {
                chanceToBet = 1.0; 
                minAmount = 10000000; 
                maxAmount = 100000000; 
            }

            if (Math.random() < chanceToBet) {
                const addTai = randMoney(minAmount, maxAmount);
                gameState.totalTai += addTai;
            }

            if (Math.random() < chanceToBet) {
                const addXiu = randMoney(minAmount, maxAmount);
                gameState.totalXiu += addXiu;
            }

            // LOGIC CÂN CỬA
            const diff = Math.abs(gameState.totalTai - gameState.totalXiu);
            if (diff > 200000000) {
                const buffAmount = randMoney(50000000, 100000000); 
                if (gameState.totalTai < gameState.totalXiu) gameState.totalTai += buffAmount;
                else gameState.totalXiu += buffAmount;
            }
        }

        if (gameState.timeRemaining < 0 && gameState.status === "BETTING") {
             await startRolling(io);
        } 
        
        if (gameState.timeRemaining < -10 && gameState.status === "COMPLETED") {
             startNewRound();
        }

        io.emit("game-tick", gameState);
    }, 1000);
};

export const handleBet = async (socket, { userId, username, choice, amount }) => {
    if (gameState.status !== "BETTING") return;
    try {
        const user = await User.findById(userId);
        if (!user) return;
        if (user.balance < amount) {
            socket.emit("bet-error", "Không đủ tiền!");
            return;
        }

        user.balance -= amount;
        await user.save();

        if (choice === "TAI") gameState.totalTai += amount;
        else gameState.totalXiu += amount;

        currentBets.push({ userId, username, choice, amount, socketId: socket.id });
        socket.emit("bet-success", { choice, amount, newBalance: user.balance });
    } catch (err) {
        console.error("Lỗi đặt cược:", err);
    }
};

const startRolling = async (io) => {
    gameState.status = "ROLLING";
    
    // Thuật toán chỉnh cầu :ramdom
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2 + d3;
    const result = (total >= 11) ? "TAI" : "XIU";

    gameState.dices = [d1, d2, d3];
    gameState.result = result;

    await GameRound.create({ roundId: gameState.roundId, result: [d1, d2, d3] });
    gameState.history.push({ result, dices: [d1,d2,d3] });
    if(gameState.history.length > 20) gameState.history.shift();

    gameState.status = "COMPLETED"; 
    processPayout(io, result);
};

const processPayout = async (io, winningSide) => {
    const winners = {}; 
    for (const bet of currentBets) {
        if (bet.choice === winningSide) {
            const profit = bet.amount * 0.98; 
            const totalReceive = bet.amount + profit;
            if (winners[bet.socketId]) winners[bet.socketId] += totalReceive;
            else winners[bet.socketId] = totalReceive;
            try {
                await User.findByIdAndUpdate(bet.userId, { $inc: { balance: totalReceive } });
            } catch (err) { console.error(err); }
        }
    }
    Object.keys(winners).forEach(socketId => {
        io.to(socketId).emit("win-money", { amount: winners[socketId] });
    });
};

const startNewRound = () => {
    gameState.status = "BETTING";
    gameState.timeRemaining = 50;
    gameState.roundId++;
    gameState.result = "";
    gameState.totalTai = randMoney(300000000, 500000000); 
    gameState.totalXiu = randMoney(300000000, 500000000);
    currentBets = []; 
};