import React, { useState, useEffect } from 'react';
import { initMatch3Grid, checkMatches, swap, MATCH3_ITEMS } from '../utils/match3Logic';

export const Match3Game = ({ level, onWin, onExit }) => {
  const [grid, setGrid] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(15);
  const targetScore = 50 + (level * 5);

  useEffect(() => {
    setGrid(initMatch3Grid());
  }, []);

  const handleTileClick = (idx) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      const isNeighbor = (
        idx === selectedIdx - 1 || idx === selectedIdx + 1 ||
        idx === selectedIdx - 6 || idx === selectedIdx + 6
      );

      if (isNeighbor) {
        const newGrid = swap(grid, selectedIdx, idx);
        const { matches } = checkMatches(newGrid);

        if (matches.length > 0) {
          setGrid(newGrid);
          setScore(s => s + matches.length * 10);
          setMoves(m => m - 1);
          // Simple cascade logic would go here, but for now we just refresh matches
          if (score + matches.length * 10 >= targetScore) {
            onWin();
          }
        }
      }
      setSelectedIdx(null);
    }
  };

  return (
    <div className="game-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'gold', marginBottom: '10px', fontSize: '0.9rem' }}>
        <span>PUNTOS: {score} / {targetScore}</span>
        <span>MOVIMIENTOS: {moves}</span>
      </div>
      <div className="match3-grid">
        {grid.map((tile, i) => (
          <div 
            key={tile.uid} 
            className={`match3-slot ${selectedIdx === i ? 'selected' : ''}`}
            onClick={() => handleTileClick(i)}
          >
            {tile.icon}
          </div>
        ))}
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={onExit}>SALIR</button>
      </div>
    </div>
  );
};
