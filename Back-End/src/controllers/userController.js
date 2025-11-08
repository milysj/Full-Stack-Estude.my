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

    // Busca o usuário logado
    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Verifica se o perfil já foi criado
    if (usuario.personagem && usuario.username && usuario.personagem.trim() !== "" && usuario.username.trim() !== "") {
      return res.status(409).json({ 
        message: "Perfil já criado. Você não pode criar o perfil novamente.",
        perfilCriado: true
      });
    }

    const { username, personagem, fotoPerfil } = req.body;

    // Validação dos campos obrigatórios
    if (!username?.trim() || !personagem?.trim() || !fotoPerfil?.trim()) {
      return res.status(400).json({
        message: "Personagem, username e foto são obrigatórios!",
      });
    }

    const usernameTrimmed = username.trim();

    // Verifica se o username já existe em outro usuário
    const usuarioComUsername = await User.findOne({ 
      username: usernameTrimmed,
      _id: { $ne: req.user._id } // Exclui o próprio usuário da busca
    });
    
    if (usuarioComUsername) {
      return res.status(409).json({
        message: "Username já está em uso. Por favor, escolha outro username.",
      });
    }

    // Valida se a foto é uma das pré-definidas permitidas
    const fotosPermitidas = ["/img/guerreiro.png", "/img/mago.png", "/img/samurai.png"];
    if (!fotosPermitidas.includes(fotoPerfil.trim())) {
      return res.status(400).json({
        message: "Foto de perfil inválida. Escolha uma das fotos pré-definidas.",
      });
    }

    // Atualiza os campos de perfil
    usuario.username = usernameTrimmed;
    usuario.personagem = personagem.trim();
    usuario.fotoPerfil = fotoPerfil.trim();

    try {
      await usuario.save();
    } catch (error) {
      // Captura erro de duplicata do MongoDB (caso a verificação acima não tenha pego)
      if (error.code === 11000 && error.keyPattern?.username) {
        return res.status(409).json({
          message: "Username já está em uso. Por favor, escolha outro username.",
        });
      }
      throw error; // Re-lança outros erros
    }

    // Busca o usuário atualizado sem campos sensíveis
    const usuarioRetorno = await User.findById(req.user._id)
      .select("-senha -email -dataNascimento");

    res.json({
      message: "Perfil criado com sucesso!",
      usuario: usuarioRetorno,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar perfil." });
  }
};
  
