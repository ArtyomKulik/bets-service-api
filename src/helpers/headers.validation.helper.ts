import { FastifyReply, FastifyRequest } from 'fastify';
import { ERRORS } from './errors.helper';
import { AuthHeaders } from '../types/headers.types';
import { authUtils } from '../utils/auth.utils';
import prisma from '../config/prisma.config';
import { hmacUtils } from '../utils/hmac.utils';

export const checkValidUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = authUtils.getBearerTokenFromHeader(request.headers.authorization);
  console.log(token, '<---token checkValidUser');
  if (!token) {
    return reply.code(ERRORS.unauthorizedAccess.statusCode).send(ERRORS.unauthorizedAccess.message);
  }

  const decoded = authUtils.verifyToken(token);
  console.log(decoded, '<--- decoded checkValidUser');

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

export const checkValidHmacAndUserIdHeader = async (
  request: FastifyRequest<{
    Headers: AuthHeaders;
  }>,
  reply: FastifyReply,
) => {
  const { 'user-id': userIdStr, 'x-signature': xSignature } = request.headers || {};

  if (!userIdStr || !xSignature) {
    reply.status(400).send({ error: 'Отсутствуют обязательные заголовки' });
  }
  // Преобразование user-id в число
  const userIdInt = parseInt(userIdStr, 10);
  if (isNaN(userIdInt) || userIdInt <= 0) {
    return reply.status(400).send({ error: 'Некорректный user-id' });
  }
  try {
    // Проверка подписи
    const apiAccount = await prisma.external_Api_Account.findUnique({
      where: { user_id: userIdInt },
    });
    if (!apiAccount) {
      return reply.status(404).send({ error: 'Пользователь не найден' });
    }

    //создание hmac подписи
    const generatedSignature = hmacUtils.createHmacSignature(
      request.body,
      apiAccount.external_secret_key,
    );
    console.log(generatedSignature, '<-----generated x signature ');
    // Безопасное сравнение подписей
    if (!hmacUtils.safeCompare(generatedSignature, xSignature)) {
      return reply.status(403).send({ error: 'Неверная подпись' });
    }
  } catch (error) {
    console.error('HMAC Verification Error:', error);
    return reply.code(400).send(ERRORS.unauthorizedAccess.message);
  }
};
