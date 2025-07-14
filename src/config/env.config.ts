import path from 'path';
import Joi from 'joi';
import dotenv from 'dotenv';

export default function loadEnvConfig(): void {
  const envPath = path.join(__dirname, '..', '..', '.env');

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    throw new Error(`Failed to load .env file from path ${envPath}: ${result.error.message}`);
  }

  const schema = Joi.object({
    API_BASE_URL: Joi.string().uri({ scheme: 'https' }).required(),
    APP_JWT_SECRET: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
  }).unknown(true);

  const { error } = schema.validate(process.env, { abortEarly: false });

  if (error) {
    console.error(error);
    throw new Error(`Config validation error: ${error.message}`);
  }
}
