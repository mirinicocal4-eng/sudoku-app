import React from 'react';

export const Detective = ({ thought }) => {
  const detectiveImg = (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', padding: 0 }}>
      <img 
        src="/detective_normal.png" 
        alt="Detective" 
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          mixBlendMode: 'screen', // El borrador de negro
          filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 10px rgba(0,0,0,0.5))',
          transform: 'translateZ(0)', // Fuerza renderizado por GPU
          backfaceVisibility: 'hidden',
          isolation: 'isolate'
        }} 
      />
    </div>
  );

  return (
    <div className="detective-float">
      {thought && <div className="speech-bubble">"{thought}"</div>}
      <img 
        src="/detective_modern.png" 
        alt="Detective" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }} 
      />
    </div>
  );
};
