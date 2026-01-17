import React, { useState, useEffect, useRef } from 'react';

// --- COMPONENT CON: XỬ LÝ TỪNG DÒNG CHAT & DỊCH ---
const ChatLine = ({ msg, user, nameColors }) => {
    const [translation, setTranslation] = useState("");
    
    // Lấy ngôn ngữ trình duyệt (ví dụ: 'vi', 'en')
    const userLang = navigator.language.split('-')[0]; 

    useEffect(() => {
        // Reset translation khi nội dung tin nhắn thay đổi (fix lỗi React reuse component)
        setTranslation("");

        // Chỉ dịch nếu tin nhắn dài > 1 ký tự
        if (msg.content && msg.content.length > 1) {
            handleTranslate();
        }
    }, [msg.content]);

    const handleTranslate = async () => {
        // Kiểm tra sơ bộ: Nếu đang dùng tiếng Việt mà tin nhắn có dấu tiếng Việt thì khỏi dịch (đỡ tốn API)
        const hasVietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(msg.content);
        if (userLang === 'vi' && hasVietnameseChars) return;

        try {
            // Dùng API MyMemory (Free & Ổn định hơn Google gtx cho web app)
            // Cấu trúc: Autodetect -> Ngôn ngữ người dùng
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.content)}&langpair=Autodetect|${userLang}`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data && data.responseData && data.responseData.translatedText) {
                const translatedText = data.responseData.translatedText;
                
                // Chỉ hiện nếu kết quả dịch KHÁC với tin nhắn gốc và KHÔNG PHẢI lỗi
                if (
                    translatedText.toLowerCase() !== msg.content.toLowerCase() && 
                    !translatedText.includes("MYMEMORY") // Lọc bỏ thông báo lỗi của API
                ) {
                    setTranslation(translatedText);
                }
            }
        } catch (err) {
            // Lỗi thì bỏ qua, không hiện gì cả
        }
    };

    const colorIndex = msg.user.length % nameColors.length;
    const isMe = msg.user === user.username;

    return (
        <div className="chat-line">
            <div>
                <span 
                    className="chat-user" 
                    style={{ color: isMe ? '#ffd700' : nameColors[colorIndex] }}
                >
                    {isMe ? "★ " : ""}{msg.user}:
                </span> 
                <span className="chat-content">{msg.content}</span>
            </div>

            {/* Phần hiển thị bản dịch (Style nhỏ, mờ, tinh tế) */}
            {translation && (
                <div className="chat-translate" style={{ 
                    fontSize: '11px', 
                    color: '#888', 
                    fontStyle: 'italic', 
                    marginTop: '2px',
                    marginLeft: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{fontSize: '9px'}}>🌐</span> {translation}
                </div>
            )}
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const ChatBox = ({ socket }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user")) || { username: "Khách" };

    useEffect(() => {
        socket.on("receive-chat", (data) => {
            // Thêm ID unique (thời gian + random) để làm key cho React
            // Giúp React phân biệt được các tin nhắn, tránh lỗi render lặp lại
            const newMessage = { ...data, id: Date.now() + Math.random() };
            setMessages(prev => [...prev.slice(-49), newMessage]); 
        });
        return () => {
            socket.off("receive-chat");
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            socket.emit("send-chat", {
                message: input,
                username: user.username 
            });
            setInput("");
        }
    };

    const nameColors = ['#00ffea', '#ff5eff', '#7fff00', '#ff9f00', '#00bfff'];

    return (
        <div className="chat-container">
            <div className="chat-header">KÊNH CHAT THẾ GIỚI</div>
            
            <div className="chat-body">
                {messages.map((msg) => (
                    /* QUAN TRỌNG: Dùng msg.id làm key thay vì index */
                    <ChatLine 
                        key={msg.id} 
                        msg={msg} 
                        user={user} 
                        nameColors={nameColors} 
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Nhập tin nhắn..." 
                    maxLength={100} 
                />
                <button type="submit">GỬI</button>
            </form>
        </div>
    );
};

export default ChatBox;