
const gameGrid = document.getElementById('game-grid'); 
const startButton = document.getElementById('start-button'); 
const scoreDisplay = document.getElementById('score'); 
const livesDisplay = document.getElementById('lives'); 
const messageDisplay = document.getElementById('message'); 
const rewardContainer = document.getElementById('reward-message-container'); 

let score = 0;
let lives = 3;
let lastCell = -1; 
let gameInterval; 
let currentActiveCell = null; 
let isGameRunning = false;
let artefactGained = false;


const NUM_CELLS = 9;
const ARIES_SYMBOL = '♈';
const REWARD_SCORE = 10; 
const SPEED_LEVELS = [5, 10, 15, 20]; 
const BASE_DURATION = 1000;
const BASE_INTERVAL = 1500; 
let currentDuration = BASE_DURATION; 
let currentInterval = BASE_INTERVAL;


function createGrid() {
    gameGrid.innerHTML = ''; 
    
    for (let i = 0; i < NUM_CELLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i); 
        gameGrid.appendChild(cell);
    }
}
function chooseRandomCell() {
    const cells = document.querySelectorAll('.cell'); 
    let newCellIndex;
    
    do {
        newCellIndex = Math.floor(Math.random() * NUM_CELLS);
    } while (newCellIndex === lastCell);

    lastCell = newCellIndex;
    return cells[newCellIndex];
}

function showAries() {
    if (currentActiveCell) {
        missAries(true); 
    }

    const newCell = chooseRandomCell();
    currentActiveCell = newCell;
    newCell.textContent = ARIES_SYMBOL;
    newCell.classList.add('active-cell');

    newCell.timer = setTimeout(() => {
        missAries(true); 
    }, currentDuration);
}

function hitAries() {
    if (currentActiveCell) {
        clearTimeout(currentActiveCell.timer); 
        currentActiveCell.textContent = '';
        currentActiveCell.classList.remove('active-cell');
        currentActiveCell = null;
    }
    
    score++;
    scoreDisplay.textContent = score;
    messageDisplay.textContent = '¡Impulso acertado! +1 punto.';
    
    upgradeDifficulty();

    if (score >= REWARD_SCORE && !artefactGained) {
        winArtefact();
    }
    
    clearInterval(gameInterval);
    gameInterval = setInterval(showAries, currentInterval);
}

function missAries(isTimeout = false) {
    if (!isGameRunning) return; 

    if (currentActiveCell) {
        clearTimeout(currentActiveCell.timer); 
        currentActiveCell.textContent = ''; 
        currentActiveCell.classList.remove('active-cell'); 
        currentActiveCell = null;
    }
    
    lives--;
    livesDisplay.textContent = lives;
    messageDisplay.textContent = isTimeout ? 
        '¡Demasiado lento! Has perdido una vida.' : 
        '¡Fallo! Has perdido una vida.';

    if (lives <= 0) {
        endGame();
    }
    
    if (isGameRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(showAries, currentInterval);
    }
}


function upgradeDifficulty() {
    if (SPEED_LEVELS.includes(score)) {
        currentDuration = Math.max(200, currentDuration - 100); 
        currentInterval = Math.max(500, currentInterval - 150);  
        
        clearInterval(gameInterval);
        gameInterval = setInterval(showAries, currentInterval);
        
        messageDisplay.textContent += ` ¡Dificultad aumentada! Velocidad: ${currentDuration}ms.`;
    }
}

function winArtefact() {
    artefactGained = true; 
    
    let gainedArtefacts = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    gainedArtefacts.aries = true; 
    localStorage.setItem('gainedArtefacts', JSON.stringify(gainedArtefacts));

    const rewardElement = document.createElement('p');
    rewardElement.id = 'reward';
    rewardElement.textContent = '🔱'; 
    rewardContainer.appendChild(rewardElement);
    
    messageDisplay.textContent = "¡Felicitaciones! Has ganado el Yelmo de Bronce de Aries. ¡Continúa!";
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval); 
    startButton.textContent = 'Jugar de Nuevo';
    startButton.classList.remove('hidden'); 
    
    messageDisplay.textContent = `Juego Terminado. Puntuación Final: ${score}.`;
    
    if (currentActiveCell) {
        clearTimeout(currentActiveCell.timer); 
        currentActiveCell.textContent = '';
        currentActiveCell.classList.remove('active-cell');
        currentActiveCell = null;
    }
}


function startGame() {
    score = 0;
    lives = 3;
    currentDuration = BASE_DURATION; 
    currentInterval = BASE_INTERVAL;
    isGameRunning = true;
    
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    messageDisplay.textContent = '¡El juego ha comenzado! Busca el símbolo...';
    startButton.classList.add('hidden'); 
    
    rewardContainer.innerHTML = ''; 

    gameInterval = setInterval(showAries, currentInterval);
    
    showAries();
}

document.addEventListener('DOMContentLoaded', () => {
    createGrid(); 
    
    startButton.addEventListener('click', () => {
        if (!isGameRunning) {
            startGame();
        }
    });
    
    gameGrid.addEventListener('click', (event) => {
        if (!isGameRunning) return;

        const clickedCell = event.target;

        if (clickedCell.classList.contains('cell')) {
            if (clickedCell === currentActiveCell) {
                hitAries();
            } else {
                missAries(false); 
            }
        }
    });
});