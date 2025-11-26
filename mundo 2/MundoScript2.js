document.addEventListener('DOMContentLoaded', () => {
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

    const ARTEFACT_EMOJI_MAP = {
        'leo': '🦁',       
        'virgo': '🌾',     
        'libra': '⚖️',    
        'escorpio': '🦂'   
    };

    function openModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.remove('hidden');
    }

    function closeModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.add('hidden');
    }

    function setupModal(button, modal, exitButton, continueButton) {
        if (button && modal) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                openModal(modal);
            });
        }
        if (exitButton && modal) {
            exitButton.addEventListener('click', () => {
                closeModal(modal);
            });
        }
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) closeModal(modal);
            });
        }
        if (continueButton && modal) {
            continueButton.addEventListener('click', () => closeModal(modal));
        }
    }

    setupModal(leoButton, leoModal, leoExitButton, leoContinue);
    setupModal(virgoButton, virgoModal, virgoExitButton, virgoContinue);
    setupModal(libraButton, libraModal, libraExitButton, libraContinue);
    setupModal(escorpioButton, escorpioModal, escorpioExitButton, escorpioContinue);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [leoModal, virgoModal, libraModal, escorpioModal].forEach(m => {
                if (m) closeModal(m);
            });
        }
    });

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
                const artefactWorldElement = document.getElementById(`${artefactKey}-artefact-world`);
                if (artefactWorldElement) {
                    artefactWorldElement.classList.add('hidden');
                }
            }
        });
    }

    function clearArtefacts() {
        if (!confirm('¿Seguro que quieres eliminar todos los artefactos guardados? Esto te obligará a volver a ganar cada uno.')) return;
        localStorage.removeItem('gainedArtefacts');
        loadArtefacts();
        alert('Artefactos restablecidos. Debes volver a ganarlos.');
    }

    loadArtefacts();
    const resetBtn = document.getElementById('reset-artefacts');
    if (resetBtn) resetBtn.addEventListener('click', clearArtefacts);
});