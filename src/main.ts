import fastify, { FastifyRequest } from 'fastify';
import loadEnvConfig from './config/env.config';
import authRouter from './routes/auth.router';
import { utils } from './utils';
import balanceRouter from './routes/balance.router';
import betRouter from './routes/bet.router';
import { checkValidHmacAndUserIdHeader, checkValidUser } from './helpers/headers.validation.helper';
import { AuthHeaders } from './types/headers.types';
import healthRouter from './routes/health.router';

loadEnvConfig();

const startServer = async () => {
  const server = fastify();

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
    if (request.url === '/health') {
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

  try {
    await server.listen({
      port: 8080,
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();
