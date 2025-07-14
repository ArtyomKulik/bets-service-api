import JWT from 'jsonwebtoken';

export const authUtils = {
  getBearerTokenFromHeader: (authorizationHeader: string | undefined): string | null => {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.replace('Bearer ', '');
    return token || null;
  },
  verifyToken: (token: string): any => {
    try {
      return JWT.verify(token, String(process.env.APP_JWT_SECRET));
    } catch (err) {
      console.error(err, '<-- verify');
      return null;
    }
  },
};
