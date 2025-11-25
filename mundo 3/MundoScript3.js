document.addEventListener('DOMContentLoaded', () => {
    // ===========================================
    // *** SELECTORES DOM (Mundo 3: niveles 9-12) ***
    // ===========================================
    const sagitarioButton = document.querySelector('.level-emoji.sagitario');
    const sagitarioModal = document.getElementById('modal-container-sagitario');
    const sagitarioExitButton = document.getElementById('modal-exit-sagitario');
    const sagitarioContinue = document.getElementById('modal-continue-sagitario');

    const capricornioButton = document.querySelector('.level-emoji.capricornio');
    const capricornioModal = document.getElementById('modal-container-capricornio');
    const capricornioExitButton = document.getElementById('modal-exit-capricornio');
    const capricornioContinue = document.getElementById('modal-continue-capricornio');

    const acuarioButton = document.querySelector('.level-emoji.acuario');
    const acuarioModal = document.getElementById('modal-container-acuario');
    const acuarioExitButton = document.getElementById('modal-exit-acuario');
    const acuarioContinue = document.getElementById('modal-continue-acuario');

    const piscisButton = document.querySelector('.level-emoji.piscis');
    const piscisModal = document.getElementById('modal-container-piscis');
    const piscisExitButton = document.getElementById('modal-exit-piscis');
    const piscisContinue = document.getElementById('modal-continue-piscis');

    // ===========================================
    // *** CONFIGURACIÓN DEL JUEGO Y ARTEFACTOS ***
    // ===========================================

    // Mapa de emojis para los artefactos de Mundo 3.
    const ARTEFACT_EMOJI_MAP = {
        'sagitario': '🏹',    // Arco de Sagitario
        'capricornio': '🔱',  // Tridente de Capricornio
        'acuario': '🏺',      // Jarra de Acuario
        'piscis': '🐟'        // Peces de Piscis
    };

    // ===========================================
    // *** UTILIDADES DE MODALES (Mismas que Mundo 2) ***
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

    // Aplicar la lógica modular a cada nivel (9, 10, 11, 12)
    setupModal(sagitarioButton, sagitarioModal, sagitarioExitButton, sagitarioContinue);
    setupModal(capricornioButton, capricornioModal, capricornioExitButton, capricornioContinue);
    setupModal(acuarioButton, acuarioModal, acuarioExitButton, acuarioContinue);
    setupModal(piscisButton, piscisModal, piscisExitButton, piscisContinue);


    // Cerrar todos con Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [sagitarioModal, capricornioModal, acuarioModal, piscisModal].forEach(m => {
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