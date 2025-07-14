import { FastifyReply, FastifyRequest } from 'fastify';
import { getErrorMessage } from '../helpers/errors.helper';

export const checkHealth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const getExternalApiHealth = await fetch('https://bets.tgapps.cloud/api/health');
    const getExternalApiHealthData = await getExternalApiHealth.json();
    reply.send(getExternalApiHealthData);
  } catch (error) {
    reply.status(400).send({ error: getErrorMessage(error) });
  }
};
