
const musica = document.getElementById('musica');

let v = Number(localStorage.getItem('volumen'));


if (isNaN(v)) {
  v = 0.7; 
  localStorage.setItem('volumen', v);   
}
console.log(v)

musica.volume = v;

