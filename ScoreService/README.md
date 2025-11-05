# Microsserviço SCORE

Microsserviço responsável por gerenciar pontuação, XP e níveis dos usuários.

## Funcionalidades

- Calcular XP baseado em porcentagem de acertos
- Calcular e armazenar níveis dos usuários
- Adicionar XP aos usuários
- Obter dados de score (XP e nível) de usuários
- Suporte para ranking com múltiplos usuários

## Instalação

```bash
cd ScoreService
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
MONGO_URI=mongodb://localhost:27017/estudemy
JWT_SECRET=seu_jwt_secret_aqui
PORT=5001
NODE_ENV=development
```

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Endpoints

### POST /api/score/adicionar-xp
Adiciona XP ao usuário e recalcula nível.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "xpGanho": 250
}
```

### GET /api/score/usuario
Obtém dados de score do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

### POST /api/score/usuarios
Obtém dados de score de múltiplos usuários.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "userIds": ["userId1", "userId2", "userId3"]
}
```

### POST /api/score/calcular-xp
Calcula XP baseado em porcentagem de acertos.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "porcentagemAcertos": 80
}
```

## Porta Padrão

O microsserviço roda na porta **5001** por padrão (backend principal roda na 5000).

## 📚 Documentação Swagger

A documentação interativa da API está disponível através do Swagger UI:

- **Local:** `http://localhost:5001/api-docs`
- **Produção:** `https://sua-url-do-deploy.com/api-docs`

### Funcionalidades do Swagger:

- ✅ Visualizar todos os endpoints disponíveis
- ✅ Ver detalhes de cada endpoint (parâmetros, respostas, etc.)
- ✅ Testar requisições diretamente na interface
- ✅ Ver exemplos de requisições e respostas
- ✅ Entender os schemas de dados (Score, Error, etc.)
- ✅ Autenticação JWT integrada

### Como usar:

1. Acesse `/api-docs` no navegador
2. Clique em "Authorize" no topo da página
3. Cole seu token JWT (sem "Bearer ")
4. Clique em "Authorize" e depois "Close"
5. Agora você pode testar os endpoints diretamente na interface

