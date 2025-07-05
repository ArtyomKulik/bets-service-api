import Joi from 'joi';

export interface IBalanceDto {
  balance?: number;
}

export const balanceSchema = Joi.object({
  balance: Joi.number().optional(),
});
