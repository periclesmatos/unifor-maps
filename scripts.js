import { initMap } from './src/mapa.js';
import { adicionarMarcador } from './src/services/marcador_service.js';

document.addEventListener('DOMContentLoaded', initMap);
document.getElementById('adicionarMarcadorButton').addEventListener('click', () => {
  adicionarMarcador();
});