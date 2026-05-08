import React, { useState, useEffect, useCallback } from 'react';
// Utils & Logic
import { TITULOS, OBJETOS, FELICITACIONES, EVIDENCIAS_POSIBLES, SOSPECHOSOS, BARRIOS, PERSONAJES, GAME_ASIG, PUNTOS_MAPA } from './utils/constants';

// Components
import { HUD } from './components/HUD';
import { CityMap } from './components/CityMap';
import { Detective } from './components/Detective';
import { Warehouse } from './components/Warehouse';
import { CaseSelector } from './components/CaseSelector';

// Game Components
import { SudokuGame } from './components/SudokuGame';
import { Match3Game } from './components/Match3Game';
import { WordSearchGame } from './components/WordSearchGame';
import { MergeGame } from './components/MergeGame';
import { PuzzleGame } from './components/PuzzleGame';
import { HiddenItemsGame } from './components/HiddenItemsGame';

const REGLAS_JUEGOS = {
  hidden: "Busca y pulsa sobre los objetos de la lista que están camuflados en el escenario.",
  sudoku: "Completa el tablero. No puedes repetir números del 1 al 9 en la misma fila, columna o región 3x3.",
  wordsearch: "Busca las palabras de la lista en la sopa de letras. Pulsa las letras una a una para formarlas.",
  merge: "Combina dos objetos iguales arrastrándolos uno sobre otro para crear uno de nivel superior.",
  match3: "Alinea 3 o más objetos iguales para eliminarlos y sumar puntos antes de agotar tus movimientos.",
  puzzle: "Reconstruye la imagen arrastrando las piezas a sus posiciones correctas."
};

const NARRATIVAS = [
  "Una llamada anónima nos alerta de movimientos extraños en la zona. Empezamos la vigilancia.",
  "Hemos encontrado rastros físicos en el lugar. Necesitamos analizar estas pruebas con cuidado.",
  "Un testigo clave ha aparecido, pero tiene miedo de hablar. Hay que presionarle un poco.",
  "Las grabaciones de seguridad revelan una silueta familiar. Todo apunta en una dirección.",
  "Siguiendo el rastro del dinero, hemos llegado a un punto crítico de la investigación.",
  "Tenemos el arma o el objeto del delito. El cerco sobre el sospechoso se está cerrando.",
  "Interrogatorio Final: Tenemos todas las pruebas. Es hora de que confiese sus crímenes."
];

const getXPInfo = (score) => {
  let level = 1, xpNeeded = 500, tempScore = score;
  while (tempScore >= xpNeeded) { tempScore -= xpNeeded; level++; xpNeeded += 500; }
  return { level, currentXP: tempScore, nextXP: xpNeeded, percent: (tempScore / xpNeeded) * 100 };
};

const getRango = (level) => {
  if (level < 3) return "Patrullero Novato 👮‍♂️";
  if (level < 6) return "Detective Junior 🕵️‍♂️";
  if (level < 10) return "Inspector Jefe 🎖️";
  if (level < 20) return "Comisionado 👨‍✈️";
  return "Leyenda de la Ciudad 🏆";
};

const speak = (text, isMuted, gender = 'male') => {
  if (isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const esVoices = voices.filter(v => v.lang.startsWith('es'));
  let selectedVoice = gender === 'female' 
    ? esVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('laura'))
    : esVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('pablo'));
  utterance.pitch = gender === 'female' ? 1.1 : 0.8;
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 0.95; 
  window.speechSynthesis.speak(utterance);
};

