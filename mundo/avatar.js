document.addEventListener('DOMContentLoaded', () => {
    const storedName = localStorage.getItem('name_img') || 'av1';
    const candidates = [
        `/assets/img/${storedName}.png`,  
        `../assets/img/${storedName}.png`, 
        `../../assets/img/${storedName}.png`,
        `assets/img/${storedName}.png`     
    ];

    const avatars = document.querySelectorAll('.player-avatar');
    avatars.forEach(img => {
        img.alt = storedName;

        let idx = 0;
        const tryLoad = () => {
            if (idx >= candidates.length) {
          
                img.src = candidates[0];
                return;
            }
            img.src = candidates[idx];
            
            img.onerror = () => {
                idx++;
                tryLoad();
            };
    
            img.onload = () => {
                img.onerror = null;
            };
        };

        tryLoad();
    });
});
