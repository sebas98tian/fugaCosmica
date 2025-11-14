let sound_vol=document.getElementById("sound-vol")
let music_vol=document.getElementById("music-vol")
let music_span=document.getElementById("span-music-vol")
let span_vol=document.getElementById("span-vol")

// ==================================================================================0

const music_toggle = document.getElementById('music_toggle');

// Recuperar estado guardado
let volumen = localStorage.getItem('volumen') || 50;
let muted = localStorage.getItem('muted') === "true";

// Inicializar controles
music_vol.value = volumen;
music_span.textContent = `${volumen}%`;
music_toggle.checked = !muted;



// ===================================================================================
sound_vol.addEventListener("input",()=>{
    span_vol.textContent=`${sound_vol.value}%`
    const audio = document.getElementById('musica');
  if(audio){
    audio.volume = music_vol.value / 100;
    localStorage.setItem('volumen', music_vol.value);
    music_span.textContent = `${music_vol.value}%`;
  }

})
music_vol.addEventListener("input",()=>{
    music_span.textContent=`${music_vol.value}%`

})
