document.addEventListener('DOMContentLoaded', () => {
    // ===========================================
    // *** SELECTORES DOM ***
    // ===========================================
    const ariesButton = document.querySelector('.level-emoji.aries');
    const modalContainer = document.getElementById('modal-container');
    const modalExitButton = document.getElementById('modal-exit');
    
    const taurusButton = document.querySelector('.level-emoji.taurus');
    const taurusModal = document.getElementById('modal-container-tauro');
    const taurusExitButton = document.getElementById('modal-exit-tauro');
    
    // ELIMINADO: const aresEventButton = document.getElementById('ares-event-button'); 

    // ===========================================
    // *** CONFIGURACIÓN DEL JUEGO Y ARTEFACTOS ***
    // ===========================================
    
    // Mapa de emojis para los artefactos.
    const ARTEFACT_EMOJI_MAP = {
        'aries': '🔱',      // Yelmo de Bronce
        'tauro': '🐮',      
        'geminis': '♊',    
        'cancer': '♋',     
        // Añade el resto de los signos aquí.
    };

    // ELIMINADO: Variables de Lógica de Ares (SPAWN_INTERVAL, MOVE_INTERVAL, DECAY_TIME, aresSpawnTimer, etc.)

    // ===========================================
    // *** LÓGICA DE VENTANA MODAL ***
    // ===========================================

    // 1. Mostrar la modal al hacer clic en Aries
    if (ariesButton && modalContainer) {
        ariesButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            modalContainer.classList.remove('hidden');
        });
    }

    // 2. Ocultar la modal al hacer clic en 'Salir'
    if (modalExitButton && modalContainer) {
        modalExitButton.addEventListener('click', () => {
            modalContainer.classList.add('hidden');
        });
    }
    
    // 3. Opcional: Ocultar la modal al hacer clic fuera del contenido
    if (modalContainer) {
        modalContainer.addEventListener('click', (event) => {
            if (event.target === modalContainer) {
                modalContainer.classList.add('hidden');
            }
        });
    }

    // Mostrar la modal al hacer clic en Tauro
    if (taurusButton && taurusModal) {
        taurusButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            taurusModal.classList.remove('hidden'); // Asegúrate de que el ID del modal sea correcto
        });
    }

    // Ocultar la modal al hacer clic en 'Salir'
    if (taurusExitButton && taurusModal) {
        taurusExitButton.addEventListener('click', () => {
            taurusModal.classList.add('hidden');
        });
    }

    // Ocultar la modal al hacer clic fuera del contenido
    if (taurusModal) {
        taurusModal.addEventListener('click', (event) => {
            if (event.target === taurusModal) {
                taurusModal.classList.add('hidden');
            }
        });
    }

    // ===========================================
    // *** LÓGICA DEL INVENTARIO Y ARTEFACTOS ***
    // ===========================================
    
    function loadArtefacts() {
        // Obtiene la lista de artefactos ganados desde localStorage
        const gainedArtefacts = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
        const slots = document.querySelectorAll('.artefact-slot');

        slots.forEach(slot => {
            const artefactKey = slot.id.replace('-artefact', '');

            if (gainedArtefacts[artefactKey]) {
                slot.classList.add('unlocked');
                slot.textContent = ARTEFACT_EMOJI_MAP[artefactKey] || '✨';
                slot.setAttribute('title', `Artefacto Ganado: ${slot.dataset.artefact}`);
            } else {
                slot.classList.remove('unlocked');
                slot.textContent = '';
                slot.setAttribute('title', `Bloqueado: ${slot.dataset.artefact}`);
            }
        });
    }
    loadArtefacts(); 

});