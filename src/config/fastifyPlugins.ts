import { FastifyInstance } from 'fastify';

export const fastifyPlugins = async (fastify: FastifyInstance) => {
  await fastify.register(require('@fastify/rate-limit'), {
    global: true,
    max: 50,
    timeWindow: '1 minute',
  });

  // Конфигурация Swagger
  await fastify.register(import('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Bets API',
        description: 'API documentation for Bets service',
        version: '1.0.0',
      },
      host: 'localhost:8080',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  // Конфигурация Swagger UI
  await fastify.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
};
