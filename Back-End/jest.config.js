export default {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Extensões de arquivo que o Jest deve processar
  moduleFileExtensions: ['js', 'json'],
  
  // Transformar arquivos ES modules
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // Diretórios onde os testes estão localizados
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configuração para módulos ES (removido pois já está definido no package.json como "type": "module")
  
  // Variáveis de ambiente para testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.spec.js',
    '!src/**/*.test.js',
    '!src/server.js',
    '!src/app.js'
  ],
  
  // Limpar mocks entre testes
  clearMocks: true,
  
  // Restaurar mocks entre testes
  restoreMocks: true,
  
  // Verbose para ver todos os testes
  verbose: true
};

