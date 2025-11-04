# Início Rápido - Microsserviço SCORE

## ⚠️ Erro: ECONNREFUSED

Se você está vendo o erro `ECONNREFUSED`, significa que o microsserviço SCORE não está rodando.

## Passos para Iniciar o Microsserviço

### 1. Instalar Dependências

```bash
cd ScoreService
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `ScoreService/`:

```env
MONGO_URI=mongodb://localhost:27017/estudemy
JWT_SECRET=seu_jwt_secret_aqui
PORT=5001
NODE_ENV=development
```

**Importante:** O `JWT_SECRET` deve ser o mesmo do backend principal!

### 3. Iniciar o Microsserviço

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Ou modo produção
npm start
```

Você deve ver:
```
🚀 [SCORE] Servidor rodando em http://0.0.0.0:5001
🌍 [SCORE] Ambiente: development
✅ [SCORE] MongoDB conectado: ...
```

### 4. Verificar se Está Funcionando

Abra outro terminal e teste:

```bash
curl http://localhost:5001/health
```

Deve retornar:
```json
{
  "status": "ok",
  "service": "SCORE",
  "message": "Microsserviço SCORE está funcionando"
}
```

### 5. Configurar Backend Principal

Certifique-se de que o backend principal tem a variável de ambiente configurada:

No arquivo `.env` do `EstudeMyBackendNode/`:

```env
SCORE_SERVICE_URL=http://localhost:5001
```

## ⚠️ Nota Importante

O sistema agora está configurado para **continuar funcionando** mesmo se o microsserviço SCORE não estiver disponível. Você verá um aviso no console, mas o sistema não irá quebrar.

Os dados de XP/nível serão retornados com valores padrão (nível 1, XP 0) até que o microsserviço esteja disponível novamente.

## Executar Ambos os Serviços

Você precisa ter **dois terminais** abertos:

**Terminal 1 - Backend Principal:**
```bash
cd EstudeMyBackendNode
npm run dev
```

**Terminal 2 - Microsserviço SCORE:**
```bash
cd ScoreService
npm run dev
```

## Troubleshooting

### Porta 5001 já está em uso?
Altere a porta no arquivo `.env` do ScoreService:
```env
PORT=5002
```
E atualize o backend principal:
```env
SCORE_SERVICE_URL=http://localhost:5002
```

### MongoDB não conecta?
Verifique se o MongoDB está rodando e se a `MONGO_URI` está correta.

### JWT Secret diferente?
Certifique-se de que ambos os serviços usam o mesmo `JWT_SECRET` no arquivo `.env`.

