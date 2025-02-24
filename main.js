import { Marcador } from './models.js';
import {
  getMarcadores,
  addMarcador,
  updateMarcador,
  deleteMarcador,
} from './marcador_api.js';

let mapa;

document
  .getElementById('adicionarMarcadorButton')
  .addEventListener('click', function () {
    adicionarMarcador(mapa);
  });

async function initMap() {
  mapa = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -3.768791, lng: -38.478214 }, // Localização inical da Unifor
    zoom: 16.9,
    mapId: 'DEMO_MAP_ID',
  });

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
    latitudeInput.value = "";
    longitudeInput.value = "";
    tituloInput.value = "";
    descricaoInput.value = "";

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

export async function carregarListaMarcadores() {
  const marcadores = await getMarcadores();

  const listaMarcadores = document.getElementById(
    'container__lista_marcadores'
  );
  listaMarcadores.innerHTML = ''; // Limpar a lista antes de adicionar novos cards

  marcadores.forEach((marcadorData) => {
    const { titulo, descricao, latitude, longitude, id } = marcadorData;

    // Criar card do marcador
    const card = document.createElement('li');
    card.classList.add('marcador-card');

    card.innerHTML = `
      <h3>${titulo}</h3>
      <p>${descricao}</p>
      <div class="marcador-buttons">
        <button type="button" id="verNoMapa">Ver no Mapa</button>
        <button type="button" id="excluirMarcador">Excluir</button>
    </div>
    `;

    const verNoMapaButton = card.querySelector('#verNoMapa');
    verNoMapaButton.addEventListener('click', function () {
      verNoMapa(latitude, longitude);
    });

    const excluirMarcadorButton = card.querySelector('#excluirMarcador');
    excluirMarcadorButton.addEventListener('click', function () {
      excluirMarcador(marcadorData);
      carregarMarcadores(mapa);
      carregarListaMarcadores();
    });

    listaMarcadores.appendChild(card);
  });
}

function verNoMapa(latitude, longitude) {
  mapa.panTo({ lat: latitude, lng: longitude });
  mapa.setZoom(17); // Para garantir que o zoom seja ajustado para o marcador
}
