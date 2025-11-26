const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');



const imagesSrc = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg'];
let puzzleOrder = [];
let currentPuzzle = 0;
let pieces = [];
let dragging = null;
let offsetX = 0, offsetY = 0;

// ==================
// Seleccionar imágenes
// ==================
function selectImages() {
    let shuffled = [...imagesSrc].sort(() => Math.random() - 0.5);
    // Seleccionar 3 imágenes para el juego
    puzzleOrder = shuffled.slice(0, 3); 
}

// ==================
// Dividir imagen en piezas
// ==================
function sliceImage(img) {
    const cols = 4;
    const rows = 2;
    const pieceWidth = Math.floor(img.width / cols);
    const pieceHeight = Math.floor(img.height / rows);
    const tempPieces = [];
    // Posición del rompecabezas ensamblado (cuadrícula)
    const startX = 50; 
    const startY = 50;
    const spacing = 0;

    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            tempPieces.push({
                img: img,
                sx: c*pieceWidth,
                sy: r*pieceHeight,
                sw: pieceWidth,
                sh: pieceHeight,
                // Posición inicial aleatoria para la pieza (dentro del canvas)
                dx: Math.random()*(canvas.width-pieceWidth),
                dy: Math.random()*(canvas.height-pieceHeight),
                dw: pieceWidth,
                dh: pieceHeight,
                // Posición correcta para ensamblar
                correctX: startX + c*(pieceWidth + spacing),
                correctY: startY + r*(pieceHeight + spacing),
                assembled: false
            });
        }
    }

    // Mezclar piezas
    for (let i = tempPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempPieces[i], tempPieces[j]] = [tempPieces[j], tempPieces[i]];
    }

    return tempPieces;
}

// ==================
// Cargar puzzle
// ==================
function loadPuzzle() {
    pieces = [];
    const img = new Image();
    img.src = puzzleOrder[currentPuzzle];
    img.onload = () => {
        pieces = sliceImage(img);
        draw();
    }
}

// ==================
// Dibujar grid (marco donde van las piezas)
// ==================
function drawGrid() {
    if(pieces.length === 0) return;
    const cols = 4;
    const rows = 2;
    const startX = 50;
    const startY = 50;
    const spacing = 0;
    const pieceWidth = pieces[0].dw;
    const pieceHeight = pieces[0].dh;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            ctx.strokeRect(startX + c*(pieceWidth+spacing),
                           startY + r*(pieceHeight+spacing),
                           pieceWidth, pieceHeight);
        }
    }
}

// ==================
// Dibujar piezas
// ==================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    pieces.forEach(p => {
        ctx.drawImage(p.img, p.sx, p.sy, p.sw, p.sh, p.dx, p.dy, p.dw, p.dh);
    });
}

// ==================
// Acoplar piezas (Snap)
// ==================
function snapPiece(piece) {
    const snapTolerance = 20; // Distancia máxima para acoplar
    const distX = Math.abs(piece.dx - piece.correctX);
    const distY = Math.abs(piece.dy - piece.correctY);
    if(distX < snapTolerance && distY < snapTolerance) {
        piece.dx = piece.correctX;
        piece.dy = piece.correctY;
        piece.assembled = true;
    }
}

// ==================
// Eventos de mouse
// ==================
canvas.addEventListener('mousedown', (e) => {
    const mx = e.offsetX;
    const my = e.offsetY;
    // Buscar la pieza clickeada de atrás hacia adelante para priorizar las de encima
    for(let i=pieces.length-1; i>=0; i--) {
        const p = pieces[i];
        if(mx>p.dx && mx<p.dx+p.dw && my>p.dy && my<p.dy+p.dh) {
            dragging = p;
            offsetX = mx - p.dx;
            offsetY = my - p.dy;
            // Mover la pieza arrastrada al final del array para dibujarla encima
            pieces.push(pieces.splice(i,1)[0]); 
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if(dragging) {
        dragging.dx = e.offsetX - offsetX;
        dragging.dy = e.offsetY - offsetY;
        draw();
    }
});

canvas.addEventListener('mouseup', (e) => {
    if(dragging) {
        snapPiece(dragging);
        dragging = null;
        draw();
        
        // Verificar si todas las piezas están ensambladas
        if(pieces.every(p => p.assembled)) {
            // Si es la primera imagen (currentPuzzle === 0), otorgar artefacto piscis
            if (currentPuzzle === 0) {
                awardPiscis();
            }

            currentPuzzle++;
            if(currentPuzzle >= puzzleOrder.length) {
                // Fin del juego (sigue mostrando victoria pero no impide seguir jugando si se reinicia)
                setTimeout(() => alert("🏆 ¡GANASTE! Armando las 3 imágenes"), 100);
            } else {
                // Siguiente puzzle
                alert(`✔ Completaste la imagen ${currentPuzzle}, siguiente imagen`);
                loadPuzzle();
            }
        }
    }
});

// ==================
// Premio de artefacto (Piscis) al completar la primera imagen
// ==================
function awardPiscis() {
    const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
    if (!gained['piscis']) {
        gained['piscis'] = true;
        localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
        alert('🏆 Artefacto obtenido: Par de Peces (Piscis)');

        // Intentar actualizar la UI del Mundo 3 si está abierta
        try {
            const docs = [window.opener?.document, window.parent?.document, document];
            for (const d of docs) {
                if (!d) continue;
                const slot = d.getElementById('piscis-artefact');
                if (slot) {
                    slot.classList.add('unlocked');
                    slot.textContent = '🐟';
                    slot.setAttribute('title', 'Artefacto Ganado: Par de Peces');
                    break;
                }
            }
        } catch (e) {
            // silencioso si no se puede acceder a otra ventana
        }
    }
}

// ==================
// Iniciar juego
// ==================
function startGame() {
    currentPuzzle = 0;
    selectImages();
    loadPuzzle();
}

restartBtn.addEventListener('click', () => {
    startGame();
});

startGame();