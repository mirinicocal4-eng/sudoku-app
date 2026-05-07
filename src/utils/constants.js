export const TITULOS = ["El Robo", "El Misterio", "La Sombra", "El Código", "La Traición", "El Chantaje", "La Intriga", "El Rapto", "La Estafa", "El Crimen", "La Venganza", "El Secreto"];
export const OBJETOS = ["del Diamante", "del Puerto", "de la Mansión", "del Senador", "de la Mafia", "del Casino", "del Almacén", "de la Joyería", "del Banco", "del Museo"];

export const FELICITACIONES = [
  "¡Increíble trabajo! Tienes ojos de lince.",
  "El sargento Miller está impresionado. ¡Sigue así!",
  "Una pista clave para el caso. ¡Eres el mejor!",
  "La ciudad duerme un poco más segura gracias a ti.",
  "¡Brillante! Has conectado los puntos como nadie.",
  "Ese sospechoso no tenía ninguna oportunidad contigo."
];

export const EVIDENCIAS_POSIBLES = [
  { name: "Cápsula de Bala", icon: "🔫", desc: "Calibre .38, encontrada cerca del muelle." },
  { name: "Nota con Carmín", icon: "💄", desc: "Un mensaje críptico escrito en un pañuelo." },
  { name: "Llave Maestra", icon: "🗝️", desc: "Abre puertas que deberían estar cerradas." },
  { name: "Reloj Roto", icon: "⌚", desc: "Se detuvo exactamente a la hora del crimen." },
  { name: "Huella Dactilar", icon: "👣", desc: "Recuperada con polvo de grafito." },
  { name: "Cinta de Cassette", icon: "📼", desc: "Contiene una grabación comprometedora." },
  { name: "Anillo de Oro", icon: "💍", desc: "Tiene una inscripción: 'Para siempre, M'." }
];

export const SOSPECHOSOS = [
  { name: "Tony 'El Flaco'", img: "/tony_el_flaco_1778190949016.png" },
  { name: "Madame Red", img: "/madame_red_1778190961582.png" },
  { name: "El Alcalde Corrupto", img: "/alcalde_corrupto_1778190973480.png" },
  { name: "Sr. Sombras", img: "/sr_sombras_1778190987316.png" },
  { name: "La Viuda Negra", img: "/madame_red_1778190961582.png" },
  { name: "El Falsificador", img: "/tony_el_flaco_1778190949016.png" },
  { name: "Capo Mancini", img: "/alcalde_corrupto_1778190973480.png" },
  { name: "Doctor Muerte", img: "/sr_sombras_1778190987316.png" }
];

export const BARRIOS = ["Distrito Financiero", "Muelles del Puerto", "Casco Antiguo", "Barrio Industrial", "Zona Residencial", "El Casino", "Suburbios"];

export const PERSONAJES = {
  miller: { name: "Sargento Miller", img: "/sargento_miller.png", text: "Escucha, detective. Tengo estos archivos que necesitan ser procesados ya.", gender: 'male' },
  black: { name: "Dra. Black", img: "/dra_black.png", text: "He traído las pruebas del lugar del crimen. Necesito que el laboratorio haga su magia.", gender: 'female' },
  cooper: { name: "Agente Cooper", img: "/agente_cooper.png", text: "Tengo un sospechoso en la sala y un par de pistas en la calle. ¿Te encargas?", gender: 'female' }
};

export const GAME_ASIG = {
  hidden: 'cooper',
  sudoku: 'black',
  wordsearch: 'miller',
  merge: 'black',
  match3: 'cooper',
  puzzle: 'miller'
};

export const PUNTOS_MAPA = [
  { x: 15, y: 75 }, { x: 25, y: 65 }, { x: 35, y: 80 }, { x: 45, y: 70 }, { x: 55, y: 85 }, { x: 65, y: 75 }, { x: 75, y: 80 },
  { x: 20, y: 45 }, { x: 30, y: 35 }, { x: 40, y: 50 }, { x: 50, y: 40 }, { x: 60, y: 55 }, { x: 70, y: 45 }, { x: 80, y: 50 }
];
