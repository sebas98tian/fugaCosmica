document.addEventListener('DOMContentLoaded', () => {
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

    const ARTEFACT_EMOJI_MAP = {
        'sagitario': '🏹',   
        'capricornio': '🔱',  
        'acuario': '🏺',     
        'piscis': '🐟'        
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
    setupModal(sagitarioButton, sagitarioModal, sagitarioExitButton, sagitarioContinue);
    setupModal(capricornioButton, capricornioModal, capricornioExitButton, capricornioContinue);
    setupModal(acuarioButton, acuarioModal, acuarioExitButton, acuarioContinue);
    setupModal(piscisButton, piscisModal, piscisExitButton, piscisContinue);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [sagitarioModal, capricornioModal, acuarioModal, piscisModal].forEach(m => {
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