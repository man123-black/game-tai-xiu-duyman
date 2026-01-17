// src/components/BetBoard.jsx
import React from 'react';

const BetBoard = ({ currentChip, setChip }) => {
  const chips = [10000, 50000, 100000, 500000, 1000000];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Hàng chọn tiền (Chips) */}
      <div className="chip-container">
         {chips.map(chip => (
           <button 
             key={chip}
             onClick={() => setChip(chip)}
             className={`chip-btn ${currentChip === chip ? 'active' : ''}`}
           >
             {chip >= 1000000 ? (chip/1000000) + 'M' : (chip/1000) + 'k'}
           </button>
         ))}
      </div>
      
      {/* Dòng hiển thị mức cược đang chọn */}
      <div style={{color: '#aaa', fontSize: '12px', marginBottom: '10px'}}>
          Mức cược: <span style={{color: '#ffd700', fontWeight: 'bold'}}>{currentChip.toLocaleString()}</span>
      </div>

    </div>
  );
};

export default BetBoard;