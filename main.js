import { Marcador } from './models.js';
import {
  getMarcadores,
  addMarcador,
  updateMarcador,
  deleteMarcador,
} from './marcador_api.js';

let mapa;
let userLocation = null;

document
  .getElementById('adicionarMarcadorButton')
  .addEventListener('click', function () {
    adicionarMarcador(mapa);
  });

async function initMap() {
  mapa = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -3.768791, lng: -38.478214 }, // Localização inicial da Unifor
    zoom: 16.9,
    mapId: 'DEMO_MAP_ID',
  });

  // Tenta obter a localização do usuário utilizando uma Promise
  if (navigator.geolocation) {
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Centraliza o mapa na localização do usuário
        mapa.setCenter(userLocation);

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

  // Evento de clique no mapa para adicionar marcador
  mapa.addListener('click', function (event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Preenche os inputs com a posição clicada
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);
  });

  carregarMarcadores(mapa);
  carregarListaMarcadores();
}

window.onload = initMap;

export async function carregarMarcadores(mapa) {
  try {
    let marcadores = await getMarcadores(); // Aguarda a Promise ser resolvida
    marcadores.forEach((marcador) => {
      const { titulo, descricao, latitude, longitude, id } = marcador;
      const posicao = { lat: latitude, lng: longitude };

      const novoMarcador = new google.maps.marker.AdvancedMarkerElement({
        position: posicao,
        map: mapa,
        title: titulo,
        gmpDraggable: true,
      });

      // Adiciona um evento de clique no marcador
      novoMarcador.addListener('click', function () {
        const infoWindow = new google.maps.InfoWindow({
          content: titulo,
        });
        infoWindow.open(mapa, novoMarcador);
      });

      novoMarcador.addListener('dragend', (event) => {
        const position = event.latLng;
        const lat = position.lat();
        const lng = position.lng();
        atualizarMarcador(new Marcador(titulo, descricao, lat, lng, id));
        carregarListaMarcadores();
      });
    });
  } catch (error) {
    console.error('Erro ao carregar marcadores:', error);
  }
}

export async function adicionarMarcador(mapa) {
  const latitudeInput = document.getElementById('latitude');
  const longitudeInput = document.getElementById('longitude');
  const tituloInput = document.getElementById('titulo');
  const descricaoInput = document.getElementById('descricao');

  const latitude = parseFloat(latitudeInput.value);
  const longitude = parseFloat(longitudeInput.value);
  const titulo = tituloInput.value.trim();
  const descricao = descricaoInput.value.trim();

  if (isNaN(latitude) || isNaN(longitude) || !titulo || !descricao) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  try {
    // Cria um novo marcador (sem ID) para ser enviado ao backend
    const marcador = new Marcador(titulo, descricao, latitude, longitude);

    // Envia os dados para o backend para adicionar o marcador
    const response = await addMarcador(marcador);

    if (!response) {
      throw new Error('Erro ao adicionar marcador');
    }

    // Limpa os inputs após a adição bem-sucedida
    latitudeInput.value = '';
    longitudeInput.value = '';
    tituloInput.value = '';
    descricaoInput.value = '';

    carregarMarcadores(mapa);
    carregarListaMarcadores();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao adicionar marcador');
  }
}

async function atualizarMarcador(marcador) {
  try {
    const response = await updateMarcador(marcador);

    if (!response) {
      throw new Error('Erro ao atualizar marcador');
    }
  } catch (error) {
    console.error('Erro ao atualizar marcador:', error);
    alert('Erro ao atualizar marcador');
  }
}

export async function excluirMarcador(marcador) {
  try {
    const response = await deleteMarcador(marcador.id);
    initMap();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao excluir marcador');
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distância em km
}

export async function carregarListaMarcadores() {
  const marcadores = await getMarcadores();

  // Se a localização do usuário estiver disponível, ordena os marcadores pela distância
  if (userLocation) {
    marcadores.sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distanceA - distanceB;
    });
  }

  const listaMarcadores = document.getElementById('container__lista_marcadores');
  listaMarcadores.innerHTML = ''; // Limpar a lista antes de adicionar novos cards

  marcadores.forEach((marcadorData) => {
    const { titulo, descricao, latitude, longitude } = marcadorData;
    
    // Calcula a distância atual, se possível
    const distance = userLocation
      ? calculateDistance(userLocation.lat, userLocation.lng, latitude, longitude)
      : null;

    // Cria o card do marcador
    const card = document.createElement('li');
    card.classList.add('marcador-card');

    card.innerHTML = `
      <h3>${titulo}</h3>
      <p>${descricao}</p>
      ${distance ? `<p>Distância: ${distance.toFixed(2)} km</p>` : ''}
      <div class="marcador-buttons">
        <button class="btn-ver">Ver no Mapa</button>
        <button class="btn-excluir">Excluir</button>
      </div>
    `;

    // Evento para visualizar no mapa
    const verNoMapaButton = card.querySelector('.btn-ver');
    verNoMapaButton.addEventListener('click', function () {
      verNoMapa(latitude, longitude);
    });

    // Evento para excluir o marcador
    const excluirMarcadorButton = card.querySelector('.btn-excluir');
    excluirMarcadorButton.addEventListener('click', function () {
      excluirMarcador(marcadorData);
      carregarListaMarcadores();
    });

    listaMarcadores.appendChild(card);
  });
}

function verNoMapa(latitude, longitude) {
  mapa.panTo({ lat: latitude, lng: longitude });
  mapa.setZoom(17); // Para garantir que o zoom seja ajustado para o marcador
}

