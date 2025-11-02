// src/services/userService.js
import  User  from "../models/user.js";
import bcrypt from "bcrypt";

export async function listarUsuarios() {
  return await User.find().select("-senha"); // não retorna senha
}

export async function criarUsuario(dados) {
  const senhaCriptografada = await bcrypt.hash(dados.senha, 10);
  const user = new User({ ...dados, senha: senhaCriptografada });
  return await user.save();
}

export async function loginUsuario(email, senha) {
  const user = await User.findOne({ email });
  if (!user) return null;

  const senhaCorreta = await bcrypt.compare(senha, user.senha);
  if (!senhaCorreta) return null;

  return user;
}
