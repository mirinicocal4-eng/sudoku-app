import React from 'react';

export const Warehouse = ({ evidence, setView }) => {
  return (
    <div className="app-container" style={{paddingLeft: '420px'}}>
      <h1 className="title">ALMACÉN DE PRUEBAS</h1>
      <div className="game-card">
        <p style={{marginBottom:'1rem', fontSize:'0.9rem'}}>Aquí se guardan todas las pistas clave de tus casos resueltos.</p>
        <div className="evidence-grid" style={{maxHeight:'400px', overflowY:'auto'}}>
          {evidence.length === 0 ? (
            <p style={{opacity:0.5}}>No hay evidencias todavía. Sal ahí fuera y resuelve algún caso.</p>
          ) : (
            evidence.map((ev, i) => (
              <div key={i} className="evidence-item">
                <div style={{fontSize:'2rem'}}>{ev.icon}</div>
                <div>
                  <h4 style={{color:'gold', margin:0}}>{ev.name}</h4>
                  <p style={{fontSize:'0.7rem', margin:'5px 0'}}>{ev.desc}</p>
                  <span style={{fontSize:'0.6rem', opacity:0.5}}>Hallada el: {ev.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={() => setView('menu')}>Volver al Mapa</button>
      </div>
    </div>
  );
};
