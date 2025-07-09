import Fastify, { FastifyRequest } from 'fastify';
import loadEnvConfig from './config/env.config';
import authRouter from './routes/auth.router';
import balanceRouter from './routes/balance.router';
import betRouter from './routes/bet.router';
import healthRouter from './routes/health.router';
import { fastifyPlugins } from './config/fastifyPlugins';
import { checkValidHmacAndUserIdHeader, checkValidUser } from './helpers/headers.validation.helper';
import { AuthHeaders } from './types/headers.types';
// loadEnvConfig();

const buildServer = async () => {
  const fastify = Fastify({
    logger: true,
  });

  await fastifyPlugins(fastify);

  fastify.decorateRequest('authUser', null);

  // Register middlewares
  // server.register(formbody);
  // server.register(cors);
  // server.register(helmet);
  fastify.register(authRouter, { prefix: '/auth' });
  fastify.register(balanceRouter, { prefix: '/balance' });
  fastify.register(betRouter, { prefix: '/bet' });
  fastify.register(healthRouter, { prefix: '/health' });

  // Регистрируем хук для всех запросов
  fastify.addHook(
    'preHandler',
    async (request: FastifyRequest<{ Headers: AuthHeaders }>, reply) => {
      // Пропускаем проверку для /health
      if (request.url === '/health' || request.url.startsWith('/docs')) {
        return;
      }

      if (request.url.includes('/auth')) {
        return await checkValidHmacAndUserIdHeader(request, reply);
      }
      await checkValidHmacAndUserIdHeader(request, reply);
      await checkValidUser(request, reply);
    },
  );

  const startServer = async () => {
    try {
      await fastify.listen({ port: 8080, path: '/' });
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  startServer();
  return fastify;
};

buildServer();

export default buildServer;
