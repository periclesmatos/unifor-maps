import { Marcador } from '../models/marcador_model.js';
import {
  getMarcadores,
  addMarcador,
  updateMarcador,
  deleteMarcador,
} from '../api/marcador_api.js';
import { calculateDistance } from '../utils/distancia.js';
import { initMap, verNoMapa } from '../mapa.js';

export async function carregarListaMarcadores(userLocation) {
  const marcadores = await getMarcadores();

  // Obtém a localização do usuário de forma assíncrona
  async function getUserLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error)
      );
    });
  }

  try {
    const userLocation = await getUserLocation(); // Aguarda a localização antes de continuar

    // Ordena os marcadores pela distância do usuário
    marcadores.sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distanceA - distanceB;
    });

    const listaMarcadores = document.getElementById('container__lista_marcadores');
    listaMarcadores.innerHTML = ''; // Limpa a lista antes de adicionar novos cards

    for (const marcadorData of marcadores) {
      const { titulo, descricao, latitude, longitude } = marcadorData;

      // Calcula a distância com a localização do usuário
      const distance = calculateDistance(userLocation.lat, userLocation.lng, latitude, longitude);

      // Cria o card do marcador
      const card = document.createElement('li');
      card.classList.add('marcador-card');

      card.innerHTML = `
        <h3>${titulo}</h3>
        <p>${descricao}</p>
        <p>Distância: ${distance.toFixed(2)} km</p>
        <div class="marcador-buttons">
          <button class="btn-ver">Ver no Mapa</button>
          <button class="btn-excluir">Excluir</button>
        </div>
      `;

      // Evento para visualizar no mapa
      card.querySelector('.btn-ver').addEventListener('click', () => {
        verNoMapa(latitude, longitude);
      });

      // Evento para excluir o marcador
      card.querySelector('.btn-excluir').addEventListener('click', async () => {
        await excluirMarcador(marcadorData);
        await carregarListaMarcadores();
      });

      listaMarcadores.appendChild(card);
    }

  } catch (error) {
    console.error('Erro ao obter localização:', error);
  }
}

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

    carregarListaMarcadores()
    carregarMarcadores(mapa);
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
