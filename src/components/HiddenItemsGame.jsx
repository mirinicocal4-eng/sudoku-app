import React, { useState, useEffect } from 'react';

const ESCENAS_DATA = {
  "/escena_crimen.png": {
    name: "Escena del Crimen",
    yRange: [20, 90],
    pool: [
      { icon: "🔫", name: "Pistola" },
      { icon: "🩸", name: "Sangre" },
      { icon: "🧤", name: "Guante" },
      { icon: "🕵️", name: "Lupa" },
      { icon: "🗞️", name: "Diario" }
    ]
  },
  "/escena_puerto.png": {
    name: "Puerto de la Ciudad",
    yRange: [50, 90], // Mantener objetos en el suelo o agua
    pool: [
      { icon: "⚓", name: "Ancla" },
      { icon: "🐟", name: "Pescado" },
      { icon: "🛢️", name: "Barril" },
      { icon: "🪢", name: "Cuerda" },
      { icon: "📦", name: "Caja" }
    ]
  },
  "/escena_mansion.png": {
    name: "Mansión Lujosa",
    yRange: [15, 90],
    pool: [
      { icon: "🍷", name: "Copa" },
      { icon: "⌚", name: "Reloj" },
      { icon: "🗝️", name: "Llave Oro" },
      { icon: "💎", name: "Joya" },
      { icon: "🖼️", name: "Cuadro" }
    ]
  },
  "/escena_casino.png": {
    name: "Casino 'El Trébol'",
    yRange: [20, 90],
    pool: [
      { icon: "🃏", name: "Carta" },
      { icon: "🎲", name: "Dados" },
      { icon: "🍸", name: "Cóctel" },
      { icon: "💰", name: "Bolsa" },
      { icon: "🚬", name: "Cigarro" }
    ]
  },
  "/escena_callejon.png": {
    name: "Callejón Oscuro",
    yRange: [40, 90], // Evitar que floten en el cielo del callejón
    pool: [
      { icon: "🐀", name: "Rata" },
      { icon: "🍾", name: "Botella" },
      { icon: "🗑️", name: "Papelera" },
      { icon: "🔦", name: "Linterna" },
      { icon: "🧱", name: "Ladrillo" }
    ]
  }
};

const ESCENAS_KEYS = Object.keys(ESCENAS_DATA);

export const HiddenItemsGame = ({ level, onWin, onExit, playSFX }) => {
  const [items, setItems] = useState([]);
  const sceneKey = ESCENAS_KEYS[level % ESCENAS_KEYS.length];
  const sceneData = ESCENAS_DATA[sceneKey];

  useEffect(() => {
    const pool = [...sceneData.pool].sort(() => Math.random() - 0.5);
    const [minY, maxY] = sceneData.yRange;
    
    const initialItems = pool.map((obj) => ({
      ...obj,
      x: 5 + Math.random() * 85,
      y: minY + Math.random() * (maxY - minY),
      rotation: Math.random() * 360,
      found: false,
      id: Math.random()
    }));
    setItems(initialItems);
  }, [level, sceneKey]);

  const handleItemClick = (id) => {
    if (playSFX) playSFX('match');
    const nextItems = items.map(it => it.id === id ? { ...it, found: true } : it);
    setItems(nextItems);
    if (nextItems.every(it => it.found)) {
      setTimeout(onWin, 800);
    }
  };

  return (
    <div className="game-container" style={{padding: '10px'}}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '400px', 
        backgroundImage: `url(${sceneKey})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '4px solid var(--noir-ink)',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'crosshair',
        boxShadow: '0 0 30px rgba(0,0,0,0.6)'
      }}>
        <div style={{position:'absolute', top:'10px', left:'10px', background:'rgba(0,0,0,0.7)', color:'white', padding:'2px 10px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold', zIndex:10}}>
          📍 {sceneData.name}
        </div>

        {items.map(it => !it.found && (
          <div
            key={it.id}
            onClick={() => handleItemClick(it.id)}
            style={{
              position: 'absolute',
              left: `${it.x}%`,
              top: `${it.y}%`,
              fontSize: '1.6rem',
              cursor: 'pointer',
              // Camuflaje: Desaturado, un poco transparente y mezclado con el fondo
              filter: 'grayscale(0.8) contrast(1.2) opacity(0.5) sepia(0.3) drop-shadow(0 0 1px black)',
              transform: `scale(0.8) rotate(${it.rotation}deg)`,
              transition: 'all 0.3s',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.filter = 'grayscale(0.2) contrast(1.5) opacity(0.9) drop-shadow(0 0 5px white)';
              e.target.style.transform = `scale(1.1) rotate(${it.rotation}deg)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = 'grayscale(0.8) contrast(1.2) opacity(0.5) sepia(0.3) drop-shadow(0 0 1px black)';
              e.target.style.transform = `scale(0.8) rotate(${it.rotation}deg)`;
            }}
          >
            {it.icon}
          </div>
        ))}
      </div>

      {/* Panel de Objetos a Buscar (Estilo June's Journey) */}
      <div style={{ 
        marginTop: '15px', 
        background: 'rgba(255,255,255,0.95)', 
        padding: '15px', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        border: '2px solid var(--noir-ink)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        {items.map(it => (
          <div key={it.id} style={{
            textAlign: 'center',
            opacity: it.found ? 0.3 : 1,
            textDecoration: it.found ? 'line-through' : 'none',
            color: 'var(--noir-ink)',
            transition: 'all 0.3s'
          }}>
            <div style={{fontSize: '1.5rem', marginBottom: '2px'}}>{it.icon}</div>
            <div style={{fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase'}}>{it.name}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '15px', textAlign: 'center', display:'flex', justifyContent:'center', gap:'15px' }}>
        <button className="btn" onClick={() => {
          const unfound = items.filter(it => !it.found);
          if (unfound.length > 0) {
            const randomItem = unfound[Math.floor(Math.random() * unfound.length)];
            const el = document.getElementById(`hidden-item-${randomItem.id}`);
            if (el) {
              el.style.filter = 'grayscale(0) brightness(2) contrast(2) drop-shadow(0 0 10px gold)';
              el.style.transform = 'scale(1.5)';
              setTimeout(() => {
                el.style.filter = 'grayscale(0.8) contrast(1.2) opacity(0.5) sepia(0.3) drop-shadow(0 0 1px black)';
                el.style.transform = `scale(0.8) rotate(${randomItem.rotation}deg)`;
              }, 2000);
            }
          }
        }} style={{fontSize: '0.8rem', background:'var(--noir-ink)', color:'gold'}}>💡 PISTA</button>
        <button className="btn" onClick={() => {
          setItems(prev => prev.map(it => ({...it, found: true})));
          onWin();
        }} style={{background:'var(--noir-red)', color:'white'}}>🏁 RESOLVER</button>
        <button className="btn" onClick={onExit} style={{fontSize: '0.8rem'}}>ABANDONAR</button>
      </div>
    </div>
  );
};
