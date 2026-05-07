import React, { useState, useEffect, useCallback } from 'react';
import { generateBoard, isWin } from './utils/sudokuLogic';
import { generateWordSearch } from './utils/wordSearchLogic';
import { initMergeGrid, handleMerge, MERGE_ITEMS } from './utils/mergeLogic';
import { initMatch3Grid, checkMatches, swap, MATCH3_ITEMS } from './utils/match3Logic';

const TITULOS = ["El Robo", "El Misterio", "La Sombra", "El Código", "La Traición", "El Chantaje", "La Intriga", "El Rapto", "La Estafa", "El Crimen"];
const OBJETOS = ["del Diamante", "del Puerto", "de la Mansión", "del Senador", "de la Mafia", "del Casino", "del Almacén", "de la Joyería"];

const CARTAS_COLLECTIBLES = [
  { id: 1, title: "Lupa de Oro", icon: "🔍" },
  { id: 2, title: "Anillo Gánster", icon: "💍" },
  { id: 3, title: "Llave Maestra", icon: "🔑" },
  { id: 4, title: "Rubí Sangriento", icon: "💎" }
];

// Generador de mapa infinito (mantiene 20 puntos visibles pero se pueden scrollear o resetear)
const FELICITACIONES = [
  "¡Increíble trabajo! Tienes ojos de lince.",
  "El sargento Miller está impresionado. ¡Sigue así!",
  "Una pista clave para el caso. ¡Eres el mejor!",
  "La ciudad duerme un poco más segura gracias a ti.",
  "¡Brillante! Has conectado los puntos como nadie.",
  "Ese sospechoso no tenía ninguna oportunidad contigo."
];

function getRango(score) {
  if (score < 500) return "Patrullero Novato 👮‍♂️";
  if (score < 1500) return "Detective Junior 🕵️‍♂️";
  if (score < 3000) return "Ojo de Lince 👁️";
  if (score < 5000) return "Inspector Jefe 🎖️";
  return "Leyenda de la Ciudad 🏆";
}

