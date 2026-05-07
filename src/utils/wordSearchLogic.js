// Lógica para el juego de Sopa de Letras (Búsqueda de Evidencias)

const PALABRAS_POOL = [
  "PISTA", "HUELLA", "SANGRE", "VENENO", "CUCHILLO", "REVOLVER",
  "SOSPECHOSO", "MOVIL", "COARTADA", "TESTIGO", "CRIMEN", "CULPABLE",
  "INOCENTE", "CARCEL", "JUEZ", "FISCAL", "BOTIN", "DIAMANTE",
  "MISTERIO", "ENIGMA", "CODIGO", "LLAVE", "DIARIO", "CARTA"
];

export function generateWordSearch(difficulty = 'easy') {
  const size = difficulty === 'easy' ? 12 : 14;
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));

  const wordCount = difficulty === 'easy' ? 6 : 8;
  const words = [...PALABRAS_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, wordCount);

  const placedWords = [];

  words.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const direction = Math.random() > 0.5 ? 'H' : 'V'; // Horizontal o Vertical
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (canPlace(grid, word, row, col, direction)) {
        const positions = placeWord(grid, word, row, col, direction);
        placedWords.push({ word, found: false, positions }); // positions: ["0-1", "0-2"...]
        placed = true;
      }
      attempts++;
    }
  });

  // Rellenar huecos con letras aleatorias
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, words: placedWords };
}

function canPlace(grid, word, row, col, dir) {
  const size = grid.length;
  if (dir === 'H') {
    if (col + word.length > size) return false;
    for (let i = 0; i < word.length; i++) {
      if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) return false;
    }
  } else {
    if (row + word.length > size) return false;
    for (let i = 0; i < word.length; i++) {
      if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) return false;
    }
  }
  return true;
}

function placeWord(grid, word, row, col, dir) {
  const pos = [];
  for (let i = 0; i < word.length; i++) {
    if (dir === 'H') {
      grid[row][col + i] = word[i];
      pos.push(`${row}-${col + i}`);
    } else {
      grid[row + i][col] = word[i];
      pos.push(`${row + i}-${col}`);
    }
  }
  return pos;
}
