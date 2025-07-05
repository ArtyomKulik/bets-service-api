import Joi from 'joi';

export interface IUser {
  id: number;
  username: string;
  created_at: Date;
  updated_at: Date;
  initialBalanceSet: boolean;
}

export interface IAuthLoginDto {
  username: string;
}
export const loginSchema = Joi.object({
  username: Joi.string(),
});
