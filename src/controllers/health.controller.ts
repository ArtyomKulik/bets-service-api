import { FastifyReply, FastifyRequest } from 'fastify';

export const checkHealth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const getExternalApiHealth = await fetch('https://bets.tgapps.cloud/api/health');
    const getExternalApiHealthData = await getExternalApiHealth.json();
    reply.send(getExternalApiHealthData);
  } catch (error) {
    reply.status(400).send({ error: error.message });
  }
};
