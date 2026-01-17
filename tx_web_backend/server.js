import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { connectDB } from "./config/database.js";
import { initGameLoop, handleBet } from "./src/services/game.service.js";

// --- KHO DỮ LIỆU KHỔNG LỒ (Data Factory) ---

// 1. Kho tên (Tổ hợp: Họ + Đệm + Tên + Số = Hàng triệu tên khác nhau)
const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const dem = ["Văn", "Thị", "Đức", "Thành", "Ngọc", "Minh", "Quang", "Hữu", "Xuân", "Thanh", "Mạnh", "Tuấn", "Hoài", "Gia", "Bá"];
const ten = ["Hùng", "Dũng", "Nam", "Khánh", "Tuấn", "Sơn", "Đạt", "Huy", "Hoàng", "Long", "Vinh", "Phúc", "Tài", "Đức", "Kiên", "Cường", "Thắng", "Bình", "Trung", "Hiếu"];
const bietDanh = ["Vip", "Pro", "ĐạiGia", "SátThủ", "Trùm", "Thánh", "Cậu", "Mèo", "Gà", "Sói"];

// 2. Kho nội dung (Lắp ghép câu để không bao giờ trùng)
const camThan = ["Á đù", "Vãi chưởng", "Ôi trời", "Chết tiệt", "Ngon", "Thơm", "Cay thế", "Ảo thật", "Uy tín", "Tuyệt vời", "Haizz", "Đcm", "Vl"];
const chuDeTai = ["Tài nổ", "Tài đi", "Cầu này Tài", "Bẻ Tài", "All in Tài", "Về Tài chắc", "Bắt Tài", "Theo Tài", "Tài 11", "Tài 15"];
const chuDeXiu = ["Xỉu gãy", "Xỉu đi", "Cầu này Xỉu", "Bẻ Xỉu", "All in Xỉu", "Về Xỉu chắc", "Bắt Xỉu", "Theo Xỉu", "Xỉu 7", "Xỉu 10"];
const thanTho = ["Xa bờ quá", "Bay mất 5m", "Cháy acc rồi", "Còn cái nịt", "Đen vãi", "Thua thông 5 tay", "Cứu em với", "Nợ ngập đầu", "Xin 10k về bờ"];
const khoeKhoang = ["Húp trọn", "Lụm lúa", "Về bờ rồi", "Ngon chim", "Lại ăn", "Thông 3 tay", "Làm nhẹ 10m", "Rút tiền nhanh vãi", "Nay đỏ thế"];
const chemGio = ["Admin cho xin lộc", "Web lag thế", "Nạp thẻ lâu k ae?", "Ai theo tôi k?", "Cầu đẹp quá", "Bịp vãi", "Ảo ma canada", "Cho xin cái code"];
const duoiCau = ["anh em ơi", "các bác ạ", "nhé", "luôn", "vãi", "thật sự", "đấy", "rồi", "nha", "kìa", "cả nhà"];
const icons = ["😂", "🤣", "😭", "😡", "🤑", "😎", "🙏", "🔥", "💀", "💩", "✅", "❌", "zz", "...", "!!"];

// --- HÀM TẠO TÊN NGẪU NHIÊN (SIÊU THỰC) ---
const generateName = () => {
    const r = Math.random();
    // 40% tên kiểu: Nguyễn Văn A
    if (r < 0.4) return `${ho[rand(ho)]} ${dem[rand(dem)]} ${ten[rand(ten)]}`;
    // 30% tên kiểu: Hùng Vip 99
    if (r < 0.7) return `${ten[rand(ten)]} ${bietDanh[rand(bietDanh)]} ${Math.floor(Math.random() * 99)}`;
    // 30% tên kiểu: hungnguyen1990
    return `${ten[rand(ten)]}${ho[rand(ho)]}${Math.floor(Math.random() * 2000)}`.toLowerCase();
};

// --- HÀM LẮP GHÉP CÂU CHAT (SIÊU ĐA DẠNG) ---
const generateMessage = () => {
    const type = Math.random();
    let content = "";

    // Chọn chủ đề ngẫu nhiên
    if (type < 0.2) content = getRandomItem(chuDeTai);      // 20% nói về Tài
    else if (type < 0.4) content = getRandomItem(chuDeXiu); // 20% nói về Xỉu
    else if (type < 0.6) content = getRandomItem(thanTho);  // 20% than thua
    else if (type < 0.8) content = getRandomItem(khoeKhoang); // 20% khoe thắng
    else content = getRandomItem(chemGio);                  // 20% chém gió linh tinh

    // Lắp ghép: Cảm thán + Nội dung + Đuôi + Icon
    // Ví dụ: "Á đù" + "Về Tài" + "anh em ơi" + "😂"
    const hasCamThan = Math.random() > 0.7 ? getRandomItem(camThan) + " " : "";
    const hasDuoi = Math.random() > 0.6 ? " " + getRandomItem(duoiCau) : "";
    const hasIcon = Math.random() > 0.5 ? " " + getRandomItem(icons) : "";

    return `${hasCamThan}${content}${hasDuoi}${hasIcon}`;
};

// Hàm tiện ích lấy random mảng
const rand = (arr) => Math.floor(Math.random() * arr.length);
const getRandomItem = (arr) => arr[rand(arr)];

// --- LOGIC CHẠY BOT THÔNG MINH ---
const runSmartBot = (io) => {
    // Bot không chạy đều đều 2s/lần nữa mà sẽ random từ 0.5s đến 5s (giống người thật lúc nhanh lúc chậm)
    const loop = () => {
        const randomTime = Math.random() * 4500 + 500; // 0.5s - 5s
        
        setTimeout(() => {
            const botMsg = {
                user: generateName(),
                content: generateMessage(),
                type: "bot"
            };
            
            // Gửi xuống tất cả client
            io.emit("receive-chat", botMsg);
            
            // Tiếp tục vòng lặp
            loop();
        }, randomTime);
    };
    loop();
};

// --- KHỞI TẠO SERVER ---
connectDB();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on("place-bet", (data) => {
      const fakeName = data.username === "Khách" ? `Khách_${socket.id.slice(0,4)}` : data.username;
      handleBet(socket, { ...data, username: fakeName });
  });

  socket.on("send-chat", (data) => {
      const content = data.message || ""; 
      const username = data.username || `Khách_${socket.id.slice(0,4)}`;
      if (!content || content.trim() === "") return;
      
      const chatData = { user: username, content: content, type: "user" };
      io.emit("receive-chat", chatData);
  });
});

initGameLoop(io);
runSmartBot(io); // Kích hoạt siêu Bot

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});