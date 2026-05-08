import React from 'react';

export const HUD = ({ score, energy, diamonds, infiniteEnergyTime, isMuted, setIsMuted, isTestMode, setIsTestMode, inventory, setEnergy, setInventory, setShowLogin, getXPInfo, getRango }) => {
  const xp = getXPInfo(score);
  
  return (
    <div className="economy-hud" style={{
      position:'fixed', top:0, left:'420px', right:0, 
      flexDirection:'row', height:'60px', padding:'0 20px', 
      justifyContent:'space-between', borderRadius:0, borderBottom:'1px solid gold',
      background:'rgba(0,0,0,0.9)', zIndex:1000
    }}>
      <div style={{display:'flex', alignItems:'center', gap:'20px', flex:1}}>
        <div style={{minWidth:'200px'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'gold', fontWeight:'bold'}}>
            <span>{getRango(xp.level)}</span>
            <span>NIVEL {xp.level}</span>
          </div>
          <div style={{background:'#222', height:'6px', borderRadius:'3px', overflow:'hidden', border:'1px solid #444', marginTop:'2px'}}>
            <div style={{background:'linear-gradient(90deg, #00d2ff, #3a7bd5)', height:'100%', width:`${xp.percent}%`, transition:'width 1s'}}></div>
          </div>
        </div>
        <div className="hud-item" style={{
          background: infiniteEnergyTime > 0 ? 'linear-gradient(45deg, gold, #ffcc00)' : '#333', 
          color: infiniteEnergyTime > 0 ? 'black' : 'white',
          fontWeight: 'bold', fontSize:'0.8rem', border:'none'
        }}>
          ⚡ {energy}% {infiniteEnergyTime > 0 && `(∞ ${infiniteEnergyTime}s)`}
        </div>
        <div className="hud-item" style={{background:'#333', border:'none'}}>💎 {diamonds}</div>
      </div>

      <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
        <div style={{display:'flex', gap:'5px', marginRight:'20px', borderRight:'1px solid #444', paddingRight:'20px'}}>
          <button className="hud-item" style={{padding:'5px 10px'}} onClick={()=>{ if(inventory.coffee > 0) { setEnergy(e=>e+25); setInventory(i=>({...i, coffee:i.coffee-1})); } }}>☕ {inventory.coffee}</button>
          <button className="hud-item" style={{padding:'5px 10px'}} onClick={()=>{ if(inventory.food > 0) { setEnergy(e=>e+50); setInventory(i=>({...i, food:i.food-1})); } }}>🥪 {inventory.food}</button>
          <button className="hud-item" style={{padding:'5px 10px', background: infiniteEnergyTime > 0 ? 'gold' : '#444'}} onClick={()=>{ if(inventory.turbo > 0 && infiniteEnergyTime === 0) { setInfiniteEnergyTime(120); setInventory(i=>({...i, turbo:i.turbo-1})); } }}>🚀 {inventory.turbo}</button>
        </div>
        <button className="hud-item" style={{background: isTestMode ? 'var(--noir-red)' : '#444'}} onClick={() => setIsTestMode(!isTestMode)}>{isTestMode ? '🛠️ TEST' : '🎮 JUEGO'}</button>
        <button className="hud-item" onClick={() => setMusicEnabled(!musicEnabled)}>{musicEnabled?'🎷':'🔇'}</button>
        <button className="hud-item" onClick={() => setIsMuted(!isMuted)}>{isMuted?'🔇':'🔊'}</button>
        <button className="hud-item" style={{borderRadius:'50%'}} onClick={() => setShowLogin(true)}>👤</button>
      </div>
    </div>
  );
};
