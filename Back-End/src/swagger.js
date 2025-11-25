import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Estudemy",
      version: "1.0.0",
      description: "Documentação completa das rotas da API Estudemy - Plataforma de ensino e aprendizado",
      contact: {
        name: "EstudeMy",
        email: "suporte@estudemy.com",
      },
    },
    servers: [
      { 
        url: process.env.API_URL || "https://backendestudemy.onrender.com/",
        description: "Servidor de produção",
      },
      { 
        url: "http://localhost:5000", 
        description: "Servidor local (desenvolvimento)" 
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido no login. Use o formato: Bearer <token>",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indica se a operação foi bem-sucedida (sempre false em erros)",
              example: false,
            },
            message: {
              type: "string",
              description: "Mensagem de erro",
            },
          },
        },
        RegisterAluno: {
          type: "object",
          required: ["nome", "email", "senha", "dataNascimento", "tipoUsuario", "aceiteTermos"],
          properties: {
            nome: {
              type: "string",
              description: "Nome completo do aluno",
              example: "João Victor",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email do aluno",
              example: "joao@email.com",
            },
            senha: {
              type: "string",
              minLength: 8,
              description: "Senha do aluno (mínimo 8 caracteres)",
              example: "senha123",
            },
            dataNascimento: {
              type: "string",
              format: "date",
              description: "Data de nascimento no formato YYYY-MM-DD. O usuário deve ter no mínimo 14 anos de idade.",
              example: "2000-08-06",
            },
            tipoUsuario: {
              type: "string",
              enum: ["ALUNO"],
              description: "Tipo de usuário",
              example: "ALUNO",
            },
            aceiteTermos: {
              type: "boolean",
              description: "Confirmação de aceite dos termos de uso e política de privacidade. Deve ser true.",
              example: true,
            },
          },
        },
        RegisterProfessor: {
          type: "object",
          required: ["nome", "email", "senha", "dataNascimento", "tipoUsuario", "registro", "titulacao", "aceiteTermos"],
          properties: {
            nome: {
              type: "string",
              description: "Nome completo do professor",
              example: "Maria Professora",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email do professor",
              example: "maria@email.com",
            },
            senha: {
              type: "string",
              minLength: 8,
              description: "Senha do professor (mínimo 8 caracteres)",
              example: "senha123",
            },
            dataNascimento: {
              type: "string",
              format: "date",
              description: "Data de nascimento no formato YYYY-MM-DD. O usuário deve ter no mínimo 14 anos de idade.",
              example: "1980-05-10",
            },
            tipoUsuario: {
              type: "string",
              enum: ["PROFESSOR"],
              description: "Tipo de usuário",
              example: "PROFESSOR",
            },
            registro: {
              type: "string",
              description: "Número de registro profissional",
              example: "123456",
            },
            titulacao: {
              type: "string",
              description: "Titulação do professor",
              example: "Doutor",
            },
            aceiteTermos: {
              type: "boolean",
              description: "Confirmação de aceite dos termos de uso e política de privacidade. Deve ser true.",
              example: true,
            },
          },
        },
        Trilha: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671f23a8bc12ab3456f90e12",
            },
            titulo: {
              type: "string",
              example: "Matemática Básica",
            },
            descricao: {
              type: "string",
              example: "Trilha introdutória sobre fundamentos da matemática",
            },
            materia: {
              type: "string",
              example: "Matemática",
            },
            dificuldade: {
              type: "string",
              enum: ["Facil", "Medio", "Dificil"],
              example: "Facil",
            },
            disponibilidade: {
              type: "string",
              enum: ["Aberto", "Privado"],
              example: "Aberto",
            },
            pagamento: {
              type: "string",
              enum: ["Gratuita", "Paga"],
              example: "Gratuita",
            },
            imagem: {
              type: "string",
              example: "/img/fases/vila.jpg",
            },
            dataCriacao: {
              type: "string",
              format: "date",
              example: "2024-01-15",
            },
            visualizacoes: {
              type: "number",
              example: 150,
            },
            usuario: {
              type: "string",
              description: "ID do usuário criador",
            },
          },
        },
        Secao: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671f23a8bc12ab3456f90e12",
            },
            trilhaId: {
              type: "string",
              description: "ID da trilha à qual a seção pertence",
              example: "671f23a8bc12ab3456f90e12",
            },
            titulo: {
              type: "string",
              example: "Seção 1: Introdução",
            },
            descricao: {
              type: "string",
              example: "Conceitos básicos",
            },
            ordem: {
              type: "number",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
          },
        },
        Fase: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671f23a8bc12ab3456f90e12",
            },
            trilhaId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                titulo: { type: "string" },
                descricao: { type: "string" },
                materia: { type: "string" },
              },
            },
            secaoId: {
              type: "string",
              description: "ID da seção à qual a fase pertence (opcional)",
              example: "671f23a8bc12ab3456f90e12",
              nullable: true,
            },
            titulo: {
              type: "string",
              example: "Fase 1: Introdução",
            },
            descricao: {
              type: "string",
              example: "Conceitos básicos",
            },
            conteudo: {
              type: "string",
              example: "Conteúdo da fase",
            },
            ordem: {
              type: "number",
              example: 1,
            },
            perguntas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  enunciado: { type: "string" },
                  alternativas: {
                    type: "array",
                    items: { type: "string" },
                  },
                  respostaCorreta: {
                    type: "number",
                    description: "Índice da alternativa correta",
                  },
                },
              },
            },
          },
        },
        Progresso: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671f23a8bc12ab3456f90e12",
            },
            userId: {
              type: "string",
              description: "ID do usuário",
            },
            faseId: {
              type: "string",
              description: "ID da fase",
            },
            trilhaId: {
              type: "string",
              description: "ID da trilha",
            },
            pontuacao: {
              type: "number",
              description: "Número de acertos",
              example: 8,
            },
            totalPerguntas: {
              type: "number",
              description: "Total de perguntas",
              example: 10,
            },
            porcentagemAcertos: {
              type: "number",
              description: "Porcentagem de acertos",
              example: 80,
            },
            xpGanho: {
              type: "number",
              description: "XP ganho nesta fase",
              example: 400,
            },
            concluido: {
              type: "boolean",
              description: "Se a fase foi completada",
              example: true,
            },
            respostasUsuario: {
              type: "array",
              items: { type: "number" },
              description: "Array com as respostas do usuário",
            },
            perguntasRespondidas: {
              type: "array",
              items: { type: "number" },
              description: "Índices das perguntas já respondidas",
            },
          },
        },
        RankingItem: {
          type: "object",
          properties: {
            position: {
              type: "number",
              example: 1,
            },
            _id: {
              type: "string",
              example: "671f23a8bc12ab3456f90e12",
            },
            name: {
              type: "string",
              example: "joaovictor",
            },
            initial: {
              type: "string",
              example: "J",
            },
            totalFases: {
              type: "number",
              example: 5,
            },
            totalAcertos: {
              type: "number",
              example: 45,
            },
            totalPerguntas: {
              type: "number",
              example: 50,
            },
            mediaAcertos: {
              type: "number",
              example: 90.0,
            },
            personagem: {
              type: "string",
              example: "Mago",
            },
            fotoPerfil: {
              type: "string",
              example: "/img/mago.png",
            },
          },
        },
        RankingNivelItem: {
          type: "object",
          properties: {
            position: {
              type: "number",
              example: 1,
            },
            _id: {
              type: "string",
              example: "671f23a8bc12ab3456f90e12",
            },
            name: {
              type: "string",
              example: "joaovictor",
            },
            initial: {
              type: "string",
              example: "J",
            },
            nivel: {
              type: "number",
              example: 5,
            },
            xpTotal: {
              type: "number",
              example: 2500,
            },
            xpAtual: {
              type: "number",
              example: 200,
            },
            xpNecessario: {
              type: "number",
              example: 500,
            },
            personagem: {
              type: "string",
              example: "Mago",
            },
            fotoPerfil: {
              type: "string",
              example: "/img/mago.png",
            },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "671f23a8bc12ab3456f90e12",
            },
            nome: {
              type: "string",
              example: "João Victor",
            },
            email: {
              type: "string",
              format: "email",
              example: "joao@email.com",
            },
            username: {
              type: "string",
              example: "joaovictor",
            },
            personagem: {
              type: "string",
              enum: ["Guerreiro", "Mago", "Samurai"],
              example: "Mago",
            },
            fotoPerfil: {
              type: "string",
              example: "/img/mago.png",
            },
            materiaFavorita: {
              type: "string",
              example: "Matemática",
            },
            tipoUsuario: {
              type: "string",
              enum: ["ALUNO", "PROFESSOR", "ADMINISTRADOR"],
              description: "Tipo de usuário. ADMINISTRADOR só pode ser definido manualmente no banco de dados.",
              example: "ALUNO",
            },
            telefone: {
              type: "string",
              example: "(11) 99999-9999",
            },
            endereco: {
              type: "string",
              example: "Rua Exemplo, 123",
            },
            dataNascimento: {
              type: "string",
              format: "date",
              example: "2000-08-06",
            },
            xpTotal: {
              type: "number",
              example: 1500,
            },
          },
        },
      },
    },
    // Ordem das tags (aparecerão nesta ordem no Swagger UI, não alfabética)
    tags: [
      {
        name: "Autenticação",
        description: "Rotas de login, registro e criação de perfil"
      },
      {
        name: "Usuários",
        description: "Rotas relacionadas aos usuários e autenticação"
      },
      {
        name: "Home",
        description: "Rotas relacionadas à tela inicial do usuário"
      },
      {
        name: "Trilhas",
        description: "Gerenciamento de trilhas criadas por usuários (CRUD + seções da Home)"
      },
      {
        name: "Fases",
        description: "Rotas relacionadas à criação, listagem e exclusão de fases"
      },
      {
        name: "Seções",
        description: "Rotas relacionadas ao gerenciamento de seções dentro das trilhas"
      },
      {
        name: "Progresso",
        description: "Rotas relacionadas ao progresso do usuário em fases e trilhas"
      },
      {
        name: "Lições Salvas",
        description: "Rotas para salvar e gerenciar trilhas favoritas do usuário"
      },
      {
        name: "Ranking",
        description: "Rotas relacionadas ao ranking de usuários"
      },
      {
        name: "Feedback",
        description: "Rotas relacionadas ao feedback dos usuários"
      },
      {
        name: "Perguntas",
        description: "Rotas relacionadas ao gerenciamento de perguntas das fases"
      },
      {
        name: "Resultados",
        description: "Rotas relacionadas aos resultados do jogo"
      },
      {
        name: "Senha",
        description: "Rotas relacionadas à recuperação de senha (compatibilidade)"
      }
    ]
  },
  apis: ["./src/routes/*.js"], // caminho para os arquivos com as rotas
};

let swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  // Definir ordem customizada das tags (na ordem desejada)
  const tagOrder = [
    "Autenticação",
    "Usuários", 
    "Perfil",
    "Home",
    "Trilhas",
    "Fases",
    "Seções",
    "Perguntas",
    "Progresso",
    "Resultados",
    "Lições Salvas",
    "Ranking",
    "Feedback",
    "Senha"
  ];

  // Modificar o spec para garantir a ordem das tags
  // O swagger-jsdoc pode adicionar tags automaticamente, então vamos reordená-las
  // A propriedade tags no OpenAPI define a ordem de exibição
  if (swaggerSpec.tags && Array.isArray(swaggerSpec.tags)) {
    // Criar mapa das tags existentes
    const existingTagsMap = new Map();
    swaggerSpec.tags.forEach(tag => {
      if (typeof tag === 'string') {
        existingTagsMap.set(tag, { name: tag });
      } else if (tag && tag.name) {
        existingTagsMap.set(tag.name, tag);
      }
    });
    
    // Reordenar tags conforme a ordem desejada
    const orderedTags = [];
    
    // Primeiro, adicionar tags na ordem definida (usando as definições do options.definition.tags)
    tagOrder.forEach(tagName => {
      // Buscar a definição completa da tag do options.definition.tags
      const tagDef = options.definition.tags.find(t => t.name === tagName);
      if (tagDef) {
        orderedTags.push(tagDef);
      } else if (existingTagsMap.has(tagName)) {
        // Se não encontrar na definição, usar a que foi gerada automaticamente
        orderedTags.push(existingTagsMap.get(tagName));
        existingTagsMap.delete(tagName);
      }
    });
    
    // Depois, adicionar tags que não estão na lista de ordem (mantendo ordem alfabética)
    const remainingTags = Array.from(existingTagsMap.values())
      .filter(tag => !tagOrder.includes(tag.name || tag))
      .sort((a, b) => {
        const nameA = a.name || a;
        const nameB = b.name || b;
        return nameA.localeCompare(nameB);
      });
    orderedTags.push(...remainingTags);
    
    // Atualizar o spec com as tags reordenadas
    swaggerSpec.tags = orderedTags;
  }

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Estudemy API Documentation",
      swaggerOptions: {
        persistAuthorization: true, // Mantém o token após recarregar a página
        displayRequestDuration: true, // Mostra tempo de resposta
        filter: true, // Habilita busca de endpoints
        tryItOutEnabled: true, // Habilita botão "Try it out" por padrão
        // Usar a ordem definida nas tags (não alfabética)
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
    })
  );
};
