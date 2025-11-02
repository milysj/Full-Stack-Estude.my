// src/controllers/userController.js
import User from "../models/user.js";
import ResetToken from "../models/resetToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const criarPerfil = async (req, res) => {
  try {
    // Verifica autenticação
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const { username, personagem, fotoPerfil: fotoBody } = req.body;
    let fotoPerfil = "";

    // Se enviou arquivo via upload
    if (req.file) {
      fotoPerfil = `/uploads/${req.file.filename}`;
    } else if (fotoBody) {
      fotoPerfil = fotoBody;
    }

    // Validação dos campos obrigatórios
    if (!username?.trim() || !personagem?.trim() || !fotoPerfil?.trim()) {
      return res.status(400).json({
        message: "Personagem, username e foto são obrigatórios!",
      });
    }

    // Busca o usuário logado
    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Atualiza os campos de perfil
    usuario.username = username.trim();
    usuario.personagem = personagem.trim();
    usuario.fotoPerfil = fotoPerfil.trim();

    await usuario.save();

    res.json({
      message: "Perfil criado com sucesso!",
      usuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar perfil." });
  }
};
  
export const registerUser = async (req, res) => {
  try {
    const { nome, email, senha, dataNascimento, tipoUsuario, registro, titulacao } = req.body;

    // Verifica se já existe
    const userExistente = await User.findOne({ email });
    if (userExistente) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    // Criptografa a senha
    const hashedSenha = await bcrypt.hash(senha, 10);

    const usuario = new User({
      nome,
      email,
      senha: hashedSenha,
      dataNascimento,
      tipoUsuario,
      registro: tipoUsuario === "PROFESSOR" ? registro : undefined,
      titulacao: tipoUsuario === "PROFESSOR" ? titulacao : undefined,
    });

    await usuario.save();

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar usuário" });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // Gera token
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      token,
      perfilCriado: !!usuario.personagem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
};

// Buscar dados do usuário atual
export const buscarMeusDados = async (req, res) => {
  try {
    const userId = req.user._id;
    const usuario = await User.findById(userId).select("-senha");

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    res.status(500).json({ message: "Erro ao buscar dados do usuário" });
  }
};

// Atualizar dados pessoais
export const atualizarDadosPessoais = async (req, res) => {
  try {
    const userId = req.user._id;
    const { nome, telefone, endereco, dataNascimento } = req.body;

    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Atualiza apenas os campos fornecidos
    if (nome !== undefined) usuario.nome = nome;
    if (telefone !== undefined) usuario.telefone = telefone || "";
    if (endereco !== undefined) usuario.endereco = endereco || "";
    if (dataNascimento !== undefined) usuario.dataNascimento = dataNascimento;

    await usuario.save();

    const usuarioAtualizado = await User.findById(userId).select("-senha");
    res.json({
      message: "Dados pessoais atualizados com sucesso!",
      usuario: usuarioAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar dados pessoais:", error);
    res.status(500).json({ message: "Erro ao atualizar dados pessoais" });
  }
};

// Mudar senha
export const mudarSenha = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        message: "Senha atual e nova senha são obrigatórias",
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        message: "A nova senha deve ter pelo menos 6 caracteres",
      });
    }

    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    // Criptografa nova senha
    const hashedNovaSenha = await bcrypt.hash(novaSenha, 10);
    usuario.senha = hashedNovaSenha;

    await usuario.save();

    res.json({ message: "Senha alterada com sucesso!" });
  } catch (error) {
    console.error("Erro ao mudar senha:", error);
    res.status(500).json({ message: "Erro ao mudar senha" });
  }
};

// Solicitar recuperação de senha - envia email com token
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email é obrigatório",
      });
    }

    const usuario = await User.findOne({ email });
    if (!usuario) {
      // Por segurança, não revelamos se o email existe ou não
      return res.status(200).json({ 
        message: "Se o email existir em nosso sistema, você receberá um link para redefinir sua senha." 
      });
    }

    // Gera token único
    const token = crypto.randomBytes(32).toString("hex");
    
    // Remove tokens anteriores não utilizados para este email
    await ResetToken.deleteMany({ email, used: false });

    // Salva token no banco (expira em 1 hora)
    await ResetToken.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1 hora
    });

    // Aqui você integraria com um serviço de email real (nodemailer, SendGrid, etc)
    // Por enquanto, vamos apenas logar o link (em produção, enviaria por email)
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/pages/recuperar-senha?token=${token}`;
    
    console.log(`\n🔗 Link de recuperação para ${email}:`);
    console.log(resetLink);
    console.log(`\n⚠️ Em produção, este link seria enviado por email!\n`);

    // TODO: Implementar envio de email real
    // await enviarEmail(email, "Recuperação de Senha", resetLink);

    // Resposta genérica por segurança
    res.status(200).json({ 
      message: "Se o email existir em nosso sistema, você receberá um link para redefinir sua senha." 
    });
  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    res.status(500).json({ message: "Erro ao processar solicitação" });
  }
};

// Redefinir senha usando token do email
export const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({
        message: "Token e nova senha são obrigatórios",
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        message: "A nova senha deve ter pelo menos 6 caracteres",
      });
    }

    // Busca token válido
    const resetToken = await ResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({
        message: "Token inválido ou expirado. Solicite uma nova recuperação de senha.",
      });
    }

    // Busca usuário pelo email do token
    const usuario = await User.findOne({ email: resetToken.email });
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Criptografa nova senha
    const hashedNovaSenha = await bcrypt.hash(novaSenha, 10);
    usuario.senha = hashedNovaSenha;

    await usuario.save();

    // Marca token como usado
    resetToken.used = true;
    await resetToken.save();

    res.json({ message: "Senha alterada com sucesso!" });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ message: "Erro ao alterar senha" });
  }
};

// Verificar se token é válido (para a página de redefinição)
export const verificarTokenReset = async (req, res) => {
  try {
    const { token } = req.params;

    const resetToken = await ResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({
        valid: false,
        message: "Token inválido ou expirado",
      });
    }

    res.json({
      valid: true,
      message: "Token válido",
    });
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    res.status(500).json({ message: "Erro ao verificar token" });
  }
};

// Excluir conta
export const excluirConta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { senha } = req.body;

    if (!senha) {
      return res.status(400).json({ message: "Senha é obrigatória para excluir a conta" });
    }

    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "Conta excluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    res.status(500).json({ message: "Erro ao excluir conta" });
  }
};