const speak = (text, isMuted) => {
  if (isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const vcs = window.speechSynthesis.getVoices();
  const sv = vcs.find(v => v.lang.startsWith('es')) || vcs[0];
  if (sv) utterance.voice = sv;
  utterance.pitch = 0.85; utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

const PUNTOS_MAPA = Array(100).fill(0).map((_, i) => ({
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80
}));

const ESCENAS = [
  "/escena_crimen.png",
  "/escena_puerto.png",
  "/escena_mansion.png",
  "/escena_casino.png",
  "/escena_callejon.png"
];
const OBJETOS_OCULTOS = ["🕵️", "🔫", "🩸", "💼", "🚬", "🗝️", "📱", "🍷"];

function App() {
  const [view, setView] = useState('menu');
  const [isMuted, setIsMuted] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [level, setLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [gameType, setGameType] = useState('sudoku');
  const [collectedCards, setCollectedCards] = useState([]);
  const [thought, setThought] = useState("");
  const [score, setScore] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [inventory, setInventory] = useState({ coffee: 2, food: 1 });
  const [devClicks, setDevClicks] = useState(0);
  const [showReward, setShowReward] = useState(null);
  
  // Estados de juegos
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [wsData, setWsData] = useState({ grid: [], words: [] });
  const [selectedCells, setSelectedCells] = useState([]);
  const [mergeGrid, setMergeGrid] = useState([]);
  const [match3Grid, setMatch3Grid] = useState([]);
  const [match3Score, setMatch3Score] = useState(0);
  const [selectedMatch3Idx, setSelectedMatch3Idx] = useState(null);
  const [puzzleGrid, setPuzzleGrid] = useState([]); // {id, currentPos}
  const [draggedIdx, setDraggedIdx] = useState(null); // Usado para Merge
  const [hiddenItems, setHiddenItems] = useState([]); // {x, y, icon, found}
  const [currentScene, setCurrentScene] = useState(ESCENAS[0]);
  const [gameStatus, setGameStatus] = useState('playing');

  useEffect(() => {
    try {
      const savedLvl = localStorage.getItem('noir-progress');
      const savedScore = localStorage.getItem('noir-score');
      const savedDiams = localStorage.getItem('noir-diamonds');
      const savedEnergy = localStorage.getItem('noir-energy');
      const savedInv = localStorage.getItem('noir-inventory');
      const savedTest = localStorage.getItem('noir-testmode');

      if (savedLvl) setUnlockedLevel(parseInt(savedLvl));
      if (savedScore) setScore(parseInt(savedScore));
      if (savedDiams) setDiamonds(parseInt(savedDiams));
      if (savedEnergy) setEnergy(parseInt(savedEnergy));
      if (savedInv) setInventory(JSON.parse(savedInv));
      if (savedTest) setIsTestMode(savedTest === 'true');
    } catch (e) { console.error("Error cargando datos", e); }
    
    const t = ["Barrio peligroso...", "Necesito una pista.", "Miller me vigila."][Math.floor(Math.random()*3)];
    setThought(t);
    speak(t, isMuted);
  }, [view, isMuted]);

  // Autoregeneración de energía (opcional)
  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy(prev => {
        const next = Math.min(100, prev + 1);
        localStorage.setItem('noir-energy', next);
        return next;
      });
    }, 60000); // 1 punto por minuto
    return () => clearInterval(timer);
  }, []);

  const startNewGame = (lvl, type) => {
    if (!isTestMode && energy < 20) {
      alert("Estás demasiado agotado. Toma un café o descansa.");
      return;
    }
    
    if (!isTestMode) {
      setEnergy(prev => {
        const next = prev - 20;
        localStorage.setItem('noir-energy', next);
        return next;
      });
    }

    setGameType(type); setLevel(lvl); setGameStatus('playing'); setShowReward(null);
    setMatch3Score(0); setSelectedMatch3Idx(null);

    if (type === 'sudoku') {
      const { initial, solution: sol } = generateBoard('easy');
      setBoard(initial); setSolution(sol);
    } else if (type === 'wordsearch') {
      setWsData(generateWordSearch('easy'));
    } else if (type === 'merge') {
      setMergeGrid(initMergeGrid());
    } else if (type === 'match3') {
      setMatch3Grid(initMatch3Grid());
    } else if (type === 'puzzle') {
      const pieces = Array(9).fill(0).map((_, i) => ({ id: i, pos: i }))
        .sort(() => Math.random() - 0.5);
      setPuzzleGrid(pieces);
    } else if (type === 'hidden') {
      // Elegir escena según nivel
      setCurrentScene(ESCENAS[lvl % ESCENAS.length]);
      const items = Array(5).fill(0).map(() => ({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        icon: OBJETOS_OCULTOS[Math.floor(Math.random() * OBJETOS_OCULTOS.length)],
        found: false,
        id: Math.random()
      }));
      setHiddenItems(items);
    }
    setView('game');
  };

  const finishGame = () => {
    setGameStatus('won');
    const pts = 100 + (level * 10);
    const diams = 5;
    const foodReward = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'coffee' : 'food') : null;

    setScore(s => s + pts); setDiamonds(d => d + diams);
    if (foodReward) {
      setInventory(prev => {
        const next = { ...prev, [foodReward]: prev[foodReward] + 1 };
        localStorage.setItem('noir-inventory', JSON.stringify(next));
        return next;
      });
    }

    if (level === unlockedLevel) {
      setUnlockedLevel(level + 1);
      localStorage.setItem('noir-progress', level + 1);
    }
    const msg = FELICITACIONES[Math.floor(Math.random() * FELICITACIONES.length)];
    setShowReward({ pts, diams, food: foodReward, msg });
    speak(msg, isMuted);
  };

  const renderDetective = () => (
    <div className="detective-float">
      <div className="speech-bubble">"{thought}"</div>
      <div 
        className="detective-full-body" 
        style={{backgroundImage: 'url(/detective_normal.png)', cursor:'pointer'}}
        onClick={() => {
          const next = devClicks + 1;
          if (next >= 5) {
            const nextMode = !isTestMode;
            setIsTestMode(nextMode);
            localStorage.setItem('noir-testmode', nextMode);
            speak(nextMode ? "Protocolo de pruebas activado" : "Regresando al servicio", isMuted);
            setDevClicks(0);
          } else {
            setDevClicks(next);
          }
        }}
      ></div>
    </div>
  );

  if (view === 'menu') return (
    <div className="app-container" style={{paddingLeft: '420px'}}>
      {renderDetective()}
      <div className="economy-hud">
        <div className="hud-item" style={{background: '#444', minWidth:'150px'}}>
          ⚡ {energy}% 
          <div style={{background:'#222', height:'5px', width:'100%', marginTop:'5px'}}>
            <div style={{background:'var(--noir-red)', height:'100%', width:`${energy}%`}}></div>
          </div>
        </div>
        <div className="hud-item">💎 {diamonds}</div>
        <div className="hud-item">⭐ {score}</div>
        <div className="hud-item" style={{color: 'gold', fontWeight:'bold'}}>{getRango(score)}</div>
        <button className="hud-item" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        {/* Inventario Rápido */}
        <div style={{display:'flex', gap:'5px'}}>
          <button className="hud-item" onClick={() => {
            if (inventory.coffee > 0 && energy < 100) {
              setEnergy(e => Math.min(100, e + 30));
              setInventory(i => ({...i, coffee: i.coffee - 1}));
            }
          }}>☕ {inventory.coffee}</button>
          <button className="hud-item" onClick={() => {
            if (inventory.food > 0 && energy < 100) {
              setEnergy(e => Math.min(100, e + 50));
              setInventory(i => ({...i, food: i.food - 1}));
            }
          }}>🥪 {inventory.food}</button>
        </div>
      </div>
      <h1 className="title">EXPEDIENTES NOIR</h1>
      <div className="game-card">
        <div className="city-map-container" style={{backgroundImage: 'url(/mapa_moderno.png)', height: '600px'}}>
          {PUNTOS_MAPA.slice(0, unlockedLevel).map((p, i) => (
            <div key={i} className="case-pin" style={{left:`${p.x}%`, top:`${p.y}%`}} onClick={() => {setLevel(i+1); setView('selector');}}>
              <span style={{fontSize:'0.6rem', color:'#fff'}}>{i+1}</span>
            </div>
          ))}
        </div>
      </div>
      {showReward && (
        <div className="reward-overlay">
          <div className="reward-content celebration">
            <div style={{fontSize:'4rem', marginBottom:'10px'}}>🎖️</div>
            <h2 style={{color:'gold'}}>¡EXCELENTE TRABAJO!</h2>
            <p style={{fontStyle:'italic', color:'#fff', margin:'10px 0'}}>"{showReward.msg}"</p>
            <div className="reward-grid">
              <div className="reward-badge">+{showReward.pts} pts</div>
              <div className="reward-badge">+{showReward.diams} 💎</div>
              {showReward.food && <div className="reward-badge card">¡NUEVOS SUMINISTROS! {showReward.food === 'coffee' ? '☕' : '🥪'}</div>}
            </div>
            <button className="btn btn-primary" style={{marginTop:'20px', width:'100%'}} onClick={() => setShowReward(null)}>Siguiente Caso</button>
          </div>
        </div>
      )}
    </div>
  );

  if (view === 'selector') {
    const allTypes = ['hidden', 'sudoku', 'wordsearch', 'merge', 'match3', 'puzzle'];
    
    // Si estamos en modo test, mostramos todos. Si no, aplicamos la regla de niveles.
    const count = isTestMode ? 6 : (level <= 3 ? 1 : level <= 6 ? 2 : 3);
    
    const available = isTestMode 
      ? allTypes 
      : allTypes
          .sort((a, b) => ((level * a.length) % 17) - ((level * b.length) % 17))
          .slice(0, count);

    const labels = {
      hidden: "🔍 Escena del Crimen (Objetos)",
      sudoku: "🔬 Decodificar (Sudoku)",
      wordsearch: "📁 Archivos (Sopa de Letras)",
      merge: "🧪 Laboratorio (Merge)",
      match3: "⚖️ Interrogatorio (Match 3)",
      puzzle: "🧩 Reconstrucción (Puzle)"
    };

    return (
      <div className="app-container" style={{paddingLeft: '420px'}}>
        {renderDetective()}
        <h1 className="title">CASO #{level}</h1>
        <div className="game-card">
          <p style={{marginBottom:'1rem', fontWeight:'bold'}}>Opciones de investigación disponibles:</p>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {available.map(type => (
              <button key={type} className="btn" onClick={() => startNewGame(level, type)}>
                {labels[type]}
              </button>
            ))}
            <button className="btn btn-primary" style={{marginTop:'10px', background:'#333'}} onClick={() => setView('menu')}>Volver al Mapa</button>
          </div>
          {count < 3 && <p style={{fontSize:'0.8rem', marginTop:'15px', fontStyle:'italic'}}>Sigue subiendo de nivel para desbloquear más métodos de investigación.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{paddingLeft: '420px'}}>
      {renderDetective()}
      <h1 className="title">{gameType.toUpperCase()}</h1>
      <div className="game-card" style={{position:'relative'}}>
        {gameType === 'puzzle' && (
          <div className="puzzle-view">
            <p style={{fontSize:'0.9rem', marginBottom:'1rem'}}>Reconstrucción: Ordena las piezas de la fotografía. Clica en dos piezas para intercambiarlas.</p>
            <div className="puzzle-grid">
              {puzzleGrid.map((piece, i) => (
                <div 
                  key={i} 
                  className={`puzzle-piece ${selectedCell === i ? 'selected' : ''}`}
                  style={{
                    backgroundImage: `url(${currentScene})`,
                    backgroundSize: '300% 300%',
                    backgroundPosition: `${(piece.id % 3) * 50}% ${Math.floor(piece.id / 3) * 50}%`
                  }}
                  onClick={() => {
                    if (selectedCell === null) {
                      setSelectedCell(i);
                    } else {
                      const newGrid = [...puzzleGrid];
                      const temp = newGrid[selectedCell];
                      newGrid[selectedCell] = newGrid[i];
                      newGrid[i] = temp;
                      setPuzzleGrid(newGrid);
                      setSelectedCell(null);
                      
                      if (newGrid.every((p, idx) => p.id === idx)) finishGame();
                    }
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
        {gameType === 'hidden' && (
          <div className="hidden-object-game" style={{backgroundImage: `url(${currentScene})`, width:'100%', height:'450px', backgroundSize:'cover', position:'relative', border:'4px solid #000'}}>
             {hiddenItems.map(item => (
               <div 
                key={item.id} 
                style={{
                  position:'absolute', left:`${item.x}%`, top:`${item.y}%`, 
                  fontSize:'2rem', cursor:'pointer', 
                  opacity: item.found ? 0.3 : 1,
                  filter: item.found ? 'grayscale(1)' : 'none',
                  pointerEvents: item.found ? 'none' : 'auto'
                }}
                onClick={() => {
                  const newItems = hiddenItems.map(h => h.id === item.id ? {...h, found: true} : h);
                  setHiddenItems(newItems);
                  if (newItems.every(h => h.found)) finishGame();
                }}
               >
                 {item.icon}
               </div>
             ))}
             <div style={{position:'absolute', bottom:'10px', right:'10px', background:'rgba(0,0,0,0.7)', color:'#fff', padding:'5px 10px'}}>
                Objetos: {hiddenItems.filter(h=>h.found).length} / {hiddenItems.length}
             </div>
          </div>
        )}
        {gameType === 'sudoku' && (
          <div className="sudoku-grid">
            {board.map((row, r) => row.map((cell, c) => (
              <div key={`${r}-${c}`} className={`cell ${selectedCell?.r===r && selectedCell?.c===c?'selected':''}`} onClick={() => setSelectedCell({r,c})}>{cell||''}</div>
            )))}
          </div>
        )}
        {gameType === 'wordsearch' && (
          <div className="word-search-view">
            <div className="word-search-grid" style={{gridTemplateColumns: `repeat(${wsData.grid.length}, 1fr)`}}>
              {wsData.grid.map((row, r) => row.map((char, c) => (
                <div key={`${r}-${c}`} className={`letter-cell ${selectedCells.includes(`${r}-${c}`)?'selected':''}`} 
                  onClick={() => {
                    const pos = `${r}-${c}`;
                    const next = selectedCells.includes(pos) ? selectedCells.filter(x=>x!==pos) : [...selectedCells, pos];
                    setSelectedCells(next);
                    const nw = wsData.words.map(w => w.found ? w : (w.positions.every(p=>next.includes(p)) ? {...w, found:true} : w));
                    setWsData({...wsData, words: nw}); if (nw.every(w=>w.found)) finishGame();
                  }}>{char}</div>
              )))}
            </div>
          </div>
        )}
        {gameType === 'match3' && (
          <div className="match3-view">
            <p style={{fontSize:'0.9rem', marginBottom:'1rem'}}>Interrogatorio: Combina 3 o más pruebas para extraer la verdad. Meta: 15 puntos.</p>
            <div className="match3-grid">
              {match3Grid.map((item, i) => {
                const isSelected = selectedMatch3Idx === i;
                return (
                  <div 
                    key={i} 
                    className={`match3-slot ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (selectedMatch3Idx === null) {
                        setSelectedMatch3Idx(i);
                      } else {
                        // Intentar intercambio
                        const newGrid = swap(match3Grid, selectedMatch3Idx, i);
                        const matches = checkMatches(newGrid);
                        if (matches.length > 0) {
                          // Es un movimiento válido
                          let updatedGrid = [...newGrid];
                          const scoreGain = matches.length;
                          // Vaciar y rellenar (simplificado)
                          matches.forEach(mIdx => {
                            updatedGrid[mIdx] = MATCH3_ITEMS[Math.floor(Math.random() * MATCH3_ITEMS.length)];
                          });
                          setMatch3Grid(updatedGrid);
                          setMatch3Score(s => {
                            const newS = s + scoreGain;
                            if (newS >= 15) finishGame();
                            return newS;
                          });
                        }
                        setSelectedMatch3Idx(null);
                      }
                    }}
                  >
                    {item?.icon}
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:'10px', fontWeight:'bold', textAlign:'center'}}>
               VERDAD EXTRAÍDA: {Math.min(100, Math.floor((match3Score / 15) * 100))}%
            </div>
          </div>
        )}
        {gameType === 'merge' && (
          <div className="merge-view">
             <p style={{fontSize:'0.9rem', marginBottom:'1rem'}}>Selecciona una pista y luego haz clic en otra para combinar o mover. Meta: Evidencia Final.</p>
             <div className="merge-grid">
              {mergeGrid.map((item, i) => (
                <div 
                  key={i} 
                  className={`merge-slot ${draggedIdx === i ? 'selected' : ''}`} 
                  onClick={() => {
                    if (draggedIdx === null) {
                      if (item) setDraggedIdx(i);
                    } else {
                      // Intentar mover o combinar
                      const newG = handleMerge(mergeGrid, draggedIdx, i);
                      setMergeGrid(newG);
                      setDraggedIdx(null);
                      if (newG.some(x => x?.id === 5)) finishGame();
                    }
                  }}
                >
                  {item && (
                    <>
                      <span style={{fontSize:'2.5rem', pointerEvents:'none'}}>{item.icon}</span>
                      <div style={{position:'absolute', bottom:'2px', fontSize:'0.5rem', textTransform:'uppercase', pointerEvents:'none'}}>{item.name}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="controls" style={{marginTop:'20px'}}>
          {gameType === 'sudoku' && (
            <div className="number-pad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} className="num-btn" onClick={()=>{
                  if(!selectedCell) return;
                  const nb = board.map(r=>[...r]); nb[selectedCell.r][selectedCell.c]=n; setBoard(nb);
                  if(isWin(nb, solution)) finishGame();
                }}>{n}</button>
              ))}
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setView('menu')}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export default App;