function App() {
  // --- STATE ---
  const [view, setView] = useState('menu');
  const [isMuted, setIsMuted] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  
  const bgMusic = useRef(new Audio('https://www.fesliyanstudios.com/play-mp3/2405')); // Noir Jazz loop

  useEffect(() => {
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.3;
    if (musicEnabled) {
      bgMusic.current.play().catch(e => console.log("Auto-play blocked"));
    } else {
      bgMusic.current.pause();
    }
  }, [musicEnabled]);

  const playSFX = (type) => {
    if (isMuted) return;
    const sfxMap = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      match: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
    };
    const audio = new Audio(sfxMap[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };
  
  // Progression
  const [unlockedCases, setUnlockedCases] = useState(1);
  const [currentCase, setCurrentCase] = useState(1);
  const [caseSteps, setCaseSteps] = useState({ 1: 1 }); // { caseIdx: step }
  
  const currentStep = caseSteps[currentCase] || 1;
  
  const [completedCases, setCompletedCases] = useState([]);
  const [gameType, setGameType] = useState('sudoku');
  const [thought, setThought] = useState("");
  const [score, setScore] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [inventory, setInventory] = useState({ coffee: 2, food: 1, turbo: 1 });
  const [infiniteEnergyTime, setInfiniteEnergyTime] = useState(0);
  const [evidence, setEvidence] = useState([]);
  const [showReward, setShowReward] = useState(null);
  const [activeDialogue, setActiveDialogue] = useState("");
  
  // Temporizador de Energía Infinita (Turbo)
  useEffect(() => {
    if (infiniteEnergyTime > 0) {
      const timer = setInterval(() => {
        setInfiniteEnergyTime(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [infiniteEnergyTime]);

  // --- EFFECTS ---
  useEffect(() => {
    const savedCases = localStorage.getItem('noir-cases');
    const savedSteps = localStorage.getItem('noir-case-steps');
    const savedScore = localStorage.getItem('noir-score');
    const savedDiams = localStorage.getItem('noir-diamonds');
    const savedInv = localStorage.getItem('noir-inventory');
    const savedEv = localStorage.getItem('noir-evidence');
    const savedCompleted = localStorage.getItem('noir-completed-cases');
    if (savedCases) setUnlockedCases(parseInt(savedCases));
    if (savedSteps) setCaseSteps(JSON.parse(savedSteps));
    if (savedScore) setScore(parseInt(savedScore));
    if (savedDiams) setDiamonds(parseInt(savedDiams));
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedCompleted) setCompletedCases(JSON.parse(savedCompleted));
    if (savedEv) setEvidence(JSON.parse(savedEv));
  }, []);

  useEffect(() => {
    if (view === 'game') return;

    let possibleThoughts = ["La lluvia no limpia el pecado de esta ciudad.", "Necesito una pista.", "El café está frío."];
    if (view === 'warehouse') possibleThoughts = ["El archivo nunca miente.", "Tantas pruebas, tan poco tiempo."];
    else if (view === 'selector') possibleThoughts = ["Miller me vigila de cerca.", "Este informe parece incompleto."];
    
    const t = possibleThoughts[Math.floor(Math.random() * possibleThoughts.length)];
    setThought(t);
    if (view === 'menu' || view === 'warehouse') speak(t, isMuted, 'male');
  }, [view, isMuted]);

  const [activeEvent, setActiveEvent] = useState(null);
  
  const triggerRandomEvent = () => {
    // 20% de probabilidad de evento al volver al menú
    if (Math.random() > 0.2) return;
    
    const personajesEvento = [
      { name: "Miller", img: "/detective_normal.png", msg: "¡Detective! Ha surgido una emergencia en comisaría. ¿Puedes ayudarme con este informe?", type: "sudoku", reward: { diams: 10 } },
      { name: "Oficial Martínez", img: "/oficial_martinez.png", msg: "¡Señor! He interceptado una comunicación sospechosa. ¿Podría echarle un vistazo?", type: "wordsearch", reward: { food: 1 } },
      { name: "Tony 'El Flaco'", img: "/tony_el_flaco.png", msg: "¿Te crees muy listo, detective? Resuelve esto si quieres que te cuente lo que sé.", type: "puzzle", reward: { diams: 15 } },
      { name: "Sujeto Desconocido", img: "/sospechoso_misterio.png", msg: "Te estoy vigilando. Veamos qué tan rápido eres encontrando esto...", type: "hidden", reward: { coffee: 1 } }
    ];
    
    const ev = personajesEvento[Math.floor(Math.random() * personajesEvento.length)];
    setActiveEvent(ev);
  };

  useEffect(() => {
    if (view === 'menu' && !activeEvent) {
      triggerRandomEvent();
    }
  }, [view]);

  // --- LOGIC ---
  const startEvent = () => {
    const ev = activeEvent;
    startNewGame(currentCase, ev.type, ev.msg);
  };

  const getCaseInfo = (caseIdx, step) => {
    const barrio = BARRIOS[(caseIdx - 1) % BARRIOS.length];
    const titulo = `${TITULOS[(caseIdx * 7) % TITULOS.length]} ${OBJETOS[(caseIdx * 3) % OBJETOS.length]}`;
    const realSospechoso = SOSPECHOSOS[(caseIdx * 5) % SOSPECHOSOS.length];
    const narrativa = NARRATIVAS[step - 1] || "Investigación en curso...";
    
    const sospechoso = step === 7 ? realSospechoso : {
      name: "Sujeto Desconocido",
      img: "/sospechoso_misterio.png",
      text: "No sabemos quién es todavía. Necesitamos más pruebas.",
      gender: "male"
    };

    return { 
      caseIdx, step, barrio, 
      titulo: `CASO #${caseIdx}: ${barrio}`, 
      mision: step === 7 ? `⚖️ INTERROGATORIO FINAL: ${realSospechoso.name}` : `PASO ${step}/7: ${titulo}`, 
      desc: narrativa, 
      sospechoso
    };
  };

  const renderEventOverlay = () => {
    if (!activeEvent) return null;
    return (
      <div className="reward-overlay">
        <div className="reward-content event-card" style={{border: '4px solid var(--noir-red)'}}>
          <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <img src={activeEvent.img} alt={activeEvent.name} style={{width:'100px', height:'100px', borderRadius:'10px', border:'2px solid var(--noir-ink)'}} />
            <div style={{textAlign:'left'}}>
              <h3 style={{color:'var(--noir-red)', margin:0}}>{activeEvent.name}</h3>
              <p style={{fontSize:'0.9rem', margin:'10px 0', fontFamily:'Inter'}}>{activeEvent.msg}</p>
              <div style={{display:'flex', gap:'10px'}}>
                <button className="btn btn-primary" onClick={startEvent}>ACEPTAR DESAFÍO</button>
                <button className="btn" onClick={() => setActiveEvent(null)}>IGNORAR</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const startNewGame = (caseIdx, type, dialogue = "") => {
    const isFree = isTestMode || infiniteEnergyTime > 0;
    if (!isFree && energy < 20) { alert("Agotado."); return; }
    if (!isFree) setEnergy(e => { localStorage.setItem('noir-energy', e-20); return e-20; });
    
    setThought(""); 
    setActiveDialogue(dialogue);
    setGameType(type); 
    setShowReward(null);
    setView('game');
  };

  const finishGame = () => {
    const pts = 100 + (currentCase * 10);
    setScore(s => { localStorage.setItem('noir-score', s + pts); return s + pts; });
    
    // Si era un evento aleatorio
    if (activeEvent) {
      const reward = activeEvent.reward;
      if (reward.diams) setDiamonds(d => d + reward.diams);
      if (reward.coffee) setInventory(i => ({...i, coffee: i.coffee + reward.coffee}));
      
      setShowReward({
        pts: pts * 1.5,
        diams: reward.diams || 0,
        msg: `¡Desafío de ${activeEvent.name} completado! Has ganado recompensas extra.`,
        evidence: null
      });
      setActiveEvent(null);
      return;
    }
    
    const caseInfo = getCaseInfo(currentCase, currentStep);
    
    if (currentStep === 7) {
      // Caso cerrado
      const extraCoffee = 1;
      const extraFood = 1;
      setInventory(prev => {
        const next = { ...prev, coffee: prev.coffee + extraCoffee, food: prev.food + extraFood };
        localStorage.setItem('noir-inventory', JSON.stringify(next));
        return next;
      });

      setShowReward({ 
        pts: pts * 2, 
        diams: 20, 
        msg: `¡CASO CERRADO! Hemos arrestado a ${caseInfo.sospechoso.name}. Recompensa extra: ☕x${extraCoffee} 🥪x${extraFood}`, 
        evidence: null 
      });
      if (currentCase === unlockedCases) {
        setUnlockedCases(prev => { localStorage.setItem('noir-cases', prev + 1); return prev + 1; });
      }
      setCompletedCases(prev => {
        const next = [...new Set([...prev, currentCase])];
        localStorage.setItem('noir-completed-cases', JSON.stringify(next));
        return next;
      });
      playSFX('win');
    } else {
      const evItem = EVIDENCIAS_POSIBLES[Math.floor(Math.random() * EVIDENCIAS_POSIBLES.length)];
      const alreadyHas = evidence.some(e => e.name === evItem.name);
      let foodMsg = "";
      if (Math.random() < 0.2) {
        const fType = Math.random() < 0.5 ? 'coffee' : 'food';
        setInventory(prev => ({ ...prev, [fType]: prev[fType] + 1 }));
        foodMsg = ` y has encontrado ${fType === 'coffee' ? 'un ☕' : 'una 🥪'}`;
      }

      if (!alreadyHas) {
        setEvidence(prev => {
          const next = [...prev, { ...evItem, date: new Date().toLocaleDateString() }];
          localStorage.setItem('noir-evidence', JSON.stringify(next));
          return next;
        });
      }
      
      setCaseSteps(prev => ({ ...prev, [currentCase]: currentStep + 1 }));
      playSFX('match');
      setShowReward({ 
        pts, 
        diams: 5, 
        msg: `¡Pista encontrada! ${evItem.name}${foodMsg}.`, 
        evidence: alreadyHas ? null : evItem 
      });
    }
  };

  // --- RENDER ---
  const renderHUD = () => (
    <HUD 
      score={score} energy={energy} diamonds={diamonds} infiniteEnergyTime={infiniteEnergyTime}
      isMuted={isMuted} setIsMuted={setIsMuted} 
      musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled}
      isTestMode={isTestMode} setIsTestMode={setIsTestMode}
      inventory={inventory} setEnergy={setEnergy} setInventory={setInventory}
      setShowLogin={setShowLogin} getXPInfo={getXPInfo} getRango={getRango}
    />
  );

  const renderReward = () => showReward && (
    <div className="reward-overlay">
      <div className="reward-content celebration">
        <h2 style={{color:'gold'}}>¡CASO CERRADO!</h2>
        <p>"{showReward.msg}"</p>
        <div className="reward-grid">
          <div className="reward-badge">+{showReward.pts} pts</div>
          <div className="reward-badge">+{showReward.diams} 💎</div>
        </div>
        {showReward.evidence && (
          <div style={{marginTop:'15px', padding:'10px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', border:'1px dashed gold'}}>
            <p style={{fontSize:'0.6rem', color:'gold'}}>EVIDENCIA ENCONTRADA</p>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
              <span style={{fontSize:'2rem'}}>{showReward.evidence.icon}</span>
              <span style={{fontWeight:'bold'}}>{showReward.evidence.name}</span>
            </div>
          </div>
        )}
        <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={() => { speak(showReward.msg, isMuted); setShowReward(null); setView('menu'); }}>Continuar</button>
      </div>
    </div>
  );

  if (view === 'menu') return (
    <div className="app-container" style={{
      backgroundImage: 'linear-gradient(rgba(13, 17, 23, 0.8), rgba(13, 17, 23, 0.85)), url(/despacho_pro_1778199357053.png)',
      paddingLeft: '420px', 
      paddingTop: '70px'
    }}>
      <CityMap 
        unlockedCases={unlockedCases} 
        setCurrentCase={setCurrentCase} 
        setView={setView} 
        evidenceCount={evidence.length}
        completedCases={completedCases}
      />
      {renderEventOverlay()}
      {showLogin && <div className="reward-overlay"><div className="reward-content"><h3>LOGIN</h3><button className="btn btn-primary" onClick={()=>setShowLogin(false)}>Cerrar</button></div></div>}
    </div>
  );

  if (view === 'warehouse') return (
    <Warehouse 
      evidence={evidence} 
      inventory={inventory} 
      setInventory={setInventory} 
      setEnergy={setEnergy} 
      setView={setView} 
    />
  );
  
  const renderSelector = () => {
    const info = getCaseInfo(currentCase, currentStep);
    const isCompleted = completedCases.includes(currentCase);
    return (
      <CaseSelector 
        caseIdx={currentCase} 
        step={currentStep}
        unlockedCases={unlockedCases}
        info={info}
        isTestMode={isTestMode}
        isMuted={isMuted}
        speak={speak}
        startNewGame={startNewGame}
        setView={setView}
        renderDetective={()=><Detective thought={thought}/>}
        isCompleted={isCompleted}
        onReset={resetCase}
      />
    );
  };

  if (view === 'selector') return renderSelector();

  // View Game
  const info = getCaseInfo(currentCase, currentStep);
  return (
    <div className="app-container" style={{
      backgroundImage: 'linear-gradient(rgba(13, 17, 23, 0.8), rgba(13, 17, 23, 0.85)), url(/despacho_pro_1778199357053.png)',
      paddingLeft: '420px', 
      paddingTop: '70px'
    }}>
      <Detective thought={thought} />
      
      {/* Narrativa y Diálogo del Personaje durante el juego */}
      <div style={{
        background: 'var(--noir-ink)',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid var(--noir-red)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}>
        <div style={{fontSize: '0.85rem', fontStyle: 'italic', marginBottom:'5px'}}>
          <span style={{color:'var(--noir-red)', fontWeight:'bold', marginRight:'10px'}}>INFORME:</span> 
          "{info.desc}"
        </div>
        {activeDialogue && (
          <div style={{fontSize: '0.75rem', opacity: 0.9, borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'5px', marginBottom:'5px'}}>
            <span style={{color:'gold', fontWeight:'bold', marginRight:'10px'}}>INSTRUCCIÓN:</span> 
            {activeDialogue}
          </div>
        )}
        <div style={{fontSize: '0.7rem', opacity: 0.7, borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'5px'}}>
          <span style={{color:'#00d1ff', fontWeight:'bold', marginRight:'10px'}}>REGLAS:</span> 
          {REGLAS_JUEGOS[gameType]}
        </div>
      </div>

      <h1 className="title" style={{textTransform:'uppercase', letterSpacing:'4px', marginTop:0}}>{gameType}</h1>
      <div className="game-card">
        {gameType === 'sudoku' && <SudokuGame level={currentCase} step={currentStep} onWin={finishGame} onExit={() => setView('menu')} playSFX={playSFX} />}
        {gameType === 'match3' && <Match3Game level={currentCase} step={currentStep} onWin={finishGame} onExit={() => setView('menu')} playSFX={playSFX} />}
        {gameType === 'wordsearch' && <WordSearchGame level={currentCase} step={currentStep} onWin={finishGame} onExit={() => setView('menu')} playSFX={playSFX} />}
        {gameType === 'merge' && <MergeGame level={currentCase} step={currentStep} onWin={finishGame} onExit={() => setView('menu')} playSFX={playSFX} />}
        {gameType === 'puzzle' && <PuzzleGame level={currentCase} step={currentStep} onWin={finishGame} onExit={() => setView('menu')} playSFX={playSFX} />}
        {gameType === 'hidden' && <HiddenItemsGame level={currentCase} step={currentStep} onWin={finishGame} onExit={() => setView('menu')} playSFX={playSFX} />}
      </div>
      {renderReward()}
    </div>
  );
}

export default App;
