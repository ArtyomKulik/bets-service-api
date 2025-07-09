import crypto from 'crypto';

export const hmacUtils = {
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
    const serverSignature = hmacUtils.createHmacSignature(body, secret);
    console.log(serverSignature, '<----- log server signature');
    return clientSignature === serverSignature;
  },
};
