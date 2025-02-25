import { obterLocalizacao } from "./utils/geolocalizacao.js";
import { carregarMarcadores } from "./services/marcador_service.js";

let mapa;

export async function initMap() {
  mapa = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -3.768791, lng: -38.478214 }, // Localização inicial da Unifor
    zoom: 16.9,
    mapId: 'DEMO_MAP_ID',
  });

  mapa.addListener('click', function (event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Preenche os inputs com a posição clicada
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);
  });

  // Tenta obter a localização do usuário utilizando uma Promise
  obterLocalizacao(mapa)
  carregarMarcadores(mapa)
}

export function verNoMapa(latitude, longitude) {
  mapa.panTo({ lat: latitude, lng: longitude });
  mapa.setZoom(17); // Para garantir que o zoom seja ajustado para o marcador
}

window.initMap = initMap;
