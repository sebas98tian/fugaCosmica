// ===============================
// VARIABLES PRINCIPALES
// ===============================
const player = document.getElementById("player");
const gameContainer = document.getElementById("gameContainer");
const healthFill = document.getElementById("healthFill");
const healthText = document.getElementById("healthText");
const hudWave = document.getElementById("wave");
const hudEnemies = document.getElementById("enemies");
const hudAccuracy = document.getElementById("accuracy");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

let playerHealth = 100;
let enemiesEliminated = 0;
let shotsFired = 0;
let shotsHit = 0;
let wave = 1;

let isGameOver = false;
let enemySpeed = 2;

const enemies = new Set();
const waters = new Set();

// NUEVAS VARIABLES PARA INTERVALOS Y SPAWN
let spawnIntervalId = null;
let waveIntervalId = null;
const spawnRateMs = 1200; // ajustar para dificultad

// ===============================
// MOVIMIENTO DEL JUGADOR
// ===============================
gameContainer.addEventListener("mousemove", (e) => {
    if (isGameOver) return;

    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;

    player.style.left = `${x - 40}px`;
});

// ===============================
// DISPAROS
// ===============================
gameContainer.addEventListener("click", (e) => {
    if (isGameOver) return;

    shotsFired++;

    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const water = document.createElement("div");
    water.classList.add("waterball");
    water.style.left = `${x - 10}px`;
    water.style.bottom = `100px`;

    gameContainer.appendChild(water);
    waters.add(water);
});

// ===============================
// SPAWN DE ENEMIGOS
// ===============================
function spawnEnemy() {
    if (isGameOver) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.textContent = "👾";

    enemy.style.top = "-60px";
    enemy.style.left = Math.random() * 850 + "px";

    gameContainer.appendChild(enemy);
    enemies.add(enemy);
}

// ===============================
// COLISIÓN
// ===============================
function isColliding(a, b) {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();

    return !(
        r1.right < r2.left ||
        r1.left > r2.right ||
        r1.bottom < r2.top ||
        r1.top > r2.bottom
    );
}

// ===============================
// LOOP
// ===============================
function gameLoop() {
    if (!isGameOver) {

        enemies.forEach(enemy => {
            let top = parseInt(enemy.style.top);
            enemy.style.top = `${top + enemySpeed}px`;

            if (top > 650) {
                enemy.remove();
                enemies.delete(enemy);
                damagePlayer(10);
            }
        });

        waters.forEach(water => {
            let bottom = parseInt(water.style.bottom);
            water.style.bottom = `${bottom + 12}px`;

            if (bottom > 700) {
                water.remove();
                waters.delete(water);
                return;
            }

            enemies.forEach(enemy => {
                if (isColliding(water, enemy)) {
                    shotsHit++;
                    enemiesEliminated++;
                    hudEnemies.textContent = enemiesEliminated;

                    enemy.remove();
                    water.remove();

                    enemies.delete(enemy);
                    waters.delete(water);
                }
            });
        });
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ===============================
// DAÑO
// ===============================
function damagePlayer(amount) {
    playerHealth -= amount;
    if (playerHealth < 0) playerHealth = 0;

    healthFill.style.width = `${playerHealth}%`;
    healthText.textContent = `${playerHealth} / 100`;

    if (playerHealth <= 0) endGame();
}

/* Función utilitaria para guardar/mostrar artefactos */
function awardArtefact(key, name) {
    const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (!gained[key]) {
        gained[key] = true;
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
        alert(`🏆 Artefacto obtenido: ${name}`);
    }
}

/* Oleadas: cuando llegue a la oleada 10, otorgar artefacto pero permitir seguir jugando */
waveIntervalId = setInterval(() => {
    if (!isGameOver) {
        wave++;
        hudWave.textContent = wave;
        enemySpeed += 0.25;

        if (wave === 10) {
            awardArtefact('libra', 'Balanza Dorada');
        }
    }
}, 6000);

// INICIAR SPAWN DE ENEMIGOS
spawnIntervalId = setInterval(() => {
    if (!isGameOver) spawnEnemy();
}, spawnRateMs);

// ===============================
// GAME OVER
// ===============================
function endGame() {
    isGameOver = true;

    // limpiar intervalos para detener spawn/oleadas
    if (spawnIntervalId) clearInterval(spawnIntervalId);
    if (waveIntervalId) clearInterval(waveIntervalId);

    const accuracy = shotsFired === 0 ? 0 : Math.round((shotsHit / shotsFired) * 100);

    finalScore.textContent = `Oleada: ${wave} | Eliminados: ${enemiesEliminated} | Precisión: ${accuracy}%`;

    gameOverScreen.style.display = "block";
}

// ===============================
// REINICIAR
// ===============================
restartBtn.addEventListener("click", () => {
    location.reload();
});
