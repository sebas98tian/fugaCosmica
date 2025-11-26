// ================================================
// LABERINTO ESCORPIO — CORREGIDO
// ================================================

// Estructura del laberinto: '1' es Muro, '0' es Camino, 'H' es Camino Oculto/Inicio
const maze = [
"1111111111111111111111111111111",
"1H000000000111000000000000000001",
"10111111000110111101111111111001",
"10000001000110000101000000001001",
"10111001011110110101111111001001",
"1H001000100000001000000010010001",
"11101111011111110111111001001111",
"10001000000000000000000001000001",
"10111011110111111111101101111001",
"10000000000100010000000000001001", // <--- Pasaje abierto: El '1' en la columna 6 fue cambiado a '0'
"11111010110101010111111111001001",
"1H000000001010100000000010000001",
"11101111110101011111111011111001",
"10001000000101000000001000000001",
"10111011110101111101101111111001",
"10000010000001000101000000001001",
"11111010111111000101111111001001",
"1H000010000000000001000000000001",
"1111111111111111111111111111111"
];

const cellSize = 32;
const game = document.getElementById("game");
const msg = document.getElementById("msg");

game.style.width = maze[0].length * cellSize + "px";
game.style.height = maze.length * cellSize + "px";

// =====================================================
// CREACIÓN DEL LABERINTO
// =====================================================
function buildMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {

            let div = document.createElement("div");
            div.classList.add("cell");

            let c = maze[y][x];
            if      (c === "1") div.classList.add("wall");
            else if (c === "0") div.classList.add("path");
            // Nota: Las celdas 'H' se renderizan como .hide, que parece un muro pero es transitable.
            else if (c === "H") div.classList.add("hide");

            div.style.left = (x * cellSize) + "px";
            div.style.top  = (y * cellSize) + "px";

            game.appendChild(div);
        }
    }
}
buildMaze();

// =====================================================
// CONTROL JUGADOR
// =====================================================
let gameOver = false;

let player = document.createElement("div");
player.id = "player";
player.innerHTML = "🙂";
game.appendChild(player);

let playerPos = {x: 1, y: 1};
updatePlayer();

function updatePlayer(){
    player.style.left = playerPos.x * cellSize + "px";
    player.style.top  = playerPos.y * cellSize + "px";
}

function canMove(x,y){
    // Comprueba si el índice está dentro de los límites y no es un muro ('1').
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) {
        return false;
    }
    return maze[y][x] !== "1";
}

document.addEventListener("keydown", (e)=>{
    if(gameOver) return;

    let nx = playerPos.x, ny = playerPos.y;

    if(e.key=="ArrowUp")    ny--;
    if(e.key=="ArrowDown")  ny++;
    if(e.key=="ArrowLeft")  nx--;
    if(e.key=="ArrowRight") nx++;

    if(canMove(nx,ny)){
        playerPos.x = nx;
        playerPos.y = ny;
        updatePlayer();
        checkArtifact();
    }
});

// =====================================================
// ARTEFACTO — AGUIJÓN ESCARLATA 🦂
// =====================================================
let artifactPos = {x: 27, y: 17}; // Se mantienen tus coordenadas definidas

let artifact = document.createElement("div");
artifact.id = "artifact";
artifact.innerHTML = "🦂";
artifact.style.left = artifactPos.x * cellSize + "px";
artifact.style.top  = artifactPos.y * cellSize + "px";
game.appendChild(artifact);

let hasArtifact = false;

/* Función utilitaria para guardar/mostrar artefactos */
function awardArtefact(key, name) {
    const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (!gained[key]) {
        gained[key] = true;
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
        alert(`🏆 Artefacto obtenido: ${name}`);
    }
}

function checkArtifact(){
    if(!hasArtifact &&
       playerPos.x === artifactPos.x &&
       playerPos.y === artifactPos.y){

        hasArtifact = true;
        artifact.remove();
        msg.innerHTML = "🦂 ¡Aguijón Escarlata obtenido! Vuelve a la entrada.";
    }

    if(hasArtifact && playerPos.x===1 && playerPos.y===1){
        msg.innerHTML = "🏆 ¡HAS GANADO! — Artefacto entregado.";
        awardArtefact('escorpio','Aguijón Escarlata');
        gameOver = true;
    }
}

// =====================================================
// DEMONIOS 👹
// =====================================================
const demonPositions = [
    {x:10,y:3}, {x:20,y:10}, {x:6,y:14}, {x:24,y:5}
];

let demons = [];

function spawnDemons(){
    for(let d of demonPositions){
        let demon = document.createElement("div");
        demon.classList.add("demon");
        demon.innerHTML = "👹";
        demon.style.left = d.x * cellSize + "px";
        demon.style.top  = d.y * cellSize + "px";
        game.appendChild(demon);
        demons.push({el:demon, x:d.x, y:d.y});
    }
}
spawnDemons();

function moveDemons(){
    if(gameOver) return;

    for(let d of demons){

        let dirs = [
            {x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}
        ];

        let r = dirs[Math.floor(Math.random()*4)];

        let nx = d.x + r.x;
        let ny = d.y + r.y;

        if(canMove(nx,ny)){
            d.x = nx;
            d.y = ny;
            d.el.style.left = nx*cellSize + "px";
            d.el.style.top  = ny*cellSize + "px";
        }

        checkKill(d);
    }
}

setInterval(moveDemons, 350);

// =====================================================
// MUERTE
// =====================================================
function checkKill(d){
    if(gameOver) return;

    if(d.x === playerPos.x &&
       d.y === playerPos.y){

        gameOver = true;
        // Llama a la nueva función para mostrar el Game Over interactivo
        showGameOverScreen();
    }
}

// =====================================================
// PANTALLA DE GAME OVER
// =====================================================
function showGameOverScreen() {
    // Ocultar el mensaje del juego
    msg.style.display = 'none';

    // Mostrar modal ya presente en el HTML
    const modal = document.getElementById("gameOverModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.setAttribute('aria-hidden', 'false');
    }

    // Añadir evento al botón de reinicio (una sola vez)
    const restartButton = document.getElementById("restartButton");
    if (restartButton && !restartButton.dataset.listenerAttached) {
        restartButton.addEventListener("click", () => {
            window.location.reload();
        });
        restartButton.dataset.listenerAttached = "1";
    }
}
