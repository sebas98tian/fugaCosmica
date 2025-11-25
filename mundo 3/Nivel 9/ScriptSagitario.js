// ===========================================
// *** SELECTORES DEL JUEGO (DOM) ***
// ===========================================
const gameGrid = document.getElementById('game-grid'); 
const startButton = document.getElementById('start-button'); 
const scoreDisplay = document.getElementById('score'); 
const livesDisplay = document.getElementById('lives'); 
const messageDisplay = document.getElementById('message'); 
const rewardContainer = document.getElementById('reward-message-container'); 

// ===========================================
// *** VARIABLES DE ESTADO Y CONFIGURACIÓN ***
// ===========================================
let score = 0;
let lives = 3;
let lastCell = -1; // Índice de la última casilla activa
let gameInterval; // Temporizador principal (controla la aparición de Aries)
let currentActiveCell = null; // La casilla activa en este momento
let isGameRunning = false;
let artefactGained = false; // Bandera para saber si el artefacto ya fue marcado

// Constantes clave del juego
const NUM_CELLS = 9;
const ARIES_SYMBOL = '♈';
const REWARD_SCORE = 10; // Puntaje para ganar el artefacto
const SPEED_LEVELS = [5, 10, 15, 20]; // Puntos clave donde la dificultad aumenta
const BASE_DURATION = 1000; // Tiempo que el símbolo está visible (ms)
const BASE_INTERVAL = 1500; // Frecuencia con que aparece un nuevo símbolo (ms)
let currentDuration = BASE_DURATION; 
let currentInterval = BASE_INTERVAL;

// ===========================================
// *** FUNCIONES DE LA CUADRÍCULA Y MOVIMIENTO ***
// ===========================================

// 1. Crea dinámicamente la cuadrícula 3x3 (¡NUEVA / CORREGIDA!)
function createGrid() {
    // Limpia cualquier contenido previo
    gameGrid.innerHTML = ''; 
    
    // Crea las 9 casillas
    for (let i = 0; i < NUM_CELLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i); 
        gameGrid.appendChild(cell);
    }
}

// 2. Elige una casilla diferente a la última
function chooseRandomCell() {
    const cells = document.querySelectorAll('.cell'); 
    let newCellIndex;
    
    // Evita repetir la última casilla
    do {
        newCellIndex = Math.floor(Math.random() * NUM_CELLS);
    } while (newCellIndex === lastCell);

    lastCell = newCellIndex;
    return cells[newCellIndex];
}

// 3. Muestra el símbolo en una casilla y establece un temporizador para penalizar si expira
function showAries() {
    // A. Limpiar la casilla anterior y penalizar si el jugador no hizo click a tiempo
    if (currentActiveCell) {
        // Llama a missAries() si el tiempo de la casilla anterior expiró
        missAries(true); 
    }

    // B. Seleccionar y activar la nueva casilla
    const newCell = chooseRandomCell();
    currentActiveCell = newCell;
    newCell.textContent = ARIES_SYMBOL;
    newCell.classList.add('active-cell');

    // C. Configurar el temporizador para que la casilla desaparezca/penalice
    // Guardamos el ID del temporizador directamente en el objeto de la celda
    newCell.timer = setTimeout(() => {
        // Llama a missAries() despus de currentDuration milisegundos
        // La bandera 'true' indica que fue un fallo por tiempo
        missAries(true); 
    }, currentDuration);
}

// ===========================================
// *** LÓGICA DEL JUEGO: HIT/MISS ***
// ===========================================

// 4. Se ejecuta cuando el jugador ACERTA
function hitAries() {
    // 1. Limpiar inmediatamente la casilla activa
    if (currentActiveCell) {
        // Cancelar el temporizador pendiente (para que no penalice despus del acierto)
        clearTimeout(currentActiveCell.timer); 
        currentActiveCell.textContent = '';
        currentActiveCell.classList.remove('active-cell');
        currentActiveCell = null;
    }
    
    // 2. Actualizar puntuación
    score++;
    scoreDisplay.textContent = score;
    messageDisplay.textContent = '¡Impulso acertado! +1 punto.';
    
    // 3. Ajustar dificultad
    upgradeDifficulty();

    // 4. Comprobar si ganó el artefacto
    if (score >= REWARD_SCORE && !artefactGained) {
        // Solo si alcanza el score y no lo ha ganado antes
        winArtefact();
    }
    
    // 5. Reiniciar el ciclo principal de aparicin (limpiando el intervalo anterior)
    clearInterval(gameInterval);
    gameInterval = setInterval(showAries, currentInterval);
}

