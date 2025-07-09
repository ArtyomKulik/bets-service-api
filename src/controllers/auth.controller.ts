import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import * as JWT from 'jsonwebtoken';
import { utils } from '../utils';
import { IAuthLoginDto } from '../schemas/Auth';
import { STANDARD } from '../constants';
import { ERRORS, handleServerError } from '../helpers/errors.helper';

export const login = async (
  request: FastifyRequest<{
    Body: IAuthLoginDto;
  }>,
  reply: FastifyReply,
) => {
  //  проверяем user-id и x-signature из header
  const userId = Number(request.headers['user-id']);
  const clientSignature = request.headers['x-signature'];

  //валидировали в schema, но на всякий случай еще проверим
  if (
    Array.isArray(userId) ||
    Array.isArray(clientSignature) ||
    !userId ||
    isNaN(userId) ||
    !clientSignature
  ) {
    return reply.status(401).send({ error: 'Missing user-id or signature header' });
  }
  if (!utils.verifySignature(clientSignature, request.body, process.env.HMAC_SECRET_KEY)) {
    return reply.status(400).send({ error: 'Incorrect signature' });
  }
  try {
    const { username } = request.body || {};

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.code(ERRORS.userNotExists.statusCode).send(ERRORS.userNotExists.message);
    }

    const token = JWT.sign(
      {
        username,
        sub: user.id,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.APP_JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
      },
    );

    return reply.code(STANDARD.OK.statusCode).send({
      token,
      expiresIn: process.env.ACCESS_TOKEN_TTL,
    });
  } catch (err) {
    console.log(err);
    return handleServerError(reply, err);
  }
};
