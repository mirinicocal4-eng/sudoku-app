// Lógica simplificada para el juego de Merge de Pistas

export const MERGE_ITEMS = [
  { id: 1, name: "Nota Sucia", icon: "📄", next: 2 },
  { id: 2, name: "Lupa", icon: "🔍", next: 3 },
  { id: 3, name: "Huella", icon: "👣", next: 4 },
  { id: 4, name: "Expediente", icon: "📁", next: 5 },
  { id: 5, name: "EVIDENCIA FINAL", icon: "💎", next: null }
];




export function initMergeGrid(size = 5) {
  const grid = Array(size * size).fill(null);
  // Empezar con 8 items básicos para que haya movimiento
  for (let i = 0; i < 8; i++) {
    let pos = Math.floor(Math.random() * grid.length);
    while (grid[pos]) pos = Math.floor(Math.random() * grid.length);
    grid[pos] = { ...MERGE_ITEMS[0], instanceId: Math.random() };
  }
  return grid;
}

export function handleMerge(grid, startIndex, endIndex) {
  const newGrid = [...grid];
  const startItem = newGrid[startIndex];
  const endItem = newGrid[endIndex];

  if (!startItem || startIndex === endIndex) return grid;

  // Si el destino está vacío, movemos el item
  if (!endItem) {
    newGrid[endIndex] = startItem;
    newGrid[startIndex] = null;
    return newGrid;
  }

  // Si son iguales y tienen evolución, los combinamos
  if (startItem.id === endItem.id && startItem.next) {
    const nextItem = MERGE_ITEMS.find(item => item.id === startItem.next);
    newGrid[endIndex] = { ...nextItem, instanceId: Math.random() };
    newGrid[startIndex] = null;
    
    // Al combinar, aparecen DOS nuevos básicos para que nunca falte material
    for (let k = 0; k < 2; k++) {
      const emptyPos = newGrid.map((v, i) => v === null ? i : null).filter(v => v !== null);
      if (emptyPos.length > 0) {
        const randomPos = emptyPos[Math.floor(Math.random() * emptyPos.length)];
        newGrid[randomPos] = { ...MERGE_ITEMS[0], instanceId: Math.random() };
      }
    }
    
    return newGrid;
  }


  return grid;
}
