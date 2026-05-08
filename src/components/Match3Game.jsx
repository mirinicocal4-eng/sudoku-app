import React, { useState, useEffect } from 'react';
import { initMatch3Grid, checkMatches, swap, MATCH3_ITEMS } from '../utils/match3Logic';

export const Match3Game = ({ level, onWin, onExit, playSFX }) => {
  const [grid, setGrid] = useState([]);
  const [cleanedTiles, setCleanedTiles] = useState(Array(36).fill(false));
  const [lizardProgress, setLizardProgress] = useState(0);
  const [conveyorOffset, setConveyorOffset] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(12);
  const targetScore = 50 + (level * 5);

  useEffect(() => {
    setGrid(initMatch3Grid(level));
  }, [level]);

  const triggerSpecial = (idx, type, currentGrid, currentScore) => {
    let newGrid = [...currentGrid];
    let toRemove = new Set();
    const r = Math.floor(idx / 6);
    const c = idx % 6;

    if (type === 'bomb') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) toRemove.add(nr * 6 + nc);
        }
      }
    } else if (type === 'ray') {
      for (let i = 0; i < 6; i++) {
        toRemove.add(r * 6 + i);
        toRemove.add(i * 6 + c);
      }
    }

    toRemove.forEach(i => { newGrid[i] = null; });
    const { grid: finalGrid, score: finalScore } = cascadeAndFill(newGrid, currentScore + toRemove.size * 10, Array.from(toRemove));
    setGrid(finalGrid);
    setScore(finalScore);
  };

  const cascadeAndFill = (currentGrid, currentScore, removedIndices = []) => {
    let newGrid = [...currentGrid];
    let newCleaned = [...cleanedTiles];
    
    if (level >= 2) {
      removedIndices.forEach(idx => { newCleaned[idx] = true; });
      setCleanedTiles(newCleaned);
    }

    for (let c = 0; c < 6; c++) {
      let emptySlot = 5;
      for (let r = 5; r >= 0; r--) {
        const idx = r * 6 + c;
        if (newGrid[idx] !== null) {
          const targetIdx = emptySlot * 6 + c;
          // Si el objeto llega al fondo y es un coleccionable, desaparece y da puntos
          if (emptySlot === 5 && newGrid[idx].collectible) {
            newGrid[idx] = null;
            currentScore += 200;
            // No incrementamos emptySlot porque el hueco sigue ahí
          } else {
            const temp = newGrid[idx];
            newGrid[idx] = null;
            newGrid[targetIdx] = temp;
            emptySlot--;
          }
        }
      }
      for (let r = emptySlot; r >= 0; r--) {
        const idx = r * 6 + c;
        const availableItems = level > 3 ? 7 : 5;
        newGrid[idx] = { ...MATCH3_ITEMS[Math.floor(Math.random() * availableItems)], uid: Math.random() };
      }
    }
    return applyMatches(newGrid, currentScore);
  };

  const applyMatches = (currentGrid, currentScore) => {
    const { matches, powerUps } = checkMatches(currentGrid);
    if (matches.length === 0) return { grid: currentGrid, score: currentScore };

    if (playSFX) playSFX('match');
<<<<<<< HEAD

=======
>>>>>>> a3a73a452813414358b36441870c3aae6d49eb1a
    let newGrid = [...currentGrid];
    let addedScore = matches.length * 10;
    let footprintCount = 0;
    
    const size = 6;
    matches.forEach(idx => {
      if (newGrid[idx]?.id === 1) footprintCount++;
      const r = Math.floor(idx / size), c = idx % size;
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
        const nr = r+dr, nc = c+dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const nIdx = nr * size + nc;
          if (newGrid[nIdx]?.obstacle === 'crate') {
            newGrid[nIdx] = null;
            addedScore += 20;
          }
        }
      });
      if (newGrid[idx]?.obstacle === 'ice' || newGrid[idx]?.obstacle === 'chain') {
        newGrid[idx] = { ...MATCH3_ITEMS[Math.floor(Math.random()*5)], uid: Math.random() };
      }
    });

    if (footprintCount > 0) setLizardProgress(p => Math.min(100, p + footprintCount * 5));

    powerUps.forEach(pu => {
      newGrid[pu.idx] = { ...MATCH3_ITEMS[pu.type === 'ray' ? 8 : 7], uid: Math.random() };
    });

    const puIndices = powerUps.map(p => p.idx);
    matches.forEach(idx => { 
      if (!puIndices.includes(idx) && newGrid[idx]?.obstacle !== 'ice' && newGrid[idx]?.obstacle !== 'chain') {
        newGrid[idx] = null; 
      }
    });

    return cascadeAndFill(newGrid, currentScore + addedScore, matches);
  };

  const shiftConveyor = () => {
    setGrid(prev => {
      const next = [...prev];
      const rowStart = 18; // Fila 3
      const first = next[rowStart];
      for (let i = 0; i < 5; i++) {
        next[rowStart + i] = next[rowStart + i + 1];
      }
      next[rowStart + 5] = first;
      return next;
    });
  };

  const handleTileClick = (idx) => {
    if (moves <= 0) return;
    const item = grid[idx];
    if (item.obstacle === 'crate') return;

    if (item.special) {
      triggerSpecial(idx, item.special, grid, score);
      setMoves(m => m - 1);
      if (level >= 7) shiftConveyor();
      return;
    }

    if (selectedIdx === null) {
      if (item.obstacle === 'ice' || item.obstacle === 'chain') return;
      setSelectedIdx(idx);
    } else {
      const isNeighbor = (
        idx === selectedIdx - 1 || idx === selectedIdx + 1 ||
        idx === selectedIdx - 6 || idx === selectedIdx + 6
      );
      const targetItem = grid[idx];
      if (isNeighbor && targetItem.obstacle !== 'ice' && targetItem.obstacle !== 'chain' && targetItem.obstacle !== 'crate') {
        let tempGrid = swap(grid, selectedIdx, idx);
        const { matches } = checkMatches(tempGrid);
        if (matches.length > 0) {
          const { grid: finalGrid, score: finalScore } = applyMatches(tempGrid, score);
          setGrid(finalGrid);
          setScore(finalScore);
          setMoves(m => m - 1);
          if (level >= 7) shiftConveyor();
          
          if (moves === 1) {
            const allClean = level >= 2 ? cleanedTiles.every(v => v) : false;
            if (finalScore >= targetScore || allClean || lizardProgress >= 100) onWin();
            else { alert("Interrogatorio fallido."); onExit(); }
          }
        }
      }
      setSelectedIdx(null);
    }
  };

  return (
    <div className="game-container">
      <div style={{ marginBottom: '15px', position:'relative' }}>
        <div style={{ height: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden', border:'1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ width: `${lizardProgress}%`, height: '100%', background: 'linear-gradient(90deg, #2ecc71, #27ae60)', transition: 'width 0.5s ease-out' }}></div>
        </div>
        <div style={{ 
          position: 'absolute', 
          top: '-15px', 
          left: `calc(${lizardProgress}% - 15px)`, 
          fontSize: '1.2rem', 
          transition: 'left 0.5s ease-out',
          zIndex: 2
        }}>🐕</div>
        <div style={{ position:'absolute', top:'-18px', right:0, fontSize:'0.7rem', color:'gold', fontWeight:'bold'}}>META 🏁</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'gold', marginBottom: '10px', fontSize: '0.9rem' }}>
        <span>PUNTOS: {score} / {targetScore}</span>
        <span>MOVIMIENTOS: {moves}</span>
      </div>
      <div className="match3-grid">
        {grid.map((tile, i) => {
          const isCleaned = cleanedTiles[i];
          const obs = tile.obstacle;
          const isConveyor = i >= 18 && i <= 23;
          
          return (
            <div 
              key={tile.uid} 
              className={`match3-slot ${selectedIdx === i ? 'selected' : ''}`}
              onClick={() => handleTileClick(i)}
              style={{
                background: (level >= 7 && isConveyor) ? 'rgba(100, 100, 100, 0.3)' : (level >= 2 && isCleaned ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.05)'),
                border: (level >= 7 && isConveyor) ? '2px dashed rgba(255,255,255,0.2)' : (level >= 2 && isCleaned ? '1px solid gold' : '1px solid rgba(255,255,255,0.1)'),
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Obstacle Overlays */}
              {obs === 'ice' && <div style={{position:'absolute', inset:0, background:'rgba(0, 255, 255, 0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem'}}>❄️</div>}
              {obs === 'chain' && <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', color:'silver'}}>⛓️</div>}
              {obs === 'crate' && <div style={{position:'absolute', inset:0, background:'#5d4037', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem'}}>📦</div>}
              
              <span style={{ 
                opacity: (obs === 'ice' || obs === 'chain' || obs === 'crate') ? 0.4 : 1,
                fontSize: '1.8rem',
                zIndex: 1
              }}>
                {tile.icon}
              </span>
            </div>
          );
        })}
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center', display:'flex', justifyContent:'center', gap:'10px' }}>
        <button className="btn" onClick={() => {
          if (moves <= 0) return;
          const randomRow = Math.floor(Math.random() * 6);
          const newGrid = [...grid];
          // Clear row (6 items)
          for(let i=0; i<6; i++) {
            const idx = randomRow * 6 + i;
            newGrid[idx] = { ...MATCH3_ITEMS[Math.floor(Math.random() * MATCH3_ITEMS.length)], uid: Math.random() };
          }
          setGrid(newGrid);
          setScore(s => {
            const next = s + 60;
            if (next >= targetScore) onWin();
            return next;
          });
          setMoves(m => m - 1);
        }} style={{background:'var(--noir-ink)', color:'gold'}}>💡 PISTA</button>
        <button className="btn" onClick={() => {
          setScore(targetScore);
          onWin();
        }} style={{background:'var(--noir-red)', color:'white'}}>🏁 RESOLVER</button>
        <button className="btn" onClick={onExit}>ABANDONAR</button>
      </div>
    </div>
  );
};
