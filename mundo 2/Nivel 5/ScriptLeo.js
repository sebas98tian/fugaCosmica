

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOverScreen");
const finalMessage = document.getElementById("finalMessage");
const restartBtn = document.getElementById("restartBtn");

let keys = {};
document.onkeydown = e => keys[e.key] = true;
document.onkeyup   = e => keys[e.key] = false;

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const playerImg = new Image();
const hadesImg  = new Image();
playerImg.src = "caraJugador.png";
hadesImg.src  = "caraHades.png";


function getRandomItemPosition() {
    const MARGIN = 150; 
    const MIN_DISTANCE_FROM_START = 250;
    
    let x, y, distance;
    
    do {
        x = Math.random() * (canvas.width - MARGIN * 2) + MARGIN;
        y = Math.random() * (canvas.height - MARGIN * 2) + MARGIN;
        
        let dx = x - START.x;
        let dy = y - START.y;
        distance = Math.hypot(dx, dy);
        
    } while (distance < MIN_DISTANCE_FROM_START);

    return { x: x, y: y };
}


const START = { x: 100, y: 100 };
const initialItemPos = getRandomItemPosition(); 

let player = {
    x: START.x,
    y: START.y,
    size: 50,
    speed: 5,
    hasItem: false
};

let hades = {
    x: 400,
    y: 200,
    size: 80,
    speed: 2
};

let item = {
    x: initialItemPos.x, // Usar la posición aleatoria
    y: initialItemPos.y, // Usar la posición aleatoria
    size: 40,
    taken: false
};

let gameRunning = true; // Variable para controlar el bucle
let gameMessage = "";

// =======================
// MOVIMIENTO JUGADOR
// =======================
function movePlayer() {
    if(keys["ArrowLeft"])  player.x -= player.speed;
    if(keys["ArrowRight"]) player.x += player.speed;
    if(keys["ArrowUp"])    player.y -= player.speed;
    if(keys["ArrowDown"])  player.y += player.speed;

    // Limites
    if(player.x < 0) player.x = 0;
    if(player.y < 0) player.y = 0;
    if(player.x > canvas.width-player.size) player.x = canvas.width-player.size;
    if(player.y > canvas.height-player.size) player.y = canvas.height-player.size;
}

// =======================
// IA DE HADES
// =======================
function moveHades() {
    let dx = player.x - hades.x;
    let dy = player.y - hades.y;
    let d = Math.hypot(dx, dy);

    hades.x += hades.speed * dx / d;
    hades.y += hades.speed * dy / d;

    if(d < (hades.size + player.size) / 2){
        endGame("❌ ¡HADES TE ATRAPÓ! - GAME OVER"); 
    }
}

// =======================
// RECOGER ITEM
// =======================
function checkItemPickup() {
    if(item.taken) return;

    let dx = player.x - item.x;
    let dy = player.y - item.y;
    let d = Math.hypot(dx, dy);

    if(d < 40){
        item.taken = true;
        player.hasItem = true;
        gameMessage = "✔ Tienes la Corona Solar — ¡Regresa al inicio!";
    }
}

// =======================
// VOLVER AL INICIO PARA GANAR
// =======================
function checkReturnToStart() {
    if(!player.hasItem) return;

    let dx = player.x - START.x;
    let dy = player.y - START.y;
    let d = Math.hypot(dx, dy);

    if(d < 50){
        endGame("🏆 ¡GANASTE! - NIVEL COMPLETADO"); 
    }
}

// =======================
// DIBUJAR
// =======================
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Reliquia
    if(!item.taken){
        ctx.fillStyle = "#ffb300";  
        ctx.shadowColor = "#ffdd66";
        ctx.shadowBlur = 15;
        ctx.fillRect(item.x, item.y, item.size, item.size);
        ctx.shadowBlur = 0;
    }

    // Zona inicial
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(START.x-5, START.y-5, 60, 60);

    // Jugador
    if(playerImg.complete)
        ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
    else{
        ctx.fillStyle="cyan";
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    // Hades Solar
    if(hadesImg.complete)
        ctx.drawImage(hadesImg, hades.x, hades.y, hades.size, hades.size);
    else{
        ctx.fillStyle="purple";
        ctx.beginPath();
        ctx.arc(hades.x, hades.y, hades.size/2, 0, Math.PI*2);
        ctx.fill();
    }
}

// =======================
// FINALIZAR JUEGO (GAME OVER / WIN)
// =======================
function endGame(message) {
    // Mantener comportamiento visual/sonoro existente
    finalMessage.textContent = message || "Juego terminado";
    gameOverScreen.style.display = 'block';
    gameRunning = false;

    // Si el jugador ganó el nivel (mensaje contiene "GANASTE"), otorgar artefacto de Leo
    if (message && message.toUpperCase().includes("GANASTE")) {
        const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
        if (!gained['leo']) {
            gained['leo'] = true;
            localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
            alert("🏆 Has obtenido la Corona de León (Artefacto de Leo).");
        }
    }
}

// =======================
// REINICIAR JUEGO
// =======================
function restartGame() {
    // Resetear posición y estado del jugador
    player.x = START.x;
    player.y = START.y;
    player.hasItem = false;

    // Resetear posición y estado de Hades y el Item
    hades.x = 400;
    hades.y = 200;
    item.taken = false;
    
    // ** Generar nueva posición aleatoria al reiniciar **
    const newItemPos = getRandomItemPosition();
    item.x = newItemPos.x;
    item.y = newItemPos.y;

    // Resetear estados del juego
    gameRunning = true;
    gameMessage = "";

    // Ocultar la pantalla de Game Over
    gameOverScreen.style.display = 'none';

    // Reiniciar el bucle de juego
    gameLoop();
}

// Escuchar el botón de reinicio
restartBtn.addEventListener('click', restartGame);


// =======================
// GAME LOOP
// =======================
function gameLoop() {
    if(!gameRunning){
        // Si el juego ha terminado, simplemente dibuja el último estado y detiene la recursión
        draw(); 
        return; 
    }

    movePlayer();
    moveHades();
    checkItemPickup();
    checkReturnToStart();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();