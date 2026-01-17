import React from 'react';

const Dice = ({ values, isRolling }) => {
  // Hàm tạo số lượng chấm tương ứng (1 chấm, 2 chấm...)
  const renderFace = (val) => {
    // Tạo mảng rỗng có độ dài bằng số chấm để map ra các thẻ <span>
    return Array.from({ length: val }).map((_, i) => (
       // Mặt 4 (và mặt 1 CSS đã xử lý) sẽ có chấm màu đỏ, còn lại đen
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
             // Nếu đang lắc thì xoay ngẫu nhiên một chút cho rối mắt
             transform: isRolling ? `rotate(${Math.random() * 360}deg)` : 'rotate(0deg)'
          }}
        >
          {/* Render các chấm bên trong */}
          {renderFace(val)}
        </div>
      ))}
    </>
  );
};

export default Dice;