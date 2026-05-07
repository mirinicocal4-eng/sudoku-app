export const MATCH3_ITEMS = [
  { id: 1, icon: "⚖️", name: "Justicia" },
  { id: 2, icon: "🛡️", name: "Prueba" },
  { id: 3, icon: "🗣️", name: "Testimonio" },
  { id: 4, icon: "🚫", name: "Mentira" },
  { id: 5, icon: "📜", name: "Orden" }
];

export function initMatch3Grid(size = 6) {
  const grid = [];
  for (let i = 0; i < size * size; i++) {
    grid.push(MATCH3_ITEMS[Math.floor(Math.random() * MATCH3_ITEMS.length)]);
  }
  return grid;
}

export function checkMatches(grid, size = 6) {
  const matches = new Set();
  
  // Horizontal
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 2; c++) {
      const idx = r * size + c;
      if (grid[idx] && grid[idx+1] && grid[idx+2] &&
          grid[idx].id === grid[idx+1].id && grid[idx].id === grid[idx+2].id) {
        matches.add(idx); matches.add(idx+1); matches.add(idx+2);
      }
    }
  }
  
  // Vertical
  for (let c = 0; c < size; c++) {
    for (let r = 0; r < size - 2; r++) {
      const idx = r * size + c;
      const idx2 = (r+1) * size + c;
      const idx3 = (r+2) * size + c;
      if (grid[idx] && grid[idx2] && grid[idx3] &&
          grid[idx].id === grid[idx2].id && grid[idx].id === grid[idx3].id) {
        matches.add(idx); matches.add(idx2); matches.add(idx3);
      }
    }
  }
  
  return Array.from(matches);
}

export function swap(grid, idx1, idx2) {
  const newGrid = [...grid];
  const temp = newGrid[idx1];
  newGrid[idx1] = newGrid[idx2];
  newGrid[idx2] = temp;
  return newGrid;
}
