import React, { useState, useEffect } from 'react';
import { generateBoard, isWin } from '../utils/sudokuLogic';

export const SudokuGame = ({ level, onWin, onExit }) => {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    const difficulty = level > 10 ? 'hard' : level > 5 ? 'medium' : 'easy';
    const { initial, solution: sol } = generateBoard(difficulty);
    setBoard(initial);
    setSolution(sol);
  }, [level]);

  const handleCellClick = (r, c) => {
    if (board[r][c] === 0 || board[r][c] !== solution[r][c]) {
      setSelectedCell({ r, c });
    }
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const newBoard = board.map((row, rowIndex) => 
      rowIndex === r ? row.map((cell, colIndex) => colIndex === c ? num : cell) : [...row]
    );
    setBoard(newBoard);
    if (isWin(newBoard, solution)) {
      onWin();
    }
  };

  return (
    <div className="game-container">
      <div className="sudoku-grid">
        {board.map((row, r) => (
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`} 
              className={`cell ${selectedCell?.r === r && selectedCell?.c === c ? 'selected' : ''}`}
              onClick={() => handleCellClick(r, c)}
            >
              {cell || ''}
            </div>
          ))
        ))}
      </div>
      <div className="controls" style={{ marginTop: '20px' }}>
        <div className="number-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} className="num-btn" onClick={() => handleNumberInput(n)}>{n}</button>
          ))}
        </div>
        <div style={{marginTop: '20px', textAlign: 'center', display:'flex', justifyContent:'center', gap:'10px'}}>
          <button className="btn" onClick={() => {
            const emptyCells = [];
            board.forEach((row, r) => row.forEach((cell, c) => {
              if (cell === 0) emptyCells.push({r, c});
            }));
            if (emptyCells.length > 0) {
              const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              const newBoard = board.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c) ? solution[r][c] : cell));
              setBoard(newBoard);
              if (isWin(newBoard, solution)) onWin();
            }
          }} style={{background:'var(--noir-ink)', color:'gold'}}>💡 PISTA</button>
          <button className="btn" onClick={() => {
            setBoard(solution);
            onWin();
          }} style={{background:'var(--noir-red)', color:'white'}}>🏁 RESOLVER</button>
          <button className="btn" onClick={onExit}>ABANDONAR</button>
        </div>
      </div>
    </div>
  );
};