export const registerUser = async (req, res) => {
  try {
    const { nome, email, senha, dataNascimento, tipoUsuario, registro, titulacao, aceiteTermos } = req.body;

    // Validação: não permitir criar usuário como ADMINISTRADOR via API
    if (tipoUsuario === "ADMINISTRADOR") {
      return res.status(403).json({ 
        message: "Não é possível criar usuário administrador via API. Contate o suporte." 
      });
    }

    // Validação do termo de consentimento
    if (!aceiteTermos || aceiteTermos !== true) {
      return res.status(400).json({ 
        message: "É necessário aceitar os termos de uso e política de privacidade para criar uma conta" 
      });
    }

    // Validação de data de nascimento e idade mínima (14 anos)
    if (!dataNascimento) {
      return res.status(400).json({ message: "Data de nascimento é obrigatória" });
    }

    const dataNasc = new Date(dataNascimento);
    const hoje = new Date();
    
    // Verifica se a data é válida
    if (isNaN(dataNasc.getTime())) {
      return res.status(400).json({ message: "Data de nascimento inválida" });
    }

    // Verifica se a data não é futura
    if (dataNasc > hoje) {
      return res.status(400).json({ message: "Data de nascimento não pode ser no futuro" });
    }

    // Calcula a idade
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNasc = dataNasc.getMonth();
    const diaNasc = dataNasc.getDate();

    // Ajusta a idade se ainda não fez aniversário este ano
    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
      idade--;
    }

    // Verifica se a pessoa tem no mínimo 14 anos
    if (idade < 14) {
      return res.status(400).json({ 
        message: "É necessário ter no mínimo 14 anos para criar uma conta" 
      });
    }

    // Validação de senha (mínimo 8 caracteres)
    if (!senha || senha.length < 8) {
      return res.status(400).json({
        message: "A senha deve ter no mínimo 8 caracteres",
      });
    }

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
      aceiteTermos: true,
      dataAceiteTermos: new Date(),
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

// Obter termos de uso e política de privacidade
export const obterTermos = async (req, res) => {
  try {
    res.json({
      termosUso: {
        titulo: "Termos de Uso",
        versao: "1.0",
        dataAtualizacao: "2024-01-01",
        conteudo: `
TERMOS DE USO DA PLATAFORMA ESTUDEMY

1. ACEITAÇÃO DOS TERMOS
Ao acessar e usar a plataforma Estudemy, você concorda em cumprir e estar vinculado a estes Termos de Uso.

2. IDADE MÍNIMA
Você declara que tem no mínimo 14 anos de idade e tem capacidade legal para aceitar estes termos.

3. CONTA DE USUÁRIO
- Você é responsável por manter a segurança de sua conta e senha.
- Você é responsável por todas as atividades que ocorrem sob sua conta.
- Você deve notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.

4. CONDUTA DO USUÁRIO
Você concorda em não:
- Usar a plataforma para fins ilegais ou não autorizados.
- Violar qualquer lei local, estadual ou federal.
- Infringir direitos de propriedade intelectual de terceiros.
- Enviar spam, conteúdo malicioso ou ofensivo.

5. CONTEÚDO DO USUÁRIO
Você mantém todos os direitos sobre o conteúdo que cria na plataforma, mas concede à Estudemy uma licença para usar, modificar e exibir tal conteúdo.

6. LIMITAÇÃO DE RESPONSABILIDADE
A Estudemy não se responsabiliza por danos indiretos, incidentais ou consequenciais resultantes do uso da plataforma.

7. MODIFICAÇÕES DOS TERMOS
Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação.

8. CONTATO
Para questões sobre estes termos, entre em contato conosco através do email: suporte@estudemy.com
        `.trim(),
      },
      politicaPrivacidade: {
        titulo: "Política de Privacidade",
        versao: "1.0",
        dataAtualizacao: "2024-01-01",
        conteudo: `
POLÍTICA DE PRIVACIDADE DA PLATAFORMA ESTUDEMY

1. INFORMAÇÕES QUE COLETAMOS
Coletamos informações que você nos fornece diretamente, incluindo:
- Nome, email, data de nascimento
- Informações de perfil (username, personagem, foto)
- Dados de progresso e desempenho
- Informações de uso da plataforma

2. COMO USAMOS SUAS INFORMAÇÕES
Usamos suas informações para:
- Fornecer e melhorar nossos serviços
- Personalizar sua experiência
- Enviar notificações importantes
- Analisar o uso da plataforma
- Prevenir fraudes e garantir segurança

3. COMPARTILHAMENTO DE INFORMAÇÕES
Não vendemos suas informações pessoais. Podemos compartilhar informações apenas:
- Com seu consentimento explícito
- Para cumprir obrigações legais
- Para proteger nossos direitos e segurança

4. SEGURANÇA DOS DADOS
Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.

5. SEUS DIREITOS
Você tem o direito de:
- Acessar suas informações pessoais
- Corrigir informações incorretas
- Solicitar a exclusão de suas informações
- Opôr-se ao processamento de suas informações

6. RETENÇÃO DE DADOS
Mantemos suas informações enquanto sua conta estiver ativa ou conforme necessário para fornecer nossos serviços e cumprir obrigações legais.

7. ALTERAÇÕES NESTA POLÍTICA
Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas.

8. CONTATO
Para questões sobre privacidade, entre em contato: privacidade@estudemy.com
        `.trim(),
      },
    });
  } catch (error) {
    console.error("Erro ao obter termos:", error);
    res.status(500).json({ message: "Erro ao obter termos de uso" });
  }
};

// Verificar se o token é válido (endpoint leve para verificação de autenticação)
export const verificarAutenticacao = async (req, res) => {
  try {
    // Se chegou aqui, o middleware já validou o token
    // Retornar apenas confirmação de autenticação
    res.json({ 
      authenticated: true,
      userId: req.user._id 
    });
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    res.status(500).json({ message: "Erro ao verificar autenticação" });
  }
};

// Buscar dados do usuário atual
export const buscarMeusDados = async (req, res) => {
  try {
    const userId = req.user._id;
    const usuario = await User.findById(userId).select("-senha -email -dataNascimento");

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
    const { nome, telefone, endereco, dataNascimento, tipoUsuario } = req.body;

    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Validação: não permitir alterar tipoUsuario via API
    if (tipoUsuario !== undefined) {
      return res.status(403).json({ 
        message: "Não é possível alterar o tipo de usuário via API. O tipo de usuário ADMINISTRADOR só pode ser definido manualmente no banco de dados." 
      });
    }

    // Atualiza apenas os campos fornecidos
    if (nome !== undefined) usuario.nome = nome;
    if (telefone !== undefined) usuario.telefone = telefone || "";
    if (endereco !== undefined) usuario.endereco = endereco || "";
    if (dataNascimento !== undefined) usuario.dataNascimento = dataNascimento;

    await usuario.save();

    const usuarioAtualizado = await User.findById(userId).select("-senha -email -dataNascimento");
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

    if (novaSenha.length < 8) {
      return res.status(400).json({
        message: "A nova senha deve ter no mínimo 8 caracteres",
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

    if (novaSenha.length < 8) {
      return res.status(400).json({
        message: "A nova senha deve ter no mínimo 8 caracteres",
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

