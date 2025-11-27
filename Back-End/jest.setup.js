// Configuração global para os testes Jest
// Este arquivo é executado antes de cada teste

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXPIRES = '7d';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';

// Limpar console.log durante os testes (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

