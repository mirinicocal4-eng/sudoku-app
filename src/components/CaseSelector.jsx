import React from 'react';
import { PERSONAJES, GAME_ASIG } from '../utils/constants';

export const CaseSelector = ({ caseIdx, step, unlockedCases, info, isTestMode, isMuted, speak, startNewGame, setView, renderDetective }) => {
  const allTypes = ['hidden', 'sudoku', 'wordsearch', 'merge', 'match3', 'puzzle'];
  const isBossLevel = step === 7;
  const count = isTestMode ? 6 : Math.min(3, unlockedCases);
  const unlockedPool = allTypes.slice(0, Math.min(6, unlockedCases));
  const available = isBossLevel ? ['match3'] : (isTestMode ? allTypes : unlockedPool.sort((a,b)=>((caseIdx * step * a.length)%17)-(caseIdx * step * b.length % 17)).slice(0, count));
  const labels = { 
    hidden: "🔍 Escena del Crimen", 
    sudoku: "🔬 Decodificar", 
    wordsearch: "📁 Archivos", 
    merge: "🧪 Laboratorio", 
    match3: isBossLevel ? "⚖️ INTERROGATORIO FINAL" : "⚖️ Interrogatorio", 
    puzzle: "🧩 Reconstrucción" 
  };

  const pKey = GAME_ASIG[available[0]];
  const p = PERSONAJES[pKey];

  return (
    <div className="app-container" style={{paddingLeft: '420px'}}>
      {renderDetective()}
      <h1 className="title">{info.titulo}</h1>
      <div className="game-card" style={{display:'flex', gap:'20px', alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <h2 style={{color:'var(--noir-red)', fontSize:'1rem'}}>{info.mision}</h2>
          <div style={{margin:'10px 0', padding:'5px', background:'var(--noir-ink)', color:'gold', fontSize:'0.7rem', textAlign:'center', borderRadius:'4px'}}>
            👤 SOSPECHOSO: <span style={{fontWeight:'bold', textTransform:'uppercase'}}>{info.sospechoso.name}</span>
          </div>
          <p style={{margin:'15px 0', fontSize:'0.85rem', lineHeight:'1.4'}}>{info.desc}</p>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {available.map(t => {
              const char = PERSONAJES[GAME_ASIG[t]];
              return (
                <button key={t} className="btn" onClick={() => {
                  speak(char.text, isMuted, char.gender);
                  startNewGame(caseIdx, t);
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
          <div style={{position:'relative', border:'3px solid var(--noir-red)', borderRadius:'8px', padding:'5px', background:'white'}}>
            <div style={{position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)', background:'var(--noir-red)', color:'white', padding:'2px 10px', fontSize:'0.6rem', fontWeight:'bold', borderRadius:'4px'}}>
              WANTED
            </div>
            <img src={info.sospechoso.img} style={{width:'100%', borderRadius:'4px'}} alt="suspect" />
          </div>
          <p style={{fontSize:'0.7rem', fontWeight:'bold', marginTop:'8px', color:'var(--noir-ink)', textTransform:'uppercase'}}>{info.sospechoso.name}</p>
          <div style={{marginTop:'15px', borderTop:'1px solid #ccc', paddingTop:'10px'}}>
            <p style={{fontSize:'0.6rem', opacity:0.7}}>ASIGNADO POR:</p>
            <img src={p.img} style={{width:'40px', borderRadius:'50%', border:'1px solid #999', marginTop:'5px'}} alt="agent" />
            <p style={{fontSize:'0.6rem', fontWeight:'bold'}}>{p.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
