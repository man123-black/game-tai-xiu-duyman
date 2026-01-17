// Link âm thanh (Dùng link online để bạn đỡ phải tải file mp3 về)
const sounds = {
    bgMusic: new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"), // Nhạc nền
    roll: new Audio("https://freesound.org/data/previews/388/388046_7274626-lq.mp3"),     // Tiếng lắc bát
    bet: new Audio("https://freesound.org/data/previews/341/341695_5858296-lq.mp3"),      // Tiếng đặt cược (xu rơi)
    win: new Audio("https://freesound.org/data/previews/270/270402_5123851-lq.mp3"),      // Tiếng thắng tiền
};

// Cấu hình âm lượng
sounds.bgMusic.volume = 0.1; // Nhạc nền nhỏ thôi
sounds.bgMusic.loop = true;
sounds.roll.volume = 1.0;
sounds.bet.volume = 0.6;

export const playSound = (type) => {
    if (sounds[type]) {
        // Reset về đầu để phát liên tục nếu bấm nhanh
        sounds[type].currentTime = 0; 
        sounds[type].play().catch(err => {
            // Trình duyệt chặn tự phát nhạc nếu chưa click chuột, bỏ qua lỗi này
            console.log("Chưa tương tác, chưa phát nhạc");
        });
    }
};

export const stopSound = (type) => {
    if (sounds[type]) {
        sounds[type].pause();
        sounds[type].currentTime = 0;
    }
};