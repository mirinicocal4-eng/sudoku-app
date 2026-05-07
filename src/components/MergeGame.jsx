import React, { useState, useEffect } from 'react';
import { initMergeGrid, handleMerge, MERGE_ITEMS } from '../utils/mergeLogic';

export const MergeGame = ({ level, onWin, onExit }) => {
  const [grid, setGrid] = useState([]);
  const [draggedIdx, setDraggedIdx] = useState(null);

  useEffect(() => {
    setGrid(initMergeGrid());
  }, []);

  const onDragStart = (idx) => {
    setDraggedIdx(idx);
  };

  const onDrop = (idx) => {
    if (draggedIdx === null) return;
    const newGrid = handleMerge(grid, draggedIdx, idx);
    setGrid(newGrid);
    
    // Check if EVIDENCIA FINAL (id: 5) is reached
    if (newGrid.some(item => item?.id === 5)) {
      setTimeout(onWin, 500);
    }
    setDraggedIdx(null);
  };

  return (
    <div className="game-container">
      <p style={{ color: 'gold', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>
        Combina los objetos iguales para obtener la 💎 EVIDENCIA FINAL
      </p>
      <div className="merge-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 60px)', 
        gap: '5px',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.3)',
        padding: '10px',
        borderRadius: '8px'
      }}>
        {grid.map((item, i) => (
          <div 
            key={item?.instanceId || i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              cursor: item ? 'grab' : 'default',
              borderRadius: '4px'
            }}
          >
            {item && (
              <div 
                draggable 
                onDragStart={() => onDragStart(i)}
                style={{ cursor: 'grab' }}
              >
                {item.icon}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center', display:'flex', justifyContent:'center', gap:'10px' }}>
        <button className="btn" onClick={() => {
          const emptyIndices = grid.map((it, i) => it === null ? i : -1).filter(i => i !== -1);
          if (emptyIndices.length > 0) {
            const targetIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            const newItem = { ...MERGE_ITEMS[1], instanceId: Math.random() }; // Item Nivel 2
            const newGrid = [...grid];
            newGrid[targetIdx] = newItem;
            setGrid(newGrid);
          }
        }} style={{background:'var(--noir-ink)', color:'gold'}}>💡 PISTA</button>
        <button className="btn" onClick={onExit}>ABANDONAR</button>
      </div>
    </div>
  );
};
