const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById('restartBtn');
const timerDisplay = document.getElementById('timer');
const livesDisplay = document.getElementById('lives');

let keys = {};
document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

let player, demons;
const maxTime = 30;
let timeLeft = maxTime;
let lives = 3;
let gameOver = false;
let gameMessage = "";

// ==================
// Canvas responsive
// ==================
function resizeCanvas(){
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ==================
// Inicialización
// ==================
function initializeGame(){
    const minSize = Math.min(canvas.width, canvas.height);
    player = {
        x: canvas.width*0.1,
        y: canvas.height*0.8,
        size: minSize*0.08,
        speed: minSize*0.01
    };

    demons = [];
    for(let i=0; i<5; i++){
        demons.push({
            x: Math.random()*(canvas.width-player.size),
            y: Math.random()*(canvas.height*0.6),
            size: minSize*0.08,
            caught: false,
            dirX: Math.random()*2-1,
            dirY: Math.random()*2-1,
            speed: minSize*0.004
        });
    }

    timeLeft = maxTime;
    lives = 3;
    gameOver = false;
    gameMessage = "";
    updateUI();
}

// ==================
// Actualizar UI
// ==================
function updateUI(){
    timerDisplay.textContent = `Tiempo: ${Math.ceil(timeLeft)}`;
    livesDisplay.textContent = `Vidas: ${lives}`;
}

// ==================
// Movimiento jugador
// ==================
function movePlayer(){
    if(keys["ArrowLeft"])  player.x -= player.speed;
    if(keys["ArrowRight"]) player.x += player.speed;
    if(keys["ArrowUp"])    player.y -= player.speed;
    if(keys["ArrowDown"])  player.y += player.speed;

    // límites
    player.x = Math.max(0, Math.min(player.x, canvas.width-player.size));
    player.y = Math.max(0, Math.min(player.y, canvas.height-player.size));
}

// ==================
// Movimiento demonios
// ==================
function moveDemons(){
    for(let demon of demons){
        if(demon.caught) continue;
        demon.x += demon.dirX*demon.speed;
        demon.y += demon.dirY*demon.speed;
        if(demon.x<0 || demon.x>canvas.width-demon.size) demon.dirX*=-1;
        if(demon.y<0 || demon.y>canvas.height-demon.size) demon.dirY*=-1;
    }
}

// ==================
// Revisar atrapados
// ==================
function checkCatches(){
    for(let demon of demons){
        if(demon.caught) continue;
        let dx = player.x - demon.x;
        let dy = player.y - demon.y;
        let d = Math.hypot(dx, dy);
        if(d < (player.size+demon.size)/2){
            demon.caught = true;
        }
    }
}

// ==================
// Tiempo
// ==================
function updateTime(){
    if(gameOver) return;
    timeLeft -= 1/60;
    if(timeLeft <= 0){
        timeLeft = 0;
        lives--;
        updateUI();
        if(lives <= 0){
            gameMessage = "⏰ Se acabó el tiempo — PERDISTE";
            gameOver = true;
        } else {
            gameMessage = "⏰ Fallaste esta ronda — pierdes una vida";
            resetRound();
        }
    }
}

// ==================
// Verificar victoria
// ==================
function checkWin(){
    if(demons.every(d=>d.caught) && !gameOver){
        // Mensaje de victoria + artefacto
        gameMessage = "🏆 ¡GANASTE! Todos los demonios atrapados — 🔱 Tridente del Mar";
        gameOver = true;

        // Guardar artefacto de Capricornio en localStorage
        const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
        if(!gained['capricornio']){
            gained['capricornio'] = true;
            localStorage.setItem('gainedArtefacts', JSON.stringify(gained));

            // Mensaje explícito al jugador
            alert('🏆 Artefacto obtenido: Tridente del Mar (Capricornio)');

            // Intentar actualizar la ranura en la UI (si la página del mundo está abierta)
            try {
                const docs = [window.opener?.document, window.parent?.document, document];
                for (const d of docs){
                    if(!d) continue;
                    const slot = d.getElementById('capricornio-artefact');
                    if(slot){
                        slot.classList.add('unlocked');
                        slot.textContent = '🔱';
                        slot.setAttribute('title', 'Artefacto Ganado: Tridente del Mar');
                        break;
                    }
                }
            } catch(e){}
        }
    }
}

// ==================
// Reiniciar ronda
// ==================
function resetRound(){
    initializeGame();
}

// ==================
// Dibujar todo
// ==================
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    ctx.font = `${player.size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // jugador
    ctx.fillText("🙂", player.x + player.size/2, player.y + player.size/2);

    // demonios
    for(let demon of demons){
        if(!demon.caught){
            ctx.fillText("👹", demon.x + demon.size/2, demon.y + demon.size/2);
        }
    }

    // tiempo
    ctx.fillStyle = "white";
    ctx.font = `${canvas.width*0.03}px Arial`;
    ctx.textAlign = "left";
    ctx.fillText(`Tiempo: ${Math.ceil(timeLeft)}s`, 10, canvas.height*0.05);

    // vidas
    livesDisplay.textContent = `Vidas: ${lives}`;

    // mensaje
    if (gameMessage !== "") {
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // tamaño base de fuente según canvas
        let fontSize = Math.max(18, Math.floor(canvas.width * 0.04));
        ctx.font = `${fontSize}px Arial`;

        // función simple para envolver texto en varias líneas
        const wrapLines = (text, maxWidth) => {
            const words = text.split(' ');
            const lines = [];
            let line = '';
            for (let w of words) {
                const test = line ? (line + ' ' + w) : w;
                if (ctx.measureText(test).width > maxWidth) {
                    if (line) lines.push(line);
                    line = w;
                } else {
                    line = test;
                }
            }
            if (line) lines.push(line);
            return lines;
        };

        const maxWidth = canvas.width * 0.85;
        let lines = wrapLines(gameMessage, maxWidth);

        // reducir fuente si hay demasiadas líneas
        while (lines.length > 3 && fontSize > 14) {
            fontSize = Math.max(14, Math.floor(fontSize * 0.9));
            ctx.font = `${fontSize}px Arial`;
            lines = wrapLines(gameMessage, maxWidth);
        }

        const lineHeight = Math.ceil(fontSize * 1.15);
        const totalHeight = lines.length * lineHeight;
        const startY = (canvas.height - totalHeight) / 2;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvas.width / 2, startY + i * lineHeight);
        }
    }
}

// ==================
// Loop principal
// ==================
function gameLoop(){
    if(!gameOver){
        movePlayer();
        moveDemons();
        checkCatches();
        updateTime();
        checkWin();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// ==================
// Botón reiniciar
// ==================
restartBtn.addEventListener('click', () => {
    initializeGame();
});

// ==================
// Iniciar juego
// ==================
initializeGame();
gameLoop();
