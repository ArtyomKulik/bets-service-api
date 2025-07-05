import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import * as JWT from 'jsonwebtoken';
import { utils } from '../utils';
import { IAuthLoginDto } from '../schemas/Auth';
import { error } from 'console';
import { STANDARD } from '../constants';
import { ERRORS, handleServerError } from '../helpers';

export const login = async (
  request: FastifyRequest<{
    Body: IAuthLoginDto;
  }>,
  reply: FastifyReply,
) => {
  //  проверяем user-id и x-signature из headers и
  const userId = request.headers['user-id'];
  const clientSignature = request.headers['x-signature'];

  //валидировали в schema, но на всякий случай еще проверим
  if (Array.isArray(userId) || Array.isArray(clientSignature) || !userId || !clientSignature) {
    return reply.status(401).send({ error: 'Missing user-id or signature header' });
  }
  if (!utils.verifySignature(clientSignature, request.body, process.env.HMAC_SECRET_KEY)) {
    return reply.status(400).send({ error: 'Incorrect signature' });
  }
  try {
    // получаем userId из body или header
    const { username = userId } = request.body || {};
    if (!username) {
      throw new Error('Missing username in body');
    }
    const user = await prisma.user.findUnique({ where: { username } });
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
