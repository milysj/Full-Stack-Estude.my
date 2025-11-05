import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SCORE Microservice API",
      version: "1.0.0",
      description: "Documentação das rotas do microsserviço SCORE - Gerencia pontuação, XP e níveis dos usuários",
      contact: {
        name: "EstudeMy",
        url: "https://github.com/estudemy",
      },
    },
    servers: [
      { 
        url: process.env.SCORE_SERVICE_URL || "http://localhost:5001", 
        description: "Servidor do microserviço SCORE" 
      },
      { 
        url: "http://localhost:5001", 
        description: "Servidor local (desenvolvimento)" 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido no login",
        },
      },
      schemas: {
        Score: {
          type: "object",
          properties: {
            xpTotal: {
              type: "number",
              description: "XP total acumulado pelo usuário",
              example: 1750,
            },
            nivel: {
              type: "number",
              description: "Nível atual do usuário",
              example: 5,
            },
            xpAtual: {
              type: "number",
              description: "XP atual no nível atual",
              example: 150,
            },
            xpNecessario: {
              type: "number",
              description: "XP necessário para o próximo nível",
              example: 200,
            },
            xpAcumulado: {
              type: "number",
              description: "XP acumulado até o nível atual",
              example: 1600,
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Mensagem de erro",
            },
            service: {
              type: "string",
              description: "Nome do serviço",
              example: "SCORE",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Caminho para os arquivos com as rotas
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "SCORE Microservice API Documentation",
  }));
};

