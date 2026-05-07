import React, { useState, useEffect } from 'react';

const ESCENAS = ["/escena_crimen.png", "/escena_puerto.png", "/escena_mansion.png", "/escena_casino.png", "/escena_callejon.png"];
const OBJETOS_OCULTOS = ["🕵️", "🔫", "🩸", "💼", "🚬", "🗝️", "📱", "🍷"];

export const HiddenItemsGame = ({ level, onWin, onExit }) => {
  const [items, setItems] = useState([]);
  const scene = ESCENAS[level % ESCENAS.length];

  useEffect(() => {
    const initialItems = Array(5).fill(0).map(() => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      icon: OBJETOS_OCULTOS[Math.floor(Math.random() * OBJETOS_OCULTOS.length)],
      found: false,
      id: Math.random()
    }));
    setItems(initialItems);
  }, [level]);

  const handleItemClick = (id) => {
    const nextItems = items.map(it => it.id === id ? { ...it, found: true } : it);
    setItems(nextItems);
    if (nextItems.every(it => it.found)) {
      setTimeout(onWin, 500);
    }
  };

  return (
    <div className="game-container">
      <p style={{ color: 'gold', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>
        Encuentra las {items.filter(it => !it.found).length} pistas ocultas en la escena
      </p>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '500px', 
        height: '350px', 
        margin: '0 auto',
        backgroundImage: `url(${scene})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '4px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'crosshair'
      }}>
        {items.map(it => (
          <div
            key={it.id}
            onClick={() => handleItemClick(it.id)}
            style={{
              position: 'absolute',
              left: `${it.x}%`,
              top: `${it.y}%`,
              fontSize: '1.5rem',
              cursor: 'pointer',
              opacity: it.found ? 1 : 0.3,
              filter: it.found ? 'none' : 'brightness(0.5) contrast(1.2)',
              pointerEvents: it.found ? 'none' : 'auto',
              transition: 'all 0.3s'
            }}
          >
            {it.icon}
          </div>
        ))}
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={onExit}>SALIR</button>
      </div>
    </div>
  );
};
