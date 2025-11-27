/**
 * @fileoverview Testes unitários para userController.js
 * @description Testa funções relacionadas a usuários (criarPerfil, mudarSenha, etc)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
// Importar funções do userController
import {
  mudarSenha,
  atualizarTema,
  atualizarIdioma
} from '../../controllers/userController.js';
import User from '../../models/user.js';
import bcrypt from 'bcryptjs';

// Mock dos módulos
jest.mock('../../models/user.js');
jest.mock('bcryptjs');

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    // Criar objetos mock de request e response
    req = {
      user: {
        _id: '123456789'
      },
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });


  /**
   * @test Testa mudança de senha
   * @description Verifica se a senha é alterada corretamente
   */
  describe('mudarSenha', () => {
    it('deve alterar senha com sucesso', async () => {
      const mockUsuario = {
        _id: '123456789',
        senha: 'hashedOldPassword',
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        senhaAtual: 'senhaAntiga123',
        novaSenha: 'novaSenha456'
      };

      User.findById.mockResolvedValue(mockUsuario);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');

      await mudarSenha(req, res);

      expect(User.findById).toHaveBeenCalledWith('123456789');
      expect(bcrypt.compare).toHaveBeenCalledWith('senhaAntiga123', 'hashedOldPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha456', 10);
      expect(mockUsuario.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha alterada com sucesso!' });
    });

    it('deve retornar erro 400 quando senha atual ou nova senha não fornecidas', async () => {
      req.body = {};

      await mudarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Senha atual e nova senha são obrigatórias'
      });
    });

    it('deve retornar erro 400 quando nova senha tem menos de 8 caracteres', async () => {
      req.body = {
        senhaAtual: 'senhaAntiga123',
        novaSenha: '1234567' // Menos de 8 caracteres
      };

      await mudarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'A nova senha deve ter no mínimo 8 caracteres'
      });
    });

    it('deve retornar erro 401 quando senha atual está incorreta', async () => {
      const mockUsuario = {
        _id: '123456789',
        senha: 'hashedOldPassword'
      };

      req.body = {
        senhaAtual: 'senhaErrada',
        novaSenha: 'novaSenha456'
      };

      User.findById.mockResolvedValue(mockUsuario);
      bcrypt.compare.mockResolvedValue(false);

      await mudarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha atual incorreta' });
    });
  });

  /**
   * @test Testa atualização de tema
   * @description Verifica se o tema do usuário é atualizado corretamente
   */
  describe('atualizarTema', () => {
    it('deve atualizar tema para "dark" com sucesso', async () => {
      const mockUsuario = {
        _id: '123456789',
        tema: 'light'
      };

      const mockUsuarioAtualizado = {
        _id: '123456789',
        tema: 'dark'
      };

      req.body = { tema: 'dark' };

      User.findById.mockResolvedValue(mockUsuario);
      User.updateOne.mockResolvedValue({});
      User.findById.mockResolvedValueOnce(mockUsuario).mockResolvedValueOnce(mockUsuarioAtualizado);

      await atualizarTema(req, res);

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: '123456789' },
        { $set: { tema: 'dark' } }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tema atualizado com sucesso!',
        tema: 'dark'
      });
    });

    it('deve retornar erro 400 quando tema é inválido', async () => {
      req.body = { tema: 'invalid-theme' };

      await atualizarTema(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tema inválido. Use 'light' ou 'dark'"
      });
    });
  });

  /**
   * @test Testa atualização de idioma
   * @description Verifica se o idioma do usuário é atualizado corretamente
   */
  describe('atualizarIdioma', () => {
    it('deve atualizar idioma para "en-US" com sucesso', async () => {
      const mockUsuario = {
        _id: '123456789',
        idioma: 'pt-BR'
      };

      const mockUsuarioAtualizado = {
        _id: '123456789',
        idioma: 'en-US'
      };

      req.body = { idioma: 'en-US' };

      User.findById.mockResolvedValue(mockUsuario);
      User.updateOne.mockResolvedValue({});
      User.findById.mockResolvedValueOnce(mockUsuario).mockResolvedValueOnce(mockUsuarioAtualizado);

      await atualizarIdioma(req, res);

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: '123456789' },
        { $set: { idioma: 'en-US' } }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Idioma atualizado com sucesso!',
        idioma: 'en-US'
      });
    });

    it('deve retornar erro 400 quando idioma é inválido', async () => {
      req.body = { idioma: 'invalid-language' };

      await atualizarIdioma(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Idioma inválido. Use: pt-BR, en-US, es-ES'
      });
    });
  });
});

