import React, { useState, useEffect } from 'react';
import { generateWordSearch } from '../utils/wordSearchLogic';

export const WordSearchGame = ({ level, onWin, onExit }) => {
  const [data, setData] = useState({ grid: [], words: [] });
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);

  useEffect(() => {
    const difficulty = level > 10 ? 'hard' : level > 5 ? 'medium' : 'easy';
    setData(generateWordSearch(difficulty));
  }, [level]);

  const handleCellClick = (r, c) => {
    const cellId = `${r}-${c}`;
    if (selectedCells.includes(cellId)) {
      setSelectedCells(prev => prev.filter(id => id !== cellId));
    } else {
      const nextCells = [...selectedCells, cellId];
      setSelectedCells(nextCells);
      
      // Check if current selection matches any word
      const matchingWord = data.words.find(w => 
        !foundWords.includes(w.word) &&
        w.positions.length === nextCells.length &&
        w.positions.every(pos => nextCells.includes(pos))
      );

      if (matchingWord) {
        const nextFound = [...foundWords, matchingWord.word];
        setFoundWords(nextFound);
        setSelectedCells([]);
        if (nextFound.length === data.words.length) {
          onWin();
        }
      }
    }
  };

  return (
    <div className="game-container">
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="wordsearch-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${data.grid.length}, 30px)`,
          gap: '2px',
          background: 'var(--noir-ink)',
          padding: '10px',
          borderRadius: '8px'
        }}>
          {data.grid.map((row, r) => row.map((char, c) => {
            const id = `${r}-${c}`;
            const isSelected = selectedCells.includes(id);
            const isFound = data.words.some(w => foundWords.includes(w.word) && w.positions.includes(id));
            
            return (
              <div 
                key={id}
                onClick={() => handleCellClick(r, c)}
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  background: isFound ? 'var(--noir-red)' : isSelected ? 'gold' : 'var(--noir-ink)',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {char}
              </div>
            );
          }))}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'gold', fontSize: '0.9rem', marginBottom: '10px' }}>EVIDENCIAS A BUSCAR:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.words.map(w => (
              <li key={w.word} style={{ 
                fontSize: '0.8rem', 
                color: foundWords.includes(w.word) ? 'rgba(255,255,255,0.3)' : 'white',
                textDecoration: foundWords.includes(w.word) ? 'line-through' : 'none',
                marginBottom: '5px'
              }}>
                {foundWords.includes(w.word) ? '✅' : '❓'} {w.word}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={onExit}>SALIR</button>
      </div>
    </div>
  );
};
