// VARIABLES PRINCIPALES
const gameContainer = document.getElementById('gameContainer');
const zeus = document.getElementById('zeus');
const astronaut = document.getElementById('astronaut');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let zeusX = 0;
let zeusDirection = 1;
let astronautX = 360;
let lasers = [];
let score = 0;
let gameRunning = true;

let laserSpeed = 3;
let zeusSpeed = 2;
let laserInterval = 1500;

// ================================
// Fondo dinámico (estrellas)
// ================================
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'stars';
    star.style.left = Math.random() * 800 + 'px';
    star.style.top = Math.random() * 600 + 'px';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random()*2+2)+'s, '+(Math.random()*10+5)+'s';

    if (Math.random() > 0.8) {
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'];
        star.style.background = colors[Math.floor(Math.random()*colors.length)];
        star.style.boxShadow = `0 0 10px ${star.style.background}`;
    }

    gameContainer.appendChild(star);
}

// ================================
// Movimiento de Zeus
// ================================
function moveZeus() {
    if (!gameRunning) return;

    zeusX += zeusSpeed * zeusDirection;

    if (zeusX >= 700 || zeusX <= 0) {
        zeusDirection *= -1;
    }

    zeus.style.left = zeusX + 'px';
}

// ================================
// Disparar láser
// ================================
function shootLaser() {
    if (!gameRunning) return;

    const laser = document.createElement('div');
    laser.className = 'laser';

    if (Math.random() > 0.5) laser.classList.add('laser-green');
    else laser.classList.add('laser-red');

    laser.style.left = (zeusX + 45) + 'px';
    laser.style.top = '100px';
    laser.style.height = '0px';

    gameContainer.appendChild(laser);

    lasers.push({
        element: laser,
        x: zeusX + 45,
        y: 100,
        height: 0
    });
}

// ================================
// Actualización de láseres
// ================================
function updateLasers() {
    lasers = lasers.filter(laser => {
        laser.y += laserSpeed;
        laser.height += laserSpeed * 2;
        laser.element.style.top = laser.y + 'px';
        laser.element.style.height = laser.height + 'px';

        if (checkCollision(laser)) {
            endGame();
            return false;
        }

        if (laser.y > 600) {
            laser.element.remove();
            score += 10;
            scoreDisplay.textContent = "Puntos: " + score;

            // Premio de Virgo justo al alcanzar 200 puntos (solo una vez)
            if (score >= 200) {
                awardArtefact('virgo', 'Cetro de Virgo');
            }

            return false;
        }

        return true;
    });
}

// ================================
// Colisión
// ================================
function checkCollision(laser) {
    const astronautRect = {
        x: astronautX,
        y: 540,
        width: 60,
        height: 60
    };

    const laserRect = {
        x: laser.x - 3,
        y: laser.y,
        width: 6,
        height: laser.height
    };

    return (
        laserRect.x < astronautRect.x + astronautRect.width &&
        laserRect.x + laserRect.width > astronautRect.x &&
        laserRect.y < astronautRect.y + astronautRect.height &&
        laserRect.y + laserRect.height > astronautRect.y
    );
}

// ================================
// Movimiento del astronauta
// ================================
function moveAstronaut(direction) {
    if (!gameRunning) return;

    if (direction === 'left') astronautX = Math.max(0, astronautX - 30);
    if (direction === 'right') astronautX = Math.min(740, astronautX + 30);

    astronaut.style.left = astronautX + 'px';
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') moveAstronaut('left');
    if (e.key === 'ArrowRight') moveAstronaut('right');
});

leftBtn.addEventListener('click', () => moveAstronaut('left'));
rightBtn.addEventListener('click', () => moveAstronaut('right'));

// ================================
// Terminar juego
// ================================
function endGame() {
    gameRunning = false;
    lasers.forEach(l => l.element.remove());
    finalScoreDisplay.textContent = "Puntos: " + score;
    gameOverScreen.style.display = 'block';
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

// ================================
// Terminar juego (definición única)
// ================================
function endGame() {
    gameRunning = false;
    lasers.forEach(l => l.element.remove());
    finalScoreDisplay.textContent = "Puntos: " + score;
    gameOverScreen.style.display = 'block';
}

// ================================
// Reinicio
// ================================
restartBtn.addEventListener('click', () => {
    // Si endGame ya eliminó los elementos, solo necesitamos vaciar el array
    lasers = [];

    zeusX = 0;
    zeusDirection = 1;
    astronautX = 360;
    score = 0;
    gameRunning = true;

    laserSpeed = 3;
    zeusSpeed = 2;
    laserInterval = 1500;

    scoreDisplay.textContent = "Puntos: 0";
    astronaut.style.left = astronautX + 'px';
    zeus.style.left = zeusX + 'px';
    gameOverScreen.style.display = 'none';

    startLaserTimer();
});

// ================================
// Loop principal
// ================================
setInterval(() => {
    if (gameRunning) {
        moveZeus();
        updateLasers();
    }
}, 20);

// ================================
// Disparos periódicos
// ================================
let laserTimer;

function startLaserTimer() {
    if (laserTimer) clearInterval(laserTimer);

    laserTimer = setInterval(() => {
        if (!gameRunning) return;

        shootLaser();

        if (score > 50 && Math.random() > 0.6) setTimeout(shootLaser, 100);
        if (score > 150 && Math.random() > 0.7) setTimeout(shootLaser, 200);

    }, laserInterval);
}

startLaserTimer();

// ================================
// Aumento de dificultad
// ================================
setInterval(() => {
    if (!gameRunning) return;

    laserSpeed = Math.min(7, laserSpeed + 0.15);
    zeusSpeed = Math.min(5, zeusSpeed + 0.15);

    laserInterval = Math.max(400, laserInterval - 50);
    startLaserTimer();

}, 5000);