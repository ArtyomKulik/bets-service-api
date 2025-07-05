import Joi from 'joi';

export interface IPlaceBetDto {
  bet: number;
}

export const placeBetSchema = Joi.object({
  bet: Joi.number().integer().min(1).max(5).required(),
});


export interface IBetResultDto {
  bet_id: number;
}

export const betResultSchema = Joi.object({
  bet_id: Joi.number().required(),
});
