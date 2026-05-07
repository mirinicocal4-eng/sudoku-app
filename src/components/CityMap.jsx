import React from 'react';
import { PUNTOS_MAPA } from '../utils/constants';

export const CityMap = ({ unlockedLevel, setLevel, setView, evidenceCount }) => {
  return (
    <>
      <h1 className="title" style={{marginTop:'20px'}}>EXPEDIENTES NOIR</h1>
      <div className="city-map-container" style={{
        backgroundImage: 'url(/mapa_moderno.png)', 
        height: '650px', 
        position:'relative',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,215,0,0.2)'
      }}>
        {PUNTOS_MAPA.slice(0, unlockedLevel).map((p, i) => (
          <div key={i} className="case-pin" style={{left:`${p.x}%`, top:`${p.y}%`}} onClick={() => {setLevel(i+1); setView('selector');}}>
            <span style={{fontSize:'0.6rem'}}>{i+1}</span>
          </div>
        ))}
        <button className="btn" style={{position:'absolute', bottom:'20px', left:'20px', width:'auto', background:'var(--noir-ink)', color:'white', border:'2px solid gold', boxShadow:'0 5px 15px rgba(0,0,0,0.5)'}} onClick={() => setView('warehouse')}>
          📦 ALMACÉN DE PRUEBAS ({evidenceCount})
        </button>
      </div>
    </>
  );
};
