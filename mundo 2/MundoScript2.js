document.addEventListener('DOMContentLoaded', () => {
    // ===========================================
    // *** SELECTORES DOM (Mundo 2: niveles 5-8) ***
    // ===========================================
    const leoButton = document.querySelector('.level-emoji.leo');
    const leoModal = document.getElementById('modal-container-leo');
    const leoExitButton = document.getElementById('modal-exit-leo');
    const leoContinue = document.getElementById('modal-continue-leo');

    const virgoButton = document.querySelector('.level-emoji.virgo');
    const virgoModal = document.getElementById('modal-container-virgo');
    const virgoExitButton = document.getElementById('modal-exit-virgo');
    const virgoContinue = document.getElementById('modal-continue-virgo');

    const libraButton = document.querySelector('.level-emoji.libra');
    const libraModal = document.getElementById('modal-container-libra');
    const libraExitButton = document.getElementById('modal-exit-libra');
    const libraContinue = document.getElementById('modal-continue-libra');

    const escorpioButton = document.querySelector('.level-emoji.escorpio');
    const escorpioModal = document.getElementById('modal-container-escorpio');
    const escorpioExitButton = document.getElementById('modal-exit-escorpio');
    const escorpioContinue = document.getElementById('modal-continue-escorpio');

    // ===========================================
    // *** CONFIGURACIÓN DEL JUEGO Y ARTEFACTOS ***
    // ===========================================

    // Mapa de emojis para los artefactos de Mundo 2.
    const ARTEFACT_EMOJI_MAP = {
        'leo': '🦁',        // Usando un emoji más representativo para Leo
        'virgo': '🌾',      // Usando un emoji más representativo para Virgo
        'libra': '⚖️',      // Usando un emoji más representativo para Libra
        'escorpio': '🦂'    // Usando un emoji más representativo para Escorpio
    };

    // ===========================================
    // *** UTILIDADES DE MODALES ***
    // ===========================================

    function openModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.remove('hidden');
    }

    function closeModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.add('hidden');
    }

    /**
     * Configura los eventos de click para abrir, cerrar y continuar un modal.
     * @param {HTMLElement} button - Botón de nivel que abre el modal.
     * @param {HTMLElement} modal - Elemento contenedor del modal.
     * @param {HTMLElement} exitButton - Botón de 'Salir' o 'Cerrar' dentro del modal.
     * @param {HTMLElement} continueButton - Botón de 'Seguir' o 'Continuar' (navegación).
     */
    function setupModal(button, modal, exitButton, continueButton) {
        // 1. Abrir el modal
        if (button && modal) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                openModal(modal);
            });
        }
        // 2. Cerrar con el botón de Salir
        if (exitButton && modal) {
            exitButton.addEventListener('click', () => {
                closeModal(modal);
            });
        }
        // 3. Cerrar al hacer click fuera
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) closeModal(modal);
            });
        }
        // 4. Cerrar con el botón de Continuar (antes de navegar)
        if (continueButton && modal) {
            continueButton.addEventListener('click', () => closeModal(modal));
        }
    }

    // ===========================================
    // *** LÓGICA DE VENTANA MODAL (Aplicación) ***
    // ===========================================

    // Aplicar la lógica modular a cada nivel
    setupModal(leoButton, leoModal, leoExitButton, leoContinue);
    setupModal(virgoButton, virgoModal, virgoExitButton, virgoContinue);
    setupModal(libraButton, libraModal, libraExitButton, libraContinue);
    setupModal(escorpioButton, escorpioModal, escorpioExitButton, escorpioContinue);


    // Cerrar todos con Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [leoModal, virgoModal, libraModal, escorpioModal].forEach(m => {
                if (m) closeModal(m);
            });
        }
    });

    // ===========================================
    // *** LÓGICA DEL INVENTARIO Y ARTEFACTOS ***
    // ===========================================

    function loadArtefacts() {
        const gainedArtefacts = JSON.parse(localStorage.getItem('gainedArtefacts')) || {};
        const slots = document.querySelectorAll('.artefact-slot');

        slots.forEach(slot => {
            const artefactKey = slot.id.replace('-artefact', '');

            if (gainedArtefacts[artefactKey]) {
                slot.classList.add('unlocked');
                slot.textContent = ARTEFACT_EMOJI_MAP[artefactKey] || '✨';
                slot.setAttribute('title', `Artefacto Ganado: ${slot.dataset.artefact}`);

                // Mostrar el artefacto en el mundo si ya ha sido ganado
                const artefactWorldElement = document.getElementById(`${artefactKey}-artefact-world`);
                if (artefactWorldElement) {
                    artefactWorldElement.classList.remove('hidden');
                }
            } else {
                slot.classList.remove('unlocked');
                slot.textContent = '';
                slot.setAttribute('title', `Bloqueado: ${slot.dataset.artefact}`);
            }
        });
    }

    // Inicializar
    loadArtefacts();
});