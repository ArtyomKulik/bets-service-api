import Joi from 'joi';

export interface IAuthLoginDto {
  username: string;
}
export const loginSchema = Joi.object({
  username: Joi.string()
});