import React, { useState, useEffect } from 'react';

const ESCENAS = [
  "/escena_crimen.png", 
  "/escena_puerto.png", 
  "/escena_mansion.png", 
  "/escena_casino.png", 
  "/escena_callejon.png",
  "/escena_laboratorio.png",
  "/escena_callejon_oscuro.png"
];

export const PuzzleGame = ({ level, onWin, onExit }) => {
  const [grid, setGrid] = useState([]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [mirror, setMirror] = useState(false);
  
  // Dificultad dinámica: Caso 1-3 (3x3), 4-6 (4x3), 7+ (4x4 o 5x4)
  const gridCols = level <= 3 ? 3 : (level <= 6 ? 4 : 5);
  const gridRows = level <= 6 ? 3 : 4;
  const totalPieces = gridCols * gridRows;
  const scene = ESCENAS[level % ESCENAS.length];

  useEffect(() => {
    const initial = Array.from({length: totalPieces}, (_, i) => ({ id: i, pos: i }))
      .sort(() => Math.random() - 0.5);
    setGrid(initial);
    setMirror(Math.random() > 0.5);
  }, [level, totalPieces]);

  const onDragStart = (idx) => {
    if (isSolved) return;
    setDraggedIdx(idx);
  };
  const onDrop = (idx) => {
    if (draggedIdx === null || isSolved) return;
    const newGrid = [...grid];
    const temp = newGrid[idx];
    newGrid[idx] = newGrid[draggedIdx];
    newGrid[draggedIdx] = temp;
    setGrid(newGrid);
    
    // Check if solved
    if (newGrid.every((item, i) => item.id === i)) {
      setIsSolved(true);
      setTimeout(() => onWin(), 1500);
    }
    setDraggedIdx(null);
  };

  const pSize = 80; // tamaño pieza

  return (
    <div className="game-container">
      <p style={{ color: 'gold', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>
        Nivel: {gridCols}x{gridRows} - Reconstruye la escena
      </p>
      <div className="puzzle-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${gridCols}, ${pSize}px)`, 
        gap: isSolved ? '0' : '2px',
        justifyContent: 'center',
        background: isSolved ? 'transparent' : '#333',
        padding: isSolved ? '0' : '5px',
        border: isSolved ? '4px solid gold' : '1px solid #444',
        transition: 'all 0.5s ease',
        boxShadow: isSolved ? '0 0 30px gold' : 'none',
        transform: mirror ? 'scaleX(-1)' : 'none'
      }}>
        {grid.map((item, i) => (
          <div 
            key={item.id}
            draggable={!isSolved}
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            style={{
              width: `${pSize}px`,
              height: `${pSize}px`,
              backgroundImage: `url(${scene})`,
              backgroundSize: `${gridCols * pSize}px ${gridRows * pSize}px`,
              backgroundPosition: `${-(item.id % gridCols) * pSize}px ${-Math.floor(item.id / gridCols) * pSize}px`,
              cursor: isSolved ? 'default' : 'grab',
              border: isSolved ? 'none' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center', display:'flex', justifyContent:'center', gap:'10px' }}>
        <button className="btn" disabled={isSolved} onClick={() => {
          const incorrect = grid.map((item, i) => ({item, i})).filter(x => x.item.id !== x.i);
          if (incorrect.length > 0) {
            const randomPick = incorrect[Math.floor(Math.random() * incorrect.length)];
            const targetId = randomPick.i;
            const actualSourceIdx = grid.findIndex(x => x.id === targetId);
            
            const newGrid = [...grid];
            const temp = newGrid[targetId];
            newGrid[targetId] = newGrid[actualSourceIdx];
            newGrid[actualSourceIdx] = temp;
            
            setGrid(newGrid);
            if (newGrid.every((it, idx) => it.id === idx)) {
              setIsSolved(true);
              setTimeout(() => onWin(), 1500);
            }
          }
        }} style={{background:'var(--noir-ink)', color:'gold'}}>💡 PISTA</button>
        <button className="btn" disabled={isSolved} onClick={() => {
          const solved = grid.map((it, i) => ({...it, id: i})).sort((a,b)=>a.id-b.id);
          setGrid(solved);
          setIsSolved(true);
          setTimeout(() => onWin(), 1500);
        }} style={{background:'var(--noir-red)', color:'white'}}>🏁 RESOLVER</button>
        <button className="btn" onClick={onExit}>ABANDONAR</button>
      </div>
    </div>
  );
};
