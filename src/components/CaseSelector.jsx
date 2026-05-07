import React from 'react';
import { PERSONAJES, GAME_ASIG } from '../utils/constants';

export const CaseSelector = ({ level, info, isTestMode, isMuted, speak, startNewGame, setView, renderDetective }) => {
  const allTypes = ['hidden', 'sudoku', 'wordsearch', 'merge', 'match3', 'puzzle'];
  const count = isTestMode ? 6 : (level <= 3 ? 1 : level <= 6 ? 2 : 3);
  const available = isTestMode ? allTypes : allTypes.sort((a,b)=>((level*a.length)%17)-(level*b.length%17)).slice(0, count);
  const labels = { hidden: "🔍 Escena del Crimen", sudoku: "🔬 Decodificar", wordsearch: "📁 Archivos", merge: "🧪 Laboratorio", match3: "⚖️ Interrogatorio", puzzle: "🧩 Reconstrucción" };

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
            👤 SOSPECHOSO: <span style={{fontWeight:'bold', textTransform:'uppercase'}}>{info.sospechoso}</span>
          </div>
          <p style={{margin:'15px 0', fontSize:'0.85rem', lineHeight:'1.4'}}>{info.desc}</p>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {available.map(t => {
              const char = PERSONAJES[GAME_ASIG[t]];
              return (
                <button key={t} className="btn" onClick={() => {
                  speak(char.text, isMuted, char.gender);
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
};
