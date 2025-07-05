import { User } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    authUser: User | null;
  }
}
