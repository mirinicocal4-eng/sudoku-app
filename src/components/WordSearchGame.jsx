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
        <div style={{ 
          flex: 1, 
          background: 'rgba(0,0,0,0.4)', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid gold',
          minWidth: '150px'
        }}>
          <h3 style={{ color: 'gold', fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid gold', paddingBottom: '5px' }}>EVIDENCIAS:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.words.map(w => (
              <li key={w.word} style={{ 
                fontSize: '1rem', 
                color: foundWords.includes(w.word) ? '#00ff00' : '#fff',
                textDecoration: foundWords.includes(w.word) ? 'line-through' : 'none',
                marginBottom: '10px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{fontSize:'1.2rem'}}>{foundWords.includes(w.word) ? '✅' : '🔍'}</span> 
                {w.word.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="controls" style={{ marginTop: '20px', textAlign: 'center', display:'flex', justifyContent:'center', gap:'10px' }}>
        <button className="btn" onClick={() => {
          const unfound = data.words.filter(w => !foundWords.includes(w.word));
          if (unfound.length > 0) {
            const word = unfound[Math.floor(Math.random() * unfound.length)];
            const firstPos = word.positions[0]; // Format "r-c"
            const cells = document.querySelectorAll('.wordsearch-grid > div');
            // Find the cell index (flat array from grid map)
            const [tr, tc] = firstPos.split('-').map(Number);
            const gridWidth = data.grid[0].length;
            const index = tr * gridWidth + tc;
            const target = cells[index];
            if (target) {
              const originalBg = target.style.background;
              target.style.background = 'gold';
              target.style.color = 'black';
              target.style.transform = 'scale(1.2)';
              setTimeout(() => {
                target.style.background = originalBg;
                target.style.color = 'white';
                target.style.transform = 'scale(1)';
              }, 2000);
            }
          }
        }} style={{background:'var(--noir-ink)', color:'gold'}}>💡 PISTA</button>
        <button className="btn" onClick={() => {
          setFoundWords(data.words.map(w => w.word));
          onWin();
        }} style={{background:'var(--noir-red)', color:'white'}}>🏁 RESOLVER</button>
        <button className="btn" onClick={onExit}>ABANDONAR</button>
      </div>
    </div>
  );
};
