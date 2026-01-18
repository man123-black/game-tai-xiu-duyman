import React from 'react';

const BetBoard = ({ currentChip, setChip }) => {
  const chips = [1000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000];

  const handleAllIn = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.balance) {
      setChip(user.balance);
    }
  };

  const formatChipName = (chip) => {
    if (chip >= 1000000) {
      return (chip / 1000000) + 'M'; 
    }
    return (chip / 1000) + 'K'; 
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="chip-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
         {chips.map(chip => (
           <button 
             key={chip}
             onClick={() => setChip(chip)}
             className={`chip-btn ${currentChip === chip ? 'active' : ''}`}
           >
             {formatChipName(chip)}
           </button>
         ))}

         <button 
            onClick={handleAllIn}
            className="chip-btn" 
            style={{ background: currentChip > 500000000 ? '#ffd700' : '', color: currentChip > 500000000 ? '#000' : '' }}
         >
            ALL
         </button>
      </div>

      <div style={{color: '#aaa', fontSize: '12px', marginTop: '10px', marginBottom: '10px'}}>
          Mức cược: <span style={{color: '#ffd700', fontWeight: 'bold'}}>{currentChip.toLocaleString()}</span> VNĐ
      </div>
    </div>
  );
};

export default BetBoard;