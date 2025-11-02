import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * @desc    Login de usuário
 * @route   POST /api/auth/login
 * @access  Público
 */
export const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // 1️⃣ Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Usuário não encontrado" });

    // 2️⃣ Verificar a senha (comparando hash)
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida)
      return res.status(401).json({ message: "Senha inválida" });

    // 3️⃣ Gerar token JWT
    const token = jwt.sign(
      { id: user._id, nome: user.nome, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4️⃣ Retornar os dados do usuário logado
    res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        materiaFavorita: user.materiaFavorita || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
};

