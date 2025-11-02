import api from "./api";

export const listarUsuarios = async () => {
  const response = await api.get("/usuarios");
  return response.data;
};

export const criarUsuario = async (usuario) => {
  const response = await api.post("/usuarios", usuario);
  return response.data;
};
