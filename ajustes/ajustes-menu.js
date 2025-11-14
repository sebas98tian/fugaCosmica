
const musica = document.getElementById('musica');

// Recuperar volumen guardado o usar 0.5
musica.volume = localStorage.getItem('volumen') || 0.5;

// Recuperar si estaba silenciado
musica.muted = localStorage.getItem('muted') === "true" ? true : false;

// Guardar cambios de volumen y mute
musica.addEventListener('volumechange', () => {
  localStorage.setItem('volumen', musica.volume);
  localStorage.setItem('muted', musica.muted);
});
