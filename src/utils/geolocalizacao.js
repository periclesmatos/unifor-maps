import { carregarListaMarcadores } from "../services/marcador_service.js"

let userLocation = null;

export function obterLocalizacao(mapa) {
  if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition((position) => {
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
   
          // Adiciona um marcador com ícone azul, indicando a localização do usuário
          new google.maps.Marker({
            position: userLocation,
            map: mapa,
            title: 'Você está aqui!',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Ícone azul
          });
          carregarListaMarcadores();
        });
      } catch (error) {
        alert('Não foi possível obter sua localização.');
      }
    } else {
      alert('Geolocalização não é suportada pelo seu navegador.');
    }
}
