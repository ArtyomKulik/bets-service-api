import fastify, { FastifyRequest } from 'fastify';
import loadEnvConfig from './config/env.config';
import { checkValidHmacAndUserIdHeader, checkValidUser } from './helpers/headers.validation.helper';
import { AuthHeaders } from './types/headers.types';
import authRouter from './routes/auth.router';
import balanceRouter from './routes/balance.router';
import betRouter from './routes/bet.router';
import healthRouter from './routes/health.router';
import { start } from 'repl';
loadEnvConfig();

const buildServer = async () => {
  const server = fastify();

  // Конфигурация Swagger
  await server.register(import('@fastify/swagger'), {
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
  await server.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  server.decorateRequest('authUser', null);

  // Register middlewares
  // server.register(formbody);
  // server.register(cors);
  // server.register(helmet);
  server.register(authRouter, { prefix: '/auth' });
  server.register(balanceRouter, { prefix: '/balance' });
  server.register(betRouter, { prefix: '/bet' });
  server.register(healthRouter, { prefix: '/health' });

  // Регистрируем хук для всех запросов
  server.addHook('preHandler', async (request: FastifyRequest<{ Headers: AuthHeaders }>, reply) => {
    // Пропускаем проверку для /health
    if (request.url === '/health' || request.url.startsWith('/docs')) {
      return;
    }

    if (request.url.includes('/auth')) {
      return await checkValidHmacAndUserIdHeader(request, reply);
    }
    await checkValidHmacAndUserIdHeader(request, reply);
    await checkValidUser(request, reply);
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        await server.close();
        server.log.error(`Closed application on ${signal}`);
        process.exit(0);
      } catch (err) {
        server.log.error(`Error closing application on ${signal}`, err);
        process.exit(1);
      }
    });
  });

  return server;
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

if (require.main === module) {
  buildServer().then((server) => {
    server.listen({ port: 8080 });
  });
}

export default buildServer;
