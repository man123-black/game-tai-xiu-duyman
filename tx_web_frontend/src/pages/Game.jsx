import React, { useEffect, useState } from "react";
import { socket } from "../services/socket";
import Dice from "../components/Dice";
import BetBoard from "../components/BetBoard";
import ChatBox from "../components/ChatBox"; 
import { playSound } from "../utils/audio"; 
import "../assets/styles.css";

const Game = () => {
  const localUser = JSON.parse(localStorage.getItem("user")) || { username: "Khách", balance: 0, id: "guest" };

  const [gameState, setGameState] = useState({
    roundId: 0, timeRemaining: 0, status: "BETTING", 
    dices: [1, 1, 1], result: "", totalTai: 0, totalXiu: 0, history: []
  });
  
  const [myBalance, setMyBalance] = useState(localUser.balance || 0);
  const [selectedChip, setSelectedChip] = useState(1000);

  // QUẢN LÝ CƯỢC 
  const [myBet, setMyBet] = useState({ TAI: 0, XIU: 0 });
  const [resultEffect, setResultEffect] = useState({ TAI: null, XIU: null });

  const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
          const res = await fetch("https://game-tai-xiu-duyman.onrender.com/api/users/me", {
              headers: { "Content-Type": "application/json", "Authorization": token }
          });
          if (res.ok) {
              const data = await res.json();
              setMyBalance(data.balance);
              const updatedUser = { ...localUser, balance: data.balance, id: data._id };
              localStorage.setItem("user", JSON.stringify(updatedUser));
          }
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchUserInfo();
    
    socket.on("game-tick", (data) => {
        setGameState(prev => {
            
            if (data.status === "BETTING" && prev.status !== "BETTING") {
                setMyBet({ TAI: 0, XIU: 0 }); 
                setResultEffect({ TAI: null, XIU: null }); 
            }

            if (prev.status !== "COMPLETED" && data.status === "COMPLETED") {
                const result = data.result; // "TAI" hoặc "XIU"
                setResultEffect(prevEffect => {
                    const newEffect = { ...prevEffect };
                    if (result === "TAI" && myBet.XIU > 0) {
                        newEffect.XIU = { type: 'LOSS', amount: myBet.XIU };
                    }
                    if (result === "XIU" && myBet.TAI > 0) {
                        newEffect.TAI = { type: 'LOSS', amount: myBet.TAI };
                    }
                    return newEffect;
                });
            }

            if (prev.status === "BETTING" && data.status === "ROLLING") playSound("roll");
            return data;
        });
    });
    
    socket.on("win-money", (data) => {
        playSound("win");
        setMyBalance(prev => prev + data.amount); 
        fetchUserInfo(); 
    });

    socket.on("bet-success", (data) => {
        playSound("bet");
        if(data.newBalance !== undefined) {
             setMyBalance(data.newBalance);
             const updatedUser = { ...localUser, balance: data.newBalance };
             localStorage.setItem("user", JSON.stringify(updatedUser));
        }
    });

    socket.on("bet-error", (msg) => alert(msg));

    return () => {
      socket.off("game-tick");
      socket.off("win-money");
      socket.off("bet-success");
      socket.off("bet-error");
    };
  }, [myBet]);

  useEffect(() => {
     const handleWin = (data) => {
        if (gameState.result) {
            setResultEffect(prev => ({
                ...prev,
                [gameState.result]: { type: 'WIN', amount: data.amount }
            }));
        }
     };
     socket.on("win-money", handleWin);
     return () => socket.off("win-money", handleWin);
  }, [gameState.result]);

  const handleBet = (choice) => {
      if (gameState.status !== "BETTING") return;
      if (selectedChip > myBalance) return alert("Không đủ tiền!");
      
      // Lưu lại số tiền cược
      setMyBet(prev => ({
          ...prev,
          [choice]: prev[choice] + selectedChip
      }));

      socket.emit("place-bet", { 
          userId: localUser.id || localUser._id, 
          username: localUser.username, 
          choice, 
          amount: selectedChip
      });
  };

  const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
  };

  const renderCenterContent = () => {
      if (gameState.status === "BETTING") {
          return <div className="timer-text" style={{color: gameState.timeRemaining <= 5 ? 'red' : 'white'}}>{gameState.timeRemaining}</div>;
      }
      if (gameState.status === "ROLLING") {
          return <div className="dice-in-circle rolling-animation"><Dice values={gameState.dices} isRolling={true} /></div>;
      }
      if (gameState.status === "COMPLETED") {
           return <div className="dice-in-circle"><Dice values={gameState.dices} isRolling={false} /></div>;
      }
  };

  // Đèn
  const isTaiWin = gameState.status === "COMPLETED" && gameState.result === "TAI";
  const isXiuWin = gameState.status === "COMPLETED" && gameState.result === "XIU";

  return (
    <div className="game-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid #333', flexShrink: 0, alignItems: 'center' }}>
        <div className="neon-text" style={{ fontSize: '24px', fontWeight: 'bold' }}>DUYMAN</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="gold-text" style={{ fontSize: '16px', fontWeight: 'bold' }}>
              👤 {localUser.username} | 💰 {myBalance.toLocaleString()} VNĐ
            </div>
            <button onClick={handleLogout} style={{ background: '#d9534f', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>THOÁT</button>
        </div>
      </div>

      <div className="main-layout">
          <div className="game-section">
            <div className="game-board">
                
                <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', flex: 1}}>
                    
                    {/* CỬA TÀI */}
                    <div 
                        className={`bet-box bet-tai ${isTaiWin ? 'winner-box' : ''} ${isXiuWin ? 'loser-box' : ''}`} 
                        onClick={() => handleBet('TAI')}
                    >
                        <h1 className="gold-text">TÀI</h1>
                        <p>Tổng: {gameState.totalTai.toLocaleString()}</p>
                        {myBet.TAI > 0 && <div style={{fontSize: '12px', color: '#ff0', marginTop: '5px'}}>Cược: {myBet.TAI.toLocaleString()}</div>}

                        {/* HIỆU ỨNG TIỀN BAY */}
                        {resultEffect.TAI && (
                            <div className={`money-float ${resultEffect.TAI.type === 'WIN' ? 'float-win' : 'float-loss'}`}>
                                {resultEffect.TAI.type === 'WIN' ? '+' : '-'}{resultEffect.TAI.amount.toLocaleString()}
                            </div>
                        )}
                    </div>

                    {/* VÒNG TRÒN TRUNG TÂM */}
                    <div className="center-plate">
                        {renderCenterContent()}
                        
                        {/* Kết quả chữ */}
                        <div className="neon-text" style={{
                            position: 'absolute', bottom: '-60px', left: '50%', transform: 'translateX(-50%)',
                            width: '300px', textAlign: 'center', fontSize: '4vh', fontWeight: 'bold',
                            opacity: gameState.status === "COMPLETED" ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none'
                        }}>
                            {gameState.result && (
                                <>
                                    {gameState.dices.reduce((a,b)=>a+b,0)} - <span style={{color: gameState.result === "TAI" ? 'red' : 'cyan'}}>{gameState.result}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CỬA XỈU */}
                    <div 
                        className={`bet-box bet-xiu ${isXiuWin ? 'winner-box' : ''} ${isTaiWin ? 'loser-box' : ''}`}
                        onClick={() => handleBet('XIU')}
                    >
                        <h1 className="gold-text">XỈU</h1>
                        <p>Tổng: {gameState.totalXiu.toLocaleString()}</p>
                        {myBet.XIU > 0 && <div style={{fontSize: '12px', color: '#ff0', marginTop: '5px'}}>Cược: {myBet.XIU.toLocaleString()}</div>}

                        {/* HIỆU ỨNG TIỀN BAY */}
                        {resultEffect.XIU && (
                            <div className={`money-float ${resultEffect.XIU.type === 'WIN' ? 'float-win' : 'float-loss'}`}>
                                {resultEffect.XIU.type === 'WIN' ? '+' : '-'}{resultEffect.XIU.amount.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                <BetBoard currentChip={selectedChip} setChip={setSelectedChip} />

                <div className="history-bar">
                    {gameState.history.map((h, index) => (
                        <div key={index} className={`dot ${h.result === "TAI" ? "dot-tai" : "dot-xiu"}`}>
                            {h.result === "TAI" ? "T" : "X"}
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <ChatBox socket={socket} />
      </div>
    </div>
  );
};

export default Game;