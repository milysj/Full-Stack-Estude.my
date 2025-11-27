/**
 * @fileoverview Testes unitários para authController.js
 * @description Testa as funções de autenticação (login)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { login } from '../../controllers/authController.js';
import User from '../../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dos módulos
jest.mock('../../models/user.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authController - login', () => {
  let req, res;

  beforeEach(() => {
    // Configurar variáveis de ambiente
    process.env.JWT_SECRET = 'test-secret-key';

    // Criar objetos mock de request e response
    req = {
      body: {
        email: 'teste@example.com',
        senha: 'senha123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  /**
   * @test Testa login com credenciais válidas
   * @description Verifica se o login funciona corretamente com email e senha válidos
   */
  it('deve fazer login com credenciais válidas', async () => {
    // Mock do usuário encontrado
    const mockUser = {
      _id: '123456789',
      nome: 'João Silva',
      email: 'teste@example.com',
      senha: 'hashedPassword123',
      materiaFavorita: 'Matemática'
    };

    // Mock do token JWT
    const mockToken = 'mock-jwt-token-12345';

    // Configurar mocks
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue(mockToken);

    // Executar função
    await login(req, res);

    // Verificações
    expect(User.findOne).toHaveBeenCalledWith({ email: 'teste@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hashedPassword123');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id, nome: mockUser.nome, email: mockUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    expect(res.json).toHaveBeenCalledWith({
      token: mockToken,
      user: {
        id: mockUser._id,
        nome: mockUser.nome,
        email: mockUser.email,
        materiaFavorita: mockUser.materiaFavorita
      }
    });
  });

  /**
   * @test Testa login com usuário não encontrado
   * @description Verifica se retorna erro 401 quando o usuário não existe
   */
  it('deve retornar erro 401 quando usuário não encontrado', async () => {
    // Mock: usuário não encontrado
    User.findOne.mockResolvedValue(null);

    // Executar função
    await login(req, res);

    // Verificações
    expect(User.findOne).toHaveBeenCalledWith({ email: 'teste@example.com' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  /**
   * @test Testa login com senha inválida
   * @description Verifica se retorna erro 401 quando a senha está incorreta
   */
  it('deve retornar erro 401 quando senha inválida', async () => {
    const mockUser = {
      _id: '123456789',
      nome: 'João Silva',
      email: 'teste@example.com',
      senha: 'hashedPassword123'
    };

    // Mock: usuário encontrado mas senha incorreta
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    // Executar função
    await login(req, res);

    // Verificações
    expect(User.findOne).toHaveBeenCalledWith({ email: 'teste@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'hashedPassword123');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Senha inválida' });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  /**
   * @test Testa login com materiaFavorita null
   * @description Verifica se retorna null quando o usuário não tem matéria favorita
   */
  it('deve retornar null para materiaFavorita quando não definida', async () => {
    const mockUser = {
      _id: '123456789',
      nome: 'João Silva',
      email: 'teste@example.com',
      senha: 'hashedPassword123',
      materiaFavorita: null
    };

    const mockToken = 'mock-jwt-token-12345';

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue(mockToken);

    // Executar função
    await login(req, res);

    // Verificações
    expect(res.json).toHaveBeenCalledWith({
      token: mockToken,
      user: {
        id: mockUser._id,
        nome: mockUser.nome,
        email: mockUser.email,
        materiaFavorita: null
      }
    });
  });

  /**
   * @test Testa tratamento de erro interno
   * @description Verifica se retorna erro 500 quando ocorre um erro interno
   */
  it('deve retornar erro 500 em caso de erro interno', async () => {
    const mockError = new Error('Erro de conexão com banco de dados');
    
    // Mock: erro ao buscar usuário
    User.findOne.mockRejectedValue(mockError);

    // Executar função
    await login(req, res);

    // Verificações
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno no servidor' });
  });
});

