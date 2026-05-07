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
        <div style={{marginTop: '20px', textAlign: 'center'}}>
          <button className="btn" onClick={onExit}>ABANDONAR</button>
        </div>
      </div>
    </div>
  );
};
