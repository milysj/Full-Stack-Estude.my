/**
 * @fileoverview Testes unitários para perfilController.js
 * @description Testa a criação de perfil do usuário
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { criarPerfil } from '../../controllers/perfilController.js';
import User from '../../models/user.js';

// Mock dos módulos
jest.mock('../../models/user.js');

describe('perfilController - criarPerfil', () => {
  let req, res;

  beforeEach(() => {
    // Criar objetos mock de request e response
    req = {
      user: {
        _id: '123456789'
      },
      body: {},
      file: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  /**
   * @test Testa criação de perfil com sucesso
   * @description Verifica se o perfil é criado corretamente
   */
  it('deve criar perfil com dados válidos', async () => {
    const mockUsuario = {
      _id: '123456789',
      nome: 'João Silva',
      personagem: '',
      username: '',
      tipoUsuario: 'ALUNO',
      save: jest.fn().mockResolvedValue(true)
    };

    const mockUsuarioAtualizado = {
      _id: '123456789',
      nome: 'João Silva',
      username: 'joaosilva',
      personagem: 'Guerreiro',
      fotoPerfil: '/img/guerreiro.png',
      tipoUsuario: 'ALUNO'
    };

    req.body = {
      username: 'joaosilva',
      personagem: 'Guerreiro',
      fotoPerfil: '/img/guerreiro.png'
    };

    User.findById.mockResolvedValueOnce(mockUsuario).mockResolvedValueOnce(mockUsuarioAtualizado);
    User.findOne.mockResolvedValue(null); // Username não existe

    await criarPerfil(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      username: 'joaosilva',
      _id: { $ne: '123456789' }
    });
    expect(User.findById).toHaveBeenCalledWith('123456789');
    expect(mockUsuario.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Perfil criado com sucesso!',
      usuario: mockUsuarioAtualizado
    });
  });

  /**
   * @test Testa erro quando campos obrigatórios estão faltando
   * @description Verifica se retorna erro 400 quando campos estão vazios
   */
  it('deve retornar erro 400 quando campos obrigatórios estão faltando', async () => {
    req.body = {
      username: '',
      personagem: '',
      fotoPerfil: ''
    };

    await criarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Personagem, username e foto são obrigatórios!'
    });
  });

  /**
   * @test Testa erro quando personagem é inválido
   * @description Verifica se retorna erro 400 quando personagem não é válido
   */
  it('deve retornar erro 400 quando personagem é inválido', async () => {
    const mockUsuario = {
      _id: '123456789',
      personagem: '',
      username: '',
      save: jest.fn()
    };

    req.body = {
      username: 'joaosilva',
      personagem: 'PersonagemInvalido',
      fotoPerfil: '/img/guerreiro.png'
    };

    User.findById.mockResolvedValue(mockUsuario);
    User.findOne.mockResolvedValue(null);

    await criarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Personagem inválido.'
    });
  });

  /**
   * @test Testa erro quando username já existe
   * @description Verifica se retorna erro 409 quando username já está em uso
   */
  it('deve retornar erro 409 quando username já existe', async () => {
    const mockUsuarioExistente = {
      _id: '999999999',
      username: 'joaosilva'
    };

    req.body = {
      username: 'joaosilva',
      personagem: 'Guerreiro',
      fotoPerfil: '/img/guerreiro.png'
    };

    User.findOne.mockResolvedValue(mockUsuarioExistente);

    await criarPerfil(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      username: 'joaosilva',
      _id: { $ne: '123456789' }
    });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Username já está em uso. Por favor, escolha outro username.'
    });
  });

  /**
   * @test Testa tratamento de erro interno
   * @description Verifica se retorna erro 500 quando ocorre erro interno
   */
  it('deve retornar erro 500 em caso de erro interno', async () => {
    req.body = {
      username: 'joaosilva',
      personagem: 'Guerreiro',
      fotoPerfil: '/img/guerreiro.png'
    };

    const mockError = new Error('Erro de banco de dados');
    User.findOne.mockRejectedValue(mockError);

    await criarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao criar perfil.' });
  });
});

