import User from "../models/User.js";
import GameRound from "../models/GameRound.js";

// Lưu danh sách người thật
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

// Hàm random số tiền thông minh hơn (làm tròn số cho đẹp)
const randMoney = (min, max) => {
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    // Làm tròn đến hàng trăm nghìn hoặc triệu cho giống người đặt (VD: 1.500.000 thay vì 1.542.123)
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

        // --- LOGIC BOT BƠM TIỀN THÔNG MINH ---
        if (gameState.status === "BETTING" && gameState.timeRemaining > 2) {
            
            // Tùy vào thời gian còn lại mà Bot hành động khác nhau
            let chanceToBet = 0;
            let minAmount = 0;
            let maxAmount = 0;

            if (gameState.timeRemaining > 30) {
                // Giai đoạn đầu: Thăm dò, đặt ít, tỉ lệ thấp
                chanceToBet = 0.4; // 40% cơ hội đặt mỗi giây
                minAmount = 500000; // 500k
                maxAmount = 5000000; // 5m
            } else if (gameState.timeRemaining > 10) {
                // Giai đoạn giữa: Đặt đều tay
                chanceToBet = 0.8; // 80%
                minAmount = 2000000; // 2m
                maxAmount = 20000000; // 20m
            } else {
                // Giai đoạn cuối (Về bờ): Đặt dồn dập, tiền to
                chanceToBet = 1.0; // 100% giây nào cũng nhảy
                minAmount = 10000000; // 10m
                maxAmount = 100000000; // 100m
            }

            // Xử lý bơm tiền cho TÀI
            if (Math.random() < chanceToBet) {
                const addTai = randMoney(minAmount, maxAmount);
                gameState.totalTai += addTai;
            }

            // Xử lý bơm tiền cho XỈU
            if (Math.random() < chanceToBet) {
                const addXiu = randMoney(minAmount, maxAmount);
                gameState.totalXiu += addXiu;
            }

            // LOGIC CÂN CỬA: Nếu chênh lệch quá lớn (> 200m), Bot sẽ bơm mạnh vào bên yếu thế
            const diff = Math.abs(gameState.totalTai - gameState.totalXiu);
            if (diff > 200000000) {
                const buffAmount = randMoney(50000000, 100000000); // Bơm thêm 50-100m
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
    
    // Thuật toán chỉnh cầu (nếu muốn bịp): Có thể can thiệp kết quả tại đây
    // Hiện tại để random xanh chín
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
    // Ván mới set luôn tiền nền cho uy tín (300m - 500m)
    gameState.totalTai = randMoney(300000000, 500000000); 
    gameState.totalXiu = randMoney(300000000, 500000000);
    currentBets = []; 
};