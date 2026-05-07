import React, { useState, useEffect } from 'react';

const ESCENAS = ["/escena_crimen.png", "/escena_puerto.png", "/escena_mansion.png", "/escena_casino.png", "/escena_callejon.png"];

export const PuzzleGame = ({ level, onWin, onExit }) => {
  const [grid, setGrid] = useState([]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const scene = ESCENAS[level % ESCENAS.length];

  useEffect(() => {
    const initial = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(id => ({ id, pos: id }))
      .sort(() => Math.random() - 0.5);
    setGrid(initial);
  }, [level]);

  const onDragStart = (idx) => setDraggedIdx(idx);
  const onDrop = (idx) => {
    if (draggedIdx === null) return;
    const newGrid = [...grid];
    const temp = newGrid[idx];
    newGrid[idx] = newGrid[draggedIdx];
    newGrid[draggedIdx] = temp;
    setGrid(newGrid);
    
    // Check if solved
    if (newGrid.every((item, i) => item.id === i)) {
      onWin();
    }
    setDraggedIdx(null);
  };

  return (
    <div className="game-container">
      <p style={{ color: 'gold', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>
        Arrastra las piezas para reconstruir la imagen del crimen
      </p>
      <div className="puzzle-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 80px)', 
        gap: '2px',
        justifyContent: 'center',
        background: '#333',
        padding: '5px'
      }}>
        {grid.map((item, i) => (
          <div 
            key={item.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            style={{
              width: '80px',
              height: '80px',
              backgroundImage: `url(${scene})`,
              backgroundSize: '320px 240px',
              backgroundPosition: `${-(item.id % 4) * 80}px ${-Math.floor(item.id / 4) * 80}px`,
              cursor: 'grab',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
        ))}
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center', display:'flex', justifyContent:'center', gap:'10px' }}>
        <button className="btn" onClick={() => {
          const incorrect = grid.map((item, i) => ({item, i})).filter(x => x.item.id !== x.i);
          if (incorrect.length > 0) {
            const randomPick = incorrect[Math.floor(Math.random() * incorrect.length)];
            const targetId = randomPick.i;
            const currentItemAtTarget = grid[targetId];
            
            // Find where the piece that SHOULD be at targetId is currently located
            const actualSourceIdx = grid.findIndex(x => x.id === targetId);
            
            const newGrid = [...grid];
            // Swap
            const temp = newGrid[targetId];
            newGrid[targetId] = newGrid[actualSourceIdx];
            newGrid[actualSourceIdx] = temp;
            
            setGrid(newGrid);
            if (newGrid.every((it, idx) => it.id === idx)) onWin();
          }
        }} style={{background:'var(--noir-ink)', color:'gold'}}>💡 PISTA</button>
        <button className="btn" onClick={onExit}>ABANDONAR</button>
      </div>
    </div>
  );
};
