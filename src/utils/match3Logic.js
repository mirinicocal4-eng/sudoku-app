export const MATCH3_ITEMS = [
  { id: 1, icon: '👣', name: 'Huella' },
  { id: 2, icon: '📞', name: 'Llamada' },
  { id: 3, icon: '💰', name: 'Soborno' },
  { id: 4, icon: '🚬', name: 'Cigarrillo' },
  { id: 5, icon: '🧊', name: 'Prueba' },
  { id: 6, icon: '📚', name: 'Libro' },
  { id: 7, icon: '⏰', name: 'Reloj' },
  { id: 8, icon: '💣', name: 'Bomba', special: 'bomb' },
  { id: 9, icon: '⚡', name: 'Rayo', special: 'ray' },
  { id: 10, icon: '📦', name: 'Caja', obstacle: 'crate' },
  { id: 11, icon: '❄️', name: 'Hielo', obstacle: 'ice' },
  { id: 12, icon: '⛓️', name: 'Cadena', obstacle: 'chain' },
  { id: 13, icon: '💎', name: 'Diamante Perdido', collectible: true }
];

const NORMAL_MAX_ID = 7;
const OBSTACLE_IDS = [10, 11, 12];

export const initMatch3Grid = (level = 1) => {
  return Array(36).fill(null).map((_, i) => {
    // Spawneo de Diamante Perdido (solo en fila superior y con baja probabilidad)
    if (i < 6 && Math.random() < 0.05) {
      return { ...MATCH3_ITEMS[12], uid: Math.random() };
    }
    const isObstacle = Math.random() < (0.1 + (level * 0.02));
    if (isObstacle) {
      const obsType = OBSTACLE_IDS[Math.floor(Math.random() * OBSTACLE_IDS.length)];
      return { ...MATCH3_ITEMS[obsType - 1], uid: Math.random() };
    }
    return {
      ...MATCH3_ITEMS[Math.floor(Math.random() * 5)],
      uid: Math.random()
    };
  });
};

export const swap = (grid, idx1, idx2) => {
  const newGrid = [...grid];
  const temp = newGrid[idx1];
  newGrid[idx1] = newGrid[idx2];
  newGrid[idx2] = temp;
  return newGrid;
};

export const checkMatches = (grid) => {
  const size = 6;
  const toRemove = new Set();
  const powerUps = []; // {idx, type}

  // Check horizontal
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 2; c++) {
      const idx = r * size + c;
      const type = grid[idx]?.id;
      if (type && type <= NORMAL_MAX_ID && grid[idx+1]?.id === type && grid[idx+2]?.id === type) {
        let count = 3;
        while(c + count < size && grid[idx + count]?.id === type) count++;
        
        for(let i=0; i<count; i++) toRemove.add(idx + i);
        
        if (count === 4) powerUps.push({ idx, type: 'bomb' });
        if (count >= 5) powerUps.push({ idx, type: 'ray' });
        
        c += count - 1;
      }
    }
  }

  // Check vertical
  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 2; r++) {
      const idx = r * size + c;
      const type = grid[idx]?.id;
      if (type && type <= NORMAL_MAX_ID && grid[idx+size]?.id === type && grid[idx+size*2]?.id === type) {
        let count = 3;
        while(r + count < size && grid[(r+count)*size + c]?.id === type) count++;
        
        for(let i=0; i<count; i++) toRemove.add((r+i)*size + c);
        
        if (count === 4) powerUps.push({ idx, type: 'bomb' });
        if (count >= 5) powerUps.push({ idx, type: 'ray' });
        
        r += count - 1;
      }
    }
  }

  return { matches: Array.from(toRemove), powerUps };
};
