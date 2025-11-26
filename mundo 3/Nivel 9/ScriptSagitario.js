const game = document.getElementById('game');
const restartBtn = document.getElementById('restartBtn');
const livesDisplay = document.getElementById('lives');

let cardsArray = [];
let flipped = [];
let matched = [];
let maxFails = 2; // número máximo de fallos permitidos
let fails = 0;

// Función para actualizar vidas
function updateLives() {
    livesDisplay.textContent = `Vidas: ${maxFails - fails + 1}`;
}

// Función para inicializar el juego
function initGame() {
    game.innerHTML = '';
    flipped = [];
    matched = [];
    fails = 0;
    updateLives();

    const images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg']; // reemplaza con tus imágenes
    cardsArray = [...images, ...images];
    cardsArray.sort(() => Math.random() - 0.5);

    cardsArray.forEach((img, i) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = i;

        const imageElement = document.createElement('img');
        imageElement.src = img;
        card.appendChild(imageElement);

        game.appendChild(card);

        card.addEventListener('click', () => flipCard(card));
    });

    // Mostrar cartas 3 segundos al inicio
    document.querySelectorAll('.card img').forEach(img => img.style.display = 'block');
    setTimeout(() => {
        document.querySelectorAll('.card img').forEach(img => img.style.display = 'none');
    }, 3000);
}

// Voltear carta
function flipCard(card) {
    if (flipped.length >= 2 || matched.includes(card.dataset.index) || card.querySelector('img').style.display === 'block') return;

    const img = card.querySelector('img');
    img.style.display = 'block';
    flipped.push(card);

    if (flipped.length === 2) checkMatch();
}

// Comprobar pareja
function checkMatch() {
    const [c1, c2] = flipped;
    const img1 = c1.querySelector('img').src;
    const img2 = c2.querySelector('img').src;

    if (img1 === img2) {
        matched.push(c1.dataset.index, c2.dataset.index);
        flipped = [];
        if (matched.length === cardsArray.length) {
            setTimeout(() => {
                alert('🏆 ¡GANASTE!');

                // Guardar artefacto de Sagitario en localStorage (misma estructura que otros niveles)
                const gained = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
                if (!gained['sagitario']) {
                    gained['sagitario'] = true;
                    localStorage.setItem('gainedArtefacts', JSON.stringify(gained));
                    alert('¡Has obtenido el Artefacto de Sagitario: Arco Cósmico! 🏹');
                }

                // Actualizar inventario en Mundo si está abierto (MundoIndex3)
                const slot = document.getElementById('sagitario-artefact');
                if (slot) {
                    slot.classList.add('unlocked');
                    slot.textContent = '🏹';
                    slot.setAttribute('title', 'Artefacto Ganado: Arco Cósmico');
                }
            }, 100);
        }
    } else {
        fails++;
        updateLives();
        setTimeout(() => {
            c1.querySelector('img').style.display = 'none';
            c2.querySelector('img').style.display = 'none';
            flipped = [];
            if (fails > maxFails) setTimeout(() => { alert('💥 PERDISTE'); initGame(); }, 100);
        }, 500);
    }
}

// Botón reiniciar
restartBtn.addEventListener('click', initGame);

// Iniciar juego al cargar
initGame();
