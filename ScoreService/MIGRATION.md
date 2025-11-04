# Guia de Migração - Microsserviço SCORE

## Pré-requisitos

1. O microsserviço SCORE deve estar rodando
2. O backend principal deve estar configurado para usar o microsserviço
3. Ter acesso ao banco de dados MongoDB

## Migração de Dados Existentes

Se você já tem usuários com XP no modelo `User` do backend principal, você pode migrar esses dados para o microsserviço SCORE usando o script de migração.

### Passo 1: Configurar variáveis de ambiente

Certifique-se de que o arquivo `.env` do microsserviço SCORE está configurado corretamente:

```env
MONGO_URI=mongodb://localhost:27017/estudemy
JWT_SECRET=seu_jwt_secret_aqui
PORT=5001
```

### Passo 2: Executar o script de migração

```bash
cd ScoreService
node src/scripts/migrateXp.js
```

O script irá:
- Buscar todos os usuários com XP > 0
- Criar registros de Score para cada usuário
- Calcular níveis automaticamente
- Pular usuários que já têm Score criado

### Nota Importante

**O script de migração é opcional!** O microsserviço SCORE cria automaticamente um registro de Score quando um usuário ganha XP pela primeira vez. A migração é útil apenas se você quiser preservar dados históricos de XP que já existiam antes da implementação do microsserviço.

## Pós-Migração

Após a migração:
1. Verifique se os dados foram migrados corretamente
2. Teste o sistema para garantir que novos XP estão sendo adicionados corretamente
3. O campo `xpTotal` no modelo `User` pode ser removido (opcional) - ele não será mais usado

## Remover campo xpTotal do modelo User (Opcional)

Se você quiser remover completamente o campo `xpTotal` do modelo `User` após a migração:

1. Faça backup do banco de dados
2. Remova o campo do schema em `EstudeMyBackendNode/src/models/user.js`
3. Execute uma migração no MongoDB para remover o campo dos documentos existentes (opcional)

**Atenção:** Esta etapa é opcional e não é necessária para o funcionamento do sistema. O campo pode permanecer no modelo sem causar problemas.

