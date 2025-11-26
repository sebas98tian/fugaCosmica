const board = document.getElementById("board");
const reiniciar = document.getElementById("reiniciar");
const scoreDisplay = document.getElementById("score");
const artifactMessage = document.getElementById("artifact-message");
let tiles = [];
let score = 0;
const ARTIFACT_THRESHOLD = 2;

function generarTablero() {
    do {
        
        tiles = [1,2,3,4,5,6,7,8,null].sort(()=>Math.random()-0.5);
    } while (!esSoluble(tiles) || estaResuelto(tiles));
    dibujar();
}


function esSoluble(arr) {
    let inversions = 0;
    const puzzleArray = arr.filter(v => v !== null); 

    for (let i = 0; i < puzzleArray.length; i++) {
        for (let j = i + 1; j < puzzleArray.length; j++) {
            if (puzzleArray[i] > puzzleArray[j]) {
                inversions++;
            }
        }
    }
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
            div.onclick = () => mover(i);
        }
        board.appendChild(div);
    });
}

function mover(i) {
    const empty = tiles.indexOf(null);
    const validMoves = [
        i-3, i+3, 
        i-1, i+1  
    ].filter(n =>
        n >= 0 && n < 9 &&
        !(i % 3 === 0 && n === i-1) && 
        !(i % 3 === 2 && n === i+1)    
    );

    if(validMoves.includes(empty)) {
        [tiles[i], tiles[empty]] = [tiles[empty], tiles[i]];
        dibujar();
        
        if(estaResuelto(tiles)) {
            manejarVictoria();
        }
    }
}

function estaResuelto(arr){
    return JSON.stringify(arr) === JSON.stringify([1,2,3,4,5,6,7,8,null]);
}

function manejarVictoria() {
    score++;
    scoreDisplay.textContent = score;
    
    let message = "¡Victoria! Tauro domina la paciencia.";
    if (score >= ARTIFACT_THRESHOLD) {
        message += " ¡Has ganado el Artefacto Tauro!";
        artifactMessage.textContent = "¡Artefacto de Tauro Obtenido! 🎉";
        const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
        gained['tauro'] = true;
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
    } else {
        artifactMessage.textContent = "";
    }

    setTimeout(()=> {
        alert(message);
        generarTablero(); 
    }, 100);
}

reiniciar.onclick = generarTablero;

(function initFromStorage() {
    const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (gained['tauro']) {
        score = ARTIFACT_THRESHOLD;
        scoreDisplay.textContent = score;
        artifactMessage.textContent = "¡Artefacto de Tauro Obtenido! 🎉";
    }
})();

reiniciar.addEventListener('click', () => {
    const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (gained['tauro']) {
        delete gained['tauro'];
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
    }
    score = 0;
    scoreDisplay.textContent = score;
    artifactMessage.textContent = "";
});

generarTablero();