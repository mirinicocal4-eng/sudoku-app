export const MATCH3_ITEMS = [
  { id: 1, icon: '📜', name: 'Documento' },
  { id: 2, icon: '📞', name: 'Llamada' },
  { id: 3, icon: '💰', name: 'Soborno' },
  { id: 4, icon: '🚬', name: 'Cigarrillo' },
  { id: 5, icon: '🧊', name: 'Prueba' },
  { id: 6, icon: '💣', name: 'Bomba', special: 'bomb' },
  { id: 7, icon: '⚡', name: 'Rayo', special: 'ray' }
];

export const initMatch3Grid = () => {
  return Array(36).fill(null).map(() => ({
    ...MATCH3_ITEMS[Math.floor(Math.random() * 5)],
    uid: Math.random()
  }));
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
      if (type && type <= 5 && grid[idx+1]?.id === type && grid[idx+2]?.id === type) {
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
      if (type && type <= 5 && grid[idx+size]?.id === type && grid[idx+size*2]?.id === type) {
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
