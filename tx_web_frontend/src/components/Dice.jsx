import React from 'react';

const Dice = ({ values, isRolling }) => {
  const renderFace = (val) => {
    return Array.from({ length: val }).map((_, i) => (
       <span key={i} className={`pip ${val === 4 ? 'red' : 'black'}`} />
    ));
  };

  return (
    <>
      {values.map((val, index) => (
        <div 
          key={index} 
          className="die" 
          data-value={val}
          style={{
             transform: isRolling ? `rotate(${Math.random() * 360}deg)` : 'rotate(0deg)'
          }}
        >
          {renderFace(val)}
        </div>
      ))}
    </>
  );
};

export default Dice;