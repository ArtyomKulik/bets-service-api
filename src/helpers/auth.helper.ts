import { utils } from '../utils';
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils';
import { ERRORS } from './errors.helper';

export const checkValidRequest = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void,
) => {
  const token = utils.getBearerTokenFromHeader(request.headers.authorization);
    console.log(token, '<---checkValidRequest token')

  if (!token) {
    reply.code(ERRORS.unauthorizedAccess.statusCode).send(ERRORS.unauthorizedAccess.message);
    return reply;
  }

  const decoded = utils.verifyToken(token);
  console.log(decoded, '<---checkValidRequest decode')
  if (!decoded) {
    reply.code(ERRORS.unauthorizedAccess.statusCode).send(ERRORS.unauthorizedAccess.message);
    return reply;
  }
  done()
};

export const checkValidUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = utils.getBearerTokenFromHeader(request.headers.authorization);
  console.log(token, '<---checkValidUser')
  if (!token) {
    return reply.code(ERRORS.unauthorizedAccess.statusCode).send(ERRORS.unauthorizedAccess.message);
  }

  const decoded = utils.verifyToken(token);
  console.log(decoded, "<---")

  if (!decoded || !decoded.sub) {
    return reply.code(ERRORS.unauthorizedAccess.statusCode).send(ERRORS.unauthorizedAccess.message);
  }
  try {
    const userData = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });
    if (!userData) {
      return reply
        .code(ERRORS.unauthorizedAccess.statusCode)
        .send(ERRORS.unauthorizedAccess.message);
    }

    request['authUser'] = userData;
  } catch (e) {
    return reply.code(ERRORS.unauthorizedAccess.statusCode).send(ERRORS.unauthorizedAccess.message);
  }
};
