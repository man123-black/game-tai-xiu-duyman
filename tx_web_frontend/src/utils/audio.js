// Định nghĩa các âm thanh sử dụng trong game
const sounds = {
    bgMusic: new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"),
    roll: new Audio("https://freesound.org/data/previews/388/388046_7274626-lq.mp3"),
    bet: new Audio("https://freesound.org/data/previews/341/341695_5858296-lq.mp3"),
    win: new Audio("https://freesound.org/data/previews/270/270402_5123851-lq.mp3"),      // Tiếng thắng (vỗ tay/tiền reo)
    lose: new Audio("https://freesound.org/data/previews/159/159408_1361551-lq.mp3"),     // Tiếng thua (u uất/thất bại)
};

// Cấu hình âm lượng
sounds.bgMusic.volume = 0.1; 
sounds.bgMusic.loop = true;
sounds.roll.volume = 1.0;
sounds.bet.volume = 0.6;
sounds.win.volume = 0.8;
sounds.lose.volume = 0.7;

export const playSound = (type) => {
    if (sounds[type]) {   
        // Xử lý riêng cho nhạc nền để phát lặp lại
        if (type === 'bgMusic') {
            sounds.bgMusic.play().catch(() => {
                // Trình duyệt chặn tự động phát, sẽ phát khi user click lần đầu
                document.addEventListener('click', () => sounds.bgMusic.play(), { once: true });
            });
            return;
        }

        sounds[type].currentTime = 0; 
        sounds[type].play().catch(err => {
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