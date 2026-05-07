import React, { useState, useEffect, useCallback } from 'react';
import { generateBoard, isWin } from './utils/sudokuLogic';
import { generateWordSearch } from './utils/wordSearchLogic';
import { initMergeGrid, handleMerge, MERGE_ITEMS } from './utils/mergeLogic';
import { initMatch3Grid, checkMatches, swap, MATCH3_ITEMS } from './utils/match3Logic';

const TITULOS = ["El Robo", "El Misterio", "La Sombra", "El Código", "La Traición", "El Chantaje", "La Intriga", "El Rapto", "La Estafa", "El Crimen", "La Venganza", "El Secreto"];
const OBJETOS = ["del Diamante", "del Puerto", "de la Mansión", "del Senador", "de la Mafia", "del Casino", "del Almacén", "de la Joyería", "del Banco", "del Museo"];

const FELICITACIONES = [
  "¡Increíble trabajo! Tienes ojos de lince.",
  "El sargento Miller está impresionado. ¡Sigue así!",
  "Una pista clave para el caso. ¡Eres el mejor!",
  "La ciudad duerme un poco más segura gracias a ti.",
  "¡Brillante! Has conectado los puntos como nadie.",
  "Ese sospechoso no tenía ninguna oportunidad contigo."
];

const EVIDENCIAS_POSIBLES = [
  { name: "Cápsula de Bala", icon: "🔫", desc: "Calibre .38, encontrada cerca del muelle." },
  { name: "Nota con Carmín", icon: "💄", desc: "Un mensaje críptico escrito en un pañuelo." },
  { name: "Llave Maestra", icon: "🗝️", desc: "Abre puertas que deberían estar cerradas." },
  { name: "Reloj Roto", icon: "⌚", desc: "Se detuvo exactamente a la hora del crimen." },
  { name: "Huella Dactilar", icon: "👣", desc: "Recuperada con polvo de grafito." },
  { name: "Cinta de Cassette", icon: "📼", desc: "Contiene una grabación comprometedora." },
  { name: "Anillo de Oro", icon: "💍", desc: "Tiene una inscripción: 'Para siempre, M'." }
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

const ESCENAS = ["/escena_crimen.png", "/escena_puerto.png", "/escena_mansion.png", "/escena_casino.png", "/escena_callejon.png"];
const OBJETOS_OCULTOS = ["🕵️", "🔫", "🩸", "💼", "🚬", "🗝️", "📱", "🍷"];

const PERSONAJES = {
  miller: { name: "Sargento Miller", img: "/sargento_miller.png", text: "Escucha, detective. Tengo estos archivos que necesitan ser procesados ya." },
  black: { name: "Dra. Black", img: "/dra_black.png", text: "He traído las pruebas del lugar del crimen. Necesito que el laboratorio haga su magia." },
  cooper: { name: "Agente Cooper", img: "/agente_cooper.png", text: "Tengo un sospechoso en la sala y un par de pistas en la calle. ¿Te encargas?" }
};

const GAME_ASIG = {
  sudoku: 'miller', wordsearch: 'miller',
  merge: 'black', puzzle: 'black',
  hidden: 'cooper', match3: 'cooper'
};

function App() {
  const [view, setView] = useState('menu');
  const [isMuted, setIsMuted] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [level, setLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [gameType, setGameType] = useState('sudoku');
  const [thought, setThought] = useState("");
  const [score, setScore] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [inventory, setInventory] = useState({ coffee: 2, food: 1 });
  const [evidence, setEvidence] = useState([]);
  const [devClicks, setDevClicks] = useState(0);
  const [showReward, setShowReward] = useState(null);
  
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [wsData, setWsData] = useState({ grid: [], words: [] });
  const [selectedCells, setSelectedCells] = useState([]);
  const [mergeGrid, setMergeGrid] = useState([]);
  const [match3Grid, setMatch3Grid] = useState([]);
  const [match3Score, setMatch3Score] = useState(0);
  const [selectedMatch3Idx, setSelectedMatch3Idx] = useState(null);
  const [puzzleGrid, setPuzzleGrid] = useState([]);
  const [currentScene, setCurrentScene] = useState(ESCENAS[0]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');

  useEffect(() => {
    try {
      const saved = {
        lvl: localStorage.getItem('noir-progress'),
        score: localStorage.getItem('noir-score'),
        diams: localStorage.getItem('noir-diamonds'),
        inv: localStorage.getItem('noir-inventory'),
        test: localStorage.getItem('noir-testmode'),
        ev: localStorage.getItem('noir-evidence')
      };
      if (saved.lvl) setUnlockedLevel(parseInt(saved.lvl));
      if (saved.score) setScore(parseInt(saved.score));
      if (saved.diams) setDiamonds(parseInt(saved.diams));
      if (saved.inv) setInventory(JSON.parse(saved.inv));
      if (saved.test) setIsTestMode(saved.test === 'true');
      if (saved.ev) setEvidence(JSON.parse(saved.ev));
      setEnergy(100);
    } catch (e) {}
    const t = ["Barrio peligroso...", "Necesito una pista.", "Miller me vigila."][Math.floor(Math.random()*3)];
    setThought(t);
    speak(t, isMuted);
  }, [view, isMuted]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy(prev => { if (prev >= 100) return 100; return prev + 1; });
    }, 360000);
    return () => clearInterval(timer);
  }, []);

  const getCaseInfo = (lvl) => {
    const tIdx = (lvl * 7) % TITULOS.length;
    const oIdx = (lvl * 3) % OBJETOS.length;
    const titulo = `${TITULOS[tIdx]} ${OBJETOS[oIdx]}`;
    return {
      titulo: `CASO #${lvl}: ${titulo}`,
      desc: `Informes indican actividad sospechosa relacionada con ${titulo}. Se requiere intervención inmediata.`
    };
  };

  const startNewGame = (lvl, type) => {
    if (!isTestMode && energy < 20) { alert("Agotado."); return; }
    if (!isTestMode) setEnergy(e => e - 20);
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
      setCurrentScene(ESCENAS[lvl % ESCENAS.length]);
      // Puzle de 10 tiras horizontales (Mucho más difícil)
      const pieces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => ({ id, pos: id }))
        .sort(() => Math.random() - 0.5);
      setPuzzleGrid(pieces);
    } else if (type === 'hidden') {
      setCurrentScene(ESCENAS[lvl % ESCENAS.length]);
      setHiddenItems(Array(5).fill(0).map(() => ({
        x: 10 + Math.random() * 80, y: 10 + Math.random() * 80,
        icon: OBJETOS_OCULTOS[Math.floor(Math.random() * OBJETOS_OCULTOS.length)], found: false, id: Math.random()
      })));
    }
    setView('game');
  };

  const finishGame = () => {
    const pts = 100 + (level * 10);
    setScore(s => s + pts); setDiamonds(d => d + 5);
    
    // Si es el nivel actual que estamos desbloqueando, damos KIT COMPLETO (Café + Comida)
    const isLevelUp = level === unlockedLevel;
    const evItem = EVIDENCIAS_POSIBLES[Math.floor(Math.random() * EVIDENCIAS_POSIBLES.length)];

    if (isLevelUp) {
      setInventory(i => {
        const ni = { coffee: i.coffee + 1, food: i.food + 1 };
        localStorage.setItem('noir-inventory', JSON.stringify(ni));
        return ni;
      });
      setShowReward({ pts, diams: 5, food: 'KIT COMPLETO ☕🥪', msg: "¡Ascenso y suministros nuevos!", evidence: evItem });
    } else {
      // Si repite nivel, solo un 20% de probabilidad de algo suelto
      const food = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'coffee' : 'food') : null;
      if (food) {
        setInventory(i => {
          const ni = {...i, [food]: i[food]+1};
          localStorage.setItem('noir-inventory', JSON.stringify(ni));
          return ni;
        });
      }
      setShowReward({ pts, diams: 5, food, msg: FELICITACIONES[Math.floor(Math.random()*FELICITACIONES.length)], evidence: evItem });
    }
    
    setEvidence(prev => {
      const next = [...prev, { ...evItem, date: new Date().toLocaleDateString() }];
      localStorage.setItem('noir-evidence', JSON.stringify(next));
      return next;
    });

    if (level === unlockedLevel) {
      setUnlockedLevel(level + 1);
      localStorage.setItem('noir-progress', level + 1);
    }
    const msg = FELICITACIONES[Math.floor(Math.random() * FELICITACIONES.length)];
    setShowReward({ pts, diams: 5, food, msg, evidence: evItem });
    speak(msg, isMuted);
  };

  const renderDetective = () => (
    <div className="detective-float">
      <div className="speech-bubble">"{thought}"</div>
      <div className="detective-full-body" style={{backgroundImage: 'url(/detective_normal.png)'}}></div>
    </div>
  );

  if (view === 'menu') return (
    <div className="app-container" style={{paddingLeft: '420px'}}>
      {renderDetective()}
      <div className="economy-hud">
        <div className="hud-item" style={{background:'#444', minWidth:'120px'}}>⚡ {energy}%</div>
        <div className="hud-item">💎 {diamonds}</div>
        <div className="hud-item">⭐ {score}</div>
        <div className="hud-item" style={{color:'gold'}}>{getRango(score)}</div>
        <button className="hud-item" onClick={() => setIsMuted(!isMuted)}>{isMuted?'🔇':'🔊'}</button>
        
        {/* PERFIL / LOGIN */}
        <button className="hud-item" style={{borderRadius:'50%', width:'40px', height:'40px', padding:0}} onClick={() => setShowLogin(true)}>
          👤
        </button>

        {/* BOTÓN DE MODO TEST VISIBLE */}
        <button 
          className="hud-item" 
          onClick={() => {
            const next = !isTestMode;
            setIsTestMode(next);
            localStorage.setItem('noir-testmode', next);
            speak(next ? "Modo de pruebas activado" : "Regresando al servicio normal", isMuted);
          }} 
          style={{background: isTestMode ? 'var(--noir-red)' : '#555', fontWeight:'bold', border:'1px solid gold'}}
        >
          {isTestMode ? '🛠️ TEST' : '🎮 JUEGO'}
        </button>

        <div style={{display:'flex', gap:'5px'}}>
          <button className="hud-item" onClick={()=>{ if(inventory.coffee>0){setEnergy(100); setInventory(i=>({...i, coffee:i.coffee-1}));}}}>☕ {inventory.coffee}</button>
          <button className="hud-item" onClick={()=>{ if(inventory.food>0){setEnergy(100); setInventory(i=>({...i, food:i.food-1}));}}}>🥪 {inventory.food}</button>
        </div>
      </div>
      <h1 className="title">EXPEDIENTES NOIR</h1>
      <div className="game-card">
        <div className="city-map-container" style={{backgroundImage: 'url(/mapa_moderno.png)', height: '580px', position:'relative'}}>
          {PUNTOS_MAPA.slice(0, unlockedLevel).map((p, i) => (
            <div key={i} className="case-pin" style={{left:`${p.x}%`, top:`${p.y}%`}} onClick={() => {setLevel(i+1); setView('selector');}}>
              <span style={{fontSize:'0.6rem'}}>{i+1}</span>
            </div>
          ))}
          {/* BOTÓN ALMACÉN DE PRUEBAS */}
          <button className="btn" style={{position:'absolute', bottom:'20px', left:'20px', width:'auto', background:'var(--noir-ink)', color:'white', border:'2px solid gold'}} onClick={() => setView('warehouse')}>
            📦 ALMACÉN DE PRUEBAS ({evidence.length})
          </button>
        </div>
      </div>
      {showReward && (
        <div className="reward-overlay">
          <div className="reward-content celebration">
            <h2 style={{color:'gold'}}>¡CASO CERRADO!</h2>
            <p>"{showReward.msg}"</p>
            <div className="reward-grid">
              <div className="reward-badge">+{showReward.pts} pts</div>
              <div className="reward-badge">+{showReward.diams} 💎</div>
              {showReward.food && <div className="reward-badge card">¡SUMINISTROS! {showReward.food==='coffee'?'☕':'🥪'}</div>}
            </div>
            <button className="btn btn-primary" onClick={() => setShowReward(null)}>Continuar</button>
          </div>
        </div>
      )}
      {showLogin && (
        <div className="reward-overlay">
          <div className="reward-content" style={{textAlign:'center', maxWidth:'350px'}}>
             <h3>CONECTAR EXPEDIENTE</h3>
             <p style={{fontSize:'0.8rem', margin:'10px 0'}}>Guarda tu progreso en la nube y compite con otros detectives.</p>
             <button className="btn" style={{background:'#fff', color:'#333', marginBottom:'10px', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
               <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>G</span> Continuar con Google
             </button>
             <button className="btn" style={{background:'#1877F2', color:'#fff', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
               <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>f</span> Continuar con Facebook
             </button>
             <button className="btn btn-primary" style={{marginTop:'20px', width:'100%'}} onClick={() => setShowLogin(false)}>Volver al Mapa</button>
          </div>
        </div>
      )}
    </div>
  );

  if (view === 'warehouse') {
    return (
      <div className="app-container" style={{paddingLeft: '420px'}}>
        {renderDetective()}
        <h1 className="title">ALMACÉN DE PRUEBAS</h1>
        <div className="game-card">
          <p style={{marginBottom:'1rem', fontSize:'0.9rem'}}>Aquí se guardan todas las pistas clave de tus casos resueltos.</p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'15px', maxHeight:'450px', overflowY:'auto', padding:'10px'}}>
            {evidence.length === 0 && <p style={{opacity:0.5}}>Aún no has recopilado ninguna prueba...</p>}
            {evidence.map((ev, i) => (
              <div key={i} className="evidence-card" style={{background:'var(--noir-paper)', border:'1px solid var(--noir-ink)', padding:'10px', borderRadius:'4px', textAlign:'center', position:'relative'}}>
                <div style={{fontSize:'2.5rem', marginBottom:'5px'}}>{ev.icon}</div>
                <div style={{fontWeight:'bold', fontSize:'0.8rem', textTransform:'uppercase'}}>{ev.name}</div>
                <div style={{fontSize:'0.6rem', marginTop:'5px', fontStyle:'italic'}}>{ev.desc}</div>
                <div style={{fontSize:'0.5rem', marginTop:'10px', opacity:0.6}}>{ev.date}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={() => setView('menu')}>Volver al Mapa</button>
        </div>
      </div>
    );
  }

  if (view === 'selector') {
    const info = getCaseInfo(level);
    const allTypes = ['hidden', 'sudoku', 'wordsearch', 'merge', 'match3', 'puzzle'];
    const count = isTestMode ? 6 : (level <= 3 ? 1 : level <= 6 ? 2 : 3);
    const available = isTestMode ? allTypes : allTypes.sort((a,b)=>((level*a.length)%17)-(level*b.length%17)).slice(0, count);
    const labels = { hidden: "🔍 Escena del Crimen", sudoku: "🔬 Decodificar", wordsearch: "📁 Archivos", merge: "🧪 Laboratorio", match3: "⚖️ Interrogatorio", puzzle: "🧩 Reconstrucción" };

    // Personaje que lidera el caso (basado en el primer juego disponible)
    const pKey = GAME_ASIG[available[0]];
    const p = PERSONAJES[pKey];

    return (
      <div className="app-container" style={{paddingLeft: '420px'}}>
        {renderDetective()}
        <h1 className="title">EXPEDIENTE #{level}</h1>
        <div className="game-card" style={{display:'flex', gap:'20px', alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <h2 style={{color:'var(--noir-red)'}}>{info.titulo}</h2>
            <p style={{margin:'15px 0', fontSize:'0.9rem', lineHeight:'1.4'}}>{info.desc}</p>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {available.map(t => {
                const char = PERSONAJES[GAME_ASIG[t]];
                return (
                  <button key={t} className="btn" onClick={() => {
                    speak(char.text, isMuted);
                    startNewGame(level, t);
                  }} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>{labels[t]}</span>
                    <span style={{fontSize:'0.7rem', opacity:0.7}}>{char.name}</span>
                  </button>
                );
              })}
              <button className="btn btn-primary" onClick={() => setView('menu')}>Volver al Mapa</button>
            </div>
          </div>
          <div style={{width:'180px', textAlign:'center'}}>
            <img src={p.img} style={{width:'100%', borderRadius:'8px', border:'2px solid var(--noir-ink)', boxShadow:'5px 5px 0 rgba(0,0,0,0.2)'}} alt="p" />
            <p style={{fontSize:'0.7rem', fontWeight:'bold', marginTop:'5px', color:'var(--noir-ink)'}}>{p.name}</p>
            <p style={{fontSize:'0.65rem', fontStyle:'italic', marginTop:'5px'}}>"{p.text}"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{paddingLeft: '420px'}}>
      {renderDetective()}
      <h1 className="title">{gameType.toUpperCase()}</h1>
      <div className="game-card">
        {gameType === 'puzzle' && (
          <div style={{display:'flex', gap:'20px', alignItems:'flex-start', width:'100%'}}>
            {/* PANEL DE NARRATIVA */}
            <div style={{flex:1, background:'rgba(0,0,0,0.1)', padding:'15px', borderRadius:'8px', borderLeft:'4px solid var(--noir-red)'}}>
               <h3 style={{fontSize:'0.9rem', marginBottom:'10px'}}>INFORME DE RECONSTRUCCIÓN</h3>
               <p style={{fontSize:'0.8rem', lineHeight:'1.5'}}>{getCaseInfo(level).desc}</p>
               <div style={{marginTop:'20px', textAlign:'center'}}>
                 <p style={{fontSize:'0.7rem', color:'gold'}}>REFERENCIA:</p>
                 <img src={currentScene} style={{width:'100px', borderRadius:'4px', border:'1px solid gold'}} alt="guia" />
               </div>
            </div>

            {/* TABLERO DE TIRAS */}
            <div style={{flex:1.5, display:'flex', flexDirection:'column', gap:'2px', maxHeight:'450px', overflowY:'auto'}}>
              {puzzleGrid.map((p, i) => (
                <div 
                  key={i} 
                  className={`puzzle-strip ${selectedCell===i?'selected':''}`} 
                  style={{
                    backgroundImage:`url(${currentScene})`, 
                    backgroundSize:'100% 1000%', 
                    backgroundPosition:`0% ${p.id * 11.111}%`,
                    height:'42px',
                    width:'100%',
                    border: '1px solid var(--noir-ink)',
                    position:'relative',
                    cursor:'pointer',
                    borderRadius:'2px'
                  }} 
                  onClick={()=>{ 
                    if(selectedCell===null) setSelectedCell(i); 
                    else { 
                      const ng=[...puzzleGrid]; 
                      const t=ng[selectedCell]; ng[selectedCell]=ng[i]; ng[i]=t; 
                      setPuzzleGrid(ng); setSelectedCell(null); 
                      if(ng.every((x,idx)=>x.id===idx)) finishGame(); 
                    }
                  }}
                >
                  <span style={{position:'absolute', left:'5px', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.7)', color:'white', padding:'1px 5px', borderRadius:'50%', fontSize:'0.6rem', fontWeight:'bold'}}>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {gameType === 'hidden' && (
          <div className="hidden-object-game" style={{backgroundImage:`url(${currentScene})`, width:'100%', height:'400px', backgroundSize:'cover', position:'relative', border:'2px solid #000'}}>
            {hiddenItems.map(it => <div key={it.id} style={{position:'absolute', left:`${it.x}%`, top:`${it.y}%`, fontSize:'2rem', cursor:'pointer', opacity:it.found?0.2:1}} 
                                       onClick={()=>{ const ni=hiddenItems.map(h=>h.id===it.id?{...h,found:true}:h); setHiddenItems(ni); if(ni.every(h=>h.found))finishGame(); }}>{it.icon}</div>)}
          </div>
        )}
        {gameType === 'match3' && (
          <div className="match3-grid">
            {match3Grid.map((it, i) => (
              <div key={i} className={`match3-slot ${selectedMatch3Idx===i?'selected':''}`} onClick={()=>{
                if(selectedMatch3Idx===null)setSelectedMatch3Idx(i);
                else { const ng=swap(match3Grid,selectedMatch3Idx,i); const m=checkMatches(ng); if(m.length>0){ let ug=[...ng]; m.forEach(idx=>ug[idx]=MATCH3_ITEMS[Math.floor(Math.random()*5)]); setMatch3Grid(ug); setMatch3Score(s=>{const ns=s+m.length; if(ns>=15)finishGame(); return ns;}); } setSelectedMatch3Idx(null); }
              }}>{it.icon}</div>
            ))}
          </div>
        )}
        {gameType === 'merge' && (
          <div className="merge-grid">
            {mergeGrid.map((it, i) => (
              <div key={i} className={`merge-slot ${draggedIdx===i?'selected':''}`} onClick={()=>{
                if(draggedIdx===null){ if(it)setDraggedIdx(i); }
                else { const ng=handleMerge(mergeGrid,draggedIdx,i); setMergeGrid(ng); setDraggedIdx(null); if(ng.some(x=>x?.id===5))finishGame(); }
              }}>{it && <span>{it.icon}</span>}</div>
            ))}
          </div>
        )}
        {gameType === 'sudoku' && (
          <div className="sudoku-grid">
            {board.map((row, r) => row.map((cell, c) => (
              <div key={`${r}-${c}`} className={`cell ${selectedCell?.r===r && selectedCell?.c===c?'selected':''}`} onClick={()=>setSelectedCell({r,c})}>{cell||''}</div>
            )))}
          </div>
        )}
        {gameType === 'wordsearch' && (
          <div className="word-search-view">
            <div className="word-search-grid" style={{gridTemplateColumns:`repeat(${wsData.grid.length}, 1fr)`}}>
              {wsData.grid.map((row, r) => row.map((char, c) => (
                <div key={`${r}-${c}`} className={`letter-cell ${selectedCells.includes(`${r}-${c}`)?'selected':''}`} 
                     onClick={()=>{ const p=`${r}-${c}`; const n=selectedCells.includes(p)?selectedCells.filter(x=>x!==p):[...selectedCells,p]; setSelectedCells(n); const nw=wsData.words.map(w=>w.found?w:(w.positions.every(x=>n.includes(x))?{...w,found:true}:w)); setWsData({...wsData, words:nw}); if(nw.every(x=>x.found))finishGame(); }}>{char}</div>
              )))}
            </div>
          </div>
        )}
        <div className="controls">
          {gameType === 'sudoku' && (
            <div className="number-pad">
              {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} className="num-btn" onClick={()=>{ if(selectedCell){ const nb=board.map(r=>[...r]); nb[selectedCell.r][selectedCell.c]=n; setBoard(nb); if(isWin(nb,solution))finishGame(); }}}>{n}</button>)}
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setView('menu')}>Salir</button>
        </div>
      </div>
    </div>
  );
}

export default App;
