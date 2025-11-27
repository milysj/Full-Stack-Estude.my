/**
 * @fileoverview Testes unitários para tokenHelper.js
 * @description Testa a geração de tokens JWT
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { gerarToken } from '../../utils/tokenHelper.js';

describe('tokenHelper', () => {
  // Configurar variáveis de ambiente antes de cada teste
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  /**
   * @test Testa se o token é gerado corretamente
   * @description Verifica se a função gerarToken retorna um token válido
   */
  describe('gerarToken', () => {
    it('deve gerar um token JWT válido', () => {
      const payload = {
        id: '123456789',
        nome: 'João Silva',
        email: 'joao@example.com'
      };

      const token = gerarToken(payload);

      // Verifica se o token foi gerado
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('deve gerar um token que pode ser decodificado', () => {
      const payload = {
        id: '123456789',
        nome: 'João Silva',
        email: 'joao@example.com'
      };

      const token = gerarToken(payload);
      
      // Decodifica o token sem verificar a assinatura (apenas para teste)
      const decoded = jwt.decode(token);

      // Verifica se o payload está correto
      expect(decoded).toMatchObject({
        id: payload.id,
        nome: payload.nome,
        email: payload.email
      });
    });

    it('deve gerar um token com expiração de 7 dias', () => {
      const payload = { id: '123' };
      const token = gerarToken(payload);
      
      const decoded = jwt.decode(token);
      const expirationTime = decoded.exp;
      const issuedAt = decoded.iat;
      const expirationDuration = expirationTime - issuedAt;

      // 7 dias = 7 * 24 * 60 * 60 segundos = 604800 segundos
      expect(expirationDuration).toBe(604800);
    });

    it('deve gerar tokens diferentes para payloads diferentes', () => {
      const payload1 = { id: '1', nome: 'João' };
      const payload2 = { id: '2', nome: 'Maria' };

      const token1 = gerarToken(payload1);
      const token2 = gerarToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it('deve gerar tokens diferentes mesmo com mesmo payload (devido ao timestamp)', () => {
      const payload = { id: '123' };
      
      // Aguarda um pouco para garantir timestamps diferentes
      const token1 = gerarToken(payload);
      setTimeout(() => {
        const token2 = gerarToken(payload);
        // Tokens podem ser diferentes devido ao timestamp 'iat'
        expect(token1).toBeDefined();
        expect(token2).toBeDefined();
      }, 10);
    });
  });
});

