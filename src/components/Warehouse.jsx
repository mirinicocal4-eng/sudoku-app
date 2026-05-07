import React from 'react';

export const Warehouse = ({ evidence, inventory, setInventory, setEnergy, setView }) => {
  const consume = (type, amount) => {
    if (inventory[type] > 0) {
      setEnergy(e => Math.min(100, e + amount));
      setInventory(prev => ({ ...prev, [type]: prev[type] - 1 }));
    }
  };

  return (
    <div className="app-container" style={{paddingLeft: '420px', paddingTop:'70px'}}>
      <h1 className="title">CENTRO DE OPERACIONES</h1>
      
      <div className="game-card" style={{display:'flex', gap:'20px', textAlign:'left'}}>
        {/* Lado Izquierdo: Inventario de Energía */}
        <div style={{width:'250px', borderRight:'1px solid rgba(0,0,0,0.1)', paddingRight:'20px'}}>
          <h3 style={{fontFamily:'Outfit', fontSize:'1rem', color:'var(--noir-red)'}}>📦 SUMINISTROS</h3>
          <p style={{fontSize:'0.7rem', opacity:0.7, marginBottom:'15px'}}>Haz clic en un objeto para consumirlo y recuperar energía.</p>
          
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <div className="hud-item" style={{cursor:'pointer', display:'flex', justifyContent:'space-between', background: inventory.coffee > 0 ? 'var(--noir-ink)' : '#ccc'}} onClick={() => consume('coffee', 25)}>
              <span>☕ Café (+25% Energía)</span>
              <span style={{fontWeight:'bold'}}>{inventory.coffee}</span>
            </div>
            <div className="hud-item" style={{cursor:'pointer', display:'flex', justifyContent:'space-between', background: inventory.food > 0 ? 'var(--noir-ink)' : '#ccc'}} onClick={() => consume('food', 50)}>
              <span>🥪 Comida (+50% Energía)</span>
              <span style={{fontWeight:'bold'}}>{inventory.food}</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Evidencias */}
        <div style={{flex:1}}>
          <h3 style={{fontFamily:'Outfit', fontSize:'1rem', color:'var(--noir-red)'}}>🔍 EVIDENCIAS COLECTADAS ({evidence.length})</h3>
          <div className="evidence-grid" style={{maxHeight:'400px', overflowY:'auto', marginTop:'15px'}}>
            {evidence.length === 0 ? (
              <p style={{opacity:0.5, fontSize:'0.8rem'}}>No hay evidencias todavía. Investiga los casos para encontrarlas.</p>
            ) : (
              evidence.map((ev, i) => (
                <div key={i} className="evidence-item" style={{display:'flex', gap:'15px', alignItems:'center', padding:'10px', borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
                  <div style={{fontSize:'2rem'}}>{ev.icon}</div>
                  <div>
                    <h4 style={{color:'var(--noir-ink)', margin:0, fontSize:'0.9rem'}}>{ev.name}</h4>
                    <p style={{fontSize:'0.7rem', margin:'3px 0', opacity:0.8}}>{ev.desc}</p>
                    <span style={{fontSize:'0.6rem', opacity:0.5}}>Hallada el: {ev.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <button className="btn btn-primary" style={{marginTop:'20px'}} onClick={() => setView('menu')}>Volver al Mapa</button>
    </div>
  );
};
