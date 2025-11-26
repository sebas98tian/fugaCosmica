// ==========================
// CONFIGURACIÓN CANVAS
// ==========================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

// ==========================
// CONTROLES
// ==========================
let keys = {};
document.onkeydown = e => keys[e.key] = true;
document.onkeyup   = e => keys[e.key] = false;

// ==========================
// VARIABLES
// ==========================
let gameEnded = false;

const WORLD_WIDTH = 2000;
let cameraX = 0;

const player = {
    x: 50,
    y: 350,
    w: 40,
    h: 50,
    vy: 0,
    speed: 4,
    jumpPower: 14,
    onGround: false,
    collectedAll: false
};

const gravity = 0.7;

// ==========================
// PLATAFORMAS
// ==========================
let platforms = [
    { x: 0,    y: 500, w: WORLD_WIDTH, h: 20 },
    { x: 200,  y: 380, w: 1100, h: 20 }
];

// ==========================
// PIEZAS
// ==========================
let pieces = [];
for(let i=0;i<5;i++){
    pieces.push({
        x: 300 + i*300,
        y: (i % 2 === 0 ? 330 : 470),
        size: 40,
        taken: false
    });
}

// ==========================
// DEMONIOS
// ==========================
let demons = [];
for(let i=0;i<10;i++){
    demons.push({
        x: 100 + i*180,
        y: 50,
        dir: Math.random()<0.5 ? 1 : -1,
        speed: 2 + Math.random()*2
    });
}

let fireballs = [];

// ==========================
// PUERTA FINAL
// ==========================
const door = {
    x: 1800,
    y: 420,
    w: 60,
    h: 80
};

// ==========================
// PÉRDIDA / VICTORIA
// ==========================
function lose(){
    if(gameEnded) return;
    gameEnded = true;
    setTimeout(()=>{
        alert("🔥👹 ¡PERDISTE!");
        location.reload();
    }, 100);
}

function win(){
    if(gameEnded) return;
    gameEnded = true;
    setTimeout(()=>{
        alert("🏆 ¡GANASTE!");

        // Guardar artefacto de Acuario en localStorage
        const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
        if(!gained['acuario']){
            gained['acuario'] = true;
            localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
            alert('🏆 Artefacto obtenido: Jarra del Conocimiento (Acuario)');

            // Intentar actualizar la UI del Mundo 3 si está abierta
            try {
                const docs = [window.opener?.document, window.parent?.document, document];
                for (const d of docs) {
                    if (!d) continue;
                    const slot = d.getElementById('acuario-artefact');
                    if (slot) {
                        slot.classList.add('unlocked');
                        slot.textContent = '🏺';
                        slot.setAttribute('title', 'Artefacto Ganado: Jarra del Conocimiento');
                        break;
                    }
                }
            } catch (e) {
                // silencioso si no se puede acceder a otra ventana
            }
        }

        location.reload();
    }, 100);
}

// ==========================
// JUGADOR
// ==========================
function updatePlayer(){

    if(keys["ArrowLeft"])  player.x -= player.speed;
    if(keys["ArrowRight"]) player.x += player.speed;

    if(keys[" "] && player.onGround){
        player.vy = -player.jumpPower;
        player.onGround = false;
    }

    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false;

    for(let p of platforms){
        if(player.x + player.w > p.x &&
           player.x < p.x + p.w &&
           player.y + player.h > p.y &&
           player.y + player.h < p.y + p.h &&
           player.vy > 0){

            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
        }
    }

    if(player.x < 0) player.x = 0;
    if(player.x + player.w > WORLD_WIDTH) player.x = WORLD_WIDTH - player.w;

    cameraX = player.x - canvas.width/2;
    if(cameraX < 0) cameraX = 0;
    if(cameraX > WORLD_WIDTH - canvas.width)
        cameraX = WORLD_WIDTH - canvas.width;
}

// ==========================
// DEMONIOS
// ==========================
function updateDemons(){
    for(let d of demons){
        d.x += d.dir * d.speed;
        if(d.x < 0 || d.x > WORLD_WIDTH) d.dir *= -1;

        if(Math.random() < 0.02){
            fireballs.push({
                x: d.x,
                y: d.y + 30,
                speed: 6
            });
        }
    }
}

// ==========================
// FUEGO
// ==========================
function updateFireballs(){
    for(let f of fireballs){
        f.y += f.speed;

        if(f.x > player.x && f.x < player.x + player.w &&
           f.y > player.y && f.y < player.y + player.h){
            lose();
        }
    }
}

// ==========================
// PIEZAS
// ==========================
function checkPieces(){
    let total = 0;

    for(let p of pieces){
        if(!p.taken &&
           player.x < p.x + p.size &&
           player.x + player.w > p.x &&
           player.y < p.y + p.size &&
           player.y + player.h > p.y){
            p.taken = true;
        }

        if(p.taken) total++;
    }

    if(total === pieces.length) player.collectedAll = true;
}

// ==========================
// PUERTA FINAL
// ==========================
function checkDoor(){
    if(!player.collectedAll) return;

    if(player.x + player.w > door.x &&
       player.x < door.x + door.w &&
       player.y + player.h > door.y &&
       player.y < door.y + door.h){
        win();
    }
}

// ==========================
// DIBUJO
// ==========================
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.font = "40px Arial";

    ctx.fillStyle = "#555";
    for(let p of platforms)
        ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);

    for(let p of pieces)
        if(!p.taken) ctx.fillText("🔷", p.x - cameraX, p.y);

    for(let d of demons)
        ctx.fillText("👹", d.x - cameraX, d.y);

    for(let f of fireballs)
        ctx.fillText("🔥", f.x - cameraX, f.y);

    ctx.fillText("🧍", player.x - cameraX, player.y);

    ctx.fillText("🚪", door.x - cameraX, door.y);
}

// ==========================
// LOOP
// ==========================
function loop(){
    if(gameEnded) return;

    updatePlayer();
    updateDemons();
    updateFireballs();
    checkPieces();
    checkDoor();
    draw();

    requestAnimationFrame(loop);
}

loop();
