document.addEventListener('DOMContentLoaded', () => {
    const storedName = localStorage.getItem('name_img') || 'av1';

    // Rutas candidatas (intenta varias rutas relativas/absolutas)
    const candidates = [
        `/assets/img/${storedName}.png`,   // raíz del servidor
        `../assets/img/${storedName}.png`, // una carpeta arriba
        `../../assets/img/${storedName}.png`,
        `assets/img/${storedName}.png`      // relativa sin slash
    ];

    const avatars = document.querySelectorAll('.player-avatar');
    avatars.forEach(img => {
        img.alt = storedName;

        let idx = 0;
        const tryLoad = () => {
            if (idx >= candidates.length) {
                // último recurso: colocar el primer candidato aunque falle
                img.src = candidates[0];
                return;
            }
            img.src = candidates[idx];
            // Si falla la carga, intenta la siguiente ruta
            img.onerror = () => {
                idx++;
                tryLoad();
            };
            // Si carga bien, remover el handler de error
            img.onload = () => {
                img.onerror = null;
            };
        };

        tryLoad();
    });
});
