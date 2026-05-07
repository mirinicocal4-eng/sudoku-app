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
  const [isTestMode, setIsTestMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [level, setLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [gameType, setGameType] = useState('sudoku');
  const [thought, setThought] = useState("");
  const [score, setScore] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [inventory, setInventory] = useState({ coffee: 2, food: 1, turbo: 1 });
  const [infiniteEnergyTime, setInfiniteEnergyTime] = useState(0);
  const [evidence, setEvidence] = useState([]);
  const [showReward, setShowReward] = useState(null);
  
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
    const savedLvl = localStorage.getItem('noir-progress');
    const savedScore = localStorage.getItem('noir-score');
    const savedDiams = localStorage.getItem('noir-diamonds');
    const savedInv = localStorage.getItem('noir-inventory');
    const savedEv = localStorage.getItem('noir-evidence');
    if (savedLvl) setUnlockedLevel(parseInt(savedLvl));
    if (savedScore) setScore(parseInt(savedScore));
    if (savedDiams) setDiamonds(parseInt(savedDiams));
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedEv) setEvidence(JSON.parse(savedEv));
  }, []);

  useEffect(() => {
    let possibleThoughts = ["La lluvia no limpia el pecado de esta ciudad.", "Necesito una pista.", "El café está frío."];
    if (view === 'warehouse') possibleThoughts = ["El archivo nunca miente.", "Tantas pruebas, tan poco tiempo."];
    else if (view === 'selector') possibleThoughts = ["Miller me vigila de cerca.", "Este informe parece incompleto."];
    
    const t = possibleThoughts[Math.floor(Math.random() * possibleThoughts.length)];
    setThought(t);
    if (view === 'menu' || view === 'warehouse') speak(t, isMuted, 'male');
  }, [view, isMuted]);

  // --- LOGIC ---
  const getCaseInfo = (lvl) => {
    const capitulo = Math.floor((lvl - 1) / 7) + 1;
    const barrio = BARRIOS[(capitulo - 1) % BARRIOS.length];
    const titulo = `${TITULOS[(lvl * 7) % TITULOS.length]} ${OBJETOS[(lvl * 3) % OBJETOS.length]}`;
    return { 
      capitulo, 
      barrio, 
      titulo: `CAPÍTULO ${capitulo}: ${barrio}`, 
      mision: `CASO #${lvl}: ${titulo}`, 
      desc: `Investigación en el ${barrio} sobre ${titulo}.`, 
      sospechoso: SOSPECHOSOS[(lvl * 5) % SOSPECHOSOS.length] 
    };
  };

  const startNewGame = (lvl, type) => {
    const isFree = isTestMode || infiniteEnergyTime > 0;
    if (!isFree && energy < 20) { alert("Agotado."); return; }
    if (!isFree) setEnergy(e => { localStorage.setItem('noir-energy', e-20); return e-20; });
    
    setGameType(type); 
    setLevel(lvl); 
    setShowReward(null);
    setView('game');
  };

  const finishGame = () => {
    const pts = 100 + (level * 10);
    setScore(s => { localStorage.setItem('noir-score', s + pts); return s + pts; });
    
    const caseInfo = getCaseInfo(level);
    const evItem = EVIDENCIAS_POSIBLES[Math.floor(Math.random() * EVIDENCIAS_POSIBLES.length)];
    const alreadyHas = evidence.some(e => e.name === evItem.name);

    if (!alreadyHas) {
      setEvidence(prev => {
        const next = [...prev, { ...evItem, date: new Date().toLocaleDateString() }];
        localStorage.setItem('noir-evidence', JSON.stringify(next));
        return next;
      });
    } else setDiamonds(d => d + 10);

    setShowReward({ pts, diams: alreadyHas ? 15 : 5, msg: `¡CASO CERRADO! Hemos arrestado a ${caseInfo.sospechoso.name}.`, evidence: alreadyHas ? null : evItem });
    if (level === unlockedLevel) { setUnlockedLevel(level + 1); localStorage.setItem('noir-progress', level + 1); }
  };

  // --- RENDER ---
  const renderHUD = () => (
    <HUD 
      score={score} energy={energy} diamonds={diamonds} infiniteEnergyTime={infiniteEnergyTime}
      isMuted={isMuted} setIsMuted={setIsMuted} isTestMode={isTestMode} setIsTestMode={setIsTestMode}
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
    <div className="app-container" style={{paddingLeft: '420px', paddingTop: '70px'}}>
      <Detective thought={thought} />
      {renderHUD()}
      <CityMap unlockedLevel={unlockedLevel} setLevel={setLevel} setView={setView} evidenceCount={evidence.length} />
      {showLogin && <div className="reward-overlay"><div className="reward-content"><h3>LOGIN</h3><button className="btn btn-primary" onClick={()=>setShowLogin(false)}>Cerrar</button></div></div>}
    </div>
  );

  if (view === 'warehouse') return <Warehouse evidence={evidence} setView={setView} />;
  if (view === 'selector') return <CaseSelector level={level} info={getCaseInfo(level)} isTestMode={isTestMode} isMuted={isMuted} speak={speak} startNewGame={startNewGame} setView={setView} renderDetective={()=><Detective thought={thought}/>} />;

  // View Game
  return (
    <div className="app-container" style={{paddingLeft: '420px'}}>
      <Detective thought={thought} />
      <h1 className="title" style={{textTransform:'uppercase', letterSpacing:'4px'}}>{gameType}</h1>
      <div className="game-card">
        {gameType === 'sudoku' && <SudokuGame level={level} onWin={finishGame} onExit={() => setView('menu')} />}
        {gameType === 'match3' && <Match3Game level={level} onWin={finishGame} onExit={() => setView('menu')} />}
        {gameType === 'wordsearch' && <WordSearchGame level={level} onWin={finishGame} onExit={() => setView('menu')} />}
        {gameType === 'merge' && <MergeGame level={level} onWin={finishGame} onExit={() => setView('menu')} />}
        {gameType === 'puzzle' && <PuzzleGame level={level} onWin={finishGame} onExit={() => setView('menu')} />}
        {gameType === 'hidden' && <HiddenItemsGame level={level} onWin={finishGame} onExit={() => setView('menu')} />}
      </div>
      {renderReward()}
    </div>
  );
}

export default App;
