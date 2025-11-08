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
        url: "http://localhost:5000", 
        description: "Servidor local (desenvolvimento)" 
      },
      {
        url: process.env.API_URL || "https://api.estudemy.com",
        description: "Servidor de produção",
      },
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
            message: {
              type: "string",
              description: "Mensagem de erro",
              example: "Email já cadastrado",
            },
          },
        },
        RegisterAluno: {
          type: "object",
          required: ["nome", "email", "senha", "dataNascimento", "tipoUsuario"],
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
              minLength: 6,
              description: "Senha do aluno (mínimo 6 caracteres)",
              example: "123456",
            },
            dataNascimento: {
              type: "string",
              format: "date",
              description: "Data de nascimento no formato YYYY-MM-DD",
              example: "2000-08-06",
            },
            tipoUsuario: {
              type: "string",
              enum: ["ALUNO"],
              description: "Tipo de usuário",
              example: "ALUNO",
            },
          },
        },
        RegisterProfessor: {
          type: "object",
          required: ["nome", "email", "senha", "dataNascimento", "tipoUsuario", "registro", "titulacao"],
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
              minLength: 6,
              description: "Senha do professor (mínimo 6 caracteres)",
              example: "123456",
            },
            dataNascimento: {
              type: "string",
              format: "date",
              description: "Data de nascimento no formato YYYY-MM-DD",
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
          },
        },
      },
    },
    // Não aplicar segurança globalmente - cada rota define sua própria segurança
  },
  apis: ["./src/routes/*.js"], // caminho para os arquivos com as rotas
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
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
      },
    })
  );
};
