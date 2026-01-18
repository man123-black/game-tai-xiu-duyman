import React, { useState, useEffect, useRef } from 'react';

// XỬ LÝ DÒNG CHAT & DỊCH 
const ChatLine = ({ msg, user, nameColors }) => {
    const [translation, setTranslation] = useState("");
    const userLang = navigator.language.split('-')[0]; 

    useEffect(() => {
        setTranslation("");
        if (msg.content && msg.content.length > 1) {
            handleTranslate();
        }
    }, [msg.content]);

    const handleTranslate = async () => {
        const hasVietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(msg.content);
        if (userLang === 'vi' && hasVietnameseChars) return;

        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.content)}&langpair=Autodetect|${userLang}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data && data.responseData && data.responseData.translatedText) {
                const translatedText = data.responseData.translatedText;
                if (
                    translatedText.toLowerCase() !== msg.content.toLowerCase() && 
                    !translatedText.includes("MYMEMORY") 
                ) {
                    setTranslation(translatedText);
                }
            }
        } catch (err) {}
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

    // --- GIẢ LẬP SỐ NGƯỜI ONLINE ---
    const [fakeOnline, setFakeOnline] = useState(1000);

    useEffect(() => {
        const updateOnlineCount = () => {
            const hour = new Date().getHours();
            let baseCount;

            if (hour >= 19 || hour <= 1) {
                baseCount = 1750; 
            } else if (hour >= 2 && hour <= 6) {
                baseCount = 450; 
            } else {
                baseCount = 1200; 
            }

            setFakeOnline(prev => {
                const change = Math.floor(Math.random() * 8) + 1;
                const isIncreasing = Math.random() > 0.5;
                let nextValue = isIncreasing ? prev + change : prev - change;

                if (nextValue > 2000) return 1995;
                
                if (nextValue < baseCount - 150) return baseCount - 140;
                if (nextValue > baseCount + 150) return baseCount + 140;
                return nextValue;
            });
        };

        const interval = setInterval(updateOnlineCount, 1500); 
        return () => clearInterval(interval);
    }, []);

    
    useEffect(() => {
        socket.on("receive-chat", (data) => {
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
            <div className="chat-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px 15px', 
                background: '#151515',
                borderBottom: '2px solid #333'
            }}>
                <span style={{ 
                    fontWeight: '900', 
                    color: '#FFD700',  
                    fontSize: '13px', 
                    textTransform: 'uppercase', 
                    textShadow: '0 0 8px #FFD700, 0 0 15px #FFA500' 
                }}>
                    KÊNH CHAT THẾ GIỚI
                </span>
                
                <span style={{ 
                    color: '#00FF00', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    textShadow: '0 0 8px #00FF00, 0 0 15px #00FF00'
                }}>
                    <span style={{ 
                        width: '7px', 
                        height: '7px', 
                        background: '#00FF00', 
                        borderRadius: '50%', 
                        marginRight: '8px',
                        boxShadow: '0 0 10px #00FF00'
                    }}></span>
                    {fakeOnline.toLocaleString()} ONLINE
                </span>
            </div>
            
            <div className="chat-body">
                {messages.map((msg) => (
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