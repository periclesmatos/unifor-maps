const API_URL = 'http://localhost:8000/marcadores';

// Função para buscar todos os marcadores
export async function getMarcadores() {
  try {
    const response = await fetch(API_URL, { method: 'GET' });
    if (!response.ok) throw new Error('Erro ao buscar marcadores');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
}

// Função para adicionar um novo marcador
export async function addMarcador(marcador) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marcador),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para atualizar um marcador
export async function updateMarcador(marcador) {
  try {
    const response = await fetch(`${API_URL}/${marcador.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marcador),
    });
    if (!response.ok) throw new Error('Erro ao atualizar marcador');
    return await response.json();
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para deletar um marcador
export async function deleteMarcador(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao deletar marcador');
    return true;
  } catch (error) {
    console.error('Erro:', error);
    return false;
  }
}
