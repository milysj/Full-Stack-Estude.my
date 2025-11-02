const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Obter token do localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Headers padrão com autenticação
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Lista todas as fases (opcionalmente filtradas por trilhaId)
 * @param {string} trilhaId - ID da trilha para filtrar (opcional)
 * @returns {Promise<Array>} Lista de fases
 */
export const listarFases = async (trilhaId = null) => {
  const url = trilhaId
    ? `${API_URL}/api/fases?trilhaId=${trilhaId}`
    : `${API_URL}/api/fases`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao listar fases: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Busca fases por trilhaId
 * @param {string} trilhaId - ID da trilha
 * @returns {Promise<Array>} Lista de fases da trilha
 */
export const buscarFasesPorTrilha = async (trilhaId) => {
  const response = await fetch(`${API_URL}/api/fases/trilha/${trilhaId}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar fases da trilha: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Busca uma fase por ID
 * @param {string} id - ID da fase
 * @returns {Promise<Object>} Dados da fase
 */
export const buscarFasePorId = async (id) => {
  const response = await fetch(`${API_URL}/api/fases/${id}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar fase: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Cria uma nova fase
 * @param {Object} faseData - Dados da fase { trilhaId, titulo, descricao, ordem, perguntas }
 * @returns {Promise<Object>} Fase criada
 */
export const criarFase = async (faseData) => {
  const response = await fetch(`${API_URL}/api/fases`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(faseData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erro ao criar fase: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Atualiza uma fase existente
 * @param {string} id - ID da fase
 * @param {Object} faseData - Dados atualizados da fase
 * @returns {Promise<Object>} Fase atualizada
 */
export const atualizarFase = async (id, faseData) => {
  const response = await fetch(`${API_URL}/api/fases/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(faseData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Erro ao atualizar fase: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Deleta uma fase
 * @param {string} id - ID da fase
 * @returns {Promise<Object>} Mensagem de sucesso
 */
export const deletarFase = async (id) => {
  const response = await fetch(`${API_URL}/api/fases/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao deletar fase: ${response.statusText}`);
  }
  
  return response.json();
};

