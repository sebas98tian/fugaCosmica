// Guardar volumen
const musica = document.getElementById('musica');
musica.volume = localStorage.getItem('volumen') || 0.5;

musica.addEventListener('volumechange', () => {
  localStorage.setItem('volumen', musica.volume);
});
