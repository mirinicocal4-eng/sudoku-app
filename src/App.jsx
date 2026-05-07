import React, { useState, useEffect, useCallback } from 'react';
import { generateBoard, isWin } from './utils/sudokuLogic';

const CASOS = {
  easy: {
    titulo: "CASO #042: EL ROBO DEL RUBÍ",
    descripcion: "Un ladrón de guante blanco ha dejado una nota cifrada tras el robo en la joyería. Si desciframos este código, sabremos su próximo movimiento antes de que sea tarde.",
    sello: "ABIERTO"
  },
  medium: {
    titulo: "CASO #109: MISTERIO EN EL PUERTO",
    descripcion: "Un estibador ha desaparecido. La única pista es un sudoku manchado de café en su taquilla. Los números esconden una dirección que no podemos ignorar.",
    sello: "PRIORITARIO"
  },
  hard: {
    titulo: "CASO #256: LA CONSPIRACIÓN",
    descripcion: "Documentos de alto secreto han sido interceptados. Están protegidos por un cifrado de máxima seguridad. Si fallamos, el escándalo hundirá a la ciudad.",
    sello: "CONFIDENCIAL"
  }
};

function App() {
  const [view, setView] = useState('menu'); // 'menu', 'game'
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');

  const startNewGame = useCallback((diff = difficulty) => {
    const { initial, solution: sol } = generateBoard(diff);
    setBoard(initial.map(row => [...row]));
    setInitialBoard(initial.map(row => [...row]));
    setSolution(sol);
    setDifficulty(diff);
    setSelectedCell(null);
    setGameStatus('playing');
    setView('game');
  }, [difficulty]);

  const handleCellClick = (r, c) => {
    if (initialBoard[r][c] !== 0) return;
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell || gameStatus === 'won') return;
    const { r, c } = selectedCell;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    if (isWin(newBoard, solution)) {
      setGameStatus('won');
    }
  };

  if (view === 'menu') {
    return (
      <div className="app-container">
        <h1 className="title">EXPEDIENTES NOIR</h1>
        <div className="game-card" style={{maxWidth: '500px', margin: '0 auto'}}>
          <div className="stamp">DESPACHO</div>
          <p style={{marginBottom: '2rem', fontSize: '1.2rem'}}>Seleccione un expediente para comenzar la investigación:</p>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {Object.keys(CASOS).map(d => (
              <button key={d} className="btn" onClick={() => startNewGame(d)}>
                {CASOS[d].titulo}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="title">LA INVESTIGACIÓN</h1>
      
      <div className="narrative-box">
        <strong>{CASOS[difficulty].titulo}</strong>
        <p>{CASOS[difficulty].descripcion}</p>
      </div>

      <div className="game-card">
        <div className="stamp">{CASOS[difficulty].sello}</div>
        <div className="sudoku-grid">
          {board.map((row, r) => (
            row.map((cell, c) => {
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isInitial = initialBoard[r][c] !== 0;
              const isWrong = cell !== 0 && cell !== solution[r][c];
              
              return (
                <div 
                  key={`${r}-${c}`}
                  className={`cell ${isSelected ? 'selected' : ''} ${isInitial ? 'initial' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => handleCellClick(r, c)}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              );
            })
          ))}
        </div>

        <div className="controls">
          <div className="number-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} className="num-btn" onClick={() => handleNumberInput(num)}>{num}</button>
            ))}
            <button className="num-btn" onClick={() => handleNumberInput(0)}>⌫</button>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => setView('menu')}>Cerrar Expediente</button>
            <button className="btn" style={{background: '#eee'}} onClick={() => startNewGame()}>Reiniciar</button>
          </div>
        </div>
      </div>

      {gameStatus === 'won' && (
        <div className="narrative-box" style={{borderColor: 'var(--accent)', marginTop: '2rem'}}>
          <strong>¡CASO RESUELTO!</strong>
          <p>Has descifrado el código. La ciudad vuelve a estar a salvo... por ahora. El informe ha sido enviado a central.</p>
        </div>
      )}
    </div>
  );
}

export default App;
