import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import * as JWT from 'jsonwebtoken';
import Joi from 'joi';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as crypto from 'crypto';

export const prisma = new PrismaClient();

export const utils = {
  createHmacSignature: (body: Record<string, any> | null, secretKey: string): string => {
    const payload = JSON.stringify(body || {});

    // Создаем HMAC с использованием алгоритма SHA-512 и секретного ключа
    const hmac = crypto.createHmac('sha512', secretKey);

    // Обновляем HMAC с данными тела запроса
    hmac.update(payload);

    // Возвращаем подпись в шестнадцатеричном формате
    return hmac.digest('hex');
  },
  safeCompare(a: string, b: string): boolean {
    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
      return false;
    }
  },

  verifySignature: (
    clientSignature: string,
    body: Record<string, any> | null,
    secret: string,
  ): boolean => {
    if (!clientSignature) {
      throw new Error('Missing user-id or signature header');
    }
    const serverSignature = utils.createHmacSignature(body, secret);
    console.log(
      serverSignature,
      '<----- log server signature',
      clientSignature,
      clientSignature === serverSignature,
    );
    return clientSignature === serverSignature;
  },

  getBearerTokenFromHeader: (authorizationHeader: string | undefined): string | null => {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.replace('Bearer ', '');
    return token || null;
  },
  verifyToken: (token: string): any => {
    try {
      return JWT.verify(token, process.env.APP_JWT_SECRET);
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  isJSON: (data: string) => {
    try {
      JSON.parse(data);
    } catch (e) {
      return false;
    }
    return true;
  },

  getTime: (): number => {
    return new Date().getTime();
  },

  genSalt: (saltRounds: number, value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return reject(err);
        bcrypt.hash(value, salt, (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });
    });
  },

  compareHash: (hash: string, value: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(value, hash, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  healthCheck: async (): Promise<void> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      throw new Error(`Health check failed: ${e.message}`);
    }
  },

  validateSchema: (schema: Joi.ObjectSchema) => {
    return (data: any) => {
      const { error } = schema.validate(data);
      if (error) {
        throw new Error(error.details[0].message);
      }
    };
  },

  preValidation: (schema: Joi.ObjectSchema) => {
    return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
      const { error } = schema.validate(request.body);
      if (error) {
        return done(error);
      }
      done();
    };
  },
};
