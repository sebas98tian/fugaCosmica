const board = document.getElementById("board");
const reiniciar = document.getElementById("reiniciar");
const scoreDisplay = document.getElementById("score");
const artifactMessage = document.getElementById("artifact-message");
let tiles = [];
let score = 0;
const ARTIFACT_THRESHOLD = 2; // Cambiado de 4 a 2

function generarTablero() {
    do {
        // Genera una permutación aleatoria de los números 1-8 y null
        tiles = [1,2,3,4,5,6,7,8,null].sort(()=>Math.random()-0.5);
    } while (!esSoluble(tiles) || estaResuelto(tiles)); // Asegura que el tablero sea soluble y no esté resuelto
    dibujar();
}

// Función para verificar si un tablero 8-puzzle es soluble (requerido para un juego justo)
function esSoluble(arr) {
    let inversions = 0;
    const puzzleArray = arr.filter(v => v !== null); // Solo números

    for (let i = 0; i < puzzleArray.length; i++) {
        for (let j = i + 1; j < puzzleArray.length; j++) {
            if (puzzleArray[i] > puzzleArray[j]) {
                inversions++;
            }
        }
    }
    // Para una cuadrícula de 3x3, el puzzle es soluble si el número de inversiones es par.
    return inversions % 2 === 0;
}

function dibujar() {
    board.innerHTML = "";
    tiles.forEach((v, i)=>{
        const div = document.createElement("div");
        div.dataset.index = i;
        if(v === null) {
            div.className = "tile empty";
        } else {
            div.className = "tile";
            div.textContent = v;
            // La clase para el fondo se añade en CSS usando nth-child o el valor si es necesario, 
            // pero mantendremos el valor por simplicidad y estilo actual.
            div.onclick = () => mover(i);
        }
        board.appendChild(div);
    });
}

function mover(i) {
    const empty = tiles.indexOf(null);
    // Coordenadas válidas para mover: arriba/abajo (i-3, i+3) o izquierda/derecha (i-1, i+1)
    const validMoves = [
        i-3, i+3, // Arriba/Abajo
        i-1, i+1  // Izquierda/Derecha
    ].filter(n =>
        n >= 0 && n < 9 &&
        // Excluye movimientos a través del borde horizontal:
        // No permite mover de la columna 0 a la 2 (i-1) o de la columna 2 a la 0 (i+1)
        !(i % 3 === 0 && n === i-1) && // Columna izquierda no puede ir a la izquierda
        !(i % 3 === 2 && n === i+1)    // Columna derecha no puede ir a la derecha
    );

    if(validMoves.includes(empty)) {
        // Intercambia el valor de la celda seleccionada con el espacio vacío
        [tiles[i], tiles[empty]] = [tiles[empty], tiles[i]];
        dibujar();
        
        if(estaResuelto(tiles)) {
            manejarVictoria();
        }
    }
}

function estaResuelto(arr){
    // Comprueba si el array es igual al estado final: [1, 2, 3, 4, 5, 6, 7, 8, null]
    return JSON.stringify(arr) === JSON.stringify([1,2,3,4,5,6,7,8,null]);
}

function manejarVictoria() {
    score++;
    scoreDisplay.textContent = score;
    
    let message = "¡Victoria! Tauro domina la paciencia.";
    if (score >= ARTIFACT_THRESHOLD) {
        message += " ¡Has ganado el Artefacto Tauro!";
        artifactMessage.textContent = "¡Artefacto de Tauro Obtenido! 🎉";
        // Persiste usando la misma estructura que usa Mundo/Aries
        const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
        gained['tauro'] = true;
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
    } else {
        artifactMessage.textContent = "";
    }

    setTimeout(()=> {
        alert(message);
        // Genera automáticamente un nuevo tablero para seguir jugando
        generarTablero(); 
    }, 100);
}

reiniciar.onclick = generarTablero;

/* Integración con almacenamiento compartido (usar exactamente lo que usa Aries/Mundo) */
// Inicializar estado desde gainedArtefacts (si ya se obtuvo el artefacto)
(function initFromStorage() {
    const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (gained['tauro']) {
        score = ARTIFACT_THRESHOLD;
        scoreDisplay.textContent = score;
        artifactMessage.textContent = "¡Artefacto de Tauro Obtenido! 🎉";
    }
})();

// Reinicio: además de regenerar tablero, quitar artefacto de gainedArtefacts
reiniciar.addEventListener('click', () => {
    const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (gained['tauro']) {
        delete gained['tauro'];
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
    }
    // limpiar mensaje y score local
    score = 0;
    scoreDisplay.textContent = score;
    artifactMessage.textContent = "";
});

// Generar primer tablero al cargar el script
generarTablero();