import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import loadEnvConfig from './config/env.config';
import authRouter from './routes/auth.router';
import { utils } from './utils';
import balanceRouter from './routes/balance.router';
import betRouter from './routes/bet.router';
import { IUser } from './schemas/Auth';

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

  // Health check route
  server.get('/health', async (_request, reply) => {
    try {
      await utils.healthCheck();
      reply.status(200).send({
        message: 'Health check endpoint success.',
      });
    } catch (e) {
      reply.status(500).send({
        message: 'Health check endpoint failed.',
      });
    }
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
