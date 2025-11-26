document.addEventListener('DOMContentLoaded', () => {
    // ===========================================
    // *** SELECTORES DOM (Mundo 1: niveles 1-4) ***
    // ===========================================
    // Nivel 1: Aries (Usando ID consistente)
    const ariesButton = document.querySelector('.level-emoji.aries');
    const ariesModal = document.getElementById('modal-container-aries'); 
    const ariesExitButton = document.getElementById('modal-exit-aries');
    const ariesContinue = document.getElementById('modal-continue-aries');
    
    // Nivel 2: Tauro
    const taurusButton = document.querySelector('.level-emoji.taurus');
    const taurusModal = document.getElementById('modal-container-tauro');
    const taurusExitButton = document.getElementById('modal-exit-tauro');
    const taurusContinue = document.getElementById('modal-continue-tauro');

    // Nivel 3: Géminis
    const geminisButton = document.querySelector('.level-emoji.gemini');
    const geminisModal = document.getElementById('modal-container-geminis');
    const geminisExitButton = document.getElementById('modal-exit-geminis');
    const geminisContinue = document.getElementById('modal-continue-geminis');
    
    // Nivel 4: Cáncer
    const cancerButton = document.querySelector('.level-emoji.cancer');
    const cancerModal = document.getElementById('modal-container-cancer');
    const cancerExitButton = document.getElementById('modal-exit-cancer');
    const cancerContinue = document.getElementById('modal-continue-cancer');

    // ===========================================
    // *** CONFIGURACIÓN DEL JUEGO Y ARTEFACTOS ***
    // ===========================================
    
    // Mapa de emojis para los artefactos.
    const ARTEFACT_EMOJI_MAP = {
        'aries': '🔱',      // Yelmo de Bronce
        'tauro': '🐮',      // Toro Dorado
        'geminis': '🎻',    // Lira de los Gemelos
        'cancer': '🐐'     // Caparazón Lunar
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
    setupModal(ariesButton, ariesModal, ariesExitButton, ariesContinue);
    setupModal(taurusButton, taurusModal, taurusExitButton, taurusContinue);
    setupModal(geminisButton, geminisModal, geminisExitButton, geminisContinue);
    setupModal(cancerButton, cancerModal, cancerExitButton, cancerContinue);

    // Cerrar todos con Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [ariesModal, taurusModal, geminisModal, cancerModal].forEach(m => {
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

    // Nuevo: borrar artefactos guardados y refrescar UI (mismo comportamiento que Mundo 2)
    function clearArtefacts() {
        if (!confirm('¿Seguro que quieres eliminar todos los artefactos guardados? Esto te obligará a volver a ganar cada uno.')) return;
        localStorage.removeItem('gainedArtefacts');
        loadArtefacts();
        alert('Artefactos restablecidos. Debes volver a ganarlos.');
    }

    // Inicializar (ya estaba en el script — asegurarse que loadArtefacts se llame)
    loadArtefacts();

    // Conectar el botón de restablecer si existe
    const resetBtn = document.getElementById('reset-artefacts');
    if (resetBtn) resetBtn.addEventListener('click', clearArtefacts);
});