// 5. Se ejecuta cuando el jugador FALLA o el tiempo de la casilla expira (¡CORREGIDA!)
// El parmetro 'isTimeout' nos dice si fue por tiempo (true) o por click en casilla vaca (false)
function missAries(isTimeout = false) {
    if (!isGameRunning) return; 

    // 1. **CORRECCIÓN CLAVE: LIMPIAR LA CASILLA ACTIVA**
    if (currentActiveCell) {
        // Asegurarse de que el temporizador se cancela
        clearTimeout(currentActiveCell.timer); 
        // Quita el símbolo y la clase roja
        currentActiveCell.textContent = ''; 
        currentActiveCell.classList.remove('active-cell'); 
        currentActiveCell = null; // Reinicia la variable
    }
    
    // 2. Reducir vidas
    lives--;
    livesDisplay.textContent = lives;
    messageDisplay.textContent = isTimeout ? 
        '¡Demasiado lento! Has perdido una vida.' : 
        '¡Fallo! Has perdido una vida.';

    // 3. Detener el juego si se acaban las vidas
    if (lives <= 0) {
        endGame();
    }
    
    // 4. Reiniciar el ciclo principal para que el juego continúe si hay vidas
    if (isGameRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(showAries, currentInterval);
    }
}


// 6. Aumentar la velocidad del juego
function upgradeDifficulty() {
    // Verifica si la puntuacin es uno de los puntos clave de dificultad
    if (SPEED_LEVELS.includes(score)) {
        // Reducir el tiempo de duracin y el intervalo de aparicin
        currentDuration = Math.max(200, currentDuration - 100); // Mínimo 200ms
        currentInterval = Math.max(500, currentInterval - 150);  // Mínimo 500ms
        
        // Actualizar el intervalo principal con la nueva velocidad
        clearInterval(gameInterval);
        gameInterval = setInterval(showAries, currentInterval);
        
        messageDisplay.textContent += ` ¡Dificultad aumentada! Velocidad: ${currentDuration}ms.`;
    }
}

// 7. Recompensa por ganar el juego
function winArtefact() {
    artefactGained = true; // Marca la bandera
    
    // Guardar el estado en el almacenamiento local (simulacin de guardar progreso)
    let gainedArtefacts = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    gainedArtefacts.aries = true; // El Yelmo de Bronce de Aries fue ganado
    localStorage.setItem('gainedArtefacts', JSON.stringify(gainedArtefacts));

    // Mostrar el mensaje de recompensa
    const rewardElement = document.createElement('p');
    rewardElement.id = 'reward';
    rewardElement.textContent = '🔱'; // Emoji del Yelmo de Bronce
    rewardContainer.appendChild(rewardElement);
    
    messageDisplay.textContent = "¡Felicitaciones! Has ganado el Yelmo de Bronce de Aries. ¡Continúa!";
}

// 8. Finaliza el juego (¡CORREGIDA!)
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval); 
    startButton.textContent = 'Jugar de Nuevo';
    startButton.classList.remove('hidden'); 
    
    messageDisplay.textContent = `Juego Terminado. Puntuación Final: ${score}.`;
    
    // **CORRECCIÓN CLAVE: Limpiar cualquier casilla que haya quedado activa**
    if (currentActiveCell) {
        clearTimeout(currentActiveCell.timer); // Cancelar su temporizador
        currentActiveCell.textContent = '';
        currentActiveCell.classList.remove('active-cell');
        currentActiveCell = null;
    }
}

// ===========================================
// *** INICIO DEL JUEGO ***
// ===========================================

// Configura y comienza una nueva partida
function startGame() {
    // Resetear variables de estado
    score = 0;
    lives = 3;
    currentDuration = BASE_DURATION; 
    currentInterval = BASE_INTERVAL;
    isGameRunning = true;
    
    // Actualizar interfaz
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    messageDisplay.textContent = '¡El juego ha comenzado! Busca el símbolo...';
    startButton.classList.add('hidden'); 
    
    // Limpiar el contenedor de la recompensa visual (si existe)
    rewardContainer.innerHTML = ''; 

    // Iniciar el ciclo de aparición
    gameInterval = setInterval(showAries, currentInterval);
    
    // Llamar a showAries inmediatamente para que el primer símbolo aparezca al instante
    showAries();
}

// ===========================================
// *** LISTENERS ***
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Crear la cuadrícula al cargar la página (¡CLAVE!)
    createGrid(); 
    
    // 2. Listener para el botón de inicio
    startButton.addEventListener('click', () => {
        if (!isGameRunning) {
            startGame();
        }
    });
    
    // 3. Listener para la cuadrícula (detecta clicks en cualquier celda)
    gameGrid.addEventListener('click', (event) => {
        if (!isGameRunning) return;

        const clickedCell = event.target;

        // Asegúrate de que el clic fue en una casilla (y no en el contenedor vaco)
        if (clickedCell.classList.contains('cell')) {
            // Verifica si el clic fue en la casilla activa
            if (clickedCell === currentActiveCell) {
                hitAries();
            } else {
                // El clic fue en una casilla vaca
                missAries(false); // La bandera 'false' indica que fue un fallo por click
            }
        }
    });
